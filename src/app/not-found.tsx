import Link from "next/link";
import SiteLayout from "@/components/layout/SiteLayout";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <SiteLayout>
      <div id="main-content" className="mp-container flex flex-col items-center py-24 text-center">
        <p className="text-6xl font-black tracking-tight text-primary/20 sm:text-7xl">404</p>
        <h1 className="mt-2 text-2xl font-bold text-navy">We couldn&apos;t find that page</h1>
        <p className="mt-2 max-w-md text-muted">
          The link may be broken or the product may have moved. Let&apos;s get you back on track.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button href="/">Go home</Button>
          <Button href="/products" variant="secondary">Browse products</Button>
        </div>
        <p className="mt-6 text-sm text-muted">
          Need help?{" "}
          <Link href="/contact" className="font-semibold text-primary hover:underline">
            Contact us
          </Link>
        </p>
      </div>
    </SiteLayout>
  );
}
