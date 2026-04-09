-- Phase 8: Add Session 6 tracking columns and rename agent deployment flag
-- Part of Skills & Agents Restructure (Sessions 3-6)

-- 8.1 Add session_6 tracking columns
ALTER TABLE training_progress
  ADD COLUMN IF NOT EXISTS session_6_progress JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS session_6_completed BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS session_6_completed_at TIMESTAMPTZ DEFAULT NULL;

-- 8.2 Add skill-specific progress flag for Session 3
ALTER TABLE training_progress
  ADD COLUMN IF NOT EXISTS session_3_skill_created BOOLEAN DEFAULT false;

-- 8.3 Add session_4_agent_deployed flag (replaces session_3_agent_deployed conceptually)
-- The old column is checked via user_agents table, not a progress column,
-- so we just need zones/feature gates updated (done in code).
-- No column rename needed — the gate logic reads from user_agents.is_deployed.
