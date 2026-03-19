import { useState, useEffect, useCallback, useRef } from 'react';
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

// ─── In-flight deduplication ────────────────────────────────────────────────
// Prevents concurrent duplicate requests for the same module+dept+org combo.
const inflightRequests = new Map<string, Promise<unknown>>();

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

  // Stable refs for values used in the callback but that shouldn't retrigger it
  const modulePedagogyRef = useRef(modulePedagogy);
  modulePedagogyRef.current = modulePedagogy;
  const configRef = useRef(config);
  configRef.current = config;
  const industrySlugRef = useRef(industrySlug);
  industrySlugRef.current = industrySlug;
  const departmentNameRef = useRef(departmentName);
  departmentNameRef.current = departmentName;

  const fetchOrGenerate = useCallback(
    async (forceRegenerate = false) => {
      if (!moduleId || !modulePedagogyRef.current || !departmentSlug || !departmentNameRef.current || !effectiveOrgId) {
        return;
      }

      const dedupKey = `${moduleId}:${departmentSlug}:${effectiveOrgId}`;

      // If an identical request is already in flight, wait for it instead
      if (!forceRegenerate && inflightRequests.has(dedupKey)) {
        try {
          const result = await inflightRequests.get(dedupKey);
          if (result && typeof result === 'object' && 'content' in result) {
            setContent((result as { content: GeneratedModuleContent }).content);
          }
        } catch {
          // Original request failed; don't set error here — the original caller handles it
        }
        return;
      }

      setIsLoading(true);
      setError(null);

      const promise = supabase.functions.invoke(
        'generate-module-content',
        {
          body: {
            orgId: effectiveOrgId,
            industrySlug: industrySlugRef.current,
            departmentSlug,
            moduleId,
            modulePedagogy: modulePedagogyRef.current,
            industryContext: {
              name: configRef.current.name,
              complianceContext: configRef.current.complianceContext,
              scenarioGenerationContext: configRef.current.scenarioGenerationContext,
            },
            departmentName: departmentNameRef.current,
            forceRegenerate,
          },
        },
      );

      inflightRequests.set(dedupKey, promise);

      try {
        const { data, error: fnError } = await promise;

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
        inflightRequests.delete(dedupKey);
        setIsLoading(false);
        setIsGenerating(false);
      }
    },
    // Only primitive/stable dependencies — object refs are read via useRef
    [moduleId, departmentSlug, effectiveOrgId],
  );

  // Fetch on mount / when inputs change
  useEffect(() => {
    if (!moduleId || !modulePedagogy || !departmentSlug || !effectiveOrgId) {
      setContent(null);
      return;
    }

    let cancelled = false;

    setIsGenerating(true);
    fetchOrGenerate(false).then(() => {
      if (cancelled) return;
    });

    return () => {
      cancelled = true;
    };
  }, [moduleId, departmentSlug, effectiveOrgId, fetchOrGenerate]);

  const regenerate = useCallback(async () => {
    setIsGenerating(true);
    await fetchOrGenerate(true);
  }, [fetchOrGenerate]);

  return { content, isLoading, isGenerating, error, regenerate };
}
