import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type PreviewStatus = 'none' | 'generating' | 'generated' | 'failed';

export function useIdeaPreview() {
  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const [previewHtmlMap, setPreviewHtmlMap] = useState<Record<string, string>>({});
  const [statusOverrides, setStatusOverrides] = useState<Record<string, PreviewStatus>>({});

  const generatePreview = useCallback(async (
    ideaId: string,
    title: string,
    description: string,
    table: 'user_ideas' | 'executive_submissions' = 'user_ideas',
  ): Promise<{ success: boolean; error?: string }> => {
    setGeneratingId(ideaId);
    setStatusOverrides(prev => ({ ...prev, [ideaId]: 'generating' }));

    try {
      const { data, error } = await supabase.functions.invoke('generate-idea-preview', {
        body: { ideaId, title, description, table },
      });

      if (error) throw error;

      if (data?.success && data?.html) {
        setPreviewHtmlMap(prev => ({ ...prev, [ideaId]: data.html }));
        setStatusOverrides(prev => ({ ...prev, [ideaId]: 'generated' }));
        return { success: true };
      }

      setStatusOverrides(prev => ({ ...prev, [ideaId]: 'failed' }));
      return { success: false, error: data?.error || 'Generation failed' };
    } catch (err) {
      console.error('Preview generation error:', err);
      setStatusOverrides(prev => ({ ...prev, [ideaId]: 'failed' }));
      return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
    } finally {
      setGeneratingId(null);
    }
  }, []);

  const getPreviewStatus = useCallback((ideaId: string, dbStatus?: string): PreviewStatus => {
    // Local overrides take precedence (for in-flight generation)
    if (statusOverrides[ideaId]) return statusOverrides[ideaId];
    // Fall back to DB status from the idea record
    if (dbStatus === 'generated' || dbStatus === 'generating' || dbStatus === 'failed') return dbStatus;
    return 'none';
  }, [statusOverrides]);

  const getPreviewHtml = useCallback((ideaId: string, dbHtml?: string | null): string | null => {
    // Prefer locally cached HTML (just generated), fall back to DB value
    return previewHtmlMap[ideaId] || dbHtml || null;
  }, [previewHtmlMap]);

  return {
    generatingId,
    generatePreview,
    getPreviewStatus,
    getPreviewHtml,
  };
}
