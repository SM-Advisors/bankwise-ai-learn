-- Enable the pgvector extension for vector similarity search
CREATE EXTENSION IF NOT EXISTS vector WITH SCHEMA extensions;

-- Only add embedding column and index if lesson_content_chunks exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'lesson_content_chunks') THEN
    -- Add embedding column
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'lesson_content_chunks' AND column_name = 'embedding'
    ) THEN
      EXECUTE 'ALTER TABLE public.lesson_content_chunks ADD COLUMN embedding extensions.vector(1536)';
    END IF;

    -- Create HNSW index
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_lesson_chunks_embedding ON public.lesson_content_chunks USING hnsw (embedding extensions.vector_cosine_ops) WITH (m = 16, ef_construction = 64)';
  END IF;
END $$;

-- Create a function to match lesson chunks by vector similarity
-- Called via supabase.rpc('match_lesson_chunks', { ... })
CREATE OR REPLACE FUNCTION public.match_lesson_chunks(
  query_embedding extensions.vector(1536),
  match_count int DEFAULT 6,
  filter_lesson_id text DEFAULT NULL,
  filter_module_id text DEFAULT NULL,
  similarity_threshold float DEFAULT 0.3
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
    1 - (lcc.embedding <=> query_embedding) AS similarity
  FROM public.lesson_content_chunks lcc
  WHERE
    lcc.embedding IS NOT NULL
    AND (filter_lesson_id IS NULL OR lcc.lesson_id = filter_lesson_id)
    AND (filter_module_id IS NULL OR lcc.module_id = filter_module_id)
    AND 1 - (lcc.embedding <=> query_embedding) > similarity_threshold
  ORDER BY lcc.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.match_lesson_chunks TO authenticated;

-- Add comment
COMMENT ON FUNCTION public.match_lesson_chunks IS 'Performs vector similarity search on lesson content chunks using cosine similarity. Returns the most relevant chunks for a given query embedding.';
