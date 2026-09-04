import Link from "next/link";
import { ChevronRight } from "lucide-react";
import SiteLayout from "@/components/layout/SiteLayout";
import { CategoryCard } from "@/components/products/CategoryCard";
import { Reveal } from "@/components/ui/Reveal";
import { getBusinessCardsBySubcategory } from "@/lib/products/products";

export const metadata = {
  title: "Business Cards",
  description:
    "Standard, premium and specialty business cards — matte, UV gloss, metallic foil, kraft, soft-touch, spot UV, painted edge, plastic, magnetic and fold-over.",
};

const GROUPS = [
  {
    name: "Standard Business Cards",
    slug: "standard",
    subcategory: "Standard",
    description: "Classic matte and UV gloss finishes — professional quality at great value.",
    image: "https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=600&h=400&fit=crop",
  },
  {
    name: "Premium Business Cards",
    slug: "premium",
    subcategory: "Premium",
    description: "Metallic foil, kraft paper, spot UV, soft touch, painted edge & more.",
    image: "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=600&h=400&fit=crop",
  },
  {
    name: "Custom Business Cards",
    slug: "custom",
    subcategory: "Custom",
    description: "Fold-over, plastic and magnetic cards for a truly unique impression.",
    image: "https://images.unsplash.com/photo-1572025442646-866d16c84a54?w=600&h=400&fit=crop",
  },
];

export default async function BusinessCardsPage() {
  const counts = await Promise.all(GROUPS.map((g) => getBusinessCardsBySubcategory(g.subcategory)));

  return (
    <SiteLayout>
      <section className="border-b border-border bg-gradient-to-b from-surface to-white">
        <div className="mp-container py-10 sm:py-14">
          <nav className="mb-4 flex items-center gap-1 text-sm text-muted">
            <Link href="/" className="hover:text-primary">Home</Link>
            <ChevronRight size={14} />
            <span className="font-medium text-navy">Business Cards</span>
          </nav>
          <h1 className="text-3xl font-extrabold tracking-tight text-navy sm:text-4xl">Business Cards</h1>
          <p className="mt-2 max-w-2xl text-muted">
            Make a lasting first impression — from classic matte and gloss to premium finishes and
            specialty materials, all with per-option pricing you can see before you order.
          </p>
        </div>
      </section>

      <div className="mp-container py-10 sm:py-14">
        <Reveal className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {GROUPS.map((group, i) => (
            <CategoryCard
              key={group.slug}
              name={group.name}
              description={group.description}
              image={group.image}
              href={`/business-cards/${group.slug}`}
              count={counts[i].length}
            />
          ))}
        </Reveal>
      </div>
    </SiteLayout>
  );
}
