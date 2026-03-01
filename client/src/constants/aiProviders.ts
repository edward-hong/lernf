import type { ProviderMetadata, AIProviderId } from '../types/aiProvider';

/**
 * Static metadata for all supported AI providers
 */
export const PROVIDER_METADATA: Record<AIProviderId, ProviderMetadata> = {
  claude: {
    id: 'claude',
    name: 'claude',
    displayName: 'Claude (Anthropic)',
    description: "Anthropic's Claude models - powerful, safe, and steerable",
    apiEndpoint: 'https://api.anthropic.com/v1/messages',
    keyFormat: /^sk-ant-[a-zA-Z0-9_-]{95,}$/,
    defaultModel: 'claude-sonnet-4-5-20250514',
    availableModels: [
      'claude-sonnet-4-5-20250514',
      'claude-haiku-4-5-20251001',
      'claude-opus-4-20250514',
    ],
    documentationUrl: 'https://docs.anthropic.com/en/api/getting-started',
  },

  openai: {
    id: 'openai',
    name: 'openai',
    displayName: 'OpenAI',
    description: "OpenAI's GPT and o-series reasoning models",
    apiEndpoint: 'https://api.openai.com/v1/chat/completions',
    keyFormat: /^sk-(proj-)?[a-zA-Z0-9]{32,}$/,
    defaultModel: 'gpt-4o',
    availableModels: ['gpt-4o', 'gpt-4o-mini', 'o1', 'o3-mini'],
    documentationUrl: 'https://platform.openai.com/docs/quickstart',
  },

  gemini: {
    id: 'gemini',
    name: 'gemini',
    displayName: 'Google Gemini',
    description: "Google's Gemini models with multimodal capabilities",
    apiEndpoint: 'https://generativelanguage.googleapis.com/v1beta/models',
    keyFormat: /^AIza[a-zA-Z0-9_-]{35}$/,
    defaultModel: 'gemini-2.0-flash',
    availableModels: [
      'gemini-2.0-flash',
      'gemini-1.5-pro',
      'gemini-1.5-flash',
    ],
    documentationUrl: 'https://ai.google.dev/gemini-api/docs/quickstart',
  },

  deepseek: {
    id: 'deepseek',
    name: 'deepseek',
    displayName: 'DeepSeek',
    description: 'DeepSeek models (default backend provider)',
    apiEndpoint: 'https://api.deepseek.com/v1/chat/completions',
    keyFormat: /^sk-[a-zA-Z0-9]{32,}$/,
    defaultModel: 'deepseek-chat',
    availableModels: ['deepseek-chat', 'deepseek-reasoner'],
    documentationUrl: 'https://platform.deepseek.com/docs',
  },
};

/**
 * Get metadata for a specific provider.
 *
 * @param id - The provider identifier
 * @returns Provider metadata
 */
export function getProviderMetadata(id: AIProviderId): ProviderMetadata {
  return PROVIDER_METADATA[id];
}

/**
 * Get all available provider IDs.
 *
 * @returns Array of all provider IDs
 */
export function getAllProviderIds(): AIProviderId[] {
  return Object.keys(PROVIDER_METADATA) as AIProviderId[];
}

/**
 * Validate API key format for a provider.
 *
 * @param providerId - The provider to validate against
 * @param apiKey - The API key to validate
 * @returns Whether the key matches the expected format
 */
export function validateKeyFormat(
  providerId: AIProviderId,
  apiKey: string,
): boolean {
  const metadata = PROVIDER_METADATA[providerId];
  return metadata.keyFormat.test(apiKey);
}
