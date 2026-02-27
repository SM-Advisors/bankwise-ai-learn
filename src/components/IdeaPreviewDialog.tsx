import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, Code, Eye, X } from 'lucide-react';

interface IdeaPreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  html: string | null;
  isGenerating?: boolean;
}

export function IdeaPreviewDialog({
  open,
  onOpenChange,
  title,
  html,
  isGenerating,
}: IdeaPreviewDialogProps) {
  const [showSource, setShowSource] = useState(false);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl w-[95vw] h-[85vh] flex flex-col p-0 gap-0">
        {/* Header */}
        <DialogHeader className="px-4 py-3 border-b shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-base font-semibold flex items-center gap-2">
              <Eye className="h-4 w-4 text-primary" />
              {title}
            </DialogTitle>
            <div className="flex items-center gap-2">
              {html && !isGenerating && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1.5 text-xs h-7"
                  onClick={() => setShowSource(!showSource)}
                >
                  <Code className="h-3.5 w-3.5" />
                  {showSource ? 'Preview' : 'View Source'}
                </Button>
              )}
            </div>
          </div>
        </DialogHeader>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {isGenerating ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 p-8">
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-primary/10 animate-ping" />
                <div className="relative p-4 rounded-full bg-primary/10">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              </div>
              <div className="text-center">
                <h3 className="font-semibold text-lg">Building your preview...</h3>
                <p className="text-sm text-muted-foreground mt-1 max-w-md">
                  Claude is generating an interactive prototype of your idea.
                  This typically takes 30-60 seconds.
                </p>
              </div>
              <div className="flex gap-1.5 mt-2">
                {[0, 1, 2].map(i => (
                  <div
                    key={i}
                    className="w-2 h-2 rounded-full bg-primary/40 animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </div>
            </div>
          ) : html ? (
            showSource ? (
              <pre className="h-full overflow-auto p-4 text-xs font-mono bg-muted/30 whitespace-pre-wrap break-words">
                {html}
              </pre>
            ) : (
              <iframe
                srcDoc={html}
                sandbox="allow-scripts"
                className="w-full h-full border-0"
                title={`Preview: ${title}`}
              />
            )
          ) : (
            <div className="flex flex-col items-center justify-center h-full gap-3 p-8 text-center">
              <Code className="h-10 w-10 text-muted-foreground/30" />
              <p className="text-muted-foreground text-sm">No preview available</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
