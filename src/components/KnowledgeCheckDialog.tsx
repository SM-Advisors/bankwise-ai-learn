import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Brain, ArrowRight, CheckCircle, RotateCcw } from 'lucide-react';
import { KNOWLEDGE_CHECKS } from '@/data/trainingContent';

interface KnowledgeCheckDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sessionNumber: number;
  onComplete: (responses: string[]) => void;
}

export function KnowledgeCheckDialog({
  open,
  onOpenChange,
  sessionNumber,
  onComplete,
}: KnowledgeCheckDialogProps) {
  const questions = KNOWLEDGE_CHECKS[sessionNumber] || [];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [responses, setResponses] = useState<string[]>(() => questions.map(() => ''));
  const [showSummary, setShowSummary] = useState(false);

  if (questions.length === 0) return null;

  const progress = ((currentIndex + (showSummary ? 1 : 0)) / questions.length) * 100;
  const currentResponse = responses[currentIndex] || '';
  const allAnswered = responses.every((r) => r.trim().length > 0);

  const handleUpdateResponse = (value: string) => {
    setResponses((prev) => {
      const next = [...prev];
      next[currentIndex] = value;
      return next;
    });
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setShowSummary(true);
    }
  };

  const handleBack = () => {
    if (showSummary) {
      setShowSummary(false);
      return;
    }
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleComplete = () => {
    onComplete(responses);
    // Reset for next time
    setCurrentIndex(0);
    setResponses(questions.map(() => ''));
    setShowSummary(false);
  };

  const handleSkip = () => {
    onComplete([]);
    setCurrentIndex(0);
    setResponses(questions.map(() => ''));
    setShowSummary(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            Knowledge Check
          </DialogTitle>
          <DialogDescription>
            Quick warm-up from Session {sessionNumber - 1} — no grades, just keeping concepts fresh.
          </DialogDescription>
        </DialogHeader>

        <Progress value={progress} className="h-1.5" />

        {showSummary ? (
          <div className="space-y-4">
            <div className="text-center py-4">
              <div className="mx-auto h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center mb-3">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-semibold mb-1">Great warm-up!</h3>
              <p className="text-sm text-muted-foreground">
                Andrea will use your responses to calibrate coaching for this session.
              </p>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto">
              {questions.map((q, i) => (
                <div key={i} className="p-3 rounded-lg bg-muted/30 border">
                  <p className="text-xs font-medium text-muted-foreground mb-1">Q{i + 1}</p>
                  <p className="text-sm">{responses[i] || <span className="italic text-muted-foreground">Skipped</span>}</p>
                </div>
              ))}
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={handleBack} className="gap-2">
                <RotateCcw className="h-4 w-4" />
                Review
              </Button>
              <Button onClick={handleComplete} className="gap-2">
                Start Session
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <Badge variant="secondary" className="mb-2">
                Question {currentIndex + 1} of {questions.length}
              </Badge>
              <p className="font-medium">{questions[currentIndex]}</p>
            </div>

            <Textarea
              value={currentResponse}
              onChange={(e) => handleUpdateResponse(e.target.value)}
              placeholder="Type your answer... (it's okay to be brief)"
              className="min-h-[100px] resize-none"
            />

            <div className="flex justify-between">
              <div className="flex gap-2">
                {currentIndex > 0 && (
                  <Button variant="outline" size="sm" onClick={handleBack}>
                    Back
                  </Button>
                )}
                <Button variant="ghost" size="sm" onClick={handleSkip} className="text-muted-foreground">
                  Skip warm-up
                </Button>
              </div>
              <Button
                onClick={handleNext}
                disabled={!currentResponse.trim()}
                className="gap-2"
                size="sm"
              >
                {currentIndex < questions.length - 1 ? 'Next' : 'Done'}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
