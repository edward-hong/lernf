import type {
  AIProviderSettings,
  ProviderConfig,
} from '../types/aiProvider';
import { obfuscate, deobfuscate } from './encryption';

const STORAGE_KEY = 'lernf-ai-provider-settings';
const STORAGE_VERSION = 1;

/**
 * Storage format (with encrypted API keys)
 */
interface StoredSettings {
  version: number;
  settings: AIProviderSettings;
}

/**
 * Default settings (no providers configured, use backend).
 *
 * @returns Default AI provider settings
 */
export function getDefaultSettings(): AIProviderSettings {
  return {
    providers: {},
    primaryProvider: 'backend-default',
    backupProviders: [],
    autoFallback: true,
    showProviderInUI: false,
    lastUpdated: new Date(),
  };
}

/**
 * Saves AI provider settings to localStorage.
 * Encrypts API keys before storing.
 *
 * @param settings - Settings to save
 * @returns Whether save was successful
 */
export function saveProviderSettings(settings: AIProviderSettings): boolean {
  try {
    // Create a copy with encrypted API keys
    const encryptedSettings: AIProviderSettings = {
      ...settings,
      providers: Object.entries(settings.providers).reduce(
        (acc, [key, config]) => {
          if (config) {
            acc[key as keyof typeof acc] = {
              ...config,
              apiKey: obfuscate(config.apiKey),
            } as ProviderConfig;
          }
          return acc;
        },
        {} as AIProviderSettings['providers'],
      ),
      lastUpdated: new Date(),
    };

    const toStore: StoredSettings = {
      version: STORAGE_VERSION,
      settings: encryptedSettings,
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(toStore));
    return true;
  } catch (error) {
    console.error('Failed to save provider settings:', error);
    return false;
  }
}

/**
 * Loads AI provider settings from localStorage.
 * Decrypts API keys after loading.
 *
 * @returns Loaded settings, or default settings if none exist
 */
export function loadProviderSettings(): AIProviderSettings {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);

    if (!stored) {
      return getDefaultSettings();
    }

    const parsed: StoredSettings = JSON.parse(stored);

    // Version migration logic (if needed in future)
    if (parsed.version !== STORAGE_VERSION) {
      console.warn('Settings version mismatch, using defaults');
      return getDefaultSettings();
    }

    // Decrypt API keys
    const decryptedSettings: AIProviderSettings = {
      ...parsed.settings,
      providers: Object.entries(parsed.settings.providers).reduce(
        (acc, [key, config]) => {
          if (config) {
            acc[key as keyof typeof acc] = {
              ...config,
              apiKey: deobfuscate(config.apiKey),
              // Convert string dates back to Date objects
              lastValidated: config.lastValidated
                ? new Date(config.lastValidated)
                : undefined,
            } as ProviderConfig;
          }
          return acc;
        },
        {} as AIProviderSettings['providers'],
      ),
      lastUpdated: new Date(parsed.settings.lastUpdated),
    };

    return decryptedSettings;
  } catch (error) {
    console.error('Failed to load provider settings:', error);
    return getDefaultSettings();
  }
}

/**
 * Clears all provider settings from localStorage.
 *
 * @returns Whether clear was successful
 */
export function clearProviderSettings(): boolean {
  try {
    localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch (error) {
    console.error('Failed to clear provider settings:', error);
    return false;
  }
}

/**
 * Checks if any provider settings exist.
 *
 * @returns Whether settings exist in storage
 */
export function hasProviderSettings(): boolean {
  return localStorage.getItem(STORAGE_KEY) !== null;
}

/**
 * Updates a single provider configuration.
 *
 * @param providerId - ID of provider to update
 * @param config - New configuration (or undefined to remove)
 * @returns Whether update was successful
 */
export function updateProviderConfig(
  providerId: keyof AIProviderSettings['providers'],
  config?: ProviderConfig,
): boolean {
  try {
    const settings = loadProviderSettings();

    if (config) {
      settings.providers[providerId] = config;
    } else {
      delete settings.providers[providerId];
    }

    return saveProviderSettings(settings);
  } catch (error) {
    console.error('Failed to update provider config:', error);
    return false;
  }
}

/**
 * Updates the primary provider.
 *
 * @param providerId - New primary provider
 * @returns Whether update was successful
 */
export function updatePrimaryProvider(
  providerId: AIProviderSettings['primaryProvider'],
): boolean {
  try {
    const settings = loadProviderSettings();
    settings.primaryProvider = providerId;
    return saveProviderSettings(settings);
  } catch (error) {
    console.error('Failed to update primary provider:', error);
    return false;
  }
}

/**
 * Updates the backup provider chain.
 *
 * @param backups - New backup provider list
 * @returns Whether update was successful
 */
export function updateBackupProviders(
  backups: AIProviderSettings['backupProviders'],
): boolean {
  try {
    const settings = loadProviderSettings();
    settings.backupProviders = backups;
    return saveProviderSettings(settings);
  } catch (error) {
    console.error('Failed to update backup providers:', error);
    return false;
  }
}
