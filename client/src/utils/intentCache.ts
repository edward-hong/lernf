// ---------------------------------------------------------------------------
// Intent Cache
// ---------------------------------------------------------------------------
// Provides a localStorage-backed cache for intent analysis results so the
// same AI message is never re-analysed unnecessarily. Entries expire after
// 24 hours and the cache is capped at 100 entries (LRU eviction by timestamp).
// ---------------------------------------------------------------------------

import type { IntentVector, CachedIntent } from '../types/intent'

const STORAGE_KEY = 'lernf-intent-cache'
const MAX_ENTRIES = 100
const EXPIRY_MS = 24 * 60 * 60 * 1000 // 24 hours

// ---- Hash -----------------------------------------------------------------

/**
 * Produces a simple numeric hash of a message string.
 * Uses the djb2 algorithm — fast and sufficiently unique for cache keys.
 */
export function hashMessage(message: string): string {
  let hash = 5381
  for (let i = 0; i < message.length; i++) {
    hash = ((hash << 5) + hash + message.charCodeAt(i)) | 0
  }
  // Convert to unsigned 32-bit hex
  return (hash >>> 0).toString(16)
}

// ---- Internal helpers -----------------------------------------------------

function loadCache(): CachedIntent[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    return JSON.parse(raw) as CachedIntent[]
  } catch {
    return []
  }
}

function saveCache(entries: CachedIntent[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
  } catch {
    // Storage full or unavailable — silently drop
  }
}

// ---- Public API -----------------------------------------------------------

/**
 * Returns a cached IntentVector for the given message hash, or null if not
 * found or expired.
 */
export function getCachedIntent(messageHash: string): IntentVector | null {
  const entries = loadCache()
  const entry = entries.find((e) => e.messageHash === messageHash)
  if (!entry) return null

  if (Date.now() - entry.timestamp > EXPIRY_MS) {
    return null
  }

  return entry.intent
}

/**
 * Stores an IntentVector in the cache keyed by message hash.
 * Evicts the oldest entries if the cache exceeds MAX_ENTRIES.
 */
export function setCachedIntent(
  messageHash: string,
  intent: IntentVector,
): void {
  let entries = loadCache()

  // Remove existing entry for this hash (will be replaced)
  entries = entries.filter((e) => e.messageHash !== messageHash)

  entries.push({
    messageHash,
    intent,
    timestamp: Date.now(),
  })

  // Evict oldest entries if over capacity
  if (entries.length > MAX_ENTRIES) {
    entries.sort((a, b) => a.timestamp - b.timestamp)
    entries = entries.slice(entries.length - MAX_ENTRIES)
  }

  saveCache(entries)
}

/**
 * Removes all cache entries older than 24 hours.
 */
export function clearExpiredCache(): void {
  const entries = loadCache()
  const now = Date.now()
  const valid = entries.filter((e) => now - e.timestamp <= EXPIRY_MS)

  if (valid.length !== entries.length) {
    saveCache(valid)
  }
}
