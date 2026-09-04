"use client";

import { useId, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { AuthShell } from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/Button";
import { GoogleAuthButton } from "@/components/auth/GoogleAuthButton";
import { createClient } from "@/lib/supabase/client";
import { sanitizeRedirectPath } from "@/lib/auth";
import { Loader2 } from "lucide-react";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = sanitizeRedirectPath(searchParams.get("redirect"), "/account");
  const oauthError = searchParams.get("error") === "oauth";
  const emailId = useId();
  const passwordId = useId();

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

    router.push(redirect);
    router.refresh();
  };

  return (
    <AuthShell
      eyebrow="Welcome back"
      title="Sign in"
      subtitle="Sign in to check out and track your orders."
      footer={
        <>
          Don&apos;t have an account?{" "}
          <Link href={`/signup?redirect=${encodeURIComponent(redirect)}`} className="font-semibold text-primary hover:underline">
            Create one
          </Link>
        </>
      }
    >
      {oauthError && (
        <div role="alert" className="mb-5 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          Sign-in could not be completed. Please try again.
        </div>
      )}

      <GoogleAuthButton redirectTo={redirect} />

      <div className="my-5 flex items-center gap-3 text-xs text-muted">
        <span className="h-px flex-1 bg-border" /> or continue with email
        <span className="h-px flex-1 bg-border" />
      </div>

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
        {error && (
          <div role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}
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
    </AuthShell>
  );
}
