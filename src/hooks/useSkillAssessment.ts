import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface SkillObservation {
  id: string;
  observed_skill: string;
  observed_level: 'emerging' | 'developing' | 'proficient' | 'advanced';
  evidence: string;
  module_id: string | null;
  session_number: number | null;
  created_at: string;
}

export interface LevelChangeRequest {
  id: string;
  current_level: string;
  proposed_level: string;
  rationale: string;
  evidence_summary: string;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  responded_at: string | null;
  created_at: string;
}

export function useSkillAssessment() {
  const { user } = useAuth();
  const [observations, setObservations] = useState<SkillObservation[]>([]);
  const [pendingRequest, setPendingRequest] = useState<LevelChangeRequest | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);

    const [obsResult, reqResult] = await Promise.all([
      (supabase
        .from('skill_observations')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(100)),
      (supabase
        .from('level_change_requests')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(1)),
    ]);

    if (obsResult.data) setObservations(obsResult.data);
    if (reqResult.data?.length) setPendingRequest(reqResult.data[0]);
    setLoading(false);
  }, [user?.id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const respondToLevelChange = async (id: string, accept: boolean) => {
    const { error } = await (supabase
      .from('level_change_requests')
      .update({
        status: accept ? 'accepted' : 'declined',
        responded_at: new Date().toISOString(),
      })
      .eq('id', id));

    if (!error) {
      setPendingRequest(null);
    }
    return { success: !error, error: error?.message };
  };

  // Aggregate: highest level per skill across all observations
  const skillSummary = (() => {
    const LEVEL_PRIORITY: Record<string, number> = {
      advanced: 4,
      proficient: 3,
      developing: 2,
      emerging: 1,
    };
    const best = new Map<string, SkillObservation['observed_level']>();
    for (const obs of observations) {
      const current = best.get(obs.observed_skill);
      if (!current || (LEVEL_PRIORITY[obs.observed_level] ?? 0) > (LEVEL_PRIORITY[current] ?? 0)) {
        best.set(obs.observed_skill, obs.observed_level);
      }
    }
    return Array.from(best.entries()).map(([skill, level]) => ({ skill, level }));
  })();

  return {
    observations,
    skillSummary,
    pendingRequest,
    loading,
    respondToLevelChange,
    refetch: fetchData,
  };
}
