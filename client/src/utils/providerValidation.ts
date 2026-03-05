import type {
  AIProviderSettings,
  ProviderConfig,
  AIProviderId,
} from '../types/aiProvider';
import { PROVIDER_METADATA } from '../constants/aiProviders';

/**
 * Validation result
 */
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Validates a provider configuration.
 *
 * @param config - Provider config to validate
 * @returns Validation result with errors and warnings
 */
export function validateProviderConfig(
  config: ProviderConfig,
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check if provider is known
  const metadata = PROVIDER_METADATA[config.id];
  if (!metadata) {
    errors.push(`Unknown provider: ${config.id}`);
    return { isValid: false, errors, warnings };
  }

  // Validate API key format
  if (!config.apiKey || config.apiKey.trim() === '') {
    errors.push('API key is required');
  } else if (!metadata.keyFormat.test(config.apiKey)) {
    errors.push(`API key format is invalid for ${metadata.displayName}`);
    warnings.push(`Expected format: ${metadata.keyFormat.source}`);
  }

  // Validate model selection
  if (!config.model || config.model.trim() === '') {
    errors.push('Model selection is required');
  } else if (!metadata.availableModels.includes(config.model)) {
    warnings.push(
      `Model "${config.model}" is not in the standard list for ${metadata.displayName}`,
    );
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validates complete provider settings.
 *
 * @param settings - Settings to validate
 * @returns Validation result with errors and warnings
 */
export function validateProviderSettings(
  settings: AIProviderSettings,
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validate primary provider
  if (settings.primaryProvider !== 'backend-default') {
    const primaryConfig =
      settings.providers[settings.primaryProvider as AIProviderId];

    if (!primaryConfig) {
      errors.push(
        `Primary provider "${settings.primaryProvider}" is not configured`,
      );
    } else if (!primaryConfig.enabled) {
      warnings.push(
        `Primary provider "${settings.primaryProvider}" is disabled`,
      );
    } else {
      const validation = validateProviderConfig(primaryConfig);
      errors.push(...validation.errors.map((e) => `Primary provider: ${e}`));
      warnings.push(
        ...validation.warnings.map((w) => `Primary provider: ${w}`),
      );
    }
  }

  // Validate backup providers
  settings.backupProviders.forEach((backupId, index) => {
    const backupConfig = settings.providers[backupId];

    if (!backupConfig) {
      warnings.push(`Backup #${index + 1} "${backupId}" is not configured`);
    } else if (!backupConfig.enabled) {
      warnings.push(`Backup #${index + 1} "${backupId}" is disabled`);
    } else {
      const validation = validateProviderConfig(backupConfig);
      errors.push(
        ...validation.errors.map((e) => `Backup #${index + 1}: ${e}`),
      );
      warnings.push(
        ...validation.warnings.map((w) => `Backup #${index + 1}: ${w}`),
      );
    }
  });

  // Check for duplicate backups
  const uniqueBackups = new Set(settings.backupProviders);
  if (uniqueBackups.size !== settings.backupProviders.length) {
    warnings.push('Backup providers list contains duplicates');
  }

  // Check if primary is in backups
  if (
    settings.primaryProvider !== 'backend-default' &&
    settings.backupProviders.includes(settings.primaryProvider as AIProviderId)
  ) {
    warnings.push('Primary provider should not be in backup list');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Gets a user-friendly error message for common validation issues.
 *
 * @param error - Error message from validation
 * @returns User-friendly message
 */
export function getValidationErrorMessage(error: string): string {
  if (error.includes('API key format is invalid')) {
    return 'The API key format is incorrect. Please check that you copied the entire key.';
  }

  if (error.includes('API key is required')) {
    return 'Please enter an API key to use this provider.';
  }

  if (error.includes('Model selection is required')) {
    return 'Please select a model to use with this provider.';
  }

  if (error.includes('not configured')) {
    return 'This provider needs to be configured before it can be used.';
  }

  return error;
}
