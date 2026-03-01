import type { ProviderConfig } from '../../types/aiProvider';
import type { AIRequest, AIResponse, AIProviderError } from '../../types/aiRequest';

/**
 * Calls OpenAI API with the given request.
 *
 * @param config - Provider configuration with API key and model
 * @param request - Unified AI request
 * @returns AI response
 * @throws AIProviderError if request fails
 */
export async function callOpenAI(
  config: ProviderConfig,
  request: AIRequest,
): Promise<AIResponse> {
  try {
    // OpenAI uses messages array directly, including system messages
    const messages = request.systemPrompt
      ? [
          { role: 'system' as const, content: request.systemPrompt },
          ...request.messages,
        ]
      : request.messages;

    // Route through backend proxy to avoid CORS restrictions
    const response = await fetch('/api/proxy/openai', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        apiKey: config.apiKey,
        model: config.model,
        messages: messages.map((msg) => ({
          role: msg.role,
          content: msg.content,
        })),
        max_tokens: request.maxTokens || 1024,
        temperature: request.temperature ?? 0.7,
        stream: request.stream || false,
      }),
    });

    if (!response.ok) {
      throw await handleOpenAIError(response);
    }

    const proxyResult = await response.json();
    const data = proxyResult.data;

    return {
      content: data.choices[0].message.content,
      provider: 'openai',
      model: config.model,
      tokensUsed: data.usage?.total_tokens,
      metadata: {
        finishReason: data.choices[0].finish_reason,
        promptTokens: data.usage?.prompt_tokens,
        completionTokens: data.usage?.completion_tokens,
      },
    };
  } catch (error) {
    if (isAIProviderError(error)) {
      throw error;
    }
    throw createProviderError('openai', error);
  }
}

/**
 * Handles OpenAI API errors and converts to AIProviderError
 */
async function handleOpenAIError(
  response: Response,
): Promise<AIProviderError> {
  let errorData: Record<string, unknown>;
  try {
    errorData = await response.json();
  } catch {
    errorData = { message: response.statusText };
  }

  const nested = errorData.error as
    | Record<string, unknown>
    | undefined;

  const error: AIProviderError = {
    provider: 'openai',
    errorType: 'unknown',
    message: (nested?.message as string) || 'Unknown error',
    canRetry: false,
    originalError: errorData,
  };

  if (response.status === 401) {
    error.errorType = 'auth';
    error.message = 'Invalid API key';
    error.canRetry = false;
  } else if (response.status === 429) {
    error.errorType = 'rate_limit';
    error.message =
      (nested?.message as string) || 'Rate limit exceeded';
    error.canRetry = true;
  } else if (response.status >= 500) {
    error.errorType = 'network';
    error.message = 'OpenAI server error';
    error.canRetry = true;
  } else if (response.status === 400) {
    error.errorType = 'invalid_request';
    error.message = (nested?.message as string) || 'Invalid request';
    error.canRetry = false;
  }

  return error;
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
