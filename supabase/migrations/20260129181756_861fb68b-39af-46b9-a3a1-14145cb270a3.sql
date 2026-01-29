-- Create lesson_content_chunks table for RAG retrieval (without vector embeddings for now)
CREATE TABLE public.lesson_content_chunks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lesson_id TEXT NOT NULL,
  module_id TEXT,
  chunk_index INTEGER NOT NULL DEFAULT 0,
  text TEXT NOT NULL,
  source TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for efficient retrieval
CREATE INDEX idx_lesson_content_chunks_lesson_id ON public.lesson_content_chunks(lesson_id);
CREATE INDEX idx_lesson_content_chunks_module_id ON public.lesson_content_chunks(module_id);
CREATE INDEX idx_lesson_content_chunks_lesson_module ON public.lesson_content_chunks(lesson_id, module_id);

-- Enable Row Level Security
ALTER TABLE public.lesson_content_chunks ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to read chunks (lesson content is not user-specific)
CREATE POLICY "Authenticated users can read lesson content chunks" 
ON public.lesson_content_chunks 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- Only admins can manage lesson content
CREATE POLICY "Admins can manage lesson content chunks" 
ON public.lesson_content_chunks 
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_lesson_content_chunks_updated_at
BEFORE UPDATE ON public.lesson_content_chunks
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add comment explaining the table purpose
COMMENT ON TABLE public.lesson_content_chunks IS 'Stores chunked lesson content for RAG retrieval. Each chunk represents a semantic unit of lesson material.';