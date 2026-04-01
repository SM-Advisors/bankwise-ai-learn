export interface ModelDefinition {
  id: string;
  label: string;
  provider: 'anthropic' | 'openai' | 'google';
  description: string;
  /** If true, this model uses extended reasoning / "think deeper" mode */
  reasoning?: boolean;
}

export const AVAILABLE_MODELS: ModelDefinition[] = [
  // OpenAI — Default / Quick response
  { id: 'gpt-5.4',            label: 'GPT 5.4',              provider: 'openai',    description: 'OpenAI flagship — recommended' },
  { id: 'gpt-5.4-mini',       label: 'GPT 5.4 Quick',        provider: 'openai',    description: 'Fast response, lower cost' },
  // OpenAI — Think deeper (reasoning)
  { id: 'gpt-5.4-reasoning',  label: 'GPT 5.4 Think Deeper', provider: 'openai',    description: 'Extended reasoning for complex tasks', reasoning: true },
  // OpenAI — Previous generations
  { id: 'gpt-5.3',            label: 'GPT 5.3',              provider: 'openai',    description: 'Previous generation' },
  { id: 'gpt-5.3-mini',       label: 'GPT 5.3 Quick',        provider: 'openai',    description: 'Previous gen — fast response' },
  { id: 'gpt-5.2',            label: 'GPT 5.2',              provider: 'openai',    description: 'Older generation' },
  { id: 'gpt-5.2-mini',       label: 'GPT 5.2 Quick',        provider: 'openai',    description: 'Older gen — fast response' },
  // Anthropic
  { id: 'claude-sonnet-4-6',  label: 'Claude Sonnet 4.6',    provider: 'anthropic', description: 'Fast, intelligent' },
  { id: 'claude-opus-4-6',    label: 'Claude Opus 4.6',      provider: 'anthropic', description: 'Most capable Claude model', reasoning: true },
  // Google
  { id: 'gemini-3',           label: 'Gemini 3',             provider: 'google',    description: 'Google — fast & efficient' },
];

export const DEFAULT_MODEL = 'gpt-5.4';

export const PROVIDER_COLORS: Record<ModelDefinition['provider'], string> = {
  anthropic: 'bg-purple-100 text-purple-700',
  openai:    'bg-green-100 text-green-700',
  google:    'bg-blue-100 text-blue-700',
};

export function getModelById(id: string): ModelDefinition | undefined {
  return AVAILABLE_MODELS.find(m => m.id === id);
}
