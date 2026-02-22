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
    id: 'commercial_lending',
    name: 'Commercial Lending',
    description: 'Commercial real estate, C&I lending, and business loan origination',
    icon: 'Landmark',
    topics: [
      {
        id: 'cl-credit-memo',
        title: 'AI-Drafted Commercial Credit Memos',
        description: 'Use AI to draft first-pass commercial credit memos from financial spreads, tax returns, and borrower narratives',
      },
      {
        id: 'cl-portfolio-review',
        title: 'AI-Powered Portfolio Monitoring',
        description: 'Leverage AI to monitor commercial loan portfolios for covenant compliance, maturity tracking, and risk migration',
      },
      {
        id: 'cl-relationship-summaries',
        title: 'Relationship Summary Generation',
        description: 'Generate comprehensive borrower relationship summaries for loan committee presentations using AI',
      },
    ],
  },
  {
    id: 'retail_banking',
    name: 'Retail Banking',
    description: 'Branch operations, consumer deposits, and customer service',
    icon: 'Users',
    topics: [
      {
        id: 'rb-customer-comms',
        title: 'AI-Enhanced Customer Communications',
        description: 'Use AI to draft personalized customer correspondence, product recommendations, and follow-up messaging',
      },
      {
        id: 'rb-product-matching',
        title: 'AI-Powered Product Matching',
        description: 'Leverage AI to identify cross-sell and upsell opportunities based on customer profiles and transaction patterns',
      },
      {
        id: 'rb-complaint-resolution',
        title: 'AI-Assisted Complaint Resolution',
        description: 'Use AI to categorize, research, and draft responses for customer complaints and service issues',
      },
    ],
  },
  {
    id: 'mortgage_consumer_lending',
    name: 'Mortgage & Consumer Lending',
    description: 'Residential mortgage origination, consumer loans, and home equity',
    icon: 'Home',
    topics: [
      {
        id: 'mcl-application-review',
        title: 'AI-Assisted Loan Application Review',
        description: 'Use AI to analyze mortgage and consumer loan applications for completeness, inconsistencies, and risk factors',
      },
      {
        id: 'mcl-disclosure-drafting',
        title: 'AI-Powered Disclosure Preparation',
        description: 'Leverage AI to prepare and verify loan disclosures, ensuring TRID and regulatory compliance',
      },
      {
        id: 'mcl-underwriting-support',
        title: 'AI Underwriting Decision Support',
        description: 'Use AI to analyze borrower financials and property data to support underwriting decisions',
      },
    ],
  },
  {
    id: 'credit_administration',
    name: 'Credit Administration',
    description: 'Loan processing, credit analysis, underwriting, and portfolio management',
    icon: 'FileCheck',
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
    id: 'treasury_cash_management',
    name: 'Treasury & Cash Management',
    description: 'Asset-liability management, liquidity, investments, and cash management services',
    icon: 'Vault',
    topics: [
      {
        id: 'tcm-alm-analysis',
        title: 'AI-Assisted ALM Analysis',
        description: 'Use AI to analyze asset-liability positions, interest rate sensitivity, and liquidity forecasts',
      },
      {
        id: 'tcm-investment-research',
        title: 'AI-Powered Investment Research',
        description: 'Leverage AI to research and summarize investment opportunities for the bank\'s securities portfolio',
      },
      {
        id: 'tcm-cash-flow-forecasting',
        title: 'Cash Flow Forecasting with AI',
        description: 'Use AI to build and refine daily and weekly cash flow forecasting models',
      },
    ],
  },
  {
    id: 'operations',
    name: 'Operations',
    description: 'Deposit operations, payment processing, wire transfers, and back-office support',
    icon: 'Settings',
    topics: [
      {
        id: 'ops-process-documentation',
        title: 'AI-Generated Process Documentation',
        description: 'Use AI to create, update, and standardize operational procedures and workflow documentation',
      },
      {
        id: 'ops-exception-handling',
        title: 'AI-Assisted Exception Processing',
        description: 'Leverage AI to triage, categorize, and suggest resolutions for operational exceptions and errors',
      },
      {
        id: 'ops-efficiency-analysis',
        title: 'Operational Efficiency Analysis with AI',
        description: 'Use AI to analyze workflow bottlenecks, processing times, and identify automation opportunities',
      },
    ],
  },
  {
    id: 'compliance_bsa_aml',
    name: 'Compliance & BSA/AML',
    description: 'Regulatory compliance, Bank Secrecy Act, anti-money laundering, and fair lending',
    icon: 'ShieldCheck',
    topics: [
      {
        id: 'comp-sar-drafting',
        title: 'AI-Assisted SAR Narrative Drafting',
        description: 'Use AI to draft Suspicious Activity Report narratives from transaction data and investigation notes',
      },
      {
        id: 'comp-reg-change-analysis',
        title: 'Regulatory Change Impact Analysis',
        description: 'Leverage AI to analyze new regulations and assess their impact on bank policies and procedures',
      },
      {
        id: 'comp-monitoring-review',
        title: 'AI-Enhanced Compliance Monitoring',
        description: 'Use AI to review compliance monitoring results and identify patterns requiring attention',
      },
    ],
  },
  {
    id: 'risk_management',
    name: 'Risk Management',
    description: 'Enterprise risk, credit risk review, interest rate risk, and audit',
    icon: 'AlertTriangle',
    topics: [
      {
        id: 'risk-assessment-drafting',
        title: 'AI-Drafted Risk Assessments',
        description: 'Use AI to draft enterprise risk assessments, control evaluations, and risk appetite statements',
      },
      {
        id: 'risk-audit-prep',
        title: 'AI-Assisted Audit Preparation',
        description: 'Leverage AI to organize documentation, prepare audit workpapers, and identify control gaps',
      },
      {
        id: 'risk-concentration-analysis',
        title: 'Concentration Risk Analysis with AI',
        description: 'Use AI to analyze portfolio concentrations across industries, geographies, and borrower types',
      },
    ],
  },
  {
    id: 'it_information_security',
    name: 'IT & Information Security',
    description: 'Technology infrastructure, cybersecurity, vendor management, and digital banking',
    icon: 'Shield',
    topics: [
      {
        id: 'it-incident-response',
        title: 'AI-Assisted Incident Response',
        description: 'Use AI to triage security alerts, draft incident reports, and recommend response actions',
      },
      {
        id: 'it-vendor-assessment',
        title: 'AI-Powered Vendor Risk Assessment',
        description: 'Leverage AI to analyze vendor SOC reports, security questionnaires, and risk ratings',
      },
      {
        id: 'it-policy-drafting',
        title: 'IT Policy Documentation with AI',
        description: 'Use AI to draft and update IT policies, security standards, and acceptable use guidelines',
      },
    ],
  },
  {
    id: 'human_resources',
    name: 'Human Resources',
    description: 'Talent acquisition, training & development, benefits, and employee relations',
    icon: 'UserPlus',
    topics: [
      {
        id: 'hr-job-descriptions',
        title: 'AI-Generated Job Descriptions',
        description: 'Use AI to create and update job descriptions, competency frameworks, and role requirements',
      },
      {
        id: 'hr-training-content',
        title: 'AI-Assisted Training Content Development',
        description: 'Leverage AI to develop training materials, onboarding guides, and learning assessments',
      },
      {
        id: 'hr-policy-communication',
        title: 'AI-Drafted HR Communications',
        description: 'Use AI to draft employee communications, policy updates, and benefits enrollment guides',
      },
    ],
  },
  {
    id: 'marketing_business_development',
    name: 'Marketing & Business Development',
    description: 'Brand management, digital marketing, community relations, and business growth',
    icon: 'Megaphone',
    topics: [
      {
        id: 'mkt-content-creation',
        title: 'AI-Powered Marketing Content',
        description: 'Use AI to create social media posts, blog articles, email campaigns, and marketing copy',
      },
      {
        id: 'mkt-market-research',
        title: 'AI-Assisted Market Research',
        description: 'Leverage AI to analyze market trends, competitive intelligence, and customer demographics',
      },
      {
        id: 'mkt-cra-reporting',
        title: 'CRA Reporting and Analysis with AI',
        description: 'Use AI to compile Community Reinvestment Act data, analyze lending patterns, and draft CRA reports',
      },
    ],
  },
  {
    id: 'accounting_finance',
    name: 'Accounting & Finance',
    description: 'Financial reporting, general ledger, reconciliation, budgeting, and regulatory filings',
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
    id: 'wealth_management_trust',
    name: 'Wealth Management & Trust',
    description: 'Trust administration, investment management, financial planning, and fiduciary services',
    icon: 'TrendingUp',
    topics: [
      {
        id: 'wmt-client-reports',
        title: 'AI-Generated Client Portfolio Reports',
        description: 'Use AI to create personalized portfolio performance summaries and investment outlook reports',
      },
      {
        id: 'wmt-trust-reviews',
        title: 'AI-Assisted Trust Account Reviews',
        description: 'Leverage AI to review trust documents, flag distribution requirements, and prepare fiduciary reports',
      },
      {
        id: 'wmt-financial-planning',
        title: 'Financial Planning Summaries with AI',
        description: 'Use AI to draft financial planning recommendations and retirement projection summaries',
      },
    ],
  },
  {
    id: 'executive_leadership',
    name: 'Executive & Leadership',
    description: 'Strategic planning, board governance, organizational management, and bank-wide oversight',
    icon: 'Crown',
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
