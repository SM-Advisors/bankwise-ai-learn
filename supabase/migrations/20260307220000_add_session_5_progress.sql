-- Add Session 5 (Build Your Frankenstein) progress tracking columns
-- Matches the pattern used for sessions 1-4 in earlier migrations

ALTER TABLE training_progress
  ADD COLUMN IF NOT EXISTS session_5_completed BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS session_5_progress JSONB DEFAULT '{}';
