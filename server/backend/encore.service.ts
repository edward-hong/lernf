import { APICallMeta } from "encore.dev";
import { APIError, middleware } from "encore.dev/api";
import { Service } from "encore.dev/service";
import {
  aiPerMinuteStore,
  aiPerHourStore,
  publicStore,
  currentUserId,
  isCurrentCallerAdmin,
} from "../auth/rateLimit";

// ---------------------------------------------------------------------------
// Rate-limiting middleware for the backend service.
//
// POST endpoints → AI rate limits  (20/min + 200/hr per user)
// GET  endpoints → Public rate limits (30/min per key)
// ---------------------------------------------------------------------------
const rateLimiter = middleware(async (req, next) => {
  try {
    const meta = req.requestMeta as APICallMeta;

    // Admin bypass
    if (isCurrentCallerAdmin()) {
      return await next(req);
    }

    const userId = currentUserId();

    // --- POST endpoints are AI-calling endpoints ---
    if (meta.method !== "GET") {
      if (userId) {
        // Per-minute check
        const minuteResult = aiPerMinuteStore.consume(`ai:min:${userId}`);
        if (!minuteResult.allowed) {
          const retryAfter = Math.ceil(minuteResult.retryAfterMs / 1000);
          console.log(
            `[rate-limit] AI per-minute limit hit | user=${userId} path=${meta.path}`,
          );
          const res = APIError.resourceExhausted(
            `Rate limit exceeded: max 20 AI requests per minute. Retry after ${retryAfter}s.`,
          );
          throw res;
        }

        // Per-hour check
        const hourResult = aiPerHourStore.consume(`ai:hr:${userId}`);
        if (!hourResult.allowed) {
          const retryAfter = Math.ceil(hourResult.retryAfterMs / 1000);
          console.log(
            `[rate-limit] AI per-hour limit hit | user=${userId} path=${meta.path}`,
          );
          throw APIError.resourceExhausted(
            `Rate limit exceeded: max 200 AI requests per hour. Retry after ${retryAfter}s.`,
          );
        }

        const res = await next(req);
        res.header.set("X-RateLimit-Limit-Minute", "20");
        res.header.set("X-RateLimit-Remaining-Minute", minuteResult.remaining.toString());
        res.header.set("X-RateLimit-Limit-Hour", "200");
        res.header.set("X-RateLimit-Remaining-Hour", hourResult.remaining.toString());
        return res;
      }

      // Unauthenticated POST — fall through to public limit
    }

    // --- GET or unauthenticated → public rate limit ---
    const key = userId ? `pub:user:${userId}` : `pub:path:${meta.path}`;
    const publicResult = publicStore.consume(key);
    if (!publicResult.allowed) {
      const retryAfter = Math.ceil(publicResult.retryAfterMs / 1000);
      console.log(`[rate-limit] Public limit hit | key=${key} path=${meta.path}`);
      throw APIError.resourceExhausted(
        `Rate limit exceeded: max 30 requests per minute. Retry after ${retryAfter}s.`,
      );
    }

    return await next(req);
  } catch (err) {
    // Fail open: rethrow our own rate-limit errors, swallow unexpected ones.
    if (err instanceof APIError) throw err;
    console.error("[rate-limit] Unexpected error in backend middleware:", err);
    return await next(req);
  }
});

export default new Service("backend", {
  middlewares: [rateLimiter],
});
