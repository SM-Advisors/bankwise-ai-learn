-- Allow super admins to manage app_settings
-- The existing "Admins can manage settings" policy only checks has_role('admin'),
-- which uses the user_roles table. Super admins use is_super_admin flag on
-- user_profiles instead, so they need their own policy.

CREATE POLICY "Super admins can manage settings"
ON public.app_settings
FOR ALL
USING (public.is_super_admin())
WITH CHECK (public.is_super_admin());
