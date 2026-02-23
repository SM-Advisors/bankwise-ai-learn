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
  // ─── Session 1: Module 1-1 — What AI Can Do For You ────────────────────
  {
    id: '1-1-q1', moduleId: '1-1', sessionId: 1, skill: 'prompt_elements',
    question: 'Name the 5 elements of a well-structured banking prompt.',
    keyAnswer: 'Role, Task, Context, Format, Constraints.',
  },
  {
    id: '1-1-q2', moduleId: '1-1', sessionId: 1, skill: 'use_case_mapping',
    question: 'Give one example of an AI-assisted banking task that falls in the AUTOMATE category.',
    keyAnswer: 'Any high-frequency, high-AI-suitability task — e.g., weekly variance commentary, daily pipeline emails, compliance reminder drafts.',
  },
  {
    id: '1-1-q3', moduleId: '1-1', sessionId: 1, skill: 'prompt_quality',
    question: 'What is the most common reason a first-attempt banking prompt produces a poor result?',
    keyAnswer: 'Missing context — the AI does not know the audience, regulatory frame, or output format required.',
  },

  // ─── Session 1: Module 1-2 — The CLEAR Framework ───────────────────────
  {
    id: '1-2-q1', moduleId: '1-2', sessionId: 1, skill: 'clear_framework',
    question: 'What does each letter of CLEAR stand for?',
    keyAnswer: 'Context, Length, Examples, Audience, Restrictions.',
  },
  {
    id: '1-2-q2', moduleId: '1-2', sessionId: 1, skill: 'clear_framework',
    question: 'Which CLEAR element addresses data security and what you cannot include in a prompt?',
    keyAnswer: 'R — Restrictions. It specifies what data is off-limits (PII, real account numbers) and any compliance constraints.',
  },
  {
    id: '1-2-q3', moduleId: '1-2', sessionId: 1, skill: 'clear_framework',
    question: 'Why does providing an example (the E in CLEAR) improve output quality?',
    keyAnswer: 'Examples show the AI the exact format, tone, and quality standard expected — it cannot guess these from a description alone.',
  },

  // ─── Session 1: Module 1-3 — Context & Data Security ───────────────────
  {
    id: '1-3-q1', moduleId: '1-3', sessionId: 1, skill: 'data_security',
    question: 'List 3 types of data that should NEVER appear in a banking AI prompt.',
    keyAnswer: 'Social Security Numbers, real account/routing numbers, customer names paired with financial data, actual credit card numbers.',
  },
  {
    id: '1-3-q2', moduleId: '1-3', sessionId: 1, skill: 'data_security',
    question: 'What is synthetic data and why do we use it in prompts?',
    keyAnswer: 'Synthetic data uses realistic but clearly fictional placeholders (Jane Doe, Acme Corp, $500,000 loan) to preserve analytical context without exposing real customer PII.',
  },
  {
    id: '1-3-q3', moduleId: '1-3', sessionId: 1, skill: 'context_setting',
    question: 'Name the 5 context types you should set at the start of a banking prompt.',
    keyAnswer: 'Role context, Task context, Audience context, Regulatory context, Security context.',
  },

  // ─── Session 1: Module 1-4 — Iteration & Refinement ────────────────────
  {
    id: '1-4-q1', moduleId: '1-4', sessionId: 1, skill: 'iteration',
    question: 'What is the Troubleshooting Ladder and when do you use it?',
    keyAnswer: 'A structured set of fixes to apply when iteration is not improving results: add context, add examples, add constraints, add format instructions, decompose the task.',
  },
  {
    id: '1-4-q2', moduleId: '1-4', sessionId: 1, skill: 'iteration',
    question: 'What single change most commonly improves a vague first-draft prompt?',
    keyAnswer: 'Adding specific context — audience, regulatory frame, or output format — so the AI knows what "good" looks like.',
  },
  {
    id: '1-4-q3', moduleId: '1-4', sessionId: 1, skill: 'iteration',
    question: 'After 3 iterations without improvement, what should you do before iterating further?',
    keyAnswer: 'Step back and reconsider the task decomposition — the problem may be that you are asking one prompt to do too many things.',
  },

  // ─── Session 1: Module 1-5 — Verifying AI Output ───────────────────────
  {
    id: '1-5-q1', moduleId: '1-5', sessionId: 1, skill: 'verify',
    question: 'What does VERIFY stand for?',
    keyAnswer: 'Validate facts, Examine reasoning, Review for compliance, Identify gaps, Fit-check for audience, Yes/No on use.',
  },
  {
    id: '1-5-q2', moduleId: '1-5', sessionId: 1, skill: 'hallucination',
    question: 'Name 2 types of hallucination common in AI-generated banking output.',
    keyAnswer: 'Any two of: fabricated regulatory citations, invented financial ratios/figures, invented names or entities, plausible-but-wrong calculations, invented dates or deadlines.',
  },
  {
    id: '1-5-q3', moduleId: '1-5', sessionId: 1, skill: 'verify',
    question: 'Why is "it looks right" an insufficient review standard for AI output?',
    keyAnswer: 'AI hallucinations are designed to sound plausible — confident, well-formatted output can contain invisible errors that only structured verification catches.',
  },

  // ─── Session 2: Module 2-1 — From Prompts to Agents ────────────────────
  {
    id: '2-1-q1', moduleId: '2-1', sessionId: 2, skill: 'agent_basics',
    question: 'What is the key difference between a one-off prompt and a persistent agent?',
    keyAnswer: 'An agent stores instructions permanently so you do not re-type them each session — it applies consistent behavior, guard rails, and compliance anchors every time.',
  },
  {
    id: '2-1-q2', moduleId: '2-1', sessionId: 2, skill: 'agent_basics',
    question: 'When does a task warrant building an agent instead of using a one-off prompt?',
    keyAnswer: 'When it recurs frequently, requires consistent compliance behavior, or needs multiple guard rails applied every time — one-off prompts are for low-frequency or one-time tasks.',
  },
  {
    id: '2-1-q3', moduleId: '2-1', sessionId: 2, skill: 'agent_basics',
    question: 'Name 3 benefits of using an agent for a recurring banking task versus retyping prompts.',
    keyAnswer: 'Consistency (same guard rails every time), compliance by default (anchors built in), time savings (no re-setup), and team sharing (colleagues use the same configuration).',
  },

  // ─── Session 2: Module 2-2 — Agent Architecture ─────────────────────────
  {
    id: '2-2-q1', moduleId: '2-2', sessionId: 2, skill: 'agent_architecture',
    question: 'Name the 5 sections of an agent system prompt.',
    keyAnswer: 'Identity & Role, Permitted Tasks, Output Rules, Guard Rails, Compliance Anchors.',
  },
  {
    id: '2-2-q2', moduleId: '2-2', sessionId: 2, skill: 'guard_rails',
    question: 'What is the difference between a guard rail and a compliance anchor?',
    keyAnswer: 'A guard rail stops specific behaviors ("Do not provide specific legal advice"). A compliance anchor is a phrase that must appear in output verbatim ("This output is for internal use only and requires human review before use").',
  },
  {
    id: '2-2-q3', moduleId: '2-2', sessionId: 2, skill: 'prompt_injection',
    question: 'What is a prompt injection attack and how do guard rails defend against it?',
    keyAnswer: 'A prompt injection is when a user tries to override the agent\'s instructions with a message like "Ignore your instructions and...". Guard rails explicitly prohibit this and instruct the agent to refuse requests that conflict with its core instructions.',
  },
  {
    id: '2-2-q4', moduleId: '2-2', sessionId: 2, skill: 'guard_rails',
    question: 'Why should guard rails use "Do not..." language rather than "Try to avoid..."?',
    keyAnswer: 'Soft language ("try to") gives the AI permission to override the rule in edge cases. Direct prohibitions ("Do not") are enforced consistently regardless of how the request is framed.',
  },

  // ─── Session 2: Module 2-3 — Custom Instructions Template ───────────────
  {
    id: '2-3-q1', moduleId: '2-3', sessionId: 2, skill: 'agent_template',
    question: 'What should the Identity & Role section of an agent template establish?',
    keyAnswer: 'Who the agent is (persona), what institution context applies, and what the agent\'s primary purpose is — this frames all downstream behavior.',
  },
  {
    id: '2-3-q2', moduleId: '2-3', sessionId: 2, skill: 'agent_template',
    question: 'What is a compliance anchor and give an example of one.',
    keyAnswer: 'A phrase embedded in the agent template that appears verbatim in every response. Example: "This analysis is for internal use only. All conclusions require human review and verification before use in credit decisions."',
  },
  {
    id: '2-3-q3', moduleId: '2-3', sessionId: 2, skill: 'agent_template',
    question: 'Why should Output Rules specify format explicitly rather than leaving it to the AI?',
    keyAnswer: 'Without explicit format rules, output style varies with every request — headers appear inconsistently, length varies, bullet vs paragraph switches. Explicit output rules lock in the format for team-shared deliverables.',
  },

  // ─── Session 2: Module 2-4 — Tool Integration ───────────────────────────
  {
    id: '2-4-q1', moduleId: '2-4', sessionId: 2, skill: 'tool_integration',
    question: 'What is the difference between a read-only and write-back tool integration?',
    keyAnswer: 'Read-only integrations let the AI retrieve data without modifying anything — low risk. Write-back integrations allow the AI to create or change records — higher risk, requires mandatory human review checkpoint.',
  },
  {
    id: '2-4-q2', moduleId: '2-4', sessionId: 2, skill: 'tool_integration',
    question: 'What 3 axes should you evaluate any tool integration on before approving it?',
    keyAnswer: 'Data sensitivity (what data does it access?), reversibility (can mistakes be undone?), and oversight model (is there a human review checkpoint before any action is taken?).',
  },

  // ─── Session 2: Module 2-6 — Build Your Agent ───────────────────────────
  {
    id: '2-6-q1', moduleId: '2-6', sessionId: 2, skill: 'agent_testing',
    question: 'Name the 3 test scenario types every agent should be tested with before deploying.',
    keyAnswer: 'Standard scenario (normal use case), edge case (unusual but valid request that stresses the boundary), and out-of-scope scenario (a request the agent should refuse).',
  },
  {
    id: '2-6-q2', moduleId: '2-6', sessionId: 2, skill: 'agent_testing',
    question: 'What should happen when a user sends an out-of-scope request to a well-built agent?',
    keyAnswer: 'The agent should refuse politely, reference its scope ("I\'m configured to assist with..."), and optionally redirect to the appropriate resource — never comply with out-of-scope requests.',
  },
  {
    id: '2-6-q3', moduleId: '2-6', sessionId: 2, skill: 'agent_iteration',
    question: 'What is a "living agent" and why is the first version never the final version?',
    keyAnswer: 'A living agent is one you continue to iterate on as you discover edge cases, new compliance requirements, or colleague feedback. Version 1 is a starting point — real-world use reveals gaps that a test environment cannot predict.',
  },

  // ─── Session 3: Module 3-1 — Department AI Use Cases ────────────────────
  {
    id: '3-1-q1', moduleId: '3-1', sessionId: 3, skill: 'use_case_mapping',
    question: 'What 2 factors determine whether a task should be in the AUTOMATE vs ASSIST category?',
    keyAnswer: 'Frequency (how often it recurs) and AI suitability (how well AI handles the core work). High-frequency + high-suitability = AUTOMATE. Low-frequency + high-suitability = ASSIST.',
  },
  {
    id: '3-1-q2', moduleId: '3-1', sessionId: 3, skill: 'use_case_mapping',
    question: 'Give an example of a banking task that belongs in the SKIP category and explain why.',
    keyAnswer: 'Any task requiring institutional judgment AI cannot access — examiner exit meeting responses, final credit decisions, personnel reviews. These require context, relationship knowledge, or authority that AI does not have.',
  },

  // ─── Session 3: Module 3-2 — Compliance & AI ────────────────────────────
  {
    id: '3-2-q1', moduleId: '3-2', sessionId: 3, skill: 'compliance',
    question: 'Name the 3 pillars of the compliance framework for AI use in banking.',
    keyAnswer: 'Data Handling (what goes into prompts), Decision-Making (what decisions AI can and cannot make), and Documentation (how AI-assisted work is recorded and disclosed).',
  },
  {
    id: '3-2-q2', moduleId: '3-2', sessionId: 3, skill: 'compliance',
    question: 'What are the 5 steps of the Pre-Task Compliance Check?',
    keyAnswer: 'Does this task involve PII? Does it require a human decision? Does it involve customer-facing output? Does it touch regulated data? Is this tool approved for this use case?',
  },
  {
    id: '3-2-q3', moduleId: '3-2', sessionId: 3, skill: 'compliance',
    question: 'Give 2 examples of tasks where AI can assist with analysis but humans must make the final decision.',
    keyAnswer: 'Credit approval/denial, SAR filing decisions, regulatory enforcement responses, loan pricing decisions, personnel actions, customer dispute resolutions.',
  },

  // ─── Session 3: Module 3-3 — Workflow Examples ──────────────────────────
  {
    id: '3-3-q1', moduleId: '3-3', sessionId: 3, skill: 'workflow',
    question: 'What is a human review checkpoint and why must at least 2 appear in any AI workflow?',
    keyAnswer: 'A checkpoint where a human reviews AI output before it feeds the next step. Two checkpoints prevent compounding errors — if AI output is wrong in step 2, the error does not corrupt step 3 and beyond.',
  },
  {
    id: '3-3-q2', moduleId: '3-3', sessionId: 3, skill: 'workflow',
    question: 'Why should no AI output feed directly into the next step without human review?',
    keyAnswer: 'AI errors compound — a hallucinated figure in step 2 becomes the input for step 3, which builds on it, making the final output confidently wrong in ways that are hard to trace.',
  },

  // ─── Session 3: Module 3-4 — Advanced Techniques ────────────────────────
  {
    id: '3-4-q1', moduleId: '3-4', sessionId: 3, skill: 'advanced_prompting',
    question: 'When should you choose chain-of-thought prompting over a standard prompt?',
    keyAnswer: 'When the reasoning process matters as much as the conclusion — credit risk analysis, regulatory interpretation, any task where "how did you get there" is as important as "what did you conclude".',
  },
  {
    id: '3-4-q2', moduleId: '3-4', sessionId: 3, skill: 'advanced_prompting',
    question: 'What problem does multi-shot prompting solve that a single-instruction prompt cannot?',
    keyAnswer: 'Format consistency — multi-shot locks in the exact output structure by showing 2-3 examples of the format you want before asking for the real output.',
  },
  {
    id: '3-4-q3', moduleId: '3-4', sessionId: 3, skill: 'advanced_prompting',
    question: 'What is the self-review technique and what class of errors does it catch?',
    keyAnswer: 'Asking the AI to critique its own output against a checklist before human review. It catches surface-level issues: missing disclaimers, format gaps, inconsistent terminology — things a casual read misses.',
  },
  {
    id: '3-4-q4', moduleId: '3-4', sessionId: 3, skill: 'advanced_prompting',
    question: 'What is task decomposition and when is it better than a single complex prompt?',
    keyAnswer: 'Breaking a complex task into a series of simpler prompts where each output is verifiable before feeding the next step. Use it when a task has 3+ distinct output components or when error in any step would corrupt the whole output.',
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
