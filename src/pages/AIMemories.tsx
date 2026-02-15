import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAIMemories } from '@/hooks/useAIPreferences';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import {
  ArrowLeft, Brain, Pin, PinOff, Trash2, Plus, Loader2, BookOpen
} from 'lucide-react';

export default function AIMemories() {
  const navigate = useNavigate();
  const { memories, loading, createMemory, togglePin, deleteMemory } = useAIMemories();
  const { toast } = useToast();

  const [isCreating, setIsCreating] = useState(false);
  const [newContent, setNewContent] = useState('');
  const [saving, setSaving] = useState(false);

  const handleCreate = async () => {
    if (!newContent.trim()) return;
    setSaving(true);
    const result = await createMemory({ content: newContent.trim(), source: 'user_saved' });
    if (result.success) {
      toast({ title: 'Memory saved', description: 'Andrea will remember this.' });
      setIsCreating(false);
      setNewContent('');
    } else {
      toast({ title: 'Error', description: result.error, variant: 'destructive' });
    }
    setSaving(false);
  };

  const handleTogglePin = async (id: string, isPinned: boolean) => {
    const result = await togglePin(id, isPinned);
    if (result.success) {
      toast({ title: isPinned ? 'Unpinned' : 'Pinned', description: isPinned ? 'Memory unpinned.' : 'Memory pinned — Andrea will prioritize this.' });
    }
  };

  const handleDelete = async (id: string) => {
    const result = await deleteMemory(id);
    if (result.success) {
      toast({ title: 'Memory removed', description: 'Andrea will no longer reference this.' });
    }
  };

  const pinnedMemories = memories.filter((m) => m.is_pinned);
  const unpinnedMemories = memories.filter((m) => !m.is_pinned);

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

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Brain className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">AI Memories</h1>
            <p className="text-sm text-muted-foreground">
              Important insights Andrea remembers about you
            </p>
          </div>
        </div>
        <Button onClick={() => setIsCreating(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          New Memory
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : memories.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <BookOpen className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
              <h3 className="font-medium mb-1">No memories yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Save important insights from your training sessions. Andrea will use these to personalize your experience.
              </p>
              <Button variant="outline" onClick={() => setIsCreating(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Add Your First Memory
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Pinned Memories */}
          {pinnedMemories.length > 0 && (
            <div>
              <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
                <Pin className="h-3.5 w-3.5" />
                Pinned ({pinnedMemories.length})
              </h2>
              <div className="space-y-3">
                {pinnedMemories.map((memory) => (
                  <Card key={memory.id} className="border-primary/30 bg-primary/5">
                    <CardContent className="pt-4 pb-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <p className="text-sm">{memory.content}</p>
                          <div className="flex items-center gap-2 mt-2">
                            {memory.source && (
                              <Badge variant="outline" className="text-xs">{memory.source.replace('_', ' ')}</Badge>
                            )}
                            {memory.context && (
                              <Badge variant="secondary" className="text-xs">{memory.context}</Badge>
                            )}
                            <span className="text-xs text-muted-foreground">
                              {new Date(memory.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-1 shrink-0">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleTogglePin(memory.id, true)}
                            className="h-7 w-7 p-0"
                            title="Unpin"
                          >
                            <PinOff className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(memory.id)}
                            className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                            title="Delete"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Unpinned Memories */}
          {unpinnedMemories.length > 0 && (
            <div>
              {pinnedMemories.length > 0 && (
                <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3">
                  Other Memories ({unpinnedMemories.length})
                </h2>
              )}
              <div className="space-y-3">
                {unpinnedMemories.map((memory) => (
                  <Card key={memory.id}>
                    <CardContent className="pt-4 pb-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <p className="text-sm">{memory.content}</p>
                          <div className="flex items-center gap-2 mt-2">
                            {memory.source && (
                              <Badge variant="outline" className="text-xs">{memory.source.replace('_', ' ')}</Badge>
                            )}
                            {memory.context && (
                              <Badge variant="secondary" className="text-xs">{memory.context}</Badge>
                            )}
                            <span className="text-xs text-muted-foreground">
                              {new Date(memory.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-1 shrink-0">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleTogglePin(memory.id, false)}
                            className="h-7 w-7 p-0"
                            title="Pin"
                          >
                            <Pin className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(memory.id)}
                            className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                            title="Delete"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Create Memory Dialog */}
      <Dialog open={isCreating} onOpenChange={setIsCreating}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Memory</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              placeholder="e.g., I prefer examples using commercial lending scenarios. I'm studying for the CFA exam."
              className="min-h-[120px]"
            />
            <p className="text-xs text-muted-foreground mt-2">
              Andrea will use this to personalize your training experience.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setIsCreating(false); setNewContent(''); }}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={saving || !newContent.trim()} className="gap-2">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              Save Memory
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
