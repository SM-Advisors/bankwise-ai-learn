-- ============================================================================
-- org_policies: Backward-Compatible View over bank_policies
-- ============================================================================
-- Creates a view with an industry-agnostic name so new code can reference
-- "org_policies" while existing code continues to use "bank_policies".
-- Once all consumers are migrated, the underlying table can be renamed.
-- ============================================================================

CREATE OR REPLACE VIEW public.org_policies AS
  SELECT * FROM public.bank_policies;

-- Grant same permissions as the underlying table
GRANT SELECT ON public.org_policies TO authenticated;
GRANT SELECT ON public.org_policies TO anon;
