import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { DEFAULT_MODEL } from '@/lib/models';

interface UsePreferredModelResult {
  preferredModel: string;
  setPreferredModel: (modelId: string) => Promise<void>;
}

export function usePreferredModel(allowedModels: string[]): UsePreferredModelResult {
  const { user, profile } = useAuth();
  const rawPreferred = (profile as any)?.preferred_model as string | undefined;

  // Validate stored preference against current allowed list; fall back to default
  const resolve = (stored: string | undefined): string => {
    if (stored && allowedModels.includes(stored)) return stored;
    if (allowedModels.includes(DEFAULT_MODEL)) return DEFAULT_MODEL;
    return allowedModels[0] ?? DEFAULT_MODEL;
  };

  const [preferredModel, setPreferredModelState] = useState<string>(() => resolve(rawPreferred));

  // Re-resolve whenever allowedModels or the stored profile value changes
  useEffect(() => {
    setPreferredModelState(resolve(rawPreferred));
  }, [rawPreferred, allowedModels.join(',')]);

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
