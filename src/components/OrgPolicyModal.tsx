import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Shield, Lightbulb, FileText } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface OrgPolicy {
  id: string;
  policy_type: string;
  title: string;
  content: string;
  summary: string | null;
  icon: string | null;
}

interface OrgPolicyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  policy: OrgPolicy | null;
}

const iconMap: Record<string, React.ElementType> = {
  BookOpen,
  Shield,
  Lightbulb,
  FileText,
};

export function OrgPolicyModal({ open, onOpenChange, policy }: OrgPolicyModalProps) {
  if (!policy) return null;

  const IconComponent = iconMap[policy.icon || 'BookOpen'] || BookOpen;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[85vh] flex flex-col p-0">
        <DialogHeader className="p-6 pb-4 border-b">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <IconComponent className="h-5 w-5 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-xl">{policy.title}</DialogTitle>
              <Badge variant="outline" className="mt-1">{policy.policy_type.replace('_', ' ')}</Badge>
            </div>
          </div>
          {policy.summary && (
            <p className="text-sm text-muted-foreground mt-2">{policy.summary}</p>
          )}
        </DialogHeader>
        <ScrollArea className="flex-1 p-6">
          <div className="prose prose-sm max-w-none dark:prose-invert
            [&>h1]:text-2xl [&>h1]:font-bold [&>h1]:mb-4 [&>h1]:mt-6 [&>h1:first-child]:mt-0
            [&>h2]:text-xl [&>h2]:font-semibold [&>h2]:mb-3 [&>h2]:mt-6
            [&>h3]:text-lg [&>h3]:font-medium [&>h3]:mb-2 [&>h3]:mt-4
            [&>p]:mb-3 [&>p]:leading-relaxed
            [&>ul]:mb-4 [&>ul]:ml-4 [&>ul>li]:mb-1
            [&>ol]:mb-4 [&>ol]:ml-4 [&>ol>li]:mb-1
            [&_strong]:font-semibold">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {policy.content}
            </ReactMarkdown>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
