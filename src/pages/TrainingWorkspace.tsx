import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Loader2, ArrowLeft, ChevronLeft, ChevronRight, Send, 
  Play, FileText, Video, BookOpen, CheckCircle, Sparkles,
  MessageSquare, Lightbulb, ChevronDown
} from 'lucide-react';

interface TrainingModule {
  id: string;
  title: string;
  type: 'video' | 'document' | 'example' | 'exercise';
  description: string;
  content?: string;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const SESSION_CONTENT: Record<number, { title: string; description: string; modules: TrainingModule[] }> = {
  1: {
    title: 'AI Prompting & Personalization',
    description: 'Master the fundamentals of effective AI prompting',
    modules: [
      { id: '1-1', title: 'Introduction to AI Prompting', type: 'video', description: 'Learn the basics of communicating with AI' },
      { id: '1-2', title: 'Prompt Structure Best Practices', type: 'document', description: 'Reference guide for crafting effective prompts' },
      { id: '1-3', title: 'Good vs Bad Prompts', type: 'example', description: 'Compare examples of effective and ineffective prompts' },
      { id: '1-4', title: 'Context Setting Techniques', type: 'document', description: 'How to provide context for better AI responses' },
      { id: '1-5', title: 'Practice: Write Your First Prompt', type: 'exercise', description: 'Hands-on exercise to apply what you\'ve learned' },
    ],
  },
  2: {
    title: 'Building Your AI Agent',
    description: 'Create a custom AI agent for your role',
    modules: [
      { id: '2-1', title: 'What is an AI Agent?', type: 'video', description: 'Understanding AI agents and their capabilities' },
      { id: '2-2', title: 'Agent Architecture Overview', type: 'document', description: 'Components of an effective AI agent' },
      { id: '2-3', title: 'Custom Instructions Template', type: 'example', description: 'Template for configuring your agent' },
      { id: '2-4', title: 'Tool Integration Guide', type: 'document', description: 'Connect your agent to external tools' },
      { id: '2-5', title: 'Build Your Agent', type: 'exercise', description: 'Create and test your personalized AI agent' },
    ],
  },
  3: {
    title: 'Role-Specific Training',
    description: 'AI applications for your department',
    modules: [
      { id: '3-1', title: 'Department AI Use Cases', type: 'video', description: 'Common AI applications in your role' },
      { id: '3-2', title: 'Compliance & AI', type: 'document', description: 'Ensuring compliant AI usage' },
      { id: '3-3', title: 'Workflow Examples', type: 'example', description: 'Real-world AI workflow examples' },
      { id: '3-4', title: 'Advanced Techniques', type: 'document', description: 'Power user tips and techniques' },
      { id: '3-5', title: 'Capstone Project', type: 'exercise', description: 'Apply your learning to a real task' },
    ],
  },
};

export default function TrainingWorkspace() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const { user, profile, loading } = useAuth();
  const { toast } = useToast();

  const [leftCollapsed, setLeftCollapsed] = useState(false);
  const [rightCollapsed, setRightCollapsed] = useState(false);
  const [selectedModule, setSelectedModule] = useState<TrainingModule | null>(null);
  const [practiceInput, setPracticeInput] = useState('');
  const [trainerMessages, setTrainerMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Welcome! I\'m your AI Training Coach. I\'ll guide you through this session, provide feedback on your work, and answer any questions. What would you like to start with?' }
  ]);
  const [trainerInput, setTrainerInput] = useState('');
  const [isTrainerLoading, setIsTrainerLoading] = useState(false);
  const [practiceResponse, setPracticeResponse] = useState('');
  const [isPracticeLoading, setIsPracticeLoading] = useState(false);

  const session = sessionId ? SESSION_CONTENT[parseInt(sessionId)] : null;

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

  const getModuleIcon = (type: TrainingModule['type']) => {
    switch (type) {
      case 'video': return Video;
      case 'document': return FileText;
      case 'example': return Lightbulb;
      case 'exercise': return Play;
      default: return BookOpen;
    }
  };

  const handlePracticeSubmit = async () => {
    if (!practiceInput.trim()) return;

    setIsPracticeLoading(true);
    try {
      const response = await supabase.functions.invoke('ai-practice', {
        body: {
          prompt: practiceInput,
          context: {
            sessionId,
            moduleId: selectedModule?.id,
            learningStyle: profile.learning_style,
            proficiencyLevel: profile.ai_proficiency_level,
          },
        },
      });

      if (response.error) throw response.error;
      setPracticeResponse(response.data?.response || 'AI response generated successfully.');
    } catch (error) {
      console.error('Practice error:', error);
      // Fallback response for demo
      setPracticeResponse(`Great prompt! Here's a simulated response based on your input:\n\n"${practiceInput}"\n\nThis is a demonstration of how the AI would respond to your prompt. In production, this would connect to the Lovable AI for real responses.`);
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
      const response = await supabase.functions.invoke('ai-trainer', {
        body: {
          messages: [...trainerMessages, userMessage],
          context: {
            sessionId,
            moduleId: selectedModule?.id,
            learningStyle: profile.learning_style,
            proficiencyLevel: profile.ai_proficiency_level,
            lineOfBusiness: profile.line_of_business,
          },
        },
      });

      if (response.error) throw response.error;
      
      const assistantMessage: Message = { 
        role: 'assistant', 
        content: response.data?.response || 'I\'m here to help you with your training. What questions do you have?' 
      };
      setTrainerMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Trainer error:', error);
      // Fallback response
      const assistantMessage: Message = { 
        role: 'assistant', 
        content: `That's a great question! Based on your ${profile.learning_style} learning style and current module on "${selectedModule?.title}", I'd suggest focusing on practical examples. Would you like me to provide a specific example related to your role in ${profile.line_of_business?.replace('_', ' ')}?`
      };
      setTrainerMessages(prev => [...prev, assistantMessage]);
    } finally {
      setIsTrainerLoading(false);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-background">
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
        <div className="flex items-center gap-2">
          <Badge variant="secondary">{profile.learning_style}</Badge>
          <Badge variant="outline">Level {profile.ai_proficiency_level}</Badge>
        </div>
      </header>

      {/* Main Content - 3 Column Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Column - Training Content */}
        <div className={`border-r bg-card transition-all duration-300 flex flex-col ${leftCollapsed ? 'w-12' : 'w-80'}`}>
          <div className="p-3 border-b flex items-center justify-between shrink-0">
            {!leftCollapsed && <span className="font-medium text-sm">Training Content</span>}
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
                {session.modules.map((module) => {
                  const IconComponent = getModuleIcon(module.type);
                  const isSelected = selectedModule?.id === module.id;
                  
                  return (
                    <Card
                      key={module.id}
                      className={`cursor-pointer transition-all ${
                        isSelected ? 'ring-2 ring-primary' : 'hover:bg-muted/50'
                      }`}
                      onClick={() => setSelectedModule(module)}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-lg shrink-0 ${
                            isSelected ? 'bg-primary/10 text-primary' : 'bg-muted'
                          }`}>
                            <IconComponent className="h-4 w-4" />
                          </div>
                          <div className="min-w-0">
                            <div className="font-medium text-sm truncate">{module.title}</div>
                            <div className="text-xs text-muted-foreground line-clamp-2">
                              {module.description}
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

        {/* Middle Column - Practice Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="p-4 border-b shrink-0">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <h2 className="font-semibold">AI Practice Area</h2>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {selectedModule ? `Practice: ${selectedModule.title}` : 'Select a module to begin practicing'}
            </p>
          </div>
          
          <div className="flex-1 p-4 overflow-auto">
            {selectedModule && (
              <div className="space-y-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">{selectedModule.title}</CardTitle>
                    <CardDescription>{selectedModule.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">Your Input</label>
                        <Textarea
                          value={practiceInput}
                          onChange={(e) => setPracticeInput(e.target.value)}
                          placeholder="Enter your prompt or response here..."
                          className="min-h-[120px]"
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
                        Submit
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {practiceResponse && (
                  <Card className="border-primary/20 bg-primary/5">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-primary" />
                        AI Response
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="prose prose-sm max-w-none">
                        <pre className="whitespace-pre-wrap text-sm font-sans">{practiceResponse}</pre>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Column - AI Trainer */}
        <div className={`border-l bg-card transition-all duration-300 flex flex-col ${rightCollapsed ? 'w-12' : 'w-80'}`}>
          <div className="p-3 border-b flex items-center justify-between shrink-0">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setRightCollapsed(!rightCollapsed)}
            >
              {rightCollapsed ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </Button>
            {!rightCollapsed && <span className="font-medium text-sm">AI Trainer</span>}
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
                      <p className="text-sm">{message.content}</p>
                    </div>
                  ))}
                  {isTrainerLoading && (
                    <div className="p-3 rounded-lg bg-muted">
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </div>
                  )}
                </div>
              </ScrollArea>
              
              <div className="p-3 border-t shrink-0">
                <div className="flex gap-2">
                  <Textarea
                    value={trainerInput}
                    onChange={(e) => setTrainerInput(e.target.value)}
                    placeholder="Ask your trainer..."
                    className="min-h-[60px] resize-none"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleTrainerSubmit();
                      }
                    }}
                  />
                  <Button 
                    size="icon" 
                    onClick={handleTrainerSubmit}
                    disabled={isTrainerLoading || !trainerInput.trim()}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
