import React from "react";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";
import { Shield, ArrowLeft, AlertCircle } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Privacy Policy | Lovewrit",
  description: "Privacy Policy draft for the Lovewrit personalized occasion cards and interactive keepsake pages platform.",
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

          {/* Lawyer Review Draft Alert Banner */}
          <div className="mb-8 p-4 rounded-2xl bg-amber-950/40 border border-amber-500/40 text-amber-200 text-xs flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold text-amber-300 uppercase tracking-wider text-[11px]">
                Draft Notice — Pending Formal Legal Counsel Review
              </p>
              <p className="leading-relaxed text-amber-200/90 font-serif">
                This document is a operational transparency draft outlining how Lovewrit currently handles data. It is currently undergoing review by legal counsel. This text does not constitute a formal legal representation, warranty, or assertion of statutory compliance (including DPDP Act 2023 or GDPR).
              </p>
            </div>
          </div>

          {/* Header */}
          <div className="border-b border-neutral-800 pb-8 mb-8">
            <div className="inline-flex items-center space-x-2 rounded-full border border-rose-500/30 bg-rose-500/10 px-3 py-1 text-xs font-semibold text-rose-300 mb-4">
              <Shield className="h-3.5 w-3.5" />
              <span>Privacy &amp; Data Transparency (Draft)</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-white tracking-tight">
              Privacy Policy
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-neutral-400">
              <strong>Last updated:</strong> October 4, 2026 • Status: Pending Formal Lawyer Review
            </p>
          </div>

          {/* Content */}
          <div className="space-y-8 text-xs sm:text-sm leading-relaxed text-neutral-300 font-serif">
            <p>
              Lovewrit (&ldquo;we&rdquo;, &ldquo;us&rdquo;, &ldquo;our&rdquo;) operates the Lovewrit platform
              (the &ldquo;Service&rdquo;), which allows customers to create personalized digital
              cards and emotional keepsake websites for life occasions. This policy transparently explains
              what data we handle, how it is used, and how you can exercise control over your data.
            </p>

            {/* Section 1: Who We Are */}
            <section className="space-y-3">
              <h2 className="font-sans font-bold text-base sm:text-lg text-white">
                1. Operator &amp; Contact
              </h2>
              <p>
                Lovewrit is currently an individually-operated indie software craft project based in Ludhiana, Punjab, India. For all privacy inquiries, data deletion requests, or questions, please email the founder directly at:{" "}
                <a href="mailto:founder@lovewrit.com" className="text-rose-400 hover:underline font-semibold font-sans">
                  founder@lovewrit.com
                </a>.
              </p>
            </section>

            {/* Section 2: Data Handled Across Features */}
            <section className="space-y-4">
              <h2 className="font-sans font-bold text-base sm:text-lg text-white">
                2. Information Collected &amp; Processed
              </h2>

              <div className="space-y-3">
                <div>
                  <h3 className="font-sans font-semibold text-neutral-100 text-xs sm:text-sm">
                    A. Buyer Order &amp; Customizer Content
                  </h3>
                  <p className="text-neutral-400 text-xs mt-1">
                    When you customize a card or keepsake page, you provide names (sender, recipient), personal messages, photos, voice notes, audio preferences, and event details. You must obtain consent from any individual whose likeness or personal information you upload.
                  </p>
                </div>

                <div>
                  <h3 className="font-sans font-semibold text-neutral-100 text-xs sm:text-sm">
                    B. Personalized Guest Links (?guest=)
                  </h3>
                  <p className="text-neutral-400 text-xs mt-1">
                    Our platform allows event hosts to generate personalized links (e.g. <code>?guest=Name</code>) to welcome guests by name on invitations and tables. These guest names are sanitized upon rendering and are not used for user profiling or advertising.
                  </p>
                </div>

                <div>
                  <h3 className="font-sans font-semibold text-neutral-100 text-xs sm:text-sm">
                    C. RSVP Data
                  </h3>
                  <p className="text-neutral-400 text-xs mt-1">
                    When attendees respond to an invitation RSVP form, we collect their name, attendance status (Attending / Regrets), headcount, and optional notes or dietary preferences. This data is made available solely to the event host through their private moderation view and CSV download.
                  </p>
                </div>

                <div>
                  <h3 className="font-sans font-semibold text-neutral-100 text-xs sm:text-sm">
                    D. Sacred Tribute &amp; Memorial Wall Submissions
                  </h3>
                  <p className="text-neutral-400 text-xs mt-1">
                    Tribute pages allow friends and family to submit condolences and memories. By default, all tribute wall messages are <strong>pre-moderated</strong>: they remain hidden until explicitly approved by the memorial page creator using their private secret moderation token. The creator is solely responsible for approving, rejecting, or removing messages.
                  </p>
                </div>

                <div>
                  <h3 className="font-sans font-semibold text-neutral-100 text-xs sm:text-sm">
                    E. Anonymous Candle / Diya Counters
                  </h3>
                  <p className="text-neutral-400 text-xs mt-1">
                    On memorial pages, visitors can light a virtual remembrance candle. To prevent automated counter inflation, we store an anonymous server-side counter alongside a 24-hour device cookie and IP rate limit. No personal identity is attached to candle counts.
                  </p>
                </div>

                <div>
                  <h3 className="font-sans font-semibold text-neutral-100 text-xs sm:text-sm">
                    F. Referral Program Cookie
                  </h3>
                  <p className="text-neutral-400 text-xs mt-1">
                    When arriving via a creator or referral link (<code>/r/[code]</code>), a functional cookie named <code>lovewrit_referral_code</code> is stored on your device for up to 30 days. It contains solely the alphanumeric referral code to apply the discount at checkout. It does not track external browsing history.
                  </p>
                </div>

                <div>
                  <h3 className="font-sans font-semibold text-neutral-100 text-xs sm:text-sm">
                    G. Consent-Aware Anonymous Analytics
                  </h3>
                  <p className="text-neutral-400 text-xs mt-1">
                    We measure high-level funnel conversion (visits, customizer loads, checkouts, paid orders) strictly in aggregate. We honor browser <strong>Do Not Track (DNT)</strong> signals and local consent preferences. We never collect personal letters, uploaded photos, or private audio recordings in our analytics.
                  </p>
                </div>

                <div>
                  <h3 className="font-sans font-semibold text-neutral-100 text-xs sm:text-sm">
                    H. PIN Privacy Protection
                  </h3>
                  <p className="text-neutral-400 text-xs mt-1">
                    Buyers may configure an optional 4-digit PIN to lock intimate cards or pages until unlocked by the recipient. While this restricts casual browser access, buyers should recognize that web links shared across unencrypted channels carry inherent transmission risks.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 3: Data Retention & Deletion */}
            <section className="space-y-3">
              <h2 className="font-sans font-bold text-base sm:text-lg text-white">
                3. Data Retention &amp; Right to Deletion
              </h2>
              <p>
                Because Lovewrit offers keepsake pages designed to remain accessible indefinitely, your page content is retained until you request its removal.
              </p>
              <p>
                You may request complete deletion of any card, keepsake page, uploaded photos, audio messages, or RSVP data at any time by emailing{" "}
                <a href="mailto:founder@lovewrit.com" className="text-rose-400 hover:underline font-semibold font-sans">
                  founder@lovewrit.com
                </a>{" "}
                with your order slug and email. Deletions are processed within 7 business days.
              </p>
            </section>

            {/* Section 4: Payments */}
            <section className="space-y-3">
              <h2 className="font-sans font-bold text-base sm:text-lg text-white">
                4. Payment Processing
              </h2>
              <p>
                All credit and debit card transactions are processed securely by Razorpay. Lovewrit does not store or process raw credit card numbers or banking passwords on our servers.
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
