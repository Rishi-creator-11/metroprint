import { redirect } from "next/navigation";
import { NextResponse } from "next/server";
import type { User } from "@supabase/supabase-js";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { isAdminUser } from "@/lib/auth";

type ServiceClient = Awaited<ReturnType<typeof createServiceClient>>;

/**
 * Canonical server-side admin check. Returns the authenticated admin user and a
 * service-role client, or `null` when the caller is not a signed-in admin.
 *
 * The admin role is verified against `auth.users` app_metadata via the service
 * role (see {@link isAdminUser}), never from client-supplied data.
 */
async function resolveAdmin(): Promise<
  { user: User; service: ServiceClient } | null
> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const service = await createServiceClient();
  const { data: adminUser } = await service.auth.admin.getUserById(user.id);

  if (!isAdminUser(adminUser?.user)) return null;

  return { user, service };
}

/**
 * For admin **pages / server components**. Redirects to the login screen when
 * the visitor is not a signed-in admin; otherwise returns the admin user.
 */
export async function requireAdminUser(): Promise<User> {
  const admin = await resolveAdmin();
  if (!admin) redirect("/admin/login?error=unauthorized");
  return admin.user;
}

/**
 * For admin **API routes**. Returns `{ error: NextResponse }` (HTTP 401) when the
 * caller is not a signed-in admin, otherwise `{ user, service }`.
 *
 * Usage:
 * ```ts
 * const auth = await requireAdminApi();
 * if ("error" in auth) return auth.error;
 * const { service } = auth;
 * ```
 */
export async function requireAdminApi(): Promise<
  | { error: NextResponse }
  | { user: User; service: ServiceClient }
> {
  const admin = await resolveAdmin();
  if (!admin) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  return { user: admin.user, service: admin.service };
}
