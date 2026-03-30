/**
 * Phase 4 — hooks/useFeatureGates.ts
 * Mocks: @/contexts/AuthContext, @/integrations/supabase/client
 */

import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useFeatureGates } from '../useFeatureGates';
import type { UserProfile, TrainingProgress } from '@/contexts/AuthContext';

// ── Mutable state shared by all mocked hooks ──────────────────────────────────

let mockUser: { id: string } | null = null;
let mockProfile: Partial<UserProfile> | null = null;
let mockProgress: Partial<TrainingProgress> | null = null;

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: mockUser,
    profile: mockProfile,
    progress: mockProgress,
  }),
}));

// Supabase mock — simulate the deployed-agent count check
const headMock = vi.fn(async () => ({ count: 0, error: null }));
const fromMock = vi.fn();

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: (...args: unknown[]) => fromMock(...args),
    auth: {
      onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
      getSession: vi.fn(async () => ({ data: { session: null } })),
    },
  },
}));

function createAgentBuilder(count: number) {
  const builder = {
    select: vi.fn(() => builder),
    eq: vi.fn(() => builder),
    then: (resolve: (v: { count: number }) => void) => resolve({ count }),
  };
  return builder;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function session1Progress(overrides: Record<string, unknown> = {}) {
  return {
    completedModules: [] as string[],
    moduleEngagement: {} as Record<string, { chatStarted?: boolean }>,
    ...overrides,
  };
}

beforeEach(() => {
  mockUser = null;
  mockProfile = null;
  mockProgress = null;
  fromMock.mockReset();
  // Default: no deployed agents
  fromMock.mockReturnValue(createAgentBuilder(0));
});

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('useFeatureGates — always condition', () => {
  it("'always' is always unlocked regardless of auth state", async () => {
    const { result } = renderHook(() => useFeatureGates());
    await waitFor(() => expect(result.current.isUnlocked('always')).toBe(true));
  });

  it("home zone (unlockedBy: 'always') is always in unlockedZones", async () => {
    const { result } = renderHook(() => useFeatureGates());
    await waitFor(() => {
      const homeZone = result.current.unlockedZones.find((z) => z.id === 'home');
      expect(homeZone).toBeDefined();
    });
  });
});

describe('useFeatureGates — onboarding_completed', () => {
  it('returns false when profile is null', async () => {
    mockProfile = null;
    const { result } = renderHook(() => useFeatureGates());
    await waitFor(() =>
      expect(result.current.isUnlocked('onboarding_completed')).toBe(false)
    );
  });

  it('returns false when onboarding_completed is false', async () => {
    mockProfile = { onboarding_completed: false };
    const { result } = renderHook(() => useFeatureGates());
    await waitFor(() =>
      expect(result.current.isUnlocked('onboarding_completed')).toBe(false)
    );
  });

  it('returns true when onboarding_completed is true', async () => {
    mockProfile = { onboarding_completed: true };
    const { result } = renderHook(() => useFeatureGates());
    await waitFor(() =>
      expect(result.current.isUnlocked('onboarding_completed')).toBe(true)
    );
  });

  it('canAccessLearn reflects onboarding_completed', async () => {
    mockProfile = { onboarding_completed: true };
    const { result } = renderHook(() => useFeatureGates());
    await waitFor(() => expect(result.current.canAccessLearn).toBe(true));
  });

  it('canAccessProfile reflects onboarding_completed', async () => {
    mockProfile = { onboarding_completed: true };
    const { result } = renderHook(() => useFeatureGates());
    await waitFor(() => expect(result.current.canAccessProfile).toBe(true));
  });
});

describe('useFeatureGates — session_1_basic_interaction_done', () => {
  it('returns false when session_1_progress is empty', async () => {
    mockProgress = { session_1_progress: session1Progress() } as unknown as TrainingProgress;
    const { result } = renderHook(() => useFeatureGates());
    await waitFor(() =>
      expect(result.current.isUnlocked('session_1_basic_interaction_done')).toBe(false)
    );
  });

  it('returns false when module 1-3 is not in completedModules', async () => {
    mockProgress = {
      session_1_progress: session1Progress({ completedModules: ['1-1', '1-2'] }),
    } as unknown as TrainingProgress;
    const { result } = renderHook(() => useFeatureGates());
    await waitFor(() =>
      expect(result.current.isUnlocked('session_1_basic_interaction_done')).toBe(false)
    );
  });

  it('returns true when module 1-3 is completed', async () => {
    mockProgress = {
      session_1_progress: session1Progress({ completedModules: ['1-1', '1-2', '1-3'] }),
    } as unknown as TrainingProgress;
    const { result } = renderHook(() => useFeatureGates());
    await waitFor(() =>
      expect(result.current.isUnlocked('session_1_basic_interaction_done')).toBe(true)
    );
  });

  it('canAccessExplore reflects session_1_basic_interaction_done', async () => {
    mockProgress = {
      session_1_progress: session1Progress({ completedModules: ['1-3'] }),
    } as unknown as TrainingProgress;
    const { result } = renderHook(() => useFeatureGates());
    await waitFor(() => expect(result.current.canAccessExplore).toBe(true));
  });
});

describe('useFeatureGates — first_practice_done', () => {
  it('returns false when no chatStarted flags are set', async () => {
    mockProgress = {
      session_1_progress: session1Progress({
        moduleEngagement: { '1-1': { chatStarted: false } },
      }),
    } as unknown as TrainingProgress;
    const { result } = renderHook(() => useFeatureGates());
    await waitFor(() =>
      expect(result.current.isUnlocked('first_practice_done')).toBe(false)
    );
  });

  it('returns true when at least one chatStarted is true', async () => {
    mockProgress = {
      session_1_progress: session1Progress({
        moduleEngagement: { '1-1': { chatStarted: true } },
      }),
    } as unknown as TrainingProgress;
    const { result } = renderHook(() => useFeatureGates());
    await waitFor(() =>
      expect(result.current.isUnlocked('first_practice_done')).toBe(true)
    );
  });

  it('canAccessCommunity reflects first_practice_done', async () => {
    mockProgress = {
      session_1_progress: session1Progress({
        moduleEngagement: { '1-3': { chatStarted: true } },
      }),
    } as unknown as TrainingProgress;
    const { result } = renderHook(() => useFeatureGates());
    await waitFor(() => expect(result.current.canAccessCommunity).toBe(true));
  });
});

describe('useFeatureGates — session_1_completed', () => {
  it('returns false when session_1_completed is false', async () => {
    mockProgress = { session_1_completed: false } as unknown as TrainingProgress;
    const { result } = renderHook(() => useFeatureGates());
    await waitFor(() =>
      expect(result.current.isUnlocked('session_1_completed')).toBe(false)
    );
  });

  it('returns true when session_1_completed is true', async () => {
    mockProgress = { session_1_completed: true } as unknown as TrainingProgress;
    const { result } = renderHook(() => useFeatureGates());
    await waitFor(() =>
      expect(result.current.isUnlocked('session_1_completed')).toBe(true)
    );
  });
});

describe('useFeatureGates — session_3_agent_deployed', () => {
  it('returns false when no deployed agents (count = 0)', async () => {
    mockUser = { id: 'user-1' };
    fromMock.mockReturnValue(createAgentBuilder(0));
    const { result } = renderHook(() => useFeatureGates());
    await waitFor(() =>
      expect(result.current.isUnlocked('session_3_agent_deployed')).toBe(false)
    );
  });

  it('returns true when user has at least one deployed agent', async () => {
    mockUser = { id: 'user-1' };
    fromMock.mockReturnValue(createAgentBuilder(1));
    const { result } = renderHook(() => useFeatureGates());
    await waitFor(() =>
      expect(result.current.isUnlocked('session_3_agent_deployed')).toBe(true)
    );
  });
});

describe('useFeatureGates — unknown condition', () => {
  it('returns false for an unknown condition', async () => {
    const { result } = renderHook(() => useFeatureGates());
    // Cast to bypass TS — tests the default: return false branch
    await waitFor(() =>
      expect(result.current.isUnlocked('totally_unknown' as never)).toBe(false)
    );
  });
});

describe('useFeatureGates — unlockedZones filtering', () => {
  it('unlockedZones only contains zones whose condition is met', async () => {
    // Only onboarding complete — should include home + learn + profile, not explore/community/agents
    mockProfile = { onboarding_completed: true };
    mockProgress = null;
    const { result } = renderHook(() => useFeatureGates());
    await waitFor(() => {
      const zoneIds = result.current.unlockedZones.map((z) => z.id);
      expect(zoneIds).toContain('home');
      expect(zoneIds).toContain('learn');
      expect(zoneIds).toContain('profile');
      expect(zoneIds).not.toContain('explore');
      expect(zoneIds).not.toContain('community');
      expect(zoneIds).not.toContain('agents');
    });
  });
});
