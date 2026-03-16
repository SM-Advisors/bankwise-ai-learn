-- ============================================================================
-- Super Admin: Full Read Access
-- ============================================================================
-- Ensures super admins can read all organizations, user profiles, and
-- training progress WITHOUT requiring the 'admin' role in user_roles.
-- Previously, super admins needed both is_super_admin=true AND has_role('admin')
-- to see cross-org data — this caused the SuperAdmin dashboard to show empty.
-- ============================================================================

-- user_profiles: super admins can read all profiles
CREATE POLICY "Super admins can view all profiles"
ON public.user_profiles
FOR SELECT
TO authenticated
USING (public.is_super_admin());

-- training_progress: super admins can read all progress
CREATE POLICY "Super admins can view all progress"
ON public.training_progress
FOR SELECT
TO authenticated
USING (public.is_super_admin());
