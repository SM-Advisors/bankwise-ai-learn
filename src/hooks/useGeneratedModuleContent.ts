import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useIndustryContent } from '@/hooks/useIndustryContent';

// ─── Types ──────────────────────────────────────────────────────────────────

export interface GeneratedExample {
  title: string;
  good: string;
  bad?: string;
  explanation: string;
}

export interface GeneratedDepartmentScenario {
  scenario: string;
  hints: string[];
}

export interface GeneratedModuleContent {
  examples: GeneratedExample[];
  practiceScenario: string;
  hints: string[];
  departmentScenarios: Record<string, GeneratedDepartmentScenario>;
}

interface UseGeneratedModuleContentResult {
  content: GeneratedModuleContent | null;
  isLoading: boolean;
  isGenerating: boolean;
  error: string | null;
  regenerate: () => Promise<void>;
}

interface ModulePedagogy {
  title: string;
  learningObjectives: string[];
  learningOutcome: string;
  keyPoints: string[];
  overview: string;
  practiceTaskTitle: string;
  practiceTaskInstructions: string;
  successCriteria: string[];
}

// ─── Hook ───────────────────────────────────────────────────────────────────

/**
 * Resolves generated industry-specific content for a module.
 *
 * Flow: check cache → if miss, call edge function → cache → return.
 * While generating, returns null (callers should show static pedagogy).
 */
export function useGeneratedModuleContent(
  moduleId: string | null,
  modulePedagogy: ModulePedagogy | null,
  departmentSlug: string | null,
  departmentName: string | null,
): UseGeneratedModuleContentResult {
  const { profile, effectiveOrgId } = useAuth();
  const { config, industrySlug } = useIndustryContent();
  const [content, setContent] = useState<GeneratedModuleContent | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOrGenerate = useCallback(
    async (forceRegenerate = false) => {
      if (!moduleId || !modulePedagogy || !departmentSlug || !departmentName || !effectiveOrgId) {
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const { data, error: fnError } = await supabase.functions.invoke(
          'generate-module-content',
          {
            body: {
              orgId: effectiveOrgId,
              industrySlug,
              departmentSlug,
              moduleId,
              modulePedagogy,
              industryContext: {
                name: config.name,
                complianceContext: config.complianceContext,
                scenarioGenerationContext: config.scenarioGenerationContext,
              },
              departmentName,
              forceRegenerate,
            },
          },
        );

        if (fnError) {
          throw new Error(fnError.message || 'Failed to fetch module content');
        }

        if (data?.content) {
          setContent(data.content as GeneratedModuleContent);
          if (!data.cached) {
            setIsGenerating(false);
          }
        } else {
          // Generation returned null — frontend should use static pedagogy
          setContent(null);
        }
      } catch (err) {
        console.error('useGeneratedModuleContent error:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        setContent(null);
      } finally {
        setIsLoading(false);
        setIsGenerating(false);
      }
    },
    [moduleId, modulePedagogy, departmentSlug, departmentName, effectiveOrgId, industrySlug, config],
  );

  // Fetch on mount / when inputs change
  useEffect(() => {
    if (!moduleId || !modulePedagogy || !departmentSlug || !effectiveOrgId) {
      setContent(null);
      return;
    }

    setIsGenerating(true);
    fetchOrGenerate(false);
  }, [moduleId, departmentSlug, effectiveOrgId]);

  const regenerate = useCallback(async () => {
    setIsGenerating(true);
    await fetchOrGenerate(true);
  }, [fetchOrGenerate]);

  return { content, isLoading, isGenerating, error, regenerate };
}
