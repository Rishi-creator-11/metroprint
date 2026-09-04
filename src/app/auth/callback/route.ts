import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { isAdminUser, sanitizeRedirectPath } from "@/lib/auth";

/**
 * OAuth / PKCE callback. Exchanges the `?code` for a session, then — for a
 * small, explicit allowlist only — grants the `app_metadata.role = admin`
 * claim through the service role. Arbitrary Google users are never promoted.
 *
 * Admin authorization itself is still enforced server-side (middleware +
 * `requireAdminUser` / `requireAdminApi`) against `app_metadata`, not here.
 */

function adminAllowlist(): string[] {
  return (process.env.ADMIN_EMAIL_ALLOWLIST ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const redirectParam = sanitizeRedirectPath(url.searchParams.get("redirect"), "/admin");
  const origin = url.origin;

  if (!code) {
    return NextResponse.redirect(`${origin}/admin/login?error=oauth`);
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data.user) {
    return NextResponse.redirect(`${origin}/admin/login?error=oauth`);
  }

  const email = (data.user.email ?? "").toLowerCase();
  const allowlisted = email.length > 0 && adminAllowlist().includes(email);

  // Privileged, allowlist-gated promotion. Never touches user_metadata.
  if (allowlisted && !isAdminUser(data.user)) {
    try {
      const service = await createServiceClient();
      const current = data.user.app_metadata ?? {};
      await service.auth.admin.updateUserById(data.user.id, {
        app_metadata: { ...current, role: "admin" },
      });
      // Re-issue the session so downstream reads see the new claim promptly.
      await supabase.auth.refreshSession();
    } catch (err) {
      console.error("Admin auto-provision failed:", err);
    }
  }

  // Re-fetch authoritative role via the service role.
  let isAdmin = false;
  try {
    const service = await createServiceClient();
    const { data: fresh } = await service.auth.admin.getUserById(data.user.id);
    isAdmin = isAdminUser(fresh?.user);
  } catch {
    isAdmin = isAdminUser(data.user);
  }

  if (!isAdmin) {
    await supabase.auth.signOut();
    return NextResponse.redirect(`${origin}/admin/login?error=unauthorized`);
  }

  return NextResponse.redirect(`${origin}${redirectParam}`);
}
