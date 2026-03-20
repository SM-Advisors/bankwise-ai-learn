// ============================================================================
// Industry Configuration System
// ============================================================================
// Defines predefined industries with their display labels, onboarding content,
// and Andrea persona context. Used to drive dynamic onboarding flows and
// AI coaching personas across enterprise and consumer org types.
// ============================================================================

export type AudienceType = 'enterprise' | 'consumer';

export interface IndustryRole {
  /** Stored in user_profiles.job_role */
  value: string;
  /** Display label in role selection */
  label: string;
  /** Best-fit department slug for content personalization */
  departmentSlug?: string;
}

export interface IndustryDepartment {
  /** Stored in user_profiles.department */
  slug: string;
  /** Display name */
  name: string;
  /** Short description */
  description: string;
  /** Lucide icon name */
  icon?: string;
}

export interface IndustryConfig {
  /** Unique slug stored in organizations.industry */
  slug: string;
  /** Human-readable industry name */
  name: string;
  /** Whether this is an enterprise (B2B) or consumer (B2C) org type */
  audienceType: AudienceType;
  /** Short description shown in org setup */
  description: string;
  /** Label for the "job role" field on user profiles */
  jobRoleLabel: string;
  /** Label for the "department" field on user profiles */
  departmentLabel: string;
  /** Label for the employer/organization name field on user profiles */
  employerLabel: string;
  /** Andrea's industry-specific persona anchor injected into the system prompt */
  andreaIndustrySavvy: string;
  /**
   * The micro-demonstration task shown in enterprise onboarding Step 5.
   * Write a realistic, domain-specific prompt task.
   */
  onboardingMicroTask: string;
  /**
   * Welcome message for consumer org onboarding Step 1.
   * Only used when audienceType === 'consumer'.
   */
  welcomeMessage?: string;

  // ── Expanded fields for industry switching ──────────────────────────────

  /** Industry-specific role options for onboarding and profile */
  roles: IndustryRole[];
  /** Industry-specific department definitions */
  departments: IndustryDepartment[];
  /** Industry-specific placeholder examples for form fields */
  placeholders: {
    roleContext: string;
    customInstructions: string;
    communityTopic: string;
    ideaTitle: string;
    workflowName: string;
    workflowTrigger: string;
    workflowOutput: string;
    brainstormTask: string;
    practicalOutputs: string;
    memoryExample: string;
  };
  /** Regulatory bodies, key frameworks, prohibited data types */
  complianceContext: string;
  /** Rich paragraph giving AI enough context to generate realistic scenarios */
  scenarioGenerationContext: string;
  /** UI copy overrides keyed by component location */
  uiCopyOverrides: {
    policiesLabel: string;
    certificateDescription: string;
    communityPlaceholder: string;
    policyTypeName: string;
  };
}

// ── Enterprise industries ────────────────────────────────────────────────────

const banking: IndustryConfig = {
  slug: 'banking',
  name: 'Community Banking',
  audienceType: 'enterprise',
  description: 'Community banking professionals learning AI for banking workflows',
  jobRoleLabel: 'Role at the Bank',
  departmentLabel: 'Department',
  employerLabel: 'Bank Name',
  andreaIndustrySavvy:
    "You speak banking naturally. You reference credit committees, BSA/AML reviews, loan documentation, board reports, and regulatory examinations like someone who's been in the industry. Use real banking vocabulary — don't genericize. Say \"underwriting memo\" not \"professional document.\"",
  onboardingMicroTask:
    'Write the actual prompt you would type into an AI tool to draft a follow-up email to a small business customer after a meeting about a commercial line of credit.',
  placeholders: {
    roleContext: "e.g., I'm a credit analyst who reviews commercial loan applications.",
    customInstructions: 'e.g., Always relate examples to banking. Use analogies when explaining complex concepts.',
    communityTopic: 'e.g., Best practices for AI-assisted loan review',
    ideaTitle: 'e.g., Automate loan document review',
    workflowName: 'e.g., Annual Loan Review Workflow',
    workflowTrigger: 'e.g., Annual review date approaching for a commercial loan > $500K',
    workflowOutput: 'e.g., Complete annual loan review memo ready for credit committee presentation',
    brainstormTask: 'e.g. I review loan applications and summarize them for the credit committee each week...',
    practicalOutputs: 'Create real work artifacts—credit memos, analyses, and reports you can use immediately.',
    memoryExample: 'e.g., I prefer examples using commercial lending scenarios.',
  },
  roles: [
    { value: 'front_line', label: 'Front-line / Retail Banking', departmentSlug: 'retail_banking' },
    { value: 'loan_officer', label: 'Loan Officer / Credit Analyst / Mortgage', departmentSlug: 'commercial_lending' },
    { value: 'compliance', label: 'Compliance / BSA / Risk', departmentSlug: 'compliance_bsa_aml' },
    { value: 'operations', label: 'Operations / Back Office', departmentSlug: 'operations' },
    { value: 'it', label: 'IT / Technology', departmentSlug: 'it_information_security' },
    { value: 'executive', label: 'Executive / C-Suite / Senior Leadership', departmentSlug: 'executive_leadership' },
    { value: 'finance', label: 'Finance / Accounting / Internal Audit', departmentSlug: 'accounting_finance' },
    { value: 'hr', label: 'Human Resources / Training', departmentSlug: 'human_resources' },
    { value: 'other', label: 'Other' },
  ],
  departments: [
    { slug: 'commercial_lending', name: 'Commercial Lending', description: 'Commercial real estate, C&I lending, and business loan origination', icon: 'Landmark' },
    { slug: 'retail_banking', name: 'Retail Banking', description: 'Branch operations, consumer deposits, and customer service', icon: 'Users' },
    { slug: 'mortgage_consumer_lending', name: 'Mortgage & Consumer Lending', description: 'Residential mortgage origination, consumer loans, and home equity', icon: 'Home' },
    { slug: 'credit_administration', name: 'Credit Administration', description: 'Loan processing, credit analysis, underwriting, and portfolio management', icon: 'FileCheck' },
    { slug: 'treasury_cash_management', name: 'Treasury & Cash Management', description: 'Asset-liability management, liquidity, investments, and cash management services', icon: 'Vault' },
    { slug: 'operations', name: 'Operations', description: 'Deposit operations, payment processing, wire transfers, and back-office support', icon: 'Settings' },
    { slug: 'compliance_bsa_aml', name: 'Compliance & BSA/AML', description: 'Regulatory compliance, Bank Secrecy Act, anti-money laundering, and fair lending', icon: 'ShieldCheck' },
    { slug: 'risk_management', name: 'Risk Management', description: 'Enterprise risk, credit risk review, interest rate risk, and audit', icon: 'AlertTriangle' },
    { slug: 'it_information_security', name: 'IT & Information Security', description: 'Technology infrastructure, cybersecurity, vendor management, and digital banking', icon: 'Shield' },
    { slug: 'human_resources', name: 'Human Resources', description: 'Talent acquisition, training & development, benefits, and employee relations', icon: 'UserPlus' },
    { slug: 'marketing_business_development', name: 'Marketing & Business Development', description: 'Brand management, digital marketing, community relations, and business growth', icon: 'Megaphone' },
    { slug: 'accounting_finance', name: 'Accounting & Finance', description: 'Financial reporting, general ledger, reconciliation, budgeting, and regulatory filings', icon: 'Calculator' },
    { slug: 'wealth_management_trust', name: 'Wealth Management & Trust', description: 'Trust administration, investment management, financial planning, and fiduciary services', icon: 'TrendingUp' },
    { slug: 'executive_leadership', name: 'Executive & Leadership', description: 'Strategic planning, board governance, organizational management, and bank-wide oversight', icon: 'Crown' },
  ],
  complianceContext: 'Regulatory bodies: OCC, FDIC, Federal Reserve, CFPB, FinCEN, state banking regulators. Key frameworks: BSA/AML, CRA, TRID, ECOA, HMDA, UDAAP, Reg B, Reg Z, Reg E. Prohibited data: customer PII, account numbers, SSNs, loan application data must never be shared with AI tools without proper authorization and data handling procedures.',
  scenarioGenerationContext: 'Community banking professionals handle a range of tasks including commercial and consumer lending, deposit operations, compliance monitoring, and customer service. Typical AI use cases include drafting credit memos, preparing board reports, writing SAR narratives, analyzing financial spreads, creating customer communications, and summarizing regulatory guidance. The bank serves small-to-medium businesses and retail consumers in their local community. Scenarios should reflect realistic day-to-day banking work — not theoretical exercises.',
  uiCopyOverrides: {
    policiesLabel: 'Bank Policies',
    certificateDescription: 'role-specific AI applications for banking professionals',
    communityPlaceholder: 'Start a discussion with your fellow banking professionals.',
    policyTypeName: 'Bank Policy',
  },
};

const healthcare: IndustryConfig = {
  slug: 'healthcare',
  name: 'Healthcare',
  audienceType: 'enterprise',
  description: 'Healthcare professionals learning AI for clinical and administrative workflows',
  jobRoleLabel: 'Role',
  departmentLabel: 'Department',
  employerLabel: 'Organization Name',
  andreaIndustrySavvy:
    'You speak healthcare naturally. You reference revenue cycle operations, claims management, patient access, coding and HIM, compliance, supply chain, and clinical operations like someone embedded in a health system. Use real healthcare vocabulary — say "denial management workflow" not "appeal process," say "charge capture" not "billing entry."',
  onboardingMicroTask:
    'Write the actual prompt you would type into an AI tool to draft a summary of denial trends for a monthly revenue cycle performance review.',
  placeholders: {
    roleContext: "e.g., I'm a revenue cycle analyst who reviews claim denials and prepares appeal letters.",
    customInstructions: 'e.g., Always relate examples to healthcare operations. Reference realistic clinical workflows.',
    communityTopic: 'e.g., Best practices for AI-assisted denial management',
    ideaTitle: 'e.g., Automate claim denial trend analysis',
    workflowName: 'e.g., Monthly Denial Trend Review Workflow',
    workflowTrigger: 'e.g., Month-end close triggers review of all denied claims > $10K',
    workflowOutput: 'e.g., Complete denial trend summary ready for revenue cycle leadership review',
    brainstormTask: 'e.g. I compile denial trends and draft appeal letters for our revenue cycle team each month...',
    practicalOutputs: 'Create real work artifacts—denial analyses, appeal letters, and performance reports you can use immediately.',
    memoryExample: 'e.g., I prefer examples using revenue cycle and claims management scenarios.',
  },
  roles: [
    { value: 'revenue_cycle_ops', label: 'Revenue Cycle Operations', departmentSlug: 'revenue_cycle_operations' },
    { value: 'patient_access', label: 'Patient Access / Registration', departmentSlug: 'patient_access_services' },
    { value: 'him_coding', label: 'HIM / Coding', departmentSlug: 'health_information_management' },
    { value: 'claims_denials', label: 'Claims / Denials Management', departmentSlug: 'claims_denials_management' },
    { value: 'patient_financial_services', label: 'Patient Financial Services', departmentSlug: 'patient_financial_services' },
    { value: 'finance_accounting', label: 'Finance / Accounting', departmentSlug: 'finance_accounting' },
    { value: 'supply_chain', label: 'Supply Chain', departmentSlug: 'supply_chain_management' },
    { value: 'clinical_ops', label: 'Clinical Operations', departmentSlug: 'clinical_operations' },
    { value: 'it_technology', label: 'IT / Technology', departmentSlug: 'information_technology' },
    { value: 'compliance_audit', label: 'Compliance / Audit', departmentSlug: 'compliance_audit' },
    { value: 'hr_workforce', label: 'Human Resources / Workforce Development', departmentSlug: 'human_resources' },
    { value: 'quality_performance', label: 'Quality / Performance Improvement', departmentSlug: 'quality_performance_improvement' },
    { value: 'other', label: 'Other' },
  ],
  departments: [
    { slug: 'revenue_cycle_operations', name: 'Revenue Cycle Operations', description: 'End-to-end revenue cycle management, billing operations, and financial performance', icon: 'Receipt' },
    { slug: 'patient_access_services', name: 'Patient Access Services', description: 'Patient registration, scheduling, insurance verification, and financial clearance', icon: 'UserCheck' },
    { slug: 'health_information_management', name: 'Health Information Management', description: 'Medical coding, clinical documentation improvement, HIM operations, and data integrity', icon: 'FileText' },
    { slug: 'claims_denials_management', name: 'Claims & Denials Management', description: 'Claims submission, denial prevention, appeals, and payer relations', icon: 'ShieldCheck' },
    { slug: 'patient_financial_services', name: 'Patient Financial Services', description: 'Patient billing, collections, financial counseling, and payment plans', icon: 'Wallet' },
    { slug: 'finance_accounting', name: 'Finance & Accounting', description: 'Financial reporting, general ledger, budgeting, cost accounting, and reimbursement analysis', icon: 'Calculator' },
    { slug: 'supply_chain_management', name: 'Supply Chain Management', description: 'Procurement, inventory management, vendor relations, and logistics', icon: 'Package' },
    { slug: 'clinical_operations', name: 'Clinical Operations', description: 'Patient care delivery, clinical workflows, care coordination, and operational efficiency', icon: 'Stethoscope' },
    { slug: 'information_technology', name: 'Information Technology', description: 'EHR systems, health data analytics, infrastructure, cybersecurity, and digital health', icon: 'Monitor' },
    { slug: 'compliance_audit', name: 'Compliance & Audit', description: 'HIPAA compliance, regulatory audits, internal controls, and risk assessments', icon: 'Lock' },
    { slug: 'human_resources', name: 'Human Resources', description: 'Recruitment, retention, training, workforce planning, and employee engagement', icon: 'UserPlus' },
    { slug: 'quality_performance_improvement', name: 'Quality & Performance Improvement', description: 'Quality metrics, process improvement, accreditation, and performance analytics', icon: 'TrendingUp' },
  ],
  complianceContext: 'Regulatory bodies: HHS/OCR, CMS, Joint Commission, state health departments, state licensing boards. Key frameworks: HIPAA, HITECH, 42 CFR Part 2, Stark Law, Anti-Kickback Statute, EMTALA, Medicare Conditions of Participation. Prohibited data: PHI (Protected Health Information), patient identifiers, medical record numbers, treatment details, and diagnostic information must never be shared with AI tools without proper BAA (Business Associate Agreement) and de-identification procedures.',
  scenarioGenerationContext: 'Parallon and HCA Healthcare professionals manage revenue cycle operations, patient access, coding, claims, finance, supply chain, compliance, and clinical operations across one of the largest health systems in the country. Typical AI use cases include analyzing denial trends, drafting appeal letters, summarizing coding audit results, creating financial performance reports, optimizing patient access workflows, preparing compliance documentation, streamlining supply chain processes, and generating training materials. Scenarios should reflect realistic day-to-day healthcare operations work — not theoretical exercises.',
  uiCopyOverrides: {
    policiesLabel: 'Organization Policies',
    certificateDescription: 'role-specific AI applications for healthcare professionals',
    communityPlaceholder: 'Start a discussion with your fellow healthcare professionals.',
    policyTypeName: 'Organization Policy',
  },
};

const insurance: IndustryConfig = {
  slug: 'insurance',
  name: 'Insurance',
  audienceType: 'enterprise',
  description: 'Insurance professionals learning AI for underwriting and claims workflows',
  jobRoleLabel: 'Role',
  departmentLabel: 'Department',
  employerLabel: 'Company Name',
  andreaIndustrySavvy:
    'You speak insurance naturally. You reference underwriting guidelines, claims processing, policy administration, actuarial analysis, loss ratios, and compliance requirements. Use real insurance vocabulary — say "claims adjuster review" not "document review."',
  onboardingMicroTask:
    'Write the actual prompt you would type into an AI tool to summarize a complex commercial property insurance claim for a claims adjuster preparing for a coverage review.',
  placeholders: {
    roleContext: "e.g., I'm an underwriter who evaluates commercial property risk submissions.",
    customInstructions: 'e.g., Always relate examples to insurance workflows. Reference realistic underwriting scenarios.',
    communityTopic: 'e.g., Best practices for AI-assisted claims summarization',
    ideaTitle: 'e.g., Automate underwriting risk assessment summaries',
    workflowName: 'e.g., Commercial Claims Review Workflow',
    workflowTrigger: 'e.g., New commercial property claim filed exceeding $50K reserve threshold',
    workflowOutput: 'e.g., Complete coverage analysis memo ready for claims adjuster review',
    brainstormTask: 'e.g. I review claims files and prepare coverage analysis summaries for adjusters each week...',
    practicalOutputs: 'Create real work artifacts—coverage analyses, claims summaries, and underwriting memos you can use immediately.',
    memoryExample: 'e.g., I prefer examples using claims and underwriting scenarios.',
  },
  roles: [
    { value: 'underwriter', label: 'Underwriter', departmentSlug: 'underwriting' },
    { value: 'claims_adjuster', label: 'Claims Adjuster / Examiner', departmentSlug: 'claims' },
    { value: 'actuary', label: 'Actuary / Pricing Analyst', departmentSlug: 'actuarial' },
    { value: 'agent_broker', label: 'Agent / Broker', departmentSlug: 'distribution' },
    { value: 'compliance', label: 'Compliance / Regulatory', departmentSlug: 'compliance' },
    { value: 'operations', label: 'Operations / Policy Admin', departmentSlug: 'operations' },
    { value: 'other', label: 'Other' },
  ],
  departments: [
    { slug: 'underwriting', name: 'Underwriting', description: 'Risk assessment, policy issuance, and underwriting guidelines' },
    { slug: 'claims', name: 'Claims', description: 'Claims intake, investigation, adjustment, and settlement' },
    { slug: 'actuarial', name: 'Actuarial & Pricing', description: 'Loss modeling, rate development, and reserving' },
    { slug: 'distribution', name: 'Distribution & Sales', description: 'Agent management, producer relations, and sales support' },
    { slug: 'compliance', name: 'Compliance & Regulatory', description: 'State filings, market conduct, and regulatory compliance' },
    { slug: 'operations', name: 'Operations & Policy Admin', description: 'Policy servicing, endorsements, and billing' },
  ],
  complianceContext: 'Regulatory bodies: State Departments of Insurance, NAIC, federal oversight (FIO). Key frameworks: state insurance codes, market conduct regulations, unfair claims practices acts, data privacy laws (state-specific). Prohibited data: policyholder PII, claims details, medical records in claims files, financial underwriting data.',
  scenarioGenerationContext: 'Insurance professionals handle underwriting risk assessments, claims investigations, policy administration, actuarial analysis, and regulatory compliance. Typical AI use cases include summarizing claims files, drafting coverage analyses, generating underwriting memos, analyzing loss ratios, preparing regulatory filings, and creating policyholder communications.',
  uiCopyOverrides: {
    policiesLabel: 'Company Policies',
    certificateDescription: 'role-specific AI applications for insurance professionals',
    communityPlaceholder: 'Start a discussion with your fellow insurance professionals.',
    policyTypeName: 'Company Policy',
  },
};

const retail: IndustryConfig = {
  slug: 'retail',
  name: 'Retail',
  audienceType: 'enterprise',
  description: 'Retail professionals learning AI for merchandising and customer experience',
  jobRoleLabel: 'Role',
  departmentLabel: 'Department',
  employerLabel: 'Company Name',
  andreaIndustrySavvy:
    'You speak retail naturally. You reference merchandising, inventory management, customer experience, supply chain, planograms, and store operations. Use real retail vocabulary — say "seasonal collection launch" not "product introduction period."',
  onboardingMicroTask:
    'Write the actual prompt you would type into an AI tool to create a product description for a new seasonal collection item targeting your core customer demographic.',
  placeholders: {
    roleContext: "e.g., I'm a merchandiser who manages seasonal product assortments and promotions.",
    customInstructions: 'e.g., Always relate examples to retail operations. Reference realistic merchandising workflows.',
    communityTopic: 'e.g., Best practices for AI-generated product descriptions',
    ideaTitle: 'e.g., Automate seasonal promotion copy creation',
    workflowName: 'e.g., Seasonal Collection Launch Workflow',
    workflowTrigger: 'e.g., New season buy plan finalized with 50+ new SKUs needing descriptions',
    workflowOutput: 'e.g., Complete product descriptions and promotional copy ready for e-commerce upload',
    brainstormTask: 'e.g. I create product descriptions and seasonal promotions for our online catalog each week...',
    practicalOutputs: 'Create real work artifacts—product descriptions, promotional plans, and sales analyses you can use immediately.',
    memoryExample: 'e.g., I prefer examples using merchandising and store operations scenarios.',
  },
  roles: [
    { value: 'store_manager', label: 'Store Manager / District Manager', departmentSlug: 'store_operations' },
    { value: 'merchandiser', label: 'Merchandiser / Buyer', departmentSlug: 'merchandising' },
    { value: 'marketing', label: 'Marketing / Digital', departmentSlug: 'marketing' },
    { value: 'supply_chain', label: 'Supply Chain / Logistics', departmentSlug: 'supply_chain' },
    { value: 'customer_experience', label: 'Customer Experience', departmentSlug: 'customer_experience' },
    { value: 'other', label: 'Other' },
  ],
  departments: [
    { slug: 'store_operations', name: 'Store Operations', description: 'Store management, staffing, visual merchandising, and daily operations' },
    { slug: 'merchandising', name: 'Merchandising & Buying', description: 'Product selection, pricing, promotions, and assortment planning' },
    { slug: 'marketing', name: 'Marketing & Digital', description: 'Brand marketing, e-commerce, social media, and customer engagement' },
    { slug: 'supply_chain', name: 'Supply Chain & Logistics', description: 'Inventory management, distribution, vendor relations, and fulfillment' },
    { slug: 'customer_experience', name: 'Customer Experience', description: 'Customer service, loyalty programs, and experience design' },
  ],
  complianceContext: 'Key frameworks: PCI-DSS (payment security), consumer protection laws, FTC regulations, state consumer privacy laws. Prohibited data: customer payment information, PII, purchase history linked to individuals.',
  scenarioGenerationContext: 'Retail professionals manage store operations, merchandising, marketing, supply chain, and customer experience. Typical AI use cases include writing product descriptions, analyzing sales trends, creating marketing content, optimizing inventory, drafting staff communications, and improving customer service responses.',
  uiCopyOverrides: {
    policiesLabel: 'Company Policies',
    certificateDescription: 'role-specific AI applications for retail professionals',
    communityPlaceholder: 'Start a discussion with your fellow retail professionals.',
    policyTypeName: 'Company Policy',
  },
};

const manufacturing: IndustryConfig = {
  slug: 'manufacturing',
  name: 'Manufacturing',
  audienceType: 'enterprise',
  description: 'Manufacturing professionals learning AI for operations and quality workflows',
  jobRoleLabel: 'Role',
  departmentLabel: 'Department',
  employerLabel: 'Company Name',
  andreaIndustrySavvy:
    'You speak manufacturing naturally. You reference production planning, quality control (SPC, FMEA), supply chain, preventive maintenance, safety compliance, and continuous improvement (Lean/Six Sigma). Use real manufacturing vocabulary — say "root cause analysis" not "problem investigation."',
  onboardingMicroTask:
    'Write the actual prompt you would type into an AI tool to draft a root cause analysis report for a recurring defect found during final inspection on the production line.',
  placeholders: {
    roleContext: "e.g., I'm a quality engineer who manages CAPA processes and production inspections.",
    customInstructions: 'e.g., Always relate examples to manufacturing operations. Reference realistic quality and production workflows.',
    communityTopic: 'e.g., Best practices for AI-assisted root cause analysis',
    ideaTitle: 'e.g., Automate defect trend reporting from inspection data',
    workflowName: 'e.g., Non-Conformance Investigation Workflow',
    workflowTrigger: 'e.g., Final inspection defect rate exceeds 2% threshold for a production line',
    workflowOutput: 'e.g., Complete root cause analysis report ready for corrective action review',
    brainstormTask: 'e.g. I document root cause analyses for defects found during final inspection each shift...',
    practicalOutputs: 'Create real work artifacts—root cause analyses, SOPs, and quality reports you can use immediately.',
    memoryExample: 'e.g., I prefer examples using production and quality management scenarios.',
  },
  roles: [
    { value: 'plant_manager', label: 'Plant Manager / Operations Director', departmentSlug: 'production' },
    { value: 'quality', label: 'Quality Manager / Engineer', departmentSlug: 'quality' },
    { value: 'supply_chain', label: 'Supply Chain / Procurement', departmentSlug: 'supply_chain' },
    { value: 'maintenance', label: 'Maintenance / Reliability', departmentSlug: 'maintenance' },
    { value: 'safety', label: 'Safety / EHS', departmentSlug: 'safety' },
    { value: 'engineering', label: 'Engineering', departmentSlug: 'engineering' },
    { value: 'other', label: 'Other' },
  ],
  departments: [
    { slug: 'production', name: 'Production & Operations', description: 'Production planning, scheduling, shop floor management, and throughput optimization' },
    { slug: 'quality', name: 'Quality', description: 'Quality control, SPC, FMEA, CAPA, and continuous improvement' },
    { slug: 'supply_chain', name: 'Supply Chain & Procurement', description: 'Vendor management, material planning, logistics, and inventory control' },
    { slug: 'maintenance', name: 'Maintenance & Reliability', description: 'Preventive maintenance, equipment reliability, and downtime reduction' },
    { slug: 'safety', name: 'Safety & EHS', description: 'Workplace safety, environmental compliance, and health programs' },
    { slug: 'engineering', name: 'Engineering', description: 'Process engineering, tooling, automation, and new product introduction' },
  ],
  complianceContext: 'Regulatory bodies: OSHA, EPA, FDA (if applicable), ISO certification bodies. Key frameworks: ISO 9001, ISO 14001, OSHA standards, GMP (if applicable). Prohibited data: proprietary process specifications, trade secrets, customer-specific pricing.',
  scenarioGenerationContext: 'Manufacturing professionals manage production operations, quality systems, supply chain logistics, maintenance programs, and safety compliance. Typical AI use cases include drafting root cause analyses, creating standard operating procedures, analyzing production data, writing safety incident reports, preparing audit responses, and optimizing maintenance schedules.',
  uiCopyOverrides: {
    policiesLabel: 'Company Policies',
    certificateDescription: 'role-specific AI applications for manufacturing professionals',
    communityPlaceholder: 'Start a discussion with your fellow manufacturing professionals.',
    policyTypeName: 'Company Policy',
  },
};

// ── Consumer industries ──────────────────────────────────────────────────────

const general: IndustryConfig = {
  slug: 'general',
  name: 'General / Personal',
  audienceType: 'consumer',
  description: 'Individuals building practical AI skills for personal and professional growth',
  jobRoleLabel: 'What do you do?',
  departmentLabel: 'Area of Interest',
  employerLabel: 'Organization (optional)',
  andreaIndustrySavvy:
    "You use clear, relatable language that works in any context. You avoid industry jargon and focus on practical AI skills that apply broadly — at work, at home, or in a career transition. Make examples feel personal and immediately useful. Meet the learner where they are.",
  onboardingMicroTask:
    'Write the actual prompt you would type into an AI tool to help you draft a professional email or message for a real situation you face regularly.',
  placeholders: {
    roleContext: "e.g., I'm a project manager who coordinates cross-functional teams and deliverables.",
    customInstructions: 'e.g., Keep examples practical and jargon-free. Use analogies when explaining complex concepts.',
    communityTopic: 'e.g., Best practices for using AI to draft professional emails',
    ideaTitle: 'e.g., Automate weekly status report drafting',
    workflowName: 'e.g., Weekly Status Report Workflow',
    workflowTrigger: 'e.g., Friday afternoon reminder to compile team updates from the week',
    workflowOutput: 'e.g., Complete weekly status report ready to send to stakeholders',
    brainstormTask: 'e.g. I research topics and draft summary reports for my team each week...',
    practicalOutputs: 'Create real work artifacts—reports, emails, and analyses you can use immediately.',
    memoryExample: 'e.g., I prefer examples using everyday workplace scenarios.',
  },
  welcomeMessage:
    "Welcome! You're here to build practical AI skills that work in any area of life or work.",
  roles: [
    { value: 'professional', label: 'Working Professional' },
    { value: 'manager', label: 'Manager / Team Lead' },
    { value: 'freelancer', label: 'Freelancer / Consultant' },
    { value: 'student', label: 'Student' },
    { value: 'career_changer', label: 'Career Changer' },
    { value: 'other', label: 'Other' },
  ],
  departments: [
    { slug: 'writing_communication', name: 'Writing & Communication', description: 'Emails, reports, presentations, and professional communication' },
    { slug: 'research_analysis', name: 'Research & Analysis', description: 'Information gathering, data analysis, and decision support' },
    { slug: 'productivity', name: 'Productivity & Organization', description: 'Task management, planning, workflow optimization, and automation' },
    { slug: 'creative', name: 'Creative & Content', description: 'Content creation, brainstorming, design briefs, and storytelling' },
    { slug: 'learning', name: 'Learning & Development', description: 'Skill building, study aids, career growth, and self-improvement' },
  ],
  complianceContext: 'General best practices: avoid sharing personal identifiers, financial account details, passwords, or confidential employer information with AI tools. Follow your organization\'s acceptable-use policies if applicable.',
  scenarioGenerationContext: 'Individual learners use AI for a wide range of everyday tasks: drafting emails, summarizing articles, brainstorming ideas, planning projects, analyzing data, creating presentations, writing cover letters, studying new topics, and automating repetitive work. Scenarios should feel practical and immediately useful — things a real person would actually want to do with AI today.',
  uiCopyOverrides: {
    policiesLabel: 'Guidelines',
    certificateDescription: 'practical AI skills for everyday work and life',
    communityPlaceholder: 'Start a discussion with fellow learners.',
    policyTypeName: 'Guideline',
  },
};

// ── Config map & helpers ─────────────────────────────────────────────────────

export const INDUSTRY_CONFIGS: Record<string, IndustryConfig> = {
  banking,
  healthcare,
  insurance,
  retail,
  manufacturing,
  general,
};

export const ENTERPRISE_INDUSTRIES: IndustryConfig[] = [
  banking,
  healthcare,
  insurance,
  retail,
  manufacturing,
];

export const CONSUMER_INDUSTRIES: IndustryConfig[] = [
  general,
];

/**
 * Returns the IndustryConfig for a given slug, defaulting to 'banking'
 * for enterprise orgs and 'general' for consumer orgs if slug is missing.
 */
export function getIndustryConfig(
  slug: string | null | undefined,
  audienceType?: AudienceType | null,
): IndustryConfig {
  if (slug && INDUSTRY_CONFIGS[slug]) {
    return INDUSTRY_CONFIGS[slug];
  }
  // Fall back based on audience type
  if (audienceType === 'consumer') return general;
  return banking;
}

/**
 * Returns industries appropriate for a given audience type.
 */
export function getIndustriesForAudienceType(audienceType: AudienceType): IndustryConfig[] {
  return audienceType === 'enterprise' ? ENTERPRISE_INDUSTRIES : CONSUMER_INDUSTRIES;
}
