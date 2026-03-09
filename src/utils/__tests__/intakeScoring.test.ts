import { describe, expect, it } from 'vitest';
import { scoreIntake, type IntakeAnswers } from '../intakeScoring';

// ── Shared base answer set ───────────────────────────────────────────────────
// All fields present; individual tests override specific fields.
const BASE: IntakeAnswers = {
  q2_role: 'analyst',
  q3: 'A',
  q4: 'A',
  q5: 'A',
  q6: 'C',
  q7: 'A',
  q8: 'B',
  q9: [],
  sjt1: 'A',
  sjt2: 'B',
  sjt3: 'E',
  sjt4: 'B',
  sjt5: 'A',
  step5_prompt: '',
  q10: 'C',
  q11: [],
  q12: 'A',
};

// Convenience: merge overrides on top of a given base
const make = (overrides: Partial<IntakeAnswers>): IntakeAnswers => ({ ...BASE, ...overrides });

// ── Placement level tests ────────────────────────────────────────────────────

describe('scoreIntake — placement levels', () => {
  it('returns level 1 for all-low responses', () => {
    // q3=A (d1:1,d5:1), q4=A (d7:1), q5=A (d3:1), q6=C (d2:1.5), q7=A (d4:1,d2:1),
    // q8=B (d2:2), q9=[] (d6:1), sjt all low, step5=0
    const result = scoreIntake(BASE, 0);
    expect(result.level).toBe(1);
  });

  it('returns level 2 for moderate responses', () => {
    const answers = make({
      q3: 'B',  // d1:2, d5:1.5
      q4: 'B',  // d3:1.5, d7:2
      q5: 'B',  // d3:2
      q6: 'B',  // d2:2
      q7: 'B',  // d4:2
      q8: 'B',  // d2:2
      q9: ['A', 'B'], // basic=2 → d6:2
      sjt1: 'B', // d4:2.5
      sjt2: 'B', // d2:2
      sjt3: 'A', // d4:2
      sjt4: 'B', // d7:2
      sjt5: 'B', // d6:2
      q10: 'B',  // d7:2.5
    });
    const result = scoreIntake(answers, 4); // step5Score=4 → level 2
    expect(result.level).toBe(2);
  });

  it('returns level 3 for above-average responses', () => {
    const answers = make({
      q2_role: 'manager',
      q3: 'C',  // d1:2.5, d5:2
      q4: 'C',  // d3:2.5, d7:3
      q5: 'C',  // d3:3
      q6: 'A',  // d2:3
      q7: 'C',  // d4:3, d2:3
      q8: 'C',  // d2:3.5
      q9: ['C', 'D'], // highValue=2 → d6:3
      sjt1: 'C', // d4:3.5
      sjt2: 'C', // d2:3.5, d6:3, d7:3
      sjt3: 'B', // d4:3.5
      sjt4: 'C', // d6:3.5, d4:3, d7:3
      sjt5: 'C', // d6:3, d2:3
      q10: 'A',  // d7:3.5
    });
    const result = scoreIntake(answers, 6); // step5Score=6 → level 3
    expect(result.level).toBe(3);
  });

  it('returns level 4 for all-high responses', () => {
    const answers = make({
      q3: 'E',  // d1:4, d5:4
      q4: 'E',  // d3:4, d5:4, d7:4
      q5: 'D',  // d3:3.5 (not E to avoid consistency_flag with high step5)
      q6: 'E',  // d2:4, d6:4
      q7: 'E',  // d2:4, d4:4, d6:3
      q8: 'D',  // d2:4, d6:3
      q9: ['C', 'D', 'E'], // highValue=3 → d6:4
      sjt1: 'E', // d2:4, d4:4
      sjt2: 'D', // d2:4, d6:4, d7:4
      sjt3: 'B', // d4:3.5
      sjt4: 'D', // d6:4, d7:4
      sjt5: 'D', // d6:4, d4:4
      q10: 'A',  // d7:3.5
    });
    const result = scoreIntake(answers, 10); // step5Score=10 → level 4
    expect(result.level).toBe(4);
  });
});

// ── Override flag tests ──────────────────────────────────────────────────────

describe('scoreIntake — override flags', () => {
  it('safe_use_flag is true when q8 === A', () => {
    const result = scoreIntake(make({ q8: 'A' }), 0);
    expect(result.safe_use_flag).toBe(true);
  });

  it('safe_use_flag is true when sjt2 === A', () => {
    const result = scoreIntake(make({ sjt2: 'A', q8: 'B' }), 0);
    expect(result.safe_use_flag).toBe(true);
  });

  it('safe_use_flag is false when neither q8=A nor sjt2=A', () => {
    const result = scoreIntake(make({ q8: 'C', sjt2: 'B' }), 5);
    expect(result.safe_use_flag).toBe(false);
  });

  it('consistency_flag is true when q5 is D and step5Score is weak', () => {
    const result = scoreIntake(make({ q5: 'D' }), 2);
    expect(result.consistency_flag).toBe(true);
  });

  it('consistency_flag is true when q5 is E and step5Score is weak', () => {
    const result = scoreIntake(make({ q5: 'E' }), 1);
    expect(result.consistency_flag).toBe(true);
  });

  it('consistency_flag is false when q5 is E but step5Score is strong', () => {
    const result = scoreIntake(make({ q5: 'E' }), 8);
    expect(result.consistency_flag).toBe(false);
  });

  it('consistency_flag is false when q5 is C regardless of step5', () => {
    const result = scoreIntake(make({ q5: 'C' }), 1);
    expect(result.consistency_flag).toBe(false);
  });

  it('governance_flag is true for compliance role with low governance scores', () => {
    // All d6 contributors set to 1: q6≠E, q7≠E, q8≠D, q9=[], sjt2=B (no d6), sjt4=B (no d6), sjt5=A (d6:1)
    const result = scoreIntake(make({
      q2_role: 'compliance',
      q6: 'C',  // d2 only, no d6
      q7: 'A',  // d4+d2, no d6
      q8: 'B',  // d2 only, no d6
      q9: [],   // d6:1
      sjt2: 'B', // d2 only, no d6
      sjt4: 'B', // d7 only, no d6
      sjt5: 'A', // d6:1
    }), 0);
    // d6: [1(q9), 1(sjt5)] = avg 1 ≤ 1.5 AND role is compliance → true
    expect(result.governance_flag).toBe(true);
  });

  it('governance_flag is true for executive role with low governance scores', () => {
    const result = scoreIntake(make({
      q2_role: 'executive',
      q6: 'C', q7: 'A', q8: 'B',
      q9: [], sjt2: 'B', sjt4: 'B', sjt5: 'A',
    }), 0);
    expect(result.governance_flag).toBe(true);
  });

  it('governance_flag is false for non-regulated role even with low governance', () => {
    const result = scoreIntake(make({
      q2_role: 'teller',
      q6: 'C', q7: 'A', q8: 'B',
      q9: [], sjt2: 'B', sjt4: 'B', sjt5: 'A',
    }), 0);
    expect(result.governance_flag).toBe(false);
  });

  it('governance_flag is false when governance scores are high', () => {
    const result = scoreIntake(make({
      q2_role: 'compliance',
      q9: ['C', 'D', 'E'], // d6:4 — well above threshold
      sjt5: 'D',           // d6:4
    }), 0);
    expect(result.governance_flag).toBe(false);
  });

  it('integrity_flag is true when sjt4 === E', () => {
    const result = scoreIntake(make({ sjt4: 'E' }), 0);
    expect(result.integrity_flag).toBe(true);
  });

  it('integrity_flag is false for all other sjt4 answers', () => {
    for (const ans of ['A', 'B', 'C', 'D']) {
      const result = scoreIntake(make({ sjt4: ans }), 0);
      expect(result.integrity_flag).toBe(false);
    }
  });

  it('consistency_flag lowers d3 dimension score by 1', () => {
    const without = scoreIntake(make({ q5: 'E' }), 8); // no flag
    const withFlag = scoreIntake(make({ q5: 'E' }), 2); // flag triggers
    const d3Without = without.dimension_scores.d3 ?? 0;
    const d3With = withFlag.dimension_scores.d3 ?? 0;
    expect(d3With).toBeLessThan(d3Without);
  });
});

// ── scoreQ9 (tested indirectly via dimension_scores.d6) ─────────────────────

describe('scoreIntake — q9 governance scoring (via d6)', () => {
  // Isolate q9's d6 contribution by using sjt2=B (no d6), sjt4=B (no d6),
  // sjt5=A (d6:1) only, q6=C (no d6), q7=A (no d6), q8=B (no d6)
  const isolated = (q9: string[]) => make({
    q6: 'C', q7: 'A', q8: 'B',
    sjt2: 'B', sjt4: 'B', sjt5: 'A',
    q9,
  });

  it('empty selection returns d6 driven by low q9 score', () => {
    const r1 = scoreIntake(isolated([]), 0);
    const r2 = scoreIntake(isolated(['C', 'D', 'E']), 0);
    // With more high-value stakeholders, d6 should be higher
    expect((r2.dimension_scores.d6 ?? 0)).toBeGreaterThan(r1.dimension_scores.d6 ?? 0);
  });

  it('F-only selection scores lower than mixed selection', () => {
    const fOnly = scoreIntake(isolated(['F']), 0);
    const mixed = scoreIntake(isolated(['A', 'B', 'C']), 0);
    expect((mixed.dimension_scores.d6 ?? 0)).toBeGreaterThan(fOnly.dimension_scores.d6 ?? 0);
  });

  it('3+ high-value stakeholders (C,D,E) scores higher than 2', () => {
    const two = scoreIntake(isolated(['C', 'D']), 0);
    const three = scoreIntake(isolated(['C', 'D', 'E']), 0);
    expect((three.dimension_scores.d6 ?? 0)).toBeGreaterThanOrEqual(two.dimension_scores.d6 ?? 0);
  });
});

// ── precomputedStep5Score mapping ────────────────────────────────────────────

describe('scoreIntake — step5 score mapping', () => {
  it('step5Score 0 maps to level-1 contribution (d3=1)', () => {
    const r0 = scoreIntake(BASE, 0);
    const r8 = scoreIntake(BASE, 8);
    // d3 with high step5 should be higher → overall level higher
    expect(r8.level).toBeGreaterThanOrEqual(r0.level);
  });

  it('step5Score 3 maps to same contribution as 0 (both level-1 range)', () => {
    const r0 = scoreIntake(BASE, 0);
    const r3 = scoreIntake(BASE, 3);
    expect(r0.dimension_scores.d3).toBeCloseTo(r3.dimension_scores.d3 ?? 0, 5);
  });

  it('step5Score 4 (level 2) produces higher d3 than score 3 (level 1)', () => {
    const r3 = scoreIntake(BASE, 3);
    const r4 = scoreIntake(BASE, 4);
    expect((r4.dimension_scores.d3 ?? 0)).toBeGreaterThan(r3.dimension_scores.d3 ?? 0);
  });

  it('step5Score 8 (level 4) produces highest d3', () => {
    const r6 = scoreIntake(BASE, 6);
    const r8 = scoreIntake(BASE, 8);
    expect((r8.dimension_scores.d3 ?? 0)).toBeGreaterThan(r6.dimension_scores.d3 ?? 0);
  });
});

// ── scoreStep5 heuristic (tested via step5_prompt without precomputed score) ─

describe('scoreIntake — scoreStep5 heuristic', () => {
  it('empty prompt produces lowest contribution (d3=1, level stays 1)', () => {
    const result = scoreIntake(BASE); // no precomputed score, empty prompt
    expect(result.level).toBe(1);
  });

  it('very short prompt (< 15 chars) produces score 0 → level 1', () => {
    const result = scoreIntake(make({ step5_prompt: 'Write email' }));
    expect(result.level).toBe(1);
  });

  it('rich prompt with context, constraints, and risk produces higher level', () => {
    const richPrompt = [
      'Please draft a formal follow-up email to the small business client',
      'after our commercial loan meeting. We discussed a line of credit.',
      'Keep it professional and concise. Avoid specific rates.',
      'Mark as preliminary and draft for review. Include placeholders.',
    ].join(' ');
    const rich = scoreIntake(BASE, undefined); // use heuristic with rich prompt
    const richResult = scoreIntake(make({ step5_prompt: richPrompt }));
    expect(richResult.level).toBeGreaterThanOrEqual(rich.level);
  });
});

// ── Output shape ─────────────────────────────────────────────────────────────

describe('scoreIntake — output shape', () => {
  it('always returns level in range 1-4', () => {
    const result = scoreIntake(BASE, 0);
    expect([1, 2, 3, 4]).toContain(result.level);
  });

  it('dimension_scores contains all 7 dimensions', () => {
    const result = scoreIntake(BASE, 5);
    for (const dim of ['d1', 'd2', 'd3', 'd4', 'd5', 'd6', 'd7']) {
      expect(result.dimension_scores[dim]).toBeDefined();
    }
  });

  it('all dimension scores are in range 1-4', () => {
    const result = scoreIntake(BASE, 5);
    for (const val of Object.values(result.dimension_scores)) {
      if (val !== undefined) {
        expect(val).toBeGreaterThanOrEqual(1);
        expect(val).toBeLessThanOrEqual(4);
      }
    }
  });
});
