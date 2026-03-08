import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTraining } from '@/contexts/TrainingContext';
import { departments } from '@/data/topics';
import { DepartmentCard } from '@/components/DepartmentCard';
import { TopicCard } from '@/components/TopicCard';
import { LearningStyleBadge } from '@/components/LearningStyleBadge';
import { Button } from '@/components/ui/button';
import { ArrowRight, ArrowLeft } from 'lucide-react';

export default function TopicSelection() {
  const navigate = useNavigate();
  const { state, setDepartment, setTopic } = useTraining();
  const [step, setStep] = useState<'department' | 'topic'>('department');

  useEffect(() => {
    if (!state.questionnaireCompleted || !state.learningStyle) {
      navigate('/questionnaire');
    }
  }, [state.questionnaireCompleted, state.learningStyle, navigate]);

  const selectedDepartmentInfo = departments.find((d) => d.id === state.selectedDepartment);

  const handleDepartmentSelect = (deptId: typeof state.selectedDepartment) => {
    if (deptId) {
      setDepartment(deptId);
      setStep('topic');
    }
  };

  const handleTopicSelect = (topicId: string) => {
    setTopic(topicId);
  };

  const handleGenerateLesson = () => {
    if (state.selectedTopic) {
      navigate('/lesson');
    }
  };

  const handleBackToDepartments = () => {
    setStep('department');
    setDepartment(null);
  };

  if (!state.learningStyle) return null;

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header with learning style */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-2">
              {step === 'department' ? 'Select Your Department' : 'Choose a Training Topic'}
            </h1>
            <p className="text-muted-foreground">
              {step === 'department'
                ? 'Pick your area of focus to see relevant AI training topics.'
                : `Training topics for ${selectedDepartmentInfo?.name}`}
            </p>
          </div>
          <LearningStyleBadge style={state.learningStyle} />
        </div>

        {step === 'department' ? (
          /* Department Selection */
          <div className="space-y-4 animate-fade-in">
            {departments.map((dept) => (
              <DepartmentCard
                key={dept.id}
                department={dept}
                isSelected={state.selectedDepartment === dept.id}
                onSelect={() => handleDepartmentSelect(dept.id)}
              />
            ))}
          </div>
        ) : (
          /* Topic Selection */
          <div className="animate-fade-in">
            <Button
              variant="ghost"
              onClick={handleBackToDepartments}
              className="mb-6 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Departments
            </Button>

            <div className="space-y-3">
              {selectedDepartmentInfo?.topics.map((topic) => (
                <TopicCard
                  key={topic.id}
                  topic={topic}
                  isSelected={state.selectedTopic === topic.id}
                  onSelect={() => handleTopicSelect(topic.id)}
                />
              ))}
            </div>

            {state.selectedTopic && (
              <div className="mt-8 flex justify-end animate-scale-in">
                <Button size="lg" onClick={handleGenerateLesson} className="gap-2">
                  Generate Lesson
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}