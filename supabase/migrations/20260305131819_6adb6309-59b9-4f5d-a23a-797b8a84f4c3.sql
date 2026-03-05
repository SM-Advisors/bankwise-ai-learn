
CREATE TABLE public.training_reset_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  reset_by uuid NOT NULL,
  snapshot_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  reset_at timestamptz NOT NULL DEFAULT now(),
  reversed_at timestamptz,
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '30 days')
);

ALTER TABLE public.training_reset_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admins can manage reset snapshots"
  ON public.training_reset_snapshots
  FOR ALL
  TO authenticated
  USING (is_super_admin())
  WITH CHECK (is_super_admin());
