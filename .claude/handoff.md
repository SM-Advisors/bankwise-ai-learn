# Session Handoff

**Date:** 2026-02-28
**Branch:** `claude/workflow-idea-code-preview-8Hic5` (feature branch off main)
**Status:** Ready for Next Phase — Merge to Main

## Goal
Add a "Build Preview" feature to the BankWise AI Learn platform so users can generate interactive HTML prototypes of their workflow ideas using Claude Sonnet 4.6, viewable in a sandboxed iframe dialog.

## What Was Done
- Created Supabase edge function `generate-idea-preview` that calls the Anthropic API (Claude Sonnet 4.6) to generate self-contained HTML prototypes from idea descriptions
- Added DB migration (`20260227000000_idea_code_preview.sql`) adding `preview_html`, `preview_status`, and `preview_generated_at` columns to both `user_ideas` and `executive_submissions` tables
- Built `useIdeaPreview` hook to manage preview generation state and API calls
- Built `IdeaPreviewDialog` component with sandboxed iframe rendering and a "View Source" toggle
- Updated `Ideas.tsx` with "Build Preview" / "View Preview" button on each idea card
- Updated `ExecutiveSubmissions.tsx` with same preview functionality for C-Suite view
- All changes committed (`73df545`) and pushed to the feature branch

## Key Decisions
- **Claude Sonnet 4.6** chosen as the model for generating previews (via Anthropic API directly, not OpenAI-compatible endpoint)
- **Self-contained HTML** approach — each preview is a single HTML string with inline CSS/JS, stored directly in the database (`preview_html` column)
- **Sandboxed iframe** for rendering — prevents generated code from accessing the parent app
- **Edge function architecture** — generation runs server-side in a Supabase edge function, not client-side

## Current State
The feature is **fully implemented and committed** on the feature branch. Working tree is clean.

**Not yet merged to `main`.** This is critical because:
- **Lovable only syncs from the `main` branch** on GitHub
- Until merged, Lovable cannot see or deploy the edge function to Supabase
- The frontend "Build Preview" button will error because the edge function won't exist in the deployed environment

## Uncommitted Changes
None — all changes committed and pushed.

## Open Issues
- **Must merge to `main`** before the feature works in the Lovable-deployed environment
- The Supabase edge function needs the `ANTHROPIC_API_KEY` secret set in Supabase dashboard (Edge Function Secrets) — may already be set from previous work
- The DB migration needs to be applied — Lovable should handle this automatically after merge, but verify the columns exist on both tables
- Previous open issue: `line_of_business` enum still needs conversion to TEXT (SQL provided in previous handoff, not yet run)

## Next Steps
1. **Merge this branch to `main`** — create a PR or merge directly so Lovable picks up the changes
2. **Set/verify the `ANTHROPIC_API_KEY` secret** in Supabase dashboard under Edge Function Secrets (may already be configured)
3. **Verify the migration ran** — check that `preview_html`, `preview_status`, and `preview_generated_at` columns exist on both `user_ideas` and `executive_submissions`
4. **Test end-to-end** — click "Build Preview" on an idea and confirm the prototype generates and displays correctly
5. **Resume Curriculum v2.0 work** — the phased implementation plan from the previous handoff is still pending (Phase 1: Session 1 restructuring, Module 1-5, 3-level rubrics)

## Key Files
- `supabase/functions/generate-idea-preview/index.ts` — edge function calling Claude to generate HTML prototypes
- `supabase/migrations/20260227000000_idea_code_preview.sql` — DB migration for preview columns
- `src/components/IdeaPreviewDialog.tsx` — full-screen dialog with iframe preview + source view
- `src/hooks/useIdeaPreview.ts` — hook managing preview generation state
- `src/hooks/useUserIdeas.ts` — updated to include new preview columns in queries
- `src/pages/Ideas.tsx` — user-facing ideas page with Build/View Preview buttons
- `src/components/admin/ExecutiveSubmissions.tsx` — C-Suite view with same preview functionality

## Context for Next Session
- **Product name**: SMILE (Smart, Modular, Intelligent Learning Experience for AI). Domain: `smile.smaiadvisors.com`
- **Lovable is the deployment pipeline**: It watches `main` on GitHub and auto-deploys. Code on feature branches is invisible to it until merged.
- **Git workflow**: Remote often gets ahead (Lovable pushes). Use `git stash && git pull --rebase origin main && git stash pop && git push` when push is rejected.
- **Supabase project ID**: `quimkenoecicooiwaojp`
- **Edge function secrets**: ANTHROPIC_API_KEY, OPENAI_API_KEY, ALLOWED_ORIGIN all set on Supabase project.
- **`as any` casts**: Necessary because Lovable's auto-generated types don't include manually-created tables.
- **Migration idempotency**: All migrations must use `IF NOT EXISTS` — Lovable may re-run.
- **User preference**: Cory prefers fast MVP iteration, no third-party SSO, admin UI for operations. Sends screenshots of reference UIs and expects the app to mirror them.
- **Brand**: SM Advisors, navy (#202735) + orange (#dd4124), Inter/Playfair Display fonts.
- **Curriculum v2.0 is still pending** — deliverable documents define a 4-phase implementation plan. Previous handoff had full details on module renumbering, new tables, and code changes needed. Refer to deliverable1.md and deliverable2.md for specs.
