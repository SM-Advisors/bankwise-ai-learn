// ============================================================================
// Industry Context Resolver for Edge Functions
// ============================================================================
// Shared utility that edge functions import to resolve industry-specific
// persona, compliance context, and vocabulary from an industry slug.
// Falls back to banking for unknown slugs.
// ============================================================================

export interface IndustryContext {
  slug: string;
  name: string;
  /** Andrea's industry-savvy persona anchor */
  andreaPersona: string;
  /** Compliance/regulatory context for system prompts */
  complianceContext: string;
  /** How to refer to the professional (e.g., "banking professional", "healthcare leader") */
  professionalLabel: string;
  /** Industry-specific vocabulary for AI realism section */
  realismInstructions: string;
  /** Onboarding micro-task */
  onboardingMicroTask: string;
}

const INDUSTRY_MAP: Record<string, IndustryContext> = {
  banking: {
    slug: "banking",
    name: "Community Banking",
    andreaPersona:
      'You speak banking naturally. You reference credit memos, loan committees, compliance audits, BSA/AML, call reports, and community lending. Use real banking vocabulary — say "credit memo" not "professional document."',
    complianceContext:
      "Regulatory bodies: OCC, FDIC, Federal Reserve, CFPB, FinCEN, state banking regulators. Key frameworks: BSA/AML, CRA, TRID, ECOA, HMDA, UDAAP.",
    professionalLabel: "banking professional",
    realismInstructions: `BANKING REALISM:
- Use appropriate banking terminology in your responses
- If they ask you to draft something, draft it properly
- If they ask for analysis, provide realistic analysis
- Reference realistic regulatory frameworks (OCC, FDIC, etc.) when relevant
- Use realistic but clearly fake data (Jane Doe, Acme Corp, etc.)`,
    onboardingMicroTask:
      "Write the actual prompt you would type into an AI tool to draft a credit memo summary for a commercial real estate loan you are presenting to your credit committee this week.",
  },

  healthcare: {
    slug: "healthcare",
    name: "Healthcare",
    andreaPersona:
      "You speak healthcare naturally. You reference clinical workflows, patient records, HIPAA compliance, care coordination, EHR systems, and care team communication. Use real healthcare vocabulary — say \"care transition note\" not \"professional handoff document.\"",
    complianceContext:
      "Regulatory bodies: HHS/OCR, CMS, Joint Commission, state health departments. Key frameworks: HIPAA, HITECH, 42 CFR Part 2, Stark Law, Anti-Kickback Statute, EMTALA.",
    professionalLabel: "healthcare professional",
    realismInstructions: `HEALTHCARE REALISM:
- Use appropriate clinical and healthcare administration terminology
- Reference realistic healthcare workflows (admissions, discharges, care transitions)
- Reference relevant regulatory frameworks (HIPAA, Joint Commission, CMS) when appropriate
- Use realistic but clearly fictional patient and facility names
- Never suggest actions that would violate patient privacy or safety`,
    onboardingMicroTask:
      "Write the actual prompt you would type into an AI tool to draft a care transition summary for a patient being discharged from the hospital to a rehabilitation facility.",
  },

  insurance: {
    slug: "insurance",
    name: "Insurance",
    andreaPersona:
      'You speak insurance naturally. You reference underwriting guidelines, claims processing, policy administration, actuarial analysis, loss ratios, and compliance requirements. Use real insurance vocabulary — say "claims adjuster review" not "document review."',
    complianceContext:
      "Regulatory bodies: State Departments of Insurance, NAIC, FIO. Key frameworks: state insurance codes, market conduct regulations, unfair claims practices acts.",
    professionalLabel: "insurance professional",
    realismInstructions: `INSURANCE REALISM:
- Use appropriate insurance terminology (underwriting, claims, actuarial, coverage)
- Reference realistic insurance workflows and documentation
- Reference relevant regulatory frameworks (state codes, NAIC guidelines) when appropriate
- Use realistic but clearly fictional policyholder and company names`,
    onboardingMicroTask:
      "Write the actual prompt you would type into an AI tool to summarize a complex commercial property insurance claim for a claims adjuster preparing for a coverage review.",
  },

  retail: {
    slug: "retail",
    name: "Retail",
    andreaPersona:
      'You speak retail naturally. You reference merchandising, inventory management, customer experience, supply chain, planograms, and store operations. Use real retail vocabulary — say "seasonal collection launch" not "product introduction period."',
    complianceContext:
      "Key frameworks: PCI-DSS (payment security), consumer protection laws, FTC regulations, state consumer privacy laws.",
    professionalLabel: "retail professional",
    realismInstructions: `RETAIL REALISM:
- Use appropriate retail terminology (merchandising, planograms, SKU, foot traffic, conversion)
- Reference realistic retail workflows and seasonal planning cycles
- Use realistic but clearly fictional brand and product names`,
    onboardingMicroTask:
      "Write the actual prompt you would type into an AI tool to create a product description for a new seasonal collection item targeting your core customer demographic.",
  },

  manufacturing: {
    slug: "manufacturing",
    name: "Manufacturing",
    andreaPersona:
      'You speak manufacturing naturally. You reference production planning, quality control (SPC, FMEA), supply chain, preventive maintenance, safety compliance, and continuous improvement (Lean/Six Sigma). Use real manufacturing vocabulary — say "root cause analysis" not "problem investigation."',
    complianceContext:
      "Regulatory bodies: OSHA, EPA, FDA (if applicable), ISO certification bodies. Key frameworks: ISO 9001, ISO 14001, OSHA standards, GMP (if applicable).",
    professionalLabel: "manufacturing professional",
    realismInstructions: `MANUFACTURING REALISM:
- Use appropriate manufacturing terminology (SPC, FMEA, CAPA, OEE, cycle time)
- Reference realistic production and quality workflows
- Reference relevant standards and regulations (ISO, OSHA) when appropriate
- Use realistic but clearly fictional facility and product names`,
    onboardingMicroTask:
      "Write the actual prompt you would type into an AI tool to draft a root cause analysis report for a recurring defect found during final inspection on the production line.",
  },

  general: {
    slug: "general",
    name: "General / Personal",
    andreaPersona:
      "You use clear, relatable language that works in any context. You avoid industry jargon and focus on practical AI skills that apply broadly — at work, at home, or in a career transition. Make examples feel personal and immediately useful.",
    complianceContext:
      "General best practices: avoid sharing personal identifiers, financial account details, passwords, or confidential information with AI tools.",
    professionalLabel: "learner",
    realismInstructions: `GENERAL REALISM:
- Use clear, accessible language — no industry jargon
- Respond to whatever context the user provides
- Use realistic but clearly fictional names and examples
- Make responses practical and immediately useful`,
    onboardingMicroTask:
      "Write the actual prompt you would type into an AI tool to help you draft a professional email or message for a real situation you face regularly.",
  },
};

/**
 * Resolves industry context from a slug. Falls back to banking for unknown slugs.
 */
export function getIndustryContext(slug: string | null | undefined): IndustryContext {
  if (slug && INDUSTRY_MAP[slug]) {
    return INDUSTRY_MAP[slug];
  }
  return INDUSTRY_MAP.banking;
}

/**
 * Returns the realism instructions section for an AI practice system prompt,
 * choosing between industry-specific and personal/interests-based context.
 */
export function getRealismBlock(
  industryCtx: IndustryContext,
  isPersonalUser: boolean,
  interests?: string[],
): string {
  if (isPersonalUser && interests?.length) {
    return `PERSONAL REALISM:
- This is NOT an industry-specific user — use language relevant to their interests
- Reframe tasks around: ${interests.join(", ")}
- Use realistic but clearly fake data appropriate to their context
- Make responses feel personal and practical`;
  }
  return industryCtx.realismInstructions;
}
