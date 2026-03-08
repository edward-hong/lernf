import type { AIProviderError } from '../../types/aiRequest';

/**
 * Maps backend structured errorType strings to the frontend AIProviderError errorType.
 */
const ERROR_TYPE_MAP: Record<string, AIProviderError['errorType']> = {
  AUTH: 'auth',
  RATE_LIMIT: 'rate_limit',
  BILLING: 'billing',
  PROVIDER_ERROR: 'provider_error',
  UNKNOWN: 'unknown',
};

const RETRYABLE_TYPES = new Set(['RATE_LIMIT', 'PROVIDER_ERROR']);

/**
 * Attempts to parse a structured error response from the backend proxy.
 * The backend wraps `{ errorType, message, provider }` JSON inside the APIError message.
 */
export function parseProxyError(
  errorData: Record<string, unknown>,
  fallbackProvider: string,
): AIProviderError | null {
  // Case 1: backend APIError wraps JSON string in the `message` field
  const raw = (errorData.message as string) || '';
  try {
    const parsed = JSON.parse(raw);
    if (parsed.errorType && parsed.message) {
      return toProviderError(parsed, fallbackProvider);
    }
  } catch {
    // Not JSON — fall through
  }

  // Case 2: the body itself contains errorType (e.g. Encore unwrapped it)
  if (errorData.errorType && errorData.message) {
    return toProviderError(
      errorData as { errorType: string; message: string; provider?: string },
      fallbackProvider,
    );
  }

  return null;
}

function toProviderError(
  parsed: { errorType: string; message: string; provider?: string },
  fallbackProvider: string,
): AIProviderError {
  return {
    provider: parsed.provider || fallbackProvider,
    errorType: ERROR_TYPE_MAP[parsed.errorType] || 'unknown',
    message: parsed.message,
    canRetry: RETRYABLE_TYPES.has(parsed.errorType),
  };
}

/**
 * User-friendly error messages keyed by errorType.
 */
export const BYOK_ERROR_MESSAGES: Record<AIProviderError['errorType'], string> = {
  auth: 'Your API key appears invalid. Check it in Settings.',
  rate_limit: 'Rate limited — wait a moment and retry.',
  billing: 'Insufficient credits on your provider account.',
  provider_error: 'The AI provider is having issues. Not a Lernf problem.',
  network: 'Network error connecting to the AI provider.',
  invalid_request: 'Invalid request sent to the AI provider.',
  unknown: 'Something went wrong. If this persists, check your API key or try a different provider.',
};
