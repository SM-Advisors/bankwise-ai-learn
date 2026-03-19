import { useNavigate } from 'react-router-dom';
import { AppShell } from '@/components/shell';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  BookOpen, Lightbulb, Cpu, Award, ChevronRight, Lock, CheckCircle,
} from 'lucide-react';

// ─── Explore zone — feature hub ──────────────────────────────────────────────
//
// Unlocked after module 1-3 (Basic Interaction). Groups all "explore more" features:
// Prompt Library, My Ideas, Electives, Certificates, and Sandboxes.

const FEATURES = [
  {
    id: 'prompts',
    icon: BookOpen,
    title: 'Prompt Library',
    description: 'Reusable prompts you\'ve saved. Refine them, share them, build on them.',
    path: '/prompts',
    color: 'text-blue-600',
    bg: 'bg-blue-500/8',
  },
  {
    id: 'ideas',
    icon: Lightbulb,
    title: 'My Ideas',
    description: 'AI use cases you want to explore. Capture them before they disappear.',
    path: '/ideas',
    color: 'text-yellow-600',
    bg: 'bg-yellow-500/8',
  },
  {
    id: 'electives',
    icon: Cpu,
    title: 'Elective Paths',
    description: 'Go deeper on Advanced Prompting, Agents, Compliance, or Data Analytics.',
    path: '/electives',
    color: 'text-purple-600',
    bg: 'bg-purple-500/8',
    requiresSession: 3,
  },
  {
    id: 'certificates',
    icon: Award,
    title: 'Certificates',
    description: 'Credentials earned by completing sessions and elective paths.',
    path: '/certificates',
    color: 'text-orange-600',
    bg: 'bg-orange-500/8',
  },
] as const;

const SANDBOXES = [
  { session: 1, moduleId: '1-7', label: 'Session 1 — Free Exploration', description: 'Apply conversation-first patterns independently' },
  { session: 2, moduleId: '2-10', label: 'Session 2 — Structured Practice', description: 'Experiment with frameworks on tasks you care about' },
  { session: 3, moduleId: '3-7', label: 'Session 3 — Build Your Agent', description: 'Build your own agent for a real use case' },
  { session: 4, moduleId: '4-5', label: 'Session 4 — Everyday Tools', description: 'Go deeper on the tools that matter most' },
  { session: 5, moduleId: '5-5', label: 'Session 5 — AI Workflow', description: 'Present what you built and what comes next' },
] as const;

const SESSION_COLORS: Record<number, string> = {
  1: 'bg-purple-500',
  2: 'bg-blue-500',
  3: 'bg-amber-500',
  4: 'bg-green-500',
  5: 'bg-rose-500',
};

export default function Explore() {
  const navigate = useNavigate();
  const { progress } = useAuth();
  const prog = progress as unknown as Record<string, unknown> | null;

  const isFeatureLocked = (feature: typeof FEATURES[number]) => {
    if (!('requiresSession' in feature) || !feature.requiresSession) return false;
    return !prog?.[`session_${feature.requiresSession}_completed`];
  };

  const isSessionCompleted = (session: number) => !!prog?.[`session_${session}_completed`];

  return (
    <AppShell breadcrumbs={[{ label: 'Explore' }]}>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold mb-1">Explore</h1>
          <p className="text-sm text-muted-foreground">
            Your prompt library, ideas, sandboxes, and elective paths — all in one place.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {FEATURES.map((feature) => {
            const Icon = feature.icon;
            const locked = isFeatureLocked(feature);
            return (
              <Card
                key={feature.id}
                className={`transition-all ${locked ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer hover:shadow-md hover:border-primary/30'}`}
                onClick={() => !locked && navigate(feature.path)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className={`p-2.5 rounded-lg ${feature.bg} ${locked ? 'opacity-50' : feature.color} shrink-0`}>
                      {locked ? <Lock className="h-5 w-5 text-muted-foreground" /> : <Icon className="h-5 w-5" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm">{feature.title}</p>
                        {locked && 'requiresSession' in feature && (
                          <Badge variant="outline" className="text-[10px] text-muted-foreground">
                            <Lock className="h-2.5 w-2.5 mr-1" />
                            Complete Session {feature.requiresSession}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                    {!locked && <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* ── Sandboxes section ──────────────────────────────────────────────── */}
        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-1">Sandboxes</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Jump back into any session's sandbox for open practice.
          </p>
          <div className="space-y-2">
            {SANDBOXES.map((sb) => {
              const completed = isSessionCompleted(sb.session);
              return (
                <div
                  key={sb.moduleId}
                  className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                    completed
                      ? 'cursor-pointer hover:shadow-sm hover:border-primary/30 bg-card'
                      : 'opacity-60 cursor-not-allowed bg-muted/30'
                  }`}
                  onClick={() => completed && navigate(`/training/${sb.session}?module=${sb.moduleId}`)}
                >
                  <div className={`h-2 w-2 rounded-full shrink-0 ${SESSION_COLORS[sb.session] || 'bg-gray-500'}`} />
                  {completed
                    ? <CheckCircle className="h-4 w-4 text-green-600 shrink-0" />
                    : <Lock className="h-4 w-4 text-muted-foreground shrink-0" />}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{sb.label}</p>
                    <p className="text-xs text-muted-foreground">{sb.description}</p>
                  </div>
                  {completed
                    ? <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                    : (
                      <Badge variant="outline" className="text-[10px] text-muted-foreground shrink-0">
                        <Lock className="h-2.5 w-2.5 mr-1" />
                        Complete Session {sb.session}
                      </Badge>
                    )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
