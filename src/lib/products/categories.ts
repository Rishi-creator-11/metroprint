import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { CATEGORIES } from "@/lib/constants";
import type { Category } from "@/lib/types";

/** Dedicated routes for categories that have their own hub pages. */
const CATEGORY_HREF: Record<string, string> = {
  "Business Cards": "/business-cards",
};

const FALLBACK_CATEGORIES: Category[] = CATEGORIES.map((c, i) => ({
  id: `seed-cat-${i}`,
  name: c.name,
  slug: c.slug,
  description: c.description,
  image_url: c.image,
  sort_order: i + 1,
  visible: true,
  href: c.href ?? CATEGORY_HREF[c.name],
}));

type CategoryRow = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  sort_order: number;
  visible: boolean;
};

function fromRow(row: CategoryRow): Category {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description ?? "",
    image_url: row.image_url ?? null,
    sort_order: row.sort_order,
    visible: row.visible,
    href: CATEGORY_HREF[row.name],
  };
}

/**
 * Visible storefront categories, ordered. Reads the managed `categories` table;
 * falls back to the CATEGORIES constant if Supabase is unavailable / the table
 * is empty (dev + resilience).
 */
export async function getStorefrontCategories(): Promise<Category[]> {
  if (!isSupabaseConfigured()) return FALLBACK_CATEGORIES;
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("categories")
      .select("id, name, slug, description, image_url, sort_order, visible")
      .eq("visible", true)
      .order("sort_order");
    if (error || !data?.length) return FALLBACK_CATEGORIES;
    return (data as CategoryRow[]).map(fromRow);
  } catch {
    return FALLBACK_CATEGORIES;
  }
}

export { FALLBACK_CATEGORIES };
