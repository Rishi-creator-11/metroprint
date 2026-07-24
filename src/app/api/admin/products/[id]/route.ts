import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { isAdminUser } from "@/lib/auth";
import { formatPriceLabel } from "@/lib/product-prices";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const service = await createServiceClient();
  const { data: adminUser } = await service.auth.admin.getUserById(user.id);
  if (!isAdminUser(adminUser?.user)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const updates: Record<string, unknown> = {};

  if (body.price !== undefined) {
    const price = Number(body.price);
    if (!Number.isFinite(price) || price <= 0) {
      return NextResponse.json({ error: "Invalid price" }, { status: 400 });
    }
    updates.price = price;
    updates.base_price_text = formatPriceLabel(price);
  }

  if (!Object.keys(updates).length) {
    return NextResponse.json({ error: "No updates" }, { status: 400 });
  }

  const { data, error } = await service
    .from("products")
    .update(updates)
    .eq("id", id)
    .select("id, title, slug, category, price, base_price_text, active")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    ...data,
    price: data.price != null ? Number(data.price) : null,
  });
}
