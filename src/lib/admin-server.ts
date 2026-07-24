import { redirect } from "next/navigation";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { isAdminUser } from "@/lib/auth";

export async function requireAdminUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  const service = await createServiceClient();
  const { data: adminUser } = await service.auth.admin.getUserById(user.id);

  if (!isAdminUser(adminUser?.user)) {
    redirect("/admin/login?error=unauthorized");
  }

  return user;
}
