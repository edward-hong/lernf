import { getAuthData } from "~encore/auth";
import { isAdmin } from "./admin";

// ---------------------------------------------------------------------------
// In-memory sliding-window rate limiter
// ---------------------------------------------------------------------------

interface WindowEntry {
  count: number;
  windowStart: number;
}

export interface ConsumeResult {
  allowed: boolean;
  remaining: number;
  retryAfterMs: number;
}

export class RateLimitStore {
  private store = new Map<string, WindowEntry>();
  private windowMs: number;
  private maxRequests: number;
  private cleanupTimer: ReturnType<typeof setInterval>;

  constructor(windowMs: number, maxRequests: number) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
    // Periodic cleanup every window duration (min 30 s, max 5 min)
    const cleanupInterval = Math.min(
      Math.max(windowMs, 30_000),
      5 * 60_000,
    );
    this.cleanupTimer = setInterval(() => this.cleanup(), cleanupInterval);
  }

  consume(key: string): ConsumeResult {
    const now = Date.now();
    const entry = this.store.get(key);

    // First request or window expired → start a new window
    if (!entry || now - entry.windowStart >= this.windowMs) {
      this.store.set(key, { count: 1, windowStart: now });
      return { allowed: true, remaining: this.maxRequests - 1, retryAfterMs: 0 };
    }

    // Window still active but limit reached
    if (entry.count >= this.maxRequests) {
      const retryAfterMs = this.windowMs - (now - entry.windowStart);
      return { allowed: false, remaining: 0, retryAfterMs };
    }

    // Window still active, increment
    entry.count++;
    return {
      allowed: true,
      remaining: this.maxRequests - entry.count,
      retryAfterMs: 0,
    };
  }

  private cleanup() {
    const now = Date.now();
    for (const [key, entry] of this.store) {
      if (now - entry.windowStart >= this.windowMs) {
        this.store.delete(key);
      }
    }
  }
}

// ---------------------------------------------------------------------------
// Pre-configured stores (shared across services via import)
// ---------------------------------------------------------------------------

/** AI endpoints – 20 req / 60 s per user */
export const aiPerMinuteStore = new RateLimitStore(60_000, 20);

/** AI endpoints – 200 req / 3600 s per user */
export const aiPerHourStore = new RateLimitStore(3_600_000, 200);

/** General authenticated endpoints – 60 req / 60 s per user */
export const generalAuthStore = new RateLimitStore(60_000, 60);

/** Public / unauthenticated endpoints – 30 req / 60 s per key */
export const publicStore = new RateLimitStore(60_000, 30);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Returns the user ID if the caller is authenticated, otherwise undefined.
 */
export function currentUserId(): string | undefined {
  try {
    return getAuthData()?.userID;
  } catch {
    return undefined;
  }
}

/**
 * Returns true when the current caller is an admin (admins bypass limits).
 */
export function isCurrentCallerAdmin(): boolean {
  try {
    const auth = getAuthData();
    return auth ? isAdmin(auth.email) : false;
  } catch {
    return false;
  }
}
