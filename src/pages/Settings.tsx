import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useAIPreferences } from '@/hooks/useAIPreferences';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Settings as SettingsIcon, Brain, Save, Loader2 } from 'lucide-react';

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

export default function Settings() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { preferences, loading, savePreferences } = useAIPreferences();
  const { toast } = useToast();

  const [tone, setTone] = useState('professional');
  const [verbosity, setVerbosity] = useState('balanced');
  const [formatting, setFormatting] = useState('mixed');
  const [roleContext, setRoleContext] = useState('');
  const [customInstructions, setCustomInstructions] = useState('');
  const [saving, setSaving] = useState(false);

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
    const result = await savePreferences({
      tone,
      verbosity,
      formatting_preference: formatting,
      role_context: roleContext || null,
      additional_instructions: customInstructions || null,
    });
    if (result.success) {
      toast({ title: 'Preferences saved', description: 'Andrea will use your updated preferences.' });
    } else {
      toast({ title: 'Error', description: result.error, variant: 'destructive' });
    }
    setSaving(false);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate('/dashboard')}
        className="mb-4 gap-2"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Dashboard
      </Button>

      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-primary/10 rounded-lg">
          <SettingsIcon className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">AI Settings</h1>
          <p className="text-sm text-muted-foreground">
            Customize how Andrea communicates with you
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Tone */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Brain className="h-5 w-5 text-primary" />
                Response Tone
              </CardTitle>
              <CardDescription>How should Andrea talk to you?</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {TONE_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setTone(option.value)}
                    className={`p-3 rounded-lg border text-left transition-colors ${
                      tone === option.value
                        ? 'border-primary bg-primary/5 ring-1 ring-primary'
                        : 'border-border hover:bg-muted'
                    }`}
                  >
                    <div className="font-medium text-sm">{option.label}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{option.description}</div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Verbosity */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Response Length</CardTitle>
              <CardDescription>How detailed should responses be?</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {VERBOSITY_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setVerbosity(option.value)}
                    className={`p-3 rounded-lg border text-left transition-colors ${
                      verbosity === option.value
                        ? 'border-primary bg-primary/5 ring-1 ring-primary'
                        : 'border-border hover:bg-muted'
                    }`}
                  >
                    <div className="font-medium text-sm">{option.label}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{option.description}</div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Formatting */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Formatting Style</CardTitle>
              <CardDescription>How should Andrea format responses?</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {FORMAT_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setFormatting(option.value)}
                    className={`p-3 rounded-lg border text-left transition-colors ${
                      formatting === option.value
                        ? 'border-primary bg-primary/5 ring-1 ring-primary'
                        : 'border-border hover:bg-muted'
                    }`}
                  >
                    <div className="font-medium text-sm">{option.label}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{option.description}</div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Role Context */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Your Role Context</CardTitle>
              <CardDescription>
                Tell Andrea about your specific role so she can tailor responses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={roleContext}
                onChange={(e) => setRoleContext(e.target.value)}
                placeholder="e.g., I'm a credit analyst who reviews commercial loan applications. I focus on financial statement analysis and risk assessment."
                className="min-h-[100px]"
              />
            </CardContent>
          </Card>

          {/* Custom Instructions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Custom Instructions</CardTitle>
              <CardDescription>
                Any other preferences for how Andrea should assist you
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={customInstructions}
                onChange={(e) => setCustomInstructions(e.target.value)}
                placeholder="e.g., Always relate examples to banking. Use analogies when explaining complex concepts. Focus on practical applications."
                className="min-h-[100px]"
              />
            </CardContent>
          </Card>

          {/* Current Profile Info */}
          <Card className="bg-muted/30">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">Current profile:</span>{' '}
                  {profile?.display_name} &middot; {profile?.bank_role} &middot; Level {profile?.ai_proficiency_level}
                </div>
                <div className="flex gap-2">
                  <Badge variant="secondary">{profile?.learning_style}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={saving} className="gap-2">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save Preferences
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
