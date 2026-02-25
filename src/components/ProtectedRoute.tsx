import { ReactNode, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: ReactNode;
  requireOnboarding?: boolean;
}

export function ProtectedRoute({ children, requireOnboarding = false }: ProtectedRouteProps) {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      // Redirect to auth if not logged in
      if (!user) {
        navigate('/auth');
        return;
      }

      // Redirect to onboarding if not completed and required
      if (requireOnboarding && profile && !profile.onboarding_completed) {
        navigate('/onboarding');
        return;
      }
    }
  }, [user, profile, loading, navigate, requireOnboarding]);

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Don't render children until auth is confirmed
  if (!user) {
    return null;
  }

  // If onboarding is required but profile hasn't loaded yet, show spinner
  // (guards against the auth race window where loading=false but profile=null)
  if (requireOnboarding && !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Don't render if onboarding is required but not completed
  if (requireOnboarding && !profile.onboarding_completed) {
    return null;
  }

  return <>{children}</>;
}
