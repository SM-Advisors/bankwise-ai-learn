import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface PracticeMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface PracticeConversation {
  id: string;
  user_id: string;
  session_id: string;
  module_id: string;
  title: string;
  messages: PracticeMessage[];
  is_submitted: boolean;
  created_at: string;
  updated_at: string;
}

export function usePracticeConversations(sessionId: string, moduleId: string | null) {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<PracticeConversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch all conversations for this user + module
  const fetchConversations = useCallback(async () => {
    if (!user?.id || !moduleId) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('practice_conversations')
        .select('*')
        .eq('user_id', user.id)
        .eq('session_id', sessionId)
        .eq('module_id', moduleId)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      const parsed: PracticeConversation[] = (data || []).map((row) => ({
        ...row,
        messages: (Array.isArray(row.messages) ? row.messages : []) as unknown as PracticeMessage[],
      }));

      setConversations(parsed);

      // Auto-select most recent conversation, or none if empty
      if (parsed.length > 0 && !activeConversationId) {
        // If the most recent conversation has messages and is not submitted, resume it
        const mostRecent = parsed[0];
        if (mostRecent.messages.length > 0 && !mostRecent.is_submitted) {
          setActiveConversationId(mostRecent.id);
        }
        // Otherwise leave activeConversationId as null (shows empty state)
      }
    } catch (err) {
      console.error('Error fetching practice conversations:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, sessionId, moduleId, activeConversationId]);

  // Fetch on mount and when module changes
  useEffect(() => {
    setActiveConversationId(null);
    setConversations([]);
    fetchConversations();
  }, [user?.id, sessionId, moduleId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Get the active conversation's messages
  const activeConversation = conversations.find(c => c.id === activeConversationId) || null;
  const activeMessages = activeConversation?.messages || [];

  // Create a new conversation
  const createConversation = useCallback(async (firstMessage?: PracticeMessage): Promise<string | null> => {
    if (!user?.id || !moduleId) return null;

    try {
      const messages = firstMessage ? [firstMessage] : [];
      const title = firstMessage
        ? firstMessage.content.slice(0, 50) + (firstMessage.content.length > 50 ? '...' : '')
        : 'New Conversation';

      const { data, error } = await (supabase
        .from('practice_conversations') as any)
        .insert({
          user_id: user.id,
          session_id: sessionId,
          module_id: moduleId,
          title,
          messages: messages as unknown as Record<string, unknown>[],
        })
        .select()
        .single();

      if (error) throw error;

      const newConv: PracticeConversation = {
        ...data,
        messages: messages,
      };

      setConversations(prev => [newConv, ...prev]);
      setActiveConversationId(data.id);
      return data.id;
    } catch (err) {
      console.error('Error creating conversation:', err);
      return null;
    }
  }, [user?.id, sessionId, moduleId]);

  // Append a message to the active conversation (or a specific one by ID)
  const appendMessage = useCallback(async (message: PracticeMessage, targetConversationId?: string) => {
    const convId = targetConversationId || activeConversationId;
    if (!convId) return;

    // Compute updated messages synchronously from current state snapshot
    // BEFORE calling setConversations, so Supabase gets the correct array.
    setConversations(prev => {
      const conv = prev.find(c => c.id === convId);
      if (!conv) return prev;

      const messagesForDb = [...conv.messages, message];

      // Update title if this is the first user message
      const isFirstUserMessage = conv.messages.length === 0 && message.role === 'user';
      const titleForDb = isFirstUserMessage
        ? message.content.slice(0, 50) + (message.content.length > 50 ? '...' : '')
        : undefined;

      // Fire-and-forget the Supabase write inside the updater so we have the
      // correct messagesForDb value captured in this closure.
      const updates: Record<string, unknown> = {
        messages: messagesForDb as unknown as Record<string, unknown>[],
      };
      if (titleForDb) updates.title = titleForDb;

      (supabase
        .from('practice_conversations')
        .update(updates)
        .eq('id', convId))
        .then(({ error }: { error: unknown }) => {
          if (error) console.error('Error appending practice message:', error);
        });

      return prev.map(c =>
        c.id === convId
          ? { ...c, messages: messagesForDb, title: titleForDb || c.title }
          : c
      );
    });
  }, [activeConversationId]);

  // Mark a conversation as submitted for review
  const markSubmitted = useCallback(async (conversationId?: string) => {
    const targetId = conversationId || activeConversationId;
    if (!targetId) return;

    setConversations(prev =>
      prev.map(c =>
        c.id === targetId ? { ...c, is_submitted: true } : c
      )
    );

    try {
      const { error } = await supabase
        .from('practice_conversations')
        .update({ is_submitted: true })
        .eq('id', targetId);

      if (error) throw error;
    } catch (err) {
      console.error('Error marking conversation as submitted:', err);
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
    markSubmitted,
    startNewChat,
    selectConversation,
  };
}
