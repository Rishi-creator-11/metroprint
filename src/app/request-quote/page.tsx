"use client";

import { useState } from "react";
import SiteLayout from "@/components/layout/SiteLayout";
import { Button } from "@/components/ui/Button";
import { CONTACT_INFO } from "@/lib/constants";
import { CheckCircle, Loader2 } from "lucide-react";

export default function RequestQuotePage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, message }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send");
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <SiteLayout>
        <div className="mx-auto max-w-lg px-4 py-16 text-center">
          <CheckCircle className="mx-auto mb-4 text-green-600" size={48} />
          <h1 className="text-2xl font-bold text-navy">Message Sent!</h1>
          <p className="mt-2 text-muted">We&apos;ll get back to you within 1–2 business days.</p>
          <Button href="/" className="mt-6">
            Back to Home
          </Button>
        </div>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <div className="mx-auto max-w-xl px-4 py-12 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-navy">Request a Quote</h1>
        <p className="mt-2 text-muted">
          Have a custom project or bulk order? Tell us what you need and we&apos;ll
          send a personalized quote. For standard products,{" "}
          <a href="/products" className="text-primary hover:underline">
            shop with fixed prices
          </a>{" "}
          instead.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium">Name *</label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">Email *</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">Phone</label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">Project Details *</label>
            <textarea
              required
              rows={5}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Describe your project, quantities, timeline, etc."
              className="w-full rounded-lg border border-border px-3 py-2 text-sm"
            />
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
          )}

          <Button type="submit" disabled={submitting} size="lg">
            {submitting ? (
              <>
                <Loader2 className="animate-spin" size={18} /> Sending...
              </>
            ) : (
              "Send Inquiry"
            )}
          </Button>
        </form>

        <p className="mt-8 text-sm text-muted">
          Or reach us at {CONTACT_INFO.email} · {CONTACT_INFO.phone}
        </p>
      </div>
    </SiteLayout>
  );
}
