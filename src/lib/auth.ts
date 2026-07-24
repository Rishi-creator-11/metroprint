import type { User } from "@supabase/supabase-js";

/**
 * Admin role is set in Supabase Dashboard → Authentication → Users → App Metadata:
 * { "role": "admin" }
 *
 * Or run in SQL Editor:
 * UPDATE auth.users
 * SET raw_app_meta_data = COALESCE(raw_app_meta_data, '{}'::jsonb) || '{"role":"admin"}'::jsonb
 * WHERE email = 'user@example.com';
 */
export function isAdminUser(user: User | null | undefined): boolean {
  if (!user) return false;

  const app = user.app_metadata ?? {};

  const role = typeof app.role === "string" ? app.role.toLowerCase().trim() : "";
  if (role === "admin") return true;

  if (app.is_admin === true) return true;

  if (Array.isArray(app.roles)) {
    return app.roles.some(
      (value) => String(value).toLowerCase().trim() === "admin"
    );
  }

  return false;
}

/** Prevent open redirects — only allow same-site relative paths. */
export function sanitizeRedirectPath(
  path: string | null | undefined,
  fallback = "/"
): string {
  if (!path || !path.startsWith("/") || path.startsWith("//")) {
    return fallback;
  }
  return path;
}
