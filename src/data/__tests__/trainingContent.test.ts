import { describe, expect, it } from 'vitest';
import { ALL_SESSION_CONTENT, type SessionContent, type ModuleContent } from '../trainingContent';

const sessionIds = Object.keys(ALL_SESSION_CONTENT).map(Number);
const allModules: ModuleContent[] = sessionIds.flatMap(
  (id) => ALL_SESSION_CONTENT[id].modules
);

describe('ALL_SESSION_CONTENT structure', () => {
  it('has at least 3 sessions', () => {
    expect(sessionIds.length).toBeGreaterThanOrEqual(3);
  });

  it('every session has an id, title, description, and at least one module', () => {
    for (const id of sessionIds) {
      const session: SessionContent = ALL_SESSION_CONTENT[id];
      expect(session.id).toBe(id);
      expect(session.title).toBeTruthy();
      expect(session.description).toBeTruthy();
      expect(session.modules.length).toBeGreaterThan(0);
    }
  });
});

describe('module required fields', () => {
  it('every module has id, title, type, description, and content', () => {
    for (const mod of allModules) {
      expect(mod.id).toBeTruthy();
      expect(mod.title).toBeTruthy();
      expect(mod.type).toBeTruthy();
      expect(mod.description).toBeTruthy();
      expect(mod.content).toBeDefined();
    }
  });

  it('every module has learningObjectives and learningOutcome', () => {
    for (const mod of allModules) {
      expect(mod.learningObjectives.length).toBeGreaterThan(0);
      expect(mod.learningOutcome).toBeTruthy();
    }
  });

  it('every module content has overview and keyPoints', () => {
    for (const mod of allModules) {
      expect(mod.content.overview).toBeTruthy();
      expect(mod.content.keyPoints.length).toBeGreaterThan(0);
    }
  });

  it('every module content has a practiceTask with instructions and successCriteria', () => {
    for (const mod of allModules) {
      expect(mod.content.practiceTask).toBeDefined();
      expect(mod.content.practiceTask.instructions).toBeTruthy();
      expect(mod.content.practiceTask.successCriteria.length).toBeGreaterThan(0);
    }
  });
});

describe('module IDs', () => {
  it('follow the format {session}-{number}', () => {
    for (const mod of allModules) {
      expect(mod.id).toMatch(/^\d+-\d+$/);
    }
  });

  it('no duplicate module IDs across all sessions', () => {
    const ids = allModules.map((m) => m.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('module IDs match their parent session number', () => {
    for (const id of sessionIds) {
      for (const mod of ALL_SESSION_CONTENT[id].modules) {
        expect(mod.id.startsWith(`${id}-`)).toBe(true);
      }
    }
  });
});

describe('gate modules', () => {
  const gateModules = allModules.filter((m) => m.isGateModule);

  it('at least one gate module exists', () => {
    expect(gateModules.length).toBeGreaterThan(0);
  });

  it('known gate modules are present', () => {
    const gateIds = gateModules.map((m) => m.id);
    // These are the documented gate positions
    expect(gateIds).toContain('1-3');
    expect(gateIds).toContain('1-4');
    expect(gateIds).toContain('2-1');
    expect(gateIds).toContain('3-3');
  });
});
