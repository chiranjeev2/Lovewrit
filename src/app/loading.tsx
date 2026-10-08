export default function RootLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-950 px-4 text-neutral-400">
      <div className="flex flex-col items-center space-y-4">
        {/* Subtle pulsating ring loader */}
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full border-2 border-neutral-800" />
          <div className="absolute inset-0 rounded-full border-2 border-rose-500 border-t-transparent animate-spin" />
        </div>
        <p className="text-xs uppercase tracking-widest font-mono text-neutral-400">
          Loading Keepsake...
        </p>
      </div>
    </div>
  );
}
