-- ============================================================================
-- Generated Module Content Cache
-- ============================================================================
-- Stores AI-generated industry-specific module content (examples, scenarios,
-- hints) per organization + department + module. First learner to access a
-- module triggers generation; subsequent learners get the cached version.
--
-- Cache invalidation is manual (admin "Regenerate Content" button).
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.generated_module_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  industry_slug TEXT NOT NULL,
  department_slug TEXT NOT NULL,
  module_id TEXT NOT NULL,
  content JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Each org+department+module combo has exactly one cached entry
  CONSTRAINT uq_generated_content_org_dept_module
    UNIQUE (org_id, department_slug, module_id)
);

-- Index for fast lookup by org + module (most common query pattern)
CREATE INDEX idx_generated_content_org_module
  ON public.generated_module_content(org_id, module_id);

-- RLS
ALTER TABLE public.generated_module_content ENABLE ROW LEVEL SECURITY;

-- Authenticated users can read generated content for their org
CREATE POLICY "Users can read generated content for their org"
  ON public.generated_module_content FOR SELECT
  TO authenticated
  USING (
    org_id IN (
      SELECT organization_id FROM public.user_profiles
      WHERE user_id = auth.uid()
    )
  );

-- Service role (edge functions) can insert/update/delete
-- No user-facing write policies needed — only edge functions write to this table

-- Admin read access
CREATE POLICY "Admins can read all generated content"
  ON public.generated_module_content FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_generated_module_content_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER generated_module_content_updated_at
  BEFORE UPDATE ON public.generated_module_content
  FOR EACH ROW
  EXECUTE FUNCTION update_generated_module_content_updated_at();
