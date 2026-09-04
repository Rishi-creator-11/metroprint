import Link from "next/link";
import { requireAdminUser } from "@/lib/admin/admin-server";
import { loadAllAdminProducts } from "@/lib/admin/product-admin";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminProductManager } from "@/components/admin/AdminProductManager";

export const metadata = {
  title: "Products · Admin",
};

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ featured?: string }>;
}) {
  await requireAdminUser();
  const [{ featured }, products] = await Promise.all([
    searchParams,
    loadAllAdminProducts(),
  ]);

  return (
    <div className="min-h-screen bg-surface">
      <AdminHeader />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-navy">Products</h1>
            <p className="mt-1 text-sm text-muted">
              Edit product details, images, base pricing, and visibility.
              Quantity-tier / option pricing is edited under{" "}
              <Link href="/admin/prices" className="text-primary hover:underline">
                Pricing
              </Link>
              .
            </p>
          </div>
          <Link href="/admin/dashboard" className="text-sm text-muted hover:text-primary">
            ← Orders
          </Link>
        </div>

        <AdminProductManager products={products} initialFeatured={featured === "1"} />
      </main>
    </div>
  );
}
