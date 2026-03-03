
-- Create storage bucket for policy document uploads (idempotent)
INSERT INTO storage.buckets (id, name, public)
VALUES ('policy-documents', 'policy-documents', false)
ON CONFLICT (id) DO NOTHING;

-- RLS policies for policy-documents bucket (only if has_role function and app_role type exist)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') AND
     EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'has_role') THEN

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can upload policy documents' AND tablename = 'objects') THEN
      EXECUTE 'CREATE POLICY "Admins can upload policy documents" ON storage.objects FOR INSERT WITH CHECK (bucket_id = ''policy-documents'' AND public.has_role(auth.uid(), ''admin''::public.app_role))';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can read policy documents' AND tablename = 'objects') THEN
      EXECUTE 'CREATE POLICY "Admins can read policy documents" ON storage.objects FOR SELECT USING (bucket_id = ''policy-documents'' AND public.has_role(auth.uid(), ''admin''::public.app_role))';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can delete policy documents' AND tablename = 'objects') THEN
      EXECUTE 'CREATE POLICY "Admins can delete policy documents" ON storage.objects FOR DELETE USING (bucket_id = ''policy-documents'' AND public.has_role(auth.uid(), ''admin''::public.app_role))';
    END IF;

  END IF;
END $$;

-- Add source_file_path to bank_policies to track uploaded document origin
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'bank_policies') THEN
    EXECUTE 'ALTER TABLE public.bank_policies ADD COLUMN IF NOT EXISTS source_file_path text DEFAULT NULL';
  END IF;
END $$;
