"use client";

import SiteLayout from "@/components/layout/SiteLayout";
import { Button } from "@/components/ui/Button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <SiteLayout>
      <div id="main-content" className="mx-auto max-w-lg px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-navy">Something went wrong</h1>
        <p className="mt-2 text-muted">
          An unexpected error occurred. Please try again.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button onClick={reset}>Try again</Button>
          <Button href="/" variant="outline">
            Go home
          </Button>
        </div>
      </div>
    </SiteLayout>
  );
}
