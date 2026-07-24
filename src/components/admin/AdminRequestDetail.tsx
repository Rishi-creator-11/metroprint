"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { PaymentBadge } from "@/components/ui/WorkflowBadge";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { Button } from "@/components/ui/Button";
import { ArtworkFilesList, OrderItemSpecs } from "@/components/orders/OrderItemSpecs";
import { formatPrice } from "@/lib/product-prices";
import { isInquiry } from "@/lib/order-utils";
import { TypeBadge } from "@/components/ui/TypeBadge";
import { Copy, Check } from "lucide-react";
import type { Order, OrderStatus } from "@/lib/types";

const STATUS_OPTIONS: OrderStatus[] = [
  "pending",
  "processing",
  "completed",
  "cancelled",
];

function fileNameFromUrl(url: string): string {
  try {
    return decodeURIComponent(url.split("/").pop() || "File");
  } catch {
    return "File";
  }
}

export function AdminRequestDetail({ request: initialRequest }: { request: Order }) {
  const router = useRouter();
  const [request, setRequest] = useState(initialRequest);
  const [internalNotes, setInternalNotes] = useState(
    initialRequest.internal_notes || ""
  );
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const patch = async (updates: Record<string, unknown>) => {
    setSaving(true);
    const res = await fetch(`/api/admin/quote-requests/${request.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    setSaving(false);
    if (res.ok) {
      setRequest(await res.json());
      router.refresh();
    }
  };

  const copyToClipboard = async (text: string, label: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };

  const hasCartItems = request.cart_items?.length > 0;
  const inquiry = isInquiry(request);
  const orphanFileUrls =
    request.file_urls?.filter(
      (url) =>
        !request.cart_items?.some((item) =>
          item.artwork_files?.some((file) => file.url === url)
        )
    ) || [];

  return (
    <div className="min-h-screen bg-surface">
      <AdminHeader />

      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <Button href="/admin/dashboard" variant="ghost" size="sm" className="mb-6">
          ← Back to Dashboard
        </Button>

        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-primary">{request.order_number}</p>
            <h1 className="text-2xl font-bold text-navy">{request.product_name}</h1>
            <p className="text-sm text-muted">
              {new Date(request.created_at).toLocaleString()}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <TypeBadge type={inquiry ? "inquiry" : "order"} />
            <StatusBadge status={request.status} />
            {!inquiry && <PaymentBadge status={request.payment_status} />}
          </div>
        </div>

        {!inquiry && request.total_amount != null && (
          <p className="mt-4 text-2xl font-bold text-navy">
            {formatPrice(request.total_amount)}
          </p>
        )}

        {inquiry && (
          <p className="mt-4 rounded-lg bg-violet-50 px-4 py-3 text-sm text-violet-900">
            Custom quote request — no payment yet. Reply to the customer by email,
            then mark as completed once quoted or handled.
          </p>
        )}

        <div className="mt-6 flex flex-wrap gap-2">
          {STATUS_OPTIONS.map((status) => (
            <button
              key={status}
              onClick={() => patch({ status })}
              disabled={saving || request.status === status}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium capitalize ${
                request.status === status
                  ? "bg-primary text-white"
                  : "border border-border bg-white text-muted hover:border-primary"
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className="rounded-xl border border-border bg-white p-6">
            <h2 className="mb-4 font-semibold text-navy">Customer</h2>
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-muted">Name</dt>
                <dd className="font-medium">{request.customer_name}</dd>
              </div>
              <div>
                <dt className="text-muted">Email</dt>
                <dd className="flex items-center gap-2">
                  <a href={`mailto:${request.email}`} className="text-primary hover:underline">
                    {request.email}
                  </a>
                  <button onClick={() => copyToClipboard(request.email, "email")}>
                    {copied === "email" ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
                  </button>
                </dd>
              </div>
              <div>
                <dt className="text-muted">Phone</dt>
                <dd>{request.phone || "—"}</dd>
              </div>
              <div>
                <dt className="text-muted">Company</dt>
                <dd>{request.company_name || "—"}</dd>
              </div>
            </dl>
          </div>

          <div className="rounded-xl border border-border bg-white p-6">
            <h2 className="mb-4 font-semibold text-navy">
              {inquiry ? "Inquiry Details" : "Order Configuration"}
            </h2>
            {hasCartItems ? (
              <ul className="space-y-5 text-sm">
                {request.cart_items.map((item) => (
                  <li key={item.id} className="border-b border-border pb-4 last:border-0 last:pb-0">
                    <OrderItemSpecs item={item} showArtworkPreview />
                  </li>
                ))}
              </ul>
            ) : (
              <dl className="space-y-2 text-sm">
                {Object.entries(request.selected_options).map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-4">
                    <dt className="capitalize text-muted">{k.replace(/_/g, " ")}</dt>
                    <dd className="font-medium">{v}</dd>
                  </div>
                ))}
              </dl>
            )}
            {request.notes && (
              <div className="mt-4 border-t border-border pt-4">
                <dt className="text-sm text-muted">Customer Notes</dt>
                <dd className="mt-1 text-sm">{request.notes}</dd>
              </div>
            )}
          </div>
        </div>

        {orphanFileUrls.length > 0 && (
          <div className="mt-6 rounded-xl border border-border bg-white p-6">
            <h2 className="mb-4 font-semibold text-navy">Uploaded Files</h2>
            <ArtworkFilesList
              files={orphanFileUrls.map((url) => ({
                name: fileNameFromUrl(url),
                url,
              }))}
              showPreview
            />
          </div>
        )}

        <div className="mt-6 rounded-xl border border-border bg-white p-6">
          <h2 className="mb-4 font-semibold text-navy">Internal Notes</h2>
          <textarea
            value={internalNotes}
            onChange={(e) => setInternalNotes(e.target.value)}
            rows={4}
            className="w-full rounded-lg border border-border px-3 py-2 text-sm"
          />
          <Button
            onClick={() => patch({ internal_notes: internalNotes })}
            disabled={saving}
            size="sm"
            className="mt-3"
          >
            Save Notes
          </Button>
        </div>
      </div>
    </div>
  );
}
