import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { SessionProgressData, ModuleEngagement } from '@/types/progress';

// ── Mocks ───────────────────────────────────────────────────────────────────

let mockAuth: {
  user: { id: string } | null;
  profile: Record<string, unknown> | null;
  progress: Record<string, unknown> | null;
};

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => mockAuth,
}));

const fromMock = vi.fn();
vi.mock('@/integrations/supabase/client', () => ({
  supabase: { from: (...args: unknown[]) => fromMock(...args) },
}));

// Must import AFTER mocks are set up
import { useFeatureGates } from '../useFeatureGates';
import { LEARNER_ZONES } from '@/config/zones';

// ── Helpers ─────────────────────────────────────────────────────────────────

const eng = (overrides: Partial<ModuleEngagement> = {}): ModuleEngagement => ({
  contentViewed: false,
  chatStarted: false,
  practiceMessageCount: 0,
  submitted: false,
  completed: false,
  ...overrides,
});

function makeProgress(overrides: Partial<SessionProgressData> = {}): SessionProgressData {
  return { completedModules: [], moduleEngagement: {}, ...overrides };
}

function setupSupabaseMock(count: number) {
  fromMock.mockReturnValue({
    select: vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          then: (cb: (result: { count: number }) => void) => cb({ count }),
        }),
      }),
    }),
  });
}

beforeEach(() => {
  mockAuth = { user: null, profile: null, progress: null };
  fromMock.mockReset();
  setupSupabaseMock(0);
});

// ── isUnlocked conditions ───────────────────────────────────────────────────

describe('useFeatureGates — isUnlocked', () => {
  it('"always" is always true even without auth', () => {
    const { result } = renderHook(() => useFeatureGates());
    expect(result.current.isUnlocked('always')).toBe(true);
  });

  it('"onboarding_completed" is false when profile is null', () => {
    const { result } = renderHook(() => useFeatureGates());
    expect(result.current.isUnlocked('onboarding_completed')).toBe(false);
  });

  it('"onboarding_completed" is true when profile.onboarding_completed', () => {
    mockAuth = {
      user: { id: 'u1' },
      profile: { onboarding_completed: true },
      progress: null,
    };
    const { result } = renderHook(() => useFeatureGates());
    expect(result.current.isUnlocked('onboarding_completed')).toBe(true);
  });

  it('"session_1_basic_interaction_done" checks module 1-3 completion', () => {
    mockAuth = {
      user: { id: 'u1' },
      profile: {},
      progress: {
        session_1_progress: makeProgress({
          completedModules: ['1-3'],
        }),
      },
    };
    const { result } = renderHook(() => useFeatureGates());
    expect(result.current.isUnlocked('session_1_basic_interaction_done')).toBe(true);
  });

  it('"session_1_basic_interaction_done" is false without 1-3', () => {
    mockAuth = {
      user: { id: 'u1' },
      profile: {},
      progress: {
        session_1_progress: makeProgress({
          completedModules: ['1-1', '1-2'],
        }),
      },
    };
    const { result } = renderHook(() => useFeatureGates());
    expect(result.current.isUnlocked('session_1_basic_interaction_done')).toBe(false);
  });

  it('"first_practice_done" is true when any chat started', () => {
    mockAuth = {
      user: { id: 'u1' },
      profile: {},
      progress: {
        session_1_progress: makeProgress({
          moduleEngagement: { '1-1': eng({ chatStarted: true }) },
        }),
      },
    };
    const { result } = renderHook(() => useFeatureGates());
    expect(result.current.isUnlocked('first_practice_done')).toBe(true);
  });

  it('"first_practice_done" is false when no chat started', () => {
    mockAuth = {
      user: { id: 'u1' },
      profile: {},
      progress: {
        session_1_progress: makeProgress({
          moduleEngagement: { '1-1': eng({ contentViewed: true }) },
        }),
      },
    };
    const { result } = renderHook(() => useFeatureGates());
    expect(result.current.isUnlocked('first_practice_done')).toBe(false);
  });

  it('"session_1_completed" checks progress.session_1_completed', () => {
    mockAuth = {
      user: { id: 'u1' },
      profile: {},
      progress: { session_1_completed: true },
    };
    const { result } = renderHook(() => useFeatureGates());
    expect(result.current.isUnlocked('session_1_completed')).toBe(true);
  });

  it('"session_1_completed" is false when not set', () => {
    mockAuth = {
      user: { id: 'u1' },
      profile: {},
      progress: { session_1_completed: false },
    };
    const { result } = renderHook(() => useFeatureGates());
    expect(result.current.isUnlocked('session_1_completed')).toBe(false);
  });

  it('unknown condition returns false', () => {
    const { result } = renderHook(() => useFeatureGates());
    // Cast to bypass TS — testing runtime safety
    expect(result.current.isUnlocked('nonexistent' as never)).toBe(false);
  });
});

// ── unlockedZones ───────────────────────────────────────────────────────────

describe('useFeatureGates — unlockedZones', () => {
  it('only includes "always" zones when unauthenticated', () => {
    const { result } = renderHook(() => useFeatureGates());
    const alwaysZones = LEARNER_ZONES.filter((z) => z.unlockedBy === 'always');
    expect(result.current.unlockedZones).toEqual(alwaysZones);
  });

  it('includes learn and profile when onboarding is completed', () => {
    mockAuth = {
      user: { id: 'u1' },
      profile: { onboarding_completed: true },
      progress: null,
    };
    const { result } = renderHook(() => useFeatureGates());
    const ids = result.current.unlockedZones.map((z) => z.id);
    expect(ids).toContain('home');
    expect(ids).toContain('learn');
    expect(ids).toContain('profile');
  });

  it('includes explore when module 1-3 is completed', () => {
    mockAuth = {
      user: { id: 'u1' },
      profile: { onboarding_completed: true },
      progress: {
        session_1_progress: makeProgress({ completedModules: ['1-3'] }),
      },
    };
    const { result } = renderHook(() => useFeatureGates());
    const ids = result.current.unlockedZones.map((z) => z.id);
    expect(ids).toContain('explore');
  });
});

// ── Named helpers ───────────────────────────────────────────────────────────

describe('useFeatureGates — named access helpers', () => {
  it('canAccessLearn reflects onboarding_completed', () => {
    mockAuth = {
      user: { id: 'u1' },
      profile: { onboarding_completed: true },
      progress: null,
    };
    const { result } = renderHook(() => useFeatureGates());
    expect(result.current.canAccessLearn).toBe(true);
    expect(result.current.canAccessProfile).toBe(true);
  });

  it('canAccessExplore reflects session_1_basic_interaction_done', () => {
    mockAuth = {
      user: { id: 'u1' },
      profile: {},
      progress: {
        session_1_progress: makeProgress({ completedModules: ['1-3'] }),
      },
    };
    const { result } = renderHook(() => useFeatureGates());
    expect(result.current.canAccessExplore).toBe(true);
  });

  it('canAccessCommunity reflects first_practice_done', () => {
    mockAuth = {
      user: { id: 'u1' },
      profile: {},
      progress: {
        session_1_progress: makeProgress({
          moduleEngagement: { '1-4': eng({ chatStarted: true }) },
        }),
      },
    };
    const { result } = renderHook(() => useFeatureGates());
    expect(result.current.canAccessCommunity).toBe(true);
  });

  it('all helpers are false when unauthenticated', () => {
    const { result } = renderHook(() => useFeatureGates());
    expect(result.current.canAccessLearn).toBe(false);
    expect(result.current.canAccessExplore).toBe(false);
    expect(result.current.canAccessCommunity).toBe(false);
    expect(result.current.canAccessProfile).toBe(false);
  });
});
