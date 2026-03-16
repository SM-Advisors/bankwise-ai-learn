# TRD: SMILE Curriculum — Module Progression, Success Criteria & Assessment Logic

## Context

This document maps the complete progression system for the SMILE (Bankwise AI Learn) training platform. It covers:
1. Every session and module with its success criteria
2. How the web app assesses whether a user met those criteria (gate logic)
3. The module locking/unlocking mechanism that controls progression

---

## 1. Architecture Overview

- **Frontend**: React + Vite + TypeScript
- **Backend**: Supabase (PostgreSQL + Edge Functions)
- **AI Assessment**: Anthropic Claude API via `submission_review` Edge Function
- **Progress Storage**: `training_progress` table with per-session JSONB columns

### Key Files
| File | Purpose |
|------|---------|
| `src/data/trainingContent.ts` | All session/module definitions with success criteria |
| `src/types/progress.ts` | ModuleEngagement, GateResult, SessionProgressData types |
| `src/utils/computeProgress.ts` | Progress computation (% complete, module states) |
| `src/pages/TrainingWorkspace.tsx` | Submission handler, gate evaluation, progress persistence |
| `src/components/training/ModuleListSidebar.tsx` | Module locking logic |
| `supabase/functions/submission_review/index.ts` | AI-powered rubric evaluation |
| `supabase/functions/trainer_chat/index.ts` | Andrea (coach) conversational feedback |

---

## 2. Module State Machine

Every module progresses through 5 states:

```
not_started → content_viewed → practicing → submitted → completed
```

Tracked via `ModuleEngagement` (stored in `training_progress.session_X_progress` JSONB):
- `contentViewed` / `contentViewedAt` — user opened the module content
- `chatStarted` / `chatStartedAt` — user sent first practice message
- `practiceMessageCount` — number of practice messages sent
- `submitted` / `submittedAt` — user submitted for review
- `completed` / `completedAt` — module marked complete (gate passed)
- `gatePassed` / `gateAttempts` / `lastGateResult` — quality gate tracking

---

## 3. Gate Module Mechanism

### What Are Gate Modules?
Certain modules are flagged with `isGateModule: true`. These are **quality checkpoints** that block progression until the user demonstrates competence.

### Gate Modules in the Curriculum
| Module | Session | Title |
|--------|---------|-------|
| 1-3 | Session 1 | Basic Interaction |
| 1-4 | Session 1 | Your First Win |
| 2-3 | Session 2 | Structured Prompting (CLEAR Framework) |
| 3-3 | Session 3 | Build a Basic Agent |

### Locking Logic (`ModuleListSidebar.tsx`)
A module is **locked** if any **prior gate module** in the same session has not been passed:

```
For each module before the current one:
  If it is a gate module AND not passed → current module is LOCKED
```

Gate modules themselves are never locked — they are always accessible for reattempt.

### Gate Pass/Fail Decision

**On submission** (`TrainingWorkspace.tsx`):
1. Practice conversation transcript is sent to both `trainer_chat` and `submission_review` in parallel
2. `submission_review` returns a `GateResult`:
   - `passed: boolean`
   - `criteriaMetCount: number`
   - `criteriaTotalCount: number`
   - `gateMessage: string`
3. **Pass threshold**: `criteriaMetCount >= 60% of criteriaTotalCount` (rounded up) AND no critical compliance issues
4. If gate result unavailable (edge function failure):
   - Gate modules: **fail** (require explicit pass)
   - Non-gate modules: **pass by default**

---

## 4. Assessment Logic — `submission_review` Edge Function

### How It Works
1. User submits practice conversation → transcript sent to `submission_review`
2. Function retrieves:
   - Lesson content chunks (RAG via pgvector embeddings)
   - Bank policies (compliance context)
   - User's learning style and proficiency level
3. Builds a prompt for Claude (Anthropic API) with:
   - Module-specific rubric (hardcoded per module ID)
   - Success criteria from the module definition
   - Learning style instructions (example-based, explanation-based, logic-based, hands-on)
   - Proficiency-adapted language (beginner/intermediate/advanced on 0-8 scale)
4. Claude evaluates the submission and returns structured JSON:
   - `feedback`: summary, strengths, issues, areasForImprovement, fixes, next_steps
   - `gateResult`: passed, criteriaMetCount, criteriaTotalCount, gateMessage

### Module-Specific Rubrics
The `submission_review` function contains **hardcoded 3-level rubrics** (Developing → Proficient → Advanced) for specific modules:
- **1-6** (Iteration): Iteration count, change specificity, output improvement, diagnosis skill
- **2-2** (Self-Review Loops): Two-prompt structure, checklist quality, criteria specificity, combined coverage
- **2-3** (Structured Prompting CLEAR): Context, Length/Format, Examples, Audience, Requirements, Banking relevance
- **2-6** (Multi-Shot): Example count/consistency, format invariants, compliance element, annotations, request specificity
- **2-8** (Chain-of-Thought): Step structure, cross-referencing, individual evaluation, confidence/justification, auditability
- **2-9** (Tool Selection): Task analysis, data privacy, fit vs. gap, custom vs. built-in, decision quality
- **2-10** (Session 2 Sandbox): Real work application, technique application, output quality, reflection
- **3-3** (Build Agent): Identity (20%), task list (25%), output rules (15%), guard rails (25%), compliance anchors (15%)
- **3-4** (Add Knowledge): Knowledge source selection, integration, specialist gap, accuracy/hallucination risk
- **3-5** (Add Files): File-processing capability evaluation

Modules **without** a specific rubric are evaluated against the general `successCriteria[]` array defined in `trainingContent.ts`.

---

## 5. Complete Session & Module Inventory with Success Criteria

### Session 1: Foundation & Early Wins (7 modules)
*Andrea Tier: Hand-Holding*

| # | Module | Type | Gate? | Est. Time | Success Criteria |
|---|--------|------|-------|-----------|-----------------|
| 1-1 | Personalization | exercise | No | 10 min | Profile includes specific role/department/employer context; At least one preference configured; Can articulate difference between generic and personalized response |
| 1-2 | Interface Orientation | document | No | 8 min | Sent at least one message and received response; Started a new conversation thread; Can explain difference between continuing and starting a thread |
| 1-3 | Basic Interaction | exercise | **Yes** | 20 min | Pasted or described a real work task (not a test prompt); Evaluated first response and identified at least one gap; Followed up at least twice to refine; Attempted Flipped Interaction Pattern or Outline Expander |
| 1-4 | Your First Win | exercise | **Yes** | 15 min | Selected a task directly relevant to actual work; Produced an output described as usable; Output reflects professional context; Iterated at least once to refine |
| 1-5 | The Flipped Interaction | exercise | No | 15 min | Used the Flipped Interaction Pattern on a real or realistic work task; Answered the AI's questions and received output based on those answers; Compared direct-ask output with flipped-interaction output; Identified at least one piece of context the AI surfaced unprompted |
| 1-6 | Iteration | exercise | No | 15 min | Completed at least 3 rounds of refinement on Module 4 output; At least one round changed format (not just content); Can describe how final is better than first; Reshaped mid-conversation rather than starting over |
| 1-7 | Sandbox | sandbox | No | 15 min | Initiated at least one task independently; Applied at least one technique from session; Completed a meaningful exchange |

### Session 2: Structured Interaction, Models & Tools (10 modules)
*Andrea Tier: Collaborative*

| # | Module | Type | Gate? | Est. Time | Success Criteria |
|---|--------|------|-------|-----------|-----------------|
| 2-1 | AI Limitations & Critical Evaluation | document | No | 15 min | Asked AI for specific factual claims and independently verified at least two; Identified at least one instance where AI was wrong or fabricated information (or confirmed all claims accurate through verification); Can describe the difference between tasks where AI is reliable vs. where verification is essential; Articulated how to build verification into professional workflow |
| 2-2 | Self-Review Loops | exercise | No | 15 min | Defined at least 2 specific review criteria relevant to output; Requested a self-critique from the AI using those criteria; Compared original and revised versions, articulated preference; Made independent judgment about which version is better and why |
| 2-3 | Structured Prompting (CLEAR) | exercise | **Yes** | 15 min | Wrote both casual and CLEAR-structured versions; Compared outputs and articulated difference; Identified at least one CLEAR element with biggest impact; Can explain when to use CLEAR vs. casual |
| 2-4 | Output Templating | exercise | No | 15 min | Defined output template before writing the ask; Template includes at least 3 distinct sections or format specifications; Output closely matches template; Can explain why template-first is better |
| 2-5 | Outline Expander | exercise | No | 15 min | Provided a rough outline or skeleton to the AI; AI expanded each section with relevant content; Combined Outline Expander with output templating for maximum control; User controlled shape while delegating substance |
| 2-6 | Multi-Shot Prompting | exercise | No | 15 min | Provided at least one example of existing work; AI output matched style/tone/format of examples; Identified element examples communicated that words could not; Can explain when multi-shot is more efficient |
| 2-7 | Model Selection | document | No | 12 min | Ran same task through two different model modes; Articulated specific difference in output quality; Identified at least one task for each mode; Demonstrated discernment — not always choosing most powerful |
| 2-8 | Chain-of-Thought Reasoning | exercise | No | 20 min | Designed reasoning chain with at least 3 explicit steps; AI output followed step-by-step structure; Identified weakest step and articulated why; Challenged or refined at least one step |
| 2-9 | Tool Selection | exercise | No | 15 min | Identified at least 3 tasks and matched to tool/no-tool; Used at least one tool on a real task; Verified at least one tool-generated piece of info; Can explain why specific tool was right choice |
| 2-10 | Sandbox | sandbox | No | 15 min | Applied at least two Session 2 techniques in combination; Used at least one tool on a task; Can articulate which techniques most useful for role |

### Session 3: Agents (7 modules)
*Andrea Tier: Peer*

| # | Module | Type | Gate? | Est. Time | Success Criteria |
|---|--------|------|-------|-----------|-----------------|
| 3-1 | Why Agents Exist | document | No | 12 min | Interacted with pre-built agent and observed behavior; Can articulate at least one difference between agent and default conversation; Identified at least one task where agent might add value |
| 3-2 | The Four Levels | document | No | 10 min | Mapped at least one task to each of four levels; Identified which level to start building at; Can explain why Level 2 is recommended starting point |
| 3-3 | Build a Basic Agent | exercise | **Yes** | 25 min | Defined specific job for agent (not general assistant); Instructions include role, scope, style, constraints; Tested agent with at least one real task; Iterated on instructions based on test results; Agent produces consistent output on repeated tests |
| 3-4 | Add Knowledge | exercise | No | 15 min | Added at least one knowledge document; Tested agent with/without knowledge, observed difference; Agent output references knowledge; Can explain how knowledge changed quality |
| 3-5 | Add Files | exercise | No | 15 min | Uploaded at least one file; Agent processed file using instructions/knowledge; Tested at least two different interactions; Identified at least one way to improve file handling |
| 3-6 | Add Tool Access | exercise | No | 15 min | Connected at least one tool; Agent used tool to complete a task; Verified output; Can explain difference between advisor and executor agent |
| 3-7 | Sandbox / Capstone | sandbox | No | 25 min | Designed agent for real work use case; Agent has instructions + one additional layer; Tested with realistic inputs, iterated once; Can articulate improvements; Describes agent as something they plan to actually use |

### Session 4: Functional Agents (5 modules)
*Andrea Tier: Advisor*

| # | Module | Type | Gate? | Est. Time | Success Criteria |
|---|--------|------|-------|-----------|-----------------|
| 4-1 | What Are Functional Agents | document | No | 10 min | Identified at least 3 tools with functional AI; Can describe what each functional agent does; Identified at least one task for this week |
| 4-2 | AI in Your Spreadsheet | exercise | No | 20 min | Generated at least one formula using AI; Created at least one visualization using AI; Verified at least one AI output for accuracy; Identified at least one limitation/error |
| 4-3 | AI in Your Presentations | exercise | No | 20 min | Generated outline or slide content using AI; Created speaker notes for at least one slide; Reviewed content and identified improvements; Can describe when AI saves time vs. doesn't |
| 4-4 | AI in Your Inbox | exercise | No | 15 min | Drafted at least one email response using AI; Adjusted AI draft for tone/accuracy/context; Can identify one email type where AI saves time and one where it shouldn't be used |
| 4-5 | Sandbox | sandbox | No | 15 min | Explored at least one functional agent in depth; Identified most time-saving AI feature for role; Can describe workflow combining custom and functional agents |

### Session 5: Build Your Frankenstein (5 modules)
*Andrea Tier: Advisor*

| # | Module | Type | Gate? | Est. Time | Success Criteria |
|---|--------|------|-------|-----------|-----------------|
| 5-1 | Map Your Stack | exercise | No | 15 min | Mapped multi-step workflow with at least 5 steps; Each step has inputs, outputs, current owner; Classified each step as Automate, Assist, or Human; Identified at least 2 steps where AI adds value |
| 5-2 | Design Your Workflow | exercise | No | 25 min | Designed workflow with at least 3 steps; Includes at least one human review checkpoint; Each step has trigger, input, AI component, output; Can walk through with realistic scenario |
| 5-3 | Stitch It Together | exercise | No | 20 min | Connected at least 2 components into working workflow; Ran workflow end-to-end with realistic scenario; Documented what worked and broke; Identified highest-impact improvement |
| 5-4 | Prototype & Test | exercise | No | 20 min | Fixed at least one issue from E2E testing; Re-ran workflow after fixes, verified improvement; Made judgment call on readiness; Documented remaining known issues |
| 5-5 | Present & Reflect | sandbox | No | 15 min | Presented clear description of AI stack; Includes problem solved and value provided; Reflected on learning across all 5 sessions; Identified at least one concrete next step |

---

## 6. Knowledge Checks — Retrieval Practice

Each session ends with knowledge check questions that prime retrieval and connect to the next session:

### Session 1
- What is the Flipped Interaction Pattern, and when would you use it?
- Describe the difference between the first AI response and a useful final output — what happens in between?
- What is the Dirty Paste technique, and why is it an effective way to start an AI interaction?

### Session 2
- Name the 5 elements of the CLEAR Framework and what each stands for.
- What is the difference between output templating and multi-shot prompting? When would you use each?
- Describe a situation where you would choose a reasoning model over the default model.

### Session 3
- What are the Four Levels of AI interaction? Give a one-sentence description of each.
- What is the difference between an agent's knowledge and the files a user provides?
- Describe what changes when an agent gets tool access — how does its role shift?

### Session 4
- Name one functional agent available in your tool stack and describe a task you used it for.
- What is the difference between a custom agent (Session 3) and a functional agent (Session 4)?
- Describe a workflow where you would combine a custom agent with a functional agent.

---

## 7. How Assessment Actually Works — End-to-End Flow

```
User completes practice chat
        ↓
Clicks "Submit for Review"
        ↓
TrainingWorkspace.handleSubmitForReview()
        ↓
┌─────────────────────────────┐  ┌──────────────────────────────┐
│ trainer_chat (Andrea)       │  │ submission_review (Rubric)    │
│ - Conversational feedback   │  │ - Structured JSON evaluation  │
│ - Coaching suggestions      │  │ - GateResult (pass/fail)      │
│ - Memory/level suggestions  │  │ - criteriaMetCount            │
└─────────────────────────────┘  └──────────────────────────────┘
        ↓                                    ↓
Both responses merged into trainer chat panel
        ↓
Gate evaluation:
  - gateResult exists? → Use gateResult.passed
  - gateResult missing + gate module? → FAIL (block)
  - gateResult missing + non-gate module? → PASS (allow)
        ↓
If passed:
  - Module added to completedModules
  - Skill signals derived from feedback
  - Progress persisted to training_progress DB
        ↓
If failed:
  - gateMessage displayed to user
  - gateAttempts incremented
  - User can retry (no limit on attempts)
```

### Pass Threshold (from submission_review)
```
passed = criteriaMetCount >= ceil(criteriaTotalCount * 0.6)
         AND no critical compliance issues
```

The `criteriaTotalCount` equals the number of learning objectives for the module. The AI evaluates each objective against the submission transcript.

### Important Distinction in Feedback
- **issues**: Things that directly fail task criteria for THIS module → block progression
- **areasForImprovement**: General best practices, advanced techniques → informational only, do NOT block

---

## 8. Session-Level Completion

- Session progress = `completedModules.length / totalModules * 100`
- Overall progress = weighted average across all sessions by module count
- `session_X_completed` boolean set when all modules in session are completed
- `current_session` in `user_profiles` updated on session completion

---

## 9. Skill Signal System (Background)

After each submission, `deriveSkillSignals()` extracts skill observations:
- Strengths in feedback → `proficient` level
- Issues in feedback → `emerging` level
- Mapped to 8 skill categories: context_setting, specificity, data_security, formatting, compliance, clear_framework, iteration, audience_awareness

These are stored in `skillSignals[]` within session progress and also in `skill_observations` table.

---

## 10. Department-Specific Scenarios

Modules in Sessions 1-3 include `departmentScenarios` with custom scenarios and hints for:
- Commercial Lending
- Retail Banking
- Compliance
- Risk Management
- Operations

The scenario context is passed to `submission_review` for role-aware evaluation.

---

## Verification Plan

To verify this document's accuracy:
1. Read `src/data/trainingContent.ts` and confirm all modules/criteria match
2. Read `src/pages/TrainingWorkspace.tsx` for submission flow
3. Read `supabase/functions/submission_review/index.ts` for rubric definitions
4. Read `src/components/training/ModuleListSidebar.tsx` for lock logic
5. Read `src/types/progress.ts` for type definitions
