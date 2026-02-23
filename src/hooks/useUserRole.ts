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

  const deleteUser = async (userId: string) => {
    // Delete related data first, then profile
    await supabase.from('user_roles').delete().eq('user_id', userId);
    await supabase.from('training_progress').delete().eq('user_id', userId);
    const { error } = await supabase.from('user_profiles').delete().eq('user_id', userId);
    if (error) {
      console.error('Error deleting user:', error);
      return { success: false, error: error.message };
    }
    await fetchUsers();
    return { success: true };
  };

  return { users, loading, refetch: fetchUsers, updateUserProfile, updateUserRole, deleteUser };
}
