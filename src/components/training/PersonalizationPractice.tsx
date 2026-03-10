import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Save, Loader2, User, ArrowRight } from 'lucide-react';
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

const AUTOSAVE_INTERVAL = 8000; // 8 seconds

export function PersonalizationPractice({ onSaved, hasNextModule, onContinueToNext }: PersonalizationPracticeProps) {
  const { preferences, loading: prefsLoading, savePreferences } = useAIPreferences();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showProfilePopup, setShowProfilePopup] = useState(false);
  const [showNextNotification, setShowNextNotification] = useState(false);

  const [tone, setTone] = useState('professional');
  const [verbosity, setVerbosity] = useState('balanced');
  const [formatting, setFormatting] = useState('mixed');
  const [roleContext, setRoleContext] = useState('');
  const [customInstructions, setCustomInstructions] = useState('');

  // Track whether form has been modified since last save (for auto-save)
  const [isDirty, setIsDirty] = useState(false);
  const lastSavedRef = useRef<string>('');

  // Build a snapshot string to detect changes
  const currentSnapshot = `${tone}|${verbosity}|${formatting}|${roleContext}|${customInstructions}`;

  // Pre-fill from existing preferences
  useEffect(() => {
    if (preferences) {
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
        setShowProfilePopup(false);
        setShowNextNotification(false);
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

      // Show profile popup and next-module notification
      setShowProfilePopup(true);
      setShowNextNotification(true);

      onSaved({
        tone,
        verbosity,
        formatting_preference: formatting,
        role_context: roleContext,
        additional_instructions: customInstructions,
      });
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

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
        {/* Header */}
        <div className="text-center space-y-1">
          <h2 className="text-xl font-semibold">Set Up Your Personalization</h2>
          <p className="text-sm text-muted-foreground">
            Tell Andrea who you are so every response feels relevant to your work.
          </p>
        </div>

        {/* Response Tone */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold">Response Tone</h3>
          <p className="text-xs text-muted-foreground">How should Andrea talk to you?</p>
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
          <p className="text-xs text-muted-foreground">How should Andrea format responses?</p>
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
            Tell Andrea about your specific role so she can tailor responses
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
            Any other preferences for how Andrea should assist you
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

        {/* My Profile popup notification */}
        {showProfilePopup && (
          <div className="rounded-lg border border-primary/30 bg-primary/5 p-4 flex items-start gap-3">
            <User className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium">Review your personalization anytime</p>
              <p className="text-xs text-muted-foreground mt-1">
                Click your name in the bottom-left corner to open My Profile and review or update your settings.
              </p>
            </div>
            <button onClick={() => setShowProfilePopup(false)} className="text-muted-foreground hover:text-foreground text-xs">
              Dismiss
            </button>
          </div>
        )}

        {/* Next module notification */}
        {showNextNotification && (
          <div className="rounded-lg border border-green-500/30 bg-green-500/5 p-4 flex items-start gap-3">
            <ArrowRight className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-green-700">Ready to continue?</p>
              <p className="text-xs text-muted-foreground mt-1">
                {hasNextModule
                  ? "You can proceed to the next module, or stay here to refine your personalization based on Andrea's feedback."
                  : "You can continue working on this module or revisit Andrea's feedback above."}
              </p>
              {hasNextModule && onContinueToNext && (
                <Button
                  size="sm"
                  onClick={onContinueToNext}
                  className="mt-2 gap-2 bg-green-600 hover:bg-green-700 text-white"
                >
                  Continue to Next Module
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
            <button onClick={() => setShowNextNotification(false)} className="text-muted-foreground hover:text-foreground text-xs">
              Dismiss
            </button>
          </div>
        )}

        <div className="h-4" />
      </div>

      {/* Save button — re-enables when user edits after submission */}
      <div className="shrink-0 border-t bg-card px-6 py-4">
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
          {saved ? 'Saved to My SMILE Profile' : 'Submit to Andrea and Save to Your SMILE Profile'}
        </Button>
      </div>
    </div>
  );
}
