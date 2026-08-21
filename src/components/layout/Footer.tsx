import Link from "next/link";
import { CONTACT_INFO, SITE_NAME } from "@/lib/constants";
import { LogoCompact } from "./Logo";

export function Footer() {
  return (
    <footer className="mt-auto bg-navy text-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <LogoCompact />
            <p className="mt-4 text-sm text-white/70">
              Custom printing, apparel, and marketing solutions for businesses
              of all sizes.
            </p>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider">
              Quick Links
            </h3>
            <ul className="space-y-2 text-sm text-white/70">
              <li>
                <Link href="/products" className="hover:text-accent">
                  Products
                </Link>
              </li>
              <li>
                <Link href="/request-quote" className="hover:text-accent">
                  Request Quote
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-accent">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-accent">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-accent">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider">
              Categories
            </h3>
            <ul className="space-y-2 text-sm text-white/70">
              <li>
                <Link href="/business-cards" className="hover:text-accent">
                  Business Cards
                </Link>
              </li>
              <li>
                <Link
                  href="/products?category=Print+Materials"
                  className="hover:text-accent"
                >
                  Print Materials
                </Link>
              </li>
              <li>
                <Link
                  href="/products?category=Apparel"
                  className="hover:text-accent"
                >
                  Apparel
                </Link>
              </li>
              <li>
                <Link
                  href="/products?category=Marketing+Services"
                  className="hover:text-accent"
                >
                  Marketing Services
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider">
              Contact
            </h3>
            <ul className="space-y-2 text-sm text-white/70">
              <li>{CONTACT_INFO.email}</li>
              <li>{CONTACT_INFO.phone}</li>
              <li>{CONTACT_INFO.hours}</li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-white/10 pt-6 text-center text-xs text-white/50">
          © {new Date().getFullYear()} {SITE_NAME}. All rights reserved.
          <span className="mx-2">·</span>
          <Link href="/privacy" className="hover:text-white/80">
            Privacy
          </Link>
          <span className="mx-2">·</span>
          <Link href="/terms" className="hover:text-white/80">
            Terms
          </Link>
        </div>
      </div>
    </footer>
  );
}
