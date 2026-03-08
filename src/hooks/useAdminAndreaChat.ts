import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export type LocalMessage = { role: 'user' | 'assistant'; content: string };

const WELCOME_MESSAGE = `Welcome! I'm Andrea, your AI enablement advisor.

I have access to your organization's live training and adoption KPIs. I can help you:

• **Understand the data** — what enrollment, completion, and proficiency numbers are really telling you
• **Spot risks** — compliance exceptions, stalled departments, or adoption gaps
• **Plan next steps** — specific, prioritized actions to accelerate AI adoption
• **Build the ROI story** — how to present this data to your board

What would you like to explore first?`;

interface ConversationRow {
  id: string;
  messages: LocalMessage[];
  title: string;
  updated_at: string;
}

export function useAdminAndreaChat(organizationId: string | null) {
  const { user } = useAuth();
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<LocalMessage[]>([
    { role: 'assistant', content: WELCOME_MESSAGE },
  ]);
  const [loaded, setLoaded] = useState(false);

  // Load most recent conversation on mount
  useEffect(() => {
    if (!user?.id) return;
    (async () => {
      const { data } = await supabase
        .from('admin_andrea_conversations')
        .select('id, messages, title, updated_at')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })
        .limit(1)
        .single();

      if (data && Array.isArray(data.messages) && (data.messages).length > 0) {
        setConversationId(data.id);
        setMessages(data.messages as LocalMessage[]);
      }
      setLoaded(true);
    })();
  }, [user?.id]);

  // Persist messages whenever they change (debounced via effect)
  const saveTimeout = useRef<ReturnType<typeof setTimeout>>();
  useEffect(() => {
    if (!loaded || !user?.id) return;
    if (messages.length <= 1) return; // Don't persist just the welcome message

    clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(async () => {
      const payload = {
        user_id: user.id,
        organization_id: organizationId,
        messages: messages,
        title: messages.find(m => m.role === 'user')?.content.slice(0, 60) || 'New Conversation',
        updated_at: new Date().toISOString(),
      };

      if (conversationId) {
        await supabase
          .from('admin_andrea_conversations')
          .update(payload)
          .eq('id', conversationId);
      } else {
        const { data } = await supabase
          .from('admin_andrea_conversations')
          .insert(payload)
          .select('id')
          .single();
        if (data) setConversationId(data.id);
      }
    }, 800);

    return () => clearTimeout(saveTimeout.current);
  }, [messages, loaded, user?.id, conversationId, organizationId]);

  const addMessage = useCallback((msg: LocalMessage) => {
    setMessages(prev => [...prev, msg]);
  }, []);

  const startNewChat = useCallback(() => {
    setConversationId(null);
    setMessages([{ role: 'assistant', content: WELCOME_MESSAGE }]);
  }, []);

  return {
    messages,
    setMessages,
    addMessage,
    conversationId,
    startNewChat,
    loaded,
    WELCOME_MESSAGE,
  };
}

// ─── Notes hook ──────────────────────────────────────────────────────────────

export interface AndreaNote {
  id: string;
  summary: string;
  created_at: string;
}

export function useAdminAndreaNotes(organizationId: string | null) {
  const { user } = useAuth();
  const [notes, setNotes] = useState<AndreaNote[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotes = useCallback(async () => {
    if (!user?.id) return;
    const { data } = await supabase
      .from('admin_andrea_notes')
      .select('id, summary, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    setNotes((data as AndreaNote[]) || []);
    setLoading(false);
  }, [user?.id]);

  useEffect(() => { fetchNotes(); }, [fetchNotes]);

  const addNote = useCallback(async (summary: string) => {
    if (!user?.id) return;
    await supabase
      .from('admin_andrea_notes')
      .insert({ user_id: user.id, organization_id: organizationId, summary });
    fetchNotes();
  }, [user?.id, organizationId, fetchNotes]);

  const deleteNote = useCallback(async (id: string) => {
    await supabase.from('admin_andrea_notes').delete().eq('id', id);
    setNotes(prev => prev.filter(n => n.id !== id));
  }, []);

  return { notes, loading, addNote, deleteNote };
}
