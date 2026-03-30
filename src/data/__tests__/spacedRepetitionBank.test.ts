/**
 * Phase 3.2 — data/spacedRepetitionBank.ts validation
 */

import { describe, it, expect } from 'vitest';
import { RETRIEVAL_BANK } from '../spacedRepetitionBank';
import { ALL_SESSION_CONTENT } from '../trainingContent';

const validModuleIds = new Set(
  Object.values(ALL_SESSION_CONTENT).flatMap((s) => s.modules.map((m) => m.id))
);

const validSessionIds = new Set(Object.keys(ALL_SESSION_CONTENT).map(Number));

describe('RETRIEVAL_BANK — required fields', () => {
  it('all questions have required fields: id, moduleId, sessionId, skill, question, keyAnswer', () => {
    for (const q of RETRIEVAL_BANK) {
      expect(q.id, `question missing id`).toBeTruthy();
      expect(q.moduleId, `question ${q.id} missing moduleId`).toBeTruthy();
      expect(q.sessionId, `question ${q.id} missing sessionId`).toBeDefined();
      expect(q.skill, `question ${q.id} missing skill`).toBeTruthy();
      expect(q.question, `question ${q.id} missing question`).toBeTruthy();
      expect(q.keyAnswer, `question ${q.id} missing keyAnswer`).toBeTruthy();
    }
  });

  it('has at least one question', () => {
    expect(RETRIEVAL_BANK.length).toBeGreaterThan(0);
  });
});

describe('RETRIEVAL_BANK — no duplicates', () => {
  it('no duplicate question IDs', () => {
    const ids = RETRIEVAL_BANK.map((q) => q.id);
    const unique = new Set(ids);
    expect(unique.size).toBe(ids.length);
  });
});

describe('RETRIEVAL_BANK — referential integrity', () => {
  it('every moduleId references a valid module in ALL_SESSION_CONTENT', () => {
    for (const q of RETRIEVAL_BANK) {
      expect(
        validModuleIds.has(q.moduleId),
        `question ${q.id} has invalid moduleId "${q.moduleId}"`
      ).toBe(true);
    }
  });

  it('every sessionId references a valid session', () => {
    for (const q of RETRIEVAL_BANK) {
      expect(
        validSessionIds.has(q.sessionId),
        `question ${q.id} has invalid sessionId ${q.sessionId}`
      ).toBe(true);
    }
  });
});

describe('RETRIEVAL_BANK — skill tags', () => {
  it('all skill values are non-empty strings', () => {
    for (const q of RETRIEVAL_BANK) {
      expect(typeof q.skill).toBe('string');
      expect(q.skill.length, `question ${q.id} has empty skill tag`).toBeGreaterThan(0);
    }
  });

  it('skill tags use snake_case format', () => {
    const snakeCase = /^[a-z][a-z0-9_]*$/;
    for (const q of RETRIEVAL_BANK) {
      expect(
        snakeCase.test(q.skill),
        `question ${q.id} skill "${q.skill}" is not snake_case`
      ).toBe(true);
    }
  });
});
