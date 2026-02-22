-- Phase 2: Sharing Infrastructure
-- Adds category/source tracking to community_topics, source tracking to user_ideas,
-- and creates executive_submissions table for escalating ideas to leadership.

-- ─── 1. EXTEND community_topics ───────────────────────────────────────────────
ALTER TABLE community_topics
  ADD COLUMN IF NOT EXISTS category TEXT NOT NULL DEFAULT 'discussion'
    CHECK (category IN ('discussion', 'idea', 'friction_point', 'shared_agent', 'shared_workflow')),
  ADD COLUMN IF NOT EXISTS source_type TEXT NOT NULL DEFAULT 'manual'
    CHECK (source_type IN ('manual', 'andrea_suggested', 'andrea_user_requested')),
  ADD COLUMN IF NOT EXISTS linked_content_id UUID,
  ADD COLUMN IF NOT EXISTS linked_content_type TEXT
    CHECK (linked_content_type IN ('agent', 'workflow', NULL));

-- Index for category filtering
CREATE INDEX IF NOT EXISTS idx_community_topics_category ON community_topics (category);

-- ─── 2. EXTEND user_ideas ─────────────────────────────────────────────────────
ALTER TABLE user_ideas
  ADD COLUMN IF NOT EXISTS source TEXT NOT NULL DEFAULT 'manual'
    CHECK (source IN ('manual', 'andrea_suggested', 'andrea_user_requested')),
  ADD COLUMN IF NOT EXISTS source_context TEXT,
  ADD COLUMN IF NOT EXISTS linked_agent_id UUID REFERENCES user_agents(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS submitted_to_exec BOOLEAN NOT NULL DEFAULT false;

-- ─── 3. CREATE executive_submissions ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS executive_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  idea_id UUID REFERENCES user_ideas(id) ON DELETE SET NULL,
  community_topic_id UUID REFERENCES community_topics(id) ON DELETE SET NULL,
  submission_type TEXT NOT NULL DEFAULT 'idea'
    CHECK (submission_type IN ('idea', 'friction_point', 'shared_agent', 'shared_workflow')),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'submitted'
    CHECK (status IN ('submitted', 'reviewed', 'acknowledged', 'in_progress', 'archived')),
  reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  reviewer_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_exec_submissions_user ON executive_submissions (user_id);
CREATE INDEX IF NOT EXISTS idx_exec_submissions_status ON executive_submissions (status);
CREATE INDEX IF NOT EXISTS idx_exec_submissions_created ON executive_submissions (created_at DESC);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_exec_submission_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_exec_submissions_updated_at ON executive_submissions;
CREATE TRIGGER trg_exec_submissions_updated_at
  BEFORE UPDATE ON executive_submissions
  FOR EACH ROW EXECUTE FUNCTION update_exec_submission_updated_at();

-- ─── 4. ROW LEVEL SECURITY ────────────────────────────────────────────────────
ALTER TABLE executive_submissions ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  -- Users can view their own submissions
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'executive_submissions' AND policyname = 'Users view own submissions'
  ) THEN
    CREATE POLICY "Users view own submissions"
      ON executive_submissions FOR SELECT
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;

  -- Admins can view all submissions
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'executive_submissions' AND policyname = 'Admins view all submissions'
  ) THEN
    CREATE POLICY "Admins view all submissions"
      ON executive_submissions FOR SELECT
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM user_roles
          WHERE user_roles.user_id = auth.uid()
          AND user_roles.role = 'admin'
        )
      );
  END IF;

  -- Users can insert their own submissions
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'executive_submissions' AND policyname = 'Users insert own submissions'
  ) THEN
    CREATE POLICY "Users insert own submissions"
      ON executive_submissions FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = user_id);
  END IF;

  -- Admins can update submissions (for status changes and reviewer notes)
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'executive_submissions' AND policyname = 'Admins update submissions'
  ) THEN
    CREATE POLICY "Admins update submissions"
      ON executive_submissions FOR UPDATE
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM user_roles
          WHERE user_roles.user_id = auth.uid()
          AND user_roles.role = 'admin'
        )
      );
  END IF;
END $$;
