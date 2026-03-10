import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAllBankPolicies } from '@/hooks/useBankPolicies';
import { useAllLiveTrainingSessions, type LiveTrainingSessionInsert, type LiveTrainingSession } from '@/hooks/useLiveTrainingSessions';
import { useAdminAppSettings } from '@/hooks/useAppSettings';
import { useAllEvents, type EventInsert, type Event } from '@/hooks/useEvents';
import { getEventTypeConfig } from '@/components/EventModal';
import { UsersManagement } from '@/components/UsersManagement';
import { ProgressDashboard } from '@/components/admin/ProgressDashboard';
import { IdeasInbox } from '@/components/admin/IdeasInbox';
import { CSuiteReports } from '@/components/admin/CSuiteReports';
import { CSuiteAdvisorPanel } from '@/components/admin/CSuiteAdvisorPanel';
import { OrganizationsManager } from '@/components/admin/OrganizationsManager';
import { DepartmentsManager } from '@/components/admin/DepartmentsManager';
import { ExecutiveSubmissions } from '@/components/admin/ExecutiveSubmissions';
import { CommunityReviewQueue } from '@/components/admin/CommunityReviewQueue';
import { OrgResourcesManager } from '@/components/admin/OrgResourcesManager';
import { AdminAndreaFloat } from '@/components/admin/AdminAndreaFloat';
import { AndreaNotesPanel } from '@/components/admin/AndreaNotesPanel';
import { useAdminAndreaNotes } from '@/hooks/useAdminAndreaChat';
import { useOrganizations } from '@/hooks/useOrganizations';
import { ExecutiveOverview } from '@/components/admin/ExecutiveOverview';
import { HelpPanel } from '@/components/HelpPanel';
import { useTour } from '@/hooks/useTour';
import { ADMIN_STEPS } from '@/constants/tourSteps';
import { learningStyles } from '@/data/learningStyles';
import { departments } from '@/data/topics';
import { ALL_SESSION_CONTENT } from '@/data/trainingContent';
import { seedAllContent } from '@/utils/seedLessonChunks';
import {
  BookOpen,
  Brain,
  Calculator,
  FileText,
  TrendingUp,
  Users,
  Lightbulb,
  CheckCircle,
  Target,
  Layers,
  Sparkles,
  Bot,
  Building2,
  Video,
  Play,
  Clock,
  Shield,
  Edit,
  Save,
  X,
  Plus,
  Loader2,
  ArrowLeft,
  Radio,
  Calendar,
  Trash2,
  Settings,
  MessageCircle,
  MessageSquare,
  Link,
  CalendarDays,
  BarChart3,
  PieChart as PieChartIcon,
  Database,
  RefreshCw,
  Upload,
  HelpCircle,
  Link2,
  Activity,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const iconMap: Record<string, React.ElementType> = {
  Calculator,
  FileText,
  TrendingUp,
};

const styleIconMap: Record<string, React.ElementType> = {
  'example-based': BookOpen,
  'explanation-based': Lightbulb,
  'hands-on': Target,
  'logic-based': Layers,
};

const styleColorMap: Record<string, string> = {
  'example-based': 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  'explanation-based': 'bg-purple-500/10 text-purple-600 border-purple-500/20',
  'hands-on': 'bg-green-500/10 text-green-600 border-green-500/20',
  'logic-based': 'bg-orange-500/10 text-orange-600 border-orange-500/20',
};

const moduleTypeIcon: Record<string, React.ElementType> = {
  video: Video,
  document: FileText,
  example: Lightbulb,
  exercise: Play,
};

// Core training programs that all users go through
const CORE_PROGRAMS = [
  {
    id: 1,
    title: 'Foundation & Early Wins',
    description: 'Start with personalization, learn basic AI interaction, get your first real win, then build iteration and self-review skills.',
    icon: Sparkles,
    stage: 'Stage 1 - Foundation',
    modules: ALL_SESSION_CONTENT[1]?.modules.length || 7,
    estimatedTime: '2-3 hours',
    prerequisites: 'None - starting point for all users',
    outcomes: [
      'Have productive AI conversations from day one',
      'Use the Flipped Interaction Pattern and Outline Expander',
      'Iterate on AI output for better results',
      'Apply self-review loops to build critical thinking',
    ],
  },
  {
    id: 2,
    title: 'Structured Interaction, Models & Tools',
    description: 'Add structure with the CLEAR Framework, master output templating, multi-shot prompting, model selection, chain-of-thought reasoning, and tool selection.',
    icon: Bot,
    stage: 'Stage 2 - Structure',
    modules: ALL_SESSION_CONTENT[2]?.modules.length || 7,
    estimatedTime: '3-4 hours',
    prerequisites: 'Complete Session 1: Foundation & Early Wins',
    outcomes: [
      'Apply the CLEAR Framework for precision tasks',
      'Use multi-shot prompting and chain-of-thought reasoning',
      'Select the right model and tools for each task',
      'Template output formats for consistent results',
    ],
  },
  {
    id: 3,
    title: 'Agents',
    description: 'Understand why agents exist, learn the Four Levels, and build your own agent from instructions through knowledge, files, and tool access.',
    icon: Building2,
    stage: 'Stage 3 - Agents',
    modules: ALL_SESSION_CONTENT[3]?.modules.length || 7,
    estimatedTime: '4-6 hours',
    prerequisites: 'Complete Session 2: Structured Interaction, Models & Tools',
    outcomes: [
      'Understand the Four Levels of AI agents',
      'Build a basic agent with instructions and constraints',
      'Add knowledge, files, and tool access to agents',
      'Test and deploy a production-quality agent',
    ],
  },
];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const viewingOrgId = searchParams.get('org_id');
  const { user, profile, loading: authLoading } = useAuth();
  // Effective org: super admin drill-down takes priority, otherwise use admin's own org
  const effectiveOrgId = viewingOrgId || profile?.organization_id || null;
  const { isAdmin, loading: roleLoading } = useUserRole();
  const { toast } = useToast();

  // ── Controlled tab state (needed for URL-param admin tour navigation) ───────
  const [activeMainTab, setActiveMainTab] = useState('overview');

  // ── Help panel state ─────────────────────────────────────────────────────────
  const [helpPanelOpen, setHelpPanelOpen] = useState(false);

  // ── Andrea right-pane state ─────────────────────────────────────────────────
  const [andreaPaneOpen, setAndreaPaneOpen] = useState(true);
  const [andreaPaneTab, setAndreaPaneTab] = useState<'chat' | 'notes'>('chat');
  const { addNote } = useAdminAndreaNotes(effectiveOrgId);

  // Admin tour — auto-trigger on first visit or ?tour=admin param
  const { isCompleted: adminTourDone, startTour: startAdminTour } = useTour('admin');
  const { policies, loading: policiesLoading, updatePolicy, createPolicy } = useAllBankPolicies();
  const { sessions: liveSessions, loading: liveSessionsLoading, createSession, updateSession, deleteSession } = useAllLiveTrainingSessions();
  const { settings: appSettings, loading: settingsLoading, updateSetting, getSetting } = useAdminAppSettings();
  
  type EditablePolicy = {
    id: string;
    title: string;
    content: string;
    summary: string | null;
  };

  const [editingPolicy, setEditingPolicy] = useState<EditablePolicy | null>(null);
  const [editForm, setEditForm] = useState({ title: '', content: '', summary: '' });
  const [isCreating, setIsCreating] = useState(false);
  const [isUploadingDoc, setIsUploadingDoc] = useState(false);
  const [newPolicyForm, setNewPolicyForm] = useState({
    policy_type: '',
    title: '',
    content: '',
    summary: '',
    icon: 'BookOpen',
    display_order: 0,
    is_active: true,
    source_file_path: '' as string | null,
  });

  // Live session state
  const [editingSession, setEditingSession] = useState<LiveTrainingSession | null>(null);
  const [isCreatingSession, setIsCreatingSession] = useState(false);
  const [sessionForm, setSessionForm] = useState({
    title: '',
    description: '',
    instructor: '',
    scheduled_date: '',
    duration_minutes: 60,
    max_attendees: 50,
    is_active: true,
  });

  // Events state
  const { events, loading: eventsLoading, createEvent, updateEvent, deleteEvent } = useAllEvents();
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [isCreatingEvent, setIsCreatingEvent] = useState(false);
  const [eventForm, setEventForm] = useState({
    title: '',
    description: '',
    event_type: 'live_training',
    scheduled_date: '',
    duration_minutes: 60,
    location: '',
    instructor: '',
    max_attendees: 50,
  });

  // App settings state
  const [communityUrl, setCommunityUrl] = useState('');
  const [savingCommunityUrl, setSavingCommunityUrl] = useState(false);

  // RAG content management state
  const [seedingChunks, setSeedingChunks] = useState(false);
  const [seedResult, setSeedResult] = useState<{
    success: boolean;
    totalChunks: number;
    totalModules: number;
    embeddings?: { embedded: number; errors?: string[] } | null;
    error?: string;
  } | null>(null);

  // Viewing org context (for super admin drill-down or admin org switching)
  const [viewingOrgName, setViewingOrgName] = useState<string | null>(null);
  const isSuperAdmin = !!profile?.is_super_admin;
  const { organizations: allOrgs } = useOrganizations();

  // Fetch org name when viewing another org
  useEffect(() => {
    if (!viewingOrgId) {
      setViewingOrgName(null);
      return;
    }
    supabase
      .from('organizations')
      .select('name')
      .eq('id', viewingOrgId)
      .single()
      .then(({ data }) => setViewingOrgName(data?.name || 'Unknown Org'));
  }, [viewingOrgId]);

  // Load community URL when settings load
  useEffect(() => {
    if (!settingsLoading) {
      setCommunityUrl(getSetting('community_slack_url'));
    }
  }, [settingsLoading, appSettings]);

  // Handle ?tour= URL params (triggered by HelpPanel replay)
  useEffect(() => {
    const tourParam = searchParams.get('tour');
    if (!tourParam) return;

    // Clear the tour param without affecting other params (e.g. org_id)
    const next = new URLSearchParams(searchParams);
    next.delete('tour');
    setSearchParams(next, { replace: true });

    if (tourParam === 'admin') {
      // Start admin tour — wait for tabs to render
      setTimeout(() => startAdminTour(ADMIN_STEPS), 600);
    }
  }, [searchParams]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-trigger admin tour on first visit (when profile is loaded)
  useEffect(() => {
    if (!profile || adminTourDone) return;
    // Only auto-start if no ?tour= param is driving it (that's handled above)
    if (searchParams.get('tour')) return;
    setTimeout(() => startAdminTour(ADMIN_STEPS), 600);
  }, [profile]); // eslint-disable-line react-hooks/exhaustive-deps

  // Redirect non-admins away
  useEffect(() => {
    if (!authLoading && !roleLoading) {
      if (!user) {
        navigate('/auth');
      } else if (!isAdmin) {
        navigate('/dashboard');
      }
    }
  }, [user, isAdmin, authLoading, roleLoading, navigate]);

  // Show loading state while checking auth/role
  if (authLoading || roleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Don't render if not admin
  if (!isAdmin) {
    return null;
  }

  const handleEditPolicy = (policy: EditablePolicy) => {
    setEditingPolicy(policy);
    setEditForm({
      title: policy.title,
      content: policy.content,
      summary: policy.summary || '',
    });
  };

  const handleSavePolicy = async () => {
    if (!editingPolicy) return;
    const result = await updatePolicy(editingPolicy.id, editForm);
    if (result.success) {
      toast({ title: 'Policy updated', description: 'The policy has been saved successfully.' });
      setEditingPolicy(null);
    } else {
      toast({ title: 'Error', description: result.error, variant: 'destructive' });
    }
  };

  const handleCreatePolicy = async () => {
    if (!newPolicyForm.title || !newPolicyForm.content || !newPolicyForm.policy_type) {
      toast({ title: 'Missing fields', description: 'Please fill in all required fields.', variant: 'destructive' });
      return;
    }
    const result = await createPolicy(newPolicyForm);
    if (result.success) {
      toast({ title: 'Policy created', description: 'The new policy has been added.' });
      setIsCreating(false);
      setNewPolicyForm({
        policy_type: '',
        title: '',
        content: '',
        summary: '',
        icon: 'BookOpen',
        display_order: policies.length,
        is_active: true,
        source_file_path: null,
      });
    } else {
      toast({ title: 'Error', description: result.error, variant: 'destructive' });
    }
  };
  // Handle document upload and AI parsing
  const handleDocumentUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!['pdf', 'docx', 'doc'].includes(ext || '')) {
      toast({ title: 'Unsupported file', description: 'Please upload a .pdf or .docx file.', variant: 'destructive' });
      return;
    }

    setIsUploadingDoc(true);
    try {
      // Upload to storage
      const filePath = `${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from('policy-documents')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Call edge function to parse
      const { data: parseResult, error: parseError } = await supabase.functions.invoke('parse-policy-document', {
        body: { file_path: filePath, file_name: file.name },
      });

      if (parseError) throw parseError;

      if (parseResult?.error) {
        toast({ title: 'Processing failed', description: parseResult.error, variant: 'destructive' });
        return;
      }

      // Pre-fill the form with extracted content
      setNewPolicyForm((prev) => ({
        ...prev,
        title: parseResult.inferred_title || prev.title,
        content: parseResult.content || prev.content,
        summary: parseResult.summary || prev.summary,
        source_file_path: filePath,
        policy_type: prev.policy_type || 'uploaded',
      }));

      toast({ title: 'Document processed', description: 'Content extracted successfully. Review and save.' });
    } catch (err) {
      console.error('Upload error:', err);
      toast({ title: 'Upload failed', description: err instanceof Error ? err.message : 'Unknown error', variant: 'destructive' });
    } finally {
      setIsUploadingDoc(false);
      // Reset file input
      e.target.value = '';
    }
  };

  // Live session handlers
  const resetSessionForm = () => {
    setSessionForm({
      title: '',
      description: '',
      instructor: '',
      scheduled_date: '',
      duration_minutes: 60,
      max_attendees: 50,
      is_active: true,
    });
  };

  const handleEditSession = (session: LiveTrainingSession) => {
    setEditingSession(session);
    setSessionForm({
      title: session.title,
      description: session.description || '',
      instructor: session.instructor,
      scheduled_date: session.scheduled_date.slice(0, 16), // Format for datetime-local input
      duration_minutes: session.duration_minutes,
      max_attendees: session.max_attendees || 50,
      is_active: session.is_active,
    });
  };

  const handleSaveSession = async () => {
    if (!editingSession) return;
    const result = await updateSession(editingSession.id, {
      ...sessionForm,
      scheduled_date: new Date(sessionForm.scheduled_date).toISOString(),
    });
    if (result.success) {
      toast({ title: 'Session updated', description: 'The live session has been saved.' });
      setEditingSession(null);
      resetSessionForm();
    } else {
      toast({ title: 'Error', description: result.error, variant: 'destructive' });
    }
  };

  const handleCreateSession = async () => {
    if (!sessionForm.title || !sessionForm.instructor || !sessionForm.scheduled_date) {
      toast({ title: 'Missing fields', description: 'Please fill in all required fields.', variant: 'destructive' });
      return;
    }
    const result = await createSession({
      ...sessionForm,
      scheduled_date: new Date(sessionForm.scheduled_date).toISOString(),
    });
    if (result.success) {
      toast({ title: 'Session created', description: 'The live session has been scheduled.' });
      setIsCreatingSession(false);
      resetSessionForm();
    } else {
      toast({ title: 'Error', description: result.error, variant: 'destructive' });
    }
  };

  const handleDeleteSession = async (id: string) => {
    const result = await deleteSession(id);
    if (result.success) {
      toast({ title: 'Session deleted', description: 'The live session has been removed.' });
    } else {
      toast({ title: 'Error', description: result.error, variant: 'destructive' });
    }
  };

  // Event handlers
  const resetEventForm = () => {
    setEventForm({
      title: '',
      description: '',
      event_type: 'live_training',
      scheduled_date: '',
      duration_minutes: 60,
      location: '',
      instructor: '',
      max_attendees: 50,
    });
  };

  const handleEditEvent = (event: Event) => {
    setEditingEvent(event);
    setEventForm({
      title: event.title,
      description: event.description || '',
      event_type: event.event_type,
      scheduled_date: event.scheduled_date.slice(0, 16),
      duration_minutes: event.duration_minutes || 60,
      location: event.location || '',
      instructor: event.instructor || '',
      max_attendees: event.max_attendees || 50,
    });
  };

  const handleSaveEvent = async () => {
    if (!editingEvent) return;
    const result = await updateEvent(editingEvent.id, {
      ...eventForm,
      scheduled_date: new Date(eventForm.scheduled_date).toISOString(),
    });
    if (result.success) {
      toast({ title: 'Event updated', description: 'The event has been saved.' });
      setEditingEvent(null);
      resetEventForm();
    } else {
      toast({ title: 'Error', description: result.error, variant: 'destructive' });
    }
  };

  const handleCreateEvent = async () => {
    if (!eventForm.title || !eventForm.scheduled_date || !eventForm.event_type) {
      toast({ title: 'Missing fields', description: 'Please fill in all required fields.', variant: 'destructive' });
      return;
    }
    const result = await createEvent({
      ...eventForm,
      scheduled_date: new Date(eventForm.scheduled_date).toISOString(),
    });
    if (result.success) {
      toast({ title: 'Event created', description: 'The event has been scheduled.' });
      setIsCreatingEvent(false);
      resetEventForm();
    } else {
      toast({ title: 'Error', description: result.error, variant: 'destructive' });
    }
  };

  const handleDeleteEvent = async (id: string) => {
    const result = await deleteEvent(id);
    if (result.success) {
      toast({ title: 'Event deleted', description: 'The event has been removed.' });
    } else {
      toast({ title: 'Error', description: result.error, variant: 'destructive' });
    }
  };

  const handleSaveCommunityUrl = async () => {
    setSavingCommunityUrl(true);
    const result = await updateSetting('community_slack_url', communityUrl);
    if (result.success) {
      toast({ title: 'Settings saved', description: 'Community URL has been updated.' });
    } else {
      toast({ title: 'Error', description: result.error, variant: 'destructive' });
    }
    setSavingCommunityUrl(false);
  };

  const handleSeedAndEmbed = async () => {
    setSeedingChunks(true);
    setSeedResult(null);
    try {
      const allResults = await seedAllContent();
      const sessionsResult = allResults.sessions;
      const electivesResult = allResults.electives;

      // Combine totals for display
      const totalChunks = (sessionsResult.totalChunks || 0) + (electivesResult.totalChunks || 0);
      const totalModules = (sessionsResult.totalModules || 0) + (electivesResult.totalModules || 0);
      const combinedResult = {
        success: sessionsResult.success && electivesResult.success,
        totalChunks,
        totalModules,
        sessions: { ...sessionsResult.sessions, ...electivesResult.sessions },
        embeddings: sessionsResult.embeddings || null,
        error: sessionsResult.error || electivesResult.error || undefined,
      };

      setSeedResult(combinedResult);
      if (combinedResult.success) {
        toast({
          title: 'All content seeded successfully',
          description: `${totalChunks} chunks created across ${totalModules} modules (4 sessions + 4 elective paths).${
            combinedResult.embeddings ? ` ${combinedResult.embeddings.embedded} embeddings generated.` : ''
          }`,
        });
      } else {
        toast({
          title: 'Seed partially failed',
          description: combinedResult.error || 'Unknown error',
          variant: 'destructive',
        });
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      setSeedResult({ success: false, totalChunks: 0, totalModules: 0, error: msg });
      toast({ title: 'Error', description: msg, variant: 'destructive' });
    }
    setSeedingChunks(false);
  };

  return (
    <div className="flex h-full">
      {/* Main content area */}
      <div className="flex-1 min-w-0 overflow-y-auto">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Help panel modal */}
      <HelpPanel open={helpPanelOpen} onOpenChange={setHelpPanelOpen} />

      {/* Org context banner for super admin drill-down */}
      {viewingOrgId && viewingOrgName && (
        <div className="mb-4 flex items-center justify-between rounded-lg border border-primary/20 bg-primary/5 px-4 py-3">
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">
              Viewing: <span className="text-primary">{viewingOrgName}</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            {isSuperAdmin && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/admin')}
                  className="gap-2"
                >
                  <ArrowLeft className="h-3 w-3" />
                  My Org Admin
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/super-admin')}
                  className="gap-2"
                >
                  <Shield className="h-3 w-3" />
                  Super Admin
                </Button>
              </>
            )}
          </div>
        </div>
      )}

      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => viewingOrgId && isSuperAdmin ? navigate('/super-admin') : navigate('/dashboard')}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            {viewingOrgId && isSuperAdmin ? 'Back to Super Admin' : 'Back to Dashboard'}
          </Button>
          <Button variant="ghost" size="sm" className="gap-2" onClick={() => setHelpPanelOpen(true)}>
            <HelpCircle className="h-4 w-4" />
            Help
          </Button>
        </div>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Shield className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-3xl font-bold">
            {viewingOrgName ? `${viewingOrgName} — Administration` : 'Enablement Administration'}
          </h1>
        </div>
        <p className="text-muted-foreground">
          {viewingOrgName
            ? `Managing users and content for ${viewingOrgName}`
            : 'Monitor adoption, review insights, and manage your AI training program'}
        </p>
        {/* Org switcher — admins can switch to view any organization */}
        {allOrgs.length > 0 && (
          <div className="flex items-center gap-2 mt-3">
            <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
            <Select
              value={viewingOrgId || profile?.organization_id || ''}
              onValueChange={(orgId) => {
                if (orgId === profile?.organization_id) {
                  searchParams.delete('org_id');
                } else {
                  searchParams.set('org_id', orgId);
                }
                setSearchParams(searchParams);
              }}
            >
              <SelectTrigger className="w-[280px] h-9">
                <SelectValue placeholder="Select organization" />
              </SelectTrigger>
              <SelectContent>
                {allOrgs.map((org) => (
                  <SelectItem key={org.id} value={org.id}>
                    {org.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      <Tabs value={activeMainTab} onValueChange={setActiveMainTab} className="space-y-6">
        <TabsList className="inline-flex h-auto gap-1 bg-muted p-1">
          <TabsTrigger value="overview" className="flex items-center gap-1.5 text-sm px-4 py-2">
            <Activity className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="people" data-tour="admin-people-tab" className="flex items-center gap-1.5 text-sm px-4 py-2">
            <Users className="h-4 w-4" />
            People
          </TabsTrigger>
          <TabsTrigger value="analytics" data-tour="admin-analytics-tab" className="flex items-center gap-1.5 text-sm px-4 py-2">
            <BarChart3 className="h-4 w-4" />
            Reports
          </TabsTrigger>
          <TabsTrigger value="engagement" data-tour="admin-engagement-tab" className="flex items-center gap-1.5 text-sm px-4 py-2">
            <MessageSquare className="h-4 w-4" />
            Engagement
          </TabsTrigger>
          <TabsTrigger value="training" data-tour="admin-training-tab" className="flex items-center gap-1.5 text-sm px-4 py-2">
            <Sparkles className="h-4 w-4" />
            Training
          </TabsTrigger>
          <TabsTrigger value="config" data-tour="admin-config-tab" className="flex items-center gap-1.5 text-sm px-4 py-2">
            <Settings className="h-4 w-4" />
            Config
          </TabsTrigger>
        </TabsList>

        {/* ── OVERVIEW ── */}
        <TabsContent value="overview" className="space-y-6">
          <ExecutiveOverview
            organizationId={effectiveOrgId}
            onNavigateTab={setActiveMainTab}
          />
        </TabsContent>

        {/* ── PEOPLE ── */}
        <TabsContent value="people" className="space-y-6">
          <Tabs defaultValue="users" className="space-y-4">
            <TabsList className="bg-background border">
              <TabsTrigger value="users" className="gap-1.5 text-xs"><Users className="h-3.5 w-3.5" />Users</TabsTrigger>
              {isSuperAdmin && (
                <TabsTrigger value="orgs" className="gap-1.5 text-xs"><Building2 className="h-3.5 w-3.5" />Organizations</TabsTrigger>
              )}
              <TabsTrigger value="depts" className="gap-1.5 text-xs"><Building2 className="h-3.5 w-3.5" />Departments</TabsTrigger>
            </TabsList>
            <TabsContent value="users"><UsersManagement organizationId={effectiveOrgId} /></TabsContent>
            {isSuperAdmin && (
              <TabsContent value="orgs"><OrganizationsManager /></TabsContent>
            )}
            <TabsContent value="depts"><DepartmentsManager /></TabsContent>
          </Tabs>
        </TabsContent>

        {/* ── REPORTS ── */}
        <TabsContent value="analytics" className="space-y-6">
          <CSuiteReports />
          {/* Detailed learner-level progress table */}
          <ProgressDashboard />
        </TabsContent>

        {/* ── ENGAGEMENT ── */}
        <TabsContent value="engagement" className="space-y-6">
          {/* Ideas Pipeline — both user ideas and executive submissions in one view */}
          <IdeasInbox organizationId={effectiveOrgId} />
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" />
                Executive Submissions
              </CardTitle>
              <CardDescription>
                Ideas, friction points, and shared agents submitted to leadership
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ExecutiveSubmissions organizationId={effectiveOrgId} />
            </CardContent>
          </Card>
          <CommunityReviewQueue organizationId={effectiveOrgId} />
        </TabsContent>

        {/* ── TRAINING ── */}
        <TabsContent value="training" className="space-y-6">
          <Tabs defaultValue="live-feed" className="space-y-4">
            <TabsList className="bg-background border">
              <TabsTrigger value="live-feed" className="gap-1.5 text-xs"><Radio className="h-3.5 w-3.5" />Live Feed</TabsTrigger>
              <TabsTrigger value="programs" className="gap-1.5 text-xs"><Sparkles className="h-3.5 w-3.5" />Programs</TabsTrigger>
              <TabsTrigger value="policies" className="gap-1.5 text-xs"><Shield className="h-3.5 w-3.5" />Policies</TabsTrigger>
              <TabsTrigger value="learning-styles" className="gap-1.5 text-xs"><Brain className="h-3.5 w-3.5" />Styles</TabsTrigger>
              <TabsTrigger value="content" className="gap-1.5 text-xs"><FileText className="h-3.5 w-3.5" />Content</TabsTrigger>
            </TabsList>

            {/* Live Feed */}
            <TabsContent value="live-feed" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Radio className="h-5 w-5 text-primary" />
                        Live Training Sessions
                      </CardTitle>
                      <CardDescription>
                        Schedule and manage live training sessions for users
                      </CardDescription>
                    </div>
                    <Button onClick={() => setIsCreatingSession(true)} className="gap-2">
                      <Plus className="h-4 w-4" />
                      Add Session
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {liveSessionsLoading ? (
                    <div className="text-center py-8 text-muted-foreground">Loading sessions...</div>
                  ) : liveSessions.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No live sessions scheduled. Click "Add Session" to create one.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {liveSessions.map((session) => (
                        <Card key={session.id} className="border">
                          <CardHeader className="pb-3">
                            <div className="flex items-start justify-between">
                              <div>
                                <div className="flex items-center gap-2">
                                  <CardTitle className="text-lg">{session.title}</CardTitle>
                                  {!session.is_active && (
                                    <Badge variant="outline" className="text-xs">Inactive</Badge>
                                  )}
                                  {new Date(session.scheduled_date) < new Date() && (
                                    <Badge variant="secondary" className="text-xs">Past</Badge>
                                  )}
                                </div>
                                <CardDescription>{session.description}</CardDescription>
                              </div>
                              <div className="flex gap-2">
                                <Button variant="outline" size="sm" onClick={() => handleEditSession(session)} className="gap-2">
                                  <Edit className="h-4 w-4" />
                                  Edit
                                </Button>
                                <Button variant="outline" size="sm" onClick={() => handleDeleteSession(session.id)} className="gap-2 text-destructive hover:text-destructive">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1"><Users className="h-4 w-4" />{session.instructor}</div>
                              <div className="flex items-center gap-1"><Calendar className="h-4 w-4" />{new Date(session.scheduled_date).toLocaleDateString()}</div>
                              <div className="flex items-center gap-1"><Clock className="h-4 w-4" />{new Date(session.scheduled_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                              <Badge variant="secondary">{session.duration_minutes} min</Badge>
                              {session.max_attendees && <span>Max: {session.max_attendees} attendees</span>}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Edit Session Dialog */}
              <Dialog open={!!editingSession} onOpenChange={(open) => !open && setEditingSession(null)}>
                <DialogContent className="max-w-lg">
                  <DialogHeader><DialogTitle>Edit Live Session</DialogTitle></DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-title">Title *</Label>
                      <Input id="edit-title" value={sessionForm.title} onChange={(e) => setSessionForm({ ...sessionForm, title: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-description">Description</Label>
                      <Textarea id="edit-description" value={sessionForm.description} onChange={(e) => setSessionForm({ ...sessionForm, description: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-instructor">Instructor *</Label>
                      <Input id="edit-instructor" value={sessionForm.instructor} onChange={(e) => setSessionForm({ ...sessionForm, instructor: e.target.value })} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="edit-date">Date & Time *</Label>
                        <Input id="edit-date" type="datetime-local" value={sessionForm.scheduled_date} onChange={(e) => setSessionForm({ ...sessionForm, scheduled_date: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-duration">Duration (minutes)</Label>
                        <Input id="edit-duration" type="number" value={sessionForm.duration_minutes} onChange={(e) => setSessionForm({ ...sessionForm, duration_minutes: parseInt(e.target.value) || 60 })} />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="edit-max">Max Attendees</Label>
                        <Input id="edit-max" type="number" value={sessionForm.max_attendees} onChange={(e) => setSessionForm({ ...sessionForm, max_attendees: parseInt(e.target.value) || 50 })} />
                      </div>
                      <div className="space-y-2 flex items-end gap-2">
                        <input type="checkbox" id="edit-active" checked={sessionForm.is_active} onChange={(e) => setSessionForm({ ...sessionForm, is_active: e.target.checked })} className="h-4 w-4" />
                        <Label htmlFor="edit-active">Active</Label>
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setEditingSession(null)}><X className="h-4 w-4 mr-2" />Cancel</Button>
                    <Button onClick={handleSaveSession}><Save className="h-4 w-4 mr-2" />Save Changes</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              {/* Create Session Dialog */}
              <Dialog open={isCreatingSession} onOpenChange={setIsCreatingSession}>
                <DialogContent className="max-w-lg">
                  <DialogHeader><DialogTitle>Schedule Live Session</DialogTitle></DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="new-title">Title *</Label>
                      <Input id="new-title" value={sessionForm.title} onChange={(e) => setSessionForm({ ...sessionForm, title: e.target.value })} placeholder="AI for Credit Risk Analysis" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="new-description">Description</Label>
                      <Textarea id="new-description" value={sessionForm.description} onChange={(e) => setSessionForm({ ...sessionForm, description: e.target.value })} placeholder="What will participants learn?" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="new-instructor">Instructor *</Label>
                      <Input id="new-instructor" value={sessionForm.instructor} onChange={(e) => setSessionForm({ ...sessionForm, instructor: e.target.value })} placeholder="Sarah Chen" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="new-date">Date & Time *</Label>
                        <Input id="new-date" type="datetime-local" value={sessionForm.scheduled_date} onChange={(e) => setSessionForm({ ...sessionForm, scheduled_date: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="new-duration">Duration (minutes)</Label>
                        <Input id="new-duration" type="number" value={sessionForm.duration_minutes} onChange={(e) => setSessionForm({ ...sessionForm, duration_minutes: parseInt(e.target.value) || 60 })} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="new-max">Max Attendees</Label>
                      <Input id="new-max" type="number" value={sessionForm.max_attendees} onChange={(e) => setSessionForm({ ...sessionForm, max_attendees: parseInt(e.target.value) || 50 })} />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => { setIsCreatingSession(false); resetSessionForm(); }}><X className="h-4 w-4 mr-2" />Cancel</Button>
                    <Button onClick={handleCreateSession}><Plus className="h-4 w-4 mr-2" />Schedule Session</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </TabsContent>

            {/* Programs */}
            <TabsContent value="programs" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    AI Training Program Overview
                  </CardTitle>
                  <CardDescription>
                    Three-stage progressive training: Foundation → Structured Interaction → Agents
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-center gap-2 mb-8 flex-wrap">
                    <div className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 rounded-lg border border-blue-500/20">
                      <Sparkles className="h-4 w-4 text-blue-600" />
                      <span className="font-medium text-blue-600">Stage 1: Foundation</span>
                    </div>
                    <div className="text-muted-foreground">→</div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-purple-500/10 rounded-lg border border-purple-500/20">
                      <Bot className="h-4 w-4 text-purple-600" />
                      <span className="font-medium text-purple-600">Stage 2: Structured Interaction</span>
                    </div>
                    <div className="text-muted-foreground">→</div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-green-500/10 rounded-lg border border-green-500/20">
                      <Building2 className="h-4 w-4 text-green-600" />
                      <span className="font-medium text-green-600">Stage 3: Agents</span>
                    </div>
                  </div>

                  <div className="space-y-6">
                    {CORE_PROGRAMS.map((program, idx) => {
                      const IconComponent = program.icon;
                      const stageColors = [
                        'border-blue-500/30 bg-blue-500/5',
                        'border-purple-500/30 bg-purple-500/5',
                        'border-green-500/30 bg-green-500/5',
                      ];
                      return (
                        <Card key={program.id} className={`border-2 ${stageColors[idx]}`}>
                          <CardHeader>
                            <div className="flex items-start justify-between">
                              <div className="flex items-center gap-3">
                                <div className="p-3 bg-background rounded-lg shadow-sm">
                                  <IconComponent className="h-6 w-6 text-primary" />
                                </div>
                                <div>
                                  <Badge variant="outline" className="mb-1">{program.stage}</Badge>
                                  <CardTitle className="text-xl">{program.title}</CardTitle>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                  <BookOpen className="h-4 w-4" />{program.modules} modules
                                </div>
                                <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                                  <Clock className="h-4 w-4" />{program.estimatedTime}
                                </div>
                              </div>
                            </div>
                            <CardDescription className="mt-2">{program.description}</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="grid gap-4 md:grid-cols-2">
                              <div>
                                <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                                  <CheckCircle className="h-4 w-4 text-green-500" />Learning Outcomes
                                </h4>
                                <ul className="space-y-1">
                                  {program.outcomes.map((outcome, outIdx) => (
                                    <li key={outIdx} className="text-sm text-muted-foreground flex items-start gap-2">
                                      <span className="text-primary mt-1">•</span>{outcome}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                              <div className="bg-muted/50 p-4 rounded-lg">
                                <h4 className="font-medium text-sm mb-2">Prerequisites</h4>
                                <p className="text-sm text-muted-foreground">{program.prerequisites}</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Policies */}
            <TabsContent value="policies" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5 text-primary" />
                        Bank Policy Management
                      </CardTitle>
                      <CardDescription>
                        Configure AI usage policies, data security guidelines, and best practices
                      </CardDescription>
                    </div>
                    <Button onClick={() => setIsCreating(true)} className="gap-2">
                      <Plus className="h-4 w-4" />Add Policy
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {policiesLoading ? (
                    <div className="text-center py-8 text-muted-foreground">Loading policies...</div>
                  ) : policies.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">No policies configured. Click "Add Policy" to create one.</div>
                  ) : (
                    <div className="space-y-4">
                      {policies.map((policy) => (
                        <Card key={policy.id} className="border">
                          <CardHeader className="pb-3">
                            <div className="flex items-start justify-between">
                              <div>
                                <div className="flex items-center gap-2">
                                  <CardTitle className="text-lg">{policy.title}</CardTitle>
                                  {!policy.is_active && <Badge variant="outline" className="text-xs">Inactive</Badge>}
                                </div>
                                <CardDescription>{policy.summary}</CardDescription>
                              </div>
                              <Button variant="outline" size="sm" onClick={() => handleEditPolicy(policy)} className="gap-2">
                                <Edit className="h-4 w-4" />Edit
                              </Button>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <Badge variant="secondary">{policy.policy_type.replace('_', ' ')}</Badge>
                              <span>Order: {policy.display_order}</span>
                              <span>Updated: {new Date(policy.updated_at || '').toLocaleDateString()}</span>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Edit Policy Dialog */}
              <Dialog open={!!editingPolicy} onOpenChange={(open) => !open && setEditingPolicy(null)}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                  <DialogHeader><DialogTitle>Edit Policy: {editingPolicy?.title}</DialogTitle></DialogHeader>
                  <ScrollArea className="flex-1 pr-4">
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="title">Title</Label>
                        <Input id="title" value={editForm.title} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="summary">Summary</Label>
                        <Input id="summary" value={editForm.summary} onChange={(e) => setEditForm({ ...editForm, summary: e.target.value })} placeholder="Brief description for the policy card" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="content">Content (Markdown supported)</Label>
                        <Textarea id="content" value={editForm.content} onChange={(e) => setEditForm({ ...editForm, content: e.target.value })} className="min-h-[400px] font-mono text-sm" />
                      </div>
                    </div>
                  </ScrollArea>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setEditingPolicy(null)}><X className="h-4 w-4 mr-2" />Cancel</Button>
                    <Button onClick={handleSavePolicy}><Save className="h-4 w-4 mr-2" />Save Changes</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              {/* Create Policy Dialog */}
              <Dialog open={isCreating} onOpenChange={setIsCreating}>
                <DialogContent className="max-w-4xl max-h-[90vh]">
                  <DialogHeader><DialogTitle>Create New Policy</DialogTitle></DialogHeader>
                  <div className="max-h-[70vh] overflow-y-auto pr-2">
                    <div className="space-y-4 py-4">
                      <div className="rounded-lg border-2 border-dashed border-border p-6 text-center">
                        <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-sm font-medium mb-1">Upload a policy document</p>
                        <p className="text-xs text-muted-foreground mb-3">Upload a .pdf or .docx file — Andrea will extract and format the content automatically</p>
                        <label className="inline-flex items-center gap-2 cursor-pointer">
                          <Button variant="outline" size="sm" asChild disabled={isUploadingDoc}>
                            <span>
                              {isUploadingDoc ? (<><Loader2 className="h-4 w-4 animate-spin mr-1" />Processing…</>) : (<><Upload className="h-4 w-4 mr-1" />Choose File</>)}
                            </span>
                          </Button>
                          <input type="file" accept=".pdf,.docx,.doc" onChange={handleDocumentUpload} className="hidden" disabled={isUploadingDoc} />
                        </label>
                        {newPolicyForm.source_file_path && (
                          <p className="text-xs text-primary mt-2 flex items-center justify-center gap-1">
                            <CheckCircle className="h-3 w-3" />Document processed — review content below
                          </p>
                        )}
                      </div>
                      <div className="relative flex items-center gap-3">
                        <div className="flex-1 border-t border-border" />
                        <span className="text-xs text-muted-foreground">or fill in manually</span>
                        <div className="flex-1 border-t border-border" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="new-type">Policy Type</Label>
                          <Input id="new-type" value={newPolicyForm.policy_type} onChange={(e) => setNewPolicyForm({ ...newPolicyForm, policy_type: e.target.value })} placeholder="ai_usage" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="new-policy-title">Title</Label>
                          <Input id="new-policy-title" value={newPolicyForm.title} onChange={(e) => setNewPolicyForm({ ...newPolicyForm, title: e.target.value })} placeholder="AI Usage Policy" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="new-summary">Summary</Label>
                        <Input id="new-summary" value={newPolicyForm.summary} onChange={(e) => setNewPolicyForm({ ...newPolicyForm, summary: e.target.value })} placeholder="Brief description" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="new-content">Content (Markdown supported)</Label>
                        <Textarea id="new-content" value={newPolicyForm.content} onChange={(e) => setNewPolicyForm({ ...newPolicyForm, content: e.target.value })} className="min-h-[300px] font-mono text-sm" placeholder="# Policy Title&#10;&#10;## Section 1&#10;&#10;Policy content here..." />
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsCreating(false)}><X className="h-4 w-4 mr-2" />Cancel</Button>
                    <Button onClick={handleCreatePolicy} disabled={isUploadingDoc}><Plus className="h-4 w-4 mr-2" />Create Policy</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </TabsContent>

            {/* Learning Styles */}
            <TabsContent value="learning-styles" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5 text-primary" />
                    Interaction Preference Styles
                  </CardTitle>
                  <CardDescription>
                    Four distinct learning approaches that determine how training content is delivered
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6 md:grid-cols-2">
                    {learningStyles.map((style) => {
                      const IconComponent = styleIconMap[style.id] || BookOpen;
                      return (
                        <Card key={style.id} className={`border-2 ${styleColorMap[style.id]}`}>
                          <CardHeader className="pb-3">
                            <div className="flex items-start justify-between">
                              <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-background">
                                  <IconComponent className="h-5 w-5" />
                                </div>
                                <div>
                                  <CardTitle className="text-lg">{style.name}</CardTitle>
                                  <Badge variant="outline" className="mt-1 text-xs">{style.id}</Badge>
                                </div>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <p className="text-sm font-medium">{style.shortDescription}</p>
                            <p className="text-sm text-muted-foreground">{style.fullDescription}</p>
                            <div>
                              <h4 className="text-sm font-semibold mb-2">Key Characteristics:</h4>
                              <ul className="space-y-1">
                                {style.characteristics.map((char, idx) => (
                                  <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <CheckCircle className="h-4 w-4 mt-0.5 shrink-0 text-green-500" />{char}
                                  </li>
                                ))}
                              </ul>
                            </div>
                            <div className="pt-3 border-t">
                              <h4 className="text-sm font-semibold mb-1">Lesson Delivery Approach:</h4>
                              <p className="text-sm text-muted-foreground">{style.lessonApproach}</p>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Content */}
            <TabsContent value="content" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    Curriculum Content Guide
                  </CardTitle>
                  <CardDescription>
                    Detailed module content, learning objectives, and expected outcomes
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[600px] pr-4">
                    <Accordion type="multiple" className="space-y-4">
                      {Object.values(ALL_SESSION_CONTENT).map((session) => (
                        <AccordionItem key={session.id} value={`session-${session.id}`} className="border rounded-lg px-4">
                          <AccordionTrigger className="hover:no-underline">
                            <div className="flex items-center gap-3">
                              {session.id === 1 && <Sparkles className="h-5 w-5 text-primary" />}
                              {session.id === 2 && <Bot className="h-5 w-5 text-primary" />}
                              {session.id === 3 && <Building2 className="h-5 w-5 text-primary" />}
                              <span className="font-semibold">Session {session.id}: {session.title}</span>
                              <Badge variant="secondary">{session.modules.length} modules</Badge>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="pt-4">
                            <div className="space-y-6">
                              {session.modules.map((module, moduleIdx) => {
                                const ModuleIcon = moduleTypeIcon[module.type] || BookOpen;
                                return (
                                  <div key={module.id} className="border-l-4 border-primary/30 pl-4">
                                    <div className="flex items-start gap-3 mb-2">
                                      <div className="p-2 bg-muted rounded-lg"><ModuleIcon className="h-4 w-4" /></div>
                                      <div className="flex-1">
                                        <h4 className="font-semibold text-lg">Module {moduleIdx + 1}: {module.title}</h4>
                                        <div className="flex items-center gap-2 mt-1">
                                          <Badge variant="outline" className="text-xs">{module.type}</Badge>
                                          <span className="text-sm text-muted-foreground flex items-center gap-1"><Clock className="h-3 w-3" />{module.estimatedTime}</span>
                                        </div>
                                      </div>
                                    </div>
                                    <p className="text-muted-foreground mb-4">{module.description}</p>
                                    <div className="grid gap-4 md:grid-cols-2">
                                      <div className="bg-muted/50 p-4 rounded-lg">
                                        <h5 className="font-medium text-sm mb-2 flex items-center gap-2"><Target className="h-4 w-4 text-primary" />Learning Objectives</h5>
                                        <ul className="text-sm text-muted-foreground space-y-1">
                                          {module.learningObjectives.map((obj, objIdx) => (<li key={objIdx}>• {obj}</li>))}
                                        </ul>
                                      </div>
                                      <div className="bg-muted/50 p-4 rounded-lg">
                                        <h5 className="font-medium text-sm mb-2 flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" />Practice Task</h5>
                                        <p className="text-sm font-medium">{module.content.practiceTask.title}</p>
                                        <p className="text-sm text-muted-foreground mt-1">{module.content.practiceTask.instructions}</p>
                                      </div>
                                    </div>
                                    <div className="mt-4 bg-blue-500/5 border border-blue-500/20 p-4 rounded-lg">
                                      <h5 className="font-medium text-sm mb-2 text-blue-600">Content Delivery by Learning Style</h5>
                                      <div className="grid gap-2 text-sm">
                                        {learningStyles.map((style) => (
                                          <div key={style.id} className="flex items-start gap-2">
                                            <Badge variant="outline" className={`text-xs shrink-0 ${styleColorMap[style.id]}`}>{style.name}</Badge>
                                            <span className="text-muted-foreground">
                                              {style.id === 'example-based' && 'Opens with annotated sample output, then deconstructs process'}
                                              {style.id === 'explanation-based' && 'Provides comprehensive context and step-by-step rationale'}
                                              {style.id === 'hands-on' && 'Quick context, immediate guided practice with feedback'}
                                              {style.id === 'logic-based' && 'Decision framework first, failure modes, then systematic execution'}
                                            </span>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </ScrollArea>
                </CardContent>
              </Card>

              <div className="grid gap-4 md:grid-cols-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg"><Sparkles className="h-5 w-5 text-primary" /></div>
                      <div><p className="text-2xl font-bold">{CORE_PROGRAMS.length}</p><p className="text-sm text-muted-foreground">Core Programs</p></div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-500/10 rounded-lg"><BookOpen className="h-5 w-5 text-blue-500" /></div>
                      <div><p className="text-2xl font-bold">{Object.values(ALL_SESSION_CONTENT).reduce((acc, s) => acc + s.modules.length, 0)}</p><p className="text-sm text-muted-foreground">Total Modules</p></div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-500/10 rounded-lg"><Building2 className="h-5 w-5 text-green-500" /></div>
                      <div><p className="text-2xl font-bold">{departments.length}</p><p className="text-sm text-muted-foreground">Department Tracks</p></div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-orange-500/10 rounded-lg"><Brain className="h-5 w-5 text-orange-500" /></div>
                      <div><p className="text-2xl font-bold">{learningStyles.length}</p><p className="text-sm text-muted-foreground">Learning Styles</p></div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </TabsContent>

        {/* ── CONFIG ── */}
        <TabsContent value="config" className="space-y-6">
          <Tabs defaultValue="events" className="space-y-4">
            <TabsList className="bg-background border">
              <TabsTrigger value="events" className="gap-1.5 text-xs"><CalendarDays className="h-3.5 w-3.5" />Events</TabsTrigger>
              <TabsTrigger value="resources" className="gap-1.5 text-xs"><Link2 className="h-3.5 w-3.5" />Resources</TabsTrigger>
              <TabsTrigger value="settings" className="gap-1.5 text-xs"><Settings className="h-3.5 w-3.5" />Settings</TabsTrigger>
            </TabsList>

            {/* Events */}
            <TabsContent value="events" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <CalendarDays className="h-5 w-5 text-primary" />
                        Events Calendar Management
                      </CardTitle>
                      <CardDescription>Create and manage events that appear on user dashboards</CardDescription>
                    </div>
                    <Button onClick={() => setIsCreatingEvent(true)} className="gap-2">
                      <Plus className="h-4 w-4" />Add Event
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {eventsLoading ? (
                    <div className="text-center py-8 text-muted-foreground">Loading events...</div>
                  ) : events.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">No events scheduled. Click "Add Event" to create one.</div>
                  ) : (
                    <div className="space-y-4">
                      {events.map((event) => {
                        const config = getEventTypeConfig(event.event_type);
                        const EventIcon = config.icon;
                        return (
                          <Card key={event.id} className="border">
                            <CardHeader className="pb-3">
                              <div className="flex items-start justify-between">
                                <div>
                                  <div className="flex items-center gap-2">
                                    <div className={`p-1.5 rounded ${config.color}`}><EventIcon className="h-3.5 w-3.5" /></div>
                                    <CardTitle className="text-lg">{event.title}</CardTitle>
                                    {!event.is_active && <Badge variant="outline" className="text-xs">Inactive</Badge>}
                                    {new Date(event.scheduled_date) < new Date() && <Badge variant="secondary" className="text-xs">Past</Badge>}
                                  </div>
                                  <CardDescription>{event.description}</CardDescription>
                                </div>
                                <div className="flex gap-2">
                                  <Button variant="outline" size="sm" onClick={() => handleEditEvent(event)} className="gap-2"><Edit className="h-4 w-4" />Edit</Button>
                                  <Button variant="outline" size="sm" onClick={() => handleDeleteEvent(event.id)} className="gap-2 text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
                                </div>
                              </div>
                            </CardHeader>
                            <CardContent>
                              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                                <Badge variant="secondary" className={config.color}>{config.label}</Badge>
                                <div className="flex items-center gap-1"><Calendar className="h-4 w-4" />{new Date(event.scheduled_date).toLocaleDateString()}</div>
                                <div className="flex items-center gap-1"><Clock className="h-4 w-4" />{new Date(event.scheduled_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                {event.duration_minutes && <Badge variant="secondary">{event.duration_minutes} min</Badge>}
                                {event.instructor && <div className="flex items-center gap-1"><Users className="h-4 w-4" />{event.instructor}</div>}
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Edit Event Dialog */}
              <Dialog open={!!editingEvent} onOpenChange={(open) => !open && setEditingEvent(null)}>
                <DialogContent className="max-w-lg">
                  <DialogHeader><DialogTitle>Edit Event</DialogTitle></DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-event-title">Title *</Label>
                      <Input id="edit-event-title" value={eventForm.title} onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-event-desc">Description</Label>
                      <Textarea id="edit-event-desc" value={eventForm.description} onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="edit-event-type">Event Type *</Label>
                        <select id="edit-event-type" value={eventForm.event_type} onChange={(e) => setEventForm({ ...eventForm, event_type: e.target.value })} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                          <option value="live_training">Live Training</option>
                          <option value="office_hours">Office Hours</option>
                          <option value="webinar">Webinar</option>
                          <option value="deadline">Deadline</option>
                          <option value="community_session">Community Session</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-event-date">Date & Time *</Label>
                        <Input id="edit-event-date" type="datetime-local" value={eventForm.scheduled_date} onChange={(e) => setEventForm({ ...eventForm, scheduled_date: e.target.value })} />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="edit-event-duration">Duration (minutes)</Label>
                        <Input id="edit-event-duration" type="number" value={eventForm.duration_minutes} onChange={(e) => setEventForm({ ...eventForm, duration_minutes: parseInt(e.target.value) || 60 })} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-event-instructor">Instructor</Label>
                        <Input id="edit-event-instructor" value={eventForm.instructor} onChange={(e) => setEventForm({ ...eventForm, instructor: e.target.value })} />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="edit-event-location">Location / URL</Label>
                        <Input id="edit-event-location" value={eventForm.location} onChange={(e) => setEventForm({ ...eventForm, location: e.target.value })} placeholder="https://zoom.us/... or Room 101" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-event-max">Max Attendees</Label>
                        <Input id="edit-event-max" type="number" value={eventForm.max_attendees} onChange={(e) => setEventForm({ ...eventForm, max_attendees: parseInt(e.target.value) || 50 })} />
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setEditingEvent(null)}><X className="h-4 w-4 mr-2" />Cancel</Button>
                    <Button onClick={handleSaveEvent}><Save className="h-4 w-4 mr-2" />Save Changes</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              {/* Create Event Dialog */}
              <Dialog open={isCreatingEvent} onOpenChange={setIsCreatingEvent}>
                <DialogContent className="max-w-lg">
                  <DialogHeader><DialogTitle>Create New Event</DialogTitle></DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="new-event-title">Title *</Label>
                      <Input id="new-event-title" value={eventForm.title} onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })} placeholder="AI for Credit Risk Analysis" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="new-event-desc">Description</Label>
                      <Textarea id="new-event-desc" value={eventForm.description} onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })} placeholder="What will participants learn or discuss?" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="new-event-type">Event Type *</Label>
                        <select id="new-event-type" value={eventForm.event_type} onChange={(e) => setEventForm({ ...eventForm, event_type: e.target.value })} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                          <option value="live_training">Live Training</option>
                          <option value="office_hours">Office Hours</option>
                          <option value="webinar">Webinar</option>
                          <option value="deadline">Deadline</option>
                          <option value="community_session">Community Session</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="new-event-date">Date & Time *</Label>
                        <Input id="new-event-date" type="datetime-local" value={eventForm.scheduled_date} onChange={(e) => setEventForm({ ...eventForm, scheduled_date: e.target.value })} />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="new-event-duration">Duration (minutes)</Label>
                        <Input id="new-event-duration" type="number" value={eventForm.duration_minutes} onChange={(e) => setEventForm({ ...eventForm, duration_minutes: parseInt(e.target.value) || 60 })} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="new-event-instructor">Instructor</Label>
                        <Input id="new-event-instructor" value={eventForm.instructor} onChange={(e) => setEventForm({ ...eventForm, instructor: e.target.value })} placeholder="Sarah Chen" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="new-event-location">Location / URL</Label>
                        <Input id="new-event-location" value={eventForm.location} onChange={(e) => setEventForm({ ...eventForm, location: e.target.value })} placeholder="https://zoom.us/... or Room 101" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="new-event-max">Max Attendees</Label>
                        <Input id="new-event-max" type="number" value={eventForm.max_attendees} onChange={(e) => setEventForm({ ...eventForm, max_attendees: parseInt(e.target.value) || 50 })} />
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => { setIsCreatingEvent(false); resetEventForm(); }}><X className="h-4 w-4 mr-2" />Cancel</Button>
                    <Button onClick={handleCreateEvent}><Plus className="h-4 w-4 mr-2" />Create Event</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </TabsContent>

            {/* Resources */}
            <TabsContent value="resources" className="space-y-6">
              <OrgResourcesManager organizationId={effectiveOrgId} />
            </TabsContent>

            {/* Settings */}
            <TabsContent value="settings" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5 text-primary" />
                    Platform Settings
                  </CardTitle>
                  <CardDescription>Configure global settings for the training platform</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <MessageCircle className="h-5 w-5 text-muted-foreground" />
                      <h3 className="font-semibold">Community Hub</h3>
                    </div>
                    <div className="pl-7 space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="community-url">Slack Workspace Invite URL</Label>
                        <div className="flex gap-2">
                          <div className="flex-1 relative">
                            <Link className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input id="community-url" value={communityUrl} onChange={(e) => setCommunityUrl(e.target.value)} placeholder="https://join.slack.com/t/your-workspace/..." className="pl-10" />
                          </div>
                          <Button onClick={handleSaveCommunityUrl} disabled={savingCommunityUrl} className="gap-2">
                            {savingCommunityUrl ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}Save
                          </Button>
                        </div>
                        <p className="text-sm text-muted-foreground">Enter your Slack workspace invite link. This will enable the "Join Community" button on user dashboards.</p>
                      </div>
                      {communityUrl && (
                        <div className="p-3 bg-muted/50 rounded-lg">
                          <p className="text-sm text-muted-foreground"><span className="font-medium text-foreground">Preview:</span> Users will see a "Join Community" button that links to:</p>
                          <a href={communityUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline break-all">{communityUrl}</a>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5 text-primary" />
                    AI Knowledge Base
                  </CardTitle>
                  <CardDescription>Seed lesson content chunks and generate vector embeddings for Andrea's RAG retrieval</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2">
                    <RefreshCw className="h-5 w-5 text-muted-foreground" />
                    <h3 className="font-semibold">Seed &amp; Embed Content</h3>
                  </div>
                  <p className="text-sm text-muted-foreground pl-7">
                    This will extract all lesson content into searchable chunks and generate AI embeddings. Run this whenever curriculum content is updated.
                  </p>
                  <div className="pl-7 flex items-center gap-3">
                    <Button onClick={handleSeedAndEmbed} disabled={seedingChunks} className="gap-2">
                      {seedingChunks ? <Loader2 className="h-4 w-4 animate-spin" /> : <Database className="h-4 w-4" />}
                      {seedingChunks ? 'Seeding & Embedding...' : 'Seed All Content'}
                    </Button>
                    {seedResult && (
                      <Badge variant={seedResult.success ? 'default' : 'destructive'}>
                        {seedResult.success ? `${seedResult.totalChunks} chunks${seedResult.embeddings ? ` · ${seedResult.embeddings.embedded} embedded` : ''}` : 'Failed'}
                      </Badge>
                    )}
                  </div>
                  {seedResult?.success && (
                    <div className="pl-7 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                      <p className="text-sm text-green-700 dark:text-green-400 font-medium">✓ Knowledge base updated</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {seedResult.totalModules} modules → {seedResult.totalChunks} chunks.
                        {seedResult.embeddings ? ` ${seedResult.embeddings.embedded} vector embeddings generated.` : ' Embeddings will be generated when OPENAI_API_KEY is configured.'}
                        {seedResult.embeddings?.errors && seedResult.embeddings.errors.length > 0 && (
                          <span className="text-amber-600"> ({seedResult.embeddings.errors.length} embedding errors)</span>
                        )}
                      </p>
                    </div>
                  )}
                  {seedResult?.error && (
                    <div className="pl-7 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                      <p className="text-sm text-red-600 dark:text-red-400">{seedResult.error}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </TabsContent>
      </Tabs>
    </div>
    </div>

      {/* Andrea right pane — visible on all tabs, sticky to viewport */}
      <>
        {/* Toggle button when collapsed */}
        {!andreaPaneOpen && (
          <button
            onClick={() => setAndreaPaneOpen(true)}
            className="fixed right-0 top-1/2 -translate-y-1/2 z-50 bg-primary text-primary-foreground px-1.5 py-4 rounded-l-lg shadow-lg hover:bg-primary/90 transition-colors"
            title="Open Andrea"
          >
            <span className="text-xs [writing-mode:vertical-lr] rotate-180 font-medium">Andrea</span>
          </button>
        )}

        {andreaPaneOpen && (
          <div className="w-[420px] shrink-0 border-l border-border bg-background flex flex-col h-full sticky top-0 self-start" style={{ height: '100vh' }}>
            {/* Pane header with tabs */}
            <div className="flex items-center border-b px-3 py-2 gap-2 shrink-0">
              <div className="flex gap-1 flex-1">
                <button
                  onClick={() => setAndreaPaneTab('chat')}
                  className={`text-xs px-3 py-1.5 rounded-md font-medium transition-colors ${
                    andreaPaneTab === 'chat'
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-muted'
                  }`}
                >
                  Chat
                </button>
                <button
                  onClick={() => setAndreaPaneTab('notes')}
                  className={`text-xs px-3 py-1.5 rounded-md font-medium transition-colors ${
                    andreaPaneTab === 'notes'
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-muted'
                  }`}
                >
                  Notes
                </button>
              </div>
              <button
                onClick={() => setAndreaPaneOpen(false)}
                className="text-muted-foreground hover:text-foreground transition-colors p-1"
                title="Collapse Andrea pane"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Pane content */}
            <div className="flex-1 overflow-hidden">
              {andreaPaneTab === 'chat' ? (
                <CSuiteAdvisorPanel
                  organizationId={effectiveOrgId}
                  onSummarize={(summary) => addNote(summary)}
                />
              ) : (
                <div className="p-4 overflow-y-auto h-full">
                  <AndreaNotesPanel organizationId={effectiveOrgId} />
                </div>
              )}
            </div>
          </div>
        )}
      </>
    </div>
  );
}
