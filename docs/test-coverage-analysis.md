# Test Coverage Analysis

## Current State

The codebase has **virtually zero test coverage**. There is a single placeholder test file (`src/test/example.test.ts`) that verifies `expect(true).toBe(true)`. The test infrastructure (Vitest + Testing Library + jsdom) is properly configured and ready for use, but no meaningful tests exist.

**Codebase size**: ~215 source files across 112 components, 27 pages, 36 hooks, 6 utility modules, 3 context providers, and 10 data modules.

---

## Priority 1: Pure Utility Functions (Highest ROI)

These modules contain complex business logic with zero external dependencies (no Supabase, no DOM). They are the easiest to test and the most dangerous to leave untested.

### 1.1 `src/utils/intakeScoring.ts` — CRITICAL

The intake placement scoring engine determines a user's proficiency level (1-4) based on questionnaire answers across 7 dimensions. It includes weighted scoring, multi-select logic, heuristic text analysis, and override flags (safe_use, consistency, governance, integrity).

**Why it matters**: A bug here silently misplaces learners into the wrong training level. There is no manual override in the learner flow — the score is authoritative.

**Recommended tests**:
- `scoreIntake()` with a full answer set producing each placement level (1, 2, 3, 4)
- Each override flag triggers correctly (safe_use_flag, consistency_flag, governance_flag, integrity_flag)
- `scoreQ9()` multi-select edge cases: empty array, single F, mixed high/low value
- `scoreStep5()` heuristic: empty/short prompt returns 0, minimal prompt scores low, detailed prompt with risk keywords scores high
- Consistency flag correctly drops D3 by 1 and recomputes average
- `clampLevel()` handles values outside 1-4 range

### 1.2 `src/utils/computeProgress.ts` — CRITICAL

Computes training progress percentages used throughout dashboards, navigation, and session completion logic. Includes weighted state progression and legacy backward compatibility.

**Recommended tests**:
- `getModuleState()`: each engagement state maps correctly (not_started, content_viewed, practicing, submitted, completed)
- `getModuleState()` with undefined engagement returns 'not_started'
- `computeSessionProgress()`: returns 0 for unknown session, 0 for empty modules, 100 when all completed
- `computeSessionProgress()`: partial engagement correctly weights (e.g., 3 of 5 modules at 'practicing' = 30%)
- Legacy `completedModules` array is honored when `moduleEngagement` is absent
- `computeOverallProgress()`: null progress returns 0, mixed completed/in-progress sessions
- `getSessionModuleCounts()`: correct counts per state
- `getModuleStates()`: returns correct state array including legacy fallback

### 1.3 `src/utils/deriveSkillSignals.ts` — HIGH

Derives skill proficiency signals from AI feedback by keyword matching. Used to build the learner's skill profile.

**Recommended tests**:
- `deriveSkillSignals()`: strengths produce 'proficient' signals, issues produce 'emerging' signals
- A skill appearing in both strengths and issues only gets 'proficient' (strengths take precedence)
- Empty strengths/issues arrays produce no signals
- Keywords are case-insensitive
- `aggregateSkillSignals()`: keeps highest level per skill, sorted by level priority
- Unknown skill names in display names fall back gracefully

### 1.4 `src/utils/spacedRepetition.ts` — HIGH

Spaced repetition scheduler that selects retrieval questions based on priority buckets (weak, unseen-recent, unseen-older, review-due).

**Recommended tests**:
- Returns empty array when no questions available
- Respects `maxQuestions` limit (default 2)
- Excludes questions from `currentModuleId`
- Weak questions (quality < 3) are prioritized over unseen
- Unseen questions from recent modules preferred over older
- Most recent response per question is used (deduplication)
- `formatRetrievalQuestionsForAndrea()`: empty array returns empty string, non-empty returns formatted block

---

## Priority 2: Context Providers & State Logic

### 2.1 `src/contexts/TrainingContext.tsx` — `calculateLearningStyle()`

The `calculateLearningStyle` function is a pure function inside the context file. It determines a user's learning style from questionnaire answers with a deterministic tie-breaking order.

**Recommended tests**:
- Clear winner: one style has highest score
- Tie-breaking priority: logic-based > hands-on > explanation-based > example-based
- Empty answers array
- Single answer

### 2.2 `src/contexts/AuthContext.tsx` — Integration Tests

The AuthProvider manages authentication state, profile creation, and progress tracking. While it depends on Supabase, the key flows can be tested with mocked Supabase client.

**Recommended tests** (with Supabase mock):
- `signOut()` clears all state (user, session, profile, progress, viewAsOrg)
- `signUp()` creates profile and progress records
- `signIn()` rejects deactivated users
- `effectiveOrgId` returns viewAsOrg.id when set, falls back to profile.organization_id
- `markSessionCompleted()` advances current_session when applicable

---

## Priority 3: Feature Gate & Config Logic

### 3.1 `src/hooks/useFeatureGates.ts`

Progressive disclosure logic that determines which zones are visible. Currently a thin wrapper over auth state, but the `isUnlocked()` function has branching logic that should be verified.

**Recommended tests** (with mocked useAuth):
- 'always' condition is always unlocked
- 'onboarding_completed' checks profile flag
- 'session_1_module_2_done' checks specific module completion
- 'first_practice_done' checks any practice chat started
- 'session_1_completed' checks progress flag
- Unknown condition returns false

### 3.2 `src/config/zones.ts`

Zone configuration data integrity — ensure all zones have valid unlock conditions and required fields.

### 3.3 `src/lib/models.ts`

- `getModelById()` returns correct model for known IDs
- `getModelById()` returns undefined for unknown IDs
- `DEFAULT_MODEL` exists in `AVAILABLE_MODELS`

---

## Priority 4: Data Module Integrity

### 4.1 `src/data/trainingContent.ts`

The training content data drives all session/module logic. Structural integrity tests catch silent data regressions.

**Recommended tests**:
- Every session has at least one module
- Every module has required fields (id, title, type, content)
- Every module's content has overview, keyPoints, practiceTask
- Module IDs follow expected format (e.g., "{session}-{number}")
- No duplicate module IDs across sessions

### 4.2 `src/data/proficiencyAssessment.ts` & `src/data/spacedRepetitionBank.ts`

- All questions have required fields (id, question, options/keyAnswer)
- No duplicate question IDs
- Module IDs reference valid modules

---

## Priority 5: Component Tests

### 5.1 `src/components/ProtectedRoute.tsx`

Critical routing guard. Should be tested with React Router + mocked auth context.

**Recommended tests**:
- Redirects to /auth when no user
- Redirects to /onboarding when requireOnboarding=true and onboarding not completed
- Renders children when authenticated and onboarding completed
- Shows loading spinner while auth is loading

### 5.2 `src/components/ErrorBoundary.tsx`

- Catches render errors and displays fallback UI
- Does not catch errors outside React tree

### 5.3 Key Form Components

- `ProficiencyAssessment.tsx`: quiz flow renders questions, accepts answers, submits correctly
- `KnowledgeCheckDialog.tsx`: knowledge check dialog handles answer selection and submission

---

## Proposed Test File Structure

```
src/
├── utils/
│   ├── __tests__/
│   │   ├── intakeScoring.test.ts
│   │   ├── computeProgress.test.ts
│   │   ├── deriveSkillSignals.test.ts
│   │   └── spacedRepetition.test.ts
├── contexts/
│   ├── __tests__/
│   │   ├── TrainingContext.test.tsx
│   │   └── AuthContext.test.tsx
├── hooks/
│   ├── __tests__/
│   │   └── useFeatureGates.test.tsx
├── lib/
│   ├── __tests__/
│   │   └── models.test.ts
├── data/
│   ├── __tests__/
│   │   ├── trainingContent.test.ts
│   │   └── spacedRepetitionBank.test.ts
├── components/
│   ├── __tests__/
│   │   ├── ProtectedRoute.test.tsx
│   │   └── ErrorBoundary.test.tsx
```

---

## Implementation Order

| Phase | Scope | Estimated Test Count | Effort |
|-------|-------|---------------------|--------|
| 1 | Pure utilities (intakeScoring, computeProgress, deriveSkillSignals, spacedRepetition) | ~40-50 tests | Low — no mocking needed |
| 2 | TrainingContext calculateLearningStyle + models.ts | ~10-15 tests | Low |
| 3 | Data integrity (trainingContent, question banks) | ~10-15 tests | Low |
| 4 | Feature gates + ProtectedRoute (mocked auth) | ~15-20 tests | Medium |
| 5 | AuthContext integration tests (mocked Supabase) | ~15-20 tests | Medium-High |
| 6 | Component rendering tests | ~10-15 tests | Medium |

**Phase 1 alone would cover the most critical business logic in the application and can be completed without any mocking infrastructure.**
