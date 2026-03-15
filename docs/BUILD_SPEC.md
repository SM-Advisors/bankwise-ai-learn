# SMILE Build Spec -- Industry Switching + Gate Redesign

This is the implementation spec for Claude Code. Each phase is ordered by dependency. Complete phases in order. Each task has the files to modify, the interface changes, and acceptance criteria.

Reference: `docs/ARCHITECTURE_PLAN_Industry_Switching.md` for strategic context (do not implement from that doc directly -- use this spec).

---

## Phase 1: Expand IndustryConfig to be the single source of truth

**Goal:** All industry-specific data (roles, departments, compliance context, UI copy) lives in `industryConfigs.ts` keyed by industry slug. No other data file defines industry-specific content independently.

### Task 1.1: Expand the IndustryConfig interface

**File:** `src/data/industryConfigs.ts`

Add these fields to the `IndustryConfig` interface:

```typescript
export interface IndustryConfig {
  // --- existing fields (keep all) ---
  slug: string;
  name: string;
  audienceType: AudienceType;
  description: string;
  jobRoleLabel: string;
  departmentLabel: string;
  employerLabel: string;
  andreaIndustrySavvy: string;
  onboardingMicroTask: string;
  welcomeMessage?: string;

  // --- new fields ---

  /** Industry-specific role options for intake form Q2 */
  roles: RoleOption[];

  /** Industry-specific departments with topics */
  departments: DepartmentInfo[];

  /** Regulatory bodies, key frameworks, prohibited data types.
   *  Injected into edge function system prompts. */
  complianceContext: string;

  /** Rich paragraph giving AI enough context to generate realistic
   *  practice scenarios for this industry. */
  scenarioGenerationContext: string;

  /** UI copy overrides keyed by identifier.
   *  Components look up labels here instead of hardcoding. */
  uiCopyOverrides: {
    policiesLabel: string;           // NavRail, tour steps (banking: "Bank Policies")
    policiesDescription: string;     // Tour step description
    certificateDescription: string;  // Certificate body text
    communityPlaceholder: string;    // Community feed example topic
    communityDescription: string;    // Community feed prompt text
    agentTemplateDefault: string;    // Agent builder placeholder
    brainstormPlaceholder: string;   // Brainstorm panel input placeholder
  };
}
```

Import `RoleOption` from `intakeQuestions.ts` and `DepartmentInfo` from `topics.ts` (or redefine locally if circular dependency is a concern).

### Task 1.2: Populate banking config with existing data

**Files:** `src/data/industryConfigs.ts`, `src/data/intakeQuestions.ts`, `src/data/topics.ts`

Move the existing `ROLE_OPTIONS` array from `intakeQuestions.ts` into the banking config's `roles` field. Move the existing `departments` array from `topics.ts` into the banking config's `departments` field. Keep the original exports in their files but have them re-export from the banking config for backward compatibility during migration.

Banking `complianceContext`:
```
"Regulatory bodies: OCC, FDIC, CFPB, FinCEN, Federal Reserve. Key frameworks: BSA/AML, CRA, HMDA, Reg B, ECOA, TRID, flood determination. Prohibited data: real customer PII, actual account numbers, real borrower names. Always use synthetic/example data."
```

Banking `scenarioGenerationContext`:
```
"Community and regional banking professionals (typically $500M-$5B asset size). Common workflows: credit memo drafting, loan committee presentations, board packet preparation, BSA/AML suspicious activity reviews, commercial loan portfolio monitoring, retail branch customer service, treasury/ALCO reporting, compliance policy updates, deposit operations, mortgage origination and servicing. Roles range from front-line tellers to C-suite executives. The AI training should feel like it was written by someone who has worked inside a community bank."
```

Banking `uiCopyOverrides`:
```typescript
{
  policiesLabel: 'Bank Policies',
  policiesDescription: "Your bank's AI governance and usage policies live here. Check back as your institution updates its guidelines.",
  certificateDescription: 'For successfully completing the comprehensive AI Training Program, demonstrating proficiency in structured prompting, AI agent development, and role-specific AI applications for banking professionals.',
  communityPlaceholder: 'Best practices for AI-assisted loan review',
  communityDescription: 'Start a discussion with your fellow banking professionals',
  agentTemplateDefault: 'You are a [Role] for [Department] at [Bank]. You help [Audience] with [Primary Purpose].',
  brainstormPlaceholder: 'e.g. I review loan applications and summarize them for the credit committee each week',
}
```

### Task 1.3: Author healthcare config

**File:** `src/data/industryConfigs.ts`

Populate the existing `healthcare` config object with the new fields:

Healthcare `roles`:
```typescript
[
  { key: 'clinical_ops',     label: 'Director of Clinical Operations',          lobSlug: 'clinical_operations' },
  { key: 'revenue_cycle',    label: 'VP Revenue Cycle Management',              lobSlug: 'revenue_cycle' },
  { key: 'nursing',          label: 'Chief Nursing Officer / Nursing Admin',     lobSlug: 'nursing_administration' },
  { key: 'medical_staff',    label: 'Chief Medical Officer / Medical Staff',     lobSlug: 'medical_staff_services' },
  { key: 'quality',          label: 'VP Quality & Patient Safety',               lobSlug: 'quality_patient_safety' },
  { key: 'health_it',        label: 'Director of IT / Digital Health',           lobSlug: 'health_information_technology' },
  { key: 'compliance',       label: 'VP Compliance & Privacy',                   lobSlug: 'compliance_privacy' },
  { key: 'hr',               label: 'Director of HR / Workforce Development',    lobSlug: 'human_resources' },
  { key: 'finance',          label: 'CFO / Finance Director',                    lobSlug: 'finance_accounting' },
  { key: 'executive',        label: 'Executive / C-Suite / Senior Leadership',   lobSlug: 'executive_leadership' },
  { key: 'other',            label: 'Other' },
]
```

Healthcare `departments`:
```typescript
[
  { id: 'clinical_operations', name: 'Clinical Operations', description: 'Patient flow, care delivery, clinical protocols, and operational efficiency', icon: 'Stethoscope', topics: [] },
  { id: 'revenue_cycle', name: 'Revenue Cycle Management', description: 'Coding, billing, claims management, denials, and payer relations', icon: 'DollarSign', topics: [] },
  { id: 'quality_patient_safety', name: 'Quality & Patient Safety', description: 'Quality metrics, patient safety events, accreditation readiness, and outcomes improvement', icon: 'ShieldCheck', topics: [] },
  { id: 'compliance_privacy', name: 'Compliance & Privacy (HIPAA)', description: 'HIPAA compliance, privacy program management, regulatory audits, and breach response', icon: 'Lock', topics: [] },
  { id: 'health_information_technology', name: 'Health Information Technology', description: 'EHR optimization, clinical informatics, interoperability, and digital health initiatives', icon: 'Monitor', topics: [] },
  { id: 'nursing_administration', name: 'Nursing Administration', description: 'Staffing, nurse scheduling, clinical education, and nursing quality indicators', icon: 'Heart', topics: [] },
  { id: 'medical_staff_services', name: 'Medical Staff Services', description: 'Credentialing, privileging, peer review, and medical staff governance', icon: 'UserCheck', topics: [] },
  { id: 'finance_accounting', name: 'Finance & Accounting', description: 'Financial planning, budgeting, cost accounting, and financial reporting', icon: 'Calculator', topics: [] },
  { id: 'human_resources', name: 'Human Resources & Workforce Development', description: 'Talent acquisition, workforce planning, employee engagement, and organizational development', icon: 'Users', topics: [] },
  { id: 'executive_leadership', name: 'Executive Leadership', description: 'Strategic planning, board reporting, organizational performance, and enterprise-level decision making', icon: 'Building2', topics: [] },
]
```

Healthcare `complianceContext`:
```
"Regulatory bodies: CMS, Joint Commission, state health departments, OIG, OCR (HIPAA enforcement). Key frameworks: HIPAA Privacy Rule, HIPAA Security Rule, HITECH Act, Joint Commission standards, CMS Conditions of Participation, Stark Law, Anti-Kickback Statute, EMTALA. Prohibited data: real PHI, actual patient names/MRNs, real provider NPIs. Always use synthetic/example data."
```

Healthcare `scenarioGenerationContext`:
```
"Healthcare system leadership (directors and above) at a large healthcare organization. Common workflows: care transition documentation, quality metric reporting, clinical protocol development, HIPAA compliance audits, revenue cycle denial management, staffing optimization, credentialing reviews, patient safety event analysis, board reporting on organizational performance, EHR workflow optimization, payer contract analysis. Roles are director-level and above across clinical and administrative functions. The AI training should feel like it was written by someone who has worked inside a health system."
```

Healthcare `uiCopyOverrides`:
```typescript
{
  policiesLabel: 'Organization Policies',
  policiesDescription: "Your organization's AI governance and usage policies live here. Check back as your organization updates its guidelines.",
  certificateDescription: 'For successfully completing the comprehensive AI Training Program, demonstrating proficiency in structured prompting, AI agent development, and role-specific AI applications for healthcare professionals.',
  communityPlaceholder: 'Best practices for AI-assisted care coordination documentation',
  communityDescription: 'Start a discussion with your fellow healthcare professionals',
  agentTemplateDefault: 'You are a [Role] for [Department] at [Organization]. You help [Audience] with [Primary Purpose].',
  brainstormPlaceholder: 'e.g. I review patient readmission data and prepare quality reports for the leadership team each month',
}
```

### Task 1.4: Create useIndustryContent hook

**File:** `src/hooks/useIndustryContent.ts` (new file)

```typescript
import { useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getIndustryConfig, type IndustryConfig } from '@/data/industryConfigs';

export function useIndustryContent(): IndustryConfig {
  const { profile } = useAuth();

  return useMemo(() => {
    // profile.organization_id -> look up org's industry slug
    // For now, use a simpler path: store industry on the profile or resolve from org
    // The org's industry is already available through the registration code flow
    const slug = profile?.industry ?? null;
    const audienceType = profile?.audience_type ?? null;
    return getIndustryConfig(slug, audienceType);
  }, [profile?.industry, profile?.audience_type]);
}
```

**Note:** If `profile.industry` does not exist on the profile type, the hook needs to resolve it from the organizations table via the profile's `organization_id`. Check `AuthContext.tsx` for what's available on the profile. If industry is not on the profile, add a join or separate lookup. The simplest path: add `industry` to the `user_profiles` view or fetch it from the `organizations` table when the profile loads.

**Acceptance criteria:**
- `useIndustryContent()` returns the correct `IndustryConfig` for the logged-in user's org
- Banking users get the banking config (backward compatible)
- Healthcare users get the healthcare config
- Falls back to banking if industry is null/undefined

### Task 1.5: Wire useIndustryContent into consuming components

Replace hardcoded banking references with hook lookups. For each component:

**`src/constants/tourSteps.ts`** -- Tour steps reference "Bank Policies." This file exports static arrays, so it cannot use a hook directly. Convert the tour step definitions to functions that accept the `uiCopyOverrides` object, or make the consuming component (wherever the tour is rendered) pass the resolved labels in.

**`src/components/capstone/CertificateGenerator.tsx`** -- Replace hardcoded "banking professionals" certificate text with `uiCopyOverrides.certificateDescription`.

**`src/components/CommunityFeed.tsx`** -- Replace "banking professionals" and "loan review" with `uiCopyOverrides.communityDescription` and `uiCopyOverrides.communityPlaceholder`.

**`src/components/agent-studio/AgentTemplateBuilder.tsx`** -- Replace hardcoded "[Bank]" placeholder with `uiCopyOverrides.agentTemplateDefault`.

**`src/components/BrainstormPanel.tsx`** -- Replace "loan applications" placeholder with `uiCopyOverrides.brainstormPlaceholder`.

**`src/components/admin/DepartmentsManager.tsx`** -- Remove hardcoded `.eq('slug', 'banking')`. Resolve industry from the admin's org or from a parameter.

**`src/components/admin/OrganizationsManager.tsx`** -- Remove hardcoded `setOrgIndustry('banking')` default.

**`src/pages/Policies.tsx` and `src/pages/PolicyDetail.tsx`** -- If page title or breadcrumbs say "Bank Policies", resolve from `uiCopyOverrides.policiesLabel`.

**`src/data/intakeQuestions.ts`** -- The `ROLE_OPTIONS` export should still work for backward compatibility, but add a function `getRolesForIndustry(slug: string): RoleOption[]` that looks up from the industry config. Update the intake form component (in the onboarding flow) to use the industry-resolved roles.

**`src/data/topics.ts`** -- Same pattern: keep `departments` export for backward compat, add `getDepartmentsForIndustry(slug: string): DepartmentInfo[]`.

**Acceptance criteria:**
- No component directly imports banking-specific strings
- A healthcare user sees "Organization Policies," healthcare roles, healthcare departments
- A banking user sees everything exactly as before
- All existing tests still pass

---

## Phase 2: Gate & Progression Redesign

**Goal:** All modules gate progression sequentially. Submission pipeline runs trainer_chat then submission_review (not parallel). Feedback distinguishes blocking vs. non-blocking.

### Task 2.1: Make all modules gate progression

**File:** `src/components/training/ModuleListSidebar.tsx`

Change `isModuleLocked()` logic. Currently it checks for prior uncompleted gate modules. New logic: a module is locked if any prior module (by array index) is not completed. The `isGateModule` flag is no longer relevant for navigation.

```typescript
// New logic:
function isModuleLocked(moduleIndex: number): boolean {
  if (moduleIndex === 0) return false; // First module is always unlocked
  const priorModule = modules[moduleIndex - 1];
  const priorEngagement = moduleEngagement[priorModule.id];
  return !priorEngagement?.completed && !completedModules.has(priorModule.id);
}
```

Update the module list rendering to use this. Locked modules should be visually distinct (greyed out, lock icon) and not clickable.

**File:** `src/pages/TrainingWorkspace.tsx`

Update `handleModuleSelect` to prevent selection of locked modules:
```typescript
const handleModuleSelect = (module: ModuleContent) => {
  const moduleIndex = session.modules.findIndex(m => m.id === module.id);
  if (isModuleLocked(moduleIndex)) return; // Prevent selection
  setSelectedModule(module);
  // ... existing logic
};
```

Update the auto-advance logic after module completion: when a module is completed, automatically select the next module if it exists.

**Acceptance criteria:**
- Module N+1 is locked until Module N is completed
- First module is always unlocked
- Completed modules remain accessible (learner can review)
- After completing a module, the next module auto-selects
- Locked modules show a lock icon and are not clickable

### Task 2.2: Sequential trainer_chat -> submission_review pipeline

**File:** `src/pages/TrainingWorkspace.tsx`

Find the `handleSubmitForReview` function. Currently it uses `Promise.allSettled()` to run `trainer_chat` and `submission_review` in parallel. Change to sequential:

```typescript
// STEP 1: Call trainer_chat first
const trainerResult = await supabase.functions.invoke('trainer_chat', {
  body: { /* existing trainer_chat body */ }
});

// Extract Andrea's response
let replyText = 'Let me review your work...';
if (!trainerResult.error) {
  const replyData = trainerResult.data;
  replyText = replyData?.reply || replyText;
  // ... extract suggestedPrompts, coachingAction, etc. (existing logic)
}

// Show Andrea's response to the learner immediately
// (Add the trainer message to the chat before submission review runs)

// STEP 2: Call submission_review with the full conversation including Andrea's response
const reviewResult = await supabase.functions.invoke('submission_review', {
  body: {
    // ... existing submission_review body
    submission: conversationTranscript, // Include Andrea's response in transcript
    trainerResponse: replyText, // Pass Andrea's response explicitly
  }
});
```

**File:** `supabase/functions/submission_review/index.ts`

Add `trainerResponse` to the input interface. Include it in the system prompt context so the reviewer can assess the full exchange:
```
"The learner received the following coaching feedback from Andrea after their submission: [trainerResponse]. Evaluate whether the learner demonstrated the required competency, taking into account the coaching exchange."
```

**Acceptance criteria:**
- `trainer_chat` completes before `submission_review` starts
- Andrea's response is visible to the learner before the gate result appears
- `submission_review` receives the trainer's response as context
- No parallel execution of these two functions during submission

### Task 2.3: Structured feedback with blocking vs. non-blocking

**File:** `src/types/progress.ts`

Update `GateResult`:
```typescript
export interface GateResult {
  passed: boolean;
  criteriaMetCount: number;
  criteriaTotalCount: number;
  gateMessage: string;
  requiredToProgress: string[];   // Blocking items -- must fix to advance
  areasToStrengthen: string[];    // Non-blocking -- coaching advice
}
```

**File:** `supabase/functions/submission_review/index.ts`

Update the system prompt to instruct the reviewer to return feedback in two categories:

```
"Return your assessment as JSON with these fields:
- requiredToProgress: array of specific items the learner MUST address to pass this module. These are core competencies. Only include items that are clearly unmet.
- areasToStrengthen: array of suggestions for improvement that would enhance the learner's work but are NOT required to progress. Frame these as coaching advice.
- passed: true if all requiredToProgress items are empty (learner met all core competencies), false otherwise.
- gateMessage: a brief, encouraging message summarizing the assessment."
```

Update the GateResult construction to include the new fields.

**File:** `src/components/training/TrainerChatPanel.tsx` (or wherever gate feedback is displayed)

Update the UI to show two distinct sections when gate feedback is displayed:
- "Required to progress" section with a checklist-style treatment
- "Ways to strengthen your work" section with a coaching/advisory treatment

**Acceptance criteria:**
- `submission_review` returns `requiredToProgress` and `areasToStrengthen` as separate arrays
- UI displays them in visually distinct sections
- A learner passes if `requiredToProgress` is empty
- Non-blocking feedback is clearly presented as growth advice, not failure

### Task 2.4: Update Session 1 success criteria

**File:** `src/data/trainingContent.ts`

For each module, update the `successCriteria` array in `practiceTask`:

**Module 1-1 (Personalization):**
Remove: "Can articulate difference between generic and personalized response"
Keep: "Profile includes specific role/department/employer context", "At least one preference configured"

**Module 1-2 (Interface Orientation):**
Remove: "Can explain difference between continuing and starting a thread"
Keep: "Sent at least one message and received response", "Started a new conversation thread"

**Module 1-3 (Basic Interaction):**
Change: "Pasted or described a real work task (not a test prompt)" -> "Pasted or described a work-related task (not a test prompt)"
Add: "Dirty Paste" to the accepted patterns: "Attempted Flipped Interaction Pattern, Outline Expander, or Dirty Paste"

**Module 1-4 (Your First Win):**
Replace: "Produced an output described as usable" with specific measurable criteria:
"Produced an output that addresses the stated work task", "Output is formatted appropriately for its intended use (email, memo, summary, etc.)", "Output reflects the learner's professional context (role, department, org)"

**Module 1-6 (Self-Review Loops):**
Change: "Defined at least 2 specific review criteria (not generic)" -> "Defined at least 2 review criteria"
Add UX guidance in the module content `practiceTask.instructions` to explicitly tell the learner they should compare original and revised versions and state which they prefer and why.

**File:** `supabase/functions/submission_review/index.ts`

Update any inline rubric text for these modules to match the new criteria. Search for module-specific rubric strings (e.g., "MODULE 1-1", "MODULE 1-3") in the function and update accordingly.

**Acceptance criteria:**
- Updated criteria are reflected in both `trainingContent.ts` and `submission_review/index.ts`
- Criteria removed from 1-1 and 1-2 are no longer evaluated
- "Dirty Paste" is recognized as a valid pattern in 1-3
- Module 1-4 criteria are specific and measurable
- Module 1-6 instructions explicitly guide the learner through comparison

### Task 2.5: Cross-module continuity (1-4 -> 1-5)

**File:** `src/pages/TrainingWorkspace.tsx`

When the learner enters Module 1-5, load the practice conversation from Module 1-4:

```typescript
// When selectedModule changes to '1-5', load prior context
useEffect(() => {
  if (selectedModule?.id === '1-5') {
    // Load module 1-4's practice conversation from the database
    // (usePracticeConversations already provides this capability)
    const priorConversation = practiceConversations['1-4'];
    if (priorConversation?.messages?.length) {
      // Inject as context into the ai-practice call
      setPriorModuleContext(priorConversation.messages);
    }
  }
}, [selectedModule?.id]);
```

**File:** `supabase/functions/ai-practice/index.ts`

Add `priorModuleContext` to the accepted request body. If present, prepend to the system prompt:
```
"The learner previously completed this work in the prior module:\n[formatted prior conversation]\n\nThe learner is now iterating on this work. Help them refine and improve it."
```

**Acceptance criteria:**
- When entering Module 1-5, the learner's Module 1-4 output is loaded as context
- The AI practice chat references the prior work
- If Module 1-4 data is unavailable, Module 1-5 works standalone (graceful fallback)

---

## Phase 3: Edge Function Industry Adaptation

**Goal:** All edge functions that have hardcoded banking language accept an `industrySlug` parameter and resolve industry context dynamically.

### Task 3.1: Create shared industry context resolver for edge functions

**File:** `supabase/functions/_shared/industryContext.ts` (new file)

```typescript
interface IndustryContext {
  slug: string;
  name: string;
  complianceContext: string;
  andreaPersona: string;
  scenarioContext: string;
  professionalLabel: string; // "banking professional" vs "healthcare professional"
}

const INDUSTRY_CONTEXTS: Record<string, IndustryContext> = {
  banking: {
    slug: 'banking',
    name: 'Community Banking',
    complianceContext: 'Regulatory bodies: OCC, FDIC, CFPB, FinCEN...',
    andreaPersona: 'You speak banking naturally...',
    scenarioContext: 'Community and regional banking professionals...',
    professionalLabel: 'banking professional',
  },
  healthcare: {
    slug: 'healthcare',
    name: 'Healthcare',
    complianceContext: 'Regulatory bodies: CMS, Joint Commission...',
    andreaPersona: 'You speak healthcare naturally...',
    scenarioContext: 'Healthcare system leadership...',
    professionalLabel: 'healthcare professional',
  },
};

export function getIndustryContext(slug: string | null | undefined): IndustryContext {
  return INDUSTRY_CONTEXTS[slug ?? ''] ?? INDUSTRY_CONTEXTS['banking'];
}
```

### Task 3.2: Update each edge function

For each function below, add `industrySlug?: string` to the request body, call `getIndustryContext(industrySlug)`, and replace hardcoded banking strings with resolved values.

**HIGH priority (used in every training session):**

1. **`supabase/functions/ai-practice/index.ts`**
   - Replace: "a banking professional as part of their day-to-day work" -> `${ctx.professionalLabel}`
   - Replace: "banking terminology" -> industry-appropriate vocabulary reference
   - Replace: "regulatory frameworks (OCC, FDIC, etc.)" -> `${ctx.complianceContext}`

2. **`supabase/functions/practice_chat/index.ts`**
   - Same replacements as ai-practice
   - Also add personalization parameters (this function currently has zero context -- mirror ai-practice's parameter handling)

3. **`supabase/functions/trainer_chat/index.ts`**
   - Replace: "banking professional" and "banking training" references -> dynamic
   - Inject `ctx.andreaPersona` into the system prompt

4. **`supabase/functions/ai-trainer/index.ts`**
   - Replace: "banking professionals" -> `${ctx.professionalLabel}s`
   - Replace: fallback `'banking'` in LOB context -> `ctx.name`

5. **`supabase/functions/submission_review/index.ts`**
   - Replace: "banking AI training platform" -> `${ctx.name} AI training platform`
   - Replace banking-specific rubric examples with industry-appropriate ones (use `ctx.scenarioContext` to frame)
   - Bank policy retrieval: make conditional on industry (healthcare orgs may not have "bank policies")

**MEDIUM priority (onboarding/lesson generation):**

6. **`supabase/functions/intake-prompt-score/index.ts`**
   - Add `microTask?: string` to request body
   - Replace hardcoded banking micro-task with the passed-in task (sourced from `IndustryConfig.onboardingMicroTask`)
   - Replace: "banking AI training program" -> dynamic
   - Replace: "banking-specific risks" -> "industry-specific risks"

7. **`supabase/functions/generate-lesson/index.ts`**
   - Replace: "financial institutions, specifically community and regional banks" -> dynamic
   - Replace: "Specific to banking workflows" -> `Specific to ${ctx.name} workflows`

**LOW priority (Session 3+, not needed for Parallon demo of Session 1-2):**

8. **`supabase/functions/agent-test-chat/index.ts`**
   - Replace: "BANKING REALISM" section -> `${ctx.name.toUpperCase()} REALISM`
   - Replace: OCC/FDIC/CFPB references -> `ctx.complianceContext`

9. **`supabase/functions/workflow-test-chat/index.ts`**
   - Same pattern as agent-test-chat

**Frontend update:** Every component that calls these edge functions must pass `industrySlug` in the request body. The slug comes from `useIndustryContent().slug` or from the user's profile.

**Acceptance criteria:**
- No edge function contains hardcoded "banking" strings in system prompts
- Each function resolves industry context from the passed slug
- Missing slug falls back to banking (backward compatible)
- Healthcare users get healthcare-appropriate language in all AI interactions

---

## Phase 4: AI-Generated Industry Content (Hybrid Content Model)

**Goal:** Practice scenarios, examples, and department-specific content are generated by AI based on industry config, then cached.

### Task 4.1: Create generated_module_content table

**Migration file:** `supabase/migrations/[timestamp]_generated_module_content.sql`

```sql
CREATE TABLE generated_module_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  industry_slug TEXT NOT NULL,
  department_slug TEXT NOT NULL,
  module_id TEXT NOT NULL,
  curriculum_version TEXT NOT NULL DEFAULT 'v2.0',
  content JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (industry_slug, department_slug, module_id, curriculum_version)
);

ALTER TABLE generated_module_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read generated content"
  ON generated_module_content FOR SELECT
  USING (true);

CREATE POLICY "Service role can insert"
  ON generated_module_content FOR INSERT
  WITH CHECK (true);
```

The `content` JSONB column stores:
```typescript
{
  examples: { title: string; good: string; bad: string; explanation: string }[];
  practiceScenario: string;
  practiceHints: string[];
  successCriteria: string[];
  departmentScenarios: Record<string, { scenario: string; hints: string[] }>;
}
```

### Task 4.2: Build generate-module-content edge function

**File:** `supabase/functions/generate-module-content/index.ts` (new)

**Input:**
```typescript
{
  moduleId: string;
  industrySlug: string;
  departmentSlug: string;
  modulePedagogy: {
    title: string;
    learningObjectives: string[];
    learningOutcome: string;
    keyPoints: string[];
    overview: string;
    practiceTask: { title: string; instructions: string; };
  };
  industryContext: {
    scenarioGenerationContext: string;
    complianceContext: string;
    andreaPersona: string;
  };
}
```

**Behavior:**
1. Check `generated_module_content` table for cached entry matching (industry_slug, department_slug, module_id, curriculum_version)
2. If found, return cached content
3. If not found, call Claude with a structured prompt to generate industry-specific examples and scenarios
4. Write the result to the cache table
5. Return the generated content

**System prompt for generation:**
```
You are a curriculum content specialist creating practice scenarios for an AI training platform.

Industry context: {scenarioGenerationContext}
Compliance context: {complianceContext}
Department: {departmentSlug}

Module: {title}
Learning objectives: {learningObjectives}
Key teaching points: {keyPoints}

Generate the following for this module, tailored to a {departmentSlug} professional in the {industryName} industry:

1. examples: 2-3 good/bad prompt comparison examples that illustrate the module's key teaching points using realistic {industryName} workflows
2. practiceScenario: A realistic practice task scenario for this department
3. practiceHints: 3-4 hints to guide the learner
4. successCriteria: 3-5 measurable criteria for evaluating the learner's work

Return as JSON matching this schema: { examples, practiceScenario, practiceHints, successCriteria }
```

### Task 4.3: Integrate generated content into the training workspace

**File:** `src/pages/TrainingWorkspace.tsx` (or a new hook `src/hooks/useModuleContent.ts`)

When a module is selected, check if industry-specific generated content exists:

```typescript
function useModuleContent(module: ModuleContent, industrySlug: string, departmentSlug: string) {
  const [generatedContent, setGeneratedContent] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (industrySlug === 'banking') {
      // Banking uses hardcoded content from trainingContent.ts and roleScenarioBanks.ts
      setGeneratedContent(null);
      return;
    }

    // For other industries, fetch or generate
    fetchOrGenerate(module.id, industrySlug, departmentSlug).then(setGeneratedContent);
  }, [module.id, industrySlug, departmentSlug]);

  // Merge: generated content overrides the static content's examples and scenarios
  const resolvedContent = generatedContent
    ? mergeContent(module, generatedContent)
    : module;

  return { content: resolvedContent, isGenerating };
}
```

**Acceptance criteria:**
- Banking users see existing hardcoded content (no change)
- Healthcare users see AI-generated scenarios specific to their department
- Generated content is cached -- second load is instant
- Loading state is shown during first-time generation
- If generation fails, module falls back to the static content

---

## Phase 5: Super Admin Org Setup Wizard

**Goal:** Super admin can create and configure new orgs entirely through the app UI.

### Task 5.1: Create the wizard page

**File:** `src/pages/SuperAdminOrgSetup.tsx` (new)

Multi-step wizard form:

**Step 1 - Basics:** Org name (text), primary contact email (text), audience type (select: enterprise/consumer)

**Step 2 - Industry:** Select from available industries in the registry. On selection, show a preview: the roles, departments, and Andrea persona that will be configured. This step writes `industry` to the org record.

**Step 3 - Platform:** Select AI platform (ChatGPT, Claude, Copilot, default). Show a preview of what the practice UI will look like. Writes `platform` to the org record.

**Step 4 - Feature Flags:** Toggle list of available features (Community zone, Agents zone, Electives, etc.). Writes to `feature_flags` table.

**Step 5 - Review & Activate:** Summary of all selections. Confirm button creates the org record and marks it active.

**Route:** Add `/super-admin/org-setup` to `App.tsx` routes (protected, super-admin only).

**Supabase operations:**
- Step 5 creates a row in `organizations` with: name, contact_email, audience_type, industry, platform, is_active
- Inserts default feature flags for the org
- Does NOT create registration codes or departments (that's org admin scope)

### Task 5.2: Scope org admin view

**File:** `src/pages/AdminDashboard.tsx`

Ensure the admin dashboard only shows components relevant to org admin scope:
- DepartmentsManager (scoped to their org's industry departments)
- UsersManagement (scoped to their org)
- ProgressDashboard (scoped to their org)
- OrgResourcesManager (scoped to their org)
- CommunityReviewQueue (scoped to their org)
- Registration code management (needs to be built or completed)

Super-admin-only components (OrganizationsManager, cross-org analytics) should not appear for org admins.

**Acceptance criteria:**
- Super admin can create a new org through the wizard in under 2 minutes
- Org admin only sees their own org's data and operations
- Super admin sees cross-org views plus the setup wizard
- New org is immediately usable after wizard completion

---

## Phase 6: Parallon Demo Setup

**Goal:** Parallon org exists in the system with healthcare config, ChatGPT platform, demo accounts ready.

### Task 6.1: Create Parallon org

Run the super admin org setup wizard (or if wizard isn't complete, create directly in Supabase):
- Name: "Parallon"
- Industry: healthcare
- Platform: chatgpt
- Feature flags: enable all default features

### Task 6.2: Create registration codes

Create 5-10 multi-use registration codes for Parallon demo accounts.

### Task 6.3: Create demo user accounts

Create 2-3 demo accounts with different healthcare roles:
1. Director of Clinical Operations (department: clinical_operations)
2. VP Revenue Cycle Management (department: revenue_cycle)
3. VP Quality & Patient Safety (department: quality_patient_safety)

Pre-complete onboarding on account 1 so the demo can skip straight to training. Leave account 2 fresh for live onboarding walkthrough.

### Task 6.4: Pre-generate healthcare content

Run the `generate-module-content` function for all Session 1 modules across the key healthcare departments. Review the generated content and hand-tune anything that doesn't land.

### Task 6.5: End-to-end verification

Walk the full demo path:
1. Fresh signup with registration code -> healthcare onboarding
2. Session 1, Module 1-1 through 1-3 minimum
3. Verify: healthcare roles, healthcare scenarios, ChatGPT UI skin, Andrea speaks healthcare, sequential gates work, feedback taxonomy is clear
4. Verify: banking experience is unaffected (regression)

**Acceptance criteria:**
- Parallon demo accounts work end-to-end
- No banking references visible to a healthcare user
- Gate progression works sequentially
- ChatGPT practice UI skin renders correctly
