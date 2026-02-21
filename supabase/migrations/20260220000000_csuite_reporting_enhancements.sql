-- C-Suite Reporting Enhancements
-- 1. Allow admins to read all prompt_events for compliance reporting
-- 2. Enhance user_ideas with votes and ROI tagging for innovation pipeline
-- 3. Add created_at index to prompt_events for time-series queries

-- Admin policy for prompt_events (admins need to see all for compliance reporting)
CREATE POLICY "Admins can view all prompt events"
  ON prompt_events FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.user_id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

-- Add time-series index on prompt_events for trend queries
CREATE INDEX IF NOT EXISTS idx_prompt_events_created_at ON prompt_events(created_at);
CREATE INDEX IF NOT EXISTS idx_prompt_events_user_created ON prompt_events(user_id, created_at);

-- Enhance user_ideas for innovation pipeline
ALTER TABLE user_ideas
  ADD COLUMN IF NOT EXISTS votes INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS roi_impact TEXT CHECK (roi_impact IN ('high', 'medium', 'low', NULL)),
  ADD COLUMN IF NOT EXISTS category TEXT,
  ADD COLUMN IF NOT EXISTS submitter_name TEXT,
  ADD COLUMN IF NOT EXISTS submitter_department TEXT;

-- Update idea status options to include full workflow
-- (existing: not_started, needs_knowledge, future)
-- Adding: under_review, approved, implementing, completed
-- These are just string values so no constraint needed - handled in app

-- Index for ideas reporting
CREATE INDEX IF NOT EXISTS idx_user_ideas_status ON user_ideas(status);
CREATE INDEX IF NOT EXISTS idx_user_ideas_votes ON user_ideas(votes DESC);
