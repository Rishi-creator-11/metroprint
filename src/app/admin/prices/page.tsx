import Link from "next/link";
import { createServiceClient } from "@/lib/supabase/server";
import { requireAdminUser } from "@/lib/admin-server";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminPricingHub } from "@/components/admin/AdminPricingHub";
import { getProductPrice } from "@/lib/product-prices";
import { normalizePricingRules } from "@/lib/pricing";
import type { OptionsSchema, ProductPricingRules } from "@/lib/types";
import { getSeedProductBySlug } from "@/lib/products-data";

export const metadata = {
  title: "Business Card Pricing — MetroPrint USA Admin",
};

export default async function AdminPricesPage() {
  await requireAdminUser();
  const supabase = await createServiceClient();

  const { data: products } = await supabase
    .from("products")
    .select(
      "id, title, slug, category, price, active, options_schema, pricing_rules, subcategory"
    )
    .eq("category", "Business Cards")
    .like("slug", "business-cards-%")
    .eq("active", true)
    .order("subcategory")
    .order("title");

  const rows = (products || []).map((p) => {
    const seed = getSeedProductBySlug(p.slug);
    const options_schema = (seed?.options_schema ??
      p.options_schema ?? { fields: [] }) as OptionsSchema;

    return {
      id: p.id,
      title: p.title,
      slug: p.slug,
      category: "Business Cards" as const,
      price: getProductPrice(
        p.slug,
        p.price != null ? Number(p.price) : null
      ),
      active: p.active,
      options_schema,
      pricing_rules: normalizePricingRules(p.pricing_rules) as ProductPricingRules | null,
      subcategory: p.subcategory ?? seed?.subcategory ?? null,
    };
  });

  return (
    <div className="min-h-screen bg-surface">
      <AdminHeader />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-navy">Business Card Pricing</h1>
            <p className="mt-1 text-sm text-muted">
              Set prices by quantity and add-ons for edge color, stock, finish, sides,
              and every other option — live on the storefront instantly.
            </p>
          </div>
          <Link
            href="/admin/dashboard"
            className="text-sm text-muted hover:text-primary"
          >
            ← Orders
          </Link>
        </div>

        <AdminPricingHub products={rows} />
      </main>
    </div>
  );
}
