
CREATE TABLE public.generated_module_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  industry_slug text NOT NULL,
  department_slug text NOT NULL,
  module_id text NOT NULL,
  content jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (org_id, department_slug, module_id)
);

ALTER TABLE public.generated_module_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can manage generated content"
  ON public.generated_module_content
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can read generated content"
  ON public.generated_module_content
  FOR SELECT
  TO authenticated
  USING (true);
