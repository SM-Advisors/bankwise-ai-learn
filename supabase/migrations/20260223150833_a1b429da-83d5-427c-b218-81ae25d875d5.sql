
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS is_super_admin boolean NOT NULL DEFAULT false;
ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS org_type text DEFAULT NULL;
