/**
 * Middleware to detect if frontend is still sending pre-built prompts
 * (which we want to prevent — prompts should be built in backend)
 */

export function detectFrontendPrompts(endpoint: string, requestBody: Record<string, unknown>): void {
  const suspiciousFields = ['systemPrompt', 'fullPrompt']

  for (const field of suspiciousFields) {
    if (requestBody[field] && typeof requestBody[field] === 'string') {
      const value = requestBody[field] as string

      // If it looks like a full system prompt (long and contains instructions)
      if (value.length > 200 && /you are|your (role|job)/i.test(value)) {
        console.warn(`[Prompt Validation] Endpoint ${endpoint} received a pre-built prompt!`)
        console.warn(`[Prompt Validation] Field: ${field}`)
        console.warn(`[Prompt Validation] Length: ${value.length}`)
        console.warn(`[Prompt Validation] This should be built in the backend instead.`)
      }
    }
  }
}
