"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import SiteLayout from "@/components/layout/SiteLayout";
import { Button } from "@/components/ui/Button";
import { useCart } from "@/components/cart/CartProvider";
import { CheckCircle, Loader2 } from "lucide-react";

function SuccessContent() {
  const { clearCart } = useCart();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [orderNumber, setOrderNumber] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!sessionId) {
      setError("Invalid checkout session");
      setLoading(false);
      return;
    }

    fetch("/api/checkout/complete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ session_id: sessionId }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.order_number) {
          setOrderNumber(data.order_number);
          clearCart();
        } else {
          setError(data.error || "Could not verify payment");
        }
      })
      .catch(() => setError("Could not verify payment"))
      .finally(() => setLoading(false));
  }, [sessionId, clearCart]);

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-navy">Something went wrong</h1>
        <p className="mt-2 text-muted">{error}</p>
        <Button href="/account" className="mt-6">
          View Account
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-16 text-center">
      <CheckCircle className="mx-auto mb-4 text-green-600" size={56} />
      <h1 className="text-2xl font-bold text-navy">Payment Successful!</h1>
      <p className="mt-2 text-muted">
        Order <strong>{orderNumber}</strong> is confirmed.
      </p>
      <p className="mt-4 text-sm text-muted">
        We&apos;ll start processing your order and email you updates.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button href="/account">View Orders</Button>
        <Button href="/products" variant="outline">
          Continue Shopping
        </Button>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <SiteLayout>
      <Suspense fallback={<Loader2 className="mx-auto mt-20 animate-spin text-primary" size={32} />}>
        <SuccessContent />
      </Suspense>
    </SiteLayout>
  );
}
