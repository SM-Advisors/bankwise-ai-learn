import { useState } from 'react';
import { useIndustryContent } from '@/hooks/useIndustryContent';
import { useAllDepartments, useDepartmentRoles, type Department, type DepartmentRole } from '@/hooks/useDepartments';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  Building2, Plus, Edit, ChevronDown, ChevronRight, Users, Loader2,
  Eye, EyeOff,
} from 'lucide-react';

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'An unexpected error occurred';
}

export function DepartmentsManager() {
  const { departments, loading, refetch, createDepartment, updateDepartment, toggleDepartment } = useAllDepartments();
  const { config: industryConfig } = useIndustryContent();
  const { toast } = useToast();
  const [expandedDept, setExpandedDept] = useState<string | null>(null);
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [addingDept, setAddingDept] = useState(false);
  const [addingRole, setAddingRole] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Form state for add/edit department
  const [deptForm, setDeptForm] = useState({ name: '', slug: '', description: '', icon: 'Building2' });
  // Form state for add role
  const [roleForm, setRoleForm] = useState({ name: '', description: '' });

  const activeDepts = departments.filter((d) => d.is_active);
  const inactiveDepts = departments.filter((d) => !d.is_active);

  const handleAddDept = async () => {
    if (!deptForm.name.trim()) return;
    setSaving(true);
    try {
      // Get the first available industry ID
      const { data: industries } = await (supabase as any).from('industries').select('id').limit(1).single();
      const industryId = (industries as { id?: string } | null)?.id;
      if (!industryId) throw new Error('No industry found');

      const slug = deptForm.slug.trim() || deptForm.name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
      await createDepartment({
        industry_id: industryId,
        name: deptForm.name.trim(),
        slug,
        description: deptForm.description.trim() || null,
        icon: deptForm.icon || 'Building2',
        display_order: departments.length,
      });
      toast({ title: 'Department added' });
      setAddingDept(false);
      setDeptForm({ name: '', slug: '', description: '', icon: 'Building2' });
    } catch (error: unknown) {
      toast({ title: 'Error', description: getErrorMessage(error), variant: 'destructive' });
    }
    setSaving(false);
  };

  const handleEditDept = async () => {
    if (!editingDept || !deptForm.name.trim()) return;
    setSaving(true);
    try {
      await updateDepartment(editingDept.id, {
        name: deptForm.name.trim(),
        description: deptForm.description.trim() || null,
        icon: deptForm.icon || 'Building2',
      });
      toast({ title: 'Department updated' });
      setEditingDept(null);
    } catch (error: unknown) {
      toast({ title: 'Error', description: getErrorMessage(error), variant: 'destructive' });
    }
    setSaving(false);
  };

  const handleToggle = async (dept: Department) => {
    try {
      await toggleDepartment(dept.id, !dept.is_active);
      toast({ title: dept.is_active ? 'Department deactivated' : 'Department activated' });
    } catch (error: unknown) {
      toast({ title: 'Error', description: getErrorMessage(error), variant: 'destructive' });
    }
  };

  const handleAddRole = async (departmentId: string) => {
    if (!roleForm.name.trim()) return;
    setSaving(true);
    try {
      const { error } = await (supabase as any).from(\'department_roles\').insert({
        department_id: departmentId,
        name: roleForm.name.trim(),
        description: roleForm.description.trim() || null,
        display_order: 0,
      });
      if (error) throw error;
      toast({ title: 'Role added' });
      setAddingRole(null);
      setRoleForm({ name: '', description: '' });
      // Force re-expand to reload roles
      setExpandedDept(null);
      setTimeout(() => setExpandedDept(departmentId), 100);
    } catch (error: unknown) {
      toast({ title: 'Error', description: getErrorMessage(error), variant: 'destructive' });
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" />
                Department Management
              </CardTitle>
              <CardDescription>
                Manage departments and roles for your organization. {activeDepts.length} active, {inactiveDepts.length} inactive.
              </CardDescription>
            </div>
            <Button onClick={() => { setAddingDept(true); setDeptForm({ name: '', slug: '', description: '', icon: 'Building2' }); }} size="sm" className="gap-1.5">
              <Plus className="h-4 w-4" /> Add Department
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px] pr-3">
            <div className="space-y-2">
              {departments.map((dept) => (
                <DeptRow
                  key={dept.id}
                  dept={dept}
                  isExpanded={expandedDept === dept.id}
                  onToggleExpand={() => setExpandedDept(expandedDept === dept.id ? null : dept.id)}
                  onEdit={() => {
                    setEditingDept(dept);
                    setDeptForm({ name: dept.name, slug: dept.slug, description: dept.description || '', icon: dept.icon });
                  }}
                  onToggleActive={() => handleToggle(dept)}
                  onAddRole={() => { setAddingRole(dept.id); setRoleForm({ name: '', description: '' }); }}
                />
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Add Department Dialog */}
      <Dialog open={addingDept} onOpenChange={setAddingDept}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Department</DialogTitle>
            <DialogDescription>Create a new department for your organization.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input value={deptForm.name} onChange={(e) => setDeptForm({ ...deptForm, name: e.target.value })} placeholder={`e.g., ${industryConfig.departments[0]?.name || 'Operations'}`} />
            </div>
            <div className="space-y-2">
              <Label>Slug (auto-generated if blank)</Label>
              <Input value={deptForm.slug} onChange={(e) => setDeptForm({ ...deptForm, slug: e.target.value })} placeholder="commercial_lending" />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea value={deptForm.description} onChange={(e) => setDeptForm({ ...deptForm, description: e.target.value })} placeholder="Brief description..." rows={2} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddingDept(false)}>Cancel</Button>
            <Button onClick={handleAddDept} disabled={saving || !deptForm.name.trim()}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Add'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Department Dialog */}
      <Dialog open={!!editingDept} onOpenChange={(open) => !open && setEditingDept(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Department</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input value={deptForm.name} onChange={(e) => setDeptForm({ ...deptForm, name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea value={deptForm.description} onChange={(e) => setDeptForm({ ...deptForm, description: e.target.value })} rows={2} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingDept(null)}>Cancel</Button>
            <Button onClick={handleEditDept} disabled={saving || !deptForm.name.trim()}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Role Dialog */}
      <Dialog open={!!addingRole} onOpenChange={(open) => !open && setAddingRole(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Role</DialogTitle>
            <DialogDescription>Add a common role for this department.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Role Name</Label>
              <Input value={roleForm.name} onChange={(e) => setRoleForm({ ...roleForm, name: e.target.value })} placeholder={`e.g., ${industryConfig.roles[0]?.label || 'Analyst'}`} />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea value={roleForm.description} onChange={(e) => setRoleForm({ ...roleForm, description: e.target.value })} placeholder="Brief description..." rows={2} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddingRole(null)}>Cancel</Button>
            <Button onClick={() => addingRole && handleAddRole(addingRole)} disabled={saving || !roleForm.name.trim()}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Add Role'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function DeptRow({
  dept,
  isExpanded,
  onToggleExpand,
  onEdit,
  onToggleActive,
  onAddRole,
}: {
  dept: Department;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onEdit: () => void;
  onToggleActive: () => void;
  onAddRole: () => void;
}) {
  return (
    <div className={`border rounded-lg ${!dept.is_active ? 'opacity-60' : ''}`}>
      <div
        className="flex items-center gap-3 p-3 cursor-pointer hover:bg-muted/50 transition-colors"
        onClick={onToggleExpand}
      >
        {isExpanded ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
        <Building2 className="h-4 w-4 text-primary" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm">{dept.name}</span>
            <Badge variant="outline" className="text-[10px]">{dept.slug}</Badge>
            {!dept.is_active && <Badge variant="secondary" className="text-[10px]">Inactive</Badge>}
          </div>
          {dept.description && <p className="text-xs text-muted-foreground truncate">{dept.description}</p>}
        </div>
        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          <Button variant="ghost" size="sm" onClick={onEdit} className="h-7 w-7 p-0">
            <Edit className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="sm" onClick={onToggleActive} className="h-7 w-7 p-0">
            {dept.is_active ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
          </Button>
        </div>
      </div>
      {isExpanded && <DeptRoles departmentId={dept.id} onAddRole={onAddRole} />}
    </div>
  );
}

function DeptRoles({ departmentId, onAddRole }: { departmentId: string; onAddRole: () => void }) {
  const { roles, loading } = useDepartmentRoles(departmentId);

  return (
    <div className="border-t px-3 py-2 bg-muted/30">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
          <Users className="h-3 w-3" /> Roles ({roles.length})
        </span>
        <Button variant="ghost" size="sm" onClick={onAddRole} className="h-6 text-xs gap-1">
          <Plus className="h-3 w-3" /> Add Role
        </Button>
      </div>
      {loading ? (
        <div className="text-xs text-muted-foreground py-1">Loading...</div>
      ) : roles.length === 0 ? (
        <div className="text-xs text-muted-foreground py-1">No roles defined yet.</div>
      ) : (
        <div className="flex flex-wrap gap-1.5">
          {roles.map((role) => (
            <Badge key={role.id} variant="secondary" className="text-xs">
              {role.name}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
