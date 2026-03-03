import { LearningStyle } from '@/contexts/TrainingContext';
import { Eye, List, Zap, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LearningStyleBadgeProps {
  style: LearningStyle;
  showDescription?: boolean;
}

const styleInfo: Record<LearningStyle, {
  icon: typeof Eye;
  label: string;
  description: string;
  color: string;
}> = {
  'example-based': {
    icon: Eye,
    label: 'Example-Based Learner',
    description: 'You learn best through annotated examples and visual patterns',
    color: 'bg-blue-100 text-blue-700 border-blue-200',
  },
  'explanation-based': {
    icon: List,
    label: 'Explanation-Based Learner',
    description: 'You prefer step-by-step guidance and explicit rationale',
    color: 'bg-green-100 text-green-700 border-green-200',
  },
  'hands-on': {
    icon: Zap,
    label: 'Hands-On Learner',
    description: 'You excel by practicing tasks and receiving rapid feedback',
    color: 'bg-amber-100 text-amber-700 border-amber-200',
  },
  'logic-based': {
    icon: Settings,
    label: 'Logic-Based Learner',
    description: 'You thrive with decision logic, constraints, and rules up front',
    color: 'bg-purple-100 text-purple-700 border-purple-200',
  },
};

export function LearningStyleBadge({ style, showDescription = false }: LearningStyleBadgeProps) {
  const info = styleInfo[style];
  const Icon = info.icon;

  if (showDescription) {
    return (
      <div className={cn('rounded-xl border p-4', info.color)}>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-white/50">
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <p className="font-semibold">{info.label}</p>
            <p className="text-sm opacity-80">{info.description}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <span className={cn('inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium border', info.color)}>
      <Icon className="h-3.5 w-3.5" />
      {info.label}
    </span>
  );
}