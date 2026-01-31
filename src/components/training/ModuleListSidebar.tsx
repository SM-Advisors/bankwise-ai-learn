import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChevronLeft, ChevronRight, Clock, FileText, Lightbulb, Play, BookOpen, CheckCircle } from 'lucide-react';
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

const getTypeBadgeClass = (type: ModuleContent['type']) => {
  switch (type) {
    case 'document': return 'bg-accent text-accent-foreground hover:bg-accent/80 cursor-pointer';
    case 'example': return 'bg-highlight/20 text-highlight-foreground hover:bg-highlight/30 cursor-pointer';
    case 'exercise': return 'bg-primary/10 text-primary hover:bg-primary/20 cursor-pointer';
    case 'video': return 'bg-secondary text-secondary-foreground hover:bg-secondary/80 cursor-pointer';
    default: return 'bg-muted text-muted-foreground hover:bg-muted/80 cursor-pointer';
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
      className={`border-r bg-card transition-all duration-300 flex flex-col ${collapsed ? 'w-12' : 'w-80'}`}
      aria-label="Training modules navigation"
    >
      <div className="p-3 border-b flex items-center justify-between shrink-0">
        {!collapsed && <span className="font-medium text-sm">Training Modules</span>}
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onToggleCollapse}
          className="ml-auto"
          aria-label={collapsed ? 'Expand module list' : 'Collapse module list'}
          aria-expanded={!collapsed}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>
      
      {!collapsed && (
        <ScrollArea className="flex-1">
          <nav className="p-3 space-y-2" aria-label="Module list">
            {modules.map((module, idx) => {
              const IconComponent = getModuleIcon(module.type);
              const isSelected = selectedModule?.id === module.id;
              const isCompleted = completedModules.has(module.id);
              
              return (
                <Card
                  key={module.id}
                  className={`cursor-pointer transition-all ${
                    isSelected ? 'ring-2 ring-primary' : 'hover:bg-muted/50'
                  } ${isCompleted ? 'bg-primary/5' : ''}`}
                  onClick={() => onSelectModule(module)}
                  role="button"
                  tabIndex={0}
                  aria-pressed={isSelected}
                  aria-label={`${isCompleted ? 'Completed: ' : ''}${idx + 1}. ${module.title} - ${module.type}, ${module.estimatedTime}`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onSelectModule(module);
                    }
                  }}
                >
                  <CardContent className="p-3">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg shrink-0 relative ${
                        isCompleted ? 'bg-primary/20 text-primary' :
                        isSelected ? 'bg-primary/10 text-primary' : 'bg-muted'
                      }`}>
                        {isCompleted ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : (
                          <IconComponent className="h-4 w-4" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className={`font-medium text-sm truncate ${isCompleted ? 'text-primary' : ''}`}>
                          {idx + 1}. {module.title}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge 
                            variant="outline" 
                            className={`text-xs transition-colors ${getTypeBadgeClass(module.type)}`}
                            title={`View ${module.type} content`}
                          >
                            {module.type}
                          </Badge>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {module.estimatedTime}
                          </span>
                          {isCompleted && (
                            <span className="text-xs text-primary font-medium">Done</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </nav>
        </ScrollArea>
      )}
    </aside>
  );
}
