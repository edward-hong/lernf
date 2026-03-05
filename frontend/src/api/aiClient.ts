import type { AIRequest, AIResponse, AIProviderError } from '../types/aiRequest';
import type { AIProviderId, AIProviderSettings } from '../types/aiProvider';
import { loadProviderSettings } from '../utils/providerStorage';
import { performanceMonitor } from '../utils/aiPerformanceMonitor';
import { callClaude } from './adapters/claudeAdapter';
import { callOpenAI } from './adapters/openaiAdapter';
import { callGemini } from './adapters/geminiAdapter';
import { callBackendAI } from './adapters/backendAdapter';

/**
 * Result from AI call attempt (success or failure)
 */
interface AICallAttempt {
  providerId: string;
  success: boolean;
  response?: AIResponse;
  error?: AIProviderError;
}

/**
 * Makes an AI request using the configured provider priority chain.
 * Automatically falls back to next provider if primary fails.
 *
 * @param request - AI request
 * @returns AI response from the first successful provider
 * @throws Error if all providers fail
 */
export async function callAI(request: AIRequest): Promise<AIResponse> {
  const settings = loadProviderSettings();
  const attempts: AICallAttempt[] = [];

  // Build provider chain
  const chain: Array<AIProviderId | 'backend-default'> = [
    settings.primaryProvider,
    ...settings.backupProviders,
  ];

  // Always add backend as final fallback if auto-fallback is enabled
  if (settings.autoFallback && !chain.includes('backend-default')) {
    chain.push('backend-default');
  }

  // Track AI request count for notification banner
  const count = parseInt(localStorage.getItem('ai-request-count') || '0', 10);
  localStorage.setItem('ai-request-count', String(count + 1));

  // Try each provider in order
  for (const providerId of chain) {
    const startTime = Date.now();

    try {
      console.log(`[AI Client] Attempting provider: ${providerId}`);

      const response = await attemptProvider(providerId, request, settings);

      attempts.push({
        providerId,
        success: true,
        response,
      });

      // Record successful request
      performanceMonitor.recordRequest({
        provider: response.provider,
        model: response.model,
        requestTime: Date.now() - startTime,
        tokenCount: response.tokensUsed,
        success: true,
        timestamp: new Date(),
      });

      console.log(`[AI Client] Success with provider: ${providerId}`);

      return response;
    } catch (error) {
      const providerError = error as AIProviderError;

      console.warn(
        `[AI Client] Provider ${providerId} failed:`,
        providerError.message,
      );

      // Record failed request
      performanceMonitor.recordRequest({
        provider: String(providerId),
        model: settings.providers[providerId as keyof typeof settings.providers]?.model || 'unknown',
        requestTime: Date.now() - startTime,
        success: false,
        timestamp: new Date(),
      });

      attempts.push({
        providerId,
        success: false,
        error: providerError,
      });

      // If error can't be retried, don't try remaining providers
      if (!providerError.canRetry) {
        console.error(`[AI Client] Non-retryable error, stopping chain`);
        break;
      }

      // Continue to next provider in chain
    }
  }

  // All providers failed
  throw createAllProvidersFailedError(attempts);
}

/**
 * Attempts to call a specific provider
 */
async function attemptProvider(
  providerId: AIProviderId | 'backend-default',
  request: AIRequest,
  settings: AIProviderSettings,
): Promise<AIResponse> {
  // Backend default
  if (providerId === 'backend-default') {
    return await callBackendAI(request);
  }

  // User-configured provider
  const providerConfig = settings.providers[providerId];

  if (!providerConfig) {
    throw {
      provider: providerId,
      errorType: 'invalid_request',
      message: `Provider ${providerId} is not configured`,
      canRetry: false,
    } as AIProviderError;
  }

  if (!providerConfig.enabled) {
    throw {
      provider: providerId,
      errorType: 'invalid_request',
      message: `Provider ${providerId} is disabled`,
      canRetry: false,
    } as AIProviderError;
  }

  // Call appropriate adapter
  switch (providerId) {
    case 'claude':
      return await callClaude(providerConfig, request);
    case 'openai':
      return await callOpenAI(providerConfig, request);
    case 'gemini':
      return await callGemini(providerConfig, request);
    case 'deepseek':
      // User has their own DeepSeek key, not using backend
      throw {
        provider: 'deepseek',
        errorType: 'invalid_request',
        message:
          'User DeepSeek keys not yet supported (use backend-default instead)',
        canRetry: false,
      } as AIProviderError;
    default:
      throw {
        provider: providerId,
        errorType: 'invalid_request',
        message: `Unknown provider: ${providerId}`,
        canRetry: false,
      } as AIProviderError;
  }
}

/**
 * Creates a comprehensive error when all providers fail
 */
function createAllProvidersFailedError(attempts: AICallAttempt[]): Error {
  const failureDetails = attempts
    .map((attempt) => {
      if (attempt.success) {
        return `  ${attempt.providerId}: Success`;
      } else {
        return `  ${attempt.providerId}: ${attempt.error?.message || 'Unknown error'}`;
      }
    })
    .join('\n');

  return new Error(
    `All AI providers failed:\n\n${failureDetails}\n\nPlease check your API keys in Settings or try again later.`,
  );
}

/**
 * Tests a specific provider configuration.
 * Useful for validating API keys in settings UI.
 *
 * @param providerId - Provider to test
 * @returns Test result
 */
export async function testProvider(
  providerId: AIProviderId,
): Promise<{ success: boolean; error?: string; responseTime?: number }> {
  const startTime = Date.now();

  try {
    const settings = loadProviderSettings();
    const config = settings.providers[providerId];

    if (!config) {
      return { success: false, error: 'Provider not configured' };
    }

    // Make a minimal test request
    const testRequest: AIRequest = {
      messages: [{ role: 'user', content: 'Hi' }],
      maxTokens: 10,
      temperature: 0.7,
    };

    await attemptProvider(providerId, testRequest, settings);

    const responseTime = Date.now() - startTime;

    return { success: true, responseTime };
  } catch (error) {
    const providerError = error as AIProviderError;
    return {
      success: false,
      error: providerError.message || 'Test failed',
      responseTime: Date.now() - startTime,
    };
  }
}
