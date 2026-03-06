import { getAuthData } from "~encore/auth";

const ADMIN_EMAILS: string[] = [
  "edward.hong527@gmail.com",
];

export function isAdmin(email: string): boolean {
  return ADMIN_EMAILS.includes(email.toLowerCase());
}

/**
 * Check if the current authenticated user is an admin.
 * Use this in any endpoint to bypass subscription/payment checks.
 */
export function isCurrentUserAdmin(): boolean {
  const authData = getAuthData();
  if (!authData) return false;
  return isAdmin(authData.email);
}
