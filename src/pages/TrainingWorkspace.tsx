import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ALL_SESSION_CONTENT, type ModuleContent } from '@/data/trainingContent';
import { ModuleContentModal } from '@/components/ModuleContentModal';
import { VideoModal } from '@/components/VideoModal';
import { BankPolicyModal } from '@/components/BankPolicyModal';
import { useBankPolicies } from '@/hooks/useBankPolicies';
import { 
  Loader2, ArrowLeft, ChevronLeft, ChevronRight, Send, 
  Play, FileText, BookOpen, CheckCircle, Sparkles,
  Lightbulb, Clock, Target, AlertCircle, Shield
} from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import andreaCoach from '@/assets/andrea-coach.png';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function TrainingWorkspace() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const { user, profile, progress, loading, markSessionCompleted, updateProgress } = useAuth();
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const contentScrollRef = useRef<HTMLDivElement>(null);

  const [leftCollapsed, setLeftCollapsed] = useState(false);
  const [rightCollapsed, setRightCollapsed] = useState(false);
  const [selectedModule, setSelectedModule] = useState<ModuleContent | null>(null);
  const [practiceInput, setPracticeInput] = useState('');
  const [trainerMessages, setTrainerMessages] = useState<Message[]>([]);
  const [trainerInput, setTrainerInput] = useState('');
  const [isTrainerLoading, setIsTrainerLoading] = useState(false);
  const [practiceResponse, setPracticeResponse] = useState('');
  const [isPracticeLoading, setIsPracticeLoading] = useState(false);
  const [moduleCompleted, setModuleCompleted] = useState(false);
  const [contentModalOpen, setContentModalOpen] = useState(false);
  const [contentModalModule, setContentModalModule] = useState<ModuleContent | null>(null);
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [policyModalOpen, setPolicyModalOpen] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState<any>(null);
  const [completedModules, setCompletedModules] = useState<Set<string>>(new Set());
  
  const { policies } = useBankPolicies();

  const session = sessionId ? ALL_SESSION_CONTENT[parseInt(sessionId)] : null;

  // Initialize trainer with context-aware greeting (only on first module load)
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
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (session?.modules?.length && !selectedModule) {
      setSelectedModule(session.modules[0]);
    }
  }, [session, selectedModule]);

  // Scroll to bottom of trainer messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [trainerMessages]);

  // Reset practice when module changes (not when completedModules updates)
  const prevModuleRef = useRef<string | null>(null);
  useEffect(() => {
    if (selectedModule && selectedModule.id !== prevModuleRef.current) {
      setPracticeInput('');
      setPracticeResponse('');
      prevModuleRef.current = selectedModule.id;
      // Scroll content area to top when navigating to a new module
      if (contentScrollRef.current) {
        contentScrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
    // Check if this module was already completed
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

  const getModuleIcon = (type: ModuleContent['type']) => {
    switch (type) {
      case 'document': return FileText;
      case 'example': return Lightbulb;
      case 'exercise': return Play;
      case 'video': return Play;
      default: return BookOpen;
    }
  };

  const handleOpenContentModal = (module: ModuleContent, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent selecting the module when clicking the badge
    // Open video modal for video type modules
    if (module.type === 'video') {
      setVideoModalOpen(true);
      return;
    }
    setContentModalModule(module);
    setContentModalOpen(true);
  };

  const getTypeBadgeClass = (type: ModuleContent['type']) => {
    switch (type) {
      case 'document': return 'bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/50 cursor-pointer';
      case 'example': return 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:hover:bg-yellow-900/50 cursor-pointer';
      case 'exercise': return 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-300 dark:hover:bg-green-900/50 cursor-pointer';
      case 'video': return 'bg-purple-100 text-purple-700 hover:bg-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:hover:bg-purple-900/50 cursor-pointer';
      default: return 'bg-muted text-muted-foreground hover:bg-muted/80 cursor-pointer';
    }
  };

  const handlePracticeSubmit = async () => {
    if (!practiceInput.trim() || !selectedModule) return;

    setIsPracticeLoading(true);
    try {
      // Call Claude-powered submission_review edge function
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
      
      // Parse the structured feedback response
      const feedbackData = response.data?.feedback;
      if (feedbackData) {
        // Format structured feedback as markdown
        const formattedFeedback = `## Feedback Summary
${feedbackData.summary}

### ✅ Strengths
${feedbackData.strengths?.map((s: string) => `- ${s}`).join('\n') || '- Good effort!'}

### ⚠️ Areas for Improvement
${feedbackData.issues?.map((i: string) => `- ${i}`).join('\n') || '- No major issues found.'}

### 🔧 Suggested Fixes
${feedbackData.fixes?.map((f: string) => `- ${f}`).join('\n') || '- Continue practicing.'}

### 🚀 Next Steps
${feedbackData.next_steps?.map((n: string) => `- ${n}`).join('\n') || '- Move on to the next module.'}`;
        
        setPracticeResponse(formattedFeedback);
      } else {
        setPracticeResponse('AI response generated successfully.');
      }
      setModuleCompleted(true);
      
      // Save completed module to database
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
      // Offline fallback response
      setPracticeResponse(`**Practice Response**

Your prompt has been processed. Here's feedback based on the task criteria:

**What you wrote:**
"${practiceInput}"

**Assessment:**
${selectedModule?.content.practiceTask.successCriteria.map((c, i) => `${i + 1}. ${c}`).join('\n')}

The AI trainer on the right can provide more detailed feedback on your work. Ask "Can you review my practice prompt?" to get personalized suggestions.`);
      setModuleCompleted(true);
      
      // Still save progress locally even if API fails
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
      // Call Claude-powered trainer_chat edge function
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
      
      const assistantMessage: Message = { 
        role: 'assistant', 
        content: response.data?.reply || 'I\'m here to help you with your training. What questions do you have?' 
      };
      setTrainerMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Trainer error:', error);
      // Contextual fallback response
      const contextualResponse = generateContextualResponse(
        trainerInput,
        selectedModule,
        profile,
        practiceInput
      );
      setTrainerMessages(prev => [...prev, { role: 'assistant', content: contextualResponse }]);
    } finally {
      setIsTrainerLoading(false);
    }
  };

  // Generate contextual offline responses
  function generateContextualResponse(
    input: string,
    module: ModuleContent | null,
    userProfile: typeof profile,
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
    
    if (lowerInput.includes('what') || lowerInput.includes('how') || lowerInput.includes('why')) {
      return `Great question! Let me explain based on the current module.

**${module?.title}**

${module?.content.overview}

**Key Concepts:**
${module?.content.keyPoints?.map(k => `• ${k}`).join('\n')}

For your ${userProfile?.line_of_business?.replace('_', ' ')} role, this is particularly relevant because it helps you communicate more effectively with AI tools.

What aspect would you like me to elaborate on?`;
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

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Bank Policy Modal */}
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
          {/* Bank Policies Dropdown */}
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
                        setSelectedPolicy(policy);
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
        {/* Left Column - Training Content */}
        <div className={`border-r bg-card transition-all duration-300 flex flex-col ${leftCollapsed ? 'w-12' : 'w-80'}`}>
          <div className="p-3 border-b flex items-center justify-between shrink-0">
            {!leftCollapsed && <span className="font-medium text-sm">Training Modules</span>}
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setLeftCollapsed(!leftCollapsed)}
              className="ml-auto"
            >
              {leftCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </Button>
          </div>
          
          {!leftCollapsed && (
            <ScrollArea className="flex-1">
              <div className="p-3 space-y-2">
                {session.modules.map((module, idx) => {
                  const IconComponent = getModuleIcon(module.type);
                  const isSelected = selectedModule?.id === module.id;
                  const isCompleted = completedModules.has(module.id);
                  
                    return (
                      <Card
                        key={module.id}
                        className={`cursor-pointer transition-all ${
                          isSelected ? 'ring-2 ring-primary' : 'hover:bg-muted/50'
                        } ${isCompleted ? 'bg-green-500/5' : ''}`}
                        onClick={() => {
                          setSelectedModule(module);
                          // Open video modal directly for video type modules
                          if (module.type === 'video') {
                            setVideoModalOpen(true);
                          }
                        }}
                      >
                      <CardContent className="p-3">
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-lg shrink-0 relative ${
                            isCompleted ? 'bg-green-500/20 text-green-600' :
                            isSelected ? 'bg-primary/10 text-primary' : 'bg-muted'
                          }`}>
                            {isCompleted ? (
                              <CheckCircle className="h-4 w-4" />
                            ) : (
                              <IconComponent className="h-4 w-4" />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className={`font-medium text-sm truncate ${isCompleted ? 'text-green-700 dark:text-green-400' : ''}`}>
                              {idx + 1}. {module.title}
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge 
                                variant="outline" 
                                className={`text-xs transition-colors ${getTypeBadgeClass(module.type)}`}
                                onClick={(e) => handleOpenContentModal(module, e)}
                                title={`View ${module.type} content`}
                              >
                                {module.type}
                              </Badge>
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {module.estimatedTime}
                              </span>
                              {isCompleted && (
                                <span className="text-xs text-green-600 font-medium">Done</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </ScrollArea>
          )}
        </div>

        {/* Middle Column - Lesson & Practice Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <ScrollArea className="flex-1" viewportRef={contentScrollRef}>
            <div className="p-6">
              {selectedModule && (
                <div className="max-w-3xl mx-auto space-y-6">
                  {/* Module Header */}
                  <div>
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

                  {/* Content Access Prompt - Opens modals/videos for all module types */}
                  <Card className="border-dashed border-2 border-muted-foreground/30">
                    <CardContent className="p-6 text-center">
                      <div className="p-3 rounded-full bg-muted inline-block mb-3">
                        {selectedModule.type === 'video' ? (
                          <Play className="h-6 w-6 text-muted-foreground" />
                        ) : selectedModule.type === 'document' ? (
                          <FileText className="h-6 w-6 text-muted-foreground" />
                        ) : (
                          <BookOpen className="h-6 w-6 text-muted-foreground" />
                        )}
                      </div>
                      <h3 className="font-medium mb-1">View {selectedModule.type.charAt(0).toUpperCase() + selectedModule.type.slice(1)} Content</h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        Click the badge on the left sidebar or the button below to view the lesson materials.
                      </p>
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          if (selectedModule.type === 'video') {
                            setVideoModalOpen(true);
                          } else {
                            setContentModalModule(selectedModule);
                            setContentModalOpen(true);
                          }
                        }}
                        className="gap-2"
                      >
                        {selectedModule.type === 'video' ? <Play className="h-4 w-4" /> : <BookOpen className="h-4 w-4" />}
                        Open {selectedModule.type === 'video' ? 'Video' : 'Content'}
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Practice Task - Show for all non-video modules */}
                  {selectedModule.type !== 'video' && (
                    <Card className="border-primary/30">
                      <CardHeader className="pb-3 bg-primary/5">
                        <CardTitle className="text-base flex items-center gap-2">
                          <Sparkles className="h-4 w-4 text-primary" />
                          Practice Task: {selectedModule.content.practiceTask.title}
                        </CardTitle>
                        <CardDescription>
                          {selectedModule.content.practiceTask.instructions}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pt-4 space-y-4">
                        {/* Scenario */}
                        <div className="bg-blue-500/5 border border-blue-500/20 p-4 rounded-lg">
                          <h4 className="font-medium text-sm text-blue-600 mb-2 flex items-center gap-2">
                            <AlertCircle className="h-4 w-4" />
                            Scenario
                          </h4>
                          <p className="text-sm whitespace-pre-wrap">{selectedModule.content.practiceTask.scenario}</p>
                        </div>

                        {/* Hints */}
                        <div>
                          <h4 className="font-medium text-sm mb-2">Hints:</h4>
                          <ul className="space-y-1">
                            {selectedModule.content.practiceTask.hints.map((hint, idx) => (
                              <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                                <Lightbulb className="h-4 w-4 text-yellow-500 shrink-0 mt-0.5" />
                                {hint}
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Input Area */}
                        <div>
                          <label className="text-sm font-medium mb-2 block">Your Response:</label>
                          <Textarea
                            value={practiceInput}
                            onChange={(e) => setPracticeInput(e.target.value)}
                            placeholder="Write your prompt or response here based on the scenario above..."
                            className="min-h-[150px]"
                          />
                        </div>
                        
                        <Button 
                          onClick={handlePracticeSubmit} 
                          disabled={isPracticeLoading || !practiceInput.trim()}
                          className="gap-2"
                        >
                          {isPracticeLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Send className="h-4 w-4" />
                          )}
                          Submit for Review
                        </Button>

                        {/* Practice Response */}
                        {practiceResponse && (
                          <div className="border-t pt-4 mt-4">
                            <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                              <Sparkles className="h-4 w-4 text-primary" />
                              AI Feedback
                            </h4>
                            <div className="bg-muted/50 p-4 rounded-lg overflow-x-auto">
                              <div className="prose prose-sm max-w-none dark:prose-invert [&>h1]:text-lg [&>h1]:font-bold [&>h1]:mt-4 [&>h1]:mb-2 [&>h2]:text-base [&>h2]:font-semibold [&>h2]:mt-3 [&>h2]:mb-2 [&>h3]:text-sm [&>h3]:font-semibold [&>h3]:mt-3 [&>h3]:mb-1 [&>p]:mb-2 [&>ul]:my-2 [&>ul]:pl-4 [&>ol]:my-2 [&>ol]:pl-4 [&>li]:mb-1 [&>table]:w-full [&>table]:border-collapse [&>table]:my-3 [&_th]:border [&_th]:border-border [&_th]:px-3 [&_th]:py-2 [&_th]:bg-muted [&_th]:text-left [&_th]:font-semibold [&_th]:text-sm [&_td]:border [&_td]:border-border [&_td]:px-3 [&_td]:py-2 [&_td]:text-sm">
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>{practiceResponse}</ReactMarkdown>
                              </div>
                            </div>
                            
                            {moduleCompleted && (
                              <div className="mt-4 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                                <div className="flex items-center gap-2 text-green-600 font-medium">
                                  <CheckCircle className="h-5 w-5" />
                                  Practice Completed!
                                </div>
                                <p className="text-sm text-muted-foreground mt-1">
                                  Ask Andrea on the right for detailed feedback, or continue to the next module.
                                </p>
                                {(() => {
                                  const currentIndex = session.modules.findIndex(m => m.id === selectedModule?.id);
                                  const nextModule = session.modules[currentIndex + 1];
                                  
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

                                  return nextModule ? (
                                    <Button 
                                      onClick={() => setSelectedModule(nextModule)}
                                      className="mt-3 gap-2"
                                    >
                                      Continue to Next Module
                                      <ChevronRight className="h-4 w-4" />
                                    </Button>
                                  ) : (
                                    <Button 
                                      onClick={handleCompleteSession}
                                      className="mt-3 gap-2"
                                    >
                                      Complete Session
                                      <CheckCircle className="h-4 w-4" />
                                    </Button>
                                  );
                                })()}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Success Criteria */}
                        <div className="border-t pt-4">
                          <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                            <Target className="h-4 w-4 text-primary" />
                            Success Criteria
                          </h4>
                          <ul className="space-y-1">
                            {selectedModule.content.practiceTask.successCriteria.map((criteria, idx) => (
                              <li key={idx} className="flex items-start gap-2 text-sm">
                                <CheckCircle className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                                {criteria}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Right Column - Andrea AI Coach */}
        <div className={`border-l bg-card transition-all duration-300 flex flex-col ${rightCollapsed ? 'w-12' : 'w-96'}`}>
          <div className="p-3 border-b flex items-center justify-between shrink-0">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setRightCollapsed(!rightCollapsed)}
            >
              {rightCollapsed ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </Button>
            {!rightCollapsed && (
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={andreaCoach} alt="Andrea" />
                  <AvatarFallback>A</AvatarFallback>
                </Avatar>
                <span className="font-medium text-sm">Andrea - AI Coach</span>
              </div>
            )}
          </div>
          
          {!rightCollapsed && (
            <>
              <ScrollArea className="flex-1">
                <div className="p-3 space-y-3">
                  {trainerMessages.map((message, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-lg ${
                        message.role === 'assistant'
                          ? 'bg-muted'
                          : 'bg-primary text-primary-foreground ml-4'
                      }`}
                    >
                      {message.role === 'assistant' && (
                        <div className="flex items-center gap-2 mb-2">
                          <Avatar className="h-5 w-5">
                            <AvatarImage src={andreaCoach} alt="Andrea" />
                            <AvatarFallback>A</AvatarFallback>
                          </Avatar>
                          <span className="text-xs font-medium text-muted-foreground">Andrea</span>
                        </div>
                      )}
                      <div className={`prose prose-sm max-w-none ${message.role === 'assistant' ? 'dark:prose-invert' : ''} [&>h1]:text-base [&>h1]:font-bold [&>h1]:mt-3 [&>h1]:mb-2 [&>h2]:text-sm [&>h2]:font-semibold [&>h2]:mt-2 [&>h2]:mb-1 [&>h3]:text-sm [&>h3]:font-semibold [&>h3]:mt-2 [&>h3]:mb-1 [&>p]:mb-2 [&>p]:text-sm [&>ul]:my-2 [&>ul]:pl-4 [&>ol]:my-2 [&>ol]:pl-4 [&>li]:mb-1 [&>li]:text-sm [&>table]:w-full [&>table]:border-collapse [&>table]:my-2 [&_th]:border [&_th]:border-border [&_th]:px-2 [&_th]:py-1 [&_th]:bg-muted [&_th]:text-left [&_th]:font-semibold [&_th]:text-xs [&_td]:border [&_td]:border-border [&_td]:px-2 [&_td]:py-1 [&_td]:text-xs`}>
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
                      </div>
                    </div>
                  ))}
                  {isTrainerLoading && (
                    <div className="p-3 rounded-lg bg-muted flex items-center gap-2">
                      <Avatar className="h-5 w-5">
                        <AvatarImage src={andreaCoach} alt="Andrea" />
                        <AvatarFallback>A</AvatarFallback>
                      </Avatar>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm text-muted-foreground">Thinking...</span>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>
              
              {/* Quick Actions */}
              <div className="px-3 py-2 border-t bg-muted/30">
                <div className="flex flex-wrap gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs h-7"
                    onClick={() => setTrainerInput('Can you review my practice work?')}
                  >
                    Review my work
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs h-7"
                    onClick={() => setTrainerInput('Show me an example')}
                  >
                    Show example
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs h-7"
                    onClick={() => setTrainerInput('I need a hint')}
                  >
                    Get hint
                  </Button>
                </div>
              </div>

              {/* Andrea Avatar & Input Section */}
              <div className="p-3 border-t shrink-0 bg-gradient-to-t from-muted/50 to-transparent">
                <div className="flex gap-3 items-end">
                  <div className="shrink-0">
                    <Avatar className="h-16 w-16 border-2 border-primary/20 shadow-lg">
                      <AvatarImage src={andreaCoach} alt="Andrea" className="object-cover" />
                      <AvatarFallback className="text-lg">A</AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="flex-1 flex flex-col gap-2">
                    <Textarea
                      value={trainerInput}
                      onChange={(e) => setTrainerInput(e.target.value)}
                      placeholder="Ask Andrea for help..."
                      className="min-h-[50px] resize-none text-sm"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleTrainerSubmit();
                        }
                      }}
                    />
                    <Button 
                      size="sm"
                      onClick={handleTrainerSubmit}
                      disabled={isTrainerLoading || !trainerInput.trim()}
                      className="gap-2 self-end"
                    >
                      <Send className="h-3 w-3" />
                      Ask Andrea
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Module Content Modal */}
      <ModuleContentModal
        module={contentModalModule}
        open={contentModalOpen}
        onOpenChange={setContentModalOpen}
      />

      {/* Video Modal for Introduction */}
      <VideoModal
        open={videoModalOpen}
        onOpenChange={setVideoModalOpen}
        videoUrl="https://youtu.be/xZ1FAm7IoA4"
        title="Introduction to AI Prompting"
      />
    </div>
  );
}
