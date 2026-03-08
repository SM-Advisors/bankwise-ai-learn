import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Department {
  id: string;
  industry_id: string;
  slug: string;
  name: string;
  description: string | null;
  icon: string;
  is_active: boolean;
  display_order: number;
}

export interface DepartmentRole {
  id: string;
  department_id: string;
  name: string;
  description: string | null;
  is_active: boolean;
  display_order: number;
}

export function useDepartments() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDepartments = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error: fetchError } = await supabase
      .from('departments')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (fetchError) {
      console.error('Error fetching departments:', fetchError);
      setError(fetchError.message);
      setDepartments([]);
    } else {
      setDepartments(data || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchDepartments();
  }, [fetchDepartments]);

  const getDepartmentName = useCallback(
    (slugOrId: string | null): string => {
      if (!slugOrId) return 'Not Set';
      const dept = departments.find((d) => d.slug === slugOrId || d.id === slugOrId);
      return dept?.name || slugOrId.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
    },
    [departments]
  );

  const getDepartmentBySlug = useCallback(
    (slug: string | null): Department | undefined => {
      if (!slug) return undefined;
      return departments.find((d) => d.slug === slug);
    },
    [departments]
  );

  return {
    departments,
    loading,
    error,
    refetch: fetchDepartments,
    getDepartmentName,
    getDepartmentBySlug,
  };
}

export function useDepartmentRoles(departmentId: string | null) {
  const [roles, setRoles] = useState<DepartmentRole[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchRoles = useCallback(async () => {
    if (!departmentId) {
      setRoles([]);
      return;
    }
    setLoading(true);
    const { data, error } = await supabase
      .from('department_roles')
      .select('*')
      .eq('department_id', departmentId)
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (error) {
      console.error('Error fetching department roles:', error);
      setRoles([]);
    } else {
      setRoles(data || []);
    }
    setLoading(false);
  }, [departmentId]);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  return { roles, loading, refetch: fetchRoles };
}

export function useAllDepartments() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('departments')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) {
      console.error('Error fetching all departments:', error);
      setDepartments([]);
    } else {
      setDepartments(data || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const createDepartment = async (dept: Partial<Department>) => {
    const { data, error } = await (supabase
      .from('departments') as any)
      .insert(dept)
      .select()
      .single();
    if (error) throw error;
    await fetchAll();
    return data;
  };

  const updateDepartment = async (id: string, updates: Partial<Department>) => {
    const { error } = await supabase
      .from('departments')
      .update(updates)
      .eq('id', id);
    if (error) throw error;
    await fetchAll();
  };

  const toggleDepartment = async (id: string, isActive: boolean) => {
    await updateDepartment(id, { is_active: isActive });
  };

  return {
    departments,
    loading,
    refetch: fetchAll,
    createDepartment,
    updateDepartment,
    toggleDepartment,
  };
}
