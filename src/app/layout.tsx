import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { CartProvider } from "@/components/cart/CartProvider";
import { ToastProvider } from "@/components/ui/Toast";
import { NavProvider } from "@/components/layout/nav-context";
import { getNavCatalog } from "@/lib/products/products";
import { SITE_NAME } from "@/lib/constants";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
const title = `${SITE_NAME} — Custom Printing, Apparel & Marketing`;
const description =
  "MetroPrint Marketing: premium business cards, print, large-format signage, custom apparel, promo products and full marketing services — clear pricing, fast turnaround, secure checkout.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: title, template: `%s | ${SITE_NAME}` },
  description,
  applicationName: SITE_NAME,
  openGraph: { type: "website", locale: "en_US", siteName: SITE_NAME, title, description },
  twitter: { card: "summary_large_image", title, description },
  robots: { index: true, follow: true },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const navCatalog = await getNavCatalog();

  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-white">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-white"
        >
          Skip to content
        </a>
        <ToastProvider>
          <NavProvider catalog={navCatalog}>
            <CartProvider>{children}</CartProvider>
          </NavProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
