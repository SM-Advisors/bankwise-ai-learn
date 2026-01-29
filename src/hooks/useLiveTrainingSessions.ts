import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface LiveTrainingSession {
  id: string;
  title: string;
  description: string | null;
  instructor: string;
  scheduled_date: string;
  duration_minutes: number;
  max_attendees: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type LiveTrainingSessionInsert = Omit<LiveTrainingSession, 'id' | 'created_at' | 'updated_at'>;
export type LiveTrainingSessionUpdate = Partial<LiveTrainingSessionInsert>;

export function useLiveTrainingSessions() {
  const [sessions, setSessions] = useState<LiveTrainingSession[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchSessions = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('live_training_sessions')
      .select('*')
      .order('scheduled_date', { ascending: true });

    if (error) {
      console.error('Error fetching live sessions:', error);
    } else {
      setSessions(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  return { sessions, loading, refetch: fetchSessions };
}

export function useAllLiveTrainingSessions() {
  const [sessions, setSessions] = useState<LiveTrainingSession[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchSessions = async () => {
    setLoading(true);
    // Use service role through RPC or direct admin access
    const { data, error } = await supabase
      .from('live_training_sessions')
      .select('*')
      .order('scheduled_date', { ascending: true });

    if (error) {
      console.error('Error fetching live sessions:', error);
    } else {
      setSessions(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const createSession = async (session: LiveTrainingSessionInsert) => {
    const { data, error } = await supabase
      .from('live_training_sessions')
      .insert(session)
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }
    await fetchSessions();
    return { success: true, data };
  };

  const updateSession = async (id: string, updates: LiveTrainingSessionUpdate) => {
    const { error } = await supabase
      .from('live_training_sessions')
      .update(updates)
      .eq('id', id);

    if (error) {
      return { success: false, error: error.message };
    }
    await fetchSessions();
    return { success: true };
  };

  const deleteSession = async (id: string) => {
    const { error } = await supabase
      .from('live_training_sessions')
      .delete()
      .eq('id', id);

    if (error) {
      return { success: false, error: error.message };
    }
    await fetchSessions();
    return { success: true };
  };

  return { 
    sessions, 
    loading, 
    createSession, 
    updateSession, 
    deleteSession,
    refetch: fetchSessions 
  };
}
