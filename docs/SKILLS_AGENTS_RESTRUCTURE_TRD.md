# SMILE Curriculum — Skills & Agents Restructure TRD

**Document Version:** 1.0
**Date:** April 9, 2026
**Author:** Cory K / SM Advisors
**Target Executor:** Claude Code
**Primary File Under Modification:** `src/data/trainingContent.ts`
**Secondary Files:** Listed in Phases 8-10

---

## EXECUTIVE SUMMARY

This TRD specifies a restructure of Sessions 3-6 of the SMILE curriculum. The current Session 3 (Agents) is being split into two sessions to reflect how the AI platform landscape has evolved: Skills and Projects are now the primary customization layer across Claude, ChatGPT, Copilot, and Gemini. Agents are being redefined as the autonomy layer that builds on top of skills.

The changes include:

1. **New Session 3: Skills & Projects** -- 7 modules teaching users to build reusable AI specialists using projects (persistent context) and skills (reusable procedures)
2. **New Session 4: Agents & Autonomy** -- 7 modules teaching users when and how to give AI systems decision-making authority, and what governance that requires
3. **Session cascade** -- Current Session 4 (Functional Agents) becomes Session 5. Current Session 5 (Build Your Frankenstein) becomes Session 6.
4. **All modules are gate modules** -- `isGateModule: true` on every module across Sessions 3-6
5. **Updated knowledge checks** for Sessions 3-6
6. **Updated Andrea coaching tiers** -- Session 3: Peer. Session 4: Advisor.
7. **Platform-native terminology** -- Module content uses platform-native terms (e.g., Claude Projects, ChatGPT GPTs/Skills, Copilot Agents, Gemini Gems) where applicable, driven by org platform configuration
8. **Updated Autonomy Spectrum** -- The old "Four Levels" framework is replaced by a five-level Autonomy Spectrum (Conversation, Skill, Project, Agent, Orchestrator)

### Why This Change

The AI platform landscape shifted between when Session 3 was designed and April 2026:

- Claude launched Skills (October 2025) -- reusable expertise packages with dynamic loading, slash-command invocation, and automatic triggering. Open standard released December 2025.
- ChatGPT is transitioning from Custom GPTs to Skills (beta February 2026) -- modular, composable abilities that auto-combine when tasks require multiple capabilities.
- Copilot Studio treats skills as reusable components inside agents -- multi-agent orchestration and agent-to-agent communication are now GA.
- Google Gemini Gems evolved into Super Gems (2026) -- adding UI elements for lightweight app-like experiences.

The current Session 3 teaches "build an agent" as a monolithic four-layer process (instructions, knowledge, files, tools). What it actually teaches -- writing instructions, adding knowledge, configuring scope and constraints -- is much closer to what every major platform now calls a "skill" or "project." The agent framing overpromises (autonomy) when what most users need is consistency and reusability. It underprepares users for how platforms actually work. And it misaligns terminology with what users encounter on every major platform.

The fix: teach skills and projects first (Session 3), then teach agents as the autonomy layer that builds on skills (Session 4).

---

## CRITICAL RULES FOR CLAUDE CODE

- Do NOT change the `ModuleContent`, `SessionContent`, or `ElectivePath` interfaces unless explicitly instructed
- Do NOT modify Sessions 1-2 content in any way
- Do NOT modify any file other than those explicitly listed in each phase
- Preserve all TypeScript types and exports exactly as they are unless explicitly instructed otherwise
- Every string value provided in this document is EXACT -- copy it character-for-character including punctuation, capitalization, and escape sequences
- When this document says "unchanged," it means do not modify that field AT ALL
- Complete each phase FULLY before moving to the next phase
- Do NOT skip phases. Do NOT reorder phases.

---

## REVISED SESSION ARCHITECTURE

| Session | Theme | Modules | Core Skill Built | Andrea Tier |
|---------|-------|---------|-----------------|-------------|
| 1 | Foundation & Early Wins | 7 | Conversation-first computing | Hand-Holding |
| 2 | Structured Interaction, Models & Tools | 10 | Professional-grade prompting | Collaborative |
| **3** | **Skills & Projects** | **7** | **Building reusable AI specialists** | **Peer** |
| **4** | **Agents & Autonomy** | **7** | **Building and governing autonomous AI** | **Advisor** |
| **5** | **AI in Your Everyday Tools** | **5** | Applying AI in existing tools | Advisor |
| **6** | **Build Your Frankenstein** | **5** | Designing your own stack | Advisor |

---

## PHASE 1: REPLACE SESSION 3 — SKILLS & PROJECTS

**File:** `src/data/trainingContent.ts`

Replace the entire `SESSION_3_CONTENT` export with the following. The old Session 3 content is being fully replaced -- do not preserve any of it.

### Session 3 Metadata

```typescript
export const SESSION_3_CONTENT: SessionContent = {
  id: 3,
  title: 'Skills & Projects — Your AI Specialists',
  description: 'Build reusable AI specialists that make every interaction more relevant, consistent, and efficient — using the customization tools every major platform now offers',
  modules: [
```

### Andrea Coaching Context for Session 3

Session 3 Andrea operates at Tier 3: Peer. Socratic questioning. Challenges vague thinking. Pushes for specificity in use case definition. Does not hand-hold -- asks questions that force the user to think about their own work context.

---

### Module 3-1: Why Customization Matters

```typescript
{
  id: '3-1',
  title: 'Why Customization Matters',
  type: 'document',
  description: 'Understand what changes when you move from ad-hoc conversations to persistent, reusable AI configurations',
  estimatedTime: '12 min',
  isGateModule: true,
  learningObjectives: [
    'Explain why starting from scratch every conversation is friction for tasks you do repeatedly',
    'Distinguish between ad-hoc conversation and persistent AI configuration',
    'Use a pre-built example and observe what makes it different from a default conversation',
  ],
  learningOutcome: 'After this module, you understand why customization matters and can identify tasks in your work where persistent AI configuration would eliminate repetitive setup.',
  content: {
    overview: 'In Sessions 1 and 2, you learned to have productive conversations with AI. Every time you start a new chat, you start from scratch. That is fine for one-off tasks.\n\nBut for work you do repeatedly — the same type of analysis, the same report format, the same review criteria — starting from scratch every time is friction. You re-explain your role. You re-describe the format you want. You re-state the constraints. Every time.\n\nCustomization eliminates that friction. You configure once, use forever. The AI already knows who you are, what you need, and how you work — before you type a single word.',
    keyPoints: [
      'Sessions 1-2 taught conversation. Customization makes those conversations persistent and reusable.',
      'For tasks you do repeatedly, re-explaining context every time is wasted effort',
      'Customization is not complexity — it is convenience. You are saving future-you from re-explaining.',
      'Every major AI platform now offers customization tools: Claude Projects, ChatGPT GPTs and Skills, Copilot Agents, Gemini Gems',
      'The universal example: a strategic organizer for loose, unstructured thoughts and ideas',
    ],
    examples: [
      {
        title: 'Ad-Hoc Conversation vs. Persistent Configuration',
        bad: 'Every Monday, you open a new chat and type: "I am a senior analyst at a professional services firm. I need you to review project proposals using our evaluation criteria. Always flag resource and timeline risks. Format your review as: Summary, Key Risks, Recommendation, Conditions." You do this every single time.',
        good: 'You configure a specialist that already knows your role, your criteria, and your preferred format. Every Monday, you open it, paste the proposal data, and get a structured review instantly. No re-explaining. No forgotten instructions.',
        explanation: 'The configured specialist does not do anything the conversation cannot do. The difference is persistence — it remembers so you do not have to. For tasks you do repeatedly with the same structure, that persistence is the value.',
      },
    ],
    practiceTask: {
      title: 'Explore a Pre-Built Specialist',
      instructions: 'Use a pre-built example specialist and observe what makes it different from a default conversation.',
      scenario: 'Try the Strategic Organizer — a universal example that works for anyone. It takes your loose, unstructured thoughts (ideas, fragments, half-formed observations) and makes sense of them: organizes them, surfaces connections, identifies themes.\n\n1. Open the pre-built specialist\n2. Paste in some unstructured thoughts or ideas from your work\n3. Observe: how does this feel different from a regular conversation?\n4. What did the specialist do that a default conversation would not have done automatically?\n5. Try the same task in a fresh default conversation and compare the experience',
      hints: [
        'The difference is in what you did NOT have to explain — the specialist already knew its job',
        'Think about tasks in your work where re-explaining context every time is friction',
        'This is a starting point — you will build your own in Module 3',
      ],
      successCriteria: {
        primary: [
          'User interacted with the pre-built specialist and observed its behavior',
          'User can articulate at least one difference between a configured specialist and a default conversation',
        ],
        supporting: [
          'User identified at least one task from their work where persistent configuration would add value',
        ],
      },
    },
  },
},
```

---

### Module 3-2: Understanding Projects

```typescript
{
  id: '3-2',
  title: 'Understanding Projects',
  type: 'exercise',
  description: 'Learn to build a persistent workspace that holds your context, documents, and rules so every conversation inherits them automatically',
  estimatedTime: '20 min',
  isGateModule: true,
  learningObjectives: [
    'Explain what a project is: a persistent workspace with instructions, knowledge files, and conversation history',
    'Create a simple project with instructions and at least one knowledge document',
    'Observe the difference between a conversation inside a project and a default conversation without one',
  ],
  learningOutcome: 'After this module, you can create a project that holds your context and rules, so every conversation inside it is automatically relevant to your work.',
  content: {
    overview: 'A project is a workspace with a memory. You put your documents in it, write your rules, and every conversation inside the project knows what you put there.\n\nThink of it like a case file. A loan officer does not start from scratch every time they review a file — the case file has the application, the financials, the correspondence, the policy guidelines. A project works the same way for AI.\n\nEvery major platform has a version of this concept. On Claude, these are called Projects. On ChatGPT, this is the knowledge and instructions inside a Custom GPT. On Copilot, this is the configuration inside Copilot Studio. On Gemini, this is a Gem with uploaded reference files. The concept is the same everywhere — the name changes by platform.',
    keyPoints: [
      'A project has three components: instructions (your rules), knowledge (your reference documents), and conversations (your interaction history)',
      'Instructions are written in plain English — this is not code, it is a job description for the AI',
      'Knowledge files give the AI access to your actual standards, policies, and reference materials — not generic knowledge',
      'Every conversation inside a project automatically inherits the instructions and knowledge',
      'Platform mapping: Claude calls these Projects. ChatGPT uses Custom GPTs or the new Skills system. Copilot uses Copilot Studio configurations. Gemini uses Gems.',
    ],
    examples: [
      {
        title: 'Project Instructions — Too Vague vs. Well-Defined',
        bad: '"Help me with work stuff. Be professional."',
        good: '"You are an assistant for a senior analyst at a professional services firm. I review and evaluate project proposals, prepare findings summaries, and present recommendations to our leadership committee. When I share a proposal, analyze it against our standard evaluation criteria: strategic alignment, resource feasibility, timeline realism, and risk factors. Always flag items that require leadership attention. Format output as: Executive Summary (3 sentences), Key Findings (bullets), Risk Flags (if any), Recommendation (approve/revise/decline with rationale)."',
        explanation: 'The detailed instructions tell the AI who you are, what you do, how to analyze, and how to format. Every conversation inside this project inherits these rules automatically. You never re-explain.',
      },
    ],
    practiceTask: {
      title: 'Create Your First Project',
      instructions: 'Create a project for a real work context. Write instructions and add at least one reference document. Then compare conversations inside and outside the project.',
      scenario: 'Choose a work context you deal with regularly — a department function, a recurring analysis, or a client engagement.\n\n1. Create a project and give it a clear name\n2. Write instructions covering: your role and context, what you need from the AI, what standards to follow, what to avoid\n3. Add one reference document — a policy, a template, a set of guidelines, or a style guide\n4. Ask the same work question inside the project and in a fresh default conversation\n5. Compare: how are the responses different? Which one is more useful for your actual work?',
      hints: [
        'Your instructions should read like you are briefing a smart colleague who is new to your team',
        'Start with one document — the one you reference most often in this type of work',
        'Keep instructions under 500 words — specific enough to shape behavior, short enough to be efficient',
        'The before/after comparison is the key insight — run the same question with and without the project',
      ],
      successCriteria: {
        primary: [
          'User created a project with written instructions that include role context, standards, and formatting preferences',
          'User added at least one knowledge document to the project',
        ],
        supporting: [
          'User compared the same question inside vs. outside the project and observed the difference',
          'Instructions are specific enough to produce noticeably different output — not generic placeholders',
        ],
      },
      departmentScenarios: {
        'Commercial Lending': {
          scenario: 'Create a project for commercial loan analysis. Instructions should cover how you evaluate creditworthiness, what financial ratios you prioritize, and how you format credit memos. Add your institution\'s lending policy or credit analysis template as a knowledge document.',
          hints: [
            'Include your institution\'s risk rating framework in the instructions',
            'Add your credit memo template as the knowledge document',
            'Specify how the AI should handle incomplete financial data — ask for it, not guess',
          ],
        },
        'Retail Banking': {
          scenario: 'Create a project for customer service support. Instructions should cover your institution\'s product offerings, common customer inquiries, and how you handle escalations. Add a product reference guide or FAQ document as knowledge.',
          hints: [
            'Include guidelines for how to handle product comparison questions',
            'Add your branch\'s most-used reference guide as the knowledge document',
            'Specify compliance boundaries — what the AI should never advise on (e.g., specific investment recommendations)',
          ],
        },
        'Compliance': {
          scenario: 'Create a project for regulatory filing review. Instructions should cover which regulations apply to your institution, what format findings should follow, and how to flag potential violations. Add a regulatory reference guide or recent examination findings as knowledge.',
          hints: [
            'Be explicit about which regulatory frameworks to reference (BSA/AML, CRA, Fair Lending, etc.)',
            'Include your institution\'s risk tolerance language in the instructions',
            'Add your most recent regulatory exam findings as the knowledge document',
          ],
        },
        'Risk Management': {
          scenario: 'Create a project for enterprise risk assessment. Instructions should cover your risk taxonomy, scoring methodology, and reporting format. Add your risk appetite statement or risk assessment framework as knowledge.',
          hints: [
            'Include your institution\'s risk categories and definitions in the instructions',
            'Add your risk scoring rubric as the knowledge document',
            'Specify how the AI should handle emerging risks that do not fit existing categories',
          ],
        },
        'Operations': {
          scenario: 'Create a project for process improvement documentation. Instructions should cover how you document current-state processes, identify bottlenecks, and format improvement recommendations. Add a process documentation template or recent process review as knowledge.',
          hints: [
            'Include your standard process documentation format in the instructions',
            'Add a recent process review or audit finding as the knowledge document',
            'Specify that the AI should always include time estimates and resource requirements in recommendations',
          ],
        },
      },
    },
  },
},
```

---

### Module 3-3: Building Your First Skill

```typescript
{
  id: '3-3',
  title: 'Building Your First Skill',
  type: 'exercise',
  description: 'Create a reusable AI playbook for a specific type of task — a digital SOP that produces consistent, high-quality output every time',
  estimatedTime: '25 min',
  isGateModule: true,
  learningObjectives: [
    'Identify a repeatable task from your work that would benefit from a standardized AI procedure',
    'Write a skill definition using the six-part anatomy: identity, trigger, procedure, standards, guardrails, output format',
    'Test the skill on a real or realistic task and iterate based on what comes back',
  ],
  learningOutcome: 'After this module, you have built a working skill — a reusable AI playbook — configured for a specific task in your work.',
  content: {
    overview: 'A project holds your context. A skill tells AI how to do a specific job.\n\nIf a project is a case file, a skill is the SOP that tells you how to process the case file. Skills are reusable — you build them once and apply them across different projects, different conversations, different contexts.\n\nWriting a skill is like writing a job description for a specialist. You are defining the role, the scope, the procedure, the quality standards, and the boundaries. The more specific you are, the more consistently useful the specialist becomes. Vague skills produce vague output.\n\nOn Claude, skills are formal configurations (SKILL.md files or Project instructions). On ChatGPT, this maps to Custom GPT instructions or the new Skills feature. On Copilot, skills are reusable components in Copilot Studio. On Gemini, this is the instruction set inside a Gem.',
    keyPoints: [
      'A skill is a reusable procedure for a specific type of task — a digital SOP',
      'Skills ensure consistency: every time the AI handles that task type, it follows the same framework',
      'The six-part skill anatomy: Identity, Trigger, Procedure, Standards, Guardrails, Output Format',
      'Writing a skill is like writing a job description — specificity is everything',
      'Start narrow: a skill for one specific task is more useful than a skill that tries to handle everything',
    ],
    steps: [
      'Choose a repeatable task from your work — something you do weekly or more',
      'Define Identity: what is this skill? What specific job does it do?',
      'Define Trigger: when should this skill activate? What kind of task calls for it?',
      'Define Procedure: what steps does it follow? In what order?',
      'Define Standards: what quality criteria must the output meet?',
      'Define Guardrails: what should this skill never do? What are the boundaries?',
      'Define Output Format: what should the final result look like?',
      'Test with a real or realistic input and iterate based on what comes back',
    ],
    examples: [
      {
        title: 'Skill Definition — Well-Structured',
        good: 'Identity: You are a Project Intake Checklist Skill for a professional services firm. You help project managers ensure all required information is gathered before a project kicks off.\n\nTrigger: Activate when someone shares a new project brief, proposal, or request for a project intake review.\n\nProcedure:\n1. Review the provided project brief for completeness\n2. Check for: project type, scope, deliverables, timeline, budget, stakeholder list, success criteria\n3. Identify any missing required elements\n4. Produce a customized intake checklist based on the project type\n5. Flag items that require leadership or compliance review\n\nStandards: Every checklist must include governance requirements (approvals, compliance sign-offs if applicable, budget confirmation). Items should include both what information is needed AND why it is required.\n\nGuardrails: Do NOT make resource allocation decisions or assess team capacity. Do NOT approve or reject projects. If the project type is unfamiliar, say so rather than guessing requirements.\n\nOutput Format: Numbered checklist grouped by category (Governance, Scope, Resources, Timeline). Each item: requirement name, what is needed, why it matters, status (provided/missing).',
        explanation: 'This skill is specific enough to produce consistent, useful output every time. The guardrails prevent it from overstepping. The procedure ensures completeness. The output format ensures the result is immediately usable. This is a well-written digital SOP.',
      },
    ],
    practiceTask: {
      title: 'Build Your First Skill',
      instructions: 'Identify a repeatable task from your work. Write a skill definition using the six-part anatomy. Test it and iterate.',
      scenario: 'Choose a task you do at least weekly:\n\n1. Define Identity: what specific job does this skill handle?\n2. Define Trigger: what kind of input or request activates it?\n3. Define Procedure: what steps does it follow, in order?\n4. Define Standards: what quality criteria must the output meet?\n5. Define Guardrails: what should the skill NEVER do?\n6. Define Output Format: what does the result look like?\n7. Test with a real or realistic input\n8. Review: did the skill follow your procedure? Meet your standards? Respect your guardrails?\n9. Iterate at least once based on test results',
      hints: [
        'Start narrow — "Meeting Summary Skill" is better than "General Work Assistant Skill"',
        'Guardrails are the most important part — they prevent the skill from doing things you do not want',
        'If the skill ignores an instruction, it is usually because the instruction is too vague — be more specific',
        'Test with an edge case: what happens when the input is unusual or incomplete?',
      ],
      successCriteria: {
        primary: [
          'User defined a specific, repeatable task for the skill — not a general assistant',
          'Skill definition includes all six anatomy components: identity, trigger, procedure, standards, guardrails, output format',
        ],
        supporting: [
          'User tested the skill with at least one real or realistic input',
          'User iterated on the skill definition at least once based on test results',
        ],
      },
      departmentScenarios: {
        'Commercial Lending': {
          scenario: 'Build a skill for credit memo preparation, loan documentation review, or financial statement analysis. Something you do for nearly every deal.',
          hints: [
            'Your institution\'s credit analysis framework makes excellent procedure content',
            'Guardrails should include: do not make credit decisions, do not override risk ratings',
            'Output format should match your institution\'s standard memo or analysis format',
          ],
        },
        'Retail Banking': {
          scenario: 'Build a skill for customer inquiry responses, product comparison summaries, or branch performance reporting.',
          hints: [
            'Include compliance guardrails: do not make specific investment recommendations, do not share customer data',
            'Standard response templates make great output format specifications',
          ],
        },
        'Compliance': {
          scenario: 'Build a skill for regulatory finding analysis, policy gap assessment, or BSA/AML alert review.',
          hints: [
            'Procedure should mirror your actual review steps — the skill follows the same process you do',
            'Guardrails: do not make final compliance determinations — flag for human review',
            'Output format should match your institution\'s findings report structure',
          ],
        },
        'Risk Management': {
          scenario: 'Build a skill for risk assessment scoring, control testing documentation, or risk appetite threshold monitoring.',
          hints: [
            'Your risk scoring rubric is the foundation of the procedure section',
            'Standards should reference your institution\'s risk taxonomy',
            'Guardrails: do not assign final risk ratings — recommend for human review',
          ],
        },
        'Operations': {
          scenario: 'Build a skill for process documentation, SLA monitoring reports, or vendor review checklists.',
          hints: [
            'Your existing process documentation templates are the perfect output format specification',
            'Procedure should follow your standard review methodology step by step',
          ],
        },
      },
    },
  },
},
```

---

### Module 3-4: Adding Knowledge to Skills

```typescript
{
  id: '3-4',
  title: 'Adding Knowledge to Skills',
  type: 'exercise',
  description: 'Give your skill domain knowledge — the difference between a generic procedure and a real specialist',
  estimatedTime: '15 min',
  isGateModule: true,
  learningObjectives: [
    'Add relevant reference documents to a skill to transform it from a generic procedure into a domain-specific specialist',
    'Test the same skill with and without knowledge and observe the difference in output quality',
    'Understand that knowledge is context — it grounds the skill in your actual standards, not general knowledge',
  ],
  learningOutcome: 'After this module, your skill has domain knowledge that makes it a genuine specialist — not just a generic procedure with a title.',
  content: {
    overview: 'Take the skill you built in Module 3. Same procedure, one new layer: knowledge. Add relevant documents, references, or guidelines. Then test the difference.\n\nKnowledge is not just files. It is the difference between a new hire following a generic checklist and an experienced team member who knows your organization\'s specific requirements. Your skill with a procedure alone can follow steps. Your skill with knowledge can apply your actual standards, policies, and reference materials while following those steps.',
    keyPoints: [
      'Knowledge = documents, references, guidelines, policies, examples that your skill can reference while executing its procedure',
      'The skill uses knowledge to ground its responses in your actual standards — not general AI knowledge',
      'Start with 1-3 documents that are most relevant to the skill\'s specific job',
      'Test before and after: the difference in output quality is the value of knowledge',
      'Too many documents can be counterproductive — start focused and add only as needed',
    ],
    practiceTask: {
      title: 'Add Knowledge to Your Skill',
      instructions: 'Take your skill from Module 3, add 1-3 relevant knowledge documents, and test the difference in output quality.',
      scenario: 'Return to the skill you built in Module 3:\n\n1. Identify 1-3 documents most relevant to the skill\'s job (policies, guidelines, templates, examples, standards)\n2. Add them to the skill\'s knowledge base\n3. Run the same test task from Module 3 — compare the output before and after\n4. How did the output change? Is it more specific? More accurate? Does it reference your actual standards?\n5. Try a new task that specifically requires information from your documents',
      hints: [
        'Start with your most-used reference document — the one you check most often for this type of work',
        'Good candidates: your team\'s standards guide, process documentation, templates, or regulatory reference materials',
        'The before/after comparison is the key insight — same task, same skill, with and without knowledge',
        'If the skill does not reference the knowledge documents, your procedure may need an explicit instruction to "reference provided documents"',
      ],
      successCriteria: {
        primary: [
          'User added at least one knowledge document to their skill',
          'User tested the skill with and without knowledge and observed a measurable difference in output quality',
        ],
        supporting: [
          'Skill output references or applies specific information from the knowledge documents',
          'User can explain how knowledge changed the specificity or accuracy of the output',
        ],
      },
    },
  },
},
```

---

### Module 3-5: Skills and Projects Together

```typescript
{
  id: '3-5',
  title: 'Skills and Projects Together',
  type: 'exercise',
  description: 'Learn how skills and projects complement each other — projects hold context, skills provide procedure, and the combination produces consistent, high-quality output',
  estimatedTime: '15 min',
  isGateModule: true,
  learningObjectives: [
    'Apply a skill within a project context and observe how the combination produces better output than either alone',
    'Test skill reusability by applying the same skill across different project contexts',
    'Map out an ideal configuration of projects and skills for your work',
  ],
  learningOutcome: 'After this module, you understand how skills and projects complement each other and can design configurations where projects provide context and skills provide procedure.',
  content: {
    overview: 'A project without skills has context but no standardized procedure. Every conversation inside it is still ad-hoc — the AI knows who you are but does not know how to handle specific task types consistently.\n\nA skill without a project has procedure but no specific context. It follows the steps generically — it knows what to do but does not know the details of your specific situation.\n\nTogether: the project provides the context (who you are, what you are working on, what documents matter) and the skill provides the procedure (how to handle the task, what standards to apply, what format to use).\n\nThe combination is where real professional value lives. And the power multiplies because skills are reusable — one skill can serve multiple projects, and one project can use multiple skills.',
    keyPoints: [
      'Projects = context (who, what, which documents). Skills = procedure (how, what standards, what format).',
      'Together, they produce output that is both contextually relevant and procedurally consistent',
      'One skill can serve multiple projects — build once, apply everywhere',
      'One project can use multiple skills — different tasks, same context',
      'The combination is where AI stops being a novelty and starts being a professional tool',
    ],
    examples: [
      {
        title: 'Skills + Projects in Practice',
        good: 'Project: "Q2 Portfolio Review" — contains client documents, market data, firm guidelines, prior quarter analysis.\n\nSkill 1: "Risk Assessment Analyzer" — follows your firm\'s risk framework, flags exceptions, formats findings.\nSkill 2: "Executive Summary Generator" — distills complex analysis into 3-paragraph summaries for leadership.\nSkill 3: "Action Item Extractor" — identifies commitments, deadlines, and owners from meeting notes.\n\nResult: When you apply the Risk Assessment skill inside the Q2 Portfolio Review project, you get a risk assessment that uses your firm\'s framework applied to your actual client data, formatted to your standards. Apply the Executive Summary skill to the same project and you get a leadership-ready summary. Same context, different procedures, consistent quality.',
        explanation: 'The project holds the context. The skills provide the procedure. You configure the project once and apply different skills as needed. This is how professionals scale their AI use without re-explaining context every time.',
      },
    ],
    practiceTask: {
      title: 'Combine Skills and Projects',
      instructions: 'Apply your skill inside your project context. Test reusability by applying the same skill in a different context. Map your ideal configuration.',
      scenario: 'Bring your project from Module 2 and your skill from Module 3 together:\n\n1. Apply your skill inside your project — observe the combined output\n2. Compare: is this better than either the project alone or the skill alone?\n3. Create a second project (different context — different client, different quarter, different department) and apply the same skill\n4. Does the skill adapt to the new context? What stays consistent (procedure) vs. what changes (context)?\n5. Map out your ideal configuration: what projects do you need? What skills would serve them?',
      hints: [
        'The reusability test is the key insight — same skill, different project, consistent quality',
        'If the skill does not adapt to the new project context, your skill may be too rigid — loosen the context-specific parts',
        'Think about your team: which projects would everyone need? Which skills would be shared vs. personal?',
        'Map at least 2 projects and 3 skills — this becomes your buildout roadmap',
      ],
      successCriteria: {
        primary: [
          'User applied a skill within a project context and observed the combined output',
          'User tested skill reusability across at least two different project contexts',
        ],
        supporting: [
          'User can explain when to add context to the project vs. when to build it into the skill',
          'User mapped at least one additional skill or project they plan to build',
        ],
      },
    },
  },
},
```

---

### Module 3-6: Sharing and Scaling

```typescript
{
  id: '3-6',
  title: 'Sharing and Scaling',
  type: 'exercise',
  description: 'Share skills and projects with colleagues — and understand why organizational standardization creates compounding value',
  estimatedTime: '15 min',
  isGateModule: true,
  learningObjectives: [
    'Share a skill with at least one colleague and collect feedback on whether it works for their context',
    'Identify 3-5 skills that your team should standardize for consistent output quality',
    'Understand that the people closest to the work build the best skills — AI customization is a domain expertise function, not an IT function',
  ],
  learningOutcome: 'After this module, you can articulate how shared skills create organizational value and have identified the skills your team should standardize.',
  content: {
    overview: 'A skill you build for yourself saves you time. A skill you share with your team saves everyone time.\n\nShared skills create consistency. When every analyst uses the same risk assessment skill, the output quality is standardized — not dependent on who wrote the prompt that day. When every loan officer uses the same documentation review skill, nothing gets missed because someone forgot a step.\n\nThis is how organizations scale AI: not by training everyone to be expert prompters, but by building and sharing skills that encode best practices. The compliance team builds the compliance skills. The lending team builds the loan review skills. The people closest to the work build the best skills.',
    keyPoints: [
      'Shared skills create consistency — the output quality depends on the skill, not the individual user',
      'The people closest to the work build the best skills — this is a domain expertise function, not an IT function',
      'Skills are team assets, not personal tools — treat them like shared SOPs',
      'Start with the tasks where inconsistency causes the most problems',
      'A shared skill library compounds over time — each new skill makes the whole team more efficient',
    ],
    practiceTask: {
      title: 'Share and Collect Feedback',
      instructions: 'Share your skill with at least one other participant. Collect feedback. Draft a skill wish list for your team.',
      scenario: 'Take your skill from Module 3:\n\n1. Share it with at least one other participant in the session\n2. Have them test it with their own input — does it work for their context?\n3. Collect feedback: what worked? What needed adjustment? What was confusing?\n4. Make at least one improvement based on the feedback\n5. Draft a "skill wish list" for your team: 3-5 skills that would standardize your team\'s most common or most error-prone tasks\n6. For each wish list skill, identify who on your team is best positioned to build it',
      hints: [
        'The best feedback comes from someone who does similar work but has a slightly different context',
        'If the skill does not work for them, ask: is it a context problem (they need different instructions) or a procedure problem (the steps are wrong)?',
        'For the wish list, prioritize tasks where inconsistency causes the most problems — compliance reviews, client communications, reporting',
        'The skill builder should be the domain expert, not the most technical person',
      ],
      successCriteria: {
        primary: [
          'User shared their skill with at least one other person and received specific feedback',
          'User identified at least 3 skills that would benefit their team if standardized',
        ],
        supporting: [
          'User made at least one improvement based on peer feedback',
          'User identified who on their team is best positioned to build each wish list skill',
        ],
      },
    },
  },
},
```

---

### Module 3-7: Sandbox / Capstone

```typescript
{
  id: '3-7',
  title: 'Sandbox / Capstone',
  type: 'sandbox',
  description: 'Build a second skill, combine multiple skills in a project, and refine your configuration for real use',
  estimatedTime: '25 min',
  isGateModule: true,
  learningObjectives: [
    'Build a second skill for a different use case or significantly refine your first skill',
    'Configure a project that combines at least two skills for a realistic workflow',
    'Articulate what you would build next and why — your skill and project roadmap',
  ],
  learningOutcome: 'After this module, you have a working project and skill configuration you plan to actually use — not just a practice exercise.',
  content: {
    overview: 'Build and refine. This is your capstone for Session 3.\n\nYou have learned what projects and skills are, how to build them, how they work together, and how sharing them creates team value. Now put it together into something you will actually use.\n\nThe best configuration is one you will use tomorrow — not the most complex one you can build. Start with something that solves a real problem in your actual work.',
    keyPoints: [
      'Build a second skill for a different use case — or significantly expand and refine your first skill',
      'Configure a project that uses at least two skills together',
      'Test the full configuration with realistic inputs',
      'The bar: would you use this tomorrow? If not, what is missing?',
      'Reflect: what would make this 10x more useful? That becomes your buildout roadmap.',
    ],
    practiceTask: {
      title: 'Build Your Capstone Configuration',
      instructions: 'Build a second skill, combine skills in a project, test with realistic inputs, and define your roadmap.',
      scenario: 'This is your capstone for Session 3:\n\n1. Build a second skill for a different use case from your work (or significantly expand your first skill)\n2. Configure a project that uses at least two skills together\n3. Test the full configuration with realistic inputs — does the combination produce professional-quality output?\n4. Identify what works and what you would change\n5. Define your roadmap: what projects and skills will you build next? In what order? Why?',
      hints: [
        'The most useful second skill often handles a task adjacent to your first skill — they naturally work together',
        'Test the combination, not just individual skills — the value is in how they work together inside a project',
        'Ask yourself: "Would I use this tomorrow?" If not, what is the one thing still missing?',
        'Your roadmap should prioritize by impact: which skill or project would save the most time or reduce the most risk?',
      ],
      successCriteria: {
        primary: [
          'User built or significantly refined at least one additional skill',
          'User has a working project + skill configuration that combines at least two skills',
        ],
        supporting: [
          'User tested the configuration with realistic inputs and iterated at least once',
          'User can articulate a roadmap of what they will build next and why',
        ],
      },
    },
  },
},
```

**Close the modules array and the SESSION_3_CONTENT object:**

```typescript
  ],
};
```

---

## PHASE 2: CREATE NEW SESSION 4 — AGENTS & AUTONOMY

**File:** `src/data/trainingContent.ts`

Rename the current `SESSION_4_CONTENT` to `SESSION_5_CONTENT` FIRST (Phase 3 handles the content updates). Then create a new `SESSION_4_CONTENT` with the following content.

### Session 4 Metadata

```typescript
export const SESSION_4_CONTENT: SessionContent = {
  id: 4,
  title: 'Agents & Autonomy',
  description: 'Understand when and how to give AI systems decision-making authority — and what governance that requires',
  modules: [
```

### Andrea Coaching Context for Session 4

Session 4 Andrea operates at Tier 4: Advisor. Strategic consulting perspective. Pushes for rigor on governance and guardrails. Challenges weak guardrail definitions. Does not accept "it should be safe" — demands specifics. Celebrates strong governance thinking as much as strong building.

---

### Module 4-1: From Skills to Agents

```typescript
{
  id: '4-1',
  title: 'From Skills to Agents',
  type: 'document',
  description: 'Understand what changes when you move from invoking a skill to deploying an autonomous agent — and why that distinction matters',
  estimatedTime: '12 min',
  isGateModule: true,
  learningObjectives: [
    'Explain the five levels of the Autonomy Spectrum: Conversation, Skill, Project, Agent, Orchestrator',
    'Distinguish between a skill (you invoke it, it follows a procedure) and an agent (it monitors, decides, and acts within boundaries)',
    'Map at least 5 tasks from your work across the Autonomy Spectrum and identify the appropriate level for each',
  ],
  learningOutcome: 'After this module, you can assess any task and determine whether it belongs at the skill level or the agent level — and explain why.',
  content: {
    overview: 'In Session 3, you built skills — reusable procedures that produce consistent output when you invoke them. You are in the driver\'s seat. You decide when to run the skill, what to feed it, and whether to act on the output.\n\nAn agent is different. An agent monitors a situation and takes action when something meets the criteria you defined. The agent is in the driver\'s seat — within the lane you set.\n\nThe difference is not intelligence. It is autonomy. A skill waits for you. An agent acts on its own, within boundaries.\n\nFor professionals in regulated industries, this distinction is the whole ballgame. Autonomy means risk. Every autonomous action needs governance — who authorized it, what triggered it, what it did, and how you audit the decision.',
    keyPoints: [
      'The Autonomy Spectrum has five levels: Conversation, Skill, Project, Agent, Orchestrator',
      'Level 1 — Conversation: one-off exchange, you decide everything',
      'Level 2 — Skill: reusable procedure invoked by you, skill decides how to execute',
      'Level 3 — Project: persistent workspace with context and skills, you work within it',
      'Level 4 — Agent: monitors, decides, and acts within boundaries you define',
      'Level 5 — Orchestrator: coordinates multiple agents and skills, you govern the system',
      'Most professionals get enormous value from Levels 2-3. Level 4 is appropriate for specific, high-volume, well-defined tasks. Level 5 requires organizational governance infrastructure.',
      'The goal is not the highest level — it is the right level for each task',
    ],
    examples: [
      {
        title: 'The Autonomy Spectrum in Practice',
        good: 'Level 1 — Conversation: You ask "What are the current industry benchmarks for this metric?" — a one-off question.\n\nLevel 2 — Skill: You run your Proposal Review Skill on a new submission. It follows your evaluation criteria every time, but you decide when to run it and you review the output before acting.\n\nLevel 3 — Project: You open your Q2 Portfolio Review project and apply different skills as needed — risk assessment, executive summary, action items. The project maintains context across all your conversations.\n\nLevel 4 — Agent: When a new project proposal enters the system, an agent automatically runs the Proposal Review Skill, flags high-risk items, and routes exceptions to the right reviewer — without you initiating anything.\n\nLevel 5 — Orchestrator: When a new loan application arrives, a system coordinates intake processing, compliance screening, risk assessment, and document verification — each handled by a different agent, with human checkpoints at defined decision points.',
        explanation: 'Each level adds capability and risk. Levels 2-3 are already transformative for most professionals. Level 4 requires trigger logic and governance. Level 5 requires organizational infrastructure. Build up deliberately — the right level is the one that matches the task\'s risk profile and your organization\'s readiness.',
      },
    ],
    practiceTask: {
      title: 'Map Your Work to the Autonomy Spectrum',
      instructions: 'Identify at least 5 tasks from your work and map each to the appropriate level of the Autonomy Spectrum.',
      scenario: 'Think about tasks across your work and map them:\n\n1. Identify at least 5 tasks you do regularly\n2. For each task, determine which level of the Autonomy Spectrum is appropriate\n3. For any task you placed at Level 4 or 5: what are the risks of autonomous action? What guardrails would you need?\n4. For any task you placed at Level 2 or 3: why is that level sufficient? What would you gain by moving it higher? What would you risk?\n5. Which level would you start building at? (Most professionals start at Level 2-3)',
      hints: [
        'Most tasks belong at Level 2-3 — that is not a limitation, it is the sweet spot for professional work',
        'Level 4 is appropriate for high-volume, well-defined tasks with clear success criteria and low ambiguity',
        'If you cannot define exactly when the agent should and should not act, the task is not ready for Level 4',
        'Level 5 typically requires IT involvement and organizational governance — it is not a solo project',
      ],
      successCriteria: {
        primary: [
          'User mapped at least 5 tasks across the Autonomy Spectrum with specific level assignments',
          'User can explain why most professional tasks belong at Levels 2-3 — not because of limitations, but because that is the appropriate level of autonomy',
        ],
        supporting: [
          'For any Level 4-5 task, user articulated the specific risks and required guardrails',
        ],
      },
    },
  },
},
```

---

### Module 4-2: Agents as Skill Orchestrators

```typescript
{
  id: '4-2',
  title: 'Agents as Skill Orchestrators',
  type: 'exercise',
  description: 'Design an agent by wrapping skills with triggers, decision logic, and guardrails — agents are built from skills, not from scratch',
  estimatedTime: '15 min',
  isGateModule: true,
  learningObjectives: [
    'Explain the six-part agent anatomy: skills, triggers, decision logic, guardrails, escalation path, audit trail',
    'Design an agent wrapper around an existing skill — defining when it acts, what it decides, and what it must never do',
    'Write guardrails that are specific and testable, not vague and aspirational',
  ],
  learningOutcome: 'After this module, you have designed an agent that wraps a skill with triggers, decision logic, and governance — ready to build in Module 3.',
  content: {
    overview: 'You do not start with an agent. You start with skills that work well. Then you add: when should this skill run automatically? What conditions trigger it? What decisions can it make on its own? What boundaries must it respect? When does it hand off to a human?\n\nAn agent = skills + triggers + decision logic + guardrails + escalation path + audit trail.\n\nThe skill does the work. The agent decides when and whether to do the work. Separating these concerns makes both more reliable and more auditable.',
    keyPoints: [
      'Agents are built from skills, not from scratch — the skill handles the procedure, the agent handles the autonomy',
      'The six-part agent anatomy: Skills (what it does), Triggers (when it activates), Decision Logic (what it decides), Guardrails (what it must never do), Escalation Path (when it hands off to a human), Audit Trail (how you track what it did)',
      'Guardrails must be specific and testable: "Do not approve loans over $50K" is testable. "Be careful with large loans" is not.',
      'The escalation path is not optional — every agent must know when to stop and ask a human',
      'The audit trail is not optional — every autonomous action must be traceable',
    ],
    examples: [
      {
        title: 'Agent Design — Well-Structured',
        good: 'Skills: Uses the Proposal Review Skill (from Session 3) to evaluate incoming project proposals.\n\nTrigger: Activates when a new proposal document is uploaded to the shared folder.\n\nDecision Logic: If the proposal is under $100K and within an existing client relationship, proceed to full review. If over $100K or new client, flag for senior review before processing.\n\nGuardrails: NEVER approve or reject proposals — only analyze and recommend. NEVER process proposals marked "Confidential — Board Only." ALWAYS include the source document reference in the output.\n\nEscalation Path: If the proposal references regulatory requirements the agent cannot verify, escalate to compliance team with a summary of what was found and what needs verification. If the proposal is missing more than 3 required fields, escalate to the submitter with a specific list of what is needed.\n\nAudit Trail: Log every proposal processed: timestamp, document name, decision path taken, output generated, any escalations triggered.',
        explanation: 'This agent design separates concerns cleanly. The skill handles the analysis procedure. The agent handles when to run, what to decide, when to stop, and how to track. The guardrails are specific and testable. The escalation path is clear. The audit trail is complete.',
      },
    ],
    practiceTask: {
      title: 'Design Your Agent',
      instructions: 'Choose a skill from Session 3 and design the agent wrapper: triggers, decision logic, guardrails, escalation path, and audit trail.',
      scenario: 'Take a skill you built in Session 3 and design the agent wrapper:\n\n1. Skills: which skill(s) will this agent use?\n2. Trigger: what event or condition activates this agent?\n3. Decision Logic: what decisions can the agent make on its own? What criteria does it use?\n4. Guardrails: what must the agent NEVER do? Be specific and testable.\n5. Escalation Path: when does the agent hand off to a human? What information does it provide in the handoff?\n6. Audit Trail: how do you track what the agent did, when, and why?\n\nDo NOT build the agent yet — this module is design only. Module 3 is build.',
      hints: [
        'Start with the trigger — if you cannot define a clear trigger, the task may not be ready for agent-level autonomy',
        'Guardrails should be testable: if you cannot verify whether the guardrail held, it is too vague',
        'The escalation path should specify WHAT information the agent provides when it hands off — not just "escalate"',
        'The audit trail should capture enough information to reconstruct any decision the agent made',
      ],
      successCriteria: {
        primary: [
          'User designed an agent wrapper with all six anatomy components: skills, triggers, decision logic, guardrails, escalation path, audit trail',
          'Guardrails are specific and testable — not vague aspirational statements',
        ],
        supporting: [
          'Escalation path specifies what information the agent provides during handoff',
          'Audit trail captures enough to reconstruct any decision the agent made',
        ],
      },
    },
  },
},
```

---

### Module 4-3: Build a Working Agent

```typescript
{
  id: '4-3',
  title: 'Build a Working Agent',
  type: 'exercise',
  description: 'Turn your agent design into a working system and test it across four scenarios: normal, edge, out-of-scope, and guardrail',
  estimatedTime: '25 min',
  isGateModule: true,
  learningObjectives: [
    'Build an agent from the design created in Module 2 — implementing skills, triggers, guardrails, and escalation logic',
    'Test the agent across four scenarios: normal case, edge case, out-of-scope case, and guardrail test',
    'Iterate on agent configuration until guardrails hold across all test scenarios',
  ],
  learningOutcome: 'After this module, you have a working agent that passes all four test types — including the guardrail test, which is the most important.',
  content: {
    overview: 'Take your agent design from Module 2 and build it. Then test it rigorously.\n\nThe testing framework has four scenarios, and all four are required:\n\n1. Normal case: task within expected parameters. The agent should complete it successfully.\n2. Edge case: task at the boundary of the agent\'s scope. The agent should handle carefully or escalate.\n3. Out-of-scope case: task outside the agent\'s authority. The agent MUST refuse or escalate.\n4. Guardrail test: deliberately attempt to get the agent to violate its constraints. It should hold.\n\nThe guardrail test is the most important test. An agent that works on normal cases but fails on edge cases is not ready for production. In a regulated environment, a guardrail failure is a compliance failure.',
    keyPoints: [
      'Build from your Module 2 design — do not start from scratch',
      'Test all four scenarios: normal, edge, out-of-scope, and guardrail',
      'The guardrail test is the most important — it determines whether the agent is safe to deploy',
      'If a guardrail fails, tighten the instructions and test again — do not deploy until it holds',
      'Document every test result: what you tested, what happened, what you changed',
    ],
    steps: [
      'Implement the agent from your Module 2 design: configure the skill(s), define the trigger, set guardrails, configure escalation',
      'Normal test: give the agent a task within its expected scope. Verify it completes correctly.',
      'Edge test: give the agent a task at the boundary of its scope. Verify it handles carefully or escalates.',
      'Out-of-scope test: give the agent a task outside its authority. Verify it refuses or escalates.',
      'Guardrail test: deliberately try to get the agent to violate its constraints. Verify it holds.',
      'If any test fails: identify the gap, tighten the configuration, and retest.',
      'Repeat until all four tests pass consistently.',
    ],
    practiceTask: {
      title: 'Build and Test Your Agent',
      instructions: 'Build the agent from your Module 2 design. Run all four test types. Iterate until guardrails hold.',
      scenario: 'Build your agent and run the full test suite:\n\n1. Implement the agent from your Module 2 design\n2. Normal test: give it a straightforward task within scope. Does it complete correctly?\n3. Edge test: give it a task at the boundary. Does it handle it carefully or escalate?\n4. Out-of-scope test: give it a task outside its authority. Does it refuse or escalate?\n5. Guardrail test: try to get the agent to break its rules. Does it hold?\n6. Document results: what worked, what failed, what you changed\n7. Iterate until all four tests pass',
      hints: [
        'If the normal test fails, the problem is in your skill — go back to Session 3 and fix the procedure',
        'If the edge test fails, the problem is usually in your decision logic — make the criteria more specific',
        'If the out-of-scope test fails, the problem is in your guardrails — they are not specific enough',
        'If the guardrail test fails, do NOT deploy. Tighten the guardrails and retest.',
      ],
      successCriteria: {
        primary: [
          'Agent completes normal case tasks successfully using the underlying skill',
          'Agent refuses or escalates on out-of-scope tasks — does not attempt to handle them',
        ],
        supporting: [
          'User ran all four test types and documented the results',
          'User iterated at least once to strengthen configuration based on test failures',
        ],
      },
    },
  },
},
```

---

### Module 4-4: Adding Tools and Actions

```typescript
{
  id: '4-4',
  title: 'Adding Tools and Actions',
  type: 'exercise',
  description: 'Connect your agent to tools so it can take real actions — and understand why tool access is a privilege that requires governance',
  estimatedTime: '15 min',
  isGateModule: true,
  learningObjectives: [
    'Connect an agent to at least one tool (web search, data lookup, document generation, or a connected service)',
    'Test an interaction where the agent produces an action, not just a response',
    'Distinguish between read-only tools (lower risk) and write tools (higher risk) and explain why the distinction matters',
  ],
  learningOutcome: 'After this module, your agent can take actions through connected tools — and you understand the governance implications of each tool connection.',
  content: {
    overview: 'An agent without tools can analyze, recommend, and draft. An agent with tools can search, retrieve, format, send, and update.\n\nTool access is a privilege, not a default. Every tool connection expands what the agent can do — and what can go wrong. A read-only tool (web search, data lookup) is low risk — the worst case is bad information. A write tool (send email, update records, generate documents) is higher risk — the worst case is an unauthorized action.\n\nStart with read-only. Build trust. Then add write access incrementally, with governance at every step.',
    keyPoints: [
      'Tool access transforms the agent from advisor to executor — it can now take real actions',
      'Read-only tools (search, lookup, retrieve) are lower risk — start here',
      'Write tools (send, update, create, delete) are higher risk — add only with governance in place',
      'The agent should explain what tool it used and why — transparency is required, not optional',
      'Every tool connection needs a guardrail: what can the agent do with this tool, and what can it not do?',
    ],
    practiceTask: {
      title: 'Connect and Test a Tool',
      instructions: 'Add a tool to your agent. Test an interaction that produces an action, not just a response. Verify the output and assess the risk.',
      scenario: 'Extend your agent with tool access:\n\n1. Enable at least one tool (web search is the easiest and lowest-risk starting point)\n2. Give the agent a task that requires the tool (e.g., "Find the current status of this regulation" or "Look up the latest quarterly data for this metric")\n3. Observe: did the agent use the tool? Did it tell you it was using it?\n4. Verify the tool output: is the information accurate and current?\n5. Assess: is this a read-only tool or a write tool? What is the worst case if the agent uses it incorrectly?\n6. Define the guardrail: what should the agent be allowed to do with this tool, and what should it not?',
      hints: [
        'Web search is the most universally useful first tool — it gives the agent access to current information',
        'Ask the agent to cite its sources when using web search — verify at least one',
        'If connecting to other tools (email, calendar, data systems), start with read-only access before write access',
        'The key question: would you trust this agent to use this tool without your review? If not, add a human checkpoint.',
      ],
      successCriteria: {
        primary: [
          'User connected at least one tool to their agent',
          'Agent used the tool to complete a task and the user verified the output',
        ],
        supporting: [
          'User can distinguish between read-only and write tools and explain the risk difference',
          'User defined a guardrail for the tool connection — what the agent can and cannot do with it',
        ],
      },
    },
  },
},
```

---

### Module 4-5: Governance and Compliance

```typescript
{
  id: '4-5',
  title: 'Governance and Compliance',
  type: 'exercise',
  description: 'Build the governance framework your agent needs for production use — authorization, monitoring, audit trails, and compliance controls',
  estimatedTime: '15 min',
  isGateModule: true,
  learningObjectives: [
    'Apply the six-component governance framework to your agent: Authorization, Monitoring, Audit Trail, Exception Handling, Review Cadence, Kill Switch',
    'Write a governance brief that would satisfy your organization\'s compliance requirements',
    'Identify the approval chain for agent deployment in your organization',
  ],
  learningOutcome: 'After this module, you have a governance brief for your agent that addresses authorization, monitoring, audit trails, exception handling, review cadence, and emergency controls.',
  content: {
    overview: 'Every autonomous action your agent takes should be traceable: who authorized it, what triggered it, what it did, what data it accessed, and what decision it made.\n\nIn regulated industries, this is not optional. Regulators expect you to explain every decision in the chain, whether a human or an AI made it. The governance brief is the document that makes the difference between "I built a cool AI thing" and "I built something my organization can actually deploy."\n\nGovernance is not bureaucracy. It is what makes autonomous AI deployable in a professional environment.',
    keyPoints: [
      'The six-component governance framework: Authorization, Monitoring, Audit Trail, Exception Handling, Review Cadence, Kill Switch',
      'Authorization: who approved this agent for production use? What is its scope of authority?',
      'Monitoring: how do you track what the agent does? Who reviews the logs? How often?',
      'Audit Trail: can you reconstruct every decision the agent made and why?',
      'Exception Handling: what happens when the agent encounters something unexpected?',
      'Review Cadence: how often do you review and update the agent\'s instructions and guardrails?',
      'Kill Switch: how do you disable the agent immediately if something goes wrong?',
    ],
    examples: [
      {
        title: 'Governance Brief — Well-Structured',
        good: 'Agent: Proposal Review Agent\n\nAuthorization: Approved by [Department Head] for internal use within the PMO. Scope limited to project proposals under $100K for existing clients. Deployed [date], authorized through [review date].\n\nMonitoring: Daily output log reviewed by PMO lead. Weekly exception report to department head. Monthly accuracy audit comparing agent recommendations to final decisions.\n\nAudit Trail: Every proposal processed is logged with: timestamp, document ID, decision path (auto-review vs. escalation), output generated, any guardrail triggers. Logs retained for 3 years per records policy.\n\nException Handling: If the agent encounters a proposal type not in its training scope, it stops processing, tags the proposal as "Manual Review Required," and notifies the PMO lead via email. If the agent cannot access a required data source, it pauses and retries once before escalating.\n\nReview Cadence: Guardrails reviewed quarterly. Knowledge base updated when evaluation criteria change. Full agent review at annual policy refresh.\n\nKill Switch: PMO lead can disable the agent immediately via the admin dashboard. Auto-disable triggers if more than 3 escalations occur in a single day.',
        explanation: 'This governance brief is specific, actionable, and auditable. A compliance officer can read this and understand exactly how the agent is controlled. This is the standard that makes autonomous AI deployable in a regulated environment.',
      },
    ],
    practiceTask: {
      title: 'Write Your Governance Brief',
      instructions: 'Apply the six-component governance framework to your agent. Write a brief that would satisfy your organization\'s compliance requirements.',
      scenario: 'Write a governance brief for the agent you built in Modules 2-4:\n\n1. Authorization: who would approve this agent? What is its scope of authority? What is the authorization period?\n2. Monitoring: who reviews the output? How often? What do they look for?\n3. Audit Trail: what gets logged? How long are logs retained? Can you reconstruct any decision?\n4. Exception Handling: what happens when the agent encounters something unexpected? How does it fail safely?\n5. Review Cadence: how often are guardrails reviewed? When does the knowledge base get updated?\n6. Kill Switch: who can disable the agent? What triggers an automatic shutdown?\n\nThen answer: who in your organization would need to approve this governance brief before the agent could deploy?',
      hints: [
        'Your organization likely already has change management or technology deployment processes — the governance brief should fit within those',
        'The audit trail section is often the most important for regulated industries — be thorough',
        'The kill switch should be accessible to more than one person — single points of failure are a governance risk',
        'If you cannot answer a question in the framework, that is a signal the agent is not ready for production',
      ],
      successCriteria: {
        primary: [
          'Governance brief covers all six components: Authorization, Monitoring, Audit Trail, Exception Handling, Review Cadence, Kill Switch',
          'User identified the approval chain for agent deployment in their organization',
        ],
        supporting: [
          'Audit trail section specifies what gets logged and how long logs are retained',
          'Kill switch specifies who can disable and what triggers automatic shutdown',
        ],
      },
    },
  },
},
```

---

### Module 4-6: Agent Deployment and Sharing

```typescript
{
  id: '4-6',
  title: 'Agent Deployment and Sharing',
  type: 'exercise',
  description: 'Deploy your agent for real use, share it with colleagues for testing, and establish a review schedule',
  estimatedTime: '15 min',
  isGateModule: true,
  learningObjectives: [
    'Deploy an agent for real use and share it with at least one colleague for peer testing',
    'Collect feedback on agent performance and make at least one improvement based on testing',
    'Define a review schedule for ongoing agent maintenance and governance compliance',
  ],
  learningOutcome: 'After this module, your agent is deployed, peer-tested, and has a defined review schedule for ongoing maintenance.',
  content: {
    overview: 'A deployed agent is a commitment. It needs monitoring, maintenance, and periodic review. Deployment is not the end of the process — it is the beginning of the operational phase.\n\nPeer testing is essential before any agent goes into production use. Another person will find issues you missed — they will try inputs you did not anticipate, interpret outputs differently, and test the guardrails in ways you would not think to.\n\nOnce deployed, the agent needs a review schedule. The environment changes (new policies, new regulations, new team members), and the agent needs to change with it.',
    keyPoints: [
      'Deployment is the beginning of the operational phase, not the end of the build phase',
      'Peer testing catches issues you missed — another perspective is essential',
      'Every deployed agent needs a review schedule — guardrails, knowledge, and triggers need periodic updates',
      'Document what the agent does, how it works, and who to contact if something goes wrong',
      'The first week of deployment should be monitored more closely than ongoing operation',
    ],
    practiceTask: {
      title: 'Deploy and Peer Test',
      instructions: 'Deploy your agent, share it with at least one colleague for testing, and define a review schedule.',
      scenario: 'Move your agent from prototype to deployment:\n\n1. Deploy your agent for real use\n2. Share the agent with at least one other participant in the session\n3. Have them test it with their own inputs — does it work as expected? Do the guardrails hold?\n4. Collect specific feedback: what worked? What was confusing? What failed?\n5. Make at least one improvement based on the peer testing\n6. Define a review schedule: when will you next review the agent\'s guardrails, knowledge, and performance?\n7. Document: what the agent does, how to use it, and who to contact if it behaves unexpectedly',
      hints: [
        'Ask your peer tester to specifically try to break the guardrails — that is the most valuable test',
        'The first improvement based on feedback is usually the most impactful — prioritize it',
        'A quarterly review cadence is a good starting point for most agents',
        'Documentation should be simple enough that someone who did not build the agent can understand what it does',
      ],
      successCriteria: {
        primary: [
          'User deployed their agent and shared it with at least one other person for testing',
          'User made at least one improvement based on peer feedback',
        ],
        supporting: [
          'User defined a review schedule with specific dates or cadence',
          'User created documentation covering what the agent does and how to use it',
        ],
      },
    },
  },
},
```

---

### Module 4-7: Sandbox / Capstone

```typescript
{
  id: '4-7',
  title: 'Sandbox / Capstone',
  type: 'sandbox',
  description: 'Build or expand an agent, integrate it with your skills and projects from Session 3, and reflect on the full journey from conversations to autonomous AI',
  estimatedTime: '25 min',
  isGateModule: true,
  learningObjectives: [
    'Build a second agent or significantly expand the first — integrating it with skills and projects from Session 3',
    'Articulate the difference between skills, projects, and agents and when each is appropriate',
    'Explain the governance requirements for any autonomous AI system to a non-technical colleague',
  ],
  learningOutcome: 'After this module, you have a working agent integrated with your skills and projects, and you can explain when to use each level of the Autonomy Spectrum — and what governance each requires.',
  content: {
    overview: 'This is your capstone for Session 4.\n\nYou have learned the Autonomy Spectrum. You have designed agents from skills. You have built, tested, governed, and deployed. Now put it all together.\n\nBuild a second agent for a different use case, or significantly expand your first agent. Integrate it with the skills and projects you built in Session 3. Then reflect on the full journey — from basic conversations in Session 1 to autonomous AI systems in Session 4.\n\nThe question is not "how complex can I make this?" It is "what is the right level of autonomy for each task in my work, and do I have the governance to support it?"',
    keyPoints: [
      'Build or expand: a second agent for a different use case, or a significantly improved version of your first',
      'Integrate: your agent should work with the skills and projects from Session 3',
      'Reflect: what level of the Autonomy Spectrum is right for each task in your work?',
      'Govern: can you explain the governance requirements for your agent to a non-technical colleague?',
      'The best agent is one your organization can actually deploy — not the most complex one you can build',
    ],
    practiceTask: {
      title: 'Build Your Capstone Agent',
      instructions: 'Build or expand an agent. Integrate with Session 3 skills and projects. Reflect on the full journey.',
      scenario: 'This is your capstone for Session 4:\n\n1. Build a second agent for a different use case OR significantly expand your first agent\n2. Integrate it with at least one skill and one project from Session 3\n3. Run the full four-test suite (normal, edge, out-of-scope, guardrail)\n4. Write or update the governance brief\n5. Reflect on the full journey:\n   - Sessions 1-2: conversation and structured interaction\n   - Session 3: skills and projects — reusable specialists you invoke\n   - Session 4: agents — autonomous systems you govern\n6. What is the right level of the Autonomy Spectrum for each task in your work?',
      hints: [
        'The most valuable second agent often handles a different type of autonomy than your first',
        'Integration with Session 3 skills is the key — agents should orchestrate skills, not duplicate them',
        'If you cannot write the governance brief, the agent is not ready for deployment',
        'Your reflection should include: what surprised you? What is harder than you expected? What is easier?',
      ],
      successCriteria: {
        primary: [
          'User built or significantly expanded an agent integrated with at least one Session 3 skill',
          'User can articulate the difference between skills, projects, and agents and when each is appropriate',
        ],
        supporting: [
          'User ran the four-test suite and all tests pass',
          'User can explain the governance requirements for their agent to a non-technical colleague',
        ],
      },
    },
  },
},
```

**Close the modules array and the SESSION_4_CONTENT object:**

```typescript
  ],
};
```

---

## PHASE 3: CASCADE OLD SESSION 4 TO SESSION 5

**File:** `src/data/trainingContent.ts`

The current `SESSION_4_CONTENT` (Functional Agents / AI in Your Everyday Tools) must be renamed and renumbered to become Session 5.

### 3.1 Rename the Export

Rename `SESSION_4_CONTENT` to `SESSION_5_CONTENT`.

### 3.2 Update Session Metadata

```typescript
export const SESSION_5_CONTENT: SessionContent = {
  id: 5,
  title: 'AI in Your Everyday Tools',
  description: 'Learn to use AI features already built into the tools you use every day — choose the path most relevant to your work',
```

### 3.3 Update Module IDs

| Old ID | New ID |
|--------|--------|
| 4-1 | 5-1 |
| 4-2 | 5-2 |
| 4-3 | 5-3 |
| 4-4 | 5-4 |
| 4-5 | 5-5 |

### 3.4 Update All Internal Text References

Search every string value in the old Session 4 modules and make these replacements:

| Find | Replace With |
|------|-------------|
| `Session 3` (when referring to agents/skills) | `Sessions 3 and 4` |
| `custom agent (Session 3)` | `skills and agents (Sessions 3-4)` |
| `custom agents (Session 3)` | `skills and agents (Sessions 3-4)` |
| `the agent you built in Session 3` | `the skills and agents you built in Sessions 3-4` |
| `In Session 3, you built custom agents from scratch` | `In Sessions 3 and 4, you built skills, projects, and agents from scratch` |
| `custom agent` (standalone, when contrasting with functional agent) | `custom skill or agent` |
| `custom agents` (standalone) | `custom skills and agents` |

### 3.5 Ensure All Modules Have `isGateModule: true`

Every module in Session 5 (formerly Session 4) must have `isGateModule: true`. Add this field to any module that does not already have it.

---

## PHASE 4: CASCADE OLD SESSION 5 TO SESSION 6

**File:** `src/data/trainingContent.ts`

The current `SESSION_5_CONTENT` (Build Your Frankenstein) must be renamed and renumbered to become Session 6.

### 4.1 Rename the Export

Rename `SESSION_5_CONTENT` to `SESSION_6_CONTENT`.

### 4.2 Update Session Metadata

```typescript
export const SESSION_6_CONTENT: SessionContent = {
  id: 6,
  title: 'Designing Your AI Workflow',
  description: 'Design your own AI stack — stitch the pieces together in the way that serves your work',
```

### 4.3 Update Module IDs

| Old ID | New ID |
|--------|--------|
| 5-1 | 6-1 |
| 5-2 | 6-2 |
| 5-3 | 6-3 |
| 5-4 | 6-4 |
| 5-5 | 6-5 |

### 4.4 Update All Internal Text References

Search every string value in the old Session 5 modules and make these replacements:

| Find | Replace With |
|------|-------------|
| `Session 3` (when referring to agents) | `Session 4` |
| `Session 4` (when referring to functional tools) | `Session 5` |
| `Your custom agent from Session 3, the functional tools from Session 4` | `Your skills from Session 3, agents from Session 4, functional tools from Session 5` |
| `custom agent from Session 3` | `skills and agents from Sessions 3-4` |
| `functional tools from Session 4` | `functional tools from Session 5` |
| `Sessions 3, 4, and 5` | `Sessions 3, 4, 5, and 6` |
| `Sessions 3-5` | `Sessions 3-6` |
| `all 5 sessions` | `all 6 sessions` |
| `Session 1 to Session 5` | `Session 1 to Session 6` |

### 4.5 Ensure All Modules Have `isGateModule: true`

Every module in Session 6 (formerly Session 5) must have `isGateModule: true`. Add this field to any module that does not already have it.

---

## PHASE 5: UPDATE KNOWLEDGE CHECKS

**File:** `src/data/trainingContent.ts`

Replace the entire `KNOWLEDGE_CHECKS` export with the following:

```typescript
export const KNOWLEDGE_CHECKS: Record<number, string[]> = {
  1: [
    'What is the Flipped Interaction Pattern, and when would you use it?',
    'Describe the difference between the first AI response and a useful final output — what happens in between?',
    'What is the Dirty Paste technique, and why is it an effective way to start an AI interaction?',
  ],
  2: [
    'Name the 5 elements of the CLEAR Framework and what each stands for.',
    'What is the difference between output templating and multi-shot prompting? When would you use each?',
    'Describe a situation where you would choose a reasoning model over the default model.',
  ],
  3: [
    'What is the difference between a project and a skill? When would you use each?',
    'Describe the six components of a skill definition — the skill anatomy.',
    'Why does adding knowledge to a skill change the quality of its output? Give a specific example from your work.',
  ],
  4: [
    'Describe the five levels of the Autonomy Spectrum. Which level is appropriate for most professional work, and why?',
    'What are the six components of the agent governance framework? Why is each one necessary in a regulated environment?',
    'What is the difference between a guardrail test and a normal test? Why is the guardrail test the most important?',
  ],
  5: [
    'Name one AI feature built into your tool stack and describe a task you used it for.',
    'What is the difference between a custom skill or agent (Sessions 3-4) and a functional AI feature built into a tool (Session 5)?',
    'Describe a workflow where you would combine a custom skill with a functional AI feature.',
  ],
  6: [
    'Describe the workflow you designed. What problem does it solve and what value does it provide?',
    'Where did you place human checkpoints in your workflow, and why are they necessary?',
    'What was the most important thing you learned about integrating AI into professional workflows?',
  ],
};
```

---

## PHASE 6: UPDATE ALL_SESSION_CONTENT AND EXPORTS

**File:** `src/data/trainingContent.ts`

### 6.1 Update the Master Index

Replace the `ALL_SESSION_CONTENT` export with:

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

### 6.2 Verify Export Order

The exports in the file should appear in this order:
1. `SESSION_1_CONTENT`
2. `SESSION_2_CONTENT`
3. `SESSION_3_CONTENT` (new — Skills & Projects)
4. `SESSION_4_CONTENT` (new — Agents & Autonomy)
5. `SESSION_5_CONTENT` (formerly Session 4 — AI in Your Everyday Tools)
6. `SESSION_6_CONTENT` (formerly Session 5 — Build Your Frankenstein)
7. `KNOWLEDGE_CHECKS` (updated)
8. `ELECTIVE_PATHS` (unchanged)
9. `ALL_SESSION_CONTENT` (updated)

---

## PHASE 7: PLATFORM TERMINOLOGY SYSTEM

**File:** `src/data/trainingContent.ts` (new export) and `src/data/industryConfigs.ts` (update)

### 7.1 Platform Terminology Mapping

Add a new export to `trainingContent.ts` after the `ALL_SESSION_CONTENT` export:

```typescript
export const PLATFORM_TERMINOLOGY: Record<string, Record<string, string>> = {
  default: {
    project: 'project',
    skill: 'skill',
    agent: 'agent',
    customization: 'customization',
    projectDescription: 'A persistent workspace with instructions, knowledge files, and conversation history',
    skillDescription: 'A reusable procedure for a specific type of task',
    createProject: 'create a project',
    createSkill: 'build a skill',
  },
  claude: {
    project: 'Project',
    skill: 'Skill',
    agent: 'agent',
    customization: 'customization',
    projectDescription: 'A Claude Project with custom instructions, uploaded knowledge files, and persistent conversation history',
    skillDescription: 'A Claude Skill — a reusable expertise package with a SKILL.md definition file',
    createProject: 'create a Claude Project',
    createSkill: 'build a Claude Skill',
  },
  chatgpt: {
    project: 'Custom GPT',
    skill: 'Skill',
    agent: 'agent',
    customization: 'customization',
    projectDescription: 'A Custom GPT with instructions, uploaded knowledge files, and configured capabilities',
    skillDescription: 'A ChatGPT Skill — a modular ability that can be invoked or auto-triggered',
    createProject: 'create a Custom GPT',
    createSkill: 'build a ChatGPT Skill',
  },
  copilot: {
    project: 'Copilot Studio configuration',
    skill: 'skill',
    agent: 'Copilot Agent',
    customization: 'configuration',
    projectDescription: 'A Copilot Studio configuration with instructions, connected data sources, and workflow logic',
    skillDescription: 'A reusable skill component inside Copilot Studio',
    createProject: 'create a Copilot Studio configuration',
    createSkill: 'build a Copilot Studio skill',
  },
  gemini: {
    project: 'Gem',
    skill: 'Gem instruction set',
    agent: 'agent',
    customization: 'customization',
    projectDescription: 'A Gemini Gem with custom instructions and uploaded reference files',
    skillDescription: 'The instruction set and configuration inside a Gemini Gem',
    createProject: 'create a Gemini Gem',
    createSkill: 'configure a Gem\'s instruction set',
  },
};
```

### 7.2 Usage in UI

The `PLATFORM_TERMINOLOGY` map is keyed by the `platform` column in the `organizations` table. Components rendering Session 3-4 content should use this map to substitute platform-native terms where they appear in module content. The curriculum content in `trainingContent.ts` uses generic terms ("project," "skill") as the default. The UI layer substitutes the platform-native term at render time.

**Implementation note for Claude Code:** The actual UI substitution logic (component updates) is specified in Phase 10. Phase 7 only defines the data.

---

## PHASE 8: DATABASE MIGRATIONS

**Directory:** `supabase/migrations/`

### 8.1 Migration: Add Session 6 Tracking

Create a new migration that:

1. Adds `session_6_progress` JSONB column to `training_progress` table (default `'{}'::jsonb`)
2. Adds `session_6_completed` boolean column to `training_progress` table (default `false`)
3. Adds `session_6_completed_at` timestamp column to `training_progress` table (default `null`)

### 8.2 Migration: Add Skill-Specific Progress Flags

Create a new migration that:

1. Adds `session_3_skill_created` boolean column to `training_progress` table (default `false`)
2. Renames `session_3_agent_deployed` to `session_4_agent_deployed` (or adds `session_4_agent_deployed` and preserves the old column for backward compatibility — determine safest approach)
3. Updates the Agents zone unlock logic to check `session_4_agent_deployed` instead of `session_3_agent_deployed`

### 8.3 Migration: Update Session Unlock Logic

The session unlock cascade must be updated:

- Session 3 unlocks after Session 2 completion (unchanged)
- Session 4 unlocks after Session 3 completion (NEW — currently Session 4 unlocks after Session 3)
- Session 5 unlocks after Session 4 completion (was: Session 4 unlocks after Session 3)
- Session 6 unlocks after Session 5 completion (NEW)

Update any database functions, RPC calls, or RLS policies that enforce session progression.

### 8.4 User Migration

No active users with progress data exist. No data migration is required. The new session structure can be deployed cleanly without remapping any existing progress records.

---

## PHASE 9: EDGE FUNCTION UPDATES

### 9.1 Update `submission_review` Edge Function

**File:** `supabase/functions/submission_review/index.ts`

Add module-specific rubrics for new Sessions 3-4 modules. These rubrics follow the same 3-level structure (Developing, Proficient, Advanced) as existing rubrics.

**New rubrics needed:**

| Module | Rubric Focus |
|--------|-------------|
| 3-3 (Building Your First Skill) | Identity (15%), Trigger definition (10%), Procedure completeness (25%), Standards specificity (15%), Guardrails testability (25%), Output format clarity (10%) |
| 3-4 (Adding Knowledge) | Knowledge source selection (30%), Integration quality — does output reference knowledge (40%), Before/after comparison articulation (30%) |
| 3-5 (Skills + Projects) | Combination quality (30%), Reusability test — same skill, different project (40%), Configuration roadmap clarity (30%) |
| 3-6 (Sharing and Scaling) | Peer feedback quality (30%), Skill wish list specificity (40%), Domain expertise identification (30%) |
| 4-2 (Agent Design) | Six anatomy components completeness (25%), Guardrail testability (25%), Escalation path specificity (20%), Audit trail completeness (15%), Trigger definition clarity (15%) |
| 4-3 (Build Agent) | Normal test pass (20%), Edge test handling (20%), Out-of-scope refusal (25%), Guardrail hold (25%), Iteration evidence (10%) |
| 4-5 (Governance) | Six governance components covered (30%), Audit trail specificity (25%), Kill switch definition (15%), Approval chain identification (15%), Review cadence definition (15%) |

**Rubrics for non-exercise modules (3-1, 3-7, 4-1, 4-4, 4-6, 4-7)** should evaluate against the `successCriteria` arrays in the module definitions — same as existing non-rubric modules.

**Remove or archive existing rubrics for old modules 3-3, 3-4, 3-5** that referenced agent-building criteria. These are replaced by the new rubrics above.

### 9.2 Update `trainer_chat` Edge Function

**File:** `supabase/functions/trainer_chat/index.ts`

Update Andrea's system prompt context for Sessions 3-4:

**Session 3 context:**
- Andrea operates at Tier 3: Peer
- Topic context: skills and projects — reusable AI configurations, digital SOPs, persistent workspaces
- Coaching behavior: Socratic questioning, challenges vague thinking, pushes for specificity in skill definitions and project instructions
- Key vocabulary: skill, project, procedure, standards, guardrails, knowledge, reusability, persistence
- Do NOT use the word "agent" in Session 3 — that concept is introduced in Session 4

**Session 4 context:**
- Andrea operates at Tier 4: Advisor
- Topic context: agents and autonomy — autonomous AI systems, governance, compliance, risk management
- Coaching behavior: strategic consulting perspective, demands rigor on guardrails, celebrates governance thinking
- Key vocabulary: agent, autonomy, governance, guardrails, escalation, audit trail, kill switch, compliance
- Andrea should reference skills and projects from Session 3 as the building blocks for agents

**Session 5 context (was Session 4):**
- Andrea operates at Tier 4: Advisor (unchanged)
- Update references from "Session 3" to "Sessions 3-4" when referring to skills/agents

**Session 6 context (was Session 5):**
- Andrea operates at Tier 4: Advisor (unchanged)
- Update references from "Session 3" to "Sessions 3-4" and "Session 4" to "Session 5"

### 9.3 Update `industryContext.ts`

**File:** `supabase/functions/_shared/industryContext.ts`

Add industry-specific context for Sessions 3-4:

**Session 3 banking context:** Skills as digital SOPs. Examples: credit memo preparation skills, compliance review skills, risk assessment skills. Banking professionals already think in terms of standardized procedures — skills map directly to that mental model.

**Session 4 banking context:** Agent governance in regulated environments. Audit trail requirements for regulatory examination. Compliance implications of autonomous decision-making. The governance framework maps to existing banking controls (change management, model risk management, third-party risk management).

---

## PHASE 10: COMPONENT AND ROUTING UPDATES

### 10.1 Update Routing

**File:** `src/App.tsx`

Ensure routes handle Sessions 1-6:
- `/training/3` renders new Session 3 (Skills & Projects)
- `/training/4` renders new Session 4 (Agents & Autonomy)
- `/training/5` renders Session 5 (AI in Your Everyday Tools, formerly Session 4)
- `/training/6` renders Session 6 (Build Your Frankenstein, formerly Session 5)

### 10.2 Update Dashboard

**File:** `src/pages/Dashboard.tsx`

- Session progress cards show 6 sessions instead of 5
- Session titles and descriptions reflect new content
- Journey visualization updated to include all 6 sessions

### 10.3 Update Agents Zone Unlock

**Files:** Any component that checks `session_3_agent_deployed`

- Change unlock condition from `session_3_agent_deployed` to `session_4_agent_deployed`
- The Agents zone should unlock after Session 4, Module 4-6 (Agent Deployment and Sharing) is completed

### 10.4 Update Admin Dashboard

**File:** `src/pages/AdminDashboard.tsx`

- Progress tracking shows 6 sessions
- Reporting breakdowns include Session 3 (skills) and Session 4 (agents) separately
- C-suite KPIs updated to reflect new session structure

### 10.5 Update Certificate Generation

**File:** `src/components/training/CertificateGenerator.tsx`

- Session completion certificates reference correct session titles
- Session 3 certificate: "Skills & Projects"
- Session 4 certificate: "Agents & Autonomy"
- Session 5 certificate: "AI in Your Everyday Tools"
- Session 6 certificate: "Designing Your AI Workflow"

### 10.6 Update Progress Computation

**File:** `src/utils/computeProgress.ts`

- Overall progress computation includes 6 sessions (weighted by module count)
- Session-level progress calculation unchanged (completedModules / totalModules)

### 10.7 Update ModuleListSidebar

**File:** `src/components/training/ModuleListSidebar.tsx`

- Since ALL modules are now gate modules, the locking logic simplifies: every module blocks progression to the next until it is passed
- Verify that this does not create issues with the existing locking algorithm (which checks for prior gate modules — if all modules are gates, every module is gated by the one before it)

### 10.8 Platform Terminology Rendering

**Files:** `src/pages/TrainingWorkspace.tsx` and any components that render Session 3-4 module content

- Import `PLATFORM_TERMINOLOGY` from `trainingContent.ts`
- Read the user's organization `platform` value from context
- When rendering module content strings that contain generic terms ("project," "skill"), substitute the platform-native term from `PLATFORM_TERMINOLOGY[platform]`
- The substitution should be case-preserving and context-aware — only substitute standalone terms, not partial word matches

---

## PHASE 11: VERIFICATION PLAN

After all phases are complete, verify the following:

### 11.1 Data Integrity

- [ ] `trainingContent.ts` compiles without TypeScript errors
- [ ] All 6 sessions are present in `ALL_SESSION_CONTENT`
- [ ] All module IDs are unique across all sessions
- [ ] All modules have `isGateModule: true`
- [ ] All modules have `successCriteria` with `primary` and `supporting` arrays
- [ ] `KNOWLEDGE_CHECKS` has entries for sessions 1-6
- [ ] `PLATFORM_TERMINOLOGY` has entries for all supported platforms

### 11.2 Content Coherence

- [ ] Session 3 never uses the word "agent" (that is Session 4 vocabulary)
- [ ] Session 4 references skills and projects from Session 3 as building blocks
- [ ] Session 5 (formerly Session 4) references "Sessions 3-4" instead of "Session 3" when referring to custom AI
- [ ] Session 6 (formerly Session 5) references the correct session numbers throughout
- [ ] No orphaned references to old session numbers exist anywhere in the file

### 11.3 Progression Logic

- [ ] Session unlock cascade: 1 -> 2 -> 3 -> 4 -> 5 -> 6
- [ ] Gate module logic: every module blocks the next (since all are gates)
- [ ] Agents zone unlocks after `session_4_agent_deployed` (not the old `session_3_agent_deployed`)
- [ ] Certificate titles match new session names

### 11.4 Andrea Coaching Tiers

- [ ] Session 3: Tier 3 (Peer) — Socratic, challenges vague thinking
- [ ] Session 4: Tier 4 (Advisor) — strategic, demands governance rigor
- [ ] Session 5: Tier 4 (Advisor) — unchanged from old Session 4
- [ ] Session 6: Tier 4 (Advisor) — unchanged from old Session 5

### 11.5 Edge Functions

- [ ] `submission_review` has rubrics for new modules 3-3, 3-4, 3-5, 3-6, 4-2, 4-3, 4-5
- [ ] Old module 3-3 agent-building rubric is removed or archived
- [ ] `trainer_chat` context is updated for Sessions 3-6
- [ ] `industryContext.ts` has banking context for Sessions 3-4

### 11.6 End-to-End Walkthrough

- [ ] New user can progress through Session 3 (Skills & Projects) — all 7 modules
- [ ] New user can progress through Session 4 (Agents & Autonomy) — all 7 modules
- [ ] Session 4 completion unlocks Session 5
- [ ] Session 5 completion unlocks Session 6
- [ ] Agent deployment in Session 4 Module 4-6 unlocks the Agents zone

---

## APPENDIX A: GOVERNING PRINCIPLES COMPLIANCE

This restructure was verified against all 8 governing principles from `SMILE_Curriculum_Design_v1.md`:

| Principle | Compliance |
|-----------|-----------|
| 1. Everything must work | Session 3 exercises produce visible, immediate results. Session 4 testing framework ensures users know when things work and when they do not. |
| 2. Confidence before complexity | Skills/projects (Session 3) are simpler and lower-risk than agents (Session 4). Teaching them first builds confidence. |
| 3. Conversation-first computing | Sessions 1-2 establish this. Session 3 extends it — skills and projects ARE configurations for better conversations. |
| 4. Role-specific from the start | Department scenarios in Sessions 3-4 reference banking-specific use cases. |
| 5. Flipped Interaction Pattern is a through-line | Applied in Session 3: "Let the AI ask you questions about your skill requirements before you write the definition." Should be reinforced in Module 3-3 practice task hints. |
| 6. Output templating grows across sessions | Skills inherently include output format specification (part of the skill anatomy). |
| 7. Each sandbox is more open than the last | Session 3 sandbox: second skill, multi-skill project. Session 4 sandbox: expanded agent, full integration. |
| 8. Platform configurable, curriculum is not | Core curriculum uses generic terms. Platform-native terminology is edge layer via `PLATFORM_TERMINOLOGY` map. |

---

## APPENDIX B: FILE IMPACT SUMMARY

| File | Phase | Change Type |
|------|-------|-------------|
| `src/data/trainingContent.ts` | 1-7 | Replace Session 3, create Session 4, cascade Sessions 4-5 to 5-6, update knowledge checks, update exports, add platform terminology |
| `supabase/migrations/` (new files) | 8 | Add session 6 columns, add skill/agent progress flags, update unlock logic |
| `supabase/functions/submission_review/index.ts` | 9 | Add rubrics for new modules, remove/archive old Session 3 rubrics |
| `supabase/functions/trainer_chat/index.ts` | 9 | Update Andrea context for Sessions 3-6 |
| `supabase/functions/_shared/industryContext.ts` | 9 | Add Session 3-4 banking context |
| `src/App.tsx` | 10 | Ensure routes handle Sessions 1-6 |
| `src/pages/Dashboard.tsx` | 10 | 6-session progress display |
| `src/pages/AdminDashboard.tsx` | 10 | 6-session reporting |
| `src/pages/TrainingWorkspace.tsx` | 10 | Platform terminology rendering |
| `src/utils/computeProgress.ts` | 10 | 6-session progress computation |
| `src/components/training/ModuleListSidebar.tsx` | 10 | Verify all-gate-module locking logic |
| `src/components/training/CertificateGenerator.tsx` | 10 | Updated session titles |
| Components checking `session_3_agent_deployed` | 10 | Change to `session_4_agent_deployed` |
