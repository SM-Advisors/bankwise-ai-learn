import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface AIPreferences {
  id: string;
  user_id: string;
  tone: string;
  verbosity: string;
  formatting_preference: string;
  role_context: string | null;
  additional_instructions: string | null;
  created_at: string;
  updated_at: string;
}

export interface AIMemory {
  id: string;
  user_id: string;
  content: string;
  source: string | null;
  context: string | null;
  is_pinned: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const DEFAULT_PREFERENCES: Omit<AIPreferences, 'id' | 'user_id' | 'created_at' | 'updated_at'> = {
  tone: 'professional',
  verbosity: 'balanced',
  formatting_preference: 'mixed',
  role_context: null,
  additional_instructions: null,
};

export function useAIPreferences() {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<AIPreferences | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchPreferences = async () => {
    if (!user) {
      setPreferences(null);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const { data, error } = await (supabase
        .from('ai_user_preferences' as any)
        .select('*')
        .eq('user_id', user.id)
        .single() as any);

      if (error && error.code !== 'PGRST116') throw error;
      setPreferences(data || null);
    } catch (err) {
      console.error('Error fetching AI preferences:', err);
    } finally {
      setLoading(false);
    }
  };

  const savePreferences = async (updates: Partial<Omit<AIPreferences, 'id' | 'user_id' | 'created_at' | 'updated_at'>>) => {
    if (!user) return { success: false, error: 'Not authenticated' };
    try {
      const payload = {
        ...DEFAULT_PREFERENCES,
        ...updates,
        user_id: user.id,
        updated_at: new Date().toISOString(),
      };
      const { error } = await (supabase
        .from('ai_user_preferences' as any)
        .upsert(payload, { onConflict: 'user_id' }) as any);
      if (error) throw error;
      await fetchPreferences();
      return { success: true };
    } catch (err) {
      console.error('Error saving AI preferences:', err);
      return { success: false, error: 'Failed to save preferences' };
    }
  };

  useEffect(() => {
    fetchPreferences();
  }, [user]);

  return { preferences, loading, savePreferences, refetch: fetchPreferences };
}

export function useAIMemories() {
  const { user } = useAuth();
  const [memories, setMemories] = useState<AIMemory[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMemories = async () => {
    if (!user) {
      setMemories([]);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const { data, error } = await (supabase
        .from('ai_memories' as any)
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false }) as any);

      if (error) throw error;
      setMemories(data || []);
    } catch (err) {
      console.error('Error fetching AI memories:', err);
    } finally {
      setLoading(false);
    }
  };

  const createMemory = async (memory: { content: string; source?: string; context?: string }) => {
    if (!user) return { success: false, error: 'Not authenticated' };
    try {
      // Auto-pin saved memories so Andrea can see them immediately
      const { error } = await (supabase
        .from('ai_memories' as any)
        .insert({ ...memory, user_id: user.id, is_pinned: true }) as any);
      if (error) throw error;
      await fetchMemories();
      return { success: true };
    } catch (err) {
      console.error('Error creating memory:', err);
      return { success: false, error: 'Failed to save memory' };
    }
  };

  const togglePin = async (id: string, isPinned: boolean) => {
    try {
      const { error } = await (supabase
        .from('ai_memories' as any)
        .update({ is_pinned: !isPinned, updated_at: new Date().toISOString() })
        .eq('id', id) as any);
      if (error) throw error;
      await fetchMemories();
      return { success: true };
    } catch (err) {
      console.error('Error toggling pin:', err);
      return { success: false, error: 'Failed to update memory' };
    }
  };

  const deleteMemory = async (id: string) => {
    try {
      // Soft delete
      const { error } = await (supabase
        .from('ai_memories' as any)
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .eq('id', id) as any);
      if (error) throw error;
      await fetchMemories();
      return { success: true };
    } catch (err) {
      console.error('Error deleting memory:', err);
      return { success: false, error: 'Failed to delete memory' };
    }
  };

  useEffect(() => {
    fetchMemories();
  }, [user]);

  return { memories, loading, createMemory, togglePin, deleteMemory, refetch: fetchMemories };
}
