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
      successCriteria: {
        primary: string[];
        supporting: string[];
      };
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
  title: 'AI Fundamentals & Your First Win',
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

    // ─── Module 1-2: Interface Orientation ────────────────────────────────
    {
      id: '1-2',
      title: 'Interface Orientation',
      type: 'document',
      description: 'Learn the basics of your AI interface — just enough to begin, not a feature walkthrough',
      estimatedTime: '8 min',
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
          instructions: 'Upload a text document using the + button and ask the AI to review or summarize it.',
          scenario: 'Click the + button at the left of the input bar to attach a text file from your computer (.txt, .csv, .md, .json, or similar). Once attached, ask the AI to summarize it, extract key points, or identify anything interesting. Read the response. That is the entire exercise — upload a document, ask about it, and read what comes back.',
          hints: [
            'Click the + button at the left of the input bar to upload a file',
            'Supported file types include .txt, .csv, .md, .json, .xml, .html, .log, and more',
            'Try asking the AI to summarize, extract key points, or identify patterns in your document',
          ],
          successCriteria: {
            primary: [
              'User uploaded a document using the + button',
              'User received an AI response about the uploaded document',
            ],
            supporting: [
              'User can locate the + button and understands how to attach files',
            ],
          },
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

    // ─── Module 1-4: Your First Win ───────────────────────────────────────
    {
      id: '1-4',
      title: 'Your First Win',
      type: 'exercise',
      description: 'Complete one practical task that fits your actual work — and produce something you could use',
      estimatedTime: '15 min',
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

    // ─── Module 1-5: The Flipped Interaction ──────────────────────────────
    {
      id: '1-5',
      title: 'The Flipped Interaction',
      type: 'exercise',
      description: 'Let the AI ask you questions instead of crafting the perfect prompt — the most powerful move in conversational AI',
      estimatedTime: '15 min',
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

    // ─── Module 1-6: Iteration ────────────────────────────────────────────
    {
      id: '1-6',
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
            'Your conversation from Module 4 has been carried over — just pick up where you left off and push the output further',
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

    // ─── Module 1-7: Sandbox ──────────────────────────────────────────────
    {
      id: '1-7',
      title: 'Sandbox',
      type: 'sandbox',
      description: 'Free exploration — apply the patterns from this session to anything you want',
      estimatedTime: '15 min',
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
  ],
};

// ═════════════════════════════════════════════════════════════════════════════
// SESSION 2: STRUCTURED INTERACTION, MODELS & TOOLS
// Andrea Tier: Collaborative — guided discovery, probing questions, less directive
// Design constraint: Everything must still work. More complexity, no unpredictability.
// ═════════════════════════════════════════════════════════════════════════════

export const SESSION_2_CONTENT: SessionContent = {
  id: 2,
  title: 'Prompting Frameworks & Model Selection',
  description: 'Move from casual conversation to professional-grade AI use — understand limitations, add structure, and choose the right model and tools for each task',
  modules: [
    // ─── Module 2-1: AI Limitations & Critical Evaluation (NEW) ───────────
    {
      id: '2-1',
      title: 'AI Limitations & Critical Evaluation',
      type: 'document',
      description: 'Understand where AI confidently gets things wrong — and build the habit of verification before trust',
      estimatedTime: '15 min',
      learningObjectives: [
        'Identify the three most common AI failure modes: hallucination, confident incorrectness, and context drift',
        'Develop a personal verification habit for AI output — especially for facts, figures, and claims',
        'Distinguish between tasks where AI is reliable and tasks where human verification is essential',
      ],
      learningOutcome: 'After this module, you instinctively verify AI output before trusting it — and you know where AI is most likely to get things wrong.',
      content: {
        overview: 'Before you learn to make AI more powerful (which is the rest of this session), you need to understand where it fails. AI does not signal uncertainty the way a human colleague would. It does not say "I am not sure about this" — it says wrong things with the same confidence as right things. This module teaches you to recognize that pattern and build the habit of verification.\n\nThis is not about being skeptical of AI. It is about being calibrated. You should trust AI where it is reliable and verify where it is not.',
        keyPoints: [
          'Hallucination: AI generates plausible-sounding information that is completely fabricated — names, dates, statistics, citations',
          'Confident incorrectness: AI presents wrong information with the same tone and structure as correct information — there is no visual signal',
          'Context drift: in long conversations, the AI may lose track of earlier constraints or requirements you set',
          'Verification is not optional for professional use — especially for facts, figures, regulatory references, and citations',
          'AI is most reliable for structure, drafting, and reasoning scaffolding — least reliable for specific facts, numbers, and references',
        ],
        examples: [
          {
            title: 'Hallucination in Action',
            bad: 'You ask AI to cite industry standards for a report. It produces three standard references with realistic-looking numbers and titles. Two of them do not exist — the AI fabricated them because they sounded plausible.',
            good: 'You ask AI to cite industry standards, then verify each reference independently. You find one is fabricated and replace it with a real citation. The final report is accurate because you verified before using it.',
            explanation: 'The AI did not signal that it was unsure. The fabricated references looked identical to the real ones. The only difference was the human verification step.',
          },
        ],
        practiceTask: {
          title: 'Test the Limits',
          instructions: 'Ask the AI for specific factual claims related to your work. Then verify at least two of those claims independently. Document what was accurate and what was not.',
          scenario: 'Choose a topic you know well from your professional domain:\n\n1. Ask the AI for 5 specific facts, statistics, or references related to that topic\n2. Independently verify at least 2 of the claims (search online, check your reference materials)\n3. Were any claims wrong? Were they presented with the same confidence as the correct ones?\n4. Ask the AI a question where the answer is "I do not know" — does it admit uncertainty or confabulate?\n5. Reflect: how would you build verification into your workflow for AI-assisted work?',
          hints: [
            'Ask about specific numbers, dates, or standards — these are the most common hallucination targets',
            'Try asking the AI for a citation or reference — then look it up. Does it exist?',
            'The goal is not to catch the AI being wrong — it is to build the verification habit',
            'In professional contexts, one fabricated statistic in a report can undermine the entire document',
          ],
          successCriteria: {
            primary: [
              'User asked the AI for specific factual claims and independently verified at least two',
              'User identified at least one instance where the AI was wrong or fabricated information, or confirmed all claims were accurate through verification',
            ],
            supporting: [
              'User can describe the difference between tasks where AI is reliable vs. where verification is essential',
              'User articulated how they would build verification into their professional workflow',
            ],
          },
        },
      },
    },

    // ─── Module 2-2: Self-Review Loops (Moved from Session 1) ─────────────
    {
      id: '2-2',
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
        overview: 'After learning about AI limitations in Module 1, you have a natural question: "How do I improve the quality of what I get?" Self-review loops answer that question with a technique instead of a checklist. You ask the AI to score its own output against criteria you define, identify weaknesses, and produce a revised version. Then you — not the AI — decide whether the revision is actually better.\n\nThis replaces the instinct to paste the output into a new conversation and start fresh. Self-review loops keep the context and compound it.',
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
          instructions: 'Take any output from Session 1 or create a new draft. Run a self-review loop: define criteria, ask for critique, request revision, compare.',
          scenario: 'Pick the best output you have generated so far. Now:\n\n1. Define 2-3 criteria that matter for this specific output (e.g., accuracy, clarity, appropriate tone, completeness, actionability)\n2. Ask the AI: "Review this output against these criteria and identify what is weak or missing"\n3. Ask: "Now produce a revised version that addresses your critique"\n4. Compare the original and the revision — what improved? What did the AI miss? What would you change yourself?',
          hints: [
            'Be specific with your criteria — "Is it good?" is too vague; "Is it clear enough for someone with no context?" is useful',
            'If the AI\'s critique seems off, push back: "I disagree with point 2 — here is why"',
            'The revision is not always better — sometimes the original was fine and the AI over-corrected',
            'Notice that the critique format (criteria → assessment → revision) works for any type of output',
          ],
          successCriteria: {
            primary: [
              'User defined at least 2 specific review criteria relevant to their output',
              'User requested a self-critique from the AI using those criteria',
            ],
            supporting: [
              'User compared original and revised versions and articulated preference',
              'User made an independent judgment about which version is better and why',
            ],
          },
        },
      },
    },

    // ─── Module 2-3: Structured Prompting (CLEAR Framework) ───────────────
    {
      id: '2-3',
      title: 'Structured Prompting',
      type: 'exercise',
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
        overview: 'In Session 1, you learned to have a conversation. That is still valid — and often sufficient. But when the task is specific, high-stakes, or requires a particular kind of output, the CLEAR Framework gives you a structured approach to get it right the first time.\n\n**CLEAR** stands for:\n\n**C — Context**: Set the scene. Tell the AI who it is acting as and what background it needs. *Why it matters:* Without context, the AI guesses your situation — and usually guesses wrong. A "credit memo" means something different to a loan officer vs. an auditor.\n\n**L — Length/Format**: Specify how the output should be structured and how long it should be. *Why it matters:* AI defaults to long, generic formats. Telling it "one-page executive summary with bullet points" saves you from editing a 3-page essay down.\n\n**E — Examples**: Show what good looks like. Paste a sample, describe a template, or reference a prior output. *Why it matters:* Examples are the fastest way to align the AI with your expectations. One good example beats a paragraph of instructions.\n\n**A — Audience**: Say who will read this and what tone/detail level they expect. *Why it matters:* A board report and a team Slack message require completely different language. The AI can only match your audience if you tell it who they are.\n\n**R — Requirements**: State the specific task, constraints, and must-haves. *Why it matters:* This is your checklist. Without explicit requirements, the AI will deliver something plausible but incomplete — missing the one thing you actually needed.\n\nYou do not need every element for every task. Casual conversation is still your default. CLEAR is for when you need the output to be exactly right.',
        keyPoints: [
          'C — Context: Set the scene — who is the AI acting as and what background does it need?',
          'L — Length/Format: Specify structure, length, and format of the output',
          'E — Examples: Show what good looks like — one example beats a paragraph of instructions',
          'A — Audience: Who will read this? Match tone and detail level to the reader',
          'R — Requirements: State the specific task, constraints, and must-haves',
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
          title: 'Build a CLEAR Prompt Step by Step',
          instructions: 'Choose a real work task and build a CLEAR prompt one element at a time. Start with Context, then add Length/Format, Examples, Audience, and Requirements — submitting for Andrea\'s feedback after each step. By the end, you\'ll have a complete CLEAR prompt.',
          scenario: 'Pick a task that matters to your work — something you\'d actually want AI help with.\n\n1. Start by writing just the **C — Context** for your prompt. Submit for feedback.\n2. Add the **L — Length/Format**. Submit for feedback.\n3. Add **E — Examples** (or explain why you\'re skipping it). Submit for feedback.\n4. Add **A — Audience**. Submit for feedback.\n5. Add **R — Requirements**. Submit your complete CLEAR prompt for final feedback.\n\nBuild each element one at a time. Andrea will coach you through each step before you move to the next.',
          hints: [
            'Start with Context — describe the role and background the AI needs',
            'For Length/Format, be specific: "one-page memo" or "3 bullet points" is better than "keep it short"',
            'Examples are optional — but if you have a sample of what good looks like, share it',
            'Audience drives tone: a board presentation needs different language than a team email',
            'Requirements are your checklist — what MUST be in the output?',
          ],
          successCriteria: {
            primary: [
              'User wrote both a casual and CLEAR-structured version of the same ask',
              'User compared the two outputs and articulated the difference',
            ],
            supporting: [
              'User identified at least one CLEAR element that had the biggest impact on quality',
              'User can explain when they would use CLEAR vs. casual conversation',
            ],
          },
        },
      },
    },

    // ─── Module 2-4: Output Templating (Explicit) ─────────────────────────
    {
      id: '2-4',
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
          successCriteria: {
            primary: [
              'User defined an output template before writing the ask',
              'Template includes at least 3 distinct sections or format specifications',
            ],
            supporting: [
              'Output closely matches the defined template structure',
              'User can explain why template-first produces better results than ask-first',
            ],
          },
        },
      },
    },

    // ─── Module 2-5: Outline Expander (NEW) ───────────────────────────────
    {
      id: '2-5',
      title: 'Outline Expander',
      type: 'exercise',
      description: 'Guide the AI with a rough structure and let it fill in the details — control shape, delegate substance',
      estimatedTime: '15 min',
      learningObjectives: [
        'Provide a rough outline or skeleton and let the AI expand each section with relevant content',
        'Control the shape of the output (sections, order, emphasis) while delegating the substance',
        'Combine the Outline Expander with output templating for maximum control over AI output',
      ],
      learningOutcome: 'After this module, you can hand the AI a rough skeleton and get back structured, expanded content that matches your vision — without writing every word yourself.',
      content: {
        overview: 'You learned in Session 1 to have a conversation and iterate. Now you learn to control the shape of what comes back before the AI writes a single word. The Outline Expander technique works like this: you provide the skeleton, the AI fills in the substance. You iterate on the structure, not the content.\n\nThis is different from output templating (Module 4) — templates define format, outlines define content structure. Together they give you full control.',
        keyPoints: [
          'Give the AI a numbered outline — even a rough one — and ask it to expand each section',
          'The outline is your control mechanism: you decide what comes first, what gets emphasis, what is included or excluded',
          'You can adjust the outline mid-conversation: "Move section 3 before section 2" or "Add a section on risks"',
          'Combine with output templating: the outline controls content, the template controls format',
          'This works for any structured document: reports, memos, proposals, training materials, presentations',
        ],
        examples: [
          {
            title: 'The Outline Expander in Practice',
            good: '"I want a training outline for new team members. Here is my rough structure:\n1. Introduction to our team\'s mission and approach\n2. Core processes and tools\n3. Documentation standards\n4. Key stakeholders and workflows\n5. First 30 days checklist\n\nExpand each section into 3-5 bullet points with the key topics to cover."',
            explanation: 'You provide the skeleton. The AI fills in the substance. You iterate on the result. This teaches you that you control the shape of the output — the AI fills in the details.',
          },
        ],
        practiceTask: {
          title: 'Expand Your Outline',
          instructions: 'Create a rough outline for a real work document. Ask the AI to expand it. Iterate on the structure until you have a complete first draft.',
          scenario: 'Choose a document you need to create for work — a report, proposal, memo, training guide, or plan:\n\n1. Write a rough outline with 4-7 sections (just the headers and maybe a one-line description of each)\n2. Ask the AI: "Expand each section into detailed content"\n3. Review: does the expanded version match your intent? Are the sections in the right order?\n4. Adjust the outline: add, remove, or reorder sections. Ask the AI to re-expand.\n5. Try combining with a template: "Now format this as a formal memo with executive summary"',
          hints: [
            'Start rough — even single-word section headers work as a starting point',
            'If a section is too long, split it: "Break section 3 into two separate sections"',
            'If a section is off-target, give a one-sentence description of what it should cover',
            'Try: "Expand section 2 in more detail and keep section 5 brief"',
          ],
          successCriteria: {
            primary: [
              'User provided a rough outline with at least 4 sections',
              'User asked the AI to expand the outline into detailed content',
            ],
            supporting: [
              'User iterated on the structure at least once (reordered, added, or removed sections)',
              'User can explain how outline-first differs from asking the AI to "write a document about X"',
            ],
          },
        },
      },
    },

    // ─── Module 2-6: Multi-Shot Prompting ─────────────────────────────────
    {
      id: '2-6',
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
              'User provided at least one example of existing work to the AI',
              'AI output visibly matched the style, tone, or format of the provided examples',
            ],
            supporting: [
              'User identified at least one element the examples communicated that words alone could not',
              'User can explain when multi-shot is more efficient than detailed instructions',
            ],
          },
        },
      },
    },

    // ─── Module 2-7: Model Selection ──────────────────────────────────────
    {
      id: '2-7',
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
              'User ran the same task through two different model modes',
              'User articulated a specific difference in output quality between the two modes',
            ],
            supporting: [
              'User identified at least one task from their work that should use each mode',
              'User demonstrated discernment — not just always choosing the most powerful model',
            ],
          },
        },
      },
    },

    // ─── Module 2-8: Chain-of-Thought Reasoning ───────────────────────────
    {
      id: '2-8',
      title: 'Chain-of-Thought Reasoning',
      type: 'exercise',
      description: 'Design prompts that produce auditable, traceable reasoning chains — not just summaries dressed as analysis',
      estimatedTime: '20 min',
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
              'User designed a reasoning chain with at least 3 explicit steps',
              'AI output followed the step-by-step structure',
            ],
            supporting: [
              'User identified the weakest step in the chain and articulated why',
              'User challenged or refined at least one step in the reasoning',
            ],
          },
        },
      },
    },

    // ─── Module 2-9: Web Search ────────────────────────────────────────────
    {
      id: '2-9',
      title: 'Web Search',
      type: 'exercise',
      description: 'Know when to turn web search on — and when to leave it off',
      estimatedTime: '15 min',
      learningObjectives: [
        'Understand what web search does: it lets the AI retrieve live information from the internet before responding',
        'Identify the specific situations where web search adds value — and the situations where it hurts',
        'Practice toggling web search on and off for different prompts and comparing the results',
      ],
      learningOutcome: 'After this module, you can make a deliberate decision about whether to enable web search for any given prompt — and explain why.',
      content: {
        overview: 'Web search is one of the most powerful tools available in AI assistants — but it is also one of the most misused. When enabled, the AI searches the internet before responding, grounding its answer in live sources. This is essential for some tasks and actively harmful for others.\n\nThe key insight: web search is not "better by default." It adds latency, can introduce noise from low-quality sources, and can distract the AI from using its own reasoning. The skill is knowing when live information is actually needed.\n\nUse the toggle in the toolbar below to turn web search on or off. Try the same prompt both ways and observe the difference.',
        keyPoints: [
          'TURN ON web search when you need: current data (rates, prices, news), recent events, real-time information, or facts that change frequently',
          'TURN ON web search when you need: verification of specific claims, current regulations, or up-to-date statistics',
          'LEAVE OFF web search when you are: drafting, brainstorming, analyzing, summarizing, or doing creative work',
          'LEAVE OFF web search when you are: working with information you already provided in the prompt or attached documents',
          'LEAVE OFF web search when you are: asking the AI to reason, compare options, or structure your thinking',
          'Web search adds response time — only enable it when the time trade-off is worth it',
          'Web search results vary in quality — always verify critical facts from search results against trusted sources',
        ],
        examples: [
          {
            title: 'When to Toggle Web Search',
            good: '🔍 ON — "What is the current 30-year fixed mortgage rate as of this week?"\n🔍 ON — "What were the key announcements from the latest FOMC meeting?"\n🔍 ON — "Find the most recent CFPB enforcement action against a mid-size bank"\n\n🔇 OFF — "Help me draft talking points for a team meeting about Q4 priorities"\n🔇 OFF — "Summarize the key themes from this document I uploaded"\n🔇 OFF — "Compare three approaches to structuring this client proposal"',
            explanation: 'The first three prompts need live data the AI cannot know from training alone. The last three are reasoning and drafting tasks where the AI\'s own capabilities are sufficient — web search would just add noise and latency.',
          },
        ],
        practiceTask: {
          title: 'Web Search On vs. Off',
          instructions: 'Use the web search toggle in the toolbar to practice turning search on and off. Try the same or similar prompts both ways and observe how the responses differ.',
          scenario: 'Try these three experiments:\n\n1. SEARCH ON: Ask for something that requires current, real-time data (a rate, a recent event, a regulation update). Note how the AI cites sources.\n\n2. SEARCH OFF: Ask the AI to help you draft, brainstorm, or analyze something from your work. Notice it responds faster and stays focused on reasoning.\n\n3. COMPARE: Pick one prompt and try it with search ON, then OFF. Which response is more useful for your actual need?\n\nPay attention to: response speed, source quality, and whether the web results actually improved the answer.',
          hints: [
            'If the AI says "as of my last training data" or "I don\'t have access to current information" — that is a signal to turn on web search',
            'If the AI\'s response is cluttered with citations and source links when you just wanted a draft — turn off web search',
            'For anything time-sensitive (rates, news, regulations, recent events), web search is almost always the right call',
            'For anything creative (drafting, brainstorming, structuring) web search is almost always the wrong call',
            'Compare response times: web search typically adds 3-10 seconds of latency',
          ],
          successCriteria: {
            primary: [
              'User toggled web search on and off during the conversation for different prompts',
              'User correctly identified at least one task that benefits from web search and one that does not',
            ],
            supporting: [
              'User compared the same prompt with search on vs. off and articulated the difference',
              'User can explain the trade-off (accuracy vs. speed, grounding vs. noise) for a specific scenario',
            ],
          },
        },
      },
    },

    // ─── Module 2-10: Sandbox ─────────────────────────────────────────────
    {
      id: '2-10',
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
          successCriteria: {
            primary: [
              'User applied at least two Session 2 techniques in combination',
              'User used at least one tool (web search, file upload) on a task',
            ],
            supporting: [
              'User can articulate which techniques they found most useful for their role',
            ],
          },
        },
      },
    },
  ],
};

// ═════════════════════════════════════════════════════════════════════════════
// SESSION 3: SKILLS & PROJECTS
// Andrea Tier: Peer — Socratic questioning, challenges vague thinking, pushes
// for specificity in use case definition. Does not hand-hold.
// ═════════════════════════════════════════════════════════════════════════════


export const SESSION_3_CONTENT: SessionContent = {
  id: 3,
  title: 'Skills & Projects — Your AI Specialists',
  description: 'Build reusable AI specialists that make every interaction more relevant, consistent, and efficient — using the customization tools every major platform now offers',
  modules: [
    // ─── Module 3-1: Why Customization Matters ─────────────────────────────
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

    // ─── Module 3-2: Understanding Projects ────────────────────────────────
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

    // ─── Module 3-3: Building Your First Skill ─────────────────────────────
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

    // ─── Module 3-4: Adding Knowledge to Skills ────────────────────────────
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

    // ─── Module 3-5: Skills and Projects Together ──────────────────────────
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

    // ─── Module 3-6: Sharing and Scaling ───────────────────────────────────
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

    // ─── Module 3-7: Sandbox / Capstone ────────────────────────────────────
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
  ],
};

// ═════════════════════════════════════════════════════════════════════════════
// SESSION 4: AGENTS & AUTONOMY
// Andrea Tier: Advisor — strategic consulting perspective, pushes for ambition
// Design: Users now understand skills and projects. This session introduces
// agents — autonomous systems that monitor, decide, and act within boundaries.
// ═════════════════════════════════════════════════════════════════════════════

export const SESSION_4_CONTENT: SessionContent = {
  id: 4,
  title: 'Agents & Autonomy',
  description: 'Move from skills you invoke to agents that act — and build the governance to make autonomy safe',
  modules: [
    // ─── Module 4-1: From Skills to Agents ────────────────────────────────
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

    // ─── Module 4-2: Agents as Skill Orchestrators ────────────────────────
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

    // ─── Module 4-3: Build a Working Agent ────────────────────────────────
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

    // ─── Module 4-4: Adding Tools and Actions ─────────────────────────────
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

    // ─── Module 4-5: Governance and Compliance ────────────────────────────
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

    // ─── Module 4-6: Agent Deployment and Sharing ─────────────────────────
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

    // ─── Module 4-7: Sandbox / Capstone ───────────────────────────────────
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
  ],
};

// ═════════════════════════════════════════════════════════════════════════════
// SESSION 5: AI IN YOUR EVERYDAY TOOLS
// Andrea Tier: Advisor — strategic consulting perspective, pushes for ambition
// Design: Users now have skills and agents. This session covers AI features
// already built into the tools they use every day.
// ═════════════════════════════════════════════════════════════════════════════

export const SESSION_5_CONTENT: SessionContent = {
  id: 5,
  title: 'AI in Your Everyday Tools',
  description: 'Learn to use AI features already built into the tools you use every day — choose the path most relevant to your work',
  modules: [
    // ─── Module 5-1: What Are Functional Agents? ──────────────────────────
    {
      id: '5-1',
      title: 'What Are Functional Agents?',
      type: 'document',
      description: 'Understand agents built into the tools you already use — and how to recognize them',
      estimatedTime: '10 min',
      isGateModule: true,
      learningObjectives: [
        'Recognize that AI agents are already embedded in tools you use daily (spreadsheets, presentations, email)',
        'Understand the difference between a custom skill or agent (Sessions 3-4) and a functional agent (built into a tool)',
        'Identify which functional agents are available in your organization\'s configured platform',
      ],
      learningOutcome: 'After this module, you can identify functional agents in your existing tools and understand when to use them vs. building a custom skill or agent.',
      content: {
        overview: 'In Sessions 3 and 4, you built skills, projects, and agents from scratch. But agents are already embedded in the tools you use every day — your spreadsheet software, your presentation tool, your email client. These functional agents are pre-built for specific tasks within those tools.\n\nThe key insight: you do not always need to build from scratch. Sometimes the right agent is already waiting for you in a tool you already have.',
        keyPoints: [
          'Functional agents are pre-built AI capabilities embedded in existing software',
          'They are optimized for specific tasks within their tool (data analysis in spreadsheets, content generation in presentations)',
          'Custom skills and agents (Sessions 3-4) are flexible but require setup; functional agents are ready to use but less customizable',
          'The right choice depends on the task: use functional agents for tool-specific work, custom skills and agents for cross-cutting workflows',
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
          successCriteria: {
            primary: [
              'User identified at least 3 tools with functional AI agents or features',
              'User can describe what each functional agent does (even if they have not used it)',
            ],
            supporting: [
              'User identified at least one task they could use a functional agent for this week',
            ],
          },
        },
      },
    },

    // ─── Module 5-2: AI in Your Spreadsheet ──────────────────────────────
    {
      id: '5-2',
      title: 'AI in Your Spreadsheet',
      type: 'exercise',
      description: 'Use AI features in Excel or Google Sheets for data analysis, formula generation, and insights',
      estimatedTime: '20 min',
      isGateModule: true,
      learningObjectives: [
        'Use AI to generate formulas, pivot tables, or charts from natural language descriptions',
        'Ask AI to analyze data patterns, trends, or anomalies in your spreadsheets',
        'Understand what the spreadsheet AI does well and where it breaks down or misleads',
      ],
      learningOutcome: 'After this module, you can use AI features in your spreadsheet tool to accelerate data work you already do.',
      content: {
        overview: 'Your spreadsheet tool has AI built in. You can describe what you want in plain language — "Create a pivot table showing revenue by month and category" — and the AI generates it. This is not about replacing your spreadsheet skills. It is about accelerating the work you already do.\n\nThe key to using AI in spreadsheets: be specific about what you want, verify the formulas it generates, and watch for errors in complex calculations.',
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
          successCriteria: {
            primary: [
              'User generated at least one formula using AI',
              'User created at least one visualization (chart or pivot table) using AI',
            ],
            supporting: [
              'User verified at least one AI-generated output for accuracy',
              'User identified at least one limitation or error in the AI\'s spreadsheet work',
            ],
          },
        },
      },
    },

    // ─── Module 5-3: AI in Your Presentations ─────────────────────────────
    {
      id: '5-3',
      title: 'AI in Your Presentations',
      type: 'exercise',
      description: 'Use AI features in PowerPoint or Google Slides for content generation, design, and speaker notes',
      estimatedTime: '20 min',
      isGateModule: true,
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
          successCriteria: {
            primary: [
              'User generated an outline or slide content using AI',
              'User created speaker notes for at least one slide',
            ],
            supporting: [
              'User reviewed AI-generated content and identified improvements needed',
              'User can describe when AI presentation features save time vs. when they do not',
            ],
          },
        },
      },
    },

    // ─── Module 5-4: AI in Your Inbox ─────────────────────────────────────
    {
      id: '5-4',
      title: 'AI in Your Inbox',
      type: 'exercise',
      description: 'Use AI features in your email client for drafting, summarizing, and managing communications',
      estimatedTime: '15 min',
      isGateModule: true,
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
          successCriteria: {
            primary: [
              'User drafted at least one email response using AI assistance',
              'User adjusted the AI draft for tone, accuracy, or context',
            ],
            supporting: [
              'User can identify at least one email type where AI saves time and one where it should not be used',
            ],
          },
        },
      },
    },

    // ─── Module 5-5: Sandbox ──────────────────────────────────────────────
    {
      id: '5-5',
      title: 'Sandbox',
      type: 'sandbox',
      description: 'Explore functional agents in your tools — go deeper on the ones that matter most to your work',
      estimatedTime: '15 min',
      isGateModule: true,
      learningObjectives: [
        'Explore functional AI features in the tools most relevant to your daily work',
        'Combine functional agents with custom skills and agents from Sessions 3-4 for maximum productivity',
        'Develop a personal workflow that integrates AI across your tool stack',
      ],
      learningOutcome: 'After this module, you have identified the functional agents most useful for your work and started integrating them into your daily workflow.',
      content: {
        overview: 'You have explored AI in spreadsheets, presentations, and email. Now go deeper on the tools that matter most to your work. The goal is not to master every tool — it is to find the ones that save you the most time and make them habitual.',
        keyPoints: [
          'Go deep on the tools most relevant to your daily work — skip the ones you rarely use',
          'Try combining functional agents with custom skills and agents: use a custom skill or agent to generate content, then a functional agent to format it in your tool',
          'The best workflow is the one you will actually use — not the most sophisticated one',
          'Consider: which functional agent would save you the most time if you used it every day?',
        ],
        practiceTask: {
          title: 'Build Your Functional Agent Workflow',
          instructions: 'Pick the tool most relevant to your work and explore its AI features more deeply. Try combining it with the skills and agents you built in Sessions 3-4.',
          scenario: 'Choose the tool where you spend the most time:\n\n- If you live in spreadsheets: try more complex data analysis, forecasting, or automation\n- If you give frequent presentations: build an entire deck using AI assistance\n- If email is your bottleneck: set up templates and workflows for your most common email types\n- If you use other tools: explore their AI features with the same approach\n\nBonus: try a workflow that combines your skills and agents from Sessions 3-4 with a functional agent.',
          hints: [
            'Focus on one tool — depth beats breadth',
            'Ask: "If I could automate one task in this tool, what would save me the most time?"',
            'Try combining: generate content with your custom skill or agent, then format it using the tool\'s AI features',
            'Share what you learn with a colleague — they may benefit from the same workflow',
          ],
          successCriteria: {
            primary: [
              'User explored at least one functional agent in depth beyond the guided exercises',
              'User identified the most time-saving AI feature for their specific role',
            ],
            supporting: [
              'User can describe a workflow that combines custom skills or agents with functional agents',
            ],
          },
        },
      },
    },
  ],
};

// ═════════════════════════════════════════════════════════════════════════════
// SESSION 6: DESIGNING YOUR AI WORKFLOW
// Andrea Tier: Advisor — strategic consulting perspective, pushes for ambition
// Design: Open session for users who are bought in and ready to explore.
// Not a requirement — this is for users who want to go further.
// ═════════════════════════════════════════════════════════════════════════════

export const SESSION_6_CONTENT: SessionContent = {
  id: 6,
  title: 'Designing Your AI Workflow',
  description: 'Design your own AI stack — stitch the pieces together in the way that serves your work',
  modules: [
    // ─── Module 6-1: Map Your Stack ───────────────────────────────────────
    {
      id: '6-1',
      title: 'Map Your Stack',
      type: 'exercise',
      description: 'Identify a workflow in your work that AI could meaningfully improve — then map out what it would take',
      estimatedTime: '15 min',
      isGateModule: true,
      learningObjectives: [
        'Identify a multi-step workflow in your work that involves repetitive tasks, handoffs, or bottlenecks',
        'Map the workflow: steps, inputs, outputs, decision points, and where AI could add value',
        'Distinguish between steps that should be automated, assisted, or left to humans',
      ],
      learningOutcome: 'After this module, you have mapped a real workflow from your work and identified where AI fits — and where it does not.',
      content: {
        overview: 'You have built skills and agents. You have used functional tools. Now you design your own stack. The metaphor: you have seen how all of this works. Now build your Frankenstein — stitch the pieces together in the way that serves your work. No one else\'s Frankenstein looks exactly like yours, and that is the point.\n\nStart with the workflow, not the technology. Identify something you do regularly that involves multiple steps, handoffs, or bottlenecks. Map it. Then identify where AI can help at each step.',
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
            'Common workflows: new project intake, policy review, report generation, client onboarding',
            'Bottlenecks are often in handoffs between people or systems — those are high-value targets for AI',
            'Do not try to automate everything — the best workflows have clear human checkpoints',
            'Ask a colleague to review your map — they may see steps you forgot or bottlenecks you missed',
          ],
          successCriteria: {
            primary: [
              'User mapped a multi-step workflow with at least 5 steps',
              'Each step has identified inputs, outputs, and current owner',
            ],
            supporting: [
              'User classified each step as Automate, Assist, or Human',
              'User identified at least 2 steps where AI adds clear value',
            ],
          },
        },
      },
    },

    // ─── Module 6-2: Design Your Workflow ─────────────────────────────────
    {
      id: '6-2',
      title: 'Design Your Workflow',
      type: 'exercise',
      description: 'Design a multi-step AI workflow using agents, tools, and human checkpoints',
      estimatedTime: '25 min',
      isGateModule: true,
      learningObjectives: [
        'Design a multi-step workflow that connects agents, tools, and human review points',
        'Define triggers, steps, handoffs, and quality checkpoints',
        'Build a prototype workflow, even if rough — the goal is a working concept, not a finished product',
      ],
      learningOutcome: 'After this module, you have designed a multi-step workflow that integrates AI agents, tools, and human oversight into a real process from your work.',
      content: {
        overview: 'Take your workflow map from Module 1 and turn it into a design. For each step where you marked "Automate" or "Assist," specify what AI component does the work: a custom skill or agent, a functional agent, a tool, or a combination. Add human review checkpoints where accuracy and judgment matter.\n\nThis is where the Workflow Builder comes in — a tool for stitching together multi-step AI processes with clear inputs, outputs, and handoffs at each stage.',
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
          scenario: 'Turn your workflow map into a working design:\n\n1. Define the trigger: what starts this workflow? (a new project submission, a client request, a policy update)\n2. Design each step: what AI component handles it? What is the input and output?\n3. Add human review checkpoints: where does a person need to verify, approve, or decide?\n4. Connect the steps: how does output from one step flow into the next?\n5. Test with a realistic scenario: walk through the workflow mentally or with sample data',
          hints: [
            'Start with 3-5 steps — you can always add complexity later',
            'Every step that touches customers, finances, or compliance needs a human checkpoint',
            'The trigger is critical — a good trigger means the workflow runs without you remembering to start it',
            'If a step is too complex for one AI component, break it into two simpler steps',
          ],
          successCriteria: {
            primary: [
              'User designed a workflow with at least 3 steps',
              'Workflow includes at least one human review checkpoint',
            ],
            supporting: [
              'Each step has a defined trigger, input, AI component, and output',
              'User can walk through the workflow with a realistic scenario',
            ],
          },
        },
      },
    },

    // ─── Module 6-3: Stitch It Together ───────────────────────────────────
    {
      id: '6-3',
      title: 'Stitch It Together',
      type: 'exercise',
      description: 'Connect your custom skills, agents, functional agents, and workflows into a cohesive stack',
      estimatedTime: '20 min',
      isGateModule: true,
      learningObjectives: [
        'Connect components from Sessions 3, 4, 5, and 6 into a working system',
        'Test the full end-to-end workflow with realistic inputs',
        'Identify gaps, failure points, and opportunities for improvement',
      ],
      learningOutcome: 'After this module, you have a prototype AI stack that connects multiple components into a working system for your actual work.',
      content: {
        overview: 'Now stitch it together. Your skills from Session 3, agents from Session 4, functional tools from Session 5, and the workflow design from Module 2 — connect them into something that works end to end.\n\nThis will not be perfect. That is the point. A rough prototype that works teaches you more than a perfect design that never gets built.',
        keyPoints: [
          'Connect the pieces: custom skill or agent → functional tool → workflow step → human review',
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
          successCriteria: {
            primary: [
              'User connected at least 2 components into a working workflow',
              'User ran the workflow end to end with a realistic scenario',
            ],
            supporting: [
              'User documented what worked and what broke',
              'User identified the highest-impact improvement',
            ],
          },
        },
      },
    },

    // ─── Module 6-4: Prototype & Test ─────────────────────────────────────
    {
      id: '6-4',
      title: 'Prototype & Test',
      type: 'exercise',
      description: 'Refine your prototype based on testing — iterate until it is useful enough to use for real',
      estimatedTime: '20 min',
      isGateModule: true,
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
          successCriteria: {
            primary: [
              'User fixed at least one issue from end-to-end testing',
              'User re-ran the workflow after fixes and verified improvement',
            ],
            supporting: [
              'User made a judgment call: is this ready for real use?',
              'User documented remaining known issues for future iteration',
            ],
          },
        },
      },
    },

    // ─── Module 6-5: Present & Reflect ────────────────────────────────────
    {
      id: '6-5',
      title: 'Present & Reflect',
      type: 'sandbox',
      description: 'Present your Frankenstein — what you built, what you learned, and what comes next',
      estimatedTime: '15 min',
      isGateModule: true,
      learningObjectives: [
        'Present your AI stack: what it does, how it works, and what value it provides',
        'Reflect on the journey from Session 1 to Session 6',
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
          successCriteria: {
            primary: [
              'User presented a clear description of their AI stack',
              'Presentation includes the problem solved and value provided',
            ],
            supporting: [
              'User reflected on what they learned across all 6 sessions',
              'User identified at least one concrete next step for improvement or expansion',
            ],
          },
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
// PLATFORM TERMINOLOGY — Maps generic terms to platform-native equivalents
// Keyed by the `platform` column in the `organizations` table.
// UI components rendering Session 3-4 content substitute these at render time.
// ═════════════════════════════════════════════════════════════════════════════

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

// ═════════════════════════════════════════════════════════════════════════════
// ALL SESSION CONTENT — Master index
// ═════════════════════════════════════════════════════════════════════════════

export const ALL_SESSION_CONTENT: Record<number, SessionContent> = {
  1: SESSION_1_CONTENT,
  2: SESSION_2_CONTENT,
  3: SESSION_3_CONTENT,
  4: SESSION_4_CONTENT,
  5: SESSION_5_CONTENT,
  6: SESSION_6_CONTENT,
};
