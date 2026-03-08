import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface FeedbackParams {
  sessionId?: string;
  moduleId?: string;
  messageIndex: number;
  messagePreview?: string;
  rating: 1 | -1;
  comment?: string;
}

export function useResponseFeedback() {
  const { user } = useAuth();
  const [submitting, setSubmitting] = useState(false);

  const submitFeedback = async (params: FeedbackParams): Promise<{ success: boolean; error?: string }> => {
    if (!user?.id) return { success: false, error: 'Not authenticated' };
    setSubmitting(true);
    const { error } = await (supabase
      .from('response_feedback')
      .insert({
        user_id: user.id,
        session_id: params.sessionId || null,
        module_id: params.moduleId || null,
        message_index: params.messageIndex,
        message_preview: params.messagePreview?.slice(0, 100) || null,
        rating: params.rating,
        comment: params.comment || null,
      }));
    setSubmitting(false);
    return { success: !error, error: error?.message };
  };

  return { submitting, submitFeedback };
}
