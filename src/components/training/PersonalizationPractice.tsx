import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Save, Loader2 } from 'lucide-react';
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

export function PersonalizationPractice({ onSaved }: PersonalizationPracticeProps) {
  const { preferences, loading: prefsLoading, savePreferences } = useAIPreferences();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [tone, setTone] = useState('professional');
  const [verbosity, setVerbosity] = useState('balanced');
  const [formatting, setFormatting] = useState('mixed');
  const [roleContext, setRoleContext] = useState('');
  const [customInstructions, setCustomInstructions] = useState('');

  // Pre-fill from existing preferences
  useEffect(() => {
    if (preferences) {
      setTone(preferences.tone || 'professional');
      setVerbosity(preferences.verbosity || 'balanced');
      setFormatting(preferences.formatting_preference || 'mixed');
      setRoleContext(preferences.role_context || '');
      setCustomInstructions(preferences.additional_instructions || '');
    }
  }, [preferences]);

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
      toast({ title: 'Personalization saved', description: 'Your preferences have been updated in My Profile.' });
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

        <div className="h-4" />
      </div>

      {/* Save button */}
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
