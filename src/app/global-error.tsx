"use client";

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ reset }: GlobalErrorProps) {
  return (
    <html lang="en" className="h-full bg-neutral-950 text-neutral-100">
      <body className="min-h-full flex items-center justify-center p-4">
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
              An unexpected system error occurred
            </h1>
            <p className="text-sm text-neutral-400 max-w-sm mx-auto leading-relaxed">
              We encountered a disruption while preparing this page.
            </p>
          </div>

          <button
            type="button"
            onClick={() => reset()}
            className="px-6 py-2.5 rounded-full bg-neutral-100 text-neutral-900 text-xs font-semibold hover:bg-neutral-200 transition min-h-[44px] shadow"
          >
            Reload Page
          </button>
        </div>
      </body>
    </html>
  );
}
