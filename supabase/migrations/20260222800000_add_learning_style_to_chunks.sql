-- =============================================================================
-- Add learning_style column to lesson_content_chunks for style-specific RAG
-- Also updates match_lesson_chunks() to accept and boost by learning style
-- =============================================================================

-- 1. Add learning_style column
ALTER TABLE public.lesson_content_chunks
  ADD COLUMN IF NOT EXISTS learning_style TEXT DEFAULT 'universal';

-- 2. Index for style-filtered queries
CREATE INDEX IF NOT EXISTS idx_chunks_learning_style
  ON public.lesson_content_chunks(learning_style);

-- 3. Update match_lesson_chunks to accept and boost by learning_style
CREATE OR REPLACE FUNCTION public.match_lesson_chunks(
  query_embedding extensions.vector(1536),
  match_count int DEFAULT 6,
  filter_lesson_id text DEFAULT NULL,
  filter_module_id text DEFAULT NULL,
  similarity_threshold float DEFAULT 0.3,
  filter_learning_style text DEFAULT 'universal'
)
RETURNS TABLE (
  id uuid,
  text text,
  source text,
  metadata jsonb,
  similarity float
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    lcc.id,
    lcc.text,
    lcc.source,
    lcc.metadata,
    -- 15% similarity boost for style-matched chunks (or universal chunks)
    CASE
      WHEN lcc.learning_style = filter_learning_style
           OR lcc.learning_style = 'universal'
      THEN (1 - (lcc.embedding <=> query_embedding)) * 1.15
      ELSE 1 - (lcc.embedding <=> query_embedding)
    END AS similarity
  FROM public.lesson_content_chunks lcc
  WHERE
    lcc.embedding IS NOT NULL
    AND (filter_lesson_id IS NULL OR lcc.lesson_id = filter_lesson_id)
    AND (filter_module_id IS NULL OR lcc.module_id = filter_module_id)
    AND 1 - (lcc.embedding <=> query_embedding) > similarity_threshold
  ORDER BY
    CASE
      WHEN lcc.learning_style = filter_learning_style
           OR lcc.learning_style = 'universal'
      THEN (1 - (lcc.embedding <=> query_embedding)) * 1.15
      ELSE 1 - (lcc.embedding <=> query_embedding)
    END DESC
  LIMIT match_count;
END;
$$;

-- Re-grant execute permission
GRANT EXECUTE ON FUNCTION public.match_lesson_chunks TO authenticated;

COMMENT ON FUNCTION public.match_lesson_chunks IS 'Vector similarity search on lesson chunks with optional learning_style boost. Style-matched and universal chunks get a 15% similarity boost.';
