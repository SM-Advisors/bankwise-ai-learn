import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTraining, LessonPlan } from '@/contexts/TrainingContext';
import { departments } from '@/data/topics';
import { LessonPlanDisplay } from '@/components/LessonPlanDisplay';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { LearningStyleBadge } from '@/components/LearningStyleBadge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, RefreshCw, BookOpen } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export default function Lesson() {
  const navigate = useNavigate();
  const { state, setLesson, setIsGeneratingLesson } = useTraining();
  const [error, setError] = useState<string | null>(null);

  const selectedDepartment = departments.find((d) => d.id === state.selectedDepartment);
  const selectedTopic = selectedDepartment?.topics.find((t) => t.id === state.selectedTopic);

  useEffect(() => {
    if (!state.questionnaireCompleted || !state.learningStyle) {
      navigate('/questionnaire');
      return;
    }

    if (!state.selectedDepartment || !state.selectedTopic) {
      navigate('/topics');
      return;
    }

    if (!state.currentLesson && !state.isGeneratingLesson) {
      generateLesson();
    }
  }, [state.questionnaireCompleted, state.learningStyle, state.selectedDepartment, state.selectedTopic]);

  const generateLesson = async () => {
    if (!selectedDepartment || !selectedTopic || !state.learningStyle) return;

    setIsGeneratingLesson(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('generate-lesson', {
        body: {
          department: selectedDepartment.name,
          topic: selectedTopic.title,
          topicDescription: selectedTopic.description,
          learningStyle: state.learningStyle,
        },
      });

      if (fnError) {
        throw new Error(fnError.message || 'Failed to generate lesson');
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      if (data?.lesson) {
        setLesson(data.lesson as LessonPlan);
      } else {
        throw new Error('No lesson data received');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to generate lesson';
      setError(message);
      toast.error(message);
    } finally {
      setIsGeneratingLesson(false);
    }
  };

  const handleRegenerate = () => {
    setLesson(null);
    generateLesson();
  };

  if (!state.learningStyle) return null;

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => navigate('/topics')}
              className="text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <LearningStyleBadge style={state.learningStyle} />
          </div>

          {state.currentLesson && (
            <Button variant="outline" onClick={handleRegenerate} className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Regenerate Lesson
            </Button>
          )}
        </div>

        {/* Loading State */}
        {state.isGeneratingLesson && (
          <div className="flex flex-col items-center justify-center py-24 animate-fade-in">
            <div className="relative">
              <div className="p-6 rounded-full bg-accent/10 mb-6">
                <BookOpen className="h-12 w-12 text-accent animate-pulse" />
              </div>
              <LoadingSpinner size="lg" className="absolute -bottom-2 left-1/2 -translate-x-1/2" />
            </div>
            <h2 className="font-display text-2xl font-semibold text-foreground mb-2 mt-4">
              Creating Your Personalized Lesson
            </h2>
            <p className="text-muted-foreground text-center max-w-md">
              Generating a {state.learningStyle === 'visual' ? 'visual' : state.learningStyle === 'procedural' ? 'step-by-step' : 'conceptual'} lesson
              on "{selectedTopic?.title}" tailored to your learning style...
            </p>
          </div>
        )}

        {/* Error State */}
        {error && !state.isGeneratingLesson && (
          <div className="flex flex-col items-center justify-center py-24 animate-fade-in">
            <div className="p-6 rounded-full bg-destructive/10 mb-6">
              <BookOpen className="h-12 w-12 text-destructive" />
            </div>
            <h2 className="font-display text-2xl font-semibold text-foreground mb-2">
              Unable to Generate Lesson
            </h2>
            <p className="text-muted-foreground text-center max-w-md mb-6">{error}</p>
            <Button onClick={handleRegenerate} className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Try Again
            </Button>
          </div>
        )}

        {/* Lesson Display */}
        {state.currentLesson && !state.isGeneratingLesson && (
          <LessonPlanDisplay lesson={state.currentLesson} learningStyle={state.learningStyle} />
        )}
      </div>
    </div>
  );
}