-- ============================================================
-- Super Admin + Friends & Family
-- Adds is_super_admin flag, org_type for F&F orgs,
-- and interests array for non-banker personalization
-- ============================================================

-- 1. Super Admin flag on user_profiles
ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS is_super_admin BOOLEAN DEFAULT false;

-- 2. Org type on organizations (bank = default, friends_family = F&F pilot testers)
ALTER TABLE organizations
  ADD COLUMN IF NOT EXISTS org_type TEXT DEFAULT 'bank'
  CHECK (org_type IN ('bank', 'friends_family'));

-- 3. Interests array on user_profiles (for F&F users instead of department)
ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS interests TEXT[] DEFAULT '{}';

-- 4. Update validate_registration_code RPC to also return org_type
-- Drop and recreate so the return payload includes the new field
CREATE OR REPLACE FUNCTION validate_registration_code(input_code TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  code_row registration_codes%ROWTYPE;
  org_row organizations%ROWTYPE;
BEGIN
  -- Look up the code (case-insensitive via UPPER)
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

  -- Return success with org info including org_type
  RETURN json_build_object(
    'valid', true,
    'organization_id', org_row.id,
    'organization_name', org_row.name,
    'org_type', COALESCE(org_row.org_type, 'bank')
  );
END;
$$;

-- Re-grant execute (in case it was revoked on replace)
GRANT EXECUTE ON FUNCTION validate_registration_code(TEXT) TO anon;
GRANT EXECUTE ON FUNCTION validate_registration_code(TEXT) TO authenticated;
