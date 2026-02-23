-- Add allowed_models JSONB column to organizations table
-- Defaults to only Claude Sonnet 4.6 (safe default — admin must explicitly unlock additional models)
ALTER TABLE organizations
  ADD COLUMN IF NOT EXISTS allowed_models JSONB DEFAULT '["claude-sonnet-4-6"]'::jsonb;

-- Add preferred_model TEXT column to user_profiles table
-- Persists the user's last-selected model in the practice chat panel
ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS preferred_model TEXT DEFAULT 'claude-sonnet-4-6';
