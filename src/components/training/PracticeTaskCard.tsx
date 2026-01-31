import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Send, Sparkles, Lightbulb, AlertCircle, Target, CheckCircle, ChevronRight } from 'lucide-react';
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
  return (
    <Card className="border-primary/30">
      <CardHeader className="pb-3 bg-primary/5">
        <CardTitle className="text-base flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          Practice Task: {module.content.practiceTask.title}
        </CardTitle>
        <CardDescription>
          {module.content.practiceTask.instructions}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-4 space-y-4">
        {/* Scenario */}
        <div className="bg-accent/50 border border-accent p-4 rounded-lg">
          <h4 className="font-medium text-sm text-accent-foreground mb-2 flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            Scenario
          </h4>
          <p className="text-sm whitespace-pre-wrap">{module.content.practiceTask.scenario}</p>
        </div>

        {/* Hints */}
        <div>
          <h4 className="font-medium text-sm mb-2">Hints:</h4>
          <ul className="space-y-1">
            {module.content.practiceTask.hints.map((hint, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                <Lightbulb className="h-4 w-4 text-highlight shrink-0 mt-0.5" />
                {hint}
              </li>
            ))}
          </ul>
        </div>

        {/* Input Area */}
        <div>
          <label className="text-sm font-medium mb-2 block">Your Response:</label>
          <Textarea
            value={practiceInput}
            onChange={(e) => onPracticeInputChange(e.target.value)}
            placeholder="Write your prompt or response here based on the scenario above..."
            className="min-h-[150px]"
          />
        </div>
        
        <Button 
          onClick={onSubmit} 
          disabled={isLoading || !practiceInput.trim()}
          className="gap-2"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
          Submit for Review
        </Button>

        {/* Practice Completed Notification */}
        {isCompleted && (
          <div className="border-t pt-4 mt-4">
            <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
              <div className="flex items-center gap-2 text-primary font-medium">
                <CheckCircle className="h-5 w-5" />
                Practice Submitted!
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Check Andrea's feedback on the right panel →
              </p>
              {hasNextModule && onContinueToNext ? (
                <Button 
                  onClick={onContinueToNext}
                  className="mt-3 gap-2"
                >
                  Continue to Next Module
                  <ChevronRight className="h-4 w-4" />
                </Button>
              ) : onCompleteSession ? (
                <Button 
                  onClick={onCompleteSession}
                  className="mt-3 gap-2"
                >
                  Complete Session
                  <CheckCircle className="h-4 w-4" />
                </Button>
              ) : null}
            </div>
          </div>
        )}

        {/* Success Criteria */}
        <div className="border-t pt-4">
          <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
            <Target className="h-4 w-4 text-primary" />
            Success Criteria
          </h4>
          <ul className="space-y-1">
            {module.content.practiceTask.successCriteria.map((criteria, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                {criteria}
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
