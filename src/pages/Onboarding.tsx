import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, LineOfBusiness, LearningStyleType } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Progress } from '@/components/ui/progress';
import { ProficiencyAssessment } from '@/components/ProficiencyAssessment';
import { useToast } from '@/hooks/use-toast';
import {
  ArrowRight, ArrowLeft, Brain,
  Lightbulb, CheckCircle, User, Loader2
} from 'lucide-react';

const LOB_OPTIONS: { value: LineOfBusiness; label: string; description: string }[] = [
  {
    value: 'accounting_finance',
    label: 'Accounting & Finance',
    description: 'Financial reporting, reconciliation, and analysis'
  },
  {
    value: 'credit_administration',
    label: 'Credit Administration',
    description: 'Loan processing, credit analysis, and documentation'
  },
  {
    value: 'executive_leadership',
    label: 'Executive & Leadership',
    description: 'Strategic planning and organizational management'
  },
];

const LEARNING_STYLE_QUESTIONS = [
  {
    id: 'general',
    question: 'When learning a new concept, what helps you most?',
    options: [
      { value: 'example-based' as LearningStyleType, label: 'See examples first', description: 'Show me what good looks like' },
      { value: 'explanation-based' as LearningStyleType, label: 'Read explanations', description: 'Walk me through the concepts' },
      { value: 'hands-on' as LearningStyleType, label: 'Try it myself', description: 'Let me experiment and learn by doing' },
      { value: 'logic-based' as LearningStyleType, label: 'Understand the logic', description: 'Explain why it works this way' },
    ],
  },
  {
    id: 'tech',
    question: 'When learning new technology, how do you prefer to start?',
    options: [
      { value: 'example-based' as LearningStyleType, label: 'Watch demos', description: 'See the tool in action' },
      { value: 'explanation-based' as LearningStyleType, label: 'Read documentation', description: 'Understand the features first' },
      { value: 'hands-on' as LearningStyleType, label: 'Jump in and explore', description: 'Click around and figure it out' },
      { value: 'logic-based' as LearningStyleType, label: 'Learn the architecture', description: 'Understand how it works under the hood' },
    ],
  },
];

export default function Onboarding() {
  const navigate = useNavigate();
  const { user, profile, updateProfile, loading } = useAuth();
  const { toast } = useToast();

  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Profile form state
  const [bankRole, setBankRole] = useState(profile?.bank_role || '');
  const [lineOfBusiness, setLineOfBusiness] = useState<LineOfBusiness | null>(profile?.line_of_business || null);
  const [aiProficiency, setAiProficiency] = useState(profile?.ai_proficiency_level ?? 0);
  const [proficiencyCompleted, setProficiencyCompleted] = useState(false);
  const [learningStyle, setLearningStyle] = useState<LearningStyleType | null>(profile?.learning_style || null);
  const [techLearningStyle, setTechLearningStyle] = useState<LearningStyleType | null>(profile?.tech_learning_style || null);

  // Skip onboarding if already completed
  useEffect(() => {
    if (!loading && profile?.onboarding_completed) {
      navigate('/dashboard');
    }
  }, [profile, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // 4 steps: (1) Role + LOB, (2) AI Proficiency Assessment, (3) Learning Style, (4) Tech Learning Style
  const totalSteps = 4;

  // Progress is based on *completed* steps, not current step.
  // A step counts as complete only when the user has filled it out AND moved past it.
  const completedSteps = (() => {
    let count = 0;
    // Step 1 is complete if role + LOB filled AND user has moved past it
    if (step > 1 && bankRole.trim() && lineOfBusiness) count++;
    // Step 2 is complete if proficiency assessment finished AND user has moved past it
    if (step > 2 && proficiencyCompleted) count++;
    // Step 3 is complete if learning style selected AND user has moved past it
    if (step > 3 && learningStyle) count++;
    // Step 4 is complete if tech learning style selected (on final step, count when selected)
    if (step === 4 && techLearningStyle) count++;
    return count;
  })();
  const progressPercent = (completedSteps / totalSteps) * 100;

  const handleNext = () => {
    if (step === 1 && (!lineOfBusiness || !bankRole.trim())) {
      toast({ title: 'Required', description: 'Please complete all fields', variant: 'destructive' });
      return;
    }
    // Step 2 (proficiency) is handled by the ProficiencyAssessment component's onComplete
    if (step === 2 && !proficiencyCompleted) {
      toast({ title: 'Required', description: 'Please complete the AI proficiency assessment', variant: 'destructive' });
      return;
    }
    if (step === 3 && !learningStyle) {
      toast({ title: 'Required', description: 'Please select a learning style', variant: 'destructive' });
      return;
    }
    if (step === 4 && !techLearningStyle) {
      toast({ title: 'Required', description: 'Please select a tech learning style', variant: 'destructive' });
      return;
    }

    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleProficiencyComplete = (score: number) => {
    setAiProficiency(score);
    setProficiencyCompleted(true);
    // Auto-advance to next step
    setStep(3);
  };

  const handleComplete = async () => {
    setIsSubmitting(true);

    const { error } = await updateProfile({
      line_of_business: lineOfBusiness,
      bank_role: bankRole,
      ai_proficiency_level: aiProficiency,
      learning_style: learningStyle,
      tech_learning_style: techLearningStyle,
      onboarding_completed: true,
    });

    setIsSubmitting(false);

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Profile Complete!', description: 'Let\'s start your training journey.' });
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Progress Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-medium text-muted-foreground">
              Step {step} of {totalSteps}
            </h2>
            <span className="text-sm text-muted-foreground">
              {Math.round(progressPercent)}% Complete
            </span>
          </div>
          <Progress value={progressPercent} className="h-2" />
        </div>

        <Card className="shadow-lg">
          {/* Step 1: Profile & LOB */}
          {step === 1 && (
            <>
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle>Your Role</CardTitle>
                </div>
                <CardDescription>
                  Tell us about your position at the bank so we can tailor your training.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="bank-role">Job Title / Role</Label>
                  <Input
                    id="bank-role"
                    placeholder="e.g., Senior Credit Analyst, VP of Finance"
                    value={bankRole}
                    onChange={(e) => setBankRole(e.target.value)}
                  />
                </div>

                <div className="space-y-3">
                  <Label>Line of Business</Label>
                  <RadioGroup
                    value={lineOfBusiness || ''}
                    onValueChange={(v) => setLineOfBusiness(v as LineOfBusiness)}
                  >
                    {LOB_OPTIONS.map((option) => (
                      <div
                        key={option.value}
                        className={`relative flex items-start p-4 rounded-lg border cursor-pointer transition-all ${
                          lineOfBusiness === option.value
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-muted-foreground/50'
                        }`}
                        onClick={() => setLineOfBusiness(option.value)}
                      >
                        <RadioGroupItem value={option.value} id={option.value} className="mt-1" />
                        <div className="ml-3">
                          <Label htmlFor={option.value} className="font-medium cursor-pointer">
                            {option.label}
                          </Label>
                          <p className="text-sm text-muted-foreground">{option.description}</p>
                        </div>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              </CardContent>
            </>
          )}

          {/* Step 2: AI Proficiency Assessment (self-contained component) */}
          {step === 2 && (
            <>
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-accent/10">
                    <Brain className="h-5 w-5 text-accent" />
                  </div>
                  <CardTitle>AI Experience Assessment</CardTitle>
                </div>
                <CardDescription>
                  These questions help Andrea understand where you are today — pick whichever answer honestly matches your current habits. There are no right or wrong answers.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ProficiencyAssessment onComplete={handleProficiencyComplete} />
              </CardContent>
            </>
          )}

          {/* Step 3: General Learning Style */}
          {step === 3 && (
            <>
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-accent/10">
                    <Lightbulb className="h-5 w-5 text-accent" />
                  </div>
                  <CardTitle>Learning Preference</CardTitle>
                </div>
                <CardDescription>
                  {LEARNING_STYLE_QUESTIONS[0].question}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={learningStyle || ''}
                  onValueChange={(v) => setLearningStyle(v as LearningStyleType)}
                  className="space-y-3"
                >
                  {LEARNING_STYLE_QUESTIONS[0].options.map((option) => (
                    <div
                      key={option.value}
                      className={`relative flex items-start p-4 rounded-lg border cursor-pointer transition-all ${
                        learningStyle === option.value
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-muted-foreground/50'
                      }`}
                      onClick={() => setLearningStyle(option.value)}
                    >
                      <RadioGroupItem value={option.value} id={`general-${option.value}`} className="mt-1" />
                      <div className="ml-3">
                        <Label htmlFor={`general-${option.value}`} className="font-medium cursor-pointer">
                          {option.label}
                        </Label>
                        <p className="text-sm text-muted-foreground">{option.description}</p>
                      </div>
                    </div>
                  ))}
                </RadioGroup>
              </CardContent>
            </>
          )}

          {/* Step 4: Tech Learning Style */}
          {step === 4 && (
            <>
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-accent/10">
                    <Brain className="h-5 w-5 text-accent" />
                  </div>
                  <CardTitle>Technology Learning Style</CardTitle>
                </div>
                <CardDescription>
                  {LEARNING_STYLE_QUESTIONS[1].question}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={techLearningStyle || ''}
                  onValueChange={(v) => setTechLearningStyle(v as LearningStyleType)}
                  className="space-y-3"
                >
                  {LEARNING_STYLE_QUESTIONS[1].options.map((option) => (
                    <div
                      key={option.value}
                      className={`relative flex items-start p-4 rounded-lg border cursor-pointer transition-all ${
                        techLearningStyle === option.value
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-muted-foreground/50'
                      }`}
                      onClick={() => setTechLearningStyle(option.value)}
                    >
                      <RadioGroupItem value={option.value} id={`tech-${option.value}`} className="mt-1" />
                      <div className="ml-3">
                        <Label htmlFor={`tech-${option.value}`} className="font-medium cursor-pointer">
                          {option.label}
                        </Label>
                        <p className="text-sm text-muted-foreground">{option.description}</p>
                      </div>
                    </div>
                  ))}
                </RadioGroup>
              </CardContent>
            </>
          )}

          {/* Navigation — hidden on Step 2 (proficiency assessment has its own nav) */}
          {step !== 2 && (
            <div className="flex items-center justify-between p-6 pt-0">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={step === 1}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>

              <Button onClick={handleNext} disabled={isSubmitting} className="gap-2">
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : step === totalSteps ? (
                  <>
                    Complete Setup
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
          )}
        </Card>
      </div>
    </div>
  );
}
