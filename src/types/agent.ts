// Agent Studio types for Session 2 agent building

export interface AgentTemplateData {
  identity: string;
  taskList: Array<{
    name: string;
    format: string;
    constraint: string;
  }>;
  outputRules: string[];
  guardRails: Array<{
    rule: string;
    alternative: string;
  }>;
  complianceAnchors: string[];
}

export interface UserAgent {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  status: 'draft' | 'testing' | 'active' | 'archived';
  template_data: AgentTemplateData;
  system_prompt: string;
  version: number;
  parent_version_id: string | null;
  last_test_results: Record<string, string> | null;
  is_deployed: boolean;
  deployed_at: string | null;
  is_shared: boolean;
  shared_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface AgentTestConversation {
  id: string;
  user_id: string;
  agent_id: string;
  test_type: 'freeform' | 'standard' | 'edge' | 'out_of_scope';
  messages: Array<{ role: 'user' | 'assistant'; content: string }>;
  result: 'pass' | 'fail' | 'inconclusive' | null;
  evaluation_notes: string | null;
  created_at: string;
}

export const EMPTY_TEMPLATE: AgentTemplateData = {
  identity: '',
  taskList: [
    { name: '', format: '', constraint: '' },
    { name: '', format: '', constraint: '' },
  ],
  outputRules: ['', ''],
  guardRails: [
    { rule: '', alternative: '' },
    { rule: '', alternative: '' },
  ],
  complianceAnchors: [''],
};

// Assemble structured template data into a plaintext system prompt
export function assembleSystemPrompt(template: AgentTemplateData): string {
  const sections: string[] = [];

  if (template.identity.trim()) {
    sections.push(`IDENTITY:\n${template.identity.trim()}`);
  }

  const tasks = template.taskList.filter((t) => t.name.trim());
  if (tasks.length > 0) {
    const taskLines = tasks
      .map((t, i) => `${i + 1}. ${t.name}${t.format ? ` | Format: ${t.format}` : ''}${t.constraint ? ` | Constraint: ${t.constraint}` : ''}`)
      .join('\n');
    sections.push(`TASK LIST:\n${taskLines}`);
  }

  const rules = template.outputRules.filter((r) => r.trim());
  if (rules.length > 0) {
    sections.push(`OUTPUT RULES:\n${rules.map((r) => `- ${r}`).join('\n')}`);
  }

  const rails = template.guardRails.filter((g) => g.rule.trim());
  if (rails.length > 0) {
    const railLines = rails
      .map((g) => `- ${g.rule}${g.alternative ? ` → respond: "${g.alternative}"` : ''}`)
      .join('\n');
    sections.push(`GUARD RAILS:\n${railLines}`);
  }

  const anchors = template.complianceAnchors.filter((a) => a.trim());
  if (anchors.length > 0) {
    sections.push(`COMPLIANCE ANCHORS:\n${anchors.map((a) => `- ${a}`).join('\n')}`);
  }

  return sections.join('\n\n');
}

// Count words in the assembled system prompt
export function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}
