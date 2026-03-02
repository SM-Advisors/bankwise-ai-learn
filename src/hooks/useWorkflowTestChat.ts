import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface WorkflowStep {
  name: string;
  aiPromptTemplate: string;
  humanReview: boolean;
  outputDescription: string;
}

export function useWorkflowTestChat() {
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = useCallback(async (
    workflowName: string,
    currentStep: WorkflowStep,
    currentStepIndex: number,
    totalSteps: number,
    messages: Array<{ role: 'user' | 'assistant'; content: string }>,
    previousStepOutputs?: string[]
  ): Promise<{ reply: string } | { error: string }> => {
    setIsLoading(true);
    try {
      const response = await supabase.functions.invoke('workflow-test-chat', {
        body: {
          workflowName,
          currentStep,
          currentStepIndex,
          totalSteps,
          messages,
          previousStepOutputs,
        },
      });

      if (response.error) throw response.error;
      return { reply: response.data?.reply || "I'd be happy to help with this step." };
    } catch (err) {
      console.error('Workflow test chat error:', err);
      return { error: err instanceof Error ? err.message : 'Unknown error' };
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { sendMessage, isLoading };
}
