ALTER TABLE public.training_progress 
  ADD COLUMN IF NOT EXISTS session_5_completed boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS session_5_progress jsonb DEFAULT '{}'::jsonb;