export interface ModelDefinition {
  id: string;
  label: string;
  provider: 'anthropic' | 'openai' | 'google';
  description: string;
}

export const AVAILABLE_MODELS: ModelDefinition[] = [
  { id: 'claude-sonnet-4-6', label: 'Claude Sonnet 4.6', provider: 'anthropic', description: 'Fast, intelligent — recommended' },
  { id: 'claude-opus-4-6',   label: 'Claude Opus 4.6',   provider: 'anthropic', description: 'Most capable Claude model' },
  { id: 'gpt-5.4',            label: 'GPT 5.4',            provider: 'openai',    description: 'OpenAI flagship model' },
  { id: 'gemini-3',           label: 'Gemini 3',           provider: 'google',    description: 'Google — fast & efficient' },
];

export const DEFAULT_MODEL = 'claude-sonnet-4-6';

export const PROVIDER_COLORS: Record<ModelDefinition['provider'], string> = {
  anthropic: 'bg-purple-100 text-purple-700',
  openai:    'bg-green-100 text-green-700',
  google:    'bg-blue-100 text-blue-700',
};

export function getModelById(id: string): ModelDefinition | undefined {
  return AVAILABLE_MODELS.find(m => m.id === id);
}
