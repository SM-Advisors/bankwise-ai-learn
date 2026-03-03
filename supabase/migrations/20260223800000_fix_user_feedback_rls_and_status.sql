-- Fix user_feedback RLS policies so super admins can read all feedback
-- and add status column for new/resolved tracking

-- Ensure RLS is enabled
ALTER TABLE user_feedback ENABLE ROW LEVEL SECURITY;

-- Drop any existing policies to start clean
DROP POLICY IF EXISTS "Users can insert own feedback" ON user_feedback;
DROP POLICY IF EXISTS "Super admins can read all feedback" ON user_feedback;
DROP POLICY IF EXISTS "Super admins can update feedback" ON user_feedback;

-- Users can insert their own feedback
CREATE POLICY "Users can insert own feedback"
  ON user_feedback FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Super admins can read ALL feedback
CREATE POLICY "Super admins can read all feedback"
  ON user_feedback FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.user_id = auth.uid()
      AND user_profiles.is_super_admin = true
    )
  );

-- Users can also read their own feedback
CREATE POLICY "Users can read own feedback"
  ON user_feedback FOR SELECT
  USING (auth.uid() = user_id);

-- Super admins can update feedback (for status changes)
CREATE POLICY "Super admins can update feedback"
  ON user_feedback FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.user_id = auth.uid()
      AND user_profiles.is_super_admin = true
    )
  );

-- Add status column (new / resolved)
ALTER TABLE user_feedback
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'new';

-- Add is_read column if not already present
ALTER TABLE user_feedback
  ADD COLUMN IF NOT EXISTS is_read BOOLEAN NOT NULL DEFAULT false;

-- Index for filtering by status
CREATE INDEX IF NOT EXISTS idx_user_feedback_status ON user_feedback(status);
CREATE INDEX IF NOT EXISTS idx_user_feedback_is_read ON user_feedback(is_read);
