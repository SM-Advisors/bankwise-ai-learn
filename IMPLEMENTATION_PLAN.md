# 9-Feature Implementation Plan
## Prototype: BankWise AI Training Platform

**Context:** This is a prototype to demonstrate the business vision. Priority is functionality over production-grade security/compliance.

**Approach:** Sequential implementation in presented order, with full context preservation and careful testing at each phase.

---

## Overview

| # | Feature | Complexity | DB Changes | Est. Files | Phase |
|---|---------|------------|------------|------------|-------|
| 1 | Bank Identity Required | Low | 1 field | 5 files | Phase 1 |
| 2 | Policies List + Detail Views | Low | None | 4 files | Phase 1 |
| 3 | Guided Product Tour | Medium | 1 field | 3 files + lib | Phase 2 |
| 4 | Calendar of Events | Medium | 1 table | 6 files | Phase 2 |
| 5 | Community Hub Verification | Low | None | 1-2 files | Phase 1 |
| 6 | Training Experience Updates | Moderate | None | 8 files | Phase 3 |
| 7 | Andrea Output Controls | Moderate | Schema change | 4 files | Phase 3 |
| 8 | AI Preferences + Memory | High | 2 tables | 7 files | Phase 4 |
| 9 | Basic Management Reporting | High | 2 tables | 8 files | Phase 4 |

---

## PHASE 1: Foundation & Quick Wins (Features 1, 2, 5)

### Feature 1: Bank Identity Required in Profile + Dashboard Header

**Files to Modify:**
1. `supabase/migrations/[timestamp]_add_employer_bank.sql` - NEW
2. `src/integrations/supabase/types.ts`
3. `src/contexts/AuthContext.tsx`
4. `src/pages/Onboarding.tsx`
5. `src/pages/Dashboard.tsx`

**Database Changes:**
```sql
ALTER TABLE user_profiles
ADD COLUMN employer_bank_name TEXT;
```

**Implementation Steps:**
1. Create migration to add `employer_bank_name` column to `user_profiles`
2. Update TypeScript types (`UserProfile` interface)
3. Update `AuthContext.tsx` to include `employer_bank_name` in profile type
4. Modify `Onboarding.tsx`:
   - Current flow is 4 steps: Role/LOB → AI Proficiency → Learning Style → Tech Learning Style
   - Insert new Step 2: "Employer Bank" (after Role/LOB, before AI Proficiency)
   - This makes it a **5-step onboarding flow**
   - Add validation (required field)
   - Update step numbering, state management, and progress indicator
   - Update `updateProfile` call to include bank name
5. Modify `Dashboard.tsx` header:
   - Add bank name above "AI Training Dashboard"
   - Style: subtle gray text, smaller font
   - Position: Left nav header area

**Acceptance Criteria:**
- ✅ Onboarding requires bank name (cannot proceed without it)
- ✅ Bank name displays in dashboard header
- ✅ Bank name persists in user profile
- ✅ Existing users without bank name are prompted on next login

---

### Feature 2: Bank Policies Card → Policies List View + Policy Detail View

**Files to Modify:**
1. `src/App.tsx` - Add new routes
2. `src/pages/Policies.tsx` - NEW (list view)
3. `src/pages/PolicyDetail.tsx` - NEW (detail view)
4. `src/pages/Dashboard.tsx` - Update policy card click handler

**Existing Dependencies (no changes needed):**
- `src/hooks/useBankPolicies.ts` - Already exports `useBankPolicies()` and `useAllBankPolicies()` with full CRUD

**Database Changes:** None (uses existing `bank_policies` table)

**Implementation Steps:**
1. Create `/policies` route in App.tsx (protected)
2. Create `Policies.tsx` page:
   - Fetch all active policies (`is_active=true`)
   - Sort by `display_order`
   - Display as cards: title + summary + icon
   - Add optional search/filter by `policy_type`
   - Click card → navigate to `/policies/:id`
3. Create `PolicyDetail.tsx` page:
   - Fetch policy by ID
   - Display: title, type, full content (markdown), updated_at
   - Add "Back to Policies" button
4. Update Dashboard.tsx:
   - Change "Bank Policies" card onClick to navigate to `/policies`
   - Keep current modal as fallback for quick access

**Acceptance Criteria:**
- ✅ Dashboard policy card navigates to policies list
- ✅ Policies list shows all active policies
- ✅ Clicking policy shows full detail
- ✅ Can navigate back to list
- ✅ Admin-created policies appear immediately

---

### Feature 5: Community Hub Verification & Polish

**Current State:** The Community Hub card already exists on the Dashboard with Slack integration, and the AdminDashboard Settings tab already allows managing the community URL via `app_settings`. The `useAppSettings` hook already provides access to settings.

**This feature is mostly implemented.** The work here is verification and minor polish.

**Files to Potentially Modify:**
1. `src/pages/Dashboard.tsx` - Verify Community Hub card behavior, update description text if needed

**Database Changes:** None (uses existing `app_settings` table with `community_slack_url` key)

**Implementation Steps:**
1. Verify `community_slack_url` key exists in `app_settings` and works end-to-end
2. Verify Dashboard Community Hub card:
   - Button opens the configured URL
   - Link opens in new tab (`target="_blank"`)
   - "Coming Soon" or disabled state if URL not configured
3. Update description text to be platform-agnostic (currently may say "Slack"):
   - Should work for Microsoft Teams, Slack, Circle, or any platform
4. Verify admin can update the URL via AdminDashboard → Settings tab

**Acceptance Criteria:**
- ✅ Community Hub button opens configured URL in new tab
- ✅ Graceful state if URL not configured
- ✅ Description text is platform-agnostic (not Slack-specific)
- ✅ Admin can configure the URL from Settings

---

## PHASE 2: Enhanced UX (Features 3, 4)

### Feature 3: Help Button → Guided, Step-by-Step Product Tour

**Files to Modify:**
1. `package.json` - Add driver.js
2. `src/components/ProductTour.tsx` - NEW
3. `src/pages/Dashboard.tsx` - Update Help button
4. `supabase/migrations/[timestamp]_add_tour_completed.sql` - NEW

**Database Changes:**
```sql
ALTER TABLE user_profiles
ADD COLUMN tour_completed BOOLEAN DEFAULT false;
```

**Library:** driver.js (lightweight, no dependencies)

**Implementation Steps:**
1. Install driver.js: `npm install driver.js`
2. Create migration for `tour_completed` flag
3. Create `ProductTour.tsx` component:
   - Define tour steps (see tour steps below)
   - Add start/skip modal
   - Handle tour completion (update DB)
   - Add "Replay tour" option
4. Update Dashboard.tsx:
   - Replace help modal with tour trigger
   - Auto-start tour for new users (tour_completed=false)
   - Add "Replay Tour" to profile dropdown

**Tour Steps:**
1. Welcome modal: "Let's show you around..."
2. Profile card: "Your progress and profile info"
3. Session cards: "Complete sessions to unlock the next"
4. Live Training: "Join live sessions with instructors"
5. Community Hub: "Connect with peers"
6. Bank Policies: "Access your bank's AI policies"
7. Andrea: "Your AI coach is always available"
8. Completion: "Tour complete! You can replay anytime."

**Acceptance Criteria:**
- ✅ New users see tour on first dashboard visit
- ✅ Tour highlights key UI elements
- ✅ Users can skip or complete tour
- ✅ "Replay Tour" available in profile menu
- ✅ Tour completion saves to database

---

### Feature 4: Calendar of Events Between Live Training Feed and Community Hub

**Files to Modify:**
1. `supabase/migrations/[timestamp]_create_events.sql` - NEW
2. `src/integrations/supabase/types.ts`
3. `src/hooks/useEvents.ts` - NEW
4. `src/pages/Dashboard.tsx`
5. `src/pages/AdminDashboard.tsx` - Add Events CRUD tab
6. `src/components/EventModal.tsx` - NEW

**Database Changes:**
```sql
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  event_type TEXT NOT NULL, -- 'live_training', 'office_hours', 'webinar', 'deadline', 'community_session'
  scheduled_date TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER,
  location TEXT, -- URL or physical location
  instructor TEXT,
  max_attendees INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Optional: Link to live_training_sessions
ALTER TABLE events ADD COLUMN live_session_id UUID REFERENCES live_training_sessions(id);
```

**Implementation Steps:**
1. Create `events` table migration
2. Update TypeScript types
3. Create `useEvents.ts` hook (similar to useLiveTrainingSessions)
4. Add Events section to Dashboard between Live Feed and Community:
   - Show next 3 upcoming events
   - Display: icon by type, title, date/time, join button
   - Click event → EventModal with details
5. Add Events CRUD to AdminDashboard:
   - New tab: "Events"
   - Form: title, description, type, date/time, location
   - List with edit/delete
6. Create `EventModal.tsx`:
   - Shows event details
   - Join link (if applicable)
   - Add to calendar button (optional)

**Acceptance Criteria:**
- ✅ Dashboard shows upcoming events
- ✅ Events sorted by date (earliest first)
- ✅ Clicking event shows detail modal
- ✅ Admin can create/edit/delete events
- ✅ Different event types have appropriate icons

---

## PHASE 3: Training Experience Enhancement (Features 6, 7)

### Feature 6: Training Experience Updates

**Components:**
A. Live Feed Video (Simple)
B. Micro-Modules (Content Edit)
C. Copilot-Like Center UI (Complex)

**Files to Modify:**
1. `src/pages/Dashboard.tsx` - Update Live Feed card
2. `src/data/trainingContent.ts` - Break modules into 3-5 min units
3. `src/pages/TrainingWorkspace.tsx` - Redesign center pane
4. `src/components/training/TrainerChatPanel.tsx` - Update composer
5. `src/components/training/ModuleListSidebar.tsx` - Update module display
6. `src/components/VideoModal.tsx` - Update for live feed video
7. `src/assets/` - Add Session 1 video file (or video URL)

**Implementation Steps:**

**Part A: Live Feed Video**
1. Add video asset to `src/assets/` or use YouTube/Vimeo embed
2. Update Dashboard.tsx Live Feed:
   - Remove "Coming Soon" badge
   - Add "Watch Now" button
   - onClick → open VideoModal with Session 1 intro video
3. Update VideoModal to support:
   - Video URL prop
   - Title/description
   - Close button

**Part B: Micro-Modules**
1. Edit `trainingContent.ts`:
   - Split Session 1 modules into 3-5 minute chunks
   - Example: "Prompt Engineering Basics" (15 min) →
     - "What is a Prompt?" (3 min)
     - "Elements of Good Prompts" (4 min)
     - "Common Mistakes" (3 min)
     - "Practice Exercise" (5 min)
2. Update module titles to reflect short format
3. Ensure practice tasks align with shorter modules

**Part C: Copilot-Like Center UI**
1. Update TrainingWorkspace.tsx center pane:
   - Change layout to match Copilot: bottom composer, scrolling history
   - Add quick prompt suggestions above composer
   - Style responses as concise blocks (not long paragraphs)
2. Update TrainerChatPanel.tsx:
   - Redesign message bubbles (cleaner, more compact)
   - Add "Copy" button to responses
   - Add timestamp to messages
3. Preserve existing 3-column layout:
   - Left: Module list
   - Center: Copilot-style interaction
   - Right: Andrea quick help

**Acceptance Criteria:**
- ✅ Live Feed video is clickable and plays
- ✅ Modules are 3-5 minutes each
- ✅ Center pane feels like Copilot (composer at bottom)
- ✅ Responses are concise and skimmable
- ✅ Practice tasks still work correctly

---

### Feature 7: Andrea Output Controls

**Note:** Two edge functions exist for chat: `trainer_chat/index.ts` (actively used by TrainingWorkspace) and `ai-trainer/index.ts` (appears to be an older version). All changes target `trainer_chat` only. The `ai-trainer` function can be cleaned up separately.

**Note:** The `trainer_chat` function uses `lesson_content_chunks` table for RAG/vector search. Changes to response format must preserve the existing RAG context pipeline.

**Files to Modify:**
1. `supabase/functions/trainer_chat/index.ts` - Update response format
2. `src/components/training/TrainerChatPanel.tsx` - Render suggestions
3. `src/types/training.ts` - Add new message types
4. `src/pages/TrainingWorkspace.tsx` - Handle suggestions

**Edge Function Schema Changes:**
```typescript
// trainer_chat response
{
  answer: string,  // short, tweet-like
  suggested_prompts: string[],  // 2-4 suggestions
  variations?: {
    prompt: string,
    sample_output: string,
    rationale: string
  }[]
}
```

**Implementation Steps:**
1. Update `trainer_chat/index.ts`:
   - Enforce concise responses (system prompt: "Respond in 2-3 sentences max")
   - Generate 2-4 suggested next prompts based on context
   - Optional: Generate prompt variations for learning
   - Return structured JSON with answer + suggestions
2. Update TypeScript types (`Message` interface)
3. Update TrainerChatPanel.tsx:
   - Render suggested prompts as clickable buttons
   - Add "Variations" drawer (collapsible)
   - Click suggestion → inserts into composer or auto-sends
4. Style suggestions:
   - Pills/chips below each response
   - Hover state
   - Icon to indicate "try this"

**Acceptance Criteria:**
- ✅ Andrea responses are concise (tweet-like)
- ✅ 2-4 prompt suggestions appear after each response
- ✅ Clicking suggestion auto-fills composer
- ✅ Variations drawer shows alternative prompts (optional)
- ✅ Responses remain helpful despite brevity

---

## PHASE 4: Personalization & Reporting (Features 8, 9)

### Feature 8: AI Interaction Personalization + Memory Store (Prototype)

**Files to Modify:**
1. `supabase/migrations/[timestamp]_create_ai_preferences.sql` - NEW
2. `src/integrations/supabase/types.ts`
3. `src/hooks/useAIPreferences.ts` - NEW
4. `src/pages/Settings.tsx` - NEW (or add to profile)
5. `src/pages/AIMemories.tsx` - NEW
6. `supabase/functions/trainer_chat/index.ts` - Load preferences
7. `src/components/training/TrainerChatPanel.tsx` - Add "Save memory" button

**Database Changes:**
```sql
-- AI Preferences (custom instructions)
CREATE TABLE ai_user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tone TEXT DEFAULT 'professional', -- 'professional', 'casual', 'technical'
  verbosity TEXT DEFAULT 'balanced', -- 'concise', 'balanced', 'detailed'
  formatting_preference TEXT DEFAULT 'mixed', -- 'bullets', 'paragraphs', 'mixed'
  role_context TEXT, -- User-provided context about their role
  additional_instructions TEXT, -- Custom instructions
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- AI Memories
CREATE TABLE ai_memories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  source TEXT, -- 'user_saved', 'auto_captured', 'pinned'
  context TEXT, -- Which module/session it came from
  is_pinned BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true, -- Soft delete support
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ai_memories_user_active ON ai_memories(user_id, is_active);
```

**Implementation Steps:**
1. Create migrations for both tables
2. Create `useAIPreferences.ts` hook
3. Create Settings page (or add to profile):
   - Section: "AI Preferences"
   - Fields: tone, verbosity, formatting, role context, custom instructions
   - Save button
4. Create AIMemories page:
   - List all memories for user
   - Show: content, source, date created
   - Actions: Pin, Delete
   - Add "New Memory" button
5. Update TrainerChatPanel:
   - Add "Save as Memory" button on each message
   - On click → save to ai_memories table
6. Update trainer_chat edge function:
   - Load user preferences at start of conversation
   - Load pinned memories
   - Inject into system context
   - Apply tone/verbosity preferences to responses

**Acceptance Criteria:**
- ✅ Users can set AI preferences (tone, verbosity, etc.)
- ✅ Users can save important insights as memories
- ✅ Memories appear in list with option to delete
- ✅ Andrea uses preferences in responses
- ✅ Pinned memories influence Andrea's context
- ✅ Soft delete works (memories stay in DB but inactive)

**Prototype Notes:**
- No encryption for memory content (prototype only)
- No complex retention policies
- No audit logging of memory access

---

### Feature 9: Basic Management Reporting (Progress + Ideas)

**Components:**
A. Progress Dashboard (Moderate complexity)
B. Ideas Submission (Simple - table exists)
C. Basic Telemetry (Moderate complexity)

**Files to Modify:**
1. `supabase/migrations/[timestamp]_create_reporting_tables.sql` - NEW
2. `src/integrations/supabase/types.ts`
3. `src/hooks/useReporting.ts` - NEW
4. `src/pages/AdminDashboard.tsx` - Add Reporting tab
5. `src/components/admin/ProgressDashboard.tsx` - NEW
6. `src/components/admin/IdeasInbox.tsx` - NEW
7. `src/pages/TrainingWorkspace.tsx` - Add "Submit Idea" button
8. `supabase/functions/trainer_chat/index.ts` - Log prompt events

**Database Changes:**
```sql
-- Already exists: user_ideas table

-- Prompt telemetry (metadata only, NO raw prompts for prototype)
CREATE TABLE prompt_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id INTEGER, -- 1, 2, or 3
  module_id TEXT,
  event_type TEXT NOT NULL, -- 'prompt_submitted', 'response_received', 'exception_flagged'
  exception_flag BOOLEAN DEFAULT false,
  exception_type TEXT, -- 'policy_mention', 'sensitive_data', 'off_topic', etc.
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_prompt_events_user ON prompt_events(user_id);
CREATE INDEX idx_prompt_events_exception ON prompt_events(exception_flag) WHERE exception_flag = true;

-- Optional: Add reporting_viewer role
-- (Or reuse admin role with restricted views)
```

**Implementation Steps:**

**Part A: Progress Dashboard**
1. Create ProgressDashboard component:
   - Filter by LOB, role, date range
   - Charts:
     - Overall completion % by session
     - Skill level distribution (from ai_proficiency_level)
     - Progress over time (line chart)
   - Table: User list with completion status
2. Add to AdminDashboard as "Reporting" tab
3. Use existing training_progress table

**Part B: Ideas Submission**
1. Update TrainingWorkspace:
   - Add "Submit Idea" floating button (bottom-right)
   - Modal: Title, Description, optional context (current module)
   - Submit → save to user_ideas table
2. Create IdeasInbox component in AdminDashboard:
   - List all ideas
   - Filter by status (pending, reviewed, implemented)
   - Mark as reviewed/implemented
   - Export to CSV

**Part C: Basic Telemetry**
1. Create prompt_events table
2. Update trainer_chat edge function:
   - On each prompt: log event (user_id, session, module, timestamp)
   - NO raw prompt content (prototype only)
   - Flag obvious exceptions (simple keyword matching)
   - Example exceptions: mentions "confidential", "password", off-topic requests
3. Add exception count to ProgressDashboard:
   - Total prompts vs exception count
   - Exception % per user (optional)

**Acceptance Criteria:**
- ✅ Admin can view progress dashboard
- ✅ Dashboard shows completion by session
- ✅ Dashboard filterable by LOB/role
- ✅ Users can submit ideas from training workspace
- ✅ Admin can view and manage submitted ideas
- ✅ Prompt events logged (metadata only)
- ✅ Exception count visible in reporting

**Prototype Simplifications:**
- No complex exception detection (just keyword matching)
- No individual prompt storage (only counts)
- No advanced analytics or ML-based insights
- No automated exports (manual CSV only)
- No second-line review workflow

---

## Implementation Strategy

### Context Window Management

Given the concern about context length, here's the approach:

**Phase-by-Phase Implementation:**
1. Complete Phase 1 (3 features) → Commit → Test → New conversation
2. Complete Phase 2 (2 features) → Commit → Test → New conversation
3. Complete Phase 3 (2 features) → Commit → Test → New conversation
4. Complete Phase 4 (2 features) → Commit → Test → New conversation

**Within Each Phase:**
- Implement features sequentially
- Commit after each feature is complete and tested
- Use `/test` skill before each commit
- Use `/deploy` skill after testing passes

**Context Preservation:**
- Keep IMPLEMENTATION_PLAN.md as reference document
- Create detailed commit messages with feature references
- Use git tags for each phase completion

### Testing Approach

**For Each Feature:**
1. Manual testing in browser (primary for prototype)
2. Check TypeScript compilation
3. Test user flow from onboarding through feature
4. Test admin functionality (where applicable)
5. Verify database changes applied correctly

**No automated tests required** (prototype scope)

### Rollback Plan

If any feature breaks critically:
1. Use `/rollback` skill to revert last commit
2. Fix issue in isolation
3. Re-test before proceeding

---

## Estimated Timeline

| Phase | Features | Est. Time | Commit Points |
|-------|----------|-----------|---------------|
| Phase 1 | 1, 2, 5 | 3-4 hours | 3 commits |
| Phase 2 | 3, 4 | 3-4 hours | 2 commits |
| Phase 3 | 6, 7 | 4-5 hours | 2 commits |
| Phase 4 | 8, 9 | 5-6 hours | 2 commits |
| **Total** | **9 features** | **15-19 hours** | **9 commits** |

**Note:** This is AI-assisted development time. Actual implementation may be faster.

---

## Dependencies Check

**External Libraries Needed:**
- `driver.js` - For product tour (Phase 2) — NOT currently installed
- All other dependencies already in package.json, including:
  - `recharts` — needed for Phase 4 reporting charts
  - `react-markdown` + `remark-gfm` — used for policy content rendering
  - `date-fns` — date formatting for events and reporting
  - `lucide-react` — icons throughout UI

**Database Migrations Needed:**
- Phase 1: 1 migration (employer_bank_name)
- Phase 2: 2 migrations (tour_completed, events table)
- Phase 3: None
- Phase 4: 2 migrations (ai_preferences + ai_memories, prompt_events)

**Total:** 5 new migrations (8 existing migrations in `supabase/migrations/`)

**Existing Hooks Available (no changes needed):**
- `useBankPolicies` / `useAllBankPolicies` — policy CRUD
- `useAppSettings` / `useAdminAppSettings` — app config
- `useLiveTrainingSessions` — live sessions
- `useUserIdeas` — ideas CRUD
- `useUserRole` — role checking
- `useSessionTimeout` — session management

**Edge Functions:**
- `trainer_chat/index.ts` — Active chat function (targets for Features 7, 8, 9)
- `submission_review/index.ts` — Practice submission reviews
- `ai-trainer/index.ts` — Legacy/duplicate of trainer_chat (not actively used)
- `ai-practice/index.ts` — Practice handling
- `generate-lesson/index.ts` — Lesson generation

---

## Risk Mitigation

**Risk: Context window overflow**
- Mitigation: Phase-based approach with fresh conversations

**Risk: Database migration conflicts**
- Mitigation: Test migrations in order, use Supabase dashboard to verify

**Risk: Breaking existing features**
- Mitigation: Use protected routes wrapper, test auth flow after each phase

**Risk: Edge function changes breaking production**
- Mitigation: This is prototype only, no production environment

**Risk: Long implementation time**
- Mitigation: Can pause between phases, features are independent

---

## Success Criteria

**Phase 1 Complete:**
- ✅ Bank name required and displays
- ✅ Policies have list and detail views
- ✅ Community hub link works

**Phase 2 Complete:**
- ✅ Product tour guides new users
- ✅ Events calendar displays and admin CRUD works

**Phase 3 Complete:**
- ✅ Live feed video plays
- ✅ Modules are 3-5 minutes
- ✅ Copilot-like UI implemented
- ✅ Andrea gives concise responses with suggestions

**Phase 4 Complete:**
- ✅ AI preferences save and apply
- ✅ Memory system works (save/delete/pin)
- ✅ Progress dashboard shows key metrics
- ✅ Ideas submission works end-to-end
- ✅ Telemetry logs events (metadata only)

**Final Prototype:**
- ✅ All 9 features functional
- ✅ No major bugs in user flows
- ✅ Admin can manage all aspects
- ✅ Demonstrates business vision clearly

---

## Next Steps

**Immediate:**
1. Review this plan with you
2. Get approval to proceed
3. Start Phase 1, Feature 1

**After Each Phase:**
1. Demo completed features
2. Get feedback
3. Adjust approach if needed
4. Proceed to next phase

---

## Questions Before Starting?

1. Do you want to see any feature implemented differently?
2. Should any features be deprioritized or removed?
3. Is the phase-based approach acceptable for context management?
4. Any concerns about database changes or edge function modifications?

**Ready to begin Phase 1 when you approve this plan.** 🚀
