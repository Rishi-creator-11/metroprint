import Link from "next/link";
import { ChevronRight } from "lucide-react";
import SiteLayout from "@/components/layout/SiteLayout";
import { ProductCard } from "@/components/products/ProductCard";
import { Reveal } from "@/components/ui/Reveal";
import { getBusinessCardsBySubcategory } from "@/lib/products/products";
import { notFound } from "next/navigation";

const GROUPS: Record<string, { title: string; subcategory: string; description: string }> = {
  standard: {
    title: "Standard Business Cards",
    subcategory: "Standard",
    description: "Professional business cards with classic matte and high-shine UV gloss finishes.",
  },
  premium: {
    title: "Premium Business Cards",
    subcategory: "Premium",
    description:
      "Elevated finishes and materials — metallic foil, kraft paper, spot UV, soft touch, painted edge and more.",
  },
  custom: {
    title: "Custom Business Cards",
    subcategory: "Custom",
    description: "Unique formats that make an unforgettable impression — fold-over, plastic and magnetic.",
  },
};

export async function generateMetadata({ params }: { params: Promise<{ group: string }> }) {
  const { group } = await params;
  const config = GROUPS[group];
  if (!config) return { title: "Not Found" };
  return { title: config.title, description: config.description };
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
      <section className="border-b border-border bg-gradient-to-b from-surface to-white">
        <div className="mp-container py-10 sm:py-12">
          <nav className="mb-4 flex items-center gap-1 text-sm text-muted">
            <Link href="/" className="hover:text-primary">Home</Link>
            <ChevronRight size={14} />
            <Link href="/business-cards" className="hover:text-primary">Business Cards</Link>
            <ChevronRight size={14} />
            <span className="font-medium text-navy">{config.title}</span>
          </nav>
          <h1 className="text-3xl font-extrabold tracking-tight text-navy sm:text-4xl">{config.title}</h1>
          <p className="mt-2 max-w-2xl text-muted">{config.description}</p>
          <p className="mt-3 text-sm font-medium text-muted">
            {products.length} product{products.length === 1 ? "" : "s"}
          </p>
        </div>
      </section>

      <div className="mp-container py-10">
        {products.length === 0 ? (
          <p className="text-muted">No products in this line yet.</p>
        ) : (
          <Reveal className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                href={`/business-cards/${group}/${product.slug}`}
              />
            ))}
          </Reveal>
        )}
      </div>
    </SiteLayout>
  );
}
