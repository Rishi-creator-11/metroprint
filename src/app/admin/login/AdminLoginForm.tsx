"use client";

import { useId, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { sanitizeRedirectPath } from "@/lib/auth";
import { Button } from "@/components/ui/Button";
import { GoogleAuthButton, GOOGLE_AUTH_ENABLED } from "@/components/auth/GoogleAuthButton";
import { AuthShell } from "@/components/auth/AuthShell";
import { Loader2, ShieldCheck } from "lucide-react";

export default function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = sanitizeRedirectPath(searchParams.get("redirect"), "/admin");
  const errorParam = searchParams.get("error");
  const unauthorized = errorParam === "unauthorized";
  const oauthError = errorParam === "oauth";
  const emailId = useId();
  const passwordId = useId();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(!GOOGLE_AUTH_ENABLED);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    // The general auth flow only authenticates. Admin access is checked here,
    // separately, from server-verified app_metadata — never from this form.
    const verifyRes = await fetch("/api/admin/verify");
    if (!verifyRes.ok) {
      await supabase.auth.signOut();
      setError("This account doesn't have admin access.");
      setLoading(false);
      return;
    }

    router.push(redirect);
    router.refresh();
  };

  return (
    <AuthShell
      eyebrow="Admin"
      title="Admin sign in"
      subtitle="Manage products, pricing, orders & content."
    >
      <div className="mb-5 hidden items-center gap-2 rounded-lg bg-primary/5 px-3 py-2 text-xs font-medium text-primary lg:flex">
        <ShieldCheck size={15} /> Restricted to authorized MetroPrint staff
      </div>

      {unauthorized && (
        <div role="alert" className="mb-5 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
          That account doesn&apos;t have admin access.
        </div>
      )}
      {oauthError && (
        <div role="alert" className="mb-5 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          Sign-in could not be completed. Please try again.
        </div>
      )}

      {/* Same general callback every customer uses — this form grants no admin
          access itself. Whether the signed-in account is an admin is decided
          afterwards, server-side, from app_metadata. */}
      {GOOGLE_AUTH_ENABLED && (
        <>
          <GoogleAuthButton redirectTo={redirect} />
          <div className="my-5 flex items-center gap-3 text-xs text-muted">
            <span className="h-px flex-1 bg-border" /> or
            <span className="h-px flex-1 bg-border" />
          </div>
        </>
      )}

      {!showPassword ? (
        <button
          type="button"
          onClick={() => setShowPassword(true)}
          className="w-full text-center text-sm font-medium text-primary hover:underline"
        >
          Sign in with email &amp; password
        </button>
      ) : (
        <form onSubmit={handleLogin} className="space-y-4" noValidate>
          <div>
            <label htmlFor={emailId} className="mb-1.5 block text-sm font-medium text-navy">
              Email
            </label>
            <input
              id={emailId}
              type="email"
              required
              autoComplete="email"
              disabled={loading}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-border bg-white px-3.5 py-2.5 text-sm text-navy focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-60"
            />
          </div>
          <div>
            <label htmlFor={passwordId} className="mb-1.5 block text-sm font-medium text-navy">
              Password
            </label>
            <input
              id={passwordId}
              type="password"
              required
              autoComplete="current-password"
              disabled={loading}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-border bg-white px-3.5 py-2.5 text-sm text-navy focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-60"
            />
          </div>
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={18} /> Signing in…
              </>
            ) : (
              "Sign in"
            )}
          </Button>
        </form>
      )}

      {error && (
        <div role="alert" className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}
    </AuthShell>
  );
}
