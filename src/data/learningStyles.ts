export interface LearningStyleInfo {
  id: string;
  name: string;
  shortDescription: string;
  fullDescription: string;
  characteristics: string[];
  lessonApproach: string;
}

export const learningStyles: LearningStyleInfo[] = [
  {
    id: 'example-based',
    name: 'Example-Based',
    shortDescription: 'Learn by seeing annotated outputs and real-world examples first.',
    fullDescription: 'Example-based learners grasp concepts most effectively when shown concrete, annotated outputs before diving into theory. They prefer to see what "good" looks like upfront, then work backward to understand how it was created.',
    characteristics: [
      'Prefers seeing completed work samples first',
      'Learns by reverse-engineering examples',
      'Benefits from annotated outputs with explanations',
      'Likes to compare before/after scenarios',
    ],
    lessonApproach: 'Lessons start with a polished example output, then deconstruct it step-by-step showing how AI was used to create each element.',
  },
  {
    id: 'explanation-based',
    name: 'Explanation-Based',
    shortDescription: 'Prefer detailed explanations and conceptual understanding before action.',
    fullDescription: 'Explanation-based learners need thorough conceptual grounding before attempting tasks. They want to understand the "why" behind each step and appreciate detailed walkthroughs of processes and reasoning.',
    characteristics: [
      'Needs to understand context and rationale first',
      'Appreciates detailed step-by-step explanations',
      'Values understanding the "why" behind actions',
      'Prefers comprehensive documentation',
    ],
    lessonApproach: 'Lessons provide rich context, explain the reasoning behind each technique, and walk through processes with detailed justifications before practice.',
  },
  {
    id: 'hands-on',
    name: 'Hands-On',
    shortDescription: 'Learn best by doing—immediate practice with guided feedback.',
    fullDescription: 'Hands-on learners absorb information most effectively through direct experience. They prefer to jump into tasks quickly with just enough context, learning through trial and guided correction.',
    characteristics: [
      'Learns by doing, not just reading',
      'Prefers minimal upfront theory',
      'Thrives with immediate practice opportunities',
      'Values real-time feedback and iteration',
    ],
    lessonApproach: 'Lessons quickly set context, then move directly into guided exercises where learners practice with AI tools and receive immediate feedback.',
  },
  {
    id: 'logic-based',
    name: 'Logic-Based',
    shortDescription: 'Focus on decision frameworks, failure modes, and systematic reasoning.',
    fullDescription: 'Logic-based learners think in frameworks and systems. They want to understand decision trees, potential failure modes, and the logical structure underlying tasks before execution.',
    characteristics: [
      'Thinks in decision frameworks and flowcharts',
      'Wants to know what can go wrong upfront',
      'Values systematic, structured approaches',
      'Appreciates conditional logic (if X, then Y)',
    ],
    lessonApproach: 'Lessons present decision frameworks first, outline potential pitfalls and edge cases, then systematically work through the logical flow of using AI for the task.',
  },
];
