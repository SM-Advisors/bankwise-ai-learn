import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTraining } from '@/contexts/TrainingContext';
import { questions, QuestionOption } from '@/data/questionnaire';
import { QuestionCard } from '@/components/QuestionCard';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, CheckCircle, Info } from 'lucide-react';

export default function Questionnaire() {
  const navigate = useNavigate();
  const { submitAnswer, completeQuestionnaire, state } = useTraining();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const currentQuestion = questions[currentQuestionIndex];
  const currentAnswer = state.answers.find((a) => a.questionId === currentQuestion.id);
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  const isFirstQuestion = currentQuestionIndex === 0;
  const allAnswered = state.answers.length === questions.length;

  const handleSelectAnswer = (option: QuestionOption) => {
    submitAnswer({
      questionId: currentQuestion.id,
      answerId: option.id,
      stylePoints: option.stylePoints,
    });
  };

  const handleNext = () => {
    if (isLastQuestion) {
      completeQuestionnaire();
      navigate('/topics');
    } else {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (!isFirstQuestion) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/dashboard')}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>

        <div className="bg-card rounded-2xl border shadow-sm p-6 md:p-8">
          <div className="mb-6">
            <h1 className="font-display text-2xl font-bold text-foreground mb-2">
              AI Training Interaction Preference Intake
            </h1>
            <p className="text-muted-foreground">
              This intake adjusts how you practice AI-enabled work tasks. It does not assess ability or assign a fixed learning style.
            </p>
          </div>

          {/* Info Banner */}
          <div className="mb-6 p-4 bg-secondary rounded-lg flex items-start gap-3">
            <Info className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
            <p className="text-sm text-muted-foreground">
              Everyone is trained to the same behaviors, standards, and compliance expectations. Your answers only change how training is delivered, not what is taught.
            </p>
          </div>

          <QuestionCard
            question={currentQuestion}
            questionNumber={currentQuestionIndex + 1}
            totalQuestions={questions.length}
            selectedAnswer={currentAnswer?.answerId || null}
            onSelectAnswer={handleSelectAnswer}
          />

          <div className="flex items-center justify-between mt-8 pt-6 border-t">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={isFirstQuestion}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Previous
            </Button>

            <Button
              onClick={handleNext}
              disabled={!currentAnswer}
              className="gap-2"
            >
              {isLastQuestion ? (
                <>
                  Complete
                  <CheckCircle className="h-4 w-4" />
                </>
              ) : (
                <>
                  Next
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </div>

        {allAnswered && !isLastQuestion && (
          <div className="mt-4 text-center">
            <Button variant="link" onClick={() => setCurrentQuestionIndex(questions.length - 1)}>
              Skip to finish →
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}