import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export type ShareDestination = 'community' | 'my_ideas' | 'executive';
export type ShareType = 'idea' | 'friction_point' | 'agent' | 'workflow';

export interface SharePayload {
  type: ShareType;
  title: string;
  body: string;
  destinations: ShareDestination[];
  linkedContentId?: string;
  linkedContentType?: 'agent' | 'workflow';
  sourceType?: 'manual' | 'andrea_suggested' | 'andrea_user_requested';
  sourceContext?: string;
}

export interface ShareResult {
  success: boolean;
  errors: string[];
  shared: ShareDestination[];
}

// Map ShareType to community_topics category
const TYPE_TO_CATEGORY: Record<ShareType, string> = {
  idea: 'idea',
  friction_point: 'friction_point',
  agent: 'shared_agent',
  workflow: 'shared_workflow',
};

export function useShareContent() {
  const { profile } = useAuth();

  const share = async (payload: SharePayload): Promise<ShareResult> => {
    const errors: string[] = [];
    const shared: ShareDestination[] = [];

    // ── Share to My Ideas ────────────────────────────────────────────────────
    if (payload.destinations.includes('my_ideas')) {
      const { error } = await (supabase as any)
        .from(\'user_ideas\')
        .insert({
          title: payload.title,
          description: payload.body,
          status: 'not_started',
          source: payload.sourceType ?? 'manual',
          source_context: payload.sourceContext ?? null,
          linked_agent_id: payload.linkedContentType === 'agent' ? payload.linkedContentId ?? null : null,
          submitter_name: profile?.display_name ?? null,
          submitter_department: profile?.department ?? null,
        });

      if (error) {
        errors.push(`My Ideas: ${error.message}`);
      } else {
        shared.push('my_ideas');
      }
    }

    // ── Share to Community ───────────────────────────────────────────────────
    if (payload.destinations.includes('community')) {
      const { error } = await (supabase as any)
        .from(\'community_topics\')
        .insert({
          title: payload.title,
          body: payload.body,
          category: TYPE_TO_CATEGORY[payload.type],
          source_type: payload.sourceType ?? 'manual',
          linked_content_id: payload.linkedContentId ?? null,
          linked_content_type: payload.linkedContentType ?? null,
          author_name: profile?.display_name ?? 'Unknown',
          author_role: profile?.job_role ?? null,
        });

      if (error) {
        errors.push(`Community: ${error.message}`);
      } else {
        shared.push('community');
      }
    }

    // ── Share to Executive ───────────────────────────────────────────────────
    if (payload.destinations.includes('executive')) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        errors.push('Executive: Not authenticated');
      } else {
        const { error } = await supabase
          .from('executive_submissions')
          .insert({
            user_id: user.id,
            submission_type: payload.type,
            title: payload.title,
            body: payload.body,
          });

        if (error) {
          errors.push(`Executive: ${error.message}`);
        } else {
          shared.push('executive');
        }
      }
    }

    return { success: errors.length === 0, errors, shared };
  };

  return { share };
}
