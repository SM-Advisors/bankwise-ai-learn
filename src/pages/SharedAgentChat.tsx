import { useState, useRef, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { AppShell } from '@/components/shell';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Bot, Send, Loader2, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { UserAgent } from '@/types/agent';

// ─── SharedAgentChat ─────────────────────────────────────────────────────────
//
// Public (but auth-required) page for chatting with a shared agent.
// Accessible via /agent/:agentId — the agent must have is_shared = true.
// RLS policy "Users can view shared agents" allows any authenticated user to
// read shared agents, so no special server-side handling is needed.

type Message = { role: 'user' | 'assistant'; content: string };

export default function SharedAgentChat() {
  const { agentId } = useParams<{ agentId: string }>();
  const { profile } = useAuth();

  const [agent, setAgent] = useState<UserAgent | null>(null);
  const [isLoadingAgent, setIsLoadingAgent] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);

  // Fetch the shared agent
  useEffect(() => {
    if (!agentId) return;
    setIsLoadingAgent(true);
    supabase
      .from('user_agents')
      .select('*')
      .eq('id', agentId)
      .eq('is_shared', true)
      .maybeSingle()
      .then(({ data, error }) => {
        if (error || !data) {
          setNotFound(true);
        } else {
          setAgent(data as UserAgent);
        }
        setIsLoadingAgent(false);
      });
  }, [agentId]);

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || isSending || !agent?.system_prompt) return;

    const userMsg: Message = { role: 'user', content: text };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput('');
    setIsSending(true);

    try {
      const response = await supabase.functions.invoke('ai-practice', {
        body: {
          messages: next.map((m) => ({ role: m.role, content: m.content })),
          moduleTitle: agent.name,
          scenario: agent.description || 'Help the user with their request.',
          sessionNumber: 3,
          customSystemPrompt: agent.system_prompt,
          jobRole: profile?.job_role,
          departmentLob: profile?.department,
          interests: profile?.interests || undefined,
        },
      });

      const reply =
        response.data?.reply ??
        "I'm having a brief connection issue. Please try again in a moment.";

      setMessages((prev) => [...prev, { role: 'assistant', content: reply }]);
    } catch (err) {
      console.error('Shared agent chat error:', err);
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: "I'm having a brief connection issue. Please try again in a moment." },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // ── Loading ──────────────────────────────────────────────────────────────
  if (isLoadingAgent) {
    return (
      <AppShell breadcrumbs={[{ label: 'Agent' }]}>
        <div className="flex items-center justify-center h-full">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </AppShell>
    );
  }

  // ── Not found / not shared ───────────────────────────────────────────────
  if (notFound || !agent) {
    return (
      <AppShell breadcrumbs={[{ label: 'Agent' }]}>
        <div className="flex flex-col items-center justify-center h-full gap-4 text-center px-4 py-20">
          <div className="h-12 w-12 rounded-xl bg-destructive/10 flex items-center justify-center">
            <AlertTriangle className="h-6 w-6 text-destructive" />
          </div>
          <div className="max-w-sm">
            <h2 className="text-lg font-semibold mb-1">Agent not found</h2>
            <p className="text-sm text-muted-foreground">
              This agent doesn't exist or is no longer shared. Ask the owner to re-share it.
            </p>
          </div>
        </div>
      </AppShell>
    );
  }

  const starters = (agent.template_data?.conversation_starters || []).filter((s) => s.trim());

  // ── Shared agent chat ────────────────────────────────────────────────────
  return (
    <AppShell breadcrumbs={[{ label: 'Agent' }, { label: agent.name }]}>
      <div className="flex flex-col h-full">

        {/* Header */}
        <div className="flex items-center gap-3 px-6 py-4 border-b bg-card shrink-0">
          <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <Bot className="h-5 w-5 text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm truncate">{agent.name}</span>
              <Badge variant="secondary" className="text-[10px] shrink-0">Shared</Badge>
            </div>
            {agent.description && (
              <p className="text-xs text-muted-foreground truncate">{agent.description}</p>
            )}
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center gap-4 h-full text-center">
              <Bot className="h-10 w-10 text-muted-foreground/20" />
              <p className="text-sm text-muted-foreground max-w-xs">
                Start a conversation with {agent.name}.
              </p>
              {starters.length > 0 && (
                <div className="flex flex-wrap justify-center gap-2 max-w-sm">
                  {starters.map((s, i) => (
                    <button
                      key={i}
                      onClick={() => setInput(s)}
                      className="text-xs px-3 py-2 rounded-xl border bg-card hover:bg-muted transition-colors text-left text-foreground/80"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {messages.map((msg, i) => (
            <div
              key={i}
              className={cn('flex', msg.role === 'user' ? 'justify-end' : 'justify-start')}
            >
              <div
                className={cn(
                  'max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed',
                  msg.role === 'user'
                    ? 'bg-primary text-primary-foreground rounded-br-sm'
                    : 'bg-muted text-foreground rounded-bl-sm'
                )}
              >
                {msg.content}
              </div>
            </div>
          ))}

          {isSending && (
            <div className="flex justify-start">
              <div className="bg-muted rounded-2xl rounded-bl-sm px-4 py-3">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="border-t bg-card px-4 py-3 shrink-0">
          <div className="flex items-end gap-2 max-w-3xl mx-auto">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Message ${agent.name}…`}
              rows={1}
              className="resize-none min-h-[40px] max-h-[120px] flex-1 text-sm"
              disabled={isSending}
            />
            <Button
              size="icon"
              onClick={sendMessage}
              disabled={!input.trim() || isSending}
              className="shrink-0 h-10 w-10"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-center text-[10px] text-muted-foreground mt-2">
            Press Enter to send · Shift+Enter for new line
          </p>
        </div>
      </div>
    </AppShell>
  );
}
