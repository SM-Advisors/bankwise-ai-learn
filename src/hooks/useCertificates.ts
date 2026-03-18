import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export interface Certificate {
  id: string;
  user_id: string;
  session_id: number;
  certificate_type: string;
  earned_at: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

export function useCertificates() {
  const { user } = useAuth();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCertificates = useCallback(async () => {
    if (!user?.id) return;
    try {
      const { data, error } = await supabase
        .from('certificates')
        .select('*')
        .eq('user_id', user.id)
        .order('earned_at', { ascending: true });

      if (error) throw error;
      setCertificates((data as unknown as Certificate[]) || []);
    } catch {
      // Table may not exist yet — no fallback needed
      setCertificates([]);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchCertificates();
  }, [fetchCertificates]);

  const earnCertificate = useCallback(async (
    sessionId: number,
    type: string = 'session_completion',
    metadata: Record<string, unknown> = {}
  ) => {
    if (!user?.id) return;
    try {
      const { error } = await (supabase
        .from('certificates' as never))
        .upsert({
          user_id: user.id,
          session_id: sessionId,
          certificate_type: type,
          earned_at: new Date().toISOString(),
          metadata,
        }, { onConflict: 'user_id,session_id,certificate_type' });

      if (error) throw error;
      await fetchCertificates();
    } catch {
      // Silently handle — certificate is display-only
    }
  }, [user?.id, fetchCertificates]);

  const hasCertificate = useCallback((sessionId: number, type: string = 'session_completion') => {
    return certificates.some((c) => c.session_id === sessionId && c.certificate_type === type);
  }, [certificates]);

  return {
    certificates,
    loading,
    earnCertificate,
    hasCertificate,
    refetch: fetchCertificates,
  };
}
