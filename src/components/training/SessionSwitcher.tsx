import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';

// Short labels for the switcher pills — pulled from session titles in trainingContent
const SESSION_LABELS: Record<number, string> = {
  1: 'Foundations',
  2: 'AI Agent',
  3: 'Role Training',
  4: 'Integration',
  5: 'Frankenstein',
};

interface SessionSwitcherProps {
  /** The session number currently being viewed (from URL param) */
  activeSession: number;
  /** The furthest session the user has unlocked (profile.current_session) */
  currentSession: number;
  /** Which sessions have been fully completed */
  completedSessions: Partial<Record<number, boolean>>;
}

export function SessionSwitcher({
  activeSession,
  currentSession,
  completedSessions,
}: SessionSwitcherProps) {
  const navigate = useNavigate();

  return (
    <div className="flex items-center gap-1.5 px-4 py-2 border-b bg-card/50 shrink-0 overflow-x-auto">
      {(([1, 2, 3, 4, 5] as const)).map((n) => {
        const isAccessible = n <= currentSession;
        const isActive = n === activeSession;
        const isCompleted = !!completedSessions[n];

        return (
          <button
            key={n}
            onClick={() => isAccessible && navigate(`/training/${n}`)}
            disabled={!isAccessible}
            aria-current={isActive ? 'page' : undefined}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all shrink-0 whitespace-nowrap',
              isActive
                ? 'bg-primary text-primary-foreground shadow-sm'
                : isCompleted
                ? 'bg-green-500/10 text-green-700 dark:text-green-400 hover:bg-green-500/20 cursor-pointer'
                : isAccessible
                ? 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground cursor-pointer'
                : 'bg-muted/40 text-muted-foreground/40 cursor-not-allowed',
            )}
          >
            {/* Icon */}
            {isCompleted && !isActive ? (
              <CheckCircle2 className="h-3 w-3 shrink-0" />
            ) : !isAccessible ? (
              <Lock className="h-3 w-3 shrink-0" />
            ) : (
              <span className="shrink-0 h-4 w-4 rounded-full bg-current/20 flex items-center justify-center text-[10px] font-bold leading-none">
                {n}
              </span>
            )}
            {SESSION_LABELS[n]}
          </button>
        );
      })}
    </div>
  );
}
