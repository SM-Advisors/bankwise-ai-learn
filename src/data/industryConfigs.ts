// ============================================================================
// Industry Configuration System
// ============================================================================
// Defines predefined industries with their display labels, onboarding content,
// and Andrea persona context. Used to drive dynamic onboarding flows and
// AI coaching personas across enterprise and consumer org types.
// ============================================================================

export type AudienceType = 'enterprise' | 'consumer';

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
    'You speak healthcare naturally. You reference clinical workflows, patient records, HIPAA compliance, care coordination, EHR systems, and care team communication. Use real healthcare vocabulary — say "care transition note" not "professional handoff document."',
  onboardingMicroTask:
    'Write the actual prompt you would type into an AI tool to draft a care transition summary for a patient being discharged from the hospital to a rehabilitation facility.',
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
  welcomeMessage:
    "Welcome! You're here to build practical AI skills that work in any area of life or work.",
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
