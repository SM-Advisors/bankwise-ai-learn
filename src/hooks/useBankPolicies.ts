import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface BankPolicy {
  id: string;
  policy_type: string;
  title: string;
  content: string;
  summary: string | null;
  icon: string | null;
  display_order: number | null;
  is_active: boolean | null;
  created_at: string | null;
  updated_at: string | null;
}

export function useBankPolicies() {
  const [policies, setPolicies] = useState<BankPolicy[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPolicies = async () => {
    try {
      setLoading(true);
      // Use type assertion since the types file is auto-generated and may not include new tables yet
      const { data, error: fetchError } = await (supabase
        .from('bank_policies' as any)
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true }) as any);

      if (fetchError) throw fetchError;
      setPolicies(data || []);
    } catch (err) {
      console.error('Error fetching policies:', err);
      setError('Failed to load policies');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPolicies();
  }, []);

  return { policies, loading, error, refetch: fetchPolicies };
}

export function useAllBankPolicies() {
  const [policies, setPolicies] = useState<BankPolicy[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPolicies = async () => {
    try {
      setLoading(true);
      const { data, error: fetchError } = await (supabase
        .from('bank_policies' as any)
        .select('*')
        .order('display_order', { ascending: true }) as any);

      if (fetchError) throw fetchError;
      setPolicies(data || []);
    } catch (err) {
      console.error('Error fetching policies:', err);
      setError('Failed to load policies');
    } finally {
      setLoading(false);
    }
  };

  const updatePolicy = async (id: string, updates: Partial<BankPolicy>) => {
    try {
      const { error: updateError } = await (supabase
        .from('bank_policies' as any)
        .update(updates)
        .eq('id', id) as any);

      if (updateError) throw updateError;
      await fetchPolicies();
      return { success: true };
    } catch (err) {
      console.error('Error updating policy:', err);
      return { success: false, error: 'Failed to update policy' };
    }
  };

  const createPolicy = async (policy: Omit<BankPolicy, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { error: insertError } = await (supabase
        .from('bank_policies' as any)
        .insert(policy) as any);

      if (insertError) throw insertError;
      await fetchPolicies();
      return { success: true };
    } catch (err) {
      console.error('Error creating policy:', err);
      return { success: false, error: 'Failed to create policy' };
    }
  };

  useEffect(() => {
    fetchPolicies();
  }, []);

  return { policies, loading, error, refetch: fetchPolicies, updatePolicy, createPolicy };
}
