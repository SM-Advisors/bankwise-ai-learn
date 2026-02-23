import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth, type UserProfile } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ELECTIVE_PATHS, type ModuleContent } from '@/data/trainingContent';
import { ModuleContentModal } from '@/components/ModuleContentModal';
import { BankPolicyModal } from '@/components/BankPolicyModal';
import { useBankPolicies } from '@/hooks/useBankPolicies';
import { TrainerChatPanel } from '@/components/training/TrainerChatPanel';
import { PracticeChatPanel } from '@/components/training/PracticeChatPanel';
import { ModuleListSidebar } from '@/components/training/ModuleListSidebar';
import { type Message, type BankPolicy } from '@/types/training';
import type { ModuleEngagement } from '@/types/progress';
import { DEFAULT_ENGAGEMENT } from '@/types/progress';
import { deriveSkillSignals } from '@/utils/deriveSkillSignals';
import { useAIMemories } from '@/hooks/useAIPreferences';
import { usePracticeConversations } from '@/hooks/usePracticeConversations';
import { useElectiveProgress } from '@/hooks/useElectiveProgress';
import { useUserPrompts } from '@/hooks/useUserPrompts';
import {
  Loader2, ArrowLeft, Shield, BookOpen, MessageSquare, GraduationCap, Sparkles,
} from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';

export default function ElectiveWorkspace() {
  const isMobile = useIsMobile();
  const [searchParams] = useSearchParams();
  const pathId = searchParams.get('path');
  const moduleId = searchParams.get('module');
  const navigate = useNavigate();
  const { user, profile, loading } = useAuth();
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
  const [policyModalOpen, setPolicyModalOpen] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState<BankPolicy | null>(null);
  const [completedModules, setCompletedModules] = useState<Set<string>>(new Set());
  const [suggestedPrompts, setSuggestedPrompts] = useState<string[]>([]);
  const [policyDropdownOpen, setPolicyDropdownOpen] = useState(false);
  const [mobileTab, setMobileTab] = useState<'practice' | 'coach'>('practice');
  const [mobileModulesOpen, setMobileModulesOpen] = useState(false);
  const [moduleEngagement, setModuleEngagement] = useState<Record<string, ModuleEngagement>>({});

  const { policies } = useBankPolicies();
  const { createMemory } = useAIMemories();
  const { getPathProgress, markModuleComplete, updateModuleProgress } = useElectiveProgress();
  const { createPrompt } = useUserPrompts();

  // Find the elective path and module
  const electivePath = ELECTIVE_PATHS.find((p) => p.id === pathId);
  const modules = electivePath?.modules || [];

  // Use a synthetic session ID for practice conversations (elective paths are separate from core sessions)
  const syntheticSessionId = `elective_${pathId}`;

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
  } = usePracticeConversations(syntheticSessionId, selectedModule?.id || null);

  // Load completed modules from elective progress
  useEffect(() => {
    if (pathId) {
      const prog = getPathProgress(pathId);
      setCompletedModules(new Set(Object.keys(prog).filter((k) => prog[k])));
    }
  }, [pathId, getPathProgress]);

  // Select the initial module based on URL param or first module
  useEffect(() => {
    if (modules.length > 0 && !selectedModule) {
      const targetModule = moduleId
        ? modules.find((m) => m.id === moduleId)
        : modules[0];
      if (targetModule) {
        setSelectedModule(targetModule);
      }
    }
  }, [modules, moduleId, selectedModule]);

  // Initialize trainer with greeting
  const hasGreetedRef = useRef(false);
  useEffect(() => {
    if (profile && electivePath && selectedModule && !hasGreetedRef.current) {
      hasGreetedRef.current = true;

      const fetchGreeting = async () => {
        try {
          // Use session 4 coaching depth (ADVISOR) for electives
          const response = await supabase.functions.invoke('trainer_chat', {
            body: {
              lessonId: syntheticSessionId,
              moduleId: selectedModule.id,
              sessionNumber: 4, // Electives use ADVISOR coaching depth
              messages: [],
              greeting: true,
              learnerState: {
                currentCardTitle: selectedModule.title,
                completedModules: Array.from(completedModules),
                displayName: profile.display_name || undefined,
                bankRole: profile.bank_role || undefined,
                lineOfBusiness: profile.line_of_business || undefined,
                electivePath: electivePath.title,
              },
            },
          });

          if (response.error) throw response.error;

          const replyData = response.data;
          const greetingText = replyData?.reply || `Hi! I'm Andrea. Let's dive into "${selectedModule.title}" from the ${electivePath.title} path.`;
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
          const name = profile.display_name ? `, ${profile.display_name}` : '';
          setTrainerMessages([{
            role: 'assistant',
            content: `Hi${name}! I'm **Andrea**, your AI Training Coach. Let's explore "${selectedModule.title}" from the **${electivePath.title}** path!`,
          }]);
        }
      };

      fetchGreeting();
    }
  }, [profile, electivePath, selectedModule]);

  // Reset when module changes
  const prevModuleRef = useRef<string | null>(null);
  useEffect(() => {
    if (selectedModule && selectedModule.id !== prevModuleRef.current) {
      prevModuleRef.current = selectedModule.id;
      hasGreetedRef.current = false; // Re-greet for new module
      setTrainerMessages([]);
      setSuggestedPrompts([]);
      contentScrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    }
    setModuleCompleted(selectedModule ? completedModules.has(selectedModule.id) : false);
  }, [selectedModule, completedModules]);

  if (loading || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!electivePath) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Elective path not found</h2>
          <p className="text-muted-foreground mb-4">The path "{pathId}" could not be found.</p>
          <Button onClick={() => navigate('/electives')}>Back to Electives</Button>
        </div>
      </div>
    );
  }

  const handleModuleSelect = (module: ModuleContent) => {
    setSelectedModule(module);
    setContentModalModule(module);
    setContentModalOpen(true);
  };

  const handlePracticeSendMessage = async (message: string) => {
    if (!message.trim() || !selectedModule) return;

    const userMsg = { role: 'user' as const, content: message };
    let convId = activeConversationId;
    let messagesForApi = [...activeMessages, userMsg];

    if (!convId) {
      convId = await createConversation(userMsg);
      if (!convId) return;
      messagesForApi = [userMsg];
    } else {
      await appendMessage(userMsg);
    }

    setIsPracticeLoading(true);

    try {
      const response = await supabase.functions.invoke('ai-practice', {
        body: {
          messages: messagesForApi,
          moduleTitle: selectedModule.content.practiceTask.title,
          scenario: selectedModule.content.practiceTask.scenario,
          sessionNumber: 4, // Electives use Session 4 level
        },
      });

      if (response.error) throw response.error;

      const reply = response.data?.reply || "I'd be happy to help. Could you provide more details?";
      const assistantMsg = { role: 'assistant' as const, content: reply };
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

  const handleSubmitForReview = async () => {
    if (!selectedModule || activeMessages.length === 0) return;

    setIsTrainerLoading(true);

    const conversationTranscript = activeMessages
      .map((m) => `[${m.role === 'user' ? 'My Prompt' : 'AI Response'}]: ${m.content}`)
      .join('\n\n');

    const reviewRequest = `Please review my practice conversation below:\n\n---\n${conversationTranscript}\n---`;

    const rubric = {
      task: selectedModule.content.practiceTask.title,
      criteria: selectedModule.content.practiceTask.successCriteria,
      instructions: selectedModule.content.practiceTask.instructions,
    };

    let structuredFeedback: Message['structuredFeedback'] | undefined;
    try {
      const [trainerResponse, reviewResponse] = await Promise.allSettled([
        supabase.functions.invoke('trainer_chat', {
          body: {
            lessonId: syntheticSessionId,
            moduleId: selectedModule.id,
            sessionNumber: 4,
            messages: [...trainerMessages, { role: 'user', content: reviewRequest }],
            practiceConversation: activeMessages,
            learnerState: {
              currentCardTitle: selectedModule.title,
              progressSummary: `Submitted practice conversation with ${activeMessages.filter((m) => m.role === 'user').length} prompts for review`,
              completedModules: Array.from(completedModules),
              displayName: profile?.display_name || undefined,
              bankRole: profile?.bank_role || undefined,
              lineOfBusiness: profile?.line_of_business || undefined,
              electivePath: electivePath.title,
            },
          },
        }),
        supabase.functions.invoke('submission_review', {
          body: {
            lessonId: syntheticSessionId,
            moduleId: selectedModule.id,
            submission: conversationTranscript,
            rubric,
            learnerState: {
              currentCardTitle: selectedModule.title,
              attemptNumber: 1,
              progressSummary: `Submitted ${activeMessages.filter((m) => m.role === 'user').length} prompts`,
            },
          },
        }),
      ]);

      let replyText = "I've reviewed your practice conversation. Let me know if you have questions!";
      let prompts: string[] = [];
      let coachingAction: string | undefined = 'review';
      let hintAvailable: boolean | undefined;
      let memorySuggestion: { content: string; reason: string } | undefined;
      let shareSuggestion: Message['shareSuggestion'] | undefined;

      if (trainerResponse.status === 'fulfilled' && !trainerResponse.value.error) {
        const replyData = trainerResponse.value.data;
        replyText = replyData?.reply || replyText;
        prompts = replyData?.suggestedPrompts || [];
        coachingAction = replyData?.coachingAction || 'review';
        hintAvailable = replyData?.hintAvailable;
        memorySuggestion = replyData?.memorySuggestion;
        shareSuggestion = replyData?.shareSuggestion;
      }

      if (reviewResponse.status === 'fulfilled' && !reviewResponse.value.error) {
        const feedbackData = reviewResponse.value.data;
        if (feedbackData?.feedback) {
          structuredFeedback = feedbackData.feedback;
        }
      }

      setTrainerMessages((prev) => [
        ...prev,
        { role: 'user' as const, content: `Please review my practice conversation (${activeMessages.filter((m) => m.role === 'user').length} prompts submitted).` },
        {
          role: 'assistant' as const,
          content: replyText,
          suggestedPrompts: prompts,
          coachingAction: coachingAction as Message['coachingAction'],
          hintAvailable,
          memorySuggestion,
          shareSuggestion,
          structuredFeedback,
        },
      ]);
      setSuggestedPrompts(prompts);
    } catch (error) {
      console.error('Review error:', error);
      const offlineFeedback = `I've reviewed your practice conversation (${activeMessages.filter((m) => m.role === 'user').length} prompts).

**Quick Assessment:**
${selectedModule.content.practiceTask.successCriteria.map((c, i) => `${i + 1}. ${c}`).join('\n')}

I'm having a connection issue for detailed feedback. Ask me specific questions about your prompts!`;
      setTrainerMessages((prev) => [
        ...prev,
        { role: 'user' as const, content: `Please review my practice conversation (${activeMessages.filter((m) => m.role === 'user').length} prompts submitted).` },
        { role: 'assistant' as const, content: offlineFeedback },
      ]);
    } finally {
      setIsTrainerLoading(false);
    }

    await markSubmitted();

    // Mark module completed in elective progress (Supabase)
    setModuleCompleted(true);
    const newCompletedModules = new Set(completedModules);
    newCompletedModules.add(selectedModule.id);
    setCompletedModules(newCompletedModules);

    if (pathId) {
      await markModuleComplete(pathId, selectedModule.id);

      // Also store engagement data
      const engagementData: Record<string, unknown> = {
        practiceMessageCount: activeMessages.filter((m) => m.role === 'user').length,
        submittedAt: new Date().toISOString(),
      };
      if (structuredFeedback) {
        engagementData.lastFeedback = {
          strengths: structuredFeedback.strengths,
          issues: structuredFeedback.issues,
          summary: structuredFeedback.summary,
        };
      }
      await updateModuleProgress(pathId, selectedModule.id, engagementData);
    }
  };

  const handleTrainerSubmit = async () => {
    if (!trainerInput.trim()) return;

    const isReviewRequest = activeMessages.length > 0 && /review|check|look at|feedback|evaluate/i.test(trainerInput);
    let messageContent = trainerInput;
    if (isReviewRequest) {
      const transcript = activeMessages
        .map((m) => `[${m.role === 'user' ? 'My Prompt' : 'AI Response'}]: ${m.content}`)
        .join('\n\n');
      messageContent = `${trainerInput}\n\nHere is my practice conversation:\n\n---\n${transcript}\n---`;
    }

    const userMessage: Message = { role: 'user', content: trainerInput };
    const apiMessage: Message = { role: 'user', content: messageContent };
    setTrainerMessages((prev) => [...prev, userMessage]);
    setTrainerInput('');
    setIsTrainerLoading(true);

    try {
      const response = await supabase.functions.invoke('trainer_chat', {
        body: {
          lessonId: syntheticSessionId,
          moduleId: selectedModule?.id,
          sessionNumber: 4,
          messages: [...trainerMessages, apiMessage],
          practiceConversation: activeMessages.length > 0 ? activeMessages : undefined,
          learnerState: {
            currentCardTitle: selectedModule?.title,
            progressSummary: activeMessages.length > 0
              ? `Has ${activeMessages.filter((m) => m.role === 'user').length} practice prompts in the conversation`
              : 'Working on module',
            completedModules: Array.from(completedModules),
            displayName: profile?.display_name || undefined,
            bankRole: profile?.bank_role || undefined,
            lineOfBusiness: profile?.line_of_business || undefined,
            electivePath: electivePath.title,
          },
        },
      });

      if (response.error) throw response.error;

      const replyData = response.data;
      const replyText = replyData?.reply || "I'm here to help you with your training. What questions do you have?";
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
      };
      setTrainerMessages((prev) => [...prev, assistantMessage]);
      setSuggestedPrompts(prompts);
    } catch (error) {
      console.error('Trainer error:', error);
      const contextualResponse = generateContextualResponse(trainerInput, selectedModule, profile);
      setTrainerMessages((prev) => [...prev, { role: 'assistant', content: contextualResponse }]);
      setSuggestedPrompts([]);
    } finally {
      setIsTrainerLoading(false);
    }
  };

  const handleQuickAction = async (prompt: string) => {
    const isReviewRequest = activeMessages.length > 0 && /review|check|look at|feedback|evaluate/i.test(prompt);
    let apiContent = prompt;
    if (isReviewRequest) {
      const transcript = activeMessages
        .map((m) => `[${m.role === 'user' ? 'My Prompt' : 'AI Response'}]: ${m.content}`)
        .join('\n\n');
      apiContent = `${prompt}\n\nHere is my practice conversation:\n\n---\n${transcript}\n---`;
    }

    const userMessage: Message = { role: 'user', content: prompt };
    const apiMessage: Message = { role: 'user', content: apiContent };
    setTrainerMessages((prev) => [...prev, userMessage]);
    setSuggestedPrompts([]);
    setIsTrainerLoading(true);

    try {
      const response = await supabase.functions.invoke('trainer_chat', {
        body: {
          lessonId: syntheticSessionId,
          moduleId: selectedModule?.id,
          sessionNumber: 4,
          messages: [...trainerMessages, apiMessage],
          practiceConversation: activeMessages.length > 0 ? activeMessages : undefined,
          learnerState: {
            currentCardTitle: selectedModule?.title,
            progressSummary: activeMessages.length > 0
              ? `Has ${activeMessages.filter((m) => m.role === 'user').length} practice prompts in the conversation`
              : 'Working on module',
            completedModules: Array.from(completedModules),
            displayName: profile?.display_name || undefined,
            bankRole: profile?.bank_role || undefined,
            lineOfBusiness: profile?.line_of_business || undefined,
            electivePath: electivePath.title,
          },
        },
      });

      if (response.error) throw response.error;

      const replyData = response.data;
      const replyText = replyData?.reply || "I'm here to help you with your training.";
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
      };
      setTrainerMessages((prev) => [...prev, assistantMessage]);
      setSuggestedPrompts(prompts);
    } catch (error) {
      console.error('Trainer error:', error);
      const contextualResponse = generateContextualResponse(prompt, selectedModule, profile);
      setTrainerMessages((prev) => [...prev, { role: 'assistant', content: contextualResponse }]);
      setSuggestedPrompts([]);
    } finally {
      setIsTrainerLoading(false);
    }
  };

  const currentModuleIndex = modules.findIndex((m) => m.id === selectedModule?.id);
  const nextModule = modules[currentModuleIndex + 1];

  const isActiveConversationSubmitted = activeConversation?.is_submitted || false;

  const handleCompleteAndReturn = () => {
    toast({
      title: 'Great work!',
      description: `You've completed "${selectedModule?.title}" in the ${electivePath.title} path.`,
    });
    navigate('/electives');
  };

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
          <Button variant="ghost" size="sm" onClick={() => navigate('/electives')} className="gap-1 md:gap-2 px-2 md:px-3 shrink-0">
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Electives</span>
          </Button>
          <div className="h-6 w-px bg-border hidden sm:block" />
          <div className="min-w-0">
            <h1 className="font-semibold text-sm md:text-base truncate flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-purple-500 shrink-0" />
              <span className="hidden sm:inline">{electivePath.title}: </span>{selectedModule?.title || 'Loading...'}
            </h1>
            <p className="text-xs text-muted-foreground hidden md:block">{electivePath.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 md:gap-3 shrink-0">
          {isMobile && (
            <Sheet open={mobileModulesOpen} onOpenChange={setMobileModulesOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1.5">
                  <BookOpen className="h-4 w-4" />
                  <span className="text-xs">Modules</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80 p-0">
                <SheetTitle className="sr-only">Elective Modules</SheetTitle>
                <ModuleListSidebar
                  collapsed={false}
                  onToggleCollapse={() => setMobileModulesOpen(false)}
                  modules={modules}
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
          <Badge variant="secondary" className="hidden md:inline-flex bg-purple-100 text-purple-700">Elective</Badge>
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
        {/* Left Column - Module List (desktop only) */}
        {!isMobile && (
          <ModuleListSidebar
            collapsed={leftCollapsed}
            onToggleCollapse={() => setLeftCollapsed(!leftCollapsed)}
            modules={modules}
            selectedModule={selectedModule}
            completedModules={completedModules}
            moduleEngagement={moduleEngagement}
            onSelectModule={handleModuleSelect}
          />
        )}

        {/* Middle Column - Practice Chat */}
        {(!isMobile || mobileTab === 'practice') && (
          <div className="flex-1 flex flex-col overflow-hidden" ref={contentScrollRef}>
            {selectedModule ? (
              <PracticeChatPanel
                module={selectedModule}
                messages={activeMessages}
                onSendMessage={handlePracticeSendMessage}
                isLoading={isPracticeLoading}
                isCompleted={moduleCompleted}
                isSubmitted={isActiveConversationSubmitted}
                onSubmitForReview={handleSubmitForReview}
                onContinueToNext={nextModule ? () => setSelectedModule(nextModule) : undefined}
                onCompleteSession={!nextModule ? handleCompleteAndReturn : undefined}
                hasNextModule={!!nextModule}
                conversations={practiceConversations}
                activeConversationId={activeConversationId}
                onNewChat={startNewChat}
                onSelectConversation={selectConversation}
              />
            ) : null}
          </div>
        )}

        {/* Right Column - Andrea AI Coach */}
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
            onSaveMemory={async (content, source) => {
              const result = await createMemory({
                content,
                source: source || 'user_saved',
                context: selectedModule ? `Elective: ${electivePath.title} - ${selectedModule.title}` : undefined,
              });
              if (result.success) {
                toast({
                  title: 'Memory saved',
                  description: source === 'andrea_suggested'
                    ? "Andrea's suggestion has been saved to your memories."
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
                source: selectedModule ? `elective-${pathId}-${selectedModule.id}` : undefined,
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
    </div>
  );
}

// Contextual offline response generator for electives
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
${module?.content.keyPoints?.slice(0, 3).map((k) => `• ${k}`).join('\n')}

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
