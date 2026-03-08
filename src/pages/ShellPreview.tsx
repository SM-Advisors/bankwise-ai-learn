import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Compass, BookOpen, Zap, CheckCircle, Circle, Lock } from 'lucide-react';
import { AppShell } from '@/components/shell';
import {
  SmileCard,
  EmptyState,
  SkeletonLoader,
  ProgressStrip,
} from '@/components/smile';
import { useFeatureGates } from '@/hooks/useFeatureGates';
import { LEARNER_ZONES } from '@/config/zones';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

// ─── Mock data ────────────────────────────────────────────────────────────────

const MOCK_MODULES = [
  { id: '1-1', title: 'Personalization',       state: 'completed'    as const },
  { id: '1-2', title: 'Interface Orientation',  state: 'completed'    as const },
  { id: '1-3', title: 'Basic Interaction',      state: 'in_progress'  as const },
  { id: '1-4', title: 'Your First Win',         state: 'not_started'  as const },
  { id: '1-5', title: 'Iteration',              state: 'not_started'  as const },
  { id: '1-6', title: 'Self-Review Loops',      state: 'not_started'  as const },
  { id: '1-7', title: 'Sandbox',                state: 'not_started'  as const },
];

// ─── FeatureGateDemo ──────────────────────────────────────────────────────────
//
// Live readout of which zones are currently unlocked for the signed-in user.

function FeatureGateDemo() {
  const {
    isUnlocked,
    unlockedZones,
    canAccessLearn,
    canAccessExplore,
    canAccessCommunity,
  } = useFeatureGates();

  const conditions = [
    {
      label: 'onboarding_completed',
      met: isUnlocked('onboarding_completed'),
      unlocks: ['Learn', 'Profile'],
    },
    {
      label: 'session_1_module_2_done',
      met: isUnlocked('session_1_module_2_done'),
      unlocks: ['Explore'],
    },
    {
      label: 'first_practice_done',
      met: isUnlocked('first_practice_done'),
      unlocks: ['Community'],
    },
    {
      label: 'session_1_completed',
      met: isUnlocked('session_1_completed'),
      unlocks: [],
    },
  ];

  return (
    <SmileCard variant="elevated" className="space-y-4">
      <div className="flex items-center gap-2">
        <Zap className="h-4 w-4 text-accent" />
        <h3 className="text-sm font-semibold">Live Feature Gate State</h3>
        <Badge variant="secondary" className="ml-auto text-xs">
          {unlockedZones.length} / {LEARNER_ZONES.length} zones unlocked
        </Badge>
      </div>

      <div className="space-y-2">
        {conditions.map((c) => (
          <div
            key={c.label}
            className={cn(
              'flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs transition-colors',
              c.met ? 'bg-accent/10 text-accent' : 'bg-muted text-muted-foreground'
            )}
          >
            {c.met ? (
              <CheckCircle className="h-3.5 w-3.5 shrink-0" />
            ) : (
              <Circle className="h-3.5 w-3.5 shrink-0" />
            )}
            <code className="font-mono flex-1">{c.label}</code>
            {c.unlocks.length > 0 && (
              <span className="text-muted-foreground">
                → {c.unlocks.join(', ')}
              </span>
            )}
          </div>
        ))}
      </div>

      <p className="text-xs text-muted-foreground border-t pt-3">
        NavRail only renders zones where the condition above is met. Locked zones are
        absent from the DOM entirely — no disabled states, no visible locks.
      </p>
    </SmileCard>
  );
}

// ─── ShellPreview ─────────────────────────────────────────────────────────────

export default function ShellPreview() {
  const navigate = useNavigate();
  const [currentModule, setCurrentModule] = useState('1-2');
  const [showLoading, setShowLoading] = useState(false);

  const breadcrumbs = [
    { label: 'SMILE', path: '/dashboard' },
    { label: 'Shell Preview' },
  ];

  return (
    <AppShell breadcrumbs={breadcrumbs}>
      <div className="container mx-auto max-w-4xl py-8 px-6 space-y-10">

        {/* Header */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold">Shell Preview — Phase 0</h1>
            <Badge variant="outline" className="text-xs">feature/phase-0-shell</Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Live demo of the AppShell, NavRail, TopBar, AndreaDock, and SMILE primitives.
            No existing routes were modified to render this page.
          </p>
        </div>

        {/* ─── ProgressStrip ─────────────────────────────────────────────── */}
        <section className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            ProgressStrip
          </h2>
          <SmileCard variant="default">
            <p className="text-xs text-muted-foreground mb-3">
              Click a module to set it as current:
            </p>
            <ProgressStrip
              modules={MOCK_MODULES}
              currentModuleId={currentModule}
              onModuleClick={setCurrentModule}
            />
          </SmileCard>
        </section>

        {/* ─── SmileCard variants ─────────────────────────────────────────── */}
        <section className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            SmileCard Variants
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <SmileCard variant="default">
              <p className="text-xs font-semibold mb-1">Default</p>
              <p className="text-xs text-muted-foreground">
                Standard bordered card. Used for content display with no click action.
              </p>
            </SmileCard>

            <SmileCard
              variant="interactive"
              onClick={() => navigate('/dashboard')}
            >
              <p className="text-xs font-semibold mb-1">Interactive</p>
              <p className="text-xs text-muted-foreground">
                Hover to see accent border + shadow lift. Keyboard accessible. Click to go to Dashboard.
              </p>
            </SmileCard>

            <SmileCard variant="elevated">
              <p className="text-xs font-semibold mb-1">Elevated</p>
              <p className="text-xs text-muted-foreground">
                Permanent shadow elevation. Used for featured content or callout cards.
              </p>
            </SmileCard>
          </div>

          {/* Loading state toggle */}
          <SmileCard
            variant="interactive"
            onClick={() => setShowLoading((v) => !v)}
          >
            <p className="text-xs font-semibold mb-1">
              isLoading={showLoading ? 'true' : 'false'} — click to toggle
            </p>
            {showLoading ? (
              <SkeletonLoader type="card" count={1} />
            ) : (
              <p className="text-xs text-muted-foreground">
                SmileCard passes <code>isLoading</code> to SkeletonLoader internally.
              </p>
            )}
          </SmileCard>
        </section>

        {/* ─── SkeletonLoader variants ────────────────────────────────────── */}
        <section className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            SkeletonLoader Types
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <SmileCard variant="default">
              <p className="text-xs font-semibold mb-3">text (count=4)</p>
              <SkeletonLoader type="text" count={4} />
            </SmileCard>

            <SmileCard variant="default">
              <p className="text-xs font-semibold mb-3">list-item (count=3)</p>
              <SkeletonLoader type="list-item" count={3} />
            </SmileCard>

            <SmileCard variant="default">
              <p className="text-xs font-semibold mb-3">module-strip (count=5)</p>
              <SkeletonLoader type="module-strip" count={5} />
            </SmileCard>

            <SmileCard variant="default">
              <p className="text-xs font-semibold mb-3">card (count=1)</p>
              <SkeletonLoader type="card" count={1} />
            </SmileCard>
          </div>
        </section>

        {/* ─── EmptyState variants ────────────────────────────────────────── */}
        <section className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            EmptyState
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <SmileCard variant="default">
              <EmptyState
                icon={Compass}
                title="Explore unlocks soon"
                description="Complete Session 1, Module 3 — Basic Interaction — to unlock this zone."
              />
            </SmileCard>

            <SmileCard variant="default">
              <EmptyState
                icon={Lock}
                title="Community is coming"
                description="Start your first practice conversation to join the learner community."
                actionLabel="Go to Learn"
                onAction={() => navigate('/training/1')}
              />
            </SmileCard>
          </div>
        </section>

        {/* ─── Feature Gate Demo ──────────────────────────────────────────── */}
        <section className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Feature Gate State (Live)
          </h2>
          <FeatureGateDemo />
        </section>

        {/* ─── Andrea Dock note ───────────────────────────────────────────── */}
        <section className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            AndreaDock
          </h2>
          <SmileCard variant="default">
            <div className="flex items-start gap-3">
              <BookOpen className="h-5 w-5 text-accent shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-medium">Andrea is live in the bottom-right corner</p>
                <p className="text-xs text-muted-foreground">
                  Click the avatar to open the chat panel (Active state). The panel shows a
                  placeholder message — real AI coaching connects in Phase 2. Programmatic
                  nudge triggers (Attentive state with preview bubble) are wired for Phase 3.
                </p>
              </div>
            </div>
          </SmileCard>
        </section>

      </div>
    </AppShell>
  );
}
