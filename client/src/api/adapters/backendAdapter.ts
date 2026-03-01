import type { AIRequest, AIResponse, AIProviderError } from '../../types/aiRequest';

/**
 * Calls the backend API (which uses DeepSeek).
 * This is the default fallback when no user providers are configured.
 *
 * @param request - Unified AI request
 * @returns AI response
 * @throws AIProviderError if request fails
 */
export async function callBackendAI(request: AIRequest): Promise<AIResponse> {
  try {
    // Call the existing backend endpoint that proxies to DeepSeek
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: request.messages,
        temperature: request.temperature,
        max_tokens: request.maxTokens,
      }),
    });

    if (!response.ok) {
      throw await handleBackendError(response);
    }

    const data = await response.json();

    // Backend returns { success: boolean, output: string }
    if (!data.success || !data.output) {
      throw createProviderError(
        'backend-deepseek',
        new Error('No response from backend'),
      );
    }

    return {
      content: data.output,
      provider: 'backend-deepseek',
      model: data.model || 'deepseek-chat',
      tokensUsed: data.usage?.total_tokens,
      metadata: {
        finishReason: data.choices?.[0]?.finish_reason,
        promptTokens: data.usage?.prompt_tokens,
        completionTokens: data.usage?.completion_tokens,
      },
    };
  } catch (error) {
    if (isAIProviderError(error)) {
      throw error;
    }
    throw createProviderError('backend-deepseek', error);
  }
}

/**
 * Handles backend API errors
 */
async function handleBackendError(
  response: Response,
): Promise<AIProviderError> {
  let errorData: Record<string, unknown>;
  try {
    errorData = await response.json();
  } catch {
    errorData = { message: response.statusText };
  }

  return {
    provider: 'backend-deepseek',
    errorType: response.status >= 500 ? 'network' : 'unknown',
    message:
      (errorData.error as string) ||
      (errorData.message as string) ||
      'Backend error',
    canRetry: response.status >= 500,
    originalError: errorData,
  };
}

function isAIProviderError(error: unknown): error is AIProviderError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'provider' in error &&
    'errorType' in error
  );
}

function createProviderError(
  provider: string,
  error: unknown,
): AIProviderError {
  return {
    provider,
    errorType: 'unknown',
    message: error instanceof Error ? error.message : 'Unknown error occurred',
    canRetry: true,
    originalError: error,
  };
}
