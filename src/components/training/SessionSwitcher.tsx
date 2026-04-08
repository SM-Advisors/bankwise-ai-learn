import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Lock, ChevronDown, ArrowRight, PartyPopper } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ModuleContent } from '@/data/trainingContent';
import type { ModuleEngagement } from '@/types/progress';

// Short labels for the switcher pills — pulled from session titles in trainingContent
const SESSION_LABELS: Record<number, string> = {
  1: 'Fundamentals',
  2: 'Frameworks',
  3: 'Agents',
  4: 'Daily Tools',
  5: 'Workflow',
};

interface SessionSwitcherProps {
  /** The session number currently being viewed (from URL param) */
  activeSession: number;
  /** The furthest session the user has unlocked (profile.current_session) */
  currentSession: number;
  /** Which sessions have been fully completed */
  completedSessions: Partial<Record<number, boolean>>;
  /** Modules for the active session — shown in horizontal dropdown */
  modules?: ModuleContent[];
  /** Currently selected module */
  selectedModule?: ModuleContent | null;
  /** Completed module IDs */
  completedModules?: Set<string>;
  /** Module engagement data */
  moduleEngagement?: Record<string, ModuleEngagement>;
  /** Callback when a module is selected from the dropdown */
  onSelectModule?: (module: ModuleContent) => void;
  /** Whether every module in the active session is completed */
  allModulesCompleted?: boolean;
  /** Whether the active session has already been marked complete */
  isSessionCompleted?: boolean;
  /** Callback to complete the session and advance to the next one */
  onCompleteSession?: () => void;
  /** SuperAdmin global override — all gates open */
  allGatesUnlocked?: boolean;
}

export function SessionSwitcher({
  activeSession,
  currentSession,
  completedSessions,
  modules,
  selectedModule,
  completedModules,
  moduleEngagement,
  onSelectModule,
  allModulesCompleted,
  isSessionCompleted,
  onCompleteSession,
  allGatesUnlocked,
}: SessionSwitcherProps) {
  const navigate = useNavigate();
  const [expandedSession, setExpandedSession] = useState<number | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setExpandedSession(null);
      }
    }
    if (expandedSession !== null) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [expandedSession]);

  const handleSessionClick = (n: number, isAccessible: boolean) => {
    if (!isAccessible) return;
    if (n === activeSession) {
      // Toggle module dropdown for current session
      setExpandedSession(prev => prev === n ? null : n);
    } else {
      setExpandedSession(null);
      navigate(`/training/${n}`);
    }
  };

  const handleModuleClick = (module: ModuleContent) => {
    setExpandedSession(null);
    onSelectModule?.(module);
  };

  // Check if a module is locked — strict sequential: previous module must be completed
  const isModuleLocked = (module: ModuleContent, allModules: ModuleContent[]): boolean => {
    if (allGatesUnlocked) return false;
    if (!moduleEngagement || !completedModules) return false;
    const moduleIndex = allModules.findIndex(m => m.id === module.id);
    // First module is never locked
    if (moduleIndex <= 0) return false;

    // Check if the immediately preceding module is completed
    const prevModule = allModules[moduleIndex - 1];
    const prevEng = moduleEngagement[prevModule.id];
    const prevCompleted =
      completedModules.has(prevModule.id) ||
      prevEng?.completed === true ||
      prevEng?.gatePassed === true;

    if (prevCompleted) return false;

    // Grandfather fallback: if user has any engagement beyond this module, unlock it
    for (let i = moduleIndex + 1; i < allModules.length; i++) {
      const laterModule = allModules[i];
      if (moduleEngagement[laterModule.id] || completedModules.has(laterModule.id)) {
        return false;
      }
    }

    return true;
  };

  return (
    <div className="relative shrink-0" ref={dropdownRef}>
      <div className="flex items-center gap-1.5 px-4 py-2 border-b bg-card/50 overflow-x-auto">
        {(([1, 2, 3, 4, 5] as const)).map((n) => {
          const isAccessible = allGatesUnlocked || n <= currentSession;
          const isActive = n === activeSession;
          const isCompleted = !!completedSessions[n];
          const isExpanded = expandedSession === n;

          return (
            <button
              key={n}
              onClick={() => handleSessionClick(n, isAccessible)}
              disabled={!isAccessible}
              aria-current={isActive ? 'page' : undefined}
              aria-expanded={isExpanded}
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
              {isActive && modules && modules.length > 0 && (
                <ChevronDown className={cn('h-3 w-3 transition-transform', isExpanded && 'rotate-180')} />
              )}
            </button>
          );
        })}

        {/* Complete Session CTA — shown when all modules are green but session not yet marked complete */}
        {allModulesCompleted && !isSessionCompleted && onCompleteSession && (
          <button
            onClick={onCompleteSession}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold transition-all shrink-0 whitespace-nowrap bg-green-600 text-white hover:bg-green-700 shadow-sm animate-pulse hover:animate-none"
          >
            <PartyPopper className="h-3.5 w-3.5 shrink-0" />
            Complete Session & Continue
            <ArrowRight className="h-3 w-3 shrink-0" />
          </button>
        )}
      </div>

      {/* Horizontal module dropdown */}
      {expandedSession === activeSession && modules && modules.length > 0 && (
        <div className="absolute left-0 right-0 z-30 border-b bg-card shadow-md">
          <div className="flex items-center gap-1 px-4 py-2 overflow-x-auto">
            {modules.map((mod) => {
              const isSelected = selectedModule?.id === mod.id;
              const isComplete = completedModules?.has(mod.id);
              const locked = isModuleLocked(mod, modules);

              return (
                <button
                  key={mod.id}
                  disabled={locked}
                  onClick={() => !locked && handleModuleClick(mod)}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all shrink-0 whitespace-nowrap',
                    locked
                      ? 'bg-muted/40 text-muted-foreground/40 cursor-not-allowed'
                      : isSelected
                      ? 'bg-accent text-accent-foreground shadow-sm'
                      : isComplete
                      ? 'bg-green-500/10 text-green-700 hover:bg-green-500/20 cursor-pointer'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground cursor-pointer',
                  )}
                >
                  {locked ? (
                    <Lock className="h-3 w-3 shrink-0" />
                  ) : isComplete ? (
                    <CheckCircle2 className="h-3 w-3 shrink-0" />
                  ) : null}
                  {mod.title}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
