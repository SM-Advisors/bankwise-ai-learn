import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { UserAgent, AgentTemplateData, AgentTestConversation } from '@/types/agent';
import { EMPTY_TEMPLATE } from '@/types/agent';

export function useUserAgents() {
  const { user } = useAuth();
  const [agents, setAgents] = useState<UserAgent[]>([]);
  const [testConversations, setTestConversations] = useState<AgentTestConversation[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch all agents for this user
  const fetchAgents = useCallback(async () => {
    if (!user?.id) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_agents')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      const parsed: UserAgent[] = (data || []).map((row: Record<string, unknown>) => ({
        ...row,
        template_data: (row.template_data || EMPTY_TEMPLATE) as AgentTemplateData,
      }));

      setAgents(parsed);
    } catch (err) {
      console.error('Error fetching agents:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchAgents();
  }, [fetchAgents]);

  // Derived: active (deployed) agent
  const activeAgent = agents.find((a) => a.is_deployed && a.status !== 'archived') || null;

  // Derived: most recent draft/testing agent
  const draftAgent = agents.find((a) => a.status === 'draft' || a.status === 'testing') || null;

  // Create a new agent
  const createAgent = useCallback(async (data?: Partial<UserAgent>): Promise<string | null> => {
    if (!user?.id) return null;

    try {
      const { data: result, error } = await (supabase
        .from('user_agents' as never))
        .insert({
          user_id: user.id,
          name: data?.name || 'My Agent',
          description: data?.description || null,
          status: 'draft',
          template_data: data?.template_data || EMPTY_TEMPLATE,
          system_prompt: data?.system_prompt || '',
        })
        .select('id')
        .single();

      if (error) throw error;
      await fetchAgents();
      return result?.id || null;
    } catch (err) {
      console.error('Error creating agent:', err);
      return null;
    }
  }, [user?.id, fetchAgents]);

  // Update an existing agent
  const updateAgent = useCallback(async (
    id: string,
    updates: Partial<Pick<UserAgent, 'name' | 'description' | 'template_data' | 'system_prompt' | 'status' | 'last_test_results'>>
  ): Promise<void> => {
    if (!user?.id) return;

    try {
      const { error } = await (supabase
        .from('user_agents' as never))
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      // Update local state immediately
      setAgents((prev) =>
        prev.map((a) => (a.id === id ? { ...a, ...updates, updated_at: new Date().toISOString() } : a))
      );
    } catch (err) {
      console.error('Error updating agent:', err);
    }
  }, [user?.id]);

  // Deploy an agent (sets is_deployed, unsets others)
  const deployAgent = useCallback(async (id: string): Promise<void> => {
    if (!user?.id) return;

    try {
      // First, undeploy all other agents
      await supabase
        .from('user_agents')
        .update({ is_deployed: false, status: 'draft' })
        .eq('user_id', user.id)
        .eq('is_deployed', true);

      // Deploy the target agent
      const { error } = await (supabase
        .from('user_agents')
        .update({
          is_deployed: true,
          deployed_at: new Date().toISOString(),
          status: 'active',
        })
        .eq('id', id)
        .eq('user_id', user.id));

      if (error) throw error;
      await fetchAgents();
    } catch (err) {
      console.error('Error deploying agent:', err);
    }
  }, [user?.id, fetchAgents]);

  // Share an agent (makes it readable by any authenticated user via link)
  const shareAgent = useCallback(async (id: string): Promise<void> => {
    if (!user?.id) return;
    try {
      const { error } = await supabase
        .from('user_agents')
        .update({ is_shared: true, shared_at: new Date().toISOString() })
        .eq('id', id)
        .eq('user_id', user.id);
      if (error) throw error;
      await fetchAgents();
    } catch (err) {
      console.error('Error sharing agent:', err);
    }
  }, [user?.id, fetchAgents]);

  // Unshare an agent
  const unshareAgent = useCallback(async (id: string): Promise<void> => {
    if (!user?.id) return;
    try {
      const { error } = await supabase
        .from('user_agents')
        .update({ is_shared: false })
        .eq('id', id)
        .eq('user_id', user.id);
      if (error) throw error;
      await fetchAgents();
    } catch (err) {
      console.error('Error unsharing agent:', err);
    }
  }, [user?.id, fetchAgents]);

  // Undeploy an agent
  const undeployAgent = useCallback(async (id: string): Promise<void> => {
    if (!user?.id) return;

    try {
      const { error } = await supabase
        .from('user_agents')
        .update({ is_deployed: false, status: 'draft' })
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
      await fetchAgents();
    } catch (err) {
      console.error('Error undeploying agent:', err);
    }
  }, [user?.id, fetchAgents]);

  // Fetch test conversations for a specific agent
  const fetchTestConversations = useCallback(async (agentId: string) => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('agent_test_conversations')
        .select('*')
        .eq('agent_id', agentId)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTestConversations((data || []) as AgentTestConversation[]);
    } catch (err) {
      console.error('Error fetching test conversations:', err);
    }
  }, [user?.id]);

  // Create a test conversation
  const createTestConversation = useCallback(async (
    agentId: string,
    testType: AgentTestConversation['test_type'] = 'freeform'
  ): Promise<string | null> => {
    if (!user?.id) return null;

    try {
      const { data, error } = await supabase
        .from('agent_test_conversations')
        .insert({
          user_id: user.id,
          agent_id: agentId,
          test_type: testType,
          messages: [],
        })
        .select('id')
        .single();

      if (error) throw error;
      return data?.id || null;
    } catch (err) {
      console.error('Error creating test conversation:', err);
      return null;
    }
  }, [user?.id]);

  // Append a message to a test conversation
  const appendTestMessage = useCallback(async (
    conversationId: string,
    message: { role: 'user' | 'assistant'; content: string }
  ): Promise<void> => {
    if (!user?.id) return;

    // Update local state first for responsiveness
    setTestConversations((prev) =>
      prev.map((c) =>
        c.id === conversationId
          ? { ...c, messages: [...c.messages, message] }
          : c
      )
    );

    try {
      // Fetch current messages, append, and update
      const { data: current, error: fetchError } = await supabase
        .from('agent_test_conversations')
        .select('messages')
        .eq('id', conversationId)
        .single();

      if (fetchError) throw fetchError;

      const updatedMessages = [...((current?.messages as unknown as Record<string, unknown>[]) || []), message];
      const { error } = await (supabase
        .from('agent_test_conversations' as never))
        .update({ messages: updatedMessages })
        .eq('id', conversationId);

      if (error) throw error;
    } catch (err) {
      console.error('Error appending test message:', err);
    }
  }, [user?.id]);

  return {
    agents,
    activeAgent,
    draftAgent,
    isLoading,
    testConversations,
    createAgent,
    updateAgent,
    deployAgent,
    undeployAgent,
    shareAgent,
    unshareAgent,
    fetchAgents,
    fetchTestConversations,
    createTestConversation,
    appendTestMessage,
  };
}
