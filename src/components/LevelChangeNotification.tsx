import { useState } from 'react';
import { TrendingUp, TrendingDown, CheckCircle, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface LevelSuggestion {
  currentLevel: string;
  proposedLevel: string;
  rationale: string;
  evidenceSummary: string;
}

interface Props {
  suggestion: LevelSuggestion;
  requestId?: string;
  onAccept: () => Promise<void>;
  onDecline: () => void;
}

const LEVEL_ORDER = ['beginner', 'intermediate', 'advanced', 'expert'];

function levelLabel(level: string) {
  return level.charAt(0).toUpperCase() + level.slice(1);
}

export function LevelChangeNotification({ suggestion, onAccept, onDecline }: Props) {
  const { toast } = useToast();
  const [accepting, setAccepting] = useState(false);

  const isUpgrade = LEVEL_ORDER.indexOf(suggestion.proposedLevel) > LEVEL_ORDER.indexOf(suggestion.currentLevel);
  const Icon = isUpgrade ? TrendingUp : TrendingDown;
  const colorClass = isUpgrade
    ? 'border-green-500/30 bg-green-500/5'
    : 'border-orange-500/30 bg-orange-500/5';
  const iconColor = isUpgrade ? 'text-green-500' : 'text-orange-500';

  const handleAccept = async () => {
    setAccepting(true);
    try {
      await onAccept();
      toast({
        title: isUpgrade ? 'Level updated!' : 'Level adjusted',
        description: `Your proficiency is now set to ${levelLabel(suggestion.proposedLevel)}.`,
      });
    } catch {
      toast({ title: 'Error updating level', variant: 'destructive' });
    }
    setAccepting(false);
  };

  return (
    <div className={`ml-2 p-3 rounded-lg border ${colorClass} space-y-2`}>
      <div className="flex items-start gap-2">
        <Icon className={`h-4 w-4 shrink-0 mt-0.5 ${iconColor}`} />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-foreground">
            {isUpgrade ? 'Ready for a higher level?' : 'Adjusting your level'}
          </p>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            {levelLabel(suggestion.currentLevel)} → {levelLabel(suggestion.proposedLevel)}
          </p>
        </div>
      </div>

      <p className="text-xs text-muted-foreground leading-relaxed">{suggestion.rationale}</p>

      {suggestion.evidenceSummary && (
        <p className="text-[11px] text-muted-foreground italic">{suggestion.evidenceSummary}</p>
      )}

      <div className="flex items-center gap-2 pt-0.5">
        <Button
          size="sm"
          className="h-6 text-xs px-2.5 gap-1"
          onClick={handleAccept}
          disabled={accepting}
        >
          {accepting ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle className="h-3 w-3" />}
          {isUpgrade ? 'Yes, level up' : 'Accept'}
        </Button>
        <button
          onClick={onDecline}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
          disabled={accepting}
        >
          <X className="h-3 w-3" />
          Not yet
        </button>
      </div>
    </div>
  );
}
