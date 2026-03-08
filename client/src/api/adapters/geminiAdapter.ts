import type { ProviderConfig } from '../../types/aiProvider';
import type { AIRequest, AIResponse, AIProviderError } from '../../types/aiRequest';
import { parseProxyError } from './proxyErrorParser';

/**
 * Calls Google Gemini API with the given request.
 *
 * @param config - Provider configuration with API key and model
 * @param request - Unified AI request
 * @returns AI response
 * @throws AIProviderError if request fails
 */
export async function callGemini(
  config: ProviderConfig,
  request: AIRequest,
): Promise<AIResponse> {
  try {
    // Extract system instruction before building contents
    const systemInstruction =
      request.systemPrompt ||
      request.messages.find((m) => m.role === 'system')?.content;

    // Gemini uses a different message format; filter out system messages first
    const conversationMessages = request.messages.filter(
      (m) => m.role !== 'system',
    );

    const contents = conversationMessages.map((msg) => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }],
    }));

    // Route through backend proxy to avoid CORS restrictions
    const response = await fetch('/api/proxy/gemini', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        apiKey: config.apiKey,
        model: config.model,
        contents,
        ...(systemInstruction && {
          systemInstruction: { parts: [{ text: systemInstruction }] },
        }),
        generationConfig: {
          temperature: request.temperature ?? 0.7,
          maxOutputTokens: request.maxTokens || 1024,
        },
      }),
    });

    if (!response.ok) {
      throw await handleGeminiError(response);
    }

    const proxyResult = await response.json();
    const data = proxyResult.data;

    const candidate = data.candidates?.[0];
    if (!candidate) {
      throw createProviderError('gemini', new Error('No response candidates'));
    }

    return {
      content: candidate.content.parts[0].text,
      provider: 'gemini',
      model: config.model,
      metadata: {
        finishReason: candidate.finishReason,
      },
    };
  } catch (error) {
    if (isAIProviderError(error)) {
      throw error;
    }
    throw createProviderError('gemini', error);
  }
}

/**
 * Handles Gemini API errors and converts to AIProviderError
 */
async function handleGeminiError(
  response: Response,
): Promise<AIProviderError> {
  let errorData: Record<string, unknown>;
  try {
    errorData = await response.json();
  } catch {
    errorData = { message: response.statusText };
  }

  // Try to parse structured error from backend proxy
  const structured = parseProxyError(errorData, 'gemini');
  if (structured) return structured;

  const nested = errorData.error as
    | Record<string, unknown>
    | undefined;

  const error: AIProviderError = {
    provider: 'gemini',
    errorType: 'unknown',
    message: (nested?.message as string) || 'Unknown error',
    canRetry: false,
    originalError: errorData,
  };

  if (response.status === 401 || response.status === 403) {
    error.errorType = 'auth';
    error.message = 'Your Gemini API key appears invalid. Check it in Settings.';
    error.canRetry = false;
  } else if (response.status === 429) {
    error.errorType = 'rate_limit';
    error.message = 'Rate limit exceeded (Free tier: 15 requests/minute)';
    error.canRetry = true;
  } else if (response.status >= 500) {
    error.errorType = 'provider_error';
    error.message = 'Gemini is having issues. Not a Lernf problem.';
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
