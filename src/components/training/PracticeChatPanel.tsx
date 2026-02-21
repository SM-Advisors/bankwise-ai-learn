import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';
import {
  Loader2, Send, Lightbulb, AlertCircle, Target, CheckCircle,
  ChevronRight, ChevronDown, Bot, User, ArrowUp,
} from 'lucide-react';
import { type ModuleContent } from '@/data/trainingContent';

interface PracticeMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface PracticeChatPanelProps {
  module: ModuleContent;
  messages: PracticeMessage[];
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  isCompleted: boolean;
  onSubmitForReview: () => void;
  onContinueToNext?: () => void;
  onCompleteSession?: () => void;
  hasNextModule: boolean;
}

export function PracticeChatPanel({
  module,
  messages,
  onSendMessage,
  isLoading,
  isCompleted,
  onSubmitForReview,
  onContinueToNext,
  onCompleteSession,
  hasNextModule,
}: PracticeChatPanelProps) {
  const [input, setInput] = useState('');
  const [scenarioOpen, setScenarioOpen] = useState(false);
  const [criteriaOpen, setCriteriaOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim() || isLoading) return;
    onSendMessage(input.trim());
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleHintClick = (hint: string) => {
    onSendMessage(hint);
  };

  const hasConversation = messages.length > 0;

  return (
    <div className="flex flex-col flex-1 min-h-0 bg-[hsl(222,19%,11%)] text-[hsl(210,40%,98%)]">
      {/* Empty state — shown before any messages */}
      {!hasConversation && (
        <div className="flex-1 flex flex-col items-center justify-center w-full max-w-2xl mx-auto px-4">
          <div className="w-12 h-12 rounded-2xl bg-[hsl(222,19%,17%)] border border-[hsl(222,19%,22%)] flex items-center justify-center mb-4">
            <Bot className="h-6 w-6 text-[hsl(215,20%,55%)]" />
          </div>
          <h2 className="text-2xl md:text-3xl font-semibold text-[hsl(210,40%,98%)] text-center mb-2 tracking-tight">
            {module.content.practiceTask.title}
          </h2>
          <p className="text-base text-[hsl(215,20%,65%)] text-center max-w-lg mb-6">
            {module.content.practiceTask.instructions}
          </p>

          {/* Collapsible details */}
          <div className="w-full max-w-lg space-y-1 mb-6">
            <Collapsible open={scenarioOpen} onOpenChange={setScenarioOpen}>
              <CollapsibleTrigger className="flex items-center gap-2 text-sm font-medium text-[hsl(215,20%,65%)] hover:text-[hsl(210,40%,98%)] transition-colors w-full px-3 py-2 rounded-lg hover:bg-[hsl(222,19%,17%)]">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>View Scenario</span>
                <ChevronDown className={`h-4 w-4 ml-auto transition-transform duration-200 ${scenarioOpen ? 'rotate-180' : ''}`} />
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="mt-1 bg-[hsl(222,19%,15%)] border border-[hsl(222,19%,20%)] p-4 rounded-xl">
                  <p className="text-sm whitespace-pre-wrap text-[hsl(215,20%,75%)]">{module.content.practiceTask.scenario}</p>
                </div>
              </CollapsibleContent>
            </Collapsible>

            <Collapsible open={criteriaOpen} onOpenChange={setCriteriaOpen}>
              <CollapsibleTrigger className="flex items-center gap-2 text-sm font-medium text-[hsl(215,20%,65%)] hover:text-[hsl(210,40%,98%)] transition-colors w-full px-3 py-2 rounded-lg hover:bg-[hsl(222,19%,17%)]">
                <Target className="h-4 w-4 text-[hsl(10,76%,55%)] shrink-0" />
                <span>Success Criteria</span>
                <ChevronDown className={`h-4 w-4 ml-auto transition-transform duration-200 ${criteriaOpen ? 'rotate-180' : ''}`} />
              </CollapsibleTrigger>
              <CollapsibleContent>
                <ul className="mt-1 space-y-1.5 px-3 pb-2">
                  {module.content.practiceTask.successCriteria.map((criteria, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-[hsl(215,20%,75%)]">
                      <CheckCircle className="h-4 w-4 text-[hsl(215,20%,55%)] shrink-0 mt-0.5" />
                      {criteria}
                    </li>
                  ))}
                </ul>
              </CollapsibleContent>
            </Collapsible>
          </div>

          {/* Hint starter cards */}
          <div className="w-full max-w-lg">
            <p className="text-[10px] text-[hsl(215,20%,45%)] uppercase tracking-wide font-medium mb-2 px-1">Try a prompt</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {module.content.practiceTask.hints.slice(0, 3).map((hint, idx) => (
                <button
                  key={idx}
                  onClick={() => handleHintClick(hint)}
                  className="text-left p-3 rounded-xl border border-[hsl(222,19%,20%)] bg-[hsl(222,19%,14%)] hover:bg-[hsl(222,19%,18%)] hover:border-[hsl(222,19%,25%)] transition-all group"
                >
                  <Lightbulb className="h-4 w-4 text-[hsl(215,20%,50%)] mb-1.5 group-hover:text-[hsl(10,76%,55%)] transition-colors" />
                  <p className="text-xs font-medium text-[hsl(210,40%,90%)] line-clamp-2">{hint}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Chat messages — shown when conversation has started */}
      {hasConversation && (
        <ScrollArea className="flex-1">
          <div className="max-w-2xl mx-auto px-4 py-4 space-y-4">
            {/* Compact task header */}
            <div className="text-center pb-3 border-b border-[hsl(222,19%,18%)]">
              <p className="text-xs text-[hsl(215,20%,45%)] uppercase tracking-wide font-medium">Practice Task</p>
              <h3 className="text-sm font-medium text-[hsl(210,40%,90%)] mt-0.5">{module.content.practiceTask.title}</h3>
            </div>

            {messages.map((message, idx) => (
              <div
                key={idx}
                className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {message.role === 'assistant' && (
                  <div className="w-7 h-7 rounded-lg bg-[hsl(222,19%,17%)] border border-[hsl(222,19%,22%)] flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="h-4 w-4 text-[hsl(215,20%,55%)]" />
                  </div>
                )}
                <div
                  className={`rounded-2xl px-4 py-3 max-w-[85%] ${
                    message.role === 'user'
                      ? 'bg-[hsl(215,50%,50%)] text-white'
                      : 'bg-[hsl(222,19%,15%)] border border-[hsl(222,19%,20%)] text-[hsl(210,40%,90%)]'
                  }`}
                >
                  <div className={`prose prose-sm max-w-none ${
                    message.role === 'assistant'
                      ? '[&>p]:text-[hsl(210,40%,90%)] [&>li]:text-[hsl(210,40%,90%)] [&>h1]:text-[hsl(210,40%,98%)] [&>h2]:text-[hsl(210,40%,98%)] [&>h3]:text-[hsl(210,40%,98%)] [&>strong]:text-[hsl(210,40%,98%)]'
                      : '[&>p]:text-white [&>li]:text-white'
                  } [&>p]:mb-1.5 [&>p]:text-sm [&>p]:leading-relaxed [&>ul]:my-1.5 [&>ul]:pl-4 [&>ol]:my-1.5 [&>ol]:pl-4 [&>li]:mb-0.5 [&>li]:text-sm [&>table]:w-full [&>table]:border-collapse [&>table]:my-2 [&_th]:border [&_th]:border-[hsl(222,19%,25%)] [&_th]:px-2 [&_th]:py-1 [&_th]:bg-[hsl(222,19%,17%)] [&_th]:text-left [&_th]:font-semibold [&_th]:text-xs [&_td]:border [&_td]:border-[hsl(222,19%,25%)] [&_td]:px-2 [&_td]:py-1 [&_td]:text-xs`}>
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
                  </div>
                </div>
                {message.role === 'user' && (
                  <div className="w-7 h-7 rounded-lg bg-[hsl(215,50%,50%)] flex items-center justify-center shrink-0 mt-0.5">
                    <User className="h-4 w-4 text-white" />
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-3 justify-start">
                <div className="w-7 h-7 rounded-lg bg-[hsl(222,19%,17%)] border border-[hsl(222,19%,22%)] flex items-center justify-center shrink-0">
                  <Bot className="h-4 w-4 text-[hsl(215,20%,55%)]" />
                </div>
                <div className="rounded-2xl px-4 py-3 bg-[hsl(222,19%,15%)] border border-[hsl(222,19%,20%)]">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-[hsl(215,20%,55%)]" />
                    <span className="text-sm text-[hsl(215,20%,55%)]">AI is responding...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      )}

      {/* Completion Banner */}
      {isCompleted && (
        <div className="w-full max-w-2xl mx-auto px-4 py-3">
          <div className="p-4 bg-[hsl(10,76%,55%,0.15)] border border-[hsl(10,76%,55%,0.3)] rounded-2xl text-center">
            <div className="flex items-center justify-center gap-2 text-[hsl(10,76%,55%)] font-medium">
              <CheckCircle className="h-5 w-5" />
              Practice Complete!
            </div>
            <p className="text-sm text-[hsl(215,20%,65%)] mt-1">
              Andrea has reviewed your conversation →
            </p>
            <div className="mt-3">
              {hasNextModule && onContinueToNext ? (
                <Button onClick={onContinueToNext} className="gap-2 rounded-full bg-[hsl(10,76%,55%)] hover:bg-[hsl(10,76%,45%)] text-white">
                  Continue to Next Module
                  <ChevronRight className="h-4 w-4" />
                </Button>
              ) : onCompleteSession ? (
                <Button onClick={onCompleteSession} className="gap-2 rounded-full bg-[hsl(10,76%,55%)] hover:bg-[hsl(10,76%,45%)] text-white">
                  Complete Session
                  <CheckCircle className="h-4 w-4" />
                </Button>
              ) : null}
            </div>
          </div>
        </div>
      )}

      {/* Submit for Review button — appears after 1+ exchanges */}
      {hasConversation && !isCompleted && !isLoading && (
        <div className="w-full max-w-2xl mx-auto px-4 pt-2">
          <button
            onClick={onSubmitForReview}
            className="w-full py-2 rounded-xl border border-[hsl(10,76%,55%,0.3)] bg-[hsl(10,76%,55%,0.08)] hover:bg-[hsl(10,76%,55%,0.15)] text-[hsl(10,76%,55%)] text-xs font-medium transition-colors flex items-center justify-center gap-2"
          >
            <CheckCircle className="h-3.5 w-3.5" />
            Submit Conversation for Andrea's Review
          </button>
        </div>
      )}

      {/* Composer Bar */}
      {!isCompleted && (
        <div className="w-full max-w-2xl mx-auto px-4 pb-4 pt-2">
          <div className="rounded-2xl border border-[hsl(222,19%,22%)] bg-[hsl(222,19%,15%)] shadow-lg">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={hasConversation ? "Continue the conversation..." : `Write your prompt for this task...`}
              className="min-h-[56px] max-h-[180px] resize-none border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-sm text-[hsl(210,40%,98%)] placeholder:text-[hsl(215,20%,45%)] rounded-t-2xl px-4 pt-3.5 pb-0"
            />
            <div className="flex items-center justify-between px-3 py-2">
              <div className="flex items-center gap-1.5">
                {hasConversation && (
                  <span className="text-[10px] text-[hsl(215,20%,40%)]">
                    {messages.filter(m => m.role === 'user').length} prompt{messages.filter(m => m.role === 'user').length !== 1 ? 's' : ''} sent
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-[hsl(215,20%,35%)] hidden sm:inline">
                  Enter to send
                </span>
                <Button
                  size="icon"
                  onClick={handleSend}
                  disabled={isLoading || !input.trim()}
                  className="h-8 w-8 rounded-full bg-[hsl(215,20%,50%)] hover:bg-[hsl(215,20%,60%)] text-[hsl(222,19%,11%)]"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <ArrowUp className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
