import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sanitizeRedirectPath } from "@/lib/auth";

/**
 * General-purpose OAuth / PKCE callback for every signed-in user — customers
 * and admins alike. It only ever does one thing: exchange the `?code` for a
 * session and send the browser to a same-site destination.
 *
 * It never grants, checks, or reasons about the admin role. Admin
 * authorization is enforced separately and only from server-verified
 * `app_metadata.role` (see src/lib/auth.ts `isAdminUser`, used by
 * middleware.ts and requireAdminUser/requireAdminApi) — never here, never
 * from user_metadata, never from the caller's email.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  // Accept either `redirect` (used by /login, /signup, /admin/login) or the
  // more common OAuth convention `next`.
  const destination = sanitizeRedirectPath(
    url.searchParams.get("redirect") ?? url.searchParams.get("next"),
    "/account",
  );
  const origin = url.origin;
  // Bounce sign-in errors back to whichever login screen sent the customer
  // here (purely a UX choice based on the requested destination — no
  // authorization decision is made in this route).
  const loginScreen = destination.startsWith("/admin") ? "/admin/login" : "/login";

  if (!code) {
    return NextResponse.redirect(`${origin}${loginScreen}?error=oauth`, 303);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(`${origin}${loginScreen}?error=oauth`, 303);
  }

  return NextResponse.redirect(`${origin}${destination}`, 303);
}
