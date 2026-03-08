import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  Building2, Loader2, RotateCcw, Undo2, AlertTriangle, Search,
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface UserRow {
  user_id: string;
  display_name: string | null;
  organization_id: string | null;
  org_name: string | null;
  current_session: number | null;
  session_1_completed: boolean;
  session_2_completed: boolean;
  session_3_completed: boolean;
  session_4_completed: boolean;
}

interface ResetSnapshot {
  id: string;
  user_id: string;
  reset_at: string;
  reversed_at: string | null;
  expires_at: string;
  display_name?: string;
}

export function TrainingResetManager() {
  const { user } = useAuth();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [snapshots, setSnapshots] = useState<ResetSnapshot[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Reset dialog state
  const [resetTarget, setResetTarget] = useState<UserRow | null>(null);
  const [confirmName, setConfirmName] = useState('');
  const [resetting, setResetting] = useState(false);

  // Reverse dialog state
  const [reverseTarget, setReverseTarget] = useState<ResetSnapshot | null>(null);
  const [reversing, setReversing] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch all profiles with org names
      const { data: profiles } = await supabase
        .from('user_profiles')
        .select('user_id, display_name, organization_id, current_session')
        .order('display_name', { ascending: true });

      // Fetch org names
      const { data: orgs } = await supabase
        .from('organizations')
        .select('id, name');

      const orgMap: Record<string, string> = {};
      (orgs || []).forEach((o) => { orgMap[o.id] = o.name; });

      // Fetch training progress
      const { data: progress } = await supabase
        .from('training_progress')
        .select('user_id, session_1_completed, session_2_completed, session_3_completed, session_4_completed');

      const progressMap: Record<string, any> = {};
      (progress || []).forEach((p) => { progressMap[p.user_id] = p; });

      const mapped: UserRow[] = (profiles || []).map((p) => ({
        user_id: p.user_id,
        display_name: p.display_name,
        organization_id: p.organization_id,
        org_name: p.organization_id ? orgMap[p.organization_id] || 'Unknown' : null,
        current_session: p.current_session,
        session_1_completed: progressMap[p.user_id]?.session_1_completed ?? false,
        session_2_completed: progressMap[p.user_id]?.session_2_completed ?? false,
        session_3_completed: progressMap[p.user_id]?.session_3_completed ?? false,
        session_4_completed: progressMap[p.user_id]?.session_4_completed ?? false,
      }));

      setUsers(mapped);

      // Fetch active snapshots (not reversed, not expired)
      const { data: snaps } = await (supabase
        .from('training_reset_snapshots')
        .select('id, user_id, reset_at, reversed_at, expires_at')
        .is('reversed_at', null)
        .gte('expires_at', new Date().toISOString())
        .order('reset_at', { ascending: false }));

      const snapsWithNames: ResetSnapshot[] = (snaps || []).map((s) => {
        const profile = (profiles || []).find((p) => p.user_id === s.user_id);
        return { ...s, display_name: profile?.display_name || 'Unknown' };
      });

      setSnapshots(snapsWithNames);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleReset = async () => {
    if (!resetTarget || !user) return;
    setResetting(true);
    try {
      // 1. Snapshot current training_progress
      const { data: currentProgress } = await supabase
        .from('training_progress')
        .select('*')
        .eq('user_id', resetTarget.user_id)
        .maybeSingle();

      // Also snapshot current_session from profile
      const snapshotData = {
        training_progress: currentProgress || {},
        current_session: resetTarget.current_session,
      };

      // 2. Save snapshot
      await supabase.from('training_reset_snapshots').insert({
        user_id: resetTarget.user_id,
        reset_by: user.id,
        snapshot_data: snapshotData,
      });

      // 3. Reset training_progress
      if (currentProgress) {
        await supabase
          .from('training_progress')
          .update({
            session_1_completed: false,
            session_1_progress: {},
            session_2_completed: false,
            session_2_progress: {},
            session_3_completed: false,
            session_3_progress: {},
            session_4_completed: false,
            session_4_progress: {},
          })
          .eq('user_id', resetTarget.user_id);
      }

      // 4. Reset current_session to 1
      await supabase
        .from('user_profiles')
        .update({ current_session: 1 })
        .eq('user_id', resetTarget.user_id);

      toast.success(`Training reset for ${resetTarget.display_name || 'user'}`);
      setResetTarget(null);
      setConfirmName('');
      await fetchData();
    } catch (err) {
      toast.error('Failed to reset training: ' + err.message);
    } finally {
      setResetting(false);
    }
  };

  const handleReverse = async () => {
    if (!reverseTarget) return;
    setReversing(true);
    try {
      // 1. Get snapshot data
      const { data: snap } = await supabase
        .from('training_reset_snapshots')
        .select('snapshot_data')
        .eq('id', reverseTarget.id)
        .single();

      if (!snap) throw new Error('Snapshot not found');

      const snapshotData = snap.snapshot_data as any;

      // 2. Restore training_progress
      if (snapshotData.training_progress && Object.keys(snapshotData.training_progress).length > 0) {
        const tp = snapshotData.training_progress;
        await supabase
          .from('training_progress')
          .update({
            session_1_completed: tp.session_1_completed ?? false,
            session_1_progress: tp.session_1_progress ?? {},
            session_2_completed: tp.session_2_completed ?? false,
            session_2_progress: tp.session_2_progress ?? {},
            session_3_completed: tp.session_3_completed ?? false,
            session_3_progress: tp.session_3_progress ?? {},
            session_4_completed: tp.session_4_completed ?? false,
            session_4_progress: tp.session_4_progress ?? {},
          })
          .eq('user_id', reverseTarget.user_id);
      }

      // 3. Restore current_session
      if (snapshotData.current_session != null) {
        await supabase
          .from('user_profiles')
          .update({ current_session: snapshotData.current_session })
          .eq('user_id', reverseTarget.user_id);
      }

      // 4. Mark snapshot as reversed
      await (supabase
        .from('training_reset_snapshots')
        .update({ reversed_at: new Date().toISOString() })
        .eq('id', reverseTarget.id));

      toast.success(`Training restored for ${reverseTarget.display_name}`);
      setReverseTarget(null);
      await fetchData();
    } catch (err) {
      toast.error('Failed to reverse reset: ' + err.message);
    } finally {
      setReversing(false);
    }
  };

  // Group users by org
  const grouped = users.reduce<Record<string, UserRow[]>>((acc, u) => {
    const key = u.org_name || 'No Organization';
    if (!acc[key]) acc[key] = [];
    acc[key].push(u);
    return acc;
  }, {});

  const filteredGroups = Object.entries(grouped)
    .map(([orgName, orgUsers]) => {
      const filtered = search
        ? orgUsers.filter(u =>
            (u.display_name || '').toLowerCase().includes(search.toLowerCase()) ||
            orgName.toLowerCase().includes(search.toLowerCase())
          )
        : orgUsers;
      return [orgName, filtered] as [string, UserRow[]];
    })
    .filter(([, users]) => users.length > 0)
    .sort(([a], [b]) => a.localeCompare(b));

  const nameMatch = resetTarget
    ? confirmName.trim() === (resetTarget.display_name || '').trim()
    : false;

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Pending reversals */}
      {snapshots.length > 0 && (
        <Card className="border-amber-200 bg-amber-50/50 dark:border-amber-800 dark:bg-amber-950/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Undo2 className="h-4 w-4 text-amber-600" />
              Reversible Resets ({snapshots.length})
            </CardTitle>
            <CardDescription>These resets can be undone within 30 days</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {snapshots.map((snap) => (
                <div key={snap.id} className="flex items-center justify-between text-sm bg-background rounded-md px-3 py-2 border">
                  <div>
                    <span className="font-medium">{snap.display_name}</span>
                    <span className="text-muted-foreground ml-2">
                      reset {format(new Date(snap.reset_at), 'MMM d, yyyy')}
                    </span>
                    <span className="text-muted-foreground ml-1">
                      · expires {format(new Date(snap.expires_at), 'MMM d')}
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setReverseTarget(snap)}
                    className="gap-1.5"
                  >
                    <Undo2 className="h-3 w-3" />
                    Undo Reset
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search users or organizations..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Users grouped by org */}
      {filteredGroups.map(([orgName, orgUsers]) => (
        <Card key={orgName}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              {orgName}
              <Badge variant="secondary" className="ml-1">{orgUsers.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead className="text-center">S1</TableHead>
                  <TableHead className="text-center">S2</TableHead>
                  <TableHead className="text-center">S3</TableHead>
                  <TableHead className="text-center">S4</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orgUsers.map((u) => {
                  const hasActiveReset = snapshots.some(s => s.user_id === u.user_id);
                  return (
                    <TableRow key={u.user_id}>
                      <TableCell className="font-medium">
                        {u.display_name || 'Unnamed User'}
                      </TableCell>
                      {[u.session_1_completed, u.session_2_completed, u.session_3_completed, u.session_4_completed].map((done, i) => (
                        <TableCell key={i} className="text-center">
                          <span className={`inline-block h-2.5 w-2.5 rounded-full ${done ? 'bg-green-500' : 'bg-red-400/70'}`} />
                        </TableCell>
                      ))}
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setResetTarget(u)}
                          className="gap-1.5 text-destructive hover:text-destructive hover:bg-destructive/10"
                          disabled={hasActiveReset}
                          title={hasActiveReset ? 'Already has a pending reset' : 'Reset training'}
                        >
                          <RotateCcw className="h-3 w-3" />
                          Reset
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ))}

      {filteredGroups.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          No users found{search ? ` matching "${search}"` : ''}.
        </div>
      )}

      {/* Reset Confirmation Dialog */}
      <Dialog open={!!resetTarget} onOpenChange={(open) => { if (!open) { setResetTarget(null); setConfirmName(''); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Reset Training
            </DialogTitle>
            <DialogDescription>
              This will reset all training progress for this user. All sessions will become "Not Started" and their learning path will restart from the beginning.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="rounded-md bg-muted p-3">
              <p className="text-sm font-medium">{resetTarget?.display_name || 'Unnamed User'}</p>
              <p className="text-xs text-muted-foreground mt-1">{resetTarget?.org_name || 'No Organization'}</p>
            </div>

            <div>
              <p className="text-sm mb-2">
                Type <span className="font-semibold">{resetTarget?.display_name}</span> to confirm:
              </p>
              <Input
                value={confirmName}
                onChange={(e) => setConfirmName(e.target.value)}
                placeholder="Type user's name exactly as shown"
                autoFocus
              />
            </div>

            <p className="text-xs text-muted-foreground">
              You can reverse this reset within 30 days.
            </p>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => { setResetTarget(null); setConfirmName(''); }}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReset}
              disabled={!nameMatch || resetting}
            >
              {resetting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Reset Training
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reverse Confirmation Dialog */}
      <Dialog open={!!reverseTarget} onOpenChange={(open) => { if (!open) setReverseTarget(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Undo2 className="h-5 w-5 text-amber-600" />
              Undo Training Reset
            </DialogTitle>
            <DialogDescription>
              This will restore {reverseTarget?.display_name}'s training progress to what it was before the reset on {reverseTarget && format(new Date(reverseTarget.reset_at), 'MMM d, yyyy')}.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReverseTarget(null)}>
              Cancel
            </Button>
            <Button onClick={handleReverse} disabled={reversing}>
              {reversing && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Restore Training
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
