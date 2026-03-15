import { describe, expect, it } from 'vitest';
import { RETRIEVAL_BANK, getQuestionsForCompletedModules } from '../spacedRepetitionBank';
import { ALL_SESSION_CONTENT } from '../trainingContent';
import { SKILL_DISPLAY_NAMES } from '@/utils/deriveSkillSignals';

const allModuleIds = Object.values(ALL_SESSION_CONTENT).flatMap(
  (session) => session.modules.map((m) => m.id)
);
const validSessionIds = Object.keys(ALL_SESSION_CONTENT).map(Number);

describe('RETRIEVAL_BANK structure', () => {
  it('has at least 20 questions', () => {
    expect(RETRIEVAL_BANK.length).toBeGreaterThanOrEqual(20);
  });

  it('every question has required fields', () => {
    for (const q of RETRIEVAL_BANK) {
      expect(q.id).toBeTruthy();
      expect(q.moduleId).toBeTruthy();
      expect(typeof q.sessionId).toBe('number');
      expect(q.skill).toBeTruthy();
      expect(q.question).toBeTruthy();
      expect(q.keyAnswer).toBeTruthy();
    }
  });

  it('no duplicate question IDs', () => {
    const ids = RETRIEVAL_BANK.map((q) => q.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe('RETRIEVAL_BANK referential integrity', () => {
  it('every moduleId references a valid module', () => {
    for (const q of RETRIEVAL_BANK) {
      expect(allModuleIds).toContain(q.moduleId);
    }
  });

  it('every sessionId references a valid session', () => {
    for (const q of RETRIEVAL_BANK) {
      expect(validSessionIds).toContain(q.sessionId);
    }
  });

  it('moduleId session prefix matches sessionId', () => {
    for (const q of RETRIEVAL_BANK) {
      const sessionFromModule = parseInt(q.moduleId.split('-')[0], 10);
      expect(sessionFromModule).toBe(q.sessionId);
    }
  });
});

describe('RETRIEVAL_BANK skill tags', () => {
  it('covers sessions 1 through 3', () => {
    const sessions = new Set(RETRIEVAL_BANK.map((q) => q.sessionId));
    expect(sessions.has(1)).toBe(true);
    expect(sessions.has(2)).toBe(true);
    expect(sessions.has(3)).toBe(true);
  });
});

describe('getQuestionsForCompletedModules', () => {
  it('returns questions for completed modules only', () => {
    const result = getQuestionsForCompletedModules(['1-1', '1-3']);
    expect(result.every((q) => ['1-1', '1-3'].includes(q.moduleId))).toBe(true);
  });

  it('excludes the current module', () => {
    const result = getQuestionsForCompletedModules(['1-1', '1-3'], '1-3');
    expect(result.every((q) => q.moduleId !== '1-3')).toBe(true);
    expect(result.length).toBeGreaterThan(0);
  });

  it('returns empty for no completed modules', () => {
    expect(getQuestionsForCompletedModules([])).toHaveLength(0);
  });
});
