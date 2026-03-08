import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useAIMemories, useAIPreferences } from '@/hooks/useAIPreferences';
import { useElectiveProgress } from '@/hooks/useElectiveProgress';
import { useUserIdeas } from '@/hooks/useUserIdeas';
import { useUserPrompts } from '@/hooks/useUserPrompts';

let mockUser: { id: string } | null = null;

const fromMock = vi.fn();

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({ user: mockUser }),
}));

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: (...args: unknown[]) => fromMock(...args),
  },
}));

function createQueryBuilder(result: unknown) {
  const builder = {
    select: vi.fn(() => builder),
    eq: vi.fn(() => builder),
    order: vi.fn(async () => result),
    single: vi.fn(async () => result),
    maybeSingle: vi.fn(async () => result),
    insert: vi.fn(() => builder),
    update: vi.fn(() => builder),
    delete: vi.fn(() => builder),
    upsert: vi.fn(async () => result),
  };
  return builder;
}

describe('comprehensive hook behavior checks', () => {
  beforeEach(() => {
    mockUser = null;
    fromMock.mockReset();
    localStorage.clear();
  });

  it('useUserPrompts: unauthenticated users should not be stuck loading', async () => {
    const { result } = renderHook(() => useUserPrompts());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.prompts).toEqual([]);
    expect(fromMock).not.toHaveBeenCalled();
  });

  it('useUserPrompts: fallback should read user-scoped localStorage first', async () => {
    mockUser = { id: 'user-1' };

    localStorage.setItem('bankwise_prompt_library_user-1', JSON.stringify([
      {
        id: 'prompt_1',
        user_id: 'legacy',
        title: 'Scoped prompt',
        content: 'content',
        category: 'general',
        tags: [],
        is_favorite: false,
        source: null,
        metadata: {},
        created_at: '2026-01-01T00:00:00.000Z',
        updated_at: '2026-01-01T00:00:00.000Z',
      },
    ]));

    fromMock.mockReturnValue(createQueryBuilder({ data: null, error: new Error('missing table') }));

    const { result } = renderHook(() => useUserPrompts());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.prompts).toHaveLength(1);
    expect(result.current.prompts[0].title).toBe('Scoped prompt');
    expect(result.current.prompts[0].user_id).toBe('user-1');
  });

  it('useElectiveProgress: unauthenticated users should not be stuck loading', async () => {
    const { result } = renderHook(() => useElectiveProgress());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.records).toEqual([]);
    expect(fromMock).not.toHaveBeenCalled();
  });

  it('useUserIdeas: unauthenticated users should not be stuck loading', async () => {
    const { result } = renderHook(() => useUserIdeas());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.ideas).toEqual([]);
    expect(fromMock).not.toHaveBeenCalled();
  });

  it('useAIPreferences: unauthenticated users should not be stuck loading', async () => {
    const { result } = renderHook(() => useAIPreferences());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.preferences).toBeNull();
    expect(fromMock).not.toHaveBeenCalled();
  });

  it('useAIMemories: unauthenticated users should not be stuck loading', async () => {
    const { result } = renderHook(() => useAIMemories());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.memories).toEqual([]);
    expect(fromMock).not.toHaveBeenCalled();
  });
});
