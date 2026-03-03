-- Migration: retrieval_responses table for spaced repetition engine
-- Stores per-user answers to retrieval questions with quality scores

CREATE TABLE IF NOT EXISTS retrieval_responses (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question_id TEXT NOT NULL,     -- e.g. "1-1-q1"
  module_id   TEXT NOT NULL,     -- source module e.g. "1-1"
  quality     SMALLINT NOT NULL CHECK (quality BETWEEN 0 AND 5),
              -- 0-2 = weak (reschedule soon), 3-4 = ok, 5 = strong
  response    TEXT,              -- optional: learner's actual answer text
  seen_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  session_id  TEXT              -- lesson/session context when seen
);

-- Index for fast per-user query
CREATE INDEX IF NOT EXISTS idx_retrieval_responses_user_id
  ON retrieval_responses (user_id, seen_at DESC);

-- RLS: users can only read/insert their own rows
ALTER TABLE retrieval_responses ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE policyname = 'Users can read own retrieval responses'
    AND tablename = 'retrieval_responses'
  ) THEN
    EXECUTE 'CREATE POLICY "Users can read own retrieval responses"
      ON retrieval_responses FOR SELECT
      USING (auth.uid() = user_id)';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE policyname = 'Users can insert own retrieval responses'
    AND tablename = 'retrieval_responses'
  ) THEN
    EXECUTE 'CREATE POLICY "Users can insert own retrieval responses"
      ON retrieval_responses FOR INSERT
      WITH CHECK (auth.uid() = user_id)';
  END IF;

  -- Allow service role (edge functions) to insert on behalf of users
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE policyname = 'Service role can manage retrieval responses'
    AND tablename = 'retrieval_responses'
  ) THEN
    EXECUTE 'CREATE POLICY "Service role can manage retrieval responses"
      ON retrieval_responses FOR ALL
      USING (true)
      WITH CHECK (true)';
  END IF;
END $$;
