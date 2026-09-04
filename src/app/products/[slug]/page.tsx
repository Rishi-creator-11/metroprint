import Link from "next/link";
import { ChevronRight } from "lucide-react";
import SiteLayout from "@/components/layout/SiteLayout";
import { ProductConfigurator } from "@/components/products/ProductConfigurator";
import { getProductBySlug } from "@/lib/products/products";
import { notFound } from "next/navigation";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Product Not Found" };
  return { title: product.title, description: product.description };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const categoryHref = `/products?category=${encodeURIComponent(product.category)}`;

  return (
    <SiteLayout>
      <div className="mp-container py-8 pb-28 sm:py-12 lg:pb-12">
        <nav className="mb-6 flex items-center gap-1 text-sm text-muted">
          <Link href="/" className="hover:text-primary">Home</Link>
          <ChevronRight size={14} />
          <Link href="/products" className="hover:text-primary">Products</Link>
          <ChevronRight size={14} />
          <Link href={categoryHref} className="hover:text-primary">{product.category}</Link>
          <ChevronRight size={14} />
          <span className="truncate font-medium text-navy">{product.title}</span>
        </nav>

        <ProductConfigurator product={product} eyebrow={product.category} />
      </div>
    </SiteLayout>
  );
}
