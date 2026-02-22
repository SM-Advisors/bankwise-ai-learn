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
    dimension: 'AI Exposure',
    scenario: 'Which best describes your experience with AI tools like ChatGPT or Claude?',
    options: [
      {
        label: 'No hands-on experience yet',
        description: 'I\'ve heard about these tools but haven\'t had a chance to try one',
        score: 0,
      },
      {
        label: 'Tried it a few times',
        description: 'I\'ve used an AI tool on a handful of occasions to ask questions or generate text',
        score: 2,
      },
      {
        label: 'Use it on a weekly basis',
        description: 'I incorporate AI into my workflow at least a few times per week',
        score: 5,
      },
      {
        label: 'Use it most days',
        description: 'I use AI tools daily as part of my regular work',
        score: 8,
      },
    ],
  },
  {
    id: 'prompt_specificity',
    dimension: 'Prompt Approach',
    scenario: 'Imagine you need AI to draft talking points for a customer meeting about a loan renewal. Which approach would you take?',
    options: [
      {
        label: 'Type a short request',
        description: 'Something like "Help me with talking points for a meeting"',
        score: 0,
      },
      {
        label: 'Include the topic and context',
        description: 'Mention it\'s a loan renewal and describe the type of customer',
        score: 2,
      },
      {
        label: 'Specify role, details, and format',
        description: 'State your role, the loan amount, customer segment, and what format you want the output in',
        score: 5,
      },
      {
        label: 'Provide a structured brief',
        description: 'Include role, financial context, desired format, items to cover, items to avoid, and any compliance considerations',
        score: 8,
      },
    ],
  },
  {
    id: 'output_evaluation',
    dimension: 'Evaluating AI Output',
    scenario: 'AI drafts a past-due account email for a customer. The tone is professional but the content is generic. What would you do next?',
    options: [
      {
        label: 'Send it as written',
        description: 'The tone and structure seem appropriate, so I\'d use it',
        score: 0,
      },
      {
        label: 'Make manual edits',
        description: 'Adjust the parts that need it by editing the draft directly',
        score: 2,
      },
      {
        label: 'Ask AI to revise with more detail',
        description: 'Provide the specific missing info (amounts, dates, customer name) and request a new version',
        score: 5,
      },
      {
        label: 'Rethink the prompt and regenerate',
        description: 'Identify what the original prompt was missing, rewrite it with fuller context, and review the new output more carefully',
        score: 8,
      },
    ],
  },
  {
    id: 'iteration',
    dimension: 'Working Through Problems',
    scenario: 'Your first AI attempt at a risk assessment has the wrong format and is missing key financial ratios. What would you do?',
    options: [
      {
        label: 'Complete it without AI',
        description: 'Do the assessment manually using my usual process',
        score: 0,
      },
      {
        label: 'Rephrase and try again',
        description: 'Reword the request to see if AI gives a better result',
        score: 2,
      },
      {
        label: 'Add the missing specifics',
        description: 'Tell AI which format to use, which ratios to include, and give more borrower details',
        score: 5,
      },
      {
        label: 'Break it into smaller steps',
        description: 'Handle one piece at a time — ratios first, then format, then narrative — checking each before moving on',
        score: 8,
      },
    ],
  },
  {
    id: 'context_setting',
    dimension: 'Data Sensitivity Awareness',
    scenario: 'You want AI to analyze a borrower\'s financial statements, but the documents contain real account numbers and a Social Security number. What would you do?',
    options: [
      {
        label: 'Share the documents as-is',
        description: 'Provide the full documents and ask for the analysis',
        score: 0,
      },
      {
        label: 'Remove the most sensitive items',
        description: 'Delete the SSN and any obvious personal identifiers before sharing',
        score: 2,
      },
      {
        label: 'Replace all personal data with placeholders',
        description: 'Swap out names, account numbers, and other identifiers with generic labels so only financial figures remain',
        score: 5,
      },
      {
        label: 'Anonymize and set boundaries',
        description: 'Replace all identifiable data, tell the AI this is for internal review only, and include a note about handling requirements',
        score: 8,
      },
    ],
  },
  {
    id: 'agent_concepts',
    dimension: 'AI Automation Familiarity',
    scenario: 'A coworker suggests creating a reusable "AI agent" for a task your team repeats every week. What does that idea mean to you?',
    options: [
      {
        label: 'I\'m not sure what that would involve',
        description: 'The concept of an AI agent is new to me',
        score: 0,
      },
      {
        label: 'A saved prompt others can reuse',
        description: 'I think of it as writing a good prompt and sharing it with the team',
        score: 2,
      },
      {
        label: 'Persistent instructions for the AI',
        description: 'Setting up a role, rules, and output format so every conversation starts the same way',
        score: 5,
      },
      {
        label: 'A configured system with safeguards',
        description: 'A setup that includes a system prompt, boundaries on what the AI can and can\'t do, required formatting, and test cases',
        score: 8,
      },
    ],
  },
];

export const CONFIDENCE_LEVELS = [
  { value: 1, label: 'Just getting started', description: 'I\'d want guided support for most AI tasks' },
  { value: 2, label: 'Building familiarity', description: 'I can follow along with step-by-step guidance' },
  { value: 3, label: 'Comfortable with basics', description: 'I can handle straightforward AI tasks on my own' },
  { value: 4, label: 'Fairly independent', description: 'I can work through most AI tasks without help' },
  { value: 5, label: 'Ready to go deeper', description: 'I\'m comfortable with AI and want to learn advanced techniques' },
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
