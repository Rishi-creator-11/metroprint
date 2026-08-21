import SiteLayout from "@/components/layout/SiteLayout";
import { CategoryCard } from "@/components/products/CategoryCard";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

export const metadata = {
  title: "Business Cards — MetroPrint USA",
  description:
    "Premium business cards in standard, premium, and custom finishes. Matte, UV gloss, metallic foil, kraft paper, plastic, magnetic, and more.",
};

const BUSINESS_CARD_GROUPS = [
  {
    name: "Standard Business Cards",
    slug: "standard",
    description:
      "Classic matte and UV gloss finishes — professional quality at great value.",
    image:
      "https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=600&h=400&fit=crop",
  },
  {
    name: "Premium Business Cards",
    slug: "premium",
    description:
      "Metallic foil, kraft paper, spot UV, soft touch, painted edge & more.",
    image:
      "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=600&h=400&fit=crop",
  },
  {
    name: "Custom Business Cards",
    slug: "custom",
    description:
      "Fold over, plastic, and magnetic cards for a truly unique impression.",
    image:
      "https://images.unsplash.com/photo-1572025442646-866d16c84a54?w=600&h=400&fit=crop",
  },
];

export default function BusinessCardsPage() {
  return (
    <SiteLayout>
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <nav className="mb-6 flex items-center gap-1 text-sm text-muted">
          <Link href="/" className="hover:text-primary">
            Home
          </Link>
          <ChevronRight size={14} />
          <span className="font-medium text-navy">Business Cards</span>
        </nav>

        <div className="mb-10">
          <h1 className="text-3xl font-bold text-navy">Business Cards</h1>
          <p className="mt-2 text-muted">
            Make a lasting first impression with our full range of business
            cards. From classic matte and gloss to premium finishes and custom
            materials.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {BUSINESS_CARD_GROUPS.map((group) => (
            <CategoryCard
              key={group.slug}
              name={group.name}
              description={group.description}
              image={group.image}
              href={`/business-cards/${group.slug}`}
            />
          ))}
        </div>
      </div>
    </SiteLayout>
  );
}
