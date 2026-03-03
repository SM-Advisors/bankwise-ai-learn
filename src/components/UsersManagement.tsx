import { useState, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAllUsersWithRoles, AppRole } from '@/hooks/useUserRole';
import { useOrganizations } from '@/hooks/useOrganizations';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { useDepartments } from '@/hooks/useDepartments';
import { Users, Edit, Loader2, CheckCircle, Clock, Shield, Building2, Trash2, Plus } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface UsersManagementProps {
  organizationId?: string | null;
}

export function UsersManagement({ organizationId }: UsersManagementProps) {
  const { toast } = useToast();
  const { users, loading, updateUserProfile, updateUserRole, deleteUser, refetch } = useAllUsersWithRoles(organizationId);
  const { organizations, loading: orgsLoading } = useOrganizations();
  const { departments: deptOptions, getDepartmentName } = useDepartments();
  const [editingUser, setEditingUser] = useState<any>(null);
  const [editForm, setEditForm] = useState({
    display_name: '',
    job_role: '',
    department: '',
    role: 'user' as AppRole,
  });
  const [saving, setSaving] = useState(false);
  const [deactivatingUser, setDeactivatingUser] = useState<string | null>(null);
  const [deletingUser, setDeletingUser] = useState<any>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [addingUser, setAddingUser] = useState(false);
  const [addForm, setAddForm] = useState({
    email: '',
    password: '',
    display_name: '',
    job_role: '',
    department: '',
    role: 'user' as AppRole,
  });

  const resetAddForm = () => setAddForm({ email: '', password: '', display_name: '', job_role: '', department: '', role: 'user' });

  // Build a map of org ID -> org name for display
  const orgNameMap = useMemo(() => {
    const map: Record<string, string> = {};
    organizations.forEach((org) => {
      map[org.id] = org.name;
    });
    return map;
  }, [organizations]);

  const handleEditUser = (user: any) => {
    setEditingUser(user);
    setEditForm({
      display_name: user.display_name || '',
      job_role: user.job_role || '',
      department: user.department || '',
      role: user.role || 'user',
    });
  };

  const handleToggleDeactivate = async (user: any) => {
    setDeactivatingUser(user.user_id);
    const newIsActive = !user.is_active;
    const result = await updateUserProfile(user.user_id, { is_active: newIsActive });
    setDeactivatingUser(null);
    if (result.success) {
      toast({
        title: newIsActive ? 'User reactivated' : 'User deactivated',
        description: newIsActive
          ? `${user.display_name} can now log in again.`
          : `${user.display_name} has been deactivated and cannot log in.`,
      });
    } else {
      toast({ title: 'Error', description: result.error, variant: 'destructive' });
    }
  };

  const handleSaveUser = async () => {
    if (!editingUser) return;
    setSaving(true);

    // Update profile
    const profileResult = await updateUserProfile(editingUser.user_id, {
      display_name: editForm.display_name,
      job_role: editForm.job_role,
      department: editForm.department || null,
    });

    // Update role
    const roleResult = await updateUserRole(editingUser.user_id, editForm.role);

    setSaving(false);

    if (profileResult.success && roleResult.success) {
      toast({ title: 'User updated', description: 'The user has been updated successfully.' });
      setEditingUser(null);
    } else {
      toast({
        title: 'Error',
        description: profileResult.error || roleResult.error || 'Failed to update user.',
        variant: 'destructive',
      });
    }
  };

  const getSessionProgress = (user: any) => {
    const progress = user.progress;
    if (!progress) return { completed: 0, total: 3, percentage: 0 };

    const completed = [
      progress.session_1_completed,
      progress.session_2_completed,
      progress.session_3_completed,
    ].filter(Boolean).length;

    return { completed, total: 3, percentage: (completed / 3) * 100 };
  };

  const handleAddUser = async () => {
    if (!addForm.email || !addForm.password || !addForm.display_name) {
      toast({ title: 'Missing fields', description: 'Email, password, and name are required.', variant: 'destructive' });
      return;
    }
    setAddingUser(true);
    try {
      const { data, error } = await supabase.functions.invoke('admin-create-user', {
        body: {
          email: addForm.email,
          password: addForm.password,
          display_name: addForm.display_name,
          job_role: addForm.job_role || null,
          department: addForm.department || null,
          role: addForm.role,
          organization_id: organizationId || null,
        },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      toast({ title: 'User created', description: `${addForm.display_name} has been added.` });
      setIsAddingUser(false);
      resetAddForm();
      // Refresh users list
      refetch();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Failed to create user.', variant: 'destructive' });
    }
    setAddingUser(false);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                User Management
              </CardTitle>
              <CardDescription>
                View and manage all users, their profiles, roles, and training progress
              </CardDescription>
            </div>
            <Button onClick={() => setIsAddingUser(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Add User
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {users.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No users found.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Organization</TableHead>
                    <TableHead>Line of Business</TableHead>
                    <TableHead>Access Level</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => {
                    const sessionProgress = getSessionProgress(user);
                    const orgName = user.organization_id
                      ? orgNameMap[user.organization_id] || 'Unknown'
                      : null;
                    return (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium">{user.display_name || 'No name'}</p>
                              {user.is_active === false && (
                                <Badge variant="destructive" className="text-xs py-0">Deactivated</Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground">{user.job_role || 'No role'}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">{user.job_role || '-'}</span>
                        </TableCell>
                        <TableCell>
                          {orgName ? (
                            <Badge variant="secondary" className="gap-1 text-xs">
                              <Building2 className="h-3 w-3" />
                              {orgName}
                            </Badge>
                          ) : (
                            <span className="text-sm text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">
                            {user.department ? getDepartmentName(user.department) : '-'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={user.role === 'admin' ? 'default' : 'secondary'}
                            className="gap-1"
                          >
                            {user.role === 'admin' && <Shield className="h-3 w-3" />}
                            {user.role === 'admin' ? 'Admin' : 'User'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditUser(user)}
                              className="gap-2"
                            >
                              <Edit className="h-3 w-3" />
                              Edit
                            </Button>
                            <Button
                              variant={user.is_active === false ? 'outline' : 'ghost'}
                              size="sm"
                              onClick={() => handleToggleDeactivate(user)}
                              disabled={deactivatingUser === user.user_id}
                              className={`gap-2 ${user.is_active === false ? 'text-green-600 border-green-600/30' : 'text-destructive hover:text-destructive'}`}
                            >
                              {deactivatingUser === user.user_id ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : user.is_active === false ? (
                                'Reactivate'
                              ) : (
                                'Deactivate'
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => { setDeletingUser(user); setDeleteConfirmOpen(true); }}
                              className="gap-1 text-destructive hover:text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit User Dialog */}
      <Dialog open={!!editingUser} onOpenChange={(open) => !open && setEditingUser(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit User: {editingUser?.display_name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="user-name">Name</Label>
              <Input
                id="user-name"
                value={editForm.display_name}
                onChange={(e) => setEditForm({ ...editForm, display_name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="user-job-role">Job Title / Role</Label>
              <Input
                id="user-job-role"
                value={editForm.job_role}
                onChange={(e) => setEditForm({ ...editForm, job_role: e.target.value })}
                placeholder="e.g. Senior Analyst"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="user-lob">Department</Label>
              <Select
                value={editForm.department}
                onValueChange={(value) => setEditForm({ ...editForm, department: value })}
              >
                <SelectTrigger id="user-lob">
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent className="bg-card max-h-60">
                  {deptOptions.map((dept) => (
                    <SelectItem key={dept.slug} value={dept.slug}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="user-access">Access Level</Label>
              <Select
                value={editForm.role}
                onValueChange={(value) => setEditForm({ ...editForm, role: value as AppRole })}
              >
                <SelectTrigger id="user-access">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card">
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Show training progress (read-only) */}
            {editingUser?.progress && (
              <div className="pt-4 border-t">
                <Label className="text-muted-foreground">Training Progress</Label>
                <div className="mt-2 space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    {editingUser.progress.session_1_completed ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <Clock className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span>Session 1: AI Prompting & Personalization</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    {editingUser.progress.session_2_completed ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <Clock className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span>Session 2: Building Your AI Agent</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    {editingUser.progress.session_3_completed ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <Clock className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span>Session 3: Role-Specific Training</span>
                  </div>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingUser(null)}>
              Cancel
            </Button>
            <Button onClick={handleSaveUser} disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete User Confirmation */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete user permanently?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove <strong>{deletingUser?.display_name || 'this user'}</strong> and all their training data. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={async () => {
                if (!deletingUser) return;
                const result = await deleteUser(deletingUser.user_id);
                if (result.success) {
                  toast({ title: 'User deleted', description: `${deletingUser.display_name} has been permanently removed.` });
                } else {
                  toast({ title: 'Error', description: result.error, variant: 'destructive' });
                }
                setDeletingUser(null);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Add User Dialog */}
      <Dialog open={isAddingUser} onOpenChange={(open) => { if (!open) { setIsAddingUser(false); resetAddForm(); } }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="add-email">Email *</Label>
                <Input id="add-email" type="email" value={addForm.email} onChange={(e) => setAddForm({ ...addForm, email: e.target.value })} placeholder="user@example.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="add-password">Password *</Label>
                <Input id="add-password" type="password" value={addForm.password} onChange={(e) => setAddForm({ ...addForm, password: e.target.value })} placeholder="Min 6 characters" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-name">Display Name *</Label>
              <Input id="add-name" value={addForm.display_name} onChange={(e) => setAddForm({ ...addForm, display_name: e.target.value })} placeholder="John Smith" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-role">Job Title / Role</Label>
              <Input id="add-role" value={addForm.job_role} onChange={(e) => setAddForm({ ...addForm, job_role: e.target.value })} placeholder="e.g. Senior Analyst" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="add-lob">Department</Label>
                <Select value={addForm.department} onValueChange={(value) => setAddForm({ ...addForm, department: value })}>
                  <SelectTrigger id="add-lob"><SelectValue placeholder="Select department" /></SelectTrigger>
                  <SelectContent className="bg-card max-h-60">
                    {deptOptions.map((dept) => (
                      <SelectItem key={dept.slug} value={dept.slug}>{dept.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="add-access">Access Level</Label>
                <Select value={addForm.role} onValueChange={(value) => setAddForm({ ...addForm, role: value as AppRole })}>
                  <SelectTrigger id="add-access"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-card">
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setIsAddingUser(false); resetAddForm(); }}>Cancel</Button>
            <Button onClick={handleAddUser} disabled={addingUser}>
              {addingUser ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Creating...</> : <><Plus className="h-4 w-4 mr-2" />Create User</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
