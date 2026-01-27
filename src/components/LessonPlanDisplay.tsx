import { LessonPlan } from '@/contexts/TrainingContext';
import { LearningStyle } from '@/contexts/TrainingContext';
import { Clock, Target, Lightbulb, Eye, List, Zap, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LessonPlanDisplayProps {
  lesson: LessonPlan;
  learningStyle: LearningStyle;
}

const styleConfig: Record<LearningStyle, {
  icon: typeof Eye;
  label: string;
  accent: string;
  bgAccent: string;
  borderAccent: string;
}> = {
  'example-based': {
    icon: Eye,
    label: 'Example-Based Learning Format',
    accent: 'text-blue-600',
    bgAccent: 'bg-blue-50',
    borderAccent: 'border-blue-200',
  },
  'explanation-based': {
    icon: List,
    label: 'Step-by-Step Explanation Format',
    accent: 'text-green-600',
    bgAccent: 'bg-green-50',
    borderAccent: 'border-green-200',
  },
  'hands-on': {
    icon: Zap,
    label: 'Hands-On Practice Format',
    accent: 'text-amber-600',
    bgAccent: 'bg-amber-50',
    borderAccent: 'border-amber-200',
  },
  'logic-based': {
    icon: Settings,
    label: 'Logic & Rules Format',
    accent: 'text-purple-600',
    bgAccent: 'bg-purple-50',
    borderAccent: 'border-purple-200',
  },
};

export function LessonPlanDisplay({ lesson, learningStyle }: LessonPlanDisplayProps) {
  const config = styleConfig[learningStyle];
  const StyleIcon = config.icon;

  return (
    <div className="animate-slide-up max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-card rounded-xl border shadow-sm p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <div className={cn('p-2 rounded-lg', config.bgAccent)}>
            <StyleIcon className={cn('h-5 w-5', config.accent)} />
          </div>
          <span className={cn('text-sm font-medium', config.accent)}>{config.label}</span>
        </div>

        <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-4">
          {lesson.title}
        </h1>

        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Target className="h-4 w-4 text-accent" />
            <span>{lesson.objective}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-4 w-4 text-accent" />
            <span>{lesson.estimatedTime}</span>
          </div>
        </div>
      </div>

      {/* Lesson Sections */}
      <div className="space-y-4 mb-6">
        {lesson.sections.map((section, index) => (
          <div
            key={index}
            className={cn(
              'bg-card rounded-xl border shadow-sm p-6',
              (learningStyle === 'explanation-based' || learningStyle === 'hands-on') && 'border-l-4 border-l-accent'
            )}
          >
            <div className="flex items-start gap-4">
              {(learningStyle === 'explanation-based' || learningStyle === 'hands-on') && (
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-accent text-accent-foreground flex items-center justify-center font-semibold text-sm">
                  {index + 1}
                </div>
              )}
              <div className="flex-1">
                <h3 className="font-semibold text-lg text-foreground mb-3">{section.title}</h3>
                <div className="prose prose-sm max-w-none text-muted-foreground whitespace-pre-wrap">
                  {section.content}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* What You Produce */}
      <div className={cn('rounded-xl border-2 p-6', config.bgAccent, config.borderAccent)}>
        <div className="flex items-start gap-4">
          <div className="p-2 rounded-lg bg-highlight">
            <Lightbulb className="h-5 w-5 text-highlight-foreground" />
          </div>
          <div>
            <h3 className="font-semibold text-lg text-foreground mb-2">
              What You Produce: {lesson.artifact.title}
            </h3>
            <p className="text-muted-foreground">{lesson.artifact.description}</p>
          </div>
        </div>
      </div>
    </div>
  );
}