import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { MemoryRouter } from 'react-router-dom';

// Track navigate calls
const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

let mockAuthValue: {
  user: { id: string } | null;
  profile: { onboarding_completed: boolean } | null;
  loading: boolean;
};

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => mockAuthValue,
}));

function renderProtected(props: { requireOnboarding?: boolean } = {}) {
  return render(
    <MemoryRouter>
      <ProtectedRoute {...props}>
        <div>Protected Content</div>
      </ProtectedRoute>
    </MemoryRouter>
  );
}

describe('ProtectedRoute', () => {
  beforeEach(() => {
    mockNavigate.mockReset();
    mockAuthValue = {
      user: null,
      profile: null,
      loading: false,
    };
  });

  it('shows a loading spinner while auth is loading', () => {
    mockAuthValue = { user: null, profile: null, loading: true };
    renderProtected();

    // Should show loading spinner, not the content
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    // The spinner is an svg with animate-spin class - check for the container
    const container = document.querySelector('.min-h-screen');
    expect(container).toBeInTheDocument();
  });

  it('redirects to /auth when user is not authenticated', () => {
    mockAuthValue = { user: null, profile: null, loading: false };
    renderProtected();

    expect(mockNavigate).toHaveBeenCalledWith('/auth');
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('renders children when user is authenticated', () => {
    mockAuthValue = {
      user: { id: 'user-1' },
      profile: { onboarding_completed: true },
      loading: false,
    };
    renderProtected();

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('redirects to /onboarding when requireOnboarding is true and onboarding is not completed', () => {
    mockAuthValue = {
      user: { id: 'user-1' },
      profile: { onboarding_completed: false },
      loading: false,
    };
    renderProtected({ requireOnboarding: true });

    expect(mockNavigate).toHaveBeenCalledWith('/onboarding');
  });

  it('renders children when requireOnboarding is true and onboarding is completed', () => {
    mockAuthValue = {
      user: { id: 'user-1' },
      profile: { onboarding_completed: true },
      loading: false,
    };
    renderProtected({ requireOnboarding: true });

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('shows spinner when requireOnboarding is true but profile has not loaded yet', () => {
    mockAuthValue = {
      user: { id: 'user-1' },
      profile: null,
      loading: false,
    };
    renderProtected({ requireOnboarding: true });

    // Should show loading spinner (profile is null, requireOnboarding is true)
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    const container = document.querySelector('.min-h-screen');
    expect(container).toBeInTheDocument();
  });

  it('does not redirect when requireOnboarding is false even if onboarding is incomplete', () => {
    mockAuthValue = {
      user: { id: 'user-1' },
      profile: { onboarding_completed: false },
      loading: false,
    };
    renderProtected({ requireOnboarding: false });

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
    expect(mockNavigate).not.toHaveBeenCalledWith('/onboarding');
  });
});
