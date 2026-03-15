/**
 * Module Progression End-to-End Tests
 *
 * Verifies that computeProgress functions work correctly with
 * REAL training content across all 5 sessions — not mocked data.
 */
import { describe, expect, it } from 'vitest';
import {
  getModuleState,
  computeSessionProgress,
  computeOverallProgress,
  getSessionModuleCounts,
  getModuleStates,
  getCompletedModuleCount,
  getSessionModuleTotal,
} from '../computeProgress';
import { ALL_SESSION_CONTENT } from '@/data/trainingContent';
import type { ModuleEngagement, SessionProgressData } from '@/types/progress';

// ── Helpers ─────────────────────────────────────────────────────────────────

const eng = (overrides: Partial<ModuleEngagement> = {}): ModuleEngagement => ({
  contentViewed: false,
  chatStarted: false,
  practiceMessageCount: 0,
  submitted: false,
  completed: false,
  ...overrides,
});

function allModulesCompleted(sessionId: number): SessionProgressData {
  const session = ALL_SESSION_CONTENT[sessionId];
  const moduleEngagement: Record<string, ModuleEngagement> = {};
  for (const mod of session.modules) {
    moduleEngagement[mod.id] = eng({ completed: true });
  }
  return { completedModules: [], moduleEngagement };
}

function partialProgress(
  sessionId: number,
  completedCount: number
): SessionProgressData {
  const session = ALL_SESSION_CONTENT[sessionId];
  const moduleEngagement: Record<string, ModuleEngagement> = {};
  session.modules.forEach((mod, i) => {
    if (i < completedCount) {
      moduleEngagement[mod.id] = eng({ completed: true });
    }
  });
  return { completedModules: [], moduleEngagement };
}

const sessionIds = Object.keys(ALL_SESSION_CONTENT).map(Number);

// ── Real content validation ─────────────────────────────────────────────────

describe('ALL_SESSION_CONTENT is loaded correctly', () => {
  it('has 5 sessions', () => {
    expect(sessionIds).toEqual([1, 2, 3, 4, 5]);
  });

  it.each(sessionIds)('session %i has 5-7 modules', (id) => {
    const count = ALL_SESSION_CONTENT[id].modules.length;
    expect(count).toBeGreaterThanOrEqual(5);
    expect(count).toBeLessThanOrEqual(7);
  });
});

// ── Session progress with real module counts ────────────────────────────────

describe('computeSessionProgress — real content', () => {
  it.each(sessionIds)('session %i: returns 0 for null progress', (id) => {
    expect(computeSessionProgress(id, null)).toBe(0);
  });

  it.each(sessionIds)('session %i: returns 100 when all modules completed', (id) => {
    expect(computeSessionProgress(id, allModulesCompleted(id))).toBe(100);
  });

  it('session 1: partial progress matches weighted calculation', () => {
    const modules = ALL_SESSION_CONTENT[1].modules;
    // First 3 modules: completed, practicing, content_viewed; rest not_started
    const data: SessionProgressData = {
      completedModules: [],
      moduleEngagement: {
        [modules[0].id]: eng({ completed: true }),
        [modules[1].id]: eng({ chatStarted: true }),
        [modules[2].id]: eng({ contentViewed: true }),
      },
    };
    const progress = computeSessionProgress(1, data);
    // (1.0 + 0.5 + 0.2) / 7 modules * 100 = 1.7/7*100 ≈ 24
    const expected = Math.round((1.0 + 0.5 + 0.2) / modules.length * 100);
    expect(progress).toBe(expected);
  });

  it('session 2: half modules completed gives ~50%', () => {
    const modules = ALL_SESSION_CONTENT[2].modules;
    const halfCount = Math.floor(modules.length / 2);
    const data = partialProgress(2, halfCount);
    const progress = computeSessionProgress(2, data);
    // Should be approximately half — check within a reasonable range
    const expected = Math.round((halfCount / modules.length) * 100);
    expect(progress).toBe(expected);
  });
});

// ── getSessionModuleCounts — real content ───────────────────────────────────

describe('getSessionModuleCounts — real content', () => {
  it.each(sessionIds)('session %i: all not_started with null progress', (id) => {
    const counts = getSessionModuleCounts(id, null);
    const total = ALL_SESSION_CONTENT[id].modules.length;
    expect(counts.not_started).toBe(total);
    expect(counts.completed).toBe(0);
  });

  it.each(sessionIds)('session %i: all completed when all modules done', (id) => {
    const counts = getSessionModuleCounts(id, allModulesCompleted(id));
    const total = ALL_SESSION_CONTENT[id].modules.length;
    expect(counts.completed).toBe(total);
    expect(counts.not_started).toBe(0);
  });

  it('counts sum to total module count', () => {
    for (const id of sessionIds) {
      const data = partialProgress(id, 2);
      const counts = getSessionModuleCounts(id, data);
      const total = Object.values(counts).reduce((a, b) => a + b, 0);
      expect(total).toBe(ALL_SESSION_CONTENT[id].modules.length);
    }
  });
});

// ── getModuleStates — real content ──────────────────────────────────────────

describe('getModuleStates — real content', () => {
  it.each(sessionIds)('session %i: returns one entry per module', (id) => {
    const states = getModuleStates(id, null);
    expect(states).toHaveLength(ALL_SESSION_CONTENT[id].modules.length);
  });

  it.each(sessionIds)('session %i: moduleIds match training content', (id) => {
    const states = getModuleStates(id, null);
    const contentIds = ALL_SESSION_CONTENT[id].modules.map((m) => m.id);
    expect(states.map((s) => s.moduleId)).toEqual(contentIds);
  });

  it('tracks progression through engagement states for session 1', () => {
    const modules = ALL_SESSION_CONTENT[1].modules;
    const data: SessionProgressData = {
      completedModules: [],
      moduleEngagement: {
        [modules[0].id]: eng({ completed: true }),
        [modules[1].id]: eng({ submitted: true }),
        [modules[2].id]: eng({ chatStarted: true }),
        [modules[3].id]: eng({ contentViewed: true }),
        // rest: not_started
      },
    };
    const states = getModuleStates(1, data);
    const byId = Object.fromEntries(states.map((s) => [s.moduleId, s.state]));

    expect(byId[modules[0].id]).toBe('completed');
    expect(byId[modules[1].id]).toBe('submitted');
    expect(byId[modules[2].id]).toBe('practicing');
    expect(byId[modules[3].id]).toBe('contentViewed' in byId ? 'content_viewed' : byId[modules[3].id]);
    expect(byId[modules[3].id]).toBe('content_viewed');
    expect(byId[modules[4].id]).toBe('not_started');
  });
});

// ── getCompletedModuleCount & getSessionModuleTotal ─────────────────────────

describe('getCompletedModuleCount — real content', () => {
  it.each(sessionIds)('session %i: returns 0 for no progress', (id) => {
    expect(getCompletedModuleCount(id, null)).toBe(0);
  });

  it.each(sessionIds)('session %i: returns total when all completed', (id) => {
    const total = ALL_SESSION_CONTENT[id].modules.length;
    expect(getCompletedModuleCount(id, allModulesCompleted(id))).toBe(total);
  });

  it('partial completion returns correct count', () => {
    const data = partialProgress(1, 3);
    expect(getCompletedModuleCount(1, data)).toBe(3);
  });
});

describe('getSessionModuleTotal — real content', () => {
  it.each(sessionIds)('session %i: matches module array length', (id) => {
    expect(getSessionModuleTotal(id)).toBe(ALL_SESSION_CONTENT[id].modules.length);
  });

  it('returns 0 for nonexistent session', () => {
    expect(getSessionModuleTotal(99)).toBe(0);
  });
});

// ── Overall progress across all sessions ────────────────────────────────────

describe('computeOverallProgress — real content', () => {
  const totalModules = sessionIds.reduce(
    (sum, id) => sum + ALL_SESSION_CONTENT[id].modules.length,
    0
  );

  it('returns 0 for null', () => {
    expect(computeOverallProgress(null)).toBe(0);
  });

  it('returns 0 when all sessions have no activity', () => {
    const progress: Record<string, unknown> = {};
    for (const id of sessionIds) {
      progress[`session_${id}_completed`] = false;
      progress[`session_${id}_progress`] = {};
    }
    expect(computeOverallProgress(progress as never)).toBe(0);
  });

  it('returns 100 when all sessions are completed', () => {
    const progress: Record<string, unknown> = {};
    for (const id of sessionIds) {
      progress[`session_${id}_completed`] = true;
      progress[`session_${id}_progress`] = {};
    }
    expect(computeOverallProgress(progress as never)).toBe(100);
  });

  it('session 1 completed alone gives correct percentage', () => {
    const progress: Record<string, unknown> = {};
    for (const id of sessionIds) {
      progress[`session_${id}_completed`] = id === 1;
      progress[`session_${id}_progress`] = {};
    }
    const session1Modules = ALL_SESSION_CONTENT[1].modules.length;
    const expected = Math.round((session1Modules / totalModules) * 100);
    expect(computeOverallProgress(progress as never)).toBe(expected);
  });

  it('sessions 1+2 completed gives correct percentage', () => {
    const progress: Record<string, unknown> = {};
    for (const id of sessionIds) {
      progress[`session_${id}_completed`] = id <= 2;
      progress[`session_${id}_progress`] = {};
    }
    const s1s2Modules =
      ALL_SESSION_CONTENT[1].modules.length + ALL_SESSION_CONTENT[2].modules.length;
    const expected = Math.round((s1s2Modules / totalModules) * 100);
    expect(computeOverallProgress(progress as never)).toBe(expected);
  });

  it('mix of completed and in-progress sessions', () => {
    const s2Modules = ALL_SESSION_CONTENT[2].modules;
    const progress: Record<string, unknown> = {
      session_1_completed: true,
      session_1_progress: {},
      session_2_completed: false,
      session_2_progress: {
        completedModules: [],
        moduleEngagement: {
          [s2Modules[0].id]: eng({ completed: true }),
          [s2Modules[1].id]: eng({ chatStarted: true }),
        },
      } as SessionProgressData,
      session_3_completed: false,
      session_3_progress: {},
      session_4_completed: false,
      session_4_progress: {},
      session_5_completed: false,
      session_5_progress: {},
    };

    const result = computeOverallProgress(progress as never);
    // Should be > session 1 alone and < sessions 1+2 completed
    const s1Only = ALL_SESSION_CONTENT[1].modules.length;
    const s1s2 = s1Only + ALL_SESSION_CONTENT[2].modules.length;
    expect(result).toBeGreaterThan(Math.round((s1Only / totalModules) * 100));
    expect(result).toBeLessThan(Math.round((s1s2 / totalModules) * 100));
  });
});

// ── Legacy completedModules compatibility ───────────────────────────────────

describe('legacy completedModules — real content', () => {
  it('treats legacy-completed modules as 100% even without engagement', () => {
    const modules = ALL_SESSION_CONTENT[1].modules;
    const data: SessionProgressData = {
      completedModules: modules.map((m) => m.id),
      moduleEngagement: {},
    };
    expect(computeSessionProgress(1, data)).toBe(100);
  });

  it('engagement overrides legacy for the same module', () => {
    const modules = ALL_SESSION_CONTENT[1].modules;
    const data: SessionProgressData = {
      completedModules: [modules[0].id],
      moduleEngagement: {
        [modules[0].id]: eng({ contentViewed: true }), // only 20%
      },
    };
    const progress = computeSessionProgress(1, data);
    // module 0 = 20%, rest = 0% → (0.2/7)*100 ≈ 3
    expect(progress).toBeLessThan(10);
  });
});
