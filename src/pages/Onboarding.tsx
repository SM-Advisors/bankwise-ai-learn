import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, LearningStyleType } from '@/contexts/AuthContext';
import { getIndustryConfig, type IndustryConfig } from '@/data/industryConfigs';
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
import { MAX_INTERESTS } from '@/data/interests';
import {
  ROLE_OPTIONS,
  Q3_OPTIONS, Q5_OPTIONS, Q6_OPTIONS,
  Q7_OPTIONS, Q8_OPTIONS,
  Q10_OPTIONS, Q12_OPTIONS,
  type AnswerOption,
} from '@/data/intakeQuestions';
import { scoreIntake, type IntakeAnswers } from '@/utils/intakeScoring';
import { supabase } from '@/integrations/supabase/client';
import {
  ArrowRight, ArrowLeft, Heart, Loader2,
  Briefcase, Brain,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ── F&F quick-select chips ────────────────────────────────────────────────
const FF_JOB_CHIPS = ['Retired', 'Student', 'Between Jobs', 'Other'];

// ── Banker step metadata ──────────────────────────────────────────────────
const BANKER_STEPS = [
  { label: 'Let\'s get to know you', icon: Briefcase, desc: 'Tell us about your role — we\'ll use it to make your training more relevant.' },
  { label: 'Your AI experience',     icon: Brain,     desc: 'A few questions to help us understand how you currently work with AI.' },
];

// ── Reusable single-select option tile ───────────────────────────────────
function OptionTile({
  option, selected, onSelect, showLetter = false,
}: {
  option: AnswerOption;
  selected: boolean;
  onSelect: () => void;
  showLetter?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'w-full text-left flex items-start gap-3 p-3 rounded-lg border-2 transition-all text-sm',
        selected
          ? 'border-primary bg-primary/8 text-foreground'
          : 'border-border hover:border-primary/40 hover:bg-muted/40',
      )}
    >
      <div className={cn(
        'shrink-0 mt-0.5 h-5 w-5 rounded-full border-2 flex items-center justify-center text-xs font-bold',
        selected ? 'border-primary bg-primary text-primary-foreground' : 'border-muted-foreground/40 text-muted-foreground',
      )}>
        {showLetter ? option.key : (selected ? '✓' : '')}
      </div>
      <span className="leading-snug">{option.label}</span>
    </button>
  );
}

// ── Main component ────────────────────────────────────────────────────────

export default function Onboarding() {
  const navigate = useNavigate();
  const { profile, updateProfile, loading } = useAuth();
  const { toast } = useToast();

  // Retake detection: user already completed onboarding before it was reset via profile dropdown
  const [isRetake] = useState<boolean>(() =>
    !!(profile?.intake_role_key || profile?.learning_style || profile?.ai_proficiency_level),
  );

  // Audience type + industry: prefer sessionStorage (set during fresh signup) so there's
  // no flicker. Fall back to a DB lookup for retake flow and other paths.
  const [orgType, setOrgType] = useState<string>(() => sessionStorage.getItem('signup_org_type') || '');
  const [orgIndustry, setOrgIndustry] = useState<string>(() => sessionStorage.getItem('signup_industry') || 'banking');
  const [orgTypeResolved, setOrgTypeResolved] = useState<boolean>(!!sessionStorage.getItem('signup_org_type'));
  const isConsumer = orgType === 'consumer';
  // Keep legacy alias for internal use
  const isFriendsFamily = isConsumer;

  // Derived industry config — drives dynamic copy
  const industryConfig: IndustryConfig = getIndustryConfig(orgIndustry, isConsumer ? 'consumer' : 'enterprise');

  useEffect(() => {
    if (orgTypeResolved) return;
    if (loading) return; // wait for auth to finish loading before checking profile
    if (!profile?.organization_id) {
      // No org attached — default to enterprise flow
      setOrgType('enterprise');
      setOrgTypeResolved(true);
      return;
    }
    // Fetch the org's audience_type + industry from the database
    (supabase
      .from('organizations' as any)
      .select('audience_type, industry')
      .eq('id', profile.organization_id)
      .single() as any)
      .then(({ data }: { data: { audience_type: string; industry: string } | null }) => {
        setOrgType(data?.audience_type || 'enterprise');
        setOrgIndustry(data?.industry || 'banking');
        setOrgTypeResolved(true);
      });
  }, [profile?.organization_id, orgTypeResolved, loading]);

  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ── F&F state ─────────────────────────────────────────────────────────
  const [jobTitle, setJobTitle] = useState(profile?.job_role || '');
  const [interests, setInterests] = useState<string[]>(profile?.interests || []);

  // Shared for F&F
  const [aiProficiency, setAiProficiency] = useState(profile?.ai_proficiency_level ?? 0);
  const [proficiencyCompleted, setProficiencyCompleted] = useState(false);
  const [learningStyle, setLearningStyle] = useState<LearningStyleType | null>(profile?.learning_style || null);
  const [techLearningStyle, setTechLearningStyle] = useState<LearningStyleType | null>(profile?.tech_learning_style || null);

  const FF_LEARNING_STYLE_QUESTIONS = [
    {
      id: 'general',
      question: 'When learning a new concept, what helps you most?',
      options: [
        { value: 'example-based' as LearningStyleType, label: 'See examples first', desc: 'Show me what good looks like' },
        { value: 'explanation-based' as LearningStyleType, label: 'Read explanations', desc: 'Walk me through the concepts' },
        { value: 'hands-on' as LearningStyleType, label: 'Try it myself', desc: 'Let me experiment and learn by doing' },
        { value: 'logic-based' as LearningStyleType, label: 'Understand the logic', desc: 'Explain why it works this way' },
      ],
    },
    {
      id: 'tech',
      question: 'When learning new technology, how do you prefer to start?',
      options: [
        { value: 'example-based' as LearningStyleType, label: 'Watch demos', desc: 'See the tool in action' },
        { value: 'explanation-based' as LearningStyleType, label: 'Read documentation', desc: 'Understand the features first' },
        { value: 'hands-on' as LearningStyleType, label: 'Jump in and explore', desc: 'Click around and figure it out' },
        { value: 'logic-based' as LearningStyleType, label: 'Learn the architecture', desc: 'Understand how it works under the hood' },
      ],
    },
  ];

  // ── Banker intake state (7 retained questions) ─────────────────────────
  const [roleKey, setRoleKey] = useState('');
  const [q3, setQ3] = useState('');
  const [q5, setQ5] = useState('');
  const [q6, setQ6] = useState('');
  const [q7, setQ7] = useState('');
  const [q8, setQ8] = useState('');
  const [q10, setQ10] = useState('');
  const [q12, setQ12] = useState('');

  // Skip onboarding if already completed
  useEffect(() => {
    if (!loading && profile?.onboarding_completed) navigate('/dashboard');
  }, [profile, loading, navigate]);

  // Retake cancel — restore onboarding_completed and return to dashboard
  const handleCancel = async () => {
    await updateProfile({ onboarding_completed: true });
    navigate('/dashboard');
  };

  if (loading || !orgTypeResolved) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // ── Step counts & progress ────────────────────────────────────────────
  // F&F: 5 steps (job title, interests, proficiency, learning, tech learning)
  // Banker: 2 steps (role selection, AI assessment)
  const totalSteps = isFriendsFamily ? 5 : 2;

  // F&F step mapping
  const FF_PROFICIENCY_STEP = 3;
  const FF_LEARN_STEP = 4;
  const FF_TECH_STEP = 5;

  // Progress (based on answered fields, not just step number)
  const progressPercent = ((step - 1) / totalSteps) * 100;

  // ── Validation ────────────────────────────────────────────────────────
  const validateStep = (): boolean => {
    if (isFriendsFamily) {
      if (step === 1 && !jobTitle.trim()) {
        toast({ title: 'Required', description: 'Please enter your job title or status', variant: 'destructive' });
        return false;
      }
      if (step === 2 && interests.length < MAX_INTERESTS) {
        toast({ title: 'Required', description: `Please select ${MAX_INTERESTS} interests`, variant: 'destructive' });
        return false;
      }
      if (step === FF_PROFICIENCY_STEP && !proficiencyCompleted) {
        toast({ title: 'Required', description: 'Please complete the AI proficiency assessment', variant: 'destructive' });
        return false;
      }
      if (step === FF_LEARN_STEP && !learningStyle) {
        toast({ title: 'Required', description: 'Please select a learning style', variant: 'destructive' });
        return false;
      }
      if (step === FF_TECH_STEP && !techLearningStyle) {
        toast({ title: 'Required', description: 'Please select a tech learning style', variant: 'destructive' });
        return false;
      }
    } else {
      if (step === 1 && !roleKey) {
        toast({ title: 'Required', description: 'Please select your role', variant: 'destructive' });
        return false;
      }
      if (step === 2 && (!q3 || !q5 || !q6 || !q7 || !q8 || !q10 || !q12)) {
        toast({ title: 'Required', description: 'Please answer all questions on this page', variant: 'destructive' });
        return false;
      }
    }
    return true;
  };

  // ── Navigation ────────────────────────────────────────────────────────
  const handleNext = () => {
    if (!validateStep()) return;
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

  // F&F proficiency assessment auto-advances
  const handleProficiencyComplete = (score: number) => {
    setAiProficiency(score);
    setProficiencyCompleted(true);
    setStep(FF_LEARN_STEP);
  };

  // ── Complete handlers ─────────────────────────────────────────────────
  const handleComplete = async () => {
    setIsSubmitting(true);

    if (isFriendsFamily) {
      await completeFriendsFamily();
    } else {
      await completeBanker();
    }

    setIsSubmitting(false);
  };

  const completeFriendsFamily = async () => {
    const { error } = await updateProfile({
      job_role: jobTitle,
      interests,
      ai_proficiency_level: aiProficiency,
      learning_style: learningStyle,
      tech_learning_style: techLearningStyle,
      onboarding_completed: true,
    });
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      sessionStorage.removeItem('signup_org_type');
      sessionStorage.removeItem('signup_industry');
      toast({ title: 'You\'re all set!', description: 'Let\'s start your learning journey.' });
      navigate('/dashboard');
    }
  };

  const completeBanker = async () => {
    const answers: IntakeAnswers = {
      q2_role: roleKey,
      q3, q5, q6,
      q7, q8,
      q10, q12,
      // Removed questions — defaults satisfy the TypeScript type; scoring handles empty values gracefully
      q4: '', q9: [],
      sjt1: '', sjt2: '', sjt3: '', sjt4: '', sjt5: '',
      step5_prompt: '',
      q11: [],
    };

    const placement = scoreIntake(answers);

    // Map Q12 → learning style
    const Q12_STYLE_MAP: Record<string, LearningStyleType> = {
      A: 'hands-on', B: 'explanation-based', C: 'example-based', D: 'explanation-based',
    };
    const derivedStyle: LearningStyleType = Q12_STYLE_MAP[q12] || 'example-based';

    // Map Q10 → orientation label
    const Q10_ORIENTATION_MAP: Record<string, string> = {
      A: 'excited', B: 'curious', C: 'anxious', D: 'skeptical', E: 'neutral',
    };
    const orientation = Q10_ORIENTATION_MAP[q10] || 'neutral';

    // Map role → line_of_business
    const selectedRole = ROLE_OPTIONS.find(r => r.key === roleKey);
    const lob = selectedRole?.lobSlug || null;

    const { error } = await updateProfile({
      job_role: selectedRole?.label || roleKey,
      department: lob,
      ai_proficiency_level: placement.level,
      learning_style: derivedStyle,
      tech_learning_style: derivedStyle,
      intake_responses: answers as unknown as Record<string, unknown>,
      safe_use_flag: placement.safe_use_flag,
      intake_role_key: roleKey,
      intake_orientation: orientation,
      onboarding_completed: true,
    });

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      sessionStorage.removeItem('signup_org_type');
      sessionStorage.removeItem('signup_industry');
      toast({ title: 'Profile Complete!', description: 'Let\'s start your training journey.' });
      navigate('/dashboard');
    }
  };

  const isLastStep = step === totalSteps;
  // Hide default nav on F&F proficiency step (it has its own nav)
  const hideNav = isFriendsFamily && step === FF_PROFICIENCY_STEP;

  // Current step metadata (banker only)
  const bankerMeta = !isFriendsFamily ? BANKER_STEPS[step - 1] : null;
  const BankerIcon = bankerMeta?.icon;

  // ── Render ────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-2xl mx-auto">

        {/* Progress bar — no step count label (spec requirement) */}
        <div className="mb-6">
          <Progress value={progressPercent} className="h-1.5" />
        </div>

        <Card className="shadow-lg">

          {/* ── F&F Step 1: Job Title ────────────────────────────────── */}
          {isFriendsFamily && step === 1 && (
            <>
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Heart className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle>Welcome!</CardTitle>
                </div>
                <CardDescription>
                  {industryConfig.welcomeMessage || 'Just tell us a little about yourself to get started.'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="job-title">{industryConfig.jobRoleLabel}</Label>
                  <Input
                    id="job-title"
                    placeholder="e.g., Software Engineer, Teacher, Marketing Manager"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  {FF_JOB_CHIPS.map(chip => (
                    <button
                      key={chip} type="button"
                      onClick={() => setJobTitle(chip)}
                      className={cn(
                        'px-3 py-1.5 rounded-full text-sm border transition-all',
                        jobTitle === chip
                          ? 'border-primary bg-primary/10 text-primary font-medium'
                          : 'border-border hover:border-primary/50 text-muted-foreground',
                      )}
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              </CardContent>
            </>
          )}

          {/* ── F&F Step 2: Interest Picker ──────────────────────────── */}
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
                  Pick 3 things you love — Andrea will use them to make your learning feel personal and relevant.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <InterestPicker selected={interests} onChange={setInterests} />
              </CardContent>
            </>
          )}

          {/* ── F&F Step 3: AI Proficiency ───────────────────────────── */}
          {isFriendsFamily && step === FF_PROFICIENCY_STEP && (
            <>
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-accent/10">
                    <Brain className="h-5 w-5 text-accent" />
                  </div>
                  <CardTitle>AI Experience Check</CardTitle>
                </div>
                <CardDescription>
                  No right or wrong answers — this helps Andrea calibrate to where you are today.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ProficiencyAssessment onComplete={handleProficiencyComplete} />
              </CardContent>
            </>
          )}

          {/* ── F&F Steps 4-5: Learning Styles ───────────────────────── */}
          {isFriendsFamily && (step === FF_LEARN_STEP || step === FF_TECH_STEP) && (() => {
            const qIdx = step === FF_LEARN_STEP ? 0 : 1;
            const q = FF_LEARNING_STYLE_QUESTIONS[qIdx];
            const current = step === FF_LEARN_STEP ? learningStyle : techLearningStyle;
            const setCurrent = step === FF_LEARN_STEP ? setLearningStyle : setTechLearningStyle;
            return (
              <>
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-lg bg-accent/10">
                      <Brain className="h-5 w-5 text-accent" />
                    </div>
                    <CardTitle>{step === FF_LEARN_STEP ? 'Learning Preference' : 'Technology Learning Style'}</CardTitle>
                  </div>
                  <CardDescription>{q.question}</CardDescription>
                </CardHeader>
                <CardContent>
                  <RadioGroup value={current || ''} onValueChange={(v) => setCurrent(v as LearningStyleType)} className="space-y-2">
                    {q.options.map(opt => (
                      <div
                        key={opt.value}
                        className={cn('relative flex items-start p-4 rounded-lg border cursor-pointer transition-all', current === opt.value ? 'border-primary bg-primary/5' : 'border-border hover:border-muted-foreground/50')}
                        onClick={() => setCurrent(opt.value)}
                      >
                        <RadioGroupItem value={opt.value} id={`ls-${opt.value}`} className="mt-1" />
                        <div className="ml-3">
                          <Label htmlFor={`ls-${opt.value}`} className="font-medium cursor-pointer">{opt.label}</Label>
                          <p className="text-sm text-muted-foreground">{opt.desc}</p>
                        </div>
                      </div>
                    ))}
                  </RadioGroup>
                </CardContent>
              </>
            );
          })()}

          {/* ══════════════════════════════════════════════════════════════
               BANKER INTAKE FLOW (2 Steps)
             ══════════════════════════════════════════════════════════════ */}

          {/* Banker step header (shared across steps 1–2) */}
          {!isFriendsFamily && bankerMeta && BankerIcon && (
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-primary/10">
                  <BankerIcon className="h-5 w-5 text-primary" />
                </div>
                <CardTitle>{bankerMeta.label}</CardTitle>
              </div>
              <CardDescription>{bankerMeta.desc}</CardDescription>
            </CardHeader>
          )}

          {/* ── Banker Step 1: Role (Q2) ──────────────────────────────── */}
          {!isFriendsFamily && step === 1 && (
            <CardContent>
              <div className="space-y-2">
                <Label>What best describes your role at the bank?</Label>
                <ScrollArea className="h-[340px] pr-2">
                  <div className="space-y-2 pr-1">
                    {ROLE_OPTIONS.map(role => (
                      <button
                        key={role.key}
                        type="button"
                        onClick={() => setRoleKey(role.key)}
                        className={cn(
                          'w-full text-left p-3 rounded-lg border-2 text-sm transition-all',
                          roleKey === role.key
                            ? 'border-primary bg-primary/8 font-medium'
                            : 'border-border hover:border-primary/40 hover:bg-muted/30',
                        )}
                      >
                        {role.label}
                      </button>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </CardContent>
          )}

          {/* ── Banker Step 2: AI Assessment (Q3, Q5, Q6, Q7, Q8, Q10, Q12) ── */}
          {!isFriendsFamily && step === 2 && (
            <CardContent>
              <ScrollArea className="h-[520px] pr-2">
                <div className="space-y-6 pr-1">

                  {/* Q3 */}
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Which of these best describes your most recent use of AI in a work context?</p>
                    <div className="space-y-1.5">
                      {Q3_OPTIONS.map(opt => (
                        <OptionTile key={opt.key} option={opt} selected={q3 === opt.key} onSelect={() => setQ3(opt.key)} />
                      ))}
                    </div>
                  </div>

                  {/* Q5 */}
                  <div className="space-y-2">
                    <p className="text-sm font-medium">When you write a prompt, which best describes your approach?</p>
                    <div className="space-y-1.5">
                      {Q5_OPTIONS.map(opt => (
                        <OptionTile key={opt.key} option={opt} selected={q5 === opt.key} onSelect={() => setQ5(opt.key)} />
                      ))}
                    </div>
                  </div>

                  {/* Q6 */}
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Has your bank issued any guidance, policy, or training on AI use?</p>
                    <div className="space-y-1.5">
                      {Q6_OPTIONS.map(opt => (
                        <OptionTile key={opt.key} option={opt} selected={q6 === opt.key} onSelect={() => setQ6(opt.key)} />
                      ))}
                    </div>
                  </div>

                  {/* Q7 */}
                  <div className="space-y-2">
                    <p className="text-sm font-medium">A colleague sends you an AI-generated summary of a customer's loan file and says "I used it to prep — looks solid." What do you do?</p>
                    <div className="space-y-1.5">
                      {Q7_OPTIONS.map(opt => (
                        <OptionTile key={opt.key} option={opt} selected={q7 === opt.key} onSelect={() => setQ7(opt.key)} />
                      ))}
                    </div>
                  </div>

                  {/* Q8 */}
                  <div className="space-y-2">
                    <p className="text-sm font-medium">You're drafting a memo using AI. The draft includes a customer's account numbers and balances. What do you do?</p>
                    <div className="space-y-1.5">
                      {Q8_OPTIONS.map(opt => (
                        <OptionTile key={opt.key} option={opt} selected={q8 === opt.key} onSelect={() => setQ8(opt.key)} />
                      ))}
                    </div>
                  </div>

                  {/* Q10 */}
                  <div className="space-y-2">
                    <p className="text-sm font-medium">When you think about using AI more at work, which feeling is most true right now?</p>
                    <div className="space-y-1.5">
                      {Q10_OPTIONS.map(opt => (
                        <OptionTile key={opt.key} option={opt} selected={q10 === opt.key} onSelect={() => setQ10(opt.key)} />
                      ))}
                    </div>
                  </div>

                  {/* Q12 */}
                  <div className="space-y-2">
                    <p className="text-sm font-medium">How do you usually get up to speed on something new?</p>
                    <div className="space-y-1.5">
                      {Q12_OPTIONS.map(opt => (
                        <OptionTile key={opt.key} option={opt} selected={q12 === opt.key} onSelect={() => setQ12(opt.key)} />
                      ))}
                    </div>
                  </div>

                </div>
              </ScrollArea>
            </CardContent>
          )}

          {/* ── Navigation ───────────────────────────────────────────────── */}
          {!hideNav && (
            <div className="flex items-center justify-between p-6 pt-3 border-t">
              <div className="flex items-center gap-2">
                {isRetake && (
                  <Button variant="ghost" onClick={handleCancel} className="text-muted-foreground">
                    Cancel
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={handleBack}
                  disabled={step === 1}
                  className="gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </Button>
              </div>

              <Button onClick={handleNext} disabled={isSubmitting} className="gap-2">
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : isLastStep ? (
                  <>Let's go</>
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
