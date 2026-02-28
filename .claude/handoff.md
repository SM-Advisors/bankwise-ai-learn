# Session Handoff

**Date:** 2026-02-28
**Branch:** `claude/workflow-idea-code-preview-8Hic5`
**Status:** In Progress — Needs Deploy + Validation

## Goal
Improve the "Build Preview" feature so that (1) generated previews persist across dialog close/reopen without regenerating, and (2) the generated HTML prototypes are truly interactive with multi-step workflows and working buttons — not static mockups.

## What Was Done

### This Session
- **Fixed preview persistence:** Added `await refetch()` in `Ideas.tsx` and `await fetchSubmissions()` in `ExecutiveSubmissions.tsx` after successful preview generation, so the DB-saved HTML loads on subsequent opens without regeneration
- **Overhauled system prompt:** Completely rewrote the AI prompt in the edge function to demand multi-screen, fully functional prototypes with working navigation, form submissions, state management, and complete workflow flows
- **Increased max_tokens:** Bumped from 16,000 to 32,000 to give Claude room for richer multi-screen prototypes
- **Enhanced user message:** Updated the prompt sent to Claude to emphasize interactivity and multi-screen navigation
- **All changes committed and pushed** (`626bd6a`)

### Previous Session (still on this branch)
- Created Supabase edge function `generate-idea-preview` calling Anthropic API (Claude Sonnet 4.6) for HTML prototype generation
- Added DB migration (`20260227000000_idea_code_preview.sql`) for `preview_html`, `preview_status`, `preview_generated_at` columns on both `user_ideas` and `executive_submissions`
- Built `useIdeaPreview` hook, `IdeaPreviewDialog` component, and wired up Ideas + ExecutiveSubmissions pages

## Key Decisions
- **Kept HTML as the format** — user questioned whether HTML was the right approach. Conclusion: HTML + vanilla JS is fine for sandboxed iframes; the real issue was prompt quality, not the format. Prompt was dramatically improved to produce app-like prototypes with multi-screen navigation, state management, working forms, etc.
- **Used brand colors in prompt** — navy (#202735) primary, orange (#dd4124) accent to match BankWise/SM Advisors brand
- **Refetch approach over realtime subscriptions** — simple `await refetch()` after generation rather than Supabase realtime listeners, keeping complexity low
- **Claude Sonnet 4.6** for generation, **32k max_tokens** for rich output

## Current State
All changes committed and pushed to feature branch. The feature should now:
1. Generate interactive multi-screen prototypes (not static mockups)
2. Persist previews in DB so closing/reopening the dialog loads from cache
3. Work on both the Ideas page and the Executive Submissions admin panel

**Not yet merged to `main`** — Lovable only syncs from `main`, so the edge function isn't deployed yet.

### Uncommitted Changes
None — all changes committed and pushed.

## Open Issues
- **Must merge to `main`** for Lovable to pick up and deploy the edge function
- **User skepticism about HTML:** User said "I think html may not be the right idea for this." We kept HTML but dramatically improved the prompt. If results still feel static after deployment, may need to explore alternatives (e.g., multi-file sandboxes, React-based rendering)
- **Edge function deployment:** After merge, verify `ANTHROPIC_API_KEY` secret is set in Supabase dashboard
- **DB migration:** Verify `preview_html`, `preview_status`, `preview_generated_at` columns exist on both tables after merge
- **Loading flash on refetch:** `fetchIdeas` sets `loading: true` which could briefly flash the spinner behind the dialog. Low impact since dialog is modal overlay.

## Next Steps
1. **Merge branch to `main`** so Lovable deploys the edge function and migration
2. **Test a real preview generation** end-to-end — click "Build Preview" and verify the prototype is interactive with working navigation
3. **Evaluate prototype quality** — if still too static, further tune the prompt or explore a different rendering approach
4. **Consider "Regenerate" button** alongside "View Preview" so users can refresh stale previews
5. **Resume Curriculum v2.0 work** — phased implementation plan still pending

## Key Files
- `supabase/functions/generate-idea-preview/index.ts` — Edge function with system prompt, user message, Anthropic API call (max_tokens: 32000)
- `src/pages/Ideas.tsx` — Ideas page with refetch persistence fix (line 124)
- `src/components/admin/ExecutiveSubmissions.tsx` — Executive view with fetchSubmissions persistence fix (line 136)
- `src/hooks/useIdeaPreview.ts` — Hook managing preview generation state, local HTML cache, and status overrides
- `src/hooks/useUserIdeas.ts` — Hook for fetching/managing user ideas from DB (exports `refetch`)
- `src/components/IdeaPreviewDialog.tsx` — Dialog rendering iframe with `sandbox="allow-scripts"`
- `supabase/migrations/20260227000000_idea_code_preview.sql` — DB migration for preview columns

## Context for Next Session
- **Product name**: SMILE (Smart, Modular, Intelligent Learning Experience for AI). Domain: `smile.smaiadvisors.com`
- **Lovable is the deployment pipeline**: Watches `main` on GitHub and auto-deploys. Feature branches are invisible until merged.
- **`useIdeaPreview` dual-layer cache**: Local state (`previewHtmlMap`) for just-generated previews + DB fallback (`preview_html` column) for persisted ones. `getPreviewHtml` checks local first, then DB.
- **Iframe security**: `sandbox="allow-scripts"` allows JS execution but blocks form submission to external URLs, navigation, and popups.
- **Rate limiting**: 3 per minute, 30 per day per user for preview generation.
- **`as any` casts**: Necessary because Lovable's auto-generated types don't include manually-created tables.
- **Migration idempotency**: All migrations must use `IF NOT EXISTS` — Lovable may re-run.
- **Git workflow**: Remote often gets ahead (Lovable pushes). Use `git stash && git pull --rebase origin main && git stash pop && git push` when push is rejected.
- **Supabase project ID**: `quimkenoecicooiwaojp`
- **Edge function secrets**: ANTHROPIC_API_KEY, OPENAI_API_KEY, ALLOWED_ORIGIN all set on Supabase project.
- **User preference**: Cory prefers fast MVP iteration, no third-party SSO, admin UI for operations. Sends screenshots of reference UIs. User expressed concern that HTML previews feel like static mockups — interactivity is the top priority.
- **Brand**: SM Advisors, navy (#202735) + orange (#dd4124), Inter/Playfair Display fonts.
- **Curriculum v2.0 still pending** — refer to deliverable1.md and deliverable2.md for specs.
