import type { ProviderConfig } from '../../types/aiProvider';
import type { AIRequest, AIResponse, AIProviderError } from '../../types/aiRequest';

/**
 * Calls Claude (Anthropic) API with the given request.
 *
 * @param config - Provider configuration with API key and model
 * @param request - Unified AI request
 * @returns AI response
 * @throws AIProviderError if request fails
 */
export async function callClaude(
  config: ProviderConfig,
  request: AIRequest,
): Promise<AIResponse> {
  try {
    // Claude requires system messages to be separate from conversation
    const systemMessage =
      request.systemPrompt ||
      request.messages.find((m) => m.role === 'system')?.content;

    const conversationMessages = request.messages.filter(
      (m) => m.role !== 'system',
    );

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': config.apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: config.model,
        messages: conversationMessages.map((msg) => ({
          role: msg.role,
          content: msg.content,
        })),
        ...(systemMessage && { system: systemMessage }),
        max_tokens: request.maxTokens || 1024,
        temperature: request.temperature ?? 0.7,
        stream: request.stream || false,
      }),
    });

    if (!response.ok) {
      throw await handleClaudeError(response);
    }

    const data = await response.json();

    return {
      content: data.content[0].text,
      provider: 'claude',
      model: config.model,
      tokensUsed: data.usage?.input_tokens + data.usage?.output_tokens,
      metadata: {
        finishReason: data.stop_reason,
        promptTokens: data.usage?.input_tokens,
        completionTokens: data.usage?.output_tokens,
      },
    };
  } catch (error) {
    if (isAIProviderError(error)) {
      throw error;
    }
    throw createProviderError('claude', error);
  }
}

/**
 * Handles Claude API errors and converts to AIProviderError
 */
async function handleClaudeError(response: Response): Promise<AIProviderError> {
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
    provider: 'claude',
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
    error.message = 'Rate limit exceeded';
    error.canRetry = true;
  } else if (response.status >= 500) {
    error.errorType = 'network';
    error.message = 'Server error';
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
