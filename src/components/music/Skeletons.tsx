export function LibrarySkeleton() {
  return (
    <div aria-label="Loading songs" className="space-y-3">
      <div className="flex gap-2 overflow-hidden">
        {Array.from({ length: 6 }).map((_, idx) => (
          <div
            key={idx}
            className="h-9 w-20 rounded-full bg-surface-card animate-pulse shrink-0 border border-white/5"
          />
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {Array.from({ length: 8 }).map((_, idx) => (
          <div
            key={idx}
            className="rounded-2xl bg-surface-card border border-white/5 p-3.5 flex items-center gap-3 animate-pulse"
          >
            <div className="w-12 h-12 rounded-xl bg-white/10 shrink-0" />
            <div className="flex-1 space-y-2 min-w-0">
              <div className="h-3.5 bg-white/10 rounded w-3/4" />
              <div className="h-3 bg-white/5 rounded w-1/2" />
            </div>
            <div className="h-4 w-8 bg-white/10 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
