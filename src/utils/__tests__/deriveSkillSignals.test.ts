import { describe, expect, it } from 'vitest';
import { deriveSkillSignals, aggregateSkillSignals, SKILL_DISPLAY_NAMES } from '../deriveSkillSignals';
import type { SkillSignal } from '@/types/progress';

// ── deriveSkillSignals ────────────────────────────────────────────────────────

describe('deriveSkillSignals', () => {
  it('returns empty array when both strengths and issues are empty', () => {
    const signals = deriveSkillSignals({ strengths: [], issues: [] }, 'mod-1');
    expect(signals).toEqual([]);
  });

  it('produces proficient signal for keywords in strengths', () => {
    const signals = deriveSkillSignals({
      strengths: ['Great use of context and background information'],
      issues: [],
    }, 'mod-1');
    const signal = signals.find(s => s.skill === 'context_setting');
    expect(signal).toBeDefined();
    expect(signal?.level).toBe('proficient');
  });

  it('produces emerging signal for keywords in issues', () => {
    const signals = deriveSkillSignals({
      strengths: [],
      issues: ['Needs more specific details and clarity'],
    }, 'mod-1');
    const signal = signals.find(s => s.skill === 'specificity');
    expect(signal).toBeDefined();
    expect(signal?.level).toBe('emerging');
  });

  it('strength takes precedence over issue for the same skill', () => {
    const signals = deriveSkillSignals({
      strengths: ['Excellent context and role definition'],
      issues: ['Could provide more context for better results'],
    }, 'mod-1');
    const contextSignals = signals.filter(s => s.skill === 'context_setting');
    expect(contextSignals).toHaveLength(1);
    expect(contextSignals[0].level).toBe('proficient');
  });

  it('each skill appears at most once in the output', () => {
    const signals = deriveSkillSignals({
      strengths: ['Good formatting and structure', 'Clear output format and layout'],
      issues: ['Formatting could be improved'],
    }, 'mod-1');
    const formattingSignals = signals.filter(s => s.skill === 'formatting');
    expect(formattingSignals).toHaveLength(1);
  });

  it('keyword matching is case-insensitive', () => {
    const lower = deriveSkillSignals({ strengths: ['good context'], issues: [] }, 'mod-1');
    const upper = deriveSkillSignals({ strengths: ['Good CONTEXT'], issues: [] }, 'mod-1');
    expect(lower.map(s => s.skill)).toEqual(upper.map(s => s.skill));
  });

  it('attaches the correct moduleId as source', () => {
    const signals = deriveSkillSignals({
      strengths: ['Strong compliance and regulatory awareness'],
      issues: [],
    }, 'session-2-module-3');
    expect(signals[0].source).toBe('session-2-module-3');
  });

  it('includes a timestamp on each signal', () => {
    const before = new Date().toISOString();
    const signals = deriveSkillSignals({
      strengths: ['Great use of PII placeholder and security practices'],
      issues: [],
    }, 'mod-1');
    const after = new Date().toISOString();
    // ISO strings sort lexicographically
    expect(signals[0].timestamp >= before).toBe(true);
    expect(signals[0].timestamp <= after).toBe(true);
  });

  it('can derive multiple skills from a single strength sentence', () => {
    // Mentions context, PII (data_security), and compliance
    const signals = deriveSkillSignals({
      strengths: ['You set clear context, avoided PII, and included a compliance disclaimer'],
      issues: [],
    }, 'mod-1');
    const skills = signals.map(s => s.skill);
    expect(skills).toContain('context_setting');
    expect(skills).toContain('data_security');
    expect(skills).toContain('compliance');
  });

  it('derives signals from multiple strength entries', () => {
    const signals = deriveSkillSignals({
      strengths: [
        'Good use of context and background',
        'Clear audience awareness for the committee',
      ],
      issues: [],
    }, 'mod-1');
    const skills = signals.map(s => s.skill);
    expect(skills).toContain('context_setting');
    expect(skills).toContain('audience_awareness');
  });
});

// ── aggregateSkillSignals ────────────────────────────────────────────────────

describe('aggregateSkillSignals', () => {
  it('returns empty array for no signals', () => {
    expect(aggregateSkillSignals([])).toEqual([]);
  });

  it('keeps highest level when same skill appears multiple times', () => {
    const signals: SkillSignal[] = [
      { skill: 'specificity', level: 'emerging', source: '1-1', timestamp: '2026-01-01T00:00:00Z' },
      { skill: 'specificity', level: 'proficient', source: '1-2', timestamp: '2026-01-02T00:00:00Z' },
    ];
    const result = aggregateSkillSignals(signals);
    const spec = result.find(r => r.skill === 'specificity');
    expect(spec?.level).toBe('proficient');
    expect(result.filter(r => r.skill === 'specificity')).toHaveLength(1);
  });

  it('proficient ranks higher than developing, developing higher than emerging', () => {
    const signals: SkillSignal[] = [
      { skill: 'formatting', level: 'emerging', source: '1-1', timestamp: '2026-01-01T00:00:00Z' },
      { skill: 'formatting', level: 'developing', source: '1-2', timestamp: '2026-01-02T00:00:00Z' },
      { skill: 'formatting', level: 'proficient', source: '1-3', timestamp: '2026-01-03T00:00:00Z' },
    ];
    const result = aggregateSkillSignals(signals);
    expect(result[0].level).toBe('proficient');
  });

  it('results are sorted by level priority (proficient first)', () => {
    const signals: SkillSignal[] = [
      { skill: 'compliance', level: 'emerging', source: '1-1', timestamp: '2026-01-01T00:00:00Z' },
      { skill: 'specificity', level: 'proficient', source: '1-2', timestamp: '2026-01-02T00:00:00Z' },
      { skill: 'formatting', level: 'developing', source: '1-3', timestamp: '2026-01-03T00:00:00Z' },
    ];
    const result = aggregateSkillSignals(signals);
    expect(result[0].level).toBe('proficient');
    expect(result[result.length - 1].level).toBe('emerging');
  });

  it('attaches displayName to each aggregated skill', () => {
    const signals: SkillSignal[] = [
      { skill: 'context_setting', level: 'proficient', source: '1-1', timestamp: '2026-01-01T00:00:00Z' },
    ];
    const result = aggregateSkillSignals(signals);
    expect(result[0].displayName).toBe('Context Setting');
  });

  it('falls back to skill key as displayName for unknown skills', () => {
    const signals: SkillSignal[] = [
      { skill: 'unknown_skill_xyz', level: 'emerging', source: '1-1', timestamp: '2026-01-01T00:00:00Z' },
    ];
    const result = aggregateSkillSignals(signals);
    expect(result[0].displayName).toBe('unknown_skill_xyz');
  });

  it('deduplicates across many signals for the same skill', () => {
    const signals: SkillSignal[] = Array.from({ length: 10 }, (_, i) => ({
      skill: 'compliance',
      level: 'emerging' as const,
      source: `mod-${i}`,
      timestamp: `2026-01-0${i + 1}T00:00:00Z`,
    }));
    const result = aggregateSkillSignals(signals);
    expect(result.filter(r => r.skill === 'compliance')).toHaveLength(1);
  });
});

// ── SKILL_DISPLAY_NAMES ──────────────────────────────────────────────────────

describe('SKILL_DISPLAY_NAMES', () => {
  it('contains human-readable names for all expected skills', () => {
    const expectedSkills = [
      'context_setting', 'specificity', 'data_security',
      'formatting', 'compliance', 'clear_framework',
      'iteration', 'audience_awareness',
    ];
    for (const skill of expectedSkills) {
      expect(SKILL_DISPLAY_NAMES[skill]).toBeTruthy();
      expect(typeof SKILL_DISPLAY_NAMES[skill]).toBe('string');
    }
  });
});
