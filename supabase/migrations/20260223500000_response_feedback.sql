-- ============================================================
-- Response Feedback: thumbs up/down on Andrea messages
-- ============================================================

CREATE TABLE IF NOT EXISTS response_feedback (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id    TEXT,
  module_id     TEXT,
  message_index INTEGER,
  message_preview TEXT,
  rating        SMALLINT NOT NULL CHECK (rating IN (-1, 1)),
  comment       TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_response_feedback_user ON response_feedback(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_response_feedback_session ON response_feedback(session_id, module_id);

ALTER TABLE response_feedback ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE policyname = 'Users can insert their own feedback'
    AND tablename = 'response_feedback'
  ) THEN
    EXECUTE 'CREATE POLICY "Users can insert their own feedback"
      ON response_feedback FOR INSERT TO authenticated
      WITH CHECK (user_id = auth.uid())';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE policyname = 'Users can view their own feedback'
    AND tablename = 'response_feedback'
  ) THEN
    EXECUTE 'CREATE POLICY "Users can view their own feedback"
      ON response_feedback FOR SELECT TO authenticated
      USING (user_id = auth.uid())';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE policyname = 'Admins can view all feedback'
    AND tablename = 'response_feedback'
  ) THEN
    EXECUTE 'CREATE POLICY "Admins can view all feedback"
      ON response_feedback FOR SELECT TO authenticated
      USING (EXISTS (SELECT 1 FROM user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role = ''admin''))';
  END IF;
END $$;
