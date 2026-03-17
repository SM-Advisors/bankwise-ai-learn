import { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Loader2, RotateCcw, Square, FileText, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useCSuiteKPIs, getLobLabel } from '@/hooks/useReporting';
import { useAdminAndreaChat, type LocalMessage } from '@/hooks/useAdminAndreaChat';
import { buildKPISnapshot, buildSystemPrompt } from './csuite-advisor/prompts';
import andreaCoach from '@/assets/andrea-coach.png';
import { useIndustryContent } from '@/hooks/useIndustryContent';

interface CSuiteAdvisorPanelProps {
  organizationId?: string | null;
  onSummarize?: (summary: string) => void;
}

export function CSuiteAdvisorPanel({ organizationId, onSummarize }: CSuiteAdvisorPanelProps) {
  const { profile } = useAuth();
  const { toast } = useToast();
  const { industrySlug } = useIndustryContent();
  const kpis = useCSuiteKPIs(organizationId || null);
  const {
    messages: localMessages,
    setMessages: setLocalMessages,
    addMessage,
    startNewChat,
    loaded,
  } = useAdminAndreaChat(organizationId || null);

  const [chatInput, setChatInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [localMessages, isLoading]);

  const handleStop = useCallback(() => {
    abortRef.current?.abort();
    setIsLoading(false);
  }, []);

  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;

    const userMsg: LocalMessage = { role: 'user', content };
    const history = [...localMessages];
    addMessage(userMsg);
    setIsLoading(true);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const kpiSnapshot = buildKPISnapshot(kpis);
      const systemPrompt = buildSystemPrompt(kpiSnapshot);

      const { data, error } = await supabase.functions.invoke('ai-practice', {
        body: {
          customSystemPrompt: systemPrompt,
          moduleTitle: 'C-Suite AI Advisor',
          scenario: 'Executive AI enablement advisory session with live KPI data.',
          messages: [...history, userMsg],
          bankRole: profile?.job_role || 'Executive',
          industrySlug,
          model: 'gpt-5.4',
        },
      });

      if (controller.signal.aborted) return;
      if (error) throw error;

      const reply = data?.reply || "I'm having trouble accessing the data right now. Please try again.";
      addMessage({ role: 'assistant', content: reply });
    } catch (err) {
      if (controller.signal.aborted) return;
      console.error('C-Suite advisor error:', err);
      addMessage({
        role: 'assistant',
        content: "I'm having a brief connection issue. Please try again.",
      });
    } finally {
      setIsLoading(false);
      abortRef.current = null;
    }
  };

  const handleChatSend = () => {
    if (!chatInput.trim() || isLoading) return;
    const content = chatInput.trim();
    setChatInput('');
    sendMessage(content);
  };

  const handleSummarize = async () => {
    if (localMessages.length <= 1 || isLoading) return;
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('ai-practice', {
        body: {
          customSystemPrompt: 'You are a concise executive summarizer. Given the following conversation between an executive and their AI advisor, produce a 2-3 sentence summary capturing the key insights, findings, and any recommended actions. Be direct and specific.',
          moduleTitle: 'Conversation Summary',
          scenario: 'Summarize this advisory conversation.',
          messages: [
            { role: 'user', content: `Please summarize this conversation:\n\n${localMessages.map(m => `${m.role === 'user' ? 'Executive' : 'Andrea'}: ${m.content}`).join('\n\n')}` },
          ],
          bankRole: 'Executive',
          industrySlug,
          model: 'gpt-5.4',
        },
      });

      if (error) throw error;
      const summary = data?.reply || 'Unable to generate summary.';
      
      if (onSummarize) {
        onSummarize(summary);
        toast({ title: 'Summary saved', description: 'Added to your Notes tab.' });
      } else {
        addMessage({ role: 'assistant', content: `**📋 Summary:**\n${summary}` });
      }
    } catch (err) {
      console.error('Summarize error:', err);
      toast({ title: 'Error', description: 'Could not generate summary.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewChat = () => {
    startNewChat();
    setChatInput('');
  };

  // Quick-start suggestion chips
  const suggestions = [
    'How is our AI adoption going overall?',
    'Which departments need the most attention?',
    'What should I present to the board?',
    'Are there any compliance risks?',
  ];

  return (
    <Card className="flex flex-col h-full min-h-[500px] overflow-hidden">
      {/* Header */}
      <div data-tour="andrea-kpi-bar" className="flex items-center gap-3 px-4 py-3 border-b bg-primary text-primary-foreground shrink-0">
        <img
          src={andreaCoach}
          alt="Andrea"
          className="h-10 w-10 rounded-full object-cover border-2 border-primary-foreground/30"
        />
        <div className="flex-1">
          <p className="text-sm font-semibold leading-none">Andrea — Executive AI Advisor</p>
          <p className="text-xs text-primary-foreground/80 mt-0.5">
            {kpis.loading ? 'Loading KPI data…' : `Analyzing ${kpis.totalEnrolled} enrolled users across ${kpis.departmentBreakdowns.length} departments`}
          </p>
        </div>
        <div className="flex items-center gap-1">
          {localMessages.length > 1 && !isLoading && (
            <button
              onClick={handleSummarize}
              className="flex items-center gap-1 text-xs text-primary-foreground/70 hover:text-primary-foreground transition-colors px-2 py-1 rounded hover:bg-primary-foreground/10"
              title="Summarize conversation"
            >
              <FileText className="h-3.5 w-3.5" />
              Summarize
            </button>
          )}
          <button
            onClick={handleNewChat}
            className="flex items-center gap-1 text-xs text-primary-foreground/70 hover:text-primary-foreground transition-colors px-2 py-1 rounded hover:bg-primary-foreground/10"
            title="Start a new conversation"
          >
            <Plus className="h-3.5 w-3.5" />
            New Chat
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {localMessages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[85%] rounded-xl px-3 py-2 text-sm leading-relaxed whitespace-pre-wrap ${
                msg.role === 'user'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-foreground'
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-muted rounded-xl px-3 py-2.5">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggestion chips — only show when there's just the welcome message */}
      {localMessages.length === 1 && !isLoading && (
        <div data-tour="andrea-suggestions" className="px-4 pb-2 flex flex-wrap gap-1.5 shrink-0">
          {suggestions.map((text) => (
            <button
              key={text}
              onClick={() => sendMessage(text)}
              className="text-xs px-3 py-1.5 rounded-full border border-border bg-background hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
            >
              {text}
            </button>
          ))}
        </div>
      )}

      {/* Input bar */}
      <div data-tour="andrea-input" className="border-t p-3 flex gap-2 shrink-0">
        <Textarea
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
          placeholder="Ask Andrea about your AI enablement data..."
          className="min-h-[40px] max-h-[120px] resize-none text-sm py-2"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleChatSend();
            }
          }}
        />
        {isLoading ? (
          <Button
            size="icon"
            variant="destructive"
            onClick={handleStop}
            className="shrink-0 self-end h-9 w-9"
            title="Stop generating"
          >
            <Square className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            size="icon"
            onClick={handleChatSend}
            disabled={!chatInput.trim()}
            className="shrink-0 self-end h-9 w-9"
          >
            <Send className="h-4 w-4" />
          </Button>
        )}
      </div>
    </Card>
  );
}
