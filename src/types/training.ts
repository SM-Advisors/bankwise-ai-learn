import { type ModuleContent } from '@/data/trainingContent';

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  suggestedPrompts?: string[];
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
