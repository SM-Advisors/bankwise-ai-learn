import { type ModuleContent } from '@/data/trainingContent';

// Re-export progress types for convenience
export type { ModuleEngagement, ModuleState, SessionProgressData, SkillSignal } from './progress';

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  suggestedPrompts?: string[];
  coachingAction?: 'socratic' | 'explain' | 'review' | 'celebrate' | 'redirect';
  hintAvailable?: boolean;
  complianceFlag?: {
    type: string;
    severity: 'info' | 'warning' | 'critical';
    message: string;
  };
  memorySuggestion?: {
    content: string;
    reason: string;
  };
  shareSuggestion?: {
    type: 'idea' | 'friction_point' | 'agent' | 'workflow';
    summary: string;
    destinations: ('community' | 'my_ideas' | 'executive')[];
  };
  promptSaveSuggestion?: {
    promptText: string;
    suggestedTitle: string;
    suggestedCategory: string;
  };
  skillObservation?: {
    skill: string;
    level: 'emerging' | 'developing' | 'proficient' | 'advanced';
    evidence: string;
  };
  levelSuggestion?: {
    currentLevel: string;
    proposedLevel: string;
    rationale: string;
    evidenceSummary: string;
  };
  structuredFeedback?: {
    summary: string;
    strengths: string[];
    issues: string[];
    areasForImprovement?: string[];
    fixes: string[];
    next_steps: string[];
  };
}

export interface BankPolicy {
  id: string;
  title: string;
  content: string;
  summary: string | null;
  policy_type: string;
  icon: string | null;
  display_order: number | null;
  is_active: boolean | null;
}

// Industry-neutral alias — use OrgPolicy for new code; BankPolicy kept for backward compat
export type OrgPolicy = BankPolicy;

export interface TrainingWorkspaceState {
  leftCollapsed: boolean;
  rightCollapsed: boolean;
  selectedModule: ModuleContent | null;
  practiceInput: string;
  trainerMessages: Message[];
  trainerInput: string;
  isTrainerLoading: boolean;
  isPracticeLoading: boolean;
  moduleCompleted: boolean;
  contentModalOpen: boolean;
  contentModalModule: ModuleContent | null;
  videoModalOpen: boolean;
  policyModalOpen: boolean;
  selectedPolicy: BankPolicy | null;
  completedModules: Set<string>;
}
