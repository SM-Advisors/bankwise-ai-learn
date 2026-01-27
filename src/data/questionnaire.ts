import { LearningStyle } from '@/contexts/TrainingContext';

export interface QuestionOption {
  id: string;
  text: string;
  stylePoints: Partial<Record<LearningStyle, number>>;
}

export interface Question {
  id: string;
  text: string;
  options: QuestionOption[];
}

export const questions: Question[] = [
  {
    id: 'q1',
    text: 'When learning a new software tool, you prefer to:',
    options: [
      {
        id: 'q1a',
        text: 'Watch a video walkthrough with visual demonstrations',
        stylePoints: { visual: 3 },
      },
      {
        id: 'q1b',
        text: 'Follow a step-by-step written tutorial',
        stylePoints: { procedural: 3 },
      },
      {
        id: 'q1c',
        text: 'Understand the underlying concepts first, then explore',
        stylePoints: { conceptual: 3 },
      },
    ],
  },
  {
    id: 'q2',
    text: 'When explaining a complex financial process to a colleague, you typically:',
    options: [
      {
        id: 'q2a',
        text: 'Draw a diagram or flowchart',
        stylePoints: { visual: 3 },
      },
      {
        id: 'q2b',
        text: 'Walk them through each step in order',
        stylePoints: { procedural: 3 },
      },
      {
        id: 'q2c',
        text: 'Explain the rationale and principles behind it',
        stylePoints: { conceptual: 3 },
      },
    ],
  },
  {
    id: 'q3',
    text: 'When reviewing a new policy or procedure, you first look for:',
    options: [
      {
        id: 'q3a',
        text: 'Charts, tables, or visual summaries',
        stylePoints: { visual: 3 },
      },
      {
        id: 'q3b',
        text: 'Action items and numbered steps',
        stylePoints: { procedural: 3 },
      },
      {
        id: 'q3c',
        text: 'The purpose and strategic reasoning',
        stylePoints: { conceptual: 3 },
      },
    ],
  },
  {
    id: 'q4',
    text: 'You retain information best when it is presented as:',
    options: [
      {
        id: 'q4a',
        text: 'Infographics and visual frameworks',
        stylePoints: { visual: 3 },
      },
      {
        id: 'q4b',
        text: 'Checklists and process flows',
        stylePoints: { procedural: 3 },
      },
      {
        id: 'q4c',
        text: 'Case studies and strategic analysis',
        stylePoints: { conceptual: 3 },
      },
    ],
  },
  {
    id: 'q5',
    text: 'When solving a problem at work, your first instinct is to:',
    options: [
      {
        id: 'q5a',
        text: 'Map out the situation visually',
        stylePoints: { visual: 3 },
      },
      {
        id: 'q5b',
        text: 'Create a systematic action plan',
        stylePoints: { procedural: 3 },
      },
      {
        id: 'q5c',
        text: 'Analyze the root causes and implications',
        stylePoints: { conceptual: 3 },
      },
    ],
  },
  {
    id: 'q6',
    text: 'In meetings, you find yourself:',
    options: [
      {
        id: 'q6a',
        text: 'Drawing diagrams and sketches to illustrate points',
        stylePoints: { visual: 3 },
      },
      {
        id: 'q6b',
        text: 'Focusing on action items and next steps',
        stylePoints: { procedural: 3 },
      },
      {
        id: 'q6c',
        text: 'Discussing strategy and long-term implications',
        stylePoints: { conceptual: 3 },
      },
    ],
  },
  {
    id: 'q7',
    text: 'When training a new team member, you emphasize:',
    options: [
      {
        id: 'q7a',
        text: 'Visual aids and reference materials',
        stylePoints: { visual: 3 },
      },
      {
        id: 'q7b',
        text: 'Standard operating procedures and workflows',
        stylePoints: { procedural: 3 },
      },
      {
        id: 'q7c',
        text: 'The "why" behind each task and decision',
        stylePoints: { conceptual: 3 },
      },
    ],
  },
  {
    id: 'q8',
    text: 'Your ideal documentation format would include:',
    options: [
      {
        id: 'q8a',
        text: 'Plenty of charts, graphs, and visual breakdowns',
        stylePoints: { visual: 3 },
      },
      {
        id: 'q8b',
        text: 'Clear numbered steps with checkboxes',
        stylePoints: { procedural: 3 },
      },
      {
        id: 'q8c',
        text: 'Executive summaries with strategic context',
        stylePoints: { conceptual: 3 },
      },
    ],
  },
];