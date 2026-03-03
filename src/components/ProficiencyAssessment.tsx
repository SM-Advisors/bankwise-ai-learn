import { useState } from 'react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ArrowRight, ArrowLeft, CheckCircle } from 'lucide-react';
import {
  PROFICIENCY_QUESTIONS,
  CONFIDENCE_LEVELS,
  calculateProficiencyScore,
} from '@/data/proficiencyAssessment';

const PROFICIENCY_LABELS: Record<number, { label: string; description: string }> = {
  0: { label: 'True Beginner', description: 'We\'ll start from the very basics' },
  1: { label: 'Novice', description: 'We\'ll build your foundation step by step' },
  2: { label: 'Basic', description: 'We\'ll strengthen your fundamentals' },
  3: { label: 'Developing', description: 'We\'ll expand your capabilities' },
  4: { label: 'Comfortable', description: 'We\'ll add depth to your skills' },
  5: { label: 'Competent', description: 'We\'ll refine your techniques' },
  6: { label: 'Proficient', description: 'We\'ll push into advanced territory' },
  7: { label: 'Advanced', description: 'We\'ll focus on mastery and edge cases' },
  8: { label: 'Expert', description: 'We\'ll challenge you with expert-level material' },
};

interface ProficiencyAssessmentProps {
  onComplete: (score: number) => void;
}

// ─── MAIN ASSESSMENT COMPONENT ───────────────────────────────────────────
export function ProficiencyAssessment({ onComplete }: ProficiencyAssessmentProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [confidence, setConfidence] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);

  // Steps: 4 self-report questions + 1 confidence = 5
  const selfReportCount = PROFICIENCY_QUESTIONS.length;
  const totalSteps = selfReportCount + 1; // +1 for confidence

  const isSelfReport = currentStep < selfReportCount;
  const isConfidence = currentStep === selfReportCount;

  const currentQ = isSelfReport ? PROFICIENCY_QUESTIONS[currentStep] : null;

  const progressPercent = ((currentStep + (showResult ? 1 : 0)) / totalSteps) * 100;

  const handleSelectAnswer = (questionId: string, score: number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: score }));
  };

  const canProceed = () => {
    if (isSelfReport && currentQ) return answers[currentQ.id] !== undefined;
    if (isConfidence) return confidence !== null;
    return false;
  };

  const handleNext = () => {
    if (!canProceed()) return;
    if (isConfidence) {
      setShowResult(true);
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (showResult) {
      setShowResult(false);
      return;
    }
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  // Compute final score (self-report only, no performance items)
  const finalScore = calculateProficiencyScore(answers, confidence ?? 3);
  const resultInfo = PROFICIENCY_LABELS[finalScore] || PROFICIENCY_LABELS[4];

  // ─── RESULT SCREEN ───────────────────────────────────────────────────
  if (showResult) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 rounded-full bg-green-500/10 flex items-center justify-center mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h3 className="text-xl font-semibold mb-1">Assessment Complete</h3>
          <p className="text-muted-foreground">
            Based on your responses, here's your AI proficiency level:
          </p>
        </div>

        <div className="text-center p-6 rounded-lg border bg-primary/5">
          <div className="text-5xl font-bold text-primary mb-2">{finalScore}</div>
          <div className="text-lg font-semibold">{resultInfo.label}</div>
          <p className="text-sm text-muted-foreground mt-1">{resultInfo.description}</p>
        </div>

        <div className="space-y-2">
          <p className="text-sm text-muted-foreground text-center">
            Andrea will tailor her coaching to match your level. You can always update this later in Settings.
          </p>
        </div>

        <div className="flex justify-between">
          <Button variant="outline" onClick={handleBack} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Review Answers
          </Button>
          <Button onClick={() => onComplete(finalScore)} className="gap-2">
            Continue
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  // ─── CONFIDENCE STEP ─────────────────────────────────────────────────
  if (isConfidence) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
          <span>Step {currentStep + 1} of {totalSteps}</span>
          <span>{Math.round(progressPercent)}%</span>
        </div>
        <Progress value={progressPercent} className="h-1.5" />

        <div>
          <Badge variant="secondary" className="mb-3">Self-Assessment</Badge>
          <h3 className="text-lg font-semibold mb-2">
            How confident are you in your ability to use AI effectively in your daily banking work?
          </h3>
          <p className="text-sm text-muted-foreground">
            Be honest — this helps us calibrate your training, not evaluate you.
          </p>
        </div>

        <RadioGroup
          value={confidence?.toString() || ''}
          onValueChange={(v) => setConfidence(parseInt(v))}
          className="space-y-3"
        >
          {CONFIDENCE_LEVELS.map((level) => (
            <div
              key={level.value}
              className={`relative flex items-start p-4 rounded-lg border cursor-pointer transition-all ${
                confidence === level.value
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-muted-foreground/50'
              }`}
              onClick={() => setConfidence(level.value)}
            >
              <RadioGroupItem value={level.value.toString()} id={`conf-${level.value}`} className="mt-1" />
              <div className="ml-3">
                <Label htmlFor={`conf-${level.value}`} className="font-medium cursor-pointer">
                  {level.label}
                </Label>
                <p className="text-sm text-muted-foreground">{level.description}</p>
              </div>
            </div>
          ))}
        </RadioGroup>

        <div className="flex justify-between">
          <Button variant="outline" onClick={handleBack} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <Button onClick={handleNext} disabled={confidence === null} className="gap-2">
            See Results
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  // ─── SELF-REPORT QUESTION STEP ───────────────────────────────────────
  if (!currentQ) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
        <span>Step {currentStep + 1} of {totalSteps}</span>
        <span>{Math.round(progressPercent)}%</span>
      </div>
      <Progress value={progressPercent} className="h-1.5" />

      <div>
        <Badge variant="secondary" className="mb-3">{currentQ.dimension}</Badge>
        <h3 className="text-lg font-semibold">{currentQ.scenario}</h3>
      </div>

      <RadioGroup
        value={answers[currentQ.id]?.toString() || ''}
        onValueChange={(v) => handleSelectAnswer(currentQ.id, parseInt(v))}
        className="space-y-3"
      >
        {currentQ.options.map((option, idx) => (
          <div
            key={idx}
            className={`relative flex items-start p-4 rounded-lg border cursor-pointer transition-all ${
              answers[currentQ.id] === option.score
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-muted-foreground/50'
            }`}
            onClick={() => handleSelectAnswer(currentQ.id, option.score)}
          >
            <RadioGroupItem value={option.score.toString()} id={`${currentQ.id}-${idx}`} className="mt-1" />
            <div className="ml-3">
              <Label htmlFor={`${currentQ.id}-${idx}`} className="font-medium cursor-pointer">
                {option.label}
              </Label>
              <p className="text-sm text-muted-foreground">{option.description}</p>
            </div>
          </div>
        ))}
      </RadioGroup>

      <div className="flex justify-between">
        <Button variant="outline" onClick={handleBack} disabled={currentStep === 0} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <Button onClick={handleNext} disabled={answers[currentQ.id] === undefined} className="gap-2">
          Next
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
