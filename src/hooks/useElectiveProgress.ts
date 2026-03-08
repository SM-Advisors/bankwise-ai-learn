import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export interface ElectiveProgressRecord {
  id: string;
  user_id: string;
  path_id: string;
  module_id: string;
  completed: boolean;
  completed_at: string | null;
  progress_data: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

const getElectiveStoragePrefix = (userId: string) => `bankwise_elective_${userId}_`;

export function useElectiveProgress() {
  const { user } = useAuth();
  const [records, setRecords] = useState<ElectiveProgressRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProgress = useCallback(async () => {
    if (!user?.id) {
      setRecords([]);
      setLoading(false);
      return;
    }
    try {
      const { data, error } = await supabase
        .from('elective_progress' as any)
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setRecords((data as unknown as ElectiveProgressRecord[]) || []);
    } catch {
      // Fallback: read from localStorage
      const allRecords: ElectiveProgressRecord[] = [];
      const prefix = getElectiveStoragePrefix(user.id);
      for (const key of Object.keys(localStorage)) {
        if (key.startsWith(prefix)) {
          const pathId = key.replace(prefix, '');
          try {
            const moduleMap = JSON.parse(localStorage.getItem(key) || '{}') as Record<string, boolean>;
            for (const [moduleId, completed] of Object.entries(moduleMap)) {
              if (completed) {
                allRecords.push({
                  id: `${pathId}_${moduleId}`,
                  user_id: user.id,
                  path_id: pathId,
                  module_id: moduleId,
                  completed: true,
                  completed_at: null,
                  progress_data: {},
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                });
              }
            }
          } catch { /* ignore */ }
        }
      }
      setRecords(allRecords);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  const getPathProgress = useCallback((pathId: string): Record<string, boolean> => {
    const map: Record<string, boolean> = {};
    for (const r of records) {
      if (r.path_id === pathId && r.completed) {
        map[r.module_id] = true;
      }
    }
    return map;
  }, [records]);

  const markModuleComplete = useCallback(async (pathId: string, moduleId: string) => {
    if (!user?.id) return;
    try {
      const { error } = await supabase
        .from('elective_progress' as any)
        .upsert({
          user_id: user.id,
          path_id: pathId,
          module_id: moduleId,
          completed: true,
          completed_at: new Date().toISOString(),
        }, { onConflict: 'user_id,path_id,module_id' });

      if (error) throw error;
      await fetchProgress();
    } catch {
      // Fallback: save to localStorage
      const key = `${getElectiveStoragePrefix(user.id)}${pathId}`;
      const current = JSON.parse(localStorage.getItem(key) || '{}');
      current[moduleId] = true;
      localStorage.setItem(key, JSON.stringify(current));
      await fetchProgress();
    }
  }, [user?.id, fetchProgress]);

  const updateModuleProgress = useCallback(async (
    pathId: string,
    moduleId: string,
    progressData: Record<string, unknown>
  ) => {
    if (!user?.id) return;
    try {
      const { error } = await supabase
        .from('elective_progress' as any)
        .upsert({
          user_id: user.id,
          path_id: pathId,
          module_id: moduleId,
          progress_data: progressData,
        }, { onConflict: 'user_id,path_id,module_id' });

      if (error) throw error;
    } catch {
      // Silently fail for progress updates
    }
  }, [user?.id]);

  return {
    records,
    loading,
    getPathProgress,
    markModuleComplete,
    updateModuleProgress,
    refetch: fetchProgress,
  };
}
