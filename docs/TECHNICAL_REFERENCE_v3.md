# SMILE — Comprehensive Technical Reference
### Smart, Modular, Intelligent Learning Experience for AI

**Document Version:** 3.0
**Date:** 2026-02-28
**Classification:** Internal / Confidential
**Prepared by:** SM Advisors

**Change Summary (v2.0 → v3.0):**
- TypeScript updated 5.5.3 → 5.8.3; Vite 5.4.11 → 5.4.19; React Router 6.30.0 → 6.30.1; Tailwind 3.4.11 → 3.4.17; react-markdown 9.0.1 → 10.1.0; Recharts 2.15.3 → 2.15.4
- Schema rename: `bank_role` → `job_role`, `employer_bank_name` → `employer_name`, `line_of_business` → `department` (user_profiles)
- Schema rename: `org_type` → `audience_type` (values: `enterprise` / `consumer`); new `industry` column on organizations
- New `tours_completed` JSONB column on `user_profiles` for per-tour completion tracking
- New DB table: `org_resources` — admin-managed resource links per organization
- New DB helper functions: `get_my_org_id()`, `is_super_admin()` for org-scoped RLS
- `user_feedback` table: added `status` (new/resolved) and `is_read` columns
- `validate_registration_code()` now returns `audience_type` and `industry` fields
- New route: `/super-admin` → `SuperAdminDashboard.tsx`; `/certificates` → `Certificates.tsx`
- Admin dashboard: new Resources tab for `org_resources` management
- New hooks: `useOrgResources`, `useWorkspaceTour`
- Multi-page guided tour system (Driver.js) with per-tour completion tracking
- Admin Andrea C-Suite AI advisor panel added
- Super admin view-as-org preview feature
- CSV export capability for admin reporting
- AI model IDs corrected to real API identifiers; Grok removed as model option
- 4 new migrations (total: 51); `org_isolation_rls` enforces org-scoped data access

---

## Table of Contents

1. [Application Overview](#1-application-overview)
2. [Technology Stack](#2-technology-stack)
3. [System Architecture](#3-system-architecture)
4. [Data Flow Diagrams](#4-data-flow-diagrams)
5. [Database Schema](#5-database-schema)
6. [Edge Functions (Server-Side AI Logic)](#6-edge-functions)
7. [Andrea AI Persona — Full Specification](#7-andrea-ai-persona)
8. [Frontend Architecture](#8-frontend-architecture)
9. [Authentication & Authorization](#9-authentication--authorization)
10. [AI & Machine Learning Integration](#10-ai--machine-learning-integration)
11. [Training Curriculum Structure](#11-training-curriculum-structure)
12. [Admin Capabilities](#12-admin-capabilities)
13. [Deployment & Infrastructure](#13-deployment--infrastructure)
14. [Appendix A: Information Security Risks & Controls](#appendix-a-information-security-risks--controls)
15. [Appendix B: Environment Variables & Secrets](#appendix-b-environment-variables--secrets)
16. [Appendix C: Database Migration History](#appendix-c-database-migration-history)

---

## 1. Application Overview

### 1.1 What Is SMILE?

SMILE (Smart, Modular, Intelligent Learning Experience for AI) is a web-based AI training platform designed specifically for banking professionals at SM Advisors client institutions. Its primary mission is to help bank employees at every level — from frontline advisors to executives — become skilled, compliant, and confident users of AI technology in their day-to-day work.

The application is not a passive e-learning tool. It uses a live AI coaching system ("Andrea") built on Anthropic's Claude claude-sonnet-4, a RAG (Retrieval Augmented Generation) pipeline with learning style–boosted similarity scoring, and a structured curriculum of 22 core modules across four sessions plus 12 elective modules across four specialized learning paths, to deliver a personalized, interactive learning experience.

### 1.2 Core Value Propositions

- **Personalized AI coaching**: Andrea adapts her communication style, depth, and guidance based on each learner's assessed AI proficiency level, department, job role, and stated learning style preferences.
- **Banking-specific context**: All AI scenarios, examples, and guardrails are tailored to banking operations — retail banking, wealth management, commercial lending, compliance, and operations.
- **Compliance-first design**: The platform actively detects and blocks prompts that would violate banking regulations (PII sharing, compliance bypass attempts, inappropriate data export). Andrea refuses to help with these and explains why.
- **Hands-on practice**: Learners don't just read about AI — they build AI agents, design multi-step workflows, and complete a Capstone project where they deploy a real AI agent to practice against.
- **Elective learning paths**: After completing core sessions, learners can choose from four specialized elective paths (Advanced Prompt Engineering, AI Agent Specialization, Compliance & AI, Data Analytics with AI).
- **Prompt Library**: Learners accumulate and save high-quality prompts throughout training for ongoing reuse; Andrea suggests saving particularly well-crafted prompts via a one-click UI.
- **AI Journey tracking**: The AI Journey page visualizes skill progression with a Prompt Evolution card comparing the learner's earliest vs. most recent submitted prompts.
- **C-Suite visibility**: An executive reporting dashboard gives bank leadership KPI snapshots on engagement, completion rates, and skill signal trends.
- **Self-service operations**: All platform administration (policies, users, registration codes, organizations, live session scheduling, resource links) is handled through an in-app admin panel — no database terminal access required.

### 1.3 Target Users

| User Type | Description |
|-----------|-------------|
| **Learner** | Bank employee completing the 4-session core AI training curriculum and optional electives |
| **Admin** | SM Advisors staff managing the platform (content, users, orgs) |
| **Executive** | Bank leadership accessing C-Suite KPI dashboard |
| **Super Admin** | SM Advisors system-wide administrator with cross-org visibility |

### 1.4 Business Context

The platform operates as a white-labeled SaaS product sold to banking institutions by SM Advisors. Multi-tenancy is implemented via an organization/registration-code system — banks are issued registration codes that employees use at sign-up to be placed in the correct organizational tenant.

---

## 2. Technology Stack

### 2.1 Frontend

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | React | 18.3.1 |
| Language | TypeScript | 5.8.3 |
| Build Tool | Vite | 5.4.19 |
| Routing | React Router DOM | 6.30.1 |
| Server State | TanStack Query (React Query) | 5.83.0 |
| UI Components | ShadCN UI (Radix UI) | 62 components |
| Styling | Tailwind CSS | 3.4.17 |
| Markdown Rendering | react-markdown | 10.1.0 |
| Charts | Recharts | 2.15.4 |
| Toast Notifications | Sonner | 1.7.4 |
| Icons | Lucide React | 0.462.0 |
| Date Utilities | date-fns | 3.6.0 |
| Guided Tours | Driver.js | 1.4.0 |
| PDF Generation | jsPDF + jsPDF-AutoTable | 4.2.0 / 5.0.7 |
| Carousel | Embla Carousel React | 8.6.0 |
| Resizable Panels | React Resizable Panels | 2.1.9 |

### 2.2 Backend

| Layer | Technology |
|-------|-----------|
| Backend-as-a-Service | Supabase (PostgreSQL 15, Auth, Edge Functions, Storage) |
| Database | PostgreSQL 15 with pgvector extension |
| Edge Functions Runtime | Deno (TypeScript) |
| Authentication | Supabase Auth (email/password, session-based JWTs) |
| File Storage | Supabase Storage (policy-documents bucket) |
| Vector Search | pgvector with HNSW index (cosine similarity) |

### 2.3 AI / ML Services

| Service | Provider | Usage |
|---------|---------|-------|
| **Primary LLM** | Anthropic Claude claude-sonnet-4-20250514 | Andrea coaching, submission review, practice AI, agent testing, workflow testing |
| **Embeddings** | OpenAI text-embedding-3-small | RAG chunk embeddings (1536 dimensions) |
| **Lesson Generation** | Google Gemini (via Lovable AI Gateway) | AI-powered lesson generation, document parsing |
| **Document Parsing** | Google Gemini (gemini-2.5-flash + lite) | PDF/DOCX policy document extraction |

**Note:** Recent commits corrected model API identifiers to their real values and removed Grok as a selectable model option. Verify current model strings in edge function source if exact identifiers are needed.

### 2.4 Deployment & Hosting

| Component | Provider |
|-----------|---------|
| Frontend Hosting | Lovable.dev (auto-deploys from GitHub main branch) |
| Database & Auth | Supabase Cloud (project: `tehcmmctcmmecuzytiec`) |
| Edge Functions | Supabase Edge Functions (Deno Deploy) |
| File Storage | Supabase Storage |
| CI/CD | GitHub → Lovable auto-deploy pipeline |
| Version Control | GitHub (main branch = production) |

---

## 3. System Architecture

### 3.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT BROWSER                          │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              React SPA (Vite + TypeScript)               │   │
│  │                                                          │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │   │
│  │  │   Auth Layer  │  │  React Query │  │  React Router │  │   │
│  │  │  (AuthContext)│  │  (TanStack)  │  │    (v6)       │  │   │
│  │  └──────────────┘  └──────────────┘  └──────────────┘  │   │
│  │                                                          │   │
│  │  ┌──────────────────────────────────────────────────┐   │   │
│  │  │                    Pages                          │   │   │
│  │  │  Dashboard | Training | Electives | Admin | ...   │   │   │
│  │  └──────────────────────────────────────────────────┘   │   │
│  │                                                          │   │
│  │  ┌──────────────────────────────────────────────────┐   │   │
│  │  │                  Components                       │   │   │
│  │  │  TrainerChat | AgentStudio | WorkflowBuilder | ..  │   │   │
│  │  └──────────────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
                     HTTPS / REST / WebSocket
                              │
┌─────────────────────────────────────────────────────────────────┐
│                    SUPABASE CLOUD PLATFORM                       │
│                                                                 │
│  ┌───────────────┐  ┌───────────────┐  ┌───────────────────┐  │
│  │  Supabase Auth │  │  PostgreSQL   │  │  Storage Buckets  │  │
│  │  (JWT tokens) │  │  + pgvector   │  │  (policy-docs)    │  │
│  └───────────────┘  └───────────────┘  └───────────────────┘  │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                   Edge Functions (Deno)                  │   │
│  │                                                          │   │
│  │  trainer_chat  │  submission_review  │  ai-practice      │   │
│  │  agent-test-chat  │  workflow-test-chat  │  practice_chat │   │
│  │  generate-lesson  │  embed_chunks  │  seed_lesson_chunks │   │
│  │  ai-trainer  │  parse-policy-document  │  intake-prompt-score │
│  │  admin-create-user  │  admin-delete-user                 │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
              External AI APIs (HTTPS + API Keys)
                              │
         ┌────────────────────┼────────────────────┐
         │                    │                    │
┌────────────────┐  ┌─────────────────┐  ┌────────────────────┐
│  Anthropic API  │  │   OpenAI API    │  │  Lovable AI Gateway │
│  Claude sonnet  │  │  text-embedding  │  │  (Gemini models)   │
└────────────────┘  └─────────────────┘  └────────────────────┘
```

### 3.2 Request Flow — Standard Page Load

```
1. User navigates to URL
2. React Router matches route
3. ProtectedRoute checks Supabase Auth session (JWT in localStorage)
4. If unauthenticated → redirect to /auth
5. If authenticated:
   a. AuthContext loads user profile from user_profiles table
   b. TrainingContext loads training_progress
   c. Page component mounts
   d. React Query hooks fire Supabase client queries
   e. Data renders via ShadCN UI components
```

### 3.3 Request Flow — Andrea Chat Message

```
1. User types message in TrainerChatPanel or DashboardChat
2. Frontend calls Supabase Edge Function: trainer_chat
   POST https://tehcmmctcmmecuzytiec.supabase.co/functions/v1/trainer_chat
   Headers: Authorization: Bearer <user_jwt>
   Body: { message, conversationHistory[], sessionId, moduleId, learningStyle?, workflowContext? }

3. trainer_chat edge function:
   a. Validates JWT via Supabase service role
   b. Loads user profile (department, job_role, AI proficiency, learning style)
   c. Loads AI preferences (tone, verbosity, formatting)
   d. Loads AI memories (Andrea's notes about this user)
   e. COMPLIANCE CHECK: Scans message for PII_SHARING, COMPLIANCE_BYPASS,
      DATA_EXPORT, INAPPROPRIATE_USE patterns (regex + keyword)
      → If flagged: returns complianceFlag response immediately (no LLM call)
   f. RAG RETRIEVAL (with learning style boost):
      i.  Calls OpenAI text-embedding-3-small to embed user message (1536D)
      ii. Calls match_lesson_chunks() Postgres function via RPC
          (cosine similarity search, threshold 0.3, top 6 results,
           filter_learning_style param applies 15% boost for style-matched chunks)
      iii. Formats retrieved chunks as context string
   g. Loads bank policies (up to 10, active only)
   h. Loads lesson content for current module
   i. Builds system prompt (Andrea persona + all context)
   j. Calls Anthropic Claude claude-sonnet-4-20250514 (streaming: false)
      max_tokens: 1000 (greeting mode: 400)
   k. Parses response JSON: reply, suggestedPrompts[], coachingAction,
      hintAvailable, memorySuggestion, complianceFlag, promptSaveSuggestion
   l. Fire-and-forget: writes telemetry to prompt_events table
   m. Returns response JSON to frontend

4. Frontend:
   a. Appends assistant message to conversation history
   b. Persists conversation to Supabase (practice_conversations or
      dashboard_conversations table)
   c. Displays reply with markdown rendering
   d. If memorySuggestion present → shows "Remember this?" UI
   e. If suggestedPrompts[] → shows prompt chips
   f. If complianceFlag → shows compliance warning banner
   g. If promptSaveSuggestion → shows purple "Save to Prompt Library?" card
```

### 3.4 Request Flow — RAG Pipeline (Embedding Generation)

```
Admin Content Entry Flow:
1. Admin triggers seed job from Admin Dashboard (Modules tab)
2. seedAllContent() called — seeds BOTH core sessions AND elective paths

Embedding Generation Flow (seed_lesson_chunks / embed_chunks):
1. seedAllContent():
   a. Calls seedAllLessonChunks() — processes trainingContent.ts (4 core sessions)
   b. Calls seedElectiveChunks() — processes ELECTIVE_PATHS (4 elective paths)
   c. Chunks each module into: overview, key_points, examples, steps, practice_task segments
   d. Sets learning_style column on each chunk (universal by default, or style-specific)
   e. Upserts chunks to lesson_content_chunks table
2. embed_chunks:
   a. Reads unembedded chunks (embedding IS NULL)
   b. Batches chunks in groups of 50
   c. For each batch: calls OpenAI text-embedding-3-small API
   d. Updates lesson_content_chunks.embedding (vector(1536))
   e. 200ms delay between batches (rate limiting)

Retrieval Flow (at chat time):
1. User message embedded via OpenAI (1536D vector)
2. match_lesson_chunks() PG function called with filter_learning_style:
   SELECT *, CASE WHEN learning_style = filter_learning_style OR learning_style = 'universal'
              THEN (1 - embedding <=> query_embedding) * 1.15
              ELSE 1 - (embedding <=> query_embedding)
            END AS similarity
   FROM lesson_content_chunks
   WHERE ... (lesson_id, module_id, similarity threshold filters)
   ORDER BY similarity DESC LIMIT match_count;
3. Top 6 chunks returned (threshold 0.3, topK 6)
4. Chunks formatted and injected into Andrea's system prompt as context
```

---

## 4. Data Flow Diagrams

### 4.1 User Authentication Flow

```
┌──────────┐     1. POST /auth/v1/token    ┌──────────────────┐
│  Browser  │ ──────────────────────────► │  Supabase Auth   │
│           │ ◄────────────────────────── │                  │
│           │    2. JWT (access + refresh)  │                  │
└──────────┘                              └──────────────────┘
     │
     │  3. Store JWT in localStorage
     │
     ▼
┌──────────────────────────────────────────────────────────────┐
│  Supabase JS Client (anon key + JWT in Authorization header)  │
│                                                              │
│  Every subsequent DB query includes JWT for RLS enforcement  │
└──────────────────────────────────────────────────────────────┘
     │
     │  4. Query user_profiles WHERE user_id = auth.uid()
     │
     ▼
┌──────────────────┐
│  PostgreSQL RLS   │
│  auth.uid() must │
│  match user_id   │
└──────────────────┘
```

### 4.2 Full AI Chat Data Flow

```
Browser                  Edge Function              External APIs        Database
  │                       trainer_chat                                      │
  │                           │                                             │
  ├── POST /trainer_chat ──►  │                                             │
  │   {message, history,      │                                             │
  │    sessionId, moduleId,   │                                             │
  │    learningStyle}         │                                             │
  │                           │── SELECT user_profiles ──────────────────► │
  │                           │◄─ {department, job_role, proficiency, style}│
  │                           │                                             │
  │                           │── SELECT ai_user_preferences ────────────► │
  │                           │◄─ {tone, verbosity, formatting} ──────────  │
  │                           │                                             │
  │                           │── SELECT ai_memories (active) ───────────► │
  │                           │◄─ [{content, context}...] ────────────────  │
  │                           │                                             │
  │                           │── SELECT bank_policies (active, limit 10) ► │
  │                           │◄─ [{title, content, summary}...] ─────────  │
  │                           │                                             │
  │                           │── COMPLIANCE CHECK (regex/keyword) ─┐       │
  │                           │   → PII_SHARING detected?            │       │
  │                           │   → COMPLIANCE_BYPASS detected?      │       │
  │                           │   → DATA_EXPORT detected?            │       │
  │                           │   → INAPPROPRIATE_USE detected?      │       │
  │                           │◄─ complianceFlag (if triggered) ─────┘       │
  │                           │                                             │
  │                           │── POST OpenAI /embeddings ──────────────── ► OpenAI
  │                           │   {input: message,                          │
  │                           │    model: text-embedding-3-small}           │
  │                           │◄─ {embedding: float[1536]} ──────────────── │
  │                           │                                             │
  │                           │── RPC match_lesson_chunks ────────────────► │
  │                           │   (query_embedding, topK=6,                 │
  │                           │    threshold=0.3, lessonId, moduleId,       │
  │                           │    filter_learning_style)                   │
  │                           │◄─ [{text, similarity, source}...] ─────────  │
  │                           │                                             │
  │                           │── Build System Prompt ─────────────────────►│
  │                           │   [Andrea persona] + [user profile context] │
  │                           │   + [AI preferences] + [memories]           │
  │                           │   + [RAG chunks, style-boosted] + [policies]│
  │                           │   + [module lesson content]                 │
  │                           │                                             │
  │                           │── POST Anthropic /messages ─────────────── ► Anthropic
  │                           │   {model: claude-sonnet-4-20250514,          │
  │                           │    max_tokens: 1000,                        │
  │                           │    system: <full prompt>,                   │
  │                           │    messages: [{role, content}...]}          │
  │                           │◄─ {reply, suggestedPrompts[],               │
  │                           │    coachingAction, hintAvailable,           │
  │                           │    memorySuggestion,                        │
  │                           │    promptSaveSuggestion}                    │
  │                           │                                             │
  │                           │── INSERT prompt_events (telemetry) ───────► │
  │                           │   (fire-and-forget, no raw content)         │
  │                           │                                             │
  │◄─ {reply, suggestedPrompts[], coachingAction, promptSaveSuggestion, ...}│
  │                           │                                             │
  │── Append to conversation state                                          │
  │── INSERT/UPDATE practice_conversations ──────────────────────────────► │
  │   OR dashboard_conversations                                            │
  │                                                                         │
  │── If promptSaveSuggestion present:                                      │
  │   Show purple "Save to Prompt Library?" card                            │
  │   On accept → INSERT user_prompts ──────────────────────────────────► │
```

### 4.3 Submission Review Data Flow

```
Browser                 Edge Function              Anthropic
  │                    submission_review               │
  │                         │                          │
  ├── POST /submission_review ──►                      │
  │   {conversation[],                                 │
  │    sessionId, moduleId,                            │
  │    userProfile, agentData?}                        │
  │                         │                          │
  │                         │── Detect module type ────►
  │                         │   (2-3, 2-5, 3-3, 3-5)  │
  │                         │── Load rubric for module  │
  │                         │── Build evaluation prompt │
  │                         │── POST /messages ────────► Anthropic
  │                         │◄─ {feedback: {summary,   │
  │                         │    strengths[], issues[], │
  │                         │    fixes[], next_steps[]}}│
  │                         │                          │
  │◄─ {feedback} ───────────                           │
  │                         │                          │
  │── Display structured feedback in TrainerChatPanel  │
  │── UPDATE practice_conversations.is_submitted=true  │
```

### 4.4 Registration Code & Onboarding Flow

```
User Sign-Up Flow:
1. User navigates to /auth
2. Enters email, password, optional registration code
3. Frontend calls validate_registration_code() Postgres function
   → Checks code exists, is_active, not expired, current_uses < max_uses
   → Atomically increments current_uses
   → Returns {valid, organization_id, organization_name, audience_type, industry}
4. Supabase Auth creates user (auth.users)
5. Trigger fires: creates user_profiles row with organization_id
6. Frontend redirects to /onboarding

Onboarding Flow (4 steps):
Step 1: Role & Department selection
   → Updates user_profiles: job_role, department, employer_name
Step 2: Proficiency Assessment (6 scenario questions)
   → 6 dimensions × 4 answer levels (0/2/5/8 points)
   → Composite score 0-8 mapped to proficiency labels
   → Updates user_profiles: ai_proficiency_level
Step 3: Learning Style selection
   → 5 questions → example_based | explanation_based | hands_on | logic_based
   → Updates user_profiles: learning_style
Step 4: Tech Learning Style
   → Additional personalization data
   → Sets onboarding_completed = true
   → Redirects to /dashboard
```

### 4.5 Agent Build & Deployment Flow

```
Agent Studio:
1. User opens Agent Studio panel in Session 2, Module 2-3
2. Selects Guided or Advanced mode

   Guided Mode:
   → Fills AgentTemplateBuilder accordion (5 sections)
   → useEffect auto-saves on every change (500ms debounce in Advanced)
   → assembleSystemPrompt() constructs final system prompt from template

   Advanced Mode:
   → Direct freeform system prompt textarea
   → 1.5s debounce auto-save

3. User saves draft → INSERT user_agents (status: draft)
4. User switches to "Test" tab in AgentStudioPanel
5. User sends test messages → POST agent-test-chat edge function
   → agent-test-chat wraps user's system_prompt with banking meta-context
   → Calls Anthropic Claude claude-sonnet-4
   → Streams response back
   → INSERT agent_test_conversations
6. User reviews test results, iterates on prompt
7. User clicks Deploy → UPDATE user_agents (status: active, is_deployed: true)
8. In Capstone (Session 3):
   → ai-practice edge function uses deployed agent's system_prompt
   → User practices against their own AI agent
```

---

## 5. Database Schema

### 5.1 Overview

The database is PostgreSQL 15 hosted on Supabase Cloud. Row Level Security (RLS) is enabled on all tables. All user-facing tables are protected so users can only access their own data. Admin access is controlled via the `user_roles` table and SECURITY DEFINER functions.

**pgvector** extension is installed for semantic similarity search on lesson content embeddings.

**v3 org isolation:** New helper functions `get_my_org_id()` and `is_super_admin()` power updated RLS policies that scope admin queries to the admin's own organization, with super admin bypass.

### 5.2 Table: `user_profiles`

Stores learner profile data, set during onboarding and updated throughout training.

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid (PK) | Supabase row ID |
| `user_id` | uuid (FK → auth.users) | Supabase Auth user ID |
| `display_name` | text | User's display name |
| `department` | text | Department / Line of Business (**v3** renamed from `line_of_business`) |
| `job_role` | text | Job role within the organization (**v3** renamed from `bank_role`) |
| `learning_style` | text | example_based / explanation_based / hands_on / logic_based |
| `ai_proficiency_level` | integer | Score 0-8 from proficiency assessment |
| `onboarding_completed` | boolean | Whether onboarding flow is complete |
| `current_session` | integer | Current training session (1-4) |
| `employer_name` | text | Institution/employer name (**v3** renamed from `employer_bank_name`) |
| `tour_completed` | boolean | Whether legacy product tour was completed |
| `tours_completed` | jsonb | **v3** — Per-tour completion map e.g. `{"dashboard": true, "admin": true}` |
| `organization_id` | uuid (FK → organizations) | Multi-tenant org assignment |
| `last_login_at` | timestamptz | Last login timestamp |
| `created_at` | timestamptz | Profile creation timestamp |
| `updated_at` | timestamptz | Last update timestamp |

**RLS Policies (v3 updated):**
- `SELECT`: `auth.uid() = user_id` OR `is_super_admin()` OR admin in same org via `get_my_org_id()`
- `INSERT`: `auth.uid() = user_id`
- `UPDATE`: `auth.uid() = user_id`

### 5.3 Table: `training_progress`

Tracks completion status for all four training sessions per user.

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid (PK) | Row ID |
| `user_id` | uuid (FK → auth.users) | User |
| `session_1_completed` | boolean | Session 1 fully completed |
| `session_2_completed` | boolean | Session 2 fully completed |
| `session_3_completed` | boolean | Session 3 fully completed |
| `session_4_completed` | boolean | Session 4 fully completed |
| `session_1_progress` | jsonb | Module-level progress data for Session 1 |
| `session_2_progress` | jsonb | Module-level progress data for Session 2 |
| `session_3_progress` | jsonb | Module-level progress data for Session 3 |
| `session_4_progress` | jsonb | Module-level progress data for Session 4 |
| `created_at` | timestamptz | Created |
| `updated_at` | timestamptz | Updated |

**Progress JSONB structure (per session):**
```json
{
  "completedModules": ["1-1", "1-2", "1-3"],
  "moduleEngagement": {
    "1-1": {
      "messagesExchanged": 12,
      "hintsUsed": 2,
      "timeSpentMinutes": 8,
      "submittedForReview": true
    }
  }
}
```

### 5.4 Table: `bank_policies`

Stores bank policy documents that Andrea uses as context during coaching.

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid (PK) | Row ID |
| `policy_type` | text | Category (AI Use Policy, Data Privacy, etc.) |
| `title` | text | Policy document title |
| `content` | text | Full policy text |
| `summary` | text | AI-generated 2-3 sentence summary |
| `icon` | text | Lucide icon name for display |
| `display_order` | integer | Sort order in policies list |
| `is_active` | boolean | Whether policy is shown to users |
| `source_file_path` | text | Storage path if uploaded as file |
| `created_at` | timestamptz | Created |
| `updated_at` | timestamptz | Updated |

**RLS:** SELECT open to authenticated users; INSERT/UPDATE/DELETE admin only.

### 5.5 Table: `user_roles`

Controls admin access via role enum.

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid (PK) | Row ID |
| `user_id` | uuid (FK → auth.users) | User |
| `role` | app_role enum | 'admin' or 'user' |
| `created_at` | timestamptz | Created |

**app_role enum:** `admin | user`

**Security functions:**
```sql
CREATE FUNCTION has_role(_user_id uuid, _role app_role)
RETURNS boolean SECURITY DEFINER
AS $$ SELECT EXISTS (SELECT 1 FROM user_roles WHERE user_id = _user_id AND role = _role) $$;

CREATE FUNCTION get_user_role(_user_id uuid)
RETURNS app_role SECURITY DEFINER
AS $$ SELECT role FROM user_roles WHERE user_id = _user_id LIMIT 1 $$;

-- v3 new helpers for org-scoped RLS:
CREATE FUNCTION get_my_org_id()
RETURNS uuid SECURITY DEFINER
AS $$ SELECT organization_id FROM user_profiles WHERE user_id = auth.uid() LIMIT 1 $$;

CREATE FUNCTION is_super_admin()
RETURNS boolean SECURITY DEFINER
AS $$ SELECT EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'super_admin') $$;
```

### 5.6 Table: `lesson_content_chunks`

Stores chunked, embedded lesson content for RAG retrieval.

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid (PK) | Row ID |
| `lesson_id` | text | Lesson identifier (e.g., "session1-lesson1") |
| `module_id` | text | Module identifier (e.g., "1-1") |
| `chunk_index` | integer | Order within lesson |
| `chunk_type` | text | overview / key_points / example / steps / practice_task |
| `text` | text | Raw chunk content |
| `source` | text | Source reference label |
| `metadata` | jsonb | Additional metadata |
| `embedding` | vector(1536) | OpenAI text-embedding-3-small vector |
| `learning_style` | text | universal / example_based / explanation_based / hands_on / logic_based |
| `created_at` | timestamptz | Created |
| `updated_at` | timestamptz | Updated |

**Indexes:**
```sql
-- HNSW index for fast cosine similarity search
CREATE INDEX lesson_chunks_embedding_idx
ON lesson_content_chunks USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);

-- B-tree index for learning_style filter
CREATE INDEX IF NOT EXISTS idx_chunks_learning_style
ON public.lesson_content_chunks(learning_style);
```

**Key function (with learning style boost):**
```sql
CREATE OR REPLACE FUNCTION public.match_lesson_chunks(
  query_embedding extensions.vector(1536),
  match_count int DEFAULT 6,
  filter_lesson_id text DEFAULT NULL,
  filter_module_id text DEFAULT NULL,
  similarity_threshold float DEFAULT 0.3,
  filter_learning_style text DEFAULT 'universal'
)
RETURNS TABLE (id uuid, text text, source text, metadata jsonb, similarity float)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT lcc.id, lcc.text, lcc.source, lcc.metadata,
    CASE
      WHEN lcc.learning_style = filter_learning_style
           OR lcc.learning_style = 'universal'
      THEN (1 - (lcc.embedding <=> query_embedding)) * 1.15
      ELSE 1 - (lcc.embedding <=> query_embedding)
    END AS similarity
  FROM public.lesson_content_chunks lcc
  WHERE
    lcc.embedding IS NOT NULL
    AND (filter_lesson_id IS NULL OR lcc.lesson_id = filter_lesson_id)
    AND (filter_module_id IS NULL OR lcc.module_id = filter_module_id)
    AND 1 - (lcc.embedding <=> query_embedding) > similarity_threshold
  ORDER BY similarity DESC
  LIMIT match_count;
END;
$$;
```

### 5.7 Table: `ai_user_preferences`

Stores each user's Andrea AI communication preferences.

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid (PK) | Row ID |
| `user_id` | uuid (FK → auth.users) | User |
| `tone` | text | professional / conversational / direct / encouraging |
| `verbosity` | text | brief / moderate / detailed |
| `formatting_preference` | text | plain / structured / visual |
| `role_context` | text | Free-text role context for Andrea |
| `additional_instructions` | text | Free-text custom instructions |
| `created_at` | timestamptz | Created |
| `updated_at` | timestamptz | Updated |

### 5.8 Table: `ai_memories`

Stores Andrea's persistent notes about individual users.

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid (PK) | Row ID |
| `user_id` | uuid (FK → auth.users) | User |
| `content` | text | The memory text |
| `source` | text | How memory was created (andrea_suggestion / manual) |
| `context` | text | Module/context where memory was created |
| `is_pinned` | boolean | Pinned memories shown prominently |
| `is_active` | boolean | Soft delete flag |
| `created_at` | timestamptz | Created |
| `updated_at` | timestamptz | Updated |

**RLS:** User can only read/write their own memories.

### 5.9 Table: `prompt_events`

Telemetry table for tracking AI interactions. **No raw prompt content is stored.**

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid (PK) | Row ID |
| `user_id` | uuid (FK → auth.users) | User |
| `session_id` | text | Training session ID |
| `module_id` | text | Training module ID |
| `event_type` | text | message_sent / submission / hint_used / compliance_flag |
| `exception_flag` | boolean | Whether a compliance exception was detected |
| `exception_type` | text | PII_SHARING / COMPLIANCE_BYPASS / DATA_EXPORT / INAPPROPRIATE_USE |
| `created_at` | timestamptz | Created |

**Note:** This table contains NO raw prompt or response content — only metadata for analytics.

### 5.10 Table: `practice_conversations`

Stores practice conversation histories for each training module.

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid (PK) | Row ID |
| `user_id` | uuid (FK → auth.users) | User |
| `session_id` | text | Training session ID (or `elective_<pathId>` for elective modules) |
| `module_id` | text | Training module ID |
| `title` | text | Conversation title |
| `messages` | jsonb | Full conversation history array |
| `is_submitted` | boolean | Whether submitted for review |
| `created_at` | timestamptz | Created |
| `updated_at` | timestamptz | Updated |

**Messages JSONB structure:**
```json
[
  {
    "role": "user",
    "content": "Help me write a prompt for...",
    "timestamp": "2026-02-22T10:30:00Z"
  },
  {
    "role": "assistant",
    "content": "Great question! Here's how...",
    "timestamp": "2026-02-22T10:30:05Z",
    "coachingAction": "GUIDED_HINT",
    "complianceFlag": null,
    "suggestedPrompts": ["Try adding context...", "What if you specified..."],
    "promptSaveSuggestion": {
      "promptText": "As a [role] at [bank], help me...",
      "suggestedTitle": "Loan Summary Prompt",
      "suggestedCategory": "Lending"
    }
  }
]
```

**Note:** Elective workspace conversations use synthetic session IDs in the format `elective_<pathId>` (e.g., `elective_advanced-prompting`).

### 5.11 Table: `organizations`

Multi-tenant organization registry.

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid (PK) | Row ID |
| `name` | text | Organization display name |
| `slug` | text (UNIQUE) | URL-safe identifier |
| `audience_type` | text | **v3** renamed from `org_type` — `enterprise` or `consumer` |
| `industry` | text | **v3** new — industry category (e.g., `banking`, `credit_union`) |
| `created_at` | timestamptz | Created |
| `updated_at` | timestamptz | Updated |

### 5.12 Table: `registration_codes`

Invitation codes that link new users to organizations.

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid (PK) | Row ID |
| `code` | text (UNIQUE) | The invitation code string |
| `organization_id` | uuid (FK → organizations) | Which org this code belongs to |
| `expires_at` | timestamptz | Code expiration (nullable = never expires) |
| `max_uses` | integer | Maximum number of uses (nullable = unlimited) |
| `current_uses` | integer | Current use count |
| `is_active` | boolean | Whether code is currently active |
| `created_by` | uuid (FK → auth.users) | Admin who created it |
| `created_at` | timestamptz | Created |

**Key function (v3 updated — now returns audience_type and industry):**
```sql
CREATE FUNCTION validate_registration_code(input_code text)
RETURNS jsonb SECURITY DEFINER AS $$
...
  RETURN jsonb_build_object(
    'valid', true,
    'organization_id', v_code.organization_id,
    'organization_name', v_org.name,
    'audience_type', v_org.audience_type,   -- v3 new
    'industry', v_org.industry              -- v3 new
  );
...
$$ LANGUAGE plpgsql;
```

### 5.13 Table: `user_agents`

Stores AI agents built by learners in the Agent Studio.

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid (PK) | Row ID |
| `user_id` | uuid (FK → auth.users) | Agent owner |
| `name` | text | Agent name |
| `status` | text | draft / testing / active / archived |
| `template_data` | jsonb | Guided mode structured template |
| `system_prompt` | text | Final assembled system prompt |
| `version` | integer | Version number |
| `is_deployed` | boolean | Whether agent is active for practice |
| `is_shared` | boolean | Whether shared with community |
| `parent_version_id` | uuid | Previous version reference |
| `created_at` | timestamptz | Created |
| `updated_at` | timestamptz | Updated |

**template_data JSONB structure (Guided mode):**
```json
{
  "agentName": "Loan Advisor AI",
  "agentRole": "You are an AI assistant for commercial loan advisors...",
  "taskList": ["Help draft loan memos", "Summarize financial statements"],
  "outputRules": ["Always cite sources", "Use bullet points"],
  "guardRails": ["Never share client PII", "Always recommend human review"],
  "complianceAnchors": ["Follow BSA/AML", "Comply with Reg E"]
}
```

### 5.14 Table: `agent_test_conversations`

Stores test conversation histories for agents under development.

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid (PK) | Row ID |
| `user_id` | uuid (FK → auth.users) | User |
| `agent_id` | uuid (FK → user_agents) | Agent being tested |
| `test_type` | text | freeform / standard / edge / out_of_scope |
| `messages` | jsonb | Conversation history |
| `result` | text | pass / fail / partial |
| `evaluation_notes` | text | Test evaluation notes |
| `created_at` | timestamptz | Created |

### 5.15 Table: `dashboard_conversations`

Stores Andrea chat conversation histories from the main dashboard.

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid (PK) | Row ID |
| `user_id` | uuid (FK → auth.users) | User |
| `title` | text | Auto-generated or user-named title |
| `messages` | jsonb | Full conversation history |
| `created_at` | timestamptz | Created |
| `updated_at` | timestamptz | Updated |

**Implementation note:** The `useDashboardConversations.appendMessage` function performs its Supabase write inside the React `setState` updater closure to capture the correct `messagesForDb` value synchronously and avoid a race condition where the write would use a stale empty array. See v2 fix in section 8.6.

### 5.16 Table: `community_topics`

Stores Community Hub discussion threads.

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid (PK) | Row ID |
| `user_id` | uuid (FK → auth.users) | Author |
| `author_name` | text | Display name at post time |
| `author_role` | text | Bank role at post time |
| `title` | text | Thread title |
| `body` | text | Thread content (may include `[attachments:url1,url2]` suffix) |
| `reply_count` | integer | Denormalized reply count |
| `created_at` | timestamptz | Created |
| `updated_at` | timestamptz | Updated |

**Attachment format in body:**
```
This is my post about AI prompting in commercial banking.
Check out these resources. [attachments:https://example.com/guide.pdf,https://example.com/tips.html]
```
The `parseBodyAndAttachments()` function in `CommunityFeed.tsx` splits on `[attachments:...]` to display links separately.

### 5.17 Table: `community_replies`

Stores replies to Community Hub threads.

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid (PK) | Row ID |
| `topic_id` | uuid (FK → community_topics) | Parent thread |
| `user_id` | uuid (FK → auth.users) | Author |
| `author_name` | text | Display name at reply time |
| `author_role` | text | Bank role at reply time |
| `body` | text | Reply content |
| `created_at` | timestamptz | Created |

### 5.18 Table: `live_training_sessions`

Admins schedule live training events shown on the dashboard.

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid (PK) | Row ID |
| `title` | text | Session title |
| `description` | text | Session description |
| `instructor` | text | Instructor name |
| `scheduled_date` | timestamptz | Event date/time |
| `duration_minutes` | integer | Duration |
| `max_attendees` | integer | Capacity limit |
| `is_active` | boolean | Whether shown to users |
| `created_at` | timestamptz | Created |

### 5.19 Table: `user_ideas`

Community idea submission and voting board (AI use case ideas).

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid (PK) | Row ID |
| `user_id` | uuid (FK → auth.users) | Submitter |
| `title` | text | Idea title |
| `description` | text | Full description |
| `status` | text | pending / approved / in_review / implemented |
| `votes` | integer | Upvote count |
| `roi_impact` | text | Low / Medium / High |
| `category` | text | Efficiency / Customer Experience / Risk / etc. |
| `submitter_name` | text | Display name |
| `submitter_department` | text | Department |
| `created_at` | timestamptz | Created |
| `updated_at` | timestamptz | Updated |

### 5.20 Table: `app_settings`

Key-value store for platform configuration.

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid (PK) | Row ID |
| `key` | text (UNIQUE) | Setting key |
| `value` | text | Setting value |
| `description` | text | Human-readable description |
| `created_at` | timestamptz | Created |
| `updated_at` | timestamptz | Updated |

### 5.21 Table: `events`

General events calendar (different from live_training_sessions).

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid (PK) | Row ID |
| `title` | text | Event title |
| `event_type` | text | webinar / workshop / training / other |
| `scheduled_date` | timestamptz | Event date/time |
| `duration_minutes` | integer | Duration |
| `location` | text | Location or video URL |
| `instructor` | text | Instructor/host |
| `live_session_id` | uuid (FK → live_training_sessions) | Linked session |
| `created_at` | timestamptz | Created |

### 5.22 Table: `user_workflows`

Stores multi-step AI workflows built in the Workflow Studio.

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid (PK) | Row ID |
| `user_id` | uuid (FK → auth.users) | Owner |
| `name` | text | Workflow name |
| `status` | text | draft / active / archived |
| `workflow_data` | jsonb | Full workflow definition |
| `module_id` | text | Associated training module |
| `created_at` | timestamptz | Created |
| `updated_at` | timestamptz | Updated |

### 5.23 Table: `user_prompts`

Stores the user's personal Prompt Library — high-quality prompts saved from training or created manually.

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid (PK) | Row ID |
| `user_id` | uuid (FK → auth.users) | Owner |
| `title` | text | Prompt display title |
| `content` | text | Full prompt text |
| `category` | text | Category label (e.g., Lending, Compliance, Analytics) |
| `tags` | text[] | Optional tag array for filtering |
| `source` | text | Where it came from (e.g., `session1-1-1`, `elective-advanced-prompting-ep-1`) |
| `is_favorite` | boolean | Favorited by user |
| `created_at` | timestamptz | Created |
| `updated_at` | timestamptz | Updated |

**RLS:** User can only read/write/delete their own prompts.

### 5.24 Table: `elective_progress`

Tracks completion status for elective modules per learner.

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid (PK) | Row ID |
| `user_id` | uuid (FK → auth.users) | User |
| `path_id` | text | Elective path ID (e.g., `advanced-prompting`) |
| `module_id` | text | Elective module ID |
| `completed` | boolean | Whether module is marked complete |
| `progress_data` | jsonb | Additional per-module progress metadata |
| `created_at` | timestamptz | Created |
| `updated_at` | timestamptz | Updated |

### 5.25 Table: `org_resources` *(v3 new)*

Admin-managed resource links shown to learners within their organization.

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid (PK) | Row ID |
| `organization_id` | uuid (FK → organizations) | Owning organization |
| `title` | text | Resource display title |
| `description` | text | Short description |
| `resource_type` | text | Type classification (e.g., guide, video, policy) |
| `url` | text | Resource URL |
| `display_order` | integer | Sort order |
| `active` | boolean | Whether visible to users |
| `created_at` | timestamptz | Created |
| `updated_at` | timestamptz | Updated |

**RLS:**
- `SELECT`: Authenticated users can view active resources in their own org
- `INSERT/UPDATE/DELETE`: Admins in the same org only

---

## 6. Edge Functions

All edge functions run on Deno runtime deployed to Supabase Edge Functions (Deno Deploy). They all share the same CORS configuration allowing requests from any origin, with JWT-based authentication via the Supabase Authorization header.

**Shared environment variables available to all edge functions:**
- ANTHROPIC_API_KEY — Anthropic Claude API key
- OPENAI_API_KEY — OpenAI embeddings API key
- SUPABASE_URL — Supabase project URL
- SUPABASE_ANON_KEY — Supabase anonymous/public key
- SUPABASE_SERVICE_ROLE_KEY — Supabase service role key (full bypass of RLS)

**Current edge functions (15 total):**
`trainer_chat`, `submission_review`, `ai-practice`, `agent-test-chat`, `workflow-test-chat`, `practice_chat`, `ai-trainer`, `generate-lesson`, `embed_chunks`, `seed_lesson_chunks`, `parse-policy-document`, `intake-prompt-score`, `admin-create-user`, `admin-delete-user`, `_shared` (utilities)

---

### 6.1 trainer_chat — Andrea's Brain

**File:** supabase/functions/trainer_chat/index.ts
**Purpose:** Primary AI coaching function. Every message to Andrea (whether in training workspace, elective workspace, or dashboard) routes through this function.
**Model:** claude-sonnet-4-20250514 (max_tokens: 1000; greeting mode: 400)

#### Request Schema

```typescript
{
  lessonId: string;           // e.g., '1', '2', '3', '4', or 'dashboard'
  moduleId?: string;          // e.g., '1-3', '2-5', 'ep-1'
  sessionNumber?: number;     // 1 | 2 | 3 | 4
  messages: Message[];        // Full conversation history
  greeting?: boolean;         // If true: generate personalized greeting
  practiceConversation?: Message[];  // Center-panel practice chat (for review)
  agentContext?: AgentContext;       // Agent Studio current agent data
  workflowContext?: WorkflowContext; // Workflow Studio current workflow data
  learnerState?: {
    currentCardTitle?: string;
    progressSummary?: string;
    completedModules?: string[];
    displayName?: string;
    jobRole?: string;
    department?: string;
  };
  userId?: string;  // Body fallback if JWT auth fails
}
```

#### Response Schema

```typescript
{
  reply: string;                    // Andrea's response (markdown-capable)
  suggestedPrompts: string[];       // 2-3 follow-up prompt chips
  coachingAction: string;           // socratic|explain|review|celebrate|redirect
  hintAvailable: boolean;           // If true, show Get hint button
  memorySuggestion?: {
    content: string;
    reason: string;
  };
  complianceFlag?: {
    type: string;
    severity: 'info'|'warning'|'critical';
    message: string;
  };
  promptSaveSuggestion?: {
    promptText: string;
    suggestedTitle: string;
    suggestedCategory: string;
  };
}
```

#### Processing Pipeline

1. **JWT validation** - Extracts user ID from Bearer token
2. **Profile load** - Fetches user_profiles (learning_style, ai_proficiency_level, display_name, job_role, department, employer_name)
3. **Preferences load** - Fetches ai_user_preferences
4. **Memory load** - Fetches ai_memories (active, up to 15, pinned first)
5. **Compliance check** - Regex/keyword scan of latest user message (see section 7.3)
6. **RAG retrieval** - Embeds user message via OpenAI, calls match_lesson_chunks() RPC with `filter_learning_style` from user profile for 15% boost on style-matched chunks
7. **Policy load** - Fetches bank_policies (active, ordered by display_order)
8. **System prompt assembly** - Combines all sections (see section 7 for full prompt)
9. **Claude API call** - Sends assembled prompt + conversation history
10. **Response parse** - Extracts JSON from Claude response; extracts `promptSaveSuggestion` if present
11. **Telemetry write** - Fire-and-forget INSERT to prompt_events
12. **Return** - Sends parsed response to frontend

---

### 6.2 submission_review — Grading Engine

**File:** supabase/functions/submission_review/index.ts
**Purpose:** Evaluates learner practice submissions and returns structured feedback.
**Model:** claude-sonnet-4-20250514 (max_tokens: 1200)

#### Module-Specific Rubrics

**Module 2-3 / 2-5 (Agent Building):**
- Identity (20%): Role, department, audience, purpose defined
- Task List (25%): at least 2 specific banking tasks with formats and constraints
- Output Rules (15%): at least 2 formatting/behavior rules
- Guard Rails (25%): at least 2 guard rails with alternative responses
- Compliance Anchors (15%): at least 1 exact regulatory phrase

**Module 3-3 (Workflow):**
- Trigger (15%): Specific banking event
- Steps (30%): at least 3 distinct steps with AI + human roles
- Review Checkpoints (25%): at least 2 human review points
- Prompt Templates (20%): Ready-to-use AI prompt in each step
- Final Output (10%): Clear deliverable description

**Module 3-5 (Capstone):**
- CLEAR Framework (20%): Context, Length, Examples, Audience, Role
- Advanced Technique (20%): Chain-of-thought, multi-shot, or self-review
- Compliance Awareness (20%): Data handling, decision boundaries, documentation
- Department Relevance (20%): Specific to real banking function
- Reflection Quality (20%): Honest identification of strengths and limitations

---

### 6.3 ai-practice — Real AI Simulation

**File:** supabase/functions/ai-practice/index.ts
**Purpose:** Simulates a real AI tool for learners to practice prompting against. No coaching.
**Model:** claude-sonnet-4-20250514 (max_tokens: 1500)

**Mode 1 — Custom Agent (Session 3):** Uses learner's deployed agent system prompt.
**Mode 2 — Generic Banking AI (Sessions 1-2):** Mirrors prompt quality behavior.

Key rule: vague prompts get generic responses; specific prompts get tailored responses. This teaches learners that prompt specificity directly affects output quality.

---

### 6.4 agent-test-chat — Agent Development Testing

**File:** supabase/functions/agent-test-chat/index.ts
**Purpose:** Tests a user's AI agent during development in Agent Studio.
**Model:** claude-sonnet-4-20250514 (max_tokens: 1500)

The user's system prompt is wrapped with meta-instructions ensuring: stay in character, banking realism, follow guard rails, mirror prompt quality.

---

### 6.5 workflow-test-chat — Workflow Step Testing

**File:** supabase/functions/workflow-test-chat/index.ts
**Purpose:** Tests individual steps of a multi-step AI workflow with context chaining.
**Model:** claude-sonnet-4-20250514 (max_tokens: 1500)

Receives previousStepOutputs[] to chain outputs from prior steps into the current step's context.

---

### 6.6 practice_chat

**File:** supabase/functions/practice_chat/index.ts
**Model:** claude-sonnet-4-20250514 (max_tokens: 1500)
Sessions 1-2 practice AI interface.

---

### 6.7 ai-trainer — Legacy Coaching

**Model:** google/gemini-3-flash-preview via Lovable gateway (max_tokens: 800)
Superseded by trainer_chat for primary coaching.

---

### 6.8 generate-lesson

**Model:** google/gemini-3-flash-preview (max_tokens: 5000, temperature: 0.7)
Admin-triggered AI lesson generation.

---

### 6.9 embed_chunks

**Model:** OpenAI text-embedding-3-small (dimensions: 1536, batch size 50, 200ms delay)
Generates and stores embeddings for lesson content chunks.

---

### 6.10 seed_lesson_chunks

Reads training content definitions and chunks them. Chunk types per module: overview, key_points, individual examples, steps, practice_task. The frontend calls `seedAllContent()` which invokes this function for both core sessions and elective paths.

---

### 6.11 parse-policy-document

**Models:** gemini-2.5-flash (extraction) and gemini-2.5-flash-lite (summary)
Admin-only PDF/DOCX policy parser. JWT verification disabled; performs own has_role() check.
**Storage:** policy-documents bucket (private, admin-only).

---

### 6.12 intake-prompt-score

**Purpose:** Scores user-written prompts during the onboarding intake questionnaire.
**Model:** claude-sonnet-4-20250514

---

### 6.13 admin-create-user / admin-delete-user

Admin-only functions for user account management. Bypass normal auth flow using service role key.

---

## 7. Andrea AI Persona

### 7.1 Overview

Andrea is the AI training coach persona built on top of Anthropic Claude claude-sonnet-4-20250514. She is not a separate model — she is a carefully constructed dynamic system prompt that shapes Claude behavior for banking AI training coaching. Every interaction with Andrea passes through the trainer_chat edge function, which assembles her complete system prompt in real time based on user context.

### 7.2 The Five Persona Anchors (Never Break Character)

```
You are Andrea, an AI Training Coach for banking professionals learning to use AI effectively.

## WHO YOU ARE — 5 PERSONA ANCHORS (Never break character)

1. DIRECT BUT WARM: You don't hedge or over-qualify. When something needs fixing,
   you say so — kindly, but clearly. You never say "Great job!" when the work needs
   improvement. You say "That's close — the compliance clause is missing. Here's why
   it matters."

2. BANKING-SAVVY: You speak banking naturally. You reference credit committees,
   BSA/AML reviews, loan documentation, board reports, and regulatory examinations
   like someone who's been in the industry. Use real banking vocabulary — don't
   genericize. Say "underwriting memo" not "professional document."

3. QUIETLY ENCOURAGING: You celebrate progress with specifics, not hollow praise.
   Instead of "Great work!", say "Your output format is much tighter than your first
   attempt — the tabular layout works well for credit summaries." Action-empathy over
   hollow-empathy.

4. SOLUTION-FOCUSED: Every critique comes with a concrete path forward. Never point
   out a problem without immediately suggesting how to fix it. "The tone is too casual
   for a board report. Try framing the opening as: [specific suggestion]."

5. KNOWS SHE'S AI: You're honest about what you are. You don't pretend to have worked
   at a bank. You say things like "I can't review your actual loan file, but I can help
   you build the prompt that would." This builds trust through transparency.
```

### 7.3 Compliance Detection (Pre-LLM Filter)

Before any Claude API call, the compliance detection layer scans the latest user message for four categories of issues using regex and keyword matching:

| Detection Type | Patterns Checked | Severity |
|---------------|---------|----------|
| PII Sharing | SSN regex `\d{3}-?\d{2}-?\d{4}`, account numbers `account\s*#?\s*\d{6,}`, routing numbers `routing\s*#?\s*\d{9}`, credit card numbers `\d{13,19}` | CRITICAL |
| Compliance Bypass | Keywords: "skip compliance", "ignore policy", "bypass", "skip the review", "without approval", "skip audit", "no need to check", "forget the rules" | WARNING |
| Data Export | Phrases: "export all customer", "download all", "extract all records", "bulk export", "dump the database", "scrape all" | WARNING |
| Inappropriate Use | Phrases: "write my resignation", "personal tax", "my homework", "not work related", "personal use", "for my side business" | INFO |

When a compliance flag is detected:
- The flag metadata is added to the system prompt as a COMPLIANCE COACHING REQUIRED block
- Andrea MUST address the compliance issue first before anything else
- Telemetry is written to `prompt_events` with `exception_flag=true`
- A `complianceFlag` object is returned for the frontend to display a banner

### 7.4 Socratic Coaching Rule

```
When a learner asks a conceptual question (e.g., "How do I write a good prompt?"):
1. Respond with ONE clarifying question first to understand their specific context.
2. THEN tailor your explanation to their answer.

EXCEPTIONS — give the direct answer immediately if:
- They've already provided their specific context/scenario in the question
- They explicitly say "just tell me" or "give me the answer"
- They're on attempt 3+ of the same task (they're stuck, not exploring)
- They're asking about a factual/procedural topic with one right answer
- The conversation already has 4+ messages (context has been established)
```

### 7.5 Session-Aware Coaching Depth

| Session | Mode | Behavior |
|---------|------|----------|
| Session 1 | HAND-HOLDING | Explain concepts thoroughly. Assume learner has never prompted an AI. Offer examples proactively. Frame mistakes as "most people start here." Suggest next steps clearly. |
| Session 2 | COLLABORATIVE | Ask before telling. Reference Session 1 concepts. Give hints, not answers. Push specificity. |
| Session 3 | PEER | Challenge their thinking. More direct and concise. Push for production quality. Learner should be driving. |
| Session 4 / Electives | ADVISOR | Deep-dive expertise. Peer-level challenge. Assume strong foundational skills. Focus on mastery and nuance. |

### 7.6 Learning Style Adaptations

| Style | Approach |
|-------|---------|
| example_based | Lead with a concrete, relatable banking example FIRST. Then short explanation of why the example works. End with a quick check question. |
| explanation_based | Start with clear, comprehensive explanation. Break down concepts step-by-step. Provide context and "why" before "how". End with brief recap. |
| logic_based | Begin with the underlying reasoning and principles. Present rules and frameworks systematically. Include verification steps and edge cases. |
| hands_on | Keep exposition minimal. Provide short checklist of action items. Give a tiny task or exercise to try immediately. Focus on practical application over theory. |

**Learning Style RAG Boost:** RAG retrieval uses the learner's `learning_style` to boost cosine similarity scores by 15% for chunks tagged with the matching style or `universal`. This means style-relevant content surfaces higher in Andrea's context window even when raw similarity is similar across styles.

Secondary **Tech Learning Style** (for explaining AI tool concepts specifically):
- Demo-First: Show the tool in action before explaining how it works
- Documentation-First: Explain how the feature works before demonstrating
- Architecture-First: Explain system components and how they connect
- Explore-First: Give the learner something to click or try immediately

### 7.7 Proficiency Level Adaptation (0-8 Scale)

| Level | Label | Andrea Behavior |
|-------|-------|----------------|
| 0-2 | Beginner | Simple everyday language. Define AI terms when used. More hand-holding and step-by-step guidance. Assume minimal prior AI experience. Use analogies. Be encouraging and patient. |
| 3-5 | Intermediate | Moderate technical language with brief clarifications. Assume familiarity with basic AI concepts. Balance explanation with practical application. |
| 6-8 | Advanced | Precise technical language freely. Assume strong AI literacy. Focus on nuance, edge cases, and optimization. Skip basic explanations. |

### 7.8 Dashboard Mode (Navigator Mode)

When `lessonId === 'dashboard'`, Andrea skips RAG retrieval and bank policy injection entirely. Instead she injects the complete curriculum module map (all 22 core modules across 4 sessions) and operates under these constraints:
- Keep responses to 2-3 sentences max — this is a quick-help context, not a lesson
- Direct them to specific modules when they ask about topics
- If they ask "where should I start?" — check their progress and suggest the next uncompleted module
- Reference completed modules to avoid repeating content

### 7.9 Memory System

Andrea maintains persistent memories about each user through the `ai_memories` table. Memory suggestion is included in her JSON response when she detects a noteworthy insight.

The `memorySuggestion` object format:
```json
{
  "content": "Prefers structured prompts with role + task + context format",
  "reason": "This is worth saving so I can tailor future coaching to your preference"
}
```

The learner sees a "Remember this?" dialog and can accept or dismiss. If accepted, the content is written to `ai_memories` with `source='andrea_suggestion'`.

### 7.10 Prompt Save Suggestion

When Andrea identifies a well-crafted prompt in the learner's practice conversation (approximately 1 in 5-10 messages for particularly strong prompts), she includes a `promptSaveSuggestion` field in her response JSON:

```json
{
  "promptSaveSuggestion": {
    "promptText": "As a [Commercial Lending Officer] at [Bank Name], review this loan application...",
    "suggestedTitle": "Loan Application Review Prompt",
    "suggestedCategory": "Lending"
  }
}
```

The frontend shows a purple "Save to Prompt Library?" card with:
- The suggested title and a BookOpen icon
- One-click "Save prompt" button → calls `useUserPrompts.createPrompt()` → inserts to `user_prompts`
- "Dismiss" button
- Green confirmation message after save

This is active in both `TrainingWorkspace` and `ElectiveWorkspace`.

### 7.11 Complete System Prompt Section Order

When fully assembled, the Andrea system prompt contains these sections in order:

| # | Section | Always Present? |
|---|---------|----------------|
| 1 | Andrea Persona Block (5 anchors) | Yes |
| 2 | Socratic Coaching Rules | Yes |
| 3 | Session Coaching Depth | Yes |
| 4 | Response Format (JSON schema with field definitions, incl. promptSaveSuggestion) | Yes |
| 5 | Compliance Coaching Block | Only if compliance flag detected in this message |
| 6 | Learning Style Instructions | Yes |
| 7 | Tech Learning Style Instructions | Only if tech_learning_style set on profile |
| 8 | Proficiency Level Instructions | Yes |
| 9 | RAG Context (retrieved lesson chunks, style-boosted) | Yes (or "no content available" fallback) |
| 10 | Bank Policies | If active policies exist in bank_policies table |
| 11 | User AI Preferences | If preferences set on ai_user_preferences |
| 12 | Learner Memories | If user has active memories in ai_memories |
| 13 | Practice Conversation | If learner has messages in center-panel practice chat |
| 14 | Agent Context | If Agent Studio is active (Session 2+) |
| 15 | Workflow Context | If Workflow Studio is active (Session 3) |
| 16 | Current Context (session, module, user metadata) | Yes |
| 17 | 10 Critical Rules | Yes |

### 7.12 The 10 Critical Rules (Always Appended)

```
1. ALWAYS respond with valid JSON containing ALL required fields
2. Keep replies concise (2-3 sentences) unless reviewing practice work or showing examples
3. Give ONE actionable suggestion at a time, not a list
4. Follow the SOCRATIC COACHING RULE for conceptual questions
5. Match the SESSION COACHING DEPTH for this session
6. Reference bank policies ONLY when directly relevant
7. If their practice looks good, say so specifically and encourage them to submit
8. Never lecture — be a banking colleague who happens to be great at AI
9. Use their name occasionally (not every message) if you know it
10. If compliance coaching is required above, address it FIRST before anything else
```

### 7.13 Greeting Mode

When `greeting: true` is passed, Andrea generates a short personalized greeting (3-4 sentences max) instead of responding to a message. The greeting:
- Uses the learner's name if available
- References their specific role/department naturally
- Acknowledges previous module progress if applicable
- If Session 2 or 3, briefly references what they learned in the previous session
- Ends with something encouraging about the current module they are about to start
- Is NOT generic — is tailored to feel like Andrea knows them

Greeting uses max_tokens: 400 (vs 1000 for regular responses).

---

## 8. Frontend Architecture

### 8.1 Application Entry Point & Provider Hierarchy

**File:** `src/App.tsx`

The application wraps all routes in a provider hierarchy:

```
ErrorBoundary
  QueryClientProvider (TanStack Query v5, staleTime: 5 minutes)
    TooltipProvider (Radix UI)
      AuthProvider     ← Manages user session and user_profiles
        TrainingProvider ← Manages training_progress state
          SessionProvider  ← Manages session-level UI state
            BrowserRouter
              Routes (React Router v6)
```

**TanStack Query configuration:**
- `staleTime`: 5 minutes (reduces redundant refetches)
- `refetchOnWindowFocus`: true
- `retry`: 1 on error

### 8.2 Route Structure

```
Public Routes (no auth required):
  /                   → Index.tsx (landing/marketing page)
  /auth               → Auth.tsx (login + signup with registration code)
  /reset-password     → ResetPassword.tsx

Protected Routes (ProtectedRoute wrapper — redirects to /auth if not logged in):
  /onboarding         → Onboarding.tsx (4-step new-user flow)
  /dashboard          → Dashboard.tsx (main hub)
  /training/:sessionId → TrainingWorkspace.tsx (core training modules)
  /electives          → Electives.tsx (elective paths landing)
  /training/elective  → ElectiveWorkspace.tsx (elective module workspace)
  /prompts            → PromptLibrary.tsx (personal prompt library)
  /journey            → AIJourney.tsx (skill progress + prompt evolution)
  /certificates       → Certificates.tsx (completion certificates)
  /ideas              → Ideas.tsx (community idea board)
  /policies           → Policies.tsx (bank policy library)
  /policies/:id       → PolicyDetail.tsx (single policy view)
  /settings           → Settings.tsx (Andrea AI customization)
  /memories           → AIMemories.tsx (memory management)

Admin Routes (admin role check inside component):
  /admin              → AdminDashboard.tsx (multi-tab admin panel)

Super Admin Routes (super_admin role check inside component):
  /super-admin        → SuperAdminDashboard.tsx (v3 new — cross-org KPI + system admin)

Legacy/Redirect Routes:
  /questionnaire      → Redirects to /onboarding
  /topics             → Redirects to /dashboard
  /lesson             → Redirects to /dashboard
```

**Note on /training/elective:** This route is always accessed with query params `?path=<pathId>&module=<moduleId>`. The ElectiveWorkspace reads these via `useSearchParams()`.

### 8.3 Context Architecture

**AuthContext** (`src/contexts/AuthContext.tsx`)
- Manages Supabase Auth session (login, logout, signup, password reset)
- Loads and caches `user_profiles` row for the current user
- Provides: `user`, `userProfile`, `session`, `signIn()`, `signOut()`, `signUp()`
- All protected routes read `user` from this context via `useAuth()` hook

**TrainingContext** (`src/contexts/TrainingContext.tsx`)
- Manages `training_progress` state with real-time update capabilities
- Provides: `progress`, `updateModuleCompletion()`, `currentSession`, `setCurrentSession()`
- Used by `TrainingWorkspace.tsx` and `Dashboard.tsx`

**SessionContext** (`src/contexts/SessionContext.tsx`)
- Manages session-level UI state within the training workspace
- Tracks: active module, expanded panels, practice conversation context
- Used within `TrainingWorkspace.tsx` and its child components

### 8.4 Key Pages

#### `Dashboard.tsx` (`src/pages/Dashboard.tsx`)

The main hub displayed after login. Contains:
- **Session Cards** — 4 expandable cards showing progress for each training session with module-level status
- **DashboardChat** — Collapsible floating Andrea chat bubble (always accessible)
- **CommunityFeed** — Inline community discussion hub (topics, replies, attachments)
- **Events Calendar** — Upcoming live training sessions from `live_training_sessions` table
- **Ideas Widget** — Quick link to ideas board

#### `TrainingWorkspace.tsx` (`src/pages/TrainingWorkspace.tsx`)

The primary training interface. Three-panel layout:
- **Left panel:** Module list (toggleable to Agent Studio or Workflow Studio)
- **Center panel:** Practice AI chat — the AI tool the learner practices prompting with
- **Right panel (collapsible):** TrainerChatPanel — Andrea coaching with "Save to Prompt Library" support

Context passed to Andrea for each message:
- `practiceConversation` — Current center-panel message history
- `agentContext` — Learner's current agent from Agent Studio (Session 2+)
- `workflowContext` — Learner's current workflow from Workflow Studio (Session 3)
- `learnerState` — Current module title, progress summary, completed modules

#### `ElectiveWorkspace.tsx` (`src/pages/ElectiveWorkspace.tsx`)

Dedicated training workspace for elective modules. Mirrors TrainingWorkspace layout but:
- Sources content from `ELECTIVE_PATHS` (not `ALL_SESSION_CONTENT`)
- Reads `?path=<pathId>&module=<moduleId>` from URL query params via `useSearchParams()`
- Uses synthetic session ID `elective_<pathId>` for practice conversations (stored in `practice_conversations` table)
- Uses ADVISOR coaching depth (sessionNumber: 4) for all elective modules
- Tracks progress via `useElectiveProgress` hook (Supabase-backed with localStorage fallback)
- Back button returns to `/electives`
- Includes `onSaveToPromptLibrary` wired to `useUserPrompts.createPrompt`

#### `Electives.tsx` (`src/pages/Electives.tsx`)

Landing page for the elective learning paths. Displays all four elective paths as cards with module lists. "Start Module" buttons navigate to `/training/elective?path=<pathId>&module=<moduleId>`.

#### `PromptLibrary.tsx` (`src/pages/PromptLibrary.tsx`)

Personal prompt library page. Features:
- View all saved prompts with title, category, content preview
- Search by title/content
- Filter by category
- Favorite/unfavorite prompts
- Create new prompt manually (form dialog)
- Edit existing prompts
- Delete prompts
- One-click copy to clipboard
- Powered by `useUserPrompts` hook with Supabase + localStorage fallback

#### `AIJourney.tsx` (`src/pages/AIJourney.tsx`)

AI skill journey and progress page. Contains:
- **Skills Radar** — Visual proficiency chart across AI skill dimensions
- **Prompt Evolution Card** — Side-by-side comparison of earliest vs. latest submitted practice prompts, with character count growth indicator and percentage improvement badge. Queries `practice_conversations` table for submissions.
- **Quick Links** — Navigation shortcuts to training sections

#### `Onboarding.tsx` (`src/pages/Onboarding.tsx`)

4-step new-user setup flow:
1. **Role & Department** — job_role + department + employer_name selection
2. **Proficiency Assessment** — 6 scenario questions → ai_proficiency_level (0-8)
3. **Learning Style** — 5 questions → learning_style (example_based/hands_on/explanation_based/logic_based)
4. **Tech Learning Style** — Tech-specific learning preference

Progress bar tracks **completed steps** (not current step index). Formula: `completedSteps / totalSteps` — prevents premature high percentages.

#### `AdminDashboard.tsx` (`src/pages/AdminDashboard.tsx`)

Multi-tab admin panel using **flex-wrap** tab layout. Seed button calls `seedAllContent()` which seeds all 4 core sessions AND all 4 elective paths.

| Tab | Content |
|-----|---------|
| Overview | Platform KPI snapshot (user counts, completion rates) |
| Policies | Bank policy CRUD + PDF upload via parse-policy-document |
| Live Sessions | Schedule live training events |
| Events | Events calendar management |
| Users | User list, proficiency stats, role management |
| Reporting | Engagement analytics, session completion rates; **v3:** CSV export capability |
| C-Suite | Executive KPI dashboard with Andrea C-Suite AI advisor panel |
| Ideas | Community idea moderation (status updates) |
| Modules | Training content management + lesson chunk seeding (seedAllContent) |
| Organizations | Org registry management |
| Reg Codes | Registration code creation and deactivation |
| Lesson Gen | AI-powered lesson generation |
| Resources | **v3 new** — Admin-managed `org_resources` link management |

#### `SuperAdminDashboard.tsx` (`src/pages/SuperAdminDashboard.tsx`) *(v3)*

Separate page accessible at `/super-admin`. Provides cross-organization visibility for SM Advisors staff:
- System-wide KPI rollups (all orgs)
- Per-org drill-down analytics
- View-as-org preview mode (impersonate org context without logging in as user)
- Feature flag management
- User feedback review queue

### 8.5 Key Components

#### `TrainerChatPanel.tsx` (`src/components/training/TrainerChatPanel.tsx`)

Right-panel collapsible coach interface. Features:
- Markdown rendering via react-markdown (bold, lists, code blocks)
- Suggested prompt chips from `suggestedPrompts[]` array
- "Get hint" button (shown when `hintAvailable: true`)
- Compliance flag banner with severity coloring (CRITICAL=red, WARNING=amber, INFO=blue)
- "Remember this?" memory suggestion UI (accept/dismiss)
- Purple "Save to Prompt Library?" card — shown when `promptSaveSuggestion` present; one-click save calls `onSaveToPromptLibrary` prop; green confirmation after save; dismissable
- Submission review trigger button
- Conversation history with smooth scrolling
- Collapsible to icon (more screen space for practice)

**Props:**
```typescript
interface TrainerChatPanelProps {
  // ... existing props ...
  onSaveToPromptLibrary?: (promptText: string, title: string, category: string) => Promise<void>;
}
```

#### `DashboardChat.tsx` (`src/components/DashboardChat.tsx`)

Floating collapsible chat bubble on Dashboard. Features:
- Persists conversations to `dashboard_conversations` table
- Multiple conversation history support (create new / switch / reset)
- Andrea responds in dashboard Navigator mode
- Avatar: scaled-up Andrea image

**Bug fix (v2):** `useDashboardConversations.appendMessage` previously had a race condition where `messagesForDb` was captured via a `let` variable that was populated inside `setState` but read outside it. Since React's setState updater runs asynchronously, the variable was still empty at the time of the Supabase write. Fixed by moving the Supabase write inside the `setState` updater closure where the correct message array is captured synchronously. This was causing Andrea's dashboard responses to disappear after being sent.

#### `AgentStudioPanel.tsx` (`src/components/agent-studio/AgentStudioPanel.tsx`)

Copilot-style agent builder. Side-by-side layout:
- **Left side:** Config panel with Guided/Advanced mode toggle
- **Right side:** Test chat panel

**Guided mode:** `AgentTemplateBuilder.tsx` with 5 accordion sections:
1. Identity — who the agent is, what it's for, its audience
2. Task List — specific tasks it performs (name, format, constraint per task)
3. Output Rules — formatting and behavior rules
4. Guard Rails — what it won't do, and what it says instead
5. Compliance Anchors — regulatory phrases that must appear in relevant outputs

Auto-saves on every template change via `useEffect`. No explicit Save button.

**Advanced mode:** Freeform system prompt textarea. 1.5 second debounce auto-save.

`assembleSystemPrompt()` function (`src/types/agent.ts`) converts the template data structure into a coherent system prompt string combining all sections.

#### `WorkflowBuilder.tsx` (`src/components/workflow-studio/WorkflowBuilder.tsx`)

Visual workflow editor with:
- Trigger definition input
- Step cards: add, remove, reorder steps
- Per step: name, AI prompt template, expected output description, human review toggle
- Final output definition
- Validation requirements: minimum 3 steps, minimum 2 human review checkpoints
- Visual progress indicator for validation state (green when valid)

#### `CommunityFeed.tsx` (`src/components/CommunityFeed.tsx`)

Inline community forum within the dashboard card. Three states:
1. **Topic List** — Shows all threads with author, title, reply count, timestamp
2. **Topic Detail** — Shows thread content + all replies, reply composer at bottom
3. **New Topic** — Thread creation form with title, body, optional attachment URLs

#### `CertificateGenerator.tsx` (`src/components/capstone/CertificateGenerator.tsx`)

Print-to-PDF completion certificate. Uses `window.print()` to trigger browser print dialog.

### 8.6 Custom Hooks

#### `usePracticeConversations` (`src/hooks/usePracticeConversations.ts`)

CRUD for `practice_conversations` table. Key operations:
- `createConversation(sessionId, moduleId, title)` — Creates new conversation record
- `appendMessage(convId, message)` — Appends message to JSONB array

**Race condition fix:** Uses `useRef` to maintain a stable reference to the latest conversation state. Without this, async DB writes using `useState` would capture stale closure values in concurrent React renders, causing messages to be lost.

- `markSubmitted(convId)` — Sets `is_submitted=true` for submission review
- `conversations` — All conversations for current user (React Query cached)

#### `useDashboardConversations` (`src/hooks/useDashboardConversations.ts`)

Same pattern as `usePracticeConversations` but for `dashboard_conversations` table.

**Race condition fix:** `appendMessage` now performs the Supabase write inside the `setConversations` updater closure, where the correct `messagesForDb` value is captured synchronously from the current state snapshot.

#### `useUserPrompts` (`src/hooks/useUserPrompts.ts`)

Full CRUD for the personal Prompt Library:
- `prompts` — All user's saved prompts (Supabase with localStorage fallback)
- `createPrompt(data)` — Insert new prompt (title, content, category, tags, source)
- `updatePrompt(id, changes)` — Partial update
- `deletePrompt(id)` — Hard delete
- `toggleFavorite(id)` — Toggle `is_favorite`

#### `useElectiveProgress` (`src/hooks/useElectiveProgress.ts`)

Tracks elective module completion:
- `markModuleComplete(pathId, moduleId)` — Upserts completion record in `elective_progress`
- `updateModuleProgress(pathId, moduleId, data)` — Updates progress metadata
- `getPathProgress(pathId)` — Returns completion stats for an elective path
- Supabase-backed with localStorage fallback

#### `useOrgResources` (`src/hooks/useOrgResources.ts`) *(v3 new)*

Manages `org_resources` table for organization-specific resource links:
- `resources` — Active resources for the current user's org (React Query cached)
- `createResource(data)` — Admin: insert new resource
- `updateResource(id, changes)` — Admin: update resource
- `deleteResource(id)` — Admin: remove resource

#### `useWorkspaceTour` (`src/hooks/useWorkspaceTour.ts`) *(v3 new)*

Manages the multi-page guided tour system (Driver.js):
- Reads/writes `user_profiles.tours_completed` JSONB for per-tour persistence
- Tracks which tours have been completed: `dashboard`, `admin`, `agent-studio`, `workflow-studio`
- `startTour(tourName)` — Initializes Driver.js tour for named tour
- `markTourComplete(tourName)` — Updates tours_completed in DB
- `isTourComplete(tourName)` — Returns boolean completion status

#### `useUserAgents` (`src/hooks/useUserAgents.ts`)

Full agent lifecycle management:
- `agents` — All user's agents (React Query cached)
- `createAgent(name)` — Inserts draft agent record
- `updateAgent(id, changes)` — Partial update (template_data, system_prompt, name, status)
- `deployAgent(id)` — Sets `is_deployed=true, status=active`
- `undeployAgent(id)` — Sets `is_deployed=false, status=testing`
- `testConversations` — Agent test conversation history
- `appendTestMessage(agentId, testType, message)` — Writes test message

#### `useUserWorkflows` (`src/hooks/useUserWorkflows.ts`)

Workflow lifecycle management. Includes derived `draftWorkflow` computed value for the currently in-progress workflow.

#### `useReporting` and `useSuperAdminKPIs` (`src/hooks/useReporting.ts`)

Aggregate analytics queries across `user_profiles`, `training_progress`, `prompt_events`, `user_ideas`. **v3:** Includes CSV export generation for reporting data.

#### `useUserRole` (`src/hooks/useUserRole.ts`)

Role check with dual mechanism:
1. Database check via `get_user_role()` SECURITY DEFINER function
2. Hardcoded email allowlist: `["coryk@smaiadvisors.com"]` — always returns admin regardless of DB role (break-glass mechanism)

```typescript
const ADMIN_EMAILS = ["coryk@smaiadvisors.com"];
const isAdmin = ADMIN_EMAILS.includes(user?.email || "") || dbRole === "admin";
```

#### `useAIPreferences` (`src/hooks/useAIPreferences.ts`)

Manages `ai_user_preferences` and `ai_memories` tables.

#### `useOrganizations` (`src/hooks/useOrganizations.ts`)

Admin-only org + registration code management.

### 8.7 Type Definitions

#### `src/types/training.ts`

```typescript
interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp?: string;
  coachingAction?: string;
  complianceFlag?: ComplianceFlag;
  feedbackData?: FeedbackResponse;
  suggestedPrompts?: string[];
  promptSaveSuggestion?: {
    promptText: string;
    suggestedTitle: string;
    suggestedCategory: string;
  };
}
```

#### `src/types/agent.ts`

```typescript
interface AgentTemplateData {
  agentName: string;
  agentRole: string;
  taskList: Array<{ name: string; format: string; constraint: string; }>;
  outputRules: string[];
  guardRails: Array<{ rule: string; alternative: string; }>;
  complianceAnchors: string[];
}

function assembleSystemPrompt(template: AgentTemplateData): string { ... }
const EMPTY_TEMPLATE: AgentTemplateData = { ... }
```

#### `src/types/workflow.ts`

```typescript
interface WorkflowStep {
  id: string;
  name: string;
  prompt: string;
  expectedOutput: string;
  humanReview: boolean;
  aiRole: string;
}

interface WorkflowData {
  trigger: string;
  steps: WorkflowStep[];
  finalOutput: string;
}

function isWorkflowComplete(data: WorkflowData): boolean { ... }
```

### 8.8 Training Data Files

#### `src/data/trainingContent.ts`

Defines all 4 sessions and 22 core modules, plus exports `ELECTIVE_PATHS` containing 4 elective learning paths with 3 modules each. Each module contains:
- `id` — Module ID
- `title` — Module title
- `description` — Learning objective
- `keyPoints` — Array of key learning points
- `examples` — Array of {bad, good} prompt pair examples
- `steps` — Step-by-step instructions
- `practiceTask` — The exercise the learner completes
- `successCriteria` — What good performance looks like

**Elective Paths (`ELECTIVE_PATHS`):**

| Path ID | Title | Modules |
|---------|-------|---------|
| `advanced-prompting` | Advanced Prompt Engineering | ep-1, ep-2, ep-3 |
| `agent-specialization` | AI Agent Specialization | ep-1, ep-2, ep-3 |
| `compliance-ai` | Compliance & AI | ep-1, ep-2, ep-3 |
| `data-analytics` | Data Analytics with AI | ep-1, ep-2, ep-3 |

#### `src/utils/seedLessonChunks.ts`

```typescript
// Seeds both core sessions and elective paths
async function seedAllContent(): Promise<{ sessions: SeedResult; electives: SeedResult }> {
  const sessions = await seedAllLessonChunks();
  const electives = await seedElectiveChunks();
  return { sessions, electives };
}
```

The `seedAllContent()` function is called by the Admin Dashboard's "Seed & Embed" button.

---

## 9. Authentication & Authorization

### 9.1 Authentication

SMILE uses Supabase Auth with email/password only. No SSO, OAuth, or social login is configured.

**Login flow:**
1. User submits email + password to `/auth`
2. `supabase.auth.signInWithPassword()` called
3. Supabase Auth validates against `auth.users` (bcrypt-hashed passwords)
4. Returns `access_token` (JWT, 1-hour expiry) + `refresh_token` (long-lived, rotated)
5. Supabase JS client stores tokens in localStorage
6. `AuthContext` loads `user_profiles` row for the authenticated user
7. React Router redirects to `/dashboard` (or `/onboarding` if not yet completed)

**Token refresh:**
- Supabase JS client automatically refreshes the access token before expiry
- Refresh tokens are rotated on each use (prevents replay attacks)
- "Remember me" checkbox controls session persistence behavior

### 9.2 Row Level Security (RLS)

All tables have RLS enabled. The standard policy patterns:

```sql
-- Users can only access their own rows
CREATE POLICY "users_own_data" ON table_name
  USING (auth.uid() = user_id);

-- Admins can read all rows in their org (v3 org-scoped)
CREATE POLICY "admins_read_org" ON table_name
  FOR SELECT USING (
    get_my_org_id() = organization_id
    AND has_role(auth.uid(), 'admin')
  );

-- Super admins bypass org scoping
CREATE POLICY "super_admins_read_all" ON table_name
  FOR SELECT USING (is_super_admin());

-- Public read-only (e.g., bank_policies, events)
CREATE POLICY "authenticated_read" ON table_name
  FOR SELECT USING (auth.role() = 'authenticated');
```

### 9.3 Edge Function Authentication

Edge functions receive the user's JWT via `Authorization: Bearer <token>` header.

### 9.4 Admin Authorization

Admin access is enforced at three layers:
1. **Database:** `user_roles` table with `role = 'admin'`
2. **Backend:** `has_role(auth.uid(), 'admin')` SECURITY DEFINER function
3. **Frontend:** `useUserRole` hook checks DB role AND hardcoded email allowlist

The hardcoded allowlist in `useUserRole` provides a break-glass mechanism that cannot be locked out even if the database role is accidentally removed.

### 9.5 Registration Code System (Multi-Tenancy)

Registration codes link new users to specific organizations at signup time using an atomic validation function with row-level locking to prevent concurrent use exceeding `max_uses`.

**v3 update:** `validate_registration_code()` now returns `audience_type` and `industry` from the organization record, allowing the frontend to tailor the onboarding experience based on industry context.

---

## 10. AI & Machine Learning Integration

### 10.1 Embedding Model

| Property | Value |
|----------|-------|
| Provider | OpenAI |
| Model | `text-embedding-3-small` |
| Dimensions | 1536 |
| Batch size | 50 chunks per API call |
| Rate limit mitigation | 200ms delay between batches |
| Storage | `lesson_content_chunks.embedding` (pgvector vector(1536)) |
| Index type | HNSW with cosine distance |

### 10.2 Vector Search Configuration

| Property | Value |
|----------|-------|
| Index type | HNSW (Hierarchical Navigable Small World) |
| Distance metric | Cosine similarity (1 - cosine distance) |
| HNSW m | 16 |
| HNSW ef_construction | 64 |
| Similarity threshold | 0.3 (30% — results below this excluded) |
| Top-K | 6 results returned per query |
| Learning style boost | 15% boost applied to style-matched or universal chunks |
| Fallback | Sequential chunk retrieval by chunk_index if embedding API fails |

### 10.3 RAG Pipeline

**Offline (content setup):**
1. Training content defined in `trainingContent.ts` (22 core modules + 12 elective modules)
2. `seedAllContent()` frontend function calls seed edge functions for both core and elective content
3. Chunks tagged with `learning_style` (universal by default)
4. `embed_chunks` edge function generates 1536-dimension embeddings

**Online (per chat message):**
1. User message embedded via OpenAI (1536D vector)
2. `match_lesson_chunks()` Postgres function called with `filter_learning_style` from user profile
3. Chunks matching user's learning style or tagged `universal` receive a **15% similarity boost**
4. Top 6 chunks returned and injected into Andrea's system prompt

### 10.4 Primary LLM Configuration

| Function | Model | max_tokens | Notes |
|----------|-------|-----------|-------|
| `trainer_chat` (Andrea) | claude-sonnet-4-20250514 | 1000 | 400 for greeting mode |
| `submission_review` | claude-sonnet-4-20250514 | 1200 | Structured JSON output |
| `ai-practice` | claude-sonnet-4-20250514 | 1500 | Mirror prompt quality |
| `agent-test-chat` | claude-sonnet-4-20250514 | 1500 | Wrapped system prompt |
| `workflow-test-chat` | claude-sonnet-4-20250514 | 1500 | Step-specific context |
| `practice_chat` | claude-sonnet-4-20250514 | 1500 | Sessions 1-2 |

All Anthropic calls use API version `2023-06-01` and do not use streaming.

### 10.5 Structured Output (Andrea's JSON Protocol)

Andrea is instructed to always return valid JSON in this format:

```json
{
  "reply": "Your response here",
  "suggestedPrompts": ["Follow-up 1", "Follow-up 2"],
  "coachingAction": "socratic|explain|review|celebrate|redirect",
  "hintAvailable": true,
  "memorySuggestion": {
    "content": "Concise insight to remember",
    "reason": "Why this is worth saving"
  },
  "promptSaveSuggestion": {
    "promptText": "The actual prompt text worth saving",
    "suggestedTitle": "Brief title for the library",
    "suggestedCategory": "Category name"
  }
}
```

The response parser handles three scenarios:
1. Valid JSON string → parse directly
2. JSON embedded in prose → regex extract: `\{[\s\S]*"reply"[\s\S]*\}`
3. Plain text → return as `reply` field with defaults for all other fields

### 10.6 Telemetry

Every successful Andrea interaction writes a non-blocking telemetry record to `prompt_events`. **No raw prompt or response content is stored.**

---

## 11. Training Curriculum Structure

### 11.1 Overview

The curriculum consists of 4 sessions and 22 core modules, plus 12 elective modules across 4 learning paths.

### 11.2 Session 1: AI Prompting & Personalization (8 Modules)

Goal: Teach foundational AI prompting skills with banking context.

| Module | Title | Key Content |
|--------|-------|-------------|
| 1-1 | What is AI Prompting? | What AI can/can't do, banking use cases overview |
| 1-2 | Anatomy of a Good Prompt | 5 elements: role, task, context, format, constraints |
| 1-3 | The CLEAR Framework | Context, Length, Examples, Audience, Requirements |
| 1-4 | Good vs Bad Prompts | Side-by-side banking comparisons |
| 1-5 | Setting Context for Banking AI | Role context, task context, security context |
| 1-6 | Data Security in Prompts | PII protection, synthetic data, placeholders |
| 1-7 | Prompt Iteration & Refinement | Iterative improvement, evaluating AI output |
| 1-8 | Session 1 Capstone | Complete banking prompt challenge (graded) |

### 11.3 Session 2: Building Your AI Agent (5 Modules)

Goal: Teach learners to design and deploy a custom AI agent for their banking role.

| Module | Title | Key Content |
|--------|-------|-------------|
| 2-1 | What is an AI Agent? | Agents vs one-off prompts, system prompts |
| 2-2 | Agent Architecture | System prompt structure, guard rails, compliance anchors |
| 2-3 | Custom Instructions Template | Agent Studio Guided mode — 5-section template builder |
| 2-4 | Tool Integration | Evaluating data source connections, API safety |
| 2-5 | Build Your Agent Capstone | Full agent build + test in Agent Studio (graded) |

### 11.4 Session 3: Role-Specific Training (5 Modules)

Goal: Apply AI skills to learner's specific banking function.

| Module | Title | Key Content |
|--------|-------|-------------|
| 3-1 | Department AI Use Cases | Role-specific prompt examples for learner's LOB |
| 3-2 | Compliance & AI | 3 pillars, pre-task compliance checklist |
| 3-3 | Workflow Examples | Workflow Studio — multi-step AI workflow design (graded) |
| 3-4 | Advanced Techniques | Chain-of-thought, multi-shot prompting, self-review loops |
| 3-5 | Capstone Project | Full capstone with deployed agent (graded) |

### 11.5 Session 4: Advanced Mastery (4 Modules)

Goal: Advanced AI skills for learners who have completed Sessions 1-3.

| Module | Title | Key Content |
|--------|-------|-------------|
| 4-1 | Advanced Prompt Engineering | Complex prompt patterns, structured outputs |
| 4-2 | Multi-Agent Systems | Orchestration, agent collaboration concepts |
| 4-3 | AI Risk Management | Enterprise risk frameworks, AI governance |
| 4-4 | Session 4 Capstone | Comprehensive advanced assessment (graded) |

### 11.6 Elective Paths (12 Modules across 4 Paths)

Elective modules are available after completing core sessions. Each path has 3 modules and uses ADVISOR-level coaching depth.

**Advanced Prompt Engineering Path:**
- ep-1: Chain-of-Thought Mastery
- ep-2: Multi-Shot and Few-Shot Patterns
- ep-3: Prompt Chaining and Orchestration

**AI Agent Specialization Path:**
- ep-1: Advanced Agent Architecture
- ep-2: Tool Integration and APIs
- ep-3: Agent Testing and Evaluation

**Compliance & AI Path:**
- ep-1: Regulatory AI Frameworks
- ep-2: AI Audit and Documentation
- ep-3: Compliance-First Prompt Design

**Data Analytics with AI Path:**
- ep-1: AI-Assisted Data Analysis
- ep-2: Visualization and Reporting with AI
- ep-3: Predictive Insights for Banking

### 11.7 Proficiency Assessment (Onboarding)

6 scenario-based questions across 6 dimensions: AI Exposure, Prompt Approach, Output Evaluation, Iteration, Risk Awareness, Integration.

**Scoring:** Each question: 4 options scored 0/2/5/8. Composite sum (max 48) normalized to 0-8 integer. Stored as `user_profiles.ai_proficiency_level`.

---

## 12. Admin Capabilities

### 12.1 Content Management

- **Bank Policies:** Full CRUD. Upload PDF/DOCX for AI extraction + summary generation. Toggle active/inactive.
- **Training Modules:** View all 22 core module definitions + 12 elective modules. Trigger `seedAllContent()` for combined seeding and embedding. Button seeds both core sessions AND elective paths in a single operation.
- **Lesson Generation:** AI-powered lesson generation for new modules via generate-lesson edge function.
- **Org Resources:** **v3** — Create and manage resource links (guides, videos, policies) visible to learners within the organization.

### 12.2 User Management

- **User List:** View all registered users with profile, completion status, last login.
- **Role Assignment:** Grant/revoke admin roles via `user_roles` table.
- **Organization Assignment:** View org membership via `user_profiles.organization_id`.

### 12.3 Organization & Access Control

- **Organizations:** Create org records (name + slug + audience_type + industry). View all orgs with user counts.
- **Registration Codes:** Create invitation codes with optional max_uses and expires_at. Deactivate codes.

### 12.4 Event Scheduling

- **Live Sessions:** Create/edit/cancel live training events. Shown on learner dashboard.
- **Events Calendar:** Separate general events management.

### 12.5 Analytics & Reporting

- **Engagement Reporting:** Message volume over time, active user counts, module completion rates. **v3:** CSV export of reporting data.
- **Proficiency Distribution:** Histogram of learner proficiency levels (0-8).
- **Department Distribution:** Breakdown of users by department.
- **Compliance Events:** Count and breakdown of compliance exceptions by type.
- **C-Suite Dashboard:** Overall completion %, engagement rate, average session progress, compliance exception rate. **v3:** Andrea C-Suite AI advisor panel for natural language KPI querying.
- **Idea Board Moderation:** View all community ideas, update status.

### 12.6 Super Admin Capabilities *(v3)*

Accessible at `/super-admin` by users with `super_admin` role:
- **Cross-org KPI dashboard:** System-wide enrollment, completion, and engagement metrics across all organizations
- **View-as-org preview:** Preview any org's admin experience without logging in as an org user
- **Feature flag management:** Enable/disable features per org or system-wide
- **User feedback queue:** Review and resolve user-submitted feedback across all orgs

---

## 13. Deployment & Infrastructure

### 13.1 CI/CD Pipeline

```
Developer workstation
       │
       │  git push origin main
       ▼
  GitHub (main branch = production)
       │
       │  Lovable webhook trigger (on push)
       ▼
  Lovable.dev platform
       │  npm install
       │  vite build
       │  Deploy to Lovable CDN (automatic)
       ▼
  Frontend live at Lovable URL

Database migrations (manual):
  Developer workstation
  → Apply via Supabase SQL editor or supabase db push
  → Supabase Cloud project (tehcmmctcmmecuzytiec)

Edge functions (manual or via Lovable):
  Developer workstation
  → supabase functions deploy <function-name>
```

**Important:** Lovable auto-deploys only the frontend. Database migrations and edge function deployments are separate manual steps. All migrations must use `IF NOT EXISTS` for idempotency.

### 13.2 Git Workflow

```bash
git stash
git pull --rebase origin main
git stash pop
git push
```

Lovable frequently pushes commits from its AI editor, which can cause divergent history.

### 13.3 Supabase Configuration

**Project ID:** `tehcmmctcmmecuzytiec`
**Auth providers:** Email/password only
**Storage buckets:** `policy-documents` (private, admin-only)
**Extensions:** `pgvector` (for vector(1536) type and `<=>` cosine operator)

**Special function override (`supabase/config.toml`):**
```toml
[functions.parse-policy-document]
verify_jwt = false  # Function handles its own auth via has_role()
```

### 13.4 Build Configuration

**Vite (`vite.config.ts`):**
```typescript
{
  server: { port: 8080, host: "::" },
  resolve: { alias: { "@": "/src" } },
  plugins: [ react(), lovableTagger() ]
}
```

**TypeScript (`tsconfig.json`):**
- `strictNullChecks: false` — Relaxed for Lovable compatibility
- `noImplicitAny: false` — Relaxed for Lovable compatibility
- Path alias: `@/*` → `./src/*`

**Known build warnings:**
- Main bundle size: ~1,727 kB (Vite warns at 500 kB threshold). Pre-existing — not an error.

### 13.5 Type Safety Notes

Manually created tables (added via migrations after Lovable's initial setup) are not in the auto-generated types and require `as any` casts:
```typescript
supabase.from('dashboard_conversations' as any)
supabase.from('user_prompts' as any)
supabase.from('elective_progress' as any)
supabase.from('community_topics' as any)
supabase.from('user_agents' as any)
supabase.from('user_workflows' as any)
supabase.from('organizations' as any)
supabase.from('registration_codes' as any)
supabase.from('org_resources' as any)      // v3 new
```

---

## Appendix A: Information Security Risks & Recommended Controls

*(Unchanged from v1.0 — all 10 risks and recommendations remain current.)*

See v1.0 section A for full risk registry covering: Prompt Injection, PII Leakage in Practice Conversations, Service Role Key Exposure, Unauthenticated Edge Function Access, API Key Compromise, CORS Wildcard Configuration, Community Hub Content Moderation, Admin Email Hardcoding, Data Retention, Supabase Anon Key Exposure.

---

## Appendix B: Environment Variables & Secrets

### B.1 Frontend Environment Variables (Public — Bundled in JS)

| Variable | Description |
|----------|-------------|
| `VITE_SUPABASE_URL` | Supabase project URL: `https://tehcmmctcmmecuzytiec.supabase.co` |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase anon/public key (intentionally public) |

### B.2 Edge Function Secrets (Private — Never in Code)

| Secret | Description | Used In |
|--------|-------------|---------|
| `ANTHROPIC_API_KEY` | Anthropic Claude API key | trainer_chat, submission_review, ai-practice, agent-test-chat, workflow-test-chat, practice_chat |
| `OPENAI_API_KEY` | OpenAI embeddings API key | embed_chunks, seed_lesson_chunks, trainer_chat, submission_review |
| `SUPABASE_URL` | Auto-populated by Supabase | All functions |
| `SUPABASE_ANON_KEY` | Auto-populated by Supabase | All functions |
| `SUPABASE_SERVICE_ROLE_KEY` | Auto-populated by Supabase | trainer_chat, submission_review, parse-policy-document |

### B.3 Lovable AI Gateway

Lesson generation and document parsing use a Lovable-managed AI gateway routing to Gemini models. No separate API key required from SM Advisors.

---

## Appendix C: Database Migration History

All migrations use `IF NOT EXISTS` for idempotency. **Total: 51 migrations.**

| Migration File | Description |
|---------------|-------------|
| `20260225100000_tours_and_resources.sql` | **v3** — Adds `tours_completed` JSONB to `user_profiles`; creates `org_resources` table with RLS |
| `20260224100000_schema_rename_industry.sql` | **v3** — Renames `bank_role`→`job_role`, `employer_bank_name`→`employer_name`, `line_of_business`→`department`; renames `org_type`→`audience_type` with value remapping; adds `industry` column to organizations; updates `validate_registration_code()` return |
| `20260224000000_org_isolation_rls.sql` | **v3** — Adds `get_my_org_id()` and `is_super_admin()` helper functions; updates RLS on `user_profiles`, `user_roles`, `training_progress` for org-scoped isolation with super admin bypass |
| `20260223800000_fix_user_feedback_rls_and_status.sql` | **v3** — Fixes RLS on `user_feedback`; adds `status` (new/resolved) and `is_read` columns; creates index on `is_read` |
| `20260222800000_add_learning_style_to_chunks.sql` | **v2** — Adds `learning_style` column to `lesson_content_chunks`; adds `idx_chunks_learning_style` B-tree index; replaces `match_lesson_chunks()` with 6-param version including `filter_learning_style` and 15% style boost logic |
| `20260222000001_create_elective_progress.sql` | **v2** — `elective_progress` table with RLS |
| `20260222000000_create_user_prompts.sql` | **v2** — `user_prompts` table with RLS |
| `20260223000001_create_community_hub.sql` | community_topics, community_replies tables with RLS |
| `20260223000000_create_dashboard_conversations.sql` | dashboard_conversations table with RLS |
| `20260220000000_create_organizations_and_reg_codes.sql` | organizations, registration_codes, validate_registration_code() function |
| `20260215000000_create_user_agents.sql` | user_agents, agent_test_conversations tables |
| `20260210000000_create_user_workflows.sql` | user_workflows table |
| `20260205000000_add_prompt_events.sql` | prompt_events telemetry table |
| `20260201000000_create_ai_memories.sql` | ai_memories, ai_user_preferences tables |
| `20260128000000_create_live_sessions.sql` | live_training_sessions, events tables |
| `20260125000000_add_lesson_chunks_index.sql` | HNSW index on lesson_content_chunks.embedding |
| `20260120000000_create_lesson_chunks.sql` | lesson_content_chunks table + original match_lesson_chunks() |
| `20260115000000_create_bank_policies.sql` | bank_policies table with RLS |
| `20260110000000_create_user_ideas.sql` | user_ideas table |
| `20260105000000_create_app_settings.sql` | app_settings key-value table |
| `20260101000000_create_training_progress.sql` | training_progress table |
| `20251225000000_create_user_profiles.sql` | user_profiles table with all profile columns |
| `20251220000000_create_user_roles.sql` | user_roles table, app_role enum, has_role(), get_user_role() SECURITY DEFINER functions |
| `20251215000000_enable_pgvector.sql` | CREATE EXTENSION IF NOT EXISTS vector |
| `20251210000000_create_practice_conversations.sql` | practice_conversations table |

---

*End of SMILE Comprehensive Technical Reference v3.0*

**Document maintained by:** SM Advisors Development Team
**Document version:** 3.0
**Created:** 2026-02-22
**Updated:** 2026-02-28
**Next review date:** 2026-08-28
**Classification:** Internal / Confidential
