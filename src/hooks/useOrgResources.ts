import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface OrgResource {
  id: string;
  organization_id: string;
  title: string;
  description: string | null;
  resource_type: 'video' | 'document' | 'link';
  url: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
}

export function useOrgResources(organizationId: string | null = null) {
  const [resources, setResources] = useState<OrgResource[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchResources = async () => {
    if (!organizationId) {
      setResources([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const { data, error } = await supabase
      .from('org_resources')
      .select('*')
      .eq('organization_id', organizationId)
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: true });

    if (error) {
      console.error('[useOrgResources] Error fetching resources:', error);
    }
    setResources((data || []) as OrgResource[]);
    setLoading(false);
  };

  useEffect(() => {
    fetchResources();
  }, [organizationId]);

  const addResource = async (
    resource: Omit<OrgResource, 'id' | 'created_at' | 'organization_id'>,
  ) => {
    if (!organizationId) return { success: false, error: 'No organization' };
    const { error } = await supabase
      .from('org_resources')
      .insert({ ...resource, organization_id: organizationId });

    if (error) {
      console.error('[useOrgResources] Error adding resource:', error);
      return { success: false, error: error.message };
    }
    await fetchResources();
    return { success: true };
  };

  const updateResource = async (id: string, updates: Partial<OrgResource>) => {
    const { error } = await (supabase
      .from('org_resources')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id));

    if (error) {
      console.error('[useOrgResources] Error updating resource:', error);
      return { success: false, error: error.message };
    }
    await fetchResources();
    return { success: true };
  };

  const deleteResource = async (id: string) => {
    const { error } = await supabase
      .from('org_resources')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('[useOrgResources] Error deleting resource:', error);
      return { success: false, error: error.message };
    }
    await fetchResources();
    return { success: true };
  };

  return { resources, loading, refetch: fetchResources, addResource, updateResource, deleteResource };
}
