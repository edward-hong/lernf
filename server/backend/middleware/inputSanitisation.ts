import { APIError, ErrCode } from 'encore.dev/api'

// ---- Hard-block patterns (case-insensitive) ---------------------------------

const HARD_BLOCK_PATTERNS: RegExp[] = [
  /ignore\s+previous\s+instructions/i,
  /ignore\s+above\s+instructions/i,
  /disregard\s+your\s+instructions/i,
  /forget\s+your\s+instructions/i,
  /you\s+are\s+now\b/i,
  /new\s+instructions\s*:/i,
  /system\s+prompt\s*:/i,
  /<\/?system>/i,
  /\[\/?\s*INST\s*\]/i,
  /<<\/?SYS>>/i,
]

// ---- Suspicious-context patterns (log only) ---------------------------------

const SUSPICIOUS_CONTEXT_PATTERNS: RegExp[] = [
  /reveal\s+(your|the)\s+(system\s+)?prompt/i,
  /what\s+are\s+your\s+instructions/i,
  /repeat\s+(your|the)\s+(system\s+)?(prompt|instructions)/i,
  /output\s+(your|the)\s+(system\s+)?(prompt|instructions)/i,
]

// ---- Length thresholds per context -------------------------------------------

const LENGTH_THRESHOLDS: Record<string, number> = {
  chat: 10_000,
  npcDialogue: 10_000,
  analyzeIntent: 10_000,
  continueDeliberation: 10_000,
  deepseek: 10_000,
  evaluateComparison: 10_000,
  evaluateCompletion: 50_000,
  evaluateGrip: 50_000,
  generateConsequence: 50_000,
  startAdvocateSession: 50_000,
}

const DEFAULT_LENGTH_THRESHOLD = 10_000

// ---- Core sanitisation functions --------------------------------------------

/**
 * Check a string against hard-block patterns.
 * Throws an APIError if a match is found.
 */
function checkHardBlock(input: string, context: string): void {
  for (const pattern of HARD_BLOCK_PATTERNS) {
    if (pattern.test(input)) {
      console.warn(
        `[security] Hard-blocked input in ${context}: matched pattern ${pattern}`
      )
      throw new APIError(
        ErrCode.InvalidArgument,
        'Your message contains content that is not allowed. Please rephrase and try again.'
      )
    }
  }
}

/**
 * Soft-sanitise a string:
 * - Strip null bytes and non-printable characters (keep newlines, tabs)
 * - Strip XML/HTML-like tags that could interfere with prompt structure
 *   (but preserve markdown code blocks and standard HTML used in content)
 * - Normalise excessive whitespace
 */
function softSanitise(input: string): string {
  let result = input

  // Strip null bytes and non-printable control characters (keep \n \r \t)
  // eslint-disable-next-line no-control-regex
  result = result.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')

  // Strip prompt-injection-related XML-like tags that mimic LLM control tokens
  // These are specific tags used to manipulate LLM behaviour, not general HTML
  result = result.replace(/<\/?(?:system|instruction|prompt|context|admin|root|override|jailbreak|ignore)(?:\s[^>]*)?>/gi, '')

  // Normalise runs of 3+ newlines down to 2
  result = result.replace(/\n{3,}/g, '\n\n')

  // Normalise runs of excessive spaces (10+) within lines
  result = result.replace(/ {10,}/g, '  ')

  return result
}

/**
 * Log suspicious inputs that don't warrant blocking.
 */
function logSuspicious(input: string, context: string): void {
  // Check suspicious context patterns
  for (const pattern of SUSPICIOUS_CONTEXT_PATTERNS) {
    if (pattern.test(input)) {
      console.warn(
        `[security] Suspicious input in ${context}: matched pattern ${pattern} — input length: ${input.length}`
      )
      return // Only log once per input
    }
  }

  // Check length threshold
  const threshold = LENGTH_THRESHOLDS[context] ?? DEFAULT_LENGTH_THRESHOLD
  if (input.length > threshold) {
    console.warn(
      `[security] Unusually long input in ${context}: ${input.length} chars (threshold: ${threshold})`
    )
  }
}

// ---- Public API -------------------------------------------------------------

/**
 * Sanitise a single user-provided string before it reaches prompt construction.
 *
 * 1. Hard-blocks obvious injection attempts (throws APIError).
 * 2. Soft-sanitises the text (strips dangerous characters/tags).
 * 3. Logs suspicious-but-allowed inputs.
 *
 * @param input   The raw user input string
 * @param context Identifier for logging (e.g. "chat", "analyzeIntent")
 * @returns The sanitised string
 */
export function sanitiseUserInput(input: string, context: string): string {
  if (!input) return input

  // 1. Hard block
  checkHardBlock(input, context)

  // 2. Soft sanitise
  const cleaned = softSanitise(input)

  // 3. Log suspicious
  logSuspicious(cleaned, context)

  return cleaned
}

/**
 * Sanitise an array of chat messages. Only user-role messages are sanitised;
 * system/assistant messages are passed through unchanged.
 *
 * @param messages Array of { role, content } chat messages
 * @param context  Identifier for logging
 * @returns New array with sanitised user messages
 */
export function sanitiseMessages(
  messages: { role: string; content: string }[],
  context: string
): { role: string; content: string }[] {
  return messages.map((m) => {
    if (m.role === 'user') {
      return { ...m, content: sanitiseUserInput(m.content, context) }
    }
    return m
  })
}
