import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth, type UserProfile } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ALL_SESSION_CONTENT, type ModuleContent } from '@/data/trainingContent';
import { VideoModal } from '@/components/VideoModal';
import { TrainerChatPanel } from '@/components/training/TrainerChatPanel';
import { PracticeChatPanel } from '@/components/training/PracticeChatPanel';
import { ModuleListSidebar } from '@/components/training/ModuleListSidebar';
import { ChatGPTSidebar } from '@/components/training/ChatGPTSidebar';
import { ChatGPTPracticeChatPanel } from '@/components/training/ChatGPTPracticeChatPanel';
import { useOrgPlatform } from '@/hooks/useOrgPlatform';
import { type Message, type BankPolicy } from '@/types/training';
import type { SessionProgressData, ModuleEngagement } from '@/types/progress';
import { DEFAULT_ENGAGEMENT } from '@/types/progress';
import { deriveSkillSignals } from '@/utils/deriveSkillSignals';
import { getQuestionsForCompletedModules } from '@/data/spacedRepetitionBank';
import { getRoleScenario } from '@/data/roleScenarioBanks';
import { selectRetrievalQuestions, formatRetrievalQuestionsForAndrea } from '@/utils/spacedRepetition';
import { useAIMemories } from '@/hooks/useAIPreferences';
import { useSkillAssessment } from '@/hooks/useSkillAssessment';
import { usePracticeConversations } from '@/hooks/usePracticeConversations';
import { useUserAgents } from '@/hooks/useUserAgents';
import { useUserWorkflows } from '@/hooks/useUserWorkflows';
import { useUserPrompts } from '@/hooks/useUserPrompts';
import { useOrgModelSettings } from '@/hooks/useOrgModelSettings';
import { usePreferredModel } from '@/hooks/usePreferredModel';
import { useWorkspaceTour } from '@/hooks/useWorkspaceTour';
import { useBankPolicies } from '@/hooks/useBankPolicies';
import { AgentStudioPanel } from '@/components/agent-studio/AgentStudioPanel';
import { WorkflowStudioPanel } from '@/components/workflow-studio/WorkflowStudioPanel';
import { CapstonePanel } from '@/components/capstone/CapstonePanel';
import { BrainstormPanel } from '@/components/BrainstormPanel';
import { FeedbackPill } from '@/components/FeedbackPill';
import type { CapstoneData } from '@/types/progress';
import type { WorkflowData } from '@/types/workflow';
import { Loader2, ArrowLeft, Shield, Bot, Building2, BookOpen, MessageSquare, GraduationCap } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import { AppShell, type BreadcrumbItem } from '@/components/shell';
import { type ProgressModule } from '@/components/smile';
import { useValueSignals } from '@/hooks/useValueSignals';
import { useIndustryContent } from '@/hooks/useIndustryContent';
import { useGeneratedModuleContent, type GeneratedModuleContent } from '@/hooks/useGeneratedModuleContent';
import { ModuleContentPanel } from '@/components/training/ModuleContentPanel';
import { PersonalizationPractice } from '@/components/training/PersonalizationPractice';
import { SessionSwitcher } from '@/components/training/SessionSwitcher';

export default function TrainingWorkspace() {
  const isMobile = useIsMobile();
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const { user, profile, progress, loading, markSessionCompleted, updateProgress, updateProfile } = useAuth();
  const { toast } = useToast();
  const contentScrollRef = useRef<HTMLDivElement>(null);

  const [leftCollapsed, setLeftCollapsed] = useState(false);
  const [rightCollapsed, setRightCollapsed] = useState(false);
  // Restore persisted module & mode from sessionStorage to survive tab switches
  const persistedModuleId = sessionStorage.getItem(`training_${sessionId}_moduleId`);
  const persistedMode = sessionStorage.getItem(`training_${sessionId}_mode`) as 'learn' | 'practice' | null;

  const [selectedModule, setSelectedModuleRaw] = useState<ModuleContent | null>(null);
  // Persist trainer messages to sessionStorage to survive navigation
  const [trainerMessages, setTrainerMessagesRaw] = useState<Message[]>(() => {
    try {
      const stored = sessionStorage.getItem(`training_${sessionId}_trainerMsgs`);
      return stored ? JSON.parse(stored) : [];
    } catch { return []; }
  });
  const setTrainerMessages: typeof setTrainerMessagesRaw = (action) => {
    setTrainerMessagesRaw(prev => {
      const next = typeof action === 'function' ? action(prev) : action;
      try { sessionStorage.setItem(`training_${sessionId}_trainerMsgs`, JSON.stringify(next.slice(-30))); } catch { /* sessionStorage may be full or unavailable */ }
      return next;
    });
  };
  const [trainerInput, setTrainerInput] = useState('');
  const [isTrainerLoading, setIsTrainerLoading] = useState(false);
  const [isPracticeLoading, setIsPracticeLoading] = useState(false);
  const [moduleCompleted, setModuleCompleted] = useState(false);
  const [lastGateMessage, setLastGateMessage] = useState<string | null>(null);
  const [lastGateResult, setLastGateResult] = useState<import('@/types/progress').GateResult | null>(null);
  const [priorModuleContext, setPriorModuleContext] = useState<string | null>(null);
  // 'learn' shows the content panel; 'practice' shows the chat
  const [workspaceMode, setWorkspaceModeRaw] = useState<'learn' | 'practice'>(persistedMode || 'learn');

  // Wrap setters to persist to sessionStorage
  const setSelectedModule = useCallback((mod: ModuleContent | null) => {
    setSelectedModuleRaw(mod);
    if (mod && sessionId) {
      sessionStorage.setItem(`training_${sessionId}_moduleId`, mod.id);
    }
  }, [sessionId]);
  const setWorkspaceMode = (mode: 'learn' | 'practice') => {
    setWorkspaceModeRaw(mode);
    if (sessionId) {
      sessionStorage.setItem(`training_${sessionId}_mode`, mode);
    }
  };
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [completedModules, setCompletedModules] = useState<Set<string>>(new Set());
  const [suggestedPrompts, setSuggestedPrompts] = useState<string[]>([]);
  const [mobileTab, setMobileTab] = useState<'practice' | 'coach'>('practice');
  const [mobileModulesOpen, setMobileModulesOpen] = useState(false);

  // Practice instructions popup state (must be before early returns to avoid conditional hook calls)
  const [practicePopupOpen, setPracticePopupOpen] = useState(false);
  const [practiceInstructionContent, setPracticeInstructionContent] = useState('');

  const { policies } = useBankPolicies();
  const { emitSignal } = useValueSignals();
  const { industrySlug, config: industryConfig } = useIndustryContent();
  const { createMemory } = useAIMemories();

  // ── Generated content: industry-specific examples & scenarios ───────────
  const modulePedagogy = useMemo(() => {
    if (!selectedModule) return null;
    return {
      title: selectedModule.title,
      learningObjectives: selectedModule.learningObjectives,
      learningOutcome: selectedModule.learningOutcome || '',
      keyPoints: selectedModule.content.keyPoints || [],
      overview: selectedModule.content.overview,
      practiceTaskTitle: selectedModule.content.practiceTask.title,
      practiceTaskInstructions: selectedModule.content.practiceTask.instructions,
      successCriteria: Array.isArray(selectedModule.content.practiceTask.successCriteria)
        ? selectedModule.content.practiceTask.successCriteria
        : [
            ...(selectedModule.content.practiceTask.successCriteria?.primary || []),
            ...(selectedModule.content.practiceTask.successCriteria?.supporting || []),
          ],
    };
  }, [selectedModule?.id]);
  const departmentSlug = profile?.department || null;
  const departmentName = departmentSlug
    ? (industryConfig.departments.find(d => d.slug === departmentSlug)?.name || departmentSlug)
    : null;
  const { content: generatedContent } = useGeneratedModuleContent(
    selectedModule?.id || null, modulePedagogy, departmentSlug, departmentName,
  );
  const { pendingRequest, respondToLevelChange } = useSkillAssessment();
  const { activeAgent, draftAgent } = useUserAgents();
  const { draftWorkflow } = useUserWorkflows();
  const { createPrompt } = useUserPrompts();

  // ── Spaced repetition: compute retrieval questions for current session ──
  // Selects 1-2 questions from completed modules to inject mid-session via Andrea.
  // No DB round-trip needed — quality weighting uses in-memory defaults (all unseen).
  const retrievalContext = (() => {
    const completedList = Array.from(completedModules);
    if (completedList.length === 0) return '';
    const eligible = getQuestionsForCompletedModules(completedList, selectedModule?.id);
    const selected = selectRetrievalQuestions(eligible, {
      completedModuleIds: completedList,
      seenResponses: [],
      currentModuleId: selectedModule?.id,
      maxQuestions: 2,
    });
    return formatRetrievalQuestionsForAndrea(selected);
  })();

  // Determine if current module is an Agent Studio module
  // Agent Studio modules: Session 3, Modules 3-3 through 3-7 (Build Agent, Knowledge, Files, Tools, Capstone)
  const isAgentModule = sessionId === '3' && ['3-3', '3-4', '3-5', '3-6', '3-7'].includes(selectedModule?.id ?? '');
  const isPersonalizationModule = sessionId === '1' && selectedModule?.id === '1-1';

  // For Session 3: determine special module types
  const isSession3 = sessionId === '3';
  // Workflow Studio moved to Session 5 Module 2 (Build Your Frankenstein)
  const isSession5 = sessionId === '5';
  const isWorkflowModule = isSession5 && selectedModule?.id === '5-2';
  const isCapstoneModule = isSession3 && selectedModule?.id === '3-7';
  const deployedAgent = activeAgent;

  // Department info for Session 3
  const getDepartmentLabel = (lob: string | null) => {
    if (!lob) return null;
    return lob.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  };
  const departmentLabel = isSession3 ? getDepartmentLabel(profile?.department ?? null) : null;

  // Capstone state (from session_3_progress)
  const getCapstoneData = (): CapstoneData | null => {
    if (!progress) return null;
    const s3 = progress.session_3_progress as SessionProgressData | null;
    return s3?.capstoneData || null;
  };

  const updateCapstoneData = async (updates: Partial<CapstoneData>) => {
    if (!sessionId) return;
    const progressKey = 'session_3_progress' as const;
    const currentProgress = (progress?.[progressKey] as SessionProgressData) || { completedModules: Array.from(completedModules) };
    const existing = currentProgress.capstoneData || { selectedOption: '' };
    await updateProgress({
      [progressKey]: {
        ...currentProgress,
        capstoneData: { ...existing, ...updates },
      },
    });
  };

  // Module engagement tracking state
  const [moduleEngagement, setModuleEngagement] = useState<Record<string, ModuleEngagement>>({});

  const session = sessionId ? ALL_SESSION_CONTENT[parseInt(sessionId)] : null;

  // Per-session tour — triggers once per session on first visit
  useWorkspaceTour(sessionId, session?.title || '');

  // Define which modules should have their chat seeded with a prior module's conversation
  const CONVERSATION_SEED_MAP: Record<string, string> = {
    '1-6': '1-4', // Iteration seeds from Your First Win
  };

  // Human-readable labels for the import button
  const IMPORT_LABELS: Record<string, string> = {
    '1-6': 'Import Your First Win Conversation',
  };

  // Practice conversations hook — persists to database
  const {
    conversations: practiceConversations,
    activeConversation,
    activeConversationId,
    activeMessages,
    createConversation,
    seedFromPriorModule,
    appendMessage,
    markSubmitted,
    startNewChat,
    selectConversation,
  } = usePracticeConversations(sessionId || '1', selectedModule?.id || null);

  // Manual import handler for pulling in a prior module's conversation
  const [isImportingPrior, setIsImportingPrior] = useState(false);
  const handleImportPriorConversation = useCallback(async () => {
    if (!selectedModule || !user?.id) return;
    const sourceModuleId = CONVERSATION_SEED_MAP[selectedModule.id];
    if (!sourceModuleId) return;

    setIsImportingPrior(true);
    try {
      const { data } = await supabase
        .from('practice_conversations')
        .select('messages')
        .eq('user_id', user.id)
        .eq('session_id', sessionId || '1')
        .eq('module_id', sourceModuleId)
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (data?.messages && Array.isArray(data.messages) && data.messages.length > 0) {
        const priorMessages = data.messages as Array<{ role: 'user' | 'assistant'; content: string }>;
        await seedFromPriorModule(priorMessages, 'Continued from Your First Win');
      } else {
        toast({
          title: 'No conversation found',
          description: 'Complete Module 4 (Your First Win) first, then come back to import it here.',
          variant: 'destructive',
        });
      }
    } catch {
      toast({ title: 'Import failed', description: 'Could not load the prior conversation.', variant: 'destructive' });
    } finally {
      setIsImportingPrior(false);
    }
  }, [selectedModule, user?.id, sessionId, seedFromPriorModule, toast]);

  const { allowedModels } = useOrgModelSettings();
  const { platform } = useOrgPlatform();
  const isChatGPTEdge = platform === 'chatgpt';
  const { preferredModel, setPreferredModel } = usePreferredModel(allowedModels);

  // Initialize trainer with dynamic AI-generated greeting
  const hasGreetedRef = useRef(false);
  useEffect(() => {
    if (profile && session && selectedModule && !hasGreetedRef.current) {
      hasGreetedRef.current = true;

      // Call the greeting API for a personalized welcome
      const fetchGreeting = async () => {
        try {
          const response = await supabase.functions.invoke('trainer_chat', {
            body: {
              lessonId: sessionId || '1',
              moduleId: selectedModule.id,
              sessionNumber: parseInt(sessionId || '1'),
              messages: [],
              greeting: true,
              isSandbox: selectedModule.type === 'sandbox',
              industrySlug,
              learnerState: {
                currentCardTitle: selectedModule.title,
                learningObjectives: selectedModule.learningObjectives,
                learningOutcome: selectedModule.learningOutcome,
                completedModules: Array.from(completedModules),
                displayName: profile.display_name || undefined,
                jobRole: profile.job_role || undefined,
                departmentLob: profile.department || undefined,
                retrievalContext: retrievalContext || undefined,
              },
            },
          });

          if (response.error) throw response.error;

          const replyData = response.data;
          const greetingText = replyData?.reply || `Hi! I'm Andrea, your AI Training Coach. Ready to work on "${selectedModule.title}"?`;
          const prompts = replyData?.suggestedPrompts || [];

          setTrainerMessages([{
            role: 'assistant',
            content: greetingText,
            suggestedPrompts: prompts,
            coachingAction: replyData?.coachingAction || 'celebrate',
          }]);
          setSuggestedPrompts(prompts);
        } catch (error) {
          console.error('Greeting API error:', error);
          // Fallback to a simple greeting if API fails
          const name = profile.display_name ? `, ${profile.display_name}` : '';
          setTrainerMessages([{
            role: 'assistant',
            content: `Hi${name}! I'm **Andrea**, your AI Training Coach. Let's get started with "${selectedModule.title}"!`,
          }]);
        }
      };

      fetchGreeting();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- hasGreetedRef guard prevents re-execution; extra deps listed for completeness
  }, [profile, session, selectedModule, sessionId, industrySlug, completedModules, retrievalContext]);


  useEffect(() => {
    if (session?.modules?.length && !selectedModule) {
      // Helper: check if a module would be locked based on current progress
      const wouldBeLocked = (mod: ModuleContent) => {
        const idx = session.modules.findIndex(m => m.id === mod.id);
        if (idx <= 0) return false;
        const prev = session.modules[idx - 1];
        const prevEng = moduleEngagement[prev.id];
        return !(completedModules.has(prev.id) || prevEng?.completed || prevEng?.gatePassed);
      };

      // Restore persisted module if available AND not locked (prevents stale sessionStorage
      // from auto-selecting a locked module after a training reset)
      const restoredCandidate = persistedModuleId
        ? session.modules.find((m) => m.id === persistedModuleId)
        : null;
      const restoredModule = restoredCandidate && !wouldBeLocked(restoredCandidate)
        ? restoredCandidate
        : null;

      // Find the furthest-along module: the last module with any engagement,
      // then advance to the next incomplete one (or stay if it's incomplete itself).
      let furthestIdx = -1;
      for (let i = session.modules.length - 1; i >= 0; i--) {
        const m = session.modules[i];
        if (completedModules.has(m.id) || moduleEngagement[m.id]) {
          furthestIdx = i;
          break;
        }
      }
      // If furthest module is completed, advance to the next one
      const furthest = furthestIdx >= 0 ? session.modules[furthestIdx] : null;
      const resumeModule = furthest && completedModules.has(furthest.id) && furthestIdx + 1 < session.modules.length
        ? session.modules[furthestIdx + 1]
        : furthest;

      const nextModule =
        restoredModule ?? resumeModule ?? session.modules[0];
      setSelectedModule(nextModule);
      if (nextModule.type === 'video') {
        setVideoModalOpen(true);
      }
    }
  }, [session, selectedModule, completedModules, persistedModuleId, moduleEngagement, setSelectedModule]);

  // Reset when module changes
  const prevModuleRef = useRef<string | null>(null);
  useEffect(() => {
    if (selectedModule && selectedModule.id !== prevModuleRef.current) {
      prevModuleRef.current = selectedModule.id;
      contentScrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    }
    setModuleCompleted(selectedModule ? completedModules.has(selectedModule.id) : false);
    setLastGateMessage(null);
  }, [selectedModule, completedModules]);

  // Load prior module context for carryover (e.g., module 1-5 uses 1-4's conversation)
  useEffect(() => {
    if (!selectedModule || !user?.id) {
      setPriorModuleContext(null);
      return;
    }

    // Define carryover mappings: target module → source module
    const carryoverMap: Record<string, string> = {
      '1-5': '1-4',
      '1-6': '1-4',
    };

    const sourceModuleId = carryoverMap[selectedModule.id];
    if (!sourceModuleId) {
      setPriorModuleContext(null);
      return;
    }

    // Query the submitted conversation from the source module
    supabase
      .from('practice_conversations')
      .select('messages')
      .eq('user_id', user.id)
      .eq('session_id', sessionId || '1')
      .eq('module_id', sourceModuleId)
      .eq('is_submitted', true)
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle()
      .then(({ data }) => {
        if (data?.messages && Array.isArray(data.messages) && data.messages.length > 0) {
          const transcript = (data.messages as Array<{ role: string; content: string }>)
            .map(m => `[${m.role === 'user' ? 'Learner' : 'AI'}]: ${m.content}`)
            .join('\n\n');
          setPriorModuleContext(transcript);
        } else {
          setPriorModuleContext(null);
        }
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- selectedModule?.id is sufficient; adding the full object would cause unnecessary re-runs
  }, [selectedModule?.id, user?.id, sessionId]);

  // Load completed modules and engagement data from database progress.
  // Guard against setting identical values to avoid cascading re-renders
  // (e.g. module selection reset, Andrea conversation clear) when progress
  // object reference changes but the actual data hasn't changed.
  useEffect(() => {
    if (progress && sessionId) {
      const progressKey = `session_${sessionId}_progress` as keyof typeof progress;
      const sessionProgress = progress[progressKey] as SessionProgressData | null;
      if (sessionProgress) {
        if (sessionProgress.completedModules) {
          const incoming = sessionProgress.completedModules as string[];
          setCompletedModules(prev => {
            // Only update if the set of completed modules actually changed
            if (prev.size === incoming.length && incoming.every(id => prev.has(id))) {
              return prev; // same reference → no re-render
            }
            return new Set(incoming);
          });
        }
        if (sessionProgress.moduleEngagement) {
          setModuleEngagement(prev => {
            // Only update if engagement data actually changed
            const next = sessionProgress.moduleEngagement;
            if (JSON.stringify(prev) === JSON.stringify(next)) {
              return prev; // same reference → no re-render
            }
            return next;
          });
        }
      }
    }
  }, [progress, sessionId]);

  // Helper: track engagement for a module (merges updates, persists to DB)
  const trackModuleEngagement = async (
    moduleId: string,
    updates: Partial<ModuleEngagement>
  ) => {
    if (!sessionId) return;

    const progressKey = `session_${sessionId}_progress` as keyof typeof progress;
    const currentProgress = (progress?.[progressKey] as SessionProgressData) || { completedModules: Array.from(completedModules) };
    const engagement = { ...(currentProgress.moduleEngagement || {}) };
    const existing = engagement[moduleId] || { ...DEFAULT_ENGAGEMENT };

    engagement[moduleId] = { ...existing, ...updates };

    // Update local state immediately for responsive UI
    setModuleEngagement(engagement);

    await updateProgress({
      [progressKey]: { ...currentProgress, moduleEngagement: engagement },
    });
  };

  // Manually bypass a gate module (user dismisses the gate requirement)
  const handleGateBypass = async (moduleId: string) => {
    if (!sessionId) return;

    const newCompletedModules = new Set(completedModules);
    newCompletedModules.add(moduleId);
    setCompletedModules(newCompletedModules);

    const progressKey = `session_${sessionId}_progress` as keyof typeof progress;
    const currentProgress = (progress?.[progressKey] as SessionProgressData) || { completedModules: [] };
    const engagement = { ...(currentProgress.moduleEngagement || {}), ...moduleEngagement };
    const existing = engagement[moduleId] || { ...DEFAULT_ENGAGEMENT };
    engagement[moduleId] = {
      ...existing,
      gatePassed: true,
      completed: true,
      completedAt: new Date().toISOString(),
    };
    setModuleEngagement(engagement);

    await updateProgress({
      [progressKey]: {
        ...currentProgress,
        completedModules: Array.from(newCompletedModules),
        moduleEngagement: engagement,
      },
    });
  };

  if (loading || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Session not found</h2>
          <Button onClick={() => navigate('/dashboard')}>Return to Dashboard</Button>
        </div>
      </div>
    );
  }

  const handleModuleSelect = async (module: ModuleContent) => {
    // Reset Andrea conversation when switching to a different module
    if (module.id !== selectedModule?.id) {
      setTrainerMessages([]);
      hasGreetedRef.current = false;
    }

    setSelectedModule(module);
    if (module.type === 'video') {
      setVideoModalOpen(true);
    } else if (sessionId === '1' && module.id === '1-1') {
      // Personalization module has no learn content — go straight to practice
      setWorkspaceMode('practice');
    } else {
      setWorkspaceMode('learn');
    }

    // Track content viewed engagement
    if (!moduleEngagement[module.id]?.contentViewed) {
      trackModuleEngagement(module.id, {
        contentViewed: true,
        contentViewedAt: new Date().toISOString(),
      });
    }

    // Module 1-5 context carryover: load submitted 1-4 conversation
    if (module.id === '1-5' && user?.id) {
      try {
        const { data } = await supabase
          .from('practice_conversations')
          .select('messages')
          .eq('user_id', user.id)
          .eq('session_id', '1')
          .eq('module_id', '1-4')
          .eq('is_submitted', true)
          .order('updated_at', { ascending: false })
          .limit(1);
        if (data?.[0]?.messages) {
          const msgs = data[0].messages as Array<{ role: string; content: string }>;
          const transcript = msgs.map(m => `[${m.role === 'user' ? 'My Prompt' : 'AI Response'}]: ${m.content}`).join('\n\n');
          setPriorModuleContext(transcript);
        } else {
          setPriorModuleContext(null);
        }
      } catch {
        setPriorModuleContext(null);
      }
    } else {
      setPriorModuleContext(null);
    }
  };

  // Wrap startNewChat to also reset review/trainer state so the reviewer sees fresh context
  const handleNewChat = () => {
    startNewChat();
    setModuleCompleted(false);
    setLastGateMessage(null);
    setLastGateResult(null);
    // Clear trainer messages so the review evaluates only the new conversation
    setTrainerMessages([]);
    hasGreetedRef.current = false;
  };

  // When the user clicks "Start Practice", show a popup with instructions.
  // When they click "Begin", the popup closes and instructions appear as Andrea message.
  const handleStartPractice = () => {
    if (!selectedModule) return;

    const task = selectedModule.content.practiceTask;
    const lob = profile?.department;
    const resolvedScenario =
      (task.departmentScenarios && lob && task.departmentScenarios[lob]?.scenario)
        ? task.departmentScenarios[lob].scenario
        : task.scenario;

    const instructionContent = [
      `Time to practice! Here's your task:`,
      ``,
      `**${task.title}**`,
      ``,
      task.instructions,
      ``,
      `**Your scenario:**`,
      resolvedScenario,
      ``,
      `Give it a try in the chat. When you're ready, submit your conversation and I'll give you feedback.`,
    ].join('\n');

    setPracticeInstructionContent(instructionContent);
    setPracticePopupOpen(true);
  };

  // When the user clicks "Begin" in the popup, close it and inject instructions into Andrea chat
  const handleBeginPractice = () => {
    setPracticePopupOpen(false);
    setWorkspaceMode('practice');

    setTrainerMessages(prev => [...prev, {
      role: 'assistant' as const,
      content: practiceInstructionContent,
    }]);
  };

  // Handle sending a message in the practice chat (center panel)
  const handlePracticeSendMessage = async (message: string) => {
    if (!message.trim() || !selectedModule) return;

    const userMsg = { role: 'user' as const, content: message };

    // Strip file content before DB storage — full content still sent to AI
    const filePrefix = message.match(/^\[Attached file: (.+?)\]\n\n/);
    let dbContent = message;
    if (filePrefix) {
      const afterPrefix = message.slice(filePrefix[0].length);
      const lastDoubleLine = afterPrefix.lastIndexOf('\n\n');
      const userText = lastDoubleLine >= 0 ? afterPrefix.slice(lastDoubleLine + 2) : '';
      dbContent = `[Attached file: ${filePrefix[1]}]${userText ? '\n\n' + userText : ''}`;
    }
    const userMsgForDb = { role: 'user' as const, content: dbContent };

    // Track the conversation ID and messages for this send operation
    let convId = activeConversationId;
    let messagesForApi = [...activeMessages, userMsg];

    if (!convId) {
      // Create a new conversation with the first message
      convId = await createConversation(userMsgForDb);
      if (!convId) return;
      // For a brand new conversation, the only message is the user's first one
      messagesForApi = [userMsg];

      // Track chat started engagement
      if (!moduleEngagement[selectedModule.id]?.chatStarted) {
        const isSandboxModule = selectedModule.type === 'sandbox';
        trackModuleEngagement(selectedModule.id, {
          chatStarted: true,
          chatStartedAt: new Date().toISOString(),
          practiceMessageCount: 1,
          // Sandbox modules auto-complete on first message — no submission needed
          ...(isSandboxModule ? {
            completed: true,
            completedAt: new Date().toISOString(),
          } : {}),
        });

        // Sandbox: also add to completedModules so the "Complete Session" button appears
        if (isSandboxModule) {
          const newCompleted = new Set(completedModules);
          newCompleted.add(selectedModule.id);
          setCompletedModules(newCompleted);
          setModuleCompleted(true);

          // Persist completedModules array to DB
          const progressKey = `session_${sessionId}_progress` as keyof typeof progress;
          const currentProgress = (progress?.[progressKey] as SessionProgressData) || { completedModules: Array.from(completedModules) };
          updateProgress({
            [progressKey]: {
              ...currentProgress,
              completedModules: Array.from(newCompleted),
            },
          });
        }
      }
    } else {
      // Append user message to existing conversation (stripped of file content)
      await appendMessage(userMsgForDb);

      // Increment practice message count (debounced — every 3rd message)
      const current = moduleEngagement[selectedModule.id]?.practiceMessageCount || 0;
      if ((current + 1) % 3 === 0 || current === 0) {
        trackModuleEngagement(selectedModule.id, {
          practiceMessageCount: current + 1,
        });
      }
    }

    setIsPracticeLoading(true);

    try {
      // Resolve role-specific scenario: generated → inline departmentScenarios → role scenario bank → default
      const lob = profile?.department;
      const generatedDeptScenario = lob && generatedContent?.departmentScenarios?.[lob]?.scenario;
      const generatedScenario = generatedDeptScenario || generatedContent?.practiceScenario;
      const inlineDept = selectedModule.content.practiceTask.departmentScenarios;
      const resolvedScenario = generatedScenario
        || (inlineDept && lob && inlineDept[lob]?.scenario)
        || (lob && getRoleScenario(selectedModule.id, lob)?.scenario)
        || selectedModule.content.practiceTask.scenario;

      const requestBody = {
        messages: messagesForApi,
        moduleTitle: selectedModule.content.practiceTask.title,
        scenario: resolvedScenario,
        sessionNumber: parseInt(sessionId || '1'),
        model: preferredModel,
        industrySlug,
        // Session 3: use deployed agent's custom system prompt if available
        ...(isSession3 && deployedAgent?.system_prompt ? { customSystemPrompt: deployedAgent.system_prompt } : {}),
        // Department context for bankers; interests for F&F users
        jobRole: profile?.job_role,
        departmentLob: profile?.department,
        interests: profile?.interests || undefined,
        // Prior module context carryover (e.g., 1-4 → 1-5)
        ...(priorModuleContext ? { priorModuleContext } : {}),
      };

      // Single invocation — backend already retries transient model errors (up to 3 attempts).
      // Removed frontend retry loop to avoid 3×3 = 9× API call amplification.
      const response = await supabase.functions.invoke('ai-practice', { body: requestBody });
      if (response.error) throw response.error;

      const reply = response.data?.reply;
      if (!reply) throw new Error(response.data?.error || 'Empty response from AI');
      const assistantMsg = { role: 'assistant' as const, content: reply };
      // Pass the convId explicitly to avoid stale closure
      await appendMessage(assistantMsg, convId);
    } catch (error) {
      console.error('Practice chat error:', error);
      const errorMsg = {
        role: 'assistant' as const,
        content: "I'm having a brief connection issue. Please try again in a moment.",
      };
      await appendMessage(errorMsg, convId);
    } finally {
      setIsPracticeLoading(false);
    }
  };

  // Submit the practice conversation to Andrea for review
  // Returns true if the quality gate passed, false otherwise
  const handleSubmitForReview = async (): Promise<boolean> => {
    if (!selectedModule || activeMessages.length === 0) return false;

    setIsTrainerLoading(true);

    // Build the conversation transcript to embed directly in the message
    const conversationTranscript = activeMessages
      .map(m => `[${m.role === 'user' ? 'My Prompt' : 'AI Response'}]: ${m.content}`)
      .join('\n\n');

    const reviewRequest = `Please review my practice conversation below:\n\n---\n${conversationTranscript}\n---`;

    // Build rubric from module success criteria
    const rubric = {
      task: selectedModule.content.practiceTask.title,
      criteria: [...selectedModule.content.practiceTask.successCriteria.primary, ...selectedModule.content.practiceTask.successCriteria.supporting],
      instructions: selectedModule.content.practiceTask.instructions,
    };

    let structuredFeedback: Message['structuredFeedback'] | undefined;
    let gateResult: import('@/types/progress').GateResult | null = null;
    try {
      // ── Step 1: Call trainer_chat (Andrea's coaching response) ──────────
      let replyText = 'I\'ve reviewed your practice conversation. Let me know if you have questions!';
      let prompts: string[] = [];
      let coachingAction: string | undefined = 'review';
      let hintAvailable: boolean | undefined;
      let memorySuggestion: { content: string; reason: string } | undefined;
      let shareSuggestion: Message['shareSuggestion'] | undefined;
      let promptSaveSuggestion: Message['promptSaveSuggestion'] | undefined;
      let levelSuggestion: Message['levelSuggestion'] | undefined;

      try {
        const trainerResult = await supabase.functions.invoke('trainer_chat', {
          body: {
            lessonId: sessionId || '1',
            moduleId: selectedModule.id,
            sessionNumber: parseInt(sessionId || '1'),
            messages: [...trainerMessages, {
              role: 'user',
              content: reviewRequest,
            }],
            practiceConversation: activeMessages,
            agentContext: agentContextForAndrea,
            workflowContext: workflowContextForAndrea,
            industrySlug,
            learnerState: {
              currentCardTitle: selectedModule.title,
              learningObjectives: selectedModule.learningObjectives,
              learningOutcome: selectedModule.learningOutcome,
              progressSummary: `Submitted practice conversation with ${activeMessages.filter(m => m.role === 'user').length} prompts for review`,
              completedModules: Array.from(completedModules),
              displayName: profile?.display_name || undefined,
              jobRole: profile?.job_role || undefined,
              departmentLob: profile?.department || undefined,
            },
          },
        });

        if (!trainerResult.error && trainerResult.data) {
          const replyData = trainerResult.data;
          replyText = replyData?.reply || replyText;
          prompts = replyData?.suggestedPrompts || [];
          coachingAction = replyData?.coachingAction || 'review';
          hintAvailable = replyData?.hintAvailable;
          memorySuggestion = replyData?.memorySuggestion;
          shareSuggestion = replyData?.shareSuggestion;
          promptSaveSuggestion = replyData?.promptSaveSuggestion;
          levelSuggestion = replyData?.levelSuggestion;
        }
      } catch (trainerErr) {
        console.error('Trainer chat error during review:', trainerErr);
      }

      // Append Andrea's coaching message immediately so the learner sees it
      setTrainerMessages(prev => [...prev,
        { role: 'user' as const, content: `Please review my practice conversation (${activeMessages.filter(m => m.role === 'user').length} prompts submitted).` },
        {
          role: 'assistant' as const,
          content: replyText,
          suggestedPrompts: prompts,
          coachingAction: coachingAction as Message['coachingAction'],
          hintAvailable,
          memorySuggestion,
          shareSuggestion,
          promptSaveSuggestion,
          levelSuggestion,
        },
      ]);
      setSuggestedPrompts(prompts);

      // ── Step 2: Call submission_review (structured gate evaluation) ─────
      // Include Andrea's coaching response as context for the reviewer
      try {
        const reviewResult = await supabase.functions.invoke('submission_review', {
          body: {
            lessonId: sessionId || '1',
            moduleId: selectedModule.id,
            isGateModule: true,  // All modules now gate progression
            submission: conversationTranscript,
            trainerCoaching: replyText,
            rubric,
            industrySlug,
            // Pass agent template for modules 2-3 and 2-5 for agent-specific rubrics
            ...(isAgentModule && currentAgent?.template_data ? { agentTemplate: currentAgent.template_data } : {}),
            // Session 3: department context for role-specific evaluation
            ...(isSession3 ? { departmentContext: { jobRole: profile?.job_role, departmentLob: profile?.department } } : {}),
            // Module 3-3: workflow-specific rubric
            ...(isWorkflowModule && draftWorkflow?.workflow_data ? { workflowData: draftWorkflow.workflow_data } : {}),
            learnerState: {
              currentCardTitle: selectedModule.title,
              learningObjectives: selectedModule.learningObjectives,
              learningOutcome: selectedModule.learningOutcome,
              attemptNumber: (moduleEngagement[selectedModule.id]?.gateAttempts ?? 0) + 1,
              progressSummary: `Submitted ${activeMessages.filter(m => m.role === 'user').length} prompts`,
            },
          },
        });

        if (!reviewResult.error && reviewResult.data) {
          const feedbackData = reviewResult.data;
          if (feedbackData?.feedback) {
            structuredFeedback = feedbackData.feedback;
          }
          if (feedbackData?.gateResult) {
            gateResult = feedbackData.gateResult;
          }
        }
      } catch (reviewErr) {
        console.error('Submission review error:', reviewErr);
      }

      // Append structured feedback to the last trainer message if available
      if (structuredFeedback) {
        setTrainerMessages(prev => {
          const updated = [...prev];
          const lastMsg = updated[updated.length - 1];
          if (lastMsg?.role === 'assistant') {
            updated[updated.length - 1] = { ...lastMsg, structuredFeedback };
          }
          return updated;
        });
      }
    } catch (error) {
      console.error('Review error:', error);
      // Offline fallback
      const offlineFeedback = `I've reviewed your practice conversation (${activeMessages.filter(m => m.role === 'user').length} prompts).

**Quick Assessment:**
${[...selectedModule.content.practiceTask.successCriteria.primary, ...selectedModule.content.practiceTask.successCriteria.supporting].map((c, i) => `${i + 1}. ${c}`).join('\n')}

I'm having a connection issue for detailed feedback. Ask me specific questions about your prompts!`;
      setTrainerMessages(prev => [...prev,
        { role: 'user' as const, content: `Please review my practice conversation (${activeMessages.filter(m => m.role === 'user').length} prompts submitted).` },
        { role: 'assistant' as const, content: offlineFeedback },
      ]);
    } finally {
      setIsTrainerLoading(false);
    }

    // Mark conversation as submitted in database
    await markSubmitted();

    // All modules gate progression (strict sequential). If gate evaluation was
    // unavailable (edge function failure), default to pass to avoid blocking the learner.
    const gatePassed = gateResult ? gateResult.passed === true : true;

    // Mark module as completed only if quality gate passed
    const newCompletedModules = new Set(completedModules);
    if (gatePassed) {
      setModuleCompleted(true);
      newCompletedModules.add(selectedModule.id);
      setCompletedModules(newCompletedModules);
    }

    // Store the gate result for display in the UI
    setLastGateResult(gateResult);
    if (gateResult && !gatePassed) {
      setLastGateMessage(gateResult.gateMessage || 'Your submission needs more work before you can move on. Check Andrea\'s feedback for details.');
    } else {
      setLastGateMessage(null);
    }

    if (sessionId) {
      const progressKey = `session_${sessionId}_progress` as const;
      const currentProgress = (progress?.[progressKey] as SessionProgressData) || { completedModules: [] };
      const prevEngagement = moduleEngagement[selectedModule.id] || { ...DEFAULT_ENGAGEMENT };

      // Build engagement update with feedback and skill signals
      const engagementUpdates: Partial<ModuleEngagement> = {
        submitted: true,
        submittedAt: new Date().toISOString(),
        completed: gatePassed,
        completedAt: gatePassed ? new Date().toISOString() : undefined,
        practiceMessageCount: activeMessages.filter(m => m.role === 'user').length,
      };

      // Track gate attempts for all modules
      engagementUpdates.gateAttempts = (prevEngagement.gateAttempts ?? 0) + 1;
      engagementUpdates.gatePassed = gatePassed;
      if (gateResult) engagementUpdates.lastGateResult = gateResult;

      if (structuredFeedback) {
        engagementUpdates.lastFeedback = {
          strengths: structuredFeedback.strengths,
          issues: structuredFeedback.issues,
          summary: structuredFeedback.summary,
        };
      }

      const engagement = { ...(currentProgress.moduleEngagement || {}), ...moduleEngagement };
      const existing = engagement[selectedModule.id] || { ...DEFAULT_ENGAGEMENT };
      engagement[selectedModule.id] = { ...existing, ...engagementUpdates };

      // Derive skill signals from feedback
      let updatedSkillSignals = currentProgress.skillSignals || [];
      if (structuredFeedback) {
        const newSignals = deriveSkillSignals(structuredFeedback, selectedModule.id);
        updatedSkillSignals = [...updatedSkillSignals, ...newSignals];
      }

      setModuleEngagement(engagement);

      await updateProgress({
        [progressKey]: {
          completedModules: Array.from(newCompletedModules),
          moduleEngagement: engagement,
          skillSignals: updatedSkillSignals,
        },
      });

      // Signal: skill_applied — module completed
      if (gatePassed) {
        await emitSignal('skill_applied', {
          session_id: sessionId,
          module_id: selectedModule.id,
          module_title: selectedModule.title,
        });
      }
    }

    return gatePassed;
  };

  // Build agent context for Andrea when the user is working on their agent
  const currentAgent = draftAgent || activeAgent;
  const agentContextForAndrea = currentAgent ? {
    name: currentAgent.name,
    status: currentAgent.status,
    systemPrompt: currentAgent.system_prompt,
    templateData: currentAgent.template_data,
    isDeployed: currentAgent.is_deployed,
  } : undefined;

  // Build workflow context for Andrea when user is working on 3-3
  const workflowContextForAndrea = isWorkflowModule && draftWorkflow ? {
    name: draftWorkflow.name,
    status: draftWorkflow.status,
    trigger: draftWorkflow.workflow_data?.trigger || '',
    steps: draftWorkflow.workflow_data?.steps || [],
    finalOutput: draftWorkflow.workflow_data?.finalOutput || '',
    stepCount: draftWorkflow.workflow_data?.steps?.filter((s) => s.name?.trim()).length || 0,
    checkpointCount: draftWorkflow.workflow_data?.steps?.filter((s) => s.humanReview && s.name?.trim()).length || 0,
  } : undefined;

  const handleTrainerSubmit = async () => {
    if (!trainerInput.trim()) return;

    // If the user is asking for a review and there are practice messages, embed the transcript
    const isReviewRequest = activeMessages.length > 0 && /review|check|look at|feedback|evaluate/i.test(trainerInput);
    let messageContent = trainerInput;
    if (isReviewRequest) {
      const transcript = activeMessages
        .map(m => `[${m.role === 'user' ? 'My Prompt' : 'AI Response'}]: ${m.content}`)
        .join('\n\n');
      messageContent = `${trainerInput}\n\nHere is my practice conversation:\n\n---\n${transcript}\n---`;
    }

    const userMessage: Message = { role: 'user', content: trainerInput };
    const apiMessage: Message = { role: 'user', content: messageContent };
    setTrainerMessages(prev => [...prev, userMessage]);
    setTrainerInput('');
    setIsTrainerLoading(true);

    try {
      const response = await supabase.functions.invoke('trainer_chat', {
        body: {
          lessonId: sessionId || '1',
          moduleId: selectedModule?.id,
          sessionNumber: parseInt(sessionId || '1'),
          messages: [...trainerMessages, apiMessage],
          practiceConversation: activeMessages.length > 0 ? activeMessages : undefined,
          agentContext: agentContextForAndrea,
          workflowContext: workflowContextForAndrea,
          industrySlug,
          learnerState: {
            currentCardTitle: selectedModule?.title,
            learningObjectives: selectedModule?.learningObjectives,
            learningOutcome: selectedModule?.learningOutcome,
            progressSummary: activeMessages.length > 0
              ? `Has ${activeMessages.filter(m => m.role === 'user').length} practice prompts in the conversation`
              : 'Working on module',
            completedModules: Array.from(completedModules),
            displayName: profile?.display_name || undefined,
            jobRole: profile?.job_role || undefined,
            departmentLob: profile?.department || undefined,
            retrievalContext: retrievalContext || undefined,
          },
        },
      });

      if (response.error) throw response.error;

      const replyData = response.data;
      const replyText = replyData?.reply || 'I\'m here to help you with your training. What questions do you have?';
      const prompts = replyData?.suggestedPrompts || [];

      const assistantMessage: Message = {
        role: 'assistant',
        content: replyText,
        suggestedPrompts: prompts,
        coachingAction: replyData?.coachingAction,
        hintAvailable: replyData?.hintAvailable,
        complianceFlag: replyData?.complianceFlag,
        memorySuggestion: replyData?.memorySuggestion,
        shareSuggestion: replyData?.shareSuggestion,
        promptSaveSuggestion: replyData?.promptSaveSuggestion,
        levelSuggestion: replyData?.levelSuggestion,
      };
      setTrainerMessages(prev => [...prev, assistantMessage]);
      setSuggestedPrompts(prompts);
    } catch (error) {
      console.error('Trainer error:', error);
      const contextualResponse = generateContextualResponse(trainerInput, selectedModule, profile);
      setTrainerMessages(prev => [...prev, { role: 'assistant', content: contextualResponse }]);
      setSuggestedPrompts([]);
    } finally {
      setIsTrainerLoading(false);
    }
  };

  const handleQuickAction = async (prompt: string) => {
    // If this is a review-related prompt and there are practice messages, embed the transcript
    const isReviewRequest = activeMessages.length > 0 && /review|check|look at|feedback|evaluate/i.test(prompt);
    let apiContent = prompt;
    if (isReviewRequest) {
      const transcript = activeMessages
        .map(m => `[${m.role === 'user' ? 'My Prompt' : 'AI Response'}]: ${m.content}`)
        .join('\n\n');
      apiContent = `${prompt}\n\nHere is my practice conversation:\n\n---\n${transcript}\n---`;
    }

    const userMessage: Message = { role: 'user', content: prompt };
    const apiMessage: Message = { role: 'user', content: apiContent };
    setTrainerMessages(prev => [...prev, userMessage]);
    setSuggestedPrompts([]);
    setIsTrainerLoading(true);

    try {
      const response = await supabase.functions.invoke('trainer_chat', {
        body: {
          lessonId: sessionId || '1',
          moduleId: selectedModule?.id,
          sessionNumber: parseInt(sessionId || '1'),
          messages: [...trainerMessages, apiMessage],
          practiceConversation: activeMessages.length > 0 ? activeMessages : undefined,
          agentContext: agentContextForAndrea,
          workflowContext: workflowContextForAndrea,
          industrySlug,
          learnerState: {
            currentCardTitle: selectedModule?.title,
            learningObjectives: selectedModule?.learningObjectives,
            learningOutcome: selectedModule?.learningOutcome,
            progressSummary: activeMessages.length > 0
              ? `Has ${activeMessages.filter(m => m.role === 'user').length} practice prompts in the conversation`
              : 'Working on module',
            completedModules: Array.from(completedModules),
            displayName: profile?.display_name || undefined,
            jobRole: profile?.job_role || undefined,
            departmentLob: profile?.department || undefined,
            retrievalContext: retrievalContext || undefined,
          },
        },
      });

      if (response.error) throw response.error;

      const replyData = response.data;
      const replyText = replyData?.reply || 'I\'m here to help you with your training.';
      const prompts = replyData?.suggestedPrompts || [];

      const assistantMessage: Message = {
        role: 'assistant',
        content: replyText,
        suggestedPrompts: prompts,
        coachingAction: replyData?.coachingAction,
        hintAvailable: replyData?.hintAvailable,
        complianceFlag: replyData?.complianceFlag,
        memorySuggestion: replyData?.memorySuggestion,
        shareSuggestion: replyData?.shareSuggestion,
        promptSaveSuggestion: replyData?.promptSaveSuggestion,
        levelSuggestion: replyData?.levelSuggestion,
      };
      setTrainerMessages(prev => [...prev, assistantMessage]);
      setSuggestedPrompts(prompts);
    } catch (error) {
      console.error('Trainer error:', error);
      const contextualResponse = generateContextualResponse(prompt, selectedModule, profile);
      setTrainerMessages(prev => [...prev, { role: 'assistant', content: contextualResponse }]);
      setSuggestedPrompts([]);
    } finally {
      setIsTrainerLoading(false);
    }
  };

  const LEVEL_TO_PROFICIENCY: Record<string, number> = {
    beginner: 2,
    intermediate: 4,
    advanced: 6,
    expert: 8,
  };

  const handleAcceptLevelChange = async (proposedLevel: string) => {
    const newProficiency = LEVEL_TO_PROFICIENCY[proposedLevel];
    const promises: Promise<unknown>[] = [];
    if (newProficiency !== undefined) {
      promises.push(updateProfile({ ai_proficiency_level: newProficiency }));
    }
    // Use cached pendingRequest; if missing (e.g. expired before user clicked), fetch fresh
    let requestId = pendingRequest?.id;
    if (!requestId && user?.id) {
      const { data } = await supabase
        .from('level_change_requests')
        .select('id')
        .eq('user_id', user.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(1);
      requestId = data?.[0]?.id;
    }
    if (requestId) {
      promises.push(respondToLevelChange(requestId, true));
    }
    await Promise.all(promises);
  };

  const handleCompleteSession = async () => {
    const sessionNum = parseInt(sessionId || '1') as 1 | 2 | 3;
    const { error } = await markSessionCompleted(sessionNum);
    if (error) {
      toast({
        title: 'Error saving progress',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Session Completed!',
        description: `Session ${sessionNum} has been marked as complete.`,
      });
      navigate('/dashboard');
    }
  };

  const currentModuleIndex = session.modules.findIndex(m => m.id === selectedModule?.id);
  const nextModule = session.modules[currentModuleIndex + 1];

  // Check if every module in this session is completed
  const allModulesCompleted = session.modules.every((m) => {
    const eng = moduleEngagement[m.id];
    return completedModules.has(m.id) || eng?.completed === true;
  });

  const sessionNum = parseInt(sessionId || '1');
  const isCurrentSessionCompleted = !!(progress as Record<string, unknown>)?.[`session_${sessionNum}_completed`];

  // Determine if the active conversation has been submitted
  const isActiveConversationSubmitted = activeConversation?.is_submitted || false;

  // ── ProgressStrip module mapper ───────────────────────────────────────────
  const progressModules: ProgressModule[] = session.modules.map((m) => {
    const eng = moduleEngagement[m.id];
    const state: 'not_started' | 'in_progress' | 'completed' =
      eng?.completed ? 'completed'
      : (eng?.contentViewed || eng?.chatStarted) ? 'in_progress'
      : 'not_started';
    return { id: m.id, title: m.title, state };
  });

  // ── AppShell breadcrumbs & topBarActions ──────────────────────────────────
  const breadcrumbs: BreadcrumbItem[] = [
    { label: 'Home', path: '/dashboard' },
    { label: `Session ${sessionId}: ${session.title}` },
  ];

  const trainingActions = (
    <div className="flex items-center gap-2 w-full justify-end">
      <FeedbackPill />
      <div className="shrink-0">
        <BrainstormPanel compact />
      </div>
    </div>
  );

  return (
    <AppShell
      breadcrumbs={breadcrumbs}
      topBarActions={trainingActions}
      contentClassName="flex flex-col overflow-hidden p-0"
    >
      {/* Session switcher — navigate between sessions 1–5, with horizontal module dropdown */}
      <SessionSwitcher
        activeSession={parseInt(sessionId || '1')}
        currentSession={profile?.current_session ?? 1}
        completedSessions={{
          1: !!progress?.session_1_completed,
          2: !!progress?.session_2_completed,
          3: !!progress?.session_3_completed,
          4: !!progress?.session_4_completed,
          5: !!progress?.session_5_completed,
        }}
        modules={session.modules}
        selectedModule={selectedModule}
        completedModules={completedModules}
        moduleEngagement={moduleEngagement}
        onSelectModule={handleModuleSelect}
        allModulesCompleted={allModulesCompleted}
        isSessionCompleted={isCurrentSessionCompleted}
        onCompleteSession={handleCompleteSession}
      />

      {/* Mobile mode tab bar (Learn / Practice / Coach) */}
      {isMobile && (
        <div className="shrink-0">
          <div className="flex border-b bg-card">
            <button
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium transition-colors ${
                mobileTab === 'practice' && workspaceMode === 'learn'
                  ? 'text-primary border-b-2 border-primary bg-primary/5'
                  : 'text-muted-foreground'
              }`}
              onClick={() => { setMobileTab('practice'); setWorkspaceMode('learn'); }}
            >
              <BookOpen className="h-3.5 w-3.5" />
              Learn
            </button>
            <button
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium transition-colors ${
                mobileTab === 'practice' && workspaceMode === 'practice'
                  ? 'text-primary border-b-2 border-primary bg-primary/5'
                  : 'text-muted-foreground'
              }`}
              onClick={() => { setMobileTab('practice'); setWorkspaceMode('practice'); }}
            >
              <MessageSquare className="h-3.5 w-3.5" />
              Practice
            </button>
            <button
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium transition-colors ${
                mobileTab === 'coach'
                  ? 'text-primary border-b-2 border-primary bg-primary/5'
                  : 'text-muted-foreground'
              }`}
              onClick={() => setMobileTab('coach')}
            >
              <GraduationCap className="h-3.5 w-3.5" />
              Coach
            </button>
          </div>
          {/* Module completion hint */}
          {selectedModule && (
            <div className="px-3 py-1.5 bg-muted/30 border-b text-[10px] text-muted-foreground text-center">
              {moduleEngagement[selectedModule.id]?.completed
                ? '✓ Module complete'
                : selectedModule.type === 'sandbox'
                ? 'Read content → practice in chat to complete'
                : 'Read content → practice → get feedback to complete'}
            </div>
          )}
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Column - ChatGPT sidebar only (modules now in SessionSwitcher dropdown) */}
        {!isMobile && isChatGPTEdge && (
          <ChatGPTSidebar
            collapsed={leftCollapsed}
            onToggleCollapse={() => setLeftCollapsed(!leftCollapsed)}
            modules={session.modules}
            selectedModule={selectedModule}
            completedModules={completedModules}
            moduleEngagement={moduleEngagement}
            onSelectModule={handleModuleSelect}
            onGateBypass={handleGateBypass}
            conversations={practiceConversations}
            activeConversationId={activeConversationId}
            onSelectConversation={selectConversation}
            onNewChat={handleNewChat}
            displayName={profile?.display_name || undefined}
            orgName={profile?.employer_name || undefined}
          />
        )}

        {/* Left column — Learn Mode content (65%) or Practice Chat (flex-1) */}
        {(!isMobile || mobileTab === 'practice') && (
          <div
            data-tour="practice-area"
            className={`flex flex-col overflow-hidden ${
              workspaceMode === 'learn' && selectedModule && !isAgentModule && !isWorkflowModule && !isCapstoneModule
                ? (rightCollapsed ? 'flex-1' : 'w-[65%]')
                : 'flex-1'
            }`}
            ref={contentScrollRef}
          >
            {/* Session 3 deployed agent banner */}
            {isSession3 && deployedAgent && selectedModule && !isWorkflowModule && !isCapstoneModule && (
              <div className="flex items-center gap-2 px-4 py-2 bg-primary/5 border-b border-primary/10">
                <Bot className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-primary">
                  Practicing with: {deployedAgent.name}
                </span>
                <span className="text-xs text-muted-foreground ml-auto">
                  Custom agent active
                </span>
              </div>
            )}

            {/* Session 3 department banner */}
            {isSession3 && departmentLabel && selectedModule && !isWorkflowModule && !isCapstoneModule && (
              <div className="flex items-center gap-2 px-4 py-2 bg-blue-500/5 border-b border-blue-500/10">
                <Building2 className="h-4 w-4 text-blue-500" />
                <span className="text-sm font-medium text-blue-600">
                  {departmentLabel}
                </span>
              </div>
            )}

            {/* Learn Mode: show content panel inline */}
            {workspaceMode === 'learn' && selectedModule && !isAgentModule && !isWorkflowModule && !isCapstoneModule ? (
              <ModuleContentPanel
                module={selectedModule}
                onStartPractice={handleStartPractice}
                generatedContent={generatedContent}
              />
            ) : selectedModule && isAgentModule ? (
              <AgentStudioPanel module={selectedModule} />
            ) : selectedModule && isWorkflowModule ? (
              <WorkflowStudioPanel
                onSubmitForReview={(workflowData: WorkflowData, workflowName: string) => {
                  handleSubmitForReview();
                }}
              />
            ) : selectedModule && isCapstoneModule ? (
              <CapstonePanel
                capstoneData={getCapstoneData()}
                onCapstoneUpdate={updateCapstoneData}
                onSendPracticeMessage={handlePracticeSendMessage}
                practiceMessages={activeMessages}
                isPracticeLoading={isPracticeLoading}
                onSubmitForReview={handleSubmitForReview}
                isSubmitting={isTrainerLoading}
                departmentLabel={departmentLabel || undefined}
                userName={profile?.display_name || undefined}
                bankName={profile?.employer_name || undefined}
              />
            ) : selectedModule && isPersonalizationModule && workspaceMode === 'practice' ? (
              <PersonalizationPractice
                hasNextModule={!!nextModule}
                onContinueToNext={nextModule ? () => handleModuleSelect(nextModule) : undefined}
                onSendPracticeMessage={handlePracticeSendMessage}
                practiceMessages={activeMessages}
                isPracticeLoading={isPracticeLoading}
                onSaved={(prefs) => {
                  // Send Andrea a message about the personalization for feedback
                  const feedbackPrompt = `The user just completed their personalization setup. Here are their choices:\n\n- **Tone:** ${prefs.tone}\n- **Verbosity:** ${prefs.verbosity}\n- **Formatting:** ${prefs.formatting_preference}\n- **Role Context:** ${prefs.role_context || '(not set)'}\n- **Custom Instructions:** ${prefs.additional_instructions || '(not set)'}\n\nPlease provide structured, specific feedback on their personalization choices. Focus on the Role Context and Custom Instructions fields — are they specific enough? If they're well-crafted, congratulate them. If they could be improved, give concrete suggestions based on their role/department. Do NOT be generic.`;
                  setTrainerInput(feedbackPrompt);
                  // Auto-send to Andrea
                  const userMsg: Message = { role: 'user', content: 'I just saved my personalization — can you review my setup?' };
                  const apiMsg: Message = { role: 'user', content: feedbackPrompt };
                  setTrainerMessages(prev => [...prev, userMsg]);
                  setIsTrainerLoading(true);
                  setTrainerInput('');
                  supabase.functions.invoke('trainer_chat', {
                    body: {
                      lessonId: '1',
                      moduleId: '1-1',
                      sessionNumber: 1,
                      messages: [...trainerMessages, apiMsg],
                      industrySlug,
                      learnerState: {
                        currentCardTitle: selectedModule?.title,
                        learningObjectives: selectedModule?.learningObjectives,
                        learningOutcome: selectedModule?.learningOutcome,
                        completedModules: Array.from(completedModules),
                        displayName: profile?.display_name || undefined,
                        jobRole: profile?.job_role || undefined,
                        departmentLob: profile?.department || undefined,
                      },
                    },
                  }).then(response => {
                    const replyData = response.data;
                    const replyText = replyData?.reply || 'Great job setting up your personalization!';
                    setTrainerMessages(prev => [...prev, {
                      role: 'assistant',
                      content: replyText,
                      suggestedPrompts: replyData?.suggestedPrompts || [],
                      coachingAction: replyData?.coachingAction || 'celebrate',
                    }]);
                    setSuggestedPrompts(replyData?.suggestedPrompts || []);
                  }).catch(() => {
                    setTrainerMessages(prev => [...prev, {
                      role: 'assistant',
                      content: 'Great job completing your personalization! Your settings have been saved.',
                    }]);
                  }).finally(() => setIsTrainerLoading(false));

                  // Mark module as completed — update both engagement AND completedModules
                  setModuleCompleted(true);
                  const newCompleted = new Set(completedModules);
                  newCompleted.add('1-1');
                  setCompletedModules(newCompleted);

                  // Persist to DB: engagement + completedModules array
                  if (sessionId) {
                    const progressKey = `session_${sessionId}_progress` as const;
                    const currentProgress = (progress?.[progressKey] as SessionProgressData) || { completedModules: [] };
                    const engagement = { ...(currentProgress.moduleEngagement || {}), ...moduleEngagement };
                    const existing = engagement['1-1'] || { ...DEFAULT_ENGAGEMENT };
                    engagement['1-1'] = {
                      ...existing,
                      contentViewed: true,
                      chatStarted: true,
                      submitted: true,
                      submittedAt: new Date().toISOString(),
                      completed: true,
                      completedAt: new Date().toISOString(),
                    };
                    setModuleEngagement(engagement);
                    updateProgress({
                      [progressKey]: {
                        ...currentProgress,
                        completedModules: Array.from(newCompleted),
                        moduleEngagement: engagement,
                      },
                    });
                  }
                }}
              />
            ) : selectedModule ? (
              isChatGPTEdge ? (
                <ChatGPTPracticeChatPanel
                  module={selectedModule}
                  messages={activeMessages}
                  onSendMessage={handlePracticeSendMessage}
                  isLoading={isPracticeLoading}
                  isCompleted={moduleCompleted}
                  isSubmitted={isActiveConversationSubmitted}
                  onSubmitForReview={handleSubmitForReview}
                  onContinueToNext={nextModule ? () => handleModuleSelect(nextModule) : undefined}
                  onCompleteSession={allModulesCompleted && !isCurrentSessionCompleted ? handleCompleteSession : undefined}
                  hasNextModule={!!nextModule}
                  conversations={practiceConversations}
                  activeConversationId={activeConversationId}
                  onNewChat={handleNewChat}
                  onSelectConversation={selectConversation}
                  departmentLabel={departmentLabel || undefined}
                  lineOfBusiness={profile?.department || undefined}
                  displayName={profile?.display_name?.split(' ')[0] || undefined}
                  allowedModels={allowedModels}
                  selectedModel={preferredModel}
                  onModelChange={setPreferredModel}
                  gateMessage={lastGateMessage}
                  lastGateResult={lastGateResult}
                  orgName={profile?.employer_name || undefined}
                  policies={policies}
                  generatedContent={generatedContent}
                />
              ) : (
                <PracticeChatPanel
                  module={selectedModule}
                  messages={activeMessages}
                  onSendMessage={handlePracticeSendMessage}
                  isLoading={isPracticeLoading}
                  isCompleted={moduleCompleted}
                  isSubmitted={isActiveConversationSubmitted}
                  onSubmitForReview={handleSubmitForReview}
                  onContinueToNext={nextModule ? () => handleModuleSelect(nextModule) : undefined}
                  onCompleteSession={allModulesCompleted && !isCurrentSessionCompleted ? handleCompleteSession : undefined}
                  hasNextModule={!!nextModule}
                  conversations={practiceConversations}
                  activeConversationId={activeConversationId}
                  onNewChat={handleNewChat}
                  onSelectConversation={selectConversation}
                  departmentLabel={departmentLabel || undefined}
                  lineOfBusiness={profile?.department || undefined}
                  displayName={profile?.display_name?.split(' ')[0] || undefined}
                  allowedModels={allowedModels}
                  selectedModel={preferredModel}
                  onModelChange={setPreferredModel}
                  gateMessage={lastGateMessage}
                  lastGateResult={lastGateResult}
                  completedModules={completedModules}
                  generatedContent={generatedContent}
                  importPriorLabel={selectedModule ? IMPORT_LABELS[selectedModule.id] : undefined}
                  onImportPriorConversation={selectedModule && CONVERSATION_SEED_MAP[selectedModule.id] ? handleImportPriorConversation : undefined}
                  isImportingPrior={isImportingPrior}
                />
              )
            ) : null}
          </div>
        )}

        {/* Right Column - Andrea AI Coach (shown on desktop always, on mobile when coach tab active) */}
        {(!isMobile || mobileTab === 'coach') && (
          <TrainerChatPanel
            collapsed={isMobile ? false : rightCollapsed}
            onToggleCollapse={() => setRightCollapsed(!rightCollapsed)}
            messages={trainerMessages}
            input={trainerInput}
            onInputChange={setTrainerInput}
            onSubmit={handleTrainerSubmit}
            onQuickAction={handleQuickAction}
            isLoading={isTrainerLoading}
            suggestedPrompts={suggestedPrompts}
            onAcceptLevelChange={handleAcceptLevelChange}
            onSaveMemory={async (content, source) => {
              const result = await createMemory({
                content,
                source: source || 'user_saved',
                context: selectedModule ? `Session ${sessionId} - ${selectedModule.title}` : undefined,
              });
              if (result.success) {
                toast({
                  title: 'Memory saved',
                  description: source === 'andrea_suggested'
                    ? 'Andrea\'s suggestion has been saved to your memories.'
                    : 'Andrea will remember this insight.',
                });
              }
            }}
            onSaveToPromptLibrary={async (promptText, title, category) => {
              await createPrompt({
                title,
                content: promptText,
                category,
                tags: [],
                source: selectedModule ? `${sessionId}-${selectedModule.id}` : undefined,
              });
              toast({
                title: 'Saved to Prompt Library',
                description: `"${title}" has been added to your library.`,
              });
            }}
          />
        )}
      </div>

      {/* Modals */}

      <VideoModal
        open={videoModalOpen}
        onOpenChange={setVideoModalOpen}
        videoUrl={selectedModule?.videoUrl || 'https://youtu.be/xZ1FAm7IoA4'}
        title={selectedModule?.title || "Introduction to AI Prompting"}
      />

      {/* Practice Instructions Popup */}
      {practicePopupOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-card rounded-xl shadow-xl border max-w-lg w-full mx-4 max-h-[80vh] flex flex-col">
            <div className="px-6 py-4 border-b">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-primary" />
                Practice Instructions
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Andrea will guide you through this practice exercise
              </p>
            </div>
            <div className="px-6 py-4 overflow-y-auto flex-1">
              <div className="prose prose-sm max-w-none">
                {practiceInstructionContent.split('\n').map((line, i) => {
                  if (!line.trim()) return <br key={i} />;
                  if (line.startsWith('**') && line.endsWith('**')) {
                    return <p key={i} className="font-semibold text-sm">{line.replace(/\*\*/g, '')}</p>;
                  }
                  return <p key={i} className="text-sm text-muted-foreground leading-relaxed">{line}</p>;
                })}
              </div>
            </div>
            <div className="px-6 py-4 border-t">
              <Button
                className="w-full gap-2 bg-green-600 hover:bg-green-700 text-white"
                onClick={handleBeginPractice}
              >
                Begin
              </Button>
            </div>
          </div>
        </div>
      )}

    </AppShell>
  );
}

// Contextual offline response generator
function generateContextualResponse(
  input: string,
  module: ModuleContent | null,
  userProfile: UserProfile | null,
): string {
  const lowerInput = input.toLowerCase();

  if (lowerInput.includes('review') || lowerInput.includes('feedback')) {
    return `I'd be happy to give you feedback! Start a conversation with the AI in the center panel, then click "Get Andrea's Feedback" when you're ready.

The current task is: **${module?.content.practiceTask.title}**

${module?.content.practiceTask.instructions}`;
  }

  if (lowerInput.includes('example') || lowerInput.includes('show me')) {
    const examples = module?.content.examples;
    if (examples && examples.length > 0) {
      const ex = examples[0];
      return `Here's an example from this module:

**${ex.title}**

**Less Effective:** "${ex.bad || 'Not specified'}"

**More Effective:** "${ex.good}"

**Why it works:** ${ex.explanation}

Try applying this pattern in your practice conversation in the center panel.`;
    }
  }

  if (lowerInput.includes('hint') || lowerInput.includes('help') || lowerInput.includes('stuck')) {
    return `Here are some hints for the current task:

**${module?.content.practiceTask.title}**

${module?.content.practiceTask.hints.map((h, i) => `${i + 1}. ${h}`).join('\n')}

**Remember the key points:**
${module?.content.keyPoints?.slice(0, 3).map(k => `• ${k}`).join('\n')}

Try sending one of these as a prompt in the center panel!`;
  }

  return `I'm here to coach you on "${module?.title}".

**How this works:** Use the center panel to practice prompting a real AI. I'll watch your conversation and help you improve.

You can ask me to:
- Give feedback on your practice conversation
- Show examples relevant to your role
- Explain concepts in more detail
- Provide hints for the current task

What would be most helpful?`;
}
