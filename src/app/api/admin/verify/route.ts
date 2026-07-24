import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { isAdminUser } from "@/lib/auth";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ admin: false }, { status: 401 });
    }

    const service = await createServiceClient();
    const { data, error } = await service.auth.admin.getUserById(user.id);

    if (error || !data.user) {
      return NextResponse.json({ admin: false }, { status: 403 });
    }

    if (!isAdminUser(data.user)) {
      return NextResponse.json({ admin: false }, { status: 403 });
    }

    return NextResponse.json({ admin: true });
  } catch (err) {
    console.error("Admin verify error:", err);
    return NextResponse.json({ admin: false }, { status: 500 });
  }
}
