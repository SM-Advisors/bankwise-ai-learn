import { useState, useEffect, useRef } from 'react';
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
import { type Message } from '@/types/training';
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
import { AgentStudioPanel } from '@/components/agent-studio/AgentStudioPanel';
import { WorkflowStudioPanel } from '@/components/workflow-studio/WorkflowStudioPanel';
import { CapstonePanel } from '@/components/capstone/CapstonePanel';
import type { CapstoneData } from '@/types/progress';
import type { WorkflowData } from '@/types/workflow';
import { Loader2, Bot, Building2, MessageSquare, GraduationCap, BookOpen, Lightbulb } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { useUserIdeas } from '@/hooks/useUserIdeas';
import { useIsMobile } from '@/hooks/use-mobile';
import { AppShell, type BreadcrumbItem } from '@/components/shell';
import { ProgressStrip, type ProgressModule } from '@/components/smile';
import { useValueSignals } from '@/hooks/useValueSignals';
import { ModuleContentPanel } from '@/components/training/ModuleContentPanel';
import { SessionSwitcher } from '@/components/training/SessionSwitcher';

export default function TrainingWorkspace() {
  const isMobile = useIsMobile();
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const { user, profile, progress, loading, markSessionCompleted, updateProgress, updateProfile } = useAuth();
  const { toast } = useToast();
  const contentScrollRef = useRef<HTMLDivElement>(null);
  const { createIdea } = useUserIdeas();
  const [ideaModalOpen, setIdeaModalOpen] = useState(false);
  const [ideaTitle, setIdeaTitle] = useState('');
  const [ideaDescription, setIdeaDescription] = useState('');
  const [submittingIdea, setSubmittingIdea] = useState(false);

  const handleSubmitIdea = async () => {
    if (!ideaTitle.trim()) return;
    setSubmittingIdea(true);
    const result = await createIdea({ title: ideaTitle.trim(), description: ideaDescription.trim(), status: 'not_started' });
    setSubmittingIdea(false);
    if (result?.success) {
      setIdeaModalOpen(false);
      setIdeaTitle('');
      setIdeaDescription('');
      toast({ title: 'Idea submitted', description: 'Your idea has been sent to your training administrator.' });
    } else {
      toast({ title: 'Failed to submit', description: 'Please try again.', variant: 'destructive' });
    }
  };

  const [rightCollapsed, setRightCollapsed] = useState(false);
  const [selectedModule, setSelectedModule] = useState<ModuleContent | null>(null);
  const [trainerMessages, setTrainerMessages] = useState<Message[]>([]);
  const [trainerInput, setTrainerInput] = useState('');
  const [isTrainerLoading, setIsTrainerLoading] = useState(false);
  const [isPracticeLoading, setIsPracticeLoading] = useState(false);
  const [moduleCompleted, setModuleCompleted] = useState(false);
  // 'learn' shows the content panel; 'practice' shows the chat
  const [workspaceMode, setWorkspaceMode] = useState<'learn' | 'practice'>('learn');
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [completedModules, setCompletedModules] = useState<Set<string>>(new Set());
  const [suggestedPrompts, setSuggestedPrompts] = useState<string[]>([]);
  const [mobileTab, setMobileTab] = useState<'practice' | 'coach'>('practice');
  const { emitSignal } = useValueSignals();
  const { createMemory } = useAIMemories();
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
  const isAgentModule = sessionId === '2' && (selectedModule?.id === '2-3' || selectedModule?.id === '2-6');

  // For Session 3: determine special module types
  const isSession3 = sessionId === '3';
  const isWorkflowModule = isSession3 && selectedModule?.id === '3-3';
  const isCapstoneModule = isSession3 && selectedModule?.id === '3-5';
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
    } as any);
  };

  // Module engagement tracking state
  const [moduleEngagement, setModuleEngagement] = useState<Record<string, ModuleEngagement>>({});

  const session = sessionId ? ALL_SESSION_CONTENT[parseInt(sessionId)] : null;

  // Per-session tour — triggers once per session on first visit
  useWorkspaceTour(sessionId, session?.title || '');

  // Practice conversations hook — persists to database
  const {
    conversations: practiceConversations,
    activeConversation,
    activeConversationId,
    activeMessages,
    createConversation,
    appendMessage,
    markSubmitted,
    startNewChat,
    selectConversation,
  } = usePracticeConversations(sessionId || '1', selectedModule?.id || null);

  const { allowedModels } = useOrgModelSettings();
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
  }, [profile, session, selectedModule]);


  useEffect(() => {
    if (session?.modules?.length && !selectedModule) {
      // Prefer the next unfinished module; fall back to the first module.
      const nextModule =
        session.modules.find((m) => !completedModules.has(m.id)) ?? session.modules[0];
      setSelectedModule(nextModule);
      if (nextModule.type === 'video') {
        setVideoModalOpen(true);
      }
    }
  }, [session, selectedModule, completedModules]);

  // Reset when module changes
  const prevModuleRef = useRef<string | null>(null);
  useEffect(() => {
    if (selectedModule && selectedModule.id !== prevModuleRef.current) {
      prevModuleRef.current = selectedModule.id;
      contentScrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    }
    setModuleCompleted(selectedModule ? completedModules.has(selectedModule.id) : false);
  }, [selectedModule, completedModules]);

  // Load completed modules and engagement data from database progress
  useEffect(() => {
    if (progress && sessionId) {
      const progressKey = `session_${sessionId}_progress` as keyof typeof progress;
      const sessionProgress = progress[progressKey] as SessionProgressData | null;
      if (sessionProgress) {
        if (sessionProgress.completedModules) {
          setCompletedModules(new Set(sessionProgress.completedModules as string[]));
        }
        if (sessionProgress.moduleEngagement) {
          setModuleEngagement(sessionProgress.moduleEngagement);
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
    } as any);
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
    } as any);
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

  const handleModuleSelect = (module: ModuleContent) => {
    setSelectedModule(module);
    if (module.type === 'video') {
      setVideoModalOpen(true);
    } else {
      setWorkspaceMode('learn');
    }

    // Track content viewed engagement
    if (!moduleEngagement[module.id]?.contentViewed) {
      trackModuleEngagement(module.id, {
        contentViewed: true,
        contentViewedAt: new Date().toISOString(),
      });

      // Signal: use_case_identified — Session 3 with department set, first view of module
      if (isSession3 && profile?.department) {
        emitSignal('use_case_identified', {
          session_id: sessionId,
          module_id: module.id,
          department: profile.department,
        });
      }
    }
  };

  // Handle sending a message in the practice chat (center panel)
  const handlePracticeSendMessage = async (message: string) => {
    if (!message.trim() || !selectedModule) return;

    const userMsg = { role: 'user' as const, content: message };

    // Track the conversation ID and messages for this send operation
    let convId = activeConversationId;
    let messagesForApi = [...activeMessages, userMsg];

    if (!convId) {
      // Create a new conversation with the first message
      convId = await createConversation(userMsg);
      if (!convId) return;
      // For a brand new conversation, the only message is the user's first one
      messagesForApi = [userMsg];

      // Track chat started engagement
      if (!moduleEngagement[selectedModule.id]?.chatStarted) {
        trackModuleEngagement(selectedModule.id, {
          chatStarted: true,
          chatStartedAt: new Date().toISOString(),
          practiceMessageCount: 1,
          // Sandbox modules auto-complete on first message — no submission needed
          ...(selectedModule.type === 'sandbox' ? {
            completed: true,
            completedAt: new Date().toISOString(),
          } : {}),
        });

        // Signal: workflow_built — sandbox module first message = workflow created
        if (selectedModule.type === 'sandbox') {
          emitSignal('workflow_built', {
            session_id: sessionId,
            module_id: selectedModule.id,
            module_type: 'sandbox',
          });
        }
      }
    } else {
      // Append user message to existing conversation
      await appendMessage(userMsg);

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
      // Resolve role-specific scenario: inline departmentScenarios → role scenario bank → default
      const lob = profile?.department;
      const inlineDept = selectedModule.content.practiceTask.departmentScenarios;
      const resolvedScenario = (inlineDept && lob && inlineDept[lob]?.scenario)
        ? inlineDept[lob].scenario
        : (lob && getRoleScenario(selectedModule.id, lob)?.scenario) || selectedModule.content.practiceTask.scenario;

      const response = await supabase.functions.invoke('ai-practice', {
        body: {
          messages: messagesForApi,
          moduleTitle: selectedModule.content.practiceTask.title,
          scenario: resolvedScenario,
          sessionNumber: parseInt(sessionId || '1'),
          model: preferredModel,
          // Session 3: use deployed agent's custom system prompt if available
          ...(isSession3 && deployedAgent?.system_prompt ? { customSystemPrompt: deployedAgent.system_prompt } : {}),
          // Department context for bankers; interests for F&F users
          jobRole: profile?.job_role,
          departmentLob: profile?.department,
          interests: (profile as any)?.interests || undefined,
        },
      });

      if (response.error) throw response.error;

      const reply = response.data?.reply || "I'd be happy to help. Could you provide more details?";
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
  const handleSubmitForReview = async () => {
    if (!selectedModule || activeMessages.length === 0) return;

    setIsTrainerLoading(true);

    // Build the conversation transcript to embed directly in the message
    const conversationTranscript = activeMessages
      .map(m => `[${m.role === 'user' ? 'My Prompt' : 'AI Response'}]: ${m.content}`)
      .join('\n\n');

    const reviewRequest = `Please review my practice conversation below:\n\n---\n${conversationTranscript}\n---`;

    // Build rubric from module success criteria
    const rubric = {
      task: selectedModule.content.practiceTask.title,
      criteria: selectedModule.content.practiceTask.successCriteria,
      instructions: selectedModule.content.practiceTask.instructions,
    };

    let structuredFeedback: Message['structuredFeedback'] | undefined;
    let gateResult: import('@/types/progress').GateResult | null = null;
    try {
      // Call both trainer_chat (Andrea) and submission_review (structured) in parallel
      const [trainerResponse, reviewResponse] = await Promise.allSettled([
        supabase.functions.invoke('trainer_chat', {
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
        }),
        supabase.functions.invoke('submission_review', {
          body: {
            lessonId: sessionId || '1',
            moduleId: selectedModule.id,
            isGateModule: selectedModule.isGateModule === true,
            submission: conversationTranscript,
            rubric,
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
        }),
      ]);

      // Extract Andrea's conversational response
      let replyText = 'I\'ve reviewed your practice conversation. Let me know if you have questions!';
      let prompts: string[] = [];
      let coachingAction: string | undefined = 'review';
      let hintAvailable: boolean | undefined;
      let memorySuggestion: { content: string; reason: string } | undefined;
      let shareSuggestion: Message['shareSuggestion'] | undefined;
      let promptSaveSuggestion: Message['promptSaveSuggestion'] | undefined;
      let levelSuggestion: Message['levelSuggestion'] | undefined;

      if (trainerResponse.status === 'fulfilled' && !trainerResponse.value.error) {
        const replyData = trainerResponse.value.data;
        replyText = replyData?.reply || replyText;
        prompts = replyData?.suggestedPrompts || [];
        coachingAction = replyData?.coachingAction || 'review';
        hintAvailable = replyData?.hintAvailable;
        memorySuggestion = replyData?.memorySuggestion;
        shareSuggestion = replyData?.shareSuggestion;
        promptSaveSuggestion = replyData?.promptSaveSuggestion;
        levelSuggestion = replyData?.levelSuggestion;
      } else {
        console.error('Trainer chat error during review:', trainerResponse);
      }

      // Extract structured feedback and gate result from submission_review
      if (reviewResponse.status === 'fulfilled' && !reviewResponse.value.error) {
        const feedbackData = reviewResponse.value.data;
        if (feedbackData?.feedback) {
          structuredFeedback = feedbackData.feedback;
        }
        if (feedbackData?.gateResult) {
          gateResult = feedbackData.gateResult;
        }
      } else {
        console.error('Submission review error:', reviewResponse);
      }

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
          structuredFeedback,
        },
      ]);
      setSuggestedPrompts(prompts);
    } catch (error) {
      console.error('Review error:', error);
      // Offline fallback
      const offlineFeedback = `I've reviewed your practice conversation (${activeMessages.filter(m => m.role === 'user').length} prompts).

**Quick Assessment:**
${selectedModule.content.practiceTask.successCriteria.map((c, i) => `${i + 1}. ${c}`).join('\n')}

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

    // Determine if gate passed (for gate modules) or always pass (non-gate)
    const isGate = selectedModule.isGateModule === true;
    const gatePassed = !isGate || (gateResult?.passed === true);

    // Mark module as completed only if not gated or gate passed
    const newCompletedModules = new Set(completedModules);
    if (gatePassed) {
      setModuleCompleted(true);
      newCompletedModules.add(selectedModule.id);
      setCompletedModules(newCompletedModules);
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

      if (isGate) {
        engagementUpdates.gateAttempts = (prevEngagement.gateAttempts ?? 0) + 1;
        engagementUpdates.gatePassed = gatePassed;
        if (gateResult) engagementUpdates.lastGateResult = gateResult;
      }

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
      } as any);

      // Signal: skill_applied — module completed (gate passed or non-gate)
      if (gatePassed) {
        await emitSignal('skill_applied', {
          session_id: sessionId,
          module_id: selectedModule.id,
          module_title: selectedModule.title,
          gate_passed: isGate ? true : undefined,
        });
      }
    }
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
    stepCount: draftWorkflow.workflow_data?.steps?.filter((s: any) => s.name?.trim()).length || 0,
    checkpointCount: draftWorkflow.workflow_data?.steps?.filter((s: any) => s.humanReview && s.name?.trim()).length || 0,
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
    const promises: Promise<any>[] = [];
    if (newProficiency !== undefined) {
      promises.push(updateProfile({ ai_proficiency_level: newProficiency }));
    }
    // Use cached pendingRequest; if missing (e.g. expired before user clicked), fetch fresh
    let requestId = pendingRequest?.id;
    if (!requestId && user?.id) {
      const { data } = await (supabase
        .from('level_change_requests' as any)
        .select('id')
        .eq('user_id', user.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(1) as any);
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
    <div className="flex items-center gap-2">
      <ProgressStrip
        modules={progressModules}
        currentModuleId={selectedModule?.id}
        onModuleClick={(id) => {
          const mod = session.modules.find((m) => m.id === id);
          if (mod) handleModuleSelect(mod);
        }}
        className="max-w-[480px]"
      />
      <button
        onClick={() => setIdeaModalOpen(true)}
        className="flex items-center gap-1.5 rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/20 transition-colors shrink-0"
        aria-label="Submit an idea"
      >
        <Lightbulb className="h-3.5 w-3.5" />
        Idea
      </button>
    </div>
  );

  return (
    <AppShell
      breadcrumbs={breadcrumbs}
      topBarActions={trainingActions}
      contentClassName="flex flex-col overflow-hidden p-0"
    >
      {/* Session switcher — navigate between sessions 1–4 */}
      <SessionSwitcher
        activeSession={parseInt(sessionId || '1')}
        currentSession={profile?.current_session ?? 1}
        completedSessions={{
          1: !!progress?.session_1_completed,
          2: !!progress?.session_2_completed,
          3: !!progress?.session_3_completed,
        }}
      />

      {/* Mobile mode tab bar (Learn / Practice / Coach) */}
      {isMobile && (
        <div className="flex border-b bg-card shrink-0">
          <button
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium transition-colors ${
              mobileTab === 'practice' && workspaceMode === 'learn'
                ? 'text-primary border-b-2 border-primary'
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
                ? 'text-primary border-b-2 border-primary'
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
                ? 'text-primary border-b-2 border-primary'
                : 'text-muted-foreground'
            }`}
            onClick={() => setMobileTab('coach')}
          >
            <GraduationCap className="h-3.5 w-3.5" />
            Coach
          </button>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">

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
                onStartPractice={() => setWorkspaceMode('practice')}
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
            ) : selectedModule ? (
              <PracticeChatPanel
                module={selectedModule}
                messages={activeMessages}
                onSendMessage={handlePracticeSendMessage}
                isLoading={isPracticeLoading}
                isCompleted={moduleCompleted}
                isSubmitted={isActiveConversationSubmitted}
                onSubmitForReview={handleSubmitForReview}
                onContinueToNext={nextModule ? () => setSelectedModule(nextModule) : undefined}
                onCompleteSession={!nextModule ? handleCompleteSession : undefined}
                hasNextModule={!!nextModule}
                conversations={practiceConversations}
                activeConversationId={activeConversationId}
                onNewChat={startNewChat}
                onSelectConversation={selectConversation}
                departmentLabel={departmentLabel || undefined}
                lineOfBusiness={profile?.department || undefined}
                displayName={profile?.display_name?.split(' ')[0] || undefined}
                allowedModels={allowedModels}
                selectedModel={preferredModel}
                onModelChange={setPreferredModel}
              />
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

      {/* Submit Idea dialog */}
      <Dialog open={ideaModalOpen} onOpenChange={setIdeaModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-primary" />
              Submit an Idea
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="idea-title">Title *</Label>
              <Input
                id="idea-title"
                value={ideaTitle}
                onChange={(e) => setIdeaTitle(e.target.value)}
                placeholder="e.g. Use AI to automate credit memos"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="idea-desc">Description</Label>
              <Textarea
                id="idea-desc"
                value={ideaDescription}
                onChange={(e) => setIdeaDescription(e.target.value)}
                placeholder="Describe the idea and how it could help your team..."
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIdeaModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmitIdea} disabled={!ideaTitle.trim() || submittingIdea}>
              {submittingIdea ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Submit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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
    return `I'd be happy to review your practice! Start a conversation with the AI in the center panel, then click "Submit for Review" when you're ready.

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
- Review your practice conversation
- Show examples relevant to your role
- Explain concepts in more detail
- Provide hints for the current task

What would be most helpful?`;
}
