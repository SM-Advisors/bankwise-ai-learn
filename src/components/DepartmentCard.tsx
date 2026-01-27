import { DepartmentInfo } from '@/data/topics';
import { Calculator, FileText, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DepartmentCardProps {
  department: DepartmentInfo;
  isSelected: boolean;
  onSelect: () => void;
}

const iconMap = {
  Calculator: Calculator,
  FileText: FileText,
  TrendingUp: TrendingUp,
};

export function DepartmentCard({ department, isSelected, onSelect }: DepartmentCardProps) {
  const Icon = iconMap[department.icon as keyof typeof iconMap];

  return (
    <button
      onClick={onSelect}
      className={cn(
        'w-full text-left p-6 rounded-xl border-2 transition-all duration-200',
        'hover:shadow-lg hover:border-accent',
        isSelected
          ? 'border-accent bg-accent/5 shadow-md'
          : 'border-border bg-card hover:bg-card/80'
      )}
    >
      <div className="flex items-start gap-4">
        <div
          className={cn(
            'p-3 rounded-lg transition-colors',
            isSelected ? 'bg-accent text-accent-foreground' : 'bg-secondary text-primary'
          )}
        >
          <Icon className="h-6 w-6" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-lg text-foreground mb-1">{department.name}</h3>
          <p className="text-sm text-muted-foreground">{department.description}</p>
          <p className="text-xs text-muted-foreground mt-2">
            {department.topics.length} training topics available
          </p>
        </div>
        <div
          className={cn(
            'mt-1 h-5 w-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors',
            isSelected ? 'border-accent bg-accent' : 'border-muted-foreground/30'
          )}
        >
          {isSelected && <div className="h-2 w-2 rounded-full bg-accent-foreground" />}
        </div>
      </div>
    </button>
  );
}