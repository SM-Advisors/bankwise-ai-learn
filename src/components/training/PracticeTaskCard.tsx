import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';
import { Loader2, Send, Lightbulb, AlertCircle, Target, CheckCircle, ChevronRight, ChevronDown, Plus, SlidersHorizontal } from 'lucide-react';
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
    <div className="flex flex-col flex-1 min-h-0 items-center justify-center">
      {/* Centered Welcome / Task Title — Copilot style */}
      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-2xl mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-semibold text-foreground text-center mb-2 tracking-tight">
          {module.content.practiceTask.title}
        </h2>
        <p className="text-base text-muted-foreground text-center max-w-lg mb-6">
          {module.content.practiceTask.instructions}
        </p>

        {/* Collapsible details — compact */}
        <div className="w-full max-w-lg space-y-1 mb-4">
          <Collapsible open={scenarioOpen} onOpenChange={setScenarioOpen}>
            <CollapsibleTrigger className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors w-full px-3 py-2 rounded-lg hover:bg-muted/50">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>View Scenario</span>
              <ChevronDown className={`h-4 w-4 ml-auto transition-transform duration-200 ${scenarioOpen ? 'rotate-180' : ''}`} />
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="mt-1 bg-muted/40 border border-border p-4 rounded-xl">
                <p className="text-sm whitespace-pre-wrap">{module.content.practiceTask.scenario}</p>
              </div>
            </CollapsibleContent>
          </Collapsible>

          <Collapsible open={criteriaOpen} onOpenChange={setCriteriaOpen}>
            <CollapsibleTrigger className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors w-full px-3 py-2 rounded-lg hover:bg-muted/50">
              <Target className="h-4 w-4 text-primary shrink-0" />
              <span>Success Criteria</span>
              <ChevronDown className={`h-4 w-4 ml-auto transition-transform duration-200 ${criteriaOpen ? 'rotate-180' : ''}`} />
            </CollapsibleTrigger>
            <CollapsibleContent>
              <ul className="mt-1 space-y-1.5 px-3 pb-2">
                {module.content.practiceTask.successCriteria.map((criteria, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                    {criteria}
                  </li>
                ))}
              </ul>
            </CollapsibleContent>
          </Collapsible>
        </div>
      </div>

      {/* Completion Banner */}
      {isCompleted && (
        <div className="w-full max-w-2xl mx-auto mb-4 px-4">
          <div className="p-4 bg-primary/10 border border-primary/20 rounded-2xl text-center">
            <div className="flex items-center justify-center gap-2 text-primary font-medium">
              <CheckCircle className="h-5 w-5" />
              Practice Submitted!
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Check Andrea's feedback on the right panel →
            </p>
            <div className="mt-3">
              {hasNextModule && onContinueToNext ? (
                <Button onClick={onContinueToNext} className="gap-2 rounded-full">
                  Continue to Next Module
                  <ChevronRight className="h-4 w-4" />
                </Button>
              ) : onCompleteSession ? (
                <Button onClick={onCompleteSession} className="gap-2 rounded-full">
                  Complete Session
                  <CheckCircle className="h-4 w-4" />
                </Button>
              ) : null}
            </div>
          </div>
        </div>
      )}

      {/* Copilot-Style Composer Bar */}
      <div className="w-full max-w-2xl mx-auto px-4 pb-2">
        <div className="rounded-2xl border border-border bg-card shadow-sm">
          <label htmlFor="practice-response" className="sr-only">
            Your Response
          </label>
          <Textarea
            id="practice-response"
            value={practiceInput}
            onChange={(e) => onPracticeInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Message ${module.content.practiceTask.title}...`}
            className="min-h-[56px] max-h-[180px] resize-none border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-sm rounded-t-2xl px-4 pt-3.5 pb-0"
            aria-describedby="practice-instructions composer-hint"
          />
          {/* Toolbar row — mirrors Copilot bottom bar */}
          <div className="flex items-center justify-between px-3 py-2">
            <div className="flex items-center gap-1 text-muted-foreground">
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" disabled>
                <Plus className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="h-8 gap-1.5 rounded-full text-xs px-3" disabled>
                <SlidersHorizontal className="h-3.5 w-3.5" />
                Tools
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <span id="composer-hint" className="text-[10px] text-muted-foreground/50 hidden sm:inline">
                Ctrl+Enter
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

      {/* Suggestion Cards — Copilot style */}
      <div className="w-full max-w-2xl mx-auto px-4 pb-6 pt-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {module.content.practiceTask.hints.slice(0, 3).map((hint, idx) => (
            <button
              key={idx}
              onClick={() => handleHintClick(hint)}
              className="text-left p-4 rounded-xl border border-border bg-card hover:bg-muted/50 hover:border-primary/30 transition-all group"
            >
              <Lightbulb className="h-5 w-5 text-primary mb-2 group-hover:scale-110 transition-transform" />
              <p className="text-sm font-medium text-foreground line-clamp-2">{hint}</p>
              <p className="text-xs text-muted-foreground mt-1">Try this approach</p>
            </button>
          ))}
        </div>
        {module.content.practiceTask.hints.length > 3 && (
          <div className="text-center mt-2">
            <button className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              See more ↓
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
