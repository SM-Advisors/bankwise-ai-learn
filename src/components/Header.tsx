import { useTraining } from '@/contexts/TrainingContext';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/Logo';

export function Header() {
  const { state, resetAll, resetSelections } = useTraining();

  return (
    <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Logo variant="compact" size="md" />
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