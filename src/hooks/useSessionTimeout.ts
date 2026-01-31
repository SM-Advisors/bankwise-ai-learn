import { useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface UseSessionTimeoutOptions {
  /** Warning time before session expires (in minutes) */
  warningMinutes?: number;
  /** Callback when session is about to expire */
  onSessionWarning?: () => void;
  /** Callback when session expires */
  onSessionExpired?: () => void;
}

export function useSessionTimeout(options: UseSessionTimeoutOptions = {}) {
  const { 
    warningMinutes = 5,
    onSessionWarning,
    onSessionExpired 
  } = options;
  
  const { toast } = useToast();
  const warningShownRef = useRef(false);
  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const refreshSession = useCallback(async () => {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      if (error) {
        console.error('Failed to refresh session:', error);
        return false;
      }
      warningShownRef.current = false;
      return !!data.session;
    } catch (err) {
      console.error('Session refresh error:', err);
      return false;
    }
  }, []);

  const checkSession = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      // No active session
      return;
    }

    const expiresAt = session.expires_at;
    if (!expiresAt) return;

    const expiresAtMs = expiresAt * 1000;
    const now = Date.now();
    const timeUntilExpiry = expiresAtMs - now;
    const warningThreshold = warningMinutes * 60 * 1000;

    // Session expired
    if (timeUntilExpiry <= 0) {
      if (onSessionExpired) {
        onSessionExpired();
      } else {
        toast({
          title: "Session Expired",
          description: "Your session has expired. Please sign in again.",
          variant: "destructive",
        });
      }
      return;
    }

    // Session about to expire - show warning and try to refresh
    if (timeUntilExpiry <= warningThreshold && !warningShownRef.current) {
      warningShownRef.current = true;
      
      // Try to refresh automatically first
      const refreshed = await refreshSession();
      
      if (!refreshed) {
        if (onSessionWarning) {
          onSessionWarning();
        } else {
          toast({
            title: "Session Expiring Soon",
            description: "Your session will expire soon. Please save your work.",
            variant: "default",
          });
        }
      }
    }
  }, [warningMinutes, onSessionWarning, onSessionExpired, refreshSession, toast]);

  useEffect(() => {
    // Check session every minute
    checkSession();
    checkIntervalRef.current = setInterval(checkSession, 60 * 1000);

    // Also listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'TOKEN_REFRESHED') {
        warningShownRef.current = false;
      } else if (event === 'SIGNED_OUT') {
        if (checkIntervalRef.current) {
          clearInterval(checkIntervalRef.current);
        }
      }
    });

    return () => {
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
      }
      subscription.unsubscribe();
    };
  }, [checkSession]);

  return { refreshSession };
}
