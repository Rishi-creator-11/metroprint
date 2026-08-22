import SiteLayout from "@/components/layout/SiteLayout";
import { ProductAddToCart } from "@/components/products/ProductAddToCart";
import { getProductBySlug } from "@/lib/products";
import { formatPrice, getProductDisplayPrice } from "@/lib/product-prices";
import Image from "next/image";
import { notFound } from "next/navigation";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Product Not Found" };
  return {
    title: `${product.title} — MetroPrint USA`,
    description: product.description,
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) notFound();

  const displayPrice = getProductDisplayPrice(
    product.slug,
    product.price,
    product.pricing_rules,
    { category: product.category, optionsSchema: product.options_schema }
  );

  return (
    <SiteLayout>
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
          <div>
            <p className="text-sm font-medium uppercase tracking-wide text-primary">
              {product.category}
            </p>
            <h1 className="mt-2 text-3xl font-bold text-navy">{product.title}</h1>
            <p className="mt-3 text-sm font-medium uppercase tracking-wide text-muted">
              From
            </p>
            <p className="text-3xl font-bold text-primary">
              {formatPrice(displayPrice)}
            </p>
            <p className="mt-4 text-muted">{product.description}</p>

            <div className="relative mt-8 aspect-[4/3] overflow-hidden rounded-xl bg-surface">
              {product.image_url && (
                <Image
                  src={product.image_url}
                  alt={product.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority
                />
              )}
            </div>
          </div>

          <ProductAddToCart product={product} />
        </div>
      </div>
    </SiteLayout>
  );
}
