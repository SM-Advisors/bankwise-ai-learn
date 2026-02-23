import { useState, useRef, useEffect } from 'react';
import { Lightbulb, Send, Loader2, Sparkles, Bookmark, Users, TrendingUp, X, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useDashboardConversations } from '@/hooks/useDashboardConversations';
import { useUserIdeas } from '@/hooks/useUserIdeas';
import { useCommunityTopics } from '@/hooks/useCommunityTopics';
import andreaCoach from '@/assets/andrea-coach.png';

type Phase = 'input' | 'chat';
type SubmitMode = null | 'ideas' | 'community' | 'csuite';
type LocalMessage = { role: 'user' | 'assistant'; content: string };

export function BrainstormPanel() {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [phase, setPhase] = useState<Phase>('input');
  const [taskInput, setTaskInput] = useState('');
  const [chatInput, setChatInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [localMessages, setLocalMessages] = useState<LocalMessage[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);

  // Submission form state
  const [submitMode, setSubmitMode] = useState<SubmitMode>(null);
  const [submitTitle, setSubmitTitle] = useState('');
  const [submitDescription, setSubmitDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { createConversation, appendMessage } = useDashboardConversations();
  const { createIdea } = useUserIdeas();
  const { createTopic } = useCommunityTopics();

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [localMessages, isLoading]);

  const handleOpen = () => {
    setPhase('input');
    setTaskInput('');
    setLocalMessages([]);
    setActiveConvId(null);
    setSubmitMode(null);
    setOpen(true);
  };

  const openSubmitForm = (mode: SubmitMode) => {
    const firstUserMsg = localMessages.find(m => m.role === 'user')?.content || '';
    setSubmitTitle(firstUserMsg.length > 80 ? firstUserMsg.slice(0, 77) + '...' : firstUserMsg);
    setSubmitDescription(firstUserMsg);
    setSubmitMode(mode);
  };

  const handleSubmitIdea = async () => {
    if (!submitTitle.trim() || !user) return;
    setIsSubmitting(true);
    try {
      if (submitMode === 'ideas') {
        const result = await createIdea({
          title: submitTitle.trim(),
          description: submitDescription.trim(),
          status: 'not_started',
        });
        if (!result?.success) throw new Error('Failed');
        toast({ title: 'Saved to My Ideas', description: 'Find it on your Ideas page.' });

      } else if (submitMode === 'community') {
        const result = await createTopic(submitTitle.trim(), submitDescription.trim(), 'idea');
        if (!result?.success) throw new Error('Failed');
        toast({ title: 'Posted to Community Hub', description: 'Others can now see and discuss your idea.' });

      } else if (submitMode === 'csuite') {
        const { error } = await (supabase
          .from('user_ideas' as any)
          .insert({
            user_id: user.id,
            title: submitTitle.trim(),
            description: submitDescription.trim(),
            status: 'not_started',
            category: 'csuite_submission',
            submitter_name: profile?.display_name || null,
            submitter_department: profile?.line_of_business || null,
          }) as any);
        if (error) throw error;
        toast({ title: 'Sent to C-Suite', description: 'Your idea is now in the Innovation Pipeline.' });
      }

      setSubmitMode(null);
      setSubmitTitle('');
      setSubmitDescription('');
    } catch {
      toast({ title: 'Failed to submit', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const sendToAndrea = async (content: string, history: LocalMessage[]) => {
    setIsLoading(true);
    const userMsg = { role: 'user' as const, content };

    let convId = activeConvId;
    if (!convId) {
      convId = await createConversation(userMsg);
      setActiveConvId(convId);
    } else {
      await appendMessage(userMsg, convId);
    }

    try {
      // Determine initial task (first user message in the conversation)
      const initialTask = history.find(m => m.role === 'user')?.content || content;

      const brainstormPersona = `You are Andrea, a helpful AI coach running a brainstorm session. Your goal is to help the user discover practical, specific ways AI can assist their work or projects.

BRAINSTORM COACHING RULES:
- FIRST response only: ask 1-2 focused probing questions to better understand the task before suggesting anything. Do NOT jump straight to suggestions.
- SUBSEQUENT responses: offer concrete AI applications scaled to the user's context — simple prompts, reusable templates, or multi-step workflows.
- Frame ideas as possibilities: "What if you..." or "You could write a prompt that..." or "A quick template for this would be..."
- Keep each idea to 1-2 sentences. No long bullet lists.
- After suggesting, ask what resonates or what they want to explore further.
- Do NOT reference any training curriculum, frameworks (CLEAR, VERIFY), or module content.
- For users with personal interests (non-banking): ground all examples in those interests, not banking.`;

      const isFF = !(profile?.line_of_business) && !!(profile as any)?.interests?.length;

      const { data, error } = await supabase.functions.invoke('ai-practice', {
        body: {
          customSystemPrompt: brainstormPersona,
          moduleTitle: 'AI Brainstorm',
          scenario: initialTask,
          messages: [...history, userMsg],
          bankRole: profile?.bank_role || undefined,
          lineOfBusiness: isFF ? undefined : (profile?.line_of_business || undefined),
          interests: (profile as any)?.interests || undefined,
        },
      });

      if (error) throw error;

      const reply = data?.reply || "Let me think about that...";
      const assistantMsg: LocalMessage = { role: 'assistant', content: reply };
      setLocalMessages(prev => [...prev, assistantMsg]);

      if (convId) {
        await appendMessage({ role: 'assistant', content: reply }, convId);
      }
    } catch (err) {
      console.error('Brainstorm chat error:', err);
      setLocalMessages(prev => [...prev, {
        role: 'assistant',
        content: "I'm having a brief connection issue. Please try again.",
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartBrainstorming = async () => {
    if (!taskInput.trim()) return;
    const content = taskInput.trim();
    const userMsg: LocalMessage = { role: 'user', content };
    setLocalMessages([userMsg]);
    setPhase('chat');
    await sendToAndrea(content, []);
  };

  const handleChatSend = async () => {
    if (!chatInput.trim() || isLoading) return;
    const content = chatInput.trim();
    setChatInput('');
    const userMsg: LocalMessage = { role: 'user', content };
    const history = [...localMessages];
    setLocalMessages(prev => [...prev, userMsg]);
    await sendToAndrea(content, history);
  };

  // Show action bar after at least one full exchange (user + assistant)
  const hasExchange = localMessages.some(m => m.role === 'assistant');

  const submitModeConfig = {
    ideas: { label: 'Save to My Ideas', icon: Bookmark, color: 'text-blue-600' },
    community: { label: 'Post to Community Hub', icon: Users, color: 'text-purple-600' },
    csuite: { label: 'Send to C-Suite', icon: TrendingUp, color: 'text-orange-600' },
  };

  return (
    <>
      {/* Trigger Card */}
      <button
        data-tour="brainstorm-btn"
        onClick={handleOpen}
        className="group relative flex flex-col items-center justify-center gap-2 w-full h-full min-h-[120px] rounded-xl border bg-card hover:shadow-md transition-all cursor-pointer p-3 text-center shadow-sm"
      >
        <div className="p-2 rounded-full bg-amber-100 dark:bg-amber-900/30 group-hover:bg-amber-200 dark:group-hover:bg-amber-800/40 transition-colors">
          <Lightbulb className="h-5 w-5 text-amber-500 drop-shadow-[0_0_6px_rgba(234,179,8,0.6)] group-hover:drop-shadow-[0_0_10px_rgba(234,179,8,0.8)] group-hover:scale-110 transition-all" />
        </div>
        <div>
          <p className="font-semibold text-foreground text-xs">AI Brainstorm</p>
          <p className="text-[10px] text-muted-foreground mt-0.5 leading-snug max-w-[120px] mx-auto">
            Explore how AI can help with any task
          </p>
        </div>
      </button>

      {/* Brainstorm Sheet */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="w-[420px] sm:w-[420px] flex flex-col p-0">
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3 border-b bg-primary text-primary-foreground shrink-0">
            <img
              src={andreaCoach}
              alt="Andrea"
              className="h-10 w-10 rounded-full object-cover border-2 border-primary-foreground/30"
            />
            <div>
              <SheetTitle className="text-primary-foreground text-sm font-semibold leading-none">
                AI Brainstorm
              </SheetTitle>
              <p className="text-xs text-primary-foreground/80 mt-0.5">with Andrea — your AI coach</p>
            </div>
          </div>

          {phase === 'input' ? (
            /* Phase 1: Task description */
            <div className="flex-1 flex flex-col justify-center p-6 gap-4">
              <div className="text-center">
                <div className="p-3 rounded-full bg-primary/10 inline-flex mb-3">
                  <Lightbulb className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-base">What are you working on?</h3>
                <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                  Describe a task or process and Andrea will explore how AI can help — adapted to your experience level.
                </p>
              </div>
              <Textarea
                value={taskInput}
                onChange={(e) => setTaskInput(e.target.value)}
                placeholder="e.g. I review loan applications and summarize them for the credit committee each week..."
                className="min-h-[120px] resize-none"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleStartBrainstorming();
                }}
              />
              <Button
                onClick={handleStartBrainstorming}
                disabled={!taskInput.trim() || isLoading}
                className="w-full gap-2"
              >
                {isLoading ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Connecting to Andrea...</>
                ) : (
                  <><Sparkles className="h-4 w-4" /> Start Brainstorming</>
                )}
              </Button>
            </div>
          ) : (
            /* Phase 2: Chat */
            <>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {localMessages.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-[85%] rounded-xl px-3 py-2 text-sm leading-relaxed whitespace-pre-wrap ${
                        msg.role === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-foreground'
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-muted rounded-xl px-3 py-2.5">
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Save idea action bar — shown after first exchange */}
              {hasExchange && !submitMode && (
                <div className="border-t px-3 py-2 flex items-center gap-1.5 bg-muted/30 shrink-0">
                  <span className="text-[10px] text-muted-foreground mr-1 shrink-0">Drop idea to:</span>
                  <button
                    onClick={() => openSubmitForm('ideas')}
                    className="flex items-center gap-1 text-[10px] font-medium text-blue-600 hover:bg-blue-50 px-2 py-1 rounded-md transition-colors"
                  >
                    <Bookmark className="h-3 w-3" /> My Ideas
                  </button>
                  <button
                    onClick={() => openSubmitForm('community')}
                    className="flex items-center gap-1 text-[10px] font-medium text-purple-600 hover:bg-purple-50 px-2 py-1 rounded-md transition-colors"
                  >
                    <Users className="h-3 w-3" /> Community
                  </button>
                  <button
                    onClick={() => openSubmitForm('csuite')}
                    className="flex items-center gap-1 text-[10px] font-medium text-orange-600 hover:bg-orange-50 px-2 py-1 rounded-md transition-colors"
                  >
                    <TrendingUp className="h-3 w-3" /> C-Suite
                  </button>
                </div>
              )}

              {/* Inline submission form */}
              {submitMode && (
                <div className="border-t p-3 space-y-2 bg-muted/20 shrink-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold flex items-center gap-1.5">
                      {submitMode === 'ideas' && <><Bookmark className="h-3.5 w-3.5 text-blue-600" /> Save to My Ideas</>}
                      {submitMode === 'community' && <><Users className="h-3.5 w-3.5 text-purple-600" /> Post to Community Hub</>}
                      {submitMode === 'csuite' && <><TrendingUp className="h-3.5 w-3.5 text-orange-600" /> Send to C-Suite</>}
                    </span>
                    <button onClick={() => setSubmitMode(null)} className="text-muted-foreground hover:text-foreground">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <Input
                    value={submitTitle}
                    onChange={(e) => setSubmitTitle(e.target.value)}
                    placeholder="Title"
                    className="text-sm h-8"
                  />
                  <Textarea
                    value={submitDescription}
                    onChange={(e) => setSubmitDescription(e.target.value)}
                    placeholder="Description (optional)"
                    className="text-sm min-h-[60px] resize-none"
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={handleSubmitIdea}
                      disabled={!submitTitle.trim() || isSubmitting}
                      className="flex-1 gap-1.5 h-8 text-xs"
                    >
                      {isSubmitting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
                      Submit
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setSubmitMode(null)} className="h-8 text-xs">
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              {/* Chat input bar — hidden when submit form is open */}
              {!submitMode && (
                <div className="border-t p-3 flex gap-2 shrink-0">
                  <Textarea
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Ask Andrea anything..."
                    className="min-h-[40px] max-h-[120px] resize-none text-sm py-2"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleChatSend();
                      }
                    }}
                  />
                  <Button
                    size="icon"
                    onClick={handleChatSend}
                    disabled={!chatInput.trim() || isLoading}
                    className="shrink-0 self-end h-9 w-9"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
