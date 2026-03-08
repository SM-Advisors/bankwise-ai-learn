-- Add Session 5 (Build Your Frankenstein) progress tracking columns
-- Matches the pattern used for sessions 1-4 in earlier migrations

ALTER TABLE training_progress
  ADD COLUMN IF NOT EXISTS session_5_completed BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS session_5_progress JSONB DEFAULT '{}';

-- Relax the current_session constraint from max 3 to max 5
-- Original constraint: CHECK (current_session >= 1 AND current_session <= 3)
ALTER TABLE user_profiles
  DROP CONSTRAINT IF EXISTS user_profiles_current_session_check;

ALTER TABLE user_profiles
  ADD CONSTRAINT user_profiles_current_session_check
  CHECK (current_session >= 1 AND current_session <= 5);
