-- ============================================================
-- Add platform column to organizations
-- Enables Edge-layer UI rendering based on the platform
-- an organization has configured (e.g. 'chatgpt', 'default').
-- ============================================================

ALTER TABLE organizations
  ADD COLUMN IF NOT EXISTS platform TEXT NOT NULL DEFAULT 'default';
