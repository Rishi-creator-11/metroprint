import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import {
  SEED_PRODUCTS,
  getSeedProductBySlug,
  POPULAR_PRODUCT_SLUGS,
} from "@/lib/products/products-data";
import { getStorefrontCategories } from "@/lib/products/categories";
import { withProductPrice } from "@/lib/products/product-prices";
import { normalizePricingRules } from "@/lib/pricing/pricing";
import type { Product } from "@/lib/types";

/** Sort by category → admin sort_order (nulls last) → title. */
function byCategoryThenOrder(a: Product, b: Product): number {
  if (a.category !== b.category) return a.category.localeCompare(b.category);
  const ao = a.sort_order ?? Number.MAX_SAFE_INTEGER;
  const bo = b.sort_order ?? Number.MAX_SAFE_INTEGER;
  if (ao !== bo) return ao - bo;
  return a.title.localeCompare(b.title);
}

const BUSINESS_CARD_IMAGES: Record<string, string> = {
  "business-cards-standard": "https://images.pexels.com/photos/4862950/pexels-photo-4862950.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
  "business-cards-premium-metallic-foil-raised": "https://images.pexels.com/photos/6149103/pexels-photo-6149103.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
  "business-cards-premium-kraft-paper": "https://images.pexels.com/photos/8250871/pexels-photo-8250871.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
  "business-cards-premium-durable": "https://images.pexels.com/photos/8066713/pexels-photo-8066713.png?auto=compress&cs=tinysrgb&h=650&w=940",
  "business-cards-premium-spot-uv-raised": "https://images.pexels.com/photos/5706018/pexels-photo-5706018.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
  "business-cards-premium-soft-touch-suede": "https://images.pexels.com/photos/4862926/pexels-photo-4862926.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
  "business-cards-premium-32pt-painted-edge": "https://images.pexels.com/photos/9878733/pexels-photo-9878733.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
  "business-cards-specialty-fold-over": "https://images.pexels.com/photos/9869077/pexels-photo-9869077.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
  "business-cards-specialty-plastic": "https://images.pexels.com/photos/7821730/pexels-photo-7821730.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
  "business-cards-specialty-magnetic": "https://images.pexels.com/photos/15569097/pexels-photo-15569097.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
};

/**
 * Supabase is authoritative for product content. `enrichProductFromSeed` only
 * fills gaps: a missing/empty field on the DB row falls back to the seed
 * definition, and an empty `options_schema` (no fields) falls back to the seed
 * schema. Everything an admin edits in `/admin/products` therefore shows on the
 * storefront. Products with no DB row are served entirely from the seed
 * elsewhere (`mapSeedToProduct` / `seedFallback`).
 */
function enrichProductFromSeed<
  T extends {
    slug: string;
    category?: string;
    image_url?: string | null;
    options_schema?: Product["options_schema"];
    subcategory?: string | null;
    title?: string;
    description?: string;
    base_price_text?: string;
  },
>(row: T): T {
  const seed = getSeedProductBySlug(row.slug);
  if (!seed) return row;
  const dbHasFields = (row.options_schema?.fields?.length ?? 0) > 0;
  return {
    ...row,
    title: row.title || seed.title,
    description: row.description || seed.description,
    base_price_text: row.base_price_text || seed.base_price_text,
    image_url: row.image_url || seed.image_url,
    options_schema: dbHasFields ? row.options_schema : seed.options_schema,
    category: row.category || seed.category,
    subcategory: row.subcategory ?? seed.subcategory ?? null,
  };
}

function mapSeedToProduct(
  seed: (typeof SEED_PRODUCTS)[number],
  index: number
): Product {
  return withProductPrice({
    ...seed,
    image_url: BUSINESS_CARD_IMAGES[seed.slug] ?? seed.image_url,
    pricing_rules: null,
    sort_order: null,
    featured_rank: null,
    variant_images: {},
    print_specs: {},
    id: `seed-${index}`,
    created_at: new Date().toISOString(),
  }) as Product;
}

const FALLBACK_PRODUCTS: Product[] = SEED_PRODUCTS.map(mapSeedToProduct);

/**
 * @param dbProducts   active DB products to show
 * @param knownSlugs    every slug that exists in the DB (active *or* inactive) —
 *                      a seed fallback is only added for a slug the DB doesn't
 *                      know at all, so deactivating a product actually hides it.
 */
function mergeWithFallback(dbProducts: Product[], knownSlugs: Set<string>): Product[] {
  const missing = FALLBACK_PRODUCTS.filter((p) => !knownSlugs.has(p.slug));
  if (missing.length === 0) return [...dbProducts].sort(byCategoryThenOrder);
  return [...dbProducts, ...missing].sort(byCategoryThenOrder);
}

const SUPABASE_TIMEOUT_MS = 3000;

async function withTimeout<T>(
  promise: PromiseLike<T>,
  ms: number
): Promise<T | null> {
  return Promise.race([
    Promise.resolve(promise),
    new Promise<null>((resolve) => setTimeout(() => resolve(null), ms)),
  ]);
}

export async function getProducts(): Promise<Product[]> {
  if (!isSupabaseConfigured()) {
    return FALLBACK_PRODUCTS;
  }

  try {
    const supabase = await createClient();
    const [result, deactivated] = await Promise.all([
      withTimeout(
        supabase.from("products").select("*").eq("active", true).order("category").order("title"),
        SUPABASE_TIMEOUT_MS,
      ),
      getDeactivatedSlugs(supabase),
    ]);

    if (!result || result.error || !result.data?.length) return FALLBACK_PRODUCTS;

    // A slug is "known" to the DB if it's an active row OR explicitly deactivated —
    // either way its seed fallback must not re-surface it.
    const knownSlugs = new Set<string>([
      ...result.data.map((p) => p.slug as string),
      ...deactivated,
    ]);
    const dbProducts = result.data.map((p) =>
      withProductPrice(
        enrichProductFromSeed({
          ...p,
          price: p.price != null ? Number(p.price) : null,
          pricing_rules: normalizePricingRules(p.pricing_rules),
        })
      )
    ) as Product[];

    return mergeWithFallback(dbProducts, knownSlugs);
  } catch {
    return FALLBACK_PRODUCTS;
  }
}

type AnyClient = Awaited<ReturnType<typeof createClient>>;

/** Slugs of products an admin has deactivated (RLS hides the rows themselves). */
async function getDeactivatedSlugs(supabase: AnyClient): Promise<string[]> {
  try {
    const res = await withTimeout(supabase.rpc("deactivated_product_slugs"), SUPABASE_TIMEOUT_MS);
    if (!res || res.error || !Array.isArray(res.data)) return [];
    return res.data as string[];
  } catch {
    return [];
  }
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const seedFallback = () => {
    const seed = getSeedProductBySlug(slug);
    if (!seed) return null;
    const index = SEED_PRODUCTS.indexOf(seed);
    return mapSeedToProduct(seed, index);
  };

  if (!isSupabaseConfigured()) {
    return seedFallback();
  }

  try {
    const supabase = await createClient();
    const result = await withTimeout(
      supabase
        .from("products")
        .select("*")
        .eq("slug", slug)
        .eq("active", true)
        .maybeSingle(),
      SUPABASE_TIMEOUT_MS
    );

    if (!result || result.error) return seedFallback();
    if (!result.data) {
      // No visible row. If it's an admin-deactivated product, it's gone — don't
      // fall back to seed. Otherwise it was simply never migrated.
      const deactivated = await getDeactivatedSlugs(supabase);
      return deactivated.includes(slug) ? null : seedFallback();
    }
    return withProductPrice(
      enrichProductFromSeed({
        ...result.data,
        price: result.data.price != null ? Number(result.data.price) : null,
        pricing_rules: normalizePricingRules(result.data.pricing_rules),
      })
    ) as Product;
  } catch {
    return seedFallback();
  }
}

export async function getProductsByCategory(
  category: string
): Promise<Product[]> {
  const products = await getProducts();
  return products.filter((p) => p.category === category);
}

export async function getPopularProducts(): Promise<Product[]> {
  const products = await getProducts();

  // Prefer admin-managed featured_rank; fall back to the code constant.
  const featured = products
    .filter((p) => p.featured_rank != null)
    .sort((a, b) => (a.featured_rank as number) - (b.featured_rank as number));
  if (featured.length > 0) return featured;

  return POPULAR_PRODUCT_SLUGS.map((slug) =>
    products.find((p) => p.slug === slug)
  ).filter(Boolean) as Product[];
}

export async function getCategories(): Promise<string[]> {
  const [categories, products] = await Promise.all([
    getStorefrontCategories(),
    getProducts(),
  ]);
  const order = categories.map((c) => c.name);
  const names = new Set<string>(order);
  // Include any category that has active products but no categories row yet.
  for (const p of products) names.add(p.category);
  return [...names].sort(
    (a, b) =>
      (order.indexOf(a) + 1 || 99) - (order.indexOf(b) + 1 || 99),
  );
}

export interface NavCatalogProduct {
  title: string;
  slug: string;
  href: string;
}

export interface NavCatalogCategory {
  name: string;
  href: string;
  products: NavCatalogProduct[];
}

/** Business Cards live under /business-cards/<group>/<slug>; group comes from subcategory. */
const BC_GROUP_BY_SUBCATEGORY: Record<string, string> = {
  Standard: "standard",
  Premium: "premium",
  Custom: "custom",
  Specialty: "custom",
};

function navProductHref(product: Product): string {
  if (product.category === "Business Cards") {
    const group = BC_GROUP_BY_SUBCATEGORY[product.subcategory ?? ""] ?? "standard";
    return `/business-cards/${group}/${product.slug}`;
  }
  return `/products/${product.slug}`;
}

/**
 * The full storefront catalogue grouped by category, for the navbar mega menu.
 * Every shopnable product appears under its category with a working link.
 */
export async function getNavCatalog(): Promise<NavCatalogCategory[]> {
  const [categories, products] = await Promise.all([
    getStorefrontCategories(),
    getProducts(),
  ]);

  const order = categories.map((c) => c.name);
  const byName = new Map<string, NavCatalogCategory>();

  for (const c of categories) {
    byName.set(c.name, {
      name: c.name,
      href: c.href ?? `/products?category=${encodeURIComponent(c.name)}`,
      products: [],
    });
  }

  for (const p of products) {
    let entry = byName.get(p.category);
    if (!entry) {
      // Product in a category with no `categories` row yet — still surface it.
      entry = {
        name: p.category,
        href: `/products?category=${encodeURIComponent(p.category)}`,
        products: [],
      };
      byName.set(p.category, entry);
    }
    entry.products.push({ title: p.title, slug: p.slug, href: navProductHref(p) });
  }

  for (const entry of byName.values()) {
    entry.products.sort((a, b) => a.title.localeCompare(b.title));
  }

  return [...byName.values()].sort(
    (a, b) => (order.indexOf(a.name) + 1 || 99) - (order.indexOf(b.name) + 1 || 99),
  );
}

export async function getBusinessCardsBySubcategory(
  subcategory: string
): Promise<Product[]> {
  // Reuse getProducts() so deactivation + seed-fallback suppression stay consistent.
  const products = await getProducts();
  return products
    .filter((p) => p.category === "Business Cards" && p.subcategory === subcategory)
    .sort((a, b) => a.title.localeCompare(b.title));
}
