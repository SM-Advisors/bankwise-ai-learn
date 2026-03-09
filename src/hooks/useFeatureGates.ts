import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { LEARNER_ZONES, type UnlockCondition, type Zone } from '@/config/zones';
import type { SessionProgressData } from '@/types/progress';
import { supabase } from '@/integrations/supabase/client';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function hasStartedPractice(progressData: SessionProgressData | null | undefined): boolean {
  if (!progressData?.moduleEngagement) return false;
  return Object.values(progressData.moduleEngagement).some(
    (engagement) => engagement.chatStarted === true
  );
}

function hasCompletedModule(
  progressData: SessionProgressData | null | undefined,
  moduleId: string
): boolean {
  return progressData?.completedModules?.includes(moduleId) ?? false;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * useFeatureGates
 *
 * Single source of truth for progressive disclosure.
 * Reads from useAuth() for profile/progress checks, plus a lightweight
 * head-only count query for the deployed-agent gate.
 *
 * Zones are ABSENT from the UI until their condition is met (not disabled).
 */
export function useFeatureGates() {
  const { user, profile, progress } = useAuth();

  const session1Progress = progress?.session_1_progress as SessionProgressData | null;

  // Check whether the user has at least one deployed agent (lightweight head-only count)
  const [hasDeployedAgent, setHasDeployedAgent] = useState(false);
  useEffect(() => {
    if (!user?.id) return;
    supabase
      .from('user_agents')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('is_deployed', true)
      .then(({ count }) => setHasDeployedAgent((count ?? 0) > 0));
  }, [user?.id]);

  function isUnlocked(condition: UnlockCondition): boolean {
    switch (condition) {
      case 'always':
        return true;

      case 'onboarding_completed':
        return profile?.onboarding_completed ?? false;

      case 'session_1_basic_interaction_done':
        // Module 1-3 is Basic Interaction — gates Explore zone
        return hasCompletedModule(session1Progress, '1-3');

      case 'first_practice_done':
        // Any practice chat started in session 1 — gates Community zone
        return hasStartedPractice(session1Progress);

      case 'session_1_completed':
        return progress?.session_1_completed ?? false;

      case 'session_3_agent_deployed':
        return hasDeployedAgent;

      default:
        return false;
    }
  }

  // Filtered zone list — only zones the user has earned access to
  const unlockedZones: Zone[] = LEARNER_ZONES.filter((zone) =>
    isUnlocked(zone.unlockedBy)
  );

  return {
    isUnlocked,
    unlockedZones,
    // Named helpers for common checks
    canAccessLearn: isUnlocked('onboarding_completed'),
    canAccessExplore: isUnlocked('session_1_basic_interaction_done'),
    canAccessCommunity: isUnlocked('first_practice_done'),
    canAccessProfile: isUnlocked('onboarding_completed'),
  };
}
