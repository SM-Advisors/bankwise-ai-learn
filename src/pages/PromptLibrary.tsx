import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useUserPrompts } from '@/hooks/useUserPrompts';
import type { UserPrompt } from '@/hooks/useUserPrompts';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import {
  ArrowLeft, Plus, Search, Copy, Pencil, Trash2, BookOpen,
  Star, StarOff, Filter, Loader2,
} from 'lucide-react';

const CATEGORIES = [
  'Credit / Lending',
  'Compliance / Risk',
  'Finance / Accounting',
  'Operations',
  'Customer Service',
  'General',
  'Agent Template',
  'Workflow',
];

export default function PromptLibrary() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { toast } = useToast();
  const { prompts, loading, createPrompt, updatePrompt, deletePrompt, toggleFavorite } = useUserPrompts();

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState<UserPrompt | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);

  // New prompt form state
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState('General');
  const [newTags, setNewTags] = useState('');

  const filteredPrompts = useMemo(() => {
    let filtered = [...prompts];
    if (showFavoritesOnly) filtered = filtered.filter((p) => p.is_favorite);
    if (categoryFilter !== 'all') filtered = filtered.filter((p) => p.category === categoryFilter);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.content.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q))
      );
    }
    return filtered.sort((a, b) => {
      if (a.is_favorite !== b.is_favorite) return a.is_favorite ? -1 : 1;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }, [prompts, searchQuery, categoryFilter, showFavoritesOnly]);

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
    toast({ title: 'Copied to clipboard', description: 'Paste this prompt into your AI tool.' });
  };

  const handleDelete = async (id: string) => {
    await deletePrompt(id);
    toast({ title: 'Prompt deleted' });
  };

  const handleSaveNew = async () => {
    if (!newTitle.trim() || !newContent.trim()) return;
    await createPrompt({
      title: newTitle.trim(),
      content: newContent.trim(),
      category: newCategory,
      tags: newTags.split(',').map((t) => t.trim()).filter(Boolean),
    });
    setShowAddDialog(false);
    resetForm();
    toast({ title: 'Prompt saved!' });
  };

  const handleSaveEdit = async () => {
    if (!editingPrompt || !newTitle.trim() || !newContent.trim()) return;
    await updatePrompt(editingPrompt.id, {
      title: newTitle.trim(),
      content: newContent.trim(),
      category: newCategory,
      tags: newTags.split(',').map((t) => t.trim()).filter(Boolean),
    });
    setEditingPrompt(null);
    resetForm();
    toast({ title: 'Prompt updated!' });
  };

  const resetForm = () => {
    setNewTitle('');
    setNewContent('');
    setNewCategory('General');
    setNewTags('');
  };

  const openEdit = (prompt: UserPrompt) => {
    setNewTitle(prompt.title);
    setNewContent(prompt.content);
    setNewCategory(prompt.category);
    setNewTags(prompt.tags.join(', '));
    setEditingPrompt(prompt);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <div className="container mx-auto px-4 py-6">
        {/* Search + Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search prompts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[180px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {CATEGORIES.map((cat) => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant={showFavoritesOnly ? 'default' : 'outline'}
            size="icon"
            onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
            title="Show favorites only"
          >
            <Star className={`h-4 w-4 ${showFavoritesOnly ? 'fill-current' : ''}`} />
          </Button>
        </div>

        {/* Prompts Grid */}
        {filteredPrompts.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <div className="mx-auto h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <BookOpen className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="font-semibold mb-1">
                {prompts.length === 0 ? 'No prompts yet' : 'No matching prompts'}
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                {prompts.length === 0
                  ? 'When Andrea suggests saving a prompt during training, it will appear here. You can also add prompts manually.'
                  : 'Try adjusting your search or filters.'}
              </p>
              {prompts.length === 0 && (
                <Button onClick={() => setShowAddDialog(true)} variant="outline" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Your First Prompt
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredPrompts.map((prompt) => (
              <Card key={prompt.id} className="flex flex-col hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-base line-clamp-1">{prompt.title}</CardTitle>
                    <button
                      onClick={() => toggleFavorite(prompt.id)}
                      className="shrink-0 ml-2"
                    >
                      {prompt.is_favorite ? (
                        <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                      ) : (
                        <StarOff className="h-4 w-4 text-muted-foreground hover:text-amber-500" />
                      )}
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-[10px]">{prompt.category}</Badge>
                    {prompt.source && (
                      <Badge variant="outline" className="text-[10px]">{prompt.source}</Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  <p className="text-sm text-muted-foreground line-clamp-4 flex-1 whitespace-pre-wrap font-mono text-xs bg-muted/30 rounded p-2 mb-3">
                    {prompt.content}
                  </p>
                  {prompt.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {prompt.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-[10px]">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-muted-foreground">
                      {new Date(prompt.created_at).toLocaleDateString()}
                    </span>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleCopy(prompt.content)} title="Copy">
                        <Copy className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(prompt)} title="Edit">
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDelete(prompt.id)} title="Delete">
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Add / Edit Dialog */}
      <Dialog
        open={showAddDialog || !!editingPrompt}
        onOpenChange={(open) => {
          if (!open) {
            setShowAddDialog(false);
            setEditingPrompt(null);
            resetForm();
          }
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingPrompt ? 'Edit Prompt' : 'Save New Prompt'}</DialogTitle>
            <DialogDescription>
              {editingPrompt ? 'Update this prompt in your library.' : 'Add a reusable prompt to your library.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="prompt-title">Title</Label>
              <Input
                id="prompt-title"
                placeholder="e.g., Credit Memo Draft"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="prompt-content">Prompt Content</Label>
              <Textarea
                id="prompt-content"
                placeholder="Paste or type your prompt here..."
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                className="min-h-[150px] font-mono text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Category</Label>
                <Select value={newCategory} onValueChange={setNewCategory}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="prompt-tags">Tags (comma-separated)</Label>
                <Input
                  id="prompt-tags"
                  placeholder="e.g., CLEAR, credit, memo"
                  value={newTags}
                  onChange={(e) => setNewTags(e.target.value)}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowAddDialog(false); setEditingPrompt(null); resetForm(); }}>
              Cancel
            </Button>
            <Button
              onClick={editingPrompt ? handleSaveEdit : handleSaveNew}
              disabled={!newTitle.trim() || !newContent.trim()}
            >
              {editingPrompt ? 'Save Changes' : 'Save Prompt'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
