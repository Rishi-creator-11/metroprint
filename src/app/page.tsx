import SiteLayout from "@/components/layout/SiteLayout";
import { Button } from "@/components/ui/Button";
import { CategoryCard } from "@/components/products/CategoryCard";
import { ProductCard } from "@/components/products/ProductCard";
import { Logo } from "@/components/layout/Logo";
import { CATEGORIES, HOW_IT_WORKS, CONTACT_INFO } from "@/lib/constants";
import { getPopularProducts } from "@/lib/products";
import { ArrowRight, Mail, Phone } from "lucide-react";
import Link from "next/link";

export default async function HomePage() {
  const popularProducts = await getPopularProducts();

  return (
    <SiteLayout>
      {/* Hero */}
      <section className="bg-surface">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-navy sm:text-4xl lg:text-5xl">
                Custom Printing, Apparel &amp; Marketing Solutions
              </h1>
              <p className="mt-4 text-lg text-muted">
                Business cards, flyers, brochures, apparel, promotional
                products, DTF printing, graphic design and marketing services.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Button href="/products" size="lg">
                  Browse Products
                </Button>
                <Button href="/request-quote" variant="outline" size="lg">
                  Request Quote
                </Button>
              </div>
            </div>
            <div className="flex justify-center rounded-2xl bg-white p-8 shadow-sm lg:p-12">
              <Logo className="scale-110 sm:scale-125" />
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="bg-navy py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-8 text-2xl font-bold text-white sm:text-3xl">
            Browse our top categories
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            {CATEGORIES.map((cat) => (
              <CategoryCard key={cat.name} {...cat} />
            ))}
          </div>
        </div>
      </section>

      {/* Popular Products */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex items-end justify-between">
            <h2 className="text-2xl font-bold text-navy sm:text-3xl">
              Popular products
            </h2>
            <Link
              href="/products"
              className="hidden items-center gap-1 text-sm font-medium text-primary hover:gap-2 sm:inline-flex"
            >
              View all <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {popularProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          <div className="mt-8 text-center sm:hidden">
            <Button href="/products" variant="outline">
              View All Products
            </Button>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-surface py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-10 text-center text-2xl font-bold text-navy sm:text-3xl">
            How it works
          </h2>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {HOW_IT_WORKS.map((step) => (
              <div key={step.step} className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-lg font-bold text-white">
                  {step.step}
                </div>
                <h3 className="font-semibold text-navy">{step.title}</h3>
                <p className="mt-2 text-sm text-muted">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl bg-primary px-6 py-12 text-center text-white sm:px-12">
            <h2 className="text-2xl font-bold sm:text-3xl">
              Ready to get started?
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-white/80">
              Request a free quote today and our team will help bring your
              project to life.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Button
                href="/request-quote"
                variant="secondary"
                size="lg"
                className="bg-white text-primary hover:bg-surface"
              >
                Request a Quote
              </Button>
              <Button
                href="/contact"
                variant="outline"
                size="lg"
                className="border-white text-white hover:bg-white hover:text-primary"
              >
                Contact Us
              </Button>
            </div>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm text-white/70">
              <span className="inline-flex items-center gap-2">
                <Mail size={16} /> {CONTACT_INFO.email}
              </span>
              <span className="inline-flex items-center gap-2">
                <Phone size={16} /> {CONTACT_INFO.phone}
              </span>
            </div>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
