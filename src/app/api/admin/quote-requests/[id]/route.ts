import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { isAdminUser } from "@/lib/auth";
import { normalizeOrder } from "@/lib/quote-normalize";
import { isInquiry } from "@/lib/order-utils";
import { sendOrderStatusUpdateEmail } from "@/lib/email";
import type { OrderStatus, PaymentStatus } from "@/lib/types";

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

  if (body.status) {
    const valid: OrderStatus[] = ["pending", "processing", "completed", "cancelled"];
    if (!valid.includes(body.status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }
    updates.status = body.status;
  }

  if (body.payment_status) {
    const valid: PaymentStatus[] = ["unpaid", "pending", "paid", "refunded"];
    if (!valid.includes(body.payment_status)) {
      return NextResponse.json({ error: "Invalid payment status" }, { status: 400 });
    }
    updates.payment_status = body.payment_status;
  }

  if (body.internal_notes !== undefined) {
    updates.internal_notes = body.internal_notes;
  }

  const { data: existing } = await service
    .from("quote_requests")
    .select("status, email, customer_name, order_number, product_name, category")
    .eq("id", id)
    .single();

  const { data, error } = await service
    .from("quote_requests")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const newStatus = updates.status as OrderStatus | undefined;
  if (
    existing &&
    newStatus &&
    existing.status !== newStatus &&
    existing.email
  ) {
    await sendOrderStatusUpdateEmail({
      to: existing.email,
      customerName: existing.customer_name,
      orderNumber: existing.order_number || "",
      productName: existing.product_name,
      status: newStatus,
      isInquiry: isInquiry({ category: existing.category }),
    }).catch((err) => console.error("Status email error:", err));
  }

  return NextResponse.json(normalizeOrder(data));
}
