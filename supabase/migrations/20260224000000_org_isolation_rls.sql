-- ============================================================================
-- Organization Isolation: RLS Policy Update
-- ============================================================================
-- Fixes critical data leakage where admins could see users from all orgs.
-- Adds org-scoped admin policies with super_admin bypass.
-- ============================================================================

-- 1. Helper function: get the current user's organization_id
CREATE OR REPLACE FUNCTION public.get_my_org_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT organization_id FROM public.user_profiles WHERE user_id = auth.uid();
$$;

-- 2. Helper function: check if the current user is a super admin
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT is_super_admin FROM public.user_profiles WHERE user_id = auth.uid()),
    false
  );
$$;

-- ============================================================================
-- user_profiles: Replace admin policies with org-scoped versions
-- ============================================================================

DROP POLICY IF EXISTS "Admins can view all profiles" ON public.user_profiles;
CREATE POLICY "Admins can view org profiles"
ON public.user_profiles
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin') AND (
    public.is_super_admin()
    OR organization_id = public.get_my_org_id()
  )
);

DROP POLICY IF EXISTS "Admins can update all profiles" ON public.user_profiles;
CREATE POLICY "Admins can update org profiles"
ON public.user_profiles
FOR UPDATE
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin') AND (
    public.is_super_admin()
    OR organization_id = public.get_my_org_id()
  )
);

-- ============================================================================
-- user_roles: Replace admin policies with org-scoped versions
-- ============================================================================

DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;
CREATE POLICY "Admins can view org roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin') AND (
    public.is_super_admin()
    OR user_id IN (
      SELECT up.user_id FROM public.user_profiles up
      WHERE up.organization_id = public.get_my_org_id()
    )
  )
);

DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;
CREATE POLICY "Admins can manage org roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin') AND (
    public.is_super_admin()
    OR user_id IN (
      SELECT up.user_id FROM public.user_profiles up
      WHERE up.organization_id = public.get_my_org_id()
    )
  )
)
WITH CHECK (
  public.has_role(auth.uid(), 'admin') AND (
    public.is_super_admin()
    OR user_id IN (
      SELECT up.user_id FROM public.user_profiles up
      WHERE up.organization_id = public.get_my_org_id()
    )
  )
);

-- ============================================================================
-- training_progress: Replace admin policy with org-scoped version
-- ============================================================================

DROP POLICY IF EXISTS "Admins can view all progress" ON public.training_progress;
CREATE POLICY "Admins can view org progress"
ON public.training_progress
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin') AND (
    public.is_super_admin()
    OR user_id IN (
      SELECT up.user_id FROM public.user_profiles up
      WHERE up.organization_id = public.get_my_org_id()
    )
  )
);
