import type { AIProviderError } from '../types/aiRequest';

export function getErrorMessage(error: AIProviderError): {
  title: string;
  message: string;
  action: string;
  canRetry: boolean;
} {
  switch (error.errorType) {
    case 'auth':
      return {
        title: 'Authentication Failed',
        message: `Your ${error.provider} API key appears to be invalid or expired.`,
        action:
          "Please check your API key in Settings and make sure it's copied correctly.",
        canRetry: false,
      };

    case 'rate_limit':
      return {
        title: 'Rate Limit Exceeded',
        message: `You've hit the rate limit for ${error.provider}.`,
        action:
          'Wait a few minutes and try again, or configure backup providers in Settings.',
        canRetry: true,
      };

    case 'billing':
      return {
        title: 'Insufficient Credits',
        message: `Your ${error.provider} account has insufficient credits.`,
        action:
          'Top up your account balance with the provider and try again.',
        canRetry: false,
      };

    case 'provider_error':
      return {
        title: 'Provider Issue',
        message: `${error.provider} is experiencing issues. This is not a Lernf problem.`,
        action:
          'Try again shortly, or switch to a different provider in Settings.',
        canRetry: true,
      };

    case 'network':
      return {
        title: 'Network Error',
        message: `Unable to reach ${error.provider}'s servers.`,
        action: 'Check your internet connection and try again.',
        canRetry: true,
      };

    case 'invalid_request':
      return {
        title: 'Invalid Request',
        message:
          error.message || `The request to ${error.provider} was invalid.`,
        action:
          'This is likely a configuration issue. Please check your settings.',
        canRetry: false,
      };

    default:
      return {
        title: 'Unknown Error',
        message: error.message || 'An unexpected error occurred.',
        action: 'Try again or contact support if the problem persists.',
        canRetry: true,
      };
  }
}

export function getAllProvidersFailedMessage(
  attempts: Array<{ providerId: string; error?: AIProviderError }>,
): string {
  const nonRetryable = attempts.filter((a) => a.error && !a.error.canRetry);
  const retryable = attempts.filter((a) => a.error?.canRetry);

  let message = 'All AI providers failed:\n\n';

  if (nonRetryable.length > 0) {
    message += 'Configuration Issues:\n';
    nonRetryable.forEach(({ providerId, error }) => {
      const errorInfo = error
        ? getErrorMessage(error)
        : { message: 'Unknown error' };
      message += `  - ${providerId}: ${errorInfo.message}\n`;
    });
    message += '\n';
  }

  if (retryable.length > 0) {
    message += 'Temporary Issues:\n';
    retryable.forEach(({ providerId, error }) => {
      const errorInfo = error
        ? getErrorMessage(error)
        : { message: 'Unknown error' };
      message += `  - ${providerId}: ${errorInfo.message}\n`;
    });
    message += '\n';
  }

  message += 'Suggestions:\n';
  message += '  1. Check your API keys in Settings\n';
  message += '  2. Configure backup providers\n';
  message += '  3. Try again in a few minutes\n';
  message += '  4. Use Backend Default if available';

  return message;
}
