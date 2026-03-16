import { describe, expect, it } from 'vitest';
import {
  PROFICIENCY_QUESTIONS,
  PERFORMANCE_ITEMS,
  CONFIDENCE_LEVELS,
  scoreMultiSelect,
  scoreDragRank,
  calculateProficiencyScore,
} from '../proficiencyAssessment';

// ── Structure validation ────────────────────────────────────────────────────

describe('PROFICIENCY_QUESTIONS structure', () => {
  it('has exactly 4 questions', () => {
    expect(PROFICIENCY_QUESTIONS).toHaveLength(4);
  });

  it('every question has id, dimension, scenario, and options', () => {
    for (const q of PROFICIENCY_QUESTIONS) {
      expect(q.id).toBeTruthy();
      expect(q.dimension).toBeTruthy();
      expect(q.scenario).toBeTruthy();
      expect(q.options.length).toBeGreaterThan(0);
    }
  });

  it('every option has label, description, and a numeric score', () => {
    for (const q of PROFICIENCY_QUESTIONS) {
      for (const opt of q.options) {
        expect(opt.label).toBeTruthy();
        expect(opt.description).toBeTruthy();
        expect(typeof opt.score).toBe('number');
      }
    }
  });

  it('option scores are from the set {0, 2, 5, 8}', () => {
    const validScores = new Set([0, 2, 5, 8]);
    for (const q of PROFICIENCY_QUESTIONS) {
      for (const opt of q.options) {
        expect(validScores.has(opt.score)).toBe(true);
      }
    }
  });

  it('no duplicate question IDs', () => {
    const ids = PROFICIENCY_QUESTIONS.map((q) => q.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe('PERFORMANCE_ITEMS structure', () => {
  it('has exactly 2 items', () => {
    expect(PERFORMANCE_ITEMS).toHaveLength(2);
  });

  it('every item has id, type, dimension, scenario, instructions, and maxScore', () => {
    for (const item of PERFORMANCE_ITEMS) {
      expect(item.id).toBeTruthy();
      expect(['multi_select_evaluate', 'drag_rank']).toContain(item.type);
      expect(item.dimension).toBeTruthy();
      expect(item.scenario).toBeTruthy();
      expect(item.instructions).toBeTruthy();
      expect(typeof item.maxScore).toBe('number');
    }
  });

  it('multi_select items have options', () => {
    const multiSelect = PERFORMANCE_ITEMS.filter((i) => i.type === 'multi_select_evaluate');
    for (const item of multiSelect) {
      expect(item.options).toBeDefined();
      expect(item.options!.length).toBeGreaterThan(0);
    }
  });

  it('drag_rank items have prompts', () => {
    const dragRank = PERFORMANCE_ITEMS.filter((i) => i.type === 'drag_rank');
    for (const item of dragRank) {
      expect(item.prompts).toBeDefined();
      expect(item.prompts!.length).toBeGreaterThan(0);
    }
  });

  it('multi_select correctIds and distractorIds do not overlap', () => {
    const multiSelect = PERFORMANCE_ITEMS.filter((i) => i.type === 'multi_select_evaluate');
    for (const item of multiSelect) {
      const correctIds = item.options!.filter((o) => o.isCorrect).map((o) => o.id);
      const distractorIds = item.options!.filter((o) => !o.isCorrect).map((o) => o.id);
      const overlap = correctIds.filter((id) => distractorIds.includes(id));
      expect(overlap).toHaveLength(0);
    }
  });

  it('drag_rank correctOrder covers all prompt IDs', () => {
    const dragRank = PERFORMANCE_ITEMS.filter((i) => i.type === 'drag_rank');
    for (const item of dragRank) {
      const promptIds = item.prompts!.map((p) => p.id);
      const rankedIds = [...item.prompts!].sort((a, b) => a.correctRank - b.correctRank).map((p) => p.id);
      expect(new Set(rankedIds)).toEqual(new Set(promptIds));
    }
  });

  it('no duplicate item IDs', () => {
    const ids = PERFORMANCE_ITEMS.map((i) => i.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe('CONFIDENCE_LEVELS', () => {
  it('has 5 levels (1-5)', () => {
    expect(CONFIDENCE_LEVELS).toHaveLength(5);
    expect(CONFIDENCE_LEVELS.map((l) => l.value)).toEqual([1, 2, 3, 4, 5]);
  });
});

// ── Scoring functions ───────────────────────────────────────────────────────

describe('scoreMultiSelect', () => {
  const item = PERFORMANCE_ITEMS.find((i) => i.type === 'multi_select_evaluate')!;

  it('returns maxScore when all correct and no distractors selected', () => {
    const correctIds = item.options!.filter((o) => o.isCorrect).map((o) => o.id);
    expect(scoreMultiSelect(correctIds, item)).toBe(item.maxScore);
  });

  it('returns 0 when no options selected', () => {
    expect(scoreMultiSelect([], item)).toBe(0);
  });

  it('deducts for distractors', () => {
    const distractorIds = item.options!.filter((o) => !o.isCorrect).map((o) => o.id);
    const score = scoreMultiSelect(distractorIds, item);
    expect(score).toBe(0); // negative clamped to 0
  });

  it('gives partial credit for some correct selections', () => {
    const firstCorrect = item.options!.find((o) => o.isCorrect)!.id;
    const score = scoreMultiSelect([firstCorrect], item);
    expect(score).toBe(2);
  });

  it('floors at 0 (never negative)', () => {
    const allDistractors = item.options!.filter((o) => !o.isCorrect).map((o) => o.id);
    expect(scoreMultiSelect(allDistractors, item)).toBeGreaterThanOrEqual(0);
  });

  it('returns 0 when item has no options', () => {
    expect(scoreMultiSelect(['x'], { ...item, options: undefined })).toBe(0);
  });
});

describe('scoreDragRank', () => {
  const item = PERFORMANCE_ITEMS.find((i) => i.type === 'drag_rank')!;
  const correctOrder = [...item.prompts!]
    .sort((a, b) => a.correctRank - b.correctRank)
    .map((p) => p.id);

  it('returns 8 for exact correct order', () => {
    expect(scoreDragRank(correctOrder, item)).toBe(8);
  });

  it('returns 0 for exact reverse order', () => {
    const reversed = [...correctOrder].reverse();
    expect(scoreDragRank(reversed, item)).toBe(0);
  });

  it('returns 5 for one-swap order', () => {
    // Swap first two elements
    const oneSwap = [correctOrder[1], correctOrder[0], ...correctOrder.slice(2)];
    expect(scoreDragRank(oneSwap, item)).toBe(5);
  });

  it('returns 0 when item has no prompts', () => {
    expect(scoreDragRank(['a', 'b'], { ...item, prompts: undefined })).toBe(0);
  });
});

describe('calculateProficiencyScore', () => {
  it('returns 0 when all answers are 0 and confidence is lowest', () => {
    const answers: Record<string, number> = {};
    PROFICIENCY_QUESTIONS.forEach((q) => (answers[q.id] = 0));
    // confidence 1 → -1.5 adjustment, 0 + (-1.5) = -1.5 → clamped to 0
    expect(calculateProficiencyScore(answers, 1)).toBe(0);
  });

  it('returns 8 when all answers are 8 and confidence is highest', () => {
    const answers: Record<string, number> = {};
    PROFICIENCY_QUESTIONS.forEach((q) => (answers[q.id] = 8));
    // avg 8, confidence 5 → +1.5 → 9.5 → clamped to 8
    expect(calculateProficiencyScore(answers, 5)).toBe(8);
  });

  it('applies neutral confidence (3) with no adjustment', () => {
    const answers: Record<string, number> = {};
    PROFICIENCY_QUESTIONS.forEach((q) => (answers[q.id] = 4));
    // avg 4, confidence 3 → 0 adjustment → 4
    expect(calculateProficiencyScore(answers, 3)).toBe(4);
  });

  it('applies negative confidence adjustment correctly', () => {
    const answers: Record<string, number> = {};
    PROFICIENCY_QUESTIONS.forEach((q) => (answers[q.id] = 5));
    // avg 5, confidence 2 → -0.75 → 4.25 → rounds to 4
    expect(calculateProficiencyScore(answers, 2)).toBe(4);
  });

  it('applies positive confidence adjustment correctly', () => {
    const answers: Record<string, number> = {};
    PROFICIENCY_QUESTIONS.forEach((q) => (answers[q.id] = 5));
    // avg 5, confidence 4 → +0.75 → 5.75 → rounds to 6
    expect(calculateProficiencyScore(answers, 4)).toBe(6);
  });

  it('never returns below 0', () => {
    const answers: Record<string, number> = {};
    PROFICIENCY_QUESTIONS.forEach((q) => (answers[q.id] = 0));
    expect(calculateProficiencyScore(answers, 1)).toBeGreaterThanOrEqual(0);
  });

  it('never returns above 8', () => {
    const answers: Record<string, number> = {};
    PROFICIENCY_QUESTIONS.forEach((q) => (answers[q.id] = 8));
    expect(calculateProficiencyScore(answers, 5)).toBeLessThanOrEqual(8);
  });

  it('handles missing answer keys (defaults to 0)', () => {
    // Empty answers → avg 0, confidence 3 → 0
    expect(calculateProficiencyScore({}, 3)).toBe(0);
  });
});
