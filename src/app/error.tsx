"use client";

import { useEffect } from "react";
import Link from "next/link";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function RootError({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log error name without exposing sensitive detail or stack trace to client console
    console.error("Application error:", error.name);
  }, [error]);

  return (
    <main className="min-h-screen flex items-center justify-center bg-neutral-950 px-4 text-neutral-100">
      <div className="w-full max-w-md text-center space-y-6 py-12">
        <div className="mx-auto w-16 h-16 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center">
          <svg
            className="w-8 h-8 text-neutral-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
            />
          </svg>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-serif font-bold text-neutral-100">
            Something went wrong
          </h1>
          <p className="text-sm text-neutral-400 max-w-sm mx-auto leading-relaxed">
            We encountered an unexpected issue while loading this page. Please try again or return home.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => reset()}
            className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-neutral-100 text-neutral-900 text-xs font-semibold hover:bg-neutral-200 transition min-h-[44px] shadow"
          >
            Try Again
          </button>
          <Link
            href="/"
            className="w-full sm:w-auto px-6 py-2.5 rounded-full border border-neutral-800 text-neutral-300 text-xs font-semibold hover:bg-neutral-900 hover:text-white transition min-h-[44px] flex items-center justify-center"
          >
            Return to Homepage
          </Link>
        </div>
      </div>
    </main>
  );
}

