import { useState } from 'react';
import { useAllUsersWithRoles, AppRole } from '@/hooks/useUserRole';
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
import { Users, Edit, Loader2, CheckCircle, Clock, Shield } from 'lucide-react';

const LOB_LABELS: Record<string, string> = {
  accounting_finance: 'Accounting & Finance',
  credit_administration: 'Credit Administration',
  executive_leadership: 'Executive & Leadership',
};

export function UsersManagement() {
  const { toast } = useToast();
  const { users, loading, updateUserProfile, updateUserRole } = useAllUsersWithRoles();
  const [editingUser, setEditingUser] = useState<any>(null);
  const [editForm, setEditForm] = useState({
    display_name: '',
    bank_role: '',
    line_of_business: '',
    role: 'user' as AppRole,
  });
  const [saving, setSaving] = useState(false);

  const handleEditUser = (user: any) => {
    setEditingUser(user);
    setEditForm({
      display_name: user.display_name || '',
      bank_role: user.bank_role || '',
      line_of_business: user.line_of_business || '',
      role: user.role || 'user',
    });
  };

  const handleSaveUser = async () => {
    if (!editingUser) return;
    setSaving(true);

    // Update profile
    const profileResult = await updateUserProfile(editingUser.user_id, {
      display_name: editForm.display_name,
      bank_role: editForm.bank_role,
      line_of_business: editForm.line_of_business || null,
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
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            User Management
          </CardTitle>
          <CardDescription>
            View and manage all users, their profiles, roles, and training progress
          </CardDescription>
        </CardHeader>
        <CardContent>
          {users.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No users found.</p>
          ) : (
            <ScrollArea className="w-full">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Line of Business</TableHead>
                    <TableHead>Access Level</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => {
                    const sessionProgress = getSessionProgress(user);
                    return (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                              <span className="text-sm font-semibold text-primary">
                                {user.display_name?.charAt(0)?.toUpperCase() || 'U'}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium">{user.display_name || 'No name'}</p>
                              <p className="text-xs text-muted-foreground">{user.bank_role || 'No role'}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">{user.bank_role || '-'}</span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">
                            {LOB_LABELS[user.line_of_business] || '-'}
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
                        <TableCell>
                          <div className="flex items-center gap-2 min-w-32">
                            <Progress value={sessionProgress.percentage} className="h-2 flex-1" />
                            <span className="text-xs text-muted-foreground whitespace-nowrap">
                              {sessionProgress.completed}/{sessionProgress.total}
                            </span>
                            {sessionProgress.completed === 3 ? (
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            ) : (
                              <Clock className="h-4 w-4 text-muted-foreground" />
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditUser(user)}
                            className="gap-2"
                          >
                            <Edit className="h-3 w-3" />
                            Edit
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </ScrollArea>
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
                value={editForm.bank_role}
                onChange={(e) => setEditForm({ ...editForm, bank_role: e.target.value })}
                placeholder="e.g. Senior Analyst"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="user-lob">Line of Business</Label>
              <Select
                value={editForm.line_of_business}
                onValueChange={(value) => setEditForm({ ...editForm, line_of_business: value })}
              >
                <SelectTrigger id="user-lob">
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent className="bg-card">
                  <SelectItem value="accounting_finance">Accounting & Finance</SelectItem>
                  <SelectItem value="credit_administration">Credit Administration</SelectItem>
                  <SelectItem value="executive_leadership">Executive & Leadership</SelectItem>
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
    </>
  );
}
