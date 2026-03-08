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
        .from('community_topics')
        .select('*, community_replies(count)')
        .order('created_at', { ascending: false }));

      if (fetchError) throw fetchError;
      // Map the embedded count to a flat reply_count field
      const mapped = (data || []).map((t) => ({
        ...t,
        reply_count: t.community_replies?.[0]?.count ?? t.reply_count ?? 0,
        community_replies: undefined, // remove the nested object
      }));
      setTopics(mapped as any);
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

      const { error: insertError } = await supabase
        .from('community_topics')
        .insert({
          user_id: user.id,
          author_name: firstName,
          author_role: role,
          title,
          body,
          category,
        });

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
      const { error: deleteError } = await supabase
        .from('community_topics')
        .delete()
        .eq('id', id);

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
