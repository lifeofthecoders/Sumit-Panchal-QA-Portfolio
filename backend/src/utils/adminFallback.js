
/*
 * Legacy administrator fallback disabled.
 *
 * Administrator authentication must use an existing MongoDB
 * Admin account and the verified JWT authentication middleware.
 *
 * This module intentionally contains no:
 * - Hardcoded administrator email
 * - Hardcoded password or password hash
 * - Fallback administrator ID
 * - Automatic administrator creation
 */

export const validateFallbackAdminLogin = async () => {
  return null;
};

export const getFallbackAdmin = () => {
  return null;
};
