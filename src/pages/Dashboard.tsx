import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Loader2, Play, CheckCircle, Lock, Sparkles, Bot, 
  Building2, HelpCircle, BookOpen, Settings
} from 'lucide-react';

const SESSIONS = [
  {
    id: 1,
    title: 'AI Prompting & Personalization',
    description: 'Master the fundamentals of effective AI prompting and customize your AI interactions.',
    icon: Sparkles,
    modules: ['Prompt Engineering Basics', 'Context Setting', 'Output Formatting', 'Personalization Techniques'],
  },
  {
    id: 2,
    title: 'Building Your AI Agent',
    description: 'Create a custom AI agent tailored to your line of business and daily tasks.',
    icon: Bot,
    modules: ['Agent Architecture', 'Custom Instructions', 'Tool Integration', 'Testing & Refinement'],
  },
  {
    id: 3,
    title: 'Role-Specific Training',
    description: 'Deep dive into AI applications specific to your department and role.',
    icon: Building2,
    modules: ['Department Workflows', 'Compliance Integration', 'Advanced Use Cases', 'Practical Projects'],
  },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, profile, progress, loading, signOut } = useAuth();

  // Redirect if not logged in
  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  // Redirect to onboarding if not completed
  useEffect(() => {
    if (!loading && profile && !profile.onboarding_completed) {
      navigate('/onboarding');
    }
  }, [profile, loading, navigate]);

  if (loading || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const currentSession = profile.current_session;
  const sessionProgress = [
    progress?.session_1_completed || false,
    progress?.session_2_completed || false,
    progress?.session_3_completed || false,
  ];

  const completedSessions = sessionProgress.filter(Boolean).length;
  const overallProgress = (completedSessions / 3) * 100;

  const getSessionStatus = (sessionId: number) => {
    if (sessionProgress[sessionId - 1]) return 'completed';
    if (sessionId === currentSession) return 'current';
    if (sessionId < currentSession) return 'completed';
    return 'locked';
  };

  const getLobLabel = (lob: string | null) => {
    switch (lob) {
      case 'accounting_finance': return 'Accounting & Finance';
      case 'credit_administration': return 'Credit Administration';
      case 'executive_leadership': return 'Executive & Leadership';
      default: return 'Not Set';
    }
  };

  const handleStartSession = (sessionId: number) => {
    navigate(`/training/${sessionId}`);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-display font-bold">AI Training Dashboard</h1>
            <p className="text-sm text-muted-foreground">
              Welcome back, {profile.display_name || 'Learner'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" className="gap-2">
              <HelpCircle className="h-4 w-4" />
              Help
            </Button>
            <Button variant="ghost" size="sm" onClick={() => navigate('/admin')} className="gap-2">
              <Settings className="h-4 w-4" />
              Admin
            </Button>
            <Button variant="outline" size="sm" onClick={signOut}>
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Profile Summary */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-2xl font-bold text-primary">
                    {profile.display_name?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                </div>
                <div>
                  <h2 className="text-lg font-semibold">{profile.display_name}</h2>
                  <p className="text-sm text-muted-foreground">{profile.bank_role}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="secondary">{getLobLabel(profile.line_of_business)}</Badge>
                    <Badge variant="outline">Level {profile.ai_proficiency_level}</Badge>
                  </div>
                </div>
              </div>
              <div className="md:text-right">
                <div className="text-sm text-muted-foreground mb-1">Overall Progress</div>
                <div className="text-2xl font-bold text-primary">{Math.round(overallProgress)}%</div>
                <Progress value={overallProgress} className="w-48 h-2 mt-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Learning Track */}
        <div className="mb-6">
          <h2 className="text-2xl font-display font-bold mb-2">Your Learning Track</h2>
          <p className="text-muted-foreground">
            Complete each session to unlock the next. Your training is customized based on your 
            {' '}<span className="text-primary font-medium">{profile.learning_style}</span> learning style.
          </p>
        </div>

        {/* Sessions Grid */}
        <div className="grid gap-6 md:grid-cols-3">
          {SESSIONS.map((session) => {
            const status = getSessionStatus(session.id);
            const IconComponent = session.icon;
            
            return (
              <Card 
                key={session.id} 
                className={`transition-all ${
                  status === 'locked' ? 'opacity-60' : 'hover:shadow-lg'
                }`}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className={`p-3 rounded-lg ${
                      status === 'completed' ? 'bg-green-100 text-green-600' :
                      status === 'current' ? 'bg-primary/10 text-primary' :
                      'bg-muted text-muted-foreground'
                    }`}>
                      {status === 'completed' ? (
                        <CheckCircle className="h-6 w-6" />
                      ) : status === 'locked' ? (
                        <Lock className="h-6 w-6" />
                      ) : (
                        <IconComponent className="h-6 w-6" />
                      )}
                    </div>
                    <Badge variant={
                      status === 'completed' ? 'default' :
                      status === 'current' ? 'secondary' :
                      'outline'
                    }>
                      {status === 'completed' ? 'Completed' :
                       status === 'current' ? 'In Progress' :
                       'Locked'}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg mt-4">
                    Session {session.id}: {session.title}
                  </CardTitle>
                  <CardDescription>{session.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 mb-4">
                    {session.modules.map((module, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm">
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                        <span className={status === 'locked' ? 'text-muted-foreground' : ''}>
                          {module}
                        </span>
                      </div>
                    ))}
                  </div>
                  
                  <Button 
                    className="w-full gap-2"
                    disabled={status === 'locked'}
                    variant={status === 'completed' ? 'outline' : 'default'}
                    onClick={() => handleStartSession(session.id)}
                  >
                    {status === 'completed' ? (
                      <>Review Session</>
                    ) : status === 'current' ? (
                      <>
                        <Play className="h-4 w-4" />
                        Continue Learning
                      </>
                    ) : (
                      <>
                        <Lock className="h-4 w-4" />
                        Complete Previous Session
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Resources Section */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Bank Resources</CardTitle>
            <CardDescription>
              Access policies, guidelines, and reference materials
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <Button variant="outline" className="justify-start gap-2 h-auto py-4">
                <BookOpen className="h-5 w-5 text-primary" />
                <div className="text-left">
                  <div className="font-medium">AI Usage Policy</div>
                  <div className="text-xs text-muted-foreground">Guidelines and compliance</div>
                </div>
              </Button>
              <Button variant="outline" className="justify-start gap-2 h-auto py-4">
                <BookOpen className="h-5 w-5 text-primary" />
                <div className="text-left">
                  <div className="font-medium">Data Security</div>
                  <div className="text-xs text-muted-foreground">Handling sensitive information</div>
                </div>
              </Button>
              <Button variant="outline" className="justify-start gap-2 h-auto py-4">
                <BookOpen className="h-5 w-5 text-primary" />
                <div className="text-left">
                  <div className="font-medium">Best Practices</div>
                  <div className="text-xs text-muted-foreground">Tips and recommendations</div>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
