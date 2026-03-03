import { Question, QuestionOption } from '@/data/questionnaire';
import { cn } from '@/lib/utils';

interface QuestionCardProps {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
  selectedAnswer: string | null;
  onSelectAnswer: (option: QuestionOption) => void;
}

export function QuestionCard({
  question,
  questionNumber,
  totalQuestions,
  selectedAnswer,
  onSelectAnswer,
}: QuestionCardProps) {
  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-muted-foreground">
            Question {questionNumber} of {totalQuestions}
          </span>
          <div className="flex gap-1">
            {Array.from({ length: totalQuestions }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  'h-1.5 w-8 rounded-full transition-colors',
                  i < questionNumber ? 'bg-accent' : 'bg-border'
                )}
              />
            ))}
          </div>
        </div>
        <h2 className="text-xl font-semibold text-foreground">{question.text}</h2>
      </div>

      <div className="space-y-3">
        {question.options.map((option) => (
          <button
            key={option.id}
            onClick={() => onSelectAnswer(option)}
            className={cn(
              'w-full text-left p-4 rounded-lg border-2 transition-all duration-200',
              'hover:border-accent hover:bg-accent/5',
              selectedAnswer === option.id
                ? 'border-accent bg-accent/10 shadow-sm'
                : 'border-border bg-card'
            )}
          >
            <div className="flex items-start gap-3">
              <div
                className={cn(
                  'mt-0.5 h-5 w-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors',
                  selectedAnswer === option.id
                    ? 'border-accent bg-accent'
                    : 'border-muted-foreground/30'
                )}
              >
                {selectedAnswer === option.id && (
                  <div className="h-2 w-2 rounded-full bg-accent-foreground" />
                )}
              </div>
              <span className="text-foreground">{option.text}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}