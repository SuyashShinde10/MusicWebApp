export function LibrarySkeleton() {
  return (
    <div aria-label="Loading songs" className="space-y-3">
      <div className="flex gap-2 overflow-hidden">
        {Array.from({ length: 6 }).map((_, idx) => (
          <div
            key={idx}
            className="h-8 w-20 rounded-full bg-slate-200 dark:bg-surface-card animate-pulse shrink-0"
          />
        ))}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
        {Array.from({ length: 12 }).map((_, idx) => (
          <div
            key={idx}
            className="rounded-2xl bg-white dark:bg-[#15171c] border border-slate-200 dark:border-white/5 p-2 space-y-2.5 animate-pulse h-[226px]"
          >
            <div className="w-full h-36 rounded-xl bg-slate-200 dark:bg-white/10" />
            <div className="space-y-1.5 px-1">
              <div className="h-3 bg-slate-200 dark:bg-white/10 rounded w-3/4 mx-auto" />
              <div className="h-2.5 bg-slate-100 dark:bg-white/5 rounded w-1/2 mx-auto" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
