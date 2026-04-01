import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export interface UserPrompt {
  id: string;
  user_id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  is_favorite: boolean;
  source: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

const getPromptStorageKey = (userId: string) => `bankwise_prompt_library_${userId}`;

export function useUserPrompts() {
  const { user } = useAuth();
  const [prompts, setPrompts] = useState<UserPrompt[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPrompts = useCallback(async () => {
    if (!user?.id) {
      setPrompts([]);
      setLoading(false);
      return;
    }
    try {
      const { data, error } = await supabase
        .from('user_prompts')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setPrompts((data as unknown as UserPrompt[]) || []);
    } catch (err) {
      // Fallback to localStorage if table doesn't exist yet
      const stored = localStorage.getItem(getPromptStorageKey(user.id)) || localStorage.getItem('bankwise_prompt_library');
      if (stored) {
        try {
          const local = JSON.parse(stored) as UserPrompt[];
          setPrompts(local.map((p) => ({ ...p, user_id: user.id, metadata: {}, updated_at: p.created_at })));
        } catch { /* ignore parse errors */ }
      }
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchPrompts();
  }, [fetchPrompts]);

  const createPrompt = useCallback(async (data: {
    title: string;
    content: string;
    category: string;
    tags: string[];
    source?: string;
  }): Promise<string | null> => {
    if (!user?.id) return null;
    try {
      const { data: result, error } = await supabase
        .from('user_prompts')
        .insert({
          user_id: user.id,
          title: data.title,
          content: data.content,
          category: data.category,
          tags: data.tags,
          source: data.source || null,
          is_favorite: false,
        })
        .select('id')
        .single();

      if (error) throw error;
      await fetchPrompts();
      return result?.id || null;
    } catch {
      // Fallback: save to localStorage
      const newPrompt: UserPrompt = {
        id: `prompt_${Date.now()}`,
        user_id: user.id,
        ...data,
        source: data.source || null,
        is_favorite: false,
        metadata: {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      const updated = [newPrompt, ...prompts];
      setPrompts(updated);
      localStorage.setItem(getPromptStorageKey(user.id), JSON.stringify(updated));
      return newPrompt.id;
    }
  }, [user?.id, fetchPrompts, prompts]);

  const updatePrompt = useCallback(async (id: string, updates: Partial<UserPrompt>) => {
    if (!user?.id) return;
    try {
      const { error } = await (supabase as any)
        .from(\'user_prompts\')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
      await fetchPrompts();
    } catch {
      // Fallback: update localStorage
      const updated = prompts.map((p) => (p.id === id ? { ...p, ...updates } : p));
      setPrompts(updated);
      localStorage.setItem(getPromptStorageKey(user.id), JSON.stringify(updated));
    }
  }, [user?.id, fetchPrompts, prompts]);

  const deletePrompt = useCallback(async (id: string) => {
    if (!user?.id) return;
    try {
      const { error } = await supabase
        .from('user_prompts')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
      await fetchPrompts();
    } catch {
      // Fallback: remove from localStorage
      const updated = prompts.filter((p) => p.id !== id);
      setPrompts(updated);
      localStorage.setItem(getPromptStorageKey(user.id), JSON.stringify(updated));
    }
  }, [user?.id, fetchPrompts, prompts]);

  const toggleFavorite = useCallback(async (id: string) => {
    const prompt = prompts.find((p) => p.id === id);
    if (!prompt) return;
    await updatePrompt(id, { is_favorite: !prompt.is_favorite });
  }, [prompts, updatePrompt]);

  return {
    prompts,
    loading,
    createPrompt,
    updatePrompt,
    deletePrompt,
    toggleFavorite,
    refetch: fetchPrompts,
  };
}
