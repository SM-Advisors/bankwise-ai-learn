import { LearningStyle } from '@/contexts/TrainingContext';
import { Eye, CheckSquare, Brain } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LearningStyleBadgeProps {
  style: LearningStyle;
  showDescription?: boolean;
}

const styleInfo = {
  visual: {
    icon: Eye,
    label: 'Visual Learner',
    description: 'You learn best through diagrams, frameworks, and visual structures',
    color: 'bg-blue-100 text-blue-700 border-blue-200',
  },
  procedural: {
    icon: CheckSquare,
    label: 'Procedural Learner',
    description: 'You prefer step-by-step instructions and clear checklists',
    color: 'bg-green-100 text-green-700 border-green-200',
  },
  conceptual: {
    icon: Brain,
    label: 'Conceptual Learner',
    description: 'You excel with strategic thinking and understanding principles',
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