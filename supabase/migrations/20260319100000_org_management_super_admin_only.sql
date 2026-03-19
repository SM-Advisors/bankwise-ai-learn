-- ============================================================
-- Restrict organization & registration code management to super admins only.
-- Previously any user with role='admin' could manage these; now requires
-- is_super_admin flag on user_profiles.
-- ============================================================

-- Organizations: replace admin policy with super-admin-only policy
DROP POLICY IF EXISTS "Admins can manage organizations" ON organizations;
CREATE POLICY "Super admins can manage organizations"
  ON organizations FOR ALL
  TO authenticated
  USING ( public.is_super_admin() )
  WITH CHECK ( public.is_super_admin() );

-- Registration codes: replace admin policy with super-admin-only policy
DROP POLICY IF EXISTS "Admins can manage registration codes" ON registration_codes;
CREATE POLICY "Super admins can manage registration codes"
  ON registration_codes FOR ALL
  TO authenticated
  USING ( public.is_super_admin() )
  WITH CHECK ( public.is_super_admin() );
