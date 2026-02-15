import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useUserIdeas, IdeaStatus } from '@/hooks/useUserIdeas';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Lightbulb, ArrowLeft, Plus, Loader2, Trash2, Pencil,
  Clock, BookOpen, CalendarClock
} from 'lucide-react';
import { ProfileDropdown } from '@/components/ProfileDropdown';

const STATUS_CONFIG: Record<IdeaStatus, { label: string; icon: React.ElementType; variant: 'default' | 'secondary' | 'outline' }> = {
  not_started: { label: 'Not Started', icon: Clock, variant: 'outline' },
  needs_knowledge: { label: 'Needs Knowledge', icon: BookOpen, variant: 'secondary' },
  future: { label: 'Future Project', icon: CalendarClock, variant: 'default' },
};

export default function Ideas() {
  const navigate = useNavigate();
  const { profile, loading: authLoading } = useAuth();
  const { ideas, loading, createIdea, updateIdea, deleteIdea } = useUserIdeas();
  const { toast } = useToast();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingIdea, setEditingIdea] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<IdeaStatus>('not_started');

  if (authLoading || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setStatus('not_started');
    setEditingIdea(null);
  };

  const handleOpenCreate = () => {
    resetForm();
    setDialogOpen(true);
  };

  const handleOpenEdit = (idea: typeof ideas[0]) => {
    setTitle(idea.title);
    setDescription(idea.description);
    setStatus(idea.status);
    setEditingIdea(idea.id);
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      toast({ title: 'Title is required', variant: 'destructive' });
      return;
    }

    let result;
    if (editingIdea) {
      result = await updateIdea(editingIdea, { title: title.trim(), description: description.trim(), status });
    } else {
      result = await createIdea({ title: title.trim(), description: description.trim(), status });
    }

    if (result?.success) {
      toast({ title: editingIdea ? 'Idea updated' : 'Idea saved' });
      setDialogOpen(false);
      resetForm();
    } else {
      toast({ title: result?.error || 'Something went wrong', variant: 'destructive' });
    }
  };

  const handleDelete = async (id: string) => {
    const result = await deleteIdea(id);
    if (result.success) {
      toast({ title: 'Idea removed' });
    } else {
      toast({ title: 'Failed to delete idea', variant: 'destructive' });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-xl font-display font-bold flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-yellow-500" />
                My Ideas
              </h1>
              <p className="text-sm text-muted-foreground">
                Capture AI use case ideas for future exploration
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <ProfileDropdown />
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Summary + Add Button */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-muted-foreground">
              {ideas.length === 0
                ? "You haven't captured any ideas yet. Start adding AI use cases you'd like to explore!"
                : `You have ${ideas.length} idea${ideas.length === 1 ? '' : 's'} saved.`}
            </p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
            <DialogTrigger asChild>
              <Button className="gap-2" onClick={handleOpenCreate}>
                <Plus className="h-4 w-4" />
                Add Idea
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingIdea ? 'Edit Idea' : 'New Idea'}</DialogTitle>
                <DialogDescription>
                  Describe an AI use case you'd like to explore in the future.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Title</label>
                  <Input
                    placeholder="e.g., Automate loan document review"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Description</label>
                  <Textarea
                    placeholder="Describe the use case, what problem it solves, and any notes..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Status</label>
                  <Select value={status} onValueChange={(v) => setStatus(v as IdeaStatus)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="not_started">Not Started</SelectItem>
                      <SelectItem value="needs_knowledge">Needs Knowledge</SelectItem>
                      <SelectItem value="future">Future Project</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => { setDialogOpen(false); resetForm(); }}>
                  Cancel
                </Button>
                <Button onClick={handleSubmit}>
                  {editingIdea ? 'Save Changes' : 'Save Idea'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Ideas List */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : ideas.length === 0 ? (
          <Card className="border-2 border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Lightbulb className="h-12 w-12 text-muted-foreground/30 mb-4" />
              <h3 className="text-lg font-medium mb-1">No ideas yet</h3>
              <p className="text-muted-foreground text-sm mb-4">
                Start capturing AI use cases you want to explore later.
              </p>
              <Button className="gap-2" onClick={handleOpenCreate}>
                <Plus className="h-4 w-4" />
                Add Your First Idea
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {ideas.map((idea) => {
              const statusConfig = STATUS_CONFIG[idea.status];
              const StatusIcon = statusConfig.icon;
              return (
                <Card key={idea.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-base">{idea.title}</CardTitle>
                      <Badge variant={statusConfig.variant} className="gap-1 shrink-0 ml-2">
                        <StatusIcon className="h-3 w-3" />
                        {statusConfig.label}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {idea.description && (
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                        {idea.description}
                      </p>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        {new Date(idea.created_at).toLocaleDateString()}
                      </span>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenEdit(idea)}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleDelete(idea.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
