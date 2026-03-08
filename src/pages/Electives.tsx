import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useElectiveProgress } from '@/hooks/useElectiveProgress';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  ArrowLeft, BookOpen, Lock, Play, CheckCircle, Clock,
  Sparkles, Bot, Shield, Workflow, ChevronRight, Loader2,
} from 'lucide-react';
import { ELECTIVE_PATHS } from '@/data/trainingContent';
import type { ElectivePath } from '@/data/trainingContent';

const PATH_ICONS: Record<string, React.ElementType> = {
  advanced_prompting: Sparkles,
  agent_patterns: Bot,
  workflow_mastery: Workflow,
  compliance_deep_dive: Shield,
};

const PATH_COLORS: Record<string, string> = {
  advanced_prompting: 'bg-purple-500/10 text-purple-600',
  agent_patterns: 'bg-blue-500/10 text-blue-600',
  workflow_mastery: 'bg-amber-500/10 text-amber-600',
  compliance_deep_dive: 'bg-red-500/10 text-red-600',
};

export default function Electives() {
  const navigate = useNavigate();
  const { profile, progress } = useAuth();
  const { getPathProgress, loading: electiveLoading } = useElectiveProgress();
  const [expandedPath, setExpandedPath] = useState<string | null>(null);

  // Check which sessions are completed
  const completedSessions = new Set<number>();
  if (progress?.session_1_completed) completedSessions.add(1);
  if (progress?.session_2_completed) completedSessions.add(2);
  if (progress?.session_3_completed) completedSessions.add(3);
  if (progress?.session_4_completed) completedSessions.add(4);

  const isPathUnlocked = (path: ElectivePath) => {
    // Parse prerequisite: "Session 3" → check session 3 completed
    const match = path.prerequisite.match(/Session\s+(\d)/i);
    if (!match) return true;
    return completedSessions.has(parseInt(match[1]));
  };

  // Use Supabase-backed hook with localStorage fallback
  const getElectiveProgressLocal = (pathId: string): Record<string, boolean> => {
    return getPathProgress(pathId);
  };

  const getPathCompletion = (path: ElectivePath) => {
    const prog = getElectiveProgressLocal(path.id);
    const completed = path.modules.filter((m) => prog[m.id]).length;
    return { completed, total: path.modules.length, percent: Math.round((completed / path.modules.length) * 100) };
  };

  const handleStartModule = (pathId: string, moduleId: string) => {
    // Navigate to training workspace with elective module
    navigate(`/training/elective?path=${pathId}&module=${moduleId}`);
  };

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
              <BookOpen className="h-5 w-5 text-primary" />
              Elective Learning Paths
            </h1>
            <p className="text-sm text-muted-foreground">
              Deep-dive into specialized AI topics after completing core sessions
            </p>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="grid gap-6 md:grid-cols-2">
          {ELECTIVE_PATHS.map((path) => {
            const unlocked = isPathUnlocked(path);
            const Icon = PATH_ICONS[path.id] || BookOpen;
            const color = PATH_COLORS[path.id] || 'bg-primary/10 text-primary';
            const { completed, total, percent } = getPathCompletion(path);
            const isExpanded = expandedPath === path.id;

            return (
              <Card
                key={path.id}
                className={`transition-all ${unlocked ? 'hover:shadow-lg' : 'opacity-60'}`}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className={`p-3 rounded-lg ${color}`}>
                      {unlocked ? <Icon className="h-6 w-6" /> : <Lock className="h-6 w-6" />}
                    </div>
                    <div className="flex items-center gap-2">
                      {completed === total && total > 0 ? (
                        <Badge className="bg-green-500/10 text-green-600 border-green-500/30">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Complete
                        </Badge>
                      ) : unlocked ? (
                        <Badge variant="secondary">
                          {completed > 0 ? 'In Progress' : 'Available'}
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-muted-foreground">
                          <Lock className="h-3 w-3 mr-1" />
                          Locked
                        </Badge>
                      )}
                    </div>
                  </div>
                  <CardTitle className="text-lg mt-3">{path.title}</CardTitle>
                  <CardDescription>{path.description}</CardDescription>
                  <p className="text-xs text-muted-foreground mt-1">
                    Requires: {path.prerequisite}
                  </p>
                </CardHeader>

                <CardContent>
                  {/* Progress */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                      <span>{completed}/{total} modules</span>
                      <span>{percent}%</span>
                    </div>
                    <Progress value={percent} className="h-1.5" />
                  </div>

                  {/* Module List (expandable) */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-between mb-2"
                    onClick={() => setExpandedPath(isExpanded ? null : path.id)}
                  >
                    <span className="text-sm">{total} Modules</span>
                    <ChevronRight className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                  </Button>

                  {isExpanded && (
                    <div className="space-y-2 mb-4">
                      {path.modules.map((mod) => {
                        const modProgress = getElectiveProgressLocal(path.id);
                        const isCompleted = modProgress[mod.id];

                        return (
                          <div
                            key={mod.id}
                            className="flex items-center gap-3 p-2.5 rounded-lg border bg-muted/30"
                          >
                            <div className={`h-2 w-2 rounded-full shrink-0 ${
                              isCompleted ? 'bg-green-500' : 'bg-muted'
                            }`} />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{mod.title}</p>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                {mod.estimatedTime}
                              </div>
                            </div>
                            {unlocked && !isCompleted && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="shrink-0 h-7 text-xs"
                                onClick={() => handleStartModule(path.id, mod.id)}
                              >
                                <Play className="h-3 w-3 mr-1" />
                                Start
                              </Button>
                            )}
                            {isCompleted && (
                              <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* CTA */}
                  {unlocked ? (
                    <Button
                      className="w-full gap-2"
                      variant={completed > 0 ? 'default' : 'outline'}
                      onClick={() => {
                        const prog = getElectiveProgressLocal(path.id);
                        const nextModule = path.modules.find((m) => !prog[m.id]) || path.modules[0];
                        handleStartModule(path.id, nextModule.id);
                      }}
                    >
                      <Play className="h-4 w-4" />
                      {completed > 0 ? 'Continue' : 'Start Path'}
                    </Button>
                  ) : (
                    <Button className="w-full gap-2" variant="outline" disabled>
                      <Lock className="h-4 w-4" />
                      Complete {path.prerequisite} to Unlock
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
