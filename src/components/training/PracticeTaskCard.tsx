import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';
import { Loader2, Send, Sparkles, Lightbulb, AlertCircle, Target, CheckCircle, ChevronRight, ChevronDown } from 'lucide-react';
import { type ModuleContent } from '@/data/trainingContent';

interface PracticeTaskCardProps {
  module: ModuleContent;
  practiceInput: string;
  onPracticeInputChange: (value: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
  isCompleted: boolean;
  onContinueToNext?: () => void;
  onCompleteSession?: () => void;
  hasNextModule: boolean;
}

export function PracticeTaskCard({
  module,
  practiceInput,
  onPracticeInputChange,
  onSubmit,
  isLoading,
  isCompleted,
  onContinueToNext,
  onCompleteSession,
  hasNextModule,
}: PracticeTaskCardProps) {
  const [scenarioOpen, setScenarioOpen] = useState(false);
  const [criteriaOpen, setCriteriaOpen] = useState(false);

  const handleHintClick = (hint: string) => {
    // Insert the hint text into the textarea, appending on a new line if there's existing content
    if (practiceInput.trim()) {
      onPracticeInputChange(practiceInput + '\n' + hint);
    } else {
      onPracticeInputChange(hint);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      if (!isLoading && practiceInput.trim()) {
        onSubmit();
      }
    }
  };

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Centered Task Header */}
      <div className="text-center py-6">
        <div className="inline-flex items-center gap-2 text-primary mb-2">
          <Sparkles className="h-5 w-5" aria-hidden="true" />
          <h3 className="text-lg font-semibold">
            {module.content.practiceTask.title}
          </h3>
        </div>
        <p className="text-sm text-muted-foreground max-w-xl mx-auto">
          {module.content.practiceTask.instructions}
        </p>
      </div>

      {/* Collapsible Scenario */}
      <Collapsible open={scenarioOpen} onOpenChange={setScenarioOpen} className="mx-auto w-full max-w-2xl mb-3">
        <CollapsibleTrigger className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors w-full px-4 py-2 rounded-lg hover:bg-muted/50">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>View Scenario</span>
          <ChevronDown className={`h-4 w-4 ml-auto transition-transform duration-200 ${scenarioOpen ? 'rotate-180' : ''}`} />
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="mt-2 bg-accent/50 border border-accent p-4 rounded-lg">
            <p className="text-sm whitespace-pre-wrap">{module.content.practiceTask.scenario}</p>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Collapsible Success Criteria */}
      <Collapsible open={criteriaOpen} onOpenChange={setCriteriaOpen} className="mx-auto w-full max-w-2xl mb-4">
        <CollapsibleTrigger className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors w-full px-4 py-2 rounded-lg hover:bg-muted/50">
          <Target className="h-4 w-4 text-primary shrink-0" />
          <span>Success Criteria</span>
          <ChevronDown className={`h-4 w-4 ml-auto transition-transform duration-200 ${criteriaOpen ? 'rotate-180' : ''}`} />
        </CollapsibleTrigger>
        <CollapsibleContent>
          <ul className="mt-2 space-y-1.5 px-4">
            {module.content.practiceTask.successCriteria.map((criteria, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                {criteria}
              </li>
            ))}
          </ul>
        </CollapsibleContent>
      </Collapsible>

      {/* Flex spacer pushes composer toward bottom */}
      <div className="flex-1" />

      {/* Completion Banner */}
      {isCompleted && (
        <div className="mx-auto w-full max-w-2xl mb-4">
          <div className="p-4 bg-primary/10 border border-primary/20 rounded-xl text-center">
            <div className="flex items-center justify-center gap-2 text-primary font-medium">
              <CheckCircle className="h-5 w-5" />
              Practice Submitted!
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Check Andrea's feedback on the right panel →
            </p>
            <div className="mt-3">
              {hasNextModule && onContinueToNext ? (
                <Button onClick={onContinueToNext} className="gap-2">
                  Continue to Next Module
                  <ChevronRight className="h-4 w-4" />
                </Button>
              ) : onCompleteSession ? (
                <Button onClick={onCompleteSession} className="gap-2">
                  Complete Session
                  <CheckCircle className="h-4 w-4" />
                </Button>
              ) : null}
            </div>
          </div>
        </div>
      )}

      {/* Hint Chips */}
      <div className="mx-auto w-full max-w-2xl mb-3 px-2">
        <div className="flex flex-wrap gap-2 justify-center">
          {module.content.practiceTask.hints.map((hint, idx) => (
            <button
              key={idx}
              onClick={() => handleHintClick(hint)}
              className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border bg-background hover:bg-muted hover:border-primary/30 transition-colors text-muted-foreground hover:text-foreground"
            >
              <Lightbulb className="h-3 w-3 text-highlight shrink-0" />
              <span className="line-clamp-1">{hint}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Glass-Style Composer Bar */}
      <div className="mx-auto w-full max-w-2xl px-2 pb-4">
        <div className="relative rounded-2xl border border-border/60 bg-background/80 backdrop-blur-sm shadow-lg">
          <label htmlFor="practice-response" className="sr-only">
            Your Response
          </label>
          <Textarea
            id="practice-response"
            value={practiceInput}
            onChange={(e) => onPracticeInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Write your prompt or response here based on the scenario above..."
            className="min-h-[100px] max-h-[200px] resize-none border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 pr-14 text-sm rounded-2xl"
            aria-describedby="practice-instructions composer-hint"
          />
          <div className="flex items-center justify-between px-3 pb-3">
            <span id="composer-hint" className="text-[10px] text-muted-foreground/60">
              Ctrl+Enter to submit
            </span>
            <Button
              size="icon"
              onClick={onSubmit}
              disabled={isLoading || !practiceInput.trim()}
              className="h-8 w-8 rounded-full"
              aria-label="Submit for review"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
