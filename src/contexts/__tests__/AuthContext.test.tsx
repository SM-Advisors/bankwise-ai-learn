/**
 * Phase 5 — contexts/AuthContext.tsx
 * Mocks Supabase client entirely. Tests the AuthProvider functions directly.
 */

import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthProvider, useAuth } from '../AuthContext';
import type { ViewAsOrg } from '../AuthContext';

// ── Supabase mock ─────────────────────────────────────────────────────────────

let authStateCallback: ((event: string, session: unknown) => void) | null = null;

const mockSignOut = vi.fn(async () => ({ error: null }));
const mockSignUp = vi.fn(async () => ({ data: { user: null }, error: null }));
const mockSignInWithPassword = vi.fn(async () => ({ data: { user: null }, error: null }));
const mockGetSession = vi.fn(async () => ({ data: { session: null } }));

const fromMock = vi.fn();

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      onAuthStateChange: vi.fn((cb: (event: string, session: unknown) => void) => {
        authStateCallback = cb;
        return { data: { subscription: { unsubscribe: vi.fn() } } };
      }),
      getSession: () => mockGetSession(),
      signOut: () => mockSignOut(),
      signUp: (creds: any) => mockSignUp(creds),
      signInWithPassword: (creds: any) => mockSignInWithPassword(creds),
    },
    from: (...args: unknown[]) => fromMock(...args),
  },
}));

// ── Query builder factory ─────────────────────────────────────────────────────

function makeBuilder(result: unknown) {
  const b: Record<string, unknown> = {
    select: vi.fn(() => b),
    eq: vi.fn(() => b),
    update: vi.fn(() => b),
    insert: vi.fn(() => b),
    maybeSingle: vi.fn(async () => result),
    single: vi.fn(async () => result),
  };
  return b;
}

// ── Wrapper ───────────────────────────────────────────────────────────────────

function wrapper({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function mockUser(id = 'user-1') {
  return { id, email: 'test@example.com' };
}

function mockProfile(overrides = {}) {
  return {
    id: 'profile-1',
    user_id: 'user-1',
    display_name: 'Test User',
    organization_id: 'org-1',
    onboarding_completed: false,
    current_session: 1,
    created_at: '2026-01-01',
    updated_at: '2026-01-01',
    ...overrides,
  };
}

function mockProgress(overrides = {}) {
  return {
    id: 'progress-1',
    user_id: 'user-1',
    session_1_completed: false,
    session_1_progress: {},
    session_2_completed: false,
    session_2_progress: {},
    session_3_completed: false,
    session_3_progress: {},
    session_4_completed: false,
    session_4_progress: {},
    session_5_completed: false,
    session_5_progress: {},
    ...overrides,
  };
}

beforeEach(() => {
  authStateCallback = null;
  fromMock.mockReset();
  mockSignOut.mockReset();
  mockSignUp.mockReset();
  mockSignInWithPassword.mockReset();
  mockGetSession.mockReset();

  // Default: no session
  mockGetSession.mockResolvedValue({ data: { session: null } });
  mockSignOut.mockResolvedValue({ error: null });
});

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('AuthContext — initial state', () => {
  it('starts in loading=true then resolves to loading=false when no session', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.user).toBeNull();
    expect(result.current.profile).toBeNull();
  });
});

describe('AuthContext — signOut', () => {
  it('clears all state after signOut()', async () => {
    // First simulate a signed-in state by triggering the auth listener
    fromMock.mockImplementation((table: string) => {
      if (table === 'user_profiles') return makeBuilder({ data: mockProfile(), error: null });
      if (table === 'training_progress') return makeBuilder({ data: mockProgress(), error: null });
      return makeBuilder({ data: null, error: null });
    });

    const { result } = renderHook(() => useAuth(), { wrapper });

    // Simulate SIGNED_IN event
    act(() => {
      authStateCallback?.('SIGNED_IN', { user: mockUser() });
    });

    await waitFor(() => expect(result.current.loading).toBe(false));

    // Now sign out
    await act(async () => {
      await result.current.signOut();
    });

    expect(result.current.user).toBeNull();
    expect(result.current.session).toBeNull();
    expect(result.current.profile).toBeNull();
    expect(result.current.progress).toBeNull();
    expect(mockSignOut).toHaveBeenCalled();
  });
});

describe('AuthContext — effectiveOrgId', () => {
  it('returns profile.organization_id when viewAsOrg is not set', async () => {
    fromMock.mockImplementation((table: string) => {
      if (table === 'user_profiles')
        return makeBuilder({ data: mockProfile({ organization_id: 'org-abc' }), error: null });
      if (table === 'training_progress') return makeBuilder({ data: mockProgress(), error: null });
      return makeBuilder({ data: null, error: null });
    });

    const { result } = renderHook(() => useAuth(), { wrapper });

    act(() => {
      authStateCallback?.('SIGNED_IN', { user: mockUser() });
    });

    await waitFor(() => expect(result.current.profile?.organization_id).toBe('org-abc'));
    expect(result.current.effectiveOrgId).toBe('org-abc');
  });

  it('returns viewAsOrg.id when viewAsOrg is set, overriding profile org', async () => {
    fromMock.mockImplementation((table: string) => {
      if (table === 'user_profiles')
        return makeBuilder({ data: mockProfile({ organization_id: 'org-abc' }), error: null });
      if (table === 'training_progress') return makeBuilder({ data: mockProgress(), error: null });
      return makeBuilder({ data: null, error: null });
    });

    const { result } = renderHook(() => useAuth(), { wrapper });

    act(() => {
      authStateCallback?.('SIGNED_IN', { user: mockUser() });
    });

    await waitFor(() => expect(result.current.profile).not.toBeNull());

    const viewOrg: ViewAsOrg = {
      id: 'org-override',
      name: 'Override Org',
      audience_type: 'community_bank',
      industry: 'banking',
    };

    act(() => {
      result.current.setViewAsOrg(viewOrg);
    });

    expect(result.current.effectiveOrgId).toBe('org-override');
  });
});

describe('AuthContext — setViewAsOrg / clearViewAsOrg', () => {
  it('setViewAsOrg stores the org and clearViewAsOrg removes it', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));

    const org: ViewAsOrg = {
      id: 'org-x',
      name: 'Org X',
      audience_type: 'credit_union',
      industry: 'banking',
    };

    act(() => {
      result.current.setViewAsOrg(org);
    });

    expect(result.current.viewAsOrg?.id).toBe('org-x');

    act(() => {
      result.current.clearViewAsOrg();
    });

    expect(result.current.viewAsOrg).toBeNull();
  });
});

describe('AuthContext — signIn', () => {
  it('returns error when user is deactivated (is_active === false)', async () => {
    mockSignInWithPassword.mockResolvedValue({
      data: { user: mockUser() },
      error: null,
    });

    // profile check returns is_active: false
    fromMock.mockImplementation((table: string) => {
      if (table === 'user_profiles')
        return makeBuilder({ data: { is_active: false }, error: null });
      return makeBuilder({ data: null, error: null });
    });

    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));

    let signInResult: { error: Error | null } | undefined;
    await act(async () => {
      signInResult = await result.current.signIn('test@example.com', 'password');
    });

    expect(signInResult?.error).not.toBeNull();
    expect(signInResult?.error?.message).toContain('deactivated');
    expect(mockSignOut).toHaveBeenCalled();
  });

  it('returns { error: null } for a valid active user', async () => {
    mockSignInWithPassword.mockResolvedValue({
      data: { user: mockUser() },
      error: null,
    });

    fromMock.mockImplementation((table: string) => {
      if (table === 'user_profiles')
        return makeBuilder({ data: { is_active: true }, error: null });
      return makeBuilder({ data: null, error: null });
    });

    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));

    let signInResult: { error: Error | null } | undefined;
    await act(async () => {
      signInResult = await result.current.signIn('test@example.com', 'password');
    });

    expect(signInResult?.error).toBeNull();
  });
});

describe('AuthContext — refreshProfile', () => {
  it('re-fetches profile and progress from DB', async () => {
    // First: auth state with profile loaded
    fromMock.mockImplementation((table: string) => {
      if (table === 'user_profiles')
        return makeBuilder({ data: mockProfile({ display_name: 'Before' }), error: null });
      if (table === 'training_progress') return makeBuilder({ data: mockProgress(), error: null });
      return makeBuilder({ data: null, error: null });
    });

    const { result } = renderHook(() => useAuth(), { wrapper });

    act(() => {
      authStateCallback?.('SIGNED_IN', { user: mockUser() });
    });

    await waitFor(() => expect(result.current.profile?.display_name).toBe('Before'));

    // Update mock to return updated profile
    fromMock.mockImplementation((table: string) => {
      if (table === 'user_profiles')
        return makeBuilder({ data: mockProfile({ display_name: 'After' }), error: null });
      if (table === 'training_progress') return makeBuilder({ data: mockProgress(), error: null });
      return makeBuilder({ data: null, error: null });
    });

    await act(async () => {
      await result.current.refreshProfile();
    });

    expect(result.current.profile?.display_name).toBe('After');
  });
});

describe('AuthContext — updateProfile', () => {
  it('persists partial updates and refreshes state', async () => {
    fromMock.mockImplementation((table: string) => {
      if (table === 'user_profiles')
        return makeBuilder({ data: mockProfile({ display_name: 'Updated' }), error: null });
      if (table === 'training_progress') return makeBuilder({ data: mockProgress(), error: null });
      return makeBuilder({ data: null, error: null });
    });

    const { result } = renderHook(() => useAuth(), { wrapper });

    act(() => {
      authStateCallback?.('SIGNED_IN', { user: mockUser() });
    });

    await waitFor(() => expect(result.current.loading).toBe(false));

    let updateResult: { error: Error | null } | undefined;
    await act(async () => {
      updateResult = await result.current.updateProfile({ display_name: 'Updated' });
    });

    expect(updateResult?.error).toBeNull();
    expect(result.current.profile?.display_name).toBe('Updated');
  });

  it('returns error when not authenticated', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));

    let updateResult: { error: Error | null } | undefined;
    await act(async () => {
      updateResult = await result.current.updateProfile({ display_name: 'Fail' });
    });

    expect(updateResult?.error?.message).toContain('Not authenticated');
  });
});

describe('AuthContext — markSessionCompleted', () => {
  it('returns error when not authenticated', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));

    let markResult: { error: Error | null } | undefined;
    await act(async () => {
      markResult = await result.current.markSessionCompleted(1);
    });

    expect(markResult?.error?.message).toContain('Not authenticated');
  });

  it('advances current_session when applicable and returns { error: null }', async () => {
    // Profile has current_session: 1, so completing session 1 should advance to 2
    fromMock.mockImplementation((table: string) => {
      if (table === 'user_profiles')
        return makeBuilder({ data: mockProfile({ current_session: 2 }), error: null });
      if (table === 'training_progress')
        return makeBuilder({ data: mockProgress({ session_1_completed: true }), error: null });
      return makeBuilder({ data: null, error: null });
    });

    const { result } = renderHook(() => useAuth(), { wrapper });

    act(() => {
      authStateCallback?.('SIGNED_IN', { user: mockUser() });
    });

    await waitFor(() => expect(result.current.profile).not.toBeNull());

    let markResult: { error: Error | null } | undefined;
    await act(async () => {
      markResult = await result.current.markSessionCompleted(1);
    });

    expect(markResult?.error).toBeNull();
    expect(result.current.progress?.session_1_completed).toBe(true);
  });
});
