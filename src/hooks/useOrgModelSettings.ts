import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { DEFAULT_MODEL, AVAILABLE_MODELS } from '@/lib/models';

// When org has no model restrictions, allow all models
const ALL_MODEL_IDS = AVAILABLE_MODELS.map(m => m.id);

interface OrgModelSettings {
  allowedModels: string[];
  isLoading: boolean;
}

export function useOrgModelSettings(): OrgModelSettings {
  const { user, profile } = useAuth();
  const [allowedModels, setAllowedModels] = useState<string[]>(ALL_MODEL_IDS);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user?.id || !profile?.organization_id) {
      setAllowedModels(ALL_MODEL_IDS);
      setIsLoading(false);
      return;
    }

    const orgId = profile.organization_id as string;

    (supabase
      .from('organizations')
      .select('allowed_models')
      .eq('id', orgId)
      .single())
      .then(({ data, error }) => {
        if (error || !data) {
          setAllowedModels(ALL_MODEL_IDS);
        } else {
          const raw = data.allowed_models;
          const models: string[] = Array.isArray(raw) && raw.length > 0
            ? (raw as string[])
            : ALL_MODEL_IDS;
          setAllowedModels(models);
        }
        setIsLoading(false);
      });
  }, [user?.id, profile?.organization_id]);

  return { allowedModels, isLoading };
}
