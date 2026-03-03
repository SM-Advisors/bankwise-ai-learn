-- =============================================================================
-- SMILE Curriculum v2.0 — New Tables + Session 4 Columns
-- Tables: user_prompts, elective_progress, certificates, proficiency_responses
-- Also adds session_4_completed/session_4_progress to training_progress
-- =============================================================================

-- ─── 1. ADD SESSION 4 COLUMNS TO TRAINING_PROGRESS ───────────────────────────

ALTER TABLE public.training_progress
  ADD COLUMN IF NOT EXISTS session_4_completed BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS session_4_progress JSONB DEFAULT '{}';

-- ─── 2. USER_PROMPTS (Prompt Library) ────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.user_prompts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'General',
  tags TEXT[] DEFAULT '{}',
  is_favorite BOOLEAN DEFAULT false,
  source TEXT,             -- module where it was created (e.g., "2-3")
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_prompts_user ON public.user_prompts(user_id);
CREATE INDEX IF NOT EXISTS idx_user_prompts_category ON public.user_prompts(user_id, category);
CREATE INDEX IF NOT EXISTS idx_user_prompts_favorite ON public.user_prompts(user_id, is_favorite) WHERE is_favorite = true;

ALTER TABLE public.user_prompts ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_prompts' AND policyname = 'Users view own prompts') THEN
    CREATE POLICY "Users view own prompts" ON public.user_prompts FOR SELECT TO authenticated
    USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_prompts' AND policyname = 'Users insert own prompts') THEN
    CREATE POLICY "Users insert own prompts" ON public.user_prompts FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_prompts' AND policyname = 'Users update own prompts') THEN
    CREATE POLICY "Users update own prompts" ON public.user_prompts FOR UPDATE TO authenticated
    USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_prompts' AND policyname = 'Users delete own prompts') THEN
    CREATE POLICY "Users delete own prompts" ON public.user_prompts FOR DELETE TO authenticated
    USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_prompts' AND policyname = 'Admins view all prompts') THEN
    CREATE POLICY "Admins view all prompts" ON public.user_prompts FOR SELECT TO authenticated
    USING (EXISTS (SELECT 1 FROM user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'));
  END IF;
END $$;

CREATE TRIGGER update_user_prompts_updated_at BEFORE UPDATE ON public.user_prompts
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ─── 3. ELECTIVE_PROGRESS ───────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.elective_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  path_id TEXT NOT NULL,       -- e.g., 'advanced_prompting', 'agent_patterns'
  module_id TEXT NOT NULL,     -- e.g., 'E1-1', 'E2-3'
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  progress_data JSONB DEFAULT '{}',   -- moduleEngagement, chat messages, etc.
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, path_id, module_id)
);

CREATE INDEX IF NOT EXISTS idx_elective_progress_user ON public.elective_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_elective_progress_path ON public.elective_progress(user_id, path_id);

ALTER TABLE public.elective_progress ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'elective_progress' AND policyname = 'Users view own elective progress') THEN
    CREATE POLICY "Users view own elective progress" ON public.elective_progress FOR SELECT TO authenticated
    USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'elective_progress' AND policyname = 'Users insert own elective progress') THEN
    CREATE POLICY "Users insert own elective progress" ON public.elective_progress FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'elective_progress' AND policyname = 'Users update own elective progress') THEN
    CREATE POLICY "Users update own elective progress" ON public.elective_progress FOR UPDATE TO authenticated
    USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'elective_progress' AND policyname = 'Admins view all elective progress') THEN
    CREATE POLICY "Admins view all elective progress" ON public.elective_progress FOR SELECT TO authenticated
    USING (EXISTS (SELECT 1 FROM user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'));
  END IF;
END $$;

CREATE TRIGGER update_elective_progress_updated_at BEFORE UPDATE ON public.elective_progress
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ─── 4. CERTIFICATES ────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id INTEGER NOT NULL,
  certificate_type TEXT NOT NULL DEFAULT 'session_completion',   -- session_completion, elective_path, full_program
  earned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  metadata JSONB DEFAULT '{}',   -- skill signals, capstone option, etc.
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, session_id, certificate_type)
);

CREATE INDEX IF NOT EXISTS idx_certificates_user ON public.certificates(user_id);

ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'certificates' AND policyname = 'Users view own certificates') THEN
    CREATE POLICY "Users view own certificates" ON public.certificates FOR SELECT TO authenticated
    USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'certificates' AND policyname = 'Users insert own certificates') THEN
    CREATE POLICY "Users insert own certificates" ON public.certificates FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'certificates' AND policyname = 'Service role insert certificates') THEN
    CREATE POLICY "Service role insert certificates" ON public.certificates FOR INSERT TO service_role
    WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'certificates' AND policyname = 'Admins view all certificates') THEN
    CREATE POLICY "Admins view all certificates" ON public.certificates FOR SELECT TO authenticated
    USING (EXISTS (SELECT 1 FROM user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'));
  END IF;
END $$;

-- ─── 5. PROFICIENCY_RESPONSES (assessment audit trail) ───────────────────────

CREATE TABLE IF NOT EXISTS public.proficiency_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  self_report_answers JSONB NOT NULL DEFAULT '{}',   -- { basic_usage: 5, prompt_specificity: 2, ... }
  performance_scores JSONB NOT NULL DEFAULT '{}',    -- { prompt_evaluation: 6, prompt_ranking: 8 }
  confidence_level INTEGER NOT NULL DEFAULT 3,
  computed_score INTEGER NOT NULL DEFAULT 0,          -- final 0-8 proficiency
  assessment_version TEXT DEFAULT '2.0',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_proficiency_responses_user ON public.proficiency_responses(user_id);
CREATE INDEX IF NOT EXISTS idx_proficiency_responses_latest ON public.proficiency_responses(user_id, created_at DESC);

ALTER TABLE public.proficiency_responses ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'proficiency_responses' AND policyname = 'Users view own proficiency responses') THEN
    CREATE POLICY "Users view own proficiency responses" ON public.proficiency_responses FOR SELECT TO authenticated
    USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'proficiency_responses' AND policyname = 'Users insert own proficiency responses') THEN
    CREATE POLICY "Users insert own proficiency responses" ON public.proficiency_responses FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'proficiency_responses' AND policyname = 'Admins view all proficiency responses') THEN
    CREATE POLICY "Admins view all proficiency responses" ON public.proficiency_responses FOR SELECT TO authenticated
    USING (EXISTS (SELECT 1 FROM user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'));
  END IF;
END $$;
