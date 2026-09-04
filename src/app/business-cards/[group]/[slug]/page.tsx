import SiteLayout from "@/components/layout/SiteLayout";
import { ProductConfigurator } from "@/components/products/ProductConfigurator";
import { getProductBySlug } from "@/lib/products/products";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { notFound } from "next/navigation";

const GROUP_LABELS: Record<string, string> = {
  standard: "Standard Business Cards",
  premium: "Premium Business Cards",
  custom: "Specialty Business Cards",
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
    title: product.title,
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
      <div className="mx-auto max-w-7xl px-4 py-12 pb-28 sm:px-6 lg:px-8 lg:pb-12">
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

        <ProductConfigurator product={product} eyebrow={groupLabel} />
      </div>
    </SiteLayout>
  );
}
