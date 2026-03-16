# SMILE Curriculum Restructure — Technical Requirements Document

**Document Version:** 1.0
**Date:** March 15, 2026
**Author:** Cory K / SM Advisors (with AI training expert review)
**Target Executor:** Claude Code
**File Under Modification:** `src/data/trainingContent.ts`

---

## EXECUTIVE SUMMARY

This TRD specifies a complete restructure of the SMILE curriculum in `src/data/trainingContent.ts`. The changes are organized into 7 sequential phases. Each phase MUST be completed fully before moving to the next phase. Do NOT skip phases. Do NOT reorder phases. Do NOT make changes outside the scope of the current phase.

The changes include:
1. A new weighted success criteria system applied to every module
2. Session 1 restructure (remove techniques from 1-3, add new Flipped Interaction module, remove Self-Review Loops, resequence)
3. Session 2 restructure (add AI Limitations module, add Self-Review Loops from S1, add Outline Expander, rename Chain-of-Thought, resequence)
4. Session 3 updates (agent evaluation via self-review connection)
5. Session 5 rename and framing update
6. Cross-session connection moments inserted into specific modules
7. Global: set `isGateModule: true` on every single module across all 5 sessions

**CRITICAL RULES FOR CLAUDE CODE:**
- Do NOT change the `ModuleContent`, `SessionContent`, or `ElectivePath` interfaces unless explicitly instructed
- Do NOT change the `KNOWLEDGE_CHECKS` unless explicitly instructed
- Do NOT change the `ALL_SESSION_CONTENT` export unless explicitly instructed
- Do NOT modify any file other than `src/data/trainingContent.ts` unless explicitly instructed
- Preserve all TypeScript types and exports exactly as they are
- Every string value provided in this document is EXACT — copy it character-for-character including punctuation, capitalization, and escape sequences
- When this document says "unchanged," it means do not modify that field AT ALL — leave the existing value in place

---

## PHASE 1: UPDATE SUCCESS CRITERIA SYSTEM

### 1.1 Interface Change

Modify the `ModuleContent` interface to support weighted success criteria. Change the `successCriteria` field inside the `practiceTask` object from `string[]` to a new structure.

**CURRENT interface (lines 6-35 of trainingContent.ts):**

The `practiceTask` type currently has:
```typescript
successCriteria: string[];
```

**CHANGE the `practiceTask` type to:**
```typescript
successCriteria: {
  primary: string[];
  supporting: string[];
};
```

This means the full `practiceTask` type inside `content` becomes:
```typescript
practiceTask: {
  title: string;
  instructions: string;
  scenario: string;
  hints: string[];
  successCriteria: {
    primary: string[];
    supporting: string[];
  };
  departmentScenarios?: Record<string, { scenario: string; hints: string[] }>;
};
```

### 1.2 Criteria Design Rules

For every module in the curriculum, success criteria must follow these rules:

- **Primary criteria** (1-2 per module): These represent the core skill demonstration. The user MUST meet these to pass the gate. They map to `requiredToProgress` in the gate system.
- **Supporting criteria** (1-3 per module): These represent depth and sophistication. Missing them does NOT block progression. They map to `areasToStrengthen` in the gate system (non-blocking feedback).
- Primary criteria should be observable actions or outputs, not subjective assessments
- Supporting criteria can include reflection, articulation, or comparison tasks

**Do NOT apply the new criteria yet.** Phase 1 only changes the interface. The actual criteria values are specified in Phases 2-6 for each module individually.

### 1.3 Temporary Compatibility

After changing the interface, every existing module's `successCriteria` will show a TypeScript error because they are still `string[]`. This is expected. Phases 2-6 will replace every module's criteria with the new `{ primary, supporting }` format. Do NOT attempt to "fix" the errors by wrapping existing criteria — wait for the explicit replacements in subsequent phases.

---

## PHASE 2: SESSION 1 RESTRUCTURE

Session 1 changes from 7 modules to 7 modules (same count, different content and sequencing).

**Old sequence:**
- 1-1: Personalization
- 1-2: Interface Orientation
- 1-3: Basic Interaction (Dirty Paste + Flipped Interaction + Outline Expander)
- 1-4: Your First Win
- 1-5: Iteration
- 1-6: Self-Review Loops ← REMOVED (moves to Session 2)
- 1-7: Sandbox

**New sequence:**
- 1-1: Personalization (minor updates)
- 1-2: Interface Orientation (revised practice task)
- 1-3: Basic Interaction (slimmed to Dirty Paste only)
- 1-4: Your First Win (minor updates)
- 1-5: The Flipped Interaction (NEW module)
- 1-6: Iteration (content from old 1-5, shifted to 1-6)
- 1-7: Sandbox (updated references)

### Session 1 metadata — update these fields:

```typescript
export const SESSION_1_CONTENT: SessionContent = {
  id: 1,
  title: 'Foundation & Early Wins',
  description: 'Build confidence with AI through conversation-first computing — every exercise works, every win is real',
```
**No change to session-level metadata.**

---

### Module 1-1: Personalization

**Changes:** Add `isGateModule: true`. Update success criteria to weighted format. All other fields UNCHANGED.

```typescript
{
  id: '1-1',
  title: 'Personalization',
  type: 'exercise',
  description: 'Shape the system around who you are and how you work — before you do anything else',
  estimatedTime: '10 min',
  isGateModule: true,
  learningObjectives: [
    'Configure your role, department, and employer context so AI responses are relevant from the start',
    'Set basic preferences for tone, output style, and level of detail',
    'Observe how personalized context changes a response compared to a generic one',
  ],
  learningOutcome: 'After this module, you will know how to personalize an AI system to reflect your individual context, so that every response feels relevant to your actual work.',
  content: {
    overview: 'Before you interact with AI, you should teach it who you are. Once personalization is done, the first output you get back feels like it was written for you — not a generic, Google-type response for the masses. That personal touch is what makes AI feel useful from the very first interaction.',
    keyPoints: [
      'The AI tool adapts to you — your job is to teach it who you are',
      'Setting your role and department changes the language, examples, and assumptions in every response',
      'Personalization is not a one-time setup — you can refine it as you learn what works',
      'A personalized system feels like a colleague who knows who you are; a generic one feels like a search engine',
    ],
    examples: [
      {
        title: 'Role Context — Poor vs. Well-Crafted',
        bad: '"I work at a company."',
        good: '"I\'m a senior analyst who reviews and evaluates proposals for a mid-size professional services firm. I assess data, prepare findings summaries, and present recommendations to our leadership committee."',
        explanation: 'The specific version gives the AI enough context to tailor every response — it will use appropriate terminology, reference relevant frameworks, and frame advice for your actual workflow.',
      },
      {
        title: 'Custom Instructions — Poor vs. Well-Crafted',
        bad: '"Be helpful."',
        good: '"Always relate examples to my industry and role. When explaining complex concepts, use analogies. Include references to relevant regulatory bodies or standards when applicable. Format action items as numbered lists."',
        explanation: 'Generic instructions add nothing — the AI is already trying to be helpful. Specific instructions shape how it communicates, what it references, and how it structures output for your daily work.',
      },
    ],
    practiceTask: {
      title: 'Set Up Your AI Profile',
      instructions: 'Configure your professional context: role, department, employer type, and preferences. Then ask the AI a simple work question and observe how the response reflects your context.',
      scenario: 'You are setting up your AI profile for the first time. Enter your role, department, and the type of institution you work at. Set your preferred tone (formal, conversational, or direct) and detail level (brief, standard, or thorough). Once configured, ask: "What are the top three things I should be thinking about this quarter?" — and notice how the response reflects your specific context.',
      hints: [
        'Be specific about your role — "Project Manager" is better than "Professional"',
        'Your department context helps the AI choose relevant examples and terminology',
        'Try changing one preference (like tone) and re-asking the same question to see the difference',
      ],
      successCriteria: {
        primary: [
          'Profile includes specific role, department, and employer context — not generic placeholders',
        ],
        supporting: [
          'At least one preference is configured (tone, detail level, or output style)',
          'User asked a work-related question and received a contextually relevant response',
        ],
      },
    },
  },
},
```

---

### Module 1-2: Interface Orientation

**Changes:** Add `isGateModule: true`. Revise practice task to remove thread requirement. Replace with: send a message, attach a file, read the response. Update success criteria to weighted format.

```typescript
{
  id: '1-2',
  title: 'Interface Orientation',
  type: 'document',
  description: 'Learn the basics of your AI interface — just enough to begin, not a feature walkthrough',
  estimatedTime: '8 min',
  isGateModule: true,
  learningObjectives: [
    'Identify the core interface elements: conversation area, input field, and file attachments',
    'Send a message and read the AI response',
    'Attach a file to a conversation and understand why file sharing matters',
  ],
  learningOutcome: 'After this module, you can navigate the AI interface confidently enough to start your first real interaction without feeling lost.',
  content: {
    overview: 'This is not a feature walkthrough. You do not need to know every button and setting right now. This module covers the three things you need to know to get started: where to type, how to share a file, and how to read what comes back. Everything else comes later, when you need it.',
    keyPoints: [
      'The conversation area is where you and the AI exchange messages — it remembers context within a thread',
      'Attaching a file lets you share documents, spreadsheets, or notes for the AI to work with',
      'Starting a new thread resets context — useful when switching tasks, not when refining one',
      'You do not need to understand models, tools, or settings right now — those are Session 2 topics',
    ],
    practiceTask: {
      title: 'Navigate the Basics',
      instructions: 'Send a message, read the response, and attach a file. That is the entire exercise.',
      scenario: 'Open your AI interface. Send a simple message like "What can you help me with today?" Read the response. Then attach a file — any file from your computer (a document, a spreadsheet, even a photo) — and ask the AI to describe what you shared. The goal is to confirm that you can communicate with the AI and share files with it. That is all you need right now.',
      hints: [
        'Look for a paperclip icon or "Attach" button to share a file',
        'Any file works for this exercise — a simple document or image is fine',
        'Do not worry about settings or model options right now — you will learn those in Session 2',
      ],
      successCriteria: {
        primary: [
          'User sent at least one message and received a response',
          'User attached a file to the conversation',
        ],
        supporting: [
          'User can describe where to find the conversation area, input field, and attachment button',
        ],
      },
    },
  },
},
```

---

### Module 1-3: Basic Interaction

**Changes:** Add `isGateModule: true`. REMOVE all references to Flipped Interaction Pattern and Outline Expander. This module now teaches ONLY the Dirty Paste technique and the core concept of conversational AI interaction (describe what you need, evaluate what you get, follow up). Update learning objectives, overview, keyPoints, steps, examples, practice task, and success criteria accordingly.

```typescript
{
  id: '1-3',
  title: 'Basic Interaction',
  type: 'exercise',
  description: 'Learn to describe what you need, evaluate what you get back, and keep the conversation going',
  estimatedTime: '20 min',
  isGateModule: true,
  learningObjectives: [
    'Describe a work task to AI the way you would describe it to a smart colleague who is new to your work',
    'Evaluate whether a response is useful, what is missing, and what the AI assumed',
    'Follow up to correct assumptions and refine the output through back-and-forth conversation',
  ],
  learningOutcome: 'After this module, you can have a productive back-and-forth conversation with AI — starting rough, recognizing gaps, and refining until the output is useful.',
  content: {
    overview: 'This is not prompting. This is a conversation. You describe what you need the way you would describe it to a smart colleague who just joined your team. They are capable but they do not know your specific work yet. Your job is to give them enough context to be helpful — and then keep the conversation going when they get something wrong or miss something.\n\nThe most important pattern here is what we call the Dirty Paste: take real work — notes, an email, a document — and hand it to the AI with a plain description of what you want. No special formatting. No framework. Just real work, real words.',
    keyPoints: [
      'Start messy — take real work (an old email, notes, a document) and hand it over with a plain description of what you want',
      'The first response is never the final output — it is a starting point for conversation',
      'When something is off, say what is off: "That is too formal" or "You assumed X but actually Y"',
      'Follow-up is the skill — the first ask gets you started, the follow-up gets you something useful',
      'You do not need a framework or special syntax — plain language works',
    ],
    steps: [
      'Dirty paste: take something real from your work and hand it to the AI with a plain description of what you want',
      'Recognize the response: is it useful? What is missing? What did the AI assume?',
      'Follow up: ask for what is missing, correct any wrong assumptions, and ask again',
      'Repeat: keep the conversation going until the output is something you could use',
    ],
    examples: [
      {
        title: 'The Dirty Paste',
        good: '"Here are my notes from yesterday\'s team meeting [paste notes]. Can you turn these into a structured summary I can send to the team? Include action items at the end."',
        explanation: 'No special formatting. No framework. Just real work handed over with a clear description of what you want back. This is how most productive AI interactions start.',
      },
      {
        title: 'The Follow-Up',
        good: '"That summary is close, but you assumed the project deadline is next month — it is actually next quarter. Also, the tone is too casual for our leadership team. Can you revise with a more professional tone and correct the timeline?"',
        explanation: 'The user identified two specific issues: a wrong assumption and a tone mismatch. They told the AI exactly what was wrong instead of starting over. This is the core skill of conversational AI — correction and refinement, not perfection on the first try.',
      },
    ],
    practiceTask: {
      title: 'Your First Real Conversation',
      instructions: 'Take a real piece of work — notes, an email, a document — and have a back-and-forth conversation with the AI about it. Use the Dirty Paste technique: hand over real material with a plain description of what you want.',
      scenario: 'Pick something real from your work this week: meeting notes that need summarizing, an email that needs drafting, a process that needs documenting, or a question you have been meaning to research. Hand it to the AI with a plain description of what you want. Evaluate the first response. Then follow up at least twice to refine the result.',
      hints: [
        'Start with something low-stakes — notes, a draft, a question — not something mission-critical',
        'If the first response is off, say exactly what is wrong rather than rephrasing your whole ask',
        'The goal is a useful back-and-forth, not a perfect first response',
        'Do not worry about structure or frameworks — that comes in Session 2',
      ],
      successCriteria: {
        primary: [
          'User pasted or described a work-related task using real or realistic material — not a test prompt like "tell me a joke"',
          'User followed up at least twice to refine the output, demonstrating back-and-forth conversation',
        ],
        supporting: [
          'User identified at least one gap or incorrect assumption in the AI response',
          'Final output is noticeably better than the first response',
        ],
      },
    },
  },
},
```

---

### Module 1-4: Your First Win

**Changes:** Add `isGateModule: true` (it already has it, but confirm). Update success criteria to weighted format. All other fields UNCHANGED.

```typescript
{
  id: '1-4',
  title: 'Your First Win',
  type: 'exercise',
  description: 'Complete one practical task that fits your actual work — and produce something you could use',
  estimatedTime: '20 min',
  isGateModule: true,
  learningObjectives: [
    'Apply conversation-first computing to a real task from your department',
    'Produce an output you would actually use in your work — not a practice exercise',
    'Recognize when an AI-generated output is good enough to use vs. when it needs more refinement',
  ],
  learningOutcome: 'After this module, you have produced at least one piece of work product using AI that you could actually send, save, or use.',
  content: {
    overview: 'This is the most important module in Session 1. If you leave Module 4 having produced something useful — something you would actually use in your work — then this session has done its job. The task should be real enough to matter and easy enough to succeed. You are not experimenting here. You are producing.',
    keyPoints: [
      'Pick a task that is real and relevant to your actual work this week',
      'Use everything from Module 3: describe what you need, evaluate the response, follow up to refine',
      'The goal is a finished work product, not a demonstration of AI capability',
      'Good enough to use is the bar — not perfect, not impressive, just useful',
    ],
    examples: [
      {
        title: 'What a First Win Looks Like',
        good: 'A project manager drafts a status report summary from their existing notes and project data. The output is structured, uses the right terminology, and could be pasted into their actual project file with minor edits.\n\nA team lead takes a policy update and produces a one-page summary with action items that they email to their team that afternoon.\n\nA department manager creates a coaching template for performance conversations that they use in their next one-on-one.',
        explanation: 'Each of these is something the person would actually use. The AI did not create something impressive but useless — it created something practical that saved time on real work.',
      },
    ],
    practiceTask: {
      title: 'Produce Something Real',
      instructions: 'Pick a real work task from your department. Use the AI to produce a finished work product you could actually use. This is not practice — this is production.',
      scenario: 'Choose one task from your actual work this week. It should be something you need to do anyway — a memo to write, a summary to create, a process to document, a communication to draft, or an analysis to structure. Use the AI to produce it. Iterate until it is good enough to use.',
      hints: [
        'Pick something you would spend 30-60 minutes on manually — that is the sweet spot for a first win',
        'If you are stuck choosing, ask the AI: "I work as a [role] in [department]. What are three tasks I probably do regularly that AI could help with?"',
        'Do not overthink the ask — start messy and refine',
        'The goal is "I would actually use this" not "this is impressive"',
      ],
      successCriteria: {
        primary: [
          'User produced an output that is directly relevant to their actual work and could be used with minimal revision',
        ],
        supporting: [
          'Output reflects the user\'s professional context (role, department, terminology)',
          'User iterated at least once to refine the output before calling it done',
          'User can describe why the output is good enough to use (or what would need to change)',
        ],
      },
    },
  },
},
```

---

### Module 1-5: The Flipped Interaction (NEW MODULE)

**This is a brand new module.** It replaces the old 1-5 (Iteration) in the sequence. The old Iteration module moves to 1-6.

```typescript
{
  id: '1-5',
  title: 'The Flipped Interaction',
  type: 'exercise',
  description: 'Let the AI ask you questions instead of crafting the perfect prompt — the most powerful move in conversational AI',
  estimatedTime: '15 min',
  isGateModule: true,
  learningObjectives: [
    'Use the Flipped Interaction Pattern: ask the AI to interview you before it starts working',
    'Observe how the AI\'s questions surface context you would not have thought to provide',
    'Apply the pattern to a real task and compare the output to a direct ask',
  ],
  learningOutcome: 'After this module, you can use the Flipped Interaction Pattern to get better AI output by letting the AI ask you the right questions first — instead of guessing what context to provide.',
  content: {
    overview: 'In Module 3, you learned to describe what you need and follow up when the response is off. That works. But there is a faster path: instead of guessing what context the AI needs, let it ask you.\n\nThis is the Flipped Interaction Pattern. Instead of "Here is what I want, go," you say: "Before you start, ask me questions that will help you do this better." The AI often knows what information it needs more precisely than you know what to provide. The result: better output with less guesswork.\n\nThis is not a shortcut — it is a collaboration technique. You still evaluate, refine, and make the final call. But the starting point is dramatically better because the AI gathered the right context before it began.',
    keyPoints: [
      'The Flipped Interaction Pattern: "Before you do X, ask me questions that will help you do it better"',
      'The AI surfaces context you would not have thought to provide — roles, constraints, audience, format preferences',
      'This works because the AI has seen thousands of similar tasks and knows what information leads to better results',
      'You still control the conversation — answer selectively, push back on irrelevant questions, and redirect',
      'The pattern works for any task: drafting, analysis, planning, brainstorming, problem-solving',
    ],
    examples: [
      {
        title: 'The Flipped Interaction in Action',
        good: '"I need to write a memo about our Q1 performance for leadership. Before you start writing, ask me five questions that will help you write a better memo."',
        explanation: 'Instead of guessing what context the AI needs, you let it tell you. The AI might ask about your audience, the key metrics, what changed from last quarter, and what tone you want. This produces a better result with less guesswork.',
      },
      {
        title: 'Flipped Interaction for Problem-Solving',
        good: '"I need to figure out why our team\'s turnaround time has increased this quarter. Before you help me analyze this, ask me questions about our process, team, and recent changes that would help you identify the root cause."',
        explanation: 'The AI asks targeted questions: What is the turnaround time for? What was it before? What changed recently? How many people are on the team? These questions frame the analysis in a way that a direct ask like "Why is our turnaround time slow?" never would.',
      },
    ],
    practiceTask: {
      title: 'Let the AI Interview You',
      instructions: 'Pick a real task from your work. Instead of describing everything upfront, ask the AI to interview you first. Answer its questions, then let it produce the output. Compare the result to what you would have gotten with a direct ask.',
      scenario: 'Choose a task you need to do this week — something with enough complexity that context matters (not "what time is it" but "help me draft a communication" or "help me think through a decision").\n\n1. First, write a direct ask — the way you would have in Module 3. Save the output.\n2. Now try the Flipped Interaction: "Before you start on this, ask me 5 questions that will help you do a better job."\n3. Answer the AI\'s questions honestly and specifically.\n4. Let the AI produce its output based on your answers.\n5. Compare: which output is better? What context did the AI surface that you would not have provided on your own?',
      hints: [
        'The magic is in the AI\'s questions — pay attention to what it asks, because those questions reveal what context matters most',
        'You do not have to answer every question — skip ones that are not relevant and tell the AI why',
        'Try varying the number: "Ask me 3 questions" for quick tasks, "Ask me 7 questions" for complex ones',
        'If the AI\'s questions are too generic, redirect: "Those questions are too broad — ask me about the specific constraints and audience"',
      ],
      successCriteria: {
        primary: [
          'User used the Flipped Interaction Pattern on a real or realistic work task — asked the AI to ask questions before producing output',
          'User answered the AI\'s questions and received an output based on those answers',
        ],
        supporting: [
          'User compared a direct-ask output with a flipped-interaction output and articulated the difference',
          'User identified at least one piece of context the AI surfaced that they would not have provided unprompted',
        ],
      },
    },
  },
},
```

---

### Module 1-6: Iteration (moved from old 1-5)

**Changes:** Module ID changes from `1-5` to `1-6`. Add `isGateModule: true`. Update references to include Flipped Interaction as an available technique. Update success criteria to weighted format. The content is substantively the same as the old 1-5 Iteration module.

```typescript
{
  id: '1-6',
  title: 'Iteration',
  type: 'exercise',
  description: 'Learn that value comes from refining the conversation — not from getting it right the first time',
  estimatedTime: '15 min',
  isGateModule: true,
  learningObjectives: [
    'Take a completed task and make it more complex by adding a constraint or requirement',
    'Reshape AI output mid-conversation: change format, add sections, adjust tone',
    'Understand that the first response is the starting point, not the finish line',
  ],
  learningOutcome: 'After this module, you instinctively treat AI output as a draft to refine rather than a final answer to accept or reject.',
  content: {
    overview: 'Most people think AI either works or it does not. They paste something in, get a response, and either use it or give up. This module teaches the real skill: the conversation itself is the work. The first response is never the output — it is the starting point. And the ability to reshape what you get back, mid-conversation, is one of the most useful skills you will build.',
    keyPoints: [
      'Take your work from Module 4 and push it further — add a constraint, change the audience, increase the complexity',
      'Output format is something you control in real time: "Give me the same answer but as a table" or "Now make it a one-page executive summary"',
      'Each round of refinement builds on the last — the AI remembers the full conversation',
      'The best AI users are not better at asking — they are better at refining',
      'Try combining iteration with the Flipped Interaction from Module 5 — ask the AI what else it needs to know before revising',
    ],
    examples: [
      {
        title: 'Reshaping Output Mid-Conversation',
        good: 'Round 1: "Summarize these meeting notes into bullet points."\nRound 2: "Now put the action items in a separate section with owners and due dates."\nRound 3: "Add a one-paragraph executive summary at the top for people who won\'t read the details."\nRound 4: "Make the executive summary more direct — our CEO prefers short sentences."',
        explanation: 'Each round builds on the last. The user is not starting over — they are sculpting the output. By Round 4, they have a document that is structured exactly how they need it, customized for their specific audience.',
      },
    ],
    practiceTask: {
      title: 'Push Your First Win Further',
      instructions: 'Take your output from Module 4 and iterate on it. Add complexity, change the format, adjust for a different audience, or ask for something the original version was missing.',
      scenario: 'Return to the work product you created in Module 4. Now make it harder:\n\n1. Add a constraint: "Now make this compliant with [specific standard]" or "Adapt this for an executive audience"\n2. Change the format: "Convert this to a table" or "Turn this into talking points for a 5-minute presentation"\n3. Layer in complexity: "Now add a risk analysis section" or "Include counterarguments"\n\nDo at least three rounds of refinement. Notice how each round builds on what came before.',
      hints: [
        'You do not need to start a new conversation — continue from where you left off in Module 4',
        'Try changing the audience: same content, but for your CEO, your team, or an external stakeholder',
        'Ask for a format change mid-conversation: bullets to table, memo to email, summary to presentation',
        'If you get stuck, try the Flipped Interaction: "Before you revise this, ask me what I want to be different"',
      ],
      successCriteria: {
        primary: [
          'User completed at least three rounds of refinement on their Module 4 output, with each round building on the last',
        ],
        supporting: [
          'At least one round changed the output format (not just content edits)',
          'User can describe how the final version is better than the first version and why',
          'User reshaped mid-conversation rather than starting over',
        ],
      },
    },
  },
},
```

---

### Module 1-7: Sandbox

**Changes:** Module ID changes from `1-7` stays as `1-7`. Add `isGateModule: true`. Update references to reflect the new module sequence (no more Self-Review Loops in Session 1, Flipped Interaction is now Module 5). Update success criteria to weighted format.

```typescript
{
  id: '1-7',
  title: 'Sandbox',
  type: 'sandbox',
  description: 'Free exploration — apply the patterns from this session to anything you want',
  estimatedTime: '15 min',
  isGateModule: true,
  learningObjectives: [
    'Apply conversation-first patterns (dirty paste, Flipped Interaction, iteration) independently',
    'Choose your own task and work through it without guided instruction',
    'Identify which patterns feel natural and which need more practice',
  ],
  learningOutcome: 'After this module, you can independently apply Session 1 techniques to any work task without step-by-step guidance.',
  content: {
    overview: 'The Sandbox is your open practice space. Nothing new is taught here — this is practice. Choose a task from the suggested starting points or bring your own. Andrea is available but will not lead — she responds to what you initiate.',
    keyPoints: [
      'No new concepts — apply what you learned in Modules 1 through 6',
      'Suggested tasks available if you want a starting point',
      'Bring your own work if you have something specific in mind',
      'This is your space to experiment — there is no wrong approach here',
    ],
    practiceTask: {
      title: 'Free Exploration',
      instructions: 'Pick any task and work through it using the patterns from this session. No structure required — just practice.',
      scenario: 'This is your free-form practice space. Use it however helps you learn best. Some ideas:\n\n- Take a task you have been putting off and use AI to get a first draft done\n- Try the Flipped Interaction Pattern on a complex question from your work\n- Use the dirty paste technique on a document you need to rework\n- Practice reshaping output: take one result and convert it into three different formats\n- Combine techniques: dirty paste an email, then use Flipped Interaction to refine it, then iterate on format\n\nOr bring your own task — anything goes.',
      hints: [
        'If you are not sure what to try, ask the AI: "Based on my role as a [role], what is a task I could practice right now?"',
        'Try combining techniques: dirty paste → Flipped Interaction → iteration',
        'Practice anything you did not feel fully confident about in earlier modules',
        'This is a good time to explore — there is no grading here',
      ],
      successCriteria: {
        primary: [
          'User initiated at least one task independently and completed a meaningful exchange (not just a single message)',
        ],
        supporting: [
          'User applied at least two techniques from this session (dirty paste, Flipped Interaction, iteration)',
          'User can identify which technique feels most natural and which needs more practice',
        ],
      },
    },
  },
},
```

---

### Session 1 Knowledge Checks — UPDATE

Update the Session 1 knowledge checks to reflect the new module sequence:

```typescript
1: [
  'What is the Dirty Paste technique, and why is it an effective way to start an AI interaction?',
  'Describe the Flipped Interaction Pattern. When would you use it instead of a direct ask?',
  'What happens between the first AI response and a useful final output — what is the user\'s role in that process?',
],
```

---

## PHASE 3: SESSION 2 RESTRUCTURE

Session 2 changes from 7 modules to 10 modules.

**Old sequence:**
- 2-1: Structured Prompting (CLEAR)
- 2-2: Output Templating
- 2-3: Multi-Shot Prompting
- 2-4: Model Selection
- 2-5: Chain-of-Thought Mastery
- 2-6: Tool Selection
- 2-7: Sandbox

**New sequence:**
- 2-1: AI Limitations & Critical Evaluation (NEW)
- 2-2: Self-Review Loops (moved from S1-6)
- 2-3: Structured Prompting / CLEAR Framework (was 2-1)
- 2-4: Output Templating (was 2-2)
- 2-5: The Outline Expander (NEW)
- 2-6: Multi-Shot Prompting (was 2-3)
- 2-7: Model Selection (was 2-4)
- 2-8: Chain-of-Thought Reasoning (was 2-5, RENAMED)
- 2-9: Tool Selection (was 2-6)
- 2-10: Sandbox (was 2-7)

### Session 2 metadata — update the description:

```typescript
export const SESSION_2_CONTENT: SessionContent = {
  id: 2,
  title: 'Structured Interaction, Models & Tools',
  description: 'Move from casual conversation to professional-grade AI use — understand limitations, add structure, and choose the right model and tools for each task',
```

---

### Module 2-1: AI Limitations & Critical Evaluation (NEW MODULE)

```typescript
{
  id: '2-1',
  title: 'AI Limitations & Critical Evaluation',
  type: 'document',
  description: 'Understand where AI confidently gets things wrong — and build the habit of verification before trust',
  estimatedTime: '15 min',
  isGateModule: true,
  learningObjectives: [
    'Identify the three most common failure modes: hallucination (fabricated facts), confident incorrectness (wrong but sounds right), and outdated information',
    'Apply a verification habit: check claims, numbers, and citations before using AI output in professional work',
    'Recognize when AI is the wrong tool for a task — and say so',
  ],
  learningOutcome: 'After this module, you can identify when AI output might be wrong even when it sounds confident, and you have a verification habit that protects you in professional contexts.',
  content: {
    overview: 'Session 1 built your confidence. Now we ground it. AI is remarkably capable — and remarkably confident when it is wrong. It will fabricate citations that look real, invent statistics that sound plausible, and present outdated information as current fact. None of this means AI is unreliable. It means you need to know where the failure modes are so you can catch them.\n\nThis is not about being skeptical of everything. It is about knowing which types of output to verify, which tasks AI should not handle alone, and how to catch the most common errors before they reach your stakeholders.',
    keyPoints: [
      'Hallucination: the AI generates facts, names, citations, or statistics that do not exist — and presents them with full confidence',
      'Confident incorrectness: the AI gives a wrong answer in a tone that sounds authoritative — there is no hesitation or hedge',
      'Outdated information: the AI\'s training data has a cutoff date — it may not know about recent policy changes, organizational updates, or market shifts',
      'Verification habit: for any AI output that includes specific facts, numbers, citations, or regulatory references — verify before you use it',
      'When NOT to use AI: tasks where a wrong answer has serious consequences and you cannot verify the output (e.g., specific legal advice, medical dosing, precise financial calculations)',
    ],
    examples: [
      {
        title: 'Hallucination in Action',
        good: 'You ask the AI to cite three research studies supporting a claim. It returns three studies with authors, titles, journal names, and publication years. All three look legitimate. One is a real study. Two are completely fabricated — the authors exist but never wrote those papers, and the journal names are real but the articles do not exist.\n\nThe fix: search for the citations independently. If you cannot find them, they are likely hallucinated. This takes 60 seconds and prevents you from citing fake research in a professional document.',
        explanation: 'The AI does not know it is fabricating. It generates text that fits the pattern of a citation — and that pattern is often convincing. The only defense is verification.',
      },
      {
        title: 'Confident Incorrectness',
        good: 'You ask the AI to calculate the compound annual growth rate between two values over five years. It returns a number with a formula and explanation. The formula is correct. The calculation is wrong — it used the wrong exponent. The tone is fully confident with no indication of uncertainty.\n\nThe fix: for any numerical output, run the calculation independently — in a spreadsheet, a calculator, or by hand. The AI is good at setting up the approach but can make arithmetic errors.',
        explanation: 'The AI does not flag its own uncertainty on calculations. It presents every answer the same way. Your job is to know which outputs need a second check — and math is always one of them.',
      },
    ],
    practiceTask: {
      title: 'Test the Limits',
      instructions: 'Deliberately test the AI on tasks where it is likely to fail. Ask for specific citations, numerical calculations, and recent information. Verify what you get back.',
      scenario: 'Run three tests:\n\n1. Ask the AI to cite 3 specific sources (research papers, articles, or reports) on a topic relevant to your work. Then try to verify each citation independently — search for the title, author, or journal. How many are real?\n\n2. Ask the AI to perform a multi-step calculation relevant to your work (a percentage change, a weighted average, a projection). Check the math independently. Is it correct?\n\n3. Ask the AI about something that changed recently in your industry (a policy update, a leadership change, a new regulation from the last 6 months). Does the AI know about it? Does it acknowledge uncertainty, or does it present outdated information as current?\n\nFor each test: what did the AI get right? What did it get wrong? How confident did it sound when it was wrong?',
      hints: [
        'The citation test is the most revealing — try it on a niche topic where you know the real literature',
        'For the math test, use a calculation you already know the answer to — so you can verify instantly',
        'For the recency test, ask about something specific that happened in the last 3 months',
        'Pay attention to the AI\'s tone when it is wrong — it sounds exactly the same as when it is right',
      ],
      successCriteria: {
        primary: [
          'User tested the AI on at least two of the three failure modes (hallucination, calculation error, or outdated information) and verified the output independently',
        ],
        supporting: [
          'User found at least one instance where the AI was confidently wrong',
          'User can describe the verification habit they would apply to professional AI output going forward',
          'User identified at least one task type where AI should not be used without human verification',
        ],
      },
    },
  },
},
```

---

### Module 2-2: Self-Review Loops (moved from S1, now with Session 2 context)

**Changes:** Module ID changes from `1-6` to `2-2`. Add `isGateModule: true`. Update the overview to connect to the AI Limitations module that now precedes it. Update success criteria to weighted format. Add a connection moment referencing Session 1 output.

```typescript
{
  id: '2-2',
  title: 'Self-Review Loops',
  type: 'exercise',
  description: 'Prompt the AI to critique, score, and improve its own output — before you act on it',
  estimatedTime: '15 min',
  isGateModule: true,
  learningObjectives: [
    'Ask the AI to review its own output against stated criteria',
    'Compare an original output with its self-revised version and evaluate the improvement',
    'Make the final judgment yourself — the AI\'s self-critique is input, not the answer',
    'Recognize that the critique step itself is a reusable template across different types of work',
  ],
  learningOutcome: 'After this module, you can prompt the AI to critique and revise its own work before you review it — producing higher-quality output without starting over.',
  content: {
    overview: 'In Module 1, you learned that AI can be confidently wrong. Self-review loops are your first line of defense. Instead of blindly trusting output, you ask the AI to critique its own work against criteria you define. Then the AI revises. Then you — not the AI — decide whether the revision is actually better.\n\n**Connection to Session 1:** Take any work product you created in Session 1 — a summary, a memo, a draft — and run a self-review loop on it. You will see how much better the output becomes when the AI has a chance to critique itself before you finalize.\n\nThis replaces the instinct to paste the output into a new conversation and start fresh. Self-review loops keep the context and compound it.',
    keyPoints: [
      'Generate a draft, then ask the AI to critique it against specific criteria you define',
      'The AI identifies what is weak or missing — then produces a revised version',
      'You compare the original and the revision — and you make the final call',
      'The AI\'s self-critique is not the final word. You evaluate the critique before acting on it.',
      'The critique step is itself a reusable template: you can apply it to any type of output',
    ],
    steps: [
      'Generate a draft output on a real task',
      'Ask the AI to review the draft against 2-3 specific criteria (e.g., clarity, completeness, tone)',
      'Ask the AI to produce a revised version based on its own critique',
      'Compare the original and revised versions — decide which is better and why',
    ],
    examples: [
      {
        title: 'Self-Review in Action',
        good: 'Step 1: "Draft a staff notification about our updated remote work policy."\n\nStep 2: "Review what you just wrote against these three criteria: (1) Is it clear enough for someone who has not read the previous policy? (2) Does it explain what they need to do? (3) Is the tone reassuring, not alarming?"\n\nStep 3: "Based on your review, produce a revised version that addresses any weaknesses you identified."\n\nStep 4: Compare both versions. The user notices the revision simplified the language and added a clear call-to-action, but made the tone too casual — so they take the structure of the revision but restore the professional tone from the original.',
        explanation: 'The user did not blindly accept the revision. They used the AI\'s critique as input, compared both versions, and made a judgment call. That is the skill — not outsourcing quality control, but using the AI to surface issues you then decide how to handle.',
      },
    ],
    practiceTask: {
      title: 'Critique and Revise',
      instructions: 'Take any output from Session 1 (or create a new one) and run a self-review loop. Define your criteria, ask for a critique, request a revision, and compare.',
      scenario: 'Pick the best output you have generated so far — from Session 1 or from a new task. Now:\n\n1. Define 2-3 criteria that matter for this specific output (e.g., accuracy, clarity, appropriate tone, completeness, actionability)\n2. Ask the AI: "Review this output against these criteria and identify what is weak or missing"\n3. Ask: "Now produce a revised version that addresses your critique"\n4. Compare the original and the revision — what improved? What did the AI miss? What would you change yourself?',
      hints: [
        'Be specific with your criteria — "Is it good?" is too vague; "Is it clear enough for someone with no context?" is useful',
        'If the AI\'s critique seems off, push back: "I disagree with point 2 — here is why"',
        'The revision is not always better — sometimes the original was fine and the AI over-corrected',
        'Notice that the critique format (criteria → assessment → revision) works for any type of output',
      ],
      successCriteria: {
        primary: [
          'User defined at least 2 specific review criteria and ran a self-review loop (critique → revision → comparison)',
        ],
        supporting: [
          'User compared original and revised versions side-by-side',
          'User made an independent judgment about which version is better and articulated why',
          'User identified at least one thing the AI\'s critique missed or got wrong',
        ],
      },
    },
  },
},
```

---

### Module 2-3: Structured Prompting / CLEAR Framework (was 2-1)

**Changes:** Module ID changes from `2-1` to `2-3`. `isGateModule: true` (was already true). Update success criteria to weighted format. All other content UNCHANGED except the ID.

```typescript
{
  id: '2-3',
  title: 'Structured Prompting',
  type: 'document',
  description: 'Learn the CLEAR Framework for high-stakes, precision tasks — structure as a tool, not a requirement',
  estimatedTime: '15 min',
  isGateModule: true,
  learningObjectives: [
    'Apply the CLEAR Framework (Context, Length/Format, Examples, Audience, Requirements) to structure complex asks',
    'Distinguish when structured prompting adds value vs. when casual conversation is sufficient',
    'Take a task from Session 1 and demonstrate how adding structure changes output quality',
  ],
  learningOutcome: 'After this module, you can use the CLEAR Framework to communicate precisely with AI when a task is specific, high-stakes, or requires a particular kind of output.',
  content: {
    overview: 'In Session 1, you learned to have a conversation. That is still valid — and often sufficient. But when the task is specific, high-stakes, or requires a particular kind of output, structure helps. The CLEAR Framework gives you a tool for those moments.\n\nThis is not "the right way" to use AI. It is "the right way when you need precision." Casual conversation is still your default for exploration and quick tasks. CLEAR is for when you need the output to be exactly right.',
    keyPoints: [
      'C — Context: Who is the AI acting as? What background does it need?',
      'L — Length/Format: How should the output be structured? How long?',
      'E — Examples: Can you show what good looks like?',
      'A — Audience: Who will read this? What tone and level of detail?',
      'R — Requirements: What specific task, constraints, and must-haves?',
      'Structure is a tool for specific situations — not every interaction needs it',
      'You already have Session 1 experience — CLEAR adds precision on top of conversation skills',
    ],
    examples: [
      {
        title: 'Before and After CLEAR',
        bad: '"Write me a memo about our quarterly performance."',
        good: '"Context: You are a senior analyst at a mid-size professional services firm. Length: One-page executive summary with a data table. Examples: Our previous quarterly memo used bullet points for key metrics and a narrative paragraph for outlook. Audience: Board of directors — they want high-level trends, not granular data. Requirements: Include revenue growth YoY, key performance trend, utilization rate, and a 1-paragraph outlook."',
        explanation: 'The CLEAR version is not harder to write — it just makes explicit what the user already knows. The result requires fewer rounds of iteration because the AI has everything it needs upfront.',
      },
    ],
    steps: [
      'Start with a task you tried in Session 1 (or a new one)',
      'Write a casual version of your ask — the way you would in Session 1',
      'Now apply CLEAR: add Context, Length/Format, Examples, Audience, Requirements',
      'Compare the outputs — notice what changed and when CLEAR is worth the extra effort',
    ],
    practiceTask: {
      title: 'Apply CLEAR and Compare',
      instructions: 'Take a task you did in Session 1 and redo it with the CLEAR Framework. Compare outputs.',
      scenario: 'Pick a task from Session 1 — or choose a new one that matters to your work. First, write a casual ask (like you would in Session 1). Run it and save the output. Then rewrite the same ask using the CLEAR Framework. Run it and compare.\n\nWhich output is better? How much better? Was the extra structure worth it for this task? There is no wrong answer — sometimes casual is fine. The skill is knowing when to add structure.',
      hints: [
        'You do not need to fill in every CLEAR element for every task — use what is relevant',
        'Context and Requirements are usually the highest-impact elements',
        'If you are not sure what Examples to provide, skip it — or ask the AI to suggest the format',
        'The goal is not to always use CLEAR — it is to know when it helps',
      ],
      successCriteria: {
        primary: [
          'User wrote both a casual and CLEAR-structured version of the same ask and compared the outputs',
        ],
        supporting: [
          'User identified at least one CLEAR element that had the biggest impact on quality',
          'User can explain when they would use CLEAR vs. casual conversation',
          'User applied at least 3 of the 5 CLEAR elements in their structured ask',
        ],
      },
    },
  },
},
```

---

### Module 2-4: Output Templating (was 2-2)

**Changes:** Module ID changes from `2-2` to `2-4`. Add `isGateModule: true`. Update success criteria to weighted format. All other content UNCHANGED except the ID.

```typescript
{
  id: '2-4',
  title: 'Output Templating',
  type: 'exercise',
  description: 'Deliberately define the shape of what you want back — before you write a single word of the ask',
  estimatedTime: '15 min',
  isGateModule: true,
  learningObjectives: [
    'Define output structure before writing the ask: sections, format, and organization',
    'Choose between bullets, paragraphs, tables, and hybrid formats based on purpose',
    'Combine output templates with structured prompts for professional-grade results',
  ],
  learningOutcome: 'After this module, you can specify the exact shape of AI output before you ask — producing work product, not just answers.',
  content: {
    overview: 'In Session 1, you saw that output has a shape — the AI returned things with bullets, assumptions sections, and structured formats without you asking. Now you name it and control it deliberately.\n\nOutput templating is the bridge between casual AI use and real professional utility. Once you can specify output shape, you can use AI to produce work product — not just answers. A memo, a table, a report with specific sections, an email with a particular structure — all of these are output templates.',
    keyPoints: [
      'Define the template before you write the ask — structure first, content second',
      'Bullets vs. paragraphs: bullets for scanning, paragraphs for narrative, tables for comparison',
      'Add sections deliberately: assumptions, risks, next steps, action items, comparisons',
      'Specify format up front ("Give me a table with these columns") vs. reshape mid-conversation ("Now make that a table")',
      'Combining output templates with CLEAR produces the most consistent, professional results',
    ],
    examples: [
      {
        title: 'Template-First Approach',
        good: '"I need a vendor comparison for AI tools. Structure it as:\n\n1. Executive summary (3 sentences max)\n2. Comparison table with columns: Vendor, Cost, Key Features, Compliance Certifications, Our Assessment\n3. Risks section (bullet points)\n4. Recommendation with rationale (one paragraph)\n\nNow here is the information: [paste vendor details]"',
        explanation: 'The user defined the entire output structure before providing any content. The AI knows exactly what to produce. Compare this to "Help me compare these vendors" — which would produce a usable but unstructured response that needs reshaping.',
      },
    ],
    practiceTask: {
      title: 'Design Your Output First',
      instructions: 'Pick a real work deliverable. Define the output template first — sections, format, organization. Then write the ask. Compare to what you would have gotten without the template.',
      scenario: 'Choose a deliverable from your work: a report, a memo, a summary, a comparison, a checklist, or a presentation outline.\n\n1. Before you write anything else, define the template: what sections should it have? What format (bullets, tables, paragraphs)? What goes first?\n2. Now write the actual ask, referencing your template\n3. Run it and evaluate: does the output match your template?\n4. If not, refine the template and try again\n\nThe skill is designing the container before filling it.',
      hints: [
        'Start with deliverables you produce regularly — you already know what they should look like',
        'Specify the number of items when possible: "3 bullet points" is better than "a few bullets"',
        'If you are not sure what sections to include, ask the AI: "What sections should a [document type] typically have?"',
        'Try: define the template, then use the Flipped Interaction Pattern to fill it',
      ],
      successCriteria: {
        primary: [
          'User defined an output template with at least 3 distinct sections or format specifications before writing the ask',
        ],
        supporting: [
          'Output closely matches the defined template structure',
          'User can explain why template-first produces better results than ask-first for structured deliverables',
        ],
      },
    },
  },
},
```

---

### Module 2-5: The Outline Expander (NEW MODULE)

```typescript
{
  id: '2-5',
  title: 'The Outline Expander',
  type: 'exercise',
  description: 'Give the AI a rough skeleton and let it fill in the substance — you control the shape, AI fills the details',
  estimatedTime: '15 min',
  isGateModule: true,
  learningObjectives: [
    'Provide a rough outline or skeleton to the AI and have it expand each section with substance',
    'Control the depth and direction of expansion by specifying what you want at each level',
    'Combine the Outline Expander with output templating and the Flipped Interaction Pattern for maximum control',
  ],
  learningOutcome: 'After this module, you can give the AI a rough structure and let it fill in the details — controlling the shape of the output while leveraging the AI for substance.',
  content: {
    overview: 'Output templating taught you to define the container. The Outline Expander teaches you to fill it. The pattern: you give the AI a rough outline — the skeleton of what you want — and ask it to expand each point into full content. You stay in control of the structure and direction. The AI does the heavy lifting on detail and substance.\n\nThis technique sits between "give me everything" and "I will write it all myself." It is especially powerful for documents, presentations, training materials, and any structured deliverable where you know the shape but need help with the substance.',
    keyPoints: [
      'You provide the skeleton: a numbered outline, a set of headers, a rough list of topics',
      'The AI expands each point: turning bullets into paragraphs, topics into sections, ideas into arguments',
      'You control the depth: "Expand each point into 3 bullet points" vs. "Write a full paragraph for each section"',
      'Iterate on the expansion: "Section 3 is too thin — give me more detail" or "Section 1 is too broad — tighten it"',
      'Combine with the Flipped Interaction: give the outline, then ask the AI what else it needs before expanding',
    ],
    examples: [
      {
        title: 'The Outline Expander in Action',
        good: '"I want a training outline for new team members. Here is my rough structure:\n1. Introduction to our team\'s mission and approach\n2. Core processes and tools\n3. Documentation standards\n4. Key stakeholders and workflows\n5. First 30 days checklist\n\nExpand each section into 3-5 bullet points with the key topics to cover."',
        explanation: 'You provide the skeleton. The AI fills in the substance. You iterate on the result. This teaches you that you control the shape of the output — the AI fills in the details.',
      },
      {
        title: 'Controlling Expansion Depth',
        good: '"Here is my outline for a quarterly review presentation:\n1. Executive Summary\n2. Key Metrics\n3. Wins This Quarter\n4. Challenges and Risks\n5. Next Quarter Priorities\n\nFor sections 1 and 5, write a full paragraph. For sections 2-4, give me bullet points with one sentence each. Keep total length under 2 pages."',
        explanation: 'Different sections get different treatment. The user specified exactly what they wanted at each level — paragraph vs. bullets, depth vs. brevity. The AI follows the specification, and the user reviews each section for accuracy.',
      },
    ],
    practiceTask: {
      title: 'Expand Your Outline',
      instructions: 'Create a rough outline for a real work deliverable. Give it to the AI and ask it to expand. Iterate on the expansion until the result is useful.',
      scenario: 'Choose a document, presentation, or plan you need to create for your work:\n\n1. Write a rough outline — 4-7 main points or sections, just the topics, no detail\n2. Give the outline to the AI: "Expand each section into [specify: bullet points, paragraphs, or a mix]"\n3. Review the expansion: is the substance accurate? Is the depth right? Is anything missing?\n4. Iterate: "Section 2 needs more detail about X" or "Section 4 is too long — tighten it to 3 bullets"\n5. Try combining with the Flipped Interaction: "Before you expand this outline, ask me 3 questions about what I need in each section"',
      hints: [
        'Start with something you actually need to produce — this technique creates real first drafts',
        'Specify the expansion format for each section: not everything needs the same depth',
        'If the AI\'s expansion misses the point, tell it: "Section 3 should focus on X, not Y"',
        'The outline itself is valuable — even before expansion, you have clarified your own thinking',
      ],
      successCriteria: {
        primary: [
          'User provided a rough outline with at least 4 sections and asked the AI to expand it into fuller content',
        ],
        supporting: [
          'User iterated on at least one section of the expansion (requesting more depth, less detail, or a different focus)',
          'User specified different expansion formats for different sections (e.g., bullets for some, paragraphs for others)',
          'User combined the Outline Expander with at least one other technique (Flipped Interaction, output template, or CLEAR)',
        ],
      },
    },
  },
},
```

---

### Module 2-6: Multi-Shot Prompting (was 2-3)

**Changes:** Module ID changes from `2-3` to `2-6`. Add `isGateModule: true`. Update success criteria to weighted format. All other content UNCHANGED except the ID.

```typescript
{
  id: '2-6',
  title: 'Multi-Shot Prompting',
  type: 'exercise',
  description: 'Use examples to train the AI on exact format, style, and quality — showing beats telling',
  estimatedTime: '15 min',
  isGateModule: true,
  learningObjectives: [
    'Provide one or two examples of "good" output to set format, style, and quality standards',
    'Observe how examples communicate what words alone cannot (tone, compliance language, level of detail)',
    'Apply multi-shot prompting to a recurring output type from your work',
  ],
  learningOutcome: 'After this module, you can use examples to get AI output that matches your professional standards — without writing a single formatting instruction.',
  content: {
    overview: 'You just learned to define output shape with templates and expand outlines into content. Multi-shot prompting is the next level: instead of telling the AI what you want, you show it. Two or three well-chosen examples do more work than a paragraph of instructions.\n\nThis is how you stop getting AI-sounding output and start getting output that fits your actual professional context. The AI matches the style, tone, format, and level of detail from your examples — automatically.',
    keyPoints: [
      'One example shifts the output. Two examples lock in the pattern.',
      'Examples communicate format, tone, compliance language, and detail level — all at once',
      'Find existing examples of work done well and feed them to the AI',
      'This is especially powerful for recurring outputs: memos, summaries, client communications',
      'Multi-shot + output templating + CLEAR = the full professional toolkit',
    ],
    steps: [
      'Start with a plain ask and observe the output — note the default format and tone',
      'Add one example of what "good" looks like — observe how the output changes',
      'Add a second example — observe again (format, tone, detail level should converge)',
      'Identify what the examples communicated that your words alone could not',
    ],
    examples: [
      {
        title: 'Multi-Shot for Client Communications',
        good: '"I need to write a follow-up letter to a client about a documentation request. Here are two examples of letters our team has written that match our style:\n\n[Example 1: Past letter with warm but professional tone, specific document list, clear deadline]\n[Example 2: Past letter with similar structure but different document requirements]\n\nNow write a new letter for this client: [details]. Match the tone and format of my examples."',
        explanation: 'The AI extracts the pattern from the examples: greeting style, tone, how documents are listed, how deadlines are stated, closing format. The user did not have to describe any of this — the examples did the work.',
      },
    ],
    practiceTask: {
      title: 'Show, Don\'t Tell',
      instructions: 'Select a recurring output type from your work. Find two existing examples of that output done well. Use those examples to get the AI to match your standard.',
      scenario: 'Think of something you write regularly: a summary, a memo, a client-facing note, a committee report, a status update.\n\n1. Find two existing examples of that document type that you consider "good"\n2. Give them to the AI along with a new task of the same type\n3. Ask the AI to produce a new version matching the style and format of your examples\n4. Compare the result to your examples — what did the AI pick up? What did it miss?',
      hints: [
        'The examples do not need to be perfect — they just need to represent your standard',
        'If you cannot find examples, write a short one yourself and use it as the template',
        'This technique is especially powerful for anything that goes to customers, regulators, or the board',
        'Try it without examples first, then with — the comparison is the lesson',
      ],
      successCriteria: {
        primary: [
          'User provided at least one example of existing work and the AI output visibly matched the style, tone, or format of the example',
        ],
        supporting: [
          'User identified at least one element the examples communicated that words alone could not',
          'User can explain when multi-shot is more efficient than detailed instructions',
        ],
      },
    },
  },
},
```

---

### Module 2-7: Model Selection (was 2-4)

**Changes:** Module ID changes from `2-4` to `2-7`. Add `isGateModule: true`. Update success criteria to weighted format. All other content UNCHANGED except the ID.

```typescript
{
  id: '2-7',
  title: 'Model Selection',
  type: 'document',
  description: 'Learn that different models exist for different tasks — discernment, not preference',
  estimatedTime: '12 min',
  isGateModule: true,
  learningObjectives: [
    'Understand that different AI models are optimized for different types of work',
    'Match task type to model capability: quick drafts vs. deep analysis vs. extended research',
    'Run the same task through two different modes and evaluate when each is worth it',
  ],
  learningOutcome: 'After this module, you can choose the right AI model for each task based on what the task requires — not trial and error.',
  content: {
    overview: 'Different AI models exist for different types of work. This is not about preference — it is about discernment. A quick question does not need a reasoning model. A complex analysis does not benefit from a fast-response model. Learning to match the model to the task is a professional skill.\n\nEvery model gets a specific task type — not a description. "If you are going to use this mode, here is how your interaction should go. Here is what you should be trying to accomplish with it."',
    keyPoints: [
      'Default/Auto mode: general conversation, quick drafts, exploration — your everyday tool',
      'Thinking/Reasoning mode: complex analysis, multi-step problems, tradeoffs — when you need depth',
      'Extended/Pro mode: deep research, nuanced synthesis, high-stakes output — when accuracy matters most',
      'Choosing a model is an act of discernment: "I am using this mode because this task requires it"',
      'Start with the simplest model that might work — escalate only when you need to',
    ],
    examples: [
      {
        title: 'Model Selection in Practice',
        good: 'Quick draft of a meeting agenda → Default mode (fast, good enough)\n\nAnalyzing three vendor proposals against your requirements → Reasoning mode (needs to hold multiple factors, compare systematically)\n\nResearching implications of a new initiative across multiple policy and guidance documents → Extended/Pro mode (needs depth, nuance, comprehensive coverage)',
        explanation: 'Each task gets the model it deserves. Using a reasoning model for a meeting agenda wastes time. Using a default model for regulatory analysis risks missing important nuances. Matching is the skill.',
      },
    ],
    practiceTask: {
      title: 'Compare Models on the Same Task',
      instructions: 'Take one underlying task and run it through two different modes. Compare the outputs and evaluate when each is worth it.',
      scenario: 'Choose a moderately complex task from your work — something that could benefit from deeper analysis but is not trivial.\n\n1. Run it in Default/Auto mode — note the speed and quality of the response\n2. Run the same task in Reasoning/Thinking mode — note what is different\n3. Compare: What did the reasoning model catch that the default missed? Was the extra time worth it?\n4. Now identify 3 tasks from your work: one that should always use Default, one that should always use Reasoning, and one where it depends.',
      hints: [
        'Look for model options in your AI interface — they may be called modes, models, or settings',
        'The names may vary by platform (GPT-4o vs. o1 vs. o3, Claude Sonnet vs. Opus, etc.)',
        'For the comparison: focus on what changed in the reasoning quality, not just the length',
        'Not every task needs the most powerful model — the skill is matching, not maximizing',
      ],
      successCriteria: {
        primary: [
          'User ran the same task through two different model modes and articulated a specific difference in output quality',
        ],
        supporting: [
          'User identified at least one task from their work that should use each mode',
          'User demonstrated discernment — not just always choosing the most powerful model',
        ],
      },
    },
  },
},
```

---

### Module 2-8: Chain-of-Thought Reasoning (was 2-5, RENAMED)

**Changes:** Module ID changes from `2-5` to `2-8`. Title changes from `Chain-of-Thought Mastery` to `Chain-of-Thought Reasoning`. `isGateModule: true` (was already true). Update success criteria to weighted format. All other content UNCHANGED except the ID and title.

```typescript
{
  id: '2-8',
  title: 'Chain-of-Thought Reasoning',
  type: 'exercise',
  description: 'Design prompts that produce auditable, traceable reasoning chains — not just summaries dressed as analysis',
  estimatedTime: '20 min',
  isGateModule: true,
  learningObjectives: [
    'Prompt the AI to reason step-by-step through complex problems',
    'Design a 3-to-5 step reasoning chain explicitly in the prompt',
    'Evaluate whether each step in a reasoning chain holds up — and flag the weakest step',
    'Combine chain-of-thought with self-review loops for auditable analysis',
  ],
  learningOutcome: 'After this module, you can design prompts that produce AI-assisted analysis with traceable reasoning you can actually stand behind.',
  content: {
    overview: 'You learned in Module 7 that some models are built for deeper reasoning. This module teaches you how to unlock that reasoning capability — rather than getting a summary dressed up as analysis.\n\nChain-of-thought outputs are auditable. In professional contexts, the reasoning behind a conclusion often matters as much as the conclusion itself. A risk assessment, a compliance judgment, a resource allocation decision — all of these require reasoning that can be traced and challenged.',
    keyPoints: [
      'Step-by-step reasoning produces auditable output — you can trace and challenge each step',
      'Design the reasoning chain in your prompt: "First, identify X. Then assess Y. Then conclude Z."',
      'The weakest step in the chain is where you focus your review — that is where errors hide',
      'Chain-of-thought + self-review loops = the most rigorous output the AI can produce',
      'In professional contexts, showing your work matters as much as the conclusion',
    ],
    steps: [
      'Run a complex task with a standard prompt — observe the output (usually a summary)',
      'Ask the AI to "show its work" — add step-by-step reasoning to the same task',
      'Design a 3-to-5 step reasoning chain explicitly: "First... Then... Then... Finally..."',
      'Compare the outputs — what does the reasoning chain expose that the summary hid?',
      'Find the weakest step in the chain and challenge it',
    ],
    examples: [
      {
        title: 'Designing a Reasoning Chain',
        good: '"Analyze whether we should expand our service capacity in this region. Work through this step by step:\n\n1. First, summarize our current capacity utilization and the relevant industry benchmark\n2. Then, assess our historical performance over the last 3 years (quality metrics, delivery times)\n3. Then, evaluate the current market conditions in our service area\n4. Then, identify the top 3 risks of expanding capacity and the top 3 risks of not expanding\n5. Finally, make a recommendation with your confidence level and the key assumption behind it"',
        explanation: 'Each step is explicit. The AI cannot jump to a conclusion without showing the reasoning path. The user can review each step independently and challenge step 4 (the risk assessment) if it seems weak. This is auditable analysis, not a summary with a recommendation bolted on.',
      },
    ],
    practiceTask: {
      title: 'Build a Reasoning Chain',
      instructions: 'Take a real analytical task from your work. Design a prompt that produces a reasoning chain with explicit steps. Evaluate whether each step holds up.',
      scenario: 'Choose an analytical task that matters in your work — a decision to evaluate, a risk to assess, a comparison to make, or a recommendation to support.\n\n1. Write the task description\n2. Design a 3-to-5 step reasoning chain: what should the AI think through, in what order?\n3. Run the prompt and read the output step by step\n4. Identify the weakest step — where is the reasoning most likely to be wrong or unsupported?\n5. Challenge that step: "I am not convinced by step 3. What evidence supports that claim?"',
      hints: [
        'Use a Reasoning/Thinking model for this exercise — it is built for chain-of-thought',
        'Number your steps explicitly in the prompt — do not just say "think step by step"',
        'The weakest step is often where the AI makes an assumption without stating it',
        'Try combining this with a self-review loop: "Now review your own reasoning chain for logical gaps"',
      ],
      successCriteria: {
        primary: [
          'User designed a reasoning chain with at least 3 explicit steps and the AI output followed the step-by-step structure',
        ],
        supporting: [
          'User identified the weakest step in the chain and articulated why it is weak',
          'User challenged or refined at least one step in the reasoning',
          'User combined chain-of-thought with self-review loops for a more rigorous result',
        ],
      },
    },
  },
},
```

---

### Module 2-9: Tool Selection (was 2-6)

**Changes:** Module ID changes from `2-6` to `2-9`. Add `isGateModule: true`. Update success criteria to weighted format. All other content UNCHANGED except the ID.

```typescript
{
  id: '2-9',
  title: 'Tool Selection',
  type: 'exercise',
  description: 'Learn to recognize when a tool applies — not just how to operate it',
  estimatedTime: '15 min',
  isGateModule: true,
  learningObjectives: [
    'Understand that AI tools (web search, file analysis, data lookup) solve specific types of problems',
    'Use the Flipped Interaction Pattern with tools: "Scan this tool — what are some ways I could use this?"',
    'Verify tool suggestions before relying on them — explore possibilities, then confirm',
  ],
  learningOutcome: 'After this module, you can identify when an AI tool is the right move for a specific task — and interrogate new tools the same way you interrogate tasks.',
  content: {
    overview: 'Each tool solves a specific kind of problem. Web search finds current information. File analysis reads your documents. Data lookup connects to structured sources. The skill is not learning every tool — it is recognizing when a tool applies.\n\nThe Flipped Interaction Pattern works here too: "Scan this tool. What are some ways I could use this?" This is how you learn to adopt new tools resiliently — you interrogate them the same way you interrogate tasks.\n\nImportant caveat: when you ask the AI what a tool can do, some suggestions will be wrong or overstated. Use the AI to explore possibilities, then verify before you rely on them. Remember Module 1 — the AI can be confidently wrong about tool capabilities too.',
    keyPoints: [
      'Each tool has a sweet spot — learn the scenario where its value is obvious',
      'Web search: when you need current information the AI does not have in its training data',
      'File analysis: when you need to work with your specific documents, spreadsheets, or data',
      'The Flipped Interaction Pattern for tools: "What are some ways I could use this?"',
      'Always verify tool suggestions — the AI may overstate what a tool can do',
      'Two to three tools, each with a clear use case, is better than a tour of everything available',
    ],
    examples: [
      {
        title: 'Recognizing When to Use a Tool',
        good: 'Scenario 1: You need to know the current industry benchmarks for a specific metric → Web search (current data)\nScenario 2: You uploaded a 50-page policy document and need to find a specific section → File analysis (your document)\nScenario 3: You want help brainstorming agenda items for a meeting → No tool needed (conversation is sufficient)',
        explanation: 'The skill is not using tools — it is knowing when. Scenario 3 does not need a tool. Scenario 1 does, because the information changes. Recognizing the difference is the real lesson.',
      },
    ],
    practiceTask: {
      title: 'Match Tools to Tasks',
      instructions: 'Identify 3 tasks from your work. For each, decide: does this need a tool, or is conversation sufficient? If it needs a tool, which one and why?',
      scenario: 'Think of three tasks you do regularly:\n\n1. One that requires current, up-to-date information (prices, rates, recent news, regulatory changes)\n2. One that involves working with a specific document or dataset you have\n3. One that is purely about drafting, analyzing, or brainstorming\n\nFor each: does the AI need a tool, or can it handle it in conversation? Try at least one task that uses a tool and observe the difference.',
      hints: [
        'If the AI says "I do not have access to current data" — that is a signal you need web search',
        'If you are referencing a specific document, upload it rather than describing it',
        'Try the Flipped Interaction Pattern: upload a tool or document and ask "What could I do with this?"',
        'Verify any tool-generated facts before using them in professional output',
      ],
      successCriteria: {
        primary: [
          'User identified at least 3 tasks and correctly matched each to tool vs. no-tool, with reasoning for each choice',
        ],
        supporting: [
          'User used at least one tool (web search, file upload, etc.) on a real task',
          'User verified at least one piece of tool-generated information independently',
        ],
      },
    },
  },
},
```

---

### Module 2-10: Sandbox (was 2-7)

**Changes:** Module ID changes from `2-7` to `2-10`. Add `isGateModule: true`. Update references to include the new modules (AI Limitations, Self-Review, Outline Expander). Update success criteria to weighted format.

```typescript
{
  id: '2-10',
  title: 'Sandbox',
  type: 'sandbox',
  description: 'Structured practice — experiment with prompting frameworks, models, and tools on tasks you care about',
  estimatedTime: '15 min',
  isGateModule: true,
  learningObjectives: [
    'Apply CLEAR, output templating, Outline Expander, multi-shot, chain-of-thought, model selection, tool selection, and self-review independently',
    'Use at least one tool and at least two model modes on tasks that matter to you',
    'Develop your own preferences and use patterns',
  ],
  learningOutcome: 'After this module, you have a clearer sense of which Session 2 techniques fit your work style and which you will use regularly.',
  content: {
    overview: 'Structured practice. You have a full professional toolkit now: AI limitations awareness, self-review loops, CLEAR Framework, output templating, Outline Expander, multi-shot prompting, model selection, chain-of-thought reasoning, and tool selection. The Sandbox is where you put them together on tasks you actually care about.',
    keyPoints: [
      'Use at least one tool (web search, file analysis) and at least two model modes',
      'Combine techniques: CLEAR + output template + multi-shot on a single task',
      'Try chain-of-thought + self-review loop on an analytical task',
      'Apply the Outline Expander to a real deliverable — and finish what you started',
      'There is no wrong combination — experiment and find what works for your role',
    ],
    practiceTask: {
      title: 'Structured Exploration',
      instructions: 'Pick tasks from your work and apply Session 2 techniques. Aim to use at least one tool, two different model modes, and combine at least three techniques.',
      scenario: 'This is your structured practice space. Suggested exercises:\n\n- Take a high-stakes task and apply the full stack: CLEAR + output template + reasoning model\n- Use the Outline Expander to draft a real deliverable, then run a self-review loop on it\n- Use multi-shot prompting on a recurring document type with real examples from your work\n- Run a chain-of-thought analysis on a real decision and critique the reasoning\n- Try a task that needs web search for current data — and verify what the AI finds\n- Compare the same task across two models and pick the winner\n\nOr bring your own task and apply whichever techniques fit.',
      hints: [
        'Combine techniques — they are designed to work together',
        'If you are not sure which technique to use, start with CLEAR + output template as your base',
        'Try the most complex combination you can: CLEAR + Outline Expander + multi-shot + chain-of-thought + self-review',
        'Note which techniques you find most useful — those are the ones to make habitual',
      ],
      successCriteria: {
        primary: [
          'User applied at least three Session 2 techniques in combination on a real or realistic task',
        ],
        supporting: [
          'User used at least one tool (web search, file upload) on a task',
          'User can articulate which techniques they found most useful for their role and why',
        ],
      },
    },
  },
},
```

---

### Session 2 Knowledge Checks — UPDATE

Update the Session 2 knowledge checks to reflect the new modules:

```typescript
2: [
  'Name the three most common AI failure modes and describe how you would catch each one.',
  'What is a self-review loop? Walk through the steps and explain when you would use it.',
  'Name the 5 elements of the CLEAR Framework and describe when structured prompting adds value over casual conversation.',
  'What is the difference between the Outline Expander and output templating? When would you use each?',
  'Describe a situation where you would choose a reasoning model over the default model.',
],
```

---

## PHASE 4: SESSION 3 UPDATES

Session 3 module count stays at 7. The changes are:
1. Set `isGateModule: true` on ALL modules
2. Update success criteria to weighted format on ALL modules
3. Add agent evaluation connection to Modules 3-3 and 3-7
4. Add cross-session connection moments

### Module 3-1: Why Agents Exist

**Changes:** Add `isGateModule: true`. Update success criteria to weighted format. All other content UNCHANGED.

Replace the successCriteria in the practiceTask with:
```typescript
successCriteria: {
  primary: [
    'User interacted with a pre-built agent and can articulate at least one difference between an agent and a default conversation',
  ],
  supporting: [
    'User identified at least one task from their work where an agent might add value',
    'User can explain what persistence means in the context of an agent vs. a conversation',
  ],
},
```

---

### Module 3-2: The Four Levels

**Changes:** Add `isGateModule: true`. Update success criteria to weighted format. All other content UNCHANGED.

Replace the successCriteria in the practiceTask with:
```typescript
successCriteria: {
  primary: [
    'User mapped at least one task to each of the four levels and can explain why Level 2 is the recommended starting point',
  ],
  supporting: [
    'User identified which level they would start building at',
    'User can describe the difference between an advisor agent (Level 2) and an executor agent (Level 3)',
  ],
},
```

---

### Module 3-3: Build a Basic Agent

**Changes:** Add `isGateModule: true` (was already true). Add agent evaluation content connecting back to Session 2 self-review loops. Update success criteria to weighted format.

**Add the following to the END of the `overview` string** (append, do not replace):

```
\n\n**Connection to Session 2:** Once you have built your agent and tested it, use the self-review loop technique from Session 2 to evaluate its output. Define 2-3 criteria for what "good" looks like for this agent\'s job, run a test, and critique the result. This is how you go from "seems okay" to "consistently reliable."'
```

**Add the following to the END of the `steps` array** (append as a new step):

```typescript
'Run a self-review loop on your agent\'s output: define criteria for this agent\'s job, critique the output, and iterate on instructions based on the critique',
```

Replace the successCriteria in the practiceTask with:
```typescript
successCriteria: {
  primary: [
    'User defined a specific job for the agent (not a general assistant) with instructions covering role, scope, style, and constraints',
    'User tested the agent with at least one real or realistic task and iterated on instructions based on test results',
  ],
  supporting: [
    'User ran a self-review loop on the agent\'s output using defined evaluation criteria from Session 2',
    'Agent produces consistent, useful output on repeated tests',
    'User can explain what the agent does well and where its instructions need refinement',
  ],
},
```

---

### Module 3-4: Add Knowledge

**Changes:** Add `isGateModule: true`. Update success criteria to weighted format. All other content UNCHANGED.

Replace the successCriteria in the practiceTask with:
```typescript
successCriteria: {
  primary: [
    'User added at least one knowledge document to their agent and tested the agent with and without knowledge, observing the difference',
  ],
  supporting: [
    'Agent output references or applies information from the knowledge documents',
    'User can explain how knowledge changed the quality or specificity of the output',
  ],
},
```

---

### Module 3-5: Add Files

**Changes:** Add `isGateModule: true`. Update success criteria to weighted format. All other content UNCHANGED.

Replace the successCriteria in the practiceTask with:
```typescript
successCriteria: {
  primary: [
    'User uploaded at least one file to the agent and the agent processed it using its instructions and knowledge',
  ],
  supporting: [
    'User tested at least two different interactions with files',
    'User identified at least one way to improve the agent\'s file handling through instruction updates',
  ],
},
```

---

### Module 3-6: Add Tool Access

**Changes:** Add `isGateModule: true`. Update success criteria to weighted format. Add connection moment referencing chain-of-thought reasoning from Session 2.

**Add the following sentence to the END of the `overview` string** (append, do not replace):

```
\n\nWhen deciding which tools your agent needs, apply the chain-of-thought reasoning from Session 2: think through the agent\'s tasks step by step and identify which steps require external information or actions that only a tool can provide.'
```

Replace the successCriteria in the practiceTask with:
```typescript
successCriteria: {
  primary: [
    'User connected at least one tool to their agent and the agent used it to complete a task (not just conversation)',
  ],
  supporting: [
    'User verified the output from the tool-connected interaction',
    'User can explain the difference between an advisor agent and an executor agent',
  ],
},
```

---

### Module 3-7: Sandbox / Capstone

**Changes:** Add `isGateModule: true`. Update success criteria to weighted format. Add agent evaluation as explicit success criterion.

**Add the following to the END of the `keyPoints` array** (append as a new item):

```typescript
'Use the self-review loop from Session 2 to evaluate your agent — define criteria for its job, test it, critique the output, and refine',
```

Replace the successCriteria in the practiceTask with:
```typescript
successCriteria: {
  primary: [
    'User designed an agent for a real work use case with at least instructions and one additional layer (knowledge, files, or tools)',
    'User tested the agent with realistic inputs and iterated at least once',
  ],
  supporting: [
    'User ran a self-review loop on the agent\'s output using defined evaluation criteria',
    'User can articulate what they would change to make the agent more useful',
    'User describes the agent as something they plan to actually use',
  ],
},
```

---

### Session 3 Knowledge Checks — UPDATE

Update the Session 3 knowledge checks to include evaluation:

```typescript
3: [
  'What are the Four Levels of AI interaction? Give a one-sentence description of each.',
  'What is the difference between an agent\'s knowledge and the files a user provides?',
  'Describe what changes when an agent gets tool access — how does its role shift?',
  'How would you use the self-review loop technique to evaluate whether your agent is producing quality output?',
],
```

---

## PHASE 5: SESSION 4 UPDATES

Session 4 module count stays at 5. The only changes are:
1. Set `isGateModule: true` on ALL modules
2. Update success criteria to weighted format on ALL modules

### Module 4-1: What Are Functional Agents?

Add `isGateModule: true`. Replace successCriteria:
```typescript
successCriteria: {
  primary: [
    'User identified at least 3 tools with functional AI agents or features and can describe what each does',
  ],
  supporting: [
    'User identified at least one task they could use a functional agent for this week',
    'User can explain when to use a functional agent vs. a custom agent from Session 3',
  ],
},
```

---

### Module 4-2: AI in Your Spreadsheet

Add `isGateModule: true`. Replace successCriteria:
```typescript
successCriteria: {
  primary: [
    'User generated at least one formula and one visualization (chart or pivot table) using AI, and verified at least one AI-generated output for accuracy',
  ],
  supporting: [
    'User identified at least one limitation or error in the AI\'s spreadsheet work',
    'User can describe when spreadsheet AI saves time vs. when manual work is more reliable',
  ],
},
```

---

### Module 4-3: AI in Your Presentations

Add `isGateModule: true`. Replace successCriteria:
```typescript
successCriteria: {
  primary: [
    'User generated an outline or slide content using AI and reviewed AI-generated content for accuracy',
  ],
  supporting: [
    'User created speaker notes for at least one slide',
    'User can describe when AI presentation features save time vs. when they do not',
  ],
},
```

---

### Module 4-4: AI in Your Inbox

Add `isGateModule: true`. Replace successCriteria:
```typescript
successCriteria: {
  primary: [
    'User drafted at least one email response using AI assistance and adjusted the draft for tone, accuracy, or context',
  ],
  supporting: [
    'User can identify at least one email type where AI saves time and one where it should not be used',
    'User demonstrated awareness of when human judgment is essential in email communications',
  ],
},
```

---

### Module 4-5: Sandbox

Add `isGateModule: true`. Replace successCriteria:
```typescript
successCriteria: {
  primary: [
    'User explored at least one functional agent in depth and identified the most time-saving AI feature for their specific role',
  ],
  supporting: [
    'User can describe a workflow that combines custom agents from Session 3 with functional agents from Session 4',
    'User has a plan for which functional agent they will use first in their daily work',
  ],
},
```

---

### Session 4 Knowledge Checks — NO CHANGE

Leave the Session 4 knowledge checks as they are.

---

## PHASE 6: SESSION 5 UPDATES

Session 5 changes:
1. Rename from "Build Your Frankenstein" to "Build Your AI Toolkit"
2. Update all internal references to "Frankenstein" → "AI Toolkit"
3. Set `isGateModule: true` on ALL modules
4. Update success criteria to weighted format on ALL modules
5. Adjust scope language in Modules 5-3 and 5-4

### Session 5 metadata:

```typescript
export const SESSION_5_CONTENT: SessionContent = {
  id: 5,
  title: 'Build Your AI Toolkit',
  description: 'Design your own AI stack — combine the skills and tools from every session into a workflow that serves your work',
```

### Session 5 comment block:

Replace the comment block above SESSION_5_CONTENT:
```typescript
// ═════════════════════════════════════════════════════════════════════════════
// SESSION 5: BUILD YOUR AI TOOLKIT
// Andrea Tier: Advisor — strategic consulting perspective, pushes for ambition
// Design: Open session for users who are bought in and ready to explore.
// Not a requirement — this is for users who want to go further.
// ═════════════════════════════════════════════════════════════════════════════
```

---

### Module 5-1: Map Your Stack

Add `isGateModule: true`. Update overview to include connection moment. Replace successCriteria.

**Add the following sentence to the END of the `overview` string** (append, do not replace):

```
\n\n**Connection to all sessions:** Your workflow map should draw on everything you have learned — conversation skills from Session 1, structured prompting and verification from Session 2, custom agents from Session 3, and functional tools from Session 4. Each step in your workflow may use a different combination of these skills.'
```

Replace successCriteria:
```typescript
successCriteria: {
  primary: [
    'User mapped a multi-step workflow with at least 5 steps, with each step classified as Automate, Assist, or Human',
  ],
  supporting: [
    'Each step has identified inputs, outputs, and current owner',
    'User identified at least 2 steps where AI adds clear value and can explain why',
    'User identified at least 1 step that should remain human-only and can explain why',
  ],
},
```

---

### Module 5-2: Design Your Workflow

Add `isGateModule: true`. Replace successCriteria.

Replace successCriteria:
```typescript
successCriteria: {
  primary: [
    'User designed a workflow with at least 3 steps, including at least one human review checkpoint, and can walk through it with a realistic scenario',
  ],
  supporting: [
    'Each step has a defined trigger, input, AI component, and output',
    'User identified which AI techniques from Sessions 1-4 apply at each step',
  ],
},
```

---

### Module 5-3: Stitch It Together

Add `isGateModule: true`. Update title references from "Frankenstein" to "toolkit". Replace successCriteria.

**In the `overview` string, replace:**
```
'Now stitch it together. Your custom agent from Session 3, the functional tools from Session 4, and the workflow design from Module 2 — connect them into something that works end to end.\n\nThis will not be perfect. That is the point. A rough prototype that works teaches you more than a perfect design that never gets built.'
```
**with:**
```
'Now stitch it together. Your custom agent from Session 3, the functional tools from Session 4, and the workflow design from Module 2 — connect them into something that works end to end.\n\nThis will not be perfect. That is the point. A rough working concept teaches you more than a perfect design that never gets built. The goal is a documented workflow you could implement — not a fully automated system in one session.'
```

Replace successCriteria:
```typescript
successCriteria: {
  primary: [
    'User connected at least 2 components into a working workflow and ran it end to end with a realistic scenario',
  ],
  supporting: [
    'User documented what worked and what broke',
    'User identified the highest-impact improvement for the next iteration',
  ],
},
```

---

### Module 5-4: Prototype & Test

Add `isGateModule: true`. Replace successCriteria.

Replace successCriteria:
```typescript
successCriteria: {
  primary: [
    'User fixed at least one issue from end-to-end testing and re-ran the workflow to verify improvement',
  ],
  supporting: [
    'User made a clear judgment call: is this ready for real use, and what is still blocking if not?',
    'User documented remaining known issues for future iteration',
  ],
},
```

---

### Module 5-5: Present & Reflect

**Changes:** Add `isGateModule: true`. Replace all "Frankenstein" references. Replace successCriteria.

**Replace the entire `title` field:**
```typescript
title: 'Present & Reflect',
```
(No change — title is already correct.)

**In the `description` field, replace:**
```
'Present your Frankenstein — what you built, what you learned, and what comes next'
```
**with:**
```
'Present your AI toolkit — what you built, what you learned, and what comes next'
```

**In the `overview` string, replace:**
```
'This is your final module. Present what you built. Reflect on what worked. Identify what comes next.\n\nYour Frankenstein is unique. No one else\'s looks exactly like yours, because no one else has your role, your workflows, or your priorities. That is the point — AI is most powerful when it is shaped around how you actually work.'
```
**with:**
```
'This is your final module. Present what you built. Reflect on what worked. Identify what comes next.\n\nYour AI toolkit is unique. No one else\'s looks exactly like yours, because no one else has your role, your workflows, or your priorities. That is the point — AI is most powerful when it is shaped around how you actually work.'
```

**In the `keyPoints` array, replace:**
```
'Present: what does your stack do? Who is it for? What problem does it solve?',
```
(No change — this line does not reference Frankenstein.)

**In the `practiceTask.title`, replace:**
```
'Your Frankenstein Presentation'
```
**with:**
```
'Your AI Toolkit Presentation'
```

**In the `practiceTask.scenario` string, replace:**
```
'Tell the story of your Frankenstein:\n\n'
```
**with:**
```
'Tell the story of your AI toolkit:\n\n'
```

**In the `practiceTask.hints` array, replace:**
```
'Andrea will push you on ambition — be ready for "what is the bigger version of this?"'
```
(No change — this line does not reference Frankenstein.)

Replace successCriteria:
```typescript
successCriteria: {
  primary: [
    'User presented a clear description of their AI toolkit including the problem it solves and the value it provides',
  ],
  supporting: [
    'User reflected on what they learned across all 5 sessions',
    'User identified at least one concrete next step for improvement or expansion',
    'User can describe who else in their organization could benefit from a similar toolkit',
  ],
},
```

---

## PHASE 7: FINAL VERIFICATION

After completing Phases 1-6, perform these verification checks:

### 7.1 Module ID Verification

Verify that every module ID matches this exact list:

**Session 1:** `'1-1'`, `'1-2'`, `'1-3'`, `'1-4'`, `'1-5'`, `'1-6'`, `'1-7'`
**Session 2:** `'2-1'`, `'2-2'`, `'2-3'`, `'2-4'`, `'2-5'`, `'2-6'`, `'2-7'`, `'2-8'`, `'2-9'`, `'2-10'`
**Session 3:** `'3-1'`, `'3-2'`, `'3-3'`, `'3-4'`, `'3-5'`, `'3-6'`, `'3-7'`
**Session 4:** `'4-1'`, `'4-2'`, `'4-3'`, `'4-4'`, `'4-5'`
**Session 5:** `'5-1'`, `'5-2'`, `'5-3'`, `'5-4'`, `'5-5'`

Total: 34 modules.

### 7.2 Gate Module Verification

Verify that EVERY module across ALL sessions has `isGateModule: true`. There should be exactly 34 instances of `isGateModule: true` in the file.

### 7.3 Success Criteria Format Verification

Verify that EVERY module's `successCriteria` is an object with `primary` (string array) and `supporting` (string array) — NOT a flat string array. There should be zero instances of `successCriteria: [` (flat array) in the file. Every instance should be `successCriteria: {` (object).

### 7.4 Cross-Reference Verification

Verify these cross-references exist in the content:
- Module 1-5 references Module 3 (Dirty Paste)
- Module 1-6 references Module 4 output AND Module 5 (Flipped Interaction)
- Module 1-7 references Modules 1-6
- Module 2-1 references Session 1 confidence building
- Module 2-2 references Module 2-1 (AI Limitations) AND Session 1 output
- Module 2-8 references Module 2-7 (Model Selection)
- Module 2-9 references Module 2-1 (AI Limitations)
- Module 3-3 references Session 2 self-review loops
- Module 3-6 references Session 2 chain-of-thought reasoning
- Module 3-7 references Session 2 self-review loops
- Module 5-1 references all 4 prior sessions

### 7.5 No Stale References

Search the entire file for these strings that should NOT exist:
- `'Self-Review Loops'` should NOT appear in Session 1 module titles
- `'Outline Expander'` should NOT appear in Session 1 content
- `'Flipped Interaction Pattern'` should NOT appear in Module 1-3 content (it was removed from that module)
- `'Chain-of-Thought Mastery'` should NOT appear anywhere (was renamed to `'Chain-of-Thought Reasoning'`)
- `'Frankenstein'` should NOT appear anywhere in Session 5 content
- `'1-6'` should NOT be used as an ID for Self-Review Loops (it is now the ID for Iteration in Session 1)

### 7.6 TypeScript Compilation

Run `npx tsc --noEmit` to verify the file compiles without type errors. The new `successCriteria: { primary: string[]; supporting: string[] }` interface must match every module's criteria.

### 7.7 Knowledge Checks

Verify the KNOWLEDGE_CHECKS object has been updated for sessions 1, 2, and 3 as specified in this document. Session 4 knowledge checks should be unchanged.

---

## APPENDIX: COMPLETE MODULE INDEX

For reference, here is the complete module list after all phases are applied:

| Session | Module ID | Title | Type | New? | Gate? |
|---------|-----------|-------|------|------|-------|
| 1 | 1-1 | Personalization | exercise | No | Yes |
| 1 | 1-2 | Interface Orientation | document | No (revised) | Yes |
| 1 | 1-3 | Basic Interaction | exercise | No (slimmed) | Yes |
| 1 | 1-4 | Your First Win | exercise | No | Yes |
| 1 | 1-5 | The Flipped Interaction | exercise | **YES** | Yes |
| 1 | 1-6 | Iteration | exercise | No (moved from 1-5) | Yes |
| 1 | 1-7 | Sandbox | sandbox | No (updated refs) | Yes |
| 2 | 2-1 | AI Limitations & Critical Evaluation | document | **YES** | Yes |
| 2 | 2-2 | Self-Review Loops | exercise | Moved from S1-6 | Yes |
| 2 | 2-3 | Structured Prompting | document | No (resequenced) | Yes |
| 2 | 2-4 | Output Templating | exercise | No (resequenced) | Yes |
| 2 | 2-5 | The Outline Expander | exercise | **YES** | Yes |
| 2 | 2-6 | Multi-Shot Prompting | exercise | No (resequenced) | Yes |
| 2 | 2-7 | Model Selection | document | No (resequenced) | Yes |
| 2 | 2-8 | Chain-of-Thought Reasoning | exercise | Renamed | Yes |
| 2 | 2-9 | Tool Selection | exercise | No (resequenced) | Yes |
| 2 | 2-10 | Sandbox | sandbox | No (resequenced) | Yes |
| 3 | 3-1 | Why Agents Exist | document | No | Yes |
| 3 | 3-2 | The Four Levels | document | No | Yes |
| 3 | 3-3 | Build a Basic Agent | exercise | Updated | Yes |
| 3 | 3-4 | Add Knowledge | exercise | No | Yes |
| 3 | 3-5 | Add Files | exercise | No | Yes |
| 3 | 3-6 | Add Tool Access | exercise | Updated | Yes |
| 3 | 3-7 | Sandbox / Capstone | sandbox | Updated | Yes |
| 4 | 4-1 | What Are Functional Agents? | document | No | Yes |
| 4 | 4-2 | AI in Your Spreadsheet | exercise | No | Yes |
| 4 | 4-3 | AI in Your Presentations | exercise | No | Yes |
| 4 | 4-4 | AI in Your Inbox | exercise | No | Yes |
| 4 | 4-5 | Sandbox | sandbox | No | Yes |
| 5 | 5-1 | Map Your Stack | exercise | Updated | Yes |
| 5 | 5-2 | Design Your Workflow | exercise | No | Yes |
| 5 | 5-3 | Stitch It Together | exercise | Updated | Yes |
| 5 | 5-4 | Prototype & Test | exercise | No | Yes |
| 5 | 5-5 | Present & Reflect | sandbox | Updated | Yes |

---

## END OF TRD

This document is the complete specification. Do not infer, assume, or improvise beyond what is explicitly stated here. If something is ambiguous, default to the exact text provided. If a module is not mentioned in a phase, do not modify it in that phase.
