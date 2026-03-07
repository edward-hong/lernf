import { middleware } from "encore.dev/api";
import { APIError } from "encore.dev/api";
import { Service } from "encore.dev/service";
import { getAuthData } from "~encore/auth";
import {
  generalAuthStore,
  isCurrentCallerAdmin,
} from "../auth/rateLimit";

// ---------------------------------------------------------------------------
// Rate-limiting middleware for Stripe service auth endpoints (60/min).
//
// target: { auth: true } ensures the Stripe webhook endpoint (which has no
// auth) is NOT affected by this middleware.
// ---------------------------------------------------------------------------
const rateLimiter = middleware(
  { target: { auth: true } },
  async (req, next) => {
    try {
      if (isCurrentCallerAdmin()) {
        return await next(req);
      }

      const userId = getAuthData()!.userID;
      const result = generalAuthStore.consume(`gen:${userId}`);

      if (!result.allowed) {
        const retryAfter = Math.ceil(result.retryAfterMs / 1000);
        console.log(
          `[rate-limit] General auth limit hit (stripe) | user=${userId}`,
        );
        throw APIError.resourceExhausted(
          `Rate limit exceeded: max 60 requests per minute. Retry after ${retryAfter}s.`,
        );
      }

      const res = await next(req);
      res.header.set("X-RateLimit-Limit", "60");
      res.header.set("X-RateLimit-Remaining", result.remaining.toString());
      return res;
    } catch (err) {
      if (err instanceof APIError) throw err;
      console.error("[rate-limit] Unexpected error in stripe middleware:", err);
      return await next(req);
    }
  },
);

export default new Service("stripe", {
  middlewares: [rateLimiter],
});
