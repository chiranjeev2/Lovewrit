import React from "react";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";
import { Shield, ArrowLeft } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Privacy Policy | Lovewrit",
  description: "Privacy Policy for the Lovewrit personalized occasion cards and interactive pages platform.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col selection:bg-rose-500 selection:text-white">
      <Navbar />

      <main className="flex-1 py-12 sm:py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          {/* Back link */}
          <Link
            href="/"
            className="inline-flex items-center text-xs text-neutral-400 hover:text-rose-400 transition mb-8"
          >
            <ArrowLeft className="h-3.5 w-3.5 mr-1.5" />
            Back to Home
          </Link>

          {/* Header */}
          <div className="border-b border-neutral-800 pb-8 mb-8">
            <div className="inline-flex items-center space-x-2 rounded-full border border-rose-500/30 bg-rose-500/10 px-3 py-1 text-xs font-semibold text-rose-300 mb-4">
              <Shield className="h-3.5 w-3.5" />
              <span>Legal & Transparency</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-white tracking-tight">
              Privacy Policy
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-neutral-400">
              <strong>Last updated:</strong> September 20, 2026
            </p>
          </div>

          {/* Content */}
          <div className="space-y-8 text-xs sm:text-sm leading-relaxed text-neutral-300">
            <p>
              Lovewrit (&ldquo;we&rdquo;, &ldquo;us&rdquo;, &ldquo;our&rdquo;) operates the Lovewrit website and platform
              (the &ldquo;Service&rdquo;), which allows customers to create personalized digital
              cards and interactive pages for special occasions. This Privacy Policy
              explains what information we collect, how we use it, and the choices you
              have.
            </p>

            <p>
              By using Lovewrit, you agree to the collection and use of information as
              described in this policy.
            </p>

            {/* Section 1 */}
            <section className="space-y-3">
              <h2 className="font-serif text-lg sm:text-xl font-bold text-white">
                1. Who We Are
              </h2>
              <p>
                Lovewrit is operated by an individual based in Ludhiana, Punjab, India.
                This is currently an individually-operated service, not a registered
                company. For any privacy questions, you can contact us at{" "}
                <a href="mailto:founder@lovewrit.com" className="text-rose-400 hover:underline font-semibold">
                  founder@lovewrit.com
                </a>.
              </p>
            </section>

            {/* Section 2 */}
            <section className="space-y-4">
              <h2 className="font-serif text-lg sm:text-xl font-bold text-white">
                2. Information We Collect
              </h2>

              <div className="space-y-2">
                <h3 className="font-semibold text-neutral-100">
                  Information you give us directly
                </h3>
                <ul className="list-disc list-inside space-y-1 pl-1 text-neutral-300">
                  <li>Names (yours and the recipient&apos;s)</li>
                  <li>Photos and images you upload</li>
                  <li>Written messages, letters, or voice recordings you create</li>
                  <li>
                    Email address and/or phone number, used to deliver your order and send
                    confirmation/receipt information
                  </li>
                  <li>
                    Payment information (processed securely by our payment provider — see
                    Section 5; we do not store your full card details ourselves)
                  </li>
                  <li>Any information you submit through guestbook, RSVP, or reply features</li>
                </ul>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold text-neutral-100">
                  Information collected automatically
                </h3>
                <ul className="list-disc list-inside space-y-1 pl-1 text-neutral-300">
                  <li>
                    Approximate location/region (derived from your IP address or device
                    settings), used only to show you accurate pricing in your local currency
                  </li>
                  <li>
                    Basic technical information (browser type, device type) to make the
                    Service work correctly and to fix bugs
                  </li>
                  <li>
                    If you view a free, ad-supported page, our advertising partner (see
                    Section 6) may collect information as described in their own privacy
                    policy
                  </li>
                </ul>
              </div>
            </section>

            {/* Section 3 */}
            <section className="space-y-3">
              <h2 className="font-serif text-lg sm:text-xl font-bold text-white">
                3. How We Use Your Information
              </h2>
              <p>We use the information we collect to:</p>
              <ul className="list-disc list-inside space-y-1 pl-1 text-neutral-300">
                <li>Create and deliver the personalized card or page you ordered</li>
                <li>Process payments and send order confirmations</li>
                <li>
                  Detect and prevent abuse (for example, limiting how many free orders can
                  be created from one IP address or email in a day)
                </li>
                <li>Respond to support requests</li>
                <li>Improve the Service over time</li>
              </ul>
              <p>We do not sell your personal information to third parties.</p>
            </section>

            {/* Section 4 */}
            <section className="space-y-3">
              <h2 className="font-serif text-lg sm:text-xl font-bold text-white">
                4. Sharing Recipient Information
              </h2>
              <p>
                When you create a card or page for someone else, you are responsible for
                making sure you have the right to share their name, photo, or other
                details with us for this purpose. The finished card or page will be
                accessible to anyone who has the link, so please only share that link with
                people you intend to see it.
              </p>
            </section>

            {/* Section 5 */}
            <section className="space-y-3">
              <h2 className="font-serif text-lg sm:text-xl font-bold text-white">
                5. Payments
              </h2>
              <p>
                Payments are processed by a third-party payment provider (such as Stripe).
                We do not store your full card number on our own servers. Please refer to
                your payment provider&apos;s own privacy policy for details on how they handle
                your payment information.
              </p>
            </section>

            {/* Section 6 */}
            <section className="space-y-3">
              <h2 className="font-serif text-lg sm:text-xl font-bold text-white">
                6. Advertising
              </h2>
              <p>
                Some free, ad-supported pages on Lovewrit (such as the free &ldquo;Letter to a
                Dear One&rdquo; interactive page) display advertisements served by a third-party
                advertising network (such as Google AdSense). These networks may use
                cookies or similar technology to serve ads. We do not control what these
                third parties do with information they collect; please refer to their own
                privacy policies for details.
              </p>
            </section>

            {/* Section 7 */}
            <section className="space-y-3">
              <h2 className="font-serif text-lg sm:text-xl font-bold text-white">
                7. Data Retention
              </h2>
              <p>
                We retain your order information, uploaded content, and messages for as
                long as needed to provide the Service, or as required by law. You may
                request deletion of your data by contacting us at{" "}
                <a href="mailto:founder@lovewrit.com" className="text-rose-400 hover:underline">
                  founder@lovewrit.com
                </a>
                , though note that a card or page already shared with a recipient may
                continue to exist at its link until deleted.
              </p>
            </section>

            {/* Section 8 */}
            <section className="space-y-3">
              <h2 className="font-serif text-lg sm:text-xl font-bold text-white">
                8. Your Rights
              </h2>
              <p>
                Depending on where you live, you may have rights to access, correct, or
                request deletion of your personal information. To exercise these rights,
                contact us at{" "}
                <a href="mailto:founder@lovewrit.com" className="text-rose-400 hover:underline">
                  founder@lovewrit.com
                </a>
                . If you are located outside India, additional rights may apply to you under
                your local law (for example, under the GDPR if you are in the European Union,
                or the UK GDPR if you are in the United Kingdom); we will make reasonable
                efforts to honor such requests.
              </p>
            </section>

            {/* Section 9 */}
            <section className="space-y-3">
              <h2 className="font-serif text-lg sm:text-xl font-bold text-white">
                9. Children&apos;s Privacy
              </h2>
              <p>
                Lovewrit is not directed at children, and we do not knowingly collect
                personal information from children.
              </p>
            </section>

            {/* Section 10 */}
            <section className="space-y-3">
              <h2 className="font-serif text-lg sm:text-xl font-bold text-white">
                10. Changes to This Policy
              </h2>
              <p>
                We may update this Privacy Policy from time to time. Changes will be
                posted on this page with an updated &ldquo;Last updated&rdquo; date.
              </p>
            </section>

            {/* Section 11 */}
            <section className="space-y-3">
              <h2 className="font-serif text-lg sm:text-xl font-bold text-white">
                11. Contact Us
              </h2>
              <p>
                If you have questions about this Privacy Policy, contact us at:{" "}
                <a href="mailto:founder@lovewrit.com" className="text-rose-400 hover:underline font-semibold">
                  founder@lovewrit.com
                </a>
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

