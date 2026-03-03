import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Send, Lightbulb, CheckCircle, ChevronRight, Plus, SlidersHorizontal, Mic, AudioLines } from 'lucide-react';
import { type ModuleContent } from '@/data/trainingContent';

interface PracticeTaskCardProps {
  module: ModuleContent;
  practiceInput: string;
  onPracticeInputChange: (value: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
  isCompleted: boolean;
  onContinueToNext?: () => void;
  onCompleteSession?: () => void;
  hasNextModule: boolean;
}

export function PracticeTaskCard({
  module,
  practiceInput,
  onPracticeInputChange,
  onSubmit,
  isLoading,
  isCompleted,
  onContinueToNext,
  onCompleteSession,
  hasNextModule,
}: PracticeTaskCardProps) {
  const [activeTab, setActiveTab] = useState<'work' | 'web'>('work');

  const handleHintClick = (hint: string) => {
    if (practiceInput.trim()) {
      onPracticeInputChange(practiceInput + '\n' + hint);
    } else {
      onPracticeInputChange(hint);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      if (!isLoading && practiceInput.trim()) {
        onSubmit();
      }
    }
  };

  return (
    <div className="flex flex-col flex-1 min-h-0 items-center bg-background text-foreground">
      {/* Work / Web Toggle — top center */}
      <div className="w-full flex justify-center pt-4 pb-2">
        <div className="inline-flex items-center rounded-full border border-border bg-card p-0.5 shadow-sm">
          <button
            onClick={() => setActiveTab('work')}
            className={`px-5 py-1.5 text-sm font-medium rounded-full transition-colors ${
              activeTab === 'work'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Work
          </button>
          <button
            onClick={() => setActiveTab('web')}
            className={`px-5 py-1.5 text-sm font-medium rounded-full transition-colors ${
              activeTab === 'web'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Web
          </button>
        </div>
      </div>

      {/* Centered Welcome Message */}
      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-2xl mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-semibold text-foreground text-center mb-2 tracking-tight">
          Welcome, how can I help?
        </h2>

        {/* Completion Banner */}
        {isCompleted && (
          <div className="w-full max-w-lg mt-6">
            <div className="p-4 bg-accent/10 border border-accent/20 rounded-2xl text-center">
              <div className="flex items-center justify-center gap-2 text-accent font-medium">
                <CheckCircle className="h-5 w-5" />
                Practice Submitted!
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Check Andrea's feedback on the right panel →
              </p>
              <div className="mt-3">
                {hasNextModule && onContinueToNext ? (
                  <Button onClick={onContinueToNext} className="gap-2 rounded-full">
                    Continue to Next Module
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                ) : onCompleteSession ? (
                  <Button onClick={onCompleteSession} className="gap-2 rounded-full">
                    Complete Session
                    <CheckCircle className="h-4 w-4" />
                  </Button>
                ) : null}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Copilot-Style Composer Bar */}
      <div className="w-full max-w-2xl mx-auto px-4 pb-2">
        <div className="rounded-2xl border border-border bg-card shadow-sm">
          <label htmlFor="practice-response" className="sr-only">
            Your Response
          </label>
          <Textarea
            id="practice-response"
            value={practiceInput}
            onChange={(e) => onPracticeInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Message ${module.content.practiceTask.title}...`}
            className="min-h-[56px] max-h-[180px] resize-none border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-sm text-foreground placeholder:text-muted-foreground/60 rounded-t-2xl px-4 pt-3.5 pb-0"
            aria-describedby="composer-hint"
          />
          {/* Toolbar row */}
          <div className="flex items-center justify-between px-3 py-2">
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted">
                <Plus className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="sm" className="h-8 gap-1.5 rounded-full text-sm px-3 text-muted-foreground hover:text-foreground hover:bg-muted">
                <SlidersHorizontal className="h-4 w-4" />
                Tools
              </Button>
            </div>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted">
                <Mic className="h-5 w-5" />
              </Button>
              {practiceInput.trim() ? (
                <Button
                  size="icon"
                  onClick={onSubmit}
                  disabled={isLoading}
                  className="h-8 w-8 rounded-full"
                  aria-label="Submit for review"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              ) : (
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted">
                  <AudioLines className="h-5 w-5" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Suggestion Cards */}
      <div className="w-full max-w-2xl mx-auto px-4 pb-6 pt-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {module.content.practiceTask.hints.slice(0, 3).map((hint, idx) => (
            <button
              key={idx}
              onClick={() => handleHintClick(hint)}
              className="text-left p-4 rounded-xl border border-border bg-card hover:bg-muted/50 hover:border-border transition-all group shadow-sm"
            >
              <Lightbulb className="h-5 w-5 text-muted-foreground mb-2 group-hover:text-accent transition-colors" />
              <p className="text-sm font-medium text-foreground line-clamp-2">{hint}</p>
              <p className="text-xs text-muted-foreground mt-1">Try this approach</p>
            </button>
          ))}
        </div>
        {module.content.practiceTask.hints.length > 3 && (
          <div className="text-center mt-3">
            <button className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              See more ↓
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
