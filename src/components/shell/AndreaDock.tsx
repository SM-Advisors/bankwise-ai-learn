import { useState, forwardRef, useImperativeHandle } from 'react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, X } from 'lucide-react';
import andreaImg from '@/assets/andrea-coach2.png';

// ─── Types ────────────────────────────────────────────────────────────────────

export type DockState = 'resting' | 'attentive' | 'active';

export interface AndreaDockHandle {
  /** Programmatically trigger the Attentive state with a preview message */
  nudge: (previewText: string) => void;
  /** Return to Resting */
  rest: () => void;
}

interface AndreaDockProps {
  initialState?: DockState;
  /** Called when user clicks X on the attentive bubble (dismisses without engaging) */
  onDismiss?: () => void;
}

// ─── AndreaDock ───────────────────────────────────────────────────────────────
//
// Three-state floating AI assistant dock.
//
// Resting   → Avatar only, bottom-right, minimal presence
// Attentive → Avatar + subtle glow + 2–3 word preview bubble
// Active    → Full Sheet panel opens from right with chat placeholder
//
// Phase 0: UI shell only. No real AI calls. Chat is connected in Phase 2.

export const AndreaDock = forwardRef<AndreaDockHandle, AndreaDockProps>(
  ({ initialState = 'resting', onDismiss }, ref) => {
    const { profile } = useAuth();
    const [state, setState] = useState<DockState>(initialState);
    const [previewText, setPreviewText] = useState('');
    const [inputValue, setInputValue] = useState('');
    const [messages, setMessages] = useState<{ role: 'andrea' | 'user'; text: string }[]>([
      {
        role: 'andrea',
        text: `Hi ${profile?.display_name ?? 'there'}! I'm Andrea, your AI coach. I'm here whenever you need guidance, hints, or want to talk through what you're learning.`,
      },
    ]);

    // Expose imperative handle for programmatic triggers (used in Phase 3)
    useImperativeHandle(ref, () => ({
      nudge: (text: string) => {
        setPreviewText(text);
        setState('attentive');
      },
      rest: () => setState('resting'),
    }));

    function handleAvatarClick() {
      setState((prev) => (prev === 'active' ? 'resting' : 'active'));
    }

    function handleSend() {
      if (!inputValue.trim()) return;
      setMessages((prev) => [
        ...prev,
        { role: 'user', text: inputValue.trim() },
        {
          role: 'andrea',
          text: "That's a great question. Full AI coaching will be available once the platform is connected. For now, keep exploring!",
        },
      ]);
      setInputValue('');
    }

    return (
      <>
        {/* ── Floating dock button ─────────────────────────────────────── */}
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
          {/* Attentive preview bubble */}
          {state === 'attentive' && previewText && (
            <div className="animate-fade-in mb-1 flex items-center gap-1 rounded-full bg-card px-3 py-1.5 shadow-elevated text-sm font-medium border border-border">
              {previewText}
              <button
                onClick={() => { setState('resting'); onDismiss?.(); }}
                className="ml-1 text-muted-foreground hover:text-foreground"
                aria-label="Dismiss"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}

          {/* Avatar button */}
          <button
            onClick={handleAvatarClick}
            aria-label={state === 'active' ? 'Close Andrea' : 'Open Andrea'}
            className={cn(
              'flex h-12 w-12 items-center justify-center rounded-full bg-primary shadow-elevated transition-all duration-200 hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent',
              state === 'attentive' && 'ring-2 ring-accent animate-pulse'
            )}
            style={
              state === 'attentive'
                ? { boxShadow: 'var(--andrea-glow, 0 0 16px hsl(10 76% 50% / 0.35))' }
                : undefined
            }
          >
            <img
              src={andreaImg}
              alt="Andrea"
              className="h-9 w-9 rounded-full object-cover"
            />
          </button>
        </div>

        {/* ── Active: Sheet panel ───────────────────────────────────────── */}
        <Sheet open={state === 'active'} onOpenChange={(open) => !open && setState('resting')}>
          <SheetContent
            side="right"
            className="flex w-[380px] flex-col p-0 sm:max-w-[380px]"
          >
            <SheetHeader className="border-b px-4 py-3">
              <div className="flex items-center gap-3">
                <img
                  src={andreaImg}
                  alt="Andrea"
                  className="h-8 w-8 rounded-full object-cover"
                />
                <div>
                  <SheetTitle className="text-base">Andrea</SheetTitle>
                  <p className="text-xs text-muted-foreground">Your AI coach</p>
                </div>
              </div>
            </SheetHeader>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto space-y-3 p-4">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={cn(
                    'max-w-[85%] rounded-lg px-3 py-2 text-sm',
                    msg.role === 'andrea'
                      ? 'bg-secondary text-foreground self-start'
                      : 'bg-primary text-primary-foreground self-end ml-auto'
                  )}
                >
                  {msg.text}
                </div>
              ))}
            </div>

            {/* Input */}
            <div className="border-t p-3 flex gap-2 items-end">
              <Textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask Andrea anything..."
                className="min-h-[40px] max-h-[120px] resize-none text-sm"
                rows={1}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
              />
              <Button
                size="icon"
                onClick={handleSend}
                disabled={!inputValue.trim()}
                className="h-9 w-9 shrink-0"
                aria-label="Send message"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </>
    );
  }
);

AndreaDock.displayName = 'AndreaDock';
