import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, LearningStyleType } from '@/contexts/AuthContext';
import { getIndustryConfig, type IndustryConfig } from '@/data/industryConfigs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { ROLE_OPTIONS } from '@/data/intakeQuestions';
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

// ── Score → proficiency level (1–4) ──────────────────────────────────────────
function scoreToLevel(score: number): number {
  if (score <= 2) return 1;
  if (score <= 5) return 2;
  if (score <= 8) return 3;
  return 4;
}

// ── Score → Andrea's contextual response ─────────────────────────────────────
function scoreToAndreaMessage(score: number): string {
  if (score <= 2) {
    return "Good first step. Writing effective prompts is a skill—one you'll build quickly here. Every great prompt starts with someone willing to try.";
  }
  if (score <= 5) {
    return "You're already thinking in the right direction. With a bit of structure, your prompts will get much more predictable results.";
  }
  if (score <= 8) {
    return "That's a solid prompt. You've clearly used AI before and you're thinking about the right things. Let's go deeper, faster.";
  }
  return "That's a well-crafted prompt. Context, constraints, risk awareness—you've got the fundamentals. Let's make sure we challenge you appropriately.";
}

// ── Level label ───────────────────────────────────────────────────────────────
const LEVEL_LABELS = ['Observer', 'Learner', 'Practitioner', 'Champion'];

// ── Main Component ────────────────────────────────────────────────────────────
export default function Onboarding() {
  const navigate = useNavigate();
  const { profile, updateProfile, loading } = useAuth();
  const { toast } = useToast();

  const [isRetake] = useState<boolean>(() =>
    !!(profile?.intake_role_key || profile?.learning_style || profile?.ai_proficiency_level),
  );

  const [orgType, setOrgType] = useState<string>(() => sessionStorage.getItem('signup_org_type') || '');
  const [orgIndustry, setOrgIndustry] = useState<string>(() => sessionStorage.getItem('signup_industry') || 'banking');
  const [orgTypeResolved, setOrgTypeResolved] = useState<boolean>(!!sessionStorage.getItem('signup_org_type'));
  const isEnterprise = orgType !== 'consumer';

  const industryConfig: IndustryConfig = getIndustryConfig(orgIndustry, isEnterprise ? 'enterprise' : 'consumer');

  useEffect(() => {
    if (orgTypeResolved) return;
    if (loading) return;
    if (!profile?.organization_id) {
      setOrgType('enterprise');
      setOrgTypeResolved(true);
      return;
    }
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

  useEffect(() => {
    if (!loading && profile?.onboarding_completed) navigate('/dashboard');
  }, [profile, loading, navigate]);

  // ── Step state ────────────────────────────────────────────────────────────
  const [step, setStep] = useState(1);
  const TOTAL_STEPS = 5;

  // Step 1: Name
  const [displayName, setDisplayName] = useState(() => profile?.display_name || '');

  // Step 2: Role
  const [roleKey, setRoleKey] = useState(profile?.intake_role_key || '');
  const [consumerJobTitle, setConsumerJobTitle] = useState(profile?.job_role || '');

  // Step 3: Micro-task prompt
  const [userPrompt, setUserPrompt] = useState('');
  const [promptScore, setPromptScore] = useState<number | null>(null);
  const [isScoringPrompt, setIsScoringPrompt] = useState(false);

  // Step 4: Learning style
  const [learningStyle, setLearningStyle] = useState<LearningStyleType | null>(profile?.learning_style || null);

  // Step 5: Submit
  const [isSubmitting, setIsSubmitting] = useState(false);

  const progressPercent = ((step - 1) / TOTAL_STEPS) * 100;

  const handleCancel = async () => {
    await updateProfile({ onboarding_completed: true });
    navigate('/dashboard');
  };

  // ── Advance ───────────────────────────────────────────────────────────────
  const handleNext = async () => {
    if (step === 1) {
      if (!displayName.trim()) {
        toast({ title: 'Required', description: 'Please enter your name', variant: 'destructive' });
        return;
      }
    }

    if (step === 2) {
      const hasRole = isEnterprise ? !!roleKey : !!consumerJobTitle.trim();
      if (!hasRole) {
        toast({ title: 'Required', description: 'Please select your role', variant: 'destructive' });
        return;
      }
    }

    if (step === 3) {
      if (userPrompt.trim().length < 15) {
        toast({ title: 'Keep going', description: 'Write a bit more to get a useful result', variant: 'destructive' });
        return;
      }
      // Score silently before advancing
      setIsScoringPrompt(true);
      try {
        const res = await supabase.functions.invoke('intake-prompt-score', {
          body: { prompt: userPrompt },
        });
        setPromptScore(res.data?.score ?? 0);
      } catch {
        setPromptScore(0); // fail silently — don't block onboarding
      } finally {
        setIsScoringPrompt(false);
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
    } else {
      await handleComplete();
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  // ── Complete ──────────────────────────────────────────────────────────────
  const handleComplete = async () => {
    setIsSubmitting(true);

    const selectedRole = ROLE_OPTIONS.find(r => r.key === roleKey);
    const level = scoreToLevel(promptScore ?? 0);

    const { error } = await updateProfile({
      display_name: displayName.trim(),
      job_role: isEnterprise ? (selectedRole?.label || roleKey) : consumerJobTitle.trim(),
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

  if (loading || !orgTypeResolved) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const isLastStep = step === TOTAL_STEPS;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-xl mx-auto">

        {/* Progress bar — no step count label (spec requirement) */}
        <div className="mb-8">
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
              </CardHeader>
              <CardContent>
                {isEnterprise ? (
                  <div className="grid gap-2">
                    {ROLE_OPTIONS.map(role => (
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

          {/* ── Step 3: Micro-task ─────────────────────────────────────── */}
          {step === 3 && (
            <>
              <CardHeader>
                <CardTitle>Try this.</CardTitle>
                <CardDescription>
                  Write the actual prompt you would type into an AI tool.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-lg bg-muted/50 border p-4 text-sm">
                  <span className="font-medium">Task: </span>
                  Draft a follow-up email to a small business customer after a meeting about a commercial line of credit.
                </div>
                <Textarea
                  placeholder="Type your prompt here…"
                  value={userPrompt}
                  onChange={(e) => setUserPrompt(e.target.value)}
                  rows={5}
                  className="resize-none"
                  autoFocus
                />
                <p className="text-xs text-muted-foreground">
                  No right or wrong answers — this helps Andrea understand where you're starting from.
                </p>
              </CardContent>
            </>
          )}

          {/* ── Step 4: Andrea + Learning Style ───────────────────────── */}
          {step === 4 && (
            <>
              <CardHeader>
                <CardTitle>How would you like me to teach you?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                {/* Andrea's response to their prompt */}
                <div className="flex gap-3 p-4 rounded-xl bg-primary/5 border border-primary/20">
                  <div className="shrink-0 h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold">
                    A
                  </div>
                  <p className="text-sm text-foreground leading-relaxed">
                    {scoreToAndreaMessage(promptScore ?? 0)}
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
                    <span className="font-medium">{LEVEL_LABELS[scoreToLevel(promptScore ?? 0) - 1]}</span>
                  </div>
                  <div className="flex items-center justify-between px-4 py-3">
                    <span className="text-muted-foreground">Learning style</span>
                    <span className="font-medium">
                      {LEARNING_STYLE_OPTIONS.find(o => o.value === learningStyle)?.label ?? '—'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between px-4 py-3">
                    <span className="text-muted-foreground">First session</span>
                    <span className="font-medium">AI Foundations</span>
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
              disabled={isSubmitting || isScoringPrompt}
              className="gap-2"
            >
              {isScoringPrompt ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Analyzing…
                </>
              ) : isSubmitting ? (
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
