import { INTERESTS, MAX_INTERESTS } from '@/data/interests';
import { cn } from '@/lib/utils';

interface InterestPickerProps {
  selected: string[];
  onChange: (selected: string[]) => void;
}

export function InterestPicker({ selected, onChange }: InterestPickerProps) {
  const toggle = (id: string) => {
    if (selected.includes(id)) {
      onChange(selected.filter((s) => s !== id));
    } else if (selected.length < MAX_INTERESTS) {
      onChange([...selected, id]);
    }
  };

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        {selected.length}/{MAX_INTERESTS} selected
        {selected.length === MAX_INTERESTS && (
          <span className="ml-2 text-primary font-medium">Nice picks!</span>
        )}
      </p>
      <div className="grid grid-cols-3 gap-2">
        {INTERESTS.map((interest) => {
          const isSelected = selected.includes(interest.id);
          const isDisabled = !isSelected && selected.length >= MAX_INTERESTS;

          return (
            <button
              key={interest.id}
              type="button"
              onClick={() => toggle(interest.id)}
              disabled={isDisabled}
              className={cn(
                'flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all text-sm font-medium',
                isSelected
                  ? 'border-primary bg-primary/10 text-primary'
                  : isDisabled
                  ? 'border-border bg-muted/30 text-muted-foreground opacity-50 cursor-not-allowed'
                  : 'border-border hover:border-primary/50 hover:bg-muted/50 cursor-pointer'
              )}
            >
              <span className="text-2xl">{interest.emoji}</span>
              <span className="text-xs text-center leading-tight">{interest.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
