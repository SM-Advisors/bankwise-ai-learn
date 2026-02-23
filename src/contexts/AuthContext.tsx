import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import type { SessionProgressData } from '@/types/progress';

export type LineOfBusiness = string;
export type LearningStyleType = 'example-based' | 'explanation-based' | 'hands-on' | 'logic-based';

export interface UserProfile {
  id: string;
  user_id: string;
  display_name: string | null;
  employer_bank_name: string | null;
  organization_id: string | null;
  line_of_business: LineOfBusiness | null;
  department_id: string | null;
  bank_role: string | null;
  learning_style: LearningStyleType | null;
  tech_learning_style: LearningStyleType | null;
  ai_proficiency_level: number | null;
  onboarding_completed: boolean;
  tour_completed: boolean;
  current_session: number;
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
  is_super_admin?: boolean;
  interests?: string[];
  // Intake v2 fields
  intake_responses?: Record<string, unknown>;
  safe_use_flag?: boolean;
  intake_role_key?: string;
  intake_orientation?: string;
  intake_motivation?: string[];
}

export interface TrainingProgress {
  id: string;
  user_id: string;
  session_1_completed: boolean;
  session_1_progress: SessionProgressData;
  session_2_completed: boolean;
  session_2_progress: SessionProgressData;
  session_3_completed: boolean;
  session_3_progress: SessionProgressData;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  progress: TrainingProgress | null;
  loading: boolean;
  signUp: (email: string, password: string, displayName: string, organizationId?: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ error: Error | null }>;
  refreshProfile: () => Promise<void>;
  updateProgress: (updates: Partial<TrainingProgress>) => Promise<{ error: Error | null }>;
  markSessionCompleted: (sessionNumber: 1 | 2 | 3) => Promise<{ error: Error | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [progress, setProgress] = useState<TrainingProgress | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
    
    if (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
    return data as unknown as UserProfile | null;
  };

  const fetchProgress = async (userId: string) => {
    const { data, error } = await supabase
      .from('training_progress')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
    
    if (error) {
      console.error('Error fetching progress:', error);
      return null;
    }
    return data as unknown as TrainingProgress | null;
  };

  const createProfile = async (userId: string, displayName: string, organizationId?: string) => {
    const insertData: Record<string, unknown> = {
      user_id: userId,
      display_name: displayName,
      onboarding_completed: false,
      current_session: 1,
    };
    if (organizationId) {
      insertData.organization_id = organizationId;
    }

    const { data, error } = await supabase
      .from('user_profiles')
      .insert(insertData as any)
      .select()
      .single();

    if (error) {
      console.error('Error creating profile:', error);
      return null;
    }
    return data as unknown as UserProfile;
  };

  const createProgress = async (userId: string) => {
    const { data, error } = await supabase
      .from('training_progress')
      .insert({
        user_id: userId,
        session_1_completed: false,
        session_1_progress: {},
        session_2_completed: false,
        session_2_progress: {},
        session_3_completed: false,
        session_3_progress: {},
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating progress:', error);
      return null;
    }
    return data as unknown as TrainingProgress;
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        // Defer profile fetch with setTimeout to avoid deadlock
        if (session?.user) {
          setTimeout(async () => {
            const profileData = await fetchProfile(session.user.id);
            setProfile(profileData);
            
            const progressData = await fetchProgress(session.user.id);
            setProgress(progressData);
            
            setLoading(false);
          }, 0);
        } else {
          setProfile(null);
          setProgress(null);
          setLoading(false);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchProfile(session.user.id).then(setProfile);
        fetchProgress(session.user.id).then(setProgress);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, displayName: string, organizationId?: string) => {
    try {
      const redirectUrl = `${window.location.origin}/onboarding`;

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
        },
      });

      if (error) throw error;

      // Create profile for the new user (with org assignment if provided)
      if (data.user) {
        await createProfile(data.user.id, displayName, organizationId);
        await createProgress(data.user.id);
      }

      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Check if user is deactivated
      if (data?.user) {
        const { data: profileCheck } = await (supabase
          .from('user_profiles')
          .select('is_active')
          .eq('user_id', data.user.id)
          .maybeSingle() as any);
        if (profileCheck?.is_active === false) {
          await supabase.auth.signOut();
          return { error: new Error('Your account has been deactivated. Please contact your administrator.') };
        }
      }

      // Update last_login_at
      if (data.user) {
        await supabase
          .from('user_profiles')
          .update({ last_login_at: new Date().toISOString() })
          .eq('user_id', data.user.id);
      }

      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
    setProgress(null);
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return { error: new Error('Not authenticated') };

    try {
      const { error } = await supabase
        .from('user_profiles')
        .update(updates as any)
        .eq('user_id', user.id);

      if (error) throw error;

      // Refresh profile
      const updatedProfile = await fetchProfile(user.id);
      setProfile(updatedProfile);

      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const refreshProfile = async () => {
    if (!user) return;
    const profileData = await fetchProfile(user.id);
    setProfile(profileData);
    const progressData = await fetchProgress(user.id);
    setProgress(progressData);
  };

  const updateProgress = async (updates: Partial<TrainingProgress>) => {
    if (!user) return { error: new Error('Not authenticated') };

    try {
      const { error } = await supabase
        .from('training_progress')
        .update(updates as Record<string, unknown>)
        .eq('user_id', user.id);

      if (error) throw error;

      // Refresh progress
      const updatedProgress = await fetchProgress(user.id);
      setProgress(updatedProgress);

      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const markSessionCompleted = async (sessionNumber: 1 | 2 | 3) => {
    if (!user) return { error: new Error('Not authenticated') };

    const completedKey = `session_${sessionNumber}_completed` as const;
    const updates: Partial<TrainingProgress> = {
      [completedKey]: true,
    };

    // Also advance the current session if applicable
    const profileUpdates: Partial<UserProfile> = {};
    if (profile && profile.current_session === sessionNumber && sessionNumber < 3) {
      profileUpdates.current_session = sessionNumber + 1;
    }

    try {
      const { error: progressError } = await supabase
        .from('training_progress')
        .update(updates as Record<string, unknown>)
        .eq('user_id', user.id);

      if (progressError) throw progressError;

      // Update current_session in profile if needed
      if (Object.keys(profileUpdates).length > 0) {
        const { error: profileError } = await supabase
          .from('user_profiles')
          .update(profileUpdates as any)
          .eq('user_id', user.id);

        if (profileError) throw profileError;
      }

      // Refresh both profile and progress
      const updatedProfile = await fetchProfile(user.id);
      setProfile(updatedProfile);
      const updatedProgress = await fetchProgress(user.id);
      setProgress(updatedProgress);

      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        progress,
        loading,
        signUp,
        signIn,
        signOut,
        updateProfile,
        refreshProfile,
        updateProgress,
        markSessionCompleted,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
