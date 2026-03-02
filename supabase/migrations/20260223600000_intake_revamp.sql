-- ============================================================
-- Intake Form Revamp
-- Supports the new 6-step SMILE intake spec:
-- behavioral anchors, SJT scenarios, micro-demo, orientation
-- ============================================================

-- Full intake responses (all Q answers stored as JSON for reporting/analysis)
ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS intake_responses JSONB DEFAULT '{}';

-- Safe-use flag (triggered when user says they'd paste PII into external AI)
ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS safe_use_flag BOOLEAN DEFAULT false;

-- Role key from Q2 dropdown (e.g. 'loan_officer', 'compliance')
ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS intake_role_key TEXT;

-- AI orientation feeling from Q10 ('excited', 'curious', 'anxious', 'skeptical', 'neutral')
ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS intake_orientation TEXT;

-- Motivation tags from Q11 multi-select top 2
ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS intake_motivation TEXT[] DEFAULT '{}';
