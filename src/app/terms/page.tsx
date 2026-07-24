import SiteLayout from "@/components/layout/SiteLayout";
import { SITE_NAME, CONTACT_INFO } from "@/lib/constants";

export const metadata = {
  title: "Terms of Service",
  description: `Terms of service for ${SITE_NAME}.`,
};

export default function TermsPage() {
  return (
    <SiteLayout>
      <div id="main-content" className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-navy">Terms of Service</h1>
        <p className="mt-2 text-sm text-muted">Last updated: June 2026</p>

        <div className="prose prose-sm mt-8 max-w-none space-y-6 text-muted">
          <section>
            <h2 className="text-lg font-semibold text-navy">Orders & payment</h2>
            <p>
              By placing an order on {SITE_NAME}, you agree to pay the listed
              price at checkout. Orders are confirmed after successful payment.
              Prices are listed in USD unless otherwise stated.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-navy">Customer artwork</h2>
            <p>
              You are responsible for ensuring uploaded artwork is accurate and
              that you have the right to use it. We are not liable for errors in
              customer-supplied files. Proofs may be provided upon request for
              custom work.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-navy">Production & delivery</h2>
            <p>
              Production timelines vary by product and order volume. Estimated
              timelines discussed during checkout or in order notes are estimates
              only and not guaranteed unless explicitly agreed in writing.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-navy">Cancellations & refunds</h2>
            <p>
              Orders may be cancelled before production begins. Refunds for
              cancelled or defective orders are handled on a case-by-case basis.
              Contact {CONTACT_INFO.email} for assistance.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-navy">Contact</h2>
            <p>
              {CONTACT_INFO.email} · {CONTACT_INFO.phone}
            </p>
          </section>
        </div>
      </div>
    </SiteLayout>
  );
}
