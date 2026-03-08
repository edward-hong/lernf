/**
 * API configuration for different environments.
 * Uses VITE_API_URL from environment variables.
 */

import { getTokenGetter } from '../utils/authTokenStore';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

export const apiConfig = {
  baseURL: API_URL,
  timeout: 30000, // 30 seconds
};

/**
 * Helper to build full API URLs.
 * In development, Vite's proxy handles /api routes so relative paths work.
 * In production, we need the full Encore Cloud URL.
 */
export function getApiUrl(path: string): string {
  // In development, use relative paths (Vite proxy handles them)
  if (import.meta.env.DEV) {
    return path.startsWith("/") ? path : `/${path}`;
  }

  // In production, build the full URL
  const cleanPath = path.startsWith("/") ? path.slice(1) : path;
  return `${apiConfig.baseURL}/${cleanPath}`;
}

/**
 * Authenticated fetch helper. Automatically attaches a Clerk Bearer token
 * (when available) and resolves the API URL via getApiUrl().
 *
 * Use this for all calls to protected backend endpoints.
 * Health-check and BYOK proxy endpoints do NOT need this.
 */
export async function authFetch(
  path: string,
  options: RequestInit = {},
): Promise<Response> {
  const tokenGetter = getTokenGetter();
  const token = tokenGetter ? await tokenGetter() : null;

  return fetch(getApiUrl(path), {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
}

/**
 * Check if backend is healthy (used on app startup)
 */
export async function checkBackendHealth(): Promise<boolean> {
  try {
    const response = await fetch(getApiUrl("/api/health"), {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) return false;

    const data = await response.json();
    return data.status === "ok";
  } catch (error) {
    console.error("Backend health check failed:", error);
    return false;
  }
}
