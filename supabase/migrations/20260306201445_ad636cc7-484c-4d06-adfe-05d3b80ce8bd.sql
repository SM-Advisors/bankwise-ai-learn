CREATE OR REPLACE FUNCTION public.validate_registration_code(input_code text)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  code_row registration_codes%ROWTYPE;
  org_row organizations%ROWTYPE;
BEGIN
  SELECT * INTO code_row FROM registration_codes WHERE code = UPPER(TRIM(input_code)) AND is_active = true;
  IF NOT FOUND THEN RETURN json_build_object('valid', false, 'error', 'Invalid registration code'); END IF;
  IF code_row.expires_at IS NOT NULL AND code_row.expires_at < now() THEN RETURN json_build_object('valid', false, 'error', 'This registration code has expired'); END IF;
  IF code_row.max_uses IS NOT NULL AND code_row.current_uses >= code_row.max_uses THEN RETURN json_build_object('valid', false, 'error', 'This registration code has reached its usage limit'); END IF;
  SELECT * INTO org_row FROM organizations WHERE id = code_row.organization_id;
  IF NOT FOUND THEN RETURN json_build_object('valid', false, 'error', 'Organization not found for this code'); END IF;
  UPDATE registration_codes SET current_uses = current_uses + 1 WHERE id = code_row.id;
  RETURN json_build_object(
    'valid', true,
    'organization_id', org_row.id,
    'organization_name', org_row.name,
    'org_type', COALESCE(org_row.org_type, 'bank'),
    'audience_type', org_row.audience_type,
    'industry', org_row.industry
  );
END;
$function$;