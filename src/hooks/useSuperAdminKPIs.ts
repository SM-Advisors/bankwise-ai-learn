import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface OrgSummary {
  id: string;
  name: string;
  slug: string;
  org_type: string;
  created_at: string;
  user_count: number;
  active_user_count: number;
  s1_completed: number;
  s2_completed: number;
  s3_completed: number;
  avg_proficiency: number | null;
}

export interface PlatformKPIs {
  total_orgs: number;
  total_users: number;
  total_active_users: number;
  s1_completion_rate: number;
  s2_completion_rate: number;
  s3_completion_rate: number;
  avg_proficiency: number | null;
  ff_user_count: number;
  bank_user_count: number;
}

export function useSuperAdminKPIs() {
  const [orgs, setOrgs] = useState<OrgSummary[]>([]);
  const [platform, setPlatform] = useState<PlatformKPIs | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        // Fetch all organizations
        const { data: orgsData, error: orgsErr } = await supabase
          .from('organizations')
          .select('id, name, slug, org_type, created_at')
          .order('created_at', { ascending: false }) as any;

        if (orgsErr) throw orgsErr;

        // Fetch all user profiles with training progress
        const { data: profiles, error: profilesErr } = await supabase
          .from('user_profiles')
          .select('organization_id, ai_proficiency_level, is_active')
          .eq('onboarding_completed', true) as any;

        if (profilesErr) throw profilesErr;

        // Fetch training progress
        const { data: progressRows, error: progressErr } = await supabase
          .from('training_progress')
          .select('user_id, session_1_completed, session_2_completed, session_3_completed') as any;

        if (progressErr) throw progressErr;

        // Map user_id -> profile for join
        const { data: allProfiles, error: allProfilesErr } = await supabase
          .from('user_profiles')
          .select('user_id, organization_id, ai_proficiency_level') as any;

        if (allProfilesErr) throw allProfilesErr;

        const profileByUserId = new Map<string, any>(
          (allProfiles || []).map((p: any) => [p.user_id, p])
        );

        // Build per-org stats
        const orgMap = new Map<string, OrgSummary>();
        for (const org of orgsData || []) {
          orgMap.set(org.id, {
            id: org.id,
            name: org.name,
            slug: org.slug,
            org_type: org.org_type || 'bank',
            created_at: org.created_at,
            user_count: 0,
            active_user_count: 0,
            s1_completed: 0,
            s2_completed: 0,
            s3_completed: 0,
            avg_proficiency: null,
          });
        }

        // Count users per org from onboarded profiles
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

        // Count completions per org from progress
        for (const row of progressRows || []) {
          const profile = profileByUserId.get(row.user_id);
          if (!profile?.organization_id) continue;
          const org = orgMap.get(profile.organization_id);
          if (!org) continue;
          if (row.session_1_completed) org.s1_completed++;
          if (row.session_2_completed) org.s2_completed++;
          if (row.session_3_completed) org.s3_completed++;
        }

        // Compute per-org avg proficiency
        for (const [orgId, scores] of proficiencyByOrg.entries()) {
          const org = orgMap.get(orgId);
          if (org && scores.length > 0) {
            org.avg_proficiency = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
          }
        }

        const orgList = Array.from(orgMap.values());
        setOrgs(orgList);

        // Platform-wide KPIs
        const totalUsers = (profiles || []).length;
        const activeUsers = (profiles || []).filter((p: any) => p.is_active !== false).length;
        const allScores = (profiles || [])
          .map((p: any) => p.ai_proficiency_level)
          .filter((v: any) => v != null);

        // Get org types for user breakdown
        const { data: orgTypeProfiles } = await supabase
          .from('user_profiles')
          .select('organization_id')
          .eq('onboarding_completed', true) as any;

        const ffOrgIds = new Set(
          (orgsData || []).filter((o: any) => o.org_type === 'friends_family').map((o: any) => o.id)
        );
        const ffCount = (orgTypeProfiles || []).filter((p: any) => ffOrgIds.has(p.organization_id)).length;

        const s1Total = (progressRows || []).filter((r: any) => r.session_1_completed).length;
        const s2Total = (progressRows || []).filter((r: any) => r.session_2_completed).length;
        const s3Total = (progressRows || []).filter((r: any) => r.session_3_completed).length;
        const progressTotal = (progressRows || []).length;

        setPlatform({
          total_orgs: (orgsData || []).length,
          total_users: totalUsers,
          total_active_users: activeUsers,
          s1_completion_rate: progressTotal > 0 ? Math.round((s1Total / progressTotal) * 100) : 0,
          s2_completion_rate: progressTotal > 0 ? Math.round((s2Total / progressTotal) * 100) : 0,
          s3_completion_rate: progressTotal > 0 ? Math.round((s3Total / progressTotal) * 100) : 0,
          avg_proficiency: allScores.length > 0
            ? Math.round(allScores.reduce((a: number, b: number) => a + b, 0) / allScores.length)
            : null,
          ff_user_count: ffCount,
          bank_user_count: totalUsers - ffCount,
        });
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  return { orgs, platform, loading, error };
}
