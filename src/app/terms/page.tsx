import React from "react";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";
import { FileText, ArrowLeft, AlertCircle } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Terms and Conditions | Lovewrit",
  description: "Terms and Conditions draft for the Lovewrit personalized occasion cards and interactive keepsake pages platform.",
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

          {/* Lawyer Review Draft Alert Banner */}
          <div className="mb-8 p-4 rounded-2xl bg-amber-950/40 border border-amber-500/40 text-amber-200 text-xs flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold text-amber-300 uppercase tracking-wider text-[11px]">
                Draft Notice — Pending Formal Legal Counsel Review
              </p>
              <p className="leading-relaxed text-amber-200/90 font-serif">
                This document is an operational terms draft setting out expectations between Lovewrit and its users. It is currently under review by legal counsel. It does not claim formal statutory certification.
              </p>
            </div>
          </div>

          {/* Header */}
          <div className="border-b border-neutral-800 pb-8 mb-8">
            <div className="inline-flex items-center space-x-2 rounded-full border border-rose-500/30 bg-rose-500/10 px-3 py-1 text-xs font-semibold text-rose-300 mb-4">
              <FileText className="h-3.5 w-3.5" />
              <span>Terms of Service (Draft)</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-white tracking-tight">
              Terms &amp; Conditions
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-neutral-400">
              <strong>Last updated:</strong> October 4, 2026 • Status: Pending Formal Lawyer Review
            </p>
          </div>

          {/* Content */}
          <div className="space-y-8 text-xs sm:text-sm leading-relaxed text-neutral-300 font-serif">
            <p>
              Please read these Terms and Conditions (&ldquo;Terms&rdquo;) carefully before using
              Lovewrit (the &ldquo;Service&rdquo;), operated by an individual creator in Ludhiana, Punjab, India. By accessing or purchasing through Lovewrit, you agree to be bound by these Terms.
            </p>

            {/* Section 1: The Service */}
            <section className="space-y-3">
              <h2 className="font-sans font-bold text-base sm:text-lg text-white">
                1. The Service &amp; Scope
              </h2>
              <p>
                Lovewrit provides handcrafted digital greeting cards and interactive keepsake pages for life celebrations, anniversaries, proposals, birthdays, godhbharai gatherings, kitty parties, devotional observances, and sacred memorials.
              </p>
            </section>

            {/* Section 2: Buyer Content & Permissions */}
            <section className="space-y-3">
              <h2 className="font-sans font-bold text-base sm:text-lg text-white">
                2. User Uploads, Photos &amp; Permissions
              </h2>
              <p>
                You are solely responsible for any text, photos, letters, voice recordings, and details you submit. By uploading content, you explicitly warrant and represent that:
              </p>
              <ul className="list-disc list-inside space-y-1.5 pl-2 text-neutral-300">
                <li>You hold all necessary copyrights, licenses, or explicit permissions for the text and media.</li>
                <li>You have received prior explicit consent from every individual whose name, portrait, voice, or likeness appears in your keepsake.</li>
                <li>Your content does not infringe third-party privacy, intellectual property, or publicity rights.</li>
              </ul>
            </section>

            {/* Section 3: Sacred Tributes & Family Moderation */}
            <section className="space-y-3">
              <h2 className="font-sans font-bold text-base sm:text-lg text-white">
                3. Sacred Tribute Pages &amp; Moderation Responsibilities
              </h2>
              <p>
                Sacred Tribute and memorial pages are designed to be tranquil, unbranded, and solemn spaces. To protect families from unwanted spam or grief trolling:
              </p>
              <ul className="list-disc list-inside space-y-1.5 pl-2 text-neutral-300">
                <li>All public condolence messages are pre-moderated and remain hidden until approved.</li>
                <li>The page buyer / family is provided a private moderation link and holds sole discretion and responsibility for approving, flagging, or deleting tribute wall submissions.</li>
                <li>Lovewrit reserves the right to remove any tribute content reported as abusive or unlawful.</li>
              </ul>
            </section>

            {/* Section 4: Strict PCPNDT Prohibition */}
            <section className="space-y-3">
              <h2 className="font-sans font-bold text-base sm:text-lg text-white">
                4. Strict Compliance: No Fetal Sex or Gender Reveals
              </h2>
              <p>
                In strict compliance with the Indian <em>Pre-Conception and Pre-Natal Diagnostic Techniques (PCPNDT) Act, 1994</em>, Lovewrit strictly prohibits the use of any baby shower, godhbharai, or celebratory template for fetal sex disclosure, gender prediction, or sex selection. Any user attempting to circumvent this restriction will have their page immediately terminated without refund.
              </p>
            </section>

            {/* Section 5: No-Refund Policy on Personalized Digital Goods */}
            <section className="space-y-3">
              <h2 className="font-sans font-bold text-base sm:text-lg text-white">
                5. Payments &amp; No-Refund Policy
              </h2>
              <p>
                Because Lovewrit creates custom, personalized digital greeting cards and generated keepsake websites that are provisioned and hosted immediately upon checkout confirmation, <strong>all purchases are non-refundable</strong> once generated.
              </p>
              <p>
                If you encounter a genuine technical defect or formatting issue, please contact{" "}
                <a href="mailto:founder@lovewrit.com" className="text-rose-400 hover:underline font-sans">
                  founder@lovewrit.com
                </a>{" "}
                within 48 hours and we will make every effort to assist and correct your page.
              </p>
            </section>

            {/* Section 6: Referral Program Terms */}
            <section className="space-y-3">
              <h2 className="font-sans font-bold text-base sm:text-lg text-white">
                6. Referral &amp; Creator Program
              </h2>
              <p>
                Lovewrit offers fixed-credit promotional referrals. Referral credits are non-cash store credits redeemable exclusively towards future Lovewrit keepsakes. Credits cannot be withdrawn, transferred, or exchanged for currency. Self-referrals (via matching emails, payment accounts, or IP addresses) and automated abuse are strictly prohibited.
              </p>
            </section>

            {/* Section 7: PIN Protection Limitation */}
            <section className="space-y-3">
              <h2 className="font-sans font-bold text-base sm:text-lg text-white">
                7. PIN Access Disclaimer
              </h2>
              <p>
                Optional 4-digit PIN protection restricts access within supported browsers. It is an access barrier designed for social privacy, not classified military-grade encryption. Users must not store passwords, financial tokens, or government IDs on Lovewrit.
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
