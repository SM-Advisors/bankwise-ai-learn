import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, LearningStyleType } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
  Q3_OPTIONS, Q4_OPTIONS, Q5_OPTIONS, Q6_OPTIONS,
  Q7_OPTIONS, Q8_OPTIONS, Q9_OPTIONS,
  SJT_SCENARIOS,
  Q10_OPTIONS, Q11_OPTIONS, Q12_OPTIONS,
  type AnswerOption,
} from '@/data/intakeQuestions';
import { scoreIntake, type IntakeAnswers } from '@/utils/intakeScoring';
import { supabase } from '@/integrations/supabase/client';
import {
  ArrowRight, ArrowLeft, Heart, Loader2,
  Briefcase, Brain, ShieldCheck, AlertTriangle, Pencil, Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ── F&F quick-select chips ────────────────────────────────────────────────
const FF_JOB_CHIPS = ['Retired', 'Student', 'Between Jobs', 'Other'];

// ── Banker step metadata (conversational, not labeled as "assessment") ────
const BANKER_STEPS = [
  { label: 'Let\'s get to know you',        icon: Briefcase,   desc: 'Tell us about your role — we\'ll use it to make your training more relevant.' },
  { label: 'Your AI experience',             icon: Brain,       desc: 'A few questions about how you currently use AI at work. There are no right or wrong answers.' },
  { label: 'Handling real situations',       icon: ShieldCheck, desc: 'How would you handle these common banking and AI scenarios?' },
  { label: 'A few more scenarios',           icon: AlertTriangle, desc: 'Five short situations. Pick the response that feels most right to you.' },
  { label: 'Show your approach',             icon: Pencil,      desc: 'Write a real AI prompt — this is the only step that can\'t be answered theoretically.' },
  { label: 'One last thing',                 icon: Sparkles,    desc: 'Help us understand how you prefer to learn so Andrea can match your style.' },
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

// ── Multi-select tile ─────────────────────────────────────────────────────
function MultiTile({
  option, selected, onToggle, disabled,
}: {
  option: AnswerOption;
  selected: boolean;
  onToggle: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={disabled}
      className={cn(
        'w-full text-left flex items-start gap-3 p-3 rounded-lg border-2 transition-all text-sm',
        selected
          ? 'border-primary bg-primary/8 text-foreground'
          : disabled
          ? 'border-border bg-muted/20 text-muted-foreground opacity-50 cursor-not-allowed'
          : 'border-border hover:border-primary/40 hover:bg-muted/40',
      )}
    >
      <div className={cn(
        'shrink-0 mt-0.5 h-5 w-5 rounded-md border-2 flex items-center justify-center',
        selected ? 'border-primary bg-primary text-primary-foreground' : 'border-muted-foreground/40',
      )}>
        {selected && <span className="text-xs font-bold">✓</span>}
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

  const [orgType] = useState<string>(() => sessionStorage.getItem('signup_org_type') || 'bank');
  const isFriendsFamily = orgType === 'friends_family';

  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ── F&F state ─────────────────────────────────────────────────────────
  const [jobTitle, setJobTitle] = useState(profile?.bank_role || '');
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

  // ── Banker intake state (one field per question) ──────────────────────
  const [roleKey, setRoleKey] = useState('');
  // Step 2
  const [q3, setQ3] = useState('');
  const [q4, setQ4] = useState('');
  const [q5, setQ5] = useState('');
  const [q6, setQ6] = useState('');
  // Step 3
  const [q7, setQ7] = useState('');
  const [q8, setQ8] = useState('');
  const [q9, setQ9] = useState<string[]>([]);
  // Step 4 — SJT (keyed by scenario id)
  const [sjtAnswers, setSjtAnswers] = useState<Record<string, string>>({});
  // Step 5
  const [step5Prompt, setStep5Prompt] = useState('');
  // Ref holds the LLM score for Step 5 once the edge function returns.
  // Using a ref (not state) so completeBanker() reads the latest value without
  // stale-closure issues and without triggering a re-render.
  const step5LlmScoreRef = useRef<number | null>(null);
  // Step 6
  const [q10, setQ10] = useState('');
  const [q11, setQ11] = useState<string[]>([]);
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // ── Step counts & progress ────────────────────────────────────────────
  // F&F: 5 steps (job title, interests, proficiency, learning, tech learning)
  // Banker: 6 steps (role, behavioral, governance, SJT, micro-demo, orientation)
  const totalSteps = isFriendsFamily ? 5 : 6;

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
      if (step === 2 && (!q3 || !q4 || !q5 || !q6)) {
        toast({ title: 'Required', description: 'Please answer all questions on this page', variant: 'destructive' });
        return false;
      }
      if (step === 3) {
        if (!q7 || !q8) {
          toast({ title: 'Required', description: 'Please answer all questions on this page', variant: 'destructive' });
          return false;
        }
        if (q9.length === 0) {
          toast({ title: 'Required', description: 'Please select at least one stakeholder for Q9', variant: 'destructive' });
          return false;
        }
      }
      if (step === 4) {
        const allAnswered = SJT_SCENARIOS.every(s => sjtAnswers[s.id]);
        if (!allAnswered) {
          toast({ title: 'Required', description: 'Please answer all five scenarios', variant: 'destructive' });
          return false;
        }
      }
      if (step === 5 && step5Prompt.trim().length < 20) {
        toast({ title: 'Required', description: 'Please write a prompt of at least 20 characters', variant: 'destructive' });
        return false;
      }
      if (step === 6) {
        if (!q10 || !q12) {
          toast({ title: 'Required', description: 'Please answer all questions on this page', variant: 'destructive' });
          return false;
        }
        if (q11.length === 0) {
          toast({ title: 'Required', description: 'Please select at least one motivation', variant: 'destructive' });
          return false;
        }
      }
    }
    return true;
  };

  // ── Navigation ────────────────────────────────────────────────────────

  // Fire LLM scoring for the Step 5 prompt in the background.
  // Called when the banker advances from Step 5 → Step 6 so the score is
  // ready (Haiku ~1s) long before they finish Q10–Q12 and hit Complete.
  // On any failure the ref stays null and scoreIntake() uses the heuristic.
  const fireStep5LlmScore = async (prompt: string) => {
    step5LlmScoreRef.current = null; // reset before each attempt
    try {
      const { data, error } = await supabase.functions.invoke('intake-prompt-score', {
        body: { prompt },
      });
      if (!error && data && typeof data.score === 'number') {
        step5LlmScoreRef.current = data.score;
      }
    } catch {
      // Silently ignore — heuristic fallback will be used
    }
  };

  const handleNext = () => {
    if (!validateStep()) return;
    if (step < totalSteps) {
      // Prefetch LLM score as soon as the banker leaves Step 5
      if (!isFriendsFamily && step === 5) {
        fireStep5LlmScore(step5Prompt);
      }
      setStep(step + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      // Invalidate cached LLM score if returning to Step 5 — user may edit their prompt
      if (!isFriendsFamily && step === 6) {
        step5LlmScoreRef.current = null;
      }
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
      bank_role: jobTitle,
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
      toast({ title: 'You\'re all set!', description: 'Let\'s start your learning journey.' });
      navigate('/dashboard');
    }
  };

  const completeBanker = async () => {
    const answers: IntakeAnswers = {
      q2_role: roleKey,
      q3, q4, q5, q6,
      q7, q8, q9,
      sjt1: sjtAnswers['sjt1'] || '',
      sjt2: sjtAnswers['sjt2'] || '',
      sjt3: sjtAnswers['sjt3'] || '',
      sjt4: sjtAnswers['sjt4'] || '',
      sjt5: sjtAnswers['sjt5'] || '',
      step5_prompt: step5Prompt,
      q10, q11, q12,
    };

    // Pass LLM score if it arrived; otherwise scoreIntake() falls back to heuristic
    const placement = scoreIntake(answers, step5LlmScoreRef.current ?? undefined);

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
      bank_role: selectedRole?.label || roleKey,
      line_of_business: lob,
      ai_proficiency_level: placement.level,
      learning_style: derivedStyle,
      tech_learning_style: derivedStyle,
      intake_responses: answers as unknown as Record<string, unknown>,
      safe_use_flag: placement.safe_use_flag,
      intake_role_key: roleKey,
      intake_orientation: orientation,
      intake_motivation: q11,
      onboarding_completed: true,
    });

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      sessionStorage.removeItem('signup_org_type');
      toast({ title: 'Profile Complete!', description: 'Let\'s start your training journey.' });
      navigate('/dashboard');
    }
  };

  // ── Helpers ───────────────────────────────────────────────────────────
  const toggleQ9 = (key: string) => {
    setQ9(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);
  };

  const toggleQ11 = (key: string) => {
    setQ11(prev => {
      if (prev.includes(key)) return prev.filter(k => k !== key);
      if (prev.length >= 2) return prev; // max 2
      return [...prev, key];
    });
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
               BANKER INTAKE FLOW (6 Steps per SMILE Intake Spec v1)
             ══════════════════════════════════════════════════════════════ */}

          {/* Banker step header (shared across steps 1–6) */}
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

          {/* ── Banker Step 2: Behavioral Anchors (Q3–Q6) ────────────── */}
          {!isFriendsFamily && step === 2 && (
            <CardContent>
              <div className="space-y-6">

                {/* Q3 */}
                <div className="space-y-2">
                  <p className="text-sm font-medium">Which of these best describes your most recent use of AI in a work context?</p>
                  <div className="space-y-1.5">
                    {Q3_OPTIONS.map(opt => (
                      <OptionTile key={opt.key} option={opt} selected={q3 === opt.key} onSelect={() => setQ3(opt.key)} />
                    ))}
                  </div>
                </div>

                {/* Q4 */}
                <div className="space-y-2">
                  <p className="text-sm font-medium">Think about the last time you used AI at work. What happened?</p>
                  <div className="space-y-1.5">
                    {Q4_OPTIONS.map(opt => (
                      <OptionTile key={opt.key} option={opt} selected={q4 === opt.key} onSelect={() => setQ4(opt.key)} />
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

              </div>
            </CardContent>
          )}

          {/* ── Banker Step 3: Safe Use & Governance (Q7–Q9) ─────────── */}
          {!isFriendsFamily && step === 3 && (
            <CardContent>
              <div className="space-y-6">

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

                {/* Q9 */}
                <div className="space-y-2">
                  <p className="text-sm font-medium">Your bank is adopting an AI-powered loan underwriting tool. Who should be involved? <span className="text-muted-foreground font-normal">(Select all that apply)</span></p>
                  <div className="space-y-1.5">
                    {Q9_OPTIONS.map(opt => (
                      <MultiTile
                        key={opt.key}
                        option={opt}
                        selected={q9.includes(opt.key)}
                        onToggle={() => toggleQ9(opt.key)}
                      />
                    ))}
                  </div>
                </div>

              </div>
            </CardContent>
          )}

          {/* ── Banker Step 4: Situational Judgment (SJT 1–5) ────────── */}
          {!isFriendsFamily && step === 4 && (
            <CardContent>
              <ScrollArea className="h-[520px] pr-2">
                <div className="space-y-7 pr-1">
                  {SJT_SCENARIOS.map((scenario, idx) => (
                    <div key={scenario.id} className="space-y-2">
                      <p className="text-sm font-medium">
                        <span className="text-muted-foreground mr-1">{idx + 1}.</span>
                        {scenario.scenario}
                      </p>
                      <div className="space-y-1.5">
                        {scenario.options.map(opt => (
                          <OptionTile
                            key={opt.key}
                            option={opt}
                            selected={sjtAnswers[scenario.id] === opt.key}
                            onSelect={() => setSjtAnswers(prev => ({ ...prev, [scenario.id]: opt.key }))}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
              {/* Progress indicator for answered SJT items */}
              <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                <div className="flex gap-1">
                  {SJT_SCENARIOS.map(s => (
                    <div
                      key={s.id}
                      className={cn('h-2 w-2 rounded-full', sjtAnswers[s.id] ? 'bg-primary' : 'bg-muted')}
                    />
                  ))}
                </div>
                <span>{Object.keys(sjtAnswers).length}/5 answered</span>
              </div>
            </CardContent>
          )}

          {/* ── Banker Step 5: Micro-Demonstration Task ───────────────── */}
          {!isFriendsFamily && step === 5 && (
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-muted/40 rounded-lg border text-sm space-y-1">
                  <p className="font-semibold text-foreground">Your task:</p>
                  <p className="text-muted-foreground leading-relaxed">
                    Write the actual prompt you would type into an AI tool to draft a follow-up email to a small business customer after a meeting about a commercial line of credit.
                  </p>
                </div>

                <div className="space-y-2">
                  <Textarea
                    placeholder="Type your prompt here…"
                    value={step5Prompt}
                    onChange={(e) => setStep5Prompt(e.target.value)}
                    className="min-h-[160px] resize-none text-sm"
                  />
                  <div className="flex justify-between items-center text-xs text-muted-foreground">
                    <span>Write it as you actually would — no need to explain what you're doing.</span>
                    <span>{step5Prompt.length} chars</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
                  <div className="p-2 rounded bg-muted/30 text-center">
                    <div className="font-medium text-foreground mb-0.5">Context</div>
                    Who's the customer, what was discussed?
                  </div>
                  <div className="p-2 rounded bg-muted/30 text-center">
                    <div className="font-medium text-foreground mb-0.5">Constraints</div>
                    Tone, length, what to include or avoid?
                  </div>
                  <div className="p-2 rounded bg-muted/30 text-center">
                    <div className="font-medium text-foreground mb-0.5">Output</div>
                    What exactly should the AI produce?
                  </div>
                </div>
              </div>
            </CardContent>
          )}

          {/* ── Banker Step 6: Orientation & Motivation (Q10–Q12) ──────── */}
          {!isFriendsFamily && step === 6 && (
            <CardContent>
              <div className="space-y-6">

                {/* Q10 */}
                <div className="space-y-2">
                  <p className="text-sm font-medium">When you think about using AI more at work, which feeling is most true right now?</p>
                  <div className="space-y-1.5">
                    {Q10_OPTIONS.map(opt => (
                      <OptionTile key={opt.key} option={opt} selected={q10 === opt.key} onSelect={() => setQ10(opt.key)} />
                    ))}
                  </div>
                </div>

                {/* Q11 */}
                <div className="space-y-2">
                  <p className="text-sm font-medium">
                    What would make this feel worthwhile?{' '}
                    <span className="text-muted-foreground font-normal">Pick up to 2</span>
                  </p>
                  <div className="space-y-1.5">
                    {Q11_OPTIONS.map(opt => (
                      <MultiTile
                        key={opt.key}
                        option={opt}
                        selected={q11.includes(opt.key)}
                        onToggle={() => toggleQ11(opt.key)}
                        disabled={!q11.includes(opt.key) && q11.length >= 2}
                      />
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
