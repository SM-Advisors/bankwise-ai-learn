import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';

// Mock toast
const mockToast = vi.fn();
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: mockToast }),
}));

// Supabase auth mocks
let mockSession: { expires_at?: number } | null = null;
const mockRefreshSession = vi.fn();
let authStateCallback: ((event: string) => void) | null = null;
const mockUnsubscribe = vi.fn();

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getSession: () => Promise.resolve({ data: { session: mockSession } }),
      refreshSession: (...args: unknown[]) => mockRefreshSession(...args),
      onAuthStateChange: (cb: (event: string) => void) => {
        authStateCallback = cb;
        return { data: { subscription: { unsubscribe: mockUnsubscribe } } };
      },
    },
  },
}));

describe('useSessionTimeout', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    mockSession = null;
    mockToast.mockReset();
    mockRefreshSession.mockReset();
    mockUnsubscribe.mockReset();
    authStateCallback = null;
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('does nothing when there is no active session', async () => {
    mockSession = null;
    const { useSessionTimeout } = await import('@/hooks/useSessionTimeout');

    renderHook(() => useSessionTimeout());
    await vi.advanceTimersByTimeAsync(0);

    expect(mockToast).not.toHaveBeenCalled();
  });

  it('does nothing when session is far from expiry', async () => {
    // Session expires in 30 minutes
    mockSession = { expires_at: Math.floor(Date.now() / 1000) + 30 * 60 };
    const { useSessionTimeout } = await import('@/hooks/useSessionTimeout');

    renderHook(() => useSessionTimeout());
    await vi.advanceTimersByTimeAsync(0);

    expect(mockToast).not.toHaveBeenCalled();
    expect(mockRefreshSession).not.toHaveBeenCalled();
  });

  it('attempts to refresh session when within warning threshold', async () => {
    // Session expires in 3 minutes (within default 5 min warning)
    mockSession = { expires_at: Math.floor(Date.now() / 1000) + 3 * 60 };
    mockRefreshSession.mockResolvedValue({ data: { session: mockSession }, error: null });
    const { useSessionTimeout } = await import('@/hooks/useSessionTimeout');

    renderHook(() => useSessionTimeout());
    await vi.advanceTimersByTimeAsync(0);

    expect(mockRefreshSession).toHaveBeenCalled();
  });

  it('shows warning toast when refresh fails and within warning threshold', async () => {
    // Session expires in 3 minutes
    mockSession = { expires_at: Math.floor(Date.now() / 1000) + 3 * 60 };
    mockRefreshSession.mockResolvedValue({ data: { session: null }, error: new Error('refresh failed') });
    const { useSessionTimeout } = await import('@/hooks/useSessionTimeout');

    renderHook(() => useSessionTimeout());
    await vi.advanceTimersByTimeAsync(0);

    expect(mockToast).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Session Expiring Soon',
      })
    );
  });

  it('shows expired toast when session has expired', async () => {
    // Session expired 1 minute ago
    mockSession = { expires_at: Math.floor(Date.now() / 1000) - 60 };
    const { useSessionTimeout } = await import('@/hooks/useSessionTimeout');

    renderHook(() => useSessionTimeout());
    await vi.advanceTimersByTimeAsync(0);

    expect(mockToast).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Session Expired',
        variant: 'destructive',
      })
    );
  });

  it('calls custom onSessionExpired callback instead of toast', async () => {
    mockSession = { expires_at: Math.floor(Date.now() / 1000) - 60 };
    const onSessionExpired = vi.fn();
    const { useSessionTimeout } = await import('@/hooks/useSessionTimeout');

    renderHook(() => useSessionTimeout({ onSessionExpired }));
    await vi.advanceTimersByTimeAsync(0);

    expect(onSessionExpired).toHaveBeenCalled();
    expect(mockToast).not.toHaveBeenCalled();
  });

  it('calls custom onSessionWarning callback when refresh fails', async () => {
    mockSession = { expires_at: Math.floor(Date.now() / 1000) + 3 * 60 };
    mockRefreshSession.mockResolvedValue({ data: { session: null }, error: new Error('fail') });
    const onSessionWarning = vi.fn();
    const { useSessionTimeout } = await import('@/hooks/useSessionTimeout');

    renderHook(() => useSessionTimeout({ onSessionWarning }));
    await vi.advanceTimersByTimeAsync(0);

    expect(onSessionWarning).toHaveBeenCalled();
    expect(mockToast).not.toHaveBeenCalled();
  });

  it('returns a refreshSession function', async () => {
    mockRefreshSession.mockResolvedValue({ data: { session: mockSession }, error: null });
    const { useSessionTimeout } = await import('@/hooks/useSessionTimeout');

    const { result } = renderHook(() => useSessionTimeout());

    expect(result.current.refreshSession).toBeTypeOf('function');

    await act(async () => {
      const success = await result.current.refreshSession();
      expect(typeof success).toBe('boolean');
    });
  });

  it('cleans up interval and subscription on unmount', async () => {
    const { useSessionTimeout } = await import('@/hooks/useSessionTimeout');

    const { unmount } = renderHook(() => useSessionTimeout());
    unmount();

    expect(mockUnsubscribe).toHaveBeenCalled();
  });
});
