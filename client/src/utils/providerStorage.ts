import type {
  AIProviderSettings,
  ProviderConfig,
} from '../types/aiProvider';
import { encrypt, decrypt, obfuscate, deobfuscate } from './encryption';

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
 * Encrypts API keys with AES-GCM before storing.
 *
 * @param settings - Settings to save
 * @returns Whether save was successful
 */
export async function saveProviderSettings(settings: AIProviderSettings): Promise<boolean> {
  try {
    // Encrypt each API key with AES-GCM
    const encryptedProviders: AIProviderSettings['providers'] = {};

    for (const [key, config] of Object.entries(settings.providers)) {
      if (config) {
        encryptedProviders[key as keyof typeof encryptedProviders] = {
          ...config,
          apiKey: await encrypt(config.apiKey),
        } as ProviderConfig;
      }
    }

    const encryptedSettings: AIProviderSettings = {
      ...settings,
      providers: encryptedProviders,
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
 * Synchronous save using legacy XOR obfuscation.
 * Used only where async is not possible (e.g. debounced auto-save).
 */
export function saveProviderSettingsSync(settings: AIProviderSettings): boolean {
  try {
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

    // Kick off an async re-encrypt with AES-GCM in the background
    saveProviderSettings(settings).catch(() => {});

    return true;
  } catch (error) {
    console.error('Failed to save provider settings:', error);
    return false;
  }
}

/**
 * Loads AI provider settings from localStorage.
 * Decrypts API keys after loading (supports both v2 AES-GCM and legacy XOR).
 *
 * @returns Loaded settings, or default settings if none exist
 */
export async function loadProviderSettingsAsync(): Promise<AIProviderSettings> {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);

    if (!stored) {
      return getDefaultSettings();
    }

    const parsed: StoredSettings = JSON.parse(stored);

    if (parsed.version !== STORAGE_VERSION) {
      console.warn('Settings version mismatch, using defaults');
      return getDefaultSettings();
    }

    // Decrypt API keys (handles both v2 AES-GCM and legacy XOR)
    const decryptedProviders: AIProviderSettings['providers'] = {};

    for (const [key, config] of Object.entries(parsed.settings.providers)) {
      if (config) {
        decryptedProviders[key as keyof typeof decryptedProviders] = {
          ...config,
          apiKey: await decrypt(config.apiKey),
          lastValidated: config.lastValidated
            ? new Date(config.lastValidated)
            : undefined,
        } as ProviderConfig;
      }
    }

    return {
      ...parsed.settings,
      providers: decryptedProviders,
      lastUpdated: new Date(parsed.settings.lastUpdated),
    };
  } catch (error) {
    console.error('Failed to load provider settings:', error);
    return getDefaultSettings();
  }
}

/**
 * Synchronous load using legacy XOR deobfuscation.
 * Kept for backward compatibility where async is not feasible.
 */
export function loadProviderSettings(): AIProviderSettings {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);

    if (!stored) {
      return getDefaultSettings();
    }

    const parsed: StoredSettings = JSON.parse(stored);

    if (parsed.version !== STORAGE_VERSION) {
      console.warn('Settings version mismatch, using defaults');
      return getDefaultSettings();
    }

    const decryptedSettings: AIProviderSettings = {
      ...parsed.settings,
      providers: Object.entries(parsed.settings.providers).reduce(
        (acc, [key, config]) => {
          if (config) {
            acc[key as keyof typeof acc] = {
              ...config,
              apiKey: deobfuscate(config.apiKey),
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

    return saveProviderSettingsSync(settings);
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
    return saveProviderSettingsSync(settings);
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
    return saveProviderSettingsSync(settings);
  } catch (error) {
    console.error('Failed to update backup providers:', error);
    return false;
  }
}
