import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import {
  SEED_PRODUCTS,
  getSeedProductBySlug,
  POPULAR_PRODUCT_SLUGS,
} from "@/lib/products-data";
import { CATEGORIES } from "@/lib/constants";
import { withProductPrice } from "@/lib/product-prices";
import type { Product } from "@/lib/types";

function mapSeedToProduct(
  seed: (typeof SEED_PRODUCTS)[number],
  index: number
): Product {
  return withProductPrice({
    ...seed,
    id: `seed-${index}`,
    created_at: new Date().toISOString(),
  }) as Product;
}

const FALLBACK_PRODUCTS = SEED_PRODUCTS.map(mapSeedToProduct);

function mergeWithFallback(dbProducts: Product[]): Product[] {
  const dbSlugs = new Set(dbProducts.map((p) => p.slug));
  const missing = FALLBACK_PRODUCTS.filter((p) => !dbSlugs.has(p.slug));
  if (missing.length === 0) return dbProducts;

  return [...dbProducts, ...missing].sort((a, b) => {
    const cat = a.category.localeCompare(b.category);
    return cat !== 0 ? cat : a.title.localeCompare(b.title);
  });
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
    const result = await withTimeout(
      supabase
        .from("products")
        .select("*")
        .eq("active", true)
        .order("category")
        .order("title"),
      SUPABASE_TIMEOUT_MS
    );

    if (!result || result.error || !result.data?.length) return FALLBACK_PRODUCTS;

    const dbProducts = result.data.map((p) =>
      withProductPrice({
        ...p,
        price: p.price != null ? Number(p.price) : null,
      })
    ) as Product[];

    return mergeWithFallback(dbProducts);
  } catch {
    return FALLBACK_PRODUCTS;
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
        .single(),
      SUPABASE_TIMEOUT_MS
    );

    if (!result || result.error || !result.data) return seedFallback();
    return withProductPrice({
      ...result.data,
      price: result.data.price != null ? Number(result.data.price) : null,
    }) as Product;
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
  return POPULAR_PRODUCT_SLUGS.map((slug) =>
    products.find((p) => p.slug === slug)
  ).filter(Boolean) as Product[];
}

export async function getCategories(): Promise<string[]> {
  const products = await getProducts();
  const names = new Set(products.map((p) => p.category));
  for (const cat of CATEGORIES) {
    names.add(cat.name);
  }
  const order = CATEGORIES.map((c) => c.name);
  return [...names].sort(
    (a, b) =>
      (order.indexOf(a as (typeof order)[number]) + 1 || 99) -
      (order.indexOf(b as (typeof order)[number]) + 1 || 99)
  );
}
