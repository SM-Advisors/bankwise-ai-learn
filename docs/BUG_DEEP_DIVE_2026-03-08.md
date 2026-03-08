# Bug Deep Dive (2026-03-08)

Scope reviewed: React frontend (`src/**`), Supabase edge functions (`supabase/functions/**`), and project health checks (lint/build/tests).

## Executive summary

I found multiple high-impact issues, including:
- **Authorization/tenant isolation risks** in edge functions that accept a caller-provided `userId` or update records with service-role privileges without ownership checks.
- **Authentication/session reliability bugs** in login behavior and auth routing.
- **UI loading-state deadlocks** in several hooks when no user is present.
- **Cross-account local data leakage risk** through shared `localStorage` fallback keys.

No fixes were applied in this pass.

---

## Findings

## 1) Critical: IDOR-style update path in `generate-idea-preview`

**Severity:** Critical  
**Area:** Edge function authz / data integrity

`generate-idea-preview` allows the client to choose `table` (`user_ideas` or `executive_submissions`) and then performs updates using a **service-role client**, but never verifies that the authenticated user owns the target row (or has admin permissions for executive rows). It updates by `id` only.

Risk:
- Any authenticated user who can invoke this function and knows/guesses an `ideaId` can potentially alter preview fields/status for records they do not own.

Evidence:
- Request accepts arbitrary `table` and `ideaId`.
- Service-role client is used for all updates.
- Updates run with `.eq("id", ideaId)` and no ownership/role check.

---

## 2) High: User identity spoofing fallback in `trainer_chat`

**Severity:** High  
**Area:** Edge function authn/authz

`trainer_chat` falls back to request-body `userId` when no valid auth token is present.

Risk:
- Caller can impersonate another user for rate-limit identity and context-loading attempts.
- Even where RLS blocks some reads, trust decisions and telemetry/rate-limiting can be poisoned.

Evidence:
- `userId` accepted in body.
- If bearer auth not resolved, function assigns `userId = bodyUserId`.

---

## 3) High: User identity spoofing fallback in `submission_review`

**Severity:** High  
**Area:** Edge function authn/authz

`submission_review` repeats the same fallback pattern as `trainer_chat`.

Risk:
- Same spoofing and policy bypass surface as above (identity-dependent logic/rate limiting/content personalization).

Evidence:
- `userId` accepted in body.
- If bearer auth not resolved, function assigns `userId = bodyUserId`.

---

## 4) High: “Remember me” behavior likely broken by hard-coded Supabase storage key

**Severity:** High  
**Area:** Auth/session UX correctness

After successful login with `rememberMe = false`, code removes a hard-coded key: `sb-tehcmmctcmmecuzytiec-auth-token`.

Risk:
- If the deployed Supabase project reference differs, the real auth key is not removed and session persists unexpectedly.
- This creates inconsistent/incorrect session behavior and possible shared-device privacy issues.

---

## 5) Medium: Auth route can render blank screen indefinitely for authenticated users with missing profile

**Severity:** Medium  
**Area:** Auth routing resiliency

`Auth` page returns `null` whenever `user || loading` is true. Redirect logic only runs when `user && !loading && profile`.

Risk:
- If user exists but profile is missing/null (row creation failure, migration mismatch, transient fetch issue), component can render nothing and never route the user to a recovery path.

---

## 6) Medium: Loading deadlocks in hooks when unauthenticated

**Severity:** Medium  
**Area:** Frontend state management / UX

Multiple hooks initialize `loading = true` and immediately `return` when user is absent, without clearing loading.

Examples:
- `useUserPrompts`: early return on `!user?.id` before `setLoading(false)`.
- `useElectiveProgress`: same pattern.
- `useUserIdeas`: same pattern.
- `useAIPreferences` and `useAIMemories`: same pattern.

Risk:
- Components consuming these hooks can show perpetual spinners in signed-out or session-transition states.

---

## 7) Medium: Cross-account local data leakage risk in localStorage fallbacks

**Severity:** Medium  
**Area:** Client data isolation

Fallback stores in `localStorage` use shared keys not scoped by user ID.

Examples:
- `bankwise_prompt_library`
- `bankwise_elective_${pathId}`

Risk:
- On shared browsers/devices, one user may see another user’s fallback content after sign-out/sign-in flows.

---

## 8) Quality risk: very low automated test coverage + heavy lint debt

**Severity:** Medium (project health risk)  
**Area:** Reliability engineering

- Test suite contains only a trivial `expect(true).toBe(true)` test.
- Lint currently reports hundreds of errors/warnings.

Risk:
- Regressions and hidden runtime bugs are likely to escape CI.

---

## Commands run

- `npm run lint`  → fails with 420 findings.
- `npm test`      → passes (single trivial test file).
- `npm run build` → passes with large chunk warning.
