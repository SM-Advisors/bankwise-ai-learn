-- Add is_read column to user_feedback for super admin read/unread tracking
ALTER TABLE user_feedback
  ADD COLUMN IF NOT EXISTS is_read BOOLEAN NOT NULL DEFAULT false;

-- Index for fast unread count queries
CREATE INDEX IF NOT EXISTS idx_user_feedback_is_read ON user_feedback(is_read);
