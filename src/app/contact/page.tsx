import SiteLayout from "@/components/layout/SiteLayout";
import { Button } from "@/components/ui/Button";
import { CONTACT_INFO } from "@/lib/constants";
import { Clock, Mail, MapPin, Phone } from "lucide-react";

export const metadata = {
  title: "Contact — MetroPrint USA",
  description: "Get in touch with MetroPrint USA for custom printing and marketing services.",
};

export default function ContactPage() {
  return (
    <SiteLayout>
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-3xl font-bold text-navy">Contact Us</h1>
          <p className="mt-2 text-muted">
            Have a question or need help with your project? We&apos;re here to
            help.
          </p>
        </div>

        <div className="mx-auto mt-12 grid max-w-4xl gap-8 sm:grid-cols-2">
          <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
            <Mail className="mb-4 text-primary" size={28} />
            <h3 className="font-semibold text-navy">Email</h3>
            <p className="mt-1 text-muted">{CONTACT_INFO.email}</p>
          </div>
          <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
            <Phone className="mb-4 text-primary" size={28} />
            <h3 className="font-semibold text-navy">Phone</h3>
            <p className="mt-1 text-muted">{CONTACT_INFO.phone}</p>
          </div>
          <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
            <MapPin className="mb-4 text-primary" size={28} />
            <h3 className="font-semibold text-navy">Address</h3>
            <p className="mt-1 text-muted">{CONTACT_INFO.address}</p>
          </div>
          <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
            <Clock className="mb-4 text-primary" size={28} />
            <h3 className="font-semibold text-navy">Hours</h3>
            <p className="mt-1 text-muted">{CONTACT_INFO.hours}</p>
          </div>
        </div>

        <div className="mx-auto mt-12 max-w-2xl rounded-xl bg-surface p-8 text-center">
          <h2 className="text-xl font-semibold text-navy">
            Ready to start your project?
          </h2>
          <p className="mt-2 text-muted">
            Submit a quote request with your specs and artwork files.
          </p>
          <Button href="/request-quote" className="mt-6">
            Request a Quote
          </Button>
        </div>
      </div>
    </SiteLayout>
  );
}
