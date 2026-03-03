-- ============================================================
-- Organizations and Registration Codes
-- Enables multi-org tracking for beta testing and go-live
-- ============================================================

-- Organizations table
CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to read organizations (needed for dashboard display)
CREATE POLICY "Anyone can read organizations"
  ON organizations FOR SELECT
  TO authenticated
  USING (true);

-- Admins can manage organizations (insert, update, delete)
CREATE POLICY "Admins can manage organizations"
  ON organizations FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

-- Registration codes table
CREATE TABLE IF NOT EXISTS registration_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  expires_at TIMESTAMPTZ,
  max_uses INT,
  current_uses INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE registration_codes ENABLE ROW LEVEL SECURITY;

-- Admins can manage registration codes
CREATE POLICY "Admins can manage registration codes"
  ON registration_codes FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

-- Allow anon/authenticated to call the RPC function (needed during signup before auth)
CREATE POLICY "Anyone can read codes for validation"
  ON registration_codes FOR SELECT
  USING (true);

-- Add organization_id to user_profiles
ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id);

-- RPC function for atomic code validation + use increment
-- Called during signup to validate code and get organization info
-- SECURITY DEFINER so it can update current_uses regardless of caller's role
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

  -- Return success with org info
  RETURN json_build_object(
    'valid', true,
    'organization_id', org_row.id,
    'organization_name', org_row.name
  );
END;
$$;

-- Grant execute on the RPC function to anon and authenticated roles
GRANT EXECUTE ON FUNCTION validate_registration_code(TEXT) TO anon;
GRANT EXECUTE ON FUNCTION validate_registration_code(TEXT) TO authenticated;
