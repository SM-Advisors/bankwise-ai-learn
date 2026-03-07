# SMILE Platform — Curriculum Design v1.0
**Source:** Rivers Meeting, March 7, 2026
**Status:** Design Draft — For Review Before Implementation
**Owner:** SM Advisors

---

## Governing Principles

These are not guidelines — they are the constraints that every module, exercise, and sandbox must be evaluated against before it ships.

**1. Everything must work.**
At every stage of the early sessions, users succeed. There are no Hail Mary exercises, no edge cases, no experiments that might fail. Simple mode is the default until users have enough grounding to navigate failure productively.

**2. Confidence before complexity.**
The curriculum is designed for adoption and momentum, not completeness. Complexity gets staged in deliberately — one layer at a time, never more.

**3. Conversation-first computing.**
Users are learning to have a conversation with a system, not to operate a tool. The language of the platform reflects this. "Prompting" is never the word. Interaction, conversation, describing what you need — these are the frames.

**4. Role-specific from the start.**
Users see themselves in the content from Session 1 forward. Generic AI examples are a last resort. The first win is always something that fits their actual work.

**5. The Flipped Interaction Pattern is a through-line.**
Introduced early, reinforced throughout. The skill of letting the model ask you questions — rather than trying to craft the perfect ask yourself — is one of the most transferable skills in the curriculum.

**6. Output templating grows across sessions.**
It starts implicit (Session 1: bullets and an assumptions section, unannounced). It becomes explicit (Session 2: users deliberately define the shape of what they want back). It becomes advanced later (multi-shot examples, chain-of-thought reasoning chains, custom formats).

**7. Each sandbox is more open than the last.**
Session 1 sandbox: tightly scoped, high probability of success. Session 2 sandbox: bounded to structured prompts, model choices, and specific tools. Session 3+: open enough to explore, structured enough to succeed.

**8. Platform is configurable, curriculum is not.**
The platform a user interacts with (ChatGPT, Copilot, or another LLM interface) is set at the organization level. The core curriculum is platform-agnostic. Industry-specific content is edge — swappable by org configuration without touching a module.

---

## Session Architecture Overview

| Session | Theme | Modules | Core Skill Built |
|---|---|---|---|
| 1 | Foundation & Early Wins | 7 | Conversation-first computing |
| 2 | Structured Interaction, Models & Tools | 7 | Professional-grade prompting and tool discernment |
| 3 | Agents | 7 | Building and understanding autonomous AI |
| 4 | Functional Agents | Choose your own | Applying agents in the tools users already have |
| 5+ | Build Your Frankenstein | Open | Designing your own stack |

**Knowledge checks:** At the end of each session (not the start of the next). Retrieval practice closes the session and primes what comes next.

---

## Session 1: Foundation & Early Wins

**Goal:** The user leaves feeling like they are good at this. Every exercise works. Early success is the entire point.

**Design constraint:** Nothing in this session should be able to fail in a way that makes the user feel like they did something wrong.

**Andrea tier:** Hand-Holding — detailed guidance, celebration of wins, high presence throughout.

---

### Module 1: Personalization

**What we're teaching:** How to shape the system around who you are and how you work — before you do anything else.

**Why it comes first:** Once a user sees the interface, they immediately want to do something with it. If personalization is already done, the first output they get back feels relevant to them. That relevance is what hooks them. Without it, the first response feels generic and the mental model that forms is "this isn't really for me."

**What the user does:**
- Sets their role, department, and employer context
- Configures basic preferences (tone, output style, level of detail)
- Sees a simple before/after showing how personalized context changes a response vs. a generic one

**Teaching moment:** The system is not fixed. It adapts to you. Your job is to teach it who you are.

**Edge layer:** Role, department, and employer options draw from the org's industry content pack. The exercise itself is core.

---

### Module 2: Interface Orientation

**What we're teaching:** What the user is looking at and how to start an interaction.

**Design constraint:** Not a feature walkthrough. Not a manual. A minimal guide to the major controls so the user can proceed without feeling lost.

**What the user does:**
- Understands the core interface layout for their org's configured platform
- Learns how to start a conversation, attach a file, start a new thread
- Sees what the major controls do without being overwhelmed by all of them

**What we do NOT do here:** Explain models, tools, history panels, settings. Those come later. Orientation is about "I know enough to begin."

**Edge layer:** Interface screenshots and walkthroughs reflect the org's configured platform (ChatGPT, Copilot, etc.). The orientation structure is core.

---

### Module 3: Basic Interaction

**What we're teaching:** How to describe what you need. How to recognize whether the response you got is useful. How to keep going when it isn't.

**Framing:** This is not prompting. This is a conversation. You describe what you need the way you would describe it to a smart colleague who is new to your work.

**Teaching sequence:**
1. Dirty paste — take something real (an old email, a doc, a set of notes) and hand it to the model with a plain description of what you want. No special structure.
2. Recognize the response — is it useful? What's missing? What did it assume?
3. Follow up — ask for what's missing, correct the assumption, go again.

**The Flipped Interaction Pattern (introduced here):**
Teach the user to let the model ask them questions instead of trying to craft the perfect ask. "Before you give me X, ask me three questions that will help you do this better." This becomes the go-to move for any complex task throughout the platform.

**The Outline Expander (key exercise):**
Based on Jules White's concept. The user gives the model an outline of what they want. The model fills it in. This teaches output templating and the Flipped Interaction Pattern simultaneously — the model follows a template with you, you can iterate on it, and the user realizes they can keep refining within the same conversation.

**Output templating (implicit, first appearance):**
Do not name it yet. Structure the exercise so the model returns something with bullets and an "assumptions" section at the end. The user sees a shaped output without being taught a framework. The lesson is experienced, not explained.

---

### Module 4: Your First Win

**What we're teaching:** One practical use case that fits the user's actual work.

**Design constraint:** Easy enough to succeed. Real enough to feel meaningful. Role-specific — not a generic example.

**What the user does:**
- Takes a real or realistic work task from their department
- Runs through it with the model using what they learned in Module 3
- Gets a result they could actually use

**Andrea's role here:** Surface the task. Walk alongside the user. Flag when the output is good enough to stop. Celebrate the win.

**Edge layer:** The task and example scenarios are drawn from the org's industry content pack. The teaching structure is core.

**Principle:** The first win matters more than anything else in the session. If users leave Module 4 having produced something useful, the session has done its job even if they don't complete the remaining modules.

---

### Module 5: Iteration

**What we're teaching:** Value comes from refining the conversation, not from getting it perfect the first time.

**Design:** Take the same task from Module 4 and make it slightly more complex or add a constraint. The user has to iterate — go back, refine, ask differently, get a better result.

**Key lesson:** Most people think AI either works or it doesn't. This module teaches that the conversation itself is the work. The first response is not the output — it's the starting point.

**Output templating (grows here):**
Now introduce asking the model to restructure its output mid-conversation. "Give me the same answer but now put it in a table with three columns." The user sees that output format is something they control in real time.

---

### Module 6: Self-Review Loops

**What we're teaching:** How to prompt the model to critique, score, and improve its own output — before the user acts on it.

**Why it belongs here:** After iteration, users have a natural question they haven't named yet: "How do I know when what I've got is actually good?" Self-review loops answer that question with a technique, not a checklist.

**Teaching sequence:**
1. Generate a draft output on a real task
2. Ask the model to score the output against a stated criteria ("Review this against the following three criteria and identify what's missing or weak")
3. Ask the model to produce a revised version based on its own critique
4. Compare the original and the revised — the user makes the final call

**Key distinction:** The model's self-critique is not the final word. The user evaluates the critique before acting on it. This builds critical thinking, not blind trust in the second response.

**What this replaces:** The instinct to paste the output into a new conversation and "start fresh." Self-review loops keep the context and compound it.

**Output templating connection:** Users naturally start to see that the critique step is itself a template — and they can reuse it across different types of outputs.

---

### Module 7: Sandbox

**What we're teaching:** Nothing new. Practice.

**Design constraint:** Tightly scoped. Suggested tasks available. Probability of success must remain high.

**What the user does:**
- Applies the patterns from Modules 3–6 to a task of their choice
- Can choose from suggested starting points or bring their own
- Andrea available but doesn't lead — responds to what the user initiates

**Session closes with:** Knowledge check — retrieval practice on the key patterns from this session, priming Session 2.

---

## Session 2: Structured Interaction, Models & Tools

**Goal:** Move from casual conversation to professional-grade use. Users learn to shape, direct, and aim their interactions intentionally.

**Design constraint:** Everything must still work. This session introduces more complexity but does not introduce unpredictability. No Hail Marys.

**Andrea tier:** Collaborative — guided discovery, probing questions, less directive than Session 1.

---

### Module 1: Structured Prompting

**What we're teaching:** How to communicate with the model when the task is specific, high-stakes, or requires a particular kind of output.

**This is where the CLEAR Framework (or equivalent) lives.** Not Session 1. It belongs here because users now have enough experience with basic interaction to understand why structure helps. In Session 1, the framework would be friction. Here, it is relief.

**Teaching sequence:**
- Start with a task the user tried in Session 1
- Show how adding structure to the ask changes the output quality
- Walk through the framework as a tool for more complex or higher-stakes asks

**Key distinction:** Structure is a tool for specific situations. Casual conversation is still valid and often sufficient. This is not "the right way" — it's "the right way when you need precision."

---

### Module 2: Output Templating (Explicit)

**What we're teaching:** Users deliberately define the shape of what they want back.

**This is where the implicit pattern from Session 1 gets named and formalized.**

**Teaching sequence:**
- Bullets vs. paragraphs — when each serves you
- Adding sections: assumptions, risks, next steps, comparisons, action plans
- Specifying format up front vs. reshaping mid-conversation
- Combining output templates with structured prompts

**Key exercise:**
User picks a real work deliverable. They define the output template first — before they write a single word of the actual ask. Then they write the ask. They compare the result to what they would have gotten without the template.

**Why this matters:** This is the bridge between casual AI use and real professional utility. Once users can specify output shape, they can use AI to produce work product — not just answers.

---

### Module 3: Multi-Shot Prompting

**What we're teaching:** How to use examples to train the model on the exact format, style, and quality standard you want — rather than describing it in words.

**Why it belongs here:** Users just learned to define output shape. Multi-shot prompting is the natural next level: instead of telling the model what you want, you show it. Two or three well-chosen examples do more work than a paragraph of instructions.

**Teaching sequence:**
1. Start with a plain ask and observe the output
2. Add one example of what "good" looks like — observe how the output changes
3. Add a second example — observe again
4. Identify what the examples are communicating that the words alone couldn't (format, tone, compliance language, level of detail)

**Key exercise:**
User selects a recurring output type from their work (a summary, a memo, a client-facing note). They find two existing examples of that output done well. They use those examples to get the model to match the standard without writing a single formatting instruction.

**What this unlocks:** Consistency. Once users can hand examples to the model, they stop getting AI-sounding output and start getting output that fits their actual professional context.

---

### Module 4: Model Selection

**What we're teaching:** Different models exist for different tasks. Discernment, not preference.

**Design principle:** Every model gets a specific task type attached to it — not a description. "If you're going to use this mode, here is how your interaction should go. Here is what you should be trying to accomplish with it."

**Teaching sequence (platform-configured, ChatGPT default):**
- Default/auto: general conversation, quick drafts, exploration
- Thinking/reasoning: complex analysis, multi-step problems, tradeoffs
- Extended thinking/pro: deep research, nuanced synthesis, high-stakes output

**What the user does:**
Take the same underlying task and run it through two different modes. Compare the outputs. Understand not just what's different, but when each approach is worth it.

**Key lesson:** Choosing a model is an act of discernment, not trial and error. Users should be able to say "I'm using this mode because this task requires it" — not "I'm using it because it's there."

**Edge layer:** Model names and descriptions reflect the org's configured platform. The discernment framework is core.

---

### Module 5: Chain-of-Thought Mastery

**What we're teaching:** How to prompt the model to reason step-by-step through complex problems — and how to design prompts that produce auditable, traceable reasoning chains.

**Why it belongs after model selection:** Users just learned that some models are built for deeper reasoning. This module teaches them how to structure asks that actually unlock that reasoning capability, rather than getting a summary dressed up as analysis.

**Teaching sequence:**
1. Run a complex task with a standard prompt — observe the output
2. Ask the model to "show its work" — add step-by-step reasoning to the same task
3. Design a 3-to-5 step reasoning chain explicitly in the prompt ("First, identify X. Then assess Y. Then conclude Z.")
4. Compare the two outputs — what does the reasoning chain expose that the summary hid?

**Key exercise:**
User takes a real analytical task from their work. They design a prompt that produces a reasoning chain with explicit steps. They evaluate whether each step in the chain holds up — and flag the step where the reasoning is weakest.

**Why this matters:** Chain-of-thought outputs are auditable. In professional contexts, the reasoning behind a conclusion often matters as much as the conclusion itself. This module teaches users to produce AI-assisted analysis they can actually stand behind.

**Connection to self-review loops:** Users can now combine these two skills — ask the model to reason step-by-step, then ask it to critique its own reasoning chain before the user reviews it.

---

### Module 6: Tool Selection

**What we're teaching:** Each tool solves a specific kind of problem. Users learn to recognize when a tool applies — not just how to operate it.

**Design principle:** Each tool gets introduced through a scenario where its value is obvious. No abstract feature walkthroughs.

**The Flipped Interaction Pattern applied to tools:**
"Scan this tool. What are some ways I could use this?" — this is how you teach resilient tool adoption. Users learn to interrogate new tools the same way they interrogate tasks. It generalizes beyond anything the platform explicitly covers.

**Important caveat:**
This tip must come with a warning. When users ask the model what a tool can do, some will trust whatever the model says uncritically. That leads to the weird screenshots. The lesson: use the model to explore possibilities, then verify before you rely on them.

**Teaching sequence:**
One tool at a time. Here is the scenario where this tool is the right move. Use it. See the result. Understand why you used this and not the default conversation.

**What must NOT happen here:** Overwhelming users with all available tools at once. Two to three tools, each with a clear use case, each producing a working result.

**Edge layer:** Tool examples and scenarios draw from the org's industry content pack and configured platform. The selection framework is core.

---

### Module 7: Sandbox

**What we're teaching:** Nothing new. Structured practice.

**Design constraint:** Bounded. Suggested tasks tied to specific models and tools. Users can experiment but within a defined scope — structured prompts, model choices, and tool selection from what was covered.

**What success looks like:** User has used at least one tool and at least two models on tasks they actually care about. They leave with a clearer sense of their own preferences and use patterns.

**Session closes with:** Knowledge check — retrieval practice on the key patterns from this session, priming Session 3.

---

## Session 3: Agents

**Goal:** Users understand what agents are, why they exist, and how to build one — only after conversation-first computing is solid.

**Design constraint:** Agents only make sense once users understand what a conversation with an AI can do. Session 3 is not reachable until Sessions 1 and 2 are complete.

**Andrea tier:** Peer — Socratic, minimal hand-holding, challenges assumptions.

---

### Module 1: Why Agents Exist

**What we're teaching:** The conceptual foundation before anyone builds anything.

**Key framing:**
- A basic conversation is a generalist. It helps with everything at a general level.
- A custom agent is a specialist. It is configured for specific work.
- An agent connected to a workflow can execute, not just advise.
- An autonomous agent operates when triggered — you set the trigger, not the prompt.

**Universal example (everyone can see themselves in this):**
A strategic organizer for loose, unstructured thoughts. The user has ideas, fragments, half-formed observations. The agent's job is to make sense of them, organize them, surface connections. This is universally useful — not industry-specific, not role-specific.

**What the user does:**
Uses a pre-built example agent. Sees what it can do. Understands what makes it different from a basic conversation. Starts to see the application in their own work.

---

### Module 2: The Four Levels

**What we're teaching:** The progression from conversation to specialist to executor to autonomous — and where each level is appropriate.

| Level | What it is | What it does |
|---|---|---|
| 1 | Basic chat | Generalist conversation |
| 2 | Custom agent | Specialist — configured for specific work, information only |
| 3 | Agent + workflow/tool | Can execute tasks, not just advise |
| 4 | Triggered/autonomous | You set the trigger. It runs without a prompt. |

**Key lesson:** Most users do not need Level 4. Most users will get enormous value from Level 2. The curriculum should not make Level 4 feel like the goal — it is one option among several, appropriate for specific circumstances.

---

### Module 3: Build a Basic Agent

**What we're teaching:** Level 2. A custom agent with nothing but instructions.

**Design constraint:** No knowledge files. No tools. No external connections. Just a well-configured specialist.

**What the user does:**
- Defines a job for the agent (something useful, relevant to their work)
- Writes the instructions
- Tests the agent
- Iterates on the instructions based on what comes back

**Teaching moment:** Writing agent instructions is like writing a job description. You are defining the role, the scope, the style, and the constraints. The more specific you are, the more useful the agent becomes.

---

### Module 4: Add Knowledge

**What we're teaching:** The same agent, one layer added — a knowledge base.

**What the user does:**
- Takes the agent from Module 3
- Adds relevant documents, references, or guidelines
- Tests the difference — how does the agent's output change when it has context?

**Key lesson:** Knowledge is not just files. It is the difference between a generalist with a title and a specialist who actually knows the domain.

---

### Module 5: Add Files

**What we're teaching:** The same framework, another layer — file access and handling.

**What the user does:**
- Extends the agent to work with user-provided files
- Tests how the agent handles documents, spreadsheets, or data files relevant to their work

---

### Module 6: Add Tool Access

**What we're teaching:** The transition from Level 2 to Level 3 — an agent that can execute, not just advise.

**What the user does:**
- Connects the agent to a tool (web search, data lookup, a connected workflow)
- Tests an interaction that produces an action, not just a response

**Teaching moment:** This is where the agent stops being an advisor and starts being a participant in the workflow. The distinction matters — users need to know what their agent is doing, not just what it's saying.

---

### Module 7: Sandbox / Capstone

**What we're teaching:** Nothing new. Build your own.

**What the user does:**
- Designs an agent for a real use case in their work
- Works through the four layers (instructions → knowledge → files → tools) as far as makes sense for their use case
- Presents the agent's output and reflects on what worked

**What success looks like:** User has built something they plan to actually use. Andrea's role is to push for specificity — "what would make this agent 10x more useful to you in your actual work?"

**Session closes with:** Knowledge check — retrieval practice on the key patterns from this session, priming Session 4.

---

## Session 4: Functional Agents (Choose Your Own Adventure)

**Goal:** Users learn to use agents that already exist in the tools they already have — rather than building from scratch.

**Design:** Choose-your-own-adventure. Users pick the tool most relevant to their work and go through a module built around that tool.

**Examples (platform-configured):**
- ChatGPT in Excel
- ChatGPT in PowerPoint
- AI in the email client
- Other platform-specific agents as they emerge

**Teaching sequence per tool:**
1. What this tool can do (scenario-grounded, not a feature list)
2. A guided exercise with a real work task
3. What to watch out for (where the tool breaks down or misleads)
4. Sandbox

**Key principle:** Users arrive here bought in on the concept of agents. They are ready to explore. The platform's job is to give them a structured on-ramp to the tools that matter for their specific role — not to cover everything.

**Andrea tier:** Advisor — strategic consulting perspective, pushes for ambition.

---

## Session 5+: Build Your Frankenstein

**Goal:** Users design their own stack.

**Who this is for:** Users who have conversation-first computing down. Who have built agents. Who have used functional tools. Who are bought in and ready to explore.

**What this is not:** A requirement. This is for users who want to go further.

**What the user does:**
- Identifies a workflow in their work that AI could meaningfully improve
- Maps out what it would take — which tools, which agents, which connections
- Builds a prototype, even if rough
- Presents the result and gets feedback

**The governing metaphor:**
You've seen how all of this works. Now build your Frankenstein. Stitch the pieces together in the way that serves your work. No one else's Frankenstein looks exactly like yours, and that's the point.

**Andrea tier:** Advisor — strategic consulting perspective, pushes for ambition.

---

## Andrea Coaching Tier Alignment

| Session | Andrea Tier | Coaching Posture |
|---|---|---|
| 1 | Tier 1: Hand-Holding | Detailed guidance, celebration of wins, high presence |
| 2 | Tier 2: Collaborative | Guided discovery, probing questions, less directive |
| 3 | Tier 3: Peer | Socratic, minimal hand-holding, challenges assumptions |
| 4–5 | Tier 4: Advisor | Strategic consulting perspective, pushes for ambition |

---

## What Changes from the Current Build

| Current State | New Design | Rationale |
|---|---|---|
| CLEAR Framework in Session 1 | Session 2, Module 1 | Users need basic interaction experience before frameworks help rather than confuse |
| Agents in Session 2 | Session 3 | Agents only make sense after conversation-first computing is solid |
| Role-specific content in Session 3 | Woven into Session 1 from Module 4 | Role relevance is the hook — can't wait until Session 3 to make it personal |
| Output templating not formally taught | Implicit in Session 1, explicit in Session 2 | Most transferable professional skill in the curriculum |
| Model selection not a dedicated module | Session 2, Module 4 | Discernment about models is a teachable skill |
| Tool selection as feature walkthrough | Scenario-based, Session 2 Module 6 | Users learn to apply tools, not just recognize them |
| 12 elective modules across 4 paths | 3 core advanced modules absorbed into Sessions 1–2 | Self-Review Loops → S1M6, Multi-Shot → S2M3, Chain-of-Thought → S2M5 |
| Knowledge checks at session start | End of each session | Retrieval practice closes the session, primes the next |
| Platform hardcoded to one interface | Platform set at org level, modules are platform-agnostic | Enables Copilot, ChatGPT, or any LLM swap without curriculum changes |
| Industry content hardcoded | Industry content in edge layer, configurable per org | Banking is the default edge config; any industry can be swapped |

---

## Resolved Design Decisions

| Decision | Resolution |
|---|---|
| Platform selection | Org-level configuration. Core curriculum is platform-agnostic. Interface references are edge. |
| Industry content | Edge layer. Banking is default. Any industry swappable without touching core modules. |
| Electives | Paths 2–4 removed. Path 1 absorbed: Self-Review Loops (S1M6), Multi-Shot (S2M3), Chain-of-Thought (S2M5). |
| Knowledge checks | End of each session. |
