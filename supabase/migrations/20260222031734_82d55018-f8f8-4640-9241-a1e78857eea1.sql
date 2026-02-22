
-- Create storage bucket for policy document uploads
INSERT INTO storage.buckets (id, name, public)
VALUES ('policy-documents', 'policy-documents', false);

-- RLS: only admins can upload policy documents
CREATE POLICY "Admins can upload policy documents"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'policy-documents'
  AND public.has_role(auth.uid(), 'admin'::public.app_role)
);

-- RLS: only admins can read policy documents
CREATE POLICY "Admins can read policy documents"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'policy-documents'
  AND public.has_role(auth.uid(), 'admin'::public.app_role)
);

-- RLS: only admins can delete policy documents
CREATE POLICY "Admins can delete policy documents"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'policy-documents'
  AND public.has_role(auth.uid(), 'admin'::public.app_role)
);

-- Add source_file_path to bank_policies to track uploaded document origin
ALTER TABLE public.bank_policies
ADD COLUMN IF NOT EXISTS source_file_path text DEFAULT NULL;
