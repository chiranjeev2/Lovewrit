import React from "react";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";
import { FileText, ArrowLeft } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Terms and Conditions | Lovewrit",
  description: "Terms and Conditions for using the Lovewrit personalized occasion cards and interactive pages platform.",
};

export default function TermsPage() {
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
              <FileText className="h-3.5 w-3.5" />
              <span>Legal Agreement</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-white tracking-tight">
              Terms and Conditions
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-neutral-400">
              <strong>Last updated:</strong> September 20, 2026
            </p>
          </div>

          {/* Content */}
          <div className="space-y-8 text-xs sm:text-sm leading-relaxed text-neutral-300">
            <p>
              Please read these Terms and Conditions (&ldquo;Terms&rdquo;) carefully before using
              Lovewrit (the &ldquo;Service&rdquo;), operated by an individual based in Ludhiana,
              Punjab, India (&ldquo;we&rdquo;, &ldquo;us&rdquo;, &ldquo;our&rdquo;). By using the Service, you agree to be
              bound by these Terms.
            </p>

            {/* Section 1 */}
            <section className="space-y-3">
              <h2 className="font-serif text-lg sm:text-xl font-bold text-white">
                1. The Service
              </h2>
              <p>
                Lovewrit allows you to create personalized digital cards and interactive
                web pages for occasions such as proposals, anniversaries, apologies,
                birthdays, memorials, devotional invitations, and other life events. Some
                products are free, some are paid, and pricing varies by region and tier as
                shown on the Service at the time of purchase.
              </p>
            </section>

            {/* Section 2 */}
            <section className="space-y-3">
              <h2 className="font-serif text-lg sm:text-xl font-bold text-white">
                2. Your Content
              </h2>
              <p>
                You are solely responsible for any photos, names, messages, voice
                recordings, or other content (&ldquo;Your Content&rdquo;) you upload or submit
                through the Service. By submitting Your Content, you confirm that:
              </p>
              <ul className="list-disc list-inside space-y-1 pl-1 text-neutral-300">
                <li>You own it, or have permission to use and share it</li>
                <li>
                  You have the right to include any other person&apos;s name, photo, or
                  likeness in it
                </li>
                <li>It does not violate any law or infringe on anyone else&apos;s rights</li>
                <li>
                  It is not hateful, harassing, sexually explicit involving minors,
                  violent, or otherwise seriously harmful content
                </li>
              </ul>
              <p>
                We reserve the right to remove any content that violates these Terms, and
                to refuse service to anyone, at our discretion.
              </p>
            </section>

            {/* Section 3 */}
            <section className="space-y-3">
              <h2 className="font-serif text-lg sm:text-xl font-bold text-white">
                3. Payments and Pricing
              </h2>
              <ul className="list-disc list-inside space-y-1.5 pl-1 text-neutral-300">
                <li>
                  Prices are shown in your local currency where possible, based on your
                  detected region, and may be manually adjusted at checkout if needed.
                </li>
                <li>Payments are processed by a third-party payment provider.</li>
                <li>
                  <strong className="text-white">All sales are final. We do not offer refunds</strong> on completed orders,
                  due to the instant, personalized, and digital nature of the product. If
                  you believe there has been an error with your order (for example, a
                  technical failure that prevented delivery), please contact us at{" "}
                  <a href="mailto:founder@lovewrit.com" className="text-rose-400 hover:underline">
                    founder@lovewrit.com
                  </a>{" "}
                  and we will do our best to resolve it.
                </li>
              </ul>
            </section>

            {/* Section 4 */}
            <section className="space-y-3">
              <h2 className="font-serif text-lg sm:text-xl font-bold text-white">
                4. The &ldquo;Proposal&rdquo; Interactive Feature
              </h2>
              <p>
                Certain templates (such as proposal-themed pages) include a playful
                interactive element where a &ldquo;No&rdquo; button may move away from the cursor and
                cannot be directly clicked, so that only &ldquo;Yes&rdquo; can be selected as a
                button response. This is a lighthearted design feature of the product.
              </p>
              <p>
                <strong className="text-white">
                  If you (or the recipient of a page) do not wish to select &ldquo;Yes,&rdquo; you are
                  under no obligation to do so.
                </strong>{" "}
                You may simply close the browser tab or
                navigate away from the page at any time. This feature is intended purely
                as a playful design element and is not intended to pressure, trick, or
                obligate any person into a real-world response or decision.
              </p>
            </section>

            {/* Section 5 */}
            <section className="space-y-3">
              <h2 className="font-serif text-lg sm:text-xl font-bold text-white">
                5. Guestbook, RSVP, and Reply Features
              </h2>
              <p>
                Some pages allow recipients or guests to leave replies, RSVPs, or
                messages. These are visible to the page&apos;s creator and, in some cases,
                publicly on the page. Certain occasion types (such as memorial pages) use
                pre-moderation, meaning replies are reviewed before appearing publicly. We
                are not responsible for the content that other users submit through these
                features, though we will act on reports of abusive or inappropriate
                content.
              </p>
            </section>

            {/* Section 6 */}
            <section className="space-y-3">
              <h2 className="font-serif text-lg sm:text-xl font-bold text-white">
                6. Advertising and Free Products
              </h2>
              <p>
                Some products (such as the free &ldquo;Letter to a Dear One&rdquo; interactive page)
                are supported by third-party advertisements rather than a purchase price.
                By using a free, ad-supported product, you agree that ads may be displayed
                to you as part of the experience.
              </p>
            </section>

            {/* Section 7 */}
            <section className="space-y-3">
              <h2 className="font-serif text-lg sm:text-xl font-bold text-white">
                7. Tips to Senders
              </h2>
              <p>
                Where a &ldquo;send a thank-you&rdquo; tip feature is available, this works by
                providing the recipient with the original sender&apos;s payment details (such
                as a UPI ID or payment link) supplied directly by the sender. Lovewrit
                does not process, hold, or have any involvement in these tip payments —
                any transaction happens directly and entirely between the sender and
                recipient, and we bear no responsibility for it.
              </p>
            </section>

            {/* Section 8 */}
            <section className="space-y-3">
              <h2 className="font-serif text-lg sm:text-xl font-bold text-white">
                8. Referral Credits
              </h2>
              <p>
                Where offered, referral credits are provided at our discretion, subject to
                the specific terms shown at the time of the offer, and may be changed,
                limited, or discontinued at any time.
              </p>
            </section>

            {/* Section 9 */}
            <section className="space-y-3">
              <h2 className="font-serif text-lg sm:text-xl font-bold text-white">
                9. Intellectual Property
              </h2>
              <p>
                The Lovewrit name, logo, templates, and underlying software are our
                property (or licensed to us) and may not be copied, reproduced, or resold
                without our permission. You retain ownership of Your Content, but grant us
                a license to host, display, and process it as needed to provide the
                Service.
              </p>
            </section>

            {/* Section 10 */}
            <section className="space-y-3">
              <h2 className="font-serif text-lg sm:text-xl font-bold text-white">
                10. Disclaimer of Warranties
              </h2>
              <p>
                The Service is provided &ldquo;as is.&rdquo; We do not guarantee that it will always
                be available, error-free, or uninterrupted. We are not responsible for
                how a recipient reacts to, or what they decide in response to, any card
                or page created using the Service.
              </p>
            </section>

            {/* Section 11 */}
            <section className="space-y-3">
              <h2 className="font-serif text-lg sm:text-xl font-bold text-white">
                11. Limitation of Liability
              </h2>
              <p>
                To the fullest extent permitted by law, Lovewrit and its operator shall
                not be liable for any indirect, incidental, or consequential damages
                arising from your use of the Service, including any emotional distress
                arising from a personal or relationship outcome connected to using the
                Service.
              </p>
            </section>

            {/* Section 12 */}
            <section className="space-y-3">
              <h2 className="font-serif text-lg sm:text-xl font-bold text-white">
                12. Governing Law
              </h2>
              <p>
                These Terms are governed by the laws of India. If you are located outside
                India, you may also have additional rights or protections under the laws
                of your own country, which these Terms do not limit.
              </p>
            </section>

            {/* Section 13 */}
            <section className="space-y-3">
              <h2 className="font-serif text-lg sm:text-xl font-bold text-white">
                13. Changes to These Terms
              </h2>
              <p>
                We may update these Terms from time to time. Continued use of the Service
                after changes are posted constitutes acceptance of the updated Terms.
              </p>
            </section>

            {/* Section 14 */}
            <section className="space-y-3">
              <h2 className="font-serif text-lg sm:text-xl font-bold text-white">
                14. Contact Us
              </h2>
              <p>
                Questions about these Terms can be sent to:{" "}
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
