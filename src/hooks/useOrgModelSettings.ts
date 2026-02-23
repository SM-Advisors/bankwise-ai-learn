import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { DEFAULT_MODEL } from '@/lib/models';

interface OrgModelSettings {
  allowedModels: string[];
  isLoading: boolean;
}

export function useOrgModelSettings(): OrgModelSettings {
  const { user, profile } = useAuth();
  const [allowedModels, setAllowedModels] = useState<string[]>([DEFAULT_MODEL]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user?.id || !(profile as any)?.organization_id) {
      setAllowedModels([DEFAULT_MODEL]);
      setIsLoading(false);
      return;
    }

    const orgId = (profile as any).organization_id as string;

    (supabase
      .from('organizations' as any)
      .select('allowed_models')
      .eq('id', orgId)
      .single() as any)
      .then(({ data, error }: { data: any; error: any }) => {
        if (error || !data) {
          setAllowedModels([DEFAULT_MODEL]);
        } else {
          const raw = data.allowed_models;
          const models: string[] = Array.isArray(raw) && raw.length > 0
            ? raw
            : [DEFAULT_MODEL];
          setAllowedModels(models);
        }
        setIsLoading(false);
      });
  }, [user?.id, (profile as any)?.organization_id]);

  return { allowedModels, isLoading };
}
