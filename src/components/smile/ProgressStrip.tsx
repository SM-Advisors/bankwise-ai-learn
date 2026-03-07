import { cn } from '@/lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────

type ModuleState = 'not_started' | 'in_progress' | 'completed';

interface ProgressModule {
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

// ─── ProgressStrip ────────────────────────────────────────────────────────────
//
// Horizontal progress strip for the training workspace.
// Replaces the full ModuleListSidebar in Phase 2.
//
// Renders a compact row of labeled pills:
//   completed    → accent-filled pill
//   in_progress  → accent-outlined pill + label visible
//   not_started  → muted pill
//
// The active/current module (via currentModuleId) shows its title inline.
// All other modules are icon-only to minimize horizontal footprint.

export function ProgressStrip({
  modules,
  currentModuleId,
  onModuleClick,
  className,
}: ProgressStripProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none',
        className
      )}
      role="list"
      aria-label="Module progress"
    >
      {modules.map((mod, index) => {
        const isCurrent = mod.id === currentModuleId;
        const isClickable = !!onModuleClick;

        return (
          <div key={mod.id} className="flex items-center gap-1.5 shrink-0">
            {/* Step connector line */}
            {index > 0 && (
              <div
                className={cn(
                  'h-px w-4',
                  mod.state === 'completed'
                    ? 'bg-accent'
                    : 'bg-border'
                )}
              />
            )}

            {/* Module pill */}
            <button
              role="listitem"
              onClick={() => onModuleClick?.(mod.id)}
              disabled={!isClickable}
              aria-label={`${mod.title} — ${mod.state.replace('_', ' ')}`}
              aria-current={isCurrent ? 'step' : undefined}
              className={cn(
                'flex items-center gap-1.5 rounded-full transition-all duration-150',
                // Base pill sizing
                isCurrent
                  ? 'px-3 py-1 text-xs font-medium'
                  : 'h-3 w-3',
                // State styles
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
                // Interactive
                isClickable && 'cursor-pointer hover:opacity-80 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent',
                !isClickable && 'cursor-default'
              )}
            >
              {/* Dot for non-current */}
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

              {/* Label only for current */}
              {isCurrent && (
                <span className="max-w-[120px] truncate">{mod.title}</span>
              )}
            </button>
          </div>
        );
      })}
    </div>
  );
}
