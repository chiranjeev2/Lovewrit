import React from "react";
import Link from "next/link";
import { Heart, Sparkles } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-neutral-900 bg-neutral-950 py-12 text-neutral-400">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="flex items-center space-x-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-500 text-white">
                <Heart className="h-4 w-4 fill-white" />
              </div>
              <span className="font-serif text-lg font-bold text-white">Memoir</span>
            </div>
            <p className="mt-3 max-w-sm text-xs leading-relaxed text-neutral-400">
              Personalized occasion cards & emotional mini-websites created for couples.
              Craft heartfelt memories for proposals, anniversaries, apologies, and love letters.
            </p>
            <div className="mt-4 flex items-center space-x-2 text-[11px] text-neutral-500">
              <span>Made with</span>
              <Heart className="h-3 w-3 fill-rose-500 text-rose-500" />
              <span>for unforgettable moments worldwide</span>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-200">
              Occasions
            </h4>
            <ul className="mt-3 space-y-2 text-xs">
              <li>
                <Link href="/#templates" className="hover:text-rose-400 transition">
                  Romantic Proposals
                </Link>
              </li>
              <li>
                <Link href="/#templates" className="hover:text-rose-400 transition">
                  Anniversaries & Milestones
                </Link>
              </li>
              <li>
                <Link href="/#templates" className="hover:text-rose-400 transition">
                  Heartfelt Apologies
                </Link>
              </li>
              <li>
                <Link href="/#templates" className="hover:text-rose-400 transition">
                  Memory Lane & Reminiscing
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-200">
              Platform
            </h4>
            <ul className="mt-3 space-y-2 text-xs">
              <li>
                <Link href="/#pricing" className="hover:text-rose-400 transition">
                  Fair Region-Based Pricing
                </Link>
              </li>
              <li>
                <Link href="/#templates" className="hover:text-rose-400 transition">
                  Templates Gallery
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-rose-400 transition">
                  Founder Dashboard
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-neutral-900 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-neutral-500">
          <p>© {new Date().getFullYear()} Memoir. All rights reserved.</p>
          <div className="mt-2 sm:mt-0 flex items-center space-x-4">
            <span className="inline-flex items-center text-[11px] text-rose-400/80">
              <Sparkles className="mr-1 h-3 w-3" />
              Phase 1 MVP Edition
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
