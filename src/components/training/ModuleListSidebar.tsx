import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChevronLeft, ChevronRight, Search, MessageSquare, BookOpen, Library, NotebookPen, PlusCircle, LayoutGrid, CheckCircle, FileText, Lightbulb, Play } from 'lucide-react';
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
      <div className="px-3 pt-3 pb-1 flex items-center justify-between shrink-0">
        {!collapsed && (
          <span className="font-semibold text-sm text-foreground tracking-tight">Training</span>
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
        <>
          {/* Search */}
          <div className="px-3 py-1.5">
            <button className="flex items-center gap-2 w-full px-2.5 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors">
              <Search className="h-4 w-4 shrink-0" />
              <span>Search</span>
            </button>
          </div>

          {/* Chat (active) */}
          <div className="px-3 py-0.5">
            <button className="flex items-center gap-2 w-full px-2.5 py-1.5 text-sm font-medium text-foreground bg-muted rounded-lg border-l-2 border-accent">
              <MessageSquare className="h-4 w-4 shrink-0 text-accent" />
              <span>Chat</span>
            </button>
          </div>

          {/* Modules section */}
          <div className="px-3 pt-3 pb-1">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Modules</span>
          </div>

          <ScrollArea className="flex-1 px-1">
            <nav className="px-2 space-y-0.5" aria-label="Module list">
              {modules.map((module, idx) => {
                const IconComponent = getModuleIcon(module.type);
                const isSelected = selectedModule?.id === module.id;
                const isCompleted = completedModules.has(module.id);

                return (
                  <button
                    key={module.id}
                    className={`flex items-center gap-2.5 w-full px-2.5 py-2 text-sm rounded-lg transition-colors text-left ${
                      isSelected
                        ? 'bg-muted text-foreground font-medium'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                    }`}
                    onClick={() => onSelectModule(module)}
                    aria-pressed={isSelected}
                    aria-label={`${isCompleted ? 'Completed: ' : ''}${idx + 1}. ${module.title}`}
                  >
                    {isCompleted ? (
                      <CheckCircle className="h-4 w-4 shrink-0 text-accent" />
                    ) : (
                      <IconComponent className={`h-4 w-4 shrink-0 ${isSelected ? 'text-accent' : ''}`} />
                    )}
                    <span className="truncate">{module.title}</span>
                  </button>
                );
              })}
            </nav>
          </ScrollArea>

          {/* Bottom navigation items */}
          <div className="border-t border-border px-3 py-2 space-y-0.5 shrink-0">
            <button className="flex items-center gap-2.5 w-full px-2.5 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors">
              <Library className="h-4 w-4 shrink-0" />
              <span>Library</span>
            </button>
            <button className="flex items-center gap-2.5 w-full px-2.5 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors">
              <NotebookPen className="h-4 w-4 shrink-0" />
              <span>Notebooks</span>
            </button>
            <button className="flex items-center gap-2.5 w-full px-2.5 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors">
              <PlusCircle className="h-4 w-4 shrink-0" />
              <span>Create</span>
            </button>
            <button className="flex items-center gap-2.5 w-full px-2.5 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors">
              <LayoutGrid className="h-4 w-4 shrink-0" />
              <span>Apps</span>
            </button>
          </div>
        </>
      )}
    </aside>
  );
}
