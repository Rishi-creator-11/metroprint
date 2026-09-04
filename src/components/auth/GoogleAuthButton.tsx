"use client";

import { useState } from "react";
import { Loader2, RotateCw } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

/** Shared "Continue with Google" button for /login, /signup, and /admin/login. */
export function GoogleAuthButton({
  redirectTo,
  label = "Continue with Google",
}: {
  /** Same-site path to land on after a successful sign-in (e.g. "/account", "/admin"). */
  redirectTo: string;
  label?: string;
}) {
  const [state, setState] = useState<"idle" | "loading" | "error">("idle");
  const [message, setMessage] = useState("");

  const start = async () => {
    setState("loading");
    setMessage("");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?redirect=${encodeURIComponent(redirectTo)}`,
        queryParams: { access_type: "offline", prompt: "consent" },
      },
    });

    if (error) {
      setState("error");
      setMessage(
        error.message.toLowerCase().includes("provider is not enabled")
          ? "Google sign-in isn't set up yet for this site."
          : "Couldn't start Google sign-in. Please try again.",
      );
      return;
    }
    // Success: the browser is already navigating to Google, this component unmounts.
  };

  return (
    <div>
      <button
        type="button"
        onClick={start}
        disabled={state === "loading"}
        className="flex w-full items-center justify-center gap-3 rounded-xl border border-border bg-white px-4 py-3 text-sm font-semibold text-navy transition-colors hover:bg-surface disabled:opacity-60"
      >
        {state === "loading" ? (
          <Loader2 className="animate-spin" size={18} />
        ) : (
          <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
            <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62Z" />
            <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 0 0 9 18Z" />
            <path fill="#FBBC05" d="M3.97 10.72a5.4 5.4 0 0 1 0-3.44V4.95H.96a9 9 0 0 0 0 8.1l3.01-2.33Z" />
            <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.46 3.44 1.35l2.58-2.58C13.46.9 11.43 0 9 0A9 9 0 0 0 .96 4.95l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58Z" />
          </svg>
        )}
        {state === "loading" ? "Redirecting to Google…" : label}
      </button>

      {state === "error" && (
        <div className="mt-2 flex items-center justify-between gap-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          <span>{message}</span>
          <button
            type="button"
            onClick={start}
            className="inline-flex shrink-0 items-center gap-1 font-semibold hover:underline"
          >
            <RotateCw size={13} /> Retry
          </button>
        </div>
      )}
    </div>
  );
}
