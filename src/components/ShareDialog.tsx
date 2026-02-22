import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useShareContent, type ShareDestination, type ShareType } from '@/hooks/useShareContent';
import { Users, Lightbulb, Building2, AlertCircle, Loader2 } from 'lucide-react';

interface ShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Pre-populated from Andrea's suggestion or explicit user request */
  initialType?: ShareType;
  initialTitle?: string;
  initialBody?: string;
  initialDestinations?: ShareDestination[];
  sourceType?: 'manual' | 'andrea_suggested' | 'andrea_user_requested';
  sourceContext?: string;
  linkedContentId?: string;
  linkedContentType?: 'agent' | 'workflow';
}

const TYPE_LABELS: Record<ShareType, string> = {
  idea: 'Idea',
  friction_point: 'Friction Point',
  agent: 'AI Agent',
  workflow: 'AI Workflow',
};

const DESTINATION_CONFIG: { key: ShareDestination; label: string; description: string; icon: React.ReactNode }[] = [
  {
    key: 'my_ideas',
    label: 'My Ideas',
    description: 'Save to your personal ideas list',
    icon: <Lightbulb className="h-4 w-4 text-yellow-500" />,
  },
  {
    key: 'community',
    label: 'Community Discussion',
    description: 'Share with all colleagues in the community feed',
    icon: <Users className="h-4 w-4 text-blue-500" />,
  },
  {
    key: 'executive',
    label: 'Submit to Leadership',
    description: 'Escalate to the Chief AI Officer / designee',
    icon: <Building2 className="h-4 w-4 text-purple-500" />,
  },
];

export function ShareDialog({
  open,
  onOpenChange,
  initialType = 'idea',
  initialTitle = '',
  initialBody = '',
  initialDestinations = ['my_ideas'],
  sourceType = 'manual',
  sourceContext,
  linkedContentId,
  linkedContentType,
}: ShareDialogProps) {
  const { toast } = useToast();
  const { share } = useShareContent();

  const [type] = useState<ShareType>(initialType);
  const [title, setTitle] = useState(initialTitle);
  const [body, setBody] = useState(initialBody);
  const [destinations, setDestinations] = useState<ShareDestination[]>(initialDestinations);
  const [saving, setSaving] = useState(false);

  const toggleDest = (dest: ShareDestination) => {
    setDestinations((prev) =>
      prev.includes(dest) ? prev.filter((d) => d !== dest) : [...prev, dest]
    );
  };

  const handleShare = async () => {
    if (!title.trim()) {
      toast({ title: 'Title required', description: 'Please enter a title.', variant: 'destructive' });
      return;
    }
    if (!body.trim()) {
      toast({ title: 'Description required', description: 'Please add a description.', variant: 'destructive' });
      return;
    }
    if (destinations.length === 0) {
      toast({ title: 'Select a destination', description: 'Choose where to share this.', variant: 'destructive' });
      return;
    }

    setSaving(true);
    const result = await share({
      type,
      title: title.trim(),
      body: body.trim(),
      destinations,
      sourceType,
      sourceContext,
      linkedContentId,
      linkedContentType,
    });
    setSaving(false);

    if (result.success) {
      const destLabels = result.shared
        .map((d) => DESTINATION_CONFIG.find((c) => c.key === d)?.label ?? d)
        .join(', ');
      toast({ title: 'Shared!', description: `Shared to: ${destLabels}` });
      onOpenChange(false);
    } else {
      toast({
        title: 'Some shares failed',
        description: result.errors.join(' | '),
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Share{' '}
            <Badge variant="outline" className="text-xs">
              {TYPE_LABELS[type]}
            </Badge>
          </DialogTitle>
          <DialogDescription>
            Share this with your colleagues, save it for later, or escalate to leadership.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Title */}
          <div className="space-y-1.5">
            <Label htmlFor="share-title">Title</Label>
            <Input
              id="share-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Give it a clear, descriptive title..."
              maxLength={120}
            />
          </div>

          {/* Body */}
          <div className="space-y-1.5">
            <Label htmlFor="share-body">Description</Label>
            <Textarea
              id="share-body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Describe the idea, friction point, or what this agent/workflow does..."
              rows={4}
              className="resize-none"
            />
          </div>

          {/* Destinations */}
          <div className="space-y-2">
            <Label>Share to</Label>
            <div className="space-y-2">
              {DESTINATION_CONFIG.map((config) => (
                <label
                  key={config.key}
                  className="flex items-start gap-3 p-3 rounded-md border cursor-pointer hover:bg-muted/50 transition-colors"
                >
                  <Checkbox
                    checked={destinations.includes(config.key)}
                    onCheckedChange={() => toggleDest(config.key)}
                    className="mt-0.5"
                  />
                  <div className="flex items-center gap-2 flex-1">
                    {config.icon}
                    <div>
                      <p className="text-sm font-medium">{config.label}</p>
                      <p className="text-xs text-muted-foreground">{config.description}</p>
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Executive warning */}
          {destinations.includes('executive') && (
            <div className="flex gap-2 p-3 rounded-md bg-purple-500/10 border border-purple-500/20">
              <AlertCircle className="h-4 w-4 text-purple-500 mt-0.5 shrink-0" />
              <p className="text-xs text-purple-700 dark:text-purple-300">
                This will be visible to the Chief AI Officer / designee. Make sure your description is clear and actionable.
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleShare} disabled={saving || destinations.length === 0}>
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Sharing...
              </>
            ) : (
              'Share'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
