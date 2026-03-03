import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface AgentTestChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export function useAgentTestChat() {
  const sendMessage = useCallback(async (
    systemPrompt: string,
    messages: AgentTestChatMessage[],
    agentId?: string,
    testType?: string
  ): Promise<{ reply: string } | { error: string }> => {
    try {
      const response = await supabase.functions.invoke('agent-test-chat', {
        body: {
          systemPrompt,
          messages,
          agentId: agentId || '',
          testType: testType || 'freeform',
        },
      });

      if (response.error) {
        return { error: response.error.message || 'Agent test chat failed' };
      }

      return { reply: response.data?.reply || 'No response generated.' };
    } catch (err) {
      console.error('Agent test chat error:', err);
      return { error: err instanceof Error ? err.message : 'Unknown error' };
    }
  }, []);

  return { sendMessage };
}
