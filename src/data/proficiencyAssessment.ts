/**
 * AI Proficiency Assessment — Hybrid Self-Report + Performance-Based (v2.0)
 *
 * 4 scenario-based self-report questions + 2 performance-based items.
 * Self-report: each answer scores 0, 2, 5, or 8 points.
 * Performance Item 1 (multi-select): +2 per correct, -1 per distractor. Floor 0, max 8.
 * Performance Item 2 (drag-to-rank): Correct order = 8, one swap = 5, reverse = 0.
 * Composite = (Self-Report Average × 0.5) + (Performance Score Normalized × 0.5)
 * Confidence adjustment: +/- 1.5 points (increased from +/- 1)
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

// Multi-select option for performance-based items
export interface MultiSelectOption {
  id: string;
  label: string;
  isCorrect: boolean;
  points: number; // +2 for correct, -1 for distractor
}

// Drag-to-rank prompt for performance-based items
export interface RankablePrompt {
  id: string;
  label: string;
  text: string;
  correctRank: number; // 1 = weakest, 3 = strongest
}

export interface PerformanceItem {
  id: string;
  type: 'multi_select_evaluate' | 'drag_rank';
  dimension: string;
  scenario: string;
  instructions: string;
  // For multi_select_evaluate
  options?: MultiSelectOption[];
  // For drag_rank
  prompts?: RankablePrompt[];
  maxScore: number;
}

// ─── SELF-REPORT QUESTIONS (4 retained from v1) ───────────────────────────

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

// ─── PERFORMANCE-BASED ITEMS (2 new in v2.0) ──────────────────────────────

export const PERFORMANCE_ITEMS: PerformanceItem[] = [
  {
    id: 'prompt_evaluation',
    type: 'multi_select_evaluate',
    dimension: 'Prompt Evaluation',
    scenario: 'Review this prompt: "Write me something about our loan portfolio."',
    instructions: 'Select ALL the issues you can identify with this prompt (select all that apply):',
    options: [
      { id: 'missing_role', label: 'Missing specific role/audience context', isCorrect: true, points: 2 },
      { id: 'no_format', label: 'No output format specified', isCorrect: true, points: 2 },
      { id: 'vague_task', label: 'Vague task description ("something about")', isCorrect: true, points: 2 },
      { id: 'no_compliance', label: 'No compliance or data handling constraints', isCorrect: true, points: 2 },
      { id: 'too_short', label: 'The prompt is too short', isCorrect: false, points: -1 },
      { id: 'wrong_tool', label: 'It should use a different AI tool', isCorrect: false, points: -1 },
    ],
    maxScore: 8,
  },
  {
    id: 'prompt_ranking',
    type: 'drag_rank',
    dimension: 'Prompt Quality Ranking',
    scenario: 'Rank these three prompts for a credit memo task from weakest (1) to strongest (3):',
    instructions: 'Drag to reorder — 1 is weakest, 3 is strongest.',
    prompts: [
      {
        id: 'prompt_a',
        label: 'Prompt A',
        text: 'Write a credit memo.',
        correctRank: 1,
      },
      {
        id: 'prompt_b',
        label: 'Prompt B',
        text: 'Write a credit memo for a $2M commercial real estate loan. Include financial analysis.',
        correctRank: 2,
      },
      {
        id: 'prompt_c',
        label: 'Prompt C',
        text: 'Act as a senior credit analyst at a community bank. Draft a credit memo for a $2M owner-occupied commercial real estate loan to ABC Properties LLC. Include: executive summary, borrower background, financial analysis (DSCR, LTV, debt-to-equity from the attached financials), risk factors, and recommendation. Format as a one-page memo for the credit committee. Do not include any actual customer PII — use the placeholder data provided.',
        correctRank: 3,
      },
    ],
    maxScore: 8,
  },
];

// ─── CONFIDENCE LEVELS ────────────────────────────────────────────────────

export const CONFIDENCE_LEVELS = [
  { value: 1, label: 'Just getting started', description: 'I\'d want guided support for most AI tasks' },
  { value: 2, label: 'Building familiarity', description: 'I can follow along with step-by-step guidance' },
  { value: 3, label: 'Comfortable with basics', description: 'I can handle straightforward AI tasks on my own' },
  { value: 4, label: 'Fairly independent', description: 'I can work through most AI tasks without help' },
  { value: 5, label: 'Ready to go deeper', description: 'I\'m comfortable with AI and want to learn advanced techniques' },
];

// ─── SCORING FUNCTIONS ────────────────────────────────────────────────────

/**
 * Score a multi-select performance item.
 * +2 for each correct selection, -1 for each distractor selected. Floor: 0.
 */
export function scoreMultiSelect(
  selectedIds: string[],
  item: PerformanceItem
): number {
  if (!item.options) return 0;
  let score = 0;
  for (const option of item.options) {
    if (selectedIds.includes(option.id)) {
      score += option.points;
    }
  }
  return Math.max(0, Math.min(item.maxScore, score));
}

/**
 * Score a drag-to-rank performance item.
 * Correct order = 8, one swap = 5, reverse = 0.
 */
export function scoreDragRank(
  rankedIds: string[], // ordered from rank 1 (weakest) to rank N (strongest)
  item: PerformanceItem
): number {
  if (!item.prompts) return 0;

  const correctOrder = [...item.prompts]
    .sort((a, b) => a.correctRank - b.correctRank)
    .map((p) => p.id);

  // Check if exact match
  const isExactMatch = rankedIds.every((id, i) => id === correctOrder[i]);
  if (isExactMatch) return 8;

  // Check if exactly reversed
  const reversedOrder = [...correctOrder].reverse();
  const isReversed = rankedIds.every((id, i) => id === reversedOrder[i]);
  if (isReversed) return 0;

  // Count number of positions that differ
  let mismatches = 0;
  for (let i = 0; i < rankedIds.length; i++) {
    if (rankedIds[i] !== correctOrder[i]) mismatches++;
  }

  // One swap = 2 mismatches
  if (mismatches <= 2) return 5;

  return 2; // Partial credit for other orderings
}

/**
 * Calculate the final proficiency score (0-8) from self-report + confidence.
 *
 * v3.0 formula (performance items removed):
 * selfReportAvg = average of self-report question scores (0-8 scale)
 * confidenceAdjustment: maps 1-5 → -1.5, -0.75, 0, +0.75, +1.5
 * finalScore = clamp(round(selfReportAvg + confidenceAdjustment), 0, 8)
 */
export function calculateProficiencyScore(
  answers: Record<string, number>,
  confidence: number,
): number {
  // Self-report average
  const questionIds = PROFICIENCY_QUESTIONS.map((q) => q.id);
  const selfReportScores = questionIds.map((id) => answers[id] ?? 0);
  const selfReportAvg = selfReportScores.reduce((sum, s) => sum + s, 0) / selfReportScores.length;

  // Confidence adjustment
  const confidenceAdjustmentMap: Record<number, number> = {
    1: -1.5,
    2: -0.75,
    3: 0,
    4: 0.75,
    5: 1.5,
  };
  const adjustment = confidenceAdjustmentMap[confidence] ?? 0;

  return Math.max(0, Math.min(8, Math.round(selfReportAvg + adjustment)));
}
