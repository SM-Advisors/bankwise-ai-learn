import { useState, useRef, useEffect, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Loader2, Send, Bot, User, RotateCcw, ChevronRight,
  CheckCircle, Circle, AlertTriangle, ShieldCheck,
} from 'lucide-react';
import { useWorkflowTestChat } from '@/hooks/useWorkflowTestChat';
import type { WorkflowData } from '@/types/workflow';

interface TestMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface WorkflowTestChatProps {
  workflowData: WorkflowData;
  workflowName: string;
}

export function WorkflowTestChat({ workflowData, workflowName }: WorkflowTestChatProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [messages, setMessages] = useState<TestMessage[]>([]);
  const [stepOutputs, setStepOutputs] = useState<string[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [reviewPending, setReviewPending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const { sendMessage } = useWorkflowTestChat();

  const completedSteps = workflowData.steps.filter(s => s.name.trim() && s.aiPromptTemplate.trim());
  const totalSteps = completedSteps.length;
  const currentStep = completedSteps[currentStepIndex];
  const progressPct = totalSteps > 0 ? ((currentStepIndex) / totalSteps) * 100 : 0;

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = useCallback(async () => {
    if (!input.trim() || isLoading || !currentStep) return;

    const userMessage: TestMessage = { role: 'user', content: input.trim() };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setIsLoading(true);

    setTimeout(() => inputRef.current?.focus(), 100);

    try {
      const result = await sendMessage(
        workflowName,
        currentStep,
        currentStepIndex,
        totalSteps,
        updatedMessages,
        stepOutputs.length > 0 ? stepOutputs : undefined,
      );

      if ('error' in result) {
        setMessages(prev => [
          ...prev,
          { role: 'assistant', content: `Error: ${result.error}. Please try again.` },
        ]);
      } else {
        setMessages(prev => [
          ...prev,
          { role: 'assistant', content: result.reply },
        ]);
      }
    } catch {
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: "I'm having a connection issue. Please try again." },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, currentStep, messages, sendMessage, workflowName, currentStepIndex, totalSteps, stepOutputs]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleAdvanceStep = () => {
    // Save last assistant message as step output
    const lastAssistant = [...messages].reverse().find(m => m.role === 'assistant');
    if (lastAssistant) {
      setStepOutputs(prev => [...prev, lastAssistant.content]);
    }

    // Check if next step has human review
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < totalSteps) {
      setCurrentStepIndex(nextIndex);
      setMessages([]);
      setReviewPending(false);

      // If the next step has a human review checkpoint, flag it
      if (completedSteps[nextIndex]?.humanReview) {
        setReviewPending(true);
      }
    }
  };

  const handleApproveReview = () => {
    setReviewPending(false);
  };

  const handleRestart = () => {
    setCurrentStepIndex(0);
    setMessages([]);
    setStepOutputs([]);
    setReviewPending(false);
    setInput('');
  };

  const isComplete = currentStepIndex >= totalSteps - 1 && messages.length > 0 && messages[messages.length - 1].role === 'assistant';

  if (totalSteps < 3) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-4">
        <div className="w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center mb-4">
          <AlertTriangle className="h-7 w-7 text-amber-500" />
        </div>
        <h2 className="text-lg font-semibold text-foreground text-center mb-1">
          Workflow Not Ready
        </h2>
        <p className="text-sm text-muted-foreground text-center max-w-md">
          Complete at least 3 steps in the Build tab before testing your workflow. Each step needs a name and AI prompt template.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 min-h-0 items-center bg-background text-foreground">
      {/* Progress header */}
      <div className="w-full px-4 pt-4 pb-2 space-y-2">
        <div className="flex items-center justify-between">
          <Badge variant="outline" className="gap-1.5 text-xs">
            <Bot className="h-3 w-3" />
            Testing: {workflowName || 'Workflow'}
          </Badge>
          <div className="flex items-center gap-1">
            {messages.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRestart}
                className="h-8 gap-1.5 rounded-full text-sm px-3 text-muted-foreground hover:text-foreground hover:bg-muted"
              >
                <RotateCcw className="h-4 w-4" />
                Restart
              </Button>
            )}
          </div>
        </div>

        {/* Step progress bar */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Step {currentStepIndex + 1} of {totalSteps}: {currentStep?.name || 'Unknown'}</span>
            <span>{Math.round(progressPct)}%</span>
          </div>
          <Progress value={progressPct} className="h-1.5" />
          <div className="flex gap-1">
            {completedSteps.map((step, idx) => (
              <div
                key={idx}
                className={`h-1.5 flex-1 rounded-full transition-colors ${
                  idx < currentStepIndex
                    ? 'bg-green-500'
                    : idx === currentStepIndex
                    ? 'bg-primary'
                    : 'bg-muted'
                }`}
                title={step.name}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Human review checkpoint banner */}
      {reviewPending && (
        <div className="w-full max-w-2xl mx-auto px-4 mt-2">
          <div className="flex items-center justify-between p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
            <div className="flex items-center gap-2 text-amber-600">
              <ShieldCheck className="h-4 w-4 shrink-0" />
              <p className="text-sm font-medium">
                Human Review Checkpoint — Review required before proceeding with this step.
              </p>
            </div>
            <Button size="sm" variant="outline" className="shrink-0 text-amber-600 border-amber-300 hover:bg-amber-50" onClick={handleApproveReview}>
              Approve & Continue
            </Button>
          </div>
        </div>
      )}

      {/* Step info card (empty state) */}
      {messages.length === 0 && !reviewPending && (
        <div className="flex-1 flex flex-col items-center justify-center w-full max-w-2xl mx-auto px-4">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
            <Bot className="h-7 w-7 text-primary" />
          </div>
          <h2 className="text-lg font-semibold text-foreground text-center mb-1">
            Step {currentStepIndex + 1}: {currentStep?.name}
          </h2>
          <p className="text-sm text-muted-foreground text-center max-w-md mb-2">
            {currentStep?.outputDescription
              ? `Expected output: ${currentStep.outputDescription}`
              : 'Send a message to test this step of your workflow.'}
          </p>
          {currentStep?.humanReview && (
            <Badge variant="outline" className="text-xs text-amber-600 border-amber-300 mt-1">
              🛑 Human Review Checkpoint
            </Badge>
          )}

          {/* Suggestion cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6 w-full max-w-lg">
            <button
              onClick={() => setInput(`Process the following sample data for "${currentStep?.name}"`)}
              className="text-left p-3 rounded-xl border border-border bg-card hover:bg-accent/5 hover:border-accent/30 transition-all"
            >
              <Badge variant="outline" className="mb-2 text-xs">Sample Input</Badge>
              <p className="text-xs text-muted-foreground">Test with sample data</p>
            </button>
            <button
              onClick={() => setInput(`What information do you need to complete "${currentStep?.name}"?`)}
              className="text-left p-3 rounded-xl border border-border bg-card hover:bg-accent/5 hover:border-accent/30 transition-all"
            >
              <Badge variant="outline" className="mb-2 text-xs">Requirements</Badge>
              <p className="text-xs text-muted-foreground">Ask what inputs are needed</p>
            </button>
          </div>
        </div>
      )}

      {/* Chat messages */}
      {messages.length > 0 && (
        <ScrollArea className="flex-1 w-full">
          <div className="max-w-2xl mx-auto px-4 py-4 space-y-4">
            <div className="text-center pb-3 border-b border-border">
              <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Workflow Step Test</p>
              <h3 className="text-sm font-medium text-foreground mt-0.5">
                Step {currentStepIndex + 1}: {currentStep?.name}
              </h3>
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
                  <div className="prose prose-sm max-w-none dark:prose-invert [&>p]:mb-1.5 [&>p]:text-sm [&>p]:leading-relaxed [&>ul]:my-1.5 [&>ul]:pl-4 [&>ol]:my-1.5 [&>ol]:pl-4 [&>li]:mb-0.5 [&>li]:text-sm [&>table]:w-full [&>table]:border-collapse [&>table]:my-2 [&_th]:border [&_th]:border-border [&_th]:px-2 [&_th]:py-1 [&_th]:bg-muted [&_th]:text-left [&_th]:font-semibold [&_th]:text-xs [&_td]:border [&_td]:border-border [&_td]:px-2 [&_td]:py-1 [&_td]:text-xs">
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
                    <span className="text-sm text-muted-foreground">Processing step...</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      )}

      {/* Advance / Complete buttons */}
      {messages.length > 0 && messages[messages.length - 1].role === 'assistant' && !isLoading && (
        <div className="w-full max-w-2xl mx-auto px-4 py-2">
          {isComplete ? (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-green-500/10 border border-green-500/20 text-green-600">
              <CheckCircle className="h-4 w-4 shrink-0" />
              <p className="text-sm font-medium flex-1">Workflow test complete! All {totalSteps} steps processed.</p>
              <Button size="sm" variant="outline" onClick={handleRestart} className="shrink-0">
                <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
                Test Again
              </Button>
            </div>
          ) : (
            <Button
              size="sm"
              variant="outline"
              onClick={handleAdvanceStep}
              className="w-full gap-1.5"
            >
              Advance to Step {currentStepIndex + 2}: {completedSteps[currentStepIndex + 1]?.name}
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      )}

      {/* Composer Bar */}
      <div className="w-full max-w-2xl mx-auto px-4 pb-3 pt-2">
        <div className="rounded-2xl border border-border bg-card shadow-sm">
          <Textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={reviewPending ? 'Approve the review checkpoint above to continue...' : `Test step: ${currentStep?.name || 'workflow'}...`}
            disabled={reviewPending}
            className="min-h-[56px] max-h-[180px] resize-none border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-sm text-foreground placeholder:text-muted-foreground/60 rounded-t-2xl px-4 pt-3.5 pb-0"
          />
          <div className="flex items-center justify-between px-3 py-2">
            <span className="text-xs text-muted-foreground px-2">
              {messages.length > 0 ? `${messages.length} messages` : 'Ready to test'}
            </span>
            <div className="flex items-center gap-1">
              {input.trim() ? (
                <Button
                  size="icon"
                  onClick={handleSend}
                  disabled={isLoading || reviewPending}
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
                <div className="h-8 w-8" />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
