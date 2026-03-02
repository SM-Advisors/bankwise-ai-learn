import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ChevronLeft, ChevronRight, BookOpen, CheckCircle, FileText, Lightbulb, Play, Eye, MessageCircle, Clock, Lock, ShieldCheck, Sparkles } from 'lucide-react';
import { type ModuleContent } from '@/data/trainingContent';
import type { ModuleEngagement, ModuleState } from '@/types/progress';
import { getModuleState } from '@/utils/computeProgress';

interface ModuleListSidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  modules: ModuleContent[];
  selectedModule: ModuleContent | null;
  completedModules: Set<string>;
  moduleEngagement: Record<string, ModuleEngagement>;
  onSelectModule: (module: ModuleContent) => void;
  onGateBypass?: (moduleId: string) => void;
}

const getModuleTypeIcon = (type: ModuleContent['type']) => {
  switch (type) {
    case 'document': return FileText;
    case 'example': return Lightbulb;
    case 'exercise': return Play;
    case 'video': return Play;
    case 'sandbox': return Sparkles;
    default: return BookOpen;
  }
};

// 5-state icon system
const getStateIcon = (state: ModuleState, moduleType: ModuleContent['type']) => {
  switch (state) {
    case 'completed': return CheckCircle;
    case 'submitted': return Clock;
    case 'practicing': return MessageCircle;
    case 'content_viewed': return Eye;
    case 'not_started':
    default: return getModuleTypeIcon(moduleType);
  }
};

// State-based left border color for the card
const getStateBorder = (state: ModuleState): string => {
  switch (state) {
    case 'completed': return 'border-l-emerald-500';
    case 'submitted': return 'border-l-orange-500';
    case 'practicing': return 'border-l-amber-500';
    case 'content_viewed': return 'border-l-blue-400';
    case 'not_started':
    default: return 'border-l-transparent';
  }
};

// State-based background colors for the icon container
const getStateBackground = (state: ModuleState, isSelected: boolean): string => {
  switch (state) {
    case 'completed': return 'bg-green-500/15 text-green-500';
    case 'submitted': return 'bg-orange-500/15 text-orange-500';
    case 'practicing': return 'bg-amber-500/15 text-amber-500';
    case 'content_viewed': return 'bg-blue-400/15 text-blue-400';
    case 'not_started':
    default:
      return isSelected ? 'bg-accent/15 text-accent' : 'bg-muted text-muted-foreground';
  }
};

// State labels for in-progress states
const getStateLabel = (state: ModuleState, engagement?: ModuleEngagement): { text: string; className: string } | null => {
  switch (state) {
    case 'content_viewed':
      return { text: 'Viewed', className: 'text-blue-400' };
    case 'practicing':
      const count = engagement?.practiceMessageCount || 0;
      return { text: count > 0 ? `${count} msgs` : 'Started', className: 'text-amber-500' };
    case 'submitted':
      return { text: 'Reviewed', className: 'text-orange-500' };
    default:
      return null;
  }
};

/**
 * Returns true if a module is gated (locked) because a prior gate module hasn't been passed.
 * A gate module itself is never locked — it must remain accessible to attempt.
 */
function isModuleLocked(
  module: ModuleContent,
  allModules: ModuleContent[],
  moduleEngagement: Record<string, ModuleEngagement>,
  completedModules: Set<string>,
): boolean {
  const moduleIndex = allModules.findIndex(m => m.id === module.id);
  for (let i = 0; i < moduleIndex; i++) {
    const candidate = allModules[i];
    if (!candidate.isGateModule) continue;
    // Gate not cleared if not passed and not legacy-completed
    const eng = moduleEngagement[candidate.id];
    const passed = eng?.gatePassed === true || completedModules.has(candidate.id);
    if (!passed) return true;
  }
  return false;
}

export function ModuleListSidebar({
  collapsed,
  onToggleCollapse,
  modules,
  selectedModule,
  completedModules,
  moduleEngagement,
  onSelectModule,
  onGateBypass,
}: ModuleListSidebarProps) {
  // Compute active module count (any state beyond not_started)
  const activeCount = modules.filter((m) => {
    const eng = moduleEngagement[m.id];
    return eng ? getModuleState(eng) !== 'not_started' : completedModules.has(m.id);
  }).length;

  const completedCount = modules.filter((m) => {
    const eng = moduleEngagement[m.id];
    return eng ? getModuleState(eng) === 'completed' : completedModules.has(m.id);
  }).length;

  const progressPct = modules.length > 0 ? Math.round((completedCount / modules.length) * 100) : 0;

  return (
    <aside
      data-tour="lesson-content"
      className={`border-r border-border bg-card transition-all duration-300 flex flex-col ${collapsed ? 'w-12' : 'w-72'}`}
      aria-label="Training modules navigation"
    >
      {/* Header */}
      <div className="px-3 pt-3 pb-2 flex items-center justify-between shrink-0">
        {!collapsed && (
          <div className="flex-1 mr-2">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="font-semibold text-sm text-foreground tracking-tight">Modules</span>
              <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">
                {completedCount}/{modules.length}
              </span>
            </div>
            <Progress value={progressPct} className="h-1" />
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleCollapse}
          className="ml-auto h-7 w-7 p-0 text-muted-foreground hover:text-foreground shrink-0"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {/* Collapsed: show module count */}
      {collapsed && (
        <div className="flex flex-col items-center gap-1 px-1 pt-2">
          <span className="text-[10px] text-muted-foreground font-medium">{completedCount}/{modules.length}</span>
        </div>
      )}

      {!collapsed && (
        <ScrollArea className="flex-1 px-2 pb-2">
          <nav className="space-y-2" aria-label="Module list">
            <TooltipProvider>
            {modules.map((module, idx) => {
              const isSelected = selectedModule?.id === module.id;
              const engagement = moduleEngagement[module.id];
              const isLegacyCompleted = completedModules.has(module.id);
              const locked = isModuleLocked(module, modules, moduleEngagement, completedModules);
              const isGate = !!module.isGateModule;
              const gatePassed = engagement?.gatePassed === true || isLegacyCompleted;

              // Determine state: use engagement if available, fall back to legacy
              let state: ModuleState;
              if (engagement) {
                state = getModuleState(engagement);
              } else if (isLegacyCompleted) {
                state = 'completed';
              } else {
                state = 'not_started';
              }

              const IconComponent = locked ? Lock : getStateIcon(state, module.type);
              const iconBg = locked
                ? 'bg-muted text-muted-foreground/40'
                : getStateBackground(state, isSelected);
              const stateLabel = locked ? null : getStateLabel(state, engagement);
              const leftBorder = locked ? 'border-l-muted' : getStateBorder(state);

              const button = (
                <button
                  key={module.id}
                  disabled={locked}
                  className={`flex items-start gap-3 w-full p-3 text-sm rounded-xl border-y border-r border-l-[3px] transition-all text-left ${leftBorder} ${
                    locked
                      ? 'opacity-50 cursor-not-allowed bg-muted/30 border-y-border border-r-border'
                      : isSelected
                        ? 'bg-accent/10 border-y-accent border-r-accent shadow-sm text-foreground'
                        : 'bg-card border-y-border border-r-border hover:border-y-accent/40 hover:border-r-accent/40 hover:shadow-sm text-muted-foreground hover:text-foreground'
                  }`}
                  onClick={() => !locked && onSelectModule(module)}
                  aria-pressed={isSelected}
                  aria-label={`${locked ? 'Locked: ' : state === 'completed' ? 'Completed: ' : ''}${idx + 1}. ${module.title}`}
                >
                  <div className={`mt-0.5 flex items-center justify-center h-7 w-7 rounded-lg shrink-0 ${iconBg}`}>
                    <IconComponent className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className={`block truncate font-medium ${isSelected ? 'text-foreground' : ''}`}>
                        {module.title}
                      </span>
                      {/* Quality Gate badge */}
                      {isGate && (
                        !gatePassed && onGateBypass ? (
                          <button
                            type="button"
                            title="Click to manually dismiss this gate"
                            onClick={(e) => { e.stopPropagation(); onGateBypass(module.id); }}
                            className="shrink-0 inline-flex items-center gap-0.5 text-[9px] font-semibold px-1 py-0.5 rounded bg-amber-500/15 text-amber-600 hover:bg-green-500/15 hover:text-green-600 transition-colors"
                          >
                            <ShieldCheck className="h-2.5 w-2.5" />
                            Gate
                          </button>
                        ) : (
                          <span className={`shrink-0 inline-flex items-center gap-0.5 text-[9px] font-semibold px-1 py-0.5 rounded ${
                            gatePassed
                              ? 'bg-green-500/15 text-green-600'
                              : 'bg-amber-500/15 text-amber-600'
                          }`}>
                            <ShieldCheck className="h-2.5 w-2.5" />
                            Gate
                          </span>
                        )
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-xs text-muted-foreground capitalize">{module.type}</span>
                      {stateLabel && (
                        <>
                          <span className="text-muted-foreground/30">&middot;</span>
                          <span className={`text-xs ${stateLabel.className}`}>{stateLabel.text}</span>
                        </>
                      )}
                    </div>
                  </div>
                </button>
              );

              if (locked) {
                // Find which gate is blocking this module
                const blockingGate = [...modules.slice(0, idx)].reverse().find(m => m.isGateModule && !moduleEngagement[m.id]?.gatePassed && !completedModules.has(m.id));
                return (
                  <Tooltip key={module.id}>
                    <TooltipTrigger asChild>{button}</TooltipTrigger>
                    <TooltipContent side="right" className="max-w-48">
                      <p className="text-xs">Complete and pass the Quality Gate in <strong>{blockingGate?.title ?? 'a previous module'}</strong> to unlock this module.</p>
                    </TooltipContent>
                  </Tooltip>
                );
              }

              return button;
            })}
            </TooltipProvider>
          </nav>
        </ScrollArea>
      )}
    </aside>
  );
}
