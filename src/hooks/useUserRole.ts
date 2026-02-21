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
      console.log('[useUserRole] Fetching role for user:', user.id);

      // Approach 1: Use security definer function to bypass RLS
      const { data: rpcData, error: rpcError } = await supabase
        .rpc('get_user_role', { _user_id: user.id });

      console.log('[useUserRole] RPC result:', { rpcData, rpcError });

      if (!rpcError && rpcData) {
        console.log('[useUserRole] Role from RPC:', rpcData);
        setRole(rpcData as AppRole);
        setLoading(false);
        return;
      }

      // Approach 2: Direct table query (may be blocked by RLS)
      const { data: directData, error: directError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id);

      console.log('[useUserRole] Direct query result:', { directData, directError });

      if (!directError && directData && directData.length > 0) {
        // If multiple rows, prefer admin
        const hasAdmin = directData.some((r: any) => r.role === 'admin');
        const resolvedRole = hasAdmin ? 'admin' : (directData[0].role as AppRole);
        console.log('[useUserRole] Role from direct query:', resolvedRole);
        setRole(resolvedRole);
        setLoading(false);
        return;
      }

      // Approach 3: Use has_role to check specifically for admin
      const { data: isAdminResult, error: hasRoleError } = await supabase
        .rpc('has_role', { _user_id: user.id, _role: 'admin' });

      console.log('[useUserRole] has_role(admin) result:', { isAdminResult, hasRoleError });

      if (!hasRoleError && isAdminResult === true) {
        console.log('[useUserRole] Confirmed admin via has_role');
        setRole('admin');
        setLoading(false);
        return;
      }

      console.log('[useUserRole] Defaulting to user role');
      setRole('user');
      setLoading(false);
    };

    fetchRole();
  }, [user]);

  const isAdmin = role === 'admin';

  return { role, isAdmin, loading };
}

export function useAllUsersWithRoles() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    setLoading(true);
    
    // Fetch all profiles (admin RLS allows this)
    const { data: profiles, error: profilesError } = await supabase
      .from('user_profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (profilesError) {
      console.error('Error fetching profiles:', profilesError);
      setLoading(false);
      return;
    }

    // Fetch all training progress
    const { data: progressData, error: progressError } = await supabase
      .from('training_progress')
      .select('*');

    if (progressError) {
      console.error('Error fetching progress:', progressError);
    }

    // Fetch all roles
    const { data: rolesData, error: rolesError } = await supabase
      .from('user_roles')
      .select('*');

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
  }, []);

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

  return { users, loading, refetch: fetchUsers, updateUserProfile, updateUserRole };
}
