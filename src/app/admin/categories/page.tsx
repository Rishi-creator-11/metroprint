import { requireAdminUser } from "@/lib/admin/admin-server";
import { loadAdminCategories } from "@/lib/admin/category-admin";
import { loadAllAdminProducts } from "@/lib/admin/product-admin";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminCategoryManager } from "@/components/admin/AdminCategoryManager";

export const metadata = { title: "Categories · Admin" };

export default async function AdminCategoriesPage() {
  await requireAdminUser();
  const [categories, products] = await Promise.all([
    loadAdminCategories(),
    loadAllAdminProducts(),
  ]);

  const counts: Record<string, number> = {};
  for (const p of products) {
    if (p.active) counts[p.category] = (counts[p.category] ?? 0) + 1;
  }

  return (
    <div className="min-h-screen bg-surface">
      <AdminHeader />
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-navy">Categories</h1>
        <p className="mt-1 text-sm text-muted">
          Name, description, image, order, and storefront visibility. Order here
          drives the homepage tiles and the Products page tabs.
        </p>
        <AdminCategoryManager categories={categories} productCounts={counts} />
      </main>
    </div>
  );
}
