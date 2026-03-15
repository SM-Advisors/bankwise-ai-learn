// ─── SMILE Curriculum v2.0 — Curriculum Design Rewrite ──────────────────────
// Source: SMILE_Curriculum_Design_v1.md (Rivers Meeting, March 7, 2026)
// Governing principles: everything works, confidence before complexity,
// conversation-first computing, role-specific from the start.

export interface ModuleContent {
  id: string;
  title: string;
  type: 'document' | 'example' | 'exercise' | 'video' | 'sandbox';
  description: string;
  estimatedTime: string;
  videoUrl?: string;
  learningObjectives: string[];
  learningOutcome: string;
  isGateModule?: boolean;
  content: {
    overview: string;
    keyPoints: string[];
    examples?: {
      title: string;
      good?: string;
      bad?: string;
      explanation: string;
    }[];
    steps?: string[];
    practiceTask: {
      title: string;
      instructions: string;
      scenario: string;
      hints: string[];
      successCriteria: string[];
      departmentScenarios?: Record<string, { scenario: string; hints: string[] }>;
    };
  };
}

export interface SessionContent {
  id: number;
  title: string;
  description: string;
  modules: ModuleContent[];
}

// ═════════════════════════════════════════════════════════════════════════════
// SESSION 1: FOUNDATION & EARLY WINS
// Andrea Tier: Hand-Holding — detailed guidance, celebration of wins
// Design constraint: Nothing should fail in a way that makes the user feel
// like they did something wrong.
// ═════════════════════════════════════════════════════════════════════════════

export const SESSION_1_CONTENT: SessionContent = {
  id: 1,
  title: 'Foundation & Early Wins',
  description: 'Build confidence with AI through conversation-first computing — every exercise works, every win is real',
  modules: [
    // ─── Module 1-1: Personalization ──────────────────────────────────────
    {
      id: '1-1',
      title: 'Personalization',
      type: 'exercise',
      description: 'Shape the system around who you are and how you work — before you do anything else',
      estimatedTime: '10 min',
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
            bad: '"I work at a bank."',
            good: '"I\'m a credit analyst who reviews commercial loan applications for a $2B community bank. I evaluate financials for CRE, C&I, and construction loans, and present findings to our credit committee."',
            explanation: 'The specific version gives Andrea enough context to tailor every response — she\'ll reference the right regulatory frameworks, use appropriate terminology, and frame advice for your actual workflow.',
          },
          {
            title: 'Custom Instructions — Poor vs. Well-Crafted',
            bad: '"Be helpful."',
            good: '"Always relate examples to banking and lending. When explaining complex concepts, use analogies. Include regulatory references (OCC, FDIC) when relevant. Format action items as numbered lists."',
            explanation: 'Generic instructions add nothing — the AI is already trying to be helpful. Specific instructions shape how Andrea communicates, what she references, and how she structures output for your daily work.',
          },
        ],
        practiceTask: {
          title: 'Set Up Your AI Profile',
          instructions: 'Configure your professional context: role, department, employer type, and preferences. Then ask the AI a simple work question and observe how the response reflects your context.',
          scenario: 'You are setting up your AI profile for the first time. Enter your role, department, and the type of institution you work at. Set your preferred tone (formal, conversational, or direct) and detail level (brief, standard, or thorough). Once configured, ask: "What are the top three things I should be thinking about this quarter?" — and notice how the response reflects your specific context.',
          hints: [
            'Be specific about your role — "Loan Officer" is better than "Banking Professional"',
            'Your department context helps the AI choose relevant examples and terminology',
            'Try changing one preference (like tone) and re-asking the same question to see the difference',
          ],
          successCriteria: [
            'Profile includes specific role, department, and employer context',
            'At least one preference is configured (tone, detail level, or output style)',
          ],
        },
      },
    },

    // ─── Module 1-2: Interface Orientation ────────────────────────────────
    {
      id: '1-2',
      title: 'Interface Orientation',
      type: 'document',
      description: 'Learn the basics of your AI interface — just enough to begin, not a feature walkthrough',
      estimatedTime: '8 min',
      learningObjectives: [
        'Identify the core interface elements: conversation area, input field, attachments, and new thread control',
        'Start a new conversation and understand when to start fresh vs. continue',
        'Know where to find your conversation history',
      ],
      learningOutcome: 'After this module, you can navigate the AI interface confidently enough to start your first real interaction without feeling lost.',
      content: {
        overview: 'This is not a feature walkthrough. You do not need to know every button and setting right now. This module covers the three things you need to know to get started: where to type, how to share a file, and how to start over. Everything else comes later, when you need it.',
        keyPoints: [
          'The conversation area is where you and the AI exchange messages — it remembers context within a thread',
          'Starting a new thread resets context — useful when switching tasks, not when refining one',
          'Attaching a file lets you share documents, spreadsheets, or notes for the AI to work with',
          'You do not need to understand models, tools, or settings right now — those are Session 2 topics',
        ],
        practiceTask: {
          title: 'Navigate the Basics',
          instructions: 'Start a conversation, send a message, and start a new thread. That is the entire exercise.',
          scenario: 'Open your AI interface. Send a simple message like "What can you help me with today?" Read the response. Then start a new conversation thread. Notice that the new thread has no memory of the previous one. That distinction — same thread vs. new thread — is the most important interface concept in this module.',
          hints: [
            'Look for a "New Chat" or "+" button to start a fresh thread',
            'The conversation history panel (usually on the left) shows your past threads',
            'Do not worry about settings or model options right now — you will learn those in Session 2',
          ],
          successCriteria: [
            'User has sent at least one message and received a response',
            'User has started a new conversation thread',
          ],
        },
      },
    },

    // ─── Module 1-3: Basic Interaction ────────────────────────────────────
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
        'Use the Flipped Interaction Pattern: let the AI ask you questions instead of crafting the perfect prompt',
        'Use the Outline Expander technique to guide the AI with a rough structure and let it fill in the details',
      ],
      learningOutcome: 'After this module, you can have a productive back-and-forth conversation with AI — starting rough, recognizing gaps, and refining until the output is useful.',
      content: {
        overview: 'This is not prompting. This is a conversation. You describe what you need the way you would describe it to a smart colleague who just joined your team. They are capable but they do not know your specific work yet. Your job is to give them enough context to be helpful — and then keep the conversation going when they get something wrong or miss something.\n\nThe most powerful move you will learn here is the Flipped Interaction Pattern: instead of trying to craft the perfect ask, you let the AI ask you questions first. This works because the AI often knows what information it needs better than you know what to provide.',
        keyPoints: [
          'Start messy — take real work (an old email, notes, a document) and hand it over with a plain description of what you want',
          'The first response is never the final output — it is a starting point for conversation',
          'When something is off, say what is off: "That is too formal" or "You assumed X but actually Y"',
          'The Flipped Interaction Pattern: "Before you give me X, ask me three questions that will help you do this better"',
          'The Outline Expander: give the AI a rough outline and let it fill in the details — then iterate on the structure together',
        ],
        steps: [
          'Dirty paste: take something real from your work and hand it to the AI with a plain description of what you want',
          'Recognize the response: is it useful? What is missing? What did the AI assume?',
          'Follow up: ask for what is missing, correct any wrong assumptions, and ask again',
          'Try the Flipped Interaction Pattern: ask the AI to ask you questions before it starts working',
          'Try the Outline Expander: give a rough outline of what you want and let the AI fill it in',
        ],
        examples: [
          {
            title: 'The Dirty Paste',
            good: '"Here are my notes from yesterday\'s loan committee meeting [paste notes]. Can you turn these into a structured summary I can send to the team? Include action items at the end."',
            explanation: 'No special formatting. No framework. Just real work handed over with a clear description of what you want back. This is how most productive AI interactions start.',
          },
          {
            title: 'The Flipped Interaction Pattern',
            good: '"I need to write a memo about our Q1 lending performance for the board. Before you start writing, ask me five questions that will help you write a better memo."',
            explanation: 'Instead of guessing what context the AI needs, you let it tell you. The AI might ask about your audience, the key metrics, what changed from last quarter, and what tone you want. This produces a better result with less guesswork.',
          },
          {
            title: 'The Outline Expander',
            good: '"I want a training outline for new loan officers. Here is my rough structure:\n1. Introduction to our lending philosophy\n2. Credit analysis basics\n3. Documentation requirements\n4. Compliance essentials\n5. First 30 days checklist\n\nExpand each section into 3-5 bullet points with the key topics to cover."',
            explanation: 'You provide the skeleton. The AI fills in the substance. You iterate on the result. This teaches you that you control the shape of the output — the AI fills in the details.',
          },
        ],
        practiceTask: {
          title: 'Your First Real Conversation',
          instructions: 'Take a real piece of work — notes, an email, a document — and have a back-and-forth conversation with the AI about it. Use at least one of the three techniques: dirty paste, Flipped Interaction Pattern, or Outline Expander.',
          scenario: 'Pick something real from your work this week: meeting notes that need summarizing, an email that needs drafting, a process that needs documenting, or a question you have been meaning to research. Hand it to the AI with a plain description of what you want. Evaluate the first response. Then follow up at least twice to refine the result. Try using the Flipped Interaction Pattern on your second or third exchange.',
          hints: [
            'Start with something low-stakes — notes, a draft, a question — not something mission-critical',
            'If the first response is off, say exactly what is wrong rather than rephrasing your whole ask',
            'Try: "Before you revise, ask me two questions about what I need"',
            'The goal is a useful back-and-forth, not a perfect first response',
          ],
          successCriteria: [
            'User pasted or described a work-related task (not a test prompt)',
            'User used the Dirty Paste pattern — handed over real or realistic work material as their starting point',
            'User evaluated the first response and identified at least one gap or assumption',
            'User followed up at least twice to refine the output',
            'User attempted the Flipped Interaction Pattern or Outline Expander at least once',
          ],
          departmentScenarios: {
            'Commercial Lending': {
              scenario: 'You have rough notes from a recent borrower site visit. Hand them to the AI and ask it to create a structured site visit summary you can attach to the credit file. Use the Flipped Interaction Pattern to help the AI understand your documentation standards.',
              hints: [
                'Paste your actual notes (or realistic ones) — messy is fine',
                'Ask the AI to include sections for: business observations, financial discussion points, collateral condition, and follow-up items',
                'Try: "Before you write this summary, ask me what our credit committee expects to see in a site visit report"',
              ],
            },
            'Retail Banking': {
              scenario: 'You need to draft a customer communication about a new product or service change. Hand the AI your internal announcement or bullet points and ask it to create a customer-facing version. Use the Outline Expander to define the structure first.',
              hints: [
                'Start with the internal version and ask for a customer-friendly rewrite',
                'Give an outline: greeting, what is changing, what it means for them, what they need to do, who to contact',
                'Try: "Before you write this, ask me three questions about our customer base"',
              ],
            },
            'Compliance': {
              scenario: 'You have a regulatory update or guidance document that needs to be summarized for the team. Paste the relevant section and ask the AI to create a plain-language summary with action items. Use the Flipped Interaction Pattern.',
              hints: [
                'Paste the actual regulatory text — the AI handles dense language well',
                'Ask for a summary that separates "what changed" from "what we need to do"',
                'Try: "Before you summarize, ask me what our team already knows about this topic"',
              ],
            },
            'Risk Management': {
              scenario: 'You need to document a risk assessment finding or create a risk summary for a committee. Hand the AI your notes and ask it to structure them into a formal risk assessment format.',
              hints: [
                'Include the risk category, current controls, and any gaps you have identified',
                'Ask for a format that includes: risk description, likelihood, impact, mitigating controls, and residual risk',
                'Try: "Before you format this, ask me about our risk appetite framework"',
              ],
            },
          },
        },
      },
    },

    // ─── Module 1-4: Your First Win ───────────────────────────────────────
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
            good: 'A Commercial Lending officer drafts a credit memo summary from their existing notes and loan data. The output is structured, uses the right terminology, and could be pasted into their actual credit file with minor edits.\n\nA Compliance officer takes a regulatory update and produces a one-page summary with action items that they email to their team that afternoon.\n\nA Retail Banking manager creates a coaching template for teller performance conversations that they use in their next one-on-one.',
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
          successCriteria: [
            'User selected a task directly relevant to their actual work',
            'User produced an output that could be used with minimal revision — includes all required sections, uses appropriate professional terminology, and addresses the stated audience',
            'Output reflects the user\'s professional context (role, department, terminology)',
            'User iterated at least once to refine the output before calling it done',
          ],
          departmentScenarios: {
            'Commercial Lending': {
              scenario: 'Draft a credit memo summary, borrower outreach letter, or loan committee talking points from your existing notes or data. Produce something you could paste into your actual workflow today.',
              hints: [
                'Start with your raw notes or data and ask for a structured output',
                'Specify the audience: credit committee, borrower, internal team',
                'Ask the AI to flag any assumptions it made so you can verify them',
              ],
            },
            'Retail Banking': {
              scenario: 'Create a customer communication, branch meeting agenda, coaching template, or product comparison sheet. Produce something you would use in your next interaction with your team or customers.',
              hints: [
                'If writing for customers, specify the tone and reading level',
                'For internal documents, mention your bank\'s typical format or style',
                'Ask the AI to include a section you might forget (like next steps or FAQs)',
              ],
            },
            'Compliance': {
              scenario: 'Summarize a regulatory update, draft a policy section, create a compliance checklist, or produce training talking points for staff. Make it something your team actually needs this week.',
              hints: [
                'Regulatory language is dense — ask the AI to produce a plain-language version alongside the formal one',
                'Include specific regulation references so the output is traceable',
                'Ask for action items separated from informational content',
              ],
            },
            'Risk Management': {
              scenario: 'Structure a risk assessment, draft a findings summary, create a risk register entry, or produce a committee presentation outline. Use real data or realistic scenarios.',
              hints: [
                'Include the risk framework your institution uses (if applicable)',
                'Ask for a format that separates inherent risk from residual risk',
                'Request that the AI flag areas where it is making assumptions vs. using your data',
              ],
            },
            'Operations': {
              scenario: 'Document a process, create a procedure checklist, draft an SOP section, or produce a workflow description. Pick something your team references regularly.',
              hints: [
                'Start with a verbal description of the process and let the AI structure it',
                'Ask for numbered steps with decision points called out',
                'Include exception handling: what happens when the normal process does not apply',
              ],
            },
          },
        },
      },
    },

    // ─── Module 1-5: Iteration ────────────────────────────────────────────
    {
      id: '1-5',
      title: 'Iteration',
      type: 'exercise',
      description: 'Learn that value comes from refining the conversation — not from getting it right the first time',
      estimatedTime: '15 min',
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
          scenario: 'Return to the work product you created in Module 4. Now make it harder:\n\n1. Add a constraint: "Now make this compliant with [specific regulation]" or "Adapt this for a board-level audience"\n2. Change the format: "Convert this to a table" or "Turn this into talking points for a 5-minute presentation"\n3. Layer in complexity: "Now add a risk analysis section" or "Include counterarguments"\n\nDo at least three rounds of refinement. Notice how each round builds on what came before.',
          hints: [
            'You do not need to start a new conversation — continue from where you left off in Module 4',
            'Try changing the audience: same content, but for your CEO, your team, or a regulator',
            'Ask for a format change mid-conversation: bullets to table, memo to email, summary to presentation',
            'If you get stuck, ask the AI: "What else could I add to make this more useful for my work?"',
          ],
          successCriteria: [
            'User completed at least three rounds of refinement on their Module 4 output',
            'At least one round changed the output format (not just content)',
            'User can describe how the final version is better than the first version',
            'User attempted reshaping mid-conversation rather than starting over',
          ],
        },
      },
    },

    // ─── Module 1-6: Self-Review Loops ────────────────────────────────────
    {
      id: '1-6',
      title: 'Self-Review Loops',
      type: 'exercise',
      description: 'Prompt the AI to critique, score, and improve its own output — before you act on it',
      estimatedTime: '15 min',
      learningObjectives: [
        'Ask the AI to review its own output against stated criteria',
        'Compare an original output with its self-revised version and evaluate the improvement',
        'Make the final judgment yourself — the AI\'s self-critique is input, not the answer',
        'Recognize that the critique step itself is a reusable template across different types of work',
      ],
      learningOutcome: 'After this module, you can prompt the AI to critique and revise its own work before you review it — producing higher-quality output without starting over.',
      content: {
        overview: 'After iterating, you have a natural question you have not named yet: "How do I know when what I have is actually good?" Self-review loops answer that question with a technique instead of a checklist. You ask the AI to score its own output against criteria you define, identify weaknesses, and produce a revised version. Then you — not the AI — decide whether the revision is actually better.\n\nThis replaces the instinct to paste the output into a new conversation and start fresh. Self-review loops keep the context and compound it.',
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
            good: 'Step 1: "Draft a customer notification about our new mobile deposit limits."\n\nStep 2: "Review what you just wrote against these three criteria: (1) Is it clear enough for a customer with no banking background? (2) Does it explain what they need to do? (3) Is the tone reassuring, not alarming?"\n\nStep 3: "Based on your review, produce a revised version that addresses any weaknesses you identified."\n\nStep 4: Compare both versions. The user notices the revision simplified the language and added a clear call-to-action, but made the tone too casual — so they take the structure of the revision but restore the professional tone from the original.',
            explanation: 'The user did not blindly accept the revision. They used the AI\'s critique as input, compared both versions, and made a judgment call. That is the skill — not outsourcing quality control, but using the AI to surface issues you then decide how to handle.',
          },
        ],
        practiceTask: {
          title: 'Critique and Revise',
          instructions: 'Take any output from this session (Modules 3, 4, or 5) and run a self-review loop. Define your criteria, ask for a critique, request a revision, and compare.',
          scenario: 'Pick the best output you have generated so far in this session. Now:\n\n1. Define 2-3 criteria that matter for this specific output (e.g., accuracy, clarity, appropriate tone, completeness, actionability)\n2. Ask the AI: "Review this output against these criteria and identify what is weak or missing"\n3. Ask: "Now produce a revised version that addresses your critique"\n4. Compare the original and the revision — what improved? What did the AI miss? What would you change yourself?',
          hints: [
            'Be specific with your criteria — "Is it good?" is too vague; "Is it clear enough for someone with no context?" is useful',
            'If the AI\'s critique seems off, push back: "I disagree with point 2 — here is why"',
            'The revision is not always better — sometimes the original was fine and the AI over-corrected',
            'Notice that the critique format (criteria → assessment → revision) works for any type of output',
          ],
          successCriteria: [
            'User defined at least 2 specific review criteria relevant to their output',
            'User requested a self-critique from the AI using those criteria',
            'User placed original and revised versions side-by-side for comparison',
            'User made an independent judgment about which version is better and why',
          ],
        },
      },
    },

    // ─── Module 1-7: Sandbox ──────────────────────────────────────────────
    {
      id: '1-7',
      title: 'Sandbox',
      type: 'sandbox',
      description: 'Free exploration — apply the patterns from this session to anything you want',
      estimatedTime: '15 min',
      learningObjectives: [
        'Apply conversation-first patterns (dirty paste, Flipped Interaction, Outline Expander, self-review) independently',
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
          scenario: 'This is your free-form practice space. Use it however helps you learn best. Some ideas:\n\n- Take a task you have been putting off and use AI to get a first draft done\n- Try the Flipped Interaction Pattern on a complex question from your work\n- Use the Outline Expander on a document you need to write\n- Run a self-review loop on something you produced earlier\n- Practice reshaping output: take one result and convert it into three different formats\n\nOr bring your own task — anything goes.',
          hints: [
            'If you are not sure what to try, ask the AI: "Based on my role as a [role], what is a task I could practice right now?"',
            'Try combining techniques: dirty paste → Flipped Interaction → self-review loop',
            'Practice anything you did not feel fully confident about in earlier modules',
            'This is a good time to explore — there is no grading here',
          ],
          successCriteria: [
            'User initiated at least one task independently',
            'User applied at least one technique from this session (dirty paste, Flipped Interaction, Outline Expander, iteration, or self-review)',
            'User completed a meaningful exchange (not just a single message)',
          ],
        },
      },
    },
  ],
};

// ═════════════════════════════════════════════════════════════════════════════
// SESSION 2: STRUCTURED INTERACTION, MODELS & TOOLS
// Andrea Tier: Collaborative — guided discovery, probing questions, less directive
// Design constraint: Everything must still work. More complexity, no unpredictability.
// ═════════════════════════════════════════════════════════════════════════════

export const SESSION_2_CONTENT: SessionContent = {
  id: 2,
  title: 'Structured Interaction, Models & Tools',
  description: 'Move from casual conversation to professional-grade AI use — shape, direct, and aim your interactions intentionally',
  modules: [
    // ─── Module 2-1: Structured Prompting (CLEAR Framework) ───────────────
    {
      id: '2-1',
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
            bad: '"Write me a memo about our lending performance."',
            good: '"Context: You are a senior credit analyst at a $500M community bank. Length: One-page executive summary with a data table. Examples: Our previous quarterly memo used bullet points for key metrics and a narrative paragraph for outlook. Audience: Board of directors — they want high-level trends, not granular data. Requirements: Include loan growth YoY, delinquency rate trend, CRE concentration ratio, and a 1-paragraph outlook."',
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
          successCriteria: [
            'User wrote both a casual and CLEAR-structured version of the same ask',
            'User compared the two outputs and articulated the difference',
            'User identified at least one CLEAR element that had the biggest impact on quality',
            'User can explain when they would use CLEAR vs. casual conversation',
          ],
        },
      },
    },

    // ─── Module 2-2: Output Templating (Explicit) ─────────────────────────
    {
      id: '2-2',
      title: 'Output Templating',
      type: 'exercise',
      description: 'Deliberately define the shape of what you want back — before you write a single word of the ask',
      estimatedTime: '15 min',
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
          successCriteria: [
            'User defined an output template before writing the ask',
            'Template includes at least 3 distinct sections or format specifications',
            'Output closely matches the defined template structure',
            'User can explain why template-first produces better results than ask-first',
          ],
        },
      },
    },

    // ─── Module 2-3: Multi-Shot Prompting ─────────────────────────────────
    {
      id: '2-3',
      title: 'Multi-Shot Prompting',
      type: 'exercise',
      description: 'Use examples to train the AI on exact format, style, and quality — showing beats telling',
      estimatedTime: '15 min',
      learningObjectives: [
        'Provide one or two examples of "good" output to set format, style, and quality standards',
        'Observe how examples communicate what words alone cannot (tone, compliance language, level of detail)',
        'Apply multi-shot prompting to a recurring output type from your work',
      ],
      learningOutcome: 'After this module, you can use examples to get AI output that matches your professional standards — without writing a single formatting instruction.',
      content: {
        overview: 'You just learned to define output shape with templates. Multi-shot prompting is the next level: instead of telling the AI what you want, you show it. Two or three well-chosen examples do more work than a paragraph of instructions.\n\nThis is how you stop getting AI-sounding output and start getting output that fits your actual professional context. The AI matches the style, tone, format, and level of detail from your examples — automatically.',
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
            good: '"I need to write a follow-up letter to a borrower about a documentation request. Here are two examples of letters our team has written that match our style:\n\n[Example 1: Past letter with warm but professional tone, specific document list, clear deadline]\n[Example 2: Past letter with similar structure but different document requirements]\n\nNow write a new letter for this borrower: [details]. Match the tone and format of my examples."',
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
          successCriteria: [
            'User provided at least one example of existing work to the AI',
            'AI output visibly matched the style, tone, or format of the provided examples',
            'User identified at least one element the examples communicated that words alone could not',
            'User can explain when multi-shot is more efficient than detailed instructions',
          ],
        },
      },
    },

    // ─── Module 2-4: Model Selection ──────────────────────────────────────
    {
      id: '2-4',
      title: 'Model Selection',
      type: 'document',
      description: 'Learn that different models exist for different tasks — discernment, not preference',
      estimatedTime: '12 min',
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
            good: 'Quick draft of a meeting agenda → Default mode (fast, good enough)\n\nAnalyzing three vendor proposals against your compliance requirements → Reasoning mode (needs to hold multiple factors, compare systematically)\n\nResearching regulatory implications of a new lending product across multiple guidance documents → Extended/Pro mode (needs depth, nuance, comprehensive coverage)',
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
          successCriteria: [
            'User ran the same task through two different model modes',
            'User articulated a specific difference in output quality between the two modes',
            'User identified at least one task from their work that should use each mode',
            'User demonstrated discernment — not just always choosing the most powerful model',
          ],
        },
      },
    },

    // ─── Module 2-5: Chain-of-Thought Mastery ─────────────────────────────
    {
      id: '2-5',
      title: 'Chain-of-Thought Mastery',
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
        overview: 'You learned in Session 2 Module 4 that some models are built for deeper reasoning. This module teaches you how to unlock that reasoning capability — rather than getting a summary dressed up as analysis.\n\nChain-of-thought outputs are auditable. In professional contexts, the reasoning behind a conclusion often matters as much as the conclusion itself. A credit decision, a risk assessment, a compliance judgment — all of these require reasoning that can be traced and challenged.',
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
            good: '"Analyze whether we should increase our CRE concentration limit. Work through this step by step:\n\n1. First, summarize our current CRE concentration ratio and the regulatory guidance threshold\n2. Then, assess our historical CRE performance over the last 3 years (delinquency, charge-offs)\n3. Then, evaluate the current market conditions in our lending area\n4. Then, identify the top 3 risks of increasing the limit and the top 3 risks of not increasing it\n5. Finally, make a recommendation with your confidence level and the key assumption behind it"',
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
          successCriteria: [
            'User designed a reasoning chain with at least 3 explicit steps',
            'AI output followed the step-by-step structure',
            'User identified the weakest step in the chain and articulated why',
            'User challenged or refined at least one step in the reasoning',
          ],
        },
      },
    },

    // ─── Module 2-6: Tool Selection ───────────────────────────────────────
    {
      id: '2-6',
      title: 'Tool Selection',
      type: 'exercise',
      description: 'Learn to recognize when a tool applies — not just how to operate it',
      estimatedTime: '15 min',
      learningObjectives: [
        'Understand that AI tools (web search, file analysis, data lookup) solve specific types of problems',
        'Use the Flipped Interaction Pattern with tools: "Scan this tool — what are some ways I could use this?"',
        'Verify tool suggestions before relying on them — explore possibilities, then confirm',
      ],
      learningOutcome: 'After this module, you can identify when an AI tool is the right move for a specific task — and interrogate new tools the same way you interrogate tasks.',
      content: {
        overview: 'Each tool solves a specific kind of problem. Web search finds current information. File analysis reads your documents. Data lookup connects to structured sources. The skill is not learning every tool — it is recognizing when a tool applies.\n\nThe Flipped Interaction Pattern works here too: "Scan this tool. What are some ways I could use this?" This is how you learn to adopt new tools resiliently — you interrogate them the same way you interrogate tasks.\n\nImportant caveat: when you ask the AI what a tool can do, some suggestions will be wrong or overstated. Use the AI to explore possibilities, then verify before you rely on them.',
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
            good: 'Scenario 1: You need to know the current Fed funds rate for a memo → Web search (current data)\nScenario 2: You uploaded a 50-page policy document and need to find a specific section → File analysis (your document)\nScenario 3: You want help brainstorming agenda items for a meeting → No tool needed (conversation is sufficient)',
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
          successCriteria: [
            'User identified at least 3 tasks and correctly matched each to tool vs. no-tool',
            'User used at least one tool (web search, file upload, etc.) on a real task',
            'User verified at least one piece of tool-generated information',
            'User can explain why a specific tool was the right choice for a specific task',
          ],
        },
      },
    },

    // ─── Module 2-7: Sandbox ──────────────────────────────────────────────
    {
      id: '2-7',
      title: 'Sandbox',
      type: 'sandbox',
      description: 'Structured practice — experiment with prompting frameworks, models, and tools on tasks you care about',
      estimatedTime: '15 min',
      learningObjectives: [
        'Apply CLEAR, output templating, multi-shot, chain-of-thought, model selection, and tool selection independently',
        'Use at least one tool and at least two model modes on tasks that matter to you',
        'Develop your own preferences and use patterns',
      ],
      learningOutcome: 'After this module, you have a clearer sense of which Session 2 techniques fit your work style and which you will use regularly.',
      content: {
        overview: 'Structured practice. You have six new tools in your toolkit: CLEAR Framework, output templating, multi-shot prompting, model selection, chain-of-thought reasoning, and tool selection. The Sandbox is where you put them together on tasks you actually care about.',
        keyPoints: [
          'Use at least one tool (web search, file analysis) and at least two model modes',
          'Combine techniques: CLEAR + output template + multi-shot on a single task',
          'Try chain-of-thought + self-review loop on an analytical task',
          'There is no wrong combination — experiment and find what works for your role',
        ],
        practiceTask: {
          title: 'Structured Exploration',
          instructions: 'Pick tasks from your work and apply Session 2 techniques. Aim to use at least one tool and two different model modes.',
          scenario: 'This is your structured practice space. Suggested exercises:\n\n- Take a high-stakes task and apply the full stack: CLEAR + output template + reasoning model\n- Use multi-shot prompting on a recurring document type with real examples from your work\n- Run a chain-of-thought analysis on a real decision and critique the reasoning\n- Try a task that needs web search for current data\n- Compare the same task across two models and pick the winner\n\nOr bring your own task and apply whichever techniques fit.',
          hints: [
            'Combine techniques — they are designed to work together',
            'If you are not sure which technique to use, start with CLEAR + output template as your base',
            'Try the most complex combination you can: CLEAR + multi-shot + chain-of-thought + self-review',
            'Note which techniques you find most useful — those are the ones to make habitual',
          ],
          successCriteria: [
            'User applied at least two Session 2 techniques in combination',
            'User used at least one tool (web search, file upload) on a task',
            'User can articulate which techniques they found most useful for their role',
          ],
        },
      },
    },
  ],
};

// ═════════════════════════════════════════════════════════════════════════════
// SESSION 3: AGENTS
// Andrea Tier: Peer — Socratic, minimal hand-holding, challenges assumptions
// Design constraint: Agents only make sense once conversation-first computing
// is solid. Session 3 is not reachable until Sessions 1 and 2 are complete.
// ═════════════════════════════════════════════════════════════════════════════

export const SESSION_3_CONTENT: SessionContent = {
  id: 3,
  title: 'Agents',
  description: 'Understand what agents are, why they exist, and how to build one — layer by layer',
  modules: [
    // ─── Module 3-1: Why Agents Exist ─────────────────────────────────────
    {
      id: '3-1',
      title: 'Why Agents Exist',
      type: 'document',
      description: 'Understand the conceptual foundation — what makes an agent different from a conversation',
      estimatedTime: '12 min',
      learningObjectives: [
        'Distinguish between a basic conversation (generalist) and a custom agent (specialist)',
        'Understand why persistence matters: an agent remembers instructions so you do not re-explain every time',
        'Use a pre-built example agent and observe what makes it different from a default conversation',
      ],
      learningOutcome: 'After this module, you understand what an agent is, why it is different from a conversation, and where it fits in your work.',
      content: {
        overview: 'A basic conversation is a generalist. It helps with everything at a general level. A custom agent is a specialist. It is configured for specific work — it knows your rules, your format, your constraints, and it applies them every time without you re-explaining.\n\nThink of it this way: a conversation is like giving instructions to a new person every time. An agent is like training a colleague who remembers your preferences, follows your rules, and handles variations without you re-explaining.',
        keyPoints: [
          'A conversation is stateless — every new thread starts fresh',
          'An agent embeds persistent instructions so every conversation inherits them automatically',
          'Agents are specialists: configured for specific work, not general help',
          'You do not need to build agents for everything — many tasks are better as one-off conversations',
          'The universal example: a strategic organizer for unstructured thoughts and ideas',
        ],
        examples: [
          {
            title: 'Conversation vs. Agent',
            bad: 'Every Monday, you open a new chat and type: "You are a credit analyst at a community bank. I need you to review loan applications using our credit policy. Always flag CRE concentration issues. Format your review as: Summary, Key Risks, Recommendation, Conditions." You do this every single time.',
            good: 'You build an agent called "Credit Review Assistant" with those instructions baked in. Every Monday, you open it, paste the application data, and get a structured review instantly. No re-explaining. No forgotten instructions.',
            explanation: 'The agent does not do anything the conversation cannot do. The difference is persistence — the agent remembers so you do not have to. For tasks you do repeatedly with the same structure, that persistence is the value.',
          },
        ],
        practiceTask: {
          title: 'Explore a Pre-Built Agent',
          instructions: 'Use a pre-built example agent and observe what makes it different from a default conversation.',
          scenario: 'Try the Strategic Organizer agent — a universal example that works for anyone. It takes your loose, unstructured thoughts (ideas, fragments, half-formed observations) and makes sense of them: organizes them, surfaces connections, identifies themes.\n\n1. Open the pre-built agent\n2. Paste in some unstructured thoughts or ideas from your work\n3. Observe: how does this feel different from a regular conversation?\n4. What did the agent do that a default conversation would not have done automatically?',
          hints: [
            'The difference is in what you did NOT have to explain — the agent already knew its job',
            'Try the same task in a fresh default conversation and compare the experience',
            'Think about tasks in your work where re-explaining context every time is friction',
            'This is a starting point — you will build your own agent in Module 3',
          ],
          successCriteria: [
            'User interacted with a pre-built agent and observed its behavior',
            'User can articulate at least one difference between an agent and a default conversation',
            'User identified at least one task from their work where an agent might add value',
          ],
        },
      },
    },

    // ─── Module 3-2: The Four Levels ──────────────────────────────────────
    {
      id: '3-2',
      title: 'The Four Levels',
      type: 'document',
      description: 'Learn the progression from conversation to specialist to executor to autonomous',
      estimatedTime: '10 min',
      learningObjectives: [
        'Describe the four levels of AI interaction: basic chat, custom agent, agent + workflow, and triggered/autonomous',
        'Identify which level is appropriate for different types of work',
        'Understand that most users get enormous value from Level 2 — Level 4 is not the goal',
      ],
      learningOutcome: 'After this module, you can identify which level of AI interaction is appropriate for any given task — and resist the urge to over-engineer.',
      content: {
        overview: 'There is a natural progression from basic conversation to increasingly sophisticated AI use. Understanding this progression helps you choose the right level for each task — and avoids the trap of thinking you need the most advanced option for everything.',
        keyPoints: [
          'Level 1 — Basic Chat: generalist conversation, no persistence, no special configuration',
          'Level 2 — Custom Agent: specialist configured for specific work, information and advice only',
          'Level 3 — Agent + Workflow/Tool: can execute tasks (send emails, update records), not just advise',
          'Level 4 — Triggered/Autonomous: runs without a prompt, activated by triggers you set',
          'Most users get enormous value from Level 2 — Level 4 is appropriate for specific circumstances, not a goal',
          'The curriculum builds from Level 2 (this session) through Level 3 (Module 6)',
        ],
        examples: [
          {
            title: 'The Four Levels in Practice',
            good: 'Level 1: You open ChatGPT and ask "What are the current FDIC insurance limits?" — a one-off question.\n\nLevel 2: You build a Credit Review Agent with your bank\'s credit policy embedded. Every review follows your standards automatically.\n\nLevel 3: Your Credit Review Agent is connected to your loan origination system. It can pull application data directly and post its review to the file.\n\nLevel 4: When a new loan application enters the system, a trigger automatically runs the Credit Review Agent and flags high-risk items for human review.',
            explanation: 'Each level adds capability — and complexity. Level 2 is already transformative for most users. Level 3 requires tool connections. Level 4 requires triggers and governance. Build up deliberately, not all at once.',
          },
        ],
        practiceTask: {
          title: 'Map Your Work to the Four Levels',
          instructions: 'Identify 4 tasks from your work — one that fits each level. Which level would you start with?',
          scenario: 'Think about tasks across your work and map one to each level:\n\n1. Level 1 (Basic Chat): a task where a one-off conversation is sufficient\n2. Level 2 (Custom Agent): a task you do repeatedly that would benefit from persistent instructions\n3. Level 3 (Agent + Tool): a task where the AI should be able to take action, not just advise\n4. Level 4 (Triggered): a task that should run automatically when something happens\n\nWhich level would you start building at? (Hint: Level 2 is almost always the right answer.)',
          hints: [
            'Level 2 is the sweet spot for most people starting with agents',
            'Level 3 usually requires IT involvement to connect systems — plan for that',
            'Level 4 is powerful but requires governance: who monitors the autonomous agent?',
            'If you cannot identify a Level 4 task, that is fine — most professionals do not need one yet',
          ],
          successCriteria: [
            'User mapped at least one task to each of the four levels',
            'User identified which level they would start building at (and it is probably Level 2)',
            'User can explain why Level 2 is the recommended starting point',
          ],
        },
      },
    },

    // ─── Module 3-3: Build a Basic Agent ──────────────────────────────────
    {
      id: '3-3',
      title: 'Build a Basic Agent',
      type: 'exercise',
      description: 'Create a Level 2 agent with nothing but well-written instructions — no knowledge, no tools',
      estimatedTime: '25 min',
      isGateModule: true,
      learningObjectives: [
        'Define a specific job for an agent that is relevant to your work',
        'Write agent instructions that cover role, scope, style, and constraints',
        'Test the agent and iterate on instructions based on what comes back',
        'Understand that writing agent instructions is like writing a job description',
      ],
      learningOutcome: 'After this module, you have built a working Level 2 agent configured for a specific task in your work.',
      content: {
        overview: 'This is Level 2: a custom agent with nothing but instructions. No knowledge files. No tools. No external connections. Just a well-configured specialist.\n\nWriting agent instructions is like writing a job description. You are defining the role, the scope, the style, and the constraints. The more specific you are, the more useful the agent becomes. Vague instructions produce vague agents.',
        keyPoints: [
          'Start with the job: what specific task should this agent handle?',
          'Define the role: who is this agent? What is its expertise?',
          'Define the scope: what does it do? What does it NOT do?',
          'Define the style: formal or conversational? Brief or thorough?',
          'Define the constraints: what should it always do? What should it never do?',
          'Test and iterate — the first version of instructions is never the final version',
        ],
        steps: [
          'Choose a job for the agent — something you do repeatedly in your work',
          'Write the instructions: role, scope, style, constraints',
          'Test the agent with a real task',
          'Review the output: what did it get right? What did it miss?',
          'Iterate on the instructions based on what you learned',
          'Test again — repeat until the agent consistently produces useful output',
        ],
        examples: [
          {
            title: 'Agent Instructions Example',
            good: 'Role: You are a Loan Documentation Checklist Agent for a community bank. You help loan officers ensure all required documentation is identified before closing.\n\nScope: You review loan type, amount, collateral type, and borrower type, then produce a customized documentation checklist. You do NOT make credit decisions or assess borrower creditworthiness.\n\nStyle: Professional, direct, checklist format. Use banking terminology. Each item should include the document name and why it is required.\n\nConstraints: Always include regulatory requirements (Reg B, HMDA if applicable, flood determination). Flag any items that require attorney review. If the loan type is unfamiliar, say so rather than guessing.',
            explanation: 'These instructions are specific enough that the agent produces consistent, useful output. The constraints prevent it from overstepping (no credit decisions) and ensure it flags uncertainty rather than guessing. This is a well-written job description for an AI.',
          },
        ],
        practiceTask: {
          title: 'Build Your First Agent',
          instructions: 'Define a job, write instructions, test, and iterate. Build a Level 2 agent for something you do at work.',
          scenario: 'Build an agent for a task you do regularly:\n\n1. Define the job: what will this agent do? Be specific.\n2. Write the instructions using the framework: Role, Scope, Style, Constraints\n3. Test with a real or realistic task\n4. Review: did the agent follow your instructions? What did it miss or misinterpret?\n5. Revise your instructions and test again\n6. Aim for an agent that works consistently on the second or third test',
          hints: [
            'Start with something narrow — "Credit Memo Summarizer" is better than "Banking Assistant"',
            'Constraints are the most important part — they prevent the agent from doing things you do not want',
            'If the agent ignores an instruction, it is usually because the instruction is too vague — be more specific',
            'Test with edge cases: what happens when the input is unusual or incomplete?',
          ],
          successCriteria: [
            'User defined a specific job for the agent (not a general assistant)',
            'Instructions include all four elements: role, scope, style, constraints',
            'User tested the agent with at least one real or realistic task',
            'User iterated on instructions at least once based on test results',
            'Agent produces consistent, useful output on repeated tests',
          ],
          departmentScenarios: {
            'Commercial Lending': {
              scenario: 'Build a Credit Memo Summarizer, Loan Documentation Checklist Agent, or Borrower Communication Drafter. Choose the task you do most often.',
              hints: [
                'For a Credit Memo Summarizer: define what sections the summary must include',
                'For a Documentation Agent: specify the loan types it should handle',
                'Include a constraint: "Always flag missing documentation rather than assuming it exists"',
              ],
            },
            'Compliance': {
              scenario: 'Build a Regulatory Update Summarizer, Policy Checklist Agent, or Compliance Training Q&A Agent. Pick the task that saves you the most time.',
              hints: [
                'For a Reg Summarizer: define the output format (plain language + action items)',
                'Include a constraint: "Always cite the specific regulation or guidance section"',
                'For training Q&A: define the tone (helpful, not intimidating) and scope (your policies only)',
              ],
            },
            'Retail Banking': {
              scenario: 'Build a Customer Communication Drafter, Product FAQ Agent, or Branch Meeting Agenda Generator. Choose something your team uses weekly.',
              hints: [
                'For customer communications: define the tone (warm, professional) and compliance requirements',
                'Include a constraint: "Never make promises about rates, fees, or approval"',
                'For FAQ agents: define the scope — what questions it answers vs. refers to a human',
              ],
            },
          },
        },
      },
    },

    // ─── Module 3-4: Add Knowledge ────────────────────────────────────────
    {
      id: '3-4',
      title: 'Add Knowledge',
      type: 'exercise',
      description: 'Give your agent domain knowledge — the difference between a generalist with a title and a real specialist',
      estimatedTime: '15 min',
      learningObjectives: [
        'Add relevant documents, references, or guidelines to your agent as a knowledge base',
        'Observe how knowledge changes the agent\'s output quality and specificity',
        'Understand that knowledge is context, not just files — it transforms a generalist into a specialist',
      ],
      learningOutcome: 'After this module, your agent has domain knowledge that makes it a genuine specialist — not just a generalist with a title.',
      content: {
        overview: 'Take the agent you built in Module 3. Same instructions, one new layer: knowledge. Add relevant documents, references, or guidelines. Then test the difference.\n\nKnowledge is not just files. It is the difference between a generalist with a title and a specialist who actually knows the domain. Your agent with instructions alone can follow your rules. Your agent with knowledge can apply your actual standards, policies, and reference materials.',
        keyPoints: [
          'Knowledge = documents, references, guidelines, policies, examples that your agent can reference',
          'The agent uses knowledge to ground its responses in your actual standards — not general knowledge',
          'Start with 1-3 documents that are most relevant to the agent\'s job',
          'Test before and after: the difference in output quality is the value of knowledge',
          'Too many documents can be counterproductive — start focused and add as needed',
        ],
        practiceTask: {
          title: 'Add Knowledge to Your Agent',
          instructions: 'Take your agent from Module 3, add 1-3 relevant knowledge documents, and test the difference.',
          scenario: 'Return to the agent you built in Module 3:\n\n1. Identify 1-3 documents that are most relevant to its job (policies, guidelines, templates, examples)\n2. Add them to the agent\'s knowledge base\n3. Run the same test task from Module 3 — compare the output\n4. How did the output change? Is it more specific? More accurate? Does it reference your actual standards?\n5. Try a new task that specifically requires knowledge from your documents',
          hints: [
            'Start with your most-used reference document — the one you check most often',
            'If you are in lending: credit policy, documentation requirements, or underwriting guidelines',
            'If you are in compliance: relevant regulations, your policy manual, or examination procedures',
            'The before/after comparison is the key insight — run the same task with and without knowledge',
          ],
          successCriteria: [
            'User added at least one knowledge document to their agent',
            'User tested the agent with and without knowledge and observed the difference',
            'Agent output references or applies information from the knowledge documents',
            'User can explain how knowledge changed the quality or specificity of the output',
          ],
        },
      },
    },

    // ─── Module 3-5: Add Files ────────────────────────────────────────────
    {
      id: '3-5',
      title: 'Add Files',
      type: 'exercise',
      description: 'Extend your agent to work with user-provided files — documents, spreadsheets, and data',
      estimatedTime: '15 min',
      learningObjectives: [
        'Configure your agent to accept and process user-provided files',
        'Test how the agent handles different file types relevant to your work',
        'Understand the difference between knowledge (reference material) and files (work input)',
      ],
      learningOutcome: 'After this module, your agent can accept files from users and process them according to its instructions and knowledge base.',
      content: {
        overview: 'Same agent, another layer. Knowledge is the reference material your agent always has access to. Files are the work input users bring to each interaction — the documents, spreadsheets, or data the agent needs to process.\n\nThe distinction matters: knowledge is permanent context (your credit policy). Files are session input (this specific loan application). Your agent uses both together.',
        keyPoints: [
          'Knowledge = permanent reference material (always available to the agent)',
          'Files = session input (provided by the user for a specific task)',
          'The agent combines both: applies its knowledge to the files you provide',
          'Test with file types you actually use: PDFs, spreadsheets, documents, data exports',
          'Observe how the agent handles messy or incomplete files — does it ask for clarification?',
        ],
        practiceTask: {
          title: 'Process a Real File',
          instructions: 'Upload a real or realistic work file to your agent and test how it processes it using its instructions and knowledge.',
          scenario: 'Take your agent (now with instructions + knowledge) and give it a file to work with:\n\n1. Choose a file type you work with regularly (a document, spreadsheet, report, or data export)\n2. Upload it to the agent and ask it to process the file according to its job\n3. Evaluate: did the agent apply its instructions? Did it reference its knowledge?\n4. Test with a different file type — how does the agent handle variety?\n5. Try an edge case: what happens with an incomplete or messy file?',
          hints: [
            'Use real files when possible (redact sensitive data if needed)',
            'If your agent is a Credit Memo Summarizer, give it an actual credit memo',
            'Test the boundaries: what happens when the file format is unexpected?',
            'The agent should ask for clarification when the file is ambiguous — if it guesses instead, tighten your instructions',
          ],
          successCriteria: [
            'User uploaded at least one file to the agent',
            'Agent processed the file using its instructions and knowledge',
            'User tested at least two different interactions with files',
            'User identified at least one way to improve the agent\'s file handling (through instruction updates)',
          ],
        },
      },
    },

    // ─── Module 3-6: Add Tool Access ──────────────────────────────────────
    {
      id: '3-6',
      title: 'Add Tool Access',
      type: 'exercise',
      description: 'Connect your agent to tools — the transition from advisor to workflow participant',
      estimatedTime: '15 min',
      learningObjectives: [
        'Connect the agent to at least one tool (web search, data lookup, or a connected service)',
        'Test an interaction where the agent produces an action, not just a response',
        'Understand the distinction: an agent with tools is a participant in the workflow, not just an advisor',
      ],
      learningOutcome: 'After this module, your agent can take actions through connected tools — transitioning from Level 2 (advisor) to Level 3 (executor).',
      content: {
        overview: 'This is where the agent stops being an advisor and starts being a participant in the workflow. The distinction matters: an agent that advises tells you what to do. An agent with tools can do things — look up current data, search the web, interact with connected services.\n\nUsers need to know what their agent is doing, not just what it is saying. Transparency about tool use is essential, especially in professional contexts where the source of information matters.',
        keyPoints: [
          'Tool access transforms the agent from Level 2 (advisor) to Level 3 (executor)',
          'Start with one tool — web search is usually the easiest first connection',
          'The agent should explain what tool it used and why — transparency matters',
          'In professional contexts, knowing the source of information is as important as the information itself',
          'Test carefully: tool-connected agents need monitoring, especially early on',
        ],
        practiceTask: {
          title: 'Connect and Test a Tool',
          instructions: 'Add a tool to your agent (web search, data lookup, or another available connection) and test an interaction that produces an action, not just a response.',
          scenario: 'Extend your agent with tool access:\n\n1. Enable at least one tool (web search is the easiest starting point)\n2. Give the agent a task that requires the tool (e.g., "Check the current regulatory status of X")\n3. Observe: did the agent use the tool? Did it tell you it was using it?\n4. Verify the tool output — is the information accurate and current?\n5. Compare: how is this different from your agent without tools?',
          hints: [
            'Web search is the most universally useful first tool — it gives the agent access to current information',
            'Ask the agent to cite its sources when using web search — verify at least one',
            'If connecting to other tools (email, calendar, data systems), start with read-only access before write access',
            'The key question: would you trust this agent to take this action without your review?',
          ],
          successCriteria: [
            'User connected at least one tool to their agent',
            'Agent used the tool to complete a task (not just conversation)',
            'User verified the output from the tool-connected interaction',
            'User can explain the difference between an advisor agent and an executor agent',
          ],
        },
      },
    },

    // ─── Module 3-7: Sandbox / Capstone ───────────────────────────────────
    {
      id: '3-7',
      title: 'Sandbox / Capstone',
      type: 'sandbox',
      description: 'Build your own agent for a real use case — work through as many layers as make sense',
      estimatedTime: '25 min',
      learningObjectives: [
        'Design an agent for a real use case in your work — from scratch',
        'Work through the four layers (instructions, knowledge, files, tools) as far as your use case requires',
        'Present the agent\'s output and reflect on what worked',
      ],
      learningOutcome: 'After this module, you have built an agent you plan to actually use in your work — not just a practice exercise.',
      content: {
        overview: 'Build your own. Design an agent for a real use case in your work and work through the four layers as far as makes sense for your use case. Not every agent needs all four layers — some are perfectly useful with just instructions. The goal is something you plan to actually use.',
        keyPoints: [
          'Start with the use case, not the technology — what problem are you solving?',
          'Work through layers in order: instructions → knowledge → files → tools',
          'Stop when adding more layers does not add value for your use case',
          'The best agent is one you will actually use — not the most complex one you can build',
          'Reflect: what would make this agent 10x more useful to you in your actual work?',
        ],
        practiceTask: {
          title: 'Build Your Capstone Agent',
          instructions: 'Design and build an agent for a real use case. Work through as many layers as your use case requires.',
          scenario: 'This is your capstone for Session 3:\n\n1. Identify a real use case from your work — something you do regularly that would benefit from a specialist agent\n2. Write the instructions (role, scope, style, constraints)\n3. Add knowledge if your use case requires domain-specific reference material\n4. Configure file handling if users will bring documents to the agent\n5. Add tool access if the agent needs to take actions or access current information\n6. Test thoroughly with real or realistic inputs\n7. Reflect: what worked? What would you change? What would make this 10x more useful?',
          hints: [
            'Start narrow — you can always expand the scope later',
            'The most useful agents solve one specific problem really well',
            'Ask yourself: "Would I use this tomorrow?" If not, pick a different use case.',
            'Share your agent with a colleague and get their feedback — does it work for them too?',
          ],
          successCriteria: [
            'User designed an agent for a real work use case',
            'Agent has at least instructions and one additional layer (knowledge, files, or tools)',
            'User tested the agent with realistic inputs and iterated at least once',
            'User can articulate what they would change to make the agent more useful',
            'User describes the agent as something they plan to actually use',
          ],
        },
      },
    },
  ],
};

// ═════════════════════════════════════════════════════════════════════════════
// SESSION 4: FUNCTIONAL AGENTS (CHOOSE YOUR OWN ADVENTURE)
// Andrea Tier: Advisor — strategic consulting perspective, pushes for ambition
// Design: Users pick the tool most relevant to their work and go deep on it.
// ═════════════════════════════════════════════════════════════════════════════

export const SESSION_4_CONTENT: SessionContent = {
  id: 4,
  title: 'Functional Agents',
  description: 'Learn to use agents that already exist in the tools you use every day — choose the path most relevant to your work',
  modules: [
    // ─── Module 4-1: What Are Functional Agents? ──────────────────────────
    {
      id: '4-1',
      title: 'What Are Functional Agents?',
      type: 'document',
      description: 'Understand agents built into the tools you already use — and how to recognize them',
      estimatedTime: '10 min',
      learningObjectives: [
        'Recognize that AI agents are already embedded in tools you use daily (spreadsheets, presentations, email)',
        'Understand the difference between a custom agent (Session 3) and a functional agent (built into a tool)',
        'Identify which functional agents are available in your organization\'s configured platform',
      ],
      learningOutcome: 'After this module, you can identify functional agents in your existing tools and understand when to use them vs. building a custom agent.',
      content: {
        overview: 'In Session 3, you built custom agents from scratch. But agents are already embedded in the tools you use every day — your spreadsheet software, your presentation tool, your email client. These functional agents are pre-built for specific tasks within those tools.\n\nThe key insight: you do not always need to build from scratch. Sometimes the right agent is already waiting for you in a tool you already have.',
        keyPoints: [
          'Functional agents are pre-built AI capabilities embedded in existing software',
          'They are optimized for specific tasks within their tool (data analysis in spreadsheets, content generation in presentations)',
          'Custom agents (Session 3) are flexible but require setup; functional agents are ready to use but less customizable',
          'The right choice depends on the task: use functional agents for tool-specific work, custom agents for cross-cutting workflows',
          'Your organization\'s platform determines which functional agents are available to you',
        ],
        practiceTask: {
          title: 'Inventory Your Functional Agents',
          instructions: 'Identify which AI-powered features are already available in the tools you use. List at least 3.',
          scenario: 'Take inventory of the tools you use daily:\n\n1. Open your spreadsheet tool — is there an AI assistant or Copilot feature?\n2. Open your presentation tool — can it generate or suggest content?\n3. Open your email client — does it offer AI-powered drafting or summarization?\n4. Check any other tools you use regularly for AI features\n\nFor each one you find: what does it do? Have you used it before? What task would you use it for?',
          hints: [
            'Look for icons or buttons labeled "AI", "Copilot", "Assistant", or a sparkle/magic wand icon',
            'Many tools added AI features recently — you may have them without realizing it',
            'If you are not sure what is available, ask your IT department or check the tool\'s help section',
            'The goal is awareness — you do not need to master every tool right now',
          ],
          successCriteria: [
            'User identified at least 3 tools with functional AI agents or features',
            'User can describe what each functional agent does (even if they have not used it)',
            'User identified at least one task they could use a functional agent for this week',
          ],
        },
      },
    },

    // ─── Module 4-2: AI in Your Spreadsheet ──────────────────────────────
    {
      id: '4-2',
      title: 'AI in Your Spreadsheet',
      type: 'exercise',
      description: 'Use AI features in Excel or Google Sheets for data analysis, formula generation, and insights',
      estimatedTime: '20 min',
      learningObjectives: [
        'Use AI to generate formulas, pivot tables, or charts from natural language descriptions',
        'Ask AI to analyze data patterns, trends, or anomalies in your spreadsheets',
        'Understand what the spreadsheet AI does well and where it breaks down or misleads',
      ],
      learningOutcome: 'After this module, you can use AI features in your spreadsheet tool to accelerate data work you already do.',
      content: {
        overview: 'Your spreadsheet tool has AI built in. You can describe what you want in plain language — "Create a pivot table showing loan volume by month and type" — and the AI generates it. This is not about replacing your spreadsheet skills. It is about accelerating the work you already do.\n\nThe key to using AI in spreadsheets: be specific about what you want, verify the formulas it generates, and watch for errors in complex calculations.',
        keyPoints: [
          'Describe what you want in plain language: "Sum column B where column A equals X"',
          'AI can generate formulas, create charts, build pivot tables, and spot patterns',
          'Always verify generated formulas — especially for financial calculations where accuracy matters',
          'AI works best when your data is clean and well-organized',
          'Watch for edge cases: how does the AI handle blank cells, dates, or currency formatting?',
        ],
        practiceTask: {
          title: 'AI-Assisted Data Work',
          instructions: 'Open a spreadsheet with real or sample data and use AI features to create at least one formula, one chart or pivot table, and one data insight.',
          scenario: 'Open a spreadsheet you use at work (or a sample dataset):\n\n1. Ask the AI to create a formula you would normally write manually\n2. Ask it to create a chart or pivot table from your data\n3. Ask it to identify trends, patterns, or anomalies in your data\n4. Verify: is the formula correct? Does the chart accurately represent the data?\n5. Identify one thing the AI did well and one thing you had to fix',
          hints: [
            'Start with a formula you already know how to write — then compare the AI version',
            'For financial data: always verify decimal precision and rounding in generated formulas',
            'Try: "What patterns do you see in this data?" — the AI may spot something you missed',
            'If the AI generates an error, describe the problem in more detail and try again',
          ],
          successCriteria: [
            'User generated at least one formula using AI',
            'User created at least one visualization (chart or pivot table) using AI',
            'User verified at least one AI-generated output for accuracy',
            'User identified at least one limitation or error in the AI\'s spreadsheet work',
          ],
        },
      },
    },

    // ─── Module 4-3: AI in Your Presentations ─────────────────────────────
    {
      id: '4-3',
      title: 'AI in Your Presentations',
      type: 'exercise',
      description: 'Use AI features in PowerPoint or Google Slides for content generation, design, and speaker notes',
      estimatedTime: '20 min',
      learningObjectives: [
        'Generate slide content, outlines, and speaker notes from natural language descriptions',
        'Use AI to improve design, layout, and visual consistency',
        'Understand what presentation AI does well (structure, first drafts) and where it falls short (nuance, branding)',
      ],
      learningOutcome: 'After this module, you can use AI features in your presentation tool to accelerate slide creation and improve quality.',
      content: {
        overview: 'AI in presentation tools can generate slide outlines, draft content, suggest designs, and create speaker notes. The sweet spot: first drafts and structure. You bring the substance and judgment; the AI accelerates the scaffolding.',
        keyPoints: [
          'AI excels at generating outlines, first drafts, and speaker notes from descriptions',
          'Design suggestions can improve consistency, but may not match your organization\'s branding',
          'Always review AI-generated content for accuracy and appropriateness before presenting',
          'The best workflow: let AI create the skeleton, then you refine the substance',
          'Speaker notes are an underused feature — AI can draft them while you focus on the slides',
        ],
        practiceTask: {
          title: 'AI-Assisted Presentation',
          instructions: 'Create or improve a presentation using AI features. Generate at least an outline, one slide of content, and speaker notes.',
          scenario: 'Choose a presentation you need to create (or one you recently gave that could be improved):\n\n1. Ask the AI to generate an outline for your topic\n2. Pick one section and ask the AI to generate slide content\n3. Ask for speaker notes for that slide\n4. Review: does the content match your message? Is it accurate? Would you present it as-is?\n5. Identify what you would keep vs. what you would change',
          hints: [
            'Give the AI context about your audience: "This is for our board of directors" produces different content than "This is for a team meeting"',
            'If the design does not match your branding, focus on the content and reformat manually',
            'Speaker notes are a great place to start — let the AI draft them from your slide content',
            'Try: "Make this slide more concise — I have 30 seconds to present it"',
          ],
          successCriteria: [
            'User generated an outline or slide content using AI',
            'User created speaker notes for at least one slide',
            'User reviewed AI-generated content and identified improvements needed',
            'User can describe when AI presentation features save time vs. when they do not',
          ],
        },
      },
    },

    // ─── Module 4-4: AI in Your Inbox ─────────────────────────────────────
    {
      id: '4-4',
      title: 'AI in Your Inbox',
      type: 'exercise',
      description: 'Use AI features in your email client for drafting, summarizing, and managing communications',
      estimatedTime: '15 min',
      learningObjectives: [
        'Use AI to draft email responses, summarize long threads, and identify action items',
        'Adjust AI-drafted emails for tone, audience, and professional context',
        'Understand when AI email assistance helps vs. when a human touch is essential',
      ],
      learningOutcome: 'After this module, you can use AI features in your email client to handle routine communications faster while maintaining your professional voice.',
      content: {
        overview: 'AI in your email client can draft responses, summarize long threads, extract action items, and suggest replies. The value is in routine communications — the emails you write every day that follow predictable patterns. For sensitive, high-stakes, or relationship-critical emails, you still write them yourself.',
        keyPoints: [
          'AI draft assistance works best for routine, predictable communications',
          'Always adjust tone for the relationship: the AI default is often too formal or too casual',
          'Thread summarization saves significant time on long email chains',
          'Action item extraction turns email threads into actionable to-do lists',
          'High-stakes emails (customer complaints, regulatory correspondence, HR issues) need human judgment',
        ],
        practiceTask: {
          title: 'AI-Assisted Email Management',
          instructions: 'Use AI features in your email client to draft a response, summarize a thread, or extract action items.',
          scenario: 'Open your email client and try these exercises:\n\n1. Find a routine email that needs a response — use AI to draft a reply, then adjust it\n2. Find a long email thread — ask AI to summarize it and extract action items\n3. Compare: how much time did the AI save you? What did you have to fix?\n4. Identify one type of email where AI assistance is genuinely useful and one where it is not',
          hints: [
            'Start with low-stakes emails — internal communications, routine follow-ups',
            'Always read the AI draft before sending — it may miss context from prior conversations',
            'Thread summarization is especially valuable for emails where you were CC\'d and need to catch up quickly',
            'If the AI draft sounds too generic, add one personal detail to make it yours',
          ],
          successCriteria: [
            'User drafted at least one email response using AI assistance',
            'User adjusted the AI draft for tone, accuracy, or context',
            'User can identify at least one email type where AI saves time and one where it should not be used',
          ],
        },
      },
    },

    // ─── Module 4-5: Sandbox ──────────────────────────────────────────────
    {
      id: '4-5',
      title: 'Sandbox',
      type: 'sandbox',
      description: 'Explore functional agents in your tools — go deeper on the ones that matter most to your work',
      estimatedTime: '15 min',
      learningObjectives: [
        'Explore functional AI features in the tools most relevant to your daily work',
        'Combine functional agents with custom agents from Session 3 for maximum productivity',
        'Develop a personal workflow that integrates AI across your tool stack',
      ],
      learningOutcome: 'After this module, you have identified the functional agents most useful for your work and started integrating them into your daily workflow.',
      content: {
        overview: 'You have explored AI in spreadsheets, presentations, and email. Now go deeper on the tools that matter most to your work. The goal is not to master every tool — it is to find the ones that save you the most time and make them habitual.',
        keyPoints: [
          'Go deep on the tools most relevant to your daily work — skip the ones you rarely use',
          'Try combining functional agents with custom agents: use a custom agent to generate content, then a functional agent to format it in your tool',
          'The best workflow is the one you will actually use — not the most sophisticated one',
          'Consider: which functional agent would save you the most time if you used it every day?',
        ],
        practiceTask: {
          title: 'Build Your Functional Agent Workflow',
          instructions: 'Pick the tool most relevant to your work and explore its AI features more deeply. Try combining it with your custom agent from Session 3.',
          scenario: 'Choose the tool where you spend the most time:\n\n- If you live in spreadsheets: try more complex data analysis, forecasting, or automation\n- If you give frequent presentations: build an entire deck using AI assistance\n- If email is your bottleneck: set up templates and workflows for your most common email types\n- If you use other tools: explore their AI features with the same approach\n\nBonus: try a workflow that combines your Session 3 custom agent with a functional agent.',
          hints: [
            'Focus on one tool — depth beats breadth',
            'Ask: "If I could automate one task in this tool, what would save me the most time?"',
            'Try combining: generate content with your custom agent, then format it using the tool\'s AI features',
            'Share what you learn with a colleague — they may benefit from the same workflow',
          ],
          successCriteria: [
            'User explored at least one functional agent in depth beyond the guided exercises',
            'User identified the most time-saving AI feature for their specific role',
            'User can describe a workflow that combines custom and functional agents',
          ],
        },
      },
    },
  ],
};

// ═════════════════════════════════════════════════════════════════════════════
// SESSION 5: BUILD YOUR FRANKENSTEIN
// Andrea Tier: Advisor — strategic consulting perspective, pushes for ambition
// Design: Open session for users who are bought in and ready to explore.
// Not a requirement — this is for users who want to go further.
// ═════════════════════════════════════════════════════════════════════════════

export const SESSION_5_CONTENT: SessionContent = {
  id: 5,
  title: 'Build Your Frankenstein',
  description: 'Design your own AI stack — stitch the pieces together in the way that serves your work',
  modules: [
    // ─── Module 5-1: Map Your Stack ───────────────────────────────────────
    {
      id: '5-1',
      title: 'Map Your Stack',
      type: 'exercise',
      description: 'Identify a workflow in your work that AI could meaningfully improve — then map out what it would take',
      estimatedTime: '15 min',
      learningObjectives: [
        'Identify a multi-step workflow in your work that involves repetitive tasks, handoffs, or bottlenecks',
        'Map the workflow: steps, inputs, outputs, decision points, and where AI could add value',
        'Distinguish between steps that should be automated, assisted, or left to humans',
      ],
      learningOutcome: 'After this module, you have mapped a real workflow from your work and identified where AI fits — and where it does not.',
      content: {
        overview: 'You have built agents. You have used functional tools. Now you design your own stack. The metaphor: you have seen how all of this works. Now build your Frankenstein — stitch the pieces together in the way that serves your work. No one else\'s Frankenstein looks exactly like yours, and that is the point.\n\nStart with the workflow, not the technology. Identify something you do regularly that involves multiple steps, handoffs, or bottlenecks. Map it. Then identify where AI can help at each step.',
        keyPoints: [
          'Start with the workflow, not the technology — what process do you want to improve?',
          'Map every step: what happens, who does it, what goes in, what comes out',
          'For each step, ask: should this be automated (AI does it), assisted (AI helps), or human (no AI)?',
          'The biggest value is usually in the handoffs and bottlenecks, not the core tasks',
          'Not every step needs AI — the skill is knowing where it adds value and where it does not',
        ],
        practiceTask: {
          title: 'Map a Real Workflow',
          instructions: 'Choose a multi-step workflow from your work and map it. Identify where AI fits at each step.',
          scenario: 'Pick a workflow you do at least weekly:\n\n1. List every step from start to finish (even the ones you do on autopilot)\n2. For each step: what goes in? What comes out? Who does it? How long does it take?\n3. Identify the bottlenecks: which steps slow things down or cause errors?\n4. For each step, decide: Automate (AI does it), Assist (AI helps you do it faster), or Human (no AI)\n5. Sketch the improved workflow — what does it look like with AI integrated?',
          hints: [
            'Common workflows: loan origination, compliance review, report generation, customer onboarding',
            'Bottlenecks are often in handoffs between people or systems — those are high-value targets for AI',
            'Do not try to automate everything — the best workflows have clear human checkpoints',
            'Ask a colleague to review your map — they may see steps you forgot or bottlenecks you missed',
          ],
          successCriteria: [
            'User mapped a multi-step workflow with at least 5 steps',
            'Each step has identified inputs, outputs, and current owner',
            'User classified each step as Automate, Assist, or Human',
            'User identified at least 2 steps where AI adds clear value',
          ],
        },
      },
    },

    // ─── Module 5-2: Design Your Workflow ─────────────────────────────────
    {
      id: '5-2',
      title: 'Design Your Workflow',
      type: 'exercise',
      description: 'Design a multi-step AI workflow using agents, tools, and human checkpoints',
      estimatedTime: '25 min',
      learningObjectives: [
        'Design a multi-step workflow that connects agents, tools, and human review points',
        'Define triggers, steps, handoffs, and quality checkpoints',
        'Build a prototype workflow, even if rough — the goal is a working concept, not a finished product',
      ],
      learningOutcome: 'After this module, you have designed a multi-step workflow that integrates AI agents, tools, and human oversight into a real process from your work.',
      content: {
        overview: 'Take your workflow map from Module 1 and turn it into a design. For each step where you marked "Automate" or "Assist," specify what AI component does the work: a custom agent, a functional agent, a tool, or a combination. Add human review checkpoints where accuracy and judgment matter.\n\nThis is where the Workflow Builder comes in — a tool for stitching together multi-step AI processes with clear inputs, outputs, and handoffs at each stage.',
        keyPoints: [
          'Each automated step needs: a trigger (what starts it), an input, an AI component, an output, and a quality check',
          'Human review checkpoints are essential — especially for anything customer-facing, financial, or regulatory',
          'Connect the steps: the output of one step becomes the input of the next',
          'Start simple — a 3-step workflow that works is better than a 10-step workflow that does not',
          'The Workflow Builder helps you define triggers, steps, and handoffs visually',
        ],
        practiceTask: {
          title: 'Build a Prototype Workflow',
          instructions: 'Using the Workflow Builder, design a multi-step AI workflow based on your map from Module 1. Include at least one human review checkpoint.',
          scenario: 'Turn your workflow map into a working design:\n\n1. Define the trigger: what starts this workflow? (a new loan application, a customer email, a regulatory update)\n2. Design each step: what AI component handles it? What is the input and output?\n3. Add human review checkpoints: where does a person need to verify, approve, or decide?\n4. Connect the steps: how does output from one step flow into the next?\n5. Test with a realistic scenario: walk through the workflow mentally or with sample data',
          hints: [
            'Start with 3-5 steps — you can always add complexity later',
            'Every step that touches customers, finances, or compliance needs a human checkpoint',
            'The trigger is critical — a good trigger means the workflow runs without you remembering to start it',
            'If a step is too complex for one AI component, break it into two simpler steps',
          ],
          successCriteria: [
            'User designed a workflow with at least 3 steps',
            'Workflow includes at least one human review checkpoint',
            'Each step has a defined trigger, input, AI component, and output',
            'User can walk through the workflow with a realistic scenario',
          ],
        },
      },
    },

    // ─── Module 5-3: Stitch It Together ───────────────────────────────────
    {
      id: '5-3',
      title: 'Stitch It Together',
      type: 'exercise',
      description: 'Connect your custom agents, functional agents, and workflows into a cohesive stack',
      estimatedTime: '20 min',
      learningObjectives: [
        'Connect components from Sessions 3, 4, and 5 into a working system',
        'Test the full end-to-end workflow with realistic inputs',
        'Identify gaps, failure points, and opportunities for improvement',
      ],
      learningOutcome: 'After this module, you have a prototype AI stack that connects multiple components into a working system for your actual work.',
      content: {
        overview: 'Now stitch it together. Your custom agent from Session 3, the functional tools from Session 4, and the workflow design from Module 2 — connect them into something that works end to end.\n\nThis will not be perfect. That is the point. A rough prototype that works teaches you more than a perfect design that never gets built.',
        keyPoints: [
          'Connect the pieces: custom agent → functional tool → workflow step → human review',
          'Test end to end with realistic inputs — not just individual components',
          'Expect failures — they show you where the design needs strengthening',
          'Document what works and what does not — this is your iteration roadmap',
          'A rough prototype that works is worth more than a perfect plan',
        ],
        practiceTask: {
          title: 'End-to-End Test',
          instructions: 'Connect your components and run the full workflow with a realistic scenario. Document what works and what breaks.',
          scenario: 'Bring your components together:\n\n1. Set up the full workflow with all connected components\n2. Choose a realistic test scenario (a real task from your work, if possible)\n3. Run the workflow end to end — step by step\n4. At each step: did the AI component produce what you expected? Did the handoff work?\n5. Document: what worked, what broke, and what you would change\n6. Identify the single highest-impact improvement you could make',
          hints: [
            'Run the test yourself first before involving anyone else',
            'When something breaks, note whether it is the AI component, the handoff, or the input',
            'The first end-to-end run always reveals surprises — that is expected and valuable',
            'Focus on the critical path: what is the minimum that must work for the workflow to be useful?',
          ],
          successCriteria: [
            'User connected at least 2 components into a working workflow',
            'User ran the workflow end to end with a realistic scenario',
            'User documented what worked and what broke',
            'User identified the highest-impact improvement',
          ],
        },
      },
    },

    // ─── Module 5-4: Prototype & Test ─────────────────────────────────────
    {
      id: '5-4',
      title: 'Prototype & Test',
      type: 'exercise',
      description: 'Refine your prototype based on testing — iterate until it is useful enough to use for real',
      estimatedTime: '20 min',
      learningObjectives: [
        'Iterate on your prototype based on end-to-end test results',
        'Fix the highest-impact issues first, then refine secondary concerns',
        'Determine when the prototype is "good enough to use" — not perfect, but useful',
      ],
      learningOutcome: 'After this module, your AI stack prototype is refined enough to use on real work — not a demo, but a working tool.',
      content: {
        overview: 'Take what you learned from end-to-end testing and iterate. Fix the biggest problem first. Then the next. Then decide: is this good enough to use on real work? The bar is not perfection — it is "I would use this tomorrow."',
        keyPoints: [
          'Fix the highest-impact issue from your testing first — do not try to fix everything at once',
          'Each iteration should improve one thing measurably',
          'The "good enough" bar: would you use this on real work tomorrow?',
          'Share with a colleague for a second perspective — they will find issues you missed',
          'Document your stack: what it does, how it works, and what it does not handle',
        ],
        practiceTask: {
          title: 'Iterate and Refine',
          instructions: 'Fix the top issues from your testing, re-run the workflow, and determine if it is ready for real use.',
          scenario: 'Take your test results from Module 3:\n\n1. Identify the top 2-3 issues to fix\n2. Fix the highest-impact issue first\n3. Re-run the workflow — did the fix work? Did it create new issues?\n4. Fix the next issue and re-run\n5. Ask yourself: "Would I use this on real work tomorrow?" If yes, it is ready. If no, what is the one thing still blocking you?',
          hints: [
            'Do not try to fix everything — prioritize ruthlessly',
            'If an issue is too complex to fix now, document it and work around it',
            'Share with a colleague: "Try this workflow on your version of this task — does it work?"',
            'Good enough is the goal — you can always iterate later',
          ],
          successCriteria: [
            'User fixed at least one issue from end-to-end testing',
            'User re-ran the workflow after fixes and verified improvement',
            'User made a judgment call: is this ready for real use?',
            'User documented remaining known issues for future iteration',
          ],
        },
      },
    },

    // ─── Module 5-5: Present & Reflect ────────────────────────────────────
    {
      id: '5-5',
      title: 'Present & Reflect',
      type: 'sandbox',
      description: 'Present your Frankenstein — what you built, what you learned, and what comes next',
      estimatedTime: '15 min',
      learningObjectives: [
        'Present your AI stack: what it does, how it works, and what value it provides',
        'Reflect on the journey from Session 1 to Session 5',
        'Identify next steps: what would make your stack more useful, and what new workflows could you tackle?',
      ],
      learningOutcome: 'After this module, you can articulate what you built, why it matters, and what you would do next — and you have a working AI stack you actually use.',
      content: {
        overview: 'This is your final module. Present what you built. Reflect on what worked. Identify what comes next.\n\nYour Frankenstein is unique. No one else\'s looks exactly like yours, because no one else has your role, your workflows, or your priorities. That is the point — AI is most powerful when it is shaped around how you actually work.',
        keyPoints: [
          'Present: what does your stack do? Who is it for? What problem does it solve?',
          'Reflect: what was the hardest part? What surprised you? What would you do differently?',
          'Next steps: what would make this 10x more useful? What new workflow would you tackle next?',
          'Share: who else at your organization could benefit from what you learned?',
          'This is not the end — it is the beginning of your AI-native workflow',
        ],
        practiceTask: {
          title: 'Your Frankenstein Presentation',
          instructions: 'Summarize what you built, what you learned, and what comes next. Share with Andrea for feedback.',
          scenario: 'Tell the story of your Frankenstein:\n\n1. What problem does your AI stack solve?\n2. How does it work? (Walk through the workflow step by step)\n3. What value does it provide? (Time saved, quality improved, errors reduced)\n4. What was the hardest part of building it?\n5. What would you add or change if you had another session?\n6. Who else at your organization should build something like this?\n\nShare your presentation with Andrea for strategic feedback on where to go next.',
          hints: [
            'Be honest about what does not work yet — that is where the next improvement lives',
            'If you can quantify the value (time saved per week, errors prevented), include it',
            'Think about team scale: could others use your stack? Could you teach them?',
            'Andrea will push you on ambition — be ready for "what is the bigger version of this?"',
          ],
          successCriteria: [
            'User presented a clear description of their AI stack',
            'Presentation includes the problem solved and value provided',
            'User reflected on what they learned across all 5 sessions',
            'User identified at least one concrete next step for improvement or expansion',
          ],
        },
      },
    },
  ],
};

// ═════════════════════════════════════════════════════════════════════════════
// KNOWLEDGE CHECKS — Retrieval practice at the END of each session
// These questions close each session and prime what comes next.
// ═════════════════════════════════════════════════════════════════════════════

export const KNOWLEDGE_CHECKS: Record<number, string[]> = {
  1: [
    'What is the Flipped Interaction Pattern, and when would you use it?',
    'Describe the difference between the first AI response and a useful final output — what happens in between?',
    'What is a self-review loop? Walk through the steps.',
  ],
  2: [
    'Name the 5 elements of the CLEAR Framework and what each stands for.',
    'What is the difference between output templating and multi-shot prompting? When would you use each?',
    'Describe a situation where you would choose a reasoning model over the default model.',
  ],
  3: [
    'What are the Four Levels of AI interaction? Give a one-sentence description of each.',
    'What is the difference between an agent\'s knowledge and the files a user provides?',
    'Describe what changes when an agent gets tool access — how does its role shift?',
  ],
  4: [
    'Name one functional agent available in your tool stack and describe a task you used it for.',
    'What is the difference between a custom agent (Session 3) and a functional agent (Session 4)?',
    'Describe a workflow where you would combine a custom agent with a functional agent.',
  ],
};

// ═════════════════════════════════════════════════════════════════════════════
// ELECTIVE PATHS — Absorbed into core curriculum
// Paths 2-4 removed. Path 1 (Advanced Prompt Engineering) absorbed into
// Session 1 (Self-Review Loops) and Session 2 (Multi-Shot, Chain-of-Thought).
// Empty array preserved for backward compatibility with existing UI routes.
// ═════════════════════════════════════════════════════════════════════════════

export interface ElectivePath {
  id: string;
  title: string;
  description: string;
  prerequisite: string;
  depth?: 'survey' | 'deep' | 'specialist';
  modules: ModuleContent[];
}

export const ELECTIVE_PATHS: ElectivePath[] = [];

// ═════════════════════════════════════════════════════════════════════════════
// ALL SESSION CONTENT — Master index
// ═════════════════════════════════════════════════════════════════════════════

export const ALL_SESSION_CONTENT: Record<number, SessionContent> = {
  1: SESSION_1_CONTENT,
  2: SESSION_2_CONTENT,
  3: SESSION_3_CONTENT,
  4: SESSION_4_CONTENT,
  5: SESSION_5_CONTENT,
};
