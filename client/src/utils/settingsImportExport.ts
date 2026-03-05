import type { AIProviderSettings } from '../types/aiProvider';
import {
  loadProviderSettings,
  saveProviderSettings,
} from './providerStorage';

/**
 * Exports settings to JSON file (with API keys partially hidden for security)
 */
export function exportSettings(): void {
  const settings = loadProviderSettings();

  // Create sanitized copy (keys partially hidden)
  const sanitized: AIProviderSettings = {
    ...settings,
    providers: Object.entries(settings.providers).reduce(
      (acc, [key, config]) => {
        if (config) {
          acc[key as keyof typeof acc] = {
            ...config,
            apiKey: config.apiKey.slice(0, 10) + '...[HIDDEN]',
          } as typeof config;
        }
        return acc;
      },
      {} as AIProviderSettings['providers'],
    ),
  };

  // Create downloadable file
  const blob = new Blob([JSON.stringify(sanitized, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `lernf-ai-settings-${new Date().toISOString().split('T')[0]}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

/**
 * Imports settings from JSON file
 */
export function importSettings(file: File): Promise<boolean> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const imported: Partial<AIProviderSettings> = JSON.parse(content);

        // Validate basic structure
        if (!imported.primaryProvider || !imported.providers) {
          throw new Error('Invalid settings file format');
        }

        // Warn about partial API keys
        const hasPartialKeys = Object.values(imported.providers).some(
          (config) => config?.apiKey.includes('[HIDDEN]'),
        );

        if (hasPartialKeys) {
          alert(
            "Warning: Imported settings contain partial API keys. You'll need to re-enter full keys.",
          );
        }

        // Merge with current settings (don't replace everything)
        const current = loadProviderSettings();
        const merged: AIProviderSettings = {
          ...current,
          ...imported,
          providers: {
            ...current.providers,
            ...imported.providers,
          },
          lastUpdated: new Date(),
        } as AIProviderSettings;

        saveProviderSettings(merged);
        resolve(true);
      } catch (error) {
        console.error('Import failed:', error);
        reject(error);
      }
    };

    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}
