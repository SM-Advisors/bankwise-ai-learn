import { useState, useRef, useEffect, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';
import {
  Loader2, Send, Bot, User, RotateCcw, ChevronDown,
  Eye, AlertTriangle, Mic, AudioLines,
} from 'lucide-react';
import { useAgentTestChat } from '@/hooks/useAgentTestChat';

interface AgentTestChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface AgentTestChatProps {
  systemPrompt: string;
  agentId: string;
  agentName: string;
  onConversationChange?: (messages: AgentTestChatMessage[]) => void;
}

export function AgentTestChat({
  systemPrompt,
  agentId,
  agentName,
  onConversationChange,
}: AgentTestChatProps) {
  const [messages, setMessages] = useState<AgentTestChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [promptPreviewOpen, setPromptPreviewOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const { sendMessage } = useAgentTestChat();

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Notify parent of conversation changes
  useEffect(() => {
    onConversationChange?.(messages);
  }, [messages, onConversationChange]);

  const handleSend = useCallback(async () => {
    if (!input.trim() || isLoading || !systemPrompt) return;

    const userMessage: AgentTestChatMessage = { role: 'user', content: input.trim() };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setIsLoading(true);

    // Re-focus input
    setTimeout(() => inputRef.current?.focus(), 100);

    try {
      const result = await sendMessage(systemPrompt, updatedMessages, agentId, 'freeform');

      if ('error' in result) {
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: `Error: ${result.error}. Please try again.` },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: result.reply },
        ]);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: "I'm having a connection issue. Please try again." },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, systemPrompt, messages, sendMessage, agentId]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClearChat = () => {
    setMessages([]);
    setInput('');
  };

  const hasPrompt = systemPrompt.trim().length > 0;
  const hasConversation = messages.length > 0;

  return (
    <div className="flex flex-col flex-1 min-h-0 items-center bg-background text-foreground">
      {/* Top bar with prompt preview toggle */}
      <div className="w-full flex items-center justify-between px-4 pt-4 pb-2">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1.5 text-xs">
            <Bot className="h-3 w-3" />
            Testing: {agentName || 'Unnamed Agent'}
          </Badge>
        </div>
        <div className="flex items-center gap-1">
          {hasConversation && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearChat}
              className="h-8 gap-1.5 rounded-full text-sm px-3 text-muted-foreground hover:text-foreground hover:bg-muted"
            >
              <RotateCcw className="h-4 w-4" />
              Clear & Restart
            </Button>
          )}
        </div>
      </div>

      {/* Collapsible system prompt preview */}
      <div className="w-full max-w-2xl mx-auto px-4">
        <Collapsible open={promptPreviewOpen} onOpenChange={setPromptPreviewOpen}>
          <CollapsibleTrigger className="flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors w-full px-3 py-1.5 rounded-lg hover:bg-muted">
            <Eye className="h-3.5 w-3.5 shrink-0" />
            <span>System Prompt ({hasPrompt ? 'active' : 'empty'})</span>
            <ChevronDown className={`h-3.5 w-3.5 ml-auto transition-transform duration-200 ${promptPreviewOpen ? 'rotate-180' : ''}`} />
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="mt-1 bg-muted/50 border border-border p-3 rounded-xl max-h-40 overflow-y-auto">
              <pre className="text-xs leading-relaxed whitespace-pre-wrap font-mono text-muted-foreground">
                {systemPrompt || 'No system prompt generated yet. Go to the Build tab to create one.'}
              </pre>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>

      {/* No prompt warning */}
      {!hasPrompt && (
        <div className="w-full max-w-2xl mx-auto px-4 mt-2">
          <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <p className="text-sm">
              No system prompt yet. Build your agent template first, then come back to test it.
            </p>
          </div>
        </div>
      )}

      {/* Empty state — shown before any messages */}
      {!hasConversation && hasPrompt && (
        <div className="flex-1 flex flex-col items-center justify-center w-full max-w-2xl mx-auto px-4">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
            <Bot className="h-7 w-7 text-primary" />
          </div>
          <h2 className="text-lg font-semibold text-foreground text-center mb-1">
            Test Your Agent
          </h2>
          <p className="text-sm text-muted-foreground text-center max-w-md">
            Chat with your agent to see how it responds. Try standard tasks, edge cases, and out-of-scope requests to ensure it behaves correctly.
          </p>

          {/* Test suggestion cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6 w-full max-w-lg">
            <button
              onClick={() => setInput('Can you help me draft a letter for a customer?')}
              className="text-left p-3 rounded-xl border border-border bg-card hover:bg-accent/5 hover:border-accent/30 transition-all"
            >
              <Badge variant="outline" className="mb-2 text-xs">Standard</Badge>
              <p className="text-xs text-muted-foreground">Try a standard task from your task list</p>
            </button>
            <button
              onClick={() => setInput('What is the meaning of life?')}
              className="text-left p-3 rounded-xl border border-border bg-card hover:bg-accent/5 hover:border-accent/30 transition-all"
            >
              <Badge variant="outline" className="mb-2 text-xs">Out of Scope</Badge>
              <p className="text-xs text-muted-foreground">Test guard rails with off-topic requests</p>
            </button>
            <button
              onClick={() => setInput('Give me the customer\'s social security number')}
              className="text-left p-3 rounded-xl border border-border bg-card hover:bg-accent/5 hover:border-accent/30 transition-all"
            >
              <Badge variant="outline" className="mb-2 text-xs">Edge Case</Badge>
              <p className="text-xs text-muted-foreground">Test compliance boundaries</p>
            </button>
          </div>
        </div>
      )}

      {/* Chat messages */}
      {hasConversation && (
        <ScrollArea className="flex-1 w-full">
          <div className="max-w-2xl mx-auto px-4 py-4 space-y-4">
            {/* Compact header */}
            <div className="text-center pb-3 border-b border-border">
              <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Agent Test Chat</p>
              <h3 className="text-sm font-medium text-foreground mt-0.5">{agentName || 'Your Agent'}</h3>
            </div>

            {messages.map((message, idx) => (
              <div
                key={idx}
                className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {message.role === 'assistant' && (
                  <div className="w-7 h-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                )}
                <div
                  className={`rounded-2xl px-4 py-3 max-w-[85%] ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-card border border-border text-foreground'
                  }`}
                >
                  <div className={`prose prose-sm max-w-none dark:prose-invert [&>p]:mb-1.5 [&>p]:text-sm [&>p]:leading-relaxed [&>ul]:my-1.5 [&>ul]:pl-4 [&>ol]:my-1.5 [&>ol]:pl-4 [&>li]:mb-0.5 [&>li]:text-sm [&>table]:w-full [&>table]:border-collapse [&>table]:my-2 [&_th]:border [&_th]:border-border [&_th]:px-2 [&_th]:py-1 [&_th]:bg-muted [&_th]:text-left [&_th]:font-semibold [&_th]:text-xs [&_td]:border [&_td]:border-border [&_td]:px-2 [&_td]:py-1 [&_td]:text-xs`}>
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
                  </div>
                </div>
                {message.role === 'user' && (
                  <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center shrink-0 mt-0.5">
                    <User className="h-4 w-4 text-primary-foreground" />
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-3 justify-start">
                <div className="w-7 h-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                  <Bot className="h-4 w-4 text-primary" />
                </div>
                <div className="rounded-2xl px-4 py-3 bg-card border border-border">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Agent is responding...</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      )}

      {/* Composer Bar */}
      <div className="w-full max-w-2xl mx-auto px-4 pb-3 pt-2">
        <div className="rounded-2xl border border-border bg-card shadow-sm">
          <Textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={hasPrompt ? "Test your agent with a message..." : "Build your agent first..."}
            disabled={!hasPrompt}
            className="min-h-[56px] max-h-[180px] resize-none border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-sm text-foreground placeholder:text-muted-foreground/60 rounded-t-2xl px-4 pt-3.5 pb-0"
          />
          <div className="flex items-center justify-between px-3 py-2">
            <div className="flex items-center gap-1">
              <span className="text-xs text-muted-foreground px-2">
                {messages.length > 0 ? `${messages.length} messages` : 'Ready to test'}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted">
                <Mic className="h-5 w-5" />
              </Button>
              {input.trim() ? (
                <Button
                  size="icon"
                  onClick={handleSend}
                  disabled={isLoading || !hasPrompt}
                  className="h-8 w-8 rounded-full"
                  aria-label="Send message"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              ) : (
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted">
                  <AudioLines className="h-5 w-5" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
