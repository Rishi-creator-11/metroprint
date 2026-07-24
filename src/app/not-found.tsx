import Link from "next/link";
import SiteLayout from "@/components/layout/SiteLayout";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <SiteLayout>
      <div id="main-content" className="mx-auto max-w-lg px-4 py-20 text-center">
        <h1 className="text-4xl font-bold text-navy">404</h1>
        <p className="mt-2 text-lg text-muted">This page could not be found.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button href="/">Go home</Button>
          <Button href="/products" variant="outline">
            Browse products
          </Button>
        </div>
        <p className="mt-6 text-sm text-muted">
          Need help? <Link href="/contact" className="text-primary hover:underline">Contact us</Link>
        </p>
      </div>
    </SiteLayout>
  );
}
