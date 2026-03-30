/**
 * Phase 3.3 — data/proficiencyAssessment.ts validation
 */

import { describe, it, expect } from 'vitest';
import {
  PROFICIENCY_QUESTIONS,
  PERFORMANCE_ITEMS,
  calculateProficiencyScore,
} from '../proficiencyAssessment';

// ── PROFICIENCY_QUESTIONS ──────────────────────────────────────────────────────

describe('PROFICIENCY_QUESTIONS — required fields', () => {
  it('all questions have id, question/scenario, and options with scores', () => {
    for (const q of PROFICIENCY_QUESTIONS) {
      expect(q.id, 'question missing id').toBeTruthy();
      // The field is "scenario" in the type definition
      expect(q.scenario, `question ${q.id} missing scenario`).toBeTruthy();
      expect(Array.isArray(q.options), `question ${q.id} options should be an array`).toBe(true);
      expect(q.options.length, `question ${q.id} has no options`).toBeGreaterThan(0);

      for (const option of q.options) {
        expect(typeof option.score, `${q.id} option missing score`).toBe('number');
      }
    }
  });

  it('all option scores are in the allowed set: 0, 2, 5, or 8', () => {
    const allowed = new Set([0, 2, 5, 8]);
    for (const q of PROFICIENCY_QUESTIONS) {
      for (const option of q.options) {
        expect(
          allowed.has(option.score),
          `${q.id} option has invalid score ${option.score}`
        ).toBe(true);
      }
    }
  });

  it('no duplicate question IDs', () => {
    const ids = PROFICIENCY_QUESTIONS.map((q) => q.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

// ── PERFORMANCE_ITEMS ─────────────────────────────────────────────────────────

describe('PERFORMANCE_ITEMS — required fields', () => {
  it('all items have id, type, scenario, and instructions', () => {
    for (const item of PERFORMANCE_ITEMS) {
      expect(item.id, 'item missing id').toBeTruthy();
      expect(item.type, `item ${item.id} missing type`).toBeTruthy();
      expect(item.scenario, `item ${item.id} missing scenario`).toBeTruthy();
      expect(item.instructions, `item ${item.id} missing instructions`).toBeTruthy();
    }
  });

  it('no duplicate item IDs', () => {
    const ids = PERFORMANCE_ITEMS.map((i) => i.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('multi_select items have options where correctIds and distractorIds do not overlap', () => {
    const multiSelectItems = PERFORMANCE_ITEMS.filter((i) => i.type === 'multi_select_evaluate');
    for (const item of multiSelectItems) {
      expect(item.options, `multi_select item ${item.id} has no options`).toBeDefined();
      const correctIds = item.options!.filter((o) => o.isCorrect).map((o) => o.id);
      const distractorIds = item.options!.filter((o) => !o.isCorrect).map((o) => o.id);
      const overlap = correctIds.filter((id) => distractorIds.includes(id));
      expect(
        overlap.length,
        `item ${item.id}: correctIds and distractorIds overlap: ${overlap.join(', ')}`
      ).toBe(0);
    }
  });

  it('drag_rank items have prompts with correctRank covering all prompt IDs', () => {
    const dragRankItems = PERFORMANCE_ITEMS.filter((i) => i.type === 'drag_rank');
    for (const item of dragRankItems) {
      expect(item.prompts, `drag_rank item ${item.id} has no prompts`).toBeDefined();
      const ranks = item.prompts!.map((p) => p.correctRank).sort((a, b) => a - b);
      // Should be a contiguous sequence starting at 1: [1, 2, 3, ...]
      for (let i = 0; i < ranks.length; i++) {
        expect(
          ranks[i],
          `item ${item.id}: correctRank sequence broken at index ${i}`
        ).toBe(i + 1);
      }
    }
  });
});

// ── calculateProficiencyScore ─────────────────────────────────────────────────

describe('calculateProficiencyScore', () => {
  const questionIds = PROFICIENCY_QUESTIONS.map((q) => q.id);

  it('all-zero answers + neutral confidence (3) → score 0', () => {
    const answers = Object.fromEntries(questionIds.map((id) => [id, 0]));
    expect(calculateProficiencyScore(answers, 3)).toBe(0);
  });

  it('all-max answers (8 each) + neutral confidence (3) → score 8', () => {
    const answers = Object.fromEntries(questionIds.map((id) => [id, 8]));
    expect(calculateProficiencyScore(answers, 3)).toBe(8);
  });

  it('mid-range answers (5 each) + low confidence (1) lowers the score', () => {
    const answers = Object.fromEntries(questionIds.map((id) => [id, 5]));
    const neutralScore = calculateProficiencyScore(answers, 3);
    const lowConfScore = calculateProficiencyScore(answers, 1);
    expect(lowConfScore).toBeLessThan(neutralScore);
  });

  it('mid-range answers (5 each) + high confidence (5) raises the score', () => {
    const answers = Object.fromEntries(questionIds.map((id) => [id, 5]));
    const neutralScore = calculateProficiencyScore(answers, 3);
    const highConfScore = calculateProficiencyScore(answers, 5);
    expect(highConfScore).toBeGreaterThan(neutralScore);
  });

  it('output is always clamped to 0-8', () => {
    // All zeros, lowest confidence
    const minAnswers = Object.fromEntries(questionIds.map((id) => [id, 0]));
    expect(calculateProficiencyScore(minAnswers, 1)).toBeGreaterThanOrEqual(0);

    // All max, highest confidence
    const maxAnswers = Object.fromEntries(questionIds.map((id) => [id, 8]));
    expect(calculateProficiencyScore(maxAnswers, 5)).toBeLessThanOrEqual(8);
  });

  it('output is an integer (Math.round applied)', () => {
    const answers = Object.fromEntries(questionIds.map((id) => [id, 5]));
    const score = calculateProficiencyScore(answers, 4);
    expect(Number.isInteger(score)).toBe(true);
  });
});
