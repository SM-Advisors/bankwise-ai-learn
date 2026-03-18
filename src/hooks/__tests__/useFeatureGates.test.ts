import { renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';

// Auth context mock values
let mockAuthValue: {
  user: { id: string } | null;
  profile: { onboarding_completed: boolean } | null;
  progress: Record<string, unknown> | null;
};

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => mockAuthValue,
}));

// Supabase mock
const mockSelect = vi.fn();
const mockEq = vi.fn();

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: () => ({
      select: (...args: unknown[]) => {
        mockSelect(...args);
        return {
          eq: (...eqArgs: unknown[]) => {
            mockEq(...eqArgs);
            return {
              eq: (...eqArgs2: unknown[]) => {
                mockEq(...eqArgs2);
                return Promise.resolve({ count: 0 });
              },
            };
          },
        };
      },
    }),
  },
}));

describe('useFeatureGates', () => {
  beforeEach(() => {
    mockAuthValue = {
      user: null,
      profile: null,
      progress: null,
    };
    mockSelect.mockClear();
    mockEq.mockClear();
  });

  it('always unlocks the home zone', async () => {
    const { useFeatureGates } = await import('@/hooks/useFeatureGates');
    const { result } = renderHook(() => useFeatureGates());

    expect(result.current.isUnlocked('always')).toBe(true);
    // Home zone should always be in unlockedZones
    expect(result.current.unlockedZones.some((z) => z.id === 'home')).toBe(true);
  });

  it('canAccessLearn is false when onboarding is not completed', async () => {
    mockAuthValue = {
      user: { id: 'user-1' },
      profile: { onboarding_completed: false },
      progress: null,
    };
    const { useFeatureGates } = await import('@/hooks/useFeatureGates');
    const { result } = renderHook(() => useFeatureGates());

    expect(result.current.canAccessLearn).toBe(false);
    expect(result.current.canAccessProfile).toBe(false);
  });

  it('canAccessLearn is true when onboarding is completed', async () => {
    mockAuthValue = {
      user: { id: 'user-1' },
      profile: { onboarding_completed: true },
      progress: null,
    };
    const { useFeatureGates } = await import('@/hooks/useFeatureGates');
    const { result } = renderHook(() => useFeatureGates());

    expect(result.current.canAccessLearn).toBe(true);
    expect(result.current.canAccessProfile).toBe(true);
  });

  it('canAccessExplore is true when module 1-3 is completed', async () => {
    mockAuthValue = {
      user: { id: 'user-1' },
      profile: { onboarding_completed: true },
      progress: {
        session_1_progress: {
          completedModules: ['1-1', '1-2', '1-3'],
          moduleEngagement: {},
        },
        session_1_completed: false,
      },
    };
    const { useFeatureGates } = await import('@/hooks/useFeatureGates');
    const { result } = renderHook(() => useFeatureGates());

    expect(result.current.canAccessExplore).toBe(true);
  });

  it('canAccessExplore is false when module 1-3 is not completed', async () => {
    mockAuthValue = {
      user: { id: 'user-1' },
      profile: { onboarding_completed: true },
      progress: {
        session_1_progress: {
          completedModules: ['1-1', '1-2'],
          moduleEngagement: {},
        },
        session_1_completed: false,
      },
    };
    const { useFeatureGates } = await import('@/hooks/useFeatureGates');
    const { result } = renderHook(() => useFeatureGates());

    expect(result.current.canAccessExplore).toBe(false);
  });

  it('canAccessCommunity is true when a practice chat has been started', async () => {
    mockAuthValue = {
      user: { id: 'user-1' },
      profile: { onboarding_completed: true },
      progress: {
        session_1_progress: {
          completedModules: [],
          moduleEngagement: {
            '1-4': { chatStarted: true },
          },
        },
        session_1_completed: false,
      },
    };
    const { useFeatureGates } = await import('@/hooks/useFeatureGates');
    const { result } = renderHook(() => useFeatureGates());

    expect(result.current.canAccessCommunity).toBe(true);
  });

  it('canAccessCommunity is false when no practice chat has been started', async () => {
    mockAuthValue = {
      user: { id: 'user-1' },
      profile: { onboarding_completed: true },
      progress: {
        session_1_progress: {
          completedModules: [],
          moduleEngagement: {},
        },
        session_1_completed: false,
      },
    };
    const { useFeatureGates } = await import('@/hooks/useFeatureGates');
    const { result } = renderHook(() => useFeatureGates());

    expect(result.current.canAccessCommunity).toBe(false);
  });

  it('unlockedZones only contains zones that meet their unlock condition', async () => {
    mockAuthValue = {
      user: { id: 'user-1' },
      profile: { onboarding_completed: true },
      progress: {
        session_1_progress: {
          completedModules: ['1-1', '1-2', '1-3'],
          moduleEngagement: { '1-4': { chatStarted: true } },
        },
        session_1_completed: false,
      },
    };
    const { useFeatureGates } = await import('@/hooks/useFeatureGates');
    const { result } = renderHook(() => useFeatureGates());

    const zoneIds = result.current.unlockedZones.map((z) => z.id);
    // Should include: home (always), learn (onboarding), explore (1-3 done),
    // community (practice done), profile (onboarding)
    expect(zoneIds).toContain('home');
    expect(zoneIds).toContain('learn');
    expect(zoneIds).toContain('explore');
    expect(zoneIds).toContain('community');
    expect(zoneIds).toContain('profile');
    // Should NOT include agents (no deployed agent)
    expect(zoneIds).not.toContain('agents');
  });

  it('isUnlocked returns false for unknown conditions', async () => {
    const { useFeatureGates } = await import('@/hooks/useFeatureGates');
    const { result } = renderHook(() => useFeatureGates());

    // Cast to any to test the default case
    expect(result.current.isUnlocked('nonexistent_condition' as never)).toBe(false);
  });

  it('returns all gates as false when there is no user or profile', async () => {
    mockAuthValue = {
      user: null,
      profile: null,
      progress: null,
    };
    const { useFeatureGates } = await import('@/hooks/useFeatureGates');
    const { result } = renderHook(() => useFeatureGates());

    expect(result.current.canAccessLearn).toBe(false);
    expect(result.current.canAccessExplore).toBe(false);
    expect(result.current.canAccessCommunity).toBe(false);
    expect(result.current.canAccessProfile).toBe(false);
    // Only 'home' should be unlocked (always)
    expect(result.current.unlockedZones).toHaveLength(1);
    expect(result.current.unlockedZones[0].id).toBe('home');
  });
});
