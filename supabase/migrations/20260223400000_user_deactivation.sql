-- ============================================================
-- User Deactivation: is_active flag on user_profiles
-- ============================================================

ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true;

CREATE INDEX IF NOT EXISTS idx_user_profiles_active ON user_profiles(is_active);
