import { useEffect, useState, Fragment } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { HelpTour } from '@/components/HelpTour';
import { BankPolicyModal } from '@/components/BankPolicyModal';
import { VideoModal } from '@/components/VideoModal';
import { ProfileDropdown } from '@/components/ProfileDropdown';
import { useBankPolicies } from '@/hooks/useBankPolicies';
import { useLiveTrainingSessions } from '@/hooks/useLiveTrainingSessions';
import { useEvents } from '@/hooks/useEvents';
import { useUserAgents } from '@/hooks/useUserAgents';
import { EventModal, getEventTypeConfig } from '@/components/EventModal';
import { useAppSettings } from '@/hooks/useAppSettings';
import {
  Loader2, Play, CheckCircle, Sparkles, Bot,
  Building2, HelpCircle, BookOpen, Shield, Lightbulb,
  Radio, Calendar, Users, MessageCircle,
  CalendarDays, Video, Settings, Brain, Cpu, Zap, Menu,
  TrendingUp, Award, GraduationCap
} from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { computeOverallProgress, computeSessionProgress, getModuleStates, getCompletedModuleCount, getSessionModuleTotal } from '@/utils/computeProgress';
import { aggregateSkillSignals } from '@/utils/deriveSkillSignals';
import type { SessionProgressData, SkillSignal } from '@/types/progress';
import { CompletionSummary } from '@/components/capstone/CompletionSummary';
import { DashboardChat } from '@/components/DashboardChat';
import { CommunityFeed } from '@/components/CommunityFeed';
import { FeedbackModal } from '@/components/FeedbackModal';
import { BrainstormPanel } from '@/components/BrainstormPanel';

const SESSIONS = [
  {
    id: 1,
    title: 'AI Foundations & Prompting',
    description: 'Master the fundamentals of effective AI prompting with the CLEAR framework and VERIFY checklist.',
    icon: Sparkles,
    modules: ['What AI Can Do', 'CLEAR Framework', 'Context & Security', 'Iteration', 'Verifying Output', 'Capstone'],
  },
  {
    id: 2,
    title: 'Building Your AI Agent',
    description: 'Create a custom AI agent tailored to your line of business and daily tasks.',
    icon: Bot,
    modules: ['Prompts to Agents', 'Architecture', 'Template Builder', 'Tool Integration', 'Living Agent', 'Capstone'],
  },
  {
    id: 3,
    title: 'Role-Specific Training',
    description: 'Deep dive into AI applications specific to your department and role.',
    icon: Building2,
    modules: ['Department Use Cases', 'Compliance & AI', 'Workflows', 'Advanced Techniques', 'Capstone'],
  },
  {
    id: 4,
    title: 'AI-Native Integration',
    description: 'Move from AI-capable to AI-native — integrate AI as a default part of your workflow.',
    icon: Zap,
    modules: ['AI Audit', 'Team Conventions', 'Measuring ROI', 'Tool Landscape', 'Integration Plan'],
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
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState<any>(null);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const { policies, loading: policiesLoading } = useBankPolicies();
  const { sessions: liveSessions, loading: liveSessionsLoading } = useLiveTrainingSessions();
  const { events, loading: eventsLoading } = useEvents();
  const { settings: appSettings } = useAppSettings();
  const { agents, isLoading: agentsLoading } = useUserAgents();

  // Fetch org name for the header
  const [orgName, setOrgName] = useState<string | null>(null);
  useEffect(() => {
    if (profile?.organization_id) {
      (supabase.from('organizations' as any).select('name').eq('id', profile.organization_id).maybeSingle() as any)
        .then(({ data }: any) => {
          if (data?.name) setOrgName(data.name);
        });
    }
  }, [profile?.organization_id]);

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
    (progress as any)?.session_4_completed || false,
  ];

  const overallProgress = computeOverallProgress(progress);

  // Total completed modules across all sessions
  const totalCompletedModules = [1, 2, 3, 4].reduce(
    (sum, sid) => sum + getCompletedModuleCount(sid, getSessionProgressData(sid)),
    0
  );
  const totalModules = [1, 2, 3, 4].reduce(
    (sum, sid) => sum + getSessionModuleTotal(sid),
    0
  );

  function getSessionProgressData(sessionId: number): SessionProgressData | null {
    if (!progress) return null;
    const key = `session_${sessionId}_progress`;
    return ((progress as any)[key] as SessionProgressData) || null;
  }

  // Aggregate skill signals from all sessions
  const allSkillSignals: SkillSignal[] = [1, 2, 3, 4].flatMap((sid) => {
    const data = getSessionProgressData(sid);
    return data?.skillSignals || [];
  });
  const topSkills = aggregateSkillSignals(allSkillSignals).filter((s) => s.level === 'proficient').slice(0, 3);

  const getSessionStatus = (sessionId: number) => {
    if (sessionProgress[sessionId - 1]) return 'completed';
    if (sessionId === currentSession) return 'current';
    return 'available';
  };

  const getLobLabel = (lob: string | null) => {
    if (!lob) return 'Not Set';
    // Convert slug to display name: accounting_finance → Accounting Finance
    return lob.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  };

  const handleStartSession = (sessionId: number) => {
    navigate(`/training/${sessionId}`);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Help Tour Dialog */}
      <HelpTour open={helpOpen} onOpenChange={setHelpOpen} onComplete={handleTourComplete} />
      <FeedbackModal open={feedbackOpen} onOpenChange={setFeedbackOpen} />
      
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

      {/* Session 1 Intro Video Modal */}
      <VideoModal
        open={videoModalOpen}
        onOpenChange={setVideoModalOpen}
        videoUrl="https://youtu.be/xZ1FAm7IoA4"
        title="Session 1: Introduction to AI Prompting"
      />

      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-3 md:py-4 flex items-center justify-between">
          <div className="min-w-0">
            {(orgName || profile.employer_bank_name) && (
              <p className="text-xs text-muted-foreground/70 font-medium tracking-wide uppercase truncate">
                {orgName || profile.employer_bank_name}
              </p>
            )}
            <h1 className="text-lg md:text-xl font-display font-bold">AI Training Dashboard</h1>
            <p className="text-sm text-muted-foreground hidden sm:block">
              Welcome back, {profile.display_name || 'Learner'}
            </p>
          </div>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-3">
            <Button variant="ghost" size="sm" className="gap-2 text-destructive hover:text-destructive" onClick={() => setFeedbackOpen(true)}>
              <MessageCircle className="h-4 w-4" />
              Feedback
            </Button>
            <Button variant="ghost" size="sm" className="gap-2" onClick={() => navigate('/policies')}>
              <Shield className="h-4 w-4" />
              Bank Policies
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2">
                  <Sparkles className="h-4 w-4" />
                  My Personalization
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-card">
                <DropdownMenuItem onClick={() => navigate('/settings')} className="cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  <div>
                    <div className="font-medium">AI Settings</div>
                    <div className="text-xs text-muted-foreground">Customize Andrea's behavior</div>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/memories')} className="cursor-pointer">
                  <Brain className="mr-2 h-4 w-4" />
                  <div>
                    <div className="font-medium">Memories</div>
                    <div className="text-xs text-muted-foreground">What Andrea remembers</div>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/ideas')} className="cursor-pointer">
                  <Lightbulb className="mr-2 h-4 w-4" />
                  <div>
                    <div className="font-medium">My Ideas</div>
                    <div className="text-xs text-muted-foreground">AI use cases to explore</div>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/prompts')} className="cursor-pointer">
                  <BookOpen className="mr-2 h-4 w-4" />
                  <div>
                    <div className="font-medium">Prompt Library</div>
                    <div className="text-xs text-muted-foreground">Saved reusable prompts</div>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/journey')} className="cursor-pointer">
                  <TrendingUp className="mr-2 h-4 w-4" />
                  <div>
                    <div className="font-medium">My AI Journey</div>
                    <div className="text-xs text-muted-foreground">Skills & progress timeline</div>
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="ghost" size="sm" className="gap-2" onClick={() => setHelpOpen(true)}>
              <HelpCircle className="h-4 w-4" />
              Help
            </Button>
            <ProfileDropdown onReplayTour={() => setHelpOpen(true)} />
          </div>

          {/* Mobile nav */}
          <div className="flex md:hidden items-center gap-2">
            <ProfileDropdown onReplayTour={() => setHelpOpen(true)} />
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72 p-0">
                <nav className="flex flex-col py-6">
                  <div className="px-4 pb-4 border-b">
                    <p className="font-semibold">{profile.display_name || 'Learner'}</p>
                    <p className="text-xs text-muted-foreground">{profile.bank_role}</p>
                  </div>
                  <div className="flex flex-col py-2">
                    <button className="flex items-center gap-3 px-4 py-3 text-sm text-destructive hover:bg-muted transition-colors" onClick={() => setFeedbackOpen(true)}>
                      <MessageCircle className="h-4 w-4" /> Feedback
                    </button>
                    <button className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-muted transition-colors" onClick={() => navigate('/policies')}>
                      <Shield className="h-4 w-4 text-muted-foreground" /> Bank Policies
                    </button>
                    <button className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-muted transition-colors" onClick={() => navigate('/settings')}>
                      <Settings className="h-4 w-4 text-muted-foreground" /> AI Settings
                    </button>
                    <button className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-muted transition-colors" onClick={() => navigate('/memories')}>
                      <Brain className="h-4 w-4 text-muted-foreground" /> Memories
                    </button>
                    <button className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-muted transition-colors" onClick={() => navigate('/ideas')}>
                      <Lightbulb className="h-4 w-4 text-muted-foreground" /> My Ideas
                    </button>
                    <button className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-muted transition-colors" onClick={() => navigate('/prompts')}>
                      <BookOpen className="h-4 w-4 text-muted-foreground" /> Prompt Library
                    </button>
                    <button className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-muted transition-colors" onClick={() => navigate('/journey')}>
                      <TrendingUp className="h-4 w-4 text-muted-foreground" /> My AI Journey
                    </button>
                    <button className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-muted transition-colors" onClick={() => navigate('/certificates')}>
                      <Award className="h-4 w-4 text-muted-foreground" /> Certificates
                    </button>
                    <button className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-muted transition-colors" onClick={() => navigate('/electives')}>
                      <GraduationCap className="h-4 w-4 text-muted-foreground" /> Elective Paths
                    </button>
                    <button className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-muted transition-colors" onClick={() => setHelpOpen(true)}>
                      <HelpCircle className="h-4 w-4 text-muted-foreground" /> Help
                    </button>
                  </div>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Profile Summary */}
        <Card className="mb-8" data-tour="profile-card">
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
                  {topSkills.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {topSkills.map((skill) => (
                        <Badge key={skill.skill} variant="outline" className="text-xs gap-1 border-green-500/30 text-green-600">
                          <CheckCircle className="h-3 w-3" />
                          {skill.displayName}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="md:text-right mt-4 md:mt-0">
                <div className="text-sm text-muted-foreground mb-1">Overall Progress</div>
                <div className="text-2xl font-bold text-primary">{Math.round(overallProgress)}%</div>
                <Progress value={overallProgress} className="w-full md:w-48 h-2 mt-2" />
                <p className="text-xs text-muted-foreground mt-1">
                  {totalCompletedModules} of {totalModules} modules completed
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Completion Summary — shown when Session 4 (final) is completed */}
        {sessionProgress[3] && (
          <div className="mb-8">
            <CompletionSummary
              userName={profile.display_name || 'Learner'}
              completedAt={(() => {
                const s4 = getSessionProgressData(4);
                return s4?.capstoneData?.completedAt;
              })()}
              skillSignals={allSkillSignals}
              totalModulesCompleted={totalCompletedModules}
              totalModules={totalModules}
              onViewCertificate={() => navigate('/training/4')}
            />
          </div>
        )}

        {/* Learning Track */}
        <div className="mb-6">
          <h2 className="text-2xl font-display font-bold mb-2">Your Learning Track</h2>
          <p className="text-muted-foreground">
            Your training is customized based on your 
            {' '}<span className="text-primary font-medium">{profile.learning_style}</span> learning style.
          </p>
        </div>

        {/* Sessions Grid */}
        <div data-tour="sessions-grid" className="grid gap-6 md:grid-cols-2">
          {SESSIONS.map((session) => {
            const status = getSessionStatus(session.id);
            const IconComponent = session.icon;
            const sessionData = getSessionProgressData(session.id);
            const sessionPct = status === 'completed' ? 100 : computeSessionProgress(session.id, sessionData);
            const moduleStates = getModuleStates(session.id, sessionData);
            const completedCount = getCompletedModuleCount(session.id, sessionData);
            const moduleTotal = getSessionModuleTotal(session.id);

            // Module dot colors by engagement state
            const dotColor: Record<string, string> = {
              not_started: 'bg-muted',
              content_viewed: 'bg-blue-400',
              practicing: 'bg-amber-400',
              submitted: 'bg-orange-500',
              completed: 'bg-green-500',
            };

            const dotLabel: Record<string, string> = {
              not_started: 'Not started',
              content_viewed: 'Content viewed',
              practicing: 'Practicing',
              submitted: 'Submitted',
              completed: 'Completed',
            };

            return (
              <Fragment key={session.id}>
                {session.id === 4 && <BrainstormPanel />}
              <Card
                className={`transition-all hover:shadow-lg flex flex-col${session.id === 4 ? ' md:col-span-2' : ''}`}
              >
                <CardHeader className="flex-1">
                  <div className="flex items-start justify-between">
                    <div className={`p-3 rounded-lg ${
                      status === 'completed' ? 'bg-green-100 text-green-600' :
                      status === 'current' ? 'bg-primary/10 text-primary' :
                      'bg-secondary text-secondary-foreground'
                    }`}>
                      {status === 'completed' ? (
                        <CheckCircle className="h-6 w-6" />
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
                       'Available'}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg mt-4">
                    Session {session.id}: {session.title}
                  </CardTitle>
                  <CardDescription>{session.description}</CardDescription>
                </CardHeader>
                <CardContent className="mt-auto">
                  {/* Module progress breakdown */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
                      <span>{completedCount}/{moduleTotal} modules</span>
                      <span>{sessionPct}%</span>
                    </div>
                    <Progress value={sessionPct} className="h-1.5" />
                    {/* Module state dots */}
                    <div className="flex gap-1 mt-2">
                      {moduleStates.map((ms) => (
                        <div
                          key={ms.moduleId}
                          className={`h-2 flex-1 rounded-full transition-colors ${dotColor[ms.state] || 'bg-muted'}`}
                          title={`${ms.title}: ${dotLabel[ms.state] || ms.state}`}
                        />
                      ))}
                    </div>
                  </div>

                  <Button
                    className="w-full gap-2"
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
                        <Play className="h-4 w-4" />
                        Start Session
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
              </Fragment>
            );
          })}
        </div>

        {/* Live Feed and Community Hub - Side by Side */}
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          {/* Live Feed Section - Video Thumbnail Only */}
          <Card data-tour="live-feed">
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Radio className="h-5 w-5 text-destructive" />
                  <span className="absolute -top-1 -right-1 h-2.5 w-2.5 bg-destructive rounded-full animate-pulse" />
                </div>
                <CardTitle>Live Enablement Feed</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {/* Featured Intro Video - Thumbnail + Description */}
              <div className="flex items-start gap-3">
                <div
                  className="relative rounded-lg overflow-hidden cursor-pointer group w-1/3 shrink-0"
                  onClick={() => setVideoModalOpen(true)}
                >
                  <img
                    src="https://img.youtube.com/vi/xZ1FAm7IoA4/maxresdefault.jpg"
                    alt="Introduction to AI Prompting"
                    className="w-full aspect-video object-cover rounded-lg"
                  />
                  <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                    <div className="p-2 rounded-full bg-primary/90 text-primary-foreground shadow-lg group-hover:scale-110 transition-transform">
                      <Play className="h-5 w-5" />
                    </div>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground leading-snug">Introduction to AI Prompting</p>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">Effective LLM prompting, a custom GPT demo, and how to build your own setup.</p>
                </div>
              </div>

              {/* Live Sessions as thumbnails */}
              {!liveSessionsLoading && liveSessions.filter(s => new Date(s.scheduled_date) >= new Date()).length > 0 && (
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {liveSessions.filter(s => new Date(s.scheduled_date) >= new Date()).slice(0, 2).map((session) => (
                    <div
                      key={session.id}
                      className="relative rounded-lg overflow-hidden cursor-pointer group bg-muted aspect-video flex items-center justify-center"
                    >
                      <div className="text-center p-2">
                        <Video className="h-6 w-6 mx-auto text-muted-foreground mb-1" />
                        <p className="text-xs font-medium line-clamp-2">{session.title}</p>
                      </div>
                      <div className="absolute top-1.5 right-1.5">
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0">Live</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Community Hub Section — Inline Feed */}
          <Card className="overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/20">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle>Community Hub</CardTitle>
                  <CardDescription>
                    Discuss AI use cases with peers
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <CommunityFeed />
            </CardContent>
          </Card>
        </div>

        {/* Calendar & Agents - Side by Side like above */}
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          {/* Upcoming Events / Calendar */}
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
                Training sessions, webinars, and community events
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DashboardCalendar
                events={events}
                onSelectEvent={setSelectedEvent}
                loading={eventsLoading}
              />
              {/* Upcoming event list below calendar */}
              {!eventsLoading && (() => {
                const upcomingEvents = events.filter(e => new Date(e.scheduled_date) >= new Date()).slice(0, 3);
                if (upcomingEvents.length === 0) return null;
                return (
                  <div className="mt-4 space-y-2">
                    {upcomingEvents.map((event) => {
                      const config = getEventTypeConfig(event.event_type);
                      const EventIcon = config.icon;
                      const eventDate = new Date(event.scheduled_date);
                      return (
                        <div
                          key={event.id}
                          className="flex items-center gap-3 p-2.5 rounded-lg border bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer"
                          onClick={() => setSelectedEvent(event)}
                        >
                          <div className={`p-1.5 rounded ${config.color}`}>
                            <EventIcon className="h-3.5 w-3.5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{event.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {eventDate.toLocaleDateString()} · {eventDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </CardContent>
          </Card>

          {/* My Agents & Workflows */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bot className="h-5 w-5 text-primary" />
                  <CardTitle>My Agents & Workflows</CardTitle>
                </div>
                <Badge variant="secondary" className="gap-1">
                  <Cpu className="h-3 w-3" />
                  {agents.length} Built
                </Badge>
              </div>
              <CardDescription>
                AI agents you've created during training
              </CardDescription>
            </CardHeader>
            <CardContent>
              {agentsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : agents.length === 0 ? (
                <div className="text-center py-8">
                  <div className="mx-auto h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-3">
                    <Bot className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <p className="text-sm font-medium mb-1">No agents yet</p>
                  <p className="text-xs text-muted-foreground mb-4">
                    You'll build your first agent in Session 2
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    onClick={() => handleStartSession(2)}
                  >
                    <Play className="h-3.5 w-3.5" />
                    Start Session 2
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {agents.slice(0, 5).map((agent) => (
                    <div
                      key={agent.id}
                      className="flex items-center gap-3 p-3 rounded-lg border bg-muted/30 hover:bg-muted/50 transition-colors"
                    >
                      <div className={`p-2 rounded-lg ${
                        agent.is_deployed ? 'bg-green-500/10 text-green-600' : 'bg-muted text-muted-foreground'
                      }`}>
                        <Bot className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{agent.name}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {agent.description || 'No description'}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {agent.is_deployed && (
                          <Badge variant="outline" className="text-[10px] gap-1 border-green-500/30 text-green-600">
                            <Zap className="h-2.5 w-2.5" />
                            Active
                          </Badge>
                        )}
                        <Badge variant="secondary" className="text-[10px] capitalize">
                          {agent.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                  {agents.length > 5 && (
                    <p className="text-xs text-muted-foreground text-center pt-1">
                      +{agents.length - 5} more agents
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Andrea Dashboard Chat */}
      <DashboardChat profile={profile} progress={progress} />
    </div>
  );
}

// Inline calendar component for dashboard
function DashboardCalendar({
  events,
  onSelectEvent,
  loading,
}: {
  events: any[];
  onSelectEvent: (event: any) => void;
  loading: boolean;
}) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();

  const eventDates = new Map<string, any[]>();
  events.forEach((event) => {
    const dateKey = new Date(event.scheduled_date).toDateString();
    if (!eventDates.has(dateKey)) eventDates.set(dateKey, []);
    eventDates.get(dateKey)!.push(event);
  });

  const days = [];
  for (let i = 0; i < firstDay; i++) {
    days.push(<div key={`empty-${i}`} />);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const dateKey = date.toDateString();
    const dayEvents = eventDates.get(dateKey) || [];
    const isToday = date.toDateString() === today.toDateString();

    days.push(
      <button
        key={day}
        onClick={() => dayEvents.length > 0 && onSelectEvent(dayEvents[0])}
        className={`relative aspect-square flex flex-col items-center justify-center rounded-md text-sm transition-colors ${
          isToday
            ? 'bg-primary text-primary-foreground font-bold'
            : dayEvents.length > 0
            ? 'hover:bg-muted cursor-pointer font-medium'
            : 'text-muted-foreground hover:bg-muted/50'
        }`}
      >
        {day}
        {dayEvents.length > 0 && (
          <span className={`absolute bottom-0.5 h-1.5 w-1.5 rounded-full ${isToday ? 'bg-primary-foreground' : 'bg-primary'}`} />
        )}
      </button>
    );
  }

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  return (
    <div className="select-none">
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={() => setCurrentMonth(new Date(year, month - 1, 1))}
          className="p-1 rounded hover:bg-muted text-muted-foreground"
        >
          ‹
        </button>
        <span className="font-medium text-sm">
          {monthNames[month]} {year}
        </span>
        <button
          onClick={() => setCurrentMonth(new Date(year, month + 1, 1))}
          className="p-1 rounded hover:bg-muted text-muted-foreground"
        >
          ›
        </button>
      </div>
      <div className="grid grid-cols-7 gap-0.5 text-center mb-1">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
          <div key={d} className="text-xs font-medium text-muted-foreground py-1">
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-0.5">
        {days}
      </div>
    </div>
  );
}
