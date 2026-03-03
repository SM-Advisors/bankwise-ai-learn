-- ============================================================================
-- Schema Cleanup: Generic Naming + Industry System
-- ============================================================================
-- Renames banking-specific column names to generic equivalents so the
-- platform works cleanly across all industries.
--
-- Column renames (user_profiles):
--   bank_role         → job_role
--   line_of_business  → department
--   employer_bank_name → employer_name
--
-- Column rename (organizations):
--   org_type          → audience_type
--   Values: 'bank' → 'enterprise', 'friends_family' → 'consumer'
--
-- New column (organizations):
--   industry          TEXT  (e.g. 'banking', 'healthcare', 'insurance', ...)
-- ============================================================================

-- ── user_profiles: rename banking-specific columns ────────────────────────

ALTER TABLE public.user_profiles
  RENAME COLUMN bank_role TO job_role;

ALTER TABLE public.user_profiles
  RENAME COLUMN employer_bank_name TO employer_name;

ALTER TABLE public.user_profiles
  RENAME COLUMN line_of_business TO department;

-- Cast to TEXT if it is still an ENUM type (from the original migration)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name   = 'user_profiles'
      AND column_name  = 'department'
      AND data_type    = 'USER-DEFINED'
  ) THEN
    ALTER TABLE public.user_profiles
      ALTER COLUMN department TYPE TEXT;
  END IF;
END $$;

-- ── organizations: rename org_type → audience_type ───────────────────────

ALTER TABLE public.organizations
  RENAME COLUMN org_type TO audience_type;

-- Drop old constraint (name varies slightly by how Supabase named it)
ALTER TABLE public.organizations
  DROP CONSTRAINT IF EXISTS organizations_org_type_check;

-- Migrate existing values to new vocabulary
UPDATE public.organizations SET audience_type = 'enterprise' WHERE audience_type = 'bank';
UPDATE public.organizations SET audience_type = 'consumer'   WHERE audience_type = 'friends_family';

-- Add updated constraint
ALTER TABLE public.organizations
  ADD CONSTRAINT organizations_audience_type_check
  CHECK (audience_type IN ('enterprise', 'consumer'));

-- ── organizations: add industry column ───────────────────────────────────

ALTER TABLE public.organizations
  ADD COLUMN IF NOT EXISTS industry TEXT DEFAULT NULL;

-- Default all existing enterprise orgs to 'banking'
UPDATE public.organizations
  SET industry = 'banking'
  WHERE audience_type = 'enterprise'
    AND industry IS NULL;

-- ── validate_registration_code: updated to return audience_type + industry ──

CREATE OR REPLACE FUNCTION validate_registration_code(input_code TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  code_row registration_codes%ROWTYPE;
  org_row  organizations%ROWTYPE;
BEGIN
  -- Look up the code (case-insensitive)
  SELECT * INTO code_row
  FROM registration_codes
  WHERE code = UPPER(TRIM(input_code))
    AND is_active = true;

  IF NOT FOUND THEN
    RETURN json_build_object('valid', false, 'error', 'Invalid registration code');
  END IF;

  -- Check expiration
  IF code_row.expires_at IS NOT NULL AND code_row.expires_at < now() THEN
    RETURN json_build_object('valid', false, 'error', 'This registration code has expired');
  END IF;

  -- Check usage limit
  IF code_row.max_uses IS NOT NULL AND code_row.current_uses >= code_row.max_uses THEN
    RETURN json_build_object('valid', false, 'error', 'This registration code has reached its usage limit');
  END IF;

  -- Get the organization
  SELECT * INTO org_row
  FROM organizations
  WHERE id = code_row.organization_id;

  IF NOT FOUND THEN
    RETURN json_build_object('valid', false, 'error', 'Organization not found for this code');
  END IF;

  -- Increment usage count
  UPDATE registration_codes
  SET current_uses = current_uses + 1
  WHERE id = code_row.id;

  -- Return success with org info (audience_type + industry)
  RETURN json_build_object(
    'valid',             true,
    'organization_id',   org_row.id,
    'organization_name', org_row.name,
    'audience_type',     COALESCE(org_row.audience_type, 'enterprise'),
    'industry',          COALESCE(org_row.industry, 'banking')
  );
END;
$$;

-- Re-grant execute
GRANT EXECUTE ON FUNCTION validate_registration_code(TEXT) TO anon;
GRANT EXECUTE ON FUNCTION validate_registration_code(TEXT) TO authenticated;
