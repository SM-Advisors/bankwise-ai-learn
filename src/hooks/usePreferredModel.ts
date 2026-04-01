import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { DEFAULT_MODEL } from '@/lib/models';

interface UsePreferredModelResult {
  preferredModel: string;
  setPreferredModel: (modelId: string) => Promise<void>;
}

export function usePreferredModel(allowedModels: string[]): UsePreferredModelResult {
  const { user, profile } = useAuth();
  const rawPreferred = (profile as unknown as Record<string, unknown>)?.preferred_model as string | undefined;

  // Stabilize allowedModels to avoid re-running effect on every render
  const allowedModelsKey = allowedModels.join(',');
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const stableAllowedModels = useMemo(() => allowedModels, [allowedModelsKey]);

  // Validate stored preference against current allowed list; fall back to default
  const resolve = useCallback((stored: string | undefined): string => {
    if (stored && stableAllowedModels.includes(stored)) return stored;
    if (stableAllowedModels.includes(DEFAULT_MODEL)) return DEFAULT_MODEL;
    return stableAllowedModels[0] ?? DEFAULT_MODEL;
  }, [stableAllowedModels]);

  const [preferredModel, setPreferredModelState] = useState<string>(() => resolve(rawPreferred));

  // Re-resolve whenever allowedModels or the stored profile value changes
  useEffect(() => {
    setPreferredModelState(resolve(rawPreferred));
  }, [rawPreferred, resolve]);

  const setPreferredModel = useCallback(async (modelId: string) => {
    if (!user?.id) return;
    setPreferredModelState(modelId);
    await supabase
      .from('user_profiles')
      .update({ preferred_model: modelId })
      .eq('id', user.id);
  }, [user?.id]);

  return { preferredModel, setPreferredModel };
}
