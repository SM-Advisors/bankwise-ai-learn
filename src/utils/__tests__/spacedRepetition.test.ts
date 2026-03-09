import { describe, expect, it } from 'vitest';
import { selectRetrievalQuestions, formatRetrievalQuestionsForAndrea } from '../spacedRepetition';
import type { RetrievalQuestion } from '@/data/spacedRepetitionBank';
import type { RetrievalResponse } from '../spacedRepetition';

// ── Helpers ──────────────────────────────────────────────────────────────────

const q = (id: string, moduleId = 'mod-1'): RetrievalQuestion => ({
  id,
  moduleId,
  sessionId: 1,
  skill: 'general',
  question: `Question ${id}`,
  keyAnswer: `Answer ${id}`,
});

const seen = (
  questionId: string,
  quality: RetrievalResponse['quality'],
  seenAt = '2026-01-01T00:00:00Z',
): RetrievalResponse => ({ questionId, quality, seenAt });

// ── selectRetrievalQuestions ─────────────────────────────────────────────────

describe('selectRetrievalQuestions', () => {
  it('returns empty array when no questions are provided', () => {
    const result = selectRetrievalQuestions([], {
      completedModuleIds: ['mod-1'],
      seenResponses: [],
    });
    expect(result).toEqual([]);
  });

  it('respects maxQuestions limit (default 2)', () => {
    const questions = [q('q1'), q('q2'), q('q3'), q('q4')];
    const result = selectRetrievalQuestions(questions, {
      completedModuleIds: ['mod-1'],
      seenResponses: [],
    });
    expect(result.length).toBeLessThanOrEqual(2);
  });

  it('respects custom maxQuestions', () => {
    const questions = [q('q1'), q('q2'), q('q3')];
    const result = selectRetrievalQuestions(questions, {
      completedModuleIds: ['mod-1'],
      seenResponses: [],
      maxQuestions: 1,
    });
    expect(result.length).toBeLessThanOrEqual(1);
  });

  it('excludes questions from currentModuleId', () => {
    const questions = [
      q('q1', 'current-mod'),
      q('q2', 'other-mod'),
    ];
    const result = selectRetrievalQuestions(questions, {
      completedModuleIds: ['current-mod', 'other-mod'],
      seenResponses: [],
      currentModuleId: 'current-mod',
    });
    expect(result.every(r => r.moduleId !== 'current-mod')).toBe(true);
  });

  it('prioritizes weak questions (quality < 3) over unseen', () => {
    const questions = [
      q('weak', 'mod-old'),  // seen with low quality
      q('unseen', 'mod-new'), // never seen
    ];
    const seenResponses = [seen('weak', 2)]; // quality 2 = weak
    const result = selectRetrievalQuestions(questions, {
      completedModuleIds: ['mod-old', 'mod-new'],
      seenResponses,
      maxQuestions: 1,
    });
    // Weak question should be selected before unseen (but shuffle may reorder; check inclusion)
    const ids = result.map(r => r.id);
    expect(ids).toContain('weak');
  });

  it('selects unseen recent questions over unseen older questions', () => {
    // Recent = last 3 completed modules
    const questions = [
      q('recent', 'mod-3'), // last 3
      q('older', 'mod-0'),  // older
    ];
    const result = selectRetrievalQuestions(questions, {
      completedModuleIds: ['mod-0', 'mod-1', 'mod-2', 'mod-3'],
      seenResponses: [],
      maxQuestions: 1,
    });
    const ids = result.map(r => r.id);
    expect(ids).toContain('recent');
  });

  it('returns up to maxQuestions even when only weak questions exist', () => {
    const questions = [q('w1'), q('w2'), q('w3')];
    const responses = [
      seen('w1', 1),
      seen('w2', 2),
      seen('w3', 0),
    ];
    const result = selectRetrievalQuestions(questions, {
      completedModuleIds: ['mod-1'],
      seenResponses: responses,
      maxQuestions: 2,
    });
    expect(result.length).toBeLessThanOrEqual(2);
  });

  it('uses most recent response per question (deduplication)', () => {
    // q1 seen twice: quality 1 (old) then quality 5 (recent). Most recent = 5 = strong → not weak
    const questions = [q('q1'), q('q2')];
    const responses = [
      seen('q1', 1, '2025-01-01T00:00:00Z'), // old, weak
      seen('q1', 5, '2026-01-01T00:00:00Z'), // recent, strong
    ];
    const result = selectRetrievalQuestions(questions, {
      completedModuleIds: ['mod-1'],
      seenResponses: responses,
      maxQuestions: 2,
    });
    // q1 should be in reviewDue (not weak) since latest quality is 5
    // q2 is unseen → selected before reviewDue
    const ids = result.map(r => r.id);
    expect(ids).toContain('q2'); // unseen preferred
  });

  it('includes questions from reviewDue bucket when no unseen/weak remain', () => {
    const questions = [q('q1')];
    const responses = [seen('q1', 4)]; // quality 4 = ok → goes to reviewDue
    const result = selectRetrievalQuestions(questions, {
      completedModuleIds: ['mod-1'],
      seenResponses: responses,
      maxQuestions: 2,
    });
    expect(result.map(r => r.id)).toContain('q1');
  });

  it('returns at most available questions when pool is smaller than maxQuestions', () => {
    const questions = [q('q1')];
    const result = selectRetrievalQuestions(questions, {
      completedModuleIds: ['mod-1'],
      seenResponses: [],
      maxQuestions: 5,
    });
    expect(result.length).toBe(1);
  });

  it('never returns duplicate questions', () => {
    const questions = [q('q1'), q('q2'), q('q3')];
    const result = selectRetrievalQuestions(questions, {
      completedModuleIds: ['mod-1'],
      seenResponses: [],
      maxQuestions: 3,
    });
    const ids = result.map(r => r.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

// ── formatRetrievalQuestionsForAndrea ────────────────────────────────────────

describe('formatRetrievalQuestionsForAndrea', () => {
  it('returns empty string when given an empty array', () => {
    expect(formatRetrievalQuestionsForAndrea([])).toBe('');
  });

  it('returns non-empty string for a single question', () => {
    const result = formatRetrievalQuestionsForAndrea([q('q1', 'mod-1')]);
    expect(result.length).toBeGreaterThan(0);
  });

  it('includes the question text in the output', () => {
    const question = q('q1', 'mod-1');
    const result = formatRetrievalQuestionsForAndrea([question]);
    expect(result).toContain('Question q1');
  });

  it('includes the key answer in the output', () => {
    const question = q('q1', 'mod-1');
    const result = formatRetrievalQuestionsForAndrea([question]);
    expect(result).toContain('Answer q1');
  });

  it('includes the module ID in the output', () => {
    const result = formatRetrievalQuestionsForAndrea([q('q1', 'session-1-mod-3')]);
    expect(result).toContain('session-1-mod-3');
  });

  it('includes a header block for context', () => {
    const result = formatRetrievalQuestionsForAndrea([q('q1')]);
    expect(result).toContain('SPACED RETRIEVAL PRACTICE');
  });

  it('numbers multiple questions sequentially', () => {
    const result = formatRetrievalQuestionsForAndrea([q('q1'), q('q2')]);
    expect(result).toContain('Retrieval Question 1');
    expect(result).toContain('Retrieval Question 2');
  });

  it('includes instructions about natural timing', () => {
    const result = formatRetrievalQuestionsForAndrea([q('q1')]);
    expect(result.toLowerCase()).toContain('natural');
  });
});
