import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface CommunityReply {
  id: string;
  topic_id: string;
  user_id: string;
  author_name: string;
  author_role: string | null;
  body: string;
  created_at: string;
}

export function useCommunityReplies(topicId: string | null) {
  const { user, profile } = useAuth();
  const [replies, setReplies] = useState<CommunityReply[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchReplies = async () => {
    if (!topicId) {
      setReplies([]);
      return;
    }
    try {
      setLoading(true);
      const { data, error: fetchError } = await (supabase
        .from('community_replies' as any)
        .select('*')
        .eq('topic_id', topicId)
        .order('created_at', { ascending: true }) as any);

      if (fetchError) throw fetchError;
      setReplies(data || []);
    } catch (err) {
      console.error('Error fetching community replies:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReplies();
  }, [topicId]);

  const createReply = async (body: string) => {
    if (!user || !topicId) return { success: false, error: 'Not authenticated or no topic selected' };
    try {
      const firstName = (profile?.display_name || 'Anonymous').split(' ')[0];
      const role = profile?.job_role || null;

      const { error: insertError } = await (supabase
        .from('community_replies' as any)
        .insert({
          topic_id: topicId,
          user_id: user.id,
          author_name: firstName,
          author_role: role,
          body,
        }) as any);

      if (insertError) throw insertError;
      await fetchReplies();
      return { success: true };
    } catch (err) {
      console.error('Error creating community reply:', err);
      return { success: false, error: 'Failed to create reply' };
    }
  };

  const deleteReply = async (id: string) => {
    try {
      const { error: deleteError } = await (supabase
        .from('community_replies' as any)
        .delete()
        .eq('id', id) as any);

      if (deleteError) throw deleteError;
      await fetchReplies();
      return { success: true };
    } catch (err) {
      console.error('Error deleting community reply:', err);
      return { success: false, error: 'Failed to delete reply' };
    }
  };

  return { replies, loading, createReply, deleteReply, refetch: fetchReplies };
}
