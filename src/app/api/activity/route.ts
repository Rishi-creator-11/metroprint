import { NextResponse } from "next/server";
import { getProducts } from "@/lib/products/products";

/**
 * Demo social-proof activity. Built from real active products so names + images
 * stay correct. Swap the generator for anonymised paid-order data later.
 */
const NAMES = ["Ava", "Liam", "Maya", "Noah", "Sophia", "Ethan", "Olivia", "Mason", "Isla", "Leo"];
const SEED_EVENTS: { slug: string; qty: string }[] = [
  { slug: "business-cards-standard", qty: "500" },
  { slug: "custom-t-shirt-printing", qty: "24" },
  { slug: "roll-up-banners", qty: "2" },
  { slug: "postcards", qty: "250" },
  { slug: "custom-hoodie-printing", qty: "12" },
  { slug: "flyers", qty: "500" },
  { slug: "coroplast-signs", qty: "10" },
  { slug: "brochures", qty: "250" },
];

export const revalidate = 300;

export async function GET() {
  const products = await getProducts();
  const bySlug = new Map(products.map((p) => [p.slug, p]));

  const events = SEED_EVENTS.map((e, i) => {
    const p = bySlug.get(e.slug);
    if (!p) return null;
    return {
      id: i,
      name: NAMES[i % NAMES.length],
      qty: e.qty,
      product: p.title,
      slug: p.slug,
      image: p.image_url ?? null,
    };
  }).filter(Boolean);

  return NextResponse.json({ events, demo: true });
}
