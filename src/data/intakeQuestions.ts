// ============================================================
// SMILE Intake Form — Complete Question Definitions
// Source: SMILE_Intake_Spec_v1 (SM Advisors, Feb 2026)
// ============================================================

import type { LearningStyleType } from '@/contexts/AuthContext';

// ── Role options (Q2) ─────────────────────────────────────────────────────
export type RoleKey =
  | 'front_line'
  | 'loan_officer'
  | 'compliance'
  | 'operations'
  | 'it'
  | 'executive'
  | 'finance'
  | 'hr'
  | 'other';

export interface RoleOption {
  key: RoleKey;
  label: string;
  lobSlug?: string; // best-fit department mapping for content personalization
}

export const ROLE_OPTIONS: RoleOption[] = [
  { key: 'front_line',   label: 'Front-line / Retail Banking',                    lobSlug: 'retail_banking' },
  { key: 'loan_officer', label: 'Loan Officer / Credit Analyst / Mortgage',        lobSlug: 'commercial_banking' },
  { key: 'compliance',   label: 'Compliance / BSA / Risk',                         lobSlug: 'compliance_and_bsa' },
  { key: 'operations',   label: 'Operations / Back Office',                        lobSlug: 'deposit_operations' },
  { key: 'it',           label: 'IT / Technology',                                 lobSlug: 'information_technology' },
  { key: 'executive',    label: 'Executive / C-Suite / Senior Leadership',          lobSlug: 'executive_leadership' },
  { key: 'finance',      label: 'Finance / Accounting / Internal Audit',            lobSlug: 'accounting_finance' },
  { key: 'hr',           label: 'Human Resources / Training',                      lobSlug: 'human_resources_training' },
  { key: 'other',        label: 'Other' },
];

// ── Answer option type (shared) ───────────────────────────────────────────
export interface AnswerOption {
  key: string;
  label: string;
  // Dimension scores (D1–D7, scale 1–4)
  d1?: number; d2?: number; d3?: number; d4?: number;
  d5?: number; d6?: number; d7?: number;
  // Flags
  triggerSafeUse?: boolean;
  triggerIntegrity?: boolean;
  flagGap?: boolean;
}

// ── Step 2: Behavioral Anchors ────────────────────────────────────────────

export const Q3_OPTIONS: AnswerOption[] = [
  { key: 'A', label: 'Never used AI at work',                                    d1: 1,   d5: 1 },
  { key: 'B', label: 'Tried it once or twice',                                  d1: 2,   d5: 1.5 },
  { key: 'C', label: 'Use it for specific tasks occasionally',                  d1: 2.5, d5: 2 },
  { key: 'D', label: 'Use it regularly as part of my workflow',                  d1: 3,   d5: 3 },
  { key: 'E', label: 'Deeply embedded — I also help colleagues adopt it',        d1: 4,   d5: 4 },
];

export const Q4_OPTIONS: AnswerOption[] = [
  { key: 'A', label: 'I haven\'t tried it yet',                                              d7: 1 },
  { key: 'B', label: 'I tried it but wasn\'t sure what to do with the output',              d3: 1.5, d7: 2 },
  { key: 'C', label: 'It was useful but the output needed refinement',                      d3: 2.5, d7: 3 },
  { key: 'D', label: 'I got useful output and double-checked it before using it',           d3: 3,   d4: 3 },
  { key: 'E', label: 'I got great output and shared it with my team or used it directly',  d3: 4,   d5: 4, d7: 4 },
];

export const Q5_OPTIONS: AnswerOption[] = [
  { key: 'A', label: 'A short question, like a Google search',                               d3: 1 },
  { key: 'B', label: 'A specific request, but no real system to it',                         d3: 2 },
  { key: 'C', label: 'I include context and think about who the output is for',              d3: 3 },
  { key: 'D', label: 'I set role, context, constraints, and format — then refine from there', d3: 3.5 },
  { key: 'E', label: 'I have templates or frameworks I share with others',                   d3: 4, d5: 4 },
];

export const Q6_OPTIONS: AnswerOption[] = [
  { key: 'A', label: 'Yes — I\'ve read it and understand what\'s allowed',                  d2: 3 },
  { key: 'B', label: 'Yes, but I haven\'t read it in detail',                              d2: 2 },
  { key: 'C', label: 'I think something exists but I\'m not certain',                      d2: 1.5 },
  { key: 'D', label: 'I don\'t think we have one',                                         d2: 1.5 },
  { key: 'E', label: 'I was involved in creating or reviewing it',                          d2: 4, d6: 4 },
];

// ── Step 3: Safe Use & Governance ─────────────────────────────────────────

export const Q7_OPTIONS: AnswerOption[] = [
  { key: 'A', label: 'Use it — my colleague already reviewed it',                                   d4: 1,   d2: 1 },
  { key: 'B', label: 'Skim it quickly and proceed',                                                  d4: 2 },
  { key: 'C', label: 'Review key figures against the actual source documents',                       d4: 3,   d2: 3 },
  { key: 'D', label: 'Use it as a starting point, then verify anything affecting a key decision',    d4: 3.5, d2: 3.5 },
  { key: 'E', label: 'Check policy before using AI-generated content in important decisions',        d2: 4,   d4: 4, d6: 3 },
];

export const Q8_OPTIONS: AnswerOption[] = [
  { key: 'A', label: 'Paste everything in — the context helps the AI',              d2: 1, triggerSafeUse: true },
  { key: 'B', label: 'Check with IT before proceeding',                              d2: 2 },
  { key: 'C', label: 'Remove personally identifiable data and describe the pattern instead', d2: 3.5 },
  { key: 'D', label: 'Check the acceptable use policy before doing anything',         d2: 4, d6: 3 },
];

export const Q9_OPTIONS: AnswerOption[] = [
  { key: 'A', label: 'The operations team',                        d6: 2 },
  { key: 'B', label: 'IT / InfoSec',                              d6: 2 },
  { key: 'C', label: 'Compliance / Risk',                         d6: 3 },
  { key: 'D', label: 'Legal and Vendor Management',               d6: 3 },
  { key: 'E', label: 'Executive leadership and Board',             d6: 4 },
  { key: 'F', label: 'The vendor\'s team',                        d6: 1, flagGap: true },
];

// ── Step 4: Situational Judgment (SJT) ───────────────────────────────────

export interface SJTScenario {
  id: string;
  scenario: string;
  options: (AnswerOption & { strength: 'strong' | 'moderate' | 'weak' })[];
}

export const SJT_SCENARIOS: SJTScenario[] = [
  {
    id: 'sjt1',
    scenario: 'Your AI tool drafts a follow-up email to a client after a meeting. It looks polished, but includes a specific figure that hasn\'t been finalized yet. The client is waiting. What do you do?',
    options: [
      { key: 'A', label: 'Send it — the figure is probably right and we need to move fast',                  strength: 'weak',     d4: 1,   d2: 1 },
      { key: 'B', label: 'Remove the figure, send the rest',                                                  strength: 'moderate', d4: 2.5 },
      { key: 'C', label: 'Correct the section yourself and do a full review before sending',                 strength: 'strong',   d4: 3.5 },
      { key: 'D', label: 'Discard it and write the email yourself',                                          strength: 'moderate', d4: 3,   d7: 2 },
      { key: 'E', label: 'Check compliance guidance before using AI for customer-facing communications',     strength: 'strong',   d2: 4,   d4: 4 },
    ],
  },
  {
    id: 'sjt2',
    scenario: 'A colleague suggests copying a client\'s confidential data into ChatGPT to help summarize their case history for a meeting. What do you do?',
    options: [
      { key: 'A', label: 'Try it — sounds like a great time-saver',                                          strength: 'weak',     d2: 1,   d6: 1, triggerSafeUse: true },
      { key: 'B', label: 'Interested but check with IT first',                                               strength: 'moderate', d2: 2 },
      { key: 'C', label: 'Flag concerns about confidential data in an external tool — check with compliance',strength: 'strong',   d2: 3.5, d6: 3, d7: 3 },
      { key: 'D', label: 'Decline and flag it as a potential compliance violation',                          strength: 'strong',   d2: 4,   d6: 4, d7: 4 },
      { key: 'E', label: 'Stay out of it — seems too risky',                                                 strength: 'weak',     d6: 1.5 },
    ],
  },
  {
    id: 'sjt3',
    scenario: 'Your compliance lead shares an AI-generated summary of new regulatory guidance. She says "AI did the heavy lifting — looks comprehensive." A colleague asks you to forward it to the team.',
    options: [
      { key: 'A', label: 'Forward it — the compliance lead reviewed it',                                      strength: 'moderate', d4: 2 },
      { key: 'B', label: 'Read the original regulatory guidance before forwarding anything',                   strength: 'strong',   d4: 3.5 },
      { key: 'C', label: 'Share it with a clear note that it\'s AI-generated and urge verification',         strength: 'strong',   d4: 3,   d2: 3 },
      { key: 'D', label: 'Have compliance confirm the key action items first',                                strength: 'strong',   d4: 3,   d6: 3 },
    ],
  },
  {
    id: 'sjt4',
    scenario: 'Your CEO needs an "AI readiness brief" for a board presentation by end of day. Your organization doesn\'t have a formal AI inventory yet. What do you do?',
    options: [
      { key: 'A', label: 'Use AI to generate an authoritative-sounding brief quickly',                       strength: 'weak',     d4: 1,   d6: 1 },
      { key: 'B', label: 'Draft it yourself to avoid the irony of using AI',                                 strength: 'moderate', d7: 2 },
      { key: 'C', label: 'Draft what you know + flag that content is limited without a formal AI inventory', strength: 'strong',   d6: 3.5, d4: 3, d7: 3 },
      { key: 'D', label: 'Recommend a quick AI inventory before presenting anything to the board',           strength: 'strong',   d6: 4,   d7: 4 },
      { key: 'E', label: 'Use AI to generate a polished brief and present it as authoritative',              strength: 'weak',     d4: 1,   d6: 1, triggerIntegrity: true },
    ],
  },
  {
    id: 'sjt5',
    scenario: 'A vendor demos an AI-powered recommendation tool. The results look impressive. Your business line wants to move fast. IT hasn\'t reviewed it yet.',
    options: [
      { key: 'A', label: 'Encourage moving forward — the results speak for themselves',                       strength: 'weak',     d6: 1,   d2: 1 },
      { key: 'B', label: 'Ask IT to do a quick review but otherwise support the fast timeline',              strength: 'moderate', d6: 2 },
      { key: 'C', label: 'Require IT + compliance + vendor management review before any deployment',         strength: 'strong',   d6: 3,   d2: 3 },
      { key: 'D', label: 'Full due diligence: data sharing, model decisions, data retention, model risk',   strength: 'strong',   d6: 4,   d4: 4 },
      { key: 'E', label: 'Run a limited pilot using synthetic or anonymized data first',                     strength: 'strong',   d6: 3.5, d2: 3.5 },
    ],
  },
];

// ── Step 6: Orientation & Motivation ─────────────────────────────────────

export const Q10_OPTIONS: (AnswerOption & { orientation: string })[] = [
  { key: 'A', label: 'Excited — I\'m ready to go',                                 d7: 3.5, orientation: 'excited' },
  { key: 'B', label: 'Curious but cautious',                                       d7: 2.5, orientation: 'curious' },
  { key: 'C', label: 'Anxious — I\'m not sure I\'m a tech person',                 d7: 1.5, orientation: 'anxious' },
  { key: 'D', label: 'Skeptical — I need to see the value first',                  d7: 1.5, orientation: 'skeptical' },
  { key: 'E', label: 'Neutral — here to learn what I need to know',                d7: 2,   orientation: 'neutral' },
];

export const Q11_OPTIONS: (AnswerOption & { motivation: string; advocateFlag?: boolean })[] = [
  { key: 'A', label: 'Practical skills I can use this week',                       motivation: 'practical' },
  { key: 'B', label: 'Understanding what AI can and can\'t do',                    motivation: 'critical' },
  { key: 'C', label: 'Confidence to talk about AI with my team or leadership',     motivation: 'communication' },
  { key: 'D', label: 'Understanding the compliance and risk picture',              motivation: 'compliance' },
  { key: 'E', label: 'Helping others in my organization adopt AI responsibly',     motivation: 'champion', advocateFlag: true },
  { key: 'F', label: 'Getting ahead of regulators and examiners',                  motivation: 'governance' },
];

export const Q12_OPTIONS: (AnswerOption & { learningStyle: LearningStyleType })[] = [
  { key: 'A', label: 'Jump in and figure it out as I go',                          learningStyle: 'hands-on' },
  { key: 'B', label: 'Get a clear explanation first, then practice',               learningStyle: 'explanation-based' },
  { key: 'C', label: 'See good examples first, then try myself',                   learningStyle: 'example-based' },
  { key: 'D', label: 'Read or watch content first, then reflect and discuss',      learningStyle: 'explanation-based' },
];

// ── Placement level labels (internal — never shown during intake) ─────────
export const PLACEMENT_LABELS: Record<number, string> = {
  1: 'Observer',
  2: 'Learner',
  3: 'Practitioner',
  4: 'Champion',
};
