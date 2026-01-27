import { GraduationCap } from 'lucide-react';
import { useTraining } from '@/contexts/TrainingContext';
import { Button } from '@/components/ui/button';

export function Header() {
  const { state, resetAll, resetSelections } = useTraining();

  return (
    <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary">
            <GraduationCap className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-display font-semibold text-lg text-foreground">
              AI Training Platform
            </h1>
            <p className="text-xs text-muted-foreground">For Financial Institutions</p>
          </div>
        </div>

        {state.questionnaireCompleted && (
          <div className="flex items-center gap-2">
            {(state.selectedDepartment || state.currentLesson) && (
              <Button variant="ghost" size="sm" onClick={resetSelections}>
                Select New Topic
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={resetAll}>
              Restart
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}