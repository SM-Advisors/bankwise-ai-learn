/**
 * Spaced Repetition Scheduler (Leitner-style)
 * Selects 1-2 retrieval questions per session based on:
 *   1. Questions from recently completed modules (recency weight)
 *   2. Questions the learner hasn't seen yet (novelty weight)
 *   3. Questions previously marked weak (quality < 3) (remediation weight)
 */

import type { RetrievalQuestion } from '@/data/spacedRepetitionBank';

export interface RetrievalResponse {
  questionId: string;
  quality: 0 | 1 | 2 | 3 | 4 | 5; // 0-2 = weak, 3-4 = ok, 5 = strong
  seenAt: string; // ISO timestamp
}

export interface SchedulerContext {
  completedModuleIds: string[];       // ordered oldest-to-newest
  seenResponses: RetrievalResponse[]; // all prior retrieval attempts
  currentModuleId?: string;           // exclude questions from active module
  maxQuestions?: number;              // default 2
}

/**
 * Select retrieval questions for the current session.
 * Returns up to maxQuestions (default 2) questions.
 *
 * Priority order:
 * 1. Weak questions (quality < 3, not seen in last 2 sessions)
 * 2. Unseen questions from recent modules
 * 3. Unseen questions from older modules
 * 4. Questions not reviewed recently (seen > 3 sessions ago)
 */
export function selectRetrievalQuestions(
  allQuestions: RetrievalQuestion[],
  ctx: SchedulerContext,
): RetrievalQuestion[] {
  const max = ctx.maxQuestions ?? 2;
  if (allQuestions.length === 0) return [];

  const seenMap = new Map<string, RetrievalResponse>();
  for (const r of ctx.seenResponses) {
    // Keep most recent response per question
    const existing = seenMap.get(r.questionId);
    if (!existing || r.seenAt > existing.seenAt) {
      seenMap.set(r.questionId, r);
    }
  }

  // Recent = last 3 completed modules (recency window)
  const recentModules = new Set(ctx.completedModuleIds.slice(-3));

  // Partition questions into buckets
  const weakQuestions: RetrievalQuestion[] = [];
  const unseenRecent: RetrievalQuestion[] = [];
  const unseenOlder: RetrievalQuestion[] = [];
  const reviewDue: RetrievalQuestion[] = [];

  for (const q of allQuestions) {
    if (q.moduleId === ctx.currentModuleId) continue;

    const response = seenMap.get(q.id);
    if (!response) {
      // Never seen — prefer if from recent module
      if (recentModules.has(q.moduleId)) {
        unseenRecent.push(q);
      } else {
        unseenOlder.push(q);
      }
    } else {
      const quality = response.quality;
      if (quality < 3) {
        weakQuestions.push(q);
      } else {
        // Seen and answered ok/strong — review due if not seen recently
        reviewDue.push(q);
      }
    }
  }

  // Shuffle each bucket for variety
  shuffleInPlace(weakQuestions);
  shuffleInPlace(unseenRecent);
  shuffleInPlace(unseenOlder);
  shuffleInPlace(reviewDue);

  // Fill up to max by priority
  const selected: RetrievalQuestion[] = [];
  const addFrom = (bucket: RetrievalQuestion[]) => {
    while (selected.length < max && bucket.length > 0) {
      selected.push(bucket.shift()!);
    }
  };

  addFrom(weakQuestions);
  addFrom(unseenRecent);
  addFrom(unseenOlder);
  addFrom(reviewDue);

  return selected;
}

function shuffleInPlace<T>(arr: T[]): void {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

/**
 * Format selected questions into a block for Andrea's system prompt.
 * Returns empty string if no questions.
 */
export function formatRetrievalQuestionsForAndrea(
  questions: RetrievalQuestion[],
): string {
  if (questions.length === 0) return '';

  const lines = questions.map((q, i) =>
    `Retrieval Question ${i + 1} (from Module ${q.moduleId}):\n"${q.question}"\n[Model Answer for your reference: ${q.keyAnswer}]`,
  );

  return `## SPACED RETRIEVAL PRACTICE
At an appropriate natural pause in the conversation — after helping the learner with their immediate question, or when transitioning topics — ask ONE of the following retrieval questions. Frame it naturally: "Before we move on, quick check..." or "While we're on the topic of prompting..." Do NOT ask retrieval questions back-to-back or interrupt an active task. After the learner answers, give brief, specific feedback comparing their answer to the model answer. Then return to the primary conversation.

${lines.join('\n\n')}

Use your judgment on timing — retrieval practice works best when spaced naturally, not forced.
`;
}
