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

// Weight each engagement state for progress calculation
const STATE_WEIGHTS: Record<ModuleState, number> = {
  not_started: 0,
  content_viewed: 0.2,
  practicing: 0.5,
  submitted: 0.8,
  completed: 1.0,
};

// Compute per-session progress as a percentage (0-100).
// Uses weighted engagement states so users see incremental progress.
export function computeSessionProgress(
  sessionId: number,
  progressData: SessionProgressData | null | undefined
): number {
  const session = ALL_SESSION_CONTENT[sessionId];
  if (!session) return 0;

  const moduleCount = session.modules.length;
  if (moduleCount === 0) return 0;

  const counts = getSessionModuleCounts(sessionId, progressData);
  let weightedSum = 0;
  for (const [state, count] of Object.entries(counts)) {
    weightedSum += count * STATE_WEIGHTS[state as ModuleState];
  }
  return Math.round((weightedSum / moduleCount) * 100);
}

// Compute overall progress across all sessions, weighted by module count.
// Gracefully handles Session 4 even before DB columns exist.
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

  // Build session list dynamically — Session 4 columns may not exist in DB yet
  const prog = progress as Record<string, unknown>;
  const sessionIds = Object.keys(ALL_SESSION_CONTENT).map(Number).filter(id => id > 0);

  let totalModules = 0;
  let totalWeightedProgress = 0;

  for (const id of sessionIds) {
    const session = ALL_SESSION_CONTENT[id];
    if (!session) continue;
    const moduleCount = session.modules.length;
    totalModules += moduleCount;

    const completed = !!prog[`session_${id}_completed`];
    const data = (prog[`session_${id}_progress`] as SessionProgressData) || null;

    if (completed) {
      totalWeightedProgress += moduleCount; // 100% for completed sessions
    } else {
      const sessionPct = computeSessionProgress(id, data) / 100;
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
