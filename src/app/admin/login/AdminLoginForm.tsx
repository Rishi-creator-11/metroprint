"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { sanitizeRedirectPath } from "@/lib/auth";
import { Button } from "@/components/ui/Button";
import { GoogleAuthButton } from "@/components/auth/GoogleAuthButton";
import { LogoCompact } from "@/components/layout/Logo";
import { Loader2 } from "lucide-react";

export default function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = sanitizeRedirectPath(searchParams.get("redirect"), "/admin");
  const errorParam = searchParams.get("error");
  const unauthorized = errorParam === "unauthorized";
  const oauthError = errorParam === "oauth";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
    <div className="flex min-h-screen items-center justify-center bg-surface px-4">
      <div className="w-full max-w-md rounded-2xl border border-border bg-white p-8 shadow-sm">
        <div className="mb-7 flex justify-center">
          <div className="rounded-lg bg-navy px-4 py-3">
            <LogoCompact />
          </div>
        </div>

        <h1 className="text-center text-xl font-bold text-navy">Admin sign in</h1>
        <p className="mt-1 text-center text-sm text-muted">Manage products, pricing, orders &amp; content</p>

        {unauthorized && (
          <div className="mt-4 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
            That account doesn&apos;t have admin access.
          </div>
        )}
        {oauthError && (
          <div className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            Sign-in could not be completed. Please try again.
          </div>
        )}

        <div className="mt-7">
          {/* Same general-purpose callback every customer uses — this form grants
              no admin access itself. Whether the signed-in account is an admin is
              decided afterwards, server-side, from app_metadata. */}
          <GoogleAuthButton redirectTo={redirect} />
        </div>

        <div className="my-5 flex items-center gap-3 text-xs text-muted">
          <span className="h-px flex-1 bg-border" /> or
          <span className="h-px flex-1 bg-border" />
        </div>

        {!showPassword ? (
          <button
            type="button"
            onClick={() => setShowPassword(true)}
            className="w-full text-center text-sm font-medium text-primary hover:underline"
          >
            Sign in with email &amp; password
          </button>
        ) : (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
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
          <div className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
        )}
      </div>
    </div>
  );
}
