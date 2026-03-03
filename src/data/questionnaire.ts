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

// Based on AI Training Interaction Preference Intake document
// Learning styles: example-based, explanation-based, hands-on, logic-based
export const questions: Question[] = [
  {
    id: 'q1',
    text: 'When learning a new AI workflow, what helps you most at the start?',
    options: [
      {
        id: 'q1a',
        text: 'Seeing a concrete example or annotated output',
        stylePoints: { 'example-based': 3 },
      },
      {
        id: 'q1b',
        text: 'Reading or hearing a clear explanation of the steps',
        stylePoints: { 'explanation-based': 3 },
      },
      {
        id: 'q1c',
        text: 'Trying it myself and adjusting as I go',
        stylePoints: { 'hands-on': 3 },
      },
      {
        id: 'q1d',
        text: 'Understanding the logic or rules behind it first',
        stylePoints: { 'logic-based': 3 },
      },
    ],
  },
  {
    id: 'q2',
    text: "When you get an AI output you don't trust, what do you do first?",
    options: [
      {
        id: 'q2a',
        text: 'Compare it visually to a good vs. bad example',
        stylePoints: { 'example-based': 3 },
      },
      {
        id: 'q2b',
        text: 'Re-read the instructions or prompt explanation',
        stylePoints: { 'explanation-based': 3 },
      },
      {
        id: 'q2c',
        text: 'Re-run it with changes to see what improves',
        stylePoints: { 'hands-on': 3 },
      },
      {
        id: 'q2d',
        text: 'Analyze why the model may have produced that result',
        stylePoints: { 'logic-based': 3 },
      },
    ],
  },
  {
    id: 'q3',
    text: 'Which practice format feels most useful (not most comfortable)?',
    options: [
      {
        id: 'q3a',
        text: 'Walkthrough with screenshots or highlighted examples',
        stylePoints: { 'example-based': 3 },
      },
      {
        id: 'q3b',
        text: 'Step-by-step written or narrated guidance',
        stylePoints: { 'explanation-based': 3 },
      },
      {
        id: 'q3c',
        text: 'A task where I must produce something and get feedback',
        stylePoints: { 'hands-on': 3 },
      },
      {
        id: 'q3d',
        text: 'A breakdown of decision logic, constraints, or rules',
        stylePoints: { 'logic-based': 3 },
      },
    ],
  },
  {
    id: 'q4',
    text: 'When time is limited, how do you prefer to learn?',
    options: [
      {
        id: 'q4a',
        text: 'Skim a visual example and reuse it',
        stylePoints: { 'example-based': 3 },
      },
      {
        id: 'q4b',
        text: 'Read a concise explanation or checklist',
        stylePoints: { 'explanation-based': 3 },
      },
      {
        id: 'q4c',
        text: 'Jump straight into doing the task',
        stylePoints: { 'hands-on': 3 },
      },
      {
        id: 'q4d',
        text: "Review key principles so I don't make mistakes",
        stylePoints: { 'logic-based': 3 },
      },
    ],
  },
  {
    id: 'q5',
    text: 'What helps you feel confident using AI in a regulated environment?',
    options: [
      {
        id: 'q5a',
        text: 'Seeing compliant examples of finished work',
        stylePoints: { 'example-based': 3 },
      },
      {
        id: 'q5b',
        text: "Knowing exactly what's allowed and why",
        stylePoints: { 'explanation-based': 3 },
      },
      {
        id: 'q5c',
        text: 'Practicing safely and seeing consequences of choices',
        stylePoints: { 'hands-on': 3 },
      },
      {
        id: 'q5d',
        text: 'Understanding the guardrails and failure modes',
        stylePoints: { 'logic-based': 3 },
      },
    ],
  },
];