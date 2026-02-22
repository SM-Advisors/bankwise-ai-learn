import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface DashboardMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface DashboardConversation {
  id: string;
  user_id: string;
  title: string;
  messages: DashboardMessage[];
  created_at: string;
  updated_at: string;
}

export function useDashboardConversations() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<DashboardConversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch all conversations for this user
  const fetchConversations = useCallback(async () => {
    if (!user?.id) return;

    setIsLoading(true);
    try {
      const { data, error } = await (supabase
        .from('dashboard_conversations' as any)
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false }) as any);

      if (error) throw error;

      const parsed: DashboardConversation[] = (data || []).map((row: any) => ({
        ...row,
        messages: (Array.isArray(row.messages) ? row.messages : []) as DashboardMessage[],
      }));

      setConversations(parsed);

      // Auto-select most recent conversation if it has messages
      if (parsed.length > 0 && !activeConversationId) {
        const mostRecent = parsed[0];
        if (mostRecent.messages.length > 0) {
          setActiveConversationId(mostRecent.id);
        }
      }
    } catch (err) {
      console.error('Error fetching dashboard conversations:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, activeConversationId]);

  // Fetch on mount and when user changes
  useEffect(() => {
    setActiveConversationId(null);
    setConversations([]);
    fetchConversations();
  }, [user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Get the active conversation's messages
  const activeConversation = conversations.find(c => c.id === activeConversationId) || null;
  const activeMessages = activeConversation?.messages || [];

  // Create a new conversation
  const createConversation = useCallback(async (firstMessage?: DashboardMessage): Promise<string | null> => {
    if (!user?.id) return null;

    try {
      const messages = firstMessage ? [firstMessage] : [];
      const title = firstMessage
        ? firstMessage.content.slice(0, 50) + (firstMessage.content.length > 50 ? '...' : '')
        : 'New Conversation';

      const { data, error } = await (supabase
        .from('dashboard_conversations' as any)
        .insert({
          user_id: user.id,
          title,
          messages: messages as unknown as Record<string, unknown>[],
        })
        .select()
        .single() as any);

      if (error) throw error;

      const newConv: DashboardConversation = {
        ...data,
        messages: messages,
      };

      setConversations(prev => [newConv, ...prev]);
      setActiveConversationId(data.id);
      return data.id;
    } catch (err) {
      console.error('Error creating dashboard conversation:', err);
      return null;
    }
  }, [user?.id]);

  // Append a message to the active conversation (or a specific one by ID)
  const appendMessage = useCallback(async (message: DashboardMessage, targetConversationId?: string) => {
    const convId = targetConversationId || activeConversationId;
    if (!convId) return;

    let messagesForDb: DashboardMessage[] = [];
    let titleForDb: string | undefined;

    setConversations(prev => {
      const conv = prev.find(c => c.id === convId);
      if (!conv) return prev;

      messagesForDb = [...conv.messages, message];

      // Update title if this is the first user message
      const isFirstUserMessage = conv.messages.length === 0 && message.role === 'user';
      titleForDb = isFirstUserMessage
        ? message.content.slice(0, 50) + (message.content.length > 50 ? '...' : '')
        : undefined;

      return prev.map(c =>
        c.id === convId
          ? { ...c, messages: messagesForDb, title: titleForDb || c.title }
          : c
      );
    });

    // Now messagesForDb is correctly set from the functional update
    try {
      const updates: Record<string, unknown> = {
        messages: messagesForDb as unknown as Record<string, unknown>[],
      };
      if (titleForDb) {
        updates.title = titleForDb;
      }

      const { error } = await (supabase
        .from('dashboard_conversations' as any)
        .update(updates)
        .eq('id', convId) as any);

      if (error) throw error;
    } catch (err) {
      console.error('Error appending dashboard message:', err);
    }
  }, [activeConversationId]);

  // Start a new chat (deselect current, will create on first message)
  const startNewChat = useCallback(() => {
    setActiveConversationId(null);
  }, []);

  // Select an existing conversation
  const selectConversation = useCallback((conversationId: string) => {
    setActiveConversationId(conversationId);
  }, []);

  return {
    conversations,
    activeConversation,
    activeConversationId,
    activeMessages,
    isLoading,
    createConversation,
    appendMessage,
    startNewChat,
    selectConversation,
  };
}
