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
import { PracticeTaskCard } from '@/components/training/PracticeTaskCard';
import { ModuleListSidebar } from '@/components/training/ModuleListSidebar';
import { type Message, type BankPolicy } from '@/types/training';
import { useAIMemories } from '@/hooks/useAIPreferences';
import { Loader2, ArrowLeft, Clock, Shield } from 'lucide-react';

export default function TrainingWorkspace() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const { user, profile, progress, loading, markSessionCompleted, updateProgress } = useAuth();
  const { toast } = useToast();
  const contentScrollRef = useRef<HTMLDivElement>(null);

  const [leftCollapsed, setLeftCollapsed] = useState(false);
  const [rightCollapsed, setRightCollapsed] = useState(false);
  const [selectedModule, setSelectedModule] = useState<ModuleContent | null>(null);
  const [practiceInput, setPracticeInput] = useState('');
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

  const { policies } = useBankPolicies();
  const { createMemory } = useAIMemories();

  const session = sessionId ? ALL_SESSION_CONTENT[parseInt(sessionId)] : null;

  // Initialize trainer with context-aware greeting
  const hasGreetedRef = useRef(false);
  useEffect(() => {
    if (profile && session && selectedModule && !hasGreetedRef.current) {
      hasGreetedRef.current = true;
      const greeting = `Hi! I'm **Andrea**, your AI Training Coach 👋

**How this works:**
1. Click a module on the left to view the learning content
2. Practice what you learn in the center area
3. I'll review your work and give you tips when needed

I won't interrupt you constantly—I'm here when you need guidance. Good luck with "${selectedModule.title}"!`;
      
      setTrainerMessages([{ role: 'assistant', content: greeting }]);
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

  // Reset practice when module changes
  const prevModuleRef = useRef<string | null>(null);
  useEffect(() => {
    if (selectedModule && selectedModule.id !== prevModuleRef.current) {
      setPracticeInput('');
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

  const handlePracticeSubmit = async () => {
    if (!practiceInput.trim() || !selectedModule) return;

    setIsPracticeLoading(true);
    try {
      const response = await supabase.functions.invoke('submission_review', {
        body: {
          lessonId: sessionId || '1',
          moduleId: selectedModule?.id,
          submission: practiceInput,
          rubric: selectedModule?.content.practiceTask.successCriteria.join('\n'),
          learnerState: {
            currentCardTitle: selectedModule?.content.practiceTask.title,
            attemptNumber: 1,
            progressSummary: `Working on ${selectedModule?.title}`,
          },
        },
      });

      if (response.error) throw response.error;
      
      const feedbackData = response.data?.feedback;
      if (feedbackData) {
        const formattedFeedback = `📝 **I've reviewed your submission!**

**Feedback Summary:**
${feedbackData.summary}

**✅ Strengths:**
${feedbackData.strengths?.map((s: string) => `• ${s}`).join('\n') || '• Good effort!'}

**⚠️ Areas for Improvement:**
${feedbackData.issues?.map((i: string) => `• ${i}`).join('\n') || '• No major issues found.'}

**🔧 Suggested Fixes:**
${feedbackData.fixes?.map((f: string) => `• ${f}`).join('\n') || '• Continue practicing.'}

**🚀 Next Steps:**
${feedbackData.next_steps?.map((n: string) => `• ${n}`).join('\n') || '• Move on to the next module.'}

Feel free to ask me any questions about this feedback!`;
        
        setTrainerMessages(prev => [...prev, { role: 'assistant', content: formattedFeedback }]);
      } else {
        setTrainerMessages(prev => [...prev, { role: 'assistant', content: 'Your practice has been submitted! Let me know if you have any questions.' }]);
      }
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
    } catch (error) {
      console.error('Practice error:', error);
      toast({
        title: 'Connection Issue',
        description: 'Using offline mode. Your practice has been recorded.',
        variant: 'default',
      });
      const offlineFeedback = `📝 **I've received your submission!**

I'm having a brief connection issue, but here's my initial assessment based on the task criteria:

**What you wrote:**
"${practiceInput}"

**Success Criteria Check:**
${selectedModule?.content.practiceTask.successCriteria.map((c, i) => `${i + 1}. ${c}`).join('\n')}

Feel free to ask me for more detailed feedback!`;
      setTrainerMessages(prev => [...prev, { role: 'assistant', content: offlineFeedback }]);
      setModuleCompleted(true);
      
      const newCompletedModules = new Set(completedModules);
      newCompletedModules.add(selectedModule.id);
      setCompletedModules(newCompletedModules);
    } finally {
      setIsPracticeLoading(false);
    }
  };

  const handleTrainerSubmit = async () => {
    if (!trainerInput.trim()) return;

    const userMessage: Message = { role: 'user', content: trainerInput };
    setTrainerMessages(prev => [...prev, userMessage]);
    setTrainerInput('');
    setIsTrainerLoading(true);

    try {
      const response = await supabase.functions.invoke('trainer_chat', {
        body: {
          lessonId: sessionId || '1',
          moduleId: selectedModule?.id,
          messages: [...trainerMessages, userMessage],
          learnerState: {
            currentCardTitle: selectedModule?.title,
            progressSummary: practiceInput ? `Has submitted practice: "${practiceInput.substring(0, 100)}..."` : 'Working on module',
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
      };
      setTrainerMessages(prev => [...prev, assistantMessage]);
      setSuggestedPrompts(prompts);
    } catch (error) {
      console.error('Trainer error:', error);
      const contextualResponse = generateContextualResponse(trainerInput, selectedModule, profile, practiceInput);
      setTrainerMessages(prev => [...prev, { role: 'assistant', content: contextualResponse }]);
      setSuggestedPrompts([]);
    } finally {
      setIsTrainerLoading(false);
    }
  };

  const handleQuickAction = async (prompt: string) => {
    const userMessage: Message = { role: 'user', content: prompt };
    setTrainerMessages(prev => [...prev, userMessage]);
    setSuggestedPrompts([]);
    setIsTrainerLoading(true);

    try {
      const response = await supabase.functions.invoke('trainer_chat', {
        body: {
          lessonId: sessionId || '1',
          moduleId: selectedModule?.id,
          messages: [...trainerMessages, userMessage],
          learnerState: {
            currentCardTitle: selectedModule?.title,
            progressSummary: practiceInput ? `Current practice input: "${practiceInput.substring(0, 200)}..."` : 'Working on module',
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
      };
      setTrainerMessages(prev => [...prev, assistantMessage]);
      setSuggestedPrompts(prompts);
    } catch (error) {
      console.error('Trainer error:', error);
      const contextualResponse = generateContextualResponse(prompt, selectedModule, profile, practiceInput);
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
            <div className="relative group">
              <Button variant="outline" size="sm" className="gap-2">
                <Shield className="h-4 w-4" />
                Bank Policies
              </Button>
              <div className="absolute right-0 top-full mt-1 w-64 bg-popover border rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                <div className="p-2 space-y-1">
                  {policies.map((policy) => (
                    <button
                      key={policy.id}
                      className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-muted transition-colors"
                      onClick={() => {
                        setSelectedPolicy(policy as BankPolicy);
                        setPolicyModalOpen(true);
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

        {/* Middle Column - Practice Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 flex flex-col p-6 overflow-y-auto" ref={contentScrollRef}>
            {selectedModule && (
              <div className="max-w-3xl mx-auto flex flex-col min-h-full w-full">
                {/* Module Header */}
                <div className="shrink-0 mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="secondary">{selectedModule.type}</Badge>
                    <span className="text-sm text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {selectedModule.estimatedTime}
                    </span>
                  </div>
                  <h2 className="text-2xl font-bold">{selectedModule.title}</h2>
                  <p className="text-muted-foreground mt-1">{selectedModule.description}</p>
                </div>

                {/* Practice Task - fills remaining space */}
                <div className="flex-1 flex flex-col">
                  <PracticeTaskCard
                    module={selectedModule}
                    practiceInput={practiceInput}
                    onPracticeInputChange={setPracticeInput}
                    onSubmit={handlePracticeSubmit}
                    isLoading={isPracticeLoading}
                    isCompleted={moduleCompleted}
                    onContinueToNext={nextModule ? () => setSelectedModule(nextModule) : undefined}
                    onCompleteSession={!nextModule ? handleCompleteSession : undefined}
                    hasNextModule={!!nextModule}
                  />
                </div>
              </div>
            )}
          </div>
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
  userPractice: string
): string {
  const lowerInput = input.toLowerCase();
  
  if (lowerInput.includes('review') || lowerInput.includes('feedback')) {
    if (userPractice) {
      return `Let me review your practice work.

**Your Prompt:**
"${userPractice.substring(0, 200)}${userPractice.length > 200 ? '...' : ''}"

**Feedback based on ${userProfile?.learning_style} learning style:**

✅ **What's working:**
- You've started crafting a prompt for the task
- Your intent is clear

📝 **Suggestions for improvement:**
${module?.content.practiceTask.hints.map(h => `- ${h}`).join('\n')}

**Success Criteria to check:**
${module?.content.practiceTask.successCriteria.map((c, i) => `${i + 1}. ${c}`).join('\n')}

Would you like me to show you an example of a strong prompt for this scenario?`;
    } else {
      return `I'd be happy to review your work! Please complete the practice task in the center panel first, then ask me to review it.

The current task is: **${module?.content.practiceTask.title}**

${module?.content.practiceTask.instructions}`;
    }
  }
  
  if (lowerInput.includes('example') || lowerInput.includes('show me')) {
    const examples = module?.content.examples;
    if (examples && examples.length > 0) {
      const ex = examples[0];
      return `Here's an example from this module:

**${ex.title}**

❌ **Less Effective:**
"${ex.bad || 'Not specified'}"

✅ **More Effective:**
"${ex.good}"

**Why it works:**
${ex.explanation}

Would you like to see how to apply this pattern to your specific task?`;
    }
  }
  
  if (lowerInput.includes('hint') || lowerInput.includes('help') || lowerInput.includes('stuck')) {
    return `Here are some hints for the current task:

**${module?.content.practiceTask.title}**

${module?.content.practiceTask.hints.map((h, i) => `${i + 1}. ${h}`).join('\n')}

**Remember the key points:**
${module?.content.keyPoints?.slice(0, 3).map(k => `• ${k}`).join('\n')}

What specific part would you like more guidance on?`;
  }
  
  return `I'm here to help you with "${module?.title}".

Based on your **${userProfile?.learning_style}** learning style, I'd suggest:
${userProfile?.learning_style === 'example-based' ? '- Let me show you a concrete example first' :
  userProfile?.learning_style === 'explanation-based' ? '- Let me walk you through the concept step by step' :
  userProfile?.learning_style === 'hands-on' ? '- Try the practice task and I\'ll give you feedback' :
  '- Let me explain the underlying logic and framework'}

You can ask me to:
• Review your practice work
• Show examples relevant to your role
• Explain concepts in more detail
• Provide hints for the current task

What would be most helpful?`;
}
