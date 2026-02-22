import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { CheckCircle, Circle, Plus, Trash2, Zap, ListOrdered, FileOutput } from 'lucide-react';
import type { WorkflowData, WorkflowStep } from '@/types/workflow';

interface WorkflowBuilderProps {
  workflowData: WorkflowData;
  workflowName: string;
  onDataChange: (data: WorkflowData) => void;
  onNameChange: (name: string) => void;
}

export function WorkflowBuilder({ workflowData, workflowName, onDataChange, onNameChange }: WorkflowBuilderProps) {
  const updateStep = (index: number, updates: Partial<WorkflowStep>) => {
    const newSteps = [...workflowData.steps];
    newSteps[index] = { ...newSteps[index], ...updates };
    onDataChange({ ...workflowData, steps: newSteps });
  };

  const addStep = () => {
    if (workflowData.steps.length >= 8) return;
    onDataChange({
      ...workflowData,
      steps: [...workflowData.steps, { name: '', aiPromptTemplate: '', humanReview: false, outputDescription: '' }],
    });
  };

  const removeStep = (index: number) => {
    if (workflowData.steps.length <= 3) return;
    const newSteps = workflowData.steps.filter((_, i) => i !== index);
    onDataChange({ ...workflowData, steps: newSteps });
  };

  const hasTrigger = workflowData.trigger.trim().length > 0;
  const completedSteps = workflowData.steps.filter(s => s.name.trim() && s.aiPromptTemplate.trim()).length;
  const reviewCheckpoints = workflowData.steps.filter(s => s.humanReview && s.name.trim()).length;
  const hasFinalOutput = workflowData.finalOutput.trim().length > 0;

  return (
    <div className="space-y-4 p-4">
      {/* Workflow Name */}
      <div>
        <Label className="text-sm font-medium text-foreground">Workflow Name</Label>
        <Input
          value={workflowName}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder="e.g., Annual Loan Review Workflow"
          className="mt-1"
        />
      </div>

      <Accordion type="multiple" defaultValue={['trigger', 'steps', 'output']} className="space-y-2">
        {/* Trigger Section */}
        <AccordionItem value="trigger" className="border rounded-xl px-4">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-2">
              {hasTrigger ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <Circle className="h-4 w-4 text-muted-foreground" />
              )}
              <Zap className="h-4 w-4 text-amber-500" />
              <span className="font-medium text-sm">Trigger Event</span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="pb-4">
              <p className="text-xs text-muted-foreground mb-2">What event starts this workflow?</p>
              <Textarea
                value={workflowData.trigger}
                onChange={(e) => onDataChange({ ...workflowData, trigger: e.target.value })}
                placeholder="e.g., Annual review date approaching for a commercial loan > $500K"
                rows={2}
              />
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Steps Section */}
        <AccordionItem value="steps" className="border rounded-xl px-4">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-2">
              {completedSteps >= 3 ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <Circle className="h-4 w-4 text-muted-foreground" />
              )}
              <ListOrdered className="h-4 w-4 text-blue-500" />
              <span className="font-medium text-sm">Workflow Steps</span>
              <Badge variant="secondary" className="text-xs ml-1">
                {completedSteps}/{workflowData.steps.length}
              </Badge>
              {reviewCheckpoints > 0 && (
                <Badge variant="outline" className="text-xs text-amber-600 border-amber-300">
                  {reviewCheckpoints} review{reviewCheckpoints !== 1 ? 's' : ''}
                </Badge>
              )}
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4 pb-4">
              <p className="text-xs text-muted-foreground">Define 3-8 steps. Each step should have an AI prompt template and indicate if human review is needed.</p>
              {workflowData.steps.map((step, idx) => (
                <div key={idx} className="border border-border rounded-lg p-3 space-y-3 bg-card">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant={step.name.trim() ? 'default' : 'secondary'} className="text-xs">
                        Step {idx + 1}
                      </Badge>
                      {step.humanReview && step.name.trim() && (
                        <Badge variant="outline" className="text-xs text-amber-600 border-amber-300">
                          Review Checkpoint
                        </Badge>
                      )}
                    </div>
                    {workflowData.steps.length > 3 && (
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => removeStep(idx)}>
                        <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                      </Button>
                    )}
                  </div>
                  <Input
                    value={step.name}
                    onChange={(e) => updateStep(idx, { name: e.target.value })}
                    placeholder="Step name (e.g., Analyze financial ratios)"
                    className="text-sm"
                  />
                  <Textarea
                    value={step.aiPromptTemplate}
                    onChange={(e) => updateStep(idx, { aiPromptTemplate: e.target.value })}
                    placeholder="AI prompt template for this step..."
                    rows={3}
                    className="text-sm"
                  />
                  <Input
                    value={step.outputDescription}
                    onChange={(e) => updateStep(idx, { outputDescription: e.target.value })}
                    placeholder="Expected output (e.g., Ratio summary table)"
                    className="text-sm"
                  />
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id={`review-${idx}`}
                      checked={step.humanReview}
                      onCheckedChange={(checked) => updateStep(idx, { humanReview: !!checked })}
                    />
                    <Label htmlFor={`review-${idx}`} className="text-xs text-muted-foreground cursor-pointer">
                      Human review required before proceeding
                    </Label>
                  </div>
                </div>
              ))}
              {workflowData.steps.length < 8 && (
                <Button variant="outline" size="sm" onClick={addStep} className="w-full gap-1.5">
                  <Plus className="h-3.5 w-3.5" />
                  Add Step
                </Button>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Final Output Section */}
        <AccordionItem value="output" className="border rounded-xl px-4">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-2">
              {hasFinalOutput ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <Circle className="h-4 w-4 text-muted-foreground" />
              )}
              <FileOutput className="h-4 w-4 text-purple-500" />
              <span className="font-medium text-sm">Final Output</span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="pb-4">
              <p className="text-xs text-muted-foreground mb-2">What does this workflow produce?</p>
              <Textarea
                value={workflowData.finalOutput}
                onChange={(e) => onDataChange({ ...workflowData, finalOutput: e.target.value })}
                placeholder="e.g., Complete annual loan review memo ready for credit committee presentation"
                rows={2}
              />
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Readiness Summary */}
      <div className="bg-muted/50 rounded-xl p-3 space-y-1.5">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Workflow Readiness</p>
        <div className="grid grid-cols-2 gap-1">
          <div className="flex items-center gap-1.5 text-xs">
            {hasTrigger ? <CheckCircle className="h-3 w-3 text-green-500" /> : <Circle className="h-3 w-3 text-muted-foreground" />}
            <span className={hasTrigger ? 'text-foreground' : 'text-muted-foreground'}>Trigger defined</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            {completedSteps >= 3 ? <CheckCircle className="h-3 w-3 text-green-500" /> : <Circle className="h-3 w-3 text-muted-foreground" />}
            <span className={completedSteps >= 3 ? 'text-foreground' : 'text-muted-foreground'}>3+ steps ({completedSteps})</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            {reviewCheckpoints >= 2 ? <CheckCircle className="h-3 w-3 text-green-500" /> : <Circle className="h-3 w-3 text-muted-foreground" />}
            <span className={reviewCheckpoints >= 2 ? 'text-foreground' : 'text-muted-foreground'}>2+ reviews ({reviewCheckpoints})</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            {hasFinalOutput ? <CheckCircle className="h-3 w-3 text-green-500" /> : <Circle className="h-3 w-3 text-muted-foreground" />}
            <span className={hasFinalOutput ? 'text-foreground' : 'text-muted-foreground'}>Final output</span>
          </div>
        </div>
      </div>
    </div>
  );
}
