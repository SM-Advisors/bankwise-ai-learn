import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface UserProgressRow {
  user_id: string;
  display_name: string | null;
  bank_role: string | null;
  line_of_business: string | null;
  ai_proficiency_level: number | null;
  session_1_completed: boolean;
  session_2_completed: boolean;
  session_3_completed: boolean;
}

export interface PromptEventStats {
  total_prompts: number;
  total_exceptions: number;
  by_session: Record<number, number>;
  by_exception_type: Record<string, number>;
}

export function useReporting() {
  const [userProgress, setUserProgress] = useState<UserProgressRow[]>([]);
  const [promptStats, setPromptStats] = useState<PromptEventStats>({
    total_prompts: 0,
    total_exceptions: 0,
    by_session: {},
    by_exception_type: {},
  });
  const [loading, setLoading] = useState(true);

  const fetchReporting = async () => {
    try {
      setLoading(true);

      // Fetch user profiles with training progress (joined)
      const { data: profiles } = await (supabase
        .from('user_profiles' as any)
        .select('user_id, display_name, bank_role, line_of_business, ai_proficiency_level')
        .eq('onboarding_completed', true) as any);

      const { data: progressData } = await (supabase
        .from('training_progress' as any)
        .select('user_id, session_1_completed, session_2_completed, session_3_completed') as any);

      // Join profiles with progress
      const progressMap = new Map<string, any>();
      (progressData || []).forEach((p: any) => {
        progressMap.set(p.user_id, p);
      });

      const combined: UserProgressRow[] = (profiles || []).map((profile: any) => {
        const prog = progressMap.get(profile.user_id);
        return {
          user_id: profile.user_id,
          display_name: profile.display_name,
          bank_role: profile.bank_role,
          line_of_business: profile.line_of_business,
          ai_proficiency_level: profile.ai_proficiency_level,
          session_1_completed: prog?.session_1_completed || false,
          session_2_completed: prog?.session_2_completed || false,
          session_3_completed: prog?.session_3_completed || false,
        };
      });
      setUserProgress(combined);

      // Fetch prompt event stats
      const { data: events } = await (supabase
        .from('prompt_events' as any)
        .select('event_type, session_id, exception_flag, exception_type') as any);

      if (events && events.length > 0) {
        const total_prompts = events.filter((e: any) => e.event_type === 'prompt_submitted').length;
        const total_exceptions = events.filter((e: any) => e.exception_flag).length;

        const by_session: Record<number, number> = {};
        const by_exception_type: Record<string, number> = {};

        events.forEach((e: any) => {
          if (e.session_id) {
            by_session[e.session_id] = (by_session[e.session_id] || 0) + 1;
          }
          if (e.exception_flag && e.exception_type) {
            by_exception_type[e.exception_type] = (by_exception_type[e.exception_type] || 0) + 1;
          }
        });

        setPromptStats({ total_prompts, total_exceptions, by_session, by_exception_type });
      }
    } catch (err) {
      console.error('Error fetching reporting data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReporting();
  }, []);

  return { userProgress, promptStats, loading, refetch: fetchReporting };
}

export function useAllIdeas() {
  const [ideas, setIdeas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchIdeas = async () => {
    try {
      setLoading(true);
      const { data, error } = await (supabase
        .from('user_ideas' as any)
        .select('*')
        .order('created_at', { ascending: false }) as any);

      if (error) throw error;
      setIdeas(data || []);
    } catch (err) {
      console.error('Error fetching all ideas:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateIdeaStatus = async (id: string, status: string) => {
    try {
      const { error } = await (supabase
        .from('user_ideas' as any)
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id) as any);
      if (error) throw error;
      await fetchIdeas();
      return { success: true };
    } catch (err) {
      console.error('Error updating idea status:', err);
      return { success: false, error: 'Failed to update idea' };
    }
  };

  useEffect(() => {
    fetchIdeas();
  }, []);

  return { ideas, loading, updateIdeaStatus, refetch: fetchIdeas };
}
