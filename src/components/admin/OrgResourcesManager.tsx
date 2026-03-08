import { useState } from 'react';
import { useOrgResources, type OrgResource } from '@/hooks/useOrgResources';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Plus,
  Edit,
  Trash2,
  Video,
  FileText,
  Link,
  ExternalLink,
  Loader2,
  GripVertical,
} from 'lucide-react';

interface OrgResourcesManagerProps {
  organizationId: string | null;
}

const RESOURCE_TYPE_OPTIONS = [
  { value: 'link', label: 'Link', icon: Link },
  { value: 'video', label: 'Video', icon: Video },
  { value: 'document', label: 'Document', icon: FileText },
] as const;

const RESOURCE_ICONS: Record<string, React.ElementType> = {
  video: Video,
  document: FileText,
  link: Link,
};

type ResourceType = 'video' | 'document' | 'link';

interface ResourceForm {
  title: string;
  description: string;
  resource_type: ResourceType;
  url: string;
  display_order: number;
  is_active: boolean;
}

const DEFAULT_FORM: ResourceForm = {
  title: '',
  description: '',
  resource_type: 'link',
  url: '',
  display_order: 0,
  is_active: true,
};

export function OrgResourcesManager({ organizationId }: OrgResourcesManagerProps) {
  const { resources, loading, addResource, updateResource, deleteResource } =
    useOrgResources(organizationId);
  const { toast } = useToast();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<OrgResource | null>(null);
  const [form, setForm] = useState<ResourceForm>(DEFAULT_FORM);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const openAddDialog = () => {
    setEditingResource(null);
    setForm({ ...DEFAULT_FORM, display_order: resources.length });
    setDialogOpen(true);
  };

  const openEditDialog = (resource: OrgResource) => {
    setEditingResource(resource);
    setForm({
      title: resource.title,
      description: resource.description ?? '',
      resource_type: resource.resource_type,
      url: resource.url,
      display_order: resource.display_order,
      is_active: resource.is_active,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.title.trim()) {
      toast({ title: 'Title is required', variant: 'destructive' });
      return;
    }
    if (!form.url.trim()) {
      toast({ title: 'URL is required', variant: 'destructive' });
      return;
    }

    setSaving(true);
    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim() || null,
        resource_type: form.resource_type,
        url: form.url.trim(),
        display_order: form.display_order,
        is_active: form.is_active,
      };

      if (editingResource) {
        const result = await updateResource(editingResource.id, payload);
        if (result.success) {
          toast({ title: 'Resource updated' });
          setDialogOpen(false);
        } else {
          toast({ title: 'Error', description: result.error, variant: 'destructive' });
        }
      } else {
        const result = await addResource(payload);
        if (result.success) {
          toast({ title: 'Resource added' });
          setDialogOpen(false);
        } else {
          toast({ title: 'Error', description: result.error, variant: 'destructive' });
        }
      }
    } catch (e) {
      toast({ title: 'Error', description: e instanceof Error ? e.message : 'An error occurred', variant: 'destructive' });
    }
    setSaving(false);
  };

  const handleDelete = async (resource: OrgResource) => {
    setDeletingId(resource.id);
    try {
      const result = await deleteResource(resource.id);
      if (result.success) {
        toast({ title: 'Resource deleted' });
      } else {
        toast({ title: 'Error', description: result.error, variant: 'destructive' });
      }
    } catch (e) {
      toast({ title: 'Error', description: e instanceof Error ? e.message : 'An error occurred', variant: 'destructive' });
    }
    setDeletingId(null);
  };

  const handleToggleActive = async (resource: OrgResource) => {
    const result = await updateResource(resource.id, { is_active: !resource.is_active });
    if (!result.success) {
      toast({ title: 'Error', description: result.error, variant: 'destructive' });
    }
  };

  if (!organizationId) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground text-sm">
          No organization selected.
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div>
            <CardTitle className="text-base">Help Resources</CardTitle>
            <CardDescription className="text-xs mt-1">
              Add videos, documents, and links that appear in the Help panel for your users.
              Drag to reorder, toggle the switch to show or hide.
            </CardDescription>
          </div>
          <Button size="sm" className="shrink-0 gap-1.5" onClick={openAddDialog}>
            <Plus className="h-4 w-4" />
            Add Resource
          </Button>
        </CardHeader>

        <CardContent className="space-y-2">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : resources.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground text-sm border rounded-lg border-dashed">
              <Link className="h-8 w-8 mx-auto mb-2 opacity-30" />
              <p>No resources yet.</p>
              <p className="text-xs mt-1 opacity-70">
                Add a video, document, or link to get started.
              </p>
            </div>
          ) : (
            resources.map((resource) => {
              const Icon = RESOURCE_ICONS[resource.resource_type] ?? Link;
              const typeOption = RESOURCE_TYPE_OPTIONS.find(
                (t) => t.value === resource.resource_type,
              );
              return (
                <div
                  key={resource.id}
                  className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                    resource.is_active ? 'bg-background' : 'bg-muted/30 opacity-60'
                  }`}
                >
                  {/* Drag handle (visual only) */}
                  <GripVertical className="h-4 w-4 text-muted-foreground shrink-0 cursor-grab" />

                  {/* Icon */}
                  <div className="h-8 w-8 rounded-md bg-muted flex items-center justify-center shrink-0">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm truncate">{resource.title}</p>
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0 shrink-0">
                        {typeOption?.label ?? resource.resource_type}
                      </Badge>
                    </div>
                    <a
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1 truncate max-w-xs"
                    >
                      {resource.url}
                      <ExternalLink className="h-3 w-3 shrink-0" />
                    </a>
                    {resource.description && (
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">
                        {resource.description}
                      </p>
                    )}
                  </div>

                  {/* Active toggle */}
                  <Switch
                    checked={resource.is_active}
                    onCheckedChange={() => handleToggleActive(resource)}
                    aria-label={resource.is_active ? 'Hide resource' : 'Show resource'}
                  />

                  {/* Edit */}
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 shrink-0"
                    onClick={() => openEditDialog(resource)}
                  >
                    <Edit className="h-3.5 w-3.5" />
                  </Button>

                  {/* Delete */}
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 shrink-0 text-destructive hover:text-destructive"
                    onClick={() => handleDelete(resource)}
                    disabled={deletingId === resource.id}
                  >
                    {deletingId === resource.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="h-3.5 w-3.5" />
                    )}
                  </Button>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>

      {/* Add / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingResource ? 'Edit Resource' : 'Add Resource'}</DialogTitle>
            <DialogDescription>
              {editingResource
                ? 'Update the resource details below.'
                : 'Paste a URL and add a title. This will appear in the user Help panel.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Title */}
            <div className="space-y-1.5">
              <Label htmlFor="res-title">
                Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="res-title"
                placeholder="e.g. AI Governance Policy"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              />
            </div>

            {/* Type */}
            <div className="space-y-1.5">
              <Label>Type</Label>
              <Select
                value={form.resource_type}
                onValueChange={(val) =>
                  setForm((f) => ({ ...f, resource_type: val as ResourceType }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {RESOURCE_TYPE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* URL */}
            <div className="space-y-1.5">
              <Label htmlFor="res-url">
                URL <span className="text-destructive">*</span>
              </Label>
              <Input
                id="res-url"
                type="url"
                placeholder="https://..."
                value={form.url}
                onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))}
              />
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <Label htmlFor="res-desc">Description (optional)</Label>
              <Textarea
                id="res-desc"
                placeholder="Brief description visible to users"
                rows={2}
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              />
            </div>

            {/* Display Order */}
            <div className="space-y-1.5">
              <Label htmlFor="res-order">Display Order</Label>
              <Input
                id="res-order"
                type="number"
                min={0}
                value={form.display_order}
                onChange={(e) =>
                  setForm((f) => ({ ...f, display_order: parseInt(e.target.value, 10) || 0 }))
                }
              />
            </div>

            {/* Active toggle */}
            <div className="flex items-center justify-between">
              <Label htmlFor="res-active">Visible to users</Label>
              <Switch
                id="res-active"
                checked={form.is_active}
                onCheckedChange={(checked) => setForm((f) => ({ ...f, is_active: checked }))}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving…
                </>
              ) : editingResource ? (
                'Save Changes'
              ) : (
                'Add Resource'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
