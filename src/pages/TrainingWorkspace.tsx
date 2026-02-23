import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth, type UserProfile } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ALL_SESSION_CONTENT, type ModuleContent } from '@/data/trainingContent';
import { ModuleContentModal } from '@/components/ModuleContentModal';
import { VideoModal } from '@/components/VideoModal';
import { BankPolicyModal } from '@/components/BankPolicyModal';
import { useBankPolicies } from '@/hooks/useBankPolicies';
import { TrainerChatPanel } from '@/components/training/TrainerChatPanel';
import { PracticeChatPanel } from '@/components/training/PracticeChatPanel';
import { ModuleListSidebar } from '@/components/training/ModuleListSidebar';
import { type Message, type BankPolicy } from '@/types/training';
import type { SessionProgressData, ModuleEngagement } from '@/types/progress';
import { DEFAULT_ENGAGEMENT } from '@/types/progress';
import { deriveSkillSignals } from '@/utils/deriveSkillSignals';
import { useAIMemories } from '@/hooks/useAIPreferences';
import { useSkillAssessment } from '@/hooks/useSkillAssessment';
import { usePracticeConversations } from '@/hooks/usePracticeConversations';
import { useUserAgents } from '@/hooks/useUserAgents';
import { useUserWorkflows } from '@/hooks/useUserWorkflows';
import { useUserPrompts } from '@/hooks/useUserPrompts';
import { AgentStudioPanel } from '@/components/agent-studio/AgentStudioPanel';
import { WorkflowStudioPanel } from '@/components/workflow-studio/WorkflowStudioPanel';
import { CapstonePanel } from '@/components/capstone/CapstonePanel';
import type { CapstoneData } from '@/types/progress';
import type { WorkflowData } from '@/types/workflow';
import { Loader2, ArrowLeft, Shield, Bot, Building2, BookOpen, MessageSquare, GraduationCap } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';

export default function TrainingWorkspace() {
  const isMobile = useIsMobile();
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const { user, profile, progress, loading, markSessionCompleted, updateProgress, updateProfile } = useAuth();
  const { toast } = useToast();
  const contentScrollRef = useRef<HTMLDivElement>(null);

  const [leftCollapsed, setLeftCollapsed] = useState(false);
  const [rightCollapsed, setRightCollapsed] = useState(false);
  const [selectedModule, setSelectedModule] = useState<ModuleContent | null>(null);
  const [trainerMessages, setTrainerMessages] = useState<Message[]>([]);
  const [trainerInput, setTrainerInput] = useState('');
  const [isTrainerLoading, setIsTrainerLoading] = useState(false);
  const [isPracticeLoading, setIsPracticeLoading] = useState(false);
  const [moduleCompleted, setModuleCompleted] = useState(false);
  const [contentModalOpen, setContentModalOpen] = useState(false);
  const [contentModalModule, setContentModalModule] = useState<ModuleContent | null>(null);
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [policyModalOpen, setPolicyModalOpen] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState<BankPolicy | null>(null);
  const [completedModules, setCompletedModules] = useState<Set<string>>(new Set());
  const [suggestedPrompts, setSuggestedPrompts] = useState<string[]>([]);
  const [policyDropdownOpen, setPolicyDropdownOpen] = useState(false);
  const [mobileTab, setMobileTab] = useState<'practice' | 'coach'>('practice');
  const [mobileModulesOpen, setMobileModulesOpen] = useState(false);

  const { policies } = useBankPolicies();
  const { createMemory } = useAIMemories();
  const { pendingRequest, respondToLevelChange } = useSkillAssessment();
  const { activeAgent, draftAgent } = useUserAgents();
  const { draftWorkflow } = useUserWorkflows();
  const { createPrompt } = useUserPrompts();

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
  const departmentLabel = isSession3 ? getDepartmentLabel(profile?.line_of_business ?? null) : null;

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
              learnerState: {
                currentCardTitle: selectedModule.title,
                completedModules: Array.from(completedModules),
                displayName: profile.display_name || undefined,
                bankRole: profile.bank_role || undefined,
                lineOfBusiness: profile.line_of_business || undefined,
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
      const firstModule = session.modules[0];
      setSelectedModule(firstModule);
      // Auto-open video modal for video-type modules (like Introduction)
      if (firstModule.type === 'video') {
        setVideoModalOpen(true);
      }
    }
  }, [session, selectedModule]);

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
      setContentModalModule(module);
      setContentModalOpen(true);
    }

    // Track content viewed engagement
    if (!moduleEngagement[module.id]?.contentViewed) {
      trackModuleEngagement(module.id, {
        contentViewed: true,
        contentViewedAt: new Date().toISOString(),
      });
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
        });
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
      const response = await supabase.functions.invoke('ai-practice', {
        body: {
          messages: messagesForApi,
          moduleTitle: selectedModule.content.practiceTask.title,
          scenario: selectedModule.content.practiceTask.scenario,
          sessionNumber: parseInt(sessionId || '1'),
          // Session 3: use deployed agent's custom system prompt if available
          ...(isSession3 && deployedAgent?.system_prompt ? { customSystemPrompt: deployedAgent.system_prompt } : {}),
          // Session 3: department context
          ...(isSession3 ? { bankRole: profile?.bank_role, lineOfBusiness: profile?.line_of_business } : {}),
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
              progressSummary: `Submitted practice conversation with ${activeMessages.filter(m => m.role === 'user').length} prompts for review`,
              completedModules: Array.from(completedModules),
              displayName: profile?.display_name || undefined,
              bankRole: profile?.bank_role || undefined,
              lineOfBusiness: profile?.line_of_business || undefined,
            },
          },
        }),
        supabase.functions.invoke('submission_review', {
          body: {
            lessonId: sessionId || '1',
            moduleId: selectedModule.id,
            submission: conversationTranscript,
            rubric,
            // Pass agent template for modules 2-3 and 2-5 for agent-specific rubrics
            ...(isAgentModule && currentAgent?.template_data ? { agentTemplate: currentAgent.template_data } : {}),
            // Session 3: department context for role-specific evaluation
            ...(isSession3 ? { departmentContext: { bankRole: profile?.bank_role, lineOfBusiness: profile?.line_of_business } } : {}),
            // Module 3-3: workflow-specific rubric
            ...(isWorkflowModule && draftWorkflow?.workflow_data ? { workflowData: draftWorkflow.workflow_data } : {}),
            learnerState: {
              currentCardTitle: selectedModule.title,
              attemptNumber: 1,
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

      // Extract structured feedback from submission_review
      // Assign to outer-scoped structuredFeedback
      if (reviewResponse.status === 'fulfilled' && !reviewResponse.value.error) {
        const feedbackData = reviewResponse.value.data;
        if (feedbackData?.feedback) {
          structuredFeedback = feedbackData.feedback;
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

    // Mark module as completed
    setModuleCompleted(true);
    const newCompletedModules = new Set(completedModules);
    newCompletedModules.add(selectedModule.id);
    setCompletedModules(newCompletedModules);

    if (sessionId) {
      const progressKey = `session_${sessionId}_progress` as const;
      const currentProgress = (progress?.[progressKey] as SessionProgressData) || { completedModules: [] };

      // Build engagement update with feedback and skill signals
      const engagementUpdates: Partial<ModuleEngagement> = {
        submitted: true,
        submittedAt: new Date().toISOString(),
        completed: true,
        completedAt: new Date().toISOString(),
        practiceMessageCount: activeMessages.filter(m => m.role === 'user').length,
      };

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
            progressSummary: activeMessages.length > 0
              ? `Has ${activeMessages.filter(m => m.role === 'user').length} practice prompts in the conversation`
              : 'Working on module',
            completedModules: Array.from(completedModules),
            displayName: profile?.display_name || undefined,
            bankRole: profile?.bank_role || undefined,
            lineOfBusiness: profile?.line_of_business || undefined,
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
            progressSummary: activeMessages.length > 0
              ? `Has ${activeMessages.filter(m => m.role === 'user').length} practice prompts in the conversation`
              : 'Working on module',
            completedModules: Array.from(completedModules),
            displayName: profile?.display_name || undefined,
            bankRole: profile?.bank_role || undefined,
            lineOfBusiness: profile?.line_of_business || undefined,
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

  return (
    <div className="h-screen flex flex-col bg-background">
      <BankPolicyModal
        open={policyModalOpen}
        onOpenChange={setPolicyModalOpen}
        policy={selectedPolicy}
      />

      {/* Top Bar */}
      <header className="border-b bg-card px-3 md:px-4 py-2 md:py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2 md:gap-4 min-w-0">
          <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')} className="gap-1 md:gap-2 px-2 md:px-3 shrink-0">
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Dashboard</span>
          </Button>
          <div className="h-6 w-px bg-border hidden sm:block" />
          <div className="min-w-0">
            <h1 className="font-semibold text-sm md:text-base truncate">
              <span className="hidden sm:inline">Session {sessionId}: </span>{session.title}
            </h1>
            <p className="text-xs text-muted-foreground hidden md:block">{session.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 md:gap-3 shrink-0">
          {/* Mobile: modules button */}
          {isMobile && (
            <Sheet open={mobileModulesOpen} onOpenChange={setMobileModulesOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1.5">
                  <BookOpen className="h-4 w-4" />
                  <span className="text-xs">Modules</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80 p-0">
                <SheetTitle className="sr-only">Training Modules</SheetTitle>
                <ModuleListSidebar
                  collapsed={false}
                  onToggleCollapse={() => setMobileModulesOpen(false)}
                  modules={session.modules}
                  selectedModule={selectedModule}
                  completedModules={completedModules}
                  moduleEngagement={moduleEngagement}
                  onSelectModule={(module) => {
                    handleModuleSelect(module);
                    setMobileModulesOpen(false);
                  }}
                />
              </SheetContent>
            </Sheet>
          )}
          {policies.length > 0 && (
            <div className="relative hidden md:block">
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => setPolicyDropdownOpen(!policyDropdownOpen)}
                aria-expanded={policyDropdownOpen}
                aria-haspopup="true"
              >
                <Shield className="h-4 w-4" />
                Bank Policies
              </Button>
              {policyDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setPolicyDropdownOpen(false)} />
                  <div className="absolute right-0 top-full mt-1 w-64 bg-popover border rounded-lg shadow-lg z-50">
                    <div className="p-2 space-y-1">
                      {policies.map((policy) => (
                        <button
                          key={policy.id}
                          className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-muted transition-colors"
                          onClick={() => {
                            setSelectedPolicy(policy as BankPolicy);
                            setPolicyModalOpen(true);
                            setPolicyDropdownOpen(false);
                          }}
                        >
                          <div className="font-medium">{policy.title}</div>
                          <div className="text-xs text-muted-foreground line-clamp-1">
                            {policy.summary || 'View policy details'}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
          <Badge variant="secondary" className="hidden md:inline-flex">{profile.learning_style}</Badge>
          <Badge variant="outline" className="hidden md:inline-flex">Level {profile.ai_proficiency_level}</Badge>
        </div>
      </header>

      {/* Mobile tab bar */}
      {isMobile && (
        <div className="flex border-b bg-card shrink-0">
          <button
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium transition-colors ${
              mobileTab === 'practice'
                ? 'text-primary border-b-2 border-primary'
                : 'text-muted-foreground'
            }`}
            onClick={() => setMobileTab('practice')}
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
        {/* Left Column - Training Modules (desktop only) */}
        {!isMobile && (
          <ModuleListSidebar
            collapsed={leftCollapsed}
            onToggleCollapse={() => setLeftCollapsed(!leftCollapsed)}
            modules={session.modules}
            selectedModule={selectedModule}
            completedModules={completedModules}
            moduleEngagement={moduleEngagement}
            onSelectModule={handleModuleSelect}
          />
        )}

        {/* Middle Column - Practice Chat Area (shown on desktop always, on mobile when practice tab active) */}
        {(!isMobile || mobileTab === 'practice') && (
          <div className="flex-1 flex flex-col overflow-hidden" ref={contentScrollRef}>
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

            {selectedModule && isAgentModule ? (
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
                bankName={profile?.employer_bank_name || undefined}
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
                departmentLabel={isSession3 ? (departmentLabel || undefined) : undefined}
                lineOfBusiness={isSession3 ? (profile?.line_of_business || undefined) : undefined}
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
      <ModuleContentModal
        module={contentModalModule}
        open={contentModalOpen}
        onOpenChange={setContentModalOpen}
      />

      <VideoModal
        open={videoModalOpen}
        onOpenChange={setVideoModalOpen}
        videoUrl={selectedModule?.videoUrl || 'https://youtu.be/xZ1FAm7IoA4'}
        title={selectedModule?.title || "Introduction to AI Prompting"}
      />
    </div>
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
