import type { ProductCategory } from "@/lib/types";

export const SITE_NAME = "MetroPrint Marketing";
export const SITE_TAGLINE = "Printing, apparel & marketing that grows your business";

export const NAV_LINKS = [
  { href: "/request-quote", label: "Request Quote" },
  { href: "/contact", label: "Contact" },
] as const;

/**
 * Fallback category list — the storefront prefers the managed `categories` table
 * (`getStorefrontCategories`). Order/visibility here is only used when Supabase
 * is unavailable.
 */
export const CATEGORIES: {
  name: ProductCategory;
  slug: string;
  description: string;
  image: string;
  href?: string;
}[] = [
  {
    name: "Business Cards",
    slug: "business-cards",
    description: "Standard, premium & specialty cards that make a first impression.",
    image:
      "https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=600&h=400&fit=crop",
    href: "/business-cards",
  },
  {
    name: "Print Materials",
    slug: "print-materials",
    description: "Flyers, brochures, postcards, bookmarks, folders & more.",
    image:
      "https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=600&h=400&fit=crop",
  },
  {
    name: "Large Format",
    slug: "large-format",
    description: "Signs, banners, yard signs, canvas & wide-format displays.",
    image: "/images/products/large-format/roll-up-banners.png",
  },
  {
    name: "Apparel",
    slug: "apparel",
    description: "Custom t-shirts, polos, hoodies, hats & tote bags.",
    image:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=400&fit=crop",
  },
  {
    name: "Marketing Services",
    slug: "marketing-services",
    description: "Branding, graphic design, social media, content & video.",
    image:
      "https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&h=400&fit=crop",
  },
  {
    name: "Promotional Products",
    slug: "promotional-products",
    description: "Mugs, tumblers & branded merchandise your customers keep.",
    image:
      "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=600&h=400&fit=crop",
  },
];

/** Short blurb + emoji per category, keyed by name — used in the mega menu. */
export const CATEGORY_BLURBS: Record<string, { icon: string; blurb: string }> = {
  "Business Cards": { icon: "🪪", blurb: "Standard, premium & specialty" },
  "Print Materials": { icon: "📄", blurb: "Flyers, brochures, postcards" },
  "Large Format": { icon: "🪧", blurb: "Banners, signs & displays" },
  Apparel: { icon: "👕", blurb: "Shirts, hoodies, hats & bags" },
  "Marketing Services": { icon: "🚀", blurb: "Branding, design & social" },
  "Promotional Products": { icon: "🎁", blurb: "Mugs, tumblers & swag" },
};

export const ACCEPTED_FILE_TYPES = [
  ".pdf",
  ".png",
  ".jpg",
  ".jpeg",
  ".ai",
  ".psd",
  ".eps",
  ".svg",
];

export const ACCEPTED_MIME_TYPES = [
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/svg+xml",
  "application/postscript",
  "application/illustrator",
  "application/vnd.adobe.photoshop",
  "application/octet-stream",
];

export const HOW_IT_WORKS = [
  {
    step: 1,
    title: "Choose a product",
    description: "Browse the catalog with clear, upfront pricing.",
  },
  {
    step: 2,
    title: "Customize it",
    description: "Pick size, quantity, stock, colour and finish — see the price update live.",
  },
  {
    step: 3,
    title: "Upload artwork",
    description: "Send us your files or add design help right in the cart.",
  },
  {
    step: 4,
    title: "We print & deliver",
    description: "Fast turnaround, quality checks, shipped nationwide.",
  },
];

export const WHY_METROPRINT = [
  { icon: "✨", title: "Premium print quality", description: "Commercial presses, tight colour control, and a proof step on every order." },
  { icon: "⚡", title: "Fast turnaround", description: "Most print jobs move to production the same or next business day." },
  { icon: "🎨", title: "Design support", description: "Our team can build or fix your artwork — no agency required." },
  { icon: "🔒", title: "Secure checkout", description: "Stripe-powered payments and prices re-verified server-side." },
  { icon: "🇺🇸", title: "Nationwide service", description: "Order online from anywhere in the country." },
  { icon: "📈", title: "Built for business", description: "From 250 business cards to a full brand rollout — one partner." },
];

export const TRUST_POINTS = [
  "Secure Stripe checkout",
  "Fast turnaround",
  "Design support included",
  "Nationwide shipping",
];

export const FAQ = [
  {
    q: "How fast will my order be ready?",
    a: "Most print products move to production within one business day of artwork approval. Large-format and apparel can take a little longer depending on quantity — you'll see an estimate at checkout.",
  },
  {
    q: "Can you design my artwork?",
    a: "Yes. Add “Design help” on any product, or contact us for full branding and graphic-design projects. We can also touch up files you already have.",
  },
  {
    q: "What file types do you accept?",
    a: "PDF, PNG, JPG, AI, PSD, EPS and SVG. Print-ready PDFs are best. If you're unsure, upload what you have and we'll take a look.",
  },
  {
    q: "Do you offer bulk / custom quantities?",
    a: "Yes. For runs above the listed tiers, or anything custom, choose “Custom order” on the product or use Request a Quote and we'll price it for you.",
  },
  {
    q: "Is my payment secure?",
    a: "Payments are processed by Stripe and every order total is re-calculated on our server before checkout — the price you're charged is always the correct one.",
  },
  {
    q: "Do you do more than printing?",
    a: "We're MetroPrint Marketing — branding, graphic design, social media management, content creation and video production are all part of what we do.",
  },
];

export const CONTACT_INFO = {
  email: "info@metroprintusa.com",
  phone: "(555) 123-4567",
  address: "123 Print Avenue, Suite 100, Your City, ST 12345",
  hours: "Mon–Fri: 8am – 6pm | Sat: 9am – 2pm",
};
