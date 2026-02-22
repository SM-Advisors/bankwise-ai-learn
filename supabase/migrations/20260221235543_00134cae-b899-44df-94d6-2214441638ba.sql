
-- Admin policy for prompt_events (only if table exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'prompt_events') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can view all prompt events' AND tablename = 'prompt_events') THEN
      EXECUTE 'CREATE POLICY "Admins can view all prompt events" ON prompt_events FOR SELECT USING (has_role(auth.uid(), ''admin''::app_role))';
    END IF;
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_prompt_events_created_at ON prompt_events(created_at)';
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_prompt_events_user_created ON prompt_events(user_id, created_at)';
  END IF;
END $$;

-- Enhance user_ideas (only if table exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'user_ideas') THEN
    EXECUTE 'ALTER TABLE user_ideas ADD COLUMN IF NOT EXISTS votes INTEGER DEFAULT 0';
    EXECUTE 'ALTER TABLE user_ideas ADD COLUMN IF NOT EXISTS roi_impact TEXT';
    EXECUTE 'ALTER TABLE user_ideas ADD COLUMN IF NOT EXISTS category TEXT';
    EXECUTE 'ALTER TABLE user_ideas ADD COLUMN IF NOT EXISTS submitter_name TEXT';
    EXECUTE 'ALTER TABLE user_ideas ADD COLUMN IF NOT EXISTS submitter_department TEXT';

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_roi_impact') THEN
      EXECUTE 'ALTER TABLE user_ideas ADD CONSTRAINT chk_roi_impact CHECK (roi_impact IS NULL OR roi_impact IN (''high'', ''medium'', ''low''))';
    END IF;

    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_user_ideas_status ON user_ideas(status)';
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_user_ideas_votes ON user_ideas(votes DESC)';
  END IF;
END $$;
