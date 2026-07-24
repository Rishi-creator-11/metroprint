import SiteLayout from "@/components/layout/SiteLayout";
import { SITE_NAME, CONTACT_INFO } from "@/lib/constants";

export const metadata = {
  title: "Privacy Policy",
  description: `Privacy policy for ${SITE_NAME}.`,
};

export default function PrivacyPage() {
  return (
    <SiteLayout>
      <div id="main-content" className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-navy">Privacy Policy</h1>
        <p className="mt-2 text-sm text-muted">Last updated: June 2026</p>

        <div className="prose prose-sm mt-8 max-w-none space-y-6 text-muted">
          <section>
            <h2 className="text-lg font-semibold text-navy">Information we collect</h2>
            <p>
              When you create an account, place an order, or contact us, we collect
              information such as your name, email address, phone number, order
              details, and files you upload (for example artwork or design files).
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-navy">How we use information</h2>
            <p>
              We use your information to process orders, provide customer support,
              send order-related communications, and improve our services. Payment
              processing is handled securely by Stripe.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-navy">Data storage & security</h2>
            <p>
              Order and account data is stored using Supabase. Uploaded files are
              stored in secure cloud storage. We do not sell your personal
              information to third parties.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-navy">Your rights</h2>
            <p>
              You may request access to or deletion of your personal data by
              contacting us at {CONTACT_INFO.email}.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-navy">Contact</h2>
            <p>
              Questions about this policy? Email {CONTACT_INFO.email} or call{" "}
              {CONTACT_INFO.phone}.
            </p>
          </section>
        </div>
      </div>
    </SiteLayout>
  );
}
