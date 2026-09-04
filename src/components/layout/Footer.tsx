import Link from "next/link";
import { Mail, Phone, Clock } from "lucide-react";
import { CONTACT_INFO, SITE_NAME, TRUST_POINTS } from "@/lib/constants";
import { LogoCompact } from "./Logo";

const categoryLinks = [
  { label: "Business Cards", href: "/business-cards" },
  { label: "Print Materials", href: "/products?category=Print%20Materials" },
  { label: "Large Format", href: "/products?category=Large%20Format" },
  { label: "Apparel", href: "/products?category=Apparel" },
  { label: "Promotional Products", href: "/products?category=Promotional%20Products" },
  { label: "Marketing Services", href: "/products?category=Marketing%20Services" },
];

export function Footer() {
  return (
    <footer className="mt-auto bg-navy text-white">
      <div className="mp-container border-b border-white/10 py-6">
        <ul className="flex flex-wrap justify-center gap-x-8 gap-y-2 text-sm text-white/70">
          {TRUST_POINTS.map((t) => (
            <li key={t}>✓ {t}</li>
          ))}
        </ul>
      </div>

      <div className="mp-container py-12">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <LogoCompact />
            <p className="mt-4 max-w-xs text-sm text-white/70">
              Printing, apparel and marketing solutions for businesses of every size —
              done right, delivered fast.
            </p>
          </div>

          <div>
            <h3 className="mb-3 text-xs font-bold uppercase tracking-[0.15em] text-white/50">Shop</h3>
            <ul className="space-y-2 text-sm text-white/70">
              {categoryLinks.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="transition-colors hover:text-accent">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-3 text-xs font-bold uppercase tracking-[0.15em] text-white/50">Company</h3>
            <ul className="space-y-2 text-sm text-white/70">
              <li><Link href="/products" className="hover:text-accent">All products</Link></li>
              <li><Link href="/request-quote" className="hover:text-accent">Request a quote</Link></li>
              <li><Link href="/contact" className="hover:text-accent">Contact</Link></li>
              <li><Link href="/account" className="hover:text-accent">My account</Link></li>
            </ul>
            <h3 className="mb-3 mt-6 text-xs font-bold uppercase tracking-[0.15em] text-white/50">Help</h3>
            <ul className="space-y-2 text-sm text-white/70">
              <li><Link href="/privacy" className="hover:text-accent">Privacy policy</Link></li>
              <li><Link href="/terms" className="hover:text-accent">Terms of service</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="mb-3 text-xs font-bold uppercase tracking-[0.15em] text-white/50">Get in touch</h3>
            <ul className="space-y-2.5 text-sm text-white/70">
              {CONTACT_INFO.email && (
                <li className="flex items-center gap-2">
                  <Mail size={15} className="shrink-0 text-accent" />
                  <a href={`mailto:${CONTACT_INFO.email}`} className="hover:text-accent">
                    {CONTACT_INFO.email}
                  </a>
                </li>
              )}
              {CONTACT_INFO.phone && (
                <li className="flex items-center gap-2">
                  <Phone size={15} className="shrink-0 text-accent" /> {CONTACT_INFO.phone}
                </li>
              )}
              {CONTACT_INFO.hours && (
                <li className="flex items-center gap-2">
                  <Clock size={15} className="shrink-0 text-accent" /> {CONTACT_INFO.hours}
                </li>
              )}
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 text-xs text-white/50 sm:flex-row">
          <span>© {new Date().getFullYear()} {SITE_NAME}. All rights reserved.</span>
          <span className="flex gap-4">
            <Link href="/privacy" className="hover:text-white/80">Privacy</Link>
            <Link href="/terms" className="hover:text-white/80">Terms</Link>
          </span>
        </div>
      </div>
    </footer>
  );
}
