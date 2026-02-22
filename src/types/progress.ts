// Progress tracking types for the hybrid engagement system
// Stored in training_progress.session_X_progress JSONB columns

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
}

export interface SkillSignal {
  skill: string;
  level: 'emerging' | 'developing' | 'proficient';
  source: string; // module ID
  timestamp: string;
}

export interface SessionProgressData {
  completedModules: string[];
  moduleEngagement?: Record<string, ModuleEngagement>;
  skillSignals?: SkillSignal[];
}

export type ModuleState = 'not_started' | 'content_viewed' | 'practicing' | 'submitted' | 'completed';

export const DEFAULT_ENGAGEMENT: ModuleEngagement = {
  contentViewed: false,
  chatStarted: false,
  practiceMessageCount: 0,
  submitted: false,
  completed: false,
};
