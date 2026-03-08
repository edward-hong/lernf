/**
 * AES-GCM encryption for API keys stored in localStorage.
 *
 * Uses the Web Crypto API for proper cryptographic encryption.
 * A device-specific key is derived and cached in memory — it is never
 * persisted, so stored data cannot be decrypted after the page is closed
 * unless the same derivation inputs are available (which they are, since
 * they are deterministic per browser profile).
 *
 * NOTE: localStorage is still vulnerable to XSS. This encryption prevents
 * casual inspection but is not a substitute for CSP / input sanitisation.
 */

const SALT = 'lernf-api-key-encryption-salt-v2';
const ITERATIONS = 100_000;

let cachedKey: CryptoKey | null = null;

/**
 * Derives a stable AES-GCM key from a deterministic browser fingerprint.
 * The key is cached in memory for the lifetime of the page.
 */
async function getEncryptionKey(): Promise<CryptoKey> {
  if (cachedKey) return cachedKey;

  // Use a deterministic value so the same browser can always decrypt.
  // This is NOT a secret — it just makes the ciphertext opaque.
  const rawKey = `lernf-${navigator.userAgent.length}-${screen.width}x${screen.height}`;

  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(rawKey),
    'PBKDF2',
    false,
    ['deriveKey'],
  );

  cachedKey = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: new TextEncoder().encode(SALT),
      iterations: ITERATIONS,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  );

  return cachedKey;
}

/**
 * Encrypts a plaintext string with AES-256-GCM.
 *
 * @returns A base64-encoded string containing `iv:ciphertext`.
 */
export async function encrypt(text: string): Promise<string> {
  if (!text) return '';

  try {
    const key = await getEncryptionKey();
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encoded = new TextEncoder().encode(text);

    const ciphertext = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      encoded,
    );

    // Combine iv + ciphertext and base64-encode
    const combined = new Uint8Array(iv.length + new Uint8Array(ciphertext).length);
    combined.set(iv);
    combined.set(new Uint8Array(ciphertext), iv.length);

    return 'v2:' + btoa(String.fromCharCode(...combined));
  } catch (error) {
    console.error('Encryption failed:', error);
    return '';
  }
}

/**
 * Decrypts a string produced by {@link encrypt}.
 */
export async function decrypt(encoded: string): Promise<string> {
  if (!encoded) return '';

  // Handle legacy XOR-obfuscated values (v1)
  if (!encoded.startsWith('v2:')) {
    return deobfuscateLegacy(encoded);
  }

  try {
    const key = await getEncryptionKey();
    const raw = atob(encoded.slice(3));
    const bytes = Uint8Array.from(raw, (c) => c.charCodeAt(0));

    const iv = bytes.slice(0, 12);
    const ciphertext = bytes.slice(12);

    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      ciphertext,
    );

    return new TextDecoder().decode(decrypted);
  } catch (error) {
    console.error('Decryption failed:', error);
    return '';
  }
}

/**
 * Decrypts legacy XOR-obfuscated values so existing stored keys
 * can be migrated transparently.
 */
const LEGACY_KEY = 'lernf-secure-key-2025-ai-provider';

function deobfuscateLegacy(encoded: string): string {
  if (!encoded) return '';
  try {
    const decoded = atob(encoded);
    return decoded
      .split('')
      .map((char, i) =>
        String.fromCharCode(
          char.charCodeAt(0) ^
            LEGACY_KEY.charCodeAt(i % LEGACY_KEY.length),
        ),
      )
      .join('');
  } catch {
    // Not base64 — return as-is (might be plaintext from a very old version)
    return encoded;
  }
}

// ---- Synchronous wrappers (kept for call-site compatibility) ----

/**
 * @deprecated Use {@link encrypt} instead. Kept for backward compatibility
 * during migration — falls back to XOR obfuscation synchronously.
 */
export function obfuscate(text: string): string {
  if (!text) return '';
  try {
    const obfuscated = text
      .split('')
      .map((char, i) =>
        String.fromCharCode(
          char.charCodeAt(0) ^
            LEGACY_KEY.charCodeAt(i % LEGACY_KEY.length),
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
 * @deprecated Use {@link decrypt} instead.
 */
export function deobfuscate(encoded: string): string {
  return deobfuscateLegacy(encoded);
}

/**
 * Tests if a string is encrypted (v2) or obfuscated (v1).
 */
export function isObfuscated(encoded: string): boolean {
  if (!encoded) return false;
  if (encoded.startsWith('v2:')) return true;
  try {
    atob(encoded);
    return true;
  } catch {
    return false;
  }
}
