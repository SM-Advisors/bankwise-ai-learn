import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';
import {
  Loader2, Send, Lightbulb, AlertCircle, Target, CheckCircle,
  ChevronRight, ChevronDown, Bot, User, Mic, AudioLines, Plus, SlidersHorizontal,
  MessageSquarePlus, History, Clock, Building2, ChevronUp,
} from 'lucide-react';
import { type ModuleContent } from '@/data/trainingContent';
import { getRoleScenario } from '@/data/roleScenarioBanks';
import { type PracticeConversation } from '@/hooks/usePracticeConversations';
import { AVAILABLE_MODELS, PROVIDER_COLORS, type ModelDefinition } from '@/lib/models';

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
  isSubmitted: boolean;
  onSubmitForReview: () => void;
  onContinueToNext?: () => void;
  onCompleteSession?: () => void;
  hasNextModule: boolean;
  conversations: PracticeConversation[];
  activeConversationId: string | null;
  onNewChat: () => void;
  onSelectConversation: (id: string) => void;
  departmentLabel?: string;
  lineOfBusiness?: string;
  allowedModels?: string[];
  selectedModel?: string;
  onModelChange?: (modelId: string) => void;
}

export function PracticeChatPanel({
  module,
  messages,
  onSendMessage,
  isLoading,
  isCompleted,
  isSubmitted,
  onSubmitForReview,
  onContinueToNext,
  onCompleteSession,
  hasNextModule,
  conversations,
  activeConversationId,
  onNewChat,
  onSelectConversation,
  departmentLabel,
  lineOfBusiness,
  allowedModels = [],
  selectedModel,
  onModelChange,
}: PracticeChatPanelProps) {
  const [input, setInput] = useState('');
  const [scenarioOpen, setScenarioOpen] = useState(false);
  const [criteriaOpen, setCriteriaOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'work' | 'web'>('work');
  const [modelDropdownOpen, setModelDropdownOpen] = useState(false);

  const showModelSelector = allowedModels.length > 1 && !!selectedModel && !!onModelChange;
  const selectedModelDef: ModelDefinition | undefined = AVAILABLE_MODELS.find(m => m.id === selectedModel);
  const allowedModelDefs = AVAILABLE_MODELS.filter(m => allowedModels.includes(m.id));
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Department-specific scenario and hints (inline departmentScenarios → role scenario bank → default)
  const deptScenarios = module.content.practiceTask.departmentScenarios;
  const roleScenario = lineOfBusiness ? getRoleScenario(module.id, lineOfBusiness) : null;
  const activeScenario = (deptScenarios && lineOfBusiness && deptScenarios[lineOfBusiness]?.scenario)
    ? deptScenarios[lineOfBusiness].scenario
    : roleScenario?.scenario ?? module.content.practiceTask.scenario;
  const activeHints = (deptScenarios && lineOfBusiness && deptScenarios[lineOfBusiness]?.hints)
    ? deptScenarios[lineOfBusiness].hints
    : roleScenario?.hints ?? module.content.practiceTask.hints;

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim() || isLoading) return;
    onSendMessage(input.trim());
    setInput('');
    // Re-focus input after sending
    setTimeout(() => inputRef.current?.focus(), 100);
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
  const pastConversations = conversations.filter(c => c.id !== activeConversationId);

  // Format relative time
  const formatRelativeTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="flex flex-col flex-1 min-h-0 items-center bg-background text-foreground">
      {/* Top bar: New Chat + Work/Web toggle + History */}
      <div className="w-full flex items-center justify-between px-4 pt-4 pb-2">
        {/* Left: New Chat button */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={onNewChat}
            className="h-8 gap-1.5 rounded-full text-sm px-3 text-muted-foreground hover:text-foreground hover:bg-muted"
          >
            <MessageSquarePlus className="h-4 w-4" />
            New Chat
          </Button>
        </div>

        {/* Center: Work / Web Toggle + Completion pill */}
        <div className="flex items-center gap-2">
          <div className="inline-flex items-center rounded-full border border-border bg-card p-0.5 shadow-sm">
            <button
              onClick={() => setActiveTab('work')}
              className={`px-5 py-1.5 text-sm font-medium rounded-full transition-colors ${
                activeTab === 'work'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Work
            </button>
            <button
              onClick={() => setActiveTab('web')}
              className={`px-5 py-1.5 text-sm font-medium rounded-full transition-colors ${
                activeTab === 'web'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Web
            </button>
          </div>
          {isCompleted && (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-xs">
              <CheckCircle className="h-3 w-3 text-emerald-600" />
              <span className="text-emerald-700 font-medium">Complete</span>
              {hasNextModule && onContinueToNext ? (
                <button onClick={onContinueToNext} className="text-emerald-600 hover:text-emerald-800 font-medium flex items-center gap-0.5 ml-0.5">
                  Next <ChevronRight className="h-3 w-3" />
                </button>
              ) : onCompleteSession ? (
                <button onClick={onCompleteSession} className="text-emerald-600 hover:text-emerald-800 font-medium flex items-center gap-0.5 ml-0.5">
                  Finish <CheckCircle className="h-3 w-3" />
                </button>
              ) : null}
            </div>
          )}
        </div>

        {/* Right: History dropdown */}
        <div className="relative">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setHistoryOpen(!historyOpen)}
            className="h-8 gap-1.5 rounded-full text-sm px-3 text-muted-foreground hover:text-foreground hover:bg-muted"
            disabled={conversations.length === 0}
          >
            <History className="h-4 w-4" />
            {conversations.length > 0 && (
              <span className="text-xs">{conversations.length}</span>
            )}
          </Button>

          {/* History dropdown panel */}
          {historyOpen && pastConversations.length > 0 && (
            <>
              {/* Click-away backdrop */}
              <div className="fixed inset-0 z-40" onClick={() => setHistoryOpen(false)} />
              <div className="absolute right-0 top-full mt-1 w-72 bg-popover border border-border rounded-xl shadow-lg z-50 overflow-hidden">
                <div className="px-3 py-2 border-b border-border">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Conversation History
                  </p>
                </div>
                <ScrollArea className="max-h-64">
                  <div className="p-1.5 space-y-0.5">
                    {pastConversations.map((conv) => (
                      <button
                        key={conv.id}
                        onClick={() => {
                          onSelectConversation(conv.id);
                          setHistoryOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 rounded-lg hover:bg-muted transition-colors group"
                      >
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-foreground truncate flex-1">
                            {conv.title}
                          </p>
                          {conv.is_submitted && (
                            <CheckCircle className="h-3.5 w-3.5 text-accent shrink-0" />
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <Clock className="h-3 w-3 text-muted-foreground/60" />
                          <span className="text-xs text-muted-foreground">
                            {formatRelativeTime(conv.updated_at)}
                          </span>
                          <span className="text-xs text-muted-foreground/60">
                            · {conv.messages.length} messages
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </>
          )}
        </div>
      </div>


      {/* Empty state — shown before any messages */}
      {!hasConversation && (
        <div className="flex-1 flex flex-col items-center justify-center w-full max-w-2xl mx-auto px-4">
          {departmentLabel && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium mb-2">
              <Building2 className="h-3.5 w-3.5" />
              {departmentLabel}
            </div>
          )}
          <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-1">Practice Task</p>
          <h2 className="text-xl md:text-2xl font-semibold text-foreground text-center mb-1 tracking-tight">
            {module.content.practiceTask.title}
          </h2>
          <p className="text-sm text-muted-foreground text-center">Try a prompt below or write your own</p>

          {/* Collapsible details */}
          <div className="w-full max-w-lg space-y-1 mb-4 mt-4">
            <Collapsible open={scenarioOpen} onOpenChange={setScenarioOpen}>
              <CollapsibleTrigger className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors w-full px-3 py-2 rounded-lg hover:bg-muted">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>View Scenario</span>
                <ChevronDown className={`h-4 w-4 ml-auto transition-transform duration-200 ${scenarioOpen ? 'rotate-180' : ''}`} />
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="mt-1 bg-card border border-border p-4 rounded-xl">
                  <p className="text-sm whitespace-pre-wrap text-muted-foreground">{activeScenario}</p>
                </div>
              </CollapsibleContent>
            </Collapsible>

            <Collapsible open={criteriaOpen} onOpenChange={setCriteriaOpen}>
              <CollapsibleTrigger className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors w-full px-3 py-2 rounded-lg hover:bg-muted">
                <Target className="h-4 w-4 text-accent shrink-0" />
                <span>Success Criteria</span>
                <ChevronDown className={`h-4 w-4 ml-auto transition-transform duration-200 ${criteriaOpen ? 'rotate-180' : ''}`} />
              </CollapsibleTrigger>
              <CollapsibleContent>
                <ul className="mt-1 space-y-1.5 px-3 pb-2">
                  {module.content.practiceTask.successCriteria.map((criteria, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <CheckCircle className="h-4 w-4 text-muted-foreground/60 shrink-0 mt-0.5" />
                      {criteria}
                    </li>
                  ))}
                </ul>
              </CollapsibleContent>
            </Collapsible>
          </div>

        </div>
      )}

      {/* Chat messages — shown when conversation has started */}
      {hasConversation && (
        <ScrollArea className="flex-1 w-full">
          <div className="max-w-2xl mx-auto px-4 py-4 space-y-4">
            {/* Compact task header */}
            <div className="text-center pb-3 border-b border-border">
              <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Practice Task</p>
              <h3 className="text-sm font-medium text-foreground mt-0.5">{module.content.practiceTask.title}</h3>
            </div>

            {messages.map((message, idx) => (
              <div
                key={idx}
                className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {message.role === 'assistant' && (
                  <div className="w-7 h-7 rounded-lg bg-muted border border-border flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="h-4 w-4 text-muted-foreground" />
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
                <div className="w-7 h-7 rounded-lg bg-muted border border-border flex items-center justify-center shrink-0">
                  <Bot className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="rounded-2xl px-4 py-3 bg-card border border-border">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">AI is responding...</span>
                  </div>
                </div>
              </div>
            )}

            {/* Submitted indicator — inside chat */}
            {isSubmitted && (
              <div className="w-full">
                <div className="p-4 bg-accent/10 border border-accent/20 rounded-2xl text-center">
                  <div className="flex items-center justify-center gap-2 text-accent font-medium">
                    <CheckCircle className="h-5 w-5" />
                    Submitted for Review
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Andrea has reviewed this conversation. You can keep chatting or start a new one.
                  </p>
                  <div className="mt-3 flex items-center justify-center gap-2">
                    <Button variant="outline" size="sm" onClick={onNewChat} className="gap-2 rounded-full">
                      <MessageSquarePlus className="h-4 w-4" />
                      New Chat
                    </Button>
                    {hasNextModule && onContinueToNext ? (
                      <Button onClick={onContinueToNext} size="sm" className="gap-2 rounded-full">
                        Continue to Next Module
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    ) : onCompleteSession ? (
                      <Button onClick={onCompleteSession} size="sm" className="gap-2 rounded-full">
                        Complete Session
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                    ) : null}
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      )}

      {/* Submit for Review button — appears after 1+ exchanges, not yet submitted */}
      {hasConversation && !isSubmitted && !isLoading && (
        <div className="w-full max-w-2xl mx-auto px-4 pt-2">
          <button
            onClick={onSubmitForReview}
            className="w-full py-2 rounded-xl border border-accent/30 bg-accent/5 hover:bg-accent/10 text-accent text-xs font-medium transition-colors flex items-center justify-center gap-2"
          >
            <CheckCircle className="h-3.5 w-3.5" />
            Submit Conversation for Andrea's Review
          </button>
        </div>
      )}

      {/* Copilot-Style Composer Bar */}
      <div className="w-full max-w-2xl mx-auto px-4 pb-3 pt-2">
        <div className="rounded-2xl border border-border bg-card shadow-sm">
          <Textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={hasConversation ? "Continue the conversation..." : `Message ${module.content.practiceTask.title}...`}
            className="min-h-[56px] max-h-[180px] resize-none border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-sm text-foreground placeholder:text-muted-foreground/60 rounded-t-2xl px-4 pt-3.5 pb-0"
          />
          {/* Toolbar row */}
          <div className="flex items-center justify-between px-3 py-2">
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted">
                <Plus className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="sm" className="h-8 gap-1.5 rounded-full text-sm px-3 text-muted-foreground hover:text-foreground hover:bg-muted">
                <SlidersHorizontal className="h-4 w-4" />
                Tools
              </Button>
              {/* Model selector — only shown when org has 2+ models enabled */}
              {showModelSelector && (
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setModelDropdownOpen(o => !o)}
                    className="flex items-center gap-1.5 h-8 rounded-full px-2.5 text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors border border-border/60"
                  >
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium leading-none ${selectedModelDef ? PROVIDER_COLORS[selectedModelDef.provider] : ''}`}>
                      {selectedModelDef?.provider?.toUpperCase().slice(0, 4) ?? ''}
                    </span>
                    <span className="truncate max-w-[100px]">{selectedModelDef?.label ?? selectedModel}</span>
                    {modelDropdownOpen ? <ChevronUp className="h-3 w-3 shrink-0" /> : <ChevronDown className="h-3 w-3 shrink-0" />}
                  </button>
                  {modelDropdownOpen && (
                    <div className="absolute bottom-full left-0 mb-1 z-50 w-56 rounded-xl border border-border bg-popover shadow-lg py-1">
                      {allowedModelDefs.map(model => (
                        <button
                          key={model.id}
                          type="button"
                          onClick={() => { onModelChange!(model.id); setModelDropdownOpen(false); }}
                          className={`w-full flex items-start gap-2.5 px-3 py-2 text-left hover:bg-muted transition-colors ${model.id === selectedModel ? 'bg-muted/60' : ''}`}
                        >
                          <span className={`mt-0.5 shrink-0 px-1.5 py-0.5 rounded text-[10px] font-medium leading-none ${PROVIDER_COLORS[model.provider]}`}>
                            {model.provider.toUpperCase().slice(0, 4)}
                          </span>
                          <div>
                            <p className="text-xs font-medium text-foreground">{model.label}</p>
                            <p className="text-[11px] text-muted-foreground">{model.description}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted">
                <Mic className="h-5 w-5" />
              </Button>
              {input.trim() ? (
                <Button
                  size="icon"
                  onClick={handleSend}
                  disabled={isLoading}
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

      {/* Suggestion Cards */}
      {!hasConversation && (
        <div className="w-full max-w-2xl mx-auto px-4 pb-6 pt-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {activeHints.slice(0, 3).map((hint, idx) => (
              <button
                key={idx}
                onClick={() => handleHintClick(hint)}
                className="text-left p-3.5 rounded-xl border border-border bg-card hover:bg-accent/5 hover:border-accent/30 transition-all group"
              >
                <Lightbulb className="h-4 w-4 text-muted-foreground mb-2 group-hover:text-accent transition-colors" />
                <p className="text-sm text-foreground line-clamp-2 leading-snug">{hint}</p>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
