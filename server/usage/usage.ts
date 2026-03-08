import { api, APIError, ErrCode } from "encore.dev/api";
import { SQLDatabase } from "encore.dev/storage/sqldb";
import { getAuthData } from "~encore/auth";
import { isAdmin } from "../auth/admin";

// ---------------------------------------------------------------------------
// Database
// ---------------------------------------------------------------------------

const db = new SQLDatabase("usage", {
  migrations: "./migrations",
});

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Maximum tokens allowed during the 14-day free trial. */
export const TRIAL_TOKEN_CAP = 50_000;

/** Trial duration in days. */
const TRIAL_DURATION_DAYS = 14;

export type PlanType = "free" | "trial" | "individual" | "team" | "admin";

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

interface UsageRow {
  user_id: string;
  tokens_used: number;
  period_start: Date;
  plan_type: PlanType;
}

/**
 * Get or create a usage row for a user.
 * New users default to 'free' plan with period_start = now.
 */
async function getOrCreateUsage(userId: string): Promise<UsageRow> {
  const row = await db.queryRow<UsageRow>`
    INSERT INTO token_usage (user_id, tokens_used, period_start, plan_type)
    VALUES (${userId}, 0, NOW(), 'free')
    ON CONFLICT (user_id) DO NOTHING
    RETURNING user_id, tokens_used, period_start, plan_type
  `;

  if (row) return row;

  // Row already existed — fetch it
  const existing = await db.queryRow<UsageRow>`
    SELECT user_id, tokens_used, period_start, plan_type
    FROM token_usage
    WHERE user_id = ${userId}
  `;

  if (!existing) {
    throw new APIError(ErrCode.Internal, "Failed to get or create usage row");
  }
  return existing;
}

// ---------------------------------------------------------------------------
// Exported service functions (called by other services)
// ---------------------------------------------------------------------------

/**
 * Check whether the user is allowed to make an AI call.
 * Throws an APIError if the trial cap has been reached.
 * Returns the current plan type.
 */
export async function checkUsageCap(
  userId: string,
  email: string,
): Promise<PlanType> {
  // Admins are never capped
  if (isAdmin(email)) return "admin";

  const usage = await getOrCreateUsage(userId);

  // Free tier (BYOK) and paid plans are not capped
  if (usage.plan_type !== "trial") return usage.plan_type as PlanType;

  // Trial plan — check expiry first
  const periodEnd = new Date(usage.period_start);
  periodEnd.setDate(periodEnd.getDate() + TRIAL_DURATION_DAYS);

  if (new Date() > periodEnd) {
    throw new APIError(
      ErrCode.ResourceExhausted,
      JSON.stringify({
        code: "TRIAL_EXPIRED",
        message:
          "Your 14-day trial has expired. Upgrade to continue using Lernf.",
        tokens_used: usage.tokens_used,
        token_cap: TRIAL_TOKEN_CAP,
        period_end: periodEnd.toISOString(),
      }),
    );
  }

  // Trial plan — check token cap
  if (usage.tokens_used >= TRIAL_TOKEN_CAP) {
    throw new APIError(
      ErrCode.ResourceExhausted,
      JSON.stringify({
        code: "TRIAL_TOKEN_LIMIT",
        message:
          "Trial token limit reached. Upgrade to continue using Lernf.",
        tokens_used: usage.tokens_used,
        token_cap: TRIAL_TOKEN_CAP,
        period_end: periodEnd.toISOString(),
      }),
    );
  }

  return "trial";
}

/**
 * Record token usage for a user. Fire-and-forget — callers should not await
 * this in the critical path if they want async behavior.
 */
export async function recordTokenUsage(
  userId: string,
  email: string,
  promptTokens: number,
  completionTokens: number,
): Promise<void> {
  const totalTokens = promptTokens + completionTokens;
  if (totalTokens <= 0) return;

  // Determine effective plan type
  const planType: PlanType = isAdmin(email) ? "admin" : "free";

  // Upsert: create row if it doesn't exist, otherwise just increment
  await db.exec`
    INSERT INTO token_usage (user_id, tokens_used, period_start, plan_type)
    VALUES (${userId}, ${totalTokens}, NOW(), ${planType})
    ON CONFLICT (user_id)
    DO UPDATE SET
      tokens_used = token_usage.tokens_used + ${totalTokens},
      updated_at = NOW()
  `;
}

/**
 * Update a user's plan type. Called from the Stripe webhook service.
 */
export async function updatePlanType(
  userId: string,
  planType: PlanType,
  resetUsage: boolean = false,
): Promise<void> {
  if (resetUsage) {
    await db.exec`
      INSERT INTO token_usage (user_id, tokens_used, period_start, plan_type)
      VALUES (${userId}, 0, NOW(), ${planType})
      ON CONFLICT (user_id)
      DO UPDATE SET
        plan_type = ${planType},
        tokens_used = 0,
        period_start = NOW(),
        updated_at = NOW()
    `;
  } else {
    await db.exec`
      INSERT INTO token_usage (user_id, tokens_used, period_start, plan_type)
      VALUES (${userId}, 0, NOW(), ${planType})
      ON CONFLICT (user_id)
      DO UPDATE SET
        plan_type = ${planType},
        updated_at = NOW()
    `;
  }
}

// ---------------------------------------------------------------------------
// API Endpoints
// ---------------------------------------------------------------------------

interface CurrentUsageResponse {
  plan_type: PlanType;
  tokens_used: number;
  token_cap: number | null;
  period_start: string;
  period_end: string | null;
  usage_percentage: number | null;
}

/**
 * GET /usage/current — returns the current user's token usage and plan info.
 */
export const currentUsage = api(
  { method: "GET", path: "/usage/current", auth: true, expose: true },
  async (): Promise<CurrentUsageResponse> => {
    const authData = getAuthData()!;

    const usage = await getOrCreateUsage(authData.userID);

    const planType: PlanType = isAdmin(authData.email)
      ? "admin"
      : (usage.plan_type as PlanType);

    const isTrial = planType === "trial";
    const tokenCap = isTrial ? TRIAL_TOKEN_CAP : null;

    let periodEnd: string | null = null;
    if (isTrial) {
      const end = new Date(usage.period_start);
      end.setDate(end.getDate() + TRIAL_DURATION_DAYS);
      periodEnd = end.toISOString();
    }

    const usagePercentage =
      isTrial && tokenCap
        ? Math.round((usage.tokens_used / tokenCap) * 100)
        : null;

    return {
      plan_type: planType,
      tokens_used: usage.tokens_used,
      token_cap: tokenCap,
      period_start: usage.period_start.toISOString(),
      period_end: periodEnd,
      usage_percentage: usagePercentage,
    };
  },
);
