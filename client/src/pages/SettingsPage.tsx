import { useState, useEffect, useRef } from 'react';
import type { AIProviderSettings } from '../types/aiProvider';
import {
  loadProviderSettings,
  saveProviderSettings,
} from '../utils/providerStorage';
import { exportSettings, importSettings } from '../utils/settingsImportExport';
import { ProviderCard } from '../components/settings/ProviderCard';
import { PriorityChainBuilder } from '../components/settings/PriorityChainBuilder';
import { SecurityNotice } from '../components/settings/SecurityNotice';
import { TestConfiguration } from '../components/settings/TestConfiguration';
import { OnboardingModal } from '../components/settings/OnboardingModal';
import { HelpTooltip } from '../components/settings/HelpTooltip';
import { PerformanceStats } from '../components/settings/PerformanceStats';
import { getAllProviderIds } from '../constants/aiProviders';

export function SettingsPage() {
  const [settings, setSettings] = useState<AIProviderSettings>(
    loadProviderSettings(),
  );
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [saveStatus, setSaveStatus] = useState<
    'idle' | 'saving' | 'saved' | 'error'
  >('idle');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-save on changes (with debounce)
  useEffect(() => {
    if (!hasUnsavedChanges) return;

    const timer = setTimeout(() => {
      handleSave();
    }, 1000);
    return () => clearTimeout(timer);
  }, [settings, hasUnsavedChanges]);

  const handleSave = () => {
    setSaveStatus('saving');
    const success = saveProviderSettings(settings);
    if (success) {
      setSaveStatus('saved');
      setHasUnsavedChanges(false);
      setTimeout(() => setSaveStatus('idle'), 2000);
    } else {
      setSaveStatus('error');
    }
  };

  const handleSettingsChange = (newSettings: AIProviderSettings) => {
    setSettings(newSettings);
    setHasUnsavedChanges(true);
  };

  const handleReset = () => {
    if (confirm('Reset all AI provider settings? This will remove all API keys.')) {
      const defaultSettings: AIProviderSettings = {
        providers: {},
        primaryProvider: 'backend-default',
        backupProviders: [],
        autoFallback: true,
        showProviderInUI: false,
        lastUpdated: new Date(),
      };
      setSettings(defaultSettings);
      saveProviderSettings(defaultSettings);
      setHasUnsavedChanges(false);
    }
  };

  const handleExport = () => {
    exportSettings();
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      await importSettings(file);
      alert('Settings imported successfully!');
      setSettings(loadProviderSettings());
    } catch {
      alert('Failed to import settings. Please check the file format.');
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Onboarding modal */}
      <OnboardingModal />

      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-6 py-8">
          <h1 className="text-3xl font-bold text-gray-900">
            AI Provider Settings
          </h1>
          <p className="text-gray-600 mt-2">
            Configure AI providers for Lernf features. Your API keys are stored
            locally and never sent to our servers.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-6 py-8 space-y-8">
        {/* Security Notice */}
        <SecurityNotice />

        {/* Primary Provider Selection */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Primary Provider
            </h2>
            <HelpTooltip
              content="The primary provider is tried first for all AI requests. If it fails, Lernf will automatically try your backup providers."
            />
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Select which AI provider to use by default for all features.
          </p>

          <div className="space-y-2">
            {/* Backend Default */}
            <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
              <input
                type="radio"
                name="primary-provider"
                value="backend-default"
                checked={settings.primaryProvider === 'backend-default'}
                onChange={(e) =>
                  handleSettingsChange({
                    ...settings,
                    primaryProvider: e.target.value as 'backend-default',
                  })
                }
                className="w-4 h-4 text-blue-600"
              />
              <div className="flex-1">
                <div className="font-medium text-gray-900">
                  Backend Default (DeepSeek)
                </div>
                <div className="text-sm text-gray-500">
                  Free to use, no API key required
                </div>
              </div>
            </label>

            {/* User Providers */}
            {getAllProviderIds()
              .filter((id) => id !== 'deepseek')
              .map((providerId) => (
                <label
                  key={providerId}
                  className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <input
                    type="radio"
                    name="primary-provider"
                    value={providerId}
                    checked={settings.primaryProvider === providerId}
                    onChange={(e) =>
                      handleSettingsChange({
                        ...settings,
                        primaryProvider: e.target.value as typeof providerId,
                      })
                    }
                    disabled={!settings.providers[providerId]?.enabled}
                    className="w-4 h-4 text-blue-600 disabled:opacity-50"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">
                      {providerId === 'claude' && 'Claude (Anthropic)'}
                      {providerId === 'openai' && 'OpenAI'}
                      {providerId === 'gemini' && 'Google Gemini'}
                    </div>
                    <div className="text-sm text-gray-500">
                      {settings.providers[providerId]?.enabled
                        ? `Using ${settings.providers[providerId]?.model}`
                        : 'Not configured'}
                    </div>
                  </div>
                  {!settings.providers[providerId]?.enabled && (
                    <span className="text-xs text-gray-400">
                      Configure below
                    </span>
                  )}
                </label>
              ))}
          </div>
        </div>

        {/* Provider Configurations */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Provider Configurations
          </h2>

          {getAllProviderIds()
            .filter((id) => id !== 'deepseek')
            .map((providerId) => (
              <ProviderCard
                key={providerId}
                providerId={providerId}
                config={settings.providers[providerId]}
                isPrimary={settings.primaryProvider === providerId}
                onUpdate={(config) =>
                  handleSettingsChange({
                    ...settings,
                    providers: {
                      ...settings.providers,
                      [providerId]: config,
                    },
                  })
                }
                onRemove={() => {
                  const newProviders = { ...settings.providers };
                  delete newProviders[providerId];
                  handleSettingsChange({
                    ...settings,
                    providers: newProviders,
                    primaryProvider:
                      settings.primaryProvider === providerId
                        ? 'backend-default'
                        : settings.primaryProvider,
                    backupProviders: settings.backupProviders.filter(
                      (id) => id !== providerId,
                    ),
                  });
                }}
              />
            ))}
        </div>

        {/* Backup Providers */}
        <PriorityChainBuilder
          primaryProvider={settings.primaryProvider}
          backupProviders={settings.backupProviders}
          availableProviders={getAllProviderIds().filter(
            (id) =>
              id !== 'deepseek' &&
              settings.providers[id]?.enabled &&
              settings.primaryProvider !== id,
          )}
          onChange={(backups) =>
            handleSettingsChange({
              ...settings,
              backupProviders: backups,
            })
          }
        />

        {/* Advanced Settings */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Advanced Settings
          </h2>

          <div className="space-y-4">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={settings.autoFallback}
                onChange={(e) =>
                  handleSettingsChange({
                    ...settings,
                    autoFallback: e.target.checked,
                  })
                }
                className="w-4 h-4 text-blue-600 rounded"
              />
              <div>
                <div className="font-medium text-gray-900">
                  Auto-fallback on errors
                </div>
                <div className="text-sm text-gray-500">
                  Automatically try backup providers if primary fails
                </div>
              </div>
            </label>

            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={settings.showProviderInUI}
                onChange={(e) =>
                  handleSettingsChange({
                    ...settings,
                    showProviderInUI: e.target.checked,
                  })
                }
                className="w-4 h-4 text-blue-600 rounded"
              />
              <div>
                <div className="font-medium text-gray-900">
                  Show provider name in responses
                </div>
                <div className="text-sm text-gray-500">
                  Display which AI provider generated each response
                </div>
              </div>
            </label>
          </div>
        </div>

        {/* Test Configuration */}
        <TestConfiguration settings={settings} />

        {/* Performance Stats */}
        <PerformanceStats />

        {/* Backup & Restore */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Backup & Restore
          </h2>

          <div className="flex items-center gap-3">
            <button
              onClick={handleExport}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Export Settings
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Import Settings
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
            />
          </div>

          <p className="text-sm text-gray-500 mt-2">
            Note: API keys are partially hidden in exports for security. You'll
            need to re-enter them after importing.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-6 border-t border-gray-200">
          <button
            onClick={handleReset}
            className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
          >
            Reset All Settings
          </button>

          <div className="flex items-center gap-3">
            {/* Save status indicator */}
            {saveStatus === 'saving' && (
              <span className="text-sm text-gray-500">Saving...</span>
            )}
            {saveStatus === 'saved' && (
              <span className="text-sm text-green-600">Saved</span>
            )}
            {saveStatus === 'error' && (
              <span className="text-sm text-red-600">Failed to save</span>
            )}

            <button
              onClick={handleSave}
              disabled={!hasUnsavedChanges}
              className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              Save Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
