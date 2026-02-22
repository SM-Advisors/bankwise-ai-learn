-- Enable the pgvector extension for vector similarity search
CREATE EXTENSION IF NOT EXISTS vector WITH SCHEMA extensions;

-- Add embedding column to lesson_content_chunks (1536 dimensions for OpenAI text-embedding-3-small)
ALTER TABLE public.lesson_content_chunks
ADD COLUMN IF NOT EXISTS embedding vector(1536);

-- Create an HNSW index for fast approximate nearest-neighbor search
-- HNSW is preferred over IVFFlat for our dataset size (hundreds of chunks, not millions)
CREATE INDEX IF NOT EXISTS idx_lesson_chunks_embedding
ON public.lesson_content_chunks
USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);

-- Create a function to match lesson chunks by vector similarity
-- Called via supabase.rpc('match_lesson_chunks', { ... })
CREATE OR REPLACE FUNCTION public.match_lesson_chunks(
  query_embedding vector(1536),
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
