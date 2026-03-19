import { useState, useEffect, useRef, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle, Save, Loader2, ArrowRight, Bot, Sparkles } from 'lucide-react';
import { useAIPreferences } from '@/hooks/useAIPreferences';
import { useToast } from '@/hooks/use-toast';

interface PersonalizationPracticeProps {
  onSaved: (preferences: {
    tone: string;
    verbosity: string;
    formatting_preference: string;
    role_context: string;
    additional_instructions: string;
  }) => void;
  hasNextModule?: boolean;
  onContinueToNext?: () => void;
  /** Send a message to the ai-practice chat */
  onSendPracticeMessage?: (message: string) => void;
  /** Messages from the ai-practice chat */
  practiceMessages?: Array<{ role: 'user' | 'assistant'; content: string }>;
  /** Whether the practice chat is waiting for a response */
  isPracticeLoading?: boolean;
}

const TONE_OPTIONS = [
  { value: 'professional', label: 'Professional', description: 'Formal and business-appropriate' },
  { value: 'casual', label: 'Casual', description: 'Friendly and conversational' },
  { value: 'technical', label: 'Technical', description: 'Precise and jargon-friendly' },
];

const VERBOSITY_OPTIONS = [
  { value: 'concise', label: 'Concise', description: 'Short and to the point' },
  { value: 'balanced', label: 'Balanced', description: 'Mix of brevity and detail' },
  { value: 'detailed', label: 'Detailed', description: 'Thorough explanations' },
];

const FORMAT_OPTIONS = [
  { value: 'bullets', label: 'Bullet Points', description: 'Lists and bullet points' },
  { value: 'paragraphs', label: 'Paragraphs', description: 'Flowing text' },
  { value: 'mixed', label: 'Mixed', description: 'Combination of formats' },
];

const AUTO_PROMPT = 'What are the top three things I should be thinking about this quarter?';
const AUTOSAVE_INTERVAL = 8000; // 8 seconds

export function PersonalizationPractice({
  onSaved,
  hasNextModule,
  onContinueToNext,
  onSendPracticeMessage,
  practiceMessages = [],
  isPracticeLoading = false,
}: PersonalizationPracticeProps) {
  const { preferences, loading: prefsLoading, savePreferences } = useAIPreferences();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [tone, setTone] = useState('professional');
  const [verbosity, setVerbosity] = useState('balanced');
  const [formatting, setFormatting] = useState('mixed');
  const [roleContext, setRoleContext] = useState('');
  const [customInstructions, setCustomInstructions] = useState('');

  // Track whether form has been modified since last save (for auto-save)
  const [isDirty, setIsDirty] = useState(false);
  const lastSavedRef = useRef<string>('');
  const initializedRef = useRef(false);
  const autoPromptFiredRef = useRef(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Build a snapshot string to detect changes
  const currentSnapshot = `${tone}|${verbosity}|${formatting}|${roleContext}|${customInstructions}`;

  // Pre-fill from existing preferences — only on initial load to avoid overwriting edits
  useEffect(() => {
    if (preferences && !initializedRef.current) {
      initializedRef.current = true;
      setTone(preferences.tone || 'professional');
      setVerbosity(preferences.verbosity || 'balanced');
      setFormatting(preferences.formatting_preference || 'mixed');
      setRoleContext(preferences.role_context || '');
      setCustomInstructions(preferences.additional_instructions || '');
      lastSavedRef.current = `${preferences.tone || 'professional'}|${preferences.verbosity || 'balanced'}|${preferences.formatting_preference || 'mixed'}|${preferences.role_context || ''}|${preferences.additional_instructions || ''}`;
    }
  }, [preferences]);

  // Mark dirty when values change from last saved state
  useEffect(() => {
    if (lastSavedRef.current && currentSnapshot !== lastSavedRef.current) {
      setIsDirty(true);
      // Re-enable submit button when user edits after submission
      if (saved) {
        setSaved(false);
        autoPromptFiredRef.current = false;
      }
    }
  }, [currentSnapshot, saved]);

  // Auto-save every 8 seconds when dirty
  const autoSave = useCallback(async () => {
    if (!isDirty) return;
    const updates = {
      tone,
      verbosity,
      formatting_preference: formatting,
      role_context: roleContext || null,
      additional_instructions: customInstructions || null,
    };
    const result = await savePreferences(updates);
    if (result.success) {
      setIsDirty(false);
      lastSavedRef.current = currentSnapshot;
    }
  }, [isDirty, tone, verbosity, formatting, roleContext, customInstructions, currentSnapshot, savePreferences]);

  useEffect(() => {
    const timer = setInterval(autoSave, AUTOSAVE_INTERVAL);
    return () => clearInterval(timer);
  }, [autoSave]);

  // Also auto-save on unmount (navigating away)
  useEffect(() => {
    return () => {
      // Fire-and-forget save on unmount if dirty
      if (isDirty) {
        savePreferences({
          tone,
          verbosity,
          formatting_preference: formatting,
          role_context: roleContext || null,
          additional_instructions: customInstructions || null,
        });
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDirty, tone, verbosity, formatting, roleContext, customInstructions]);

  // Scroll to bottom of chat when new messages arrive
  useEffect(() => {
    if (practiceMessages.length > 0) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [practiceMessages.length, isPracticeLoading]);

  const handleSave = async () => {
    setSaving(true);
    const updates = {
      tone,
      verbosity,
      formatting_preference: formatting,
      role_context: roleContext || null,
      additional_instructions: customInstructions || null,
    };
    const result = await savePreferences(updates);
    setSaving(false);

    if (result.success) {
      setSaved(true);
      setIsDirty(false);
      lastSavedRef.current = currentSnapshot;
      toast({ title: 'Personalization saved', description: 'Your preferences have been updated in My Profile.' });

      onSaved({
        tone,
        verbosity,
        formatting_preference: formatting,
        role_context: roleContext,
        additional_instructions: customInstructions,
      });

      // Auto-fire the preview prompt so the user sees how their preferences affect output
      if (onSendPracticeMessage && !autoPromptFiredRef.current) {
        autoPromptFiredRef.current = true;
        // Small delay to ensure preferences are persisted before the AI reads them
        setTimeout(() => {
          onSendPracticeMessage(AUTO_PROMPT);
        }, 600);
      }
    } else {
      toast({ title: 'Error', description: 'Failed to save preferences.', variant: 'destructive' });
    }
  };

  if (prefsLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const hasPreview = saved && (practiceMessages.length > 0 || isPracticeLoading);

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
        {/* Header */}
        <div className="text-center space-y-1">
          <h2 className="text-xl font-semibold">Set Up Your Personalization</h2>
          <p className="text-sm text-muted-foreground">
            Configure how AI responds to you — tone, detail level, and context.
          </p>
        </div>

        {/* Response Tone */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold">Response Tone</h3>
          <p className="text-xs text-muted-foreground">How should AI talk to you?</p>
          <div className="grid grid-cols-3 gap-2">
            {TONE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setTone(opt.value)}
                className={`rounded-lg border p-3 text-left transition-colors ${
                  tone === opt.value
                    ? 'border-primary bg-primary/5 ring-1 ring-primary'
                    : 'border-border hover:border-primary/40'
                }`}
              >
                <span className="text-sm font-medium block">{opt.label}</span>
                <span className="text-xs text-muted-foreground">{opt.description}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Response Length */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold">Response Length</h3>
          <p className="text-xs text-muted-foreground">How detailed should responses be?</p>
          <div className="grid grid-cols-3 gap-2">
            {VERBOSITY_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setVerbosity(opt.value)}
                className={`rounded-lg border p-3 text-left transition-colors ${
                  verbosity === opt.value
                    ? 'border-primary bg-primary/5 ring-1 ring-primary'
                    : 'border-border hover:border-primary/40'
                }`}
              >
                <span className="text-sm font-medium block">{opt.label}</span>
                <span className="text-xs text-muted-foreground">{opt.description}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Formatting Style */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold">Formatting Style</h3>
          <p className="text-xs text-muted-foreground">How should AI format responses?</p>
          <div className="grid grid-cols-3 gap-2">
            {FORMAT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setFormatting(opt.value)}
                className={`rounded-lg border p-3 text-left transition-colors ${
                  formatting === opt.value
                    ? 'border-primary bg-primary/5 ring-1 ring-primary'
                    : 'border-border hover:border-primary/40'
                }`}
              >
                <span className="text-sm font-medium block">{opt.label}</span>
                <span className="text-xs text-muted-foreground">{opt.description}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Role Context */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold">Your Role Context</h3>
          <p className="text-xs text-muted-foreground">
            Tell the AI about your specific role so it can tailor responses
          </p>
          <Textarea
            value={roleContext}
            onChange={(e) => setRoleContext(e.target.value)}
            placeholder="e.g., I'm a credit analyst who reviews commercial loan applications."
            className="min-h-[80px] resize-none text-sm"
          />
        </div>

        {/* Custom Instructions */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold">Custom Instructions</h3>
          <p className="text-xs text-muted-foreground">
            Any other preferences for how the AI should assist you
          </p>
          <Textarea
            value={customInstructions}
            onChange={(e) => setCustomInstructions(e.target.value)}
            placeholder="e.g., Always relate examples to banking. Use analogies when explaining complex concepts."
            className="min-h-[80px] resize-none text-sm"
          />
        </div>

        {/* Auto-save indicator */}
        {isDirty && (
          <p className="text-xs text-muted-foreground text-center">Your changes will be auto-saved shortly</p>
        )}

        {/* Save button — inline, not sticky */}
        <div>
          <Button
            className="w-full gap-2 bg-green-600 hover:bg-green-700 text-white"
            onClick={handleSave}
            disabled={saving || saved}
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : saved ? (
              <CheckCircle className="h-4 w-4" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {saved ? 'Saved — see your preview below' : 'Save & Preview Response'}
          </Button>
        </div>

        {/* ── Inline Chat Preview ────────────────────────────────────────── */}
        {hasPreview && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="h-px flex-1 bg-border" />
              <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-accent" />
                Preview — see how your preferences affect the response
              </span>
              <div className="h-px flex-1 bg-border" />
            </div>

            <div className="space-y-3">
              {practiceMessages.map((msg, idx) => (
                <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                  {msg.role === 'assistant' && (
                    <div className="flex items-start">
                      <div className="w-7 h-7 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                        <Bot className="h-4 w-4 text-accent" />
                      </div>
                    </div>
                  )}
                  <div className={`rounded-2xl px-4 py-3 max-w-[85%] ${
                    msg.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted/50 border border-border'
                  }`}>
                    {msg.role === 'assistant' ? (
                      <div className="text-sm prose prose-sm dark:prose-invert max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                      </div>
                    ) : (
                      <p className="text-sm">{msg.content}</p>
                    )}
                  </div>
                </div>
              ))}

              {/* Loading indicator */}
              {isPracticeLoading && (
                <div className="flex gap-3">
                  <div className="w-7 h-7 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                    <Bot className="h-4 w-4 text-accent" />
                  </div>
                  <div className="rounded-2xl px-4 py-3 bg-muted/50 border border-border">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:0ms]" />
                      <span className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:150ms]" />
                      <span className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:300ms]" />
                    </div>
                  </div>
                </div>
              )}

              <div ref={chatEndRef} />
            </div>

            {/* Post-preview callout: notice how the response reflects your choices */}
            {practiceMessages.some(m => m.role === 'assistant') && (
              <div className="rounded-lg border border-accent/30 bg-accent/5 p-4 text-center space-y-2">
                <p className="text-sm font-medium">
                  Notice how the response reflects your tone, detail level, and role context.
                </p>
                <p className="text-xs text-muted-foreground">
                  You can update your preferences above and save again to see a different style — or continue to the next module.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Next module notification — only shows after the AI response arrives */}
        {saved && practiceMessages.some(m => m.role === 'assistant') && hasNextModule && onContinueToNext && (
          <div className="rounded-lg border border-green-500/30 bg-green-500/5 p-4 flex items-start gap-3">
            <ArrowRight className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-green-700">Ready to continue?</p>
              <p className="text-xs text-muted-foreground mt-1">
                You can proceed to the next module, or stay here to refine your personalization and preview again.
              </p>
              <Button
                size="sm"
                onClick={onContinueToNext}
                className="mt-2 gap-2 bg-green-600 hover:bg-green-700 text-white"
              >
                Continue to Next Module
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        )}

        <div className="h-4" />
      </div>
    </div>
  );
}
