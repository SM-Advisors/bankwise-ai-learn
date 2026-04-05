import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

type SignalType =
  | 'use_case_identified'
  | 'workflow_built'
  | 'time_saved_estimate'
  | 'skill_applied'
  | 'community_contribution';

export function useValueSignals() {
  const { user, profile } = useAuth();

  const emitSignal = async (
    signalType: SignalType,
    signalData: Record<string, unknown> = {}
  ) => {
    if (!user?.id) return;
    try {
      await (supabase as any).from('value_signals').insert({
        user_id: user.id,
        org_id: profile?.organization_id ?? null,
        signal_type: signalType,
        signal_data: signalData,
      });
    } catch (err) {
      // Non-blocking — signal failure must never disrupt the learning flow
      console.warn('[value_signals] insert failed silently:', err);
    }
  };

  return { emitSignal };
}
