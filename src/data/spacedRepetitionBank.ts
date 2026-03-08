/**
 * Spaced Repetition Question Bank
 * 3-5 retrieval questions per core module (Sessions 1-3), tagged by source module and skill cluster.
 * Questions are short-answer / recall prompts that Andrea injects mid-session to reinforce prior learning.
 */

export interface RetrievalQuestion {
  id: string;         // e.g. "1-1-q1"
  moduleId: string;   // source module e.g. "1-1"
  sessionId: number;  // 1, 2, or 3
  skill: string;      // short skill tag for scheduling weight
  question: string;   // the retrieval prompt Andrea asks
  keyAnswer: string;  // brief model answer for Andrea to reference when giving feedback
}

export const RETRIEVAL_BANK: RetrievalQuestion[] = [
  // ─── Session 1: Module 1-1 — Personalization ────────────────────────────
  {
    id: '1-1-q1', moduleId: '1-1', sessionId: 1, skill: 'personalization',
    question: 'Why does setting your role and department context before prompting improve AI output quality?',
    keyAnswer: 'Context allows the AI to tailor vocabulary, examples, and depth to your actual work — without it, responses are generic and require more iteration.',
  },
  {
    id: '1-1-q2', moduleId: '1-1', sessionId: 1, skill: 'personalization',
    question: 'What is the difference between a before and after comparison in AI-assisted work?',
    keyAnswer: 'Before shows a task done manually or with a generic prompt. After shows the same task with role context, producing output that matches your professional standards and saves iteration time.',
  },

  // ─── Session 1: Module 1-3 — Basic Interaction ──────────────────────────
  {
    id: '1-3-q1', moduleId: '1-3', sessionId: 1, skill: 'basic_interaction',
    question: 'What is the Flipped Interaction Pattern?',
    keyAnswer: 'Instead of giving the AI a detailed prompt, you ask the AI to interview you — it asks questions to understand your needs, then generates the output. This flips who drives the conversation.',
  },
  {
    id: '1-3-q2', moduleId: '1-3', sessionId: 1, skill: 'basic_interaction',
    question: 'What is the Outline Expander technique?',
    keyAnswer: 'Ask the AI to generate an outline first, then expand each section one at a time. This gives you control over structure before committing to full-length output.',
  },
  {
    id: '1-3-q3', moduleId: '1-3', sessionId: 1, skill: 'basic_interaction',
    question: 'When you paste raw notes into an AI and get a poor result, what is usually the cause?',
    keyAnswer: 'Missing context — the AI does not know the audience, purpose, or output format you need. A dirty paste works when followed up with specific direction.',
  },

  // ─── Session 1: Module 1-4 — Your First Win ────────────────────────────
  {
    id: '1-4-q1', moduleId: '1-4', sessionId: 1, skill: 'first_win',
    question: 'What makes a task a good candidate for your first AI win?',
    keyAnswer: 'A real work task that is time-consuming but low-stakes, where you can immediately verify the output quality against your professional standards.',
  },
  {
    id: '1-4-q2', moduleId: '1-4', sessionId: 1, skill: 'first_win',
    question: 'Why is it important to use a real work task rather than a test prompt for your first win?',
    keyAnswer: 'Real tasks reveal genuine value and pain points. Test prompts teach you about AI but do not demonstrate actual time savings or output quality improvements.',
  },

  // ─── Session 1: Module 1-5 — Iteration ──────────────────────────────────
  {
    id: '1-5-q1', moduleId: '1-5', sessionId: 1, skill: 'iteration',
    question: 'What is real-time output reshaping?',
    keyAnswer: 'Modifying AI output mid-stream by providing follow-up instructions — adjusting tone, adding sections, changing format — rather than starting over from scratch.',
  },
  {
    id: '1-5-q2', moduleId: '1-5', sessionId: 1, skill: 'iteration',
    question: 'What single change most commonly improves a vague first-draft prompt?',
    keyAnswer: 'Adding specific context — audience, purpose, or output format — so the AI knows what "good" looks like.',
  },
  {
    id: '1-5-q3', moduleId: '1-5', sessionId: 1, skill: 'iteration',
    question: 'After 3 iterations without improvement, what should you do before iterating further?',
    keyAnswer: 'Step back and reconsider the approach — the problem may be that you are asking one prompt to do too many things, or your context is insufficient.',
  },

  // ─── Session 1: Module 1-6 — Self-Review Loops ──────────────────────────
  {
    id: '1-6-q1', moduleId: '1-6', sessionId: 1, skill: 'self_review',
    question: 'What are the four steps of a self-review loop?',
    keyAnswer: 'Generate → Critique → Revise → Compare. You generate output, ask the AI to critique it against criteria, revise based on the critique, then compare versions.',
  },
  {
    id: '1-6-q2', moduleId: '1-6', sessionId: 1, skill: 'self_review',
    question: 'Why does asking AI to critique its own output improve quality?',
    keyAnswer: 'It catches surface-level issues — missing sections, inconsistent formatting, gaps in logic — that a casual read misses. It builds critical thinking rather than blind trust.',
  },
  {
    id: '1-6-q3', moduleId: '1-6', sessionId: 1, skill: 'self_review',
    question: 'Why is "it looks right" an insufficient review standard for AI output?',
    keyAnswer: 'AI hallucinations are designed to sound plausible — confident, well-formatted output can contain invisible errors that only structured verification catches.',
  },

  // ─── Session 2: Module 2-1 — Structured Prompting (CLEAR) ──────────────
  {
    id: '2-1-q1', moduleId: '2-1', sessionId: 2, skill: 'clear_framework',
    question: 'What does each letter of CLEAR stand for?',
    keyAnswer: 'Context, Length, Examples, Audience, Restrictions.',
  },
  {
    id: '2-1-q2', moduleId: '2-1', sessionId: 2, skill: 'clear_framework',
    question: 'Which CLEAR element addresses data security and what you cannot include in a prompt?',
    keyAnswer: 'R — Restrictions. It specifies what data is off-limits (PII, real account numbers) and any compliance constraints.',
  },
  {
    id: '2-1-q3', moduleId: '2-1', sessionId: 2, skill: 'clear_framework',
    question: 'Why is the CLEAR framework introduced in Session 2 rather than Session 1?',
    keyAnswer: 'Learners need basic interaction experience first — they must feel the problem (vague prompts, poor output) before the framework for solving it resonates.',
  },

  // ─── Session 2: Module 2-2 — Output Templating ─────────────────────────
  {
    id: '2-2-q1', moduleId: '2-2', sessionId: 2, skill: 'output_templating',
    question: 'What is the difference between implicit and explicit output templating?',
    keyAnswer: 'Implicit is when format emerges naturally from your prompt. Explicit is when you specify format up front: bullets vs. paragraphs, section headers, word count, structure.',
  },
  {
    id: '2-2-q2', moduleId: '2-2', sessionId: 2, skill: 'output_templating',
    question: 'Why should Output Rules specify format explicitly rather than leaving it to the AI?',
    keyAnswer: 'Without explicit format rules, output style varies with every request — headers appear inconsistently, length varies. Explicit rules lock in format for reliable, shareable deliverables.',
  },

  // ─── Session 2: Module 2-3 — Multi-Shot Prompting ──────────────────────
  {
    id: '2-3-q1', moduleId: '2-3', sessionId: 2, skill: 'multi_shot',
    question: 'What problem does multi-shot prompting solve that a single-instruction prompt cannot?',
    keyAnswer: 'Format consistency — multi-shot locks in the exact output structure by showing 2-3 examples of the format you want before asking for the real output.',
  },
  {
    id: '2-3-q2', moduleId: '2-3', sessionId: 2, skill: 'multi_shot',
    question: 'How many examples typically produce the best results in multi-shot prompting?',
    keyAnswer: '2-3 examples. One example shows the pattern, two confirm it, three is usually sufficient. More than three rarely improves results and adds token cost.',
  },

  // ─── Session 2: Module 2-4 — Model Selection ──────────────────────────
  {
    id: '2-4-q1', moduleId: '2-4', sessionId: 2, skill: 'model_selection',
    question: 'What factors should you consider when choosing between AI models for a task?',
    keyAnswer: 'Speed vs. quality tradeoff, cost per token, context window size, specialized capabilities (code, analysis, creative writing), and organizational approval status.',
  },
  {
    id: '2-4-q2', moduleId: '2-4', sessionId: 2, skill: 'model_selection',
    question: 'When should you use a faster/cheaper model vs. a more capable one?',
    keyAnswer: 'Use faster models for routine tasks (reformatting, simple summaries, quick lookups). Use capable models for complex reasoning, analysis, nuanced writing, or multi-step tasks.',
  },

  // ─── Session 2: Module 2-5 — Chain-of-Thought Mastery ──────────────────
  {
    id: '2-5-q1', moduleId: '2-5', sessionId: 2, skill: 'chain_of_thought',
    question: 'When should you choose chain-of-thought prompting over a standard prompt?',
    keyAnswer: 'When the reasoning process matters as much as the conclusion — risk analysis, regulatory interpretation, any task where "how did you get there" is as important as "what did you conclude".',
  },
  {
    id: '2-5-q2', moduleId: '2-5', sessionId: 2, skill: 'chain_of_thought',
    question: 'What makes chain-of-thought output auditable?',
    keyAnswer: 'Each reasoning step is visible and can be verified independently — you can check where the logic went wrong rather than just seeing a wrong final answer.',
  },
  {
    id: '2-5-q3', moduleId: '2-5', sessionId: 2, skill: 'chain_of_thought',
    question: 'What phrase or instruction triggers chain-of-thought reasoning in most models?',
    keyAnswer: '"Think step by step" or "Show your reasoning" — this instructs the model to externalize its reasoning process rather than jumping to a conclusion.',
  },

  // ─── Session 2: Module 2-6 — Tool Selection ────────────────────────────
  {
    id: '2-6-q1', moduleId: '2-6', sessionId: 2, skill: 'tool_selection',
    question: 'What 3 factors should you evaluate when deciding whether to use an AI tool for a task?',
    keyAnswer: 'Data sensitivity (what data does the tool access?), reversibility (can mistakes be undone?), and oversight model (is there a human review checkpoint?).',
  },
  {
    id: '2-6-q2', moduleId: '2-6', sessionId: 2, skill: 'tool_selection',
    question: 'How does the Flipped Interaction Pattern apply to tool selection?',
    keyAnswer: 'Instead of picking a tool and hoping it works, describe your task to the AI and let it recommend which tool capabilities you actually need — the AI interviews you about requirements.',
  },

  // ─── Session 3: Module 3-1 — Why Agents Exist ──────────────────────────
  {
    id: '3-1-q1', moduleId: '3-1', sessionId: 3, skill: 'agent_basics',
    question: 'What is the key difference between a one-off prompt and a persistent agent?',
    keyAnswer: 'An agent stores instructions permanently so you do not re-type them each session — it applies consistent behavior, guard rails, and constraints every time.',
  },
  {
    id: '3-1-q2', moduleId: '3-1', sessionId: 3, skill: 'agent_basics',
    question: 'When does a task warrant building an agent instead of using a one-off prompt?',
    keyAnswer: 'When it recurs frequently, requires consistent behavior, or needs multiple constraints applied every time — one-off prompts are for low-frequency or one-time tasks.',
  },

  // ─── Session 3: Module 3-2 — The Four Levels ───────────────────────────
  {
    id: '3-2-q1', moduleId: '3-2', sessionId: 3, skill: 'four_levels',
    question: 'Name the Four Levels of AI agents from simplest to most complex.',
    keyAnswer: 'Conversation (chat), Specialist (domain-focused), Executor (takes actions), Autonomous (self-directed with minimal oversight).',
  },
  {
    id: '3-2-q2', moduleId: '3-2', sessionId: 3, skill: 'four_levels',
    question: 'What distinguishes a Level 2 (Specialist) agent from a Level 1 (Conversation) agent?',
    keyAnswer: 'A Specialist has persistent instructions, domain knowledge, and defined scope — it behaves consistently for a specific role rather than being a general chatbot.',
  },
  {
    id: '3-2-q3', moduleId: '3-2', sessionId: 3, skill: 'four_levels',
    question: 'Why should most workplace agents start at Level 2 rather than jumping to Level 3 or 4?',
    keyAnswer: 'Level 2 agents are low-risk (they advise, not act), easy to test, and build trust. Jumping to Executor or Autonomous agents without mastering Specialist creates compliance and quality risks.',
  },

  // ─── Session 3: Module 3-3 — Build a Basic Agent ────────────────────────
  {
    id: '3-3-q1', moduleId: '3-3', sessionId: 3, skill: 'agent_building',
    question: 'What four elements should every basic agent instruction set include?',
    keyAnswer: 'Role/identity, scope (what it does and does not do), style/tone, and constraints (what it must never do).',
  },
  {
    id: '3-3-q2', moduleId: '3-3', sessionId: 3, skill: 'agent_building',
    question: 'Why should guard rails use "Do not..." language rather than "Try to avoid..."?',
    keyAnswer: 'Soft language ("try to") gives the AI permission to override the rule in edge cases. Direct prohibitions ("Do not") are enforced consistently regardless of how the request is framed.',
  },

  // ─── Session 3: Module 3-4 — Add Knowledge ─────────────────────────────
  {
    id: '3-4-q1', moduleId: '3-4', sessionId: 3, skill: 'agent_knowledge',
    question: 'What changes when you add a knowledge base to an agent?',
    keyAnswer: 'The agent can reference specific documents, policies, or data when responding — its answers are grounded in your actual content rather than general training data.',
  },
  {
    id: '3-4-q2', moduleId: '3-4', sessionId: 3, skill: 'agent_knowledge',
    question: 'What is the risk of giving an agent too large a knowledge base?',
    keyAnswer: 'Retrieval quality degrades — the agent may pull irrelevant context, hallucinate connections between unrelated documents, or miss the specific answer buried in too much material.',
  },

  // ─── Session 3: Module 3-5 — Add Files ──────────────────────────────────
  {
    id: '3-5-q1', moduleId: '3-5', sessionId: 3, skill: 'agent_files',
    question: 'What is the difference between read-only and write-back file access for an agent?',
    keyAnswer: 'Read-only lets the agent retrieve and analyze file data without modifying anything — low risk. Write-back allows creating or changing files — higher risk, requires human review.',
  },

  // ─── Session 3: Module 3-6 — Add Tool Access ───────────────────────────
  {
    id: '3-6-q1', moduleId: '3-6', sessionId: 3, skill: 'agent_tools',
    question: 'What is a prompt injection attack and how do guard rails defend against it?',
    keyAnswer: 'A prompt injection is when a user tries to override the agent\'s instructions. Guard rails explicitly prohibit this and instruct the agent to refuse requests that conflict with its core instructions.',
  },
  {
    id: '3-6-q2', moduleId: '3-6', sessionId: 3, skill: 'agent_tools',
    question: 'Name the 3 test scenario types every agent should be tested with before deploying.',
    keyAnswer: 'Standard scenario (normal use case), edge case (unusual but valid request), and out-of-scope scenario (a request the agent should refuse).',
  },
  {
    id: '3-6-q3', moduleId: '3-6', sessionId: 3, skill: 'agent_tools',
    question: 'What should happen when a user sends an out-of-scope request to a well-built agent?',
    keyAnswer: 'The agent should refuse politely, reference its scope, and optionally redirect to the appropriate resource — never comply with out-of-scope requests.',
  },
];

/**
 * Get all questions from completed modules for a given user's completed module list.
 * Excludes questions from the currently active module.
 */
export function getQuestionsForCompletedModules(
  completedModuleIds: string[],
  currentModuleId?: string,
): RetrievalQuestion[] {
  return RETRIEVAL_BANK.filter(
    q => completedModuleIds.includes(q.moduleId) && q.moduleId !== currentModuleId,
  );
}
