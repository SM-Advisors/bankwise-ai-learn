import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { Sparkles, X, Send, Loader2, MessageCircle } from 'lucide-react';

interface DashboardChatProps {
  profile: {
    display_name: string | null;
    bank_role: string | null;
    line_of_business: string | null;
    ai_proficiency_level: number | null;
    employer_bank_name: string | null;
  };
  progress: {
    session_1_completed: boolean;
    session_2_completed: boolean;
    session_3_completed: boolean;
  } | null;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

const DEFAULT_SUGGESTIONS = [
  'Where should I start?',
  'What module covers compliance?',
  'What should I work on next?',
];

export function DashboardChat({ profile, progress }: DashboardChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [hasBeenOpened, setHasBeenOpened] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestedPrompts, setSuggestedPrompts] = useState<string[]>(DEFAULT_SUGGESTIONS);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleOpen = () => {
    setIsOpen(true);
    setHasBeenOpened(true);
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
      bankRole: profile.bank_role || undefined,
      lineOfBusiness: profile.line_of_business || undefined,
      completedModules,
      progressSummary,
    };
  };

  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;

    const userMessage: ChatMessage = { role: 'user', content: content.trim() };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setSuggestedPrompts([]);
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('trainer_chat', {
        body: {
          lessonId: 'dashboard',
          messages: updatedMessages,
          learnerState: buildLearnerState(),
        },
      });

      if (error) throw error;

      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: data.reply || "I'm here to help! What would you like to know about your training?",
      };
      setMessages((prev) => [...prev, assistantMessage]);

      if (data.suggestedPrompts && Array.isArray(data.suggestedPrompts) && data.suggestedPrompts.length > 0) {
        setSuggestedPrompts(data.suggestedPrompts);
      } else {
        setSuggestedPrompts([]);
      }
    } catch (err) {
      console.error('Dashboard chat error:', err);
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: "Sorry, I'm having trouble connecting right now. Please try again in a moment.",
      };
      setMessages((prev) => [...prev, errorMessage]);
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

  // Collapsed state - floating bubble
  if (!isOpen) {
    return (
      <button
        onClick={handleOpen}
        className={`fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-lg hover:shadow-xl transition-all hover:scale-105 flex items-center justify-center ${
          !hasBeenOpened ? 'animate-pulse' : ''
        }`}
        aria-label="Chat with Andrea"
      >
        <Sparkles className="h-6 w-6" />
      </button>
    );
  }

  // Expanded state - chat panel
  return (
    <div className="fixed bottom-6 right-6 z-50 w-[400px] h-[500px] flex flex-col">
      <Card className="flex flex-col h-full shadow-xl border">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b bg-primary text-primary-foreground rounded-t-lg">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            <div>
              <h3 className="font-semibold text-sm leading-none">Andrea</h3>
              <p className="text-xs opacity-80 mt-0.5">Your AI Training Coach</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-primary-foreground hover:bg-primary-foreground/20"
            onClick={() => setIsOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 px-4 py-3" ref={scrollRef}>
          <div className="space-y-3">
            {messages.length === 0 && !isLoading && (
              <div className="text-center py-6">
                <div className="mx-auto h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                  <MessageCircle className="h-6 w-6 text-primary" />
                </div>
                <p className="text-sm font-medium mb-1">Hi{profile.display_name ? `, ${profile.display_name}` : ''}!</p>
                <p className="text-xs text-muted-foreground mb-4">
                  I can help you navigate your training. Ask me anything!
                </p>
              </div>
            )}

            {messages.map((msg, i) => (
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
          <div className="px-4 pb-2 flex flex-wrap gap-1.5">
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
        <form onSubmit={handleSubmit} className="px-4 pb-4 pt-2 border-t">
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
      </Card>
    </div>
  );
}
