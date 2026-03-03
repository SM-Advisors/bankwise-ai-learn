import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

// ─── Types ────────────────────────────────────────────────────────────────────

type ModuleState = 'not_started' | 'in_progress' | 'completed';

export interface ProgressModule {
  id: string;
  title: string;
  state: ModuleState;
}

interface ProgressStripProps {
  modules: ProgressModule[];
  currentModuleId?: string;
  onModuleClick?: (id: string) => void;
  className?: string;
}

const STATE_LABEL: Record<ModuleState, string> = {
  completed: 'Completed',
  in_progress: 'In progress',
  not_started: 'Not started',
};

// ─── ProgressStrip ────────────────────────────────────────────────────────────
//
// Horizontal progress strip for the training workspace.
// Each dot represents one module; hover to see its name and status.
// The active module shows its title inline.

export function ProgressStrip({
  modules,
  currentModuleId,
  onModuleClick,
  className,
}: ProgressStripProps) {
  return (
    <div className={cn('flex items-center gap-1.5', className)}>
      {/* "Modules" label so users know what they're looking at */}
      <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground mr-1 shrink-0">
        Modules
      </span>

      <div
        className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none"
        role="list"
        aria-label="Module progress"
      >
        {modules.map((mod, index) => {
          const isCurrent = mod.id === currentModuleId;
          const isClickable = !!onModuleClick;

          const pill = (
            <button
              role="listitem"
              onClick={() => onModuleClick?.(mod.id)}
              disabled={!isClickable}
              aria-label={`${mod.title} — ${STATE_LABEL[mod.state]}`}
              aria-current={isCurrent ? 'step' : undefined}
              className={cn(
                'flex items-center gap-1.5 rounded-full transition-all duration-150',
                isCurrent
                  ? 'px-3 py-1 text-xs font-medium'
                  : 'h-3 w-3',
                mod.state === 'completed' && [
                  'bg-accent',
                  isCurrent && 'text-accent-foreground',
                ],
                mod.state === 'in_progress' && [
                  'ring-2 ring-accent',
                  isCurrent
                    ? 'bg-accent/10 text-accent'
                    : 'bg-transparent',
                ],
                mod.state === 'not_started' && 'bg-muted',
                isClickable && 'cursor-pointer hover:opacity-80 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent',
                !isClickable && 'cursor-default'
              )}
            >
              {!isCurrent && (
                <span
                  className={cn(
                    'block h-3 w-3 rounded-full',
                    mod.state === 'completed' && 'bg-accent',
                    mod.state === 'in_progress' && 'bg-accent/50',
                    mod.state === 'not_started' && 'bg-muted-foreground/30'
                  )}
                />
              )}
              {isCurrent && (
                <span className="max-w-[120px] truncate">{mod.title}</span>
              )}
            </button>
          );

          return (
            <div key={mod.id} className="flex items-center gap-1.5 shrink-0">
              {index > 0 && (
                <div
                  className={cn(
                    'h-px w-4',
                    mod.state === 'completed' ? 'bg-accent' : 'bg-border'
                  )}
                />
              )}

              {/* Non-current dots get a tooltip; current pill is self-labelled */}
              {isCurrent ? (
                pill
              ) : (
                <Tooltip delayDuration={200}>
                  <TooltipTrigger asChild>{pill}</TooltipTrigger>
                  <TooltipContent side="bottom" className="text-xs">
                    <p className="font-medium">{mod.title}</p>
                    <p className="text-muted-foreground">{STATE_LABEL[mod.state]}</p>
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
