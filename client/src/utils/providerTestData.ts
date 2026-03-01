import type { AIProviderSettings, ProviderConfig } from '../types/aiProvider';

/**
 * Sample Claude configuration
 */
export const SAMPLE_CLAUDE_CONFIG: ProviderConfig = {
  id: 'claude',
  name: 'claude',
  enabled: true,
  apiKey:
    'sk-ant-api03-test-key-for-development-only-do-not-use-in-production-this-is-a-placeholder',
  model: 'claude-3-5-sonnet-20241022',
  availableModels: [
    'claude-3-5-sonnet-20241022',
    'claude-3-5-haiku-20241022',
    'claude-opus-4-20250514',
  ],
  lastValidated: new Date(),
  isValid: true,
};

/**
 * Sample OpenAI configuration
 */
export const SAMPLE_OPENAI_CONFIG: ProviderConfig = {
  id: 'openai',
  name: 'openai',
  enabled: true,
  apiKey: 'sk-proj-test-key-for-development-only',
  model: 'gpt-4o',
  availableModels: ['gpt-4o', 'gpt-4o-mini', 'o1-preview', 'o1-mini'],
  lastValidated: new Date(),
  isValid: true,
};

/**
 * Sample complete settings with Claude as primary
 */
export const SAMPLE_SETTINGS_CLAUDE_PRIMARY: AIProviderSettings = {
  providers: {
    claude: SAMPLE_CLAUDE_CONFIG,
    openai: SAMPLE_OPENAI_CONFIG,
  },
  primaryProvider: 'claude',
  backupProviders: ['openai'],
  autoFallback: true,
  showProviderInUI: true,
  lastUsedProvider: 'claude',
  lastUpdated: new Date(),
};

/**
 * Sample settings with backend default (no user providers)
 */
export const SAMPLE_SETTINGS_BACKEND_DEFAULT: AIProviderSettings = {
  providers: {},
  primaryProvider: 'backend-default',
  backupProviders: [],
  autoFallback: true,
  showProviderInUI: false,
  lastUpdated: new Date(),
};

/**
 * Invalid API keys for testing validation
 */
export const INVALID_API_KEYS = {
  claude: ['invalid-key', 'sk-wrong-prefix', 'sk-ant-tooshort', ''],
  openai: ['invalid-key', 'pk-wrong-prefix', 'sk-tooshort', ''],
  gemini: ['invalid-key', 'AIzatooshort', 'wrongprefix', ''],
};
