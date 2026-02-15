import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { HelpTour } from '@/components/HelpTour';
import { BankPolicyModal } from '@/components/BankPolicyModal';
import { ProfileDropdown } from '@/components/ProfileDropdown';
import { useBankPolicies } from '@/hooks/useBankPolicies';
import { useLiveTrainingSessions } from '@/hooks/useLiveTrainingSessions';
import { useEvents } from '@/hooks/useEvents';
import { EventModal, getEventTypeConfig } from '@/components/EventModal';
import { useAppSettings } from '@/hooks/useAppSettings';
import {
  Loader2, Play, CheckCircle, Lock, Sparkles, Bot,
  Building2, HelpCircle, BookOpen, Shield, Lightbulb,
  Radio, Calendar, Users, Clock, MessageCircle, ExternalLink,
  CalendarDays
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

const policyIconMap: Record<string, React.ElementType> = {
  BookOpen,
  Shield,
  Lightbulb,
};

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, profile, progress, loading, signOut, updateProfile } = useAuth();
  const [helpOpen, setHelpOpen] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState<any>(null);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const { policies, loading: policiesLoading } = useBankPolicies();
  const { sessions: liveSessions, loading: liveSessionsLoading } = useLiveTrainingSessions();
  const { events, loading: eventsLoading } = useEvents();
  const { settings: appSettings } = useAppSettings();

  const communityUrl = appSettings.community_slack_url;

  // Auto-start tour for new users who haven't completed it
  useEffect(() => {
    if (profile && !profile.tour_completed && !helpOpen) {
      setHelpOpen(true);
    }
  }, [profile?.tour_completed]);

  const handleTourComplete = async () => {
    if (profile && !profile.tour_completed) {
      await updateProfile({ tour_completed: true } as any);
    }
  };

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
      {/* Help Tour Dialog */}
      <HelpTour open={helpOpen} onOpenChange={setHelpOpen} onComplete={handleTourComplete} />
      
      {/* Bank Policy Modal */}
      <BankPolicyModal
        open={!!selectedPolicy}
        onOpenChange={(open) => !open && setSelectedPolicy(null)}
        policy={selectedPolicy}
      />

      {/* Event Detail Modal */}
      <EventModal
        open={!!selectedEvent}
        onOpenChange={(open) => !open && setSelectedEvent(null)}
        event={selectedEvent}
      />

      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            {profile.employer_bank_name && (
              <p className="text-xs text-muted-foreground/70 font-medium tracking-wide uppercase">
                {profile.employer_bank_name}
              </p>
            )}
            <h1 className="text-xl font-display font-bold">AI Training Dashboard</h1>
            <p className="text-sm text-muted-foreground">
              Welcome back, {profile.display_name || 'Learner'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              className="gap-2"
              onClick={() => navigate('/ideas')}
            >
              <Lightbulb className="h-4 w-4" />
              My Ideas
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="gap-2"
              onClick={() => navigate('/policies')}
            >
              <Shield className="h-4 w-4" />
              Bank Policies
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="gap-2"
              onClick={() => setHelpOpen(true)}
            >
              <HelpCircle className="h-4 w-4" />
              Help
            </Button>
            <ProfileDropdown onReplayTour={() => setHelpOpen(true)} />
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

        {/* Upcoming Events */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CalendarDays className="h-5 w-5 text-primary" />
                  <CardTitle>Upcoming Events</CardTitle>
                </div>
                {(() => {
                  const upcomingEvents = events.filter(e => new Date(e.scheduled_date) >= new Date());
                  return upcomingEvents.length > 0 ? (
                    <Badge variant="secondary" className="gap-1">
                      <Calendar className="h-3 w-3" />
                      {upcomingEvents.length} Upcoming
                    </Badge>
                  ) : null;
                })()}
              </div>
              <CardDescription>
                Training sessions, webinars, office hours, and community events
              </CardDescription>
            </CardHeader>
            <CardContent>
              {eventsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : (() => {
                const upcomingEvents = events.filter(e => new Date(e.scheduled_date) >= new Date()).slice(0, 3);
                if (upcomingEvents.length === 0) {
                  return (
                    <div className="text-center py-8">
                      <CalendarDays className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                      <p className="text-muted-foreground">
                        No upcoming events scheduled. Check back soon!
                      </p>
                    </div>
                  );
                }
                return (
                  <div className="grid gap-3 md:grid-cols-3">
                    {upcomingEvents.map((event) => {
                      const config = getEventTypeConfig(event.event_type);
                      const EventIcon = config.icon;
                      const eventDate = new Date(event.scheduled_date);
                      return (
                        <div
                          key={event.id}
                          className="p-4 rounded-lg border bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer"
                          onClick={() => setSelectedEvent(event)}
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <div className={`p-1.5 rounded ${config.color}`}>
                              <EventIcon className="h-3.5 w-3.5" />
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {config.label}
                            </Badge>
                          </div>
                          <h4 className="font-medium text-sm mb-2 line-clamp-2">{event.title}</h4>
                          <div className="space-y-1 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1.5">
                              <Calendar className="h-3 w-3" />
                              <span>{eventDate.toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Clock className="h-3 w-3" />
                              <span>{eventDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                            {event.instructor && (
                              <div className="flex items-center gap-1.5">
                                <Users className="h-3 w-3" />
                                <span>{event.instructor}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </CardContent>
          </Card>
        </div>

        {/* Live Feed and Community Hub - Side by Side */}
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          {/* Live Feed Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Radio className="h-5 w-5 text-red-500" />
                    <span className="absolute -top-1 -right-1 h-2.5 w-2.5 bg-red-500 rounded-full animate-pulse" />
                  </div>
                  <CardTitle>Live Training Feed</CardTitle>
                </div>
                {liveSessions.length > 0 ? (
                  <Badge variant="secondary" className="gap-1">
                    <Calendar className="h-3 w-3" />
                    {liveSessions.length} Upcoming
                  </Badge>
                ) : (
                  <Badge variant="outline" className="gap-1">
                    <Users className="h-3 w-3" />
                    Coming Soon
                  </Badge>
                )}
              </div>
              <CardDescription>
                Join live training sessions with expert instructors
              </CardDescription>
            </CardHeader>
            <CardContent>
              {liveSessionsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : liveSessions.length === 0 ? (
                <div className="text-center py-8">
                  <Radio className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-muted-foreground">
                    No live sessions scheduled yet. Check back soon!
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {liveSessions.filter(s => new Date(s.scheduled_date) >= new Date()).slice(0, 2).map((session) => (
                    <div 
                      key={session.id}
                      className="relative p-4 rounded-lg border bg-muted/30 hover:bg-muted/50 transition-colors"
                    >
                      <div className="absolute top-3 right-3">
                        <Badge variant="secondary" className="text-xs">Upcoming</Badge>
                      </div>
                      <h4 className="font-medium pr-16 mb-2">{session.title}</h4>
                      <div className="space-y-1.5 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Users className="h-3.5 w-3.5" />
                          <span>{session.instructor}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3.5 w-3.5" />
                          <span>{new Date(session.scheduled_date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-3.5 w-3.5" />
                          <span>{new Date(session.scheduled_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </div>
                      <div className="mt-3 flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                          {session.duration_minutes} min
                        </span>
                        <Button size="sm" variant="outline">
                          Notify Me
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Community Hub Section */}
          <Card className="border-2 border-dashed border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <MessageCircle className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle>Community Hub</CardTitle>
                  <CardDescription>
                    Connect with peers, share ideas, and learn from others
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4">
                <p className="text-sm text-muted-foreground">
                  Connect with fellow banking professionals, share AI use cases,
                  ask questions, and collaborate on best practices.
                </p>
                {communityUrl ? (
                  <Button asChild className="gap-2 w-fit">
                    <a href={communityUrl} target="_blank" rel="noopener noreferrer">
                      <MessageCircle className="h-4 w-4" />
                      Join Community
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </Button>
                ) : (
                  <Button disabled className="gap-2 w-fit">
                    <MessageCircle className="h-4 w-4" />
                    Coming Soon
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
