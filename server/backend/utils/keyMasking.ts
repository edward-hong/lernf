/**
 * Masks an API key for safe display or logging.
 * Shows only the last 4 characters preceded by bullet characters.
 */
export function maskApiKey(key: string): string {
  if (!key || key.length < 8) return '••••••••'
  return '••••••••' + key.slice(-4)
}

/**
 * Strips API keys from error messages/JSON to prevent leaking secrets.
 * Handles common key patterns for Claude, OpenAI, Gemini, and DeepSeek.
 */
export function stripApiKeys(text: string): string {
  return text
    .replace(/sk-ant-[a-zA-Z0-9_-]+/g, 'sk-ant-••••')
    .replace(/sk-(proj-)?[a-zA-Z0-9]{8,}/g, 'sk-••••')
    .replace(/AIza[a-zA-Z0-9_-]{35}/g, 'AIza••••')
}
