/**
 * Masks an API key for safe display.
 * Shows only the last 4 characters preceded by bullet characters.
 */
export function maskApiKey(key: string): string {
  if (!key || key.length < 8) return '\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022';
  return '\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022' + key.slice(-4);
}
