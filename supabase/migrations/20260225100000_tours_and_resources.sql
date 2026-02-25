-- ============================================================
-- Tours & Resources
-- Adds per-tour completion tracking and admin-managed resource links
-- ============================================================

-- 1. Per-tour completion map on user_profiles
--    Keys are tour IDs ('dashboard', 'admin', 'andrea')
--    The existing tour_completed boolean is kept for backward compat
ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS tours_completed JSONB DEFAULT '{}';

-- 2. Admin-managed resource links displayed in the user Help panel
CREATE TABLE IF NOT EXISTS org_resources (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  title           TEXT NOT NULL,
  description     TEXT,
  resource_type   TEXT NOT NULL DEFAULT 'link'
                  CHECK (resource_type IN ('video', 'document', 'link')),
  url             TEXT NOT NULL,
  display_order   INTEGER DEFAULT 0,
  is_active       BOOLEAN DEFAULT true,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_org_resources_org
  ON org_resources (organization_id, display_order);

ALTER TABLE org_resources ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  -- Admins can create/read/update/delete resources for their own org
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE policyname = 'Admins can manage org resources'
    AND tablename = 'org_resources'
  ) THEN
    EXECUTE $p$
      CREATE POLICY "Admins can manage org resources"
        ON org_resources FOR ALL TO authenticated
        USING (
          organization_id IN (
            SELECT organization_id FROM user_profiles WHERE user_id = auth.uid()
          )
          AND EXISTS (
            SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'
          )
        )
        WITH CHECK (
          organization_id IN (
            SELECT organization_id FROM user_profiles WHERE user_id = auth.uid()
          )
          AND EXISTS (
            SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'
          )
        )
    $p$;
  END IF;

  -- Users can read active resources for their own org
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE policyname = 'Users can view active org resources'
    AND tablename = 'org_resources'
  ) THEN
    EXECUTE $p$
      CREATE POLICY "Users can view active org resources"
        ON org_resources FOR SELECT TO authenticated
        USING (
          is_active = true
          AND organization_id IN (
            SELECT organization_id FROM user_profiles WHERE user_id = auth.uid()
          )
        )
    $p$;
  END IF;
END $$;
