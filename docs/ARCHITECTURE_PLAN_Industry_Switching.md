# SMILE Platform: Industry-Switching Architecture Plan

**Date:** March 15, 2026
**Target:** Parallon (HCA) live demo -- Friday, March 20, 2026
**Author:** Cory K / SM Advisors + Claude

---

## Executive Summary

SMILE is currently a banking-specific AI training platform. This plan restructures it into an industry-agnostic learning engine with pluggable industry layers, enabling healthcare (and future verticals) without maintaining separate codebases. The architecture uses a hybrid approach: static core pedagogy + AI-generated industry-specific content at runtime.

This plan also incorporates structural changes to the quality gate system and module progression model documented in "Updates to SMILE - 3.15.26a."

---

## Architecture: Core vs. Edge

### Core (Universal -- ships to every client)

These components are industry-agnostic and never change per client:

- **Learning engine**: 5-session progression, module completion tracking, engagement metrics
- **Andrea coaching framework**: chat mechanics, spaced repetition triggers, nudge system (not the persona or vocabulary)
- **Quality gates**: submission review pipeline, scoring rubrics structure, gate pass/fail logic (see "Gate & Progression Redesign" section below)
- **Auth & onboarding flow**: signup, registration codes, profile setup, session management
- **Shell layout**: AppShell, NavRail, TopBar, zone-based navigation
- **Feature gating**: progressive zone unlocking based on learner progress
- **Skill signals**: proficiency tracking, aggregation, level derivation
- **Platform layer**: practice UI skins (ChatGPT, Claude, Copilot), model selection per org
- **Admin infrastructure**: org management, user management, training reset, progress dashboard
- **Certificate engine**: generation pipeline (not the copy)
- **Community framework**: topic creation, replies, moderation queue (not the placeholder copy)

### Edge Layer 1: Industry

Defines the domain context for a vertical. Adding an industry = creating one of these packages.

| Component | What it provides | Current file |
|-----------|-----------------|-------------|
| Industry config | Roles, departments, labels, Andrea persona, compliance vocabulary, onboarding micro-task | `industryConfigs.ts` (exists, needs expansion) |
| Department definitions | Department names, descriptions, icons, topic trees | `topics.ts` (banking-only today) |
| Role options | Job titles, role-to-department mappings, LOB slugs | `intakeQuestions.ts` (banking-only today) |
| Scenario generation context | Enough detail per role/department for AI to generate practice scenarios at runtime | New -- does not exist yet |
| Assessment calibration | Situational judgment questions, proficiency anchors | `proficiencyAssessment.ts` (banking-only today) |
| Compliance & regulatory context | Regulatory bodies, key frameworks, prohibited data types | New -- embedded in edge function prompts today |
| UI copy overrides | Tour step labels, certificate language, community placeholders | Scattered across components today |

### Edge Layer 2: Platform (AI Provider)

Defines the AI tool the organization primarily uses. Already partially built.

| Component | What it provides | Current state |
|-----------|-----------------|--------------|
| Practice UI skin | Visual treatment of the practice chat panel | ChatGPT skin exists; Claude/Copilot do not |
| Model routing | Which LLM the edge functions call | Partially implemented via `useOrgPlatform` |
| Platform-specific tips | "In ChatGPT, you would..." guidance in content | Does not exist yet |

### Edge Layer 3: Organization

Per-client configuration. Already exists in Supabase.

| Component | What it provides | Current state |
|-----------|-----------------|--------------|
| Registration codes | Signup access control | Working |
| Industry assignment | Links org to an industry package | Working (stored as `industry` slug) |
| Platform assignment | Links org to a platform skin | Working (stored as `platform` field) |
| Department subset | Which departments from the industry are active | Partially working via `DepartmentsManager` |
| Custom policies | Org-uploaded policy documents | Working |
| Feature flags | Per-org feature toggles | Working via `feature_flags` table |
| Branding | Org name, logo (future) | Partial -- name only |

---

## Gate & Progression Redesign (3.15.26a Updates)

These changes affect the core learning engine and apply to every industry/client.

### Change 1: Every Module Is Gated

**Current state:** Only modules 1-3 and 1-4 are marked as `isGateModule`. Learners can skip ahead to any module within a session.

**New behavior:** Every module gates progression. A learner must complete Module N before Module N+1 unlocks. This enforces the intended learning path sequentially. The `isGateModule` flag on individual modules becomes unnecessary -- all modules are gated by default.

**Implementation:** The `TrainingWorkspace` component's module selection logic changes from "allow free navigation within a session" to "only allow selection of the current or previously completed modules." The `ModuleListSidebar` visually distinguishes locked, current, and completed modules.

### Change 2: Sequential Trainer Chat -> Submission Review (No Parallel Execution)

**Current state:** `trainer_chat` and `submission_review` can run in parallel, creating the possibility of Andrea giving encouraging feedback while the gate simultaneously fails the learner. Misaligned messaging.

**New behavior:** The pipeline becomes sequential:
1. Learner submits practice work
2. `trainer_chat` responds with coaching feedback (Andrea's voice)
3. `submission_review` evaluates the trainer_chat exchange (not just the learner's submission in isolation) to determine gate pass/fail
4. Gate result is presented to the learner after Andrea's response, not simultaneously

This means `submission_review` receives the full conversation including Andrea's response as additional context. The review assesses whether the learner demonstrated the required competency within the exchange, not just in a single message.

### Change 3: Nuanced Pass/Fail with Grey Area

**Current state:** Binary pass/fail against a checklist of criteria. Each criterion is either met or not.

**New behavior:** Each success criterion has sub-components that are individually assessed. The gate decision uses a weighted composite rather than all-or-nothing. This introduces "feel" into the assessment:

- **Must-pass criteria** (blocking): Core competencies that must be demonstrated to progress. Clearly communicated to the learner as requirements.
- **Growth criteria** (non-blocking): Areas for improvement that enhance the learner's skill but are not required to advance. Presented as "areas to strengthen" rather than failures.

The `submission_review` edge function returns structured feedback that distinguishes between these two categories, so the UI can present them differently.

### Change 4: Clear Feedback Taxonomy (Issues vs. Areas for Improvement)

**Current state:** Feedback includes `issues` and `areasForImprovement` but the distinction between "you must fix this" and "here's how to grow" is unclear to the learner.

**New behavior:** Feedback is presented in two clearly labeled sections:
- **"Required to progress"** -- specific, actionable items the learner must address before the gate opens. These map to must-pass criteria.
- **"Ways to strengthen your work"** -- constructive suggestions for improvement that do not block progression. These map to growth criteria.

The UI treatment makes the distinction unmistakable: required items have a clear visual indicator (e.g., a checklist), while growth items are presented as coaching advice from Andrea.

### Module-Specific Updates (Session 1)

| Module | Change | Rationale |
|--------|--------|-----------|
| 1-1 Personalization | Remove success criterion: "Can articulate difference between generic and personalized response." Keep: profile includes specific role/department/employer context; at least one preference configured. | The articulation criterion is hard for an AI reviewer to assess reliably and adds friction without clear value. |
| 1-2 Interface Orientation | Remove: "Can explain difference between continuing and starting a thread." Question whether AI reviewer can reliably detect a new conversation thread was started. | Detection of thread creation is unreliable. The criterion asks the learner to explain something the system can't verify. |
| 1-3 Basic Interaction | Loosen "real work task" definition: should be any work-related task, not require AI to infer role-appropriate tasks. Add "Dirty Paste" to accepted interaction patterns alongside Flipped Interaction and Outline Expander. | Overly restrictive "real work" definition creates false negatives. Dirty Paste is a legitimate interaction pattern that should count. |
| 1-4 Your First Win | Tighten "produced an output described as usable" -- currently too broad as a success criterion. Needs specific measurable conditions. | A vague criterion leads to inconsistent gate decisions. |
| 1-5 Iteration | Module 4 output must carry over into Module 5 conversation context. Currently there is no continuity between modules. | Iteration only makes sense if the learner is refining their own prior work, not starting fresh. |
| 1-6 Self-Review Loops | Review criteria should be "acceptable" rather than requiring AI to judge "specific vs. generic." Learner needs clearer UX guidance that they're supposed to compare versions and articulate preference. | The criteria as written require the AI reviewer to make subjective judgments it can't reliably make. The learner doesn't know what's expected. |
| 1-7 Sandbox | No changes. | -- |

### Cross-Module Continuity (1-4 -> 1-5)

The current architecture treats each module's practice chat as an independent conversation. Module 1-5 (Iteration) requires the learner to iterate on their Module 1-4 output, but there's no mechanism to carry that context forward.

**Implementation:** When a learner enters Module 1-5, the system loads the final practice conversation and output from Module 1-4 and injects it as conversation history / context into the Module 1-5 practice chat. The `ai-practice` edge function receives a `priorModuleContext` parameter containing the relevant prior output. This pattern can be generalized for any module that builds on a previous module's work.

---

## The Hybrid Content Model

### Problem

Hardcoding industry-specific content (scenarios, examples, practice tasks) for every industry multiplies maintenance burden. With 5 sessions, ~30 modules, ~10 departments per industry, and multiple industries, you'd be authoring thousands of scenario variants by hand.

### Solution

Split training content into two tiers:

**Tier 1 -- Static core pedagogy (hardcoded in `trainingContent.ts`):**
- Module titles, learning objectives, learning outcomes
- Key teaching points (what makes a good prompt, why context matters, etc.)
- Content structure (overview, keyPoints, steps)
- Gate module designations

These are universal. A banking compliance officer and a healthcare quality director both need to learn the same prompting principles.

**Tier 2 -- AI-generated industry content (produced at runtime):**
- Practice scenarios tailored to the learner's industry + role + department
- Good/bad prompt examples using industry-appropriate vocabulary
- Department-specific scenario variations
- Assessment questions with industry-relevant framing

These are generated by passing the industry config's context (roles, compliance terms, workflows, vocabulary) into a generation prompt, producing content that feels hand-authored for the specific domain.

### How Generation Works

1. Learner opens a module
2. Frontend resolves the learner's industry + role + department from their profile
3. A content generation call (new edge function: `generate-module-content`) receives:
   - The module's static pedagogy (objectives, key points, structure)
   - The industry config (Andrea persona, compliance vocab, department context)
   - The learner's role and department
4. The function returns industry-specific examples, scenarios, and practice tasks
5. Response is cached per industry+department+module combination (not per user) to ensure consistency and reduce API calls

### Caching Strategy

- **Cache key**: `{industry_slug}:{department_slug}:{module_id}`
- **Storage**: Supabase table `generated_module_content`
- **TTL**: No expiry -- content regenerated only when curriculum version changes
- **First-hit generation**: First learner in a given industry+department+module triggers generation; subsequent learners get cached version
- **Consistency**: All learners in the same industry+department see the same generated content, ensuring fair quality gate comparisons

### What This Means for Adding a New Industry

1. Author the industry config in `industryConfigs.ts` (~30 lines): name, roles, departments, Andrea persona, compliance terms, vocabulary
2. Author the department definitions in a new industry-keyed section of `topics.ts` or a separate file
3. Author the role options and intake SJT questions for the industry
4. Create the org in Supabase with the industry slug
5. The generation pipeline handles everything else -- scenarios, examples, practice tasks are produced on first access

No changes to the learning engine, edge function logic, shell, auth, or any core component.

---

## Implementation Plan: 5 Days to Parallon Demo

### Day 1 (Monday, March 16): Architecture Foundation + Gate Redesign

**Goal:** Core/edge separation is in place. Gate progression model is updated. Banking still works.

**Tasks:**

1. **Expand `IndustryConfig` interface** to include:
   - `roles: RoleOption[]` -- industry-specific role options (currently hardcoded in `intakeQuestions.ts`)
   - `departments: DepartmentInfo[]` -- industry-specific departments (currently hardcoded in `topics.ts`)
   - `complianceContext: string` -- regulatory bodies, key frameworks, prohibited data types
   - `scenarioGenerationContext: string` -- rich paragraph giving AI enough context to generate realistic scenarios
   - `uiCopyOverrides: Record<string, string>` -- keys like `policiesLabel`, `certificateDescription`, `communityPlaceholder`

2. **Create `useIndustryContent` hook:**
   - Reads org's industry slug from `useAuth()` profile
   - Returns resolved `IndustryConfig` with all content
   - Falls back to banking for undefined industries (backward compatible)
   - Memoized to avoid re-resolution on every render

3. **Refactor consuming components** to use the hook instead of direct imports:
   - `intakeQuestions.ts` role options -> `useIndustryContent().roles`
   - Tour step copy -> `useIndustryContent().uiCopyOverrides`
   - Certificate copy -> `useIndustryContent().uiCopyOverrides`
   - Community placeholders -> `useIndustryContent().uiCopyOverrides`
   - Admin defaults (`DepartmentsManager`, `OrganizationsManager`) -> dynamic

4. **Refactor `trainingContent.ts`:**
   - Strip banking-specific examples from module content bodies
   - Replace with generic teaching content OR placeholder tokens that the generation layer fills
   - Keep all `departmentScenarios` and `roleScenarioBanks` entries for banking (they become the banking industry's cached content)

5. **Implement sequential module gating:**
   - All modules now gate progression (remove reliance on `isGateModule` flag for navigation)
   - Update `TrainingWorkspace` module selection: only current + previously completed modules are selectable
   - Update `ModuleListSidebar` to visually show locked/current/completed states
   - Implement Module 1-4 -> 1-5 context carryover: load prior module's practice output into next module's conversation

6. **Redesign submission pipeline to sequential flow:**
   - `trainer_chat` runs first, returns Andrea's coaching response
   - `submission_review` runs second, receives the full conversation (including Andrea's response) as context
   - `submission_review` returns structured feedback with two categories: `requiredToProgress` (blocking) and `areasToStrengthen` (non-blocking)
   - Update UI to present these categories with distinct visual treatments

7. **Update Session 1 success criteria** per 3.15.26a notes:
   - Module 1-1: Remove "articulate difference" criterion
   - Module 1-2: Remove "explain thread difference" criterion; simplify thread detection
   - Module 1-3: Broaden "real work task" to "work-related task"; add Dirty Paste pattern
   - Module 1-4: Tighten "usable output" criterion with specific measurable conditions
   - Module 1-6: Simplify review criteria; add UX guidance for version comparison

8. **Verify banking still works end-to-end** after refactors

### Day 2 (Tuesday, March 17): Generation Pipeline + Healthcare Config

**Goal:** Healthcare content generates correctly. Edge functions accept industry context.

**Tasks:**

1. **Author healthcare industry config:**
   - Roles: Director of Clinical Operations, VP Revenue Cycle, Chief Nursing Officer, Chief Medical Officer, VP Quality & Patient Safety, Director of IT/Digital Health, VP Compliance/Privacy, Director of HR/Workforce Development, CFO/Finance Director
   - Departments: Clinical Operations, Revenue Cycle Management, Quality & Patient Safety, Compliance & Privacy (HIPAA), Health Information Technology, Nursing Administration, Medical Staff Services, Finance & Accounting, Human Resources & Workforce Development
   - Andrea persona: healthcare-native vocabulary (care transitions, clinical workflows, EHR, HIPAA, Joint Commission, CMS, patient outcomes, readmission rates, value-based care)
   - Compliance context: HIPAA, HITECH, Joint Commission, CMS, state licensing boards, PHI handling, BAAs
   - Scenario generation context: rich paragraph covering typical healthcare leadership AI use cases

2. **Build `generate-module-content` edge function:**
   - Input: module pedagogy + industry config + department + role
   - Output: examples (good/bad prompts), practice scenario, hints, success criteria
   - Uses Claude with structured output
   - Writes to `generated_module_content` cache table

3. **Create `generated_module_content` Supabase migration:**
   - Columns: `id`, `industry_slug`, `department_slug`, `module_id`, `curriculum_version`, `content` (JSONB), `created_at`
   - Unique constraint on `(industry_slug, department_slug, module_id, curriculum_version)`

4. **Update banking-hardcoded edge functions** to accept `industrySlug` parameter:
   - `ai-practice`: replace hardcoded "banking professional" with dynamic industry context
   - `practice_chat`: add personalization (currently has zero context)
   - `submission_review`: make rubric examples industry-aware
   - `ai-trainer`: replace "banking professionals" with dynamic
   - `trainer_chat`: replace banking references with dynamic
   - `agent-test-chat`: replace "BANKING REALISM" with industry-appropriate realism
   - `workflow-test-chat`: same as above
   - `intake-prompt-score`: accept industry-specific micro-task instead of hardcoded banking task
   - `generate-lesson`: replace "financial institutions" with dynamic industry

5. **Pre-generate healthcare content** for Sessions 1-2 (all modules, all departments) by running the generation pipeline

### Day 3 (Wednesday, March 18): UI Copy, Platform Skin, Org Setup

**Goal:** A Parallon executive can create an account and see a fully healthcare-branded experience.

**Tasks:**

1. **Wire UI copy overrides** across all touchpoints:
   - Tour steps: "Bank Policies" -> resolved from `uiCopyOverrides.policiesLabel` (healthcare: "Organization Policies")
   - Certificate: "banking professionals" -> resolved from `uiCopyOverrides.certificateDescription`
   - Community feed: "banking professionals" and "loan review" -> resolved from overrides
   - Agent template builder: "Bank" -> resolved from `employerLabel`
   - Brainstorm panel: "loan applications" -> resolved placeholder
   - Andrea dock: greeting already generic (good)

2. **Verify ChatGPT practice UI skin:**
   - Confirm `useOrgPlatform` correctly returns `chatgpt` for Parallon org
   - Walk through the ChatGPT-style practice panel in Session 1 modules
   - Fix any visual issues

3. **Create Parallon org in Supabase:**
   - Organization name: "Parallon" (or whatever they'd want to see)
   - Industry: `healthcare`
   - Platform: `chatgpt`
   - Create registration codes for demo accounts
   - Set up department mappings

4. **Create demo user accounts:**
   - 2-3 accounts with different healthcare roles (Director Clinical Ops, VP Revenue Cycle, VP Quality)
   - Pre-complete onboarding on at least one account so demo can skip straight to training
   - Leave one account fresh for live onboarding walkthrough

5. **Test onboarding flow** with healthcare config:
   - Role selection shows healthcare roles
   - Department selection shows healthcare departments
   - Micro-task is healthcare-appropriate
   - Labels say "Organization Name" not "Bank Name"

### Day 4 (Thursday, March 19): Content Review + Integration Testing

**Goal:** The first 2 sessions of healthcare content are polished and demo-ready.

**Tasks:**

1. **Review AI-generated healthcare content** for Sessions 1-2:
   - Read through every generated scenario for clinical accuracy
   - Check that compliance references are correct (HIPAA, not BSA)
   - Verify role-specific scenarios match what a Parallon director would recognize
   - Hand-tune any scenarios that miss the mark -- update the cached content directly

2. **Full demo path walkthrough** (fresh account):
   - Sign up with registration code
   - Complete onboarding (role selection, department, micro-task)
   - Enter Session 1, Module 1-1 (Personalization)
   - Complete practice chat, submit, pass quality gate
   - Continue through 2-3 more modules
   - Verify Andrea coaching uses healthcare vocabulary
   - Check that the practice panel has ChatGPT UI treatment

3. **Edge case testing:**
   - What happens when a module's generated content hasn't been cached yet? (Should trigger generation, show loading state)
   - What happens if generation fails? (Should fall back to generic content, not crash)
   - Does the banking experience still work? (Regression check)

4. **Fix any remaining banking references** found during walkthrough

### Day 5 (Friday, March 20): Polish + Demo Prep

**Goal:** Demo is bulletproof. Fallback talking points are ready.

**Tasks:**

1. **Final end-to-end test** with fresh Parallon account
2. **Prepare demo script:**
   - Which account to use for the walkthrough
   - Which modules to show (focus on Session 1 -- Personalization, First Prompt, Basic Interaction)
   - Talking points for features that aren't fully healthcare-adapted yet (later sessions, agent studio, workflow builder)
   - How to frame the AI-generated content approach as a feature, not a shortcut
3. **Prepare registration codes** for executives to explore on their own after the meeting
4. **Buffer time** for last-minute fixes

---

## Edge Functions: Change Summary

| Function | Banking Today | Change Required | Priority |
|----------|-------------|----------------|----------|
| `ai-practice` | Hardcoded "banking professional," OCC/FDIC | Accept `industrySlug`, resolve context dynamically | HIGH -- used in every practice chat |
| `practice_chat` | Hardcoded banking, zero personalization | Add full personalization + industry context (mirror `ai-practice`) | HIGH -- currently broken for non-banking |
| `trainer_chat` | "Banking professional" in system prompt | Accept `industrySlug`, inject industry persona | HIGH -- Andrea's voice |
| `ai-trainer` | "Banking professionals" | Accept `industrySlug` | HIGH -- coaching context |
| `submission_review` | Banking rubric examples, bank policies | Accept `industrySlug`, make rubric examples dynamic | HIGH -- quality gates |
| `intake-prompt-score` | Hardcoded banking micro-task | Accept `microTask` from industry config | MEDIUM -- onboarding only |
| `generate-lesson` | "Financial institutions" | Accept `industrySlug` | MEDIUM -- lesson generation |
| `agent-test-chat` | "BANKING REALISM" meta-instructions | Replace with industry-appropriate realism | LOW -- Session 3+ |
| `workflow-test-chat` | "BANKING REALISM" meta-instructions | Replace with industry-appropriate realism | LOW -- Session 5 |
| `generate-idea-preview` | None | No change needed | N/A |
| `embed_chunks` | None | No change needed | N/A |
| `extract-agent-knowledge` | None | No change needed | N/A |
| `seed_lesson_chunks` | None | No change needed | N/A |
| `speech-to-text` | None | No change needed | N/A |
| `parse-policy-document` | None | No change needed | N/A |
| `admin-create-user` | None | No change needed | N/A |
| `admin-delete-user` | None | No change needed | N/A |

---

## Data Files: Change Summary

| File | Current State | Target State |
|------|-------------|-------------|
| `industryConfigs.ts` | Has banking + healthcare configs but missing roles, departments, compliance context | Expanded to be the single source of truth for all industry-specific metadata |
| `intakeQuestions.ts` | Hardcoded banking roles and SJT questions | Role options keyed by industry; SJT questions either industry-keyed or AI-generated |
| `topics.ts` | Hardcoded banking departments | Department definitions keyed by industry (or moved into `industryConfigs.ts`) |
| `roleScenarioBanks.ts` | Hardcoded banking scenarios per module | Becomes banking's cached content; new industries use generated content |
| `trainingContent.ts` | Banking examples embedded in pedagogy | Core pedagogy preserved; industry-specific examples/scenarios served from generation cache |
| `proficiencyAssessment.ts` | Banking assessment questions | Industry-keyed assessment questions |
| `tourSteps.ts` | "Bank Policies" and banking references | Dynamic labels from `uiCopyOverrides` |

---

## Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|-----------|
| AI-generated healthcare scenarios miss domain nuance | Parallon directors notice something off | Pre-generate and hand-review all Session 1-2 content before demo; keep generation context rich |
| Generation pipeline not ready in time | No healthcare content for demo | Fallback: hand-author 5-6 key scenarios for the modules shown in demo |
| Refactoring breaks banking experience | Existing banking clients affected | Run banking regression tests after every refactor step |
| ChatGPT UI skin has issues | Practice panel looks wrong in demo | Test early (Day 3), fix before Day 5 |
| Registration/onboarding flow has edge cases | Demo signup fails live | Pre-create accounts; have backup credentials ready |
| Sequential gate model is too strict for demo | Parallon exec gets stuck on a module during hands-on exploration | Ensure gate criteria for demo modules are achievable by engaged learners; have admin override ready |
| Sequential trainer_chat -> submission_review adds latency | Learner waits longer after submitting | Manage expectations in UI with a "reviewing your work..." state; combined latency should be <10 seconds |
| Module 1-4 -> 1-5 carryover introduces state complexity | Context fails to load, learner sees empty Module 5 | Graceful fallback: if prior context unavailable, Module 5 works standalone with a prompt to recall prior work |
| Nuanced pass/fail rubric produces inconsistent results across industries | Healthcare learner passes too easily or fails unfairly compared to banking | Pre-test rubric calibration with sample healthcare submissions before demo; tune weights if needed |
| Day 1 scope is heavy (architecture + gate redesign + criteria updates) | Work cascades into Day 2 | Gate redesign and architecture work are independent tracks that can be parallelized if multiple developers available; criteria updates are config changes that can be done quickly |

---

## Admin Role Separation

### Super Admin (SM Advisors -- Cory)

Owns the platform and onboards new organizations. This is the product configuration layer.

**Org Setup Wizard (in-app):**
1. **Basics**: Org name, primary contact email, audience type (enterprise/consumer)
2. **Industry**: Select from registry (banking, healthcare, insurance, etc.) -- auto-populates available departments, roles, Andrea persona
3. **Platform**: Which AI tool the org uses (ChatGPT, Claude, Copilot, default) -- sets practice UI skin and model routing
4. **Feature Flags**: Which zones and features are enabled (Community, Agents, Electives, etc.)
5. **Review & Activate**: Summary screen, confirm, org goes live

Super admin can also: view cross-org analytics, manage the industry registry, manage curriculum versions, deactivate orgs.

### Org Admin (Client's Administrator)

Manages their organization within the boundaries the super admin configured. Operational scope only.

**Org Admin responsibilities:**
- **Departments**: Toggle which of the industry's departments are active for their org; a large healthcare system might enable all nine, a smaller one might only need three
- **Registration & Access**: Generate and manage registration codes (single-use or multi-use), set user caps, control self-registration vs. invite-only
- **User Management**: Add/remove users, view individual progress, assign departments and roles to users
- **Progress Dashboard**: Completion rates, engagement metrics, skill signal aggregates for their org
- **Policy Management**: Upload org-specific documents (compliance policies, internal guidelines)
- **Community Moderation**: Review queue for their org's community posts

**Org Admin cannot:** Change industry, change platform, modify feature flags, access other orgs, modify curriculum structure. Those are super admin decisions.

### Current State vs. Target

| Capability | Current Owner | Target Owner |
|-----------|--------------|-------------|
| Create org | Super admin (in Supabase) | Super admin (in-app wizard) |
| Set industry | Super admin (in Supabase) | Super admin (in-app wizard) |
| Set platform | Super admin (in Supabase) | Super admin (in-app wizard) |
| Feature flags | Super admin (in Supabase) | Super admin (in-app wizard) |
| Manage departments | Admin (DepartmentsManager) | Org admin |
| Registration codes | Admin (partially built) | Org admin |
| User management | Admin (UsersManagement) | Org admin |
| Progress dashboard | Admin (ProgressDashboard) | Org admin |
| Policy uploads | Admin (OrgResourcesManager) | Org admin |
| Community moderation | Admin (CommunityReviewQueue) | Org admin |

---

## Future Edge Layers (Not in Scope for This Sprint)

These are anticipated but not built now:

- **Role-depth layer**: Teller vs. VP get different scenario complexity within the same industry
- **Content versioning**: Client A on curriculum v2, Client B on v3
- **Regulatory region**: State-specific compliance requirements
- **Deployment model**: Self-hosted vs. SaaS differences
- **Branding layer**: Per-org logo, color scheme, custom Andrea avatar
- **Language/localization**: Non-English content generation
