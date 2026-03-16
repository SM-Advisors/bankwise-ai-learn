import { describe, expect, it } from 'vitest';
import { calculateLearningStyle, type QuestionnaireAnswer } from '../TrainingContext';

const answer = (
  questionId: string,
  stylePoints: Partial<Record<string, number>>
): QuestionnaireAnswer => ({
  questionId,
  answerId: 'a',
  stylePoints,
});

describe('calculateLearningStyle', () => {
  it('returns logic-based when all scores are zero (tie-break default)', () => {
    expect(calculateLearningStyle([])).toBe('logic-based');
  });

  it('returns the style with the highest score', () => {
    const answers = [answer('q1', { 'hands-on': 5, 'logic-based': 1 })];
    expect(calculateLearningStyle(answers)).toBe('hands-on');
  });

  it('returns example-based when it has the highest score', () => {
    const answers = [answer('q1', { 'example-based': 10, 'logic-based': 2 })];
    expect(calculateLearningStyle(answers)).toBe('example-based');
  });

  it('returns explanation-based when it has the highest score', () => {
    const answers = [answer('q1', { 'explanation-based': 7 })];
    expect(calculateLearningStyle(answers)).toBe('explanation-based');
  });

  it('accumulates points across multiple answers', () => {
    const answers = [
      answer('q1', { 'hands-on': 3, 'logic-based': 1 }),
      answer('q2', { 'hands-on': 2, 'logic-based': 1 }),
    ];
    expect(calculateLearningStyle(answers)).toBe('hands-on');
  });

  // Tie-breaking: logic-based > hands-on > explanation-based > example-based
  it('tie-break: logic-based wins over hands-on', () => {
    const answers = [answer('q1', { 'logic-based': 5, 'hands-on': 5 })];
    expect(calculateLearningStyle(answers)).toBe('logic-based');
  });

  it('tie-break: hands-on wins over explanation-based', () => {
    const answers = [answer('q1', { 'hands-on': 5, 'explanation-based': 5 })];
    expect(calculateLearningStyle(answers)).toBe('hands-on');
  });

  it('tie-break: explanation-based wins over example-based', () => {
    const answers = [answer('q1', { 'explanation-based': 5, 'example-based': 5 })];
    expect(calculateLearningStyle(answers)).toBe('explanation-based');
  });

  it('all four styles tied returns logic-based', () => {
    const answers = [
      answer('q1', { 'logic-based': 3, 'hands-on': 3, 'explanation-based': 3, 'example-based': 3 }),
    ];
    expect(calculateLearningStyle(answers)).toBe('logic-based');
  });

  it('handles missing/undefined point values gracefully', () => {
    const answers = [answer('q1', { 'hands-on': undefined as unknown as number, 'logic-based': 2 })];
    expect(calculateLearningStyle(answers)).toBe('logic-based');
  });

  it('single answer maps correctly', () => {
    const answers = [answer('q1', { 'example-based': 1 })];
    expect(calculateLearningStyle(answers)).toBe('example-based');
  });
});
