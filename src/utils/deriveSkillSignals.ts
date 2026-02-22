import type { SkillSignal } from '@/types/progress';

// Banking AI skill categories mapped to keywords found in Andrea's structured feedback
const SKILL_KEYWORDS: Record<string, string[]> = {
  context_setting: ['context', 'role', 'background', 'scenario', 'persona'],
  specificity: ['specific', 'detail', 'precise', 'clarity', 'clear', 'concise', 'focused'],
  data_security: ['pii', 'sensitive', 'anonymize', 'placeholder', 'security', 'confidential', 'redact'],
  formatting: ['format', 'structure', 'output', 'template', 'layout', 'organized'],
  compliance: ['compliance', 'regulatory', 'disclaimer', 'disclosure', 'policy', 'regulation'],
  clear_framework: ['framework', 'objective', 'constraint', 'requirement', 'boundary', 'guardrail'],
  iteration: ['refine', 'iterate', 'improve', 'revision', 'feedback loop', 'follow-up'],
  audience_awareness: ['audience', 'reader', 'committee', 'executive', 'customer-facing', 'stakeholder'],
};

// Human-readable skill names for display
export const SKILL_DISPLAY_NAMES: Record<string, string> = {
  context_setting: 'Context Setting',
  specificity: 'Specificity',
  data_security: 'Data Security',
  formatting: 'Formatting',
  compliance: 'Compliance',
  clear_framework: 'Clear Framework',
  iteration: 'Iteration',
  audience_awareness: 'Audience Awareness',
};

// Derive skill signals from Andrea's structured feedback
export function deriveSkillSignals(
  feedback: { strengths: string[]; issues: string[] },
  moduleId: string
): SkillSignal[] {
  const signals: SkillSignal[] = [];
  const timestamp = new Date().toISOString();
  const seen = new Set<string>();

  // Strengths -> proficient
  for (const strength of feedback.strengths) {
    const lower = strength.toLowerCase();
    for (const [skill, keywords] of Object.entries(SKILL_KEYWORDS)) {
      if (!seen.has(skill) && keywords.some((kw) => lower.includes(kw))) {
        signals.push({ skill, level: 'proficient', source: moduleId, timestamp });
        seen.add(skill);
      }
    }
  }

  // Issues -> emerging (only if not already proficient from strengths)
  for (const issue of feedback.issues) {
    const lower = issue.toLowerCase();
    for (const [skill, keywords] of Object.entries(SKILL_KEYWORDS)) {
      if (!seen.has(skill) && keywords.some((kw) => lower.includes(kw))) {
        signals.push({ skill, level: 'emerging', source: moduleId, timestamp });
        seen.add(skill);
      }
    }
  }

  return signals;
}

// Aggregate skill signals across sessions, keeping the highest level per skill
export function aggregateSkillSignals(
  allSignals: SkillSignal[]
): { skill: string; level: SkillSignal['level']; displayName: string }[] {
  const levelPriority: Record<string, number> = {
    proficient: 3,
    developing: 2,
    emerging: 1,
  };

  const best = new Map<string, SkillSignal['level']>();

  for (const signal of allSignals) {
    const current = best.get(signal.skill);
    if (!current || levelPriority[signal.level] > levelPriority[current]) {
      best.set(signal.skill, signal.level);
    }
  }

  return Array.from(best.entries())
    .map(([skill, level]) => ({
      skill,
      level,
      displayName: SKILL_DISPLAY_NAMES[skill] || skill,
    }))
    .sort((a, b) => levelPriority[b.level] - levelPriority[a.level]);
}
