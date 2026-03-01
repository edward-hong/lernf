/**
 * Supported AI providers
 */
export type AIProviderId = 'claude' | 'openai' | 'gemini' | 'deepseek';

/**
 * Configuration for a single AI provider
 */
export interface ProviderConfig {
  /** Provider identifier */
  id: AIProviderId;

  /** Display name */
  name: string;

  /** Whether this provider is enabled */
  enabled: boolean;

  /** API key (will be encrypted in storage) */
  apiKey: string;

  /** Selected model for this provider */
  model: string;

  /** Available models for this provider */
  availableModels: string[];

  /** Last validation timestamp */
  lastValidated?: Date;

  /** Whether the API key was successfully validated */
  isValid?: boolean;
}

/**
 * Complete AI provider settings
 */
export interface AIProviderSettings {
  /** Configured providers (keyed by provider ID) */
  providers: Partial<Record<AIProviderId, ProviderConfig>>;

  /** Primary provider to use first */
  primaryProvider: AIProviderId | 'backend-default';

  /** Backup providers to try if primary fails (in order) */
  backupProviders: AIProviderId[];

  /** Whether to automatically fall back to next provider on error */
  autoFallback: boolean;

  /** Whether to show provider name in UI responses */
  showProviderInUI: boolean;

  /** Last provider that was successfully used */
  lastUsedProvider?: string;

  /** When settings were last updated */
  lastUpdated: Date;
}

/**
 * Provider metadata (static information about each provider)
 */
export interface ProviderMetadata {
  id: AIProviderId;
  name: string;
  displayName: string;
  description: string;
  apiEndpoint: string;
  keyFormat: RegExp;
  defaultModel: string;
  availableModels: string[];
  documentationUrl: string;
}
