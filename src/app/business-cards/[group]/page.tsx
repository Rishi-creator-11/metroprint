import SiteLayout from "@/components/layout/SiteLayout";
import { ProductCard } from "@/components/products/ProductCard";
import { getBusinessCardsBySubcategory } from "@/lib/products";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { notFound } from "next/navigation";

const GROUPS: Record<
  string,
  { title: string; subcategory: string; description: string }
> = {
  standard: {
    title: "Standard Business Cards",
    subcategory: "Standard",
    description:
      "Professional business cards with classic matte and high-shine UV gloss finishes.",
  },
  premium: {
    title: "Premium Business Cards",
    subcategory: "Premium",
    description:
      "Elevated finishes and materials — metallic foil, kraft paper, spot UV, pearl, die cut, soft touch, painted edge, and more.",
  },
  specialty: {
    title: "Specialty Business Cards",
    subcategory: "Specialty",
    description:
      "Unique formats that make an unforgettable impression — fold over, plastic, and magnetic cards.",
  },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ group: string }>;
}) {
  const { group } = await params;
  const config = GROUPS[group];
  if (!config) return { title: "Not Found" };
  return {
    title: `${config.title} — MetroPrint USA`,
    description: config.description,
  };
}

export default async function BusinessCardsGroupPage({
  params,
}: {
  params: Promise<{ group: string }>;
}) {
  const { group } = await params;
  const config = GROUPS[group];

  if (!config) notFound();

  const products = await getBusinessCardsBySubcategory(config.subcategory);

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
          <span className="font-medium text-navy">{config.title}</span>
        </nav>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-navy">{config.title}</h1>
          <p className="mt-2 text-muted">{config.description}</p>
        </div>

        {products.length === 0 ? (
          <p className="text-muted">No products found in this category.</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                href={`/business-cards/${group}/${product.slug}`}
              />
            ))}
          </div>
        )}
      </div>
    </SiteLayout>
  );
}
