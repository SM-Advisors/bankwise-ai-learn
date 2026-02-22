import { ALL_SESSION_CONTENT } from '@/data/trainingContent';
import type { ModuleEngagement, ModuleState, SessionProgressData } from '@/types/progress';

// Determine the engagement state of a single module
export function getModuleState(engagement?: ModuleEngagement): ModuleState {
  if (!engagement) return 'not_started';
  if (engagement.completed) return 'completed';
  if (engagement.submitted) return 'submitted';
  if (engagement.chatStarted) return 'practicing';
  if (engagement.contentViewed) return 'content_viewed';
  return 'not_started';
}

// Weight each state contributes toward session progress
const STATE_WEIGHTS: Record<ModuleState, number> = {
  not_started: 0,
  content_viewed: 0.2,
  practicing: 0.5,
  submitted: 0.8,
  completed: 1.0,
};

// Compute per-session progress as a percentage (0-100)
export function computeSessionProgress(
  sessionId: number,
  progressData: SessionProgressData | null | undefined
): number {
  const session = ALL_SESSION_CONTENT[sessionId];
  if (!session) return 0;

  const moduleCount = session.modules.length;
  if (moduleCount === 0) return 0;

  const engagement = progressData?.moduleEngagement || {};

  // Also check the legacy completedModules array for backward compat
  const legacyCompleted = new Set(progressData?.completedModules || []);

  let totalWeight = 0;
  for (const mod of session.modules) {
    const eng = engagement[mod.id];
    if (eng) {
      totalWeight += STATE_WEIGHTS[getModuleState(eng)];
    } else if (legacyCompleted.has(mod.id)) {
      // Module was completed before engagement tracking existed
      totalWeight += STATE_WEIGHTS.completed;
    }
  }

  return Math.round((totalWeight / moduleCount) * 100);
}

// Compute overall progress across all 3 sessions, weighted by module count
export function computeOverallProgress(
  progress: {
    session_1_completed: boolean;
    session_1_progress: SessionProgressData | Record<string, unknown>;
    session_2_completed: boolean;
    session_2_progress: SessionProgressData | Record<string, unknown>;
    session_3_completed: boolean;
    session_3_progress: SessionProgressData | Record<string, unknown>;
  } | null
): number {
  if (!progress) return 0;

  const sessions = [
    { id: 1, data: progress.session_1_progress as SessionProgressData, completed: progress.session_1_completed },
    { id: 2, data: progress.session_2_progress as SessionProgressData, completed: progress.session_2_completed },
    { id: 3, data: progress.session_3_progress as SessionProgressData, completed: progress.session_3_completed },
  ];

  let totalModules = 0;
  let totalWeightedProgress = 0;

  for (const s of sessions) {
    const session = ALL_SESSION_CONTENT[s.id];
    if (!session) continue;
    const moduleCount = session.modules.length;
    totalModules += moduleCount;

    if (s.completed) {
      totalWeightedProgress += moduleCount; // 100% for completed sessions
    } else {
      const sessionPct = computeSessionProgress(s.id, s.data) / 100;
      totalWeightedProgress += moduleCount * sessionPct;
    }
  }

  if (totalModules === 0) return 0;
  return Math.round((totalWeightedProgress / totalModules) * 100);
}

// Get module counts per engagement state for a session
export function getSessionModuleCounts(
  sessionId: number,
  progressData: SessionProgressData | null | undefined
): Record<ModuleState, number> {
  const counts: Record<ModuleState, number> = {
    not_started: 0,
    content_viewed: 0,
    practicing: 0,
    submitted: 0,
    completed: 0,
  };

  const session = ALL_SESSION_CONTENT[sessionId];
  if (!session) return counts;

  const engagement = progressData?.moduleEngagement || {};
  const legacyCompleted = new Set(progressData?.completedModules || []);

  for (const mod of session.modules) {
    const eng = engagement[mod.id];
    if (eng) {
      counts[getModuleState(eng)]++;
    } else if (legacyCompleted.has(mod.id)) {
      counts.completed++;
    } else {
      counts.not_started++;
    }
  }

  return counts;
}

// Get the number of fully completed modules in a session
export function getCompletedModuleCount(
  sessionId: number,
  progressData: SessionProgressData | null | undefined
): number {
  const counts = getSessionModuleCounts(sessionId, progressData);
  return counts.completed;
}

// Get total module count for a session
export function getSessionModuleTotal(sessionId: number): number {
  const session = ALL_SESSION_CONTENT[sessionId];
  return session?.modules.length || 0;
}

// Get a list of module states for rendering dots/indicators
export function getModuleStates(
  sessionId: number,
  progressData: SessionProgressData | null | undefined
): { moduleId: string; title: string; state: ModuleState }[] {
  const session = ALL_SESSION_CONTENT[sessionId];
  if (!session) return [];

  const engagement = progressData?.moduleEngagement || {};
  const legacyCompleted = new Set(progressData?.completedModules || []);

  return session.modules.map((mod) => {
    const eng = engagement[mod.id];
    let state: ModuleState;

    if (eng) {
      state = getModuleState(eng);
    } else if (legacyCompleted.has(mod.id)) {
      state = 'completed';
    } else {
      state = 'not_started';
    }

    return { moduleId: mod.id, title: mod.title, state };
  });
}
