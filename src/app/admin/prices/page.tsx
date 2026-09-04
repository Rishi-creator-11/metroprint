import Link from "next/link";
import { createServiceClient } from "@/lib/supabase/server";
import { requireAdminUser } from "@/lib/admin/admin-server";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminPricingHub } from "@/components/admin/AdminPricingHub";
import { loadAdminPricingSections } from "@/lib/pricing/admin-pricing-server";

export const metadata = {
  title: "Pricing · Admin",
};

export default async function AdminPricesPage() {
  await requireAdminUser();
  const supabase = await createServiceClient();
  const sections = await loadAdminPricingSections(supabase);

  return (
    <div className="min-h-screen bg-surface">
      <AdminHeader />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-navy">Product Pricing</h1>
            <p className="mt-1 text-sm text-muted">
              Tiered categories get a full quantity + option editor; flat
              categories (Promotional, Marketing Services) get a base-price
              editor. Titles, images, and visibility live under{" "}
              <Link href="/admin/products" className="text-primary hover:underline">
                Products
              </Link>
              .
            </p>
          </div>
          <Link
            href="/admin/dashboard"
            className="text-sm text-muted hover:text-primary"
          >
            ← Orders
          </Link>
        </div>

        <AdminPricingHub sections={sections} />
      </main>
    </div>
  );
}
