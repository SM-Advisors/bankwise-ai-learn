import React, { createContext, useContext, ReactNode } from 'react';
import { useSessionTimeout } from '@/hooks/useSessionTimeout';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

interface SessionContextType {
  refreshSession: () => Promise<boolean>;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export function SessionProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  
  const handleSessionWarning = () => {
    toast({
      title: "Session Expiring",
      description: "Your session will expire in 5 minutes. Your work is being saved.",
      variant: "default",
    });
  };

  const handleSessionExpired = () => {
    toast({
      title: "Session Expired",
      description: "Please sign in again to continue.",
      variant: "destructive",
    });
    // Redirect will be handled by auth state change listener
  };

  const { refreshSession } = useSessionTimeout({
    warningMinutes: 5,
    onSessionWarning: handleSessionWarning,
    onSessionExpired: handleSessionExpired,
  });

  return (
    <SessionContext.Provider value={{ refreshSession }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
}
