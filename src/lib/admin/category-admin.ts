import { createServiceClient } from "@/lib/supabase/server";
import { FALLBACK_CATEGORIES } from "@/lib/products/categories";
import type { Category } from "@/lib/types";

type Row = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  sort_order: number;
  visible: boolean;
};

/** All categories (visible + hidden) for the admin manager, ordered. */
export async function loadAdminCategories(): Promise<Category[]> {
  try {
    const supabase = await createServiceClient();
    const { data, error } = await supabase
      .from("categories")
      .select("id, name, slug, description, image_url, sort_order, visible")
      .order("sort_order");
    if (error || !data) return FALLBACK_CATEGORIES;
    return (data as Row[]).map((r) => ({
      id: r.id,
      name: r.name,
      slug: r.slug,
      description: r.description ?? "",
      image_url: r.image_url ?? null,
      sort_order: r.sort_order,
      visible: r.visible,
    }));
  } catch {
    return FALLBACK_CATEGORIES;
  }
}
