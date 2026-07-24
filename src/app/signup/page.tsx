"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import SiteLayout from "@/components/layout/SiteLayout";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";
import { sanitizeRedirectPath } from "@/lib/auth";
import { Loader2 } from "lucide-react";

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = sanitizeRedirectPath(searchParams.get("redirect"), "/account");

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
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="text-2xl font-bold text-navy">Create Account</h1>
      <p className="mt-2 text-sm text-muted">
        Sign up to checkout faster and track orders.
      </p>

      <form onSubmit={handleSignup} className="mt-8 space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium">Full Name</label>
          <input
            type="text"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full rounded-lg border border-border px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-border px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium">Password</label>
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-border px-3 py-2 text-sm"
          />
        </div>
        {error && (
          <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
        )}
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? <Loader2 className="animate-spin" size={18} /> : "Create Account"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        Already have an account?{" "}
        <Link href={`/login?redirect=${encodeURIComponent(redirect)}`} className="text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}

export default function SignupPage() {
  return (
    <SiteLayout>
      <Suspense fallback={<div className="py-16 text-center">Loading...</div>}>
        <SignupForm />
      </Suspense>
    </SiteLayout>
  );
}
