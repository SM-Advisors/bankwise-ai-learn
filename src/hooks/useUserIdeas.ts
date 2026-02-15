import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export type IdeaStatus = 'not_started' | 'needs_knowledge' | 'future';

export interface UserIdea {
  id: string;
  user_id: string;
  title: string;
  description: string;
  status: IdeaStatus;
  created_at: string;
  updated_at: string;
}

export function useUserIdeas() {
  const { user } = useAuth();
  const [ideas, setIdeas] = useState<UserIdea[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchIdeas = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const { data, error: fetchError } = await (supabase
        .from('user_ideas' as any)
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false }) as any);

      if (fetchError) throw fetchError;
      setIdeas(data || []);
    } catch (err) {
      console.error('Error fetching ideas:', err);
      setError('Failed to load ideas');
    } finally {
      setLoading(false);
    }
  };

  const createIdea = async (idea: Pick<UserIdea, 'title' | 'description' | 'status'>) => {
    if (!user) return { success: false, error: 'Not authenticated' };
    try {
      const { error: insertError } = await (supabase
        .from('user_ideas' as any)
        .insert({ ...idea, user_id: user.id }) as any);

      if (insertError) throw insertError;
      await fetchIdeas();
      return { success: true };
    } catch (err) {
      console.error('Error creating idea:', err);
      return { success: false, error: 'Failed to create idea' };
    }
  };

  const updateIdea = async (id: string, updates: Partial<Pick<UserIdea, 'title' | 'description' | 'status'>>) => {
    try {
      const { error: updateError } = await (supabase
        .from('user_ideas' as any)
        .update(updates)
        .eq('id', id) as any);

      if (updateError) throw updateError;
      await fetchIdeas();
      return { success: true };
    } catch (err) {
      console.error('Error updating idea:', err);
      return { success: false, error: 'Failed to update idea' };
    }
  };

  const deleteIdea = async (id: string) => {
    try {
      const { error: deleteError } = await (supabase
        .from('user_ideas' as any)
        .delete()
        .eq('id', id) as any);

      if (deleteError) throw deleteError;
      await fetchIdeas();
      return { success: true };
    } catch (err) {
      console.error('Error deleting idea:', err);
      return { success: false, error: 'Failed to delete idea' };
    }
  };

  useEffect(() => {
    fetchIdeas();
  }, [user]);

  return { ideas, loading, error, refetch: fetchIdeas, createIdea, updateIdea, deleteIdea };
}
