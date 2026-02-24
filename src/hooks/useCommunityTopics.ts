import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export type TopicCategory = 'discussion' | 'idea' | 'friction_point' | 'shared_agent' | 'shared_workflow';

export interface CommunityTopic {
  id: string;
  user_id: string;
  author_name: string;
  author_role: string | null;
  title: string;
  body: string;
  reply_count: number;
  category: TopicCategory;
  source_type: string;
  linked_content_id: string | null;
  linked_content_type: string | null;
  created_at: string;
  updated_at: string;
}

export function useCommunityTopics() {
  const { user, profile } = useAuth();
  const [topics, setTopics] = useState<CommunityTopic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTopics = async () => {
    try {
      setLoading(true);
      const { data, error: fetchError } = await (supabase
        .from('community_topics' as any)
        .select('*')
        .order('created_at', { ascending: false }) as any);

      if (fetchError) throw fetchError;
      setTopics(data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching community topics:', err);
      setError('Failed to load topics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTopics();
  }, []);

  const createTopic = async (title: string, body: string, category: TopicCategory = 'discussion') => {
    if (!user) return { success: false, error: 'Not authenticated' };
    try {
      const firstName = (profile?.display_name || 'Anonymous').split(' ')[0];
      const role = profile?.job_role || null;

      const { error: insertError } = await (supabase
        .from('community_topics' as any)
        .insert({
          user_id: user.id,
          author_name: firstName,
          author_role: role,
          title,
          body,
          category,
        }) as any);

      if (insertError) throw insertError;
      await fetchTopics();
      return { success: true };
    } catch (err) {
      console.error('Error creating community topic:', err);
      return { success: false, error: 'Failed to create topic' };
    }
  };

  const deleteTopic = async (id: string) => {
    try {
      const { error: deleteError } = await (supabase
        .from('community_topics' as any)
        .delete()
        .eq('id', id) as any);

      if (deleteError) throw deleteError;
      await fetchTopics();
      return { success: true };
    } catch (err) {
      console.error('Error deleting community topic:', err);
      return { success: false, error: 'Failed to delete topic' };
    }
  };

  return { topics, loading, error, createTopic, deleteTopic, refetch: fetchTopics };
}
