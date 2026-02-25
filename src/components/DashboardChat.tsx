import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { X, Send, Loader2, Clock, Plus } from 'lucide-react';
import andreaCoach from '@/assets/andrea-coach.png';
import andreaCoach2 from '@/assets/andrea-coach2.png';
import { useDashboardConversations } from '@/hooks/useDashboardConversations';
import type { DashboardMessage } from '@/hooks/useDashboardConversations';

interface DashboardChatProps {
  profile: {
    display_name: string | null;
    job_role: string | null;
    department: string | null;
    ai_proficiency_level: number | null;
    employer_name: string | null;
  };
  progress: {
    session_1_completed: boolean;
    session_2_completed: boolean;
    session_3_completed: boolean;
  } | null;
  /** When true, programmatically opens the chat panel (e.g. for a guided tour) */
  forceOpen?: boolean;
}

const DEFAULT_SUGGESTIONS = [
  'Where should I start?',
  'What module covers compliance?',
  'What should I work on next?',
];

export function DashboardChat({ profile, progress, forceOpen }: DashboardChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [hasBeenOpened, setHasBeenOpened] = useState(false);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestedPrompts, setSuggestedPrompts] = useState<string[]>(DEFAULT_SUGGESTIONS);
  const [view, setView] = useState<'chat' | 'history'>('chat');
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Open programmatically when a tour is running
  useEffect(() => {
    if (forceOpen) {
      setIsOpen(true);
      setHasBeenOpened(true);
    }
  }, [forceOpen]);

  // Close when clicking outside the chat panel (disabled during guided tour)
  useEffect(() => {
    if (!isOpen || forceOpen) return;
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen, forceOpen]);

  const {
    conversations,
    activeConversationId,
    activeMessages,
    createConversation,
    appendMessage,
    startNewChat,
    selectConversation,
  } = useDashboardConversations();

  // Scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [activeMessages, isLoading]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Reset suggested prompts when active conversation changes
  useEffect(() => {
    if (activeMessages.length === 0) {
      setSuggestedPrompts(DEFAULT_SUGGESTIONS);
    }
  }, [activeConversationId, activeMessages.length]);

  const handleOpen = () => {
    setIsOpen(true);
    setHasBeenOpened(true);
  };

  const formatRelativeTime = (dateStr: string) => {
    const now = new Date();
    const date = new Date(dateStr);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const buildLearnerState = () => {
    const completedModules: string[] = [];
    if (progress?.session_1_completed) completedModules.push('Session 1: AI Prompting & Personalization');
    if (progress?.session_2_completed) completedModules.push('Session 2: Building Your AI Agent');
    if (progress?.session_3_completed) completedModules.push('Session 3: Role-Specific Training');

    let progressSummary = `${completedModules.length}/3 sessions completed`;
    if (completedModules.length === 0) {
      progressSummary = 'Just getting started - no sessions completed yet';
    } else if (completedModules.length === 3) {
      progressSummary = 'All 3 sessions completed!';
    }

    return {
      displayName: profile.display_name || undefined,
      jobRole: profile.job_role || undefined,
      departmentLob: profile.department || undefined,
      completedModules,
      progressSummary,
    };
  };

  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;

    const userMessage: DashboardMessage = { role: 'user', content: content.trim() };
    const messagesForApi = [...activeMessages, userMessage];
    setInput('');
    setSuggestedPrompts([]);
    setIsLoading(true);

    // Declare outside try so catch can show an error message even on the first message
    let convId: string | null = activeConversationId;

    try {
      if (!convId) {
        // No active conversation - create one with the first message
        convId = await createConversation(userMessage);
        if (!convId) throw new Error('Failed to create conversation');
      } else {
        // Existing conversation - append user message
        await appendMessage(userMessage);
      }

      // Call trainer_chat
      const { data, error } = await supabase.functions.invoke('trainer_chat', {
        body: {
          lessonId: 'dashboard',
          messages: messagesForApi,
          learnerState: buildLearnerState(),
        },
      });

      if (error) throw error;

      const assistantMessage: DashboardMessage = {
        role: 'assistant',
        content: data?.reply || "I'm here to help! What would you like to know about your training?",
      };

      await appendMessage(assistantMessage, convId);

      if (data?.suggestedPrompts && Array.isArray(data.suggestedPrompts) && data.suggestedPrompts.length > 0) {
        setSuggestedPrompts(data.suggestedPrompts);
      } else {
        setSuggestedPrompts([]);
      }
    } catch (err) {
      console.error('Dashboard chat error:', err);
      const errorMessage: DashboardMessage = {
        role: 'assistant',
        content: "Sorry, I'm having trouble connecting right now. Please try again in a moment.",
      };
      // Use local convId (not stale state) so errors are visible even on the first message
      if (convId) {
        await appendMessage(errorMessage, convId);
      }
      setSuggestedPrompts(DEFAULT_SUGGESTIONS);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleSuggestionClick = (suggestion: string) => {
    sendMessage(suggestion);
  };

  const handleNewChat = () => {
    startNewChat();
    setView('chat');
    setSuggestedPrompts(DEFAULT_SUGGESTIONS);
  };

  const handleSelectConversation = (conversationId: string) => {
    selectConversation(conversationId);
    setView('chat');
  };

  // Collapsed state - floating bubble
  if (!isOpen) {
    return (
      <button
        data-tour="andrea-bubble"
        onClick={handleOpen}
        className="fixed bottom-6 right-6 z-[9999] h-24 w-24 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105 overflow-hidden border-2 border-primary/30 bg-white"
        aria-label="Chat with Andrea"
      >
        <img src={andreaCoach} alt="Andrea" className="h-full w-full object-cover" />
      </button>
    );
  }

  // Expanded state - chat panel
  return (
    <div ref={panelRef} className="fixed bottom-6 right-6 z-[9999] w-[400px] h-[500px] flex flex-col">
      <Card className="flex flex-col h-full shadow-xl border">
        {/* Header */}
        <div data-tour="andrea-panel-header" className="flex items-center justify-between px-4 py-3 border-b bg-primary text-primary-foreground rounded-t-lg">
          <div className="flex items-center gap-2">
            <img src={andreaCoach2} alt="Andrea" className="h-14 w-14 rounded-full object-cover border border-primary-foreground/30" />
            <div>
              <h3 className="font-semibold text-sm leading-none">Andrea</h3>
              <p className="text-xs opacity-80 mt-0.5">Your AI Training Coach</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-primary-foreground hover:bg-primary-foreground/20"
              onClick={() => setView(view === 'history' ? 'chat' : 'history')}
              aria-label="Chat history"
            >
              <Clock className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-primary-foreground hover:bg-primary-foreground/20"
              onClick={handleNewChat}
              aria-label="New chat"
            >
              <Plus className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-primary-foreground hover:bg-primary-foreground/20"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {view === 'history' ? (
          /* History View */
          <ScrollArea className="flex-1 px-4 py-3">
            <p className="text-sm font-medium mb-3">Chat History</p>
            {conversations.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">No conversations yet</p>
            ) : (
              <div className="space-y-1">
                {conversations.map((conv) => (
                  <div
                    key={conv.id}
                    onClick={() => handleSelectConversation(conv.id)}
                    className="flex items-center justify-between px-3 py-2 rounded-md hover:bg-muted cursor-pointer transition-colors"
                  >
                    <div className="flex-1 min-w-0 mr-2">
                      <p className="text-sm truncate">{conv.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {conv.messages.length} message{conv.messages.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {formatRelativeTime(conv.updated_at)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        ) : (
          <>
            {/* Messages */}
            <ScrollArea className="flex-1 px-4 py-3" ref={scrollRef}>
              <div className="space-y-3">
                {activeMessages.length === 0 && !isLoading && (
                  <div className="text-center py-6">
                    <div className="mx-auto h-24 w-24 rounded-full overflow-hidden border-2 border-primary/20 mb-3">
                      <img src={andreaCoach2} alt="Andrea" className="h-full w-full object-cover" />
                    </div>
                    <p className="text-sm font-medium mb-1">Hi{profile.display_name ? `, ${profile.display_name}` : ''}!</p>
                    <p className="text-xs text-muted-foreground mb-4">
                      I can help you navigate your training. Ask me anything!
                    </p>
                  </div>
                )}

                {activeMessages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
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
                    <div className="bg-muted rounded-lg px-3 py-2 text-sm flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-muted-foreground">Andrea is thinking...</span>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Suggested Prompts */}
            {suggestedPrompts.length > 0 && !isLoading && (
              <div data-tour="andrea-panel-suggestions" className="px-4 pb-2 flex flex-wrap gap-1.5">
                {suggestedPrompts.map((prompt, i) => (
                  <button
                    key={i}
                    onClick={() => handleSuggestionClick(prompt)}
                    className="text-xs px-2.5 py-1.5 rounded-full border border-primary/30 text-primary hover:bg-primary/10 transition-colors"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <form data-tour="andrea-panel-input" onSubmit={handleSubmit} className="px-4 pb-4 pt-2 border-t">
              <div className="flex items-center gap-2">
                <Input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask Andrea anything..."
                  className="text-sm"
                  disabled={isLoading}
                />
                <Button
                  type="submit"
                  size="icon"
                  className="h-9 w-9 shrink-0"
                  disabled={!input.trim() || isLoading}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </form>
          </>
        )}
      </Card>
    </div>
  );
}
