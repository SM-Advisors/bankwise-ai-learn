# Session Handoff

**Date:** 2026-03-09
**Branch:** claude/curriculum-rewrite-6wVX9 (merged to main via PR)
**Status:** Completed — clean slate

## Goal
Patch two CodeQL high-severity security alerts in `extract-agent-knowledge` edge function, then audit and confirm all recent backend changes were deployed to production.

## What Was Done
- Fixed **double-unescaping** (CWE-116): moved `&amp;` decode to last in `stripXml` so `&amp;lt;` doesn't double-decode into `<`
- Fixed **incomplete sanitization** (CWE-80): added a second tag-strip pass after entity decoding to neutralise tags reconstructed from encoded angle brackets (e.g. `&lt;script&gt;`)
- Committed and pushed fix to `claude/curriculum-rewrite-6wVX9`; PR merged
- Audited all commits from past 2 days and identified undeployed migrations + edge functions
- User confirmed: **all 3 migrations ran** and **all edge functions redeployed**

## Key Decisions
- Kept `&lt;`/`&gt;` decoding (Copilot suggested removing it — wrong for plain-text use case like DOCX extraction)
- Second tag-strip pass is the correct fix for the reconstruction attack vector, not removing entity decoding
- Duplicate migration `20260308114552` was intentionally left as-is (safe no-op due to `IF NOT EXISTS`)

## Current State
Everything is deployed and clean:
- All 3 migrations live in production
- All edge functions deployed (including new `extract-agent-knowledge`)
- No uncommitted changes, no pending work

### Uncommitted Changes
None — all changes committed and pushed.

## Open Issues
None.

## Next Steps
None carry-over from this session. Resume normal feature work.

## Key Files
- `supabase/functions/extract-agent-knowledge/index.ts` — new edge function for DOCX/PDF/TXT extraction; `stripXml()` is the patched function
- `supabase/migrations/20260307220000_add_session_5_progress.sql` — adds session 5 columns + relaxes constraint
- `supabase/migrations/20260309000001_add_org_platform.sql` — adds `platform` column to `organizations` (required for ChatGPT Edge UI)

## Context for Next Session
- The `organizations.platform` column defaults to `'default'`; orgs using the ChatGPT Edge UI need it set to `'chatgpt'` — this is a data change, not a code change, done per-org in the dashboard or via SQL
- Edge functions are all deployed from the repo root with `supabase functions deploy --project-ref <ref>`
- The duplicate session-5 migration (`20260308114552`) exists in the repo — it's harmless but worth noting if the migration count ever looks off
- **Product name**: SMILE (Smart, Modular, Intelligent Learning Experience for AI). Domain: `smile.smaiadvisors.com`
- **Brand**: SM Advisors, navy (#202735) + orange (#dd4124), Inter/Playfair Display fonts
- **Git workflow**: Branch naming must follow `claude/...` pattern. Push with `git push -u origin <branch>`
- **Lovable is the deployment pipeline**: GitHub push → Lovable auto-deploys frontend
- **`as any` casts**: Necessary because Lovable's auto-generated types don't include manually-created tables
