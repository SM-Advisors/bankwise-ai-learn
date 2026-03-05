import { useRef, useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Loader2, Send, ChevronLeft, ChevronRight, Copy, Check, Bookmark, BookOpen, Lightbulb, AlertTriangle, ArrowRight, CheckCircle2, ChevronDown, Target, Wrench, Zap, Share2, ThumbsUp, ThumbsDown } from 'lucide-react';
import andreaCoach from '@/assets/andrea-coach.png';
import { type Message } from '@/types/training';
import { ShareDialog } from '@/components/ShareDialog';
import { LevelChangeNotification } from '@/components/LevelChangeNotification';
import { useResponseFeedback } from '@/hooks/useResponseFeedback';

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
  onSaveMemory?: (content: string, source?: string) => void;
  onAcceptLevelChange?: (proposedLevel: string) => Promise<void>;
  onSaveToPromptLibrary?: (promptText: string, title: string, category: string) => Promise<void>;
}

type QuickActionType = 'review' | 'example' | 'hint' | null;

function StructuredFeedbackCard({ feedback }: { feedback: NonNullable<Message['structuredFeedback']> }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="ml-2 rounded-lg border border-border bg-card overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-muted/50 transition-colors"
      >
        <Target className="h-3.5 w-3.5 text-accent shrink-0" />
        <span className="text-xs font-medium text-foreground flex-1">Rubric Scorecard</span>
        <span className="text-[10px] text-muted-foreground">
          {feedback.strengths.length} strengths · {feedback.issues.length} issues
        </span>
        <ChevronDown className={`h-3.5 w-3.5 text-muted-foreground transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`} />
      </button>

      {expanded && (
        <div className="px-3 pb-3 space-y-2.5 border-t border-border pt-2.5">
          {/* Summary */}
          <p className="text-xs text-muted-foreground leading-relaxed">{feedback.summary}</p>

          {/* Strengths */}
          {feedback.strengths.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <CheckCircle2 className="h-3 w-3 text-green-500" />
                <span className="text-[10px] font-semibold uppercase tracking-wide text-green-600 dark:text-green-400">Strengths</span>
              </div>
              <ul className="space-y-0.5">
                {feedback.strengths.map((s, i) => (
                  <li key={i} className="text-xs text-foreground/80 pl-4 relative before:content-['•'] before:absolute before:left-1 before:text-green-500">
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Issues */}
          {feedback.issues.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <AlertTriangle className="h-3 w-3 text-amber-500" />
                <span className="text-[10px] font-semibold uppercase tracking-wide text-amber-600 dark:text-amber-400">Issues</span>
              </div>
              <ul className="space-y-0.5">
                {feedback.issues.map((issue, i) => (
                  <li key={i} className="text-xs text-foreground/80 pl-4 relative before:content-['•'] before:absolute before:left-1 before:text-amber-500">
                    {issue}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Fixes */}
          {feedback.fixes.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <Wrench className="h-3 w-3 text-blue-500" />
                <span className="text-[10px] font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">Fixes</span>
              </div>
              <ul className="space-y-0.5">
                {feedback.fixes.map((fix, i) => (
                  <li key={i} className="text-xs text-foreground/80 pl-4 relative before:content-['•'] before:absolute before:left-1 before:text-blue-500">
                    {fix}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Next Steps */}
          {feedback.next_steps.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <Zap className="h-3 w-3 text-accent" />
                <span className="text-[10px] font-semibold uppercase tracking-wide text-accent">Next Steps</span>
              </div>
              <ul className="space-y-0.5">
                {feedback.next_steps.map((step, i) => (
                  <li key={i} className="text-xs text-foreground/80 pl-4 relative before:content-['•'] before:absolute before:left-1 before:text-accent">
                    {step}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
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
  suggestedPrompts,
  onSaveMemory,
  onAcceptLevelChange,
  onSaveToPromptLibrary,
}: TrainerChatPanelProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [activeQuickAction, setActiveQuickAction] = useState<QuickActionType>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [ratedMessages, setRatedMessages] = useState<Map<number, 1 | -1>>(new Map());
  const { submitFeedback } = useResponseFeedback();
  const [savedIndex, setSavedIndex] = useState<number | null>(null);
  const [dismissedSuggestions, setDismissedSuggestions] = useState<Set<number>>(new Set());
  const [savedSuggestions, setSavedSuggestions] = useState<Set<number>>(new Set());
  const [dismissedShareSuggestions, setDismissedShareSuggestions] = useState<Set<number>>(new Set());
  const [dismissedLevelSuggestions, setDismissedLevelSuggestions] = useState<Set<number>>(new Set());
  const [savedPromptSuggestions, setSavedPromptSuggestions] = useState<Set<number>>(new Set());
  const [dismissedPromptSuggestions, setDismissedPromptSuggestions] = useState<Set<number>>(new Set());
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const [shareDialogState, setShareDialogState] = useState<{
    open: boolean;
    suggestion: NonNullable<Message['shareSuggestion']> | null;
  }>({ open: false, suggestion: null });

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

  // Collapse suggestions whenever a new set arrives
  useEffect(() => {
    setSuggestionsOpen(false);
  }, [suggestedPrompts]);

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

  const handleSaveMemory = (content: string, index: number) => {
    if (onSaveMemory) {
      onSaveMemory(content);
      setSavedIndex(index);
      setTimeout(() => setSavedIndex(null), 2000);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSubmit();
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  return (
  <>
    <aside
      data-tour="andrea-panel"
      className={`border-l bg-card transition-all duration-300 flex flex-col ${collapsed ? 'w-12' : 'w-full md:w-[35%]'}`}
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
            <Avatar className="h-14 w-14">
              <AvatarImage src={andreaCoach} alt="Andrea" className="object-cover" />
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
              {/* Loading skeleton while Andrea's greeting loads */}
              {messages.length === 0 && (
                <div className="p-3 rounded-lg bg-muted animate-pulse">
                  <div className="flex items-center gap-2 mb-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={andreaCoach} alt="Andrea" className="object-cover" />
                      <AvatarFallback>A</AvatarFallback>
                    </Avatar>
                    <span className="text-xs font-medium text-muted-foreground">Andrea</span>
                  </div>
                  <div className="space-y-2">
                    <div className="h-3 bg-muted-foreground/10 rounded w-3/4" />
                    <div className="h-3 bg-muted-foreground/10 rounded w-1/2" />
                  </div>
                </div>
              )}
              {messages.map((message, idx) => (
                <div key={idx} className="space-y-2">
                  <div
                    className={`group relative rounded-lg ${
                      message.role === 'assistant'
                        ? 'p-3 bg-muted'
                        : 'p-3 bg-primary text-primary-foreground ml-4'
                    }`}
                  >
                    {message.role === 'assistant' && (
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-7 w-7">
                            <AvatarImage src={andreaCoach} alt="Andrea" className="object-cover" />
                            <AvatarFallback>A</AvatarFallback>
                          </Avatar>
                          <span className="text-xs font-medium text-muted-foreground">Andrea</span>
                        </div>
                        <div className="flex items-center gap-0.5">
                          <button
                            onClick={() => handleCopy(message.content, idx)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-md hover:bg-background/60"
                            title="Copy response"
                          >
                            {copiedIndex === idx ? (
                              <Check className="h-3.5 w-3.5 text-green-500" />
                            ) : (
                              <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                            )}
                          </button>
                          {onSaveMemory && (
                            <button
                              onClick={() => handleSaveMemory(message.content, idx)}
                              className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-md hover:bg-background/60"
                              title="Save as memory"
                            >
                              {savedIndex === idx ? (
                                <Check className="h-3.5 w-3.5 text-green-500" />
                              ) : (
                                <Bookmark className="h-3.5 w-3.5 text-muted-foreground" />
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                    {message.role === 'user' && (
                      <div className="mb-1" />
                    )}
                    <div className={`prose prose-sm max-w-none ${message.role === 'assistant' ? 'dark:prose-invert' : ''} [&>h1]:text-base [&>h1]:font-bold [&>h1]:mt-3 [&>h1]:mb-2 [&>h2]:text-sm [&>h2]:font-semibold [&>h2]:mt-2 [&>h2]:mb-1 [&>h3]:text-sm [&>h3]:font-semibold [&>h3]:mt-2 [&>h3]:mb-1 [&>p]:mb-1.5 [&>p]:text-sm [&>p]:leading-relaxed [&>ul]:my-1.5 [&>ul]:pl-4 [&>ol]:my-1.5 [&>ol]:pl-4 [&>li]:mb-0.5 [&>li]:text-sm [&>table]:w-full [&>table]:border-collapse [&>table]:my-2 [&_th]:border [&_th]:border-border [&_th]:px-2 [&_th]:py-1 [&_th]:bg-muted [&_th]:text-left [&_th]:font-semibold [&_th]:text-xs [&_td]:border [&_td]:border-border [&_td]:px-2 [&_td]:py-1 [&_td]:text-xs`}>
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
                    </div>
                  </div>

                  {/* Memory suggestion card */}
                  {message.memorySuggestion && onSaveMemory && !dismissedSuggestions.has(idx) && !savedSuggestions.has(idx) && (
                    <div className="ml-2 p-2.5 rounded-lg border border-accent/30 bg-accent/5 flex items-start gap-2">
                      <Bookmark className="h-3.5 w-3.5 text-accent shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-foreground leading-snug">{message.memorySuggestion.content}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{message.memorySuggestion.reason}</p>
                        <div className="flex items-center gap-2 mt-1.5">
                          <button
                            onClick={() => {
                              onSaveMemory(message.memorySuggestion!.content, 'andrea_suggested');
                              setSavedSuggestions(prev => new Set(prev).add(idx));
                            }}
                            className="text-[10px] font-medium text-accent hover:text-accent/80 transition-colors"
                          >
                            Save to memories
                          </button>
                          <span className="text-muted-foreground/30">|</span>
                          <button
                            onClick={() => setDismissedSuggestions(prev => new Set(prev).add(idx))}
                            className="text-[10px] text-muted-foreground hover:text-foreground transition-colors"
                          >
                            Dismiss
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Saved confirmation for memory suggestion */}
                  {message.memorySuggestion && savedSuggestions.has(idx) && (
                    <div className="ml-2 p-2 rounded-lg border border-green-500/20 bg-green-500/5 flex items-center gap-2">
                      <Check className="h-3.5 w-3.5 text-green-500 shrink-0" />
                      <p className="text-[10px] text-green-700 dark:text-green-400 font-medium">Saved to memories</p>
                    </div>
                  )}

                  {/* Share suggestion card */}
                  {message.shareSuggestion && !dismissedShareSuggestions.has(idx) && (
                    <div className="ml-2 p-2.5 rounded-lg border border-blue-500/30 bg-blue-500/5 flex items-start gap-2">
                      <Share2 className="h-3.5 w-3.5 text-blue-500 shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-foreground leading-snug">{message.shareSuggestion.summary}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          Andrea thinks this is worth sharing{message.shareSuggestion.destinations.includes('executive') ? ' — including to leadership' : ''}.
                        </p>
                        <div className="flex items-center gap-2 mt-1.5">
                          <button
                            onClick={() => setShareDialogState({ open: true, suggestion: message.shareSuggestion! })}
                            className="text-[10px] font-medium text-blue-600 dark:text-blue-400 hover:opacity-80 transition-opacity"
                          >
                            Share this
                          </button>
                          <span className="text-muted-foreground/30">|</span>
                          <button
                            onClick={() => setDismissedShareSuggestions(prev => new Set(prev).add(idx))}
                            className="text-[10px] text-muted-foreground hover:text-foreground transition-colors"
                          >
                            Dismiss
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Prompt Library save suggestion card */}
                  {message.promptSaveSuggestion && onSaveToPromptLibrary && !dismissedPromptSuggestions.has(idx) && !savedPromptSuggestions.has(idx) && (
                    <div className="ml-2 p-2.5 rounded-lg border border-purple-500/30 bg-purple-500/5 flex items-start gap-2">
                      <BookOpen className="h-3.5 w-3.5 text-purple-500 shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-foreground leading-snug">Save to Prompt Library?</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-2">
                          "{message.promptSaveSuggestion.suggestedTitle}"
                        </p>
                        <div className="flex items-center gap-2 mt-1.5">
                          <button
                            onClick={async () => {
                              const s = message.promptSaveSuggestion!;
                              await onSaveToPromptLibrary(s.promptText, s.suggestedTitle, s.suggestedCategory);
                              setSavedPromptSuggestions(prev => new Set(prev).add(idx));
                            }}
                            className="text-[10px] font-medium text-purple-600 dark:text-purple-400 hover:opacity-80 transition-opacity"
                          >
                            Save prompt
                          </button>
                          <span className="text-muted-foreground/30">|</span>
                          <button
                            onClick={() => setDismissedPromptSuggestions(prev => new Set(prev).add(idx))}
                            className="text-[10px] text-muted-foreground hover:text-foreground transition-colors"
                          >
                            Dismiss
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                  {savedPromptSuggestions.has(idx) && (
                    <div className="ml-2 p-2 rounded-lg border border-purple-500/20 bg-purple-500/5 flex items-center gap-2">
                      <Check className="h-3.5 w-3.5 text-purple-500 shrink-0" />
                      <p className="text-[10px] text-purple-700 dark:text-purple-400 font-medium">Saved to Prompt Library</p>
                    </div>
                  )}

                  {/* Level change suggestion */}
                  {message.levelSuggestion && !dismissedLevelSuggestions.has(idx) && (
                    <LevelChangeNotification
                      suggestion={message.levelSuggestion}
                      onAccept={async () => {
                        if (onAcceptLevelChange) {
                          await onAcceptLevelChange(message.levelSuggestion!.proposedLevel);
                        }
                        setDismissedLevelSuggestions(prev => new Set(prev).add(idx));
                      }}
                      onDecline={() => setDismissedLevelSuggestions(prev => new Set(prev).add(idx))}
                    />
                  )}

                  {/* Structured feedback scorecard from submission_review */}
                  {message.structuredFeedback && (
                    <StructuredFeedbackCard feedback={message.structuredFeedback} />
                  )}

                  {/* Response feedback */}
                  {message.role === 'assistant' && (
                    <div className="flex items-center gap-1 mt-1">
                      {ratedMessages.has(idx) ? (
                        <span className="text-xs text-muted-foreground">
                          {ratedMessages.get(idx) === 1 ? '👍 Thanks for the feedback!' : '👎 Thanks for the feedback!'}
                        </span>
                      ) : (
                        <>
                          <button
                            onClick={async () => {
                              setRatedMessages(prev => new Map(prev).set(idx, 1));
                              await submitFeedback({ messageIndex: idx, messagePreview: message.content, rating: 1 });
                            }}
                            className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-green-600 transition-colors"
                            title="Helpful"
                          >
                            <ThumbsUp className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={async () => {
                              setRatedMessages(prev => new Map(prev).set(idx, -1));
                              await submitFeedback({ messageIndex: idx, messagePreview: message.content, rating: -1 });
                            }}
                            className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-destructive transition-colors"
                            title="Not helpful"
                          >
                            <ThumbsDown className="h-3.5 w-3.5" />
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="p-3 rounded-lg bg-muted flex items-center gap-2">
                  <Avatar className="h-7 w-7">
                    <AvatarImage src={andreaCoach} alt="Andrea" className="object-cover" />
                    <AvatarFallback>A</AvatarFallback>
                  </Avatar>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm text-muted-foreground">
                    {activeQuickAction === 'review' ? 'Preparing feedback...' :
                     activeQuickAction === 'hint' ? 'Preparing a hint...' :
                     'Thinking...'}
                  </span>
                </div>
              )}

              {/* Compliance warning banner */}
              {messages.length > 0 && messages[messages.length - 1]?.complianceFlag && (
                <div className={`mx-1 p-2 rounded-md flex items-center gap-2 text-xs ${
                  messages[messages.length - 1].complianceFlag?.severity === 'critical'
                    ? 'bg-red-500/10 text-red-700 dark:text-red-400 border border-red-500/20'
                    : messages[messages.length - 1].complianceFlag?.severity === 'warning'
                    ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20'
                    : 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/20'
                }`}>
                  <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                  <span>{messages[messages.length - 1].complianceFlag?.severity === 'critical' ? 'Compliance Alert' : 'Coaching Note'}</span>
                </div>
              )}

              {/* Hint available nudge */}
              {messages.length > 0 && messages[messages.length - 1]?.hintAvailable && !isLoading && (
                <div className="mx-1">
                  <button
                    onClick={() => onQuickAction('Give me a hint')}
                    className="w-full p-2 rounded-md bg-primary/5 border border-primary/20 flex items-center gap-2 text-xs text-primary hover:bg-primary/10 transition-colors"
                  >
                    <Lightbulb className="h-3.5 w-3.5 animate-pulse" />
                    <span>Andrea has a hint for you</span>
                    <ArrowRight className="h-3 w-3 ml-auto" />
                  </button>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Suggested Prompts (from Andrea's response) — collapsed by default */}
          {suggestedPrompts && suggestedPrompts.length > 0 && !isLoading && (
            <div className="px-3 py-1.5 border-t">
              <button
                onClick={() => setSuggestionsOpen(o => !o)}
                className="flex items-center gap-1.5 w-full text-[10px] font-medium uppercase tracking-wide text-muted-foreground hover:text-foreground transition-colors"
              >
                <span>Suggested next</span>
                <span className="text-muted-foreground/60 normal-case tracking-normal font-normal">({suggestedPrompts.length})</span>
                <ChevronDown className={`h-3 w-3 ml-auto transition-transform duration-150 ${suggestionsOpen ? 'rotate-180' : ''}`} />
              </button>
              {suggestionsOpen && (
                <div className="flex flex-col gap-1 mt-1.5">
                  {suggestedPrompts.map((prompt, idx) => (
                    <button
                      key={idx}
                      className="text-left text-xs px-2.5 py-1.5 rounded-md border bg-background hover:bg-muted transition-colors text-foreground/80 hover:text-foreground line-clamp-2"
                      onClick={() => { onQuickAction(prompt); setSuggestionsOpen(false); }}
                      disabled={isLoading}
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Quick Actions */}
          <div data-tour="quick-actions" className="px-3 py-2 border-t bg-muted/30">
            <div className="flex flex-wrap gap-1.5">
              <Button
                variant="outline"
                size="sm"
                className="text-xs h-7 gap-1.5 rounded-md"
                disabled={isLoading}
                aria-label="Ask Andrea for feedback on your practice work"
                onClick={() => handleQuickActionClick('Can you give me feedback on my practice work?', 'review')}
              >
                {activeQuickAction === 'review' && isLoading ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <CheckCircle2 className="h-3 w-3" />
                )}
                Get feedback
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-xs h-7 gap-1.5 rounded-md"
                disabled={isLoading}
                aria-label="Ask Andrea to show you an example"
                onClick={() => handleQuickActionClick('Show me an example', 'example')}
              >
                {activeQuickAction === 'example' && isLoading ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <Lightbulb className="h-3 w-3" />
                )}
                Show example
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-xs h-7 gap-1.5 rounded-md"
                disabled={isLoading}
                aria-label="Ask Andrea for a hint"
                onClick={() => handleQuickActionClick('I need a hint', 'hint')}
              >
                {activeQuickAction === 'hint' && isLoading ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <ArrowRight className="h-3 w-3" />
                )}
                Get hint
              </Button>
            </div>
          </div>

          {/* Composer - pinned to bottom */}
          <div className="p-3 border-t shrink-0">
            <div className="flex gap-2 items-end">
              <div className="flex-1 flex flex-col gap-1.5">
                <Textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => {
                    onInputChange(e.target.value);
                    // Auto-grow
                    const el = e.target;
                    el.style.height = 'auto';
                    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
                  }}
                  placeholder="Ask Andrea for help..."
                  className="min-h-[40px] resize-none text-sm rounded-xl overflow-hidden"
                  style={{ height: '40px' }}
                  onKeyDown={handleKeyDown}
                />
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-muted-foreground/50">Enter to send</span>
                  <Button
                    size="sm"
                    onClick={() => { onSubmit(); setTimeout(() => inputRef.current?.focus(), 100); }}
                    disabled={isLoading || !input.trim()}
                    className="gap-1.5 h-7 text-xs rounded-md"
                  >
                    <Send className="h-3 w-3" />
                    Send
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </aside>

    {/* ShareDialog — rendered outside aside to avoid z-index clipping */}
    {shareDialogState.open && shareDialogState.suggestion && (
      <ShareDialog
        open={shareDialogState.open}
        onOpenChange={(open) => setShareDialogState(s => ({ ...s, open }))}
        initialType={shareDialogState.suggestion.type}
        initialTitle={shareDialogState.suggestion.summary}
        initialBody=""
        initialDestinations={shareDialogState.suggestion.destinations}
        sourceType="andrea_suggested"
      />
    )}
  </>
  );
}
