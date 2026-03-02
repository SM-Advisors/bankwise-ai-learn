// ============================================================
// SMILE Intake Placement Scoring
// Source: SMILE_Intake_Spec_v1 (SM Advisors, Feb 2026)
//
// Placement levels (never shown during intake):
//   1 = Observer  2 = Learner  3 = Practitioner  4 = Champion
//
// Dimensions D1–D7 are scored from question responses.
// Final placement = weighted average of all dimension scores.
// Override flags may adjust placement or trigger module locks.
// ============================================================

export interface IntakeAnswers {
  q2_role: string;
  q3: string;
  q4: string;
  q5: string;
  q6: string;
  q7: string;
  q8: string;
  q9: string[];      // multi-select
  sjt1: string;
  sjt2: string;
  sjt3: string;
  sjt4: string;
  sjt5: string;
  step5_prompt: string;
  q10: string;
  q11: string[];     // multi-select, top 2
  q12: string;
}

export interface IntakePlacement {
  level: 1 | 2 | 3 | 4;
  safe_use_flag: boolean;
  consistency_flag: boolean;
  governance_flag: boolean;
  integrity_flag: boolean;
  dimension_scores: Partial<Record<string, number>>;
}

// ── Main scoring function ────────────────────────────────────────────────

export function scoreIntake(answers: IntakeAnswers, precomputedStep5Score?: number): IntakePlacement {
  const d: Record<string, number[]> = {
    d1: [], d2: [], d3: [], d4: [], d5: [], d6: [], d7: [],
  };

  // ── Step 2: Behavioral Anchors ──

  // Q3: AI usage frequency
  const q3Map: Record<string, Partial<typeof d[string] extends number[] ? {d1:number,d5:number} : never>> = {};
  const Q3_SCORES: Record<string, { d1: number; d5: number }> = {
    A: { d1: 1,   d5: 1 },
    B: { d1: 2,   d5: 1.5 },
    C: { d1: 2.5, d5: 2 },
    D: { d1: 3,   d5: 3 },
    E: { d1: 4,   d5: 4 },
  };
  void q3Map; // unused, kept for documentation
  const q3s = Q3_SCORES[answers.q3];
  if (q3s) { d.d1.push(q3s.d1); d.d5.push(q3s.d5); }

  // Q4: Last AI experience
  const Q4_SCORES: Record<string, Partial<{d3:number,d4:number,d5:number,d7:number}>> = {
    A: { d7: 1 },
    B: { d3: 1.5, d7: 2 },
    C: { d3: 2.5, d7: 3 },
    D: { d3: 3,   d4: 3 },
    E: { d3: 4,   d5: 4, d7: 4 },
  };
  const q4s = Q4_SCORES[answers.q4];
  if (q4s) {
    if (q4s.d3 !== undefined) d.d3.push(q4s.d3);
    if (q4s.d4 !== undefined) d.d4.push(q4s.d4);
    if (q4s.d5 !== undefined) d.d5.push(q4s.d5);
    if (q4s.d7 !== undefined) d.d7.push(q4s.d7);
  }

  // Q5: Prompt approach
  const Q5_SCORES: Record<string, Partial<{d3:number,d5:number}>> = {
    A: { d3: 1 },
    B: { d3: 2 },
    C: { d3: 3 },
    D: { d3: 3.5 },
    E: { d3: 4, d5: 4 },
  };
  const q5s = Q5_SCORES[answers.q5];
  if (q5s) {
    if (q5s.d3 !== undefined) d.d3.push(q5s.d3);
    if (q5s.d5 !== undefined) d.d5.push(q5s.d5);
  }

  // Q6: Policy awareness
  const Q6_SCORES: Record<string, Partial<{d2:number,d6:number}>> = {
    A: { d2: 3 },
    B: { d2: 2 },
    C: { d2: 1.5 },
    D: { d2: 1.5 },
    E: { d2: 4, d6: 4 },
  };
  const q6s = Q6_SCORES[answers.q6];
  if (q6s) {
    if (q6s.d2 !== undefined) d.d2.push(q6s.d2);
    if (q6s.d6 !== undefined) d.d6.push(q6s.d6);
  }

  // ── Step 3: Safe Use & Governance ──

  // Q7: AI-generated loan summary
  const Q7_SCORES: Record<string, Partial<{d2:number,d4:number,d6:number}>> = {
    A: { d4: 1,   d2: 1 },
    B: { d4: 2 },
    C: { d4: 3,   d2: 3 },
    D: { d4: 3.5, d2: 3.5 },
    E: { d2: 4,   d4: 4, d6: 3 },
  };
  const q7s = Q7_SCORES[answers.q7];
  if (q7s) {
    if (q7s.d4 !== undefined) d.d4.push(q7s.d4);
    if (q7s.d2 !== undefined) d.d2.push(q7s.d2);
    if (q7s.d6 !== undefined) d.d6.push(q7s.d6);
  }

  // Q8: PII in draft
  const Q8_SCORES: Record<string, Partial<{d2:number,d6:number}>> = {
    A: { d2: 1 },
    B: { d2: 2 },
    C: { d2: 3.5 },
    D: { d2: 4, d6: 3 },
  };
  const q8s = Q8_SCORES[answers.q8];
  if (q8s) {
    if (q8s.d2 !== undefined) d.d2.push(q8s.d2);
    if (q8s.d6 !== undefined) d.d6.push(q8s.d6);
  }

  // Q9: Governance stakeholders (multi-select)
  d.d6.push(scoreQ9(answers.q9));

  // ── Step 4: SJT Scenarios ──

  const SJT_SCORES: Record<string, Record<string, Partial<{d2:number,d4:number,d6:number,d7:number}>>> = {
    sjt1: {
      A: { d4: 1,   d2: 1 },
      B: { d4: 2.5 },
      C: { d4: 3.5 },
      D: { d4: 3,   d7: 2 },
      E: { d2: 4,   d4: 4 },
    },
    sjt2: {
      A: { d2: 1,   d6: 1 },
      B: { d2: 2 },
      C: { d2: 3.5, d6: 3, d7: 3 },
      D: { d2: 4,   d6: 4, d7: 4 },
      E: { d6: 1.5 },
    },
    sjt3: {
      A: { d4: 2 },
      B: { d4: 3.5 },
      C: { d4: 3,   d2: 3 },
      D: { d4: 3,   d6: 3 },
      E: { d4: 1 },
    },
    sjt4: {
      A: { d4: 1,   d6: 1 },
      B: { d7: 2 },
      C: { d6: 3.5, d4: 3, d7: 3 },
      D: { d6: 4,   d7: 4 },
      E: { d4: 1,   d6: 1 },
    },
    sjt5: {
      A: { d6: 1,   d2: 1 },
      B: { d6: 2 },
      C: { d6: 3,   d2: 3 },
      D: { d6: 4,   d4: 4 },
      E: { d6: 3.5, d2: 3.5 },
    },
  };

  for (const [sjtId, answer] of Object.entries({
    sjt1: answers.sjt1,
    sjt2: answers.sjt2,
    sjt3: answers.sjt3,
    sjt4: answers.sjt4,
    sjt5: answers.sjt5,
  })) {
    const s = SJT_SCORES[sjtId]?.[answer];
    if (s) {
      if (s.d2 !== undefined) d.d2.push(s.d2);
      if (s.d4 !== undefined) d.d4.push(s.d4);
      if (s.d6 !== undefined) d.d6.push(s.d6);
      if (s.d7 !== undefined) d.d7.push(s.d7);
    }
  }

  // ── Step 5: Micro-Demonstration Task ──
  // Uses LLM score from intake-prompt-score edge function when available;
  // falls back to heuristic if the edge function call failed or was skipped.
  const step5Score = precomputedStep5Score ?? scoreStep5(answers.step5_prompt);
  const step5Level = step5Score <= 3 ? 1 : step5Score <= 5 ? 2 : step5Score <= 7 ? 3 : 4;
  d.d3.push(step5Level);
  d.d4.push(Math.max(1, step5Level - 0.5));

  // ── Step 6: Orientation ──

  const Q10_D7: Record<string, number> = {
    A: 3.5, B: 2.5, C: 1.5, D: 1.5, E: 2,
  };
  const q10d7 = Q10_D7[answers.q10];
  if (q10d7 !== undefined) d.d7.push(q10d7);

  // ── Compute dimension averages ──

  const dimAvg: Record<string, number> = {};
  for (const [dim, scores] of Object.entries(d)) {
    if (scores.length > 0) {
      dimAvg[dim] = scores.reduce((a, b) => a + b, 0) / scores.length;
    }
  }

  const allDimValues = Object.values(dimAvg);
  const rawAvg = allDimValues.length > 0
    ? allDimValues.reduce((a, b) => a + b, 0) / allDimValues.length
    : 2;

  // ── Override flags ──

  const safe_use_flag = answers.q8 === 'A' || answers.sjt2 === 'A';
  const consistency_flag = (answers.q5 === 'D' || answers.q5 === 'E') && step5Score <= 3;
  const governance_flag =
    (dimAvg.d6 !== undefined && dimAvg.d6 <= 1.5) &&
    (answers.q2_role === 'compliance' || answers.q2_role === 'executive');
  const integrity_flag = answers.sjt4 === 'E';

  // Consistency flag: drop D3 by 1 level and recompute
  let finalAvg = rawAvg;
  if (consistency_flag && dimAvg.d3 !== undefined) {
    dimAvg.d3 = Math.max(1, dimAvg.d3 - 1);
    const vals = Object.values(dimAvg);
    finalAvg = vals.reduce((a, b) => a + b, 0) / vals.length;
  }

  const level = clampLevel(Math.round(finalAvg));

  return { level, safe_use_flag, consistency_flag, governance_flag, integrity_flag, dimension_scores: dimAvg };
}

// ── Helpers ────────────────────────────────────────────────────────────────

function clampLevel(val: number): 1 | 2 | 3 | 4 {
  return Math.max(1, Math.min(4, val)) as 1 | 2 | 3 | 4;
}

/** Score Q9 multi-select governance stakeholders (returns D6 value 1–4) */
function scoreQ9(selected: string[]): number {
  if (!selected.length) return 1;
  // F-only selection = significant gap
  if (selected.includes('F') && selected.length === 1) return 1;
  // Count high-value stakeholders: C, D, E
  const highValue = selected.filter(k => ['C', 'D', 'E'].includes(k)).length;
  const basic = selected.filter(k => ['A', 'B'].includes(k)).length;
  if (highValue >= 3) return 4;
  if (highValue === 2) return 3;
  if (highValue === 1 && basic >= 1) return 2.5;
  if (basic >= 2) return 2;
  return 1.5;
}

/**
 * Heuristic scorer for the Step 5 micro-demonstration prompt.
 * Rubric: Task Clarity (1), Context Provision (2), Audience Awareness (1),
 *         Constraint Setting (2), Risk Awareness (2), Iteration Readiness (1),
 *         Professionalism Signals (1) — max 10 points.
 */
function scoreStep5(prompt: string): number {
  if (!prompt || prompt.trim().length < 15) return 0;
  const p = prompt.toLowerCase();
  let score = 0;

  // Task Clarity (0–1): meaningful description provided
  if (prompt.trim().length > 40) score += 1;

  // Context Provision (0–2): mentions the scenario elements
  const contextKw = ['small business', 'commercial', 'loan', 'credit', 'line of credit', 'meeting', 'discussed', 'customer', 'client', 'follow-up', 'follow up'];
  const ctxHits = contextKw.filter(k => p.includes(k)).length;
  if (ctxHits >= 3) score += 2;
  else if (ctxHits >= 1) score += 1;

  // Audience Awareness (0–1): addresses who the output is for
  if (p.includes('customer') || p.includes('client') || p.includes('professional') || p.includes('formal') || p.includes('recipient')) score += 1;

  // Constraint Setting (0–2): sets boundaries on the output
  const constraintKw = ['concise', 'formal', 'brief', 'include', 'avoid', 'paragraph', 'tone', 'length', 'short', 'professional', 'do not', "don't"];
  const conHits = constraintKw.filter(k => p.includes(k)).length;
  if (conHits >= 3) score += 2;
  else if (conHits >= 1) score += 1;

  // Risk Awareness (0–2): flags for review, avoids specific claims
  const riskKw = ['review', 'compliance', 'verify', 'accurate', 'avoid specific', 'preliminary', 'draft for review', 'subject to', 'do not include rate', 'pending'];
  const riskHits = riskKw.filter(k => p.includes(k)).length;
  if (riskHits >= 2) score += 2;
  else if (riskHits >= 1) score += 1;

  // Iteration Readiness (0–1): invites refinement or structured for editing
  if (p.includes('draft') || p.includes('revise') || p.includes('placeholder') || p.includes('adjust') || p.includes('[')) score += 1;

  // Professionalism Signals (0–1): length and structure suggest effort
  if (prompt.trim().length > 120) score += 1;

  return Math.min(score, 10);
}
