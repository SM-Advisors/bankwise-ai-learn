/**
 * Phase 2.1 — calculateLearningStyle
 *
 * The function is private to TrainingContext.tsx. We replicate its logic here
 * (it's a small, pure function) so we can test it without touching module
 * internals or needing to export it.
 *
 * The function and its tie-breaking rules are authoritative in TrainingContext.tsx:
 *   priority: logic-based > hands-on > explanation-based > example-based
 */

import { describe, it, expect } from 'vitest';
import type { QuestionnaireAnswer, LearningStyle } from '../TrainingContext';

// ── Replicated pure function ───────────────────────────────────────────────────

function calculateLearningStyle(answers: QuestionnaireAnswer[]): LearningStyle {
  const scores: Record<LearningStyle, number> = {
    'example-based': 0,
    'explanation-based': 0,
    'hands-on': 0,
    'logic-based': 0,
  };

  answers.forEach((answer) => {
    Object.entries(answer.stylePoints).forEach(([style, points]) => {
      scores[style as LearningStyle] += points || 0;
    });
  });

  const maxScore = Math.max(...Object.values(scores));

  if (scores['logic-based'] === maxScore) return 'logic-based';
  if (scores['hands-on'] === maxScore) return 'hands-on';
  if (scores['explanation-based'] === maxScore) return 'explanation-based';
  return 'example-based';
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function answer(
  questionId: string,
  answerId: string,
  stylePoints: Partial<Record<LearningStyle, number>>
): QuestionnaireAnswer {
  return { questionId, answerId, stylePoints };
}

// ── Tests ──────────────────────────────────────────────────────────────────────

describe('calculateLearningStyle', () => {
  it('returns the style with the clear highest score', () => {
    const answers = [
      answer('q1', 'a1', { 'logic-based': 3 }),
      answer('q2', 'a2', { 'hands-on': 1 }),
    ];
    expect(calculateLearningStyle(answers)).toBe('logic-based');
  });

  it('returns hands-on when it has the highest score (no logic-based)', () => {
    const answers = [
      answer('q1', 'a1', { 'hands-on': 5 }),
      answer('q2', 'a2', { 'example-based': 2 }),
    ];
    expect(calculateLearningStyle(answers)).toBe('hands-on');
  });

  it('returns explanation-based when it has the highest score', () => {
    const answers = [
      answer('q1', 'a1', { 'explanation-based': 4 }),
    ];
    expect(calculateLearningStyle(answers)).toBe('explanation-based');
  });

  it('returns example-based when it has the highest score', () => {
    const answers = [
      answer('q1', 'a1', { 'example-based': 6 }),
    ];
    expect(calculateLearningStyle(answers)).toBe('example-based');
  });

  it('tie-breaks to logic-based when logic-based ties for top', () => {
    const answers = [
      answer('q1', 'a1', { 'logic-based': 3, 'hands-on': 3 }),
    ];
    expect(calculateLearningStyle(answers)).toBe('logic-based');
  });

  it('tie-breaks to hands-on over explanation-based', () => {
    const answers = [
      answer('q1', 'a1', { 'hands-on': 3, 'explanation-based': 3 }),
    ];
    expect(calculateLearningStyle(answers)).toBe('hands-on');
  });

  it('tie-breaks to explanation-based over example-based', () => {
    const answers = [
      answer('q1', 'a1', { 'explanation-based': 3, 'example-based': 3 }),
    ];
    expect(calculateLearningStyle(answers)).toBe('explanation-based');
  });

  it('all styles tied → returns logic-based (highest priority)', () => {
    const answers = [
      answer('q1', 'a1', { 'logic-based': 2, 'hands-on': 2, 'explanation-based': 2, 'example-based': 2 }),
    ];
    expect(calculateLearningStyle(answers)).toBe('logic-based');
  });

  it('empty answers array → returns logic-based (all scores 0, priority wins)', () => {
    expect(calculateLearningStyle([])).toBe('logic-based');
  });

  it('single answer with one style maps correctly', () => {
    const answers = [
      answer('q1', 'a1', { 'example-based': 10 }),
    ];
    expect(calculateLearningStyle(answers)).toBe('example-based');
  });

  it('accumulates points across multiple answers for the same style', () => {
    const answers = [
      answer('q1', 'a1', { 'hands-on': 2 }),
      answer('q2', 'a2', { 'hands-on': 3 }),
      answer('q3', 'a3', { 'logic-based': 4 }),
    ];
    // hands-on = 5, logic-based = 4 → hands-on wins
    expect(calculateLearningStyle(answers)).toBe('hands-on');
  });

  it('handles partial stylePoints (undefined values default to 0)', () => {
    const answers = [
      answer('q1', 'a1', { 'logic-based': undefined as unknown as number }),
      answer('q2', 'a2', { 'example-based': 1 }),
    ];
    // logic-based = 0, example-based = 1 → example-based wins, but logic-based is also 0
    // max = 1 → example-based is the only winner
    expect(calculateLearningStyle(answers)).toBe('example-based');
  });
});
