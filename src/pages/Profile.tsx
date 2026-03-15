import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth, LearningStyleType } from '@/contexts/AuthContext';
import { useAIPreferences, useAIMemories } from '@/hooks/useAIPreferences';
import { useSkillAssessment } from '@/hooks/useSkillAssessment';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { AppShell } from '@/components/shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader,
  AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Brain, Save, Loader2, Trash2, Pin, PinOff, Plus, BookOpen,
  TrendingUp, Target, CheckCircle, Sparkles, Bot, Building2,
  Zap, Award, ArrowRight, Sliders, User, RefreshCw, Shield,
} from 'lucide-react';
import { ALL_SESSION_CONTENT } from '@/data/trainingContent';
import { ROLE_OPTIONS as FALLBACK_ROLE_OPTIONS } from '@/data/intakeQuestions';
import { useIndustryContent } from '@/hooks/useIndustryContent';
import {
  computeOverallProgress, computeSessionProgress,
  getCompletedModuleCount, getSessionModuleTotal,
} from '@/utils/computeProgress';
import { aggregateSkillSignals } from '@/utils/deriveSkillSignals';
import type { SessionProgressData, SkillSignal } from '@/types/progress';

// ─── Option lists (Personalization subtab) ───────────────────────────────────

const TONE_OPTIONS = [
  { value: 'professional', label: 'Professional', description: 'Formal and business-appropriate' },
  { value: 'casual',       label: 'Casual',       description: 'Friendly and conversational' },
  { value: 'technical',    label: 'Technical',    description: 'Precise and jargon-friendly' },
];

const VERBOSITY_OPTIONS = [
  { value: 'concise',  label: 'Concise',  description: 'Short and to the point' },
  { value: 'balanced', label: 'Balanced', description: 'Mix of brevity and detail' },
  { value: 'detailed', label: 'Detailed', description: 'Thorough explanations' },
];

const FORMAT_OPTIONS = [
  { value: 'bullets',    label: 'Bullet Points', description: 'Lists and bullet points' },
  { value: 'paragraphs', label: 'Paragraphs',    description: 'Flowing text' },
  { value: 'mixed',      label: 'Mixed',         description: 'Combination of formats' },
];

const LEARNING_STYLE_OPTIONS: { value: LearningStyleType; label: string; desc: string }[] = [
  { value: 'example-based',     label: 'Show me examples',  desc: 'See what good looks like before I try' },
  { value: 'explanation-based',  label: 'Explain it first', desc: 'Walk me through the concepts' },
  { value: 'hands-on',           label: 'Let me try it',    desc: 'I learn by doing and experimenting' },
  { value: 'logic-based',        label: 'Show me the why',  desc: 'I need to understand how it works' },
];

// ─── Display maps ────────────────────────────────────────────────────────────

const SKILL_DISPLAY: Record<string, string> = {
  context_setting:   'Context Setting',
  specificity:       'Prompt Specificity',
  data_security:     'Data Security',
  formatting:        'Output Formatting',
  compliance:        'Compliance Integration',
  clear_framework:   'CLEAR Framework',
  iteration:         'Iterative Improvement',
  audience_awareness:'Audience Awareness',
};

const LEVEL_CONFIG: Record<string, { label: string; className: string }> = {
  emerging:   { label: 'Emerging',   className: 'bg-slate-500/10 text-slate-600 dark:text-slate-400' },
  developing: { label: 'Developing', className: 'bg-blue-500/10 text-blue-700 dark:text-blue-300' },
  proficient: { label: 'Proficient', className: 'bg-green-500/10 text-green-700 dark:text-green-300' },
  advanced:   { label: 'Advanced',   className: 'bg-purple-500/10 text-purple-700 dark:text-purple-300' },
};

const SESSION_ICONS: Record<number, React.ElementType> = {
  1: Sparkles, 2: Bot, 3: Building2, 4: Zap,
};

const SESSION_COLORS: Record<number, string> = {
  1: 'border-purple-500 bg-purple-500',
  2: 'border-blue-500 bg-blue-500',
  3: 'border-amber-500 bg-amber-500',
  4: 'border-green-500 bg-green-500',
};

const LEVEL_COLORS: Record<string, string> = {
  emerging:   'bg-slate-400',
  developing: 'bg-blue-400',
  proficient: 'bg-green-500',
  advanced:   'bg-amber-500',
};

const PLACEMENT_LABELS: Record<number, string> = {
  1: 'Observer',
  2: 'Learner',
  3: 'Practitioner',
  4: 'Champion',
};

// ─── Types ───────────────────────────────────────────────────────────────────

type ProfileTab = 'my-profile' | 'personalization' | 'journey';
type PersonalizationSubtab = 'preferences' | 'data-privacy' | 'memories';
type JourneySubtab = 'progress' | 'skills';

// ─── Tab button ──────────────────────────────────────────────────────────────

function TabBtn({
  active, icon: Icon, label, onClick,
}: {
  active: boolean; icon: React.ElementType; label: string; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
        active
          ? 'border-primary text-primary'
          : 'border-transparent text-muted-foreground hover:text-foreground'
      }`}
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );
}

function SubTabBtn({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
        active
          ? 'bg-primary text-primary-foreground'
          : 'bg-muted text-muted-foreground hover:text-foreground'
      }`}
    >
      {label}
    </button>
  );
}

// ─── Profile page ────────────────────────────────────────────────────────────

export default function Profile() {
  const navigate = useNavigate();
  const { user, profile, progress, loading: authLoading, updateProfile } = useAuth();
  const { toast } = useToast();
  const { config: industryConfig } = useIndustryContent();
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get('tab') as ProfileTab | null;
  const [activeTab, setActiveTab] = useState<ProfileTab>(
    tabParam && ['my-profile', 'personalization', 'journey'].includes(tabParam) ? tabParam : 'my-profile'
  );
  // Support legacy ?tab=settings and ?tab=memories
  useEffect(() => {
    if (tabParam === ('settings' as string) || tabParam === ('memories' as string)) {
      setActiveTab('personalization');
      setSearchParams({ tab: 'personalization' }, { replace: true });
    }
  }, [tabParam]);

  const [personalizationSubtab, setPersonalizationSubtab] = useState<PersonalizationSubtab>('preferences');
  const [journeySubtab, setJourneySubtab] = useState<JourneySubtab>('progress');

  const handleTabChange = (tab: ProfileTab) => {
    setActiveTab(tab);
    setSearchParams({ tab }, { replace: true });
  };

  // ── My Profile state ────────────────────────────────────────────────────
  const [changingStyle, setChangingStyle] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState<LearningStyleType | null>(null);
  const [savingStyle, setSavingStyle] = useState(false);

  const handleSaveLearningStyle = async () => {
    if (!selectedStyle || !user) return;
    setSavingStyle(true);
    const { error } = await supabase
      .from('user_profiles')
      .update({ learning_style: selectedStyle })
      .eq('user_id', user.id);
    if (!error) {
      toast({ title: 'Learning style updated', description: 'Your training will adapt to your new preference.' });
      setChangingStyle(false);
      setSelectedStyle(null);
      // Force profile refresh
      window.location.reload();
    } else {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
    setSavingStyle(false);
  };

  // ── Personalization state ─────────────────────────────────────────────────
  const { preferences, loading: prefLoading, savePreferences } = useAIPreferences();
  const [tone, setTone] = useState('professional');
  const [verbosity, setVerbosity] = useState('balanced');
  const [formatting, setFormatting] = useState('mixed');
  const [roleContext, setRoleContext] = useState('');
  const [customInstructions, setCustomInstructions] = useState('');
  const [saving, setSaving] = useState(false);
  const [deletingConversations, setDeletingConversations] = useState(false);

  useEffect(() => {
    if (preferences) {
      setTone(preferences.tone || 'professional');
      setVerbosity(preferences.verbosity || 'balanced');
      setFormatting(preferences.formatting_preference || 'mixed');
      setRoleContext(preferences.role_context || '');
      setCustomInstructions(preferences.additional_instructions || '');
    }
  }, [preferences]);

  const handleSavePreferences = async () => {
    setSaving(true);
    const result = await savePreferences({
      tone,
      verbosity,
      formatting_preference: formatting,
      role_context: roleContext || null,
      additional_instructions: customInstructions || null,
    });
    if (result.success) {
      toast({ title: 'Preferences saved', description: 'Andrea will use your updated preferences.' });
    } else {
      toast({ title: 'Error', description: result.error, variant: 'destructive' });
    }
    setSaving(false);
  };

  const handleDeleteAllConversations = async () => {
    if (!profile) return;
    setDeletingConversations(true);
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (authUser?.id) {
      await Promise.all([
        (supabase.from('practice_conversations').delete().eq('user_id', authUser.id)),
        (supabase.from('dashboard_conversations').delete().eq('user_id', authUser.id)),
      ]);
    }
    setDeletingConversations(false);
    toast({ title: 'Conversations deleted', description: 'Your conversation history has been permanently deleted.' });
  };

  // ── Memories state ───────────────────────────────────────────────────────
  const { memories, loading: memLoading, createMemory, togglePin, deleteMemory } = useAIMemories();
  const { skillSummary, loading: skillLoading } = useSkillAssessment();
  const [isCreating, setIsCreating] = useState(false);
  const [newContent, setNewContent] = useState('');
  const [memSaving, setMemSaving] = useState(false);

  const handleCreateMemory = async () => {
    if (!newContent.trim()) return;
    setMemSaving(true);
    const result = await createMemory({ content: newContent.trim(), source: 'user_saved' });
    if (result.success) {
      toast({ title: 'Memory saved', description: 'Andrea will remember this.' });
      setIsCreating(false);
      setNewContent('');
    } else {
      toast({ title: 'Error', description: result.error, variant: 'destructive' });
    }
    setMemSaving(false);
  };

  const handleTogglePin = async (id: string, isPinned: boolean) => {
    await togglePin(id, isPinned);
    toast({ title: isPinned ? 'Unpinned' : 'Pinned', description: isPinned ? 'Memory unpinned.' : 'Memory pinned — Andrea will prioritize this.' });
  };

  const handleDeleteMemory = async (id: string) => {
    await deleteMemory(id);
    toast({ title: 'Memory removed', description: 'Andrea will no longer reference this.' });
  };

  const pinnedMemories = memories.filter((m) => m.is_pinned);
  const unpinnedMemories = memories.filter((m) => !m.is_pinned);

  // ── Journey derived data ──────────────────────────────────────────────────
  const prog = progress as unknown as Record<string, unknown>;
  const sessionIds = Object.keys(ALL_SESSION_CONTENT).map(Number).filter((id) => id > 0);
  const overallProgress = computeOverallProgress(progress);

  const getSessionProgressData = (sessionId: number): SessionProgressData | null => {
    if (!progress) return null;
    return (prog[`session_${sessionId}_progress`] as SessionProgressData) || null;
  };

  const allSkillSignals: SkillSignal[] = sessionIds.flatMap((sid) => {
    const data = getSessionProgressData(sid);
    return data?.skillSignals || [];
  });
  const aggregatedSkills = aggregateSkillSignals(allSkillSignals);

  const totalCompleted = sessionIds.reduce((sum, sid) => sum + getCompletedModuleCount(sid, getSessionProgressData(sid)), 0);
  const totalModules = sessionIds.reduce((sum, sid) => sum + getSessionModuleTotal(sid), 0);
  const completedSessions = sessionIds.filter((sid) => !!prog[`session_${sid}_completed`]).length;

  // ── Derived profile info ──────────────────────────────────────────────────
  const roleOption = industryConfig.roles.find((r) => r.value === profile?.intake_role_key)
    || FALLBACK_ROLE_OPTIONS.find((r) => r.key === profile?.intake_role_key);
  const roleLabel = roleOption?.label || profile?.job_role || 'Not set';
  const levelLabel = PLACEMENT_LABELS[profile?.ai_proficiency_level || 1] || 'Observer';

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <AppShell breadcrumbs={[{ label: 'Profile' }]}>
      {/* Sticky tab bar */}
      <div className="sticky top-0 z-20 border-b bg-card px-6">
        <div className="flex">
          <TabBtn active={activeTab === 'my-profile'} icon={User} label="My Profile" onClick={() => handleTabChange('my-profile')} />
          <TabBtn active={activeTab === 'personalization'} icon={Sliders} label="Personalization" onClick={() => handleTabChange('personalization')} />
          <TabBtn active={activeTab === 'journey'} icon={TrendingUp} label="Journey" onClick={() => handleTabChange('journey')} />
        </div>
      </div>

      {/* ── My Profile tab ─────────────────────────────────────────────────── */}
      {activeTab === 'my-profile' && (
        <div className="container mx-auto px-4 py-8 max-w-3xl space-y-6">
          {/* User info card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Profile Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Name</label>
                  <p className="text-sm font-medium mt-1">{profile?.display_name || 'Not set'}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Organization</label>
                  <p className="text-sm font-medium mt-1">{profile?.employer_name || 'Not set'}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Role</label>
                  <p className="text-sm font-medium mt-1">{roleLabel}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Department</label>
                  <p className="text-sm font-medium mt-1">{profile?.department || 'Not set'}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">AI Proficiency Level</label>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="secondary">Level {profile?.ai_proficiency_level || 1}</Badge>
                    <span className="text-sm text-muted-foreground">{levelLabel}</span>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Learning Style</label>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="capitalize">{profile?.learning_style || 'Not set'}</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Learning Style change */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Change Learning Style</CardTitle>
              <CardDescription>Update how training content is delivered to you. This does not affect your progress.</CardDescription>
            </CardHeader>
            <CardContent>
              {!changingStyle ? (
                <Button variant="outline" className="gap-2" onClick={() => { setChangingStyle(true); setSelectedStyle(profile?.learning_style as LearningStyleType || null); }}>
                  <RefreshCw className="h-4 w-4" />
                  Change Learning Style
                </Button>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {LEARNING_STYLE_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => setSelectedStyle(opt.value)}
                        className={`p-3 rounded-lg border text-left transition-colors ${
                          selectedStyle === opt.value
                            ? 'border-primary bg-primary/5 ring-1 ring-primary'
                            : 'border-border hover:bg-muted'
                        }`}
                      >
                        <div className="font-medium text-sm">{opt.label}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">{opt.desc}</div>
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleSaveLearningStyle} disabled={savingStyle || !selectedStyle} className="gap-2">
                      {savingStyle ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                      Save
                    </Button>
                    <Button variant="outline" onClick={() => { setChangingStyle(false); setSelectedStyle(null); }}>Cancel</Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Retake Intake */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Retake Intake Assessment</CardTitle>
              <CardDescription>
                Retake the intake form to update your AI proficiency level and role preferences. Your training progress will not be affected.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="gap-2" onClick={() => navigate('/onboarding?retake=true')}>
                <RefreshCw className="h-4 w-4" />
                Retake Intake Form
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ── Personalization tab ────────────────────────────────────────────── */}
      {activeTab === 'personalization' && (
        <div className="container mx-auto px-4 py-6 max-w-3xl">
          {/* Subtabs */}
          <div className="flex gap-2 mb-6">
            <SubTabBtn active={personalizationSubtab === 'preferences'} label="Personalization" onClick={() => setPersonalizationSubtab('preferences')} />
            <SubTabBtn active={personalizationSubtab === 'data-privacy'} label="Data & Privacy" onClick={() => setPersonalizationSubtab('data-privacy')} />
            <SubTabBtn active={personalizationSubtab === 'memories'} label="Memories" onClick={() => setPersonalizationSubtab('memories')} />
          </div>

          {/* ── Preferences subtab ─────────────────────────────────────────── */}
          {personalizationSubtab === 'preferences' && (
            <>
              {prefLoading ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Tone */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Brain className="h-5 w-5 text-primary" />
                        Response Tone
                      </CardTitle>
                      <CardDescription>How should Andrea talk to you?</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {TONE_OPTIONS.map((opt) => (
                          <button key={opt.value} onClick={() => setTone(opt.value)}
                            className={`p-3 rounded-lg border text-left transition-colors ${tone === opt.value ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-border hover:bg-muted'}`}>
                            <div className="font-medium text-sm">{opt.label}</div>
                            <div className="text-xs text-muted-foreground mt-0.5">{opt.description}</div>
                          </button>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Verbosity */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Response Length</CardTitle>
                      <CardDescription>How detailed should responses be?</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {VERBOSITY_OPTIONS.map((opt) => (
                          <button key={opt.value} onClick={() => setVerbosity(opt.value)}
                            className={`p-3 rounded-lg border text-left transition-colors ${verbosity === opt.value ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-border hover:bg-muted'}`}>
                            <div className="font-medium text-sm">{opt.label}</div>
                            <div className="text-xs text-muted-foreground mt-0.5">{opt.description}</div>
                          </button>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Formatting */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Formatting Style</CardTitle>
                      <CardDescription>How should Andrea format responses?</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {FORMAT_OPTIONS.map((opt) => (
                          <button key={opt.value} onClick={() => setFormatting(opt.value)}
                            className={`p-3 rounded-lg border text-left transition-colors ${formatting === opt.value ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-border hover:bg-muted'}`}>
                            <div className="font-medium text-sm">{opt.label}</div>
                            <div className="text-xs text-muted-foreground mt-0.5">{opt.description}</div>
                          </button>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Role Context */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Your Role Context</CardTitle>
                      <CardDescription>Tell Andrea about your specific role so she can tailor responses</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Textarea value={roleContext} onChange={(e) => setRoleContext(e.target.value)}
                        placeholder="e.g., I'm a credit analyst who reviews commercial loan applications."
                        className="min-h-[100px]" />
                    </CardContent>
                  </Card>

                  {/* Custom Instructions */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Custom Instructions</CardTitle>
                      <CardDescription>Any other preferences for how Andrea should assist you</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Textarea value={customInstructions} onChange={(e) => setCustomInstructions(e.target.value)}
                        placeholder="e.g., Always relate examples to banking. Use analogies when explaining complex concepts."
                        className="min-h-[100px]" />
                    </CardContent>
                  </Card>

                  <div className="flex justify-end">
                    <Button onClick={handleSavePreferences} disabled={saving} className="gap-2">
                      {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                      Save Preferences
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}

          {/* ── Data & Privacy subtab ──────────────────────────────────────── */}
          {personalizationSubtab === 'data-privacy' && (
            <div className="space-y-6">
              <Card className="border-destructive/20">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2 text-destructive">
                    <Trash2 className="h-5 w-5" />
                    Data & Privacy
                  </CardTitle>
                  <CardDescription>
                    Permanently delete your conversation history with Andrea and the practice AI. This cannot be undone.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" className="gap-2" disabled={deletingConversations}>
                        {deletingConversations ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                        Delete All Conversation History
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete all your conversation history. Your memories, skill observations, and training progress will not be affected.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteAllConversations} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                          Yes, delete everything
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </CardContent>
              </Card>
            </div>
          )}

          {/* ── Memories subtab ────────────────────────────────────────────── */}
          {personalizationSubtab === 'memories' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Brain className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">{memories.length} AI Memories</h2>
                    <p className="text-sm text-muted-foreground">Important insights Andrea remembers about you</p>
                  </div>
                </div>
                <Button onClick={() => setIsCreating(true)} className="gap-2">
                  <Plus className="h-4 w-4" />
                  New Memory
                </Button>
              </div>

              {memLoading ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : memories.length === 0 ? (
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center py-8">
                      <BookOpen className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                      <h3 className="font-medium mb-1">No memories yet</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Save important insights from your training sessions.
                      </p>
                      <Button variant="outline" onClick={() => setIsCreating(true)} className="gap-2">
                        <Plus className="h-4 w-4" />
                        Add Your First Memory
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-6">
                  {pinnedMemories.length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
                        <Pin className="h-3.5 w-3.5" /> Pinned ({pinnedMemories.length})
                      </h3>
                      <div className="space-y-3">
                        {pinnedMemories.map((memory) => (
                          <Card key={memory.id} className="border-primary/30 bg-primary/5">
                            <CardContent className="pt-4 pb-3">
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex-1">
                                  <p className="text-sm">{memory.content}</p>
                                  <div className="flex items-center gap-2 mt-2">
                                    {memory.source && <Badge variant="outline" className="text-xs">{memory.source.replace('_', ' ')}</Badge>}
                                    {memory.context && <Badge variant="secondary" className="text-xs">{memory.context}</Badge>}
                                    <span className="text-xs text-muted-foreground">{new Date(memory.created_at).toLocaleDateString()}</span>
                                  </div>
                                </div>
                                <div className="flex gap-1 shrink-0">
                                  <Button variant="ghost" size="sm" onClick={() => handleTogglePin(memory.id, true)} className="h-7 w-7 p-0" title="Unpin">
                                    <PinOff className="h-3.5 w-3.5" />
                                  </Button>
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-destructive hover:text-destructive" title="Delete">
                                        <Trash2 className="h-3.5 w-3.5" />
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>Delete this memory?</AlertDialogTitle>
                                        <AlertDialogDescription>Andrea will no longer reference this memory.</AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => handleDeleteMemory(memory.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}

                  {unpinnedMemories.length > 0 && (
                    <div>
                      {pinnedMemories.length > 0 && (
                        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3">
                          Other Memories ({unpinnedMemories.length})
                        </h3>
                      )}
                      <div className="space-y-3">
                        {unpinnedMemories.map((memory) => (
                          <Card key={memory.id}>
                            <CardContent className="pt-4 pb-3">
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex-1">
                                  <p className="text-sm">{memory.content}</p>
                                  <div className="flex items-center gap-2 mt-2">
                                    {memory.source && <Badge variant="outline" className="text-xs">{memory.source.replace('_', ' ')}</Badge>}
                                    {memory.context && <Badge variant="secondary" className="text-xs">{memory.context}</Badge>}
                                    <span className="text-xs text-muted-foreground">{new Date(memory.created_at).toLocaleDateString()}</span>
                                  </div>
                                </div>
                                <div className="flex gap-1 shrink-0">
                                  <Button variant="ghost" size="sm" onClick={() => handleTogglePin(memory.id, false)} className="h-7 w-7 p-0" title="Pin">
                                    <Pin className="h-3.5 w-3.5" />
                                  </Button>
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-destructive hover:text-destructive" title="Delete">
                                        <Trash2 className="h-3.5 w-3.5" />
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>Delete this memory?</AlertDialogTitle>
                                        <AlertDialogDescription>Andrea will no longer reference this memory.</AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => handleDeleteMemory(memory.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Create memory dialog */}
          <Dialog open={isCreating} onOpenChange={setIsCreating}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>New Memory</DialogTitle>
              </DialogHeader>
              <div className="py-4">
                <Textarea value={newContent} onChange={(e) => setNewContent(e.target.value)}
                  placeholder="e.g., I prefer examples using commercial lending scenarios."
                  className="min-h-[120px]" />
                <p className="text-xs text-muted-foreground mt-2">Andrea will use this to personalize your training experience.</p>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => { setIsCreating(false); setNewContent(''); }}>Cancel</Button>
                <Button onClick={handleCreateMemory} disabled={memSaving || !newContent.trim()} className="gap-2">
                  {memSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                  Save Memory
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      )}

      {/* ── Journey tab ────────────────────────────────────────────────────── */}
      {activeTab === 'journey' && (
        <div className="container mx-auto px-4 py-6 space-y-6">
          {/* Subtabs */}
          <div className="flex gap-2">
            <SubTabBtn active={journeySubtab === 'progress'} label="Progress" onClick={() => setJourneySubtab('progress')} />
            <SubTabBtn active={journeySubtab === 'skills'} label="Skills" onClick={() => setJourneySubtab('skills')} />
          </div>

          {/* ── Progress subtab ─────────────────────────────────────────────── */}
          {journeySubtab === 'progress' && (
            <>
              {/* Overall stats */}
              <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
                {[
                  { value: `${Math.round(overallProgress)}%`, label: 'Overall Progress' },
                  { value: `${totalCompleted}/${totalModules}`, label: 'Modules Completed' },
                  { value: `${completedSessions}/${sessionIds.length}`, label: 'Sessions Completed' },
                  { value: aggregatedSkills.filter((s) => (s.level as string) === 'proficient' || (s.level as string) === 'advanced').length, label: 'Skills Mastered' },
                ].map(({ value, label }) => (
                  <Card key={label}>
                    <CardContent className="p-4 text-center">
                      <div className="text-3xl font-bold text-primary">{value}</div>
                      <div className="text-xs text-muted-foreground mt-1">{label}</div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Timeline */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Learning Timeline</CardTitle>
                  <CardDescription>Your path through the SMILE curriculum</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="relative">
                    <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-border" />
                    <div className="space-y-6">
                      {sessionIds.map((sessionId) => {
                        const isCompleted = !!prog[`session_${sessionId}_completed`];
                        const data = getSessionProgressData(sessionId);
                        const sessionPct = isCompleted ? 100 : computeSessionProgress(sessionId, data);
                        const Icon = SESSION_ICONS[sessionId] || Sparkles;
                        const session = ALL_SESSION_CONTENT[sessionId];
                        const completedCount = getCompletedModuleCount(sessionId, data);
                        const moduleTotal = getSessionModuleTotal(sessionId);
                        const color = SESSION_COLORS[sessionId] || 'border-primary bg-primary';
                        const completedAt = data?.capstoneData?.completedAt;

                        return (
                          <div key={sessionId} className="relative flex gap-4">
                            <div className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 ${
                              isCompleted ? `${color} text-white`
                                : sessionPct > 0 ? 'border-primary bg-background text-primary'
                                : 'border-muted bg-background text-muted-foreground'
                            }`}>
                              {isCompleted ? <CheckCircle className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                            </div>
                            <div className="flex-1 pb-2">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold">Session {sessionId}: {session?.title}</h3>
                                {isCompleted && <Badge className="bg-green-500/10 text-green-600 border-green-500/30 text-[10px]">Complete</Badge>}
                              </div>
                              <p className="text-sm text-muted-foreground mb-2">{session?.description}</p>
                              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                <span>{completedCount}/{moduleTotal} modules</span>
                                {completedAt && <span>Completed {new Date(completedAt).toLocaleDateString()}</span>}
                              </div>
                              <Progress value={sessionPct} className="h-1.5 mt-2 max-w-xs" />
                              {session && (
                                <div className="flex gap-1 mt-2">
                                  {session.modules.map((mod) => {
                                    const eng = data?.moduleEngagement?.[mod.id];
                                    const legacy = new Set(data?.completedModules || []);
                                    const done = eng?.completed || legacy.has(mod.id);
                                    const started = eng?.chatStarted || eng?.contentViewed;
                                    return (
                                      <div key={mod.id}
                                        className={`h-2 flex-1 rounded-full ${done ? 'bg-green-500' : started ? 'bg-amber-400' : 'bg-muted'}`}
                                        title={`${mod.title}: ${done ? 'Completed' : started ? 'In Progress' : 'Not Started'}`}
                                      />
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick links */}
              <div className="grid gap-4 md:grid-cols-3">
                <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/certificates')}>
                  <CardContent className="p-4 flex items-center gap-3">
                    <Award className="h-8 w-8 text-amber-600" />
                    <div>
                      <p className="font-medium">Certificates</p>
                      <p className="text-xs text-muted-foreground">{completedSessions} earned</p>
                    </div>
                  </CardContent>
                </Card>
                <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/prompts')}>
                  <CardContent className="p-4 flex items-center gap-3">
                    <BookOpen className="h-8 w-8 text-primary" />
                    <div>
                      <p className="font-medium">Prompt Library</p>
                      <p className="text-xs text-muted-foreground">Your saved prompts</p>
                    </div>
                  </CardContent>
                </Card>
                <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/electives')}>
                  <CardContent className="p-4 flex items-center gap-3">
                    <Sparkles className="h-8 w-8 text-purple-600" />
                    <div>
                      <p className="font-medium">Elective Paths</p>
                      <p className="text-xs text-muted-foreground">Deep-dive topics</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}

          {/* ── Skills subtab ───────────────────────────────────────────────── */}
          {journeySubtab === 'skills' && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  Skill Assessment
                </CardTitle>
                <CardDescription>Skills observed by Andrea during your training sessions</CardDescription>
              </CardHeader>
              <CardContent>
                {aggregatedSkills.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="mx-auto h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-3">
                      <Target className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Skill observations will appear here as you work through modules and practice prompts.
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-3 md:grid-cols-2">
                    {aggregatedSkills.map((skill) => {
                      const levelWidth: Record<string, number> = { emerging: 25, developing: 50, proficient: 75, advanced: 100 };
                      return (
                        <div key={skill.skill} className="p-3 rounded-lg border bg-muted/20">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">{SKILL_DISPLAY[skill.skill] || skill.skill}</span>
                            <Badge variant="outline" className={`text-[10px] capitalize ${
                              (skill.level as string) === 'proficient' || (skill.level as string) === 'advanced'
                                ? 'border-green-500/30 text-green-600' : ''
                            }`}>{skill.level}</Badge>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div className={`h-full rounded-full transition-all ${LEVEL_COLORS[skill.level] || 'bg-primary'}`}
                              style={{ width: `${levelWidth[skill.level] || 25}%` }} />
                          </div>
                          {skill.displayName && (
                            <p className="text-xs text-muted-foreground mt-1">Last observed: {skill.displayName}</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

        </div>
      )}
    </AppShell>
  );
}
