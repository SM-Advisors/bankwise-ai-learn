import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export type OrgPlatform = 'chatgpt' | 'default';

interface OrgPlatformSettings {
  platform: OrgPlatform;
  isLoading: boolean;
}

export function useOrgPlatform(): OrgPlatformSettings {
  const { user, profile } = useAuth();
  const [platform, setPlatform] = useState<OrgPlatform>('default');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user?.id || !profile?.organization_id) {
      setPlatform('default');
      setIsLoading(false);
      return;
    }

    const orgId = profile.organization_id as string;

    supabase
      .from('organizations')
      .select('platform')
      .eq('id', orgId)
      .single()
      .then(({ data, error }) => {
        if (error || !data) {
          setPlatform('default');
        } else {
          const raw = (data as { platform?: string }).platform;
          setPlatform(raw === 'chatgpt' ? 'chatgpt' : 'default');
        }
        setIsLoading(false);
      });
  }, [user?.id, profile?.organization_id]);

  return { platform, isLoading };
}
