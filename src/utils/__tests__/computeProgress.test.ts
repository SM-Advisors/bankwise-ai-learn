import { describe, expect, it, vi } from 'vitest';
import {
  getModuleState,
  computeSessionProgress,
  computeOverallProgress,
  getSessionModuleCounts,
  getModuleStates,
} from '../computeProgress';
import type { ModuleEngagement, SessionProgressData } from '@/types/progress';

// ── Mock trainingContent ──────────────────────────────────────────────────────
// Session 1 has 3 modules; session 2 has 2 modules. Session 99 doesn't exist.
vi.mock('@/data/trainingContent', () => ({
  ALL_SESSION_CONTENT: {
    1: {
      modules: [
        { id: '1-1', title: 'Mod A', type: 'document' },
        { id: '1-2', title: 'Mod B', type: 'exercise' },
        { id: '1-3', title: 'Mod C', type: 'exercise' },
      ],
    },
    2: {
      modules: [
        { id: '2-1', title: 'Mod D', type: 'document' },
        { id: '2-2', title: 'Mod E', type: 'exercise' },
      ],
    },
  },
}));

// ── Helpers ──────────────────────────────────────────────────────────────────
const eng = (overrides: Partial<ModuleEngagement> = {}): ModuleEngagement => ({
  contentViewed: false,
  chatStarted: false,
  submitted: false,
  completed: false,
  ...overrides,
});

// ── getModuleState ────────────────────────────────────────────────────────────

describe('getModuleState', () => {
  it('returns not_started when engagement is undefined', () => {
    expect(getModuleState(undefined)).toBe('not_started');
  });

  it('returns not_started for default engagement', () => {
    expect(getModuleState(eng())).toBe('not_started');
  });

  it('returns content_viewed when only contentViewed is true', () => {
    expect(getModuleState(eng({ contentViewed: true }))).toBe('content_viewed');
  });

  it('returns practicing when chatStarted is true', () => {
    expect(getModuleState(eng({ contentViewed: true, chatStarted: true }))).toBe('practicing');
  });

  it('returns submitted when submitted is true', () => {
    expect(getModuleState(eng({ submitted: true, chatStarted: true }))).toBe('submitted');
  });

  it('returns completed when completed is true (highest priority)', () => {
    expect(getModuleState(eng({ completed: true, submitted: true, chatStarted: true }))).toBe('completed');
  });

  it('completed takes priority over submitted', () => {
    expect(getModuleState(eng({ completed: true, submitted: false }))).toBe('completed');
  });

  it('submitted takes priority over practicing', () => {
    expect(getModuleState(eng({ submitted: true, chatStarted: true }))).toBe('submitted');
  });
});

// ── computeSessionProgress ────────────────────────────────────────────────────

describe('computeSessionProgress', () => {
  it('returns 0 for unknown session ID', () => {
    expect(computeSessionProgress(99, null)).toBe(0);
  });

  it('returns 0 for null progress data', () => {
    expect(computeSessionProgress(1, null)).toBe(0);
  });

  it('returns 0 when all modules are not_started', () => {
    const data: SessionProgressData = { completedModules: [], moduleEngagement: {} };
    expect(computeSessionProgress(1, data)).toBe(0);
  });

  it('returns 100 when all modules are completed', () => {
    const data: SessionProgressData = {
      completedModules: [],
      moduleEngagement: {
        '1-1': eng({ completed: true }),
        '1-2': eng({ completed: true }),
        '1-3': eng({ completed: true }),
      },
    };
    expect(computeSessionProgress(1, data)).toBe(100);
  });

  it('returns 100 via legacy completedModules array', () => {
    const data: SessionProgressData = {
      completedModules: ['1-1', '1-2', '1-3'],
      moduleEngagement: {},
    };
    expect(computeSessionProgress(1, data)).toBe(100);
  });

  it('weights practicing at 50% per module', () => {
    // 1 of 2 modules practicing (0.5 weight), rest not_started → 0.5/2 = 25%
    const data: SessionProgressData = {
      completedModules: [],
      moduleEngagement: {
        '2-1': eng({ chatStarted: true }),
      },
    };
    expect(computeSessionProgress(2, data)).toBe(25);
  });

  it('weights content_viewed at 20%, submitted at 80%, completed at 100%', () => {
    // session 1, 3 modules: content_viewed + submitted + completed = (0.2 + 0.8 + 1.0)/3 = 2.0/3 ≈ 67%
    const data: SessionProgressData = {
      completedModules: [],
      moduleEngagement: {
        '1-1': eng({ contentViewed: true }),
        '1-2': eng({ submitted: true }),
        '1-3': eng({ completed: true }),
      },
    };
    expect(computeSessionProgress(1, data)).toBe(67);
  });

  it('uses engagement over legacy completedModules for the same module', () => {
    // Module 1-1 in legacy list but engagement says only content_viewed (20%)
    const data: SessionProgressData = {
      completedModules: ['1-1'],
      moduleEngagement: {
        '1-1': eng({ contentViewed: true }),
      },
    };
    // 1-1: content_viewed (0.2), 1-2: not_started (0), 1-3: not_started (0) → 0.2/3 ≈ 7%
    expect(computeSessionProgress(1, data)).toBe(7);
  });
});

// ── computeOverallProgress ───────────────────────────────────────────────────

describe('computeOverallProgress', () => {
  const baseProgress = {
    session_1_completed: false,
    session_1_progress: {} as SessionProgressData,
    session_2_completed: false,
    session_2_progress: {} as SessionProgressData,
    session_3_completed: false,
    session_3_progress: {} as SessionProgressData,
  };

  it('returns 0 for null progress', () => {
    expect(computeOverallProgress(null)).toBe(0);
  });

  it('returns 0 when all sessions have no activity', () => {
    expect(computeOverallProgress(baseProgress)).toBe(0);
  });

  it('returns 100 when all sessions are marked completed', () => {
    const result = computeOverallProgress({
      ...baseProgress,
      session_1_completed: true,
      session_2_completed: true,
    });
    expect(result).toBe(100);
  });

  it('returns partial progress based on weighted module counts', () => {
    // Session 1 (3 modules): all completed → weight 3
    // Session 2 (2 modules): none started → weight 0
    // Total modules: 5, weighted: 3/5 = 60%
    const result = computeOverallProgress({
      ...baseProgress,
      session_1_completed: true,
    });
    expect(result).toBe(60);
  });

  it('handles mix of completed sessions and in-progress sessions', () => {
    // Session 1 completed (3 modules), session 2 one module practicing (0.5/2 = 25%)
    // Total: (3 + 2*0.25) / 5 = 3.5/5 = 70%
    const result = computeOverallProgress({
      ...baseProgress,
      session_1_completed: true,
      session_2_progress: {
        completedModules: [],
        moduleEngagement: { '2-1': eng({ chatStarted: true }) },
      },
    });
    expect(result).toBe(70);
  });
});

// ── getSessionModuleCounts ───────────────────────────────────────────────────

describe('getSessionModuleCounts', () => {
  it('returns all zeros for unknown session', () => {
    const counts = getSessionModuleCounts(99, null);
    expect(counts.not_started).toBe(0);
    expect(counts.completed).toBe(0);
  });

  it('returns all not_started when no engagement data', () => {
    const counts = getSessionModuleCounts(1, null);
    expect(counts.not_started).toBe(3);
    expect(counts.completed).toBe(0);
  });

  it('correctly counts each state', () => {
    const data: SessionProgressData = {
      completedModules: [],
      moduleEngagement: {
        '1-1': eng({ contentViewed: true }),
        '1-2': eng({ chatStarted: true }),
        '1-3': eng({ completed: true }),
      },
    };
    const counts = getSessionModuleCounts(1, data);
    expect(counts.content_viewed).toBe(1);
    expect(counts.practicing).toBe(1);
    expect(counts.completed).toBe(1);
    expect(counts.not_started).toBe(0);
  });

  it('counts legacy completed modules', () => {
    const data: SessionProgressData = {
      completedModules: ['2-1', '2-2'],
      moduleEngagement: {},
    };
    const counts = getSessionModuleCounts(2, data);
    expect(counts.completed).toBe(2);
    expect(counts.not_started).toBe(0);
  });
});

// ── getModuleStates ──────────────────────────────────────────────────────────

describe('getModuleStates', () => {
  it('returns empty array for unknown session', () => {
    expect(getModuleStates(99, null)).toEqual([]);
  });

  it('returns one entry per module with correct moduleId and title', () => {
    const states = getModuleStates(1, null);
    expect(states).toHaveLength(3);
    expect(states[0].moduleId).toBe('1-1');
    expect(states[0].title).toBe('Mod A');
  });

  it('returns not_started for all modules when no progress', () => {
    const states = getModuleStates(1, null);
    expect(states.every(s => s.state === 'not_started')).toBe(true);
  });

  it('maps engagement states correctly', () => {
    const data: SessionProgressData = {
      completedModules: [],
      moduleEngagement: {
        '1-1': eng({ completed: true }),
        '1-2': eng({ chatStarted: true }),
      },
    };
    const states = getModuleStates(1, data);
    const byId = Object.fromEntries(states.map(s => [s.moduleId, s.state]));
    expect(byId['1-1']).toBe('completed');
    expect(byId['1-2']).toBe('practicing');
    expect(byId['1-3']).toBe('not_started');
  });

  it('falls back to completed state for legacy completedModules', () => {
    const data: SessionProgressData = {
      completedModules: ['1-3'],
      moduleEngagement: {},
    };
    const states = getModuleStates(1, data);
    const byId = Object.fromEntries(states.map(s => [s.moduleId, s.state]));
    expect(byId['1-3']).toBe('completed');
    expect(byId['1-1']).toBe('not_started');
  });
});
