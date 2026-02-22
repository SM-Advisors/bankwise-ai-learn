import { useState, useRef, useEffect, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import {
  Loader2, Send, Bot, User, ChevronRight, CheckCircle,
  Trophy, Sparkles, FileText, MessageSquare, PenLine,
  Building2, Award,
} from 'lucide-react';
import { CertificateGenerator } from './CertificateGenerator';
import type { CapstoneData } from '@/types/progress';

interface PracticeMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface CapstonePanelProps {
  capstoneData: CapstoneData | null;
  onCapstoneUpdate: (data: Partial<CapstoneData>) => void;
  onSendPracticeMessage: (message: string) => void;
  practiceMessages: PracticeMessage[];
  isPracticeLoading: boolean;
  onSubmitForReview: () => void;
  isSubmitting?: boolean;
  departmentLabel?: string;
  userName?: string;
  bankName?: string;
}

const CAPSTONE_OPTIONS = [
  {
    id: 'A',
    title: 'Process Automation',
    description: 'Design an AI workflow that automates a repetitive process in your department.',
    icon: FileText,
  },
  {
    id: 'B',
    title: 'Customer Communication',
    description: 'Build an AI agent that helps draft, review, or respond to customer communications.',
    icon: MessageSquare,
  },
  {
    id: 'C',
    title: 'Analysis & Reporting',
    description: 'Create an AI solution that analyzes data and generates structured reports.',
    icon: PenLine,
  },
  {
    id: 'D',
    title: 'Custom Project',
    description: 'Define your own AI use case relevant to your role.',
    icon: Sparkles,
  },
];

type CapstoneStep = 'choose' | 'practice' | 'reflect' | 'complete';

export function CapstonePanel({
  capstoneData,
  onCapstoneUpdate,
  onSendPracticeMessage,
  practiceMessages,
  isPracticeLoading,
  onSubmitForReview,
  isSubmitting,
  departmentLabel,
  userName,
  bankName,
}: CapstonePanelProps) {
  const [currentStep, setCurrentStep] = useState<CapstoneStep>('choose');
  const [customTask, setCustomTask] = useState(capstoneData?.customTask || '');
  const [input, setInput] = useState('');
  const [reflections, setReflections] = useState({
    workWell: capstoneData?.reflectionWorkWell || '',
    wentWrong: capstoneData?.reflectionWentWrong || '',
    doNextTime: capstoneData?.reflectionDoNextTime || '',
  });
  const [showCelebration, setShowCelebration] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Restore step from saved data
  useEffect(() => {
    if (capstoneData?.completedAt) {
      setCurrentStep('complete');
      setShowCelebration(false);
    } else if (capstoneData?.reflectionWorkWell) {
      setCurrentStep('reflect');
    } else if (capstoneData?.selectedOption && practiceMessages.length > 0) {
      setCurrentStep('practice');
    } else if (capstoneData?.selectedOption) {
      setCurrentStep('practice');
    }
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [practiceMessages]);

  const userPromptCount = practiceMessages.filter(m => m.role === 'user').length;
  const minPromptsRequired = 3;
  const canAdvanceToReflect = userPromptCount >= minPromptsRequired;

  const handleSelectOption = (optionId: string) => {
    onCapstoneUpdate({ selectedOption: optionId });
    if (optionId === 'D') {
      // Wait for custom task input
    } else {
      setCurrentStep('practice');
    }
  };

  const handleConfirmCustom = () => {
    if (customTask.trim().length < 10) return;
    onCapstoneUpdate({ selectedOption: 'D', customTask: customTask.trim() });
    setCurrentStep('practice');
  };

  const handleSend = useCallback(() => {
    if (!input.trim() || isPracticeLoading) return;
    onSendPracticeMessage(input.trim());
    setInput('');
    setTimeout(() => inputRef.current?.focus(), 100);
  }, [input, isPracticeLoading, onSendPracticeMessage]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleAdvanceToReflect = () => {
    setCurrentStep('reflect');
  };

  const handleSubmitCapstone = async () => {
    // Save reflections
    onCapstoneUpdate({
      reflectionWorkWell: reflections.workWell,
      reflectionWentWrong: reflections.wentWrong,
      reflectionDoNextTime: reflections.doNextTime,
      completedAt: new Date().toISOString(),
    });

    // Trigger the review
    onSubmitForReview();

    // Show celebration
    setShowCelebration(true);
    setTimeout(() => {
      setShowCelebration(false);
      setCurrentStep('complete');
    }, 3000);
  };

  const reflectionsValid =
    reflections.workWell.length >= 50 &&
    reflections.wentWrong.length >= 50 &&
    reflections.doNextTime.length >= 50;

  const selectedOptionLabel = CAPSTONE_OPTIONS.find(o => o.id === capstoneData?.selectedOption)?.title || 'Custom Project';

  const steps: { id: CapstoneStep; label: string; num: number }[] = [
    { id: 'choose', label: 'Choose', num: 1 },
    { id: 'practice', label: 'Practice', num: 2 },
    { id: 'reflect', label: 'Reflect', num: 3 },
    { id: 'complete', label: 'Complete', num: 4 },
  ];
  const currentStepNum = steps.findIndex(s => s.id === currentStep) + 1;

  // ==================== RENDER ====================

  // Celebration overlay
  if (showCelebration) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-4 animate-in fade-in duration-500">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mb-6 animate-bounce">
          <Trophy className="h-10 w-10 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-foreground text-center mb-2">
          Congratulations! 🎉
        </h1>
        <p className="text-lg text-muted-foreground text-center max-w-md">
          You've completed the AI Training Program capstone project!
        </p>
        <div className="flex items-center gap-2 mt-4">
          <Sparkles className="h-5 w-5 text-amber-500 animate-pulse" />
          <span className="text-sm font-medium text-amber-600">Generating your results...</span>
          <Sparkles className="h-5 w-5 text-amber-500 animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 min-h-0 bg-background">
      {/* Step progress header */}
      <div className="px-4 pt-4 pb-3 border-b bg-card">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Award className="h-5 w-5 text-amber-500" />
            <span className="font-semibold text-sm">Capstone Project</span>
          </div>
          {departmentLabel && (
            <Badge variant="outline" className="gap-1.5 text-xs">
              <Building2 className="h-3 w-3" />
              {departmentLabel}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-1">
          {steps.map((step, idx) => (
            <div key={step.id} className="flex items-center">
              <div
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                  step.num < currentStepNum
                    ? 'bg-green-500/10 text-green-600'
                    : step.num === currentStepNum
                    ? 'bg-primary/10 text-primary'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {step.num < currentStepNum ? (
                  <CheckCircle className="h-3.5 w-3.5" />
                ) : (
                  <span className="w-4 h-4 rounded-full border flex items-center justify-center text-[10px]">
                    {step.num}
                  </span>
                )}
                {step.label}
              </div>
              {idx < steps.length - 1 && (
                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground mx-0.5" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ===== STEP 1: Choose ===== */}
      {currentStep === 'choose' && (
        <ScrollArea className="flex-1">
          <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
            <div className="text-center">
              <h2 className="text-lg font-semibold">Choose Your Capstone Project</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Select a project type that aligns with your role and department goals.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {CAPSTONE_OPTIONS.map((option) => {
                const Icon = option.icon;
                const isSelected = capstoneData?.selectedOption === option.id;
                return (
                  <button
                    key={option.id}
                    onClick={() => handleSelectOption(option.id)}
                    className={`text-left p-4 rounded-xl border transition-all ${
                      isSelected
                        ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
                        : 'border-border bg-card hover:bg-accent/5 hover:border-accent/30'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`p-2 rounded-lg ${isSelected ? 'bg-primary/10' : 'bg-muted'}`}>
                        <Icon className={`h-4 w-4 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
                      </div>
                      <Badge variant={isSelected ? 'default' : 'secondary'} className="text-xs">
                        Option {option.id}
                      </Badge>
                    </div>
                    <h3 className="font-medium text-sm">{option.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{option.description}</p>
                  </button>
                );
              })}
            </div>

            {/* Custom task input */}
            {capstoneData?.selectedOption === 'D' && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">Describe Your Custom Project</Label>
                <Textarea
                  value={customTask}
                  onChange={(e) => setCustomTask(e.target.value)}
                  placeholder="Describe the AI use case you want to explore (min 10 characters)..."
                  rows={3}
                />
                <Button
                  onClick={handleConfirmCustom}
                  disabled={customTask.trim().length < 10}
                  className="w-full"
                >
                  Continue with Custom Project
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            )}
          </div>
        </ScrollArea>
      )}

      {/* ===== STEP 2: Practice ===== */}
      {currentStep === 'practice' && (
        <div className="flex flex-col flex-1 min-h-0">
          {/* Practice info bar */}
          <div className="px-4 py-2 bg-muted/30 border-b flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">{selectedOptionLabel}</Badge>
              <span className="text-xs text-muted-foreground">
                Prompt {userPromptCount} of {minPromptsRequired}+
              </span>
            </div>
            {canAdvanceToReflect && (
              <Button size="sm" variant="outline" onClick={handleAdvanceToReflect} className="gap-1.5 text-xs">
                Continue to Reflection
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>

          {/* Messages */}
          {practiceMessages.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center px-4">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                <Bot className="h-7 w-7 text-primary" />
              </div>
              <h2 className="text-lg font-semibold text-center mb-1">
                Start Your Capstone Practice
              </h2>
              <p className="text-sm text-muted-foreground text-center max-w-md">
                Apply everything you've learned. Send at least {minPromptsRequired} prompts to demonstrate your AI skills.
              </p>
            </div>
          ) : (
            <ScrollArea className="flex-1">
              <div className="max-w-2xl mx-auto px-4 py-4 space-y-4">
                {practiceMessages.map((message, idx) => (
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
                      <div className="prose prose-sm max-w-none dark:prose-invert [&>p]:mb-1.5 [&>p]:text-sm [&>p]:leading-relaxed [&>ul]:my-1.5 [&>ul]:pl-4 [&>ol]:my-1.5 [&>ol]:pl-4 [&>li]:mb-0.5 [&>li]:text-sm">
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

                {isPracticeLoading && (
                  <div className="flex gap-3 justify-start">
                    <div className="w-7 h-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                      <Bot className="h-4 w-4 text-primary" />
                    </div>
                    <div className="rounded-2xl px-4 py-3 bg-card border border-border">
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">AI is responding...</span>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
          )}

          {/* Composer */}
          <div className="w-full max-w-2xl mx-auto px-4 pb-3 pt-2">
            <div className="rounded-2xl border border-border bg-card shadow-sm">
              <Textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Apply your AI skills here..."
                className="min-h-[56px] max-h-[180px] resize-none border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-sm text-foreground placeholder:text-muted-foreground/60 rounded-t-2xl px-4 pt-3.5 pb-0"
              />
              <div className="flex items-center justify-between px-3 py-2">
                <span className="text-xs text-muted-foreground px-2">
                  {userPromptCount >= minPromptsRequired
                    ? `${userPromptCount} prompts — ready to continue`
                    : `${userPromptCount}/${minPromptsRequired} prompts`}
                </span>
                {input.trim() ? (
                  <Button
                    size="icon"
                    onClick={handleSend}
                    disabled={isPracticeLoading}
                    className="h-8 w-8 rounded-full"
                  >
                    {isPracticeLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  </Button>
                ) : (
                  <div className="h-8 w-8" />
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== STEP 3: Reflect ===== */}
      {currentStep === 'reflect' && (
        <ScrollArea className="flex-1">
          <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
            <div className="text-center">
              <h2 className="text-lg font-semibold">Reflect on Your Learning</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Take a moment to reflect on your AI training journey. Minimum 50 characters each.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium">What went well?</Label>
                <p className="text-xs text-muted-foreground mb-1.5">
                  What AI skills or techniques did you find most effective?
                </p>
                <Textarea
                  value={reflections.workWell}
                  onChange={(e) => setReflections(prev => ({ ...prev, workWell: e.target.value }))}
                  placeholder="I found that providing specific context and examples in my prompts led to much better AI responses..."
                  rows={4}
                />
                <p className={`text-xs mt-1 ${reflections.workWell.length >= 50 ? 'text-green-600' : 'text-muted-foreground'}`}>
                  {reflections.workWell.length}/50 characters minimum
                </p>
              </div>

              <div>
                <Label className="text-sm font-medium">What challenges did you face?</Label>
                <p className="text-xs text-muted-foreground mb-1.5">
                  What was harder than expected or didn't work as planned?
                </p>
                <Textarea
                  value={reflections.wentWrong}
                  onChange={(e) => setReflections(prev => ({ ...prev, wentWrong: e.target.value }))}
                  placeholder="I struggled with getting the AI to maintain consistent formatting across multiple prompts..."
                  rows={4}
                />
                <p className={`text-xs mt-1 ${reflections.wentWrong.length >= 50 ? 'text-green-600' : 'text-muted-foreground'}`}>
                  {reflections.wentWrong.length}/50 characters minimum
                </p>
              </div>

              <div>
                <Label className="text-sm font-medium">What will you do differently going forward?</Label>
                <p className="text-xs text-muted-foreground mb-1.5">
                  How will you apply what you've learned in your daily work?
                </p>
                <Textarea
                  value={reflections.doNextTime}
                  onChange={(e) => setReflections(prev => ({ ...prev, doNextTime: e.target.value }))}
                  placeholder="Going forward, I plan to create reusable prompt templates for common tasks like..."
                  rows={4}
                />
                <p className={`text-xs mt-1 ${reflections.doNextTime.length >= 50 ? 'text-green-600' : 'text-muted-foreground'}`}>
                  {reflections.doNextTime.length}/50 characters minimum
                </p>
              </div>
            </div>

            <Button
              className="w-full gap-2"
              size="lg"
              disabled={!reflectionsValid || isSubmitting}
              onClick={handleSubmitCapstone}
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trophy className="h-4 w-4" />
              )}
              {isSubmitting ? 'Submitting...' : 'Submit Capstone Project'}
            </Button>
          </div>
        </ScrollArea>
      )}

      {/* ===== STEP 4: Complete ===== */}
      {currentStep === 'complete' && (
        <ScrollArea className="flex-1">
          <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mx-auto mb-4">
                <Trophy className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-xl font-bold">Program Complete!</h2>
              <p className="text-sm text-muted-foreground mt-1">
                You've completed the SMILE AI Training Program. Here's your summary.
              </p>
            </div>

            {/* Summary card */}
            <div className="rounded-xl border bg-card p-4 space-y-3">
              <h3 className="text-sm font-medium">Capstone Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Project Type</span>
                  <Badge variant="secondary">{selectedOptionLabel}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Practice Prompts</span>
                  <span className="font-medium">{userPromptCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Completed</span>
                  <span className="font-medium">
                    {capstoneData?.completedAt
                      ? new Date(capstoneData.completedAt).toLocaleDateString()
                      : 'Today'}
                  </span>
                </div>
              </div>
            </div>

            {/* Certificate */}
            <CertificateGenerator
              userName={userName || 'Learner'}
              bankName={bankName || ''}
              completedAt={capstoneData?.completedAt || new Date().toISOString()}
              onGenerated={() => onCapstoneUpdate({ certificateGenerated: true })}
            />
          </div>
        </ScrollArea>
      )}
    </div>
  );
}
