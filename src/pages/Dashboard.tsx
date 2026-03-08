import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { AppShell } from '@/components/shell';
import { SkeletonLoader } from '@/components/smile';
import { useFeatureGates } from '@/hooks/useFeatureGates';
import {
  computeSessionProgress,
  getCompletedModuleCount,
  getSessionModuleTotal,
} from '@/utils/computeProgress';
import { aggregateSkillSignals } from '@/utils/deriveSkillSignals';
import type { SessionProgressData, SkillSignal } from '@/types/progress';
import { CheckCircle, Play, Sparkles, Bot, Building2, Zap, Lock, Users, Wrench } from 'lucide-react';
import andreaCoach from '@/assets/andrea-coach.png';
import { BrainstormPanel } from '@/components/BrainstormPanel';
import { useTour } from '@/hooks/useTour';
import { DASHBOARD_STEPS } from '@/constants/tourSteps';

// ─── Session metadata ─────────────────────────────────────────────────────────

const SESSIONS = [
  {
    id: 1,
    title: 'Foundation & Early Wins',
    description: 'Build confidence with AI through conversation-first computing — every exercise works, every win is real.',
    icon: Sparkles,
    duration: '~90 min',
  },
  {
    id: 2,
    title: 'Structured Interaction, Models & Tools',
    description: 'Move from casual conversation to professional-grade AI use with frameworks, models, and tools.',
    icon: Building2,
    duration: '~90 min',
  },
  {
    id: 3,
    title: 'Agents',
    description: 'Understand what agents are, why they exist, and build one layer by layer.',
    icon: Bot,
    duration: '~90 min',
  },
  {
    id: 4,
    title: 'Functional Agents',
    description: 'Use agents already built into the tools you use every day — spreadsheets, presentations, email.',
    icon: Zap,
    duration: '~60 min',
  },
  {
    id: 5,
    title: 'Build Your Frankenstein',
    description: 'Design your own AI stack — stitch the pieces together in the way that serves your work.',
    icon: Wrench,
    duration: '~90 min',
  },
] as const;

type SessionMeta = (typeof SESSIONS)[number];

// ─── Home state ───────────────────────────────────────────────────────────────
//
// brand_new        — onboarding done, nothing started yet
// mid_session      — currently in progress on a session
// between_sessions — previous session done, next not yet started
// all_complete     — all sessions finished

type HomeState = 'brand_new' | 'mid_session' | 'between_sessions' | 'all_complete';

// ─── Dashboard ────────────────────────────────────────────────────────────────

export default function Dashboard() {
  const navigate = useNavigate();
  const { profile, progress, loading } = useAuth();
  const { canAccessCommunity } = useFeatureGates();
  const { isCompleted: tourDone, startTour } = useTour('dashboard');

  // Auto-trigger dashboard tour on first visit
  useEffect(() => {
    if (!loading && profile && !tourDone) {
      const timeout = setTimeout(() => startTour(DASHBOARD_STEPS), 800);
      return () => clearTimeout(timeout);
    }
  }, [loading, profile, tourDone]); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading || !profile) {
    return (
      <AppShell breadcrumbs={[{ label: 'Home' }]}>
        <div className="flex justify-center w-full px-4 py-10"><div className="w-full max-w-2xl space-y-4">
          <SkeletonLoader type="card" count={2} />
        </div></div>
      </AppShell>
    );
  }

  // ── Helpers ────────────────────────────────────────────────────────────────

  function getSessionProgressData(sessionId: number): SessionProgressData | null {
    if (!progress) return null;
    return ((progress as any)[`session_${sessionId}_progress`] as SessionProgressData) || null;
  }

  const sessionCompleted = (id: number) => !!(progress as any)?.[`session_${id}_completed`];

  const currentSession = Math.min(profile.current_session || 1, 5);
  const currentSessionData = getSessionProgressData(currentSession);
  const currentSessionInfo: SessionMeta = SESSIONS[currentSession - 1];

  function deriveHomeState(): HomeState {
    if (sessionCompleted(5)) return 'all_complete';

    const completedInCurrent = getCompletedModuleCount(currentSession, currentSessionData);
    if (completedInCurrent > 0) return 'mid_session';

    const prevDone = currentSession > 1 && sessionCompleted(currentSession - 1);
    if (prevDone) return 'between_sessions';

    return 'brand_new';
  }

  const homeState = deriveHomeState();
  const sessionPct = computeSessionProgress(currentSession, currentSessionData);
  const completedCount = getCompletedModuleCount(currentSession, currentSessionData);
  const moduleTotal = getSessionModuleTotal(currentSession);

  const allSkillSignals: SkillSignal[] = [1, 2, 3, 4, 5].flatMap((sid) => {
    const data = getSessionProgressData(sid);
    return data?.skillSignals || [];
  });
  const topSkills = aggregateSkillSignals(allSkillSignals)
    .filter((s) => s.level === 'proficient')
    .slice(0, 4);

  return (
    <AppShell breadcrumbs={[{ label: 'Home' }]} topBarActions={homeState !== 'brand_new' ? <BrainstormPanel compact /> : undefined}>
      <div className="w-full px-4 py-10 flex-1 flex items-center justify-center">
      <div className="w-full max-w-[60%] max-md:max-w-full">
        {homeState === 'brand_new' && (
          <BrandNewView
            name={profile.display_name || 'there'}
            session={currentSessionInfo}
            onStart={() => navigate(`/training/${currentSession}`)}
          />
        )}

        {homeState === 'mid_session' && (
          <MidSessionView
            name={profile.display_name || 'there'}
            session={currentSessionInfo}
            completedCount={completedCount}
            moduleTotal={moduleTotal}
            sessionPct={sessionPct}
            onContinue={() => navigate(`/training/${currentSession}`)}
          />
        )}

        {homeState === 'between_sessions' && (
          <BetweenSessionsView
            prevSession={SESSIONS[currentSession - 2]}
            nextSession={currentSessionInfo}
            canAccessCommunity={canAccessCommunity}
            onStart={() => navigate(`/training/${currentSession}`)}
            onCommunity={() => navigate('/community')}
          />
        )}

        {homeState === 'all_complete' && (
          <AllCompleteView
            name={profile.display_name || 'there'}
            topSkills={topSkills}
            canAccessCommunity={canAccessCommunity}
            onExplore={() => navigate('/electives')}
            onCommunity={() => navigate('/community')}
          />
        )}

        {/* Community unlock hint */}
        {!canAccessCommunity && homeState !== 'brand_new' && (
          <div className="mt-5 flex items-center gap-3 px-4 py-3 rounded-lg border border-dashed border-muted-foreground/20">
            <div className="p-1.5 rounded-md bg-muted shrink-0">
              <Users className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-muted-foreground">Community Zone</p>
              <p className="text-xs text-muted-foreground/70">Complete your first practice chat to unlock peer discussions and sharing.</p>
            </div>
            <Lock className="h-3.5 w-3.5 text-muted-foreground/50 shrink-0" />
          </div>
        )}

        {/* AI Brainstorm removed from here — now in top-right via AppShell headerRight */}
      </div>
      </div>

      
    </AppShell>
  );
}

// ─── State views ──────────────────────────────────────────────────────────────

function BrandNewView({
  name,
  session,
  onStart,
}: {
  name: string;
  session: SessionMeta;
  onStart: () => void;
}) {
  const Icon = session.icon;
  return (
    <div className="space-y-5">
      {/* Andrea greeting */}
      <div className="flex items-start gap-3">
        <img src={andreaCoach} alt="Andrea" className="h-12 w-12 rounded-full object-cover shrink-0" />
        <div className="relative bg-muted/50 rounded-2xl rounded-tl-none px-4 py-3">
          <p className="text-xs font-semibold text-accent uppercase tracking-wide mb-1">Andrea</p>
          <p className="text-sm text-foreground leading-relaxed">
            Hi, I'm Andrea. Click below to begin your AI Journey.
          </p>
        </div>
      </div>

      {/* Session card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start gap-4 mb-6">
            <div className="p-3 rounded-lg bg-primary/10 text-primary shrink-0">
              <Icon className="h-6 w-6" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground mb-1">Session 1 · {session.duration}</p>
              <h2 className="text-xl font-semibold mb-1.5">{session.title}</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">{session.description}</p>
            </div>
          </div>
          <Button className="w-full gap-2" size="lg" onClick={onStart}>
            <Play className="h-4 w-4" />
            Begin Session 1
          </Button>
          <p className="text-xs text-muted-foreground text-center mt-2">
            You can pause and resume anytime — your progress is saved automatically.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function MidSessionView({
  name,
  session,
  completedCount,
  moduleTotal,
  sessionPct,
  onContinue,
}: {
  name: string;
  session: SessionMeta;
  completedCount: number;
  moduleTotal: number;
  sessionPct: number;
  onContinue: () => void;
}) {
  const Icon = session.icon;
  return (
    <div className="space-y-5">
      {/* Andrea nudge */}
      <div className="flex items-start gap-3">
        <img src={andreaCoach} alt="Andrea" className="h-12 w-12 rounded-full object-cover shrink-0" />
        <div className="relative bg-muted/50 rounded-2xl rounded-tl-none px-4 py-3">
          <p className="text-xs font-semibold text-accent uppercase tracking-wide mb-1">Andrea</p>
          <p className="text-sm text-foreground">Hi, I'm Andrea. Click below to continue your AI Journey.</p>
        </div>
      </div>

      {/* Current session card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start gap-4 mb-5">
            <div className="p-3 rounded-lg bg-primary/10 text-primary shrink-0">
              <Icon className="h-6 w-6" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground mb-1">Session {session.id} · In progress</p>
              <h2 className="text-xl font-semibold">{session.title}</h2>
            </div>
          </div>

          <div className="mb-5">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-muted-foreground">
                {completedCount} of {moduleTotal} modules complete
              </span>
              <span className="font-medium text-primary">{sessionPct}%</span>
            </div>
            <Progress value={sessionPct} className="h-2" />
          </div>

          <Button className="w-full gap-2" size="lg" onClick={onContinue}>
            <Play className="h-4 w-4" />
            Continue
          </Button>
          <p className="text-xs text-muted-foreground text-center mt-2">
            Your progress is saved — pick up right where you left off.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function BetweenSessionsView({
  prevSession,
  nextSession,
  canAccessCommunity,
  onStart,
  onCommunity,
}: {
  prevSession: SessionMeta;
  nextSession: SessionMeta;
  canAccessCommunity: boolean;
  onStart: () => void;
  onCommunity: () => void;
}) {
  const Icon = nextSession.icon;
  return (
    <div className="space-y-5">
      {/* Completion badge */}
      <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-green-500/10 border border-green-500/20">
        <CheckCircle className="h-5 w-5 text-green-600 shrink-0" />
        <span className="text-sm font-medium text-green-700">
          Session {prevSession.id}: {prevSession.title} — complete
        </span>
      </div>

      {/* Next session card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start gap-4 mb-6">
            <div className="p-3 rounded-lg bg-primary/10 text-primary shrink-0">
              <Icon className="h-6 w-6" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground mb-1">
                Session {nextSession.id} · {nextSession.duration}
              </p>
              <h2 className="text-xl font-semibold mb-1.5">{nextSession.title}</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {nextSession.description}
              </p>
            </div>
          </div>
          <Button className="w-full gap-2" size="lg" onClick={onStart}>
            <Play className="h-4 w-4" />
            Start Session {nextSession.id}
          </Button>
        </CardContent>
      </Card>

      {/* Community highlight — only if unlocked */}
      {canAccessCommunity && (
        <button
          onClick={onCommunity}
          className="w-full text-left px-4 py-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
        >
          <p className="text-xs text-muted-foreground mb-0.5">From the community</p>
          <p className="text-sm font-medium">See what your peers are sharing →</p>
        </button>
      )}
    </div>
  );
}

function AllCompleteView({
  name,
  topSkills,
  canAccessCommunity,
  onExplore,
  onCommunity,
}: {
  name: string;
  topSkills: { skill: string; displayName: string }[];
  canAccessCommunity: boolean;
  onExplore: () => void;
  onCommunity: () => void;
}) {
  return (
    <div className="space-y-5">
      <Card>
        <CardContent className="p-8 text-center">
          <div className="inline-flex items-center justify-center h-14 w-14 rounded-full bg-green-500/10 text-green-600 mb-5">
            <CheckCircle className="h-7 w-7" />
          </div>
          <h2 className="text-2xl font-semibold mb-2">
            You've completed all sessions, {name}.
          </h2>
          <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
            You've built a real foundation in AI. What's next is applying it at depth.
          </p>

          {topSkills.length > 0 && (
            <div className="flex flex-wrap justify-center gap-2 mb-6">
              {topSkills.map((s) => (
                <span
                  key={s.skill}
                  className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-green-500/10 text-green-700 border border-green-500/20 font-medium"
                >
                  <CheckCircle className="h-3 w-3" />
                  {s.displayName}
                </span>
              ))}
            </div>
          )}

          <Button className="w-full gap-2" size="lg" onClick={onExplore}>
            Explore Electives
          </Button>

          {canAccessCommunity && (
            <Button
              variant="ghost"
              className="w-full mt-2"
              onClick={onCommunity}
            >
              Visit Community
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

