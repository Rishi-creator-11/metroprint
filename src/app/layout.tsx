import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { CartProvider } from "@/components/cart/CartProvider";
import { SITE_NAME } from "@/lib/constants";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${SITE_NAME} — Custom Printing & Marketing Services`,
    template: `%s | ${SITE_NAME}`,
  },
  description:
    "Custom printing, apparel, promotional products, and marketing services with clear pricing and secure online checkout.",
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: SITE_NAME,
    title: `${SITE_NAME} — Custom Printing & Marketing Services`,
    description:
      "Custom printing, apparel, promotional products, and marketing services with clear pricing and secure online checkout.",
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — Custom Printing & Marketing Services`,
    description:
      "Custom printing, apparel, promotional products, and marketing services with clear pricing and secure online checkout.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-white">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-white"
        >
          Skip to content
        </a>
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}
