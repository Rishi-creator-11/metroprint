import SiteLayout from "@/components/layout/SiteLayout";
import { ProductAddToCart } from "@/components/products/ProductAddToCart";
import { getProductBySlug } from "@/lib/products";
import { formatPrice } from "@/lib/product-prices";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { notFound } from "next/navigation";

const GROUP_LABELS: Record<string, string> = {
  standard: "Standard Business Cards",
  premium: "Premium Business Cards",
  custom: "Custom Business Cards",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ group: string; slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Product Not Found" };
  return {
    title: `${product.title} — MetroPrint USA`,
    description: product.description,
  };
}

export default async function BusinessCardProductPage({
  params,
}: {
  params: Promise<{ group: string; slug: string }>;
}) {
  const { group, slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) notFound();

  const groupLabel = GROUP_LABELS[group] ?? "Business Cards";

  return (
    <SiteLayout>
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <nav className="mb-6 flex items-center gap-1 text-sm text-muted">
          <Link href="/" className="hover:text-primary">
            Home
          </Link>
          <ChevronRight size={14} />
          <Link href="/business-cards" className="hover:text-primary">
            Business Cards
          </Link>
          <ChevronRight size={14} />
          <Link href={`/business-cards/${group}`} className="hover:text-primary">
            {groupLabel}
          </Link>
          <ChevronRight size={14} />
          <span className="font-medium text-navy">{product.title}</span>
        </nav>

        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
          <div>
            <p className="text-sm font-medium uppercase tracking-wide text-primary">
              {groupLabel}
            </p>
            <h1 className="mt-2 text-3xl font-bold text-navy">
              {product.title}
            </h1>
            {product.price > 0 && (
              <p className="mt-3 text-3xl font-bold text-primary">
                {formatPrice(product.price)}
              </p>
            )}
            {product.base_price_text &&
              product.base_price_text !== "Contact for pricing" && (
                <p className="mt-1 text-sm text-muted">
                  {product.base_price_text}
                </p>
              )}
            <p className="mt-4 text-muted">{product.description}</p>

            <div className="relative mt-8 aspect-[4/3] overflow-hidden rounded-xl bg-surface">
              {product.image_url ? (
                <Image
                  src={product.image_url}
                  alt={product.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority
                />
              ) : (
                <div className="flex h-full items-center justify-center text-muted">
                  <span className="text-lg">Product image coming soon</span>
                </div>
              )}
            </div>
          </div>

          <ProductAddToCart product={product} />
        </div>
      </div>
    </SiteLayout>
  );
}
