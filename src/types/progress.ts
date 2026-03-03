// Progress tracking types for the hybrid engagement system
// Stored in training_progress.session_X_progress JSONB columns

export interface GateResult {
  passed: boolean;
  criteriaMetCount: number;
  criteriaTotalCount: number;
  gateMessage: string;
}

export interface ModuleEngagement {
  contentViewed: boolean;
  contentViewedAt?: string;
  chatStarted: boolean;
  chatStartedAt?: string;
  practiceMessageCount: number;
  submitted: boolean;
  submittedAt?: string;
  completed: boolean;
  completedAt?: string;
  lastFeedback?: {
    strengths: string[];
    issues: string[];
    summary: string;
  };
  // Quality gate fields (only set for isGateModule modules)
  gatePassed?: boolean;
  gateAttempts?: number;
  lastGateResult?: GateResult;
}

export interface SkillSignal {
  skill: string;
  level: 'emerging' | 'developing' | 'proficient';
  source: string; // module ID
  timestamp: string;
}

export interface CapstoneData {
  selectedOption: string; // 'A' | 'B' | 'C' | 'D' | 'custom'
  customTask?: string;
  reflectionWorkWell?: string;
  reflectionWentWrong?: string;
  reflectionDoNextTime?: string;
  completedAt?: string;
  certificateGenerated?: boolean;
}

export interface SessionProgressData {
  completedModules: string[];
  moduleEngagement?: Record<string, ModuleEngagement>;
  skillSignals?: SkillSignal[];
  capstoneData?: CapstoneData;
}

export type ModuleState = 'not_started' | 'content_viewed' | 'practicing' | 'submitted' | 'completed';

export const DEFAULT_ENGAGEMENT: ModuleEngagement = {
  contentViewed: false,
  chatStarted: false,
  practiceMessageCount: 0,
  submitted: false,
  completed: false,
};
