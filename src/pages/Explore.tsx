import { useNavigate } from 'react-router-dom';
import { AppShell } from '@/components/shell';
import { Card, CardContent } from '@/components/ui/card';
import {
  BookOpen, Lightbulb, Cpu, TrendingUp, Award, ChevronRight,
} from 'lucide-react';

// ─── Explore zone — feature hub ──────────────────────────────────────────────
//
// Unlocked after module 1-2 (CLEAR Framework). Groups all "explore more" features:
// Prompt Library, My Ideas, Electives, AI Journey, Certificates.

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
  },
  {
    id: 'journey',
    icon: TrendingUp,
    title: 'My AI Journey',
    description: 'Your skill progression, prompt evolution, and key milestones over time.',
    path: '/journey',
    color: 'text-green-600',
    bg: 'bg-green-500/8',
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

export default function Explore() {
  const navigate = useNavigate();

  return (
    <AppShell breadcrumbs={[{ label: 'Explore' }]}>
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold mb-1">Explore</h1>
          <p className="text-sm text-muted-foreground">
            Your prompt library, ideas, elective paths, and skill history — all in one place.
          </p>
        </div>

        <div className="space-y-3">
          {FEATURES.map((feature) => {
            const Icon = feature.icon;
            return (
              <Card
                key={feature.id}
                className="cursor-pointer hover:shadow-md transition-all hover:border-primary/30"
                onClick={() => navigate(feature.path)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className={`p-2.5 rounded-lg ${feature.bg} ${feature.color} shrink-0`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{feature.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}
