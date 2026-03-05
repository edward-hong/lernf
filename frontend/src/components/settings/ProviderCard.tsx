import { useState } from 'react';
import type { ProviderConfig, AIProviderId } from '../../types/aiProvider';
import { getProviderMetadata } from '../../constants/aiProviders';
import { testProvider } from '../../api/aiClient';
import { APIKeyInput } from './APIKeyInput';
import { ModelSelector } from './ModelSelector';

interface ProviderCardProps {
  providerId: AIProviderId;
  config?: ProviderConfig;
  isPrimary: boolean;
  onUpdate: (config: ProviderConfig) => void;
  onRemove: () => void;
}

export function ProviderCard({
  providerId,
  config,
  isPrimary,
  onUpdate,
  onRemove,
}: ProviderCardProps) {
  const metadata = getProviderMetadata(providerId);
  const [isConfigured, setIsConfigured] = useState(!!config);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const handleAddKey = (apiKey: string) => {
    const newConfig: ProviderConfig = {
      id: providerId,
      name: metadata.name,
      enabled: true,
      apiKey,
      model: metadata.defaultModel,
      availableModels: metadata.availableModels,
      lastValidated: new Date(),
      isValid: undefined,
    };
    setIsConfigured(true);
    onUpdate(newConfig);
  };

  const handleUpdateKey = (apiKey: string) => {
    if (!config) return;
    onUpdate({
      ...config,
      apiKey,
      isValid: undefined,
    });
  };

  const handleUpdateModel = (model: string) => {
    if (!config) return;
    onUpdate({
      ...config,
      model,
    });
  };

  const handleToggleEnabled = () => {
    if (!config) return;
    onUpdate({
      ...config,
      enabled: !config.enabled,
    });
  };

  const handleTest = async () => {
    setIsTesting(true);
    setTestResult(null);

    try {
      const result = await testProvider(providerId);

      if (result.success) {
        setTestResult({
          success: true,
          message: `Valid (${result.responseTime}ms)`,
        });
        if (config) {
          onUpdate({
            ...config,
            lastValidated: new Date(),
            isValid: true,
          });
        }
      } else {
        setTestResult({
          success: false,
          message: result.error || 'Test failed',
        });
        if (config) {
          onUpdate({
            ...config,
            lastValidated: new Date(),
            isValid: false,
          });
        }
      }
    } catch (error) {
      setTestResult({
        success: false,
        message: error instanceof Error ? error.message : 'Test failed',
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleRemove = () => {
    if (
      confirm(
        `Remove ${metadata.displayName} configuration? This will delete your API key.`,
      )
    ) {
      setIsConfigured(false);
      setTestResult(null);
      onRemove();
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {metadata.displayName}
          </h3>
          <p className="text-sm text-gray-600 mt-1">{metadata.description}</p>
        </div>

        {isPrimary && (
          <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
            Primary
          </span>
        )}
      </div>

      {!isConfigured ? (
        /* Not configured state */
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Add your {metadata.displayName} API key to use this provider.
          </p>

          <APIKeyInput
            providerId={providerId}
            value=""
            onChange={handleAddKey}
            placeholder={`Enter your ${metadata.displayName} API key`}
          />

          <a
            href={metadata.documentationUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-600 hover:text-blue-700 hover:underline inline-flex items-center gap-1"
          >
            Get API key from {metadata.displayName}
            <span className="text-xs" aria-hidden="true">
              &#x2197;
            </span>
          </a>
        </div>
      ) : (
        /* Configured state */
        <div className="space-y-4">
          {/* API Key */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              API Key
            </label>
            <APIKeyInput
              providerId={providerId}
              value={config?.apiKey || ''}
              onChange={handleUpdateKey}
            />
          </div>

          {/* Model Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Model
            </label>
            <ModelSelector
              availableModels={metadata.availableModels}
              selectedModel={config?.model || metadata.defaultModel}
              onChange={handleUpdateModel}
            />
          </div>

          {/* Status & Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <div className="flex items-center gap-4">
              {/* Enabled toggle */}
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config?.enabled || false}
                  onChange={handleToggleEnabled}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <span className="text-sm text-gray-700">Enabled</span>
              </label>

              {/* Status indicator */}
              {testResult && (
                <span
                  className={`text-sm ${
                    testResult.success ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {testResult.message}
                </span>
              )}

              {config?.lastValidated && !testResult && (
                <span className="text-xs text-gray-500">
                  Last tested:{' '}
                  {new Date(config.lastValidated).toLocaleDateString()}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {/* Test button */}
              <button
                onClick={handleTest}
                disabled={isTesting || !config?.enabled}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isTesting ? 'Testing...' : 'Test'}
              </button>

              {/* Remove button */}
              <button
                onClick={handleRemove}
                className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
