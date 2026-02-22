import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Organization {
  id: string;
  name: string;
  slug: string;
  created_at: string;
}

export interface RegistrationCode {
  id: string;
  code: string;
  organization_id: string;
  organization_name: string;
  expires_at: string | null;
  max_uses: number | null;
  current_uses: number;
  is_active: boolean;
  created_by: string;
  created_at: string;
}

export function useOrganizations() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [registrationCodes, setRegistrationCodes] = useState<RegistrationCode[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrganizations = useCallback(async () => {
    try {
      setLoading(true);

      // Fetch all organizations
      const { data: orgs, error: orgsError } = await (supabase
        .from('organizations' as any)
        .select('id, name, slug, created_at')
        .order('name', { ascending: true }) as any);

      if (orgsError) {
        console.error('Error fetching organizations:', orgsError);
      } else {
        setOrganizations((orgs || []) as Organization[]);
      }

      // Fetch registration codes with org names joined
      const { data: codes, error: codesError } = await (supabase
        .from('registration_codes' as any)
        .select('id, code, organization_id, expires_at, max_uses, current_uses, is_active, created_by, created_at, organizations(name)')
        .order('created_at', { ascending: false }) as any);

      if (codesError) {
        console.error('Error fetching registration codes:', codesError);
      } else {
        const mapped: RegistrationCode[] = (codes || []).map((c: any) => ({
          id: c.id,
          code: c.code,
          organization_id: c.organization_id,
          organization_name: c.organizations?.name || 'Unknown',
          expires_at: c.expires_at,
          max_uses: c.max_uses,
          current_uses: c.current_uses ?? 0,
          is_active: c.is_active ?? true,
          created_by: c.created_by,
          created_at: c.created_at,
        }));
        setRegistrationCodes(mapped);
      }
    } catch (err) {
      console.error('Error in useOrganizations:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrganizations();
  }, [fetchOrganizations]);

  const createOrganization = useCallback(async (name: string, slug: string) => {
    try {
      const { error } = await (supabase
        .from('organizations' as any)
        .insert({ name, slug }) as any);

      if (error) {
        console.error('Error creating organization:', error);
        return { success: false, error: error.message };
      }

      await fetchOrganizations();
      return { success: true };
    } catch (err) {
      console.error('Error creating organization:', err);
      return { success: false, error: 'Failed to create organization' };
    }
  }, [fetchOrganizations]);

  const createRegistrationCode = useCallback(async (params: {
    code: string;
    organization_id: string;
    expires_at?: string | null;
    max_uses?: number | null;
  }) => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData?.user?.id;
      if (!userId) {
        return { success: false, error: 'Not authenticated' };
      }

      const { error } = await (supabase
        .from('registration_codes' as any)
        .insert({
          code: params.code,
          organization_id: params.organization_id,
          expires_at: params.expires_at || null,
          max_uses: params.max_uses || null,
          created_by: userId,
        }) as any);

      if (error) {
        console.error('Error creating registration code:', error);
        return { success: false, error: error.message };
      }

      await fetchOrganizations();
      return { success: true };
    } catch (err) {
      console.error('Error creating registration code:', err);
      return { success: false, error: 'Failed to create registration code' };
    }
  }, [fetchOrganizations]);

  const toggleCodeActive = useCallback(async (codeId: string, isActive: boolean) => {
    try {
      const { error } = await (supabase
        .from('registration_codes' as any)
        .update({ is_active: isActive })
        .eq('id', codeId) as any);

      if (error) {
        console.error('Error toggling code active:', error);
        return { success: false, error: error.message };
      }

      await fetchOrganizations();
      return { success: true };
    } catch (err) {
      console.error('Error toggling code active:', err);
      return { success: false, error: 'Failed to toggle code status' };
    }
  }, [fetchOrganizations]);

  const updateCodeUses = useCallback(async (codeId: string, currentUses: number) => {
    try {
      const { error } = await (supabase
        .from('registration_codes' as any)
        .update({ current_uses: currentUses })
        .eq('id', codeId) as any);

      if (error) {
        console.error('Error updating code uses:', error);
        return { success: false, error: error.message };
      }

      await fetchOrganizations();
      return { success: true };
    } catch (err) {
      console.error('Error updating code uses:', err);
      return { success: false, error: 'Failed to update usage count' };
    }
  }, [fetchOrganizations]);

  return {
    organizations,
    registrationCodes,
    loading,
    refetch: fetchOrganizations,
    createOrganization,
    createRegistrationCode,
    toggleCodeActive,
    updateCodeUses,
  };
}
