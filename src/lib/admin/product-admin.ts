import { createServiceClient } from "@/lib/supabase/server";
import { SEED_PRODUCTS } from "@/lib/products/products-data";
import { getProductPrice } from "@/lib/products/product-prices";
import { normalizePricingRules } from "@/lib/pricing/pricing";
import { SEED_PRODUCT_ID_PREFIX } from "@/lib/pricing/admin-pricing-catalog";
import type {
  OptionsSchema,
  ProductCategory,
  ProductPricingRules,
} from "@/lib/types";

/** One row in the admin Product Manager. `source` says where it came from. */
export interface AdminProduct {
  id: string; // real uuid, or `seed:<slug>` for a definition not yet in the DB
  source: "db" | "seed";
  title: string;
  slug: string;
  category: ProductCategory;
  subcategory: string | null;
  description: string;
  base_price_text: string;
  image_url: string | null;
  price: number;
  active: boolean;
  sort_order: number | null;
  featured_rank: number | null;
  options_schema: OptionsSchema;
  variant_images: Record<string, string>;
  print_specs: Record<string, unknown>;
  pricing_rules: ProductPricingRules | null;
  created_at: string | null;
}

type DbRow = {
  id: string;
  title: string;
  slug: string;
  category: string;
  subcategory: string | null;
  description: string | null;
  base_price_text: string | null;
  image_url: string | null;
  price: number | null;
  active: boolean;
  sort_order: number | null;
  featured_rank: number | null;
  options_schema: OptionsSchema | null;
  variant_images: Record<string, string> | null;
  print_specs: Record<string, unknown> | null;
  pricing_rules: unknown;
  created_at: string | null;
};

function fromDbRow(row: DbRow): AdminProduct {
  return {
    id: row.id,
    source: "db",
    title: row.title,
    slug: row.slug,
    category: row.category as ProductCategory,
    subcategory: row.subcategory ?? null,
    description: row.description ?? "",
    base_price_text: row.base_price_text ?? "",
    image_url: row.image_url ?? null,
    price: getProductPrice(row.slug, row.price != null ? Number(row.price) : null),
    active: row.active,
    sort_order: row.sort_order ?? null,
    featured_rank: row.featured_rank ?? null,
    options_schema: row.options_schema ?? { fields: [] },
    variant_images: row.variant_images ?? {},
    print_specs: row.print_specs ?? {},
    pricing_rules: normalizePricingRules(row.pricing_rules),
    created_at: row.created_at ?? null,
  };
}

function fromSeed(seed: (typeof SEED_PRODUCTS)[number]): AdminProduct {
  return {
    id: `${SEED_PRODUCT_ID_PREFIX}${seed.slug}`,
    source: "seed",
    title: seed.title,
    slug: seed.slug,
    category: seed.category as ProductCategory,
    subcategory: seed.subcategory ?? null,
    description: seed.description ?? "",
    base_price_text: seed.base_price_text ?? "",
    image_url: seed.image_url ?? null,
    price: getProductPrice(seed.slug, null),
    active: seed.active ?? true,
    sort_order: null,
    featured_rank: null,
    options_schema: seed.options_schema,
    variant_images: {},
    print_specs: {},
    pricing_rules: null,
    created_at: null,
  };
}

/**
 * Every product an admin can manage: all DB rows (active + inactive) plus every
 * seed definition that has never been written to the DB. Sorted by category then
 * title, inactive last within a category.
 */
export async function loadAllAdminProducts(): Promise<AdminProduct[]> {
  const supabase = await createServiceClient();
  const { data } = await supabase
    .from("products")
    .select(
      "id, title, slug, category, subcategory, description, base_price_text, image_url, price, active, sort_order, featured_rank, options_schema, pricing_rules, variant_images, print_specs, created_at",
    )
    .order("category")
    .order("title");

  const dbProducts = (data ?? []).map((row) => fromDbRow(row as DbRow));
  const dbSlugs = new Set(dbProducts.map((p) => p.slug));

  const seedOnly = SEED_PRODUCTS.filter((s) => !dbSlugs.has(s.slug)).map(fromSeed);

  return [...dbProducts, ...seedOnly].sort((a, b) => {
    if (a.category !== b.category) return a.category.localeCompare(b.category);
    if (a.active !== b.active) return a.active ? -1 : 1;
    const ao = a.sort_order ?? Number.MAX_SAFE_INTEGER;
    const bo = b.sort_order ?? Number.MAX_SAFE_INTEGER;
    if (ao !== bo) return ao - bo;
    return a.title.localeCompare(b.title);
  });
}

/** Products currently featured on the homepage, in display order. */
export async function loadFeaturedProducts(): Promise<AdminProduct[]> {
  return (await loadAllAdminProducts())
    .filter((p) => p.featured_rank != null)
    .sort((a, b) => (a.featured_rank as number) - (b.featured_rank as number));
}
