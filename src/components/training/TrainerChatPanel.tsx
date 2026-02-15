import { useRef, useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Loader2, Send, ChevronLeft, ChevronRight, Copy, Check } from 'lucide-react';
import andreaCoach from '@/assets/andrea-coach.png';
import { type Message } from '@/types/training';

interface TrainerChatPanelProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  messages: Message[];
  input: string;
  onInputChange: (value: string) => void;
  onSubmit: () => void;
  onQuickAction: (prompt: string) => void;
  isLoading: boolean;
  suggestedPrompts?: string[];
}

type QuickActionType = 'review' | 'example' | 'hint' | null;

export function TrainerChatPanel({
  collapsed,
  onToggleCollapse,
  messages,
  input,
  onInputChange,
  onSubmit,
  onQuickAction,
  isLoading,
  suggestedPrompts,
}: TrainerChatPanelProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [activeQuickAction, setActiveQuickAction] = useState<QuickActionType>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Reset active quick action when loading completes
  useEffect(() => {
    if (!isLoading) {
      setActiveQuickAction(null);
    }
  }, [isLoading]);

  const handleQuickActionClick = (prompt: string, actionType: QuickActionType) => {
    setActiveQuickAction(actionType);
    onQuickAction(prompt);
  };

  const handleCopy = async (content: string, index: number) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch {
      // Clipboard API may not be available
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSubmit();
    }
  };

  const formatTimestamp = () => {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <aside
      className={`border-l bg-card transition-all duration-300 flex flex-col ${collapsed ? 'w-12' : 'w-96'}`}
      aria-label="AI Training Coach panel"
    >
      <div className="p-3 border-b flex items-center justify-between shrink-0">
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleCollapse}
          aria-label={collapsed ? 'Expand coach panel' : 'Collapse coach panel'}
          aria-expanded={!collapsed}
        >
          {collapsed ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </Button>
        {!collapsed && (
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarImage src={andreaCoach} alt="Andrea" />
              <AvatarFallback>A</AvatarFallback>
            </Avatar>
            <span className="font-medium text-sm">Andrea - AI Coach</span>
          </div>
        )}
      </div>

      {!collapsed && (
        <>
          {/* Messages - scrollable area */}
          <ScrollArea className="flex-1">
            <div className="p-3 space-y-3">
              {messages.map((message, idx) => (
                <div
                  key={idx}
                  className={`group relative rounded-lg ${
                    message.role === 'assistant'
                      ? 'p-3 bg-muted'
                      : 'p-3 bg-primary text-primary-foreground ml-4'
                  }`}
                >
                  {message.role === 'assistant' && (
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-5 w-5">
                          <AvatarImage src={andreaCoach} alt="Andrea" />
                          <AvatarFallback>A</AvatarFallback>
                        </Avatar>
                        <span className="text-xs font-medium text-muted-foreground">Andrea</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] text-muted-foreground/60">{formatTimestamp()}</span>
                        <button
                          onClick={() => handleCopy(message.content, idx)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-background/50"
                          title="Copy response"
                        >
                          {copiedIndex === idx ? (
                            <Check className="h-3 w-3 text-green-500" />
                          ) : (
                            <Copy className="h-3 w-3 text-muted-foreground" />
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                  {message.role === 'user' && (
                    <div className="flex justify-end mb-1">
                      <span className="text-[10px] opacity-60">{formatTimestamp()}</span>
                    </div>
                  )}
                  <div className={`prose prose-sm max-w-none ${message.role === 'assistant' ? 'dark:prose-invert' : ''} [&>h1]:text-base [&>h1]:font-bold [&>h1]:mt-3 [&>h1]:mb-2 [&>h2]:text-sm [&>h2]:font-semibold [&>h2]:mt-2 [&>h2]:mb-1 [&>h3]:text-sm [&>h3]:font-semibold [&>h3]:mt-2 [&>h3]:mb-1 [&>p]:mb-1.5 [&>p]:text-sm [&>p]:leading-relaxed [&>ul]:my-1.5 [&>ul]:pl-4 [&>ol]:my-1.5 [&>ol]:pl-4 [&>li]:mb-0.5 [&>li]:text-sm [&>table]:w-full [&>table]:border-collapse [&>table]:my-2 [&_th]:border [&_th]:border-border [&_th]:px-2 [&_th]:py-1 [&_th]:bg-muted [&_th]:text-left [&_th]:font-semibold [&_th]:text-xs [&_td]:border [&_td]:border-border [&_td]:px-2 [&_td]:py-1 [&_td]:text-xs`}>
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="p-3 rounded-lg bg-muted flex items-center gap-2">
                  <Avatar className="h-5 w-5">
                    <AvatarImage src={andreaCoach} alt="Andrea" />
                    <AvatarFallback>A</AvatarFallback>
                  </Avatar>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm text-muted-foreground">Thinking...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Suggested Prompts (from Andrea's response) */}
          {suggestedPrompts && suggestedPrompts.length > 0 && !isLoading && (
            <div className="px-3 py-2 border-t bg-primary/5">
              <p className="text-[10px] text-muted-foreground mb-1.5 font-medium uppercase tracking-wide">Suggested next</p>
              <div className="flex flex-col gap-1">
                {suggestedPrompts.map((prompt, idx) => (
                  <button
                    key={idx}
                    className="text-left text-xs px-2.5 py-1.5 rounded-md border bg-background hover:bg-muted transition-colors text-foreground/80 hover:text-foreground line-clamp-2"
                    onClick={() => onQuickAction(prompt)}
                    disabled={isLoading}
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="px-3 py-2 border-t bg-muted/30">
            <div className="flex flex-wrap gap-1">
              <Button
                variant="outline"
                size="sm"
                className="text-xs h-7 gap-1"
                disabled={isLoading}
                aria-label="Ask Andrea to review your practice work"
                onClick={() => handleQuickActionClick('Can you review my practice work?', 'review')}
              >
                {activeQuickAction === 'review' && isLoading ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : null}
                Review my work
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-xs h-7 gap-1"
                disabled={isLoading}
                aria-label="Ask Andrea to show you an example"
                onClick={() => handleQuickActionClick('Show me an example', 'example')}
              >
                {activeQuickAction === 'example' && isLoading ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : null}
                Show example
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-xs h-7 gap-1"
                disabled={isLoading}
                aria-label="Ask Andrea for a hint"
                onClick={() => handleQuickActionClick('I need a hint', 'hint')}
              >
                {activeQuickAction === 'hint' && isLoading ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : null}
                Get hint
              </Button>
            </div>
          </div>

          {/* Composer - pinned to bottom (Copilot-style) */}
          <div className="p-3 border-t shrink-0 bg-gradient-to-t from-muted/50 to-transparent">
            <div className="flex gap-2 items-end">
              <div className="shrink-0">
                <Avatar className="h-10 w-10 border-2 border-primary/20 shadow-sm">
                  <AvatarImage src={andreaCoach} alt="Andrea" className="object-cover" />
                  <AvatarFallback className="text-sm">A</AvatarFallback>
                </Avatar>
              </div>
              <div className="flex-1 flex flex-col gap-1.5">
                <Textarea
                  value={input}
                  onChange={(e) => onInputChange(e.target.value)}
                  placeholder="Ask Andrea for help..."
                  className="min-h-[40px] max-h-[100px] resize-none text-sm"
                  onKeyDown={handleKeyDown}
                />
                <Button
                  size="sm"
                  onClick={onSubmit}
                  disabled={isLoading || !input.trim()}
                  className="gap-1.5 self-end h-7 text-xs"
                >
                  <Send className="h-3 w-3" />
                  Send
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </aside>
  );
}
