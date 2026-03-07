# Session Handoff

**Date:** 2026-03-07
**Branch:** `claude/review-ux-improvements-HNOiv`
**Status:** In Progress — Awaiting merge of useBlocker fix

## Goal
Fix a persistent production crash on the SMILE platform that prevents users from logging in. The app crashes immediately after authentication, showing a blank white screen.

## What Was Done
- **Diagnosed the crash** through multiple rounds of investigation across PRs #19-#23
- **PR #19** — Added error details to ErrorBoundary to surface the actual error
- **PR #20** — Fixed race condition: kept `loading=true` in AuthProvider until profile data loads, preventing premature render of Onboarding before data is ready
- **PR #21** — Added null guards and improved crash diagnostics throughout the auth/onboarding flow
- **PR #22** — Merged diagnostics + null guards (commits from PRs 20-21)
- **PR #23** — Test coverage analysis (unrelated)
- **The critical fix (current PR)** — Removed `useBlocker` from `Onboarding.tsx`. This React Router hook requires `createBrowserRouter` but the app uses `<BrowserRouter>`, causing an invariant error on every render. This is the root cause of the persistent crash.

## Key Decisions
- `useBlocker` was removed entirely rather than migrating to `createBrowserRouter`, because:
  - The `beforeunload` event handler already prevents accidental browser close/back
  - The onboarding page has no navigation bar, so in-app navigation away isn't possible
  - Migrating the entire app's router would be a much larger change
- Multiple PRs were needed because the error message was empty (`Error()` with no argument), making diagnosis difficult

## Current State
The branch has 1 commit rebased on latest main: `8911f0d fix: remove useBlocker that crashes with BrowserRouter in production`. It needs to be merged to main via PR. **The user reported the app is still not working after merging PR #22** — that's because the useBlocker fix was pushed after they merged.

### Uncommitted Changes
None — all changes committed and pushed.

## Open Issues
- The useBlocker fix PR needs to be merged to main — this is the fix that should resolve the crash
- If the crash persists after merging, the next diagnostic step would be to check the browser console for the exact error, as there may be additional issues

## Next Steps
1. User merges the current PR (useBlocker fix) to main
2. Test login flow on production after Lovable auto-deploys
3. If still crashing, check browser console for the specific error message
4. If working, move on to next features/improvements

## Key Files
- `src/components/onboarding/Onboarding.tsx` — The file with the useBlocker removal (the critical fix)
- `src/components/auth/AuthProvider.tsx` — Auth state management, loading guard
- `src/components/ErrorBoundary.tsx` — Error display component
- `src/App.tsx` — Router setup (uses `<BrowserRouter>`, not `createBrowserRouter`)

## Context for Next Session
- **Root cause pattern**: React Router's `useBlocker` throws a bare `Error()` (no message) when used with `<BrowserRouter>` instead of `createBrowserRouter`. This made diagnosis extremely difficult since error boundaries showed an empty error.
- **Product name**: SMILE (Smart, Modular, Intelligent Learning Experience for AI). Domain: `smile.smaiadvisors.com`.
- **Brand**: SM Advisors, navy (#202735) + orange (#dd4124), Inter/Playfair Display fonts.
- **Deployment**: GitHub push to main -> Lovable auto-deploys frontend.
- **`gh` CLI** is unavailable in this environment; user creates/merges PRs via GitHub web UI.
- **`as any` casts**: Necessary because Lovable's auto-generated types don't include manually-created tables.
- **Git workflow**: Branch naming must follow `claude/...` pattern. Push with `git push -u origin <branch>`.
- Previous handoff content (curriculum v2.0 roadmap) has been explicitly discarded by the user — do not reference it.
