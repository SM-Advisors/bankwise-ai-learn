import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

/**
 * useGatesUnlocked
 *
 * Reads the `all_gates_unlocked` flag from `app_settings`.
 * When true, all progressive disclosure gates (zones, sessions, modules)
 * are bypassed platform-wide. Toggled by SuperAdmin.
 */
export function useGatesUnlocked(): boolean {
  const [unlocked, setUnlocked] = useState(false);

  useEffect(() => {
    supabase
      .from('app_settings')
      .select('value')
      .eq('key', 'all_gates_unlocked')
      .maybeSingle()
      .then(({ data }) => {
        setUnlocked(data?.value === 'true');
      });
  }, []);

  return unlocked;
}
