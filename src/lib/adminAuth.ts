/**
 * Admin authorization configuration for Mumtahina's Closet Inc.
 * Authorized admin accounts have full access to /admin.
 */

export const AUTHORIZED_ADMIN_EMAILS = [
  'denaislam09@gmail.com',
  'clientshabnamusa@gmail.com',
] as const;

/**
 * Checks if a given email belongs to an authorized administrator.
 * Case-insensitive comparison.
 */
export function isAuthorizedAdmin(email?: string | null): boolean {
  if (!email || typeof email !== 'string') return false;
  const normalized = email.trim().toLowerCase();
  return AUTHORIZED_ADMIN_EMAILS.some(
    (adminEmail) => adminEmail.toLowerCase() === normalized
  );
}
