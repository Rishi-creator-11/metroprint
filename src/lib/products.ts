import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import {
  SEED_PRODUCTS,
  getSeedProductBySlug,
  POPULAR_PRODUCT_SLUGS,
} from "@/lib/products-data";
import { withProductPrice } from "@/lib/product-prices";
import type { Product } from "@/lib/types";

const BUSINESS_CARD_IMAGES: Record<string, string> = {
  "bc-standard-matte": "https://images.pexels.com/photos/4862950/pexels-photo-4862950.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
  "bc-standard-uv-gloss": "https://images.pexels.com/photos/5706020/pexels-photo-5706020.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
  "bc-premium-metallic-foil-raised": "https://images.pexels.com/photos/6149103/pexels-photo-6149103.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
  "bc-premium-kraft-paper": "https://images.pexels.com/photos/8250871/pexels-photo-8250871.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
  "bc-premium-durable": "https://images.pexels.com/photos/8066713/pexels-photo-8066713.png?auto=compress&cs=tinysrgb&h=650&w=940",
  "bc-premium-spot-uv-raised": "https://images.pexels.com/photos/5706018/pexels-photo-5706018.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
  "bc-premium-pearl-paper": "https://images.pexels.com/photos/346553/pexels-photo-346553.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
  "bc-premium-die-cut": "https://images.pexels.com/photos/5705980/pexels-photo-5705980.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
  "bc-premium-soft-touch-suede": "https://images.pexels.com/photos/4862926/pexels-photo-4862926.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
  "bc-premium-32pt-painted-edge": "https://images.pexels.com/photos/9878733/pexels-photo-9878733.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
  "bc-premium-ultra-smooth": "https://images.pexels.com/photos/11149812/pexels-photo-11149812.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
  "bc-specialty-fold-over": "https://images.pexels.com/photos/9869077/pexels-photo-9869077.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
  "bc-specialty-plastic": "https://images.pexels.com/photos/7821730/pexels-photo-7821730.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
  "bc-specialty-magnetic": "https://images.pexels.com/photos/15569097/pexels-photo-15569097.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
};

function mapSeedToProduct(
  seed: (typeof SEED_PRODUCTS)[number],
  index: number
): Product {
  const optionsSchema =
    seed.category === "Business Cards"
      ? {
          ...seed.options_schema,
          fields: seed.options_schema.fields.filter(
            (field) => !["stock", "finish"].includes(field.name)
          ),
        }
      : seed.options_schema;

  return withProductPrice({
    ...seed,
    image_url: BUSINESS_CARD_IMAGES[seed.slug] ?? seed.image_url,
    options_schema: optionsSchema,
    id: `seed-${index}`,
    created_at: new Date().toISOString(),
  }) as Product;
}

const FALLBACK_PRODUCTS = SEED_PRODUCTS.map(mapSeedToProduct);

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
    return result.data.map((p) =>
      withProductPrice({
        ...p,
        price: p.price != null ? Number(p.price) : null,
      })
    ) as Product[];
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
  return [...new Set(products.map((p) => p.category))];
}

export async function getBusinessCardsBySubcategory(
  subcategory: string
): Promise<Product[]> {
  if (!isSupabaseConfigured()) {
    return FALLBACK_PRODUCTS.filter(
      (p) => p.category === "Business Cards" && p.subcategory === subcategory
    );
  }

  try {
    const supabase = await createClient();
    const result = await withTimeout(
      supabase
        .from("products")
        .select("*")
        .eq("active", true)
        .eq("category", "Business Cards")
        .eq("subcategory", subcategory)
        .order("title"),
      SUPABASE_TIMEOUT_MS
    );

    if (!result || result.error || !result.data?.length) {
      return FALLBACK_PRODUCTS.filter(
        (p) => p.category === "Business Cards" && p.subcategory === subcategory
      );
    }
    return result.data.map((p) =>
      withProductPrice({
        ...p,
        price: p.price != null ? Number(p.price) : null,
      })
    ) as Product[];
  } catch {
    return FALLBACK_PRODUCTS.filter(
      (p) => p.category === "Business Cards" && p.subcategory === subcategory
    );
  }
}
