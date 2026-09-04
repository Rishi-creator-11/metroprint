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

export function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = sanitizeRedirectPath(searchParams.get("redirect"), "/account");
  const oauthError = searchParams.get("error") === "oauth";
  const nameId = useId();
  const emailId = useId();
  const passwordId = useId();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
      },
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
      eyebrow="Get started"
      title="Create your account"
      subtitle="Sign up to check out faster and track your orders."
      footer={
        <>
          Already have an account?{" "}
          <Link href={`/login?redirect=${encodeURIComponent(redirect)}`} className="font-semibold text-primary hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      {oauthError && (
        <div role="alert" className="mb-5 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          Sign-in could not be completed. Please try again.
        </div>
      )}

      <GoogleAuthButton redirectTo={redirect} label="Sign up with Google" />

      <div className="my-5 flex items-center gap-3 text-xs text-muted">
        <span className="h-px flex-1 bg-border" /> or continue with email
        <span className="h-px flex-1 bg-border" />
      </div>

      <form onSubmit={handleSignup} className="space-y-4" noValidate>
        <div>
          <label htmlFor={nameId} className="mb-1.5 block text-sm font-medium text-navy">
            Full name
          </label>
          <input
            id={nameId}
            type="text"
            required
            autoComplete="name"
            disabled={loading}
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full rounded-xl border border-border bg-white px-3.5 py-2.5 text-sm text-navy focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-60"
          />
        </div>
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
            minLength={6}
            autoComplete="new-password"
            disabled={loading}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-border bg-white px-3.5 py-2.5 text-sm text-navy focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-60"
            aria-describedby={`${passwordId}-hint`}
          />
          <p id={`${passwordId}-hint`} className="mt-1.5 text-xs text-muted">
            At least 6 characters.
          </p>
        </div>
        {error && (
          <div role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? (
            <>
              <Loader2 className="animate-spin" size={18} /> Creating account…
            </>
          ) : (
            "Create account"
          )}
        </Button>
      </form>
    </AuthShell>
  );
}
