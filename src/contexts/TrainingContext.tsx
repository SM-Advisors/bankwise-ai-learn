import React, { createContext, useContext, useState, ReactNode } from 'react';

export type LearningStyle = 'visual' | 'procedural' | 'conceptual';

export type Department = 'accounting' | 'credit' | 'executive';

export interface QuestionnaireAnswer {
  questionId: string;
  answerId: string;
  stylePoints: Partial<Record<LearningStyle, number>>;
}

export interface TrainingState {
  // Questionnaire state
  answers: QuestionnaireAnswer[];
  learningStyle: LearningStyle | null;
  questionnaireCompleted: boolean;
  
  // Selection state
  selectedDepartment: Department | null;
  selectedTopic: string | null;
  
  // Lesson state
  currentLesson: LessonPlan | null;
  isGeneratingLesson: boolean;
}

export interface LessonPlan {
  title: string;
  objective: string;
  estimatedTime: string;
  sections: LessonSection[];
  artifact: {
    title: string;
    description: string;
  };
}

export interface LessonSection {
  title: string;
  content: string;
}

interface TrainingContextType {
  state: TrainingState;
  submitAnswer: (answer: QuestionnaireAnswer) => void;
  completeQuestionnaire: () => void;
  setDepartment: (dept: Department) => void;
  setTopic: (topic: string) => void;
  setLesson: (lesson: LessonPlan | null) => void;
  setIsGeneratingLesson: (isGenerating: boolean) => void;
  resetSelections: () => void;
  resetAll: () => void;
}

const initialState: TrainingState = {
  answers: [],
  learningStyle: null,
  questionnaireCompleted: false,
  selectedDepartment: null,
  selectedTopic: null,
  currentLesson: null,
  isGeneratingLesson: false,
};

const TrainingContext = createContext<TrainingContextType | undefined>(undefined);

function calculateLearningStyle(answers: QuestionnaireAnswer[]): LearningStyle {
  const scores: Record<LearningStyle, number> = {
    visual: 0,
    procedural: 0,
    conceptual: 0,
  };

  answers.forEach((answer) => {
    Object.entries(answer.stylePoints).forEach(([style, points]) => {
      scores[style as LearningStyle] += points || 0;
    });
  });

  // Deterministic: return the style with highest score
  // In case of tie, priority: conceptual > procedural > visual
  const maxScore = Math.max(...Object.values(scores));
  
  if (scores.conceptual === maxScore) return 'conceptual';
  if (scores.procedural === maxScore) return 'procedural';
  return 'visual';
}

export function TrainingProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<TrainingState>(initialState);

  const submitAnswer = (answer: QuestionnaireAnswer) => {
    setState((prev) => ({
      ...prev,
      answers: [...prev.answers.filter((a) => a.questionId !== answer.questionId), answer],
    }));
  };

  const completeQuestionnaire = () => {
    const learningStyle = calculateLearningStyle(state.answers);
    setState((prev) => ({
      ...prev,
      learningStyle,
      questionnaireCompleted: true,
    }));
  };

  const setDepartment = (dept: Department) => {
    setState((prev) => ({
      ...prev,
      selectedDepartment: dept,
      selectedTopic: null,
      currentLesson: null,
    }));
  };

  const setTopic = (topic: string) => {
    setState((prev) => ({
      ...prev,
      selectedTopic: topic,
      currentLesson: null,
    }));
  };

  const setLesson = (lesson: LessonPlan | null) => {
    setState((prev) => ({
      ...prev,
      currentLesson: lesson,
    }));
  };

  const setIsGeneratingLesson = (isGenerating: boolean) => {
    setState((prev) => ({
      ...prev,
      isGeneratingLesson: isGenerating,
    }));
  };

  const resetSelections = () => {
    setState((prev) => ({
      ...prev,
      selectedDepartment: null,
      selectedTopic: null,
      currentLesson: null,
    }));
  };

  const resetAll = () => {
    setState(initialState);
  };

  return (
    <TrainingContext.Provider
      value={{
        state,
        submitAnswer,
        completeQuestionnaire,
        setDepartment,
        setTopic,
        setLesson,
        setIsGeneratingLesson,
        resetSelections,
        resetAll,
      }}
    >
      {children}
    </TrainingContext.Provider>
  );
}

export function useTraining() {
  const context = useContext(TrainingContext);
  if (context === undefined) {
    throw new Error('useTraining must be used within a TrainingProvider');
  }
  return context;
}