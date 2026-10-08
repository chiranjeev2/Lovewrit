import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-neutral-950 px-4 text-neutral-100">
      <div className="w-full max-w-md text-center space-y-6 py-12">
        {/* Subtle, respectful visual indicator (neutral feather / page icon) */}
        <div className="mx-auto w-16 h-16 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center shadow-inner">
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
              d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
            />
          </svg>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-serif font-bold text-neutral-100">
            Gift Not Found or Link Expired
          </h1>
          <p className="text-sm text-neutral-400 max-w-sm mx-auto leading-relaxed">
            This keepsake link is either unavailable, has expired, or the address was mistyped.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            href="/"
            className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-neutral-100 text-neutral-900 text-xs font-semibold hover:bg-neutral-200 transition min-h-[44px] flex items-center justify-center shadow"
          >
            Return to Homepage
          </Link>
          <Link
            href="/create/forever-valentine"
            className="w-full sm:w-auto px-6 py-2.5 rounded-full border border-neutral-800 text-neutral-300 text-xs font-semibold hover:bg-neutral-900 hover:text-white transition min-h-[44px] flex items-center justify-center"
          >
            Create a New Keepsake
          </Link>
        </div>
      </div>
    </main>
  );
}
