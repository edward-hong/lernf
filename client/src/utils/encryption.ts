/**
 * Simple XOR-based obfuscation for API keys stored in localStorage.
 *
 * WARNING: This is NOT cryptographically secure encryption.
 * It only prevents casual viewing of keys in localStorage.
 *
 * For production, consider:
 * - Using the Web Crypto API for stronger encryption
 * - Warning users about browser storage risks
 * - Offering session-only storage (no persistence)
 */

const ENCRYPTION_KEY = 'lernf-secure-key-2025-ai-provider';

/**
 * Obfuscates a string using XOR cipher.
 *
 * @param text - Plain text to obfuscate
 * @returns Base64-encoded obfuscated text
 */
export function obfuscate(text: string): string {
  if (!text) return '';

  try {
    const obfuscated = text
      .split('')
      .map((char, i) =>
        String.fromCharCode(
          char.charCodeAt(0) ^
            ENCRYPTION_KEY.charCodeAt(i % ENCRYPTION_KEY.length),
        ),
      )
      .join('');

    return btoa(obfuscated);
  } catch (error) {
    console.error('Obfuscation failed:', error);
    return '';
  }
}

/**
 * Deobfuscates a string using XOR cipher.
 *
 * @param encoded - Base64-encoded obfuscated text
 * @returns Plain text
 */
export function deobfuscate(encoded: string): string {
  if (!encoded) return '';

  try {
    const decoded = atob(encoded);

    return decoded
      .split('')
      .map((char, i) =>
        String.fromCharCode(
          char.charCodeAt(0) ^
            ENCRYPTION_KEY.charCodeAt(i % ENCRYPTION_KEY.length),
        ),
      )
      .join('');
  } catch (error) {
    console.error('Deobfuscation failed:', error);
    return '';
  }
}

/**
 * Tests if a string is properly obfuscated.
 *
 * @param encoded - String to test
 * @returns Whether the string appears to be obfuscated
 */
export function isObfuscated(encoded: string): boolean {
  if (!encoded) return false;

  try {
    // Try to decode - if it fails, it's not base64
    atob(encoded);
    return true;
  } catch {
    return false;
  }
}
