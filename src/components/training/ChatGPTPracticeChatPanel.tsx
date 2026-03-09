import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import {
  Loader2, ChevronRight, ChevronDown, ChevronUp,
  Bot, AudioLines, Plus, CheckCircle, AlertCircle,
  RotateCcw, ArrowUp, EyeOff, Eye, Building2,
  Palette, ImageIcon, Paperclip, Globe, Wrench, FileText,
} from 'lucide-react';
import { VoiceMicButton } from '@/components/VoiceMicButton';
import { type ModuleContent } from '@/data/trainingContent';
import { getRoleScenario } from '@/data/roleScenarioBanks';
import { type PracticeConversation } from '@/hooks/usePracticeConversations';
import { AVAILABLE_MODELS, PROVIDER_COLORS, type ModelDefinition } from '@/lib/models';
import { useToast } from '@/hooks/use-toast';
import { type BankPolicy } from '@/types/training';

interface PracticeMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatGPTPracticeChatPanelProps {
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
  displayName?: string;
  allowedModels?: string[];
  selectedModel?: string;
  onModelChange?: (modelId: string) => void;
  gateMessage?: string | null;
  // Edge extras
  orgName?: string;
  policies?: BankPolicy[];
}

const PLUS_MENU_ITEMS = [
  { icon: Palette, label: 'Canvas', action: 'coming_soon' },
  { icon: ImageIcon, label: 'Create Image', action: 'coming_soon' },
  { icon: Paperclip, label: 'Upload File', action: 'coming_soon' },
  { icon: Globe, label: 'Search the Web', action: 'coming_soon' },
  { icon: Building2, label: 'Company knowledge', action: 'knowledge' },
  { icon: Wrench, label: 'Use a Tool', action: 'coming_soon' },
] as const;

export function ChatGPTPracticeChatPanel({
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
  lineOfBusiness,
  displayName,
  allowedModels = [],
  selectedModel,
  onModelChange,
  gateMessage,
  orgName,
  policies = [],
}: ChatGPTPracticeChatPanelProps) {
  const { toast } = useToast();
  const [input, setInput] = useState('');
  const [plusMenuOpen, setPlusMenuOpen] = useState(false);
  const [modelDropdownOpen, setModelDropdownOpen] = useState(false);
  const [incognito, setIncognito] = useState(false);
  const [knowledgeOpen, setKnowledgeOpen] = useState(false);

  const showModelSelector = allowedModels.length > 1 && !!selectedModel && !!onModelChange;
  const selectedModelDef: ModelDefinition | undefined = AVAILABLE_MODELS.find(m => m.id === selectedModel);
  const allowedModelDefs = AVAILABLE_MODELS.filter(m => allowedModels.includes(m.id));

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Department-specific scenario and hints
  const deptScenarios = module.content.practiceTask.departmentScenarios;
  const roleScenario = lineOfBusiness ? getRoleScenario(module.id, lineOfBusiness) : null;
  const activeHints = (deptScenarios && lineOfBusiness && deptScenarios[lineOfBusiness]?.hints)
    ? deptScenarios[lineOfBusiness].hints
    : roleScenario?.hints ?? module.content.practiceTask.hints;

  const hasConversation = messages.length > 0;
  const isSandbox = module.type === 'sandbox';
  const firstName = displayName || 'there';
  const displayOrgName = orgName || 'your organization';

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim() || isLoading) return;
    onSendMessage(input.trim());
    setInput('');
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handlePlusItem = (action: string) => {
    setPlusMenuOpen(false);
    if (action === 'coming_soon') {
      toast({ title: 'Coming soon', description: 'This feature will be available shortly.' });
    } else if (action === 'knowledge') {
      setKnowledgeOpen(true);
    }
  };

  const handleToggleIncognito = () => {
    const next = !incognito;
    setIncognito(next);
    if (next) {
      // Start a fresh session when entering incognito
      onNewChat();
    }
  };

  // Auto-resize textarea
  const handleTextareaInput = (e: React.FormEvent<HTMLTextAreaElement>) => {
    const t = e.currentTarget;
    t.style.height = 'auto';
    t.style.height = `${Math.min(t.scrollHeight, 200)}px`;
  };

  const modelLabel = showModelSelector
    ? (selectedModelDef?.label ?? selectedModel ?? 'AI')
    : 'ChatGPT';

  return (
    <div className="flex flex-col flex-1 min-h-0 bg-white dark:bg-[#212121] text-foreground">

      {/* ── Top bar ── */}
      <div className="flex items-center justify-between px-4 pt-3 pb-2 shrink-0">
        {/* Left: model selector / label */}
        <div className="relative">
          <button
            type="button"
            onClick={() => showModelSelector && setModelDropdownOpen(o => !o)}
            className={`flex items-center gap-1.5 text-sm font-semibold text-gray-800 dark:text-gray-100 ${showModelSelector ? 'hover:text-gray-600 dark:hover:text-gray-300' : 'cursor-default'}`}
          >
            {modelLabel}
            {showModelSelector && (
              modelDropdownOpen
                ? <ChevronUp className="h-3.5 w-3.5 text-gray-500" />
                : <ChevronDown className="h-3.5 w-3.5 text-gray-500" />
            )}
          </button>

          {/* Model dropdown */}
          {modelDropdownOpen && showModelSelector && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setModelDropdownOpen(false)} />
              <div className="absolute top-full left-0 mt-1 z-50 w-56 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#2f2f2f] shadow-lg py-1">
                {allowedModelDefs.map(model => (
                  <button
                    key={model.id}
                    type="button"
                    onClick={() => { onModelChange!(model.id); setModelDropdownOpen(false); }}
                    className={`w-full flex items-start gap-2.5 px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${model.id === selectedModel ? 'bg-gray-50 dark:bg-gray-800' : ''}`}
                  >
                    <span className={`mt-0.5 shrink-0 px-1.5 py-0.5 rounded text-[10px] font-medium leading-none ${PROVIDER_COLORS[model.provider]}`}>
                      {model.provider.toUpperCase().slice(0, 4)}
                    </span>
                    <div>
                      <p className="text-xs font-medium text-gray-800 dark:text-gray-200">{model.label}</p>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400">{model.description}</p>
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Right: incognito toggle */}
        <div className="flex items-center gap-2">
          {incognito && (
            <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2.5 py-1 rounded-full">
              <EyeOff className="h-3 w-3" />
              Incognito
            </span>
          )}
          <button
            type="button"
            onClick={handleToggleIncognito}
            title={incognito ? 'Turn off incognito' : 'Turn on incognito'}
            className={`p-1.5 rounded-lg transition-colors ${incognito ? 'text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-800' : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
          >
            {incognito ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* ── Messages area ── */}
      {hasConversation ? (
        <ScrollArea className="flex-1 w-full">
          <div className="max-w-[680px] mx-auto px-4 py-4 space-y-6">
            {messages.map((message, idx) => (
              <div
                key={idx}
                className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {message.role === 'assistant' && (
                  <div className="w-7 h-7 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0 mt-1">
                    <Bot className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                  </div>
                )}
                <div
                  className={`max-w-[85%] ${
                    message.role === 'user'
                      ? 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-100 rounded-2xl px-4 py-3'
                      : 'text-gray-800 dark:text-gray-100'
                  }`}
                >
                  <div className="prose prose-sm max-w-none dark:prose-invert [&>p]:mb-1.5 [&>p]:text-sm [&>p]:leading-relaxed [&>ul]:my-1.5 [&>ul]:pl-4 [&>ol]:my-1.5 [&>ol]:pl-4 [&>li]:mb-0.5 [&>li]:text-sm [&>table]:w-full [&>table]:border-collapse [&>table]:my-2 [&_th]:border [&_th]:border-gray-200 [&_th]:px-2 [&_th]:py-1 [&_th]:bg-gray-50 [&_th]:text-left [&_th]:font-semibold [&_th]:text-xs [&_td]:border [&_td]:border-gray-200 [&_td]:px-2 [&_td]:py-1 [&_td]:text-xs">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
                  </div>
                </div>
              </div>
            ))}

            {/* Animated loading dots */}
            {isLoading && (
              <div className="flex gap-3 justify-start">
                <div className="w-7 h-7 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0">
                  <Bot className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                </div>
                <div className="flex items-center gap-1 py-3">
                  <span className="w-2 h-2 rounded-full bg-gray-400 dark:bg-gray-500 animate-bounce [animation-delay:0ms]" />
                  <span className="w-2 h-2 rounded-full bg-gray-400 dark:bg-gray-500 animate-bounce [animation-delay:150ms]" />
                  <span className="w-2 h-2 rounded-full bg-gray-400 dark:bg-gray-500 animate-bounce [animation-delay:300ms]" />
                </div>
              </div>
            )}

            {/* Submitted indicator */}
            {isSubmitted && (
              <div className="w-full">
                {isCompleted ? (
                  <div className="p-4 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900 rounded-2xl text-center">
                    <div className="flex items-center justify-center gap-2 text-green-600 dark:text-green-400 font-medium">
                      <CheckCircle className="h-5 w-5" />
                      Great work!
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Andrea has reviewed your conversation and you're ready to move on.
                    </p>
                    <div className="mt-3 flex items-center justify-center gap-2">
                      {hasNextModule && onContinueToNext ? (
                        <button
                          onClick={onContinueToNext}
                          className="flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium transition-colors"
                        >
                          Continue to Next Module
                          <ChevronRight className="h-4 w-4" />
                        </button>
                      ) : onCompleteSession ? (
                        <button
                          onClick={onCompleteSession}
                          className="flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium transition-colors"
                        >
                          Complete Session
                          <CheckCircle className="h-4 w-4" />
                        </button>
                      ) : null}
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 rounded-2xl text-center">
                    <div className="flex items-center justify-center gap-2 text-amber-600 dark:text-amber-400 font-medium">
                      <AlertCircle className="h-5 w-5" />
                      Almost there!
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {gateMessage || "Your conversation needs a bit more work. Check Andrea's feedback in the coach panel."}
                    </p>
                    <div className="mt-3">
                      <button
                        onClick={onNewChat}
                        className="flex items-center gap-2 px-4 py-2 rounded-full border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors mx-auto"
                      >
                        <RotateCcw className="h-4 w-4" />
                        Try Again
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      ) : (
        /* ── Empty state ── */
        <div className="flex-1 flex flex-col items-center justify-center">
          <h1 className="text-[28px] font-light text-gray-800 dark:text-gray-100 text-center">
            How can I help you{firstName !== 'there' ? `, ${firstName}` : ''}?
          </h1>
        </div>
      )}

      {/* ── Input area ── */}
      <div className="w-full max-w-[680px] mx-auto px-4 pb-2 pt-2 shrink-0">

        {/* Get Andrea's Feedback chip — appears above input after 1+ exchanges */}
        {hasConversation && !isSubmitted && !isLoading && !isSandbox && (
          <div className="flex justify-center mb-3">
            <button
              onClick={onSubmitForReview}
              className="flex items-center gap-1.5 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#2f2f2f] text-xs text-gray-600 dark:text-gray-300 px-3.5 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 shadow-sm transition-colors"
            >
              <CheckCircle className="h-3.5 w-3.5 text-green-500" />
              Get Andrea's Feedback
            </button>
          </div>
        )}

        {/* Pill input bar */}
        <div className="relative">
          {/* + menu popover */}
          {plusMenuOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setPlusMenuOpen(false)} />
              <div className="absolute bottom-full left-0 mb-2 w-52 bg-white dark:bg-[#2f2f2f] border border-gray-200 dark:border-gray-700 rounded-2xl shadow-lg py-1.5 z-50">
                {PLUS_MENU_ITEMS.map(({ icon: Icon, label, action }) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => handlePlusItem(action)}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors mx-0 text-left"
                  >
                    <Icon className="h-4 w-4 text-gray-500 dark:text-gray-400 shrink-0" />
                    {label}
                  </button>
                ))}
              </div>
            </>
          )}

          <div className="rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#2f2f2f] shadow-sm flex items-center px-3 py-2 gap-2">
            {/* + button */}
            <button
              type="button"
              onClick={() => setPlusMenuOpen(o => !o)}
              className="p-1 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors shrink-0"
              aria-label="More options"
            >
              <Plus className="h-4 w-4" />
            </button>

            {/* Textarea */}
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              onInput={handleTextareaInput}
              placeholder="Ask anything"
              rows={1}
              disabled={isLoading}
              className="flex-1 resize-none border-0 bg-transparent focus:outline-none text-sm text-gray-800 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 max-h-[200px] leading-relaxed py-1"
              style={{ height: 'auto' }}
            />

            {/* Mic */}
            <VoiceMicButton
              onTranscript={text => setInput(prev => (prev ? prev + ' ' : '') + text)}
              disabled={isLoading}
              size="default"
            />

            {/* Send / Audio circle button */}
            <button
              type="button"
              onClick={input.trim() ? handleSend : undefined}
              disabled={isLoading}
              aria-label={input.trim() ? 'Send message' : 'Voice input'}
              className="w-8 h-8 rounded-full bg-blue-500 hover:bg-blue-600 disabled:opacity-60 text-white flex items-center justify-center shrink-0 transition-colors"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : input.trim() ? (
                <ArrowUp className="h-4 w-4" />
              ) : (
                <AudioLines className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        {/* Below-input chips (empty state only) */}
        {!hasConversation && (
          <div className="flex justify-center gap-2 mt-3">
            <button
              type="button"
              onClick={() => handlePlusItem('knowledge')}
              className="flex items-center gap-1.5 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#2f2f2f] text-xs text-gray-600 dark:text-gray-300 px-3.5 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 shadow-sm transition-colors"
            >
              <Building2 className="h-3.5 w-3.5 text-gray-500" />
              Company knowledge
            </button>
          </div>
        )}
      </div>

      {/* ── Footer disclaimer ── */}
      <p className="text-xs text-gray-400 dark:text-gray-600 text-center pb-3 px-4 shrink-0">
        LLM can make mistakes. LLM doesn't use {displayOrgName}'s workspace data to train its models.
      </p>

      {/* ── Company Knowledge sheet ── */}
      <Sheet open={knowledgeOpen} onOpenChange={setKnowledgeOpen}>
        <SheetContent side="right" className="w-[380px] sm:w-[420px] flex flex-col">
          <SheetHeader className="shrink-0">
            <SheetTitle className="flex items-center gap-2 text-sm">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              Company Knowledge
            </SheetTitle>
          </SheetHeader>
          <ScrollArea className="flex-1 mt-4">
            {policies.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-3 py-16 text-center px-4">
                <FileText className="h-8 w-8 text-muted-foreground/30" />
                <p className="text-sm text-muted-foreground">
                  No org resources have been published yet.
                </p>
              </div>
            ) : (
              <div className="space-y-3 px-1 pb-4">
                {policies.filter(p => p.is_active !== false).map(policy => (
                  <div key={policy.id} className="rounded-xl border bg-card p-4 space-y-1.5">
                    <p className="text-sm font-medium text-foreground leading-snug">{policy.title}</p>
                    {policy.summary && (
                      <p className="text-xs text-muted-foreground leading-relaxed">{policy.summary}</p>
                    )}
                    <span className="inline-block text-[10px] uppercase tracking-wide text-muted-foreground/60 font-medium">
                      {policy.policy_type}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </SheetContent>
      </Sheet>
    </div>
  );
}
