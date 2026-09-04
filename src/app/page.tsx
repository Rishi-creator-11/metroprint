import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Mail, Phone, ShieldCheck, Zap, Palette, Truck } from "lucide-react";
import SiteLayout from "@/components/layout/SiteLayout";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { CategoryCard } from "@/components/products/CategoryCard";
import { ProductCard } from "@/components/products/ProductCard";
import { Faq } from "@/components/home/Faq";
import { getPopularProducts, getProducts } from "@/lib/products/products";
import { getStorefrontCategories } from "@/lib/products/categories";
import {
  HOW_IT_WORKS,
  WHY_METROPRINT,
  TRUST_POINTS,
  CONTACT_INFO,
} from "@/lib/constants";

export default async function HomePage() {
  const [popular, categories, allProducts] = await Promise.all([
    getPopularProducts(),
    getStorefrontCategories(),
    getProducts(),
  ]);

  const activeByCategory: Record<string, number> = {};
  for (const p of allProducts) activeByCategory[p.category] = (activeByCategory[p.category] ?? 0) + 1;

  const marketingServices = allProducts.filter((p) => p.category === "Marketing Services").slice(0, 5);
  const heroTiles = popular.slice(0, 3);

  const TRUST_ICONS = [ShieldCheck, Zap, Palette, Truck];

  return (
    <SiteLayout>
      {/* ---------- HERO ---------- */}
      <section className="hero-grid-bg">
        <div className="mp-container grid items-center gap-12 py-14 sm:py-20 lg:grid-cols-[1.05fr_0.95fr] lg:py-24">
          <div className="animate-fade-up">
            <Badge tone="accent">Print · Apparel · Signage · Marketing</Badge>
            <h1 className="font-display mt-4 text-4xl font-semibold leading-[1.08] tracking-tight text-navy sm:text-5xl lg:text-[3.4rem]">
              Everything you print, wear, and hand out — one partner, one order.
            </h1>
            <p className="mt-5 max-w-xl text-lg text-muted">
              Business cards, signs, apparel and promo products with upfront pricing,
              plus the marketing support to put them to work.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button href="/products" size="lg">
                Shop products <ArrowRight size={18} />
              </Button>
              <Button href="/request-quote" variant="secondary" size="lg">
                Request a custom quote
              </Button>
            </div>
          </div>

          <div className="animate-scale-in grid grid-cols-2 gap-4">
            {heroTiles.map((p, i) => (
              <Link
                key={p.id}
                href={`/products/${p.slug}`}
                className={`card-hover relative overflow-hidden rounded-2xl border border-border bg-white shadow-md ${
                  i === 0 ? "col-span-2 aspect-[16/10]" : "aspect-square"
                }`}
              >
                {p.image_url && (
                  <Image
                    src={p.image_url}
                    alt={p.title}
                    fill
                    className={p.category === "Large Format" ? "object-contain p-4" : "object-cover"}
                    sizes="(max-width: 1024px) 50vw, 25vw"
                  />
                )}
                <span className="absolute bottom-2 left-2 rounded-lg bg-white/90 px-2 py-1 text-xs font-semibold text-navy">
                  {p.title}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- TRUST STRIP ---------- */}
      <section className="border-y border-border bg-white">
        <div className="mp-container">
          <ul className="grid grid-cols-2 divide-x divide-y divide-border sm:grid-cols-4 sm:divide-y-0">
            {TRUST_POINTS.map((t, i) => {
              const Icon = TRUST_ICONS[i] ?? ShieldCheck;
              return (
                <li key={t} className="flex items-center gap-2.5 px-4 py-4 text-sm font-medium text-navy sm:justify-center">
                  <Icon size={18} className="shrink-0 text-primary" aria-hidden="true" />
                  <span>{t}</span>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* ---------- POPULAR PRODUCTS ---------- */}
      <section className="mp-container py-16 sm:py-20">
        <Reveal className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <SectionHeading eyebrow="Best sellers" title="Popular products" subtitle="What businesses order from us most." />
          <Link href="/products" className="hidden items-center gap-1 text-sm font-semibold text-primary hover:gap-2 sm:inline-flex">
            View all <ArrowRight size={14} />
          </Link>
        </Reveal>
        <Reveal className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6" delay={60}>
          {popular.slice(0, 6).map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </Reveal>
      </section>

      {/* ---------- SHOP BY CATEGORY ---------- */}
      <section className="bg-navy py-16 text-white sm:py-20">
        <div className="mp-container">
          <Reveal>
            <SectionHeading eyebrow="Catalog" title="Shop by category" tone="dark" />
          </Reveal>
          <Reveal className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3" delay={60}>
            {categories.map((c) => (
              <CategoryCard
                key={c.id}
                name={c.name}
                description={c.description}
                image={c.image_url ?? ""}
                href={c.href}
                count={activeByCategory[c.name]}
              />
            ))}
          </Reveal>
        </div>
      </section>

      {/* ---------- HOW IT WORKS ---------- */}
      <section className="bg-surface py-16 sm:py-20">
        <div className="mp-container">
          <Reveal>
            <SectionHeading eyebrow="Simple process" title="How it works" align="center" />
          </Reveal>
          <Reveal className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4" delay={60}>
            {HOW_IT_WORKS.map((step) => (
              <div key={step.step} className="print-mark relative rounded-2xl border border-border bg-white p-6">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-lg font-bold text-white">
                  {step.step}
                </span>
                <h3 className="mt-4 font-bold text-navy">{step.title}</h3>
                <p className="mt-1.5 text-sm text-muted">{step.description}</p>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      {/* ---------- WHY METROPRINT ---------- */}
      <section className="mp-container py-16 sm:py-20">
        <Reveal>
          <SectionHeading eyebrow="Why us" title="A print partner built for business" align="center" />
        </Reveal>
        <Reveal className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3" delay={60}>
          {WHY_METROPRINT.map((item) => (
            <div key={item.title} className="rounded-2xl border border-border bg-white p-6">
              <div className="text-2xl">{item.icon}</div>
              <h3 className="mt-3 font-bold text-navy">{item.title}</h3>
              <p className="mt-1.5 text-sm text-muted">{item.description}</p>
            </div>
          ))}
        </Reveal>
      </section>

      {/* ---------- MARKETING SERVICES ---------- */}
      <section className="mp-container py-16 sm:py-20">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <Reveal>
            <SectionHeading
              eyebrow="Beyond printing"
              title="We do your marketing too"
              subtitle="MetroPrint Marketing is a full creative partner — branding, design, social media, content and video, alongside everything we print."
            />
            <div className="mt-6 flex flex-wrap gap-3">
              <Button href="/products?category=Marketing%20Services">Explore services</Button>
              <Button href="/request-quote" variant="secondary">Talk to our team</Button>
            </div>
          </Reveal>
          <Reveal className="grid gap-3 sm:grid-cols-2" delay={60}>
            {marketingServices.map((p) => (
              <Link
                key={p.id}
                href={`/products/${p.slug}`}
                className="card-hover rounded-2xl border border-border bg-white p-5"
              >
                <h3 className="font-semibold text-navy">{p.title}</h3>
                <p className="mt-1 line-clamp-2 text-sm text-muted">{p.description}</p>
                <p className="mt-3 text-xs font-semibold text-primary">{p.base_price_text}</p>
              </Link>
            ))}
          </Reveal>
        </div>
      </section>

      {/* ---------- QUOTE CTA ---------- */}
      <section className="mp-container pb-4">
        <Reveal className="overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-primary-dark px-6 py-14 text-center text-white sm:px-12">
          <h2 className="font-display text-2xl font-semibold sm:text-3xl">Have a bigger project?</h2>
          <p className="mx-auto mt-3 max-w-xl text-white/80">
            Bulk orders, custom sizes, multi-item brand kits, ongoing marketing — tell us what
            you need and we&apos;ll send a tailored quote.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button href="/request-quote" size="lg" className="bg-white text-primary hover:bg-surface">
              Request a quote
            </Button>
            <Button href="/contact" size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-primary">
              Contact us
            </Button>
          </div>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm text-white/70">
            <span className="inline-flex items-center gap-2"><Mail size={16} /> {CONTACT_INFO.email}</span>
            {CONTACT_INFO.phone && (
              <span className="inline-flex items-center gap-2"><Phone size={16} /> {CONTACT_INFO.phone}</span>
            )}
          </div>
        </Reveal>
      </section>

      {/* ---------- FAQ ---------- */}
      <section className="mp-container py-16 sm:py-20">
        <Reveal>
          <SectionHeading eyebrow="Questions" title="Frequently asked" align="center" />
        </Reveal>
        <Reveal className="mt-10" delay={60}>
          <Faq />
        </Reveal>
      </section>

      {/* ---------- FINAL CTA ---------- */}
      <section className="bg-navy py-16 text-center text-white sm:py-20">
        <div className="mp-container">
          <h2 className="font-display text-2xl font-semibold sm:text-3xl">Ready to print something great?</h2>
          <p className="mx-auto mt-3 max-w-lg text-white/70">
            Browse the catalog, configure your order, and check out securely in minutes.
          </p>
          <div className="mt-8">
            <Button href="/products" size="lg" className="bg-accent text-navy hover:bg-accent/90">
              Start an order <ArrowRight size={18} />
            </Button>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
