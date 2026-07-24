"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { sanitizeRedirectPath } from "@/lib/auth";
import { Button } from "@/components/ui/Button";
import { LogoCompact } from "@/components/layout/Logo";
import { Loader2 } from "lucide-react";

export default function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = sanitizeRedirectPath(searchParams.get("redirect"), "/admin/dashboard");
  const unauthorized = searchParams.get("error") === "unauthorized";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    const verifyRes = await fetch("/api/admin/verify");
    if (!verifyRes.ok) {
      await supabase.auth.signOut();
      setError(
        "This account does not have admin access. In Supabase, set App Metadata to: {\"role\": \"admin\"}"
      );
      setLoading(false);
      return;
    }

    router.push(redirect);
    router.refresh();
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-4">
      <div className="w-full max-w-md rounded-xl border border-border bg-white p-8 shadow-sm">
        <div className="mb-8 flex justify-center">
          <div className="rounded-lg bg-navy px-4 py-3">
            <LogoCompact />
          </div>
        </div>

        <h1 className="text-center text-xl font-semibold text-navy">
          Admin Login
        </h1>
        <p className="mt-1 text-center text-sm text-muted">
          Sign in to manage orders
        </p>

        {unauthorized && !error && (
          <div className="mt-4 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
            Admin access required.
          </div>
        )}

        <form onSubmit={handleLogin} className="mt-8 space-y-4">
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

          {error && (
            <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={18} /> Signing in...
              </>
            ) : (
              "Sign In"
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
