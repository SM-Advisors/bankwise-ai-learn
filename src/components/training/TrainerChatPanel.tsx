import { useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Loader2, Send, ChevronLeft, ChevronRight } from 'lucide-react';
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
}

export function TrainerChatPanel({
  collapsed,
  onToggleCollapse,
  messages,
  input,
  onInputChange,
  onSubmit,
  onQuickAction,
  isLoading,
}: TrainerChatPanelProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleQuickActionClick = (prompt: string) => {
    onQuickAction(prompt);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSubmit();
    }
  };

  return (
    <div className={`border-l bg-card transition-all duration-300 flex flex-col ${collapsed ? 'w-12' : 'w-96'}`}>
      <div className="p-3 border-b flex items-center justify-between shrink-0">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onToggleCollapse}
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
          <ScrollArea className="flex-1">
            <div className="p-3 space-y-3">
              {messages.map((message, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-lg ${
                    message.role === 'assistant'
                      ? 'bg-muted'
                      : 'bg-primary text-primary-foreground ml-4'
                  }`}
                >
                  {message.role === 'assistant' && (
                    <div className="flex items-center gap-2 mb-2">
                      <Avatar className="h-5 w-5">
                        <AvatarImage src={andreaCoach} alt="Andrea" />
                        <AvatarFallback>A</AvatarFallback>
                      </Avatar>
                      <span className="text-xs font-medium text-muted-foreground">Andrea</span>
                    </div>
                  )}
                  <div className={`prose prose-sm max-w-none ${message.role === 'assistant' ? 'dark:prose-invert' : ''} [&>h1]:text-base [&>h1]:font-bold [&>h1]:mt-3 [&>h1]:mb-2 [&>h2]:text-sm [&>h2]:font-semibold [&>h2]:mt-2 [&>h2]:mb-1 [&>h3]:text-sm [&>h3]:font-semibold [&>h3]:mt-2 [&>h3]:mb-1 [&>p]:mb-2 [&>p]:text-sm [&>ul]:my-2 [&>ul]:pl-4 [&>ol]:my-2 [&>ol]:pl-4 [&>li]:mb-1 [&>li]:text-sm [&>table]:w-full [&>table]:border-collapse [&>table]:my-2 [&_th]:border [&_th]:border-border [&_th]:px-2 [&_th]:py-1 [&_th]:bg-muted [&_th]:text-left [&_th]:font-semibold [&_th]:text-xs [&_td]:border [&_td]:border-border [&_td]:px-2 [&_td]:py-1 [&_td]:text-xs`}>
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
          
          {/* Quick Actions */}
          <div className="px-3 py-2 border-t bg-muted/30">
            <div className="flex flex-wrap gap-1">
              <Button
                variant="outline"
                size="sm"
                className="text-xs h-7"
                disabled={isLoading}
                onClick={() => handleQuickActionClick('Can you review my practice work?')}
              >
                Review my work
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-xs h-7"
                disabled={isLoading}
                onClick={() => handleQuickActionClick('Show me an example')}
              >
                Show example
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-xs h-7"
                disabled={isLoading}
                onClick={() => handleQuickActionClick('I need a hint')}
              >
                Get hint
              </Button>
            </div>
          </div>

          {/* Andrea Avatar & Input Section */}
          <div className="p-3 border-t shrink-0 bg-gradient-to-t from-muted/50 to-transparent">
            <div className="flex gap-3 items-end">
              <div className="shrink-0">
                <Avatar className="h-16 w-16 border-2 border-primary/20 shadow-lg">
                  <AvatarImage src={andreaCoach} alt="Andrea" className="object-cover" />
                  <AvatarFallback className="text-lg">A</AvatarFallback>
                </Avatar>
              </div>
              <div className="flex-1 flex flex-col gap-2">
                <Textarea
                  value={input}
                  onChange={(e) => onInputChange(e.target.value)}
                  placeholder="Ask Andrea for help..."
                  className="min-h-[50px] resize-none text-sm"
                  onKeyDown={handleKeyDown}
                />
                <Button 
                  size="sm"
                  onClick={onSubmit}
                  disabled={isLoading || !input.trim()}
                  className="gap-2 self-end"
                >
                  <Send className="h-3 w-3" />
                  Ask Andrea
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
