import { Department } from '@/contexts/TrainingContext';

export interface Topic {
  id: string;
  title: string;
  description: string;
}

export interface DepartmentInfo {
  id: Department;
  name: string;
  description: string;
  icon: string;
  topics: Topic[];
}

export const departments: DepartmentInfo[] = [
  {
    id: 'accounting',
    name: 'Accounting & Finance',
    description: 'Financial reporting, reconciliations, and analysis',
    icon: 'Calculator',
    topics: [
      {
        id: 'acc-reconciliation',
        title: 'AI-Assisted Account Reconciliations',
        description: 'Learn how to use AI to streamline and verify account reconciliation processes',
      },
      {
        id: 'acc-variance',
        title: 'AI-Powered Variance Analysis',
        description: 'Leverage AI to identify, analyze, and explain financial variances',
      },
      {
        id: 'acc-summaries',
        title: 'Drafting Financial Summaries with AI',
        description: 'Use AI to create clear, accurate financial summary reports',
      },
    ],
  },
  {
    id: 'credit',
    name: 'Credit Administration',
    description: 'Lending, credit analysis, and risk assessment',
    icon: 'FileText',
    topics: [
      {
        id: 'credit-memo',
        title: 'AI-Assisted Credit Memo Drafting',
        description: 'Create comprehensive credit memos efficiently using AI assistance',
      },
      {
        id: 'credit-docs',
        title: 'Reviewing Borrower Documents with AI',
        description: 'Use AI to efficiently analyze and summarize borrower documentation',
      },
      {
        id: 'credit-risk',
        title: 'Identifying Risk Flags with AI Prompts',
        description: 'Develop AI prompts to systematically identify credit risk indicators',
      },
    ],
  },
  {
    id: 'executive',
    name: 'Executive & Leadership',
    description: 'Strategic decision-making and organizational leadership',
    icon: 'TrendingUp',
    topics: [
      {
        id: 'exec-decision',
        title: 'AI for Decision Support',
        description: 'Leverage AI to enhance executive decision-making processes',
      },
      {
        id: 'exec-scenario',
        title: 'Scenario Analysis with AI',
        description: 'Use AI to model and evaluate strategic scenarios and outcomes',
      },
      {
        id: 'exec-summaries',
        title: 'AI-Powered Strategic Summaries',
        description: 'Generate executive-level strategic summaries using AI',
      },
    ],
  },
];