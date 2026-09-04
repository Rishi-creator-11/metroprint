import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin/admin-server";
import { normalizeOrder } from "@/lib/checkout/quote-normalize";
import { isInquiry } from "@/lib/checkout/order-utils";
import { sendOrderStatusUpdateEmail } from "@/lib/email";
import type { OrderStatus, PaymentStatus } from "@/lib/types";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const auth = await requireAdminApi();
  if ("error" in auth) return auth.error;
  const { service } = auth;

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
