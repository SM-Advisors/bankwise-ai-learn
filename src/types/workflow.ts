// Workflow Studio types for Session 3 workflow building

export interface WorkflowStep {
  name: string;
  aiPromptTemplate: string;
  humanReview: boolean;
  outputDescription: string;
}

export interface WorkflowData {
  trigger: string;
  steps: WorkflowStep[];
  finalOutput: string;
}

export interface UserWorkflow {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  status: 'draft' | 'testing' | 'active' | 'archived';
  workflow_data: WorkflowData;
  test_results: Record<string, unknown> | null;
  module_id: string;
  created_at: string;
  updated_at: string;
}

export const EMPTY_WORKFLOW: WorkflowData = {
  trigger: '',
  steps: [
    { name: '', aiPromptTemplate: '', humanReview: true, outputDescription: '' },
    { name: '', aiPromptTemplate: '', humanReview: false, outputDescription: '' },
    { name: '', aiPromptTemplate: '', humanReview: true, outputDescription: '' },
  ],
  finalOutput: '',
};

// Count completed steps in a workflow
export function countCompletedSteps(data: WorkflowData): number {
  return data.steps.filter((s) => s.name.trim() && s.aiPromptTemplate.trim()).length;
}

// Count human review checkpoints
export function countReviewCheckpoints(data: WorkflowData): number {
  return data.steps.filter((s) => s.humanReview && s.name.trim()).length;
}

// Check if a workflow is minimally complete
export function isWorkflowComplete(data: WorkflowData): boolean {
  const hasSteps = countCompletedSteps(data) >= 3;
  const hasCheckpoints = countReviewCheckpoints(data) >= 2;
  const hasTrigger = data.trigger.trim().length > 0;
  const hasFinalOutput = data.finalOutput.trim().length > 0;
  return hasSteps && hasCheckpoints && hasTrigger && hasFinalOutput;
}
