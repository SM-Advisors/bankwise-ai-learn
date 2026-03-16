import { useState, useEffect } from 'react';
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

        const [
          { data: orgsData, error: orgsErr },
          { data: profiles, error: profilesErr },
          { data: progressRows, error: progressErr },
          { data: allProfiles, error: allProfilesErr },
        ] = await Promise.all([
          supabase
            .from('organizations')
            .select('id, name, slug, audience_type, industry, created_at')
            .order('created_at', { ascending: false }),
          supabase
            .from('user_profiles')
            .select('organization_id, ai_proficiency_level, is_active')
            .eq('onboarding_completed', true),
          supabase
            .from('training_progress')
            .select('user_id, session_1_completed, session_2_completed, session_3_completed, session_4_completed, session_5_completed'),
          supabase
            .from('user_profiles')
            .select('user_id, organization_id, ai_proficiency_level'),
        ]);

        if (orgsErr) throw orgsErr;
        if (profilesErr) throw profilesErr;
        if (progressErr) throw progressErr;
        if (allProfilesErr) throw allProfilesErr;

        type ProfileRow = NonNullable<typeof allProfiles>[number];
        const profileByUserId = new Map<string, ProfileRow>(
          (allProfiles || []).map((p) => [p.user_id, p])
        );

        const orgMap = new Map<string, OrgSummary>();
        for (const org of orgsData || []) {
          orgMap.set(org.id, {
            id: org.id,
            name: org.name,
            slug: org.slug,
            audience_type: org.audience_type || 'enterprise',
            industry: org.industry || null,
            created_at: org.created_at,
            user_count: 0,
            active_user_count: 0,
            s1_completed: 0,
            s2_completed: 0,
            s3_completed: 0,
            s4_completed: 0,
            s5_completed: 0,
            avg_proficiency: null,
          });
        }

        const proficiencyByOrg = new Map<string, number[]>();
        for (const p of profiles || []) {
          if (!p.organization_id) continue;
          const org = orgMap.get(p.organization_id);
          if (!org) continue;

          org.user_count++;
          if (p.is_active !== false) org.active_user_count++;

          if (p.ai_proficiency_level != null) {
            if (!proficiencyByOrg.has(p.organization_id)) proficiencyByOrg.set(p.organization_id, []);
            proficiencyByOrg.get(p.organization_id)!.push(p.ai_proficiency_level);
          }
        }

        for (const row of progressRows || []) {
          const profile = profileByUserId.get(row.user_id);
          if (!profile?.organization_id) continue;

          const org = orgMap.get(profile.organization_id);
          if (!org) continue;

          if (row.session_1_completed) org.s1_completed++;
          if (row.session_2_completed) org.s2_completed++;
          if (row.session_3_completed) org.s3_completed++;
          if (row.session_4_completed) org.s4_completed++;
          if (row.session_5_completed) org.s5_completed++;
        }

        for (const [orgId, scores] of proficiencyByOrg.entries()) {
          const org = orgMap.get(orgId);
          if (org && scores.length > 0) {
            org.avg_proficiency = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
          }
        }

        const orgList = Array.from(orgMap.values());

        const totalUsers = (profiles || []).length;
        const activeUsers = (profiles || []).filter((p) => p.is_active !== false).length;
        const allScores = (profiles || [])
          .map((p) => p.ai_proficiency_level)
          .filter((v): v is number => v != null);

        const ffOrgIds = new Set(
          (orgsData || []).filter((o) => o.audience_type === 'consumer').map((o) => o.id)
        );
        const ffCount = (profiles || []).filter((p) => !!p.organization_id && ffOrgIds.has(p.organization_id)).length;

        const s1Total = (progressRows || []).filter((r) => r.session_1_completed).length;
        const s2Total = (progressRows || []).filter((r) => r.session_2_completed).length;
        const s3Total = (progressRows || []).filter((r) => r.session_3_completed).length;
        const s4Total = (progressRows || []).filter((r) => r.session_4_completed).length;
        const s5Total = (progressRows || []).filter((r) => r.session_5_completed).length;
        const progressTotal = (progressRows || []).length;

        if (!cancelled) {
          setOrgs(orgList);
          setPlatform({
            total_orgs: (orgsData || []).length,
            total_users: totalUsers,
            total_active_users: activeUsers,
            s1_completion_rate: progressTotal > 0 ? Math.round((s1Total / progressTotal) * 100) : 0,
            s2_completion_rate: progressTotal > 0 ? Math.round((s2Total / progressTotal) * 100) : 0,
            s3_completion_rate: progressTotal > 0 ? Math.round((s3Total / progressTotal) * 100) : 0,
            s4_completion_rate: progressTotal > 0 ? Math.round((s4Total / progressTotal) * 100) : 0,
            s5_completion_rate: progressTotal > 0 ? Math.round((s5Total / progressTotal) * 100) : 0,
            avg_proficiency: allScores.length > 0
              ? Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length)
              : null,
            ff_user_count: ffCount,
            bank_user_count: totalUsers - ffCount,
          });
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

    load();

    return () => {
      cancelled = true;
    };
  }, [user?.id, authLoading]);

  return { orgs, platform, loading, error };
}
