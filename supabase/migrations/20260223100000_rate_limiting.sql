-- ============================================================
-- Rate Limiting Events Table
-- Used by all edge functions to enforce per-user rate limits.
-- ============================================================

CREATE TABLE IF NOT EXISTS rate_limit_events (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL,
  function_name TEXT NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_rate_limit_events_lookup
  ON rate_limit_events (user_id, function_name, created_at DESC);

-- Only the service role can insert/read (edge functions use service role)
ALTER TABLE rate_limit_events ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE policyname = 'Service role manages rate limit events'
    AND tablename = 'rate_limit_events'
  ) THEN
    EXECUTE 'CREATE POLICY "Service role manages rate limit events"
      ON rate_limit_events FOR ALL TO service_role USING (true)';
  END IF;
END $$;
