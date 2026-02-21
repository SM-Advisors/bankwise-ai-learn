import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChevronLeft, ChevronRight, BookOpen, CheckCircle, FileText, Lightbulb, Play } from 'lucide-react';
import { type ModuleContent } from '@/data/trainingContent';

interface ModuleListSidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  modules: ModuleContent[];
  selectedModule: ModuleContent | null;
  completedModules: Set<string>;
  onSelectModule: (module: ModuleContent) => void;
}

const getModuleIcon = (type: ModuleContent['type']) => {
  switch (type) {
    case 'document': return FileText;
    case 'example': return Lightbulb;
    case 'exercise': return Play;
    case 'video': return Play;
    default: return BookOpen;
  }
};

export function ModuleListSidebar({
  collapsed,
  onToggleCollapse,
  modules,
  selectedModule,
  completedModules,
  onSelectModule,
}: ModuleListSidebarProps) {
  return (
    <aside
      className={`border-r border-border bg-card transition-all duration-300 flex flex-col ${collapsed ? 'w-12' : 'w-72'}`}
      aria-label="Training modules navigation"
    >
      {/* Header */}
      <div className="px-3 pt-3 pb-2 flex items-center justify-between shrink-0">
        {!collapsed && (
          <span className="font-semibold text-sm text-foreground tracking-tight">Modules</span>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleCollapse}
          className="ml-auto h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {!collapsed && (
        <ScrollArea className="flex-1 px-2 pb-2">
          <nav className="space-y-2" aria-label="Module list">
            {modules.map((module, idx) => {
              const IconComponent = getModuleIcon(module.type);
              const isSelected = selectedModule?.id === module.id;
              const isCompleted = completedModules.has(module.id);

              return (
                <button
                  key={module.id}
                  className={`flex items-start gap-3 w-full p-3 text-sm rounded-xl border transition-all text-left ${
                    isSelected
                      ? 'bg-accent/10 border-accent shadow-sm text-foreground'
                      : 'bg-card border-border hover:border-accent/40 hover:shadow-sm text-muted-foreground hover:text-foreground'
                  }`}
                  onClick={() => onSelectModule(module)}
                  aria-pressed={isSelected}
                  aria-label={`${isCompleted ? 'Completed: ' : ''}${idx + 1}. ${module.title}`}
                >
                  <div className={`mt-0.5 flex items-center justify-center h-7 w-7 rounded-lg shrink-0 ${
                    isCompleted
                      ? 'bg-accent/15 text-accent'
                      : isSelected
                        ? 'bg-accent/15 text-accent'
                        : 'bg-muted text-muted-foreground'
                  }`}>
                    {isCompleted ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      <IconComponent className="h-4 w-4" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className={`block truncate font-medium ${isSelected ? 'text-foreground' : ''}`}>
                      {module.title}
                    </span>
                    <span className="block text-xs text-muted-foreground capitalize mt-0.5">
                      {module.type}
                    </span>
                  </div>
                </button>
              );
            })}
          </nav>
        </ScrollArea>
      )}
    </aside>
  );
}
