import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppShell } from '@/components/shell';
import { useUserAgents } from '@/hooks/useUserAgents';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Bot, Send, Pencil, Loader2, ArrowRight, Share2, Copy, Check, Globe, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── AgentsZone ──────────────────────────────────────────────────────────────
//
// Persistent chat interface for the user's deployed agent.
// Unlocked after the user deploys their first agent in Session 3.
// Works like a custom GPT — the agent's system prompt drives every reply.

type Message = { role: 'user' | 'assistant'; content: string };

export default function AgentsZone() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { activeAgent, isLoading: agentsLoading, shareAgent, unshareAgent } = useUserAgents();

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [showSharePanel, setShowSharePanel] = useState(false);
  const [copied, setCopied] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to latest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || isSending || !activeAgent?.system_prompt) return;

    const userMsg: Message = { role: 'user', content: text };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput('');
    setIsSending(true);

    try {
      const response = await supabase.functions.invoke('ai-practice', {
        body: {
          messages: next.map((m) => ({ role: m.role, content: m.content })),
          moduleTitle: activeAgent.name,
          scenario: activeAgent.description || 'Help the user with their request.',
          sessionNumber: 3,
          customSystemPrompt: activeAgent.system_prompt,
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
      console.error('Agent chat error:', err);
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: "I'm having a brief connection issue. Please try again in a moment." },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  const shareUrl = activeAgent ? `${window.location.origin}/agent/${activeAgent.id}` : '';

  const copyShareLink = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleToggleShare = async () => {
    if (!activeAgent) return;
    if (activeAgent.is_shared) {
      await unshareAgent(activeAgent.id);
    } else {
      await shareAgent(activeAgent.id);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // ── No agent deployed ────────────────────────────────────────────────────
  if (!agentsLoading && !activeAgent) {
    return (
      <AppShell breadcrumbs={[{ label: 'Agents' }]}>
        <div className="flex flex-col items-center justify-center h-full gap-6 text-center px-4 py-20">
          <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Bot className="h-8 w-8 text-primary" />
          </div>
          <div className="max-w-sm">
            <h2 className="text-xl font-semibold mb-2">No agent deployed yet</h2>
            <p className="text-muted-foreground text-sm">
              Build and deploy your first agent in Session 3 — it will appear here as a persistent tool you can use any time.
            </p>
          </div>
          <Button onClick={() => navigate('/training/3')} className="gap-2">
            Go to Session 3
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </AppShell>
    );
  }

  // ── Loading ──────────────────────────────────────────────────────────────
  if (agentsLoading) {
    return (
      <AppShell breadcrumbs={[{ label: 'Agents' }]}>
        <div className="flex items-center justify-center h-full">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </AppShell>
    );
  }

  // ── Agent chat ───────────────────────────────────────────────────────────
  return (
    <AppShell breadcrumbs={[{ label: 'Agents' }]}>
      <div className="flex flex-col h-full">

        {/* Header */}
        <div className="flex items-center justify-between gap-4 px-6 py-4 border-b bg-card shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Bot className="h-5 w-5 text-primary" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm truncate">{activeAgent!.name}</span>
                <Badge variant="secondary" className="text-[10px] shrink-0">Active</Badge>
              </div>
              {activeAgent!.description && (
                <p className="text-xs text-muted-foreground truncate">{activeAgent!.description}</p>
              )}
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className={cn('gap-1.5 shrink-0', showSharePanel ? 'text-foreground' : 'text-muted-foreground hover:text-foreground')}
            onClick={() => setShowSharePanel((v) => !v)}
          >
            <Share2 className="h-3.5 w-3.5" />
            Share
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 shrink-0 text-muted-foreground hover:text-foreground"
            onClick={() => navigate('/training/3')}
          >
            <Pencil className="h-3.5 w-3.5" />
            Edit
          </Button>
        </div>

        {/* Share panel */}
        {showSharePanel && (
          <div className="px-6 py-3 border-b bg-muted/30 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {activeAgent!.is_shared ? (
                  <Globe className="h-4 w-4 text-green-600" />
                ) : (
                  <Lock className="h-4 w-4 text-muted-foreground" />
                )}
                <span className="text-sm font-medium">
                  {activeAgent!.is_shared ? 'Shared — anyone with the link can use this agent' : 'Private — only you can use this agent'}
                </span>
              </div>
              <Button
                variant={activeAgent!.is_shared ? 'outline' : 'default'}
                size="sm"
                className="shrink-0 text-xs h-7"
                onClick={handleToggleShare}
              >
                {activeAgent!.is_shared ? 'Make private' : 'Enable sharing'}
              </Button>
            </div>
            {activeAgent!.is_shared && (
              <div className="flex items-center gap-2">
                <input
                  readOnly
                  value={shareUrl}
                  className="flex-1 h-8 text-xs rounded-md border border-input bg-background px-3 text-muted-foreground"
                />
                <Button size="sm" variant="outline" className="h-8 gap-1.5 text-xs shrink-0" onClick={copyShareLink}>
                  {copied ? <Check className="h-3.5 w-3.5 text-green-600" /> : <Copy className="h-3.5 w-3.5" />}
                  {copied ? 'Copied' : 'Copy'}
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
          {messages.length === 0 && (() => {
            const starters = (activeAgent!.template_data.conversation_starters || []).filter(s => s.trim());
            return (
              <div className="flex flex-col items-center justify-center gap-4 h-full text-center">
                <Bot className="h-10 w-10 text-muted-foreground/20" />
                <p className="text-sm text-muted-foreground max-w-xs">
                  Start a conversation. Your agent will respond according to its configured instructions.
                </p>
                {starters.length > 0 && (
                  <div className="flex flex-wrap justify-center gap-2 max-w-sm">
                    {starters.map((s, i) => (
                      <button
                        key={i}
                        onClick={() => { setInput(s); }}
                        className="text-xs px-3 py-2 rounded-xl border bg-card hover:bg-muted transition-colors text-left text-foreground/80"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })()}

          {messages.map((msg, i) => (
            <div
              key={i}
              className={cn(
                'flex',
                msg.role === 'user' ? 'justify-end' : 'justify-start'
              )}
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
              placeholder={`Message ${activeAgent!.name}…`}
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
