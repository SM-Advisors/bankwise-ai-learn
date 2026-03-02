-- Add policies for inserting and updating bank_policies
-- For now, allow authenticated users to manage policies (in production, this would be admin-only)
CREATE POLICY "Authenticated users can create policies"
ON public.bank_policies
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update policies"
ON public.bank_policies
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Allow reading all policies including inactive for admin purposes
CREATE POLICY "Authenticated users can view all policies for admin"
ON public.bank_policies
FOR SELECT
TO authenticated
USING (true);