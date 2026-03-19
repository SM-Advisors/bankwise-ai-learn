import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth, LearningStyleType } from '@/contexts/AuthContext';
import { getIndustryConfig, type IndustryConfig } from '@/data/industryConfigs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { ROLE_OPTIONS as FALLBACK_ROLE_OPTIONS } from '@/data/intakeQuestions';
import { supabase } from '@/integrations/supabase/client';
import { ArrowRight, ArrowLeft, Loader2, Sparkles, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

// ── Consumer job chips ────────────────────────────────────────────────────────
const CONSUMER_JOB_CHIPS = ['Retired', 'Student', 'Business Owner', 'Between Jobs', 'Other'];

// ── Learning style options ────────────────────────────────────────────────────
const LEARNING_STYLE_OPTIONS: { value: LearningStyleType; label: string; desc: string }[] = [
  { value: 'example-based',    label: 'Show me examples',  desc: 'See what good looks like before I try' },
  { value: 'explanation-based', label: 'Explain it first', desc: 'Walk me through the concepts' },
  { value: 'hands-on',          label: 'Let me try it',    desc: 'I learn by doing and experimenting' },
  { value: 'logic-based',       label: 'Show me the why',  desc: 'I need to understand how it works' },
];

// ── 6 AI Skill Assessment multiple-choice questions ───────────────────────────
interface AISkillQuestion {
  id: string;
  question: string;
  options: { key: string; label: string; score: number }[];
}

const AI_SKILL_QUESTIONS: AISkillQuestion[] = [
  {
    id: 'ai1',
    question: 'When you hear "AI prompt," what comes to mind?',
    options: [
      { key: 'A', label: "I'm not sure what that means", score: 1 },
      { key: 'B', label: "Typing a question into ChatGPT or similar", score: 2 },
      { key: 'C', label: "Giving an AI specific instructions to get a useful result", score: 3 },
      { key: 'D', label: "Crafting structured inputs with context, constraints, and format", score: 4 },
    ],
  },
  {
    id: 'ai2',
    question: 'How often do you use AI tools in your work today?',
    options: [
      { key: 'A', label: "Never — I haven't tried AI at work", score: 1 },
      { key: 'B', label: "Rarely — I've experimented once or twice", score: 2 },
      { key: 'C', label: "Sometimes — I use it for specific tasks", score: 3 },
      { key: 'D', label: "Regularly — it's part of my daily workflow", score: 4 },
    ],
  },
  {
    id: 'ai3',
    question: 'If AI gave you an answer that looked correct, what would you do?',
    options: [
      { key: 'A', label: "Use it as-is — it's probably right", score: 1 },
      { key: 'B', label: "Skim it quickly before using it", score: 2 },
      { key: 'C', label: "Check the key facts against a reliable source", score: 3 },
      { key: 'D', label: "Verify it thoroughly and consider what could be wrong", score: 4 },
    ],
  },
  {
    id: 'ai4',
    question: 'A colleague wants to paste customer data into an AI tool. How do you react?',
    options: [
      { key: 'A', label: "Sounds fine — the AI needs context to help", score: 1 },
      { key: 'B', label: "I'd want to check with someone first", score: 2 },
      { key: 'C', label: "I'd suggest removing personal details first", score: 3 },
      { key: 'D', label: "I'd flag this as a data privacy concern and check policy", score: 4 },
    ],
  },
  {
    id: 'ai5',
    question: 'How comfortable are you explaining AI capabilities to a coworker?',
    options: [
      { key: 'A', label: "Not comfortable — I don't know enough yet", score: 1 },
      { key: 'B', label: "I could explain the basics", score: 2 },
      { key: 'C', label: "I could explain it and give a practical example", score: 3 },
      { key: 'D', label: "Very comfortable — I've already helped others", score: 4 },
    ],
  },
  {
    id: 'ai6',
    question: 'When AI output isn\'t quite right, what do you typically do?',
    options: [
      { key: 'A', label: "Give up and do it manually", score: 1 },
      { key: 'B', label: "Try again with the same prompt", score: 2 },
      { key: 'C', label: "Revise my prompt to be more specific", score: 3 },
      { key: 'D', label: "Iterate with follow-up instructions to refine the result", score: 4 },
    ],
  },
];

// ── Score AI skill answers → proficiency level (1–4) ──────────────────────────
function aiSkillScoreToLevel(answers: Record<string, number>): number {
  const scores = Object.values(answers);
  if (scores.length === 0) return 1;
  const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
  if (avg <= 1.5) return 1;
  if (avg <= 2.5) return 2;
  if (avg <= 3.3) return 3;
  return 4;
}

// ── Score → Andrea's contextual response ─────────────────────────────────────
function levelToAndreaMessage(level: number): string {
  if (level === 1) {
    return "Good first step. Writing effective prompts is a skill—one you'll build quickly here. Every great prompt starts with someone willing to try.";
  }
  if (level === 2) {
    return "You're already thinking in the right direction. With a bit of structure, your prompts will get much more predictable results.";
  }
  if (level === 3) {
    return "That's solid. You've clearly used AI before and you're thinking about the right things. Let's go deeper, faster.";
  }
  return "You've got strong fundamentals. Context, constraints, risk awareness—let's make sure we challenge you appropriately.";
}

// ── Level label ───────────────────────────────────────────────────────────────
const LEVEL_LABELS = ['Observer', 'Learner', 'Practitioner', 'Champion'];

// ── Step domain descriptions ──────────────────────────────────────────────────
const STEP_DESCRIPTIONS: Record<number, { title: string; purpose: string }> = {
  1: {
    title: 'Your Identity',
    purpose: 'Andrea uses your name to make every interaction personal — not generic.',
  },
  2: {
    title: 'Your Role at the Organization',
    purpose: 'Your role determines which examples, scenarios, and use cases Andrea shows you. The more accurate this is, the more relevant your training will be.',
  },
  3: {
    title: 'Your AI Skillset',
    purpose: 'These questions help Andrea understand your current comfort with AI so she can meet you exactly where you are — not too basic, not too advanced.',
  },
  4: {
    title: 'How You Like to Learn',
    purpose: 'This tells Andrea how to deliver content to you. Some people learn by doing, others by seeing examples first. There\'s no wrong answer.',
  },
  5: {
    title: 'Your Personalized Path',
    purpose: '',
  },
};

// ── Main Component ────────────────────────────────────────────────────────────
export default function Onboarding() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const retakeParam = searchParams.get('retake') === 'true';
  const { profile, updateProfile, loading } = useAuth();
  const { toast } = useToast();

  const [isRetake] = useState<boolean>(() =>
    retakeParam || !!(profile?.intake_role_key || profile?.learning_style || profile?.ai_proficiency_level),
  );

  const [orgType, setOrgType] = useState<string>(() => sessionStorage.getItem('signup_org_type') || '');
  const [orgIndustry, setOrgIndustry] = useState<string>(() => sessionStorage.getItem('signup_industry') || 'banking');
  const [orgTypeResolved, setOrgTypeResolved] = useState<boolean>(!!sessionStorage.getItem('signup_org_type'));
  const isEnterprise = orgType !== 'consumer';

  const industryConfig: IndustryConfig = getIndustryConfig(orgIndustry, isEnterprise ? 'enterprise' : 'consumer');

  // Derive role options from industry config; fall back to hardcoded list
  const roleOptions = industryConfig.roles.length > 0
    ? industryConfig.roles.map(r => ({ key: r.value, label: r.label, lobSlug: r.departmentSlug }))
    : FALLBACK_ROLE_OPTIONS;

  useEffect(() => {
    if (orgTypeResolved) return;
    if (loading) return;
    if (!profile?.organization_id) {
      setOrgType('enterprise');
      setOrgTypeResolved(true);
      return;
    }
    (supabase
      .from('organizations')
      .select('audience_type, industry')
      .eq('id', profile.organization_id)
      .single())
      .then(({ data }: { data: { audience_type: string; industry: string } | null }) => {
        setOrgType(data?.audience_type || 'enterprise');
        setOrgIndustry(data?.industry || 'banking');
        setOrgTypeResolved(true);
      });
  }, [profile?.organization_id, orgTypeResolved, loading]);

  useEffect(() => {
    if (!loading && profile?.onboarding_completed && !retakeParam) navigate('/dashboard');
  }, [profile, loading, navigate, retakeParam]);

  // ── Step state ────────────────────────────────────────────────────────────
  const [step, setStep] = useState(1);
  const TOTAL_STEPS = 5;

  // Step 1: Name
  const [displayName, setDisplayName] = useState(() => profile?.display_name || '');

  // Step 2: Role
  const [roleKey, setRoleKey] = useState(profile?.intake_role_key || '');
  const [customRoleText, setCustomRoleText] = useState('');
  const [consumerJobTitle, setConsumerJobTitle] = useState(profile?.job_role || '');

  // Step 3: AI Skill Assessment (6 multiple-choice questions)
  const [aiSkillAnswers, setAiSkillAnswers] = useState<Record<string, number>>({});

  // Step 4: Learning style
  const [learningStyle, setLearningStyle] = useState<LearningStyleType | null>(profile?.learning_style || null);

  // Step 5: Submit
  const [isSubmitting, setIsSubmitting] = useState(false);

  const progressPercent = ((step - 1) / TOTAL_STEPS) * 100;

  const handleCancel = async () => {
    await updateProfile({ onboarding_completed: true });
    navigate('/dashboard');
  };

  // Compute level from skill answers
  const computedLevel = aiSkillScoreToLevel(aiSkillAnswers);

  // ── Advance ───────────────────────────────────────────────────────────────
  const handleNext = async () => {
    if (step === 1) {
      if (!displayName.trim()) {
        toast({ title: 'Required', description: 'Please enter your name', variant: 'destructive' });
        return;
      }
    }

    if (step === 2) {
      const hasRole = isEnterprise
        ? (roleKey === 'other' ? !!customRoleText.trim() : !!roleKey)
        : !!consumerJobTitle.trim();
      if (!hasRole) {
        toast({ title: 'Required', description: roleKey === 'other' ? 'Please enter your role' : 'Please select your role', variant: 'destructive' });
        return;
      }
    }

    if (step === 3) {
      if (Object.keys(aiSkillAnswers).length < AI_SKILL_QUESTIONS.length) {
        toast({ title: 'Please answer all questions', description: `Answer all ${AI_SKILL_QUESTIONS.length} questions to continue`, variant: 'destructive' });
        return;
      }
    }

    if (step === 4) {
      if (!learningStyle) {
        toast({ title: 'Required', description: 'Please select a learning style', variant: 'destructive' });
        return;
      }
    }

    if (step < TOTAL_STEPS) {
      setStep(step + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      await handleComplete();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // ── Complete ──────────────────────────────────────────────────────────────
  const handleComplete = async () => {
    setIsSubmitting(true);

    const selectedRole = roleOptions.find(r => r.key === roleKey);
    const level = computedLevel;

    const { error } = await updateProfile({
      display_name: displayName.trim(),
      job_role: isEnterprise ? (roleKey === 'other' ? customRoleText.trim() : (selectedRole?.label || roleKey)) : consumerJobTitle.trim(),
      department: isEnterprise ? (selectedRole?.lobSlug || null) : null,
      ai_proficiency_level: level,
      learning_style: learningStyle,
      tech_learning_style: learningStyle,
      intake_role_key: isEnterprise ? roleKey : null,
      intake_orientation: 'neutral',
      onboarding_completed: true,
    });

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      setIsSubmitting(false);
    } else {
      sessionStorage.removeItem('signup_org_type');
      sessionStorage.removeItem('signup_industry');
      navigate('/dashboard');
    }
  };

  // Warn before leaving mid-onboarding (browser back, closing tab)
  useEffect(() => {
    if (step > 1 && step < TOTAL_STEPS) {
      const handler = (e: BeforeUnloadEvent) => {
        e.preventDefault();
        e.returnValue = '';
      };
      window.addEventListener('beforeunload', handler);
      return () => window.removeEventListener('beforeunload', handler);
    }
  }, [step]);

  if (loading || !orgTypeResolved) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const isLastStep = step === TOTAL_STEPS;
  const stepInfo = STEP_DESCRIPTIONS[step];

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-xl mx-auto">

        {/* Progress bar with step counter */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-muted-foreground">Step {step} of {TOTAL_STEPS}</span>
            <span className="text-xs text-muted-foreground">{Math.round(progressPercent)}%</span>
          </div>
          <Progress value={progressPercent} className="h-1.5" />
        </div>

        <Card className="shadow-lg">

          {/* ── Step 1: Name ──────────────────────────────────────────── */}
          {step === 1 && (
            <>
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Sparkles className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle>What should we call you?</CardTitle>
                </div>
                <CardDescription>
                  {industryConfig.welcomeMessage || "Welcome. Let's set up your personalized experience."}
                </CardDescription>
                {stepInfo.purpose && (
                  <p className="text-xs text-muted-foreground mt-2 italic">{stepInfo.purpose}</p>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="display-name">Your name</Label>
                  <Input
                    id="display-name"
                    placeholder="First name or full name"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleNext()}
                    autoFocus
                  />
                </div>
              </CardContent>
            </>
          )}

          {/* ── Step 2: Role ───────────────────────────────────────────── */}
          {step === 2 && (
            <>
              <CardHeader>
                <CardTitle>What do you do?</CardTitle>
                <CardDescription>
                  {isEnterprise
                    ? "Select your role — we'll tailor your training content and examples to match your work."
                    : "Tell us about your work so we can make your learning relevant."}
                </CardDescription>
                {stepInfo.purpose && (
                  <p className="text-xs text-muted-foreground mt-2 italic">{stepInfo.purpose}</p>
                )}
              </CardHeader>
              <CardContent>
                {isEnterprise ? (
                  <div className="grid gap-2">
                    {roleOptions.map(role => (
                      <button
                        key={role.key}
                        type="button"
                        onClick={() => setRoleKey(role.key)}
                        className={cn(
                          'w-full text-left px-4 py-3 rounded-lg border-2 text-sm transition-all',
                          roleKey === role.key
                            ? 'border-primary bg-primary/8 font-medium'
                            : 'border-border hover:border-primary/40 hover:bg-muted/30',
                        )}
                      >
                        {role.label}
                      </button>
                    ))}
                    {roleKey === 'other' && (
                      <Input
                        placeholder="Enter your role"
                        value={customRoleText}
                        onChange={(e) => setCustomRoleText(e.target.value)}
                        className="mt-1"
                        autoFocus
                      />
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Input
                      placeholder="e.g., Software Engineer, Teacher, Nurse"
                      value={consumerJobTitle}
                      onChange={(e) => setConsumerJobTitle(e.target.value)}
                    />
                    <div className="flex flex-wrap gap-2">
                      {CONSUMER_JOB_CHIPS.map(chip => (
                        <button
                          key={chip}
                          type="button"
                          onClick={() => setConsumerJobTitle(chip)}
                          className={cn(
                            'px-3 py-1.5 rounded-full text-sm border transition-all',
                            consumerJobTitle === chip
                              ? 'border-primary bg-primary/10 text-primary font-medium'
                              : 'border-border hover:border-primary/50 text-muted-foreground',
                          )}
                        >
                          {chip}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </>
          )}

          {/* ── Step 3: AI Skill Assessment (Multiple Choice) ──────────── */}
          {step === 3 && (
            <>
              <CardHeader>
                <CardTitle>How confident are you with AI?</CardTitle>
                <CardDescription>
                  Answer these {AI_SKILL_QUESTIONS.length} quick questions — no right or wrong answers.
                </CardDescription>
                {stepInfo.purpose && (
                  <p className="text-xs text-muted-foreground mt-2 italic">{stepInfo.purpose}</p>
                )}
              </CardHeader>
              <CardContent className="space-y-6">
                {AI_SKILL_QUESTIONS.map((q, qi) => (
                  <div key={q.id} className="space-y-2">
                    <p className="text-sm font-medium">{qi + 1}. {q.question}</p>
                    <div className="grid gap-1.5">
                      {q.options.map(opt => (
                        <button
                          key={opt.key}
                          type="button"
                          onClick={() => setAiSkillAnswers(prev => ({ ...prev, [q.id]: opt.score }))}
                          className={cn(
                            'w-full text-left px-4 py-2.5 rounded-lg border text-sm transition-all',
                            aiSkillAnswers[q.id] === opt.score
                              ? 'border-primary bg-primary/8 font-medium'
                              : 'border-border hover:border-primary/40 hover:bg-muted/30',
                          )}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
                <p className="text-xs text-muted-foreground text-center">
                  {Object.keys(aiSkillAnswers).length} of {AI_SKILL_QUESTIONS.length} answered
                </p>
              </CardContent>
            </>
          )}

          {/* ── Step 4: Andrea + Learning Style ───────────────────────── */}
          {step === 4 && (
            <>
              <CardHeader>
                <CardTitle>How would you like me to teach you?</CardTitle>
                {stepInfo.purpose && (
                  <p className="text-xs text-muted-foreground mt-2 italic">{stepInfo.purpose}</p>
                )}
              </CardHeader>
              <CardContent className="space-y-5">
                {/* Andrea's response to their skill assessment */}
                <div className="flex gap-3 p-4 rounded-xl bg-primary/5 border border-primary/20">
                  <div className="shrink-0 h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold">
                    A
                  </div>
                  <p className="text-sm text-foreground leading-relaxed">
                    {levelToAndreaMessage(computedLevel)}
                  </p>
                </div>

                {/* Learning style selection */}
                <div className="grid gap-2">
                  {LEARNING_STYLE_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setLearningStyle(opt.value)}
                      className={cn(
                        'w-full text-left px-4 py-3 rounded-lg border-2 transition-all',
                        learningStyle === opt.value
                          ? 'border-primary bg-primary/8'
                          : 'border-border hover:border-primary/40 hover:bg-muted/30',
                      )}
                    >
                      <div className="text-sm font-medium">{opt.label}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{opt.desc}</div>
                    </button>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-3">
                  This affects how Andrea delivers content — not what you learn.
                </p>
              </CardContent>
            </>
          )}

          {/* ── Step 5: You're ready ───────────────────────────────────── */}
          {step === 5 && (
            <>
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-green-500/10">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  </div>
                  <CardTitle>You're ready.</CardTitle>
                </div>
                <CardDescription>
                  Here's your personalized path, {displayName}.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-lg border divide-y text-sm">
                  <div className="flex items-center justify-between px-4 py-3">
                    <span className="text-muted-foreground">Starting as</span>
                    <span className="font-medium">{LEVEL_LABELS[computedLevel - 1]}</span>
                  </div>
                  <div className="flex items-center justify-between px-4 py-3">
                    <span className="text-muted-foreground">Learning style</span>
                    <span className="font-medium">
                      {LEARNING_STYLE_OPTIONS.find(o => o.value === learningStyle)?.label ?? '—'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between px-4 py-3">
                    <span className="text-muted-foreground">First session</span>
                    <span className="font-medium">AI Fundamentals & Your First Win</span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Andrea will adapt as she learns more about how you work.
                </p>
              </CardContent>
            </>
          )}

          {/* ── Navigation ────────────────────────────────────────────── */}
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

            <Button
              onClick={handleNext}
              disabled={isSubmitting}
              className="gap-2"
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : isLastStep ? (
                "Let's go"
              ) : (
                <>
                  Next
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>

        </Card>
      </div>
    </div>
  );
}
