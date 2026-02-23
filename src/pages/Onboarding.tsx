import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, LearningStyleType } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ProficiencyAssessment } from '@/components/ProficiencyAssessment';
import { InterestPicker } from '@/components/onboarding/InterestPicker';
import { useToast } from '@/hooks/use-toast';
import { useDepartments } from '@/hooks/useDepartments';
import { MAX_INTERESTS } from '@/data/interests';
import {
  ArrowRight, ArrowLeft, Brain,
  Lightbulb, CheckCircle, User, Loader2, Heart
} from 'lucide-react';

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

// Quick-select job status chips for F&F users
const FF_JOB_CHIPS = ['Retired', 'Student', 'Between Jobs', 'Other'];

export default function Onboarding() {
  const navigate = useNavigate();
  const { user, profile, updateProfile, loading } = useAuth();
  const { toast } = useToast();
  const { departments: deptOptions, loading: deptsLoading } = useDepartments();

  // Detect org type from sessionStorage (set during signup) or fall back to 'bank'
  const [orgType] = useState<string>(() => {
    return sessionStorage.getItem('signup_org_type') || 'bank';
  });
  const isFriendsFamily = orgType === 'friends_family';

  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Banker profile state
  const [bankRole, setBankRole] = useState(profile?.bank_role || '');
  const [lineOfBusiness, setLineOfBusiness] = useState<string | null>(profile?.line_of_business || null);

  // F&F profile state
  const [jobTitle, setJobTitle] = useState(profile?.bank_role || '');
  const [interests, setInterests] = useState<string[]>(profile?.interests || []);

  // Shared state
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

  // ── Step counts ───────────────────────────────────────────────────────────
  // Banker: 4 steps (Role+LOB, Proficiency, Learning Style, Tech Style)
  // F&F:    5 steps (Job Title, Interests, Proficiency, Learning Style, Tech Style)
  const totalSteps = isFriendsFamily ? 5 : 4;

  // Map logical step to labels for progress bar
  const completedSteps = (() => {
    let count = 0;
    if (isFriendsFamily) {
      if (step > 1 && jobTitle.trim()) count++;
      if (step > 2 && interests.length === MAX_INTERESTS) count++;
      if (step > 3 && proficiencyCompleted) count++;
      if (step > 4 && learningStyle) count++;
      if (step === 5 && techLearningStyle) count++;
    } else {
      if (step > 1 && bankRole.trim() && lineOfBusiness) count++;
      if (step > 2 && proficiencyCompleted) count++;
      if (step > 3 && learningStyle) count++;
      if (step === 4 && techLearningStyle) count++;
    }
    return count;
  })();
  const progressPercent = (completedSteps / totalSteps) * 100;

  // Map logical step number to shared step purpose
  // Banker:  1=Role+LOB, 2=Proficiency, 3=LearnStyle, 4=TechStyle
  // F&F:     1=JobTitle, 2=Interests, 3=Proficiency, 4=LearnStyle, 5=TechStyle
  const proficiencyStep = isFriendsFamily ? 3 : 2;
  const learnStyleStep = isFriendsFamily ? 4 : 3;
  const techStyleStep = isFriendsFamily ? 5 : 4;

  const handleNext = () => {
    if (step === 1) {
      if (isFriendsFamily && !jobTitle.trim()) {
        toast({ title: 'Required', description: 'Please enter your job title or status', variant: 'destructive' });
        return;
      }
      if (!isFriendsFamily && (!lineOfBusiness || !bankRole.trim())) {
        toast({ title: 'Required', description: 'Please complete all fields', variant: 'destructive' });
        return;
      }
    }
    if (step === 2 && isFriendsFamily && interests.length < MAX_INTERESTS) {
      toast({ title: 'Required', description: `Please select ${MAX_INTERESTS} interests`, variant: 'destructive' });
      return;
    }
    if (step === proficiencyStep && !proficiencyCompleted) {
      toast({ title: 'Required', description: 'Please complete the AI proficiency assessment', variant: 'destructive' });
      return;
    }
    if (step === learnStyleStep && !learningStyle) {
      toast({ title: 'Required', description: 'Please select a learning style', variant: 'destructive' });
      return;
    }
    if (step === techStyleStep && !techLearningStyle) {
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
    if (step > 1) setStep(step - 1);
  };

  const handleProficiencyComplete = (score: number) => {
    setAiProficiency(score);
    setProficiencyCompleted(true);
    setStep(learnStyleStep);
  };

  const handleComplete = async () => {
    setIsSubmitting(true);

    const updates: any = {
      ai_proficiency_level: aiProficiency,
      learning_style: learningStyle,
      tech_learning_style: techLearningStyle,
      onboarding_completed: true,
    };

    if (isFriendsFamily) {
      updates.bank_role = jobTitle;  // reuse bank_role column for job title/status
      updates.interests = interests;
    } else {
      updates.line_of_business = lineOfBusiness;
      updates.bank_role = bankRole;
    }

    const { error } = await updateProfile(updates);
    setIsSubmitting(false);

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      // Clear org_type from session storage
      sessionStorage.removeItem('signup_org_type');
      toast({ title: 'Profile Complete!', description: 'Let\'s start your training journey.' });
      navigate('/dashboard');
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
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
          {/* ── F&F Step 1: Job Title ──────────────────────────────────────── */}
          {isFriendsFamily && step === 1 && (
            <>
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Heart className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle>Welcome, Friend!</CardTitle>
                </div>
                <CardDescription>
                  You're joining as a Friends & Family tester. Just tell us a little about yourself.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="job-title">What do you do?</Label>
                  <Input
                    id="job-title"
                    placeholder="e.g., Software Engineer, Teacher, Marketing Manager"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  {FF_JOB_CHIPS.map((chip) => (
                    <button
                      key={chip}
                      type="button"
                      onClick={() => setJobTitle(chip)}
                      className={`px-3 py-1.5 rounded-full text-sm border transition-all ${
                        jobTitle === chip
                          ? 'border-primary bg-primary/10 text-primary font-medium'
                          : 'border-border hover:border-primary/50 text-muted-foreground'
                      }`}
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              </CardContent>
            </>
          )}

          {/* ── F&F Step 2: Interest Picker ───────────────────────────────── */}
          {isFriendsFamily && step === 2 && (
            <>
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Heart className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle>What do you enjoy?</CardTitle>
                </div>
                <CardDescription>
                  Pick 3 things you love — Andrea will use them to make your learning experience feel personal and relevant.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <InterestPicker selected={interests} onChange={setInterests} />
              </CardContent>
            </>
          )}

          {/* ── Banker Step 1: Role + LOB ─────────────────────────────────── */}
          {!isFriendsFamily && step === 1 && (
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
                  <Label>Department</Label>
                  {deptsLoading ? (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground py-4">
                      <Loader2 className="h-4 w-4 animate-spin" /> Loading departments...
                    </div>
                  ) : (
                    <ScrollArea className="h-[320px] pr-3">
                      <RadioGroup
                        value={lineOfBusiness || ''}
                        onValueChange={(v) => setLineOfBusiness(v)}
                      >
                        {deptOptions.map((dept) => (
                          <div
                            key={dept.slug}
                            className={`relative flex items-start p-3 rounded-lg border cursor-pointer transition-all mb-2 ${
                              lineOfBusiness === dept.slug
                                ? 'border-primary bg-primary/5'
                                : 'border-border hover:border-muted-foreground/50'
                            }`}
                            onClick={() => setLineOfBusiness(dept.slug)}
                          >
                            <RadioGroupItem value={dept.slug} id={dept.slug} className="mt-1" />
                            <div className="ml-3">
                              <Label htmlFor={dept.slug} className="font-medium cursor-pointer">
                                {dept.name}
                              </Label>
                              {dept.description && (
                                <p className="text-sm text-muted-foreground">{dept.description}</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </RadioGroup>
                    </ScrollArea>
                  )}
                </div>
              </CardContent>
            </>
          )}

          {/* ── Shared: AI Proficiency Assessment ────────────────────────── */}
          {step === proficiencyStep && (
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

          {/* ── Shared: General Learning Style ───────────────────────────── */}
          {step === learnStyleStep && (
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

          {/* ── Shared: Tech Learning Style ───────────────────────────────── */}
          {step === techStyleStep && (
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

          {/* Navigation — hidden on the proficiency step (it has its own nav) */}
          {step !== proficiencyStep && (
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
