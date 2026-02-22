/**
 * AI Proficiency Assessment — Hybrid Quiz + Self-Report
 *
 * 6 scenario-based questions probe real AI skill dimensions.
 * Each answer scores 0, 2, 5, or 8 points.
 * A final confidence self-report adjusts the score.
 * Output: integer 0-8 stored in user_profiles.ai_proficiency_level.
 */

export interface ProficiencyOption {
  label: string;
  description: string;
  score: number; // 0, 2, 5, or 8
}

export interface ProficiencyQuestion {
  id: string;
  dimension: string;
  scenario: string;
  options: ProficiencyOption[];
}

export const PROFICIENCY_QUESTIONS: ProficiencyQuestion[] = [
  {
    id: 'basic_usage',
    dimension: 'Basic AI Usage',
    scenario: 'A colleague mentions they use ChatGPT or Claude at work. What\'s your reaction?',
    options: [
      {
        label: 'I haven\'t tried it',
        description: 'I\'ve heard of AI tools but never used one myself',
        score: 0,
      },
      {
        label: 'I\'ve experimented a bit',
        description: 'I\'ve asked a few questions or had it write something for me',
        score: 2,
      },
      {
        label: 'I use it regularly',
        description: 'It\'s part of my weekly workflow for drafts, research, or analysis',
        score: 5,
      },
      {
        label: 'It\'s a core tool for me',
        description: 'I use AI daily and have developed my own techniques for getting the best results',
        score: 8,
      },
    ],
  },
  {
    id: 'prompt_specificity',
    dimension: 'Prompt Crafting',
    scenario: 'You need AI to help draft talking points for a customer meeting about their loan renewal. What would your prompt look like?',
    options: [
      {
        label: '"Help me with talking points"',
        description: 'I\'d keep it simple and see what comes back',
        score: 0,
      },
      {
        label: 'Add some context about the meeting',
        description: 'I\'d mention it\'s a loan renewal and maybe the customer type',
        score: 2,
      },
      {
        label: 'Include role, audience, and format',
        description: 'I\'d specify I\'m a loan officer, it\'s a $500K commercial renewal, and I want bullet points',
        score: 5,
      },
      {
        label: 'Detailed prompt with constraints',
        description: 'I\'d set the role, provide financial context, specify format, list what to include/exclude, and note compliance requirements',
        score: 8,
      },
    ],
  },
  {
    id: 'output_evaluation',
    dimension: 'Output Evaluation',
    scenario: 'AI generates a draft email to a customer about their past-due account. You read it and it sounds professional but generic. What do you do?',
    options: [
      {
        label: 'Use it as-is',
        description: 'It sounds good enough — I\'d send it',
        score: 0,
      },
      {
        label: 'Edit it manually',
        description: 'I\'d fix the parts that don\'t fit, but I wouldn\'t re-prompt',
        score: 2,
      },
      {
        label: 'Ask AI to revise with specifics',
        description: 'I\'d tell it what\'s missing — like the specific past-due amount or the customer\'s name — and ask for a revision',
        score: 5,
      },
      {
        label: 'Diagnose why and re-prompt differently',
        description: 'I\'d recognize my prompt lacked specifics, rewrite it with the right context, and evaluate the new output against a checklist',
        score: 8,
      },
    ],
  },
  {
    id: 'iteration',
    dimension: 'Iteration & Refinement',
    scenario: 'Your first AI attempt at a risk assessment doesn\'t quite hit the mark. The format is wrong and it missed key ratios. How do you proceed?',
    options: [
      {
        label: 'Give up on AI for this task',
        description: 'I\'d write it manually — AI doesn\'t seem to get it',
        score: 0,
      },
      {
        label: 'Try again with a slightly different ask',
        description: 'I\'d rephrase the same request and hope for a better result',
        score: 2,
      },
      {
        label: 'Add the missing details to my prompt',
        description: 'I\'d specify the format I need, list the ratios to include, and provide more context about the borrower',
        score: 5,
      },
      {
        label: 'Systematic multi-step refinement',
        description: 'I\'d break it into steps — first get the ratios right, then the format, then add the narrative — refining each piece separately',
        score: 8,
      },
    ],
  },
  {
    id: 'context_setting',
    dimension: 'Context & Compliance Awareness',
    scenario: 'You want AI to help analyze a borrower\'s financial statements. The documents contain real account numbers and the borrower\'s SSN. What\'s your approach?',
    options: [
      {
        label: 'Paste the documents in',
        description: 'I\'d share what I have and ask for the analysis',
        score: 0,
      },
      {
        label: 'Remove obvious personal info first',
        description: 'I\'d delete the SSN before sharing but might not catch everything',
        score: 2,
      },
      {
        label: 'Anonymize all PII systematically',
        description: 'I\'d replace all customer data with placeholders and only share the financial figures AI needs',
        score: 5,
      },
      {
        label: 'Full compliance-aware approach',
        description: 'I\'d anonymize all PII, set the AI\'s role and compliance context, specify that output is for internal review only, and add a disclaimer requirement',
        score: 8,
      },
    ],
  },
  {
    id: 'agent_concepts',
    dimension: 'Agent & Automation Concepts',
    scenario: 'Someone suggests creating a "custom AI agent" that your team could reuse for a recurring task. What comes to mind?',
    options: [
      {
        label: 'Not sure what that means',
        description: 'I\'m not familiar with AI agents or how they\'d work',
        score: 0,
      },
      {
        label: 'Saved prompts or templates',
        description: 'I think of it as saving good prompts that others can copy',
        score: 2,
      },
      {
        label: 'System instructions that persist',
        description: 'I understand it means setting up persistent instructions — role, constraints, output format — so every conversation follows the same rules',
        score: 5,
      },
      {
        label: 'Full agent architecture',
        description: 'I\'d think about system prompt, guard rails, compliance anchors, output formatting, and test scenarios to validate behavior',
        score: 8,
      },
    ],
  },
];

export const CONFIDENCE_LEVELS = [
  { value: 1, label: 'Not at all confident', description: 'I\'d need significant support' },
  { value: 2, label: 'Slightly confident', description: 'I could try with guidance' },
  { value: 3, label: 'Moderately confident', description: 'I can handle basic tasks independently' },
  { value: 4, label: 'Quite confident', description: 'I can tackle most AI tasks on my own' },
  { value: 5, label: 'Very confident', description: 'I could teach others how to use AI effectively' },
];

/**
 * Calculate the final proficiency score (0-8) from quiz answers + confidence.
 *
 * quizScore = average of question scores (already 0-8 scale)
 * confidenceAdjustment maps 1-5 → -1, -0.5, 0, +0.5, +1
 * finalScore = clamp(round(quizScore * 0.7 + (quizScore + confidenceAdjustment) * 0.3), 0, 8)
 */
export function calculateProficiencyScore(
  answers: Record<string, number>,
  confidence: number
): number {
  const questionIds = PROFICIENCY_QUESTIONS.map((q) => q.id);
  const scores = questionIds.map((id) => answers[id] ?? 0);
  const quizScore = scores.reduce((sum, s) => sum + s, 0) / scores.length;

  const confidenceAdjustmentMap: Record<number, number> = {
    1: -1,
    2: -0.5,
    3: 0,
    4: 0.5,
    5: 1,
  };
  const adjustment = confidenceAdjustmentMap[confidence] ?? 0;

  const raw = quizScore * 0.7 + (quizScore + adjustment) * 0.3;
  return Math.max(0, Math.min(8, Math.round(raw)));
}
