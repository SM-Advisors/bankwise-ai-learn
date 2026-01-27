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
        title: 'AI-Assisted First-Draft Credit Memo from Unstructured Inputs',
        description: 'Use AI to draft comprehensive credit memos from financial statements, tax returns, and borrower documents. Learn to ingest unstructured data, extract key financials, and generate narrative analysis with human review.',
      },
      {
        id: 'credit-docs',
        title: 'Reviewing Borrower Documents with AI',
        description: 'Use AI to efficiently analyze and summarize borrower documentation including financial statements, tax returns, and supporting materials',
      },
      {
        id: 'credit-risk',
        title: 'Identifying Risk Flags with AI Prompts',
        description: 'Develop AI prompts to systematically identify credit risk indicators, customer concentration, and compliance concerns',
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
        description: 'Leverage AI to enhance executive decision-making with data synthesis and scenario modeling',
      },
      {
        id: 'exec-scenario',
        title: 'Scenario Analysis with AI',
        description: 'Use AI to model and evaluate strategic scenarios, market conditions, and business outcomes',
      },
      {
        id: 'exec-summaries',
        title: 'AI-Powered Strategic Summaries',
        description: 'Generate executive-level strategic summaries and board-ready briefings using AI',
      },
    ],
  },
];