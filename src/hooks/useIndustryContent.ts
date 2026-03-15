import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { getIndustryConfig, type IndustryConfig, type AudienceType } from '@/data/industryConfigs';

interface UseIndustryContentResult {
  config: IndustryConfig;
  industrySlug: string;
  isLoading: boolean;
}

/**
 * Resolves the current user's IndustryConfig.
 *
 * Resolution order:
 * 1. Super-admin "view as org" override (from viewAsOrg context)
 * 2. User's own organization (fetched from organizations table)
 * 3. Fallback: banking (enterprise) or general (consumer)
 */
export function useIndustryContent(): UseIndustryContentResult {
  const { user, profile, viewAsOrg } = useAuth();
  const [orgIndustry, setOrgIndustry] = useState<string | null>(null);
  const [orgAudienceType, setOrgAudienceType] = useState<AudienceType | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // If super admin is viewing as another org, use that org's industry directly
  const viewAsIndustry = viewAsOrg?.industry ?? null;
  const viewAsAudience = viewAsOrg?.audience_type as AudienceType | undefined;

  useEffect(() => {
    // If we have a viewAsOrg override, skip the query
    if (viewAsIndustry) {
      setOrgIndustry(viewAsIndustry);
      setOrgAudienceType(viewAsAudience ?? null);
      setIsLoading(false);
      return;
    }

    if (!user?.id || !profile?.organization_id) {
      setOrgIndustry(null);
      setOrgAudienceType(null);
      setIsLoading(false);
      return;
    }

    const orgId = profile.organization_id as string;

    supabase
      .from('organizations')
      .select('industry, audience_type')
      .eq('id', orgId)
      .single()
      .then(({ data, error }) => {
        if (error || !data) {
          setOrgIndustry(null);
          setOrgAudienceType(null);
        } else {
          const raw = data as { industry?: string; audience_type?: string };
          setOrgIndustry(raw.industry ?? null);
          setOrgAudienceType((raw.audience_type as AudienceType) ?? null);
        }
        setIsLoading(false);
      });
  }, [user?.id, profile?.organization_id, viewAsIndustry, viewAsAudience]);

  const config = useMemo(
    () => getIndustryConfig(orgIndustry, orgAudienceType),
    [orgIndustry, orgAudienceType],
  );

  return {
    config,
    industrySlug: config.slug,
    isLoading,
  };
}
