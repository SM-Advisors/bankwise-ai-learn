import { useState, useRef, useEffect } from 'react';
import { Lightbulb, Send, Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useDashboardConversations } from '@/hooks/useDashboardConversations';
import andreaCoach from '@/assets/andrea-coach.png';

type Phase = 'input' | 'chat';
type LocalMessage = { role: 'user' | 'assistant'; content: string };

export function BrainstormPanel() {
  const { profile } = useAuth();
  const [open, setOpen] = useState(false);
  const [phase, setPhase] = useState<Phase>('input');
  const [taskInput, setTaskInput] = useState('');
  const [chatInput, setChatInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [localMessages, setLocalMessages] = useState<LocalMessage[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { createConversation, appendMessage } = useDashboardConversations();

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
    setOpen(true);
  };

  const sendToAndrea = async (content: string, history: LocalMessage[]) => {
    setIsLoading(true);
    const userMsg = { role: 'user' as const, content };

    // Persist user message to DB
    let convId = activeConvId;
    if (!convId) {
      convId = await createConversation(userMsg);
      setActiveConvId(convId);
    } else {
      await appendMessage(userMsg, convId);
    }

    try {
      const { data, error } = await supabase.functions.invoke('trainer_chat', {
        body: {
          lessonId: 'brainstorm',
          messages: [...history, userMsg],
          learnerState: {
            displayName: profile?.display_name || undefined,
            bankRole: profile?.bank_role || undefined,
            lineOfBusiness: profile?.line_of_business || undefined,
            interests: (profile as any)?.interests || undefined,
          },
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

  return (
    <>
      {/* Trigger Card — styled as a session card grid cell */}
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

              {/* Input bar */}
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
            </>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
