import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  CheckCircle, Circle, Zap, ListOrdered, ShieldCheck, FileOutput, Send,
} from 'lucide-react';
import type { WorkflowData } from '@/types/workflow';
import { countCompletedSteps, countReviewCheckpoints, isWorkflowComplete } from '@/types/workflow';

interface WorkflowSummaryCardProps {
  workflowData: WorkflowData;
  workflowName: string;
  onSubmitForReview: () => void;
  isSubmitting?: boolean;
}

export function WorkflowSummaryCard({
  workflowData,
  workflowName,
  onSubmitForReview,
  isSubmitting,
}: WorkflowSummaryCardProps) {
  const completedSteps = countCompletedSteps(workflowData);
  const reviewCheckpoints = countReviewCheckpoints(workflowData);
  const hasTrigger = workflowData.trigger.trim().length > 0;
  const hasFinalOutput = workflowData.finalOutput.trim().length > 0;
  const ready = isWorkflowComplete(workflowData);

  return (
    <ScrollArea className="flex-1">
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-lg font-semibold text-foreground">{workflowName || 'My Workflow'}</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Review your workflow before submitting to Andrea for feedback.
          </p>
        </div>

        {/* Status card */}
        <div className="rounded-xl border bg-card p-4 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Workflow Readiness</span>
            <Badge variant={ready ? 'default' : 'secondary'} className="text-xs">
              {ready ? 'Ready to Submit' : 'Needs Work'}
            </Badge>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-3">
              {hasTrigger ? (
                <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
              ) : (
                <Circle className="h-4 w-4 text-muted-foreground shrink-0" />
              )}
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Zap className="h-3.5 w-3.5 text-amber-500" />
                  <span className="text-sm font-medium">Trigger Event</span>
                </div>
                {hasTrigger && (
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2 ml-5.5">
                    {workflowData.trigger}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              {completedSteps >= 3 ? (
                <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
              ) : (
                <Circle className="h-4 w-4 text-muted-foreground shrink-0" />
              )}
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <ListOrdered className="h-3.5 w-3.5 text-blue-500" />
                  <span className="text-sm font-medium">Workflow Steps</span>
                  <Badge variant="secondary" className="text-xs">{completedSteps}/{workflowData.steps.length}</Badge>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {reviewCheckpoints >= 2 ? (
                <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
              ) : (
                <Circle className="h-4 w-4 text-muted-foreground shrink-0" />
              )}
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-3.5 w-3.5 text-amber-500" />
                  <span className="text-sm font-medium">Review Checkpoints</span>
                  <Badge variant="secondary" className="text-xs">{reviewCheckpoints}</Badge>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {hasFinalOutput ? (
                <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
              ) : (
                <Circle className="h-4 w-4 text-muted-foreground shrink-0" />
              )}
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <FileOutput className="h-3.5 w-3.5 text-purple-500" />
                  <span className="text-sm font-medium">Final Output</span>
                </div>
                {hasFinalOutput && (
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2 ml-5.5">
                    {workflowData.finalOutput}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Steps overview */}
        <div className="rounded-xl border bg-card p-4 space-y-3">
          <h3 className="text-sm font-medium">Steps Overview</h3>
          <div className="space-y-2">
            {workflowData.steps.map((step, idx) => {
              const isComplete = step.name.trim() && step.aiPromptTemplate.trim();
              return (
                <div
                  key={idx}
                  className={`flex items-start gap-3 p-2 rounded-lg ${isComplete ? 'bg-muted/30' : 'bg-muted/10 opacity-60'}`}
                >
                  <div className="flex items-center gap-2 shrink-0 mt-0.5">
                    <Badge variant={isComplete ? 'default' : 'secondary'} className="text-xs w-14 justify-center">
                      Step {idx + 1}
                    </Badge>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {step.name || 'Unnamed step'}
                    </p>
                    {step.outputDescription && (
                      <p className="text-xs text-muted-foreground truncate mt-0.5">
                        Output: {step.outputDescription}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {step.humanReview && (
                      <Badge variant="outline" className="text-xs text-amber-600 border-amber-300">
                        Review
                      </Badge>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Submit button */}
        <Button
          className="w-full gap-2"
          size="lg"
          disabled={!ready || isSubmitting}
          onClick={onSubmitForReview}
        >
          <Send className="h-4 w-4" />
          {isSubmitting ? 'Submitting...' : 'Submit to Andrea for Feedback'}
        </Button>

        {!ready && (
          <p className="text-xs text-muted-foreground text-center">
            Complete all readiness criteria above before submitting.
          </p>
        )}
      </div>
    </ScrollArea>
  );
}
