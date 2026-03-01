/**
 * Unified AI request format (provider-agnostic)
 */
export interface AIRequest {
  /** Conversation messages */
  messages: Array<{
    role: 'user' | 'assistant' | 'system';
    content: string;
  }>;

  /** Temperature (0-1, controls randomness) */
  temperature?: number;

  /** Maximum tokens to generate */
  maxTokens?: number;

  /** Whether to stream the response */
  stream?: boolean;

  /** System prompt (optional, provider-specific handling) */
  systemPrompt?: string;
}

/**
 * Unified AI response format (provider-agnostic)
 */
export interface AIResponse {
  /** Generated content */
  content: string;

  /** Which provider was used */
  provider: string;

  /** Which model was used */
  model: string;

  /** Total tokens used (if available) */
  tokensUsed?: number;

  /** Whether response came from cache */
  cached?: boolean;

  /** Response metadata */
  metadata?: {
    finishReason?: string;
    promptTokens?: number;
    completionTokens?: number;
  };
}

/**
 * Error from AI provider
 */
export interface AIProviderError {
  provider: string;
  errorType: 'auth' | 'rate_limit' | 'network' | 'invalid_request' | 'unknown';
  message: string;
  canRetry: boolean;
  originalError?: unknown;
}
