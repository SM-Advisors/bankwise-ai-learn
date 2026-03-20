import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

export interface UserProgressRow {
  user_id: string;
  display_name: string | null;
  job_role: string | null;
  department: string | null;
  ai_proficiency_level: number | null;
  session_1_completed: boolean;
  session_2_completed: boolean;
  session_3_completed: boolean;
  session_4_completed: boolean;
  session_5_completed: boolean;
}

export interface PromptEventStats {
  total_prompts: number;
  total_exceptions: number;
  by_session: Record<number, number>;
  by_exception_type: Record<string, number>;
}

// ---------------------------------------------------------------------------
// C-Suite KPI types
// ---------------------------------------------------------------------------

export interface SessionFunnelItem {
  session: string;
  label: string;
  completed: number;
  total: number;
  rate: number;
}

export interface DepartmentBreakdown {
  department: string;
  label: string;
  total: number;
  s1: number;
  s2: number;
  s3: number;
  s4: number;
  s5: number;
  avgProficiency: number;
}

export interface SkillDistItem {
  name: string;
  value: number;
  color: string;
}

export interface ExceptionTrendItem {
  date: string;
  exceptions: number;
  prompts: number;
}

export interface ExceptionByDept {
  department: string;
  count: number;
}

export interface ExceptionTypeItem {
  type: string;
  label: string;
  count: number;
  color: string;
}

export interface RepeatOffender {
  user_id: string;
  display_name: string | null;
  department: string | null;
  exception_count: number;
}

export interface IdeaItem {
  id: string;
  title: string;
  description: string | null;
  status: string;
  votes: number;
  roi_impact: string | null;
  category: string | null;
  submitter_name: string | null;
  submitter_department: string | null;
  created_at: string;
  updated_at: string | null;
  user_id: string;
}

export interface CSuiteKPIs {
  totalEnrolled: number;
  enrollmentRate: number;
  funnelData: SessionFunnelItem[];
  activeUsers7d: number;
  activeUsers30d: number;
  skillDistribution: SkillDistItem[];
  departmentBreakdowns: DepartmentBreakdown[];
  avgProficiency: number;
  fullyCompleted: number;
  completionRate: number;
  totalExceptions: number;
  exceptionRate: number;
  exceptionTrend: ExceptionTrendItem[];
  exceptionsByDept: ExceptionByDept[];
  exceptionTypes: ExceptionTypeItem[];
  repeatOffenders: RepeatOffender[];
  totalIdeas: number;
  ideasByStatus: Record<string, number>;
  topIdeas: IdeaItem[];
  ideasByDepartment: Record<string, number>;
  loading: boolean;
}

// ---------------------------------------------------------------------------
// Label helpers
// ---------------------------------------------------------------------------

// Dynamic department labels — this function converts slugs to display names
// For a full department lookup, use useDepartments() hook instead
export const getLobLabel = (slug: string): string => {
  if (!slug) return 'Unknown';
  return slug.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
};

// Backwards-compatible export for existing consumers
export const LOB_LABELS: Record<string, string> = new Proxy({} as Record<string, string>, {
  get: (_target, prop: string) => getLobLabel(prop),
});

const EXCEPTION_TYPE_LABELS: Record<string, string> = {
  pii_sharing: 'PII Sharing',
  policy_violation: 'Policy Violation',
  data_export: 'Unauthorized Data Export',
  compliance_bypass: 'Compliance Bypass',
  inappropriate_use: 'Inappropriate Use',
  unknown: 'Other',
};

const EXCEPTION_COLORS: Record<string, string> = {
  pii_sharing: '#ef4444',
  policy_violation: '#f97316',
  data_export: '#eab308',
  compliance_bypass: '#8b5cf6',
  inappropriate_use: '#ec4899',
  unknown: '#6b7280',
};

const SKILL_COLORS = ['#10b981', '#3b82f6', '#8b5cf6'];

// ---------------------------------------------------------------------------
// Main reporting hook
// ---------------------------------------------------------------------------

export function useReporting(organizationId: string | null = null) {
  const [userProgress, setUserProgress] = useState<UserProgressRow[]>([]);
  const [promptStats, setPromptStats] = useState<PromptEventStats>({
    total_prompts: 0,
    total_exceptions: 0,
    by_session: {},
    by_exception_type: {},
  });
  const [loading, setLoading] = useState(true);

  const fetchReporting = useCallback(async () => {
    try {
      setLoading(true);

      let profilesQuery = supabase
        .from('user_profiles')
        .select('user_id, display_name, job_role, department, ai_proficiency_level')
        .eq('onboarding_completed', true);

      if (organizationId) {
        profilesQuery = profilesQuery.eq('organization_id', organizationId);
      }

      const { data: profiles } = await profilesQuery;

      const { data: progressData } = await supabase
        .from('training_progress')
        .select('user_id, session_1_completed, session_2_completed, session_3_completed, session_4_completed, session_5_completed');

      type ProgressRow = NonNullable<typeof progressData>[number];
      const progressMap = new Map<string, ProgressRow>();
      (progressData || []).forEach((p) => {
        progressMap.set(p.user_id, p);
      });

      const profileUserIds = new Set((profiles || []).map((p) => p.user_id));

      const combined: UserProgressRow[] = (profiles || []).map((profile) => {
        const prog = progressMap.get(profile.user_id);
        return {
          user_id: profile.user_id,
          display_name: profile.display_name,
          job_role: profile.job_role,
          department: profile.department,
          ai_proficiency_level: profile.ai_proficiency_level,
          session_1_completed: prog?.session_1_completed || false,
          session_2_completed: prog?.session_2_completed || false,
          session_3_completed: prog?.session_3_completed || false,
          session_4_completed: prog?.session_4_completed || false,
          session_5_completed: prog?.session_5_completed || false,
        };
      });
      setUserProgress(combined);

      // Filter at the DB level when org-scoped to avoid fetching all rows.
      // Use a dummy ID when the set is empty so we don't inadvertently return all rows.
      let eventsQuery = supabase
        .from('prompt_events')
        .select('event_type, session_id, exception_flag, exception_type, user_id');

      if (organizationId && profileUserIds.size > 0) {
        eventsQuery = eventsQuery.in('user_id', Array.from(profileUserIds));
      } else if (organizationId && profileUserIds.size === 0) {
        eventsQuery = eventsQuery.in('user_id', ['00000000-0000-0000-0000-000000000000']);
      }

      const { data: events } = await eventsQuery;
      const filteredEvents = events || [];

      if (filteredEvents.length > 0) {
        const total_prompts = filteredEvents.filter((e) => e.event_type === 'prompt_submitted').length;
        const total_exceptions = filteredEvents.filter((e) => e.exception_flag).length;
        const by_session: Record<number, number> = {};
        const by_exception_type: Record<string, number> = {};

        filteredEvents.forEach((e) => {
          if (e.session_id) by_session[e.session_id] = (by_session[e.session_id] || 0) + 1;
          if (e.exception_flag && e.exception_type) {
            by_exception_type[e.exception_type] = (by_exception_type[e.exception_type] || 0) + 1;
          }
        });

        setPromptStats({ total_prompts, total_exceptions, by_session, by_exception_type });
      } else {
        setPromptStats({ total_prompts: 0, total_exceptions: 0, by_session: {}, by_exception_type: {} });
      }
    } catch (err) {
      console.error('Error fetching reporting data:', err);
    } finally {
      setLoading(false);
    }
  }, [organizationId]);

  useEffect(() => { fetchReporting(); }, [fetchReporting]);
  return { userProgress, promptStats, loading, refetch: fetchReporting };
}

// ---------------------------------------------------------------------------
// C-Suite KPI hook
// ---------------------------------------------------------------------------

export function useCSuiteKPIs(organizationId: string | null = null): CSuiteKPIs {
  const [kpis, setKpis] = useState<CSuiteKPIs>({
    totalEnrolled: 0,
    enrollmentRate: 0,
    funnelData: [],
    activeUsers7d: 0,
    activeUsers30d: 0,
    skillDistribution: [],
    departmentBreakdowns: [],
    avgProficiency: 0,
    fullyCompleted: 0,
    completionRate: 0,
    totalExceptions: 0,
    exceptionRate: 0,
    exceptionTrend: [],
    exceptionsByDept: [],
    exceptionTypes: [],
    repeatOffenders: [],
    totalIdeas: 0,
    ideasByStatus: {},
    topIdeas: [],
    ideasByDepartment: {},
    loading: true,
  });

  const fetchKPIs = useCallback(async () => {
    try {
      // Build queries with optional org filter
      let allProfilesQuery = supabase.from('user_profiles').select('user_id');
      let enrolledProfilesQuery = supabase
        .from('user_profiles')
        .select('user_id, display_name, job_role, department, ai_proficiency_level')
        .eq('onboarding_completed', true);

      if (organizationId) {
        allProfilesQuery = allProfilesQuery.eq('organization_id', organizationId);
        enrolledProfilesQuery = enrolledProfilesQuery.eq('organization_id', organizationId);
      }

      // Fetch profiles first so we have user ID sets for server-side filtering below
      const [
        { data: allProfiles },
        { data: enrolledProfiles },
      ] = await Promise.all([
        allProfilesQuery,
        enrolledProfilesQuery,
      ]);

      const profiles = enrolledProfiles || [];
      const allOrgUserIds = new Set((allProfiles || []).map((p) => p.user_id));

      // Build server-side prompt_events query — filter at DB level when org-scoped
      // to avoid fetching all rows and relying solely on client-side JS filtering.
      const allOrgUserIdList = Array.from(allOrgUserIds);
      const safeOrgIds = allOrgUserIdList.length > 0
        ? allOrgUserIdList
        : ['00000000-0000-0000-0000-000000000000'];

      let promptEventsQuery = supabase
        .from('prompt_events')
        .select('user_id, session_id, event_type, exception_flag, exception_type, created_at');
      if (organizationId) {
        promptEventsQuery = promptEventsQuery.in('user_id', safeOrgIds);
      }

      // Fetch remaining data in parallel now that we have the org filter
      let ideasQuery = supabase
        .from('user_ideas')
        .select('*')
        .eq('category', 'csuite_submission')
        .order('votes', { ascending: false });
      if (organizationId) {
        ideasQuery = ideasQuery.in('user_id', safeOrgIds);
      }

      const [
        { data: progressData },
        { data: promptEvents },
        { data: ideasData },
      ] = await Promise.all([
        (supabase
          .from('training_progress')
          .select('user_id, session_1_completed, session_2_completed, session_3_completed, session_4_completed, session_5_completed')),
        promptEventsQuery,
        ideasQuery,
      ]);

      const progress = progressData || [];
      // Deduplicate ideas by ID to prevent duplicates from join multiplicity
      const ideasRaw: IdeaItem[] = (ideasData || []) as IdeaItem[];
      const seenIds = new Set<string>();
      const ideas: IdeaItem[] = ideasRaw.filter(idea => {
        if (seenIds.has(idea.id)) return false;
        seenIds.add(idea.id);
        return true;
      });

      // Build a set of enrolled user IDs for local lookups (department breakdown, etc.)
      const orgUserIds = new Set(profiles.map((p) => p.user_id));

      // Events are already org-filtered by the DB query above
      const events = promptEvents || [];

      // ── Section A: Progress & Skill ────────────────────────────────────
      const totalAllUsers = (allProfiles || []).length;
      const totalEnrolled = profiles.length;
      const enrollmentRate = totalAllUsers > 0 ? Math.round((totalEnrolled / totalAllUsers) * 100) : 0;

      type ProgressRow2 = (typeof progress)[number];
      const progressMap = new Map<string, ProgressRow2>();
      progress.forEach((p) => progressMap.set(p.user_id, p));

      const combined = profiles.map((profile) => {
        const prog = progressMap.get(profile.user_id);
        return {
          ...profile,
          session_1_completed: prog?.session_1_completed || false,
          session_2_completed: prog?.session_2_completed || false,
          session_3_completed: prog?.session_3_completed || false,
          session_4_completed: prog?.session_4_completed || false,
          session_5_completed: prog?.session_5_completed || false,
        };
      });

      const s1Count = combined.filter((u) => u.session_1_completed).length;
      const s2Count = combined.filter((u) => u.session_2_completed).length;
      const s3Count = combined.filter((u) => u.session_3_completed).length;
      const s4Count = combined.filter((u) => u.session_4_completed).length;
      const s5Count = combined.filter((u) => u.session_5_completed).length;
      const fullyCompleted = combined.filter((u) => u.session_1_completed && u.session_2_completed && u.session_3_completed && u.session_4_completed && u.session_5_completed).length;
      const completionRate = totalEnrolled > 0 ? Math.round((fullyCompleted / totalEnrolled) * 100) : 0;

      const funnelData: SessionFunnelItem[] = [
        { session: 'S1', label: 'Session 1: Foundation', completed: s1Count, total: totalEnrolled, rate: totalEnrolled > 0 ? Math.round((s1Count / totalEnrolled) * 100) : 0 },
        { session: 'S2', label: 'Session 2: Structured Interaction', completed: s2Count, total: totalEnrolled, rate: totalEnrolled > 0 ? Math.round((s2Count / totalEnrolled) * 100) : 0 },
        { session: 'S3', label: 'Session 3: Agents', completed: s3Count, total: totalEnrolled, rate: totalEnrolled > 0 ? Math.round((s3Count / totalEnrolled) * 100) : 0 },
        { session: 'S4', label: 'Session 4: AI in Your Everyday Tools', completed: s4Count, total: totalEnrolled, rate: totalEnrolled > 0 ? Math.round((s4Count / totalEnrolled) * 100) : 0 },
        { session: 'S5', label: 'Session 5: Designing Your AI Workflow', completed: s5Count, total: totalEnrolled, rate: totalEnrolled > 0 ? Math.round((s5Count / totalEnrolled) * 100) : 0 },
      ];

      // Active users
      const now = new Date();
      const day7 = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const day30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const activeSet7d = new Set(events.filter((e) => new Date(e.created_at) >= day7).map((e) => e.user_id));
      const activeSet30d = new Set(events.filter((e) => new Date(e.created_at) >= day30).map((e) => e.user_id));

      // Skill distribution
      const skillBuckets: Record<string, number> = { 'Beginner (0-2)': 0, 'Intermediate (3-5)': 0, 'Advanced (6-8)': 0 };
      let proficiencySum = 0;
      combined.forEach((u) => {
        const level = u.ai_proficiency_level ?? 0;
        proficiencySum += level;
        if (level <= 2) skillBuckets['Beginner (0-2)']++;
        else if (level <= 5) skillBuckets['Intermediate (3-5)']++;
        else skillBuckets['Advanced (6-8)']++;
      });
      const avgProficiency = totalEnrolled > 0 ? Math.round((proficiencySum / totalEnrolled) * 10) / 10 : 0;
      const skillDistribution: SkillDistItem[] = Object.entries(skillBuckets).map(([name, value], i) => ({
        name,
        value,
        color: SKILL_COLORS[i],
      }));

      // Department breakdowns
      const deptMap: Record<string, typeof combined> = {};
      combined.forEach((u) => {
        const dept = u.department || 'unknown';
        if (!deptMap[dept]) deptMap[dept] = [];
        deptMap[dept].push(u);
      });
      const departmentBreakdowns: DepartmentBreakdown[] = Object.entries(deptMap).map(([dept, users]) => {
        const profSum = users.reduce((s: number, u) => s + (u.ai_proficiency_level ?? 0), 0);
        return {
          department: dept,
          label: LOB_LABELS[dept] || dept,
          total: users.length,
          s1: users.filter((u) => u.session_1_completed).length,
          s2: users.filter((u) => u.session_2_completed).length,
          s3: users.filter((u) => u.session_3_completed).length,
          s4: users.filter((u) => u.session_4_completed).length,
          s5: users.filter((u) => u.session_5_completed).length,
          avgProficiency: users.length > 0 ? Math.round((profSum / users.length) * 10) / 10 : 0,
        };
      });

      // ── Section B: Compliance Exceptions ────────────────────────────────
      const totalPrompts = events.filter((e) => e.event_type === 'prompt_submitted').length;
      const exceptionEvents = events.filter((e) => e.exception_flag);
      const totalExceptions = exceptionEvents.length;
      const exceptionRate = totalPrompts > 0 ? Math.round((totalExceptions / totalPrompts) * 1000) / 10 : 0;

      // Exception trend (last 30 days)
      const trendMap: Record<string, { exceptions: number; prompts: number }> = {};
      const trendStart = new Date(now.getTime() - 29 * 24 * 60 * 60 * 1000);
      events.forEach((e) => {
        const date = new Date(e.created_at);
        if (date < trendStart) return;
        const key = date.toISOString().slice(0, 10);
        if (!trendMap[key]) trendMap[key] = { exceptions: 0, prompts: 0 };
        if (e.event_type === 'prompt_submitted') trendMap[key].prompts++;
        if (e.exception_flag) trendMap[key].exceptions++;
      });
      const exceptionTrend: ExceptionTrendItem[] = [];
      for (let i = 29; i >= 0; i--) {
        const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        const key = d.toISOString().slice(0, 10);
        exceptionTrend.push({
          date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          exceptions: trendMap[key]?.exceptions || 0,
          prompts: trendMap[key]?.prompts || 0,
        });
      }

      // Exceptions by department
      const userDeptMap = new Map<string, string>();
      combined.forEach((u) => userDeptMap.set(u.user_id, u.department || 'unknown'));
      const deptExceptions: Record<string, number> = {};
      exceptionEvents.forEach((e) => {
        const dept = userDeptMap.get(e.user_id) || 'unknown';
        const label = LOB_LABELS[dept] || dept;
        deptExceptions[label] = (deptExceptions[label] || 0) + 1;
      });
      const exceptionsByDept: ExceptionByDept[] = Object.entries(deptExceptions)
        .map(([department, count]) => ({ department, count }))
        .sort((a, b) => b.count - a.count);

      // Exception types
      const typeMap: Record<string, number> = {};
      exceptionEvents.forEach((e) => {
        const t = e.exception_type || 'unknown';
        typeMap[t] = (typeMap[t] || 0) + 1;
      });
      const exceptionTypes: ExceptionTypeItem[] = Object.entries(typeMap)
        .map(([type, count]) => ({
          type,
          label: EXCEPTION_TYPE_LABELS[type] || type,
          count,
          color: EXCEPTION_COLORS[type] || '#6b7280',
        }))
        .sort((a, b) => b.count - a.count);

      // Repeat offenders (2+ exceptions)
      const userExceptionCounts: Record<string, number> = {};
      exceptionEvents.forEach((e) => {
        userExceptionCounts[e.user_id] = (userExceptionCounts[e.user_id] || 0) + 1;
      });
      const repeatOffenders: RepeatOffender[] = Object.entries(userExceptionCounts)
        .filter(([, count]) => count >= 2)
        .map(([user_id, exception_count]) => {
          const profile = combined.find((u) => u.user_id === user_id);
          return {
            user_id,
            display_name: profile?.display_name || null,
            department: profile?.department || null,
            exception_count,
          };
        })
        .sort((a, b) => b.exception_count - a.exception_count)
        .slice(0, 10);

      // ── Section C: Innovation Pipeline ──────────────────────────────────
      const ideasByStatus: Record<string, number> = {};
      const ideasByDepartment: Record<string, number> = {};
      ideas.forEach((idea) => {
        const s = idea.status || 'not_started';
        ideasByStatus[s] = (ideasByStatus[s] || 0) + 1;
        if (idea.submitter_department) {
          const label = LOB_LABELS[idea.submitter_department] || idea.submitter_department;
          ideasByDepartment[label] = (ideasByDepartment[label] || 0) + 1;
        }
      });
      const topIdeas = ideas.slice(0, 10);

      setKpis({
        totalEnrolled,
        enrollmentRate,
        funnelData,
        activeUsers7d: activeSet7d.size,
        activeUsers30d: activeSet30d.size,
        skillDistribution,
        departmentBreakdowns,
        avgProficiency,
        fullyCompleted,
        completionRate,
        totalExceptions,
        exceptionRate,
        exceptionTrend,
        exceptionsByDept,
        exceptionTypes,
        repeatOffenders,
        totalIdeas: ideas.length,
        ideasByStatus,
        topIdeas,
        ideasByDepartment,
        loading: false,
      });
    } catch (err) {
      console.error('Error fetching C-suite KPIs:', err);
      setKpis((prev) => ({ ...prev, loading: false }));
    }
  }, [organizationId]);

  useEffect(() => { fetchKPIs(); }, [fetchKPIs]);
  return kpis;
}

// ---------------------------------------------------------------------------
// Ideas hook (existing, enhanced with ROI)
// ---------------------------------------------------------------------------

export function useAllIdeas(organizationId?: string | null) {
  const [ideas, setIdeas] = useState<Tables<'user_ideas'>[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchIdeas = useCallback(async () => {
    try {
      setLoading(true);

      // If org-scoped, first get user_ids in that org, then filter ideas
      let orgUserIds: Set<string> | null = null;
      if (organizationId) {
        const { data: profiles } = await supabase
          .from('user_profiles')
          .select('user_id')
          .eq('organization_id', organizationId);
        orgUserIds = new Set((profiles || []).map((p) => p.user_id));
      }

      const { data, error } = await supabase
        .from('user_ideas')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;

      const filtered = orgUserIds
        ? (data || []).filter((idea) => orgUserIds!.has(idea.user_id))
        : (data || []);
      setIdeas(filtered);
    } catch (err) {
      console.error('Error fetching all ideas:', err);
    } finally {
      setLoading(false);
    }
  }, [organizationId]);

  const updateIdeaStatus = async (id: string, status: string) => {
    try {
      const { error } = await (supabase
        .from('user_ideas')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id));
      if (error) throw error;
      await fetchIdeas();
      return { success: true };
    } catch (err) {
      console.error('Error updating idea status:', err);
      return { success: false, error: 'Failed to update idea' };
    }
  };

  const updateIdeaROI = async (id: string, roi_impact: string) => {
    try {
      const { error } = await (supabase
        .from('user_ideas')
        .update({ roi_impact, updated_at: new Date().toISOString() })
        .eq('id', id));
      if (error) throw error;
      await fetchIdeas();
      return { success: true };
    } catch (err) {
      console.error('Error updating idea ROI:', err);
      return { success: false, error: 'Failed to update ROI' };
    }
  };

  useEffect(() => { fetchIdeas(); }, [fetchIdeas]);
  return { ideas, loading, updateIdeaStatus, updateIdeaROI, refetch: fetchIdeas };
}
