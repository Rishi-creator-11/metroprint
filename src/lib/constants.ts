import type { ProductCategory } from "./types";

export const SITE_NAME = "MetroPrint USA";

export const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Products" },
  { href: "/business-cards", label: "Business Cards" },
  { href: "/contact", label: "Contact" },
] as const;

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
    description: "Standard, premium & specialty business cards",
    image:
      "https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=600&h=400&fit=crop",
    href: "/business-cards",
  },
  {
    name: "Print Materials",
    slug: "print-materials",
    description: "Flyers, brochures, posters, banners & more",
    image:
      "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&h=400&fit=crop",
  },
  {
    name: "Apparel",
    slug: "apparel",
    description: "Custom t-shirts, polos, hoodies, hats & tote bags",
    image:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=400&fit=crop",
  },
  {
    name: "DTF Printing",
    slug: "dtf-printing",
    description: "Direct-to-film transfers & custom apparel printing",
    image:
      "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600&h=400&fit=crop",
  },
  {
    name: "Marketing Services",
    slug: "marketing-services",
    description: "Graphic design, branding, social media & video",
    image:
      "https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&h=400&fit=crop",
  },
  {
    name: "Promotional Products",
    slug: "promotional-products",
    description: "Mugs, tumblers & branded merchandise",
    image:
      "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=600&h=400&fit=crop",
  },
];

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
    description: "Browse our catalog with clear pricing and select your options.",
  },
  {
    step: 2,
    title: "Add to cart",
    description: "Configure size, quantity, and finish — then add items to your cart.",
  },
  {
    step: 3,
    title: "Checkout securely",
    description: "Sign in and pay with Stripe. Your order is confirmed instantly.",
  },
  {
    step: 4,
    title: "Print & deliver",
    description: "We produce your order with quality you can trust.",
  },
];

export const CONTACT_INFO = {
  email: "info@metroprintusa.com",
  phone: "(555) 123-4567",
  address: "123 Print Avenue, Suite 100, Your City, ST 12345",
  hours: "Mon–Fri: 8am – 6pm | Sat: 9am – 2pm",
};
