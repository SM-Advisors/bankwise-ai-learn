import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export type AppRole = 'admin' | 'user';

export function useUserRole() {
  const { user } = useAuth();
  const [role, setRole] = useState<AppRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setRole(null);
      setLoading(false);
      return;
    }

    const fetchRole = async () => {
      setLoading(true);

      // Check database role via RPC
      const { data, error } = await supabase
        .rpc('get_user_role', { _user_id: user.id });

      if (!error && data) {
        setRole(data as AppRole);
      } else {
        // Last resort: direct query
        const { data: directData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id);

        if (directData && directData.length > 0) {
          const hasAdmin = directData.some((r: any) => r.role === 'admin');
          setRole(hasAdmin ? 'admin' : (directData[0].role as AppRole));
        } else {
          setRole('user');
        }
      }
      setLoading(false);
    };

    fetchRole();
  }, [user]);

  const isAdmin = role === 'admin';

  return { role, isAdmin, loading };
}

export function useAllUsersWithRoles(organizationId?: string | null) {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    setLoading(true);

    // Fetch profiles scoped to organization (RLS also enforces this at DB level)
    let profilesQuery = supabase
      .from('user_profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (organizationId) {
      profilesQuery = profilesQuery.eq('organization_id', organizationId);
    }

    const { data: profiles, error: profilesError } = await profilesQuery;

    if (profilesError) {
      console.error('Error fetching profiles:', profilesError);
      setLoading(false);
      return;
    }

    // Build list of user IDs from already-fetched org-scoped profiles so the
    // subsequent queries are explicitly filtered (defense-in-depth beyond RLS).
    const profileUserIds = (profiles || []).map((p: any) => p.user_id);
    // Use a dummy ID when the list is empty to avoid fetching ALL rows.
    const safeIds = profileUserIds.length > 0
      ? profileUserIds
      : ['00000000-0000-0000-0000-000000000000'];

    // Fetch training progress filtered to org users
    const { data: progressData, error: progressError } = await supabase
      .from('training_progress')
      .select('*')
      .in('user_id', safeIds);

    if (progressError) {
      console.error('Error fetching progress:', progressError);
    }

    // Fetch roles filtered to org users
    const { data: rolesData, error: rolesError } = await supabase
      .from('user_roles')
      .select('*')
      .in('user_id', safeIds);

    if (rolesError) {
      console.error('Error fetching roles:', rolesError);
    }

    // Combine data
    const combinedUsers = profiles?.map((profile) => {
      const progress = progressData?.find((p) => p.user_id === profile.user_id);
      const roleEntry = rolesData?.find((r) => r.user_id === profile.user_id);
      return {
        ...profile,
        progress,
        role: roleEntry?.role || 'user',
      };
    }) || [];

    setUsers(combinedUsers);
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, [organizationId]);

  const updateUserProfile = async (userId: string, updates: Record<string, any>) => {
    const { error } = await supabase
      .from('user_profiles')
      .update(updates)
      .eq('user_id', userId);

    if (error) {
      console.error('Error updating profile:', error);
      return { success: false, error: error.message };
    }

    await fetchUsers();
    return { success: true };
  };

  const updateUserRole = async (userId: string, newRole: AppRole) => {
    // Check if role exists
    const { data: existing } = await supabase
      .from('user_roles')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();

    if (existing) {
      const { error } = await supabase
        .from('user_roles')
        .update({ role: newRole })
        .eq('user_id', userId);

      if (error) {
        console.error('Error updating role:', error);
        return { success: false, error: error.message };
      }
    } else {
      const { error } = await supabase
        .from('user_roles')
        .insert({ user_id: userId, role: newRole });

      if (error) {
        console.error('Error inserting role:', error);
        return { success: false, error: error.message };
      }
    }

    await fetchUsers();
    return { success: true };
  };

  const deleteUser = async (userId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('admin-delete-user', {
        body: { user_id: userId },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      await fetchUsers();
      return { success: true };
    } catch (err: any) {
      console.error('Error deleting user:', err);
      return { success: false, error: err.message };
    }
  };

  return { users, loading, refetch: fetchUsers, updateUserProfile, updateUserRole, deleteUser };
}
