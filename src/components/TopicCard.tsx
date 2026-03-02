import { Topic } from '@/data/topics';
import { cn } from '@/lib/utils';
import { ChevronRight } from 'lucide-react';

interface TopicCardProps {
  topic: Topic;
  isSelected: boolean;
  onSelect: () => void;
}

export function TopicCard({ topic, isSelected, onSelect }: TopicCardProps) {
  return (
    <button
      onClick={onSelect}
      className={cn(
        'w-full text-left p-5 rounded-lg border transition-all duration-200',
        'hover:shadow-md hover:border-accent',
        isSelected
          ? 'border-accent bg-accent/5 shadow-sm'
          : 'border-border bg-card hover:bg-card/80'
      )}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1">
          <h4 className="font-medium text-foreground mb-1">{topic.title}</h4>
          <p className="text-sm text-muted-foreground">{topic.description}</p>
        </div>
        <ChevronRight
          className={cn(
            'h-5 w-5 flex-shrink-0 transition-colors',
            isSelected ? 'text-accent' : 'text-muted-foreground'
          )}
        />
      </div>
    </button>
  );
}