"use client";

import { useEffect } from "react";
import SiteLayout from "@/components/layout/SiteLayout";
import { Button } from "@/components/ui/Button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <SiteLayout>
      <div id="main-content" className="mp-container flex flex-col items-center py-24 text-center">
        <div className="grid h-14 w-14 place-items-center rounded-2xl bg-red-50 text-2xl">⚠️</div>
        <h1 className="mt-4 text-2xl font-bold text-navy">Something went wrong</h1>
        <p className="mt-2 max-w-md text-muted">
          An unexpected error occurred. You can retry, or head back to the homepage.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button onClick={reset}>Try again</Button>
          <Button href="/" variant="secondary">Go home</Button>
        </div>
      </div>
    </SiteLayout>
  );
}
