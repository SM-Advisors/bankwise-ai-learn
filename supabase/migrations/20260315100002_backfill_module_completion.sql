-- ============================================================================
-- Backfill Module Completion for Sequential Gating
-- ============================================================================
-- The platform is moving to strict sequential module gating where module N
-- must be completed before module N+1 unlocks. Existing users may have
-- engaged with later modules without earlier ones being marked "completed"
-- (because previously only gate modules blocked progression).
--
-- This migration backfills completed=true for modules that precede any
-- module the user has already engaged with. It also adds those modules
-- to the completedModules array.
--
-- Module order per session (from trainingContent.ts):
--   Session 1: 1-1, 1-2, 1-3, 1-4, 1-5, 1-6, 1-7
--   Session 2: 2-1, 2-2, 2-3, 2-4, 2-5, 2-6, 2-7
--   Session 3: 3-1, 3-2, 3-3, 3-4, 3-5, 3-6, 3-7
--   Session 4: 4-1, 4-2, 4-3, 4-4, 4-5
--   Session 5: 5-1, 5-2, 5-3, 5-4, 5-5
-- ============================================================================

-- Helper function to backfill a single session's progress for a user
CREATE OR REPLACE FUNCTION backfill_session_completion(
  p_progress JSONB,
  p_module_ids TEXT[]
) RETURNS JSONB
LANGUAGE plpgsql AS $$
DECLARE
  engagement JSONB;
  completed_modules JSONB;
  highest_engaged_idx INT := -1;
  i INT;
  mod_id TEXT;
  mod_eng JSONB;
BEGIN
  -- Extract current data
  engagement := COALESCE(p_progress->'moduleEngagement', '{}'::jsonb);
  completed_modules := COALESCE(p_progress->'completedModules', '[]'::jsonb);

  -- Find the highest index where the user has any engagement or completion
  FOR i IN 1..array_length(p_module_ids, 1) LOOP
    mod_id := p_module_ids[i];
    mod_eng := engagement->mod_id;

    -- Check if this module has any engagement
    IF mod_eng IS NOT NULL AND mod_eng != 'null'::jsonb THEN
      highest_engaged_idx := i;
    END IF;

    -- Also check completedModules array
    IF completed_modules ? mod_id THEN
      IF i > highest_engaged_idx THEN
        highest_engaged_idx := i;
      END IF;
    END IF;
  END LOOP;

  -- If user has engaged with module at index N, mark all modules 1..N-1 as completed
  IF highest_engaged_idx > 1 THEN
    FOR i IN 1..(highest_engaged_idx - 1) LOOP
      mod_id := p_module_ids[i];
      mod_eng := engagement->mod_id;

      -- Only backfill if not already completed
      IF mod_eng IS NULL OR mod_eng = 'null'::jsonb OR (mod_eng->>'completed')::boolean IS NOT TRUE THEN
        -- Create or update engagement entry with completed=true
        IF mod_eng IS NULL OR mod_eng = 'null'::jsonb THEN
          mod_eng := jsonb_build_object(
            'contentViewed', true,
            'chatStarted', false,
            'practiceMessageCount', 0,
            'submitted', false,
            'completed', true,
            'completedAt', to_char(now(), 'YYYY-MM-DD"T"HH24:MI:SS"Z"'),
            'gatePassed', true
          );
        ELSE
          mod_eng := mod_eng || jsonb_build_object(
            'completed', true,
            'completedAt', COALESCE(mod_eng->>'completedAt', to_char(now(), 'YYYY-MM-DD"T"HH24:MI:SS"Z"')),
            'gatePassed', true
          );
        END IF;

        engagement := jsonb_set(engagement, ARRAY[mod_id], mod_eng);

        -- Add to completedModules if not already present
        IF NOT completed_modules ? mod_id THEN
          completed_modules := completed_modules || to_jsonb(mod_id);
        END IF;
      END IF;
    END LOOP;
  END IF;

  -- Rebuild progress with updated data
  RETURN jsonb_set(
    jsonb_set(p_progress, '{moduleEngagement}', engagement),
    '{completedModules}',
    completed_modules
  );
END;
$$;

-- Run the backfill for all users across all sessions
DO $$
DECLARE
  rec RECORD;
  s1_modules TEXT[] := ARRAY['1-1','1-2','1-3','1-4','1-5','1-6','1-7'];
  s2_modules TEXT[] := ARRAY['2-1','2-2','2-3','2-4','2-5','2-6','2-7'];
  s3_modules TEXT[] := ARRAY['3-1','3-2','3-3','3-4','3-5','3-6','3-7'];
  s4_modules TEXT[] := ARRAY['4-1','4-2','4-3','4-4','4-5'];
  s5_modules TEXT[] := ARRAY['5-1','5-2','5-3','5-4','5-5'];
  new_s1 JSONB;
  new_s2 JSONB;
  new_s3 JSONB;
  new_s4 JSONB;
  new_s5 JSONB;
BEGIN
  FOR rec IN SELECT * FROM public.training_progress LOOP
    new_s1 := backfill_session_completion(COALESCE(rec.session_1_progress, '{}'::jsonb), s1_modules);
    new_s2 := backfill_session_completion(COALESCE(rec.session_2_progress, '{}'::jsonb), s2_modules);
    new_s3 := backfill_session_completion(COALESCE(rec.session_3_progress, '{}'::jsonb), s3_modules);
    new_s4 := backfill_session_completion(COALESCE(rec.session_4_progress, '{}'::jsonb), s4_modules);
    new_s5 := backfill_session_completion(COALESCE(rec.session_5_progress, '{}'::jsonb), s5_modules);

    UPDATE public.training_progress
    SET
      session_1_progress = new_s1,
      session_2_progress = new_s2,
      session_3_progress = new_s3,
      session_4_progress = new_s4,
      session_5_progress = new_s5
    WHERE id = rec.id;
  END LOOP;
END $$;

-- Clean up the helper function (one-time use)
DROP FUNCTION IF EXISTS backfill_session_completion(JSONB, TEXT[]);
