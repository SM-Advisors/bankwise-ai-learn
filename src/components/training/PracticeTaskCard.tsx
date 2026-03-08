import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Send, Plus, SlidersHorizontal, Mic, AudioLines } from 'lucide-react';
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

    </div>
  );
}
