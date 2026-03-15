# Comprehensive Testing Plan

**Last updated:** 2026-03-15
**Test framework:** Vitest 3.2.4 + Testing Library 16.0.0 + jsdom
**Current state:** 15 test files, 278 tests, all passing

---

## Current Coverage

| Test File | Tests | Status |
|-----------|-------|--------|
| `src/utils/__tests__/intakeScoring.test.ts` | 31 | PASS |
| `src/utils/__tests__/computeProgress.test.ts` | 30 | PASS |
| `src/utils/__tests__/deriveSkillSignals.test.ts` | 18 | PASS |
| `src/utils/__tests__/spacedRepetition.test.ts` | 19 | PASS |
| `src/utils/__tests__/andreaTriggerStorage.test.ts` | 9 | PASS |
| `src/utils/__tests__/moduleProgression.test.ts` | 65 | PASS |
| `src/contexts/__tests__/calculateLearningStyle.test.ts` | 11 | PASS |
| `src/lib/__tests__/models.test.ts` | 8 | PASS |
| `src/data/__tests__/trainingContent.test.ts` | 11 | PASS |
| `src/data/__tests__/spacedRepetitionBank.test.ts` | 10 | PASS |
| `src/data/__tests__/proficiencyAssessment.test.ts` | 31 | PASS |
| `src/config/__tests__/zones.test.ts` | 11 | PASS |
| `src/hooks/__tests__/useFeatureGates.test.tsx` | 17 | PASS |
| `src/test/comprehensive-hooks.test.tsx` | 6 | PASS |
| `src/test/example.test.ts` | 1 | PASS |

### What's Covered

**Utility functions (Phase 1 — complete):**
- `scoreIntake()` — all placement levels, override flags, q9 scoring, step5 heuristics, output shape
- `computeProgress` — all 5 exported functions: `getModuleState`, `computeSessionProgress` (weighted engagement states), `computeOverallProgress`, `getSessionModuleCounts`, `getModuleStates`
- `deriveSkillSignals` — skill signal derivation, aggregation, display name mapping, precedence rules
- `spacedRepetition` — question selection with priority buckets, deduplication, formatting

**Hook smoke tests:**
- 5 hooks verified to not deadlock in loading state when unauthenticated

---

## Codebase Size

| Category | Count |
|----------|-------|
| Components | ~121 |
| Pages | ~29 |
| Hooks | ~41 |
| Utils | 6 |
| Data modules | 10 |
| Contexts | 3 |

---

## Phase 2: Pure Functions & Config (No Mocking Needed)

**Estimated tests: 25–35**
**Effort: Low**

### 2.1 `calculateLearningStyle()` — TrainingContext.tsx

This pure function is defined inside `src/contexts/TrainingContext.tsx` but not exported. Extract it to a utility or test via module internals.

**Tests needed:**
- Clear winner: one style has highest score
- Tie-breaking priority: logic-based > hands-on > explanation-based > example-based
- Empty answers array returns default style
- Single answer maps correctly
- All styles tied — returns logic-based (highest priority)

**File:** `src/contexts/__tests__/calculateLearningStyle.test.ts`

### 2.2 `getModelById()` — lib/models.ts

**Tests needed:**
- Returns correct `ModelDefinition` for each known model ID
- Returns `undefined` for unknown model IDs
- `DEFAULT_MODEL` exists in `AVAILABLE_MODELS`
- All models have required fields (id, name, provider, description)
- `PROVIDER_COLORS` has an entry for every provider in `AVAILABLE_MODELS`

**File:** `src/lib/__tests__/models.test.ts`

### 2.3 `andreaTriggerStorage` — utils/andreaTriggerStorage.ts

**Tests needed:**
- `hasFiredThisSession()` returns false initially, true after `markFiredThisSession()`
- `isDismissed(key)` returns false initially, true after `markDismissed(key)`
- Different keys are independent
- Uses sessionStorage for session-scoped and localStorage for persistent flags

**File:** `src/utils/__tests__/andreaTriggerStorage.test.ts`

---

## Phase 3: Data Integrity (No Mocking Needed)

**Estimated tests: 20–30**
**Effort: Low**

### 3.1 `trainingContent.ts` — Structural Validation

**Tests needed:**
- Every session in `ALL_SESSION_CONTENT` has at least one module
- Every module has required fields: `id`, `title`, `type`, `content`
- Every module's `content` has: `overview`, `keyPoints`, `practiceTask`
- Module IDs follow format `{session}-{number}` (e.g., `1-1`, `2-3`)
- No duplicate module IDs across all sessions
- Gate modules (`isGateModule: true`) exist at expected positions (1-3, 1-4, 2-1, 3-3)
- Every `practiceTask` has `instructions` and `successCriteria`

**File:** `src/data/__tests__/trainingContent.test.ts`

### 3.2 `spacedRepetitionBank.ts` — Question Bank Validation

**Tests needed:**
- All questions have required fields: `id`, `moduleId`, `sessionId`, `skill`, `question`, `keyAnswer`
- No duplicate question IDs
- Every `moduleId` references a valid module in `ALL_SESSION_CONTENT`
- Every `sessionId` references a valid session
- All `skill` values are recognized by `SKILL_DISPLAY_NAMES` in deriveSkillSignals

**File:** `src/data/__tests__/spacedRepetitionBank.test.ts`

### 3.3 `proficiencyAssessment.ts` — Assessment Validation

**Tests needed:**
- `PROFICIENCY_QUESTIONS` all have: `id`, `question`, `options` with scores
- `PERFORMANCE_ITEMS` all have: `id`, `type`, required type-specific fields
- Multi-select items have `correctIds` and `distractorIds` that don't overlap
- Drag-rank items have `correctOrder` covering all prompt IDs
- No duplicate question/item IDs
- `scoreProficiencyAssessment()` scoring math: self-report avg × 0.5 + performance normalized × 0.5

**File:** `src/data/__tests__/proficiencyAssessment.test.ts`

### 3.4 `zones.ts` — Zone Config Validation

**Tests needed:**
- All zones have required fields: `id`, `title`, `path`, `icon`, `unlockCondition`
- `ZONE_BY_ID` contains every zone from `LEARNER_ZONES`
- All `unlockCondition` values are valid `UnlockCondition` type members
- Zone paths are unique
- Zone IDs are unique

**File:** `src/config/__tests__/zones.test.ts`

---

## Phase 4: Feature Gates (Mocked Auth Context)

**Estimated tests: 15–20**
**Effort: Medium — requires mocking `useAuth`**

### 4.1 `useFeatureGates()` — hooks/useFeatureGates.ts

**Tests needed:**
- `'always'` condition is always unlocked
- `'onboarding_completed'` checks `profile.onboarding_completed`
- `'session_1_module_2_done'` checks module 1-2 completion in progress
- `'session_1_basic_interaction_done'` checks module 1-3 completion
- `'first_practice_done'` checks any `chatStarted` in engagement data
- `'session_1_completed'` checks `progress.session_1_completed`
- `'session_3_agent_deployed'` checks Supabase agent count
- Unknown condition returns false
- `unlockedZones` filters `LEARNER_ZONES` correctly
- `canAccessLearn`, `canAccessExplore`, `canAccessCommunity`, `canAccessProfile` derive from zone unlock state

**File:** `src/hooks/__tests__/useFeatureGates.test.tsx`

---

## Phase 5: Auth Context Integration (Mocked Supabase)

**Estimated tests: 15–20**
**Effort: Medium-High — requires Supabase client mock**

### 5.1 `AuthContext` — contexts/AuthContext.tsx

**Tests needed:**
- `signOut()` clears all state (user, session, profile, progress, viewAsOrg)
- `signUp()` creates profile and progress records
- `signIn()` rejects deactivated users (`profile.is_active === false`)
- `effectiveOrgId` returns `viewAsOrg.id` when set, falls back to `profile.organization_id`
- `markSessionCompleted(n)` advances `current_session` when applicable
- `refreshProfile()` re-fetches profile and progress from DB
- `updateProfile()` persists partial updates
- `setViewAsOrg()` / `clearViewAsOrg()` toggle org override

**File:** `src/contexts/__tests__/AuthContext.test.tsx`

---

## Phase 6: Component Tests (Mocked Auth + Router)

**Estimated tests: 10–15**
**Effort: Medium**

### 6.1 `ProtectedRoute` — components/ProtectedRoute.tsx

**Tests needed:**
- Redirects to `/auth` when no user
- Redirects to `/onboarding` when `requireOnboarding=true` and onboarding not completed
- Renders children when authenticated and onboarding completed
- Shows loading spinner while auth is loading

### 6.2 `ErrorBoundary` — components/ErrorBoundary.tsx

**Tests needed:**
- Catches render errors and displays fallback UI
- Does not interfere with normal rendering

**Files:**
- `src/components/__tests__/ProtectedRoute.test.tsx`
- `src/components/__tests__/ErrorBoundary.test.tsx`

---

## Proposed File Structure

```
src/
├── utils/__tests__/
│   ├── intakeScoring.test.ts          ✅ Done (31 tests)
│   ├── computeProgress.test.ts        ✅ Done (30 tests)
│   ├── deriveSkillSignals.test.ts     ✅ Done (18 tests)
│   ├── spacedRepetition.test.ts       ✅ Done (19 tests)
│   ├── andreaTriggerStorage.test.ts   ✅ Done (9 tests)
│   └── moduleProgression.test.ts     ✅ Done (65 tests)
├── contexts/__tests__/
│   ├── calculateLearningStyle.test.ts ✅ Done (11 tests)
│   └── AuthContext.test.tsx           ⬜ Phase 5
├── lib/__tests__/
│   └── models.test.ts                ✅ Done (8 tests)
├── config/__tests__/
│   └── zones.test.ts                 ✅ Done (11 tests)
├── data/__tests__/
│   ├── trainingContent.test.ts        ✅ Done (11 tests)
│   ├── spacedRepetitionBank.test.ts   ✅ Done (10 tests)
│   └── proficiencyAssessment.test.ts  ✅ Done (31 tests)
├── hooks/__tests__/
│   └── useFeatureGates.test.tsx       ✅ Done (17 tests)
├── components/__tests__/
│   ├── ProtectedRoute.test.tsx        ⬜ Phase 6
│   └── ErrorBoundary.test.tsx         ⬜ Phase 6
└── test/
    ├── example.test.ts                ✅ Done (1 test)
    └── comprehensive-hooks.test.tsx   ✅ Done (6 tests)
```

---

## Implementation Priority

| Phase | Scope | Est. Tests | Effort | Mocking |
|-------|-------|-----------|--------|---------|
| ~~1~~ | ~~Pure utilities~~ | ~~98~~ | ~~Done~~ | ~~None~~ |
| ~~2~~ | ~~Pure functions & config~~ | ~~28~~ | ~~Done~~ | ~~None~~ |
| ~~3~~ | ~~Data integrity validation~~ | ~~63~~ | ~~Done~~ | ~~None~~ |
| ~~4~~ | ~~Feature gates~~ | ~~17~~ | ~~Done~~ | ~~useAuth mock~~ |
| 5 | Auth context integration | 15–20 | Medium-High | Supabase mock |
| 6 | Component rendering | 10–15 | Medium | Auth + Router mocks |

**Phases 2, 3, and 4 are complete. Phases 5 and 6 remain for auth context integration and component rendering tests.**

---

## Running Tests

```bash
# Run all tests
npx vitest run

# Run specific file
npx vitest run src/utils/__tests__/computeProgress.test.ts

# Run with watch mode
npx vitest

# Run with coverage
npx vitest run --coverage
```
