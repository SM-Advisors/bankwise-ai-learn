import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export interface OrgSummary {
  id: string;
  name: string;
  slug: string;
  audience_type: string;
  industry: string | null;
  created_at: string;
  user_count: number;
  active_user_count: number;
  s1_completed: number;
  s2_completed: number;
  s3_completed: number;
  s4_completed: number;
  s5_completed: number;
  avg_proficiency: number | null;
}

export interface PlatformKPIs {
  total_orgs: number;
  total_users: number;
  total_active_users: number;
  s1_completion_rate: number;
  s2_completion_rate: number;
  s3_completion_rate: number;
  s4_completion_rate: number;
  s5_completion_rate: number;
  avg_proficiency: number | null;
  ff_user_count: number;
  bank_user_count: number;
  users_by_org?: { name: string; count: number }[];
}

interface SuperAdminKpiResponse {
  orgs: OrgSummary[];
  platform: PlatformKPIs;
}

export function useSuperAdminKPIs() {
  const { user, session, loading: authLoading } = useAuth();
  const [orgs, setOrgs] = useState<OrgSummary[]>([]);
  const [platform, setPlatform] = useState<PlatformKPIs | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError(null);

        const invokeKpis = async (token: string) => {
          return supabase.functions.invoke<SuperAdminKpiResponse>('superadmin-kpis', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: {},
          });
        };

        let { data, error: fnError } = await invokeKpis(session.access_token);

        if (fnError) {
          const { data: refreshed } = await supabase.auth.refreshSession();
          const refreshedToken = refreshed.session?.access_token;
          if (refreshedToken) {
            const retry = await invokeKpis(refreshedToken);
            data = retry.data;
            fnError = retry.error;
          }
        }

        if (fnError) {
          throw new Error(fnError.message || 'Failed to load super admin KPIs');
        }

        if (!data) {
          throw new Error('No KPI data was returned');
        }

        if (!cancelled) {
          setOrgs(Array.isArray(data.orgs) ? data.orgs : []);
          setPlatform(data.platform ?? null);
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        console.error('SuperAdminKPIs error:', err);
        if (!cancelled) setError(message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    if (authLoading) {
      return () => {
        cancelled = true;
      };
    }

    if (!user) {
      setOrgs([]);
      setPlatform(null);
      setError('Not authenticated');
      setLoading(false);
      return () => {
        cancelled = true;
      };
    }

    if (!session?.access_token) {
      setLoading(true);
      setError(null);
      return () => {
        cancelled = true;
      };
    }

    load();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- user?.id is sufficient; adding `user` object would cause unnecessary re-runs
  }, [user?.id, session?.access_token, authLoading]);

  return { orgs, platform, loading, error };
}

