/**
 * Validates deployment configuration.
 * Run this after deployment to ensure everything is connected properly.
 */

import { checkBackendHealth, getApiUrl, authFetch } from '../api/config';

export async function validateDeployment(): Promise<{
  success: boolean;
  checks: Record<string, boolean>;
  errors: string[];
}> {
  const checks: Record<string, boolean> = {};
  const errors: string[] = [];

  // Check 1: Environment variables
  const hasApiUrl = !!import.meta.env.VITE_API_URL;
  checks.envVars = hasApiUrl;
  if (!hasApiUrl) {
    errors.push('VITE_API_URL not set');
  }

  // Check 2: Backend health
  const backendHealthy = await checkBackendHealth();
  checks.backendHealth = backendHealthy;
  if (!backendHealthy) {
    errors.push(`Backend health check failed at ${getApiUrl('/api/health')}`);
  }

  // Check 3: API connectivity
  try {
    const response = await authFetch('/api/chat', {
      method: 'POST',
      body: JSON.stringify({
        messages: [{ role: 'user', content: 'test' }],
        max_tokens: 10,
      }),
    });
    checks.apiConnectivity = response.ok;
    if (!response.ok) {
      errors.push(`API test failed with status ${response.status}`);
    }
  } catch (error) {
    checks.apiConnectivity = false;
    errors.push(`API test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  return {
    success: Object.values(checks).every(Boolean),
    checks,
    errors,
  };
}
