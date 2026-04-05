import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import type { UserWorkflow } from '@/types/workflow';
import { EMPTY_WORKFLOW } from '@/types/workflow';

export function useUserWorkflows() {
  const { user } = useAuth();
  const [workflows, setWorkflows] = useState<UserWorkflow[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchWorkflows = useCallback(async () => {
    if (!user?.id) return;
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_workflows')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });
      if (error) throw error;
      setWorkflows((data || []) as unknown as UserWorkflow[]);
    } catch (err) {
      console.error('Error fetching workflows:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => { fetchWorkflows(); }, [fetchWorkflows]);

  const draftWorkflow = workflows.find(w => w.status !== 'archived') || null;

  const createWorkflow = useCallback(async (data?: Partial<UserWorkflow>): Promise<string | null> => {
    if (!user?.id) return null;
    try {
      const { data: result, error } = await (supabase as any)
        .from('user_workflows')
        .insert({
          user_id: user.id,
          name: data?.name || 'My Workflow',
          description: data?.description || null,
          status: 'draft',
          workflow_data: data?.workflow_data || EMPTY_WORKFLOW,
          module_id: '3-3',
        })
        .select('id')
        .single();
      if (error) throw error;
      await fetchWorkflows();
      return result?.id || null;
    } catch (err) {
      console.error('Error creating workflow:', err);
      return null;
    }
  }, [user?.id, fetchWorkflows]);

  const updateWorkflow = useCallback(async (
    id: string,
    updates: Partial<Pick<UserWorkflow, 'name' | 'description' | 'workflow_data' | 'status' | 'test_results'>>
  ): Promise<void> => {
    if (!user?.id) return;
    setWorkflows(prev => prev.map(w => w.id === id ? { ...w, ...updates, updated_at: new Date().toISOString() } : w));
    try {
      const { error } = await (supabase as any)
        .from('user_workflows')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id);
      if (error) throw error;
    } catch (err) {
      console.error('Error updating workflow:', err);
      await fetchWorkflows();
    }
  }, [user?.id, fetchWorkflows]);

  return { workflows, draftWorkflow, isLoading, createWorkflow, updateWorkflow, fetchWorkflows };
}
