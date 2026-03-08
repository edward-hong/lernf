/**
 * Module-level store for the Clerk auth token getter.
 *
 * This allows non-React code (plain utility functions, Zustand stores)
 * to obtain a fresh Clerk JWT without needing React hooks.
 *
 * Initialised once at app startup via `setTokenGetter()` from a
 * component that has access to Clerk's `useAuth().getToken`.
 */

type TokenGetter = () => Promise<string | null>

let tokenGetter: TokenGetter | null = null

export function setTokenGetter(getter: TokenGetter): void {
  tokenGetter = getter
}

export function getTokenGetter(): TokenGetter | null {
  return tokenGetter
}
