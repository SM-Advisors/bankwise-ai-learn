-- ============================================================
-- Submission Scores: persist rubric scores from submission_review
-- ============================================================

CREATE TABLE IF NOT EXISTS submission_scores (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id     TEXT NOT NULL,
  module_id      TEXT,
  attempt_number INTEGER DEFAULT 1,
  scores         JSONB NOT NULL,
  summary        TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_submission_scores_user ON submission_scores(user_id, session_id, module_id);
CREATE INDEX IF NOT EXISTS idx_submission_scores_session ON submission_scores(session_id, created_at DESC);

ALTER TABLE submission_scores ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE policyname = 'Users can view their own scores'
    AND tablename = 'submission_scores'
  ) THEN
    EXECUTE 'CREATE POLICY "Users can view their own scores"
      ON submission_scores FOR SELECT TO authenticated
      USING (user_id = auth.uid())';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE policyname = 'Admins can view all scores'
    AND tablename = 'submission_scores'
  ) THEN
    EXECUTE 'CREATE POLICY "Admins can view all scores"
      ON submission_scores FOR SELECT TO authenticated
      USING (EXISTS (SELECT 1 FROM user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role = ''admin''))';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE policyname = 'Service role can insert scores'
    AND tablename = 'submission_scores'
  ) THEN
    EXECUTE 'CREATE POLICY "Service role can insert scores"
      ON submission_scores FOR INSERT TO service_role WITH CHECK (true)';
  END IF;
END $$;
