# SMILE — Comprehensive Technical Reference
### Smart, Modular, Intelligent Learning Experience for AI

**Document Version:** 7.0
**Date:** 2026-04-09
**Classification:** Internal / Confidential
**Prepared by:** SM Advisors

**Change Summary (v6.0 → v7.0):**
- **Skills & Agents Restructure**: Curriculum restructured to v3.0 — 41 modules across 6 sessions (up from 33 across 5). Old Session 3 (Agents) split into Session 3 (Skills & Projects) and Session 4 (Agents & Autonomy). Old Sessions 4-5 cascade to Sessions 5-6
- **Session 1 revised**: Module order and content updated. "Your First Win" moved to 1-4; new modules: "The Flipped Interaction" (1-5), "Sandbox" (1-7, replaces "Session 1 Review")
- **Session 2 expanded**: 10 modules (up from 9). New: AI Limitations & Critical Evaluation (2-1), Self-Review Loops (2-2), Outline Expander (2-5), Web Search (2-9). Removed: Tool Selection, Model Comparison, Workflow Basics
- **Session 3 — Skills & Projects (NEW)**: 7 modules covering skill anatomy (6 components: Identity, Trigger, Procedure, Standards, Guardrails, Output Format), projects, knowledge bases, sharing and scaling
- **Session 4 — Agents & Autonomy (NEW)**: 7 modules covering Autonomy Spectrum (5 levels), agent anatomy (6 components), governance framework (6 components), 4-test agent suite (Normal, Edge, Out-of-scope, Guardrail)
- **Session 5 — AI in Everyday Tools**: Cascaded from old Session 4 (Functional Agents) with updated session/module references
- **Session 6 — Designing Your AI Workflow**: Cascaded from old Session 5 (Build Your Frankenstein) with updated references
- **All Sessions 3-6 modules are quality-gated**: Every module in Sessions 3-6 has `isGateModule: true` (24 gate modules + 3 from Sessions 1-2 = 27 total)
- **PLATFORM_TERMINOLOGY system**: 5 platform-native vocabularies (default, claude, chatgpt, copilot, gemini) for cross-platform terminology substitution in Sessions 3-4 content
- **KNOWLEDGE_CHECKS**: Reflective closing questions for all 6 sessions (3 questions per session)
- **Zone unlock renamed**: `session_3_agent_deployed` → `session_4_agent_deployed` (agents moved to Session 4)
- **Submission rubrics expanded**: 23 module-specific rubrics (up from ~8). New rubrics for skill anatomy, agent design, governance, functional agents, and workflow design
- **Coaching depths updated**: S3=PEER (Skills & Projects), S4=ADVISOR (Agents & Autonomy), S5=ADVISOR (Everyday Tools), S6=ADVISOR (AI Workflow)
- **Session 6 database columns**: `session_6_progress` (JSONB), `session_6_completed` (BOOLEAN), `session_6_completed_at` (TIMESTAMPTZ) on `training_progress`
- **session_3_skill_created flag**: New boolean on `training_progress` for skill creation tracking
- **Web search module**: Module 2-9 teaches web search toggle best practices; OpenAI `web_search_preview` tool integration
- **New edge function**: `admin-settings` for SuperAdmin app_settings management
- **Edge function count**: 20 (up from 19)
- **Total migrations**: 71 (up from 69)
- **ShadCN components**: 49 (up from 48)

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

The application is not a passive e-learning tool. It uses a live AI coaching system ("Andrea") built on Anthropic's Claude Opus 4.6, a RAG (Retrieval Augmented Generation) pipeline with learning style-boosted similarity scoring, and a structured curriculum of 41 modules across six sessions (Curriculum v3.0), to deliver a personalized, interactive learning experience.

### 1.2 Core Value Propositions

- **Personalized AI coaching**: Andrea adapts her communication style, depth, and guidance based on each learner's assessed AI proficiency level, department, job role, and stated learning style preferences.
- **Industry-specific context**: AI scenarios, examples, and guardrails are tailored to the learner's industry — banking (retail, wealth management, commercial lending, compliance, operations) and healthcare (Parallon/HCA). Industry-aware placeholder system replaces hardcoded banking examples.
- **Compliance-first design**: The platform actively detects and blocks prompts that would violate banking regulations (PII sharing, compliance bypass attempts, inappropriate data export). Andrea refuses to help with these and explains why.
- **Multi-model practice**: Learners can practice with 10 AI models from OpenAI (GPT 5.x), Anthropic (Claude), and Google (Gemini 3). Model selector unlocks during Module 2-7 for hands-on comparison.
- **Hands-on practice**: Learners don't just read about AI — they build reusable AI skills with knowledge bases (Session 3), design and deploy autonomous agents with governance frameworks (Session 4), explore AI in everyday tools (Session 5), and complete a Capstone session where they design their own AI workflow stack (Session 6).
- **Agents zone**: After deploying their first agent in Session 4, learners unlock a persistent Agents zone where they can chat with their deployed agents and share them with colleagues via shareable links.
- **Prompt Library**: Learners accumulate and save high-quality prompts throughout training for ongoing reuse; Andrea suggests saving particularly well-crafted prompts via a one-click UI.
- **AI Journey tracking**: The AI Journey page visualizes skill progression with a Prompt Evolution card comparing the learner's earliest vs. most recent submitted prompts.
- **Progressive disclosure**: The platform reveals features (Explore, Community, Agents, Profile zones) as learners progress through training — no overwhelming information dump upfront. 6 learner zones unlock progressively.
- **Proactive Andrea triggers**: Andrea proactively nudges learners on return engagement, feature unlocks, and stall detection — not just when they ask for help.
- **AI Brainstorm discovery**: The BrainstormPanel provides Andrea-guided workflow discovery, letting learners identify AI use cases in their daily work and submit ideas to leadership.
- **Quality-gated progression**: 27 modules are marked as gate modules (all of Sessions 3-6 plus select modules in Sessions 1-2); module completion requires passing a quality gate on practice submissions — learners can't skip ahead without demonstrating competence.
- **Platform-native terminology**: PLATFORM_TERMINOLOGY system maps generic terms (skill, project, agent) to platform-specific equivalents (Claude Project, Custom GPT, Gem, Copilot Studio) so curriculum content reads naturally for each learner's platform.
- **Voice-to-text**: Learners can dictate prompts and messages via microphone using Deepgram-powered transcription.
- **Agent sharing**: Learners can share deployed agents via link; recipients chat with the agent on a dedicated public page.
- **C-Suite visibility**: An executive reporting dashboard with attention items, funnel charts, and Andrea C-Suite AI advisor panel gives bank leadership KPI snapshots on engagement, completion rates, and skill signal trends.
- **Self-service operations**: All platform administration (policies, users, registration codes, organizations, live session scheduling, resource links, community moderation) is handled through an in-app admin panel — no database terminal access required.

### 1.3 Target Users

| User Type | Description |
|-----------|-------------|
| **Learner** | Bank or healthcare professional completing the 6-session AI training curriculum |
| **Admin** | SM Advisors staff managing the platform (content, users, orgs) |
| **Executive** | Bank leadership accessing C-Suite KPI dashboard |
| **Super Admin** | SM Advisors system-wide administrator with cross-org visibility |
| **Friends & Family** | Non-banker pilot testers (F&F org type) with interest-based personalization |

### 1.4 Business Context

The platform operates as a white-labeled SaaS product sold to banking institutions by SM Advisors. Multi-tenancy is implemented via an organization/registration-code system — banks are issued registration codes that employees use at sign-up to be placed in the correct organizational tenant.

Organizations can be typed as `bank` (default) or `friends_family` (pilot testers). Each organization can configure `allowed_models` to control which AI models are available to their learners in practice sessions. Multi-industry support is now active, with healthcare organizations (Parallon/HCA) in addition to the original banking vertical.

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
| UI Components | ShadCN UI (Radix UI) | 49 components |
| Styling | Tailwind CSS | 3.4.17 |
| Typography Plugin | @tailwindcss/typography | 0.5.16 |
| Markdown Rendering | react-markdown | 10.1.0 |
| Markdown Tables | remark-gfm | 4.0.1 |
| Charts | Recharts | 2.15.4 |
| Toast Notifications | Sonner | 1.7.4 |
| Icons | Lucide React | 0.462.0 |
| Date Utilities | date-fns | 3.6.0 |
| Guided Tours | Driver.js | 1.4.0 |
| PDF Generation | jsPDF + jsPDF-AutoTable | 4.2.0 / 5.0.7 |
| Carousel | Embla Carousel React | 8.6.0 |
| Resizable Panels | React Resizable Panels | 2.1.9 |
| Form Validation | Zod | 3.25.76 |
| Form State | React Hook Form | 7.61.1 |
| Testing | Vitest + Testing Library | 3.2.4 / 16.0.0 |

### 2.2 Backend

| Layer | Technology |
|-------|-----------|
| Backend-as-a-Service | Supabase (PostgreSQL 15, Auth, Edge Functions, Storage) |
| Database | PostgreSQL 15 with pgvector extension |
| Edge Functions Runtime | Deno (TypeScript) |
| Authentication | Supabase Auth (email/password, session-based JWTs) |
| File Storage | Supabase Storage (policy-documents bucket) |
| Vector Search | pgvector with HNSW index (cosine similarity) |
| Scheduled Jobs | pg_cron (data retention) |

### 2.3 AI / ML Services

| Service | Provider | Usage |
|---------|---------|-------|
| **Andrea Coaching** | Anthropic Claude Opus 4.6 | trainer_chat, agent-test-chat |
| **Submission Review** | Anthropic Claude Sonnet 4.5 | submission_review, workflow-test-chat |
| **Intake Scoring** | Anthropic Claude Haiku 4.5 | intake-prompt-score |
| **Practice AI (Multi-model)** | OpenAI GPT 5.x / Anthropic Claude / Google Gemini 3 | ai-practice — model selected by learner (default: GPT 5.4) |
| **Embeddings** | OpenAI text-embedding-3-small | RAG chunk embeddings (1536 dimensions) |
| **Lesson Generation** | Google Gemini 3 Flash Preview (via Lovable AI Gateway) | AI-powered lesson generation |
| **Document Parsing** | Google Gemini 3 (via Lovable AI Gateway) | PDF/DOCX policy document extraction, agent knowledge base extraction |
| **Idea Preview** | Google Gemini 2.5-flash-lite (via Lovable AI Gateway) | HTML prototype generation for user ideas |
| **Voice Transcription** | Deepgram nova-2 | Speech-to-text for voice input |

### 2.4 Deployment & Hosting

| Component | Provider |
|-----------|---------|
| Frontend Hosting | Lovable.dev (auto-deploys from GitHub main branch) |
| Database & Auth | Supabase Cloud (project: `tehcmmctcmmecuzytiec`) |
| Edge Functions | Supabase Edge Functions (Deno Deploy) |
| File Storage | Supabase Storage |
| CI/CD | GitHub → Lovable auto-deploy pipeline |
| Version Control | GitHub (main branch = production) |

### 2.5 Design System

| Property | Value |
|----------|-------|
| Body Font | Inter |
| Heading Font | Playfair Display |
| Primary Color | Navy #202735 (hsl 222 19% 17%) |
| Accent Color | SM Advisors Orange #dd4124 (hsl 10 76% 50%) |
| Muted | Soft Slate (220 14% 96%) |
| Background | Light (220 20% 98%) |
| Dark Mode | Full color inversion (navy backgrounds, light text) |
| Shadows | sm/md/lg/xl/card-specific shadow tokens |
| Gradients | Primary, Accent, Hero, Gold gradient tokens |

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
│  │  │              AppShell (v4 new)                     │   │   │
│  │  │  NavRail │ TopBar │ AndreaDock │ Zone Router      │   │   │
│  │  └──────────────────────────────────────────────────┘   │   │
│  │                                                          │   │
│  │  ┌──────────────────────────────────────────────────┐   │   │
│  │  │                    Pages                          │   │   │
│  │  │  Dashboard | Training | Explore | Community | ... │   │   │
│  │  └──────────────────────────────────────────────────┘   │   │
│  │                                                          │   │
│  │  ┌──────────────────────────────────────────────────┐   │   │
│  │  │                  Components                       │   │   │
│  │  │  TrainerChat | AgentStudio | WorkflowBuilder |..  │   │   │
│  │  └──────────────────────────────────────────────────┘   │   │
│  │                                                          │   │
│  │  ┌──────────────────────────────────────────────────┐   │   │
│  │  │        SMILE Design Primitives (v4 new)           │   │   │
│  │  │  SmileCard | ProgressStrip | EmptyState | Skel.   │   │   │
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
│  └───────────────┘  │  + pg_cron    │  └───────────────────┘  │
│                      └───────────────┘                         │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                   Edge Functions (Deno)                  │   │
│  │                                                          │   │
│  │  trainer_chat  │  submission_review  │  ai-practice      │   │
│  │  agent-test-chat  │  workflow-test-chat  │  practice_chat │   │
│  │  generate-lesson  │  embed_chunks  │  seed_lesson_chunks │   │
│  │  ai-trainer  │  parse-policy-document  │  intake-prompt-score │
│  │  admin-create-user  │  admin-delete-user  │  superadmin-kpis│  │
│  │  generate-module-content  │  admin-settings               │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
              External AI APIs (HTTPS + API Keys)
                              │
         ┌────────────────────┼────────────────────┐
         │                    │                    │
┌──────────────┐ ┌─────────────┐ ┌──────────────┐ ┌──────────┐
│ Anthropic API│ │  OpenAI API │ │Lovable AI GW │ │ Deepgram │
│Opus4.6/Son4.5│ │GPT5.x+embed│ │(Gemini 3)    │ │  nova-2  │
│  /Haiku4.5   │ │             │ │              │ │          │
└──────────────┘ └─────────────┘ └──────────────┘ └──────────┘
```

### 3.2 AppShell Navigation Architecture

```
┌─────────────────────────────────────────────────────────────┐
│ AppShell                                                     │
│ ┌──────────┐ ┌────────────────────────────────────────────┐ │
│ │          │ │ TopBar (64px sticky)                        │ │
│ │ NavRail  │ │ [Breadcrumbs]              [Context Actions]│ │
│ │ (56/240px)│ ├────────────────────────────────────────────┤ │
│ │          │ │                                              │ │
│ │ ● Home   │ │         Page Content                        │ │
│ │ ● Learn  │ │         (children)                          │ │
│ │ ● Explore│ │                                              │ │
│ │ ● Commty │ │                                              │ │
│ │ ● Agents │ │                                              │ │
│ │ ● Profile│ │                                              │ │
│ │          │ │                              ┌────────────┐ │ │
│ │ [User ▼] │ │                              │ AndreaDock │ │ │
│ │          │ │                              │ (floating)  │ │ │
│ └──────────┘ │                              └────────────┘ │ │
│              └────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘

Desktop NavRail States:
  Collapsed (56px): Spark icon + icon-only nav + user initials
  Expanded (240px): SM Advisors logo + icon+label+description + user name

Mobile: NavRail renders as 64px bottom tab bar with icon+label

AndreaDock States:
  Resting: Avatar-only at bottom-right
  Attentive: Avatar + glow + 2-3 word preview bubble
  Active: Full Sheet panel (380px) with chat interface
```

### 3.3 Zone-Based Navigation

```
Progressive Disclosure Model:
  Zones are ABSENT from UI until condition is met (not disabled/greyed out)

┌──────────────────────────────────────────────────────────────────┐
│ Zone        │ Path          │ Unlock Condition                   │
├──────────────────────────────────────────────────────────────────┤
│ Home        │ /dashboard    │ always                             │
│ Learn       │ /training/1   │ onboarding_completed               │
│ Explore     │ /explore      │ session_1_basic_interaction_done   │
│ Community   │ /community    │ first_practice_done                │
│ Agents      │ /agents       │ session_4_agent_deployed           │
│ Profile     │ /profile      │ onboarding_completed               │
└──────────────────────────────────────────────────────────────────┘

Zone unlock logic: src/hooks/useFeatureGates.ts
Zone definitions: src/config/zones.ts

Unlock condition details:
  session_1_basic_interaction_done → completed module 1-3 (Basic Interaction)
  first_practice_done → any practice chat started in session 1
  session_4_agent_deployed → user has at least one deployed agent (count query)
```

### 3.4 Request Flow — Standard Page Load

```
1. User navigates to URL
2. React Router matches route
3. ProtectedRoute checks Supabase Auth session (JWT in localStorage)
4. If unauthenticated → redirect to /auth
5. If authenticated:
   a. AuthContext loads user profile from user_profiles table
   b. TrainingContext loads training_progress
   c. ProtectedRoute checks requireOnboarding flag
   d. If onboarding not complete → redirect to /onboarding
   e. AppShell mounts (if route uses AppShell):
      i.   NavRail renders visible zones via useFeatureGates
      ii.  TopBar renders breadcrumbs
      iii. AndreaDock initializes in Resting state
      iv.  useAndreaTriggers checks for proactive nudges
   f. Page component mounts
   g. React Query hooks fire Supabase client queries
   h. Data renders via ShadCN UI + SMILE design primitives
```

### 3.5 Request Flow — Andrea Chat Message

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
   j. Calls Anthropic Claude Claude Opus 4.6 (streaming: false)
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

### 3.6 Request Flow — RAG Pipeline (Embedding Generation)

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
  │                           │   {model: Claude Opus 4.6,          │
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
  │── Quality gate check: pass/fail ───────────────►   │
  │── If pass: enable module completion                │
  │── If fail: show improvement guidance               │
  │── INSERT submission_scores ────────────────────► DB│
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
   → Returns {valid, organization_id, organization_name, org_type}
4. Supabase Auth creates user (auth.users)
5. Trigger fires: creates user_profiles row with organization_id
6. Frontend redirects to /onboarding

Onboarding Flow (5 steps — v4 redesigned):
Step 1: Display Name
   → Updates user_profiles: display_name
Step 2: Job Role & Department
   → Updates user_profiles: job_role, department, employer_name
Step 3: Prompt Quality Self-Assessment
   → Scenario-based scoring questions
   → Composite score mapped to proficiency level (1-4)
   → Updates user_profiles: ai_proficiency_level
   → Stores full responses in proficiency_responses table
Step 4: Learning Style Selection
   → 4 options: example_based | explanation_based | hands_on | logic_based
   → Updates user_profiles: learning_style
Step 5: AI Preferences
   → Tone, verbosity, formatting preferences
   → Updates ai_user_preferences table
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
   → Calls Anthropic Claude Opus 4.6
   → Streams response back
   → INSERT agent_test_conversations
6. User reviews test results, iterates on prompt
7. User clicks Deploy → UPDATE user_agents (status: active, is_deployed: true)
8. In Capstone (Session 4):
   → ai-practice edge function uses deployed agent's system_prompt
   → User practices against their own AI agent
```

### 4.6 Proactive Andrea Trigger Flow
```
┌─────────────────────────────────────────────────────────┐
│ useAndreaTriggers Hook (client-side)                     │
│                                                          │
│  On mount:                                               │
│  ├── Check localStorage: last_login timestamp            │
│  │   → If 3+ days ago → RETURN ENGAGEMENT trigger        │
│  │                                                       │
│  ├── Check useFeatureGates: newly unlocked zones         │
│  │   → If Explore just unlocked → FEATURE UNLOCK trigger │
│  │   → If Community just unlocked → FEATURE UNLOCK       │
│  │                                                       │
│  └── Start stall timer on /training/* routes             │
│      → If 10 min with no navigation → STALL DETECTION    │
│                                                          │
│  On trigger fire:                                        │
│  ├── Check sessionStorage: max 1 signal per session      │
│  ├── Check localStorage: dismissed triggers never repeat │
│  └── Call andreaRef.nudge(previewText)                   │
│      → AndreaDock transitions: Resting → Attentive       │
│      → Shows preview bubble with 2-3 word hint           │
│      → User clicks → Active (full chat sheet)            │
│      → User dismisses → Back to Resting                  │
└─────────────────────────────────────────────────────────┘
```

### 4.7 Zone Progressive Disclosure Flow

```
┌──────────────────────────────────────────────────┐
│ useFeatureGates Hook                              │
│                                                    │
│ Reads from:                                        │
│ ├── useAuth() → userProfile, trainingProgress     │
│ ├── useUserAgents() → deployed agent count        │
│ │                                                  │
│ Evaluates conditions:                              │
│ ├── 'always' → true                               │
│ ├── 'onboarding_completed'                         │
│ │   → profile?.onboarding_completed               │
│ ├── 'session_1_basic_interaction_done'             │
│ │   → session_1_progress.completedModules          │
│ │     .includes('1-3')  (Basic Interaction)       │
│ ├── 'first_practice_done'                          │
│ │   → any moduleEngagement[*].chatStarted          │
│ ├── 'session_1_completed'                          │
│ │   → progress.session_1_completed                 │
│ ├── 'session_4_agent_deployed'                     │
│ │   → user has ≥1 deployed agent (count query)    │
│ │                                                  │
│ Returns:                                           │
│ ├── isUnlocked(condition) → boolean               │
│ ├── unlockedZones[] → Zone[]                      │
│ ├── canAccessLearn, canAccessExplore, etc.         │
│                                                    │
│ Used by:                                           │
│ ├── NavRail → only renders visible zones          │
│ └── Page guards → redirect if locked              │
└──────────────────────────────────────────────────┘
```

## 5. Database Schema

### 5.1 Overview

The database is PostgreSQL 15 hosted on Supabase Cloud. Row Level Security (RLS) is enabled on all tables. All user-facing tables are protected so users can only access their own data. Admin access is controlled via the `user_roles` table and SECURITY DEFINER functions.

**pgvector** extension is installed for semantic similarity search on lesson content embeddings.

**pg_cron** extension is installed for scheduled data retention jobs.

**Org isolation:** Helper functions `get_my_org_id()` and `is_super_admin()` power updated RLS policies that scope admin queries to the admin's own organization, with super admin bypass.

### 5.2 Table: `user_profiles`

Stores learner profile data, set during onboarding and updated throughout training.

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid (PK) | Supabase row ID |
| `user_id` | uuid (FK → auth.users) | Supabase Auth user ID |
| `display_name` | text | User's display name |
| `department` | text | Department / Line of Business |
| `job_role` | text | Job role within the organization |
| `learning_style` | text | example_based / explanation_based / hands_on / logic_based |
| `ai_proficiency_level` | integer | Score 0-8 from proficiency assessment |
| `onboarding_completed` | boolean | Whether onboarding flow is complete |
| `current_session` | integer | Current training session (1-6) |
| `employer_name` | text | Institution/employer name |
| `tour_completed` | boolean | Whether legacy product tour was completed |
| `tours_completed` | jsonb | Per-tour completion map e.g. `{"dashboard": true, "admin": true}` |
| `organization_id` | uuid (FK → organizations) | Multi-tenant org assignment |
| `is_active` | boolean |Soft deactivation flag (default true) |
| `is_super_admin` | boolean |Super admin flag (default false) |
| `interests` | text[] |Interest tags for F&F (non-banker) users |
| `intake_responses` | jsonb |Full intake questionnaire answers |
| `safe_use_flag` | boolean |Triggered if user indicated they'd paste PII into external AI |
| `intake_role_key` | text |Role key from intake (e.g., 'loan_officer', 'compliance') |
| `intake_orientation` | text |AI orientation feeling (excited/curious/anxious/skeptical/neutral) |
| `intake_motivation` | text[] |Motivation tags from intake multi-select |
| `preferred_model` | text | Last-selected AI model in practice chat (default 'claude-sonnet-4-6') |
| `last_login_at` | timestamptz | Last login timestamp |
| `created_at` | timestamptz | Profile creation timestamp |
| `updated_at` | timestamptz | Last update timestamp |

**RLS Policies:**
- `SELECT`: `auth.uid() = user_id` OR `is_super_admin()` OR admin in same org via `get_my_org_id()`
- `INSERT`: `auth.uid() = user_id`
- `UPDATE`: `auth.uid() = user_id`

### 5.3 Table: `training_progress`

Tracks completion status for all six training sessions per user.

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid (PK) | Row ID |
| `user_id` | uuid (FK → auth.users) | User |
| `session_1_completed` | boolean | Session 1 fully completed |
| `session_2_completed` | boolean | Session 2 fully completed |
| `session_3_completed` | boolean | Session 3 fully completed |
| `session_4_completed` | boolean | Session 4 fully completed |
| `session_5_completed` | boolean | **v5** — Session 5 fully completed |
| `session_6_completed` | boolean | **v7** — Session 6 fully completed |
| `session_1_progress` | jsonb | Module-level progress data for Session 1 |
| `session_2_progress` | jsonb | Module-level progress data for Session 2 |
| `session_3_progress` | jsonb | Module-level progress data for Session 3 |
| `session_4_progress` | jsonb | Module-level progress data for Session 4 |
| `session_5_progress` | jsonb | **v5** — Module-level progress data for Session 5 |
| `session_6_progress` | jsonb | **v7** — Module-level progress data for Session 6 |
| `session_6_completed_at` | timestamptz | **v7** — Session 6 completion timestamp |
| `session_3_skill_created` | boolean | **v7** — Whether learner created a skill in Session 3 |
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
      "submittedForReview": true,
      "chatStarted": true
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

-- Org-scoped RLS helpers:
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
CREATE INDEX lesson_chunks_embedding_idx
ON lesson_content_chunks USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);

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

**Data retention:** 12 months (pg_cron monthly cleanup).

### 5.11 Table: `organizations`

Multi-tenant organization registry.

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid (PK) | Row ID |
| `name` | text | Organization display name |
| `slug` | text (UNIQUE) | URL-safe identifier |
| `audience_type` | text | `enterprise` or `consumer` |
| `industry` | text | Industry category (e.g., `banking`, `credit_union`) |
| `org_type` | text | `bank` (default) or `friends_family` (F&F pilot testers) |
| `allowed_models` | jsonb | Array of allowed model IDs (default `["claude-sonnet-4-6"]`) |
| `platform` | text | **v5** — `default` or `chatgpt`; controls Edge-layer UI rendering (default: `default`) |
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

**Key function (returns org_type):**
```sql
CREATE FUNCTION validate_registration_code(input_code text)
RETURNS JSON SECURITY DEFINER AS $$
...
  RETURN json_build_object(
    'valid', true,
    'organization_id', org_row.id,
    'organization_name', org_row.name,
    'org_type', COALESCE(org_row.org_type, 'bank')
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
| `description` | text | **v5** — Agent description |
| `status` | text | draft / testing / active / archived |
| `template_data` | jsonb | Guided mode structured template |
| `system_prompt` | text | Final assembled system prompt |
| `version` | integer | Version number |
| `is_deployed` | boolean | Whether agent is active for practice |
| `deployed_at` | timestamptz | **v5** — When agent was deployed |
| `is_shared` | boolean | Whether agent is shared via link |
| `shared_at` | timestamptz | **v5** — When agent was shared |
| `last_test_results` | jsonb | **v5** — Results from latest test run |
| `parent_version_id` | uuid | Previous version reference |
| `created_at` | timestamptz | Created |
| `updated_at` | timestamptz | Updated |

**RLS (v5 addition):** Users can view shared agents from other users:
```sql
CREATE POLICY "Users can view shared agents"
  ON user_agents FOR SELECT TO authenticated
  USING (is_shared = true);
```

**template_data JSONB structure (Guided mode):**
```json
{
  "identity": "You are an AI assistant for commercial loan advisors...",
  "taskList": ["Help draft loan memos", "Summarize financial statements"],
  "outputRules": ["Always cite sources", "Use bullet points"],
  "guardRails": ["Never share client PII", "Always recommend human review"],
  "complianceAnchors": ["Follow BSA/AML", "Comply with Reg E"],
  "conversation_starters": ["What loan should I review?", "Help me draft a memo"],
  "knowledge_base": ["<extracted text from uploaded documents>"],
  "enabled_tools": ["web_search", "code_interpreter"]
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

**Data retention:** 12 months (pg_cron monthly cleanup).

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
| `category` | text |discussion / idea / friction_point / shared_agent / shared_workflow |
| `source_type` | text |manual / andrea_suggested / andrea_user_requested |
| `linked_content_id` | uuid |FK to linked agent/workflow |
| `linked_content_type` | text |agent / workflow / NULL |
| `status` | text |pending / approved / rejected (review queue) |
| `created_at` | timestamptz | Created |
| `updated_at` | timestamptz | Updated |

**RLS (v4 updated):** Users see approved topics OR their own pending topics. Admins see all.

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
| `source` | text |manual / andrea_suggested / andrea_user_requested |
| `source_context` | text |Module/context where idea originated |
| `linked_agent_id` | uuid |FK → user_agents if idea linked to agent |
| `submitted_to_exec` | boolean |Whether escalated to executive review |
| `preview_html` | text |Generated HTML prototype preview |
| `preview_status` | text |none / generating / generated / failed |
| `preview_generated_at` | timestamptz |When preview was generated |
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

Stores the user's personal Prompt Library.

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
| `metadata` | jsonb | Additional metadata |
| `created_at` | timestamptz | Created |
| `updated_at` | timestamptz | Updated |

**RLS:** User can only read/write/delete their own prompts. Admins can view all.

### 5.24 Table: `elective_progress`

Tracks completion status for elective modules per learner.

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid (PK) | Row ID |
| `user_id` | uuid (FK → auth.users) | User |
| `path_id` | text | Elective path ID (e.g., `advanced-prompting`) |
| `module_id` | text | Elective module ID |
| `completed` | boolean | Whether module is marked complete |
| `completed_at` | timestamptz | Completion timestamp |
| `progress_data` | jsonb | Additional per-module progress metadata |
| `created_at` | timestamptz | Created |
| `updated_at` | timestamptz | Updated |

**Unique constraint:** `(user_id, path_id, module_id)`

### 5.25 Table: `org_resources`

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

**RLS:** SELECT for authenticated users in same org; INSERT/UPDATE/DELETE for admins in same org.

### 5.26 Table: `industries` *(v4)*

Multi-industry support registry.

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid (PK) | Row ID |
| `slug` | text (UNIQUE) | URL-safe identifier (e.g., `banking`) |
| `name` | text | Display name (e.g., `Community Banking`) |
| `is_active` | boolean | Whether industry is active |
| `display_order` | integer | Sort order |
| `created_at` | timestamptz | Created |
| `updated_at` | timestamptz | Updated |

**Seed data:** `banking` / `Community Banking`, `healthcare` / `Healthcare` *(v6 — Parallon/HCA)*

### 5.27 Table: `departments` *(v4)*

Admin-managed departments (replaces hardcoded line_of_business enum).

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid (PK) | Row ID |
| `industry_id` | uuid (FK → industries) | Parent industry |
| `slug` | text (UNIQUE) | URL-safe identifier |
| `name` | text | Department display name |
| `is_active` | boolean | Whether department is active |
| `display_order` | integer | Sort order |
| `created_at` | timestamptz | Created |
| `updated_at` | timestamptz | Updated |

### 5.28 Table: `roles` *(v4)*

Admin-managed job roles per department.

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid (PK) | Row ID |
| `department_id` | uuid (FK → departments) | Parent department |
| `slug` | text | URL-safe identifier |
| `name` | text | Role display name |
| `is_active` | boolean | Whether role is active |
| `display_order` | integer | Sort order |
| `created_at` | timestamptz | Created |
| `updated_at` | timestamptz | Updated |

### 5.29 Table: `executive_submissions` *(v4)*

Idea escalation to leadership. Links ideas/community topics to executive review.

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid (PK) | Row ID |
| `user_id` | uuid (FK → auth.users) | Submitter |
| `idea_id` | uuid (FK → user_ideas) | Linked idea (nullable) |
| `community_topic_id` | uuid (FK → community_topics) | Linked topic (nullable) |
| `submission_type` | text | idea / friction_point / shared_agent / shared_workflow |
| `title` | text | Submission title |
| `body` | text | Submission body |
| `department_id` | uuid (FK → departments) | Submitter's department |
| `status` | text | submitted / reviewed / acknowledged / in_progress / archived |
| `reviewed_by` | uuid (FK → auth.users) | Reviewer |
| `reviewed_at` | timestamptz | Review timestamp |
| `preview_html` | text | Generated HTML prototype |
| `preview_status` | text | none / generating / generated / failed |
| `preview_generated_at` | timestamptz | When preview was generated |
| `created_at` | timestamptz | Created |

### 5.30 Table: `skill_observations` *(v4)*

Andrea's silent skill tracking — observations about learner competence.

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid (PK) | Row ID |
| `user_id` | uuid (FK → auth.users) | User |
| `observed_skill` | text | Skill name observed |
| `observed_level` | text | emerging / developing / proficient / advanced |
| `evidence` | text | Evidence supporting the observation |
| `module_id` | text | Module where observation was made |
| `session_number` | integer | Session number |
| `created_at` | timestamptz | Created |

**Data retention:** 12 months (pg_cron job deletes older records).

### 5.31 Table: `level_change_requests` *(v4)*

Suggested proficiency level changes surfaced to users.

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid (PK) | Row ID |
| `user_id` | uuid (FK → auth.users) | User |
| `current_level` | text | beginner / intermediate / advanced / expert |
| `proposed_level` | text | beginner / intermediate / advanced / expert |
| `rationale` | text | Why the change is suggested |
| `evidence_summary` | text | Summary of supporting evidence |
| `status` | text | pending / accepted / declined / expired |
| `responded_at` | timestamptz | When user responded |
| `created_at` | timestamptz | Created |
| `expires_at` | timestamptz | Auto-expires after 7 days |

### 5.32 Table: `rate_limit_events` *(v4)*

Per-user rate limiting for edge functions.

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid (PK) | Row ID |
| `user_id` | uuid | User |
| `function_name` | text | Edge function name |
| `created_at` | timestamptz | Created |

**RLS:** Service role only (edge functions use service role key).
**Data retention:** 30 days (pg_cron daily cleanup).

### 5.33 Table: `retrieval_responses` *(v4)*

Spaced repetition engine — stores per-user answers to retrieval questions.

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid (PK) | Row ID |
| `user_id` | uuid (FK → auth.users) | User |
| `question_id` | text | Question identifier (e.g., "1-1-q1") |
| `module_id` | text | Source module |
| `quality` | smallint | 0-5 (0-2=weak, 3-4=ok, 5=strong) |
| `response` | text | Learner's answer text (optional) |
| `seen_at` | timestamptz | When question was presented |
| `session_id` | text | Session context |

### 5.34 Table: `response_feedback` *(v4)*

Thumbs up/down feedback on Andrea's messages.

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid (PK) | Row ID |
| `user_id` | uuid (FK → auth.users) | User |
| `session_id` | text | Training session |
| `module_id` | text | Training module |
| `message_index` | integer | Index of message in conversation |
| `message_preview` | text | Truncated message text |
| `rating` | smallint | -1 (thumbs down) or 1 (thumbs up) |
| `comment` | text | Optional feedback comment |
| `created_at` | timestamptz | Created |

**RLS:** Users can insert/view own feedback. Admins can view all.

### 5.35 Table: `submission_scores` *(v4)*

Persisted rubric scores from the submission_review edge function.

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid (PK) | Row ID |
| `user_id` | uuid (FK → auth.users) | User |
| `session_id` | text | Training session |
| `module_id` | text | Training module |
| `attempt_number` | integer | Attempt number (default 1) |
| `scores` | jsonb | Full rubric scores object |
| `summary` | text | Evaluation summary |
| `created_at` | timestamptz | Created |

**RLS:** Users can view own scores. Admins can view all. Service role can insert.

### 5.36 Table: `certificates` *(v4)*

Session/elective/program completion certificates.

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid (PK) | Row ID |
| `user_id` | uuid (FK → auth.users) | User |
| `session_id` | integer | Session number |
| `certificate_type` | text | session_completion / elective_path / full_program |
| `earned_at` | timestamptz | When certificate was earned |
| `metadata` | jsonb | Skill signals, capstone option, etc. |
| `created_at` | timestamptz | Created |

**Unique constraint:** `(user_id, session_id, certificate_type)`
**RLS:** Users can view/insert own certificates. Admins can view all.

### 5.37 Table: `proficiency_responses` *(v4)*

Assessment audit trail — stores full intake/proficiency questionnaire responses.

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid (PK) | Row ID |
| `user_id` | uuid (FK → auth.users) | User |
| `self_report_answers` | jsonb | Self-report dimension answers |
| `performance_scores` | jsonb | Performance-based scores |
| `confidence_level` | integer | Self-reported confidence (default 3) |
| `computed_score` | integer | Final 0-8 proficiency score |
| `assessment_version` | text | Assessment version (default '2.0') |
| `created_at` | timestamptz | Created |

### 5.38 Table: `admin_andrea_notes` *(v5 new)*

Stores admin Andrea summary notes per organization.

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid (PK) | Row ID |
| `user_id` | uuid (FK → auth.users) | Admin user |
| `organization_id` | uuid (FK → organizations) | Organization context |
| `summary` | text | Andrea note content |
| `created_at` | timestamptz | Created |

**RLS:** Users can view/insert/delete their own notes.

### 5.39 Table: `admin_andrea_conversations` *(v5 new)*

Stores persistent admin Andrea chat conversations.

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid (PK) | Row ID |
| `user_id` | uuid (FK → auth.users) | Admin user |
| `organization_id` | uuid (FK → organizations) | Organization context |
| `title` | text | Conversation title (default: 'New Conversation') |
| `messages` | jsonb | Full conversation history (default: `[]`) |
| `created_at` | timestamptz | Created |
| `updated_at` | timestamptz | Updated |

**RLS:** Users can CRUD their own conversations.

### 5.40 Table: `generated_module_content` *(v6 new)*

Caches AI-generated module content to avoid redundant regeneration.

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid (PK) | Row ID |
| `module_id` | text | Module identifier |
| `content` | text | Generated content |
| `metadata` | jsonb | Generation parameters and metadata |
| `created_at` | timestamptz | Created |
| `updated_at` | timestamptz | Updated |

### 5.41 View: `org_policies` *(v6 new)*

Database view providing streamlined access to organization resources and policies.

### 5.42 Table: `user_feedback`

User-submitted feedback/bug reports.

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid (PK) | Row ID |
| `user_id` | uuid (FK → auth.users) | User |
| `feedback_type` | text | bug / feature / general |
| `message` | text | Feedback content |
| `status` | text | new / resolved |
| `is_read` | boolean | Whether admin has read it |
| `created_at` | timestamptz | Created |

---

## 6. Edge Functions

All edge functions run on Deno runtime deployed to Supabase Edge Functions (Deno Deploy). They all share the same CORS configuration allowing requests from any origin, with JWT-based authentication via the Supabase Authorization header.

**Shared environment variables available to all edge functions:**
- ANTHROPIC_API_KEY — Anthropic Claude API key
- OPENAI_API_KEY — OpenAI embeddings API key
- SUPABASE_URL — Supabase project URL
- SUPABASE_ANON_KEY — Supabase anonymous/public key
- SUPABASE_SERVICE_ROLE_KEY — Supabase service role key (full bypass of RLS)

**Current edge functions (20 total):**
`trainer_chat`, `submission_review`, `ai-practice`, `agent-test-chat`, `workflow-test-chat`, `practice_chat`, `ai-trainer`, `generate-lesson`, `generate-module-content`, `embed_chunks`, `seed_lesson_chunks`, `parse-policy-document`, `intake-prompt-score`, `admin-create-user`, `admin-delete-user`, `admin-settings`, `speech-to-text`, `extract-agent-knowledge`, `generate-idea-preview`, `superadmin-kpis`, `_shared` (utilities)

---

### 6.1 trainer_chat — Andrea's Brain

**File:** supabase/functions/trainer_chat/index.ts
**Purpose:** Primary AI coaching function. Every message to Andrea (whether in training workspace, elective workspace, or dashboard) routes through this function.
**Model:** Claude Opus 4.6 (max_tokens: 1000; greeting mode: 400)

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
**Purpose:** Evaluates learner practice submissions and returns structured feedback. Used for quality-gated progression.
**Model:** Claude Sonnet 4.5 (max_tokens: 1200)

#### Module-Specific Rubrics

**v7: 23 module-specific rubrics** (expanded from ~8 in v6). Each module with a rubric uses a tailored evaluation prompt that tests the specific skills taught in that module.

**Session 1 Rubrics:**
| Module | Focus |
|--------|-------|
| 1-6 (Iteration) | Treating AI output as a draft; refining through directed iteration |
| 1-7 (Sandbox) | Independent application of all Session 1 techniques to real work |

**Session 2 Rubrics:**
| Module | Focus |
|--------|-------|
| 2-2 (Self-Review Loops) | Building a two-prompt generate-then-critique workflow |
| 2-3 (CLEAR Framework) | Applying Context/Length/Examples/Audience/Requirements structure |
| 2-5 (Outline Expander) | Providing skeleton structure and letting AI fill substance |
| 2-6 (Multi-Shot) | Using examples to teach consistent output patterns |
| 2-8 (Chain-of-Thought) | Designing multi-step reasoning for auditable analysis |
| 2-9 (Web Search) | Knowing when to enable/disable web search; articulating trade-offs |
| 2-10 (Sandbox) | Independent application of Session 2 techniques |

**Session 3 Rubrics (Skills & Projects):**
| Module | Focus |
|--------|-------|
| 3-3 (Building First Skill) | Complete skill with six anatomy components: Identity, Trigger, Procedure, Standards, Guardrails, Output Format |
| 3-4 (Adding Knowledge) | Giving skill domain knowledge for specialist behavior |
| 3-5 (Skills + Projects) | Combining skills and projects into working configuration |
| 3-6 (Sharing and Scaling) | Sharing skills, collecting feedback, identifying domain expertise |
| 3-7 (Capstone) | Complete skills and project configuration for actual use |

**Session 4 Rubrics (Agents & Autonomy):**
| Module | Focus |
|--------|-------|
| 4-2 (Agent Design) | Designing agent wrapper with six anatomy components: Skills, Triggers, Decision Logic, Guardrails, Escalation Path, Audit Trail |
| 4-3 (Build Agent) | Building and testing agent across four scenario types: Normal, Edge, Out-of-scope, Guardrail |
| 4-5 (Governance) | Writing governance brief covering six framework components: Authorization, Monitoring, Audit Trail, Exception Handling, Review Cadence, Kill Switch |

**Session 5 Rubrics (Everyday Tools):**
| Module | Focus |
|--------|-------|
| 5-1 (Functional Agents) | Identifying functional agents in tools; assessing when to use them |
| 5-2 (Spreadsheet AI) | Using AI features for data work acceleration |
| 5-3 (Presentation AI) | Using AI features for slide creation and quality |
| 5-4 (Inbox AI) | Using AI features for email while maintaining professional voice |
| 5-5 (Sandbox) | Practical integration of functional agents into daily workflow |

**Session 6 Rubrics (AI Workflow):**
| Module | Focus |
|--------|-------|
| 6-2 (Design Workflow) | Evaluating completeness and quality of multi-step AI workflow design |

Submission scores are persisted to `submission_scores` table for analytics and quality gate enforcement.

---

### 6.3 ai-practice — Real AI Simulation

**File:** supabase/functions/ai-practice/index.ts
**Purpose:** Simulates a real AI tool for learners to practice prompting against. No coaching. Also used by BrainstormPanel with custom brainstorm persona. **v6: Now multi-model — routes to Claude, GPT, or Gemini based on learner's model selection.**
**Default Model:** GPT 5.4 (OpenAI) — configurable per-user and per-organization
**Supported Models:** GPT 5.4, GPT 5.4 Mini, GPT 5.4 Reasoning, GPT 5.3/Mini, GPT 5.2/Mini, Claude Sonnet 4.6, Claude Opus 4.6, Gemini 3 (max_tokens: 1500)

**Mode 1 — Custom Agent (Session 4):** Uses learner's deployed agent system prompt.
**Mode 2 — Generic AI (Sessions 1-2):** Mirrors prompt quality behavior. Model selected by learner.
**Mode 3 — Brainstorm Persona (v4):** Andrea-guided workflow discovery for BrainstormPanel.

Key rule: vague prompts get generic responses; specific prompts get tailored responses.

---

### 6.4 agent-test-chat — Agent Development Testing

**File:** supabase/functions/agent-test-chat/index.ts
**Purpose:** Tests a user's AI agent during development in Agent Studio.
**Model:** Claude Opus 4.6 (max_tokens: 1500)

The user's system prompt is wrapped with meta-instructions ensuring: stay in character, banking realism, follow guard rails, mirror prompt quality.

---

### 6.5 workflow-test-chat — Workflow Step Testing

**File:** supabase/functions/workflow-test-chat/index.ts
**Purpose:** Tests individual steps of a multi-step AI workflow with context chaining.
**Model:** Claude Sonnet 4.5 (max_tokens: 1500)

Receives previousStepOutputs[] to chain outputs from prior steps into the current step's context.

---

### 6.6 practice_chat

**File:** supabase/functions/practice_chat/index.ts
**Model:** Claude Opus 4.6 (max_tokens: 1500)
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

### 6.8b generate-module-content *(v6 new)*

**File:** supabase/functions/generate-module-content/index.ts
**Purpose:** Generates AI-powered module content on demand. Results are cached in the `generated_module_content` table to avoid regeneration.
**Model:** Google Gemini (via Lovable AI Gateway)

---

### 6.8c superadmin-kpis *(v6 new)*

**File:** supabase/functions/superadmin-kpis/index.ts
**Purpose:** Aggregates cross-organization KPI data for the SuperAdmin dashboard. Returns system-wide enrollment, completion, and engagement metrics.
**Auth:** Requires super_admin role.

---

### 6.9 embed_chunks

**Model:** OpenAI text-embedding-3-small (dimensions: 1536, batch size 50, 200ms delay)
Generates and stores embeddings for lesson content chunks.

---

### 6.10 seed_lesson_chunks

Reads training content definitions and chunks them. Chunk types per module: overview, key_points, individual examples, steps, practice_task. The frontend calls `seedAllContent()` which invokes this function for both core sessions and elective paths.

---

### 6.11 parse-policy-document

**Models:** Gemini 3 (extraction and summary)
Admin-only PDF/DOCX policy parser. JWT verification disabled; performs own has_role() check.
**Storage:** policy-documents bucket (private, admin-only).

---

### 6.12 intake-prompt-score

**Purpose:** Scores user-written prompts during the onboarding intake questionnaire.
**Model:** Claude Haiku 4.5

---

### 6.13 admin-create-user / admin-delete-user

Admin-only functions for user account management. Bypass normal auth flow using service role key.

---

### 6.14 speech-to-text *(v5 new)*

**File:** supabase/functions/speech-to-text/index.ts
**Purpose:** Transcribes audio recordings to text for voice input in chat interfaces.
**Model:** Deepgram nova-2 (smart_format + punctuation enabled)

Accepts raw audio blobs or base64-encoded audio in JSON. Supports `audio/*`, `application/octet-stream`, and `multipart/form-data` content types. Returns transcript text.

---

### 6.15 extract-agent-knowledge *(v5 new)*

**File:** supabase/functions/extract-agent-knowledge/index.ts
**Purpose:** Extracts text from uploaded files for the Agent Studio knowledge base. Allows learners to feed documents into their agents.
**Models:** Google Gemini 2.5-Flash (via Lovable AI Gateway) for PDF extraction only; TXT/MD/CSV decoded directly; DOCX parsed via JSZip.

Authenticated users (non-admin) can upload files. Files are processed in-memory — no Supabase Storage required. Returns extracted text and inferred title from filename.

---

### 6.16 generate-idea-preview *(v5 new)*

**File:** supabase/functions/generate-idea-preview/index.ts
**Purpose:** Generates self-contained HTML prototypes for user ideas or executive submissions.
**Model:** Google Gemini 2.5-flash-lite (via Lovable AI Gateway, max_tokens: 4000)

Requires authentication and enforces rate limits (3/min, 30/day). Supports two target tables: `user_ideas` (owner-only) and `executive_submissions` (admin-only). Generates vanilla HTML/CSS/JS with injected Content-Security-Policy meta tag. Tracks preview status: `generating` → `generated` or `failed`.

---

### 6.17 Rate Limiter *(v5 new)*

**File:** supabase/functions/_shared/rateLimiter.ts
**Purpose:** Shared utility providing per-user, per-function rate limiting across all edge functions.

| Function | Per-Minute Limit | Per-Day Limit |
|----------|-----------------|---------------|
| `trainer_chat` | 30 | 200 |
| `ai-practice` | 60 | 500 |
| `practice_chat` | 60 | 500 |
| `submission_review` | 10 | 50 |
| `agent-test-chat` | 30 | 200 |
| `workflow-test-chat` | 30 | 200 |

Uses check-then-act pattern with insert-first to close race conditions. Fails open on DB outages (allows request, logs error).

---

### 6.18 admin-settings *(v7 new)*

**File:** supabase/functions/admin-settings/index.ts
**Purpose:** Manages `app_settings` key-value table for platform configuration. Supports GET (read settings) and POST (upsert settings).
**Auth:** Requires super_admin role. Validates JWT and checks role before proceeding.

---

## 7. Andrea AI Persona

### 7.1 Overview

Andrea is the AI training coach persona built on top of Anthropic Claude Claude Opus 4.6. She is not a separate model — she is a carefully constructed dynamic system prompt that shapes Claude behavior for banking AI training coaching. Every interaction with Andrea passes through the trainer_chat edge function, which assembles her complete system prompt in real time based on user context.

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
| Session 1 | HAND-HOLDING | Foundation & Early Wins — Explain concepts thoroughly. Assume learner has never prompted an AI. Offer examples proactively. Frame mistakes as "most people start here." Suggest next steps clearly. |
| Session 2 | COLLABORATIVE | Prompting Frameworks & Model Selection — Ask before telling. Reference Session 1 concepts. Give hints, not answers. Push specificity. |
| Session 3 | PEER | Skills & Projects — Challenge their thinking. Socratic questioning. Push for production quality. Learner should be driving. |
| Session 4 | ADVISOR | Agents & Autonomy — Governance rigor. Deployment readiness challenge. Assume strong foundational skills. |
| Session 5 | ADVISOR | AI in Your Everyday Tools — Practical application focus. Tool-workflow connection. Peer-level challenge. |
| Session 6 | ADVISOR | Designing Your AI Workflow — ROI and scale focus. Minimal hand-holding. Learner-driven capstone. Andrea provides expert guidance on AI stack design and integration. |

### 7.6 Learning Style Adaptations

| Style | Approach |
|-------|---------|
| example_based | Lead with a concrete, relatable banking example FIRST. Then short explanation of why the example works. End with a quick check question. |
| explanation_based | Start with clear, comprehensive explanation. Break down concepts step-by-step. Provide context and "why" before "how". End with brief recap. |
| logic_based | Begin with the underlying reasoning and principles. Present rules and frameworks systematically. Include verification steps and edge cases. |
| hands_on | Keep exposition minimal. Provide short checklist of action items. Give a tiny task or exercise to try immediately. Focus on practical application over theory. |

**Learning Style RAG Boost:** RAG retrieval uses the learner's `learning_style` to boost cosine similarity scores by 15% for chunks tagged with the matching style or `universal`.

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

### 7.8 Session Modes

The trainer_chat edge function operates in three distinct modes:

**Dashboard Navigator Mode** (`lessonId === 'dashboard'`):
- Skips RAG retrieval and bank policy injection
- Injects the complete curriculum module map (41 modules across 6 sessions)
- Keep responses to 2-3 sentences max — quick-help context, not a lesson
- Direct learners to specific modules when they ask about topics
- Check progress and suggest the next uncompleted module

**Brainstorm Mode** (`lessonId === 'brainstorm'`):
- Creative AI use-case discovery, tailored to proficiency levels
- Andrea guides learners through workflow discovery for their specific role

**Sandbox Mode** (sandbox-type modules):
- Unstructured free-form exploration with no rubric or submission requirement
- Andrea provides open-ended support without pushing toward a specific outcome

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

The frontend shows a purple "Save to Prompt Library?" card with one-click save.

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

When `greeting: true` is passed, Andrea generates a short personalized greeting (3-4 sentences max). Uses max_tokens: 400.

### 7.14 Proactive Trigger System
Andrea can proactively reach out to learners via the `useAndreaTriggers` hook and `AndreaDock` component. This is client-side trigger logic — no additional edge function calls are required for the trigger itself.

**Trigger types:**
1. **Return engagement** — User logs in after 3+ days away. Andrea nudges with a "Welcome back" preview.
2. **Feature unlock (Explore)** — Explore zone just became available. Andrea highlights what's new.
3. **Feature unlock (Community)** — Community zone just became available. Andrea encourages participation.
4. **Stall detection** — 10 minutes on `/training/*` without navigating. Andrea offers help.

**Constraints:**
- Maximum 1 trigger per browser session (sessionStorage)
- Dismissed triggers never repeat (localStorage)
- Stall timer resets on route change

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
          Toaster (ShadCN + Sonner)
            BrowserRouter
              SessionProvider  ← Manages session-level UI state
                ViewAsBanner   ← Super admin org preview banner
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

Protected Routes — Pre-Shell (no AppShell):
  /onboarding         → Onboarding.tsx (5-step new-user flow)

Protected Routes — Self-Wrapping AppShell:
  /dashboard          → Dashboard.tsx (wraps itself in AppShell with dynamic topBarActions)

Protected Routes — Full-Screen Focus Mode (no AppShell):
  /training/:sessionId → TrainingWorkspace.tsx (core training modules, sessions 1-6)
  /training/elective  → ElectiveWorkspace.tsx (elective module workspace)

Protected Routes — Profile Zone Hub:
  /profile            → Profile.tsx (3-tab hub: Personalization, Ideas & Feedback, Journey)

Profile Zone Redirects:
  /settings           → Redirects to /profile?tab=personalization
  /memories           → Redirects to /profile?tab=personalization
  /journey            → Redirects to /profile?tab=journey
  /my-profile         → Redirects to /profile?tab=my-profile

Protected Routes — Explore Zone (AppShell + breadcrumbs):
  /explore            → Explore.tsx (feature card grid hub)
  /prompts            → PromptLibrary.tsx (breadcrumb: Explore > Prompt Library)
  /ideas              → Ideas.tsx (breadcrumb: Explore > My Ideas)
  /electives          → Electives.tsx (breadcrumb: Explore > Elective Paths)
  /certificates       → Certificates.tsx (breadcrumb: Explore > Certificates)

Protected Routes — Community Zone (AppShell + breadcrumbs):
  /community          → CommunityZone.tsx (community feed hub)
  /policies           → Policies.tsx (breadcrumb: Community > Org Resources)
  /policies/:id       → PolicyDetail.tsx (breadcrumb: Community > Org Resources > Resource)

Protected Routes — Agents Zone:
  /agents             → AgentsZone.tsx (persistent agent chat, unlocked after first deploy)
  /agent/:agentId     → SharedAgentChat.tsx (shared agent public chat via link)

Admin Routes (no AppShell):
  /admin              → AdminDashboard.tsx (multi-tab admin panel)
  /super-admin        → SuperAdminDashboard.tsx (cross-org system admin)

Dev/QA Routes:
  /shell-preview      → ShellPreview.tsx (shell component preview)

Legacy Routes (still present):
  /questionnaire      → Questionnaire.tsx
  /topics             → TopicSelection.tsx
  /lesson             → Lesson.tsx

Catch-all:
  *                   → NotFound.tsx
```

### 8.3 AppShell Architecture
**File:** `src/components/shell/AppShell.tsx`

The AppShell is the persistent navigation wrapper for most protected routes. It provides a consistent layout with NavRail, TopBar, and AndreaDock.

**Props:**
```typescript
interface AppShellProps {
  children: React.ReactNode;
  breadcrumbs?: BreadcrumbItem[];
  topBarActions?: React.ReactNode;
  contentClassName?: string;
}
```

**Layout:**
- Desktop: Fixed NavRail (56px collapsed / 240px expanded) + main content area
- Mobile: Content area + 64px bottom tab bar
- TopBar: 64px sticky header with breadcrumbs and contextual actions
- AndreaDock: Floating AI assistant at bottom-right

**Key behaviors:**
- NavRail integrates with `useFeatureGates()` to show only unlocked zones
- Dashboard wraps itself in AppShell (dynamic topBarActions)
- Training workspaces bypass AppShell entirely (full-screen focus mode)
- Explore/Community sub-pages are wrapped in AppShell at the route level in App.tsx

### 8.4 NavRail Component
**File:** `src/components/shell/NavRail.tsx`

Primary navigation component with two display modes:

**Desktop (side rail):**
- Collapsed (56px): Spark icon logo + icon-only nav items + user initials circle
- Expanded (240px): SM Advisors full logo + icon+label+description per item + user name
- Toggle button for expand/collapse
- User dropdown menu at bottom: Profile, Settings, Admin links, Sign out confirmation

**Mobile (bottom bar):**
- 64px fixed bottom bar
- Icon + label for each visible zone
- Active state highlighting

**Zone routing:** Uses `resolveZonePath()` to handle dynamic paths (e.g., Learn zone routes to `/training/:currentSession`).

### 8.5 TopBar Component
**File:** `src/components/shell/TopBar.tsx`

64px sticky header:
- Left: Breadcrumb navigation (optional, with separators)
- Right: Contextual actions slot (buttons, filters)
- Breadcrumb items: `{ label: string; path?: string }` — last item renders as current page

### 8.6 AndreaDock Component
**File:** `src/components/shell/AndreaDock.tsx`

Three-state floating AI assistant:
- **Resting**: Avatar-only at bottom-right, minimal presence
- **Attentive**: Avatar + subtle glow + 2-3 word preview bubble with dismiss X
- **Active**: Full Sheet panel (380px wide) with chat interface

**Imperative ref handle:** `nudge(previewText)` and `rest()` for programmatic control from `useAndreaTriggers`.

### 8.7 SMILE Design Primitives
**Directory:** `src/components/smile/`

| Component | Purpose |
|-----------|---------|
| `SmileCard` | Card with 3 variants: default, interactive (hover effects), elevated (constant shadow). Supports `isLoading` state. |
| `ProgressStrip` | Horizontal module progress indicator. Dots/pills with state coloring (completed=accent, in_progress=ring, not_started=muted). Connecting lines between dots. |
| `EmptyState` | Centered placeholder for empty/locked zones. Icon + title + description + optional CTA. |
| `SkeletonLoader` | Loading states with 4 types: card, text, list-item, module-strip. |

### 8.8 Zone Configuration

**File:** `src/config/zones.ts`

```typescript
export const LEARNER_ZONES: Zone[] = [
  { id: 'home',      icon: Home,     label: 'Home',      description: 'What should I do next?',           path: '/dashboard',   unlockedBy: 'always' },
  { id: 'learn',     icon: BookOpen, label: 'Learn',     description: 'Your training sessions',           path: '/training/1',  unlockedBy: 'onboarding_completed' },
  { id: 'explore',   icon: Compass,  label: 'Explore',   description: 'Prompt library, ideas, electives', path: '/explore',     unlockedBy: 'session_1_basic_interaction_done' },
  { id: 'community', icon: Users,    label: 'Community', description: 'Share wins, connect with peers',   path: '/community',   unlockedBy: 'first_practice_done' },
  { id: 'agents',    icon: Bot,      label: 'Agents',    description: 'Your deployed AI agents',          path: '/agents',      unlockedBy: 'session_4_agent_deployed' },
  { id: 'profile',   icon: User,     label: 'Profile',   description: 'Preferences, memories, journey',   path: '/profile',     unlockedBy: 'onboarding_completed' },
];
```

Zones are **absent from the UI** until their unlock condition is met — not disabled or greyed out.

### 8.9 Context Architecture

**AuthContext** (`src/contexts/AuthContext.tsx`)
- Manages Supabase Auth session (login, logout, signup, password reset)
- Loads and caches `user_profiles` row for the current user
- Provides: `user`, `userProfile`, `session`, `signIn()`, `signOut()`, `signUp()`

**TrainingContext** (`src/contexts/TrainingContext.tsx`)
- Manages `training_progress` state with real-time update capabilities
- Provides: `progress`, `updateModuleCompletion()`, `currentSession`, `setCurrentSession()`

**SessionContext** (`src/contexts/SessionContext.tsx`)
- Manages session-level UI state within the training workspace
- Tracks: active module, expanded panels, practice conversation context

### 8.10 Key Pages

#### `Dashboard.tsx` (`src/pages/Dashboard.tsx`)

The main hub. Self-wraps in AppShell. Uses a **state machine** to render different views based on learner progress:

| State | Condition | View |
|-------|-----------|------|
| `brand_new` | Onboarding done, no modules started | Start Session 1 CTA + Andrea greeting |
| `mid_session` | Currently in progress | Continue button + progress bar (X/Y modules, %) |
| `between_sessions` | Prior session done, next not started | Green completion badge + Next session card + community teaser |
| `all_complete` | All 6 sessions finished | Congratulations + top skills list + Community CTAs |

Dashboard tracks 6 sessions: AI Fundamentals, Prompting Frameworks, Skills & Projects, Agents & Autonomy, AI in Everyday Tools, Designing Your AI Workflow. Uses `useUserAgents()` to show active agent card.

Additional sections:
- **BrainstormPanel**: Andrea-guided workflow discovery widget
- **UpcomingEventsSection**: 3 upcoming events with type icons, dates, locations
- **Community unlock hint**: Dashed border card explaining how to unlock (if locked)

#### `TrainingWorkspace.tsx` (`src/pages/TrainingWorkspace.tsx`)

Full-screen training interface (no AppShell). Multi-panel layout:

- **SessionSwitcher** (top): 6 session pills with state indicators (active/completed/accessible/locked)
- **Left panel (65%):** `ModuleContentPanel` — inline module viewer with scroll progress, learning outcomes, key points, examples, steps
- **Center panel (35%):** `PracticeChatPanel` — AI practice conversation interface with model selector
- **Right panel (collapsible):** `TrainerChatPanel` — Andrea coaching with prompt save support
- **Workspace modes:** `learn` | `practice` with mobile tab switcher

**Quality-gated progression:** Submission must pass quality gate before module is marked complete. Failed submissions show improvement guidance.

Context passed to Andrea for each message:
- `practiceConversation` — Current center-panel message history
- `agentContext` — Learner's current agent from Agent Studio (Session 2+)
- `workflowContext` — Learner's current workflow from Workflow Studio (Session 3)
- `learnerState` — Current module title, progress summary, completed modules

#### `ElectiveWorkspace.tsx` (`src/pages/ElectiveWorkspace.tsx`)

Dedicated training workspace for elective modules. Similar to TrainingWorkspace but:
- Sources content from `ELECTIVE_PATHS` (not `ALL_SESSION_CONTENT`)
- Reads `?path=<pathId>&module=<moduleId>` from URL query params
- Uses synthetic session ID `elective_<pathId>` for practice conversations
- Uses ADVISOR coaching depth (sessionNumber: 4) for all elective modules
- Quality gates applied to submissions (same as training)
- Mobile tab switcher: Practice | Coach

#### `Onboarding.tsx` (`src/pages/Onboarding.tsx`)

5-step new-user setup flow (v4 redesigned from 4 steps):
1. **Display Name** — Name input
2. **Job Role & Department** — job_role + department + employer_name
3. **Prompt Quality Assessment** — Scenario-based scoring → ai_proficiency_level
4. **Learning Style** — 4 options → learning_style
5. **AI Preferences** — Tone, verbosity, formatting → ai_user_preferences

#### `Profile.tsx` (`src/pages/Profile.tsx`)

3-tab user hub (replaces separate Settings, AIMemories, AIJourney pages):
- **Personalization tab**: AI preferences (tone/verbosity/format/learning style), role context, custom instructions, AI memories
- **Ideas & Feedback tab**: User's submitted ideas with status management
- **Journey tab**: Skill progression chart, session progress bars, certificate list

Tab navigation via URL query: `/profile?tab=personalization|ideas|journey`

**Personalization options:**
- Tone: professional / casual / technical
- Verbosity: concise / balanced / detailed
- Format: bullets / paragraphs / mixed
- Learning Style: example-based / explanation-based / hands-on / logic-based

#### `Explore.tsx` (`src/pages/Explore.tsx`) *(v4)*

Feature hub landing page (unlocked after Basic Interaction in module 1-3). Grid of 5 feature cards:
- Prompt Library (/prompts)
- My Ideas (/ideas)
- Elective Paths (/electives) — reserved for future elective content
- My AI Journey (/journey)
- Certificates (/certificates)

#### `CommunityZone.tsx` (`src/pages/CommunityZone.tsx`)

Community hub (unlocked after first practice chat started). Wraps existing CommunityFeed component in AppShell.

#### `AgentsZone.tsx` (`src/pages/AgentsZone.tsx`) *(v5 new)*

Persistent agent chat interface (unlocked after first agent deployment in Session 4 via `session_4_agent_deployed` gate). Works like a custom GPT — the user's deployed agent's `system_prompt` drives all responses. Messages persist in state. Uses `supabase.functions.invoke('ai-practice')` with the agent's system prompt. Includes share panel for sharing agents with colleagues.

#### `SharedAgentChat.tsx` (`src/pages/SharedAgentChat.tsx`) *(v5 new)*

Public (but auth-required) page at `/agent/:agentId` for chatting with shared agents. Loads agent from `user_agents` table where `is_shared = true`. Uses the same `ai-practice` edge function with the shared agent's system prompt. Handles 404 state if agent not found or not shared.

#### `AdminDashboard.tsx` (`src/pages/AdminDashboard.tsx`)

Multi-tab admin panel with **flex-wrap** tab layout. **Andrea advisor panel is a sticky right sidebar visible on ALL tabs** (not just C-Suite), with persistent conversation and notes via `admin_andrea_conversations` and `admin_andrea_notes` tables.

| Tab | Content |
|-----|---------|
| Users | User list, proficiency stats, role management |
| Organizations | Org registry + platform selector (default/chatgpt) + allowed models |
| Departments | Department and role management (industries → departments → roles) |
| Policies | Bank policy CRUD + PDF upload via parse-policy-document |
| Sessions | Schedule live training events |
| Events | Events calendar management |
| Ideas | Community idea moderation (status updates) |
| Progress | Learner progress dashboard (sessions 1-6) |
| C-Suite Reports | Engagement analytics, session completion rates, CSV export |
| C-Suite Advisor | Executive KPI dashboard with Andrea C-Suite AI advisor panel |
| Resources | Admin-managed `org_resources` link management |
| Community Review Queue | Moderate pending community posts (approve/reject) |
| Executive Submissions | View and manage idea escalations to leadership |

#### `SuperAdminDashboard.tsx` (`src/pages/SuperAdminDashboard.tsx`)

Separate page at `/super-admin`. Cross-organization visibility:
- System-wide KPI rollups (all orgs)
- Per-org drill-down analytics
- View-as-org preview mode
- Feature flag management
- User feedback review queue

### 8.11 Key Components

#### `TrainerChatPanel.tsx` (`src/components/training/TrainerChatPanel.tsx`)

Right-panel collapsible coach interface. Features:
- Markdown rendering via react-markdown + remark-gfm
- Suggested prompt chips
- "Get hint" button (shown when `hintAvailable: true`)
- Compliance flag banner with severity coloring
- "Remember this?" memory suggestion UI
- Purple "Save to Prompt Library?" card
- Submission review trigger button
- Auto-growing textarea input

#### `ModuleContentPanel.tsx` (`src/components/training/ModuleContentPanel.tsx`) *(v4)*

Inline module viewer (left panel, 65% width):
- Header: Icon + type badge + estimated time
- Scroll progress bar at top
- Content zones: Learning outcome → Key points → Overview → Steps → Examples → Learning objectives
- Footer: "Start Practice" CTA button
- Paragraph splitting on double-newlines or 3-sentence chunks

#### `PracticeChatPanel.tsx` (`src/components/training/PracticeChatPanel.tsx`)

AI practice conversation interface:
- Top bar: New Chat + Model selector (10 models, 3 providers, unlocked at Module 2-7) + History drawer
- Message history with markdown rendering
- Input textarea (multi-line, Enter to send)
- "Get Andrea's Feedback" submission button
- Quality gate pass/fail display
- Suggested prompts quick-buttons

#### `SessionSwitcher.tsx` (`src/components/training/SessionSwitcher.tsx`)

6-session pill navigation bar:
- States: active (primary bg), completed (green + checkmark), accessible (muted), locked (muted/50 + lock icon)
- Click navigates to `/training/:sessionNum`

#### `BrainstormPanel.tsx` (`src/components/BrainstormPanel.tsx`) *(v4)*

Andrea-guided workflow discovery widget on Dashboard:
- **Phase 1 (input)**: Textarea for task description + Start button
- **Phase 2 (chat)**: Multi-turn conversation with Andrea
- Submit actions: Save to Ideas | Post to Community | Send to C-Suite
- Andrea auto-summarizes conversation for submission
- Calls `ai-practice` function with custom brainstorm persona

#### `ExecutiveOverview.tsx` (`src/components/admin/ExecutiveOverview.tsx`) *(v4)*

C-suite admin landing:
- KPI cards for 10-second read on enablement status
- Attention items with severity badges (high/medium/low):
  - Compliance exceptions (high if repeat offenders)
  - Low-completion departments (<40% S1)
  - Funnel drop-off between sessions (>30% gap)
  - Pending ideas awaiting review
- Funnel chart: S1 → S2 → S3 → S4 → S5 → S6 completion rates

#### `AgentStudioPanel.tsx` (`src/components/agent-studio/AgentStudioPanel.tsx`)

Copilot-style agent builder. Guided mode with 5 accordion sections (Identity, Task List, Output Rules, Guard Rails, Compliance Anchors). Advanced mode with freeform system prompt. Auto-saves on change.

#### `WorkflowBuilder.tsx` (`src/components/workflow-studio/WorkflowBuilder.tsx`)

Visual workflow editor: Trigger → Step cards (add/remove/reorder) → Final output. Minimum 3 steps, minimum 2 human review checkpoints.

#### `CommunityFeed.tsx` (`src/components/CommunityFeed.tsx`)

Inline community forum. Three states: Topic List, Topic Detail, New Topic. **v4:** Now includes review queue status — new posts default to `pending` and require admin approval.

#### `ShareDialog.tsx` (`src/components/ShareDialog.tsx`) *(v5 new)*

Multi-destination sharing dialog for agents, workflows, ideas, and friction points. Share types: `idea` | `friction_point` | `agent` | `workflow`. Destinations: `community` | `my_ideas` | `executive`. Supports source tracking (`manual` | `andrea_suggested` | `andrea_user_requested`) and linked content IDs.

#### `DashboardChat.tsx` (`src/components/DashboardChat.tsx`)

Floating collapsible chat bubble on Dashboard. Persists conversations to `dashboard_conversations` table. Andrea operates in Navigator mode.

### 8.12 Custom Hooks

#### `useFeatureGates` (`src/hooks/useFeatureGates.ts`)

Progressive zone disclosure gate checker. Single source of truth for feature unlock state.

**Returns:**
```typescript
{
  isUnlocked(condition: UnlockCondition): boolean;
  unlockedZones: Zone[];
  canAccessLearn: boolean;
  canAccessExplore: boolean;
  canAccessCommunity: boolean;
  canAccessProfile: boolean;
}
```

Reads from `useAuth()` and `useUserAgents()` (for agent deployment check). The `session_4_agent_deployed` condition performs a count query on `user_agents` where `is_deployed = true`.

#### `useValueSignals` (`src/hooks/useValueSignals.ts`) *(v4)*

Analytics signal emission for impact tracking.

**Signal types:** `use_case_identified`, `workflow_built`, `time_saved_estimate`, `skill_applied`, `community_contribution`

**Returns:** `{ emitSignal(signalType, signalData) }`

Non-blocking: failures logged but don't disrupt flow.

#### `useAndreaTriggers` (`src/hooks/useAndreaTriggers.ts`) *(v4)*

Proactive Andrea engagement engine. 4 trigger types: return engagement, feature unlock (Explore), feature unlock (Community), stall detection.

**Returns:** `{ handleDismiss }` callback.

Uses sessionStorage (1 signal/session) and localStorage (dismissed triggers never repeat).

#### `usePracticeConversations` (`src/hooks/usePracticeConversations.ts`)

CRUD for `practice_conversations` table. Uses `useRef` for stable state reference to prevent race conditions in async DB writes.

#### `useDashboardConversations` (`src/hooks/useDashboardConversations.ts`)

Same pattern for `dashboard_conversations`. Supabase write performed inside `setState` updater closure for correct state capture.

#### `useUserPrompts` (`src/hooks/useUserPrompts.ts`)

Full CRUD for personal Prompt Library. Supabase with localStorage fallback.

#### `useElectiveProgress` (`src/hooks/useElectiveProgress.ts`)

Tracks elective module completion via `elective_progress` table. Supabase-backed with localStorage fallback.

#### `useOrgResources` (`src/hooks/useOrgResources.ts`)

Manages `org_resources` table for organization-specific resource links.

#### `useWorkspaceTour` (`src/hooks/useWorkspaceTour.ts`)

Multi-page guided tour system (Driver.js). Reads/writes `user_profiles.tours_completed` JSONB.

#### `useUserAgents` (`src/hooks/useUserAgents.ts`)

Full agent lifecycle: create, update, deploy, undeploy. Test conversation management.

#### `useUserWorkflows` (`src/hooks/useUserWorkflows.ts`)

Workflow lifecycle management with derived `draftWorkflow` computed value.

#### `useReporting` and `useSuperAdminKPIs` (`src/hooks/useReporting.ts`)

Aggregate analytics queries. Includes CSV export generation.

#### `useUserRole` (`src/hooks/useUserRole.ts`)

Role check with dual mechanism:
1. Database check via `get_user_role()` SECURITY DEFINER function
2. Hardcoded email allowlist: `["coryk@smaiadvisors.com"]` — break-glass mechanism

#### `useAIPreferences` (`src/hooks/useAIPreferences.ts`)

Manages `ai_user_preferences` and `ai_memories` tables.

#### `useOrganizations` (`src/hooks/useOrganizations.ts`)

Admin-only org + registration code management. Includes `updateOrgPlatform()` for setting organization platform (default/chatgpt).

#### `useAdminAndreaChat` (`src/hooks/useAdminAndreaChat.ts`) *(v5 new)*

Manages admin Andrea conversations and notes. Stores conversations in `admin_andrea_conversations` table and notes in `admin_andrea_notes` table. Loads most recent conversation on mount. Welcome message explains Andrea can help with training KPIs, risk spotting, ROI planning.

#### `useOrgPlatform` (`src/hooks/useOrgPlatform.ts`) *(v5 new)*

Returns organization platform preference (`chatgpt` | `default`) for the current user's org. Defaults to `default` if missing or loading.

#### `useShareContent` (`src/hooks/useShareContent.ts`) *(v5 new)*

Handles sharing content (ideas, friction points, agents, workflows) to multiple destinations (community, my_ideas, executive). Supports source tracking and linked content references. Returns `ShareResult` with success, errors, and shared destinations.

#### `useVoiceToText` (`src/hooks/useVoiceToText.ts`) *(v5 new)*

Audio recording and transcription hook using MediaRecorder API. Records in webm/opus (fallback: mp4), sends audio to `speech-to-text` edge function (Deepgram nova-2). Returns `isRecording`, `isProcessing`, and `onTranscript` callback.

### 8.13 Type Definitions

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
  identity: string;
  taskList: string[];
  outputRules: string[];
  guardRails: string[];
  complianceAnchors: string[];
  conversation_starters: string[];   // v5 — suggested opening messages
  knowledge_base: string[];          // v5 — extracted document text for agent context
  enabled_tools: string[];           // v5 — tool connections (web_search, code_interpreter, etc.)
}

interface UserAgent {
  id: string;
  user_id: string;
  name: string;
  description: string;               // v5
  status: 'draft' | 'testing' | 'active' | 'archived';
  template_data: AgentTemplateData;
  system_prompt: string;
  version: number;
  parent_version_id: string | null;
  last_test_results: any;            // v5
  is_deployed: boolean;
  deployed_at: string | null;        // v5
  is_shared: boolean;
  shared_at: string | null;          // v5
  created_at: string;
  updated_at: string;
}

function assembleSystemPrompt(template: AgentTemplateData): string { ... }
function countWords(text: string): number { ... }
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
```

### 8.14 Training Data Files

#### `src/data/trainingContent.ts`

**Curriculum v3.0** (Skills & Agents Restructure, April 9, 2026). Defines all 6 sessions and 41 modules. Governing principles: everything works, confidence before complexity, conversation-first computing, role-specific from the start.

Each module contains: id, title, type, description, estimatedTime, learningObjectives, learningOutcome, content (overview, keyPoints, examples, steps, practiceTask with departmentScenarios).

**Module types:** `document` | `exercise` | `sandbox` (no video modules currently defined)

**Gate modules** (marked with `isGateModule: true`): 27 total — 1-3, 1-4 (Session 1), 2-3 (Session 2), and ALL modules in Sessions 3-6

**`ELECTIVE_PATHS`:** Defined but currently empty (`[]`). Elective concepts have been folded into Sessions 5 and 6.

**`PLATFORM_TERMINOLOGY`:** *(v7 new)* Maps generic terms (`project`, `skill`, `agent`, `customization`) to platform-native equivalents. 5 platforms: `default`, `claude` (Claude Project, Claude Skill), `chatgpt` (Custom GPT), `copilot` (Copilot Studio), `gemini` (Gem). UI components rendering Sessions 3-4 content substitute these at render time.

**`KNOWLEDGE_CHECKS`:** *(v7 new)* Reflective closing questions for all 6 sessions, 3 questions per session. Used by the knowledge check component at session end.

**`ALL_SESSION_CONTENT`:**
```typescript
export const ALL_SESSION_CONTENT: Record<number, SessionContent> = {
  1: SESSION_1_CONTENT,
  2: SESSION_2_CONTENT,
  3: SESSION_3_CONTENT,
  4: SESSION_4_CONTENT,
  5: SESSION_5_CONTENT,
  6: SESSION_6_CONTENT,
};
```

#### `src/utils/seedLessonChunks.ts`

```typescript
async function seedAllContent(): Promise<{ sessions: SeedResult; electives: SeedResult }> {
  const sessions = await seedAllLessonChunks();
  const electives = await seedElectiveChunks();
  return { sessions, electives };
}
```

#### `src/utils/andreaTriggerStorage.ts` *(v4)*

Utility for managing Andrea trigger persistence in localStorage/sessionStorage:
- Tracks dismissed triggers (never repeat)
- Enforces max 1 signal per session

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

### 9.2 Row Level Security (RLS)

All tables have RLS enabled. The standard policy patterns:

```sql
-- Users can only access their own rows
CREATE POLICY "users_own_data" ON table_name
  USING (auth.uid() = user_id);

-- Admins can read all rows in their org (org-scoped)
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

**v4 addition — Community review queue RLS:**
```sql
-- Users see approved topics or their own pending topics
CREATE POLICY "Users see approved topics or own pending topics"
  ON community_topics FOR SELECT TO authenticated
  USING (status = 'approved' OR user_id = auth.uid());
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

`validate_registration_code()` now returns `org_type` from the organization record, allowing the frontend to tailor the onboarding experience for F&F (friends & family) users vs. bank employees.

### 9.6 User Deactivation
Admins can deactivate users via the `is_active` flag on `user_profiles`. Deactivated users' data is retained but they cannot access the platform.

### 9.7 Rate Limiting
Edge functions enforce per-user rate limits via the `rate_limit_events` table. Events older than 30 days are automatically purged via pg_cron.

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
1. Training content defined in `trainingContent.ts` (41 modules across 6 sessions)
2. `seedAllContent()` frontend function calls seed edge functions for both core session and elective content
3. Chunks tagged with `learning_style` (universal by default)
4. `embed_chunks` edge function generates 1536-dimension embeddings

**Online (per chat message):**
1. User message embedded via OpenAI (1536D vector)
2. `match_lesson_chunks()` Postgres function called with `filter_learning_style` from user profile
3. Chunks matching user's learning style or tagged `universal` receive a **15% similarity boost**
4. Top 6 chunks returned and injected into Andrea's system prompt

### 10.4 LLM Configuration

| Function | Model | max_tokens | Notes |
|----------|-------|-----------|-------|
| `trainer_chat` (Andrea) | Claude Opus 4.6 | 1000 | 400 for greeting mode; curriculum v3.0 with 6-session navigation map |
| `submission_review` | Claude Sonnet 4.5 | 1200 | Learning-style-adaptive feedback; proficiency-scaled guidance (0-8) |
| `ai-practice` | Multi-model (user selectable) | 1500 | Default: GPT 5.4. Routes to Claude, GPT, or Gemini based on user selection |
| `agent-test-chat` | Claude Opus 4.6 | 1500 | Wrapped system prompt |
| `workflow-test-chat` | Claude Sonnet 4.5 | 1500 | Step-specific context |
| `practice_chat` | Claude Opus 4.6 | 1500 | Practice chat with rate limiting |
| `intake-prompt-score` | Claude Haiku 4.5 | N/A | Quick prompt quality scoring during onboarding |
| `superadmin-kpis` | N/A | N/A | Database aggregation only (no LLM) |
| `generate-module-content` | Gemini (via Gateway) | N/A | Cached in `generated_module_content` table |
| `speech-to-text` | Deepgram nova-2 | N/A | Audio transcription |
| `extract-agent-knowledge` | Gemini 2.5-flash | N/A | PDF extraction only; other formats parsed locally |
| `generate-idea-preview` | Gemini 2.5-flash-lite | 4000 | HTML prototype generation |
| `generate-lesson` | Gemini 3 Flash Preview | 5000 | AI-powered lesson generation |
| `parse-policy-document` | Gemini 3 | N/A | PDF/DOCX policy extraction |

All Anthropic calls use API version `2023-06-01` and do not use streaming.

#### 10.4b Available Practice Models (v6 new)

**File:** `src/lib/models.ts`

| Model ID | Display Name | Provider | Notes |
|----------|-------------|----------|-------|
| `gpt-5.4` | GPT 5.4 | OpenAI | **Default** — recommended for practice |
| `gpt-5.4-mini` | GPT 5.4 Quick | OpenAI | Fast responses |
| `gpt-5.4-reasoning` | GPT 5.4 Think Deeper | OpenAI | Extended reasoning |
| `gpt-5.3` | GPT 5.3 | OpenAI | Previous generation |
| `gpt-5.3-mini` | GPT 5.3 Quick | OpenAI | Previous gen fast |
| `gpt-5.2` | GPT 5.2 | OpenAI | Older generation |
| `gpt-5.2-mini` | GPT 5.2 Quick | OpenAI | Older gen fast |
| `claude-sonnet-4-6` | Claude Sonnet 4.6 | Anthropic | Fast, intelligent |
| `claude-opus-4-6` | Claude Opus 4.6 | Anthropic | Most capable (reasoning: true) |
| `gemini-3` | Gemini 3 | Google | Fast & efficient |

Model selector is unlocked **during** Module 2-7 (not after completion). Available in the practice chat top bar next to the Work/Web toggle.

Organizations can configure `allowed_models` to control which models are available to their learners. Users' preferred model is persisted in `user_profiles.preferred_model` (default: `claude-sonnet-4-6`).

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

### 10.7 Spaced Repetition
The `retrieval_responses` table stores per-user answers to retrieval questions injected during training. Quality scores (0-5) determine rescheduling: weak responses (0-2) are presented again sooner, strong responses (5) are deferred.

### 10.8 Response Feedback
Learners can give thumbs up/down on Andrea's messages via the `response_feedback` table. Admin reporting surfaces aggregate feedback quality metrics.

### 10.9 Skill Observations
Andrea silently tracks skill observations via the `skill_observations` table (emerging/developing/proficient/advanced). When sufficient evidence accumulates, a `level_change_request` is created suggesting a proficiency level change to the learner.

---

## 11. Training Curriculum Structure

### 11.1 Overview

**Curriculum v3.0** — Skills & Agents Restructure (April 9, 2026). The curriculum now consists of **6 sessions with 41 modules** (up from 33 across 5 in v2.1). Old Session 3 (Agents) split into Session 3 (Skills & Projects) and Session 4 (Agents & Autonomy). Old Sessions 4-5 cascade to Sessions 5-6.

**Governing principles:**
- Everything works — nothing should fail in a way that makes the user feel they did something wrong
- Confidence before complexity — build wins early
- Conversation-first computing — AI interaction is a conversation, not a command
- Role-specific from the start — personalization happens in module 1-1, not after

**Module types:** `document` (conceptual), `exercise` (hands-on), `sandbox` (open-ended capstone)

**Gate modules:** 27 total — 1-3, 1-4 (Session 1), 2-3 (Session 2), and ALL modules in Sessions 3-6.

### 11.2 Session 1: AI Fundamentals & Your First Win (7 Modules)

Andrea Tier: **Hand-Holding** — detailed guidance, celebration of wins.

| Module | Title | Type | Est. Time | Key Content |
|--------|-------|------|-----------|-------------|
| 1-1 | Personalization | exercise | 10 min | Configure role, department, employer context; observe how personalization changes AI responses |
| 1-2 | Interface Orientation | document | 8 min | Core interface elements: conversation area, input, attachments, new thread control |
| 1-3 | Basic Interaction | exercise | 20 min | Describe tasks conversationally; iterate on responses; first real AI conversation |
| 1-4 | Your First Win | exercise | 15 min | Apply Session 1 skills to produce something real for actual work |
| 1-5 | The Flipped Interaction | exercise | 15 min | Let the AI interview you; Flipped Interaction Pattern for problem-solving |
| 1-6 | Iteration | exercise | 15 min | Treat output as draft; push further through directed follow-up |
| 1-7 | Sandbox | sandbox | 15 min | Free exploration and experimentation with all Session 1 techniques |

**Gate modules:** 1-3 (Basic Interaction — unlocks Explore zone), 1-4 (Your First Win).

**Department scenarios:** Module 1-3 includes `departmentScenarios` with tailored exercises for Commercial Lending, Retail Banking, Compliance, Wealth Management, etc.

### 11.3 Session 2: Prompting Frameworks & Model Selection (10 Modules)

Andrea Tier: **Collaborative** — ask before telling, push specificity.

| Module | Title | Type | Est. Time | Key Content |
|--------|-------|------|-----------|-------------|
| 2-1 | AI Limitations & Critical Evaluation | document | 15 min | How AI generates responses; recognizing limitations and hallucinations |
| 2-2 | Self-Review Loops | exercise | 15 min | Build two-prompt generate-then-critique workflows |
| 2-3 | Structured Prompting (CLEAR Framework) | exercise | 15 min | Context, Length, Examples, Audience, Requirements framework |
| 2-4 | Output Templating | exercise | 15 min | Shape AI output format with templates and structures |
| 2-5 | Outline Expander | exercise | 15 min | Provide skeleton structure and let AI fill substance |
| 2-6 | Multi-Shot Prompting | exercise | 15 min | Few-shot and multi-shot pattern examples for consistent output |
| 2-7 | Model Selection | document | 12 min | Understanding different AI models and when to use each |
| 2-8 | Chain-of-Thought Reasoning | exercise | 20 min | Step-by-step reasoning patterns for auditable analysis |
| 2-9 | Web Search | exercise | 15 min | When to enable/disable web search; OpenAI `web_search_preview` tool; articulating trade-offs |
| 2-10 | Sandbox | sandbox | 15 min | Open-ended exploration and practice with all Session 2 techniques |

**Gate module:** 2-3 (Structured Prompting).
**Model selector unlock:** During Module 2-7, learners gain access to the multi-model selector in the practice chat top bar.

### 11.4 Session 3: Skills & Projects — Your AI Specialists (7 Modules) *(v7 new)*

Andrea Tier: **Peer** — challenge thinking, Socratic questioning, push for production quality.

| Module | Title | Type | Est. Time | Key Content |
|--------|-------|------|-----------|-------------|
| 3-1 | Why Customization Matters | document | 12 min | Ad-hoc conversation vs persistent configuration; when customization pays off |
| 3-2 | Understanding Projects | exercise | 20 min | Project instructions, knowledge files, conversation history; create first project |
| 3-3 | Building Your First Skill | exercise | 25 min | Six-part skill anatomy: Identity, Trigger, Procedure, Standards, Guardrails, Output Format |
| 3-4 | Adding Knowledge to Skills | exercise | 15 min | Upload documents to skill; domain knowledge for specialist behavior |
| 3-5 | Skills and Projects Together | exercise | 15 min | Combining skills and projects into working configuration |
| 3-6 | Sharing and Scaling | exercise | 15 min | Share skills, collect feedback, identify domain expertise for skill candidates |
| 3-7 | Sandbox / Capstone | sandbox | 25 min | Full skill + project build for actual use |

**ALL modules are gate modules.** PLATFORM_TERMINOLOGY substitution active (renders platform-native terms for skill, project, etc.).

### 11.5 Session 4: Agents & Autonomy (7 Modules) *(v7 new)*

Andrea Tier: **Advisor** — governance rigor, deployment readiness challenge.

| Module | Title | Type | Est. Time | Key Content |
|--------|-------|------|-----------|-------------|
| 4-1 | From Skills to Agents | document | 12 min | Autonomy Spectrum — 5 levels: Conversation, Skill, Project, Agent, Orchestrator |
| 4-2 | Agents as Skill Orchestrators | exercise | 15 min | Six-part agent anatomy: Skills, Triggers, Decision Logic, Guardrails, Escalation Path, Audit Trail |
| 4-3 | Build a Working Agent | exercise | 25 min | Build and test agent across 4 scenario types: Normal, Edge, Out-of-scope, Guardrail |
| 4-4 | Adding Tools and Actions | exercise | 15 min | Connect tools (web search, code interpreter) to agents |
| 4-5 | Governance and Compliance | exercise | 15 min | Six-component governance framework: Authorization, Monitoring, Audit Trail, Exception Handling, Review Cadence, Kill Switch |
| 4-6 | Agent Deployment and Sharing | exercise | 15 min | Deploy agent, peer test, share via link |
| 4-7 | Sandbox / Capstone | sandbox | 25 min | Full agent build, test, and deploy capstone |

**ALL modules are gate modules.** Deploying an agent in this session unlocks the **Agents zone** (`session_4_agent_deployed`).

### 11.6 Session 5: AI in Your Everyday Tools (5 Modules)

Andrea Tier: **Advisor** — practical application, tool-workflow connection.

| Module | Title | Type | Est. Time | Key Content |
|--------|-------|------|-----------|-------------|
| 5-1 | What Are Functional Agents? | document | 10 min | Agents that live inside existing tools; when to use them vs custom agents |
| 5-2 | AI in Your Spreadsheet | exercise | 20 min | Spreadsheet AI integration patterns for data work acceleration |
| 5-3 | AI in Your Presentations | exercise | 20 min | Presentation AI integration patterns for slide creation |
| 5-4 | AI in Your Inbox | exercise | 15 min | Email AI integration patterns while maintaining professional voice |
| 5-5 | Sandbox | sandbox | 15 min | Choose-your-own functional agent exploration |

**ALL modules are gate modules.**

### 11.7 Session 6: Designing Your AI Workflow (5 Modules)

Andrea Tier: **Advisor** — ROI and scale focus, learner-driven capstone.

| Module | Title | Type | Est. Time | Key Content |
|--------|-------|------|-----------|-------------|
| 6-1 | Map Your Stack | exercise | 15 min | Audit current tools and identify AI integration points |
| 6-2 | Design Your Workflow | exercise | 25 min | Design a multi-tool AI workflow for your real work |
| 6-3 | Stitch It Together | exercise | 20 min | Connect agents, tools, and workflows into a cohesive system |
| 6-4 | Prototype & Test | exercise | 20 min | Build and test your integrated AI stack |
| 6-5 | Present & Reflect | sandbox | 15 min | Present your AI workflow stack and reflect on the journey |

**ALL modules are gate modules.**

### 11.8 Elective Paths (Currently Empty)

The `ELECTIVE_PATHS` array is defined but currently empty. Elective concepts from the prior curriculum have been folded into Sessions 5 and 6. The elective infrastructure remains in place for future use.

### 11.9 Knowledge Checks *(v7 new)*

The `KNOWLEDGE_CHECKS` export defines 3 reflective closing questions per session (18 total across 6 sessions). Questions cover key concepts from each session and are presented at session end to reinforce learning.

### 11.10 Proficiency Assessment (Onboarding)

The assessment is part of the 5-step onboarding flow (Step 3). Scenario-based questions with scoring mapped to proficiency levels. Full responses stored in `proficiency_responses` table for audit trail.

**Scoring:** Composite score normalized to 0-8 integer. Stored as `user_profiles.ai_proficiency_level`.

### 11.11 Quality-Gated Progression

27 modules are marked with `isGateModule: true` (all of Sessions 3-6 plus 1-3, 1-4, 2-3). Module completion requires passing a quality gate:
1. Learner completes practice conversation
2. Clicks "Get Andrea's Feedback" to submit for review
3. `submission_review` edge function evaluates against module-specific rubric
4. Scores persisted to `submission_scores` table
5. If pass: module marked complete, next module unlocked
6. If fail: improvement guidance shown, learner iterates and resubmits

---

## 12. Admin Capabilities

### 12.1 Content Management

- **Bank Policies:** Full CRUD. Upload PDF/DOCX for AI extraction + summary generation. Toggle active/inactive.
- **Training Modules:** View all 41 module definitions across 6 sessions. Trigger `seedAllContent()` for combined seeding and embedding.
- **Lesson Generation:** AI-powered lesson generation for new modules via generate-lesson edge function.
- **Org Resources:** Create and manage resource links (guides, videos, policies) visible to learners within the organization.

### 12.2 User Management

- **User List:** View all registered users with profile, completion status, last login.
- **Role Assignment:** Grant/revoke admin roles via `user_roles` table.
- **Organization Assignment:** View org membership via `user_profiles.organization_id`.
- **User Deactivation (v4):** Set `is_active = false` to deactivate users without deleting data.

### 12.3 Organization & Access Control

- **Organizations:** Create org records (name + slug + audience_type + industry + org_type + allowed_models + platform). View all orgs with user counts.
- **Platform Selector (v5):** Toggle organization platform between `default` and `chatgpt` via badge UI. Platform is set during org creation and can be changed afterward.
- **Registration Codes:** Create invitation codes with optional max_uses and expires_at. Deactivate codes.
- **Model Configuration:** Configure `allowed_models` per organization to control available AI models. Toggle GPT, Claude, and Gemini model families per org.
- **Industry Management (v6):** Support for multiple industry verticals (banking, healthcare). Healthcare departments (Parallon/HCA) seeded via migration.

### 12.4 Event Scheduling

- **Live Sessions:** Create/edit/cancel live training events. Shown on learner dashboard.
- **Events Calendar:** Separate general events management.

### 12.5 Analytics & Reporting

- **Executive Overview:** Admin landing with KPI attention items, severity badges, and funnel chart. 2-column layout (funnel + departments).
- **Engagement Reporting:** Message volume over time, active user counts, module completion rates across all 6 sessions. CSV export.
- **Proficiency Distribution:** Histogram of learner proficiency levels (0-8).
- **Department Distribution:** Breakdown of users by department.
- **Compliance Events:** Count and breakdown of compliance exceptions by type.
- **C-Suite Dashboard:** Overall completion %, engagement rate, average session progress, compliance exception rate. Andrea C-Suite AI advisor panel.
- **Idea Board Moderation:** View all community ideas, update status.
- **Submission Scores:** View rubric scores per learner/module for quality gate analytics.
- **Executive Submissions (v5):** Manage idea escalations to leadership with status tracking.

### 12.6 Andrea Admin Sidebar (v5 new)

Andrea advisor panel is a **sticky right sidebar visible on ALL admin tabs** (not just C-Suite). Conversations and notes persist via `admin_andrea_conversations` and `admin_andrea_notes` tables. Andrea can help admins with training KPIs, risk spotting, and ROI planning.

### 12.7 Community Moderation

- **Review Queue:** New community posts default to `pending` status and require admin approval before being visible to other users.
- **Status Management:** Admins can approve or reject pending community topics.

### 12.8 Super Admin Capabilities

Accessible at `/super-admin` by users with `super_admin` role:
- **Cross-org KPI dashboard:** System-wide enrollment, completion, and engagement metrics across all organizations (powered by `superadmin-kpis` edge function)
- **Full read access (v6):** SuperAdmin has full read access across all orgs via enhanced RLS policies
- **Org management restriction (v6):** Organization management restricted to SuperAdmin role only
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
**Extensions:** `pgvector` (for vector(1536) type and `<=>` cosine operator), `pg_cron` (v4 — for scheduled data retention)

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
supabase.from('org_resources' as any)
supabase.from('certificates' as any)
supabase.from('proficiency_responses' as any)
supabase.from('skill_observations' as any)
supabase.from('level_change_requests' as any)
supabase.from('rate_limit_events' as any)
supabase.from('retrieval_responses' as any)
supabase.from('response_feedback' as any)
supabase.from('submission_scores' as any)
supabase.from('executive_submissions' as any)
supabase.from('industries' as any)
supabase.from('departments' as any)
supabase.from('admin_andrea_notes' as any)
supabase.from('admin_andrea_conversations' as any)
```

### 13.6 Data Retention
Automated data retention via pg_cron scheduled jobs:

| Job | Schedule | Action |
|-----|----------|--------|
| `delete-old-practice-conversations` | Monthly (1st, 2am) | Delete records older than 12 months |
| `delete-old-dashboard-conversations` | Monthly (1st, 2am) | Delete records older than 12 months |
| `delete-old-skill-observations` | Monthly (1st, 2am) | Delete records older than 12 months |
| `delete-old-rate-limit-events` | Daily (3am) | Delete records older than 30 days |

---

## Appendix A: Information Security Risks & Recommended Controls

*(Carried forward from v1.0 with v4 additions.)*

### A.1 Pre-existing Risks (from v1.0)

1. **Prompt Injection** — Malicious user input could manipulate Andrea's behavior. Mitigated by compliance pre-filter and structured JSON response format.
2. **PII Leakage in Practice Conversations** — Users might paste real PII into practice chats. Mitigated by compliance detection regex and training content warnings.
3. **Service Role Key Exposure** — If leaked, grants full database bypass. Mitigated by keeping keys in Supabase Edge Function secrets only.
4. **Unauthenticated Edge Function Access** — `parse-policy-document` has JWT verification disabled. Mitigated by internal `has_role()` check.
5. **API Key Compromise** — Anthropic/OpenAI keys could be extracted from edge function environment. Mitigated by Supabase secrets management.
6. **CORS Wildcard Configuration** — All edge functions allow `*` origin. Risk accepted for current deployment model.
7. **Community Hub Content Moderation** — User-generated content in community feeds. Now mitigated by pending/approved review queue.
8. **Admin Email Hardcoding** — Break-glass admin list is hardcoded in frontend source. Risk accepted as intentional fail-safe.
9. **Data Retention** — Conversation data accumulates indefinitely. Now mitigated by pg_cron retention jobs (12 months for conversations, 30 days for rate limits).
10. **Supabase Anon Key Exposure** — Public key visible in frontend bundle. Risk accepted per Supabase design (RLS provides security).

### A.2 New Risks (v4-v6)

11. **Rate Limiting Bypass** — If `rate_limit_events` table is inaccessible, rate limiting fails open (by design). The `_shared/rateLimiter.ts` logs errors but allows requests through on DB outage.
12. **Safe Use Flag** — Users who indicate PII-pasting behavior during onboarding (`safe_use_flag`) should trigger enhanced compliance monitoring. Currently stored but not actioned.
13. **Executive Submission Visibility** — Ideas escalated to executive review contain user-generated content. Recommendation: review queue for exec submissions.
14. **Preview HTML Generation** — User ideas can generate HTML previews. `generate-idea-preview` injects Content-Security-Policy meta tag, but additional sanitization recommended before rendering.
15. **Shared Agent Access (v5)** — Any authenticated user can chat with shared agents via `/agent/:agentId`. Agent system prompts are exposed to other users. Recommendation: ensure system prompts don't contain sensitive information before sharing.
16. **Agent Knowledge Base (v5)** — Users can upload documents to agent knowledge bases. Extracted text is stored in `template_data.knowledge_base`. Recommendation: scan uploaded content for PII before storage.
17. **Voice Transcription (v5)** — Audio is sent to Deepgram external API. No audio is persisted locally, but transcription passes through a third-party service.
18. **Multi-model API key management (v6)** — Three separate API keys (Anthropic, OpenAI, Google) are now required for full functionality. Key rotation and monitoring should cover all three providers.
19. **Multi-provider data routing (v6)** — Practice chat content is sent to the user's selected AI provider (OpenAI, Anthropic, or Google). Each provider has different data retention and privacy policies. Recommendation: ensure all provider agreements cover banking/healthcare data handling requirements.
20. **Generated content caching (v6)** — AI-generated module content is cached in `generated_module_content` table. Cache invalidation should be considered when curriculum is updated.

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
| `ANTHROPIC_API_KEY` | Anthropic Claude API key | trainer_chat, submission_review, ai-practice, agent-test-chat, workflow-test-chat, practice_chat, intake-prompt-score |
| `OPENAI_API_KEY` | OpenAI API key (embeddings + GPT practice models) | embed_chunks, seed_lesson_chunks, trainer_chat, submission_review, ai-practice |
| `GOOGLE_AI_API_KEY` | Google AI API key (Gemini practice models) | ai-practice, generate-lesson, parse-policy-document |
| `DEEPGRAM_API_KEY` | Deepgram speech-to-text API key | speech-to-text |
| `SUPABASE_URL` | Auto-populated by Supabase | All functions |
| `SUPABASE_ANON_KEY` | Auto-populated by Supabase | All functions |
| `SUPABASE_SERVICE_ROLE_KEY` | Auto-populated by Supabase | trainer_chat, submission_review, parse-policy-document |

### B.3 Lovable AI Gateway

Lesson generation and document parsing use a Lovable-managed AI gateway routing to Gemini models. No separate API key required from SM Advisors.

---

## Appendix C: Database Migration History

All migrations use `IF NOT EXISTS` for idempotency. **Total: 71 migrations.**

| Migration File | Description |
|---------------|-------------|
| `20251215000000_enable_pgvector.sql` | CREATE EXTENSION IF NOT EXISTS vector |
| `20251220000000_create_user_roles.sql` | user_roles table, app_role enum, has_role(), get_user_role() SECURITY DEFINER functions |
| `20251225000000_create_user_profiles.sql` | user_profiles table with all profile columns |
| `20260101000000_create_training_progress.sql` | training_progress table |
| `20260105000000_create_app_settings.sql` | app_settings key-value table |
| `20260110000000_create_user_ideas.sql` | user_ideas table |
| `20260115000000_create_bank_policies.sql` | bank_policies table with RLS |
| `20260120000000_create_lesson_chunks.sql` | lesson_content_chunks table + original match_lesson_chunks() |
| `20260125000000_add_lesson_chunks_index.sql` | HNSW index on lesson_content_chunks.embedding |
| `20260128000000_create_live_sessions.sql` | live_training_sessions, events tables |
| `20260201000000_create_ai_memories.sql` | ai_memories, ai_user_preferences tables |
| `20260205000000_add_prompt_events.sql` | prompt_events telemetry table |
| `20260210000000_create_user_workflows.sql` | user_workflows table |
| `20260215000000_create_user_agents.sql` | user_agents, agent_test_conversations tables |
| `20260220000000_create_organizations_and_reg_codes.sql` | organizations, registration_codes, validate_registration_code() function |
| `20260222184243_*.sql` | Misc schema patches |
| `20260222200000_organizations_and_registration_codes.sql` | Org/reg code enhancements |
| `20260222221429_*.sql` | Misc patches |
| `20260222300000_create_departments_system.sql` |industries, departments, roles tables with RLS and seed data |
| `20260222400000_sharing_infrastructure.sql` |executive_submissions table; extends community_topics and user_ideas with category/source/linking columns |
| `20260222500000_skill_assessment.sql` |skill_observations, level_change_requests tables |
| `20260222700000_smile_v2_tables.sql` |user_prompts, elective_progress, certificates, proficiency_responses tables; session_4 columns on training_progress |
| `20260222800000_add_learning_style_to_chunks.sql` | learning_style column on lesson_content_chunks; updated match_lesson_chunks() with 15% style boost |
| `20260223000000_create_dashboard_conversations.sql` | dashboard_conversations table with RLS |
| `20260223000001_create_community_hub.sql` | community_topics, community_replies tables with RLS |
| `20260223100000_org_model_settings.sql` |allowed_models on organizations; preferred_model on user_profiles |
| `20260223100001_rate_limiting.sql` |rate_limit_events table (service role only) |
| `20260223150833_*.sql` | Misc patches |
| `20260223152151_*.sql` | Misc patches |
| `20260223200000_data_retention_cron.sql` |pg_cron jobs for 12-month conversation retention, 30-day rate limit cleanup |
| `20260223200001_retrieval_responses.sql` |retrieval_responses table for spaced repetition |
| `20260223204014_*.sql` | Misc patches |
| `20260223300000_community_review_queue.sql` |Adds status column to community_topics; review queue RLS policy |
| `20260223400000_user_deactivation.sql` |is_active flag on user_profiles |
| `20260223500000_response_feedback.sql` |response_feedback table (thumbs up/down) |
| `20260223500001_super_admin_and_ff.sql` |is_super_admin on user_profiles; org_type on organizations; interests[] for F&F; updated validate_registration_code() |
| `20260223600000_intake_revamp.sql` |intake_responses, safe_use_flag, intake_role_key, intake_orientation, intake_motivation[] on user_profiles |
| `20260223600001_submission_scores.sql` |submission_scores table for persisted rubric scores |
| `20260223700000_user_feedback_read_status.sql` | status and is_read columns on user_feedback |
| `20260223800000_fix_user_feedback_rls_and_status.sql` | Fixes RLS on user_feedback |
| `20260224000000_org_isolation_rls.sql` | get_my_org_id() and is_super_admin() helper functions; org-scoped RLS |
| `20260224100000_schema_rename_industry.sql` | Renames bank_role→job_role, employer_bank_name→employer_name, line_of_business→department; org_type→audience_type with value remapping; adds industry to organizations |
| `20260225100000_tours_and_resources.sql` | tours_completed JSONB on user_profiles; org_resources table |
| `20260227000000_idea_code_preview.sql` |preview_html, preview_status, preview_generated_at on user_ideas and executive_submissions |
| `20260228165218_*.sql` | Cleanup: reset stale preview_status |
| `20260305131819_*.sql` | Misc patches |
| `20260306201445_*.sql` | Misc patches |
| `20260307135027_*.sql` | **v5** — `admin_andrea_notes` and `admin_andrea_conversations` tables for admin Andrea persistence |
| `20260307220000_add_session_5_progress.sql` | **v5** — `session_5_completed` and `session_5_progress` on `training_progress`; extends `current_session` constraint to 1-5 |
| `20260308114552_*.sql` | **v5** — `validate_registration_code()` RPC function (validates code, returns org details) |
| `20260309000001_add_org_platform.sql` | **v5** — `platform` column on `organizations` (default: 'default') |
| `20260315100000_create_generated_module_content.sql` | **v6** — `generated_module_content` cache table for AI-generated module content |
| `20260315100001_create_org_policies_view.sql` | **v6** — `org_policies` materialized view for organization resources |
| `20260315100002_backfill_module_completion.sql` | **v6** — Backfill module completion data for existing users |
| `20260316100000_super_admin_full_read_access.sql` | **v6** — SuperAdmin full read access RLS policies across all orgs |
| `20260319100000_org_management_super_admin_only.sql` | **v6** — Restrict organization management to SuperAdmin role only |
| `20260320100000_seed_healthcare_departments.sql` | **v6** — Seed healthcare industry and Parallon/HCA departments |
| `20260326100000_fix_ai_preferences_rls.sql` | **v6** — Fix RLS policies on `ai_user_preferences` and `ai_memories` tables |
| `20260408100000_app_settings_super_admin_policy.sql` | **v7** — SuperAdmin access policy for `app_settings` table |
| `20260409100000_add_session_6_and_rename_agent_flag.sql` | **v7** — `session_6_progress` (JSONB), `session_6_completed` (BOOLEAN), `session_6_completed_at` (TIMESTAMPTZ) on `training_progress`; `session_3_skill_created` flag |

---

*End of SMILE Comprehensive Technical Reference v7.0*

**Document maintained by:** SM Advisors Development Team
**Document version:** 7.0
**Created:** 2026-02-22
**Updated:** 2026-04-09
**Next review date:** 2026-10-09
**Classification:** Internal / Confidential
