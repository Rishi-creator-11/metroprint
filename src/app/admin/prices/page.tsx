import Link from "next/link";
import { createServiceClient } from "@/lib/supabase/server";
import { requireAdminUser } from "@/lib/admin-server";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminPricesForm } from "@/components/admin/AdminPricesForm";
import { getProductPrice } from "@/lib/product-prices";
import type { ProductCategory } from "@/lib/types";

export const metadata = {
  title: "Product Prices — MetroPrint USA Admin",
};

export default async function AdminPricesPage() {
  await requireAdminUser();
  const supabase = await createServiceClient();

  const { data: products } = await supabase
    .from("products")
    .select("id, title, slug, category, price, active")
    .order("category")
    .order("title");

  const rows = (products || []).map((p) => ({
    id: p.id,
    title: p.title,
    slug: p.slug,
    category: p.category as ProductCategory,
    price: getProductPrice(
      p.slug,
      p.price != null ? Number(p.price) : null
    ),
    active: p.active,
  }));

  return (
    <div className="min-h-screen bg-surface">
      <AdminHeader />
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-navy">Product prices</h1>
            <p className="mt-1 text-sm text-muted">
              Changes apply immediately on the site and at checkout.
            </p>
          </div>
          <Link
            href="/admin/dashboard"
            className="text-sm text-muted hover:text-primary"
          >
            ← Back to dashboard
          </Link>
        </div>

        {rows.length === 0 ? (
          <p className="text-muted">
            No products found. Run migrations and seed data in Supabase.
          </p>
        ) : (
          <AdminPricesForm products={rows} />
        )}
      </main>
    </div>
  );
}
