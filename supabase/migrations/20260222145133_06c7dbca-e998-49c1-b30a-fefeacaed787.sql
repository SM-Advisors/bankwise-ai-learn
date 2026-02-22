
-- Create organizations table (idempotent)
CREATE TABLE IF NOT EXISTS public.organizations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can manage organizations' AND tablename = 'organizations') THEN
    EXECUTE 'CREATE POLICY "Admins can manage organizations" ON public.organizations FOR ALL USING (has_role(auth.uid(), ''admin''::app_role)) WITH CHECK (has_role(auth.uid(), ''admin''::app_role))';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated users can view organizations' AND tablename = 'organizations') THEN
    EXECUTE 'CREATE POLICY "Authenticated users can view organizations" ON public.organizations FOR SELECT USING (auth.uid() IS NOT NULL)';
  END IF;
END $$;

-- Create registration_codes table (idempotent)
CREATE TABLE IF NOT EXISTS public.registration_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  expires_at TIMESTAMP WITH TIME ZONE,
  max_uses INTEGER,
  current_uses INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.registration_codes ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can manage registration codes' AND tablename = 'registration_codes') THEN
    EXECUTE 'CREATE POLICY "Admins can manage registration codes" ON public.registration_codes FOR ALL USING (has_role(auth.uid(), ''admin''::app_role)) WITH CHECK (has_role(auth.uid(), ''admin''::app_role))';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated users can view active codes' AND tablename = 'registration_codes') THEN
    EXECUTE 'CREATE POLICY "Authenticated users can view active codes" ON public.registration_codes FOR SELECT USING (auth.uid() IS NOT NULL AND is_active = true)';
  END IF;
END $$;
