import Link from "next/link";
import SiteLayout from "@/components/layout/SiteLayout";
import { Button } from "@/components/ui/Button";
import { CONTACT_INFO } from "@/lib/constants";
import { Clock, Mail, MapPin, Phone, FileText } from "lucide-react";

export const metadata = {
  title: "Contact",
  description: "Get in touch with MetroPrint Marketing for custom printing and marketing services.",
};

const INFO_ROWS = [
  { key: "email", icon: Mail, label: "Email", value: CONTACT_INFO.email, href: `mailto:${CONTACT_INFO.email}` },
  { key: "phone", icon: Phone, label: "Phone", value: CONTACT_INFO.phone },
  { key: "address", icon: MapPin, label: "Address", value: CONTACT_INFO.address },
  { key: "hours", icon: Clock, label: "Hours", value: CONTACT_INFO.hours },
].filter((row) => row.value);

export default function ContactPage() {
  return (
    <SiteLayout>
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-16 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-primary">Get in touch</p>
          <h1 className="font-display mt-2 text-3xl font-semibold tracking-tight text-navy sm:text-4xl">
            We&apos;re here to help
          </h1>
          <p className="mt-3 text-muted">
            Questions about a product, a bulk order, or artwork specs? Reach out, or jump
            straight to a quote.
          </p>
        </div>

        <div className="mx-auto mt-12 grid max-w-4xl gap-5 sm:grid-cols-2">
          {INFO_ROWS.map((row) => (
            <div key={row.key} className="print-mark rounded-xl border border-border bg-white p-6 shadow-sm">
              <row.icon className="mb-4 text-primary" size={26} aria-hidden="true" />
              <h3 className="font-semibold text-navy">{row.label}</h3>
              {row.href ? (
                <a href={row.href} className="mt-1 block text-muted transition-colors hover:text-primary">
                  {row.value}
                </a>
              ) : (
                <p className="mt-1 text-muted">{row.value}</p>
              )}
            </div>
          ))}
          <div className="print-mark flex flex-col rounded-xl border border-border bg-white p-6 shadow-sm">
            <FileText className="mb-4 text-primary" size={26} aria-hidden="true" />
            <h3 className="font-semibold text-navy">Have specs already?</h3>
            <p className="mt-1 text-muted">Skip the back-and-forth and request a quote directly.</p>
            <Link href="/request-quote" className="mt-3 text-sm font-semibold text-primary hover:underline">
              Request a quote &rarr;
            </Link>
          </div>
        </div>

        <div className="mx-auto mt-12 max-w-2xl rounded-2xl bg-navy p-8 text-center text-white sm:p-10">
          <h2 className="font-display text-xl font-semibold sm:text-2xl">
            Ready to start your project?
          </h2>
          <p className="mt-2 text-white/70">
            Submit a quote request with your specs and artwork files — our team will follow up.
          </p>
          <Button href="/request-quote" className="mt-6 bg-accent text-navy hover:bg-accent/90">
            Request a Quote
          </Button>
        </div>
      </div>
    </SiteLayout>
  );
}
