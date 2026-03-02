import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { FileText, Lightbulb, Play, CheckCircle, Clock, Target } from 'lucide-react';
import type { ModuleContent } from '@/data/trainingContent';

interface ModuleContentModalProps {
  module: ModuleContent | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ModuleContentModal({ module, open, onOpenChange }: ModuleContentModalProps) {
  if (!module) return null;

  const getIcon = () => {
    switch (module.type) {
      case 'document': return <FileText className="h-5 w-5" />;
      case 'example': return <Lightbulb className="h-5 w-5" />;
      case 'exercise': return <Play className="h-5 w-5" />;
      default: return <FileText className="h-5 w-5" />;
    }
  };

  const getTypeColor = () => {
    switch (module.type) {
      case 'document': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';
      case 'example': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'exercise': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl h-[85vh] flex flex-col p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b shrink-0">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${getTypeColor()}`}>
              {getIcon()}
            </div>
            <div>
              <DialogTitle className="text-xl">{module.title}</DialogTitle>
              <DialogDescription className="flex items-center gap-2 mt-1">
                <Badge variant="secondary" className="capitalize">{module.type}</Badge>
                <span className="flex items-center gap-1 text-sm">
                  <Clock className="h-3 w-3" />
                  {module.estimatedTime}
                </span>
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 overflow-y-auto">
          <div className="px-6 py-4 space-y-6">
            {/* Learning Outcome — prominent callout */}
            {module.learningOutcome && (
              <div className="flex items-start gap-3 rounded-lg border border-primary/20 bg-primary/5 px-4 py-3">
                <Target className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <p className="text-sm font-medium text-primary leading-snug">
                  {module.learningOutcome}
                </p>
              </div>
            )}

            {/* Document Content */}
            {module.type === 'document' && (
              <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-200 dark:border-blue-800">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3 mb-4">
                    <FileText className="h-6 w-6 text-blue-500 shrink-0 mt-1" />
                    <div>
                      <h4 className="font-semibold text-lg">Reference Document</h4>
                      <p className="text-sm text-muted-foreground">{module.description}</p>
                    </div>
                  </div>
                  <div className="bg-card rounded-lg p-4 border space-y-4">
                    <div>
                      <h5 className="font-medium mb-3">Overview</h5>
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        {module.content.overview}
                      </p>
                    </div>
                    
                    {module.content.steps && module.content.steps.length > 0 && (
                      <div className="pt-4 border-t">
                        <h5 className="font-medium mb-3">Step-by-Step Guide</h5>
                        <ol className="space-y-3">
                          {module.content.steps.map((step, idx) => (
                            <li key={idx} className="flex items-start gap-3 text-sm">
                              <span className="h-6 w-6 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center shrink-0">
                                {idx + 1}
                              </span>
                              <span className="pt-0.5">{step}</span>
                            </li>
                          ))}
                        </ol>
                      </div>
                    )}

                    {/* Include examples in documents too */}
                    {module.content.examples && module.content.examples.length > 0 && (
                      <div className="pt-4 border-t">
                        <h5 className="font-medium mb-3">Example</h5>
                        {module.content.examples.map((example, idx) => (
                          <div key={idx} className="space-y-3">
                            <div className="font-medium text-sm">{example.title}</div>
                            {example.bad && (
                              <div className="bg-red-500/5 border border-red-200 dark:border-red-800 p-3 rounded-lg">
                                <div className="text-xs font-medium text-red-600 dark:text-red-400 mb-1">❌ Less Effective:</div>
                                <p className="text-sm italic">"{example.bad}"</p>
                              </div>
                            )}
                            <div className="bg-green-500/5 border border-green-200 dark:border-green-800 p-3 rounded-lg">
                              <div className="text-xs font-medium text-green-600 dark:text-green-400 mb-1">✅ More Effective:</div>
                              <p className="text-sm whitespace-pre-wrap">"{example.good}"</p>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              <strong>Why:</strong> {example.explanation}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Example Content */}
            {module.type === 'example' && (
              <div className="space-y-4">
                <Card className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/5 border-yellow-200 dark:border-yellow-800">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-3 mb-4">
                      <Lightbulb className="h-6 w-6 text-yellow-500 shrink-0 mt-1" />
                      <div>
                        <h4 className="font-semibold text-lg">Examples Library</h4>
                        <p className="text-sm text-muted-foreground">{module.description}</p>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">{module.content.overview}</p>
                  </CardContent>
                </Card>
                
                {module.content.examples && module.content.examples.map((example, idx) => (
                  <Card key={idx} className="overflow-hidden">
                    <div className="bg-muted px-4 py-3 font-medium border-b flex items-center gap-2">
                      <span className="h-6 w-6 rounded-full bg-yellow-500 text-white text-xs flex items-center justify-center">
                        {idx + 1}
                      </span>
                      {example.title}
                    </div>
                    <CardContent className="pt-4 space-y-4">
                      {example.bad && (
                        <div className="bg-red-500/5 border border-red-200 dark:border-red-800 p-4 rounded-lg">
                          <div className="text-sm font-medium text-red-600 dark:text-red-400 mb-2 flex items-center gap-2">
                            <span className="text-lg">❌</span> Less Effective Approach
                          </div>
                          <p className="text-sm italic bg-red-50 dark:bg-red-950/50 p-3 rounded border border-red-100 dark:border-red-900">
                            "{example.bad}"
                          </p>
                        </div>
                      )}
                      <div className="bg-green-500/5 border border-green-200 dark:border-green-800 p-4 rounded-lg">
                        <div className="text-sm font-medium text-green-600 dark:text-green-400 mb-2 flex items-center gap-2">
                          <span className="text-lg">✅</span> More Effective Approach
                        </div>
                        <p className="text-sm whitespace-pre-wrap bg-green-50 dark:bg-green-950/50 p-3 rounded border border-green-100 dark:border-green-900">
                          "{example.good}"
                        </p>
                      </div>
                      <div className="bg-muted/50 p-3 rounded-lg">
                        <div className="text-sm font-medium mb-1">💡 Why this works:</div>
                        <p className="text-sm text-muted-foreground">{example.explanation}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Exercise Content */}
            {module.type === 'exercise' && (
              <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-200 dark:border-green-800">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3 mb-4">
                    <Play className="h-6 w-6 text-green-500 shrink-0 mt-1" />
                    <div>
                      <h4 className="font-semibold text-lg">Hands-On Exercise</h4>
                      <p className="text-sm text-muted-foreground">{module.description}</p>
                    </div>
                  </div>
                  <div className="bg-card rounded-lg p-4 border space-y-4">
                    <div>
                      <h5 className="font-medium mb-2">What You'll Practice</h5>
                      <p className="text-sm text-muted-foreground">{module.content.overview}</p>
                    </div>
                    <div className="pt-4 border-t">
                      <h5 className="font-medium mb-2">Exercise Task</h5>
                      <p className="text-sm mb-3">{module.content.practiceTask.instructions}</p>
                      <div className="bg-muted p-4 rounded-lg text-sm whitespace-pre-wrap">
                        {module.content.practiceTask.scenario}
                      </div>
                    </div>
                    <div className="pt-4 border-t">
                      <h5 className="font-medium mb-2">Hints</h5>
                      <ul className="space-y-2">
                        {module.content.practiceTask.hints.map((hint, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                            <Lightbulb className="h-4 w-4 text-yellow-500 shrink-0 mt-0.5" />
                            {hint}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Key Points (for all types) */}
            <Card>
              <CardContent className="pt-6">
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  Key Points to Remember
                </h4>
                <ul className="space-y-2">
                  {module.content.keyPoints.map((point, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-sm">
                      <span className="h-5 w-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      {point}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Learning Objectives */}
            <Card>
              <CardContent className="pt-6">
                <h4 className="font-medium mb-3">Learning Objectives</h4>
                <ul className="space-y-2">
                  {module.learningObjectives.map((obj, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                      {obj}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}