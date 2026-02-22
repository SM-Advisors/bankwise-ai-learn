# Session Handoff

**Date:** 2026-02-22
**Branch:** main
**Status:** Ready for Next Phase — Curriculum v2.0 Implementation

## Goal
Implement the SMILE Curriculum v2.0 based on two deliverable documents:
- **Deliverable 1** (`deliverable1.md`): Complete Curriculum Specification v2.0 — full module specs for all 4 sessions + 12 electives
- **Deliverable 2** (`deliverable2.md`): Technical Implementation Guide v2.0 — code changes, database schema, edge function updates, priority roadmap

## What Was Done (Previous Sessions)

### Tier 1-3 Security + Go-Live (Committed & Deployed)
- T1-1: Removed hardcoded super-admin email from `useUserRole.ts`
- T1-2: PII/compliance detection in `ai-practice` edge function
- T1-3: Per-user rate limiting via `_shared/rateLimiter.ts` (trainer_chat, submission_review)
- T1-4: Dynamic CORS via `_shared/cors.ts` across all 6 edge functions
- T2-1: User conversation deletion from Settings page
- T2-2: pg_cron data retention jobs (12-month conversations, 30-day rate events)
- T2-3: Community Hub admin review queue with approve/reject
- T2-4: User deactivation with sign-in enforcement
- T2-5: GitHub Actions CI/CD workflow (S3 + CloudFront — dormant, Lovable deploys)
- T3-1: Thumbs up/down feedback on Andrea responses
- T3-2: Rubric score persistence in `submission_scores` table
- T3-3: C-Suite CSV export
- All 6 new migrations applied and repaired in migration history
- All 6 edge functions deployed
- Committed as `542d42a`, pushed to main

### Known Issue Found
- `line_of_business` column on `user_profiles` is still an enum — needs conversion to TEXT for new department slugs. SQL provided but not yet run: `ALTER TABLE user_profiles ALTER COLUMN line_of_business TYPE TEXT USING line_of_business::TEXT;`

## Curriculum v2.0 — What Needs to Be Done

### Current State (v1.0)
| Item | Current |
|------|---------|
| Sessions | 3 (18 modules: 8 + 5 + 5) |
| Departments | 14 (all in topics.ts, 15 scenarios in trainingContent.ts Module 3-1) |
| Proficiency Assessment | 6 self-report questions, scenario-based, 0-8 scale |
| Coaching Tiers | 3: Hand-Holding (S1), Collaborative (S2), Peer (S3) |
| Rubrics | Generic + module-specific for 2-3, 2-5, 3-3, 3-5 |
| Learning Style Integration | 4 styles with brief coaching bullets |

### Target State (v2.0)
| Item | Target |
|------|--------|
| Sessions | 4 (22 modules: 6 + 6 + 5 + 5) + 12 elective add-on modules |
| Departments | Same 14, but 6 get detailed topic-specific scenarios (was 3) |
| Proficiency Assessment | 4 self-report + 2 performance-based (multi-select + drag-rank) |
| Coaching Tiers | 4: Hand-Holding, Collaborative, Peer, ADVISOR (new) |
| Rubrics | 3-level (Developing/Proficient/Advanced) on ALL capstones + graded modules |
| Learning Style Integration | Deep integration with style-specific coaching moves per session |
| New Features | VERIFY checklist, Prompt Library, Knowledge Checks, Micro-Adaptation, Certificates, Electives, AI Journey visualization |

### Implementation Phases (from Deliverable 2, Section 7)

**Phase 1: Critical Gap Fixes (P0/P1)**
1. Module 1-5: Verifying AI Output + VERIFY checklist (NEW module — critical safety gap)
2. Session 1 renumbering: 8→6 modules (merge 1-1/1-2, merge 1-4/1-5/1-6, renumber)
3. 3-level rubrics on all existing capstones (1-8→1-6, 2-5→2-6, 3-5)
4. Prompt security content in Module 2-2
5. "When NOT to Use AI" framework in Module 3-2
6. Performance-based proficiency items (2 new assessment questions)

**Phase 2: Structural Enhancements (P1/P2)**
7. Module 2-1: Bridge Module (CLEAR→Agent mapping)
8. Module 2-5: Living Agent
9. Session 2 renumbering: 5→6 modules
10. Troubleshooting Ladder in Module 1-4
11. Expanded department scenarios (3→6 detailed tracks)
12. Regulatory Landscape Brief in Module 3-2

**Phase 3: Session 4 + Engagement (P2/P3)**
13. Session 4: All 5 modules (4-1 through 4-5)
14. ADVISOR coaching tier in trainer_chat
15. Knowledge Checks at session starts (Sessions 2-4)
16. VERIFY coaching integration across Sessions 2-4
17. Prompt Library feature (user_prompts table + UI)
18. Prompt Library save suggestion coaching rule

**Phase 4: Electives + Deep Integration (P3/P4)**
19. 12 Elective Add-On Modules (4 paths × 3 modules)
20. elective_progress table + UI
21. Learning style deep integration (RAG chunk tagging + style-boosted retrieval)
22. Within-session micro-adaptation logic
23. Certificates (table + PDF generation)
24. AI Journey visualization
25. Peer review component for Module 3-5
26. Tech learning style expansion

### Key Code Changes Required

**`src/data/trainingContent.ts`** (~1,449 lines → ~2,500+ lines)
- Restructure Session 1: 8→6 modules (merge 1-1/1-2, merge 1-4/1-5/1-6, add new 1-5)
- Restructure Session 2: 5→6 modules (add new 2-1 bridge, new 2-5 living agent, renumber old 2-5→2-6)
- Enhance Session 3 modules with new content
- Add entire Session 4 (5 modules)
- Add `electiveContent` export (12 modules in 4 paths)
- Update ALL module IDs, titles, descriptions, keyPoints, examples, steps, practiceTask, successCriteria

**`src/data/proficiencyAssessment.ts`** (~223 lines)
- Keep 4 of 6 self-report questions
- Add 2 performance-based items: multi-select prompt evaluation + drag-to-rank
- Update scoring formula: 50% self-report + 50% performance (currently 70/30 with confidence)

**`supabase/functions/trainer_chat/index.ts`** (~1,121 lines)
- Add Session 4 ADVISOR coaching tier to `getLessonDepthInstructions()`
- Add micro-adaptation logic (count clarifying questions per module)
- Add knowledge check flow (session start greeting)
- Add VERIFY coaching rule for Sessions 2-4
- Add Prompt Library save suggestion rule
- Expand learning style instructions (4 bullets → full coaching move descriptions)
- Pass `learning_style` to `match_lesson_chunks()` for style-boosted RAG

**`supabase/functions/submission_review/index.ts`** (~554 lines)
- Add 3-level rubrics (Developing/Proficient/Advanced) for ALL graded modules
- Add rubrics for new modules: 1-5, 2-1, 2-5, all Session 4 modules
- Add VERIFY evaluation criterion to all capstone rubrics

**`src/data/topics.ts`** (~341 lines)
- Add 3 topics each for Retail/Branch Ops, Compliance/Risk, Wealth/Trust (9 new topics)

**New database tables needed:**
- `proficiency_assessment_responses` — performance-based assessment data
- `elective_progress` — elective module tracking (not sequentially gated)
- `certificates` — completion certificates
- `user_prompts` — personal prompt library

**New UI components needed:**
- MultiSelectChecklist (proficiency assessment)
- DragToRank (proficiency assessment)
- PromptLibrary (dashboard sidebar + training workspace)
- ElectivePathCards (dashboard)
- CertificateViewer (dashboard + settings)
- KnowledgeCheckDialog (training workspace)
- AIJourneyVisualization (dashboard)
- PeerReviewPanel (module 3-5)

### Module ID Mapping (Old → New)

**Session 1:**
| Old | New | Notes |
|-----|-----|-------|
| 1-1 | 1-1 | Merged with old 1-2 |
| 1-2 | *(merged into 1-1)* | Deleted |
| 1-3 | 1-2 | Renumbered |
| 1-4 | 1-3 | Merged with old 1-5, 1-6 |
| 1-5 | *(merged into 1-3)* | Deleted |
| 1-6 | *(merged into 1-3)* | Deleted |
| 1-7 | 1-4 | Renumbered |
| *(new)* | 1-5 | NEW: Verifying AI Output |
| 1-8 | 1-6 | Renumbered |

**Session 2:**
| Old | New | Notes |
|-----|-----|-------|
| *(new)* | 2-1 | NEW: Bridge Module (From Prompts to Agents) |
| 2-1 | *(merged into 2-1/2-2)* | Core content absorbed |
| 2-2 | 2-2 | Enhanced with prompt security |
| 2-3 | 2-3 | Enhanced |
| 2-4 | 2-4 | Reframed |
| *(new)* | 2-5 | NEW: Your Living Agent |
| 2-5 | 2-6 | Renumbered to capstone |

**Session 3:** No renumbering, content enhancements only

**Session 4:** Entirely new (4-1 through 4-5)

**Electives:** E1-1 through E4-3 (12 modules)

## Key Decisions
- **Phased rollout**: Deliverable 2 Section 7 defines 4 implementation phases by priority
- **Module IDs change**: Session 1 goes from 8→6 modules, Session 2 from 5→6 — ALL module references must be updated (training_progress, lesson_content_chunks, practice_conversations, etc.)
- **Assessment rebalanced**: 50/50 self-report + performance (currently 70/30 with confidence)
- **RAG chunks need reseeding**: All lesson_content_chunks must be re-seeded with new module IDs + new content + learning_style column
- **Existing user data migration**: Any progress referencing old module IDs (1-3 through 1-8) needs mapping to new IDs (1-2 through 1-6)

## Current State
All Tier 1-3 work from previous session is committed and deployed. The codebase is clean on main. The curriculum deliverables have been read and analyzed. No code changes have been made yet for v2.0.

### Uncommitted Changes
- `.claude/handoff.md` — this file (will be committed)
- `.claude/settings.local.json` — local permission config only
- `src/components/workflow-studio/ref_workflow_types.txt` — untracked temp file
- `src/components/workflow-studio/test.txt` — untracked temp file
- `supabase/.temp/` — Supabase CLI temp directory

## Open Issues
- `line_of_business` enum needs conversion to TEXT (SQL provided, not yet run)
- Vite build chunk size warning (1,727 kB) — could benefit from code splitting
- `Community.tsx` standalone page file exists but is no longer routed

## Next Steps
1. **Run the line_of_business TEXT migration** (user needs to paste SQL in Supabase)
2. **Start Phase 1**: Session 1 restructuring (8→6 modules in trainingContent.ts)
3. **Add Module 1-5** (Verifying AI Output — critical gap)
4. **Add 3-level rubrics** to all capstones in submission_review
5. Continue through phases per priority roadmap

## Key Files
- `src/data/trainingContent.ts` — All module content (1,449 lines, will grow significantly)
- `src/data/topics.ts` — Department topics (341 lines)
- `src/data/proficiencyAssessment.ts` — Assessment questions (223 lines)
- `src/data/learningStyles.ts` — Learning style definitions (63 lines)
- `src/data/questionnaire.ts` — Learning style assessment (148 lines)
- `supabase/functions/trainer_chat/index.ts` — Andrea's brain (1,121 lines)
- `supabase/functions/submission_review/index.ts` — Structured feedback (554 lines)
- `src/pages/TrainingWorkspace.tsx` — Training workspace (1,062 lines)
- `src/pages/Dashboard.tsx` — Main dashboard (773 lines)
- `C:\Users\coryk\Downloads\deliverable1.md` — Curriculum Specification v2.0
- `C:\Users\coryk\Downloads\deliverable2.md` — Technical Implementation Guide v2.0

## Context for Next Session
- **Product name**: SMILE (Smart, Modular, Intelligent Learning Experience for AI). Domain: `smile.smaiadvisors.com`
- **Git workflow**: Remote often gets ahead (Lovable pushes). Use `git stash && git pull --rebase origin main && git stash pop && git push` when push is rejected.
- **Supabase CLI**: Use `supabase functions deploy <name>` for edge functions. Migrations run manually in SQL editor.
- **Lovable is the deployment pipeline**: GitHub push → Lovable auto-deploys frontend. Edge functions deployed via CLI.
- **Edge function secrets**: ANTHROPIC_API_KEY, OPENAI_API_KEY, ALLOWED_ORIGIN all set on Supabase project `quimkenoecicooiwaojp`.
- **`as any` casts**: Necessary because Lovable's auto-generated types don't include manually-created tables.
- **Migration idempotency**: All migrations must use `IF NOT EXISTS` — Lovable may re-run.
- **Module ID renumbering ripple**: When changing module IDs, must update: trainingContent.ts, trainer_chat system prompt routing, submission_review rubric routing, lesson_content_chunks in DB, any stored training_progress referencing old IDs.
- **User preference**: Cory prefers fast MVP iteration, no third-party SSO, admin UI for operations. Sends screenshots of reference UIs and expects the app to mirror them.
- **Brand**: SM Advisors, navy (#202735) + orange (#dd4124), Inter/Playfair Display fonts.
- **Deliverable documents** are in `C:\Users\coryk\Downloads\` — read them at session start for full curriculum specs.
