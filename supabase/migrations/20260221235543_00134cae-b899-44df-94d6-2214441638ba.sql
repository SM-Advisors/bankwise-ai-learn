
-- Admin policy for prompt_events
CREATE POLICY "Admins can view all prompt events"
  ON prompt_events FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Indexes on prompt_events
CREATE INDEX IF NOT EXISTS idx_prompt_events_created_at ON prompt_events(created_at);
CREATE INDEX IF NOT EXISTS idx_prompt_events_user_created ON prompt_events(user_id, created_at);

-- Enhance user_ideas
ALTER TABLE user_ideas
  ADD COLUMN IF NOT EXISTS votes INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS roi_impact TEXT,
  ADD COLUMN IF NOT EXISTS category TEXT,
  ADD COLUMN IF NOT EXISTS submitter_name TEXT,
  ADD COLUMN IF NOT EXISTS submitter_department TEXT;

-- Constrain roi_impact values (allowing NULL since column is nullable)
ALTER TABLE user_ideas
  ADD CONSTRAINT chk_roi_impact
  CHECK (roi_impact IS NULL OR roi_impact IN ('high', 'medium', 'low'));

-- Indexes for ideas reporting
CREATE INDEX IF NOT EXISTS idx_user_ideas_status ON user_ideas(status);
CREATE INDEX IF NOT EXISTS idx_user_ideas_votes ON user_ideas(votes DESC);
