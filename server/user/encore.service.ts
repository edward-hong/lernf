import { middleware } from "encore.dev/api";
import { APIError } from "encore.dev/api";
import { Service } from "encore.dev/service";
import { getAuthData } from "~encore/auth";
import {
  generalAuthStore,
  isCurrentCallerAdmin,
} from "../auth/rateLimit";

// ---------------------------------------------------------------------------
// General rate-limiting middleware for authenticated user endpoints (60/min).
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
          `[rate-limit] General auth limit hit | user=${userId}`,
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
      console.error("[rate-limit] Unexpected error in user middleware:", err);
      return await next(req);
    }
  },
);

export default new Service("user", {
  middlewares: [rateLimiter],
});
