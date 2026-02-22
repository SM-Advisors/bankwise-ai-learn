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
import { useAIMemories } from '@/hooks/useAIPreferences';
import { usePracticeConversations } from '@/hooks/usePracticeConversations';
import { Loader2, ArrowLeft, Shield } from 'lucide-react';

export default function TrainingWorkspace() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const { user, profile, progress, loading, markSessionCompleted, updateProgress } = useAuth();
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

  const { policies } = useBankPolicies();
  const { createMemory } = useAIMemories();

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

  // Load completed modules from database progress
  useEffect(() => {
    if (progress && sessionId) {
      const progressKey = `session_${sessionId}_progress` as keyof typeof progress;
      const sessionProgress = progress[progressKey] as Record<string, unknown> | null;
      if (sessionProgress && sessionProgress.completedModules) {
        setCompletedModules(new Set(sessionProgress.completedModules as string[]));
      }
    }
  }, [progress, sessionId]);

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
    } else {
      // Append user message to existing conversation
      await appendMessage(userMsg);
    }

    setIsPracticeLoading(true);

    try {
      const response = await supabase.functions.invoke('ai-practice', {
        body: {
          messages: messagesForApi,
          moduleTitle: selectedModule.content.practiceTask.title,
          scenario: selectedModule.content.practiceTask.scenario,
          sessionNumber: parseInt(sessionId || '1'),
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

    try {
      const response = await supabase.functions.invoke('trainer_chat', {
        body: {
          lessonId: sessionId || '1',
          moduleId: selectedModule.id,
          sessionNumber: parseInt(sessionId || '1'),
          messages: [...trainerMessages, {
            role: 'user',
            content: reviewRequest,
          }],
          practiceConversation: activeMessages,
          learnerState: {
            currentCardTitle: selectedModule.title,
            progressSummary: `Submitted practice conversation with ${activeMessages.filter(m => m.role === 'user').length} prompts for review`,
            completedModules: Array.from(completedModules),
            displayName: profile?.display_name || undefined,
            bankRole: profile?.bank_role || undefined,
            lineOfBusiness: profile?.line_of_business || undefined,
          },
        },
      });

      if (response.error) throw response.error;

      const replyData = response.data;
      const replyText = replyData?.reply || 'I\'ve reviewed your practice conversation. Let me know if you have questions!';
      const prompts = replyData?.suggestedPrompts || [];

      setTrainerMessages(prev => [...prev,
        { role: 'user' as const, content: `Please review my practice conversation (${activeMessages.filter(m => m.role === 'user').length} prompts submitted).` },
        {
          role: 'assistant' as const,
          content: replyText,
          suggestedPrompts: prompts,
          coachingAction: replyData?.coachingAction || 'review',
          hintAvailable: replyData?.hintAvailable,
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
      await updateProgress({
        [progressKey]: { completedModules: Array.from(newCompletedModules) },
      });
    }
  };

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
      <header className="border-b bg-card px-4 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Dashboard
          </Button>
          <div className="h-6 w-px bg-border" />
          <div>
            <h1 className="font-semibold">Session {sessionId}: {session.title}</h1>
            <p className="text-xs text-muted-foreground">{session.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {policies.length > 0 && (
            <div className="relative">
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
          <Badge variant="secondary">{profile.learning_style}</Badge>
          <Badge variant="outline">Level {profile.ai_proficiency_level}</Badge>
        </div>
      </header>

      {/* Main Content - 3 Column Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Column - Training Modules */}
        <ModuleListSidebar
          collapsed={leftCollapsed}
          onToggleCollapse={() => setLeftCollapsed(!leftCollapsed)}
          modules={session.modules}
          selectedModule={selectedModule}
          completedModules={completedModules}
          onSelectModule={handleModuleSelect}
        />

        {/* Middle Column - Practice Chat Area */}
        <div className="flex-1 flex flex-col overflow-hidden" ref={contentScrollRef}>
          {selectedModule && (
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
            />
          )}
        </div>

        {/* Right Column - Andrea AI Coach */}
        <TrainerChatPanel
          collapsed={rightCollapsed}
          onToggleCollapse={() => setRightCollapsed(!rightCollapsed)}
          messages={trainerMessages}
          input={trainerInput}
          onInputChange={setTrainerInput}
          onSubmit={handleTrainerSubmit}
          onQuickAction={handleQuickAction}
          isLoading={isTrainerLoading}
          suggestedPrompts={suggestedPrompts}
          onSaveMemory={async (content) => {
            const result = await createMemory({
              content,
              source: 'user_saved',
              context: selectedModule ? `Session ${sessionId} - ${selectedModule.title}` : undefined,
            });
            if (result.success) {
              toast({ title: 'Memory saved', description: 'Andrea will remember this insight.' });
            }
          }}
        />
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
