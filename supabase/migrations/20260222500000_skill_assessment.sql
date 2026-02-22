-- Phase 3: Skill Assessment & Level Management
-- Adds skill_observations for Andrea's silent tracking and
-- level_change_requests for surfacing suggested proficiency changes to users.

-- ─── 1. SKILL OBSERVATIONS ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS skill_observations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  observed_skill TEXT NOT NULL,
  observed_level TEXT NOT NULL
    CHECK (observed_level IN ('emerging', 'developing', 'proficient', 'advanced')),
  evidence TEXT NOT NULL,
  module_id TEXT,
  session_number INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_skill_obs_user ON skill_observations (user_id);
CREATE INDEX IF NOT EXISTS idx_skill_obs_skill ON skill_observations (user_id, observed_skill);
CREATE INDEX IF NOT EXISTS idx_skill_obs_created ON skill_observations (created_at DESC);

-- ─── 2. LEVEL CHANGE REQUESTS ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS level_change_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  current_level TEXT NOT NULL
    CHECK (current_level IN ('beginner', 'intermediate', 'advanced', 'expert')),
  proposed_level TEXT NOT NULL
    CHECK (proposed_level IN ('beginner', 'intermediate', 'advanced', 'expert')),
  rationale TEXT NOT NULL,
  evidence_summary TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'accepted', 'declined', 'expired')),
  responded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '7 days')
);

CREATE INDEX IF NOT EXISTS idx_level_req_user ON level_change_requests (user_id);
CREATE INDEX IF NOT EXISTS idx_level_req_status ON level_change_requests (user_id, status);

-- ─── 3. ROW LEVEL SECURITY ────────────────────────────────────────────────────
ALTER TABLE skill_observations ENABLE ROW LEVEL SECURITY;
ALTER TABLE level_change_requests ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  -- skill_observations: users see own, admins see all
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'skill_observations' AND policyname = 'Users view own observations'
  ) THEN
    CREATE POLICY "Users view own observations"
      ON skill_observations FOR SELECT
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'skill_observations' AND policyname = 'Admins view all observations'
  ) THEN
    CREATE POLICY "Admins view all observations"
      ON skill_observations FOR SELECT
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM user_roles
          WHERE user_roles.user_id = auth.uid()
          AND user_roles.role = 'admin'
        )
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'skill_observations' AND policyname = 'Users insert own observations'
  ) THEN
    CREATE POLICY "Users insert own observations"
      ON skill_observations FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = user_id);
  END IF;

  -- level_change_requests: users see and respond to own requests
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'level_change_requests' AND policyname = 'Users view own level requests'
  ) THEN
    CREATE POLICY "Users view own level requests"
      ON level_change_requests FOR SELECT
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'level_change_requests' AND policyname = 'Users insert own level requests'
  ) THEN
    CREATE POLICY "Users insert own level requests"
      ON level_change_requests FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'level_change_requests' AND policyname = 'Users update own level requests'
  ) THEN
    CREATE POLICY "Users update own level requests"
      ON level_change_requests FOR UPDATE
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;
END $$;
