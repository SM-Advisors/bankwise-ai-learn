import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  ArrowLeft, TrendingUp, CheckCircle, Circle, Loader2,
  Sparkles, Bot, Building2, Zap, BookOpen, Award, Target,
} from 'lucide-react';
import { ALL_SESSION_CONTENT } from '@/data/trainingContent';
import { computeOverallProgress, computeSessionProgress, getCompletedModuleCount, getSessionModuleTotal } from '@/utils/computeProgress';
import { aggregateSkillSignals } from '@/utils/deriveSkillSignals';
import type { SessionProgressData, SkillSignal } from '@/types/progress';

const SESSION_ICONS: Record<number, React.ElementType> = {
  1: Sparkles,
  2: Bot,
  3: Building2,
  4: Zap,
};

const SESSION_COLORS: Record<number, string> = {
  1: 'border-purple-500 bg-purple-500',
  2: 'border-blue-500 bg-blue-500',
  3: 'border-amber-500 bg-amber-500',
  4: 'border-green-500 bg-green-500',
};

const SKILL_DISPLAY: Record<string, string> = {
  context_setting: 'Context Setting',
  specificity: 'Prompt Specificity',
  data_security: 'Data Security',
  formatting: 'Output Formatting',
  compliance: 'Compliance Integration',
  clear_framework: 'CLEAR Framework',
  iteration: 'Iterative Improvement',
  audience_awareness: 'Audience Awareness',
};

const LEVEL_COLORS: Record<string, string> = {
  emerging: 'bg-slate-400',
  developing: 'bg-blue-400',
  proficient: 'bg-green-500',
  advanced: 'bg-amber-500',
};

export default function AIJourney() {
  const navigate = useNavigate();
  const { profile, progress, loading } = useAuth();

  if (loading || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const prog = progress as Record<string, unknown>;
  const sessionIds = Object.keys(ALL_SESSION_CONTENT).map(Number).filter((id) => id > 0);
  const overallProgress = computeOverallProgress(progress);

  const getSessionProgressData = (sessionId: number): SessionProgressData | null => {
    if (!progress) return null;
    const key = `session_${sessionId}_progress`;
    return (prog[key] as SessionProgressData) || null;
  };

  // Aggregate all skill signals
  const allSkillSignals: SkillSignal[] = sessionIds.flatMap((sid) => {
    const data = getSessionProgressData(sid);
    return data?.skillSignals || [];
  });
  const aggregatedSkills = aggregateSkillSignals(allSkillSignals);

  // Total stats
  const totalCompleted = sessionIds.reduce(
    (sum, sid) => sum + getCompletedModuleCount(sid, getSessionProgressData(sid)),
    0
  );
  const totalModules = sessionIds.reduce(
    (sum, sid) => sum + getSessionModuleTotal(sid),
    0
  );
  const completedSessions = sessionIds.filter((sid) => !!prog[`session_${sid}_completed`]).length;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-xl font-display font-bold flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              My AI Journey
            </h1>
            <p className="text-sm text-muted-foreground">
              Track your growth from AI beginner to AI-native professional
            </p>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Overall Stats */}
        <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-bold text-primary">{Math.round(overallProgress)}%</div>
              <div className="text-xs text-muted-foreground mt-1">Overall Progress</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-bold text-primary">{totalCompleted}/{totalModules}</div>
              <div className="text-xs text-muted-foreground mt-1">Modules Completed</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-bold text-primary">{completedSessions}/{sessionIds.length}</div>
              <div className="text-xs text-muted-foreground mt-1">Sessions Completed</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-3xl font-bold text-primary">
                {aggregatedSkills.filter((s) => s.level === 'proficient' || s.level === 'advanced').length}
              </div>
              <div className="text-xs text-muted-foreground mt-1">Skills Mastered</div>
            </CardContent>
          </Card>
        </div>

        {/* Timeline */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Learning Timeline</CardTitle>
            <CardDescription>Your path through the SMILE curriculum</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative">
              {/* Vertical line */}
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
                      {/* Timeline node */}
                      <div className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 ${
                        isCompleted
                          ? `${color} text-white`
                          : sessionPct > 0
                          ? 'border-primary bg-background text-primary'
                          : 'border-muted bg-background text-muted-foreground'
                      }`}>
                        {isCompleted ? (
                          <CheckCircle className="h-5 w-5" />
                        ) : (
                          <Icon className="h-5 w-5" />
                        )}
                      </div>

                      {/* Session content */}
                      <div className="flex-1 pb-2">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">Session {sessionId}: {session?.title}</h3>
                          {isCompleted && (
                            <Badge className="bg-green-500/10 text-green-600 border-green-500/30 text-[10px]">
                              Complete
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{session?.description}</p>

                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>{completedCount}/{moduleTotal} modules</span>
                          {completedAt && (
                            <span>Completed {new Date(completedAt).toLocaleDateString()}</span>
                          )}
                        </div>

                        <Progress value={sessionPct} className="h-1.5 mt-2 max-w-xs" />

                        {/* Module dots */}
                        {session && (
                          <div className="flex gap-1 mt-2">
                            {session.modules.map((mod, i) => {
                              const eng = data?.moduleEngagement?.[mod.id];
                              const legacy = new Set(data?.completedModules || []);
                              const done = eng?.completed || legacy.has(mod.id);
                              const started = eng?.chatStarted || eng?.contentViewed;
                              return (
                                <div
                                  key={mod.id}
                                  className={`h-2 flex-1 rounded-full ${
                                    done ? 'bg-green-500' : started ? 'bg-amber-400' : 'bg-muted'
                                  }`}
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

        {/* Skills Radar */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Skill Assessment
            </CardTitle>
            <CardDescription>
              Skills observed by Andrea during your training sessions
            </CardDescription>
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
                  const levelWidth: Record<string, number> = {
                    emerging: 25,
                    developing: 50,
                    proficient: 75,
                    advanced: 100,
                  };

                  return (
                    <div key={skill.skill} className="p-3 rounded-lg border bg-muted/20">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">
                          {SKILL_DISPLAY[skill.skill] || skill.skill}
                        </span>
                        <Badge
                          variant="outline"
                          className={`text-[10px] capitalize ${
                            skill.level === 'proficient' || skill.level === 'advanced'
                              ? 'border-green-500/30 text-green-600'
                              : ''
                          }`}
                        >
                          {skill.level}
                        </Badge>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${LEVEL_COLORS[skill.level] || 'bg-primary'}`}
                          style={{ width: `${levelWidth[skill.level] || 25}%` }}
                        />
                      </div>
                      {skill.displayName && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Last observed: {skill.displayName}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Links */}
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
      </div>
    </div>
  );
}
