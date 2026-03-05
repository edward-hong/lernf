/**
 * CORS configuration for cross-origin requests from the Vercel frontend.
 *
 * NOTE: In Encore.ts, CORS is primarily handled via the `global_cors`
 * field in `encore.app` at the project root. This module exports the
 * allowed-origins list so it stays in sync and can be referenced by
 * other server-side code if needed.
 */

/**
 * Origins permitted to make cross-origin requests.
 * Update the Vercel URL after your first production deployment.
 */
export const allowedOrigins: string[] = [
  process.env.FRONTEND_URL || 'https://lernf.vercel.app',
  process.env.STAGING_FRONTEND_URL ||
    'https://lernf-git-staging-edwardhongs-projects.vercel.app',
  'http://localhost:5173', // Local Vite dev server
  'http://localhost:3000', // Alternative local port
]

/**
 * Standard CORS headers applied by Encore's built-in CORS layer.
 * Listed here for documentation; the actual headers are set by
 * `global_cors` in encore.app.
 */
export const corsHeaders = {
  'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS,PATCH',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization,X-Requested-With',
  'Access-Control-Max-Age': '86400', // 24 hours
} as const
