-- ============================================================================
-- Fix RLS policies on ai_user_preferences and ai_memories
-- ============================================================================
-- The original policies were created without TO authenticated, which can cause
-- INSERT/UPDATE failures for logged-in users depending on PostgREST config.
-- Recreate all policies explicitly targeting the authenticated role.
-- ============================================================================

-- ── ai_user_preferences ─────────────────────────────────────────────────────

DROP POLICY IF EXISTS "Users can view own preferences" ON public.ai_user_preferences;
DROP POLICY IF EXISTS "Users can insert own preferences" ON public.ai_user_preferences;
DROP POLICY IF EXISTS "Users can update own preferences" ON public.ai_user_preferences;

CREATE POLICY "Users can view own preferences"
  ON public.ai_user_preferences
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences"
  ON public.ai_user_preferences
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences"
  ON public.ai_user_preferences
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ── ai_memories ─────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "Users can view own memories" ON public.ai_memories;
DROP POLICY IF EXISTS "Users can insert own memories" ON public.ai_memories;
DROP POLICY IF EXISTS "Users can update own memories" ON public.ai_memories;
DROP POLICY IF EXISTS "Users can delete own memories" ON public.ai_memories;

CREATE POLICY "Users can view own memories"
  ON public.ai_memories
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own memories"
  ON public.ai_memories
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own memories"
  ON public.ai_memories
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own memories"
  ON public.ai_memories
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
