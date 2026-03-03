import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  FileText, Lightbulb, Play, CheckCircle, Clock, Target, MessageSquare,
} from 'lucide-react';
import type { ModuleContent } from '@/data/trainingContent';

// ─── ModuleContentPanel ───────────────────────────────────────────────────────
//
// Inline Learn-mode content panel. Replaces the old ModuleContentModal.
// Renders module content as a scrollable article — no dialog, no overlay.
// Shows at 65% width alongside the Andrea panel (35%) in Learn Mode.

interface ModuleContentPanelProps {
  module: ModuleContent;
  onStartPractice: () => void;
}

export function ModuleContentPanel({ module, onStartPractice }: ModuleContentPanelProps) {
  const typeConfig = {
    document: { icon: FileText, label: 'Reference', color: 'text-blue-600', bg: 'bg-blue-500/8' },
    example:  { icon: Lightbulb, label: 'Examples',  color: 'text-yellow-600', bg: 'bg-yellow-500/8' },
    exercise: { icon: Play,      label: 'Exercise',  color: 'text-green-600', bg: 'bg-green-500/8' },
    sandbox:  { icon: MessageSquare, label: 'Sandbox', color: 'text-purple-600', bg: 'bg-purple-500/8' },
    video:    { icon: Play,      label: 'Video',     color: 'text-orange-600', bg: 'bg-orange-500/8' },
    gate:     { icon: CheckCircle, label: 'Gate',    color: 'text-primary', bg: 'bg-primary/8' },
  } as const;

  const cfg = typeConfig[module.type as keyof typeof typeConfig] ?? typeConfig.document;
  const TypeIcon = cfg.icon;

  return (
    <div className="flex flex-col h-full border-r">
      {/* Header */}
      <div className="shrink-0 border-b px-6 py-4 bg-card">
        <div className="flex items-start gap-3">
          <div className={`p-2.5 rounded-lg ${cfg.bg} ${cfg.color} shrink-0`}>
            <TypeIcon className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-semibold leading-tight truncate">{module.title}</h2>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="secondary" className="capitalize text-xs">{cfg.label}</Badge>
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                {module.estimatedTime}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Scrollable content */}
      <ScrollArea className="flex-1">
        <div className="px-6 py-5 space-y-5">

          {/* Learning outcome callout */}
          {module.learningOutcome && (
            <div className="flex items-start gap-3 rounded-lg border border-primary/20 bg-primary/5 px-4 py-3">
              <Target className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <p className="text-sm font-medium text-primary leading-snug">
                {module.learningOutcome}
              </p>
            </div>
          )}

          {/* Overview */}
          <div>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {module.content.overview}
            </p>
          </div>

          {/* Steps (document / exercise) */}
          {module.content.steps && module.content.steps.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold mb-3">Step-by-Step</h3>
              <ol className="space-y-2.5">
                {module.content.steps.map((step, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-sm">
                    <span className="h-5 w-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center shrink-0 mt-0.5 font-medium">
                      {idx + 1}
                    </span>
                    <span className="leading-relaxed">{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* Examples */}
          {module.content.examples && module.content.examples.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold">
                {module.type === 'example' ? 'Examples' : 'Example'}
              </h3>
              {module.content.examples.map((example, idx) => (
                <Card key={idx} className="overflow-hidden">
                  <div className="bg-muted/50 px-4 py-2.5 border-b text-sm font-medium">
                    {example.title}
                  </div>
                  <CardContent className="pt-4 pb-4 space-y-3">
                    {example.bad && (
                      <div className="bg-destructive/5 border border-destructive/20 p-3 rounded-lg">
                        <p className="text-xs font-medium text-destructive mb-1.5">Less effective</p>
                        <p className="text-sm italic text-muted-foreground">"{example.bad}"</p>
                      </div>
                    )}
                    <div className="bg-green-500/5 border border-green-500/20 p-3 rounded-lg">
                      <p className="text-xs font-medium text-green-700 mb-1.5">More effective</p>
                      <p className="text-sm whitespace-pre-wrap">"{example.good}"</p>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      <span className="font-medium">Why: </span>{example.explanation}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Key points */}
          {module.content.keyPoints && module.content.keyPoints.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-primary" />
                Key Points
              </h3>
              <ul className="space-y-2">
                {module.content.keyPoints.map((point, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-sm">
                    <span className="h-4 w-4 rounded-full bg-primary/10 text-primary text-[10px] flex items-center justify-center shrink-0 mt-0.5 font-medium">
                      {idx + 1}
                    </span>
                    <span className="leading-relaxed">{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Learning objectives */}
          {module.learningObjectives && module.learningObjectives.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold mb-3">Learning Objectives</h3>
              <ul className="space-y-2">
                {module.learningObjectives.map((obj, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <CheckCircle className="h-3.5 w-3.5 text-green-500 mt-0.5 shrink-0" />
                    <span className="leading-relaxed">{obj}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Bottom spacer */}
          <div className="h-4" />
        </div>
      </ScrollArea>

      {/* Start practice CTA */}
      <div className="shrink-0 border-t bg-card px-6 py-4">
        <Button className="w-full gap-2" onClick={onStartPractice}>
          <MessageSquare className="h-4 w-4" />
          Start Practice
        </Button>
      </div>
    </div>
  );
}
