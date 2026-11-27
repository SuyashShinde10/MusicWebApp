function Shimmer({ className = '' }: { className?: string }) {
  return <div aria-hidden="true" className={`skeleton-shimmer ${className}`} />;
}

/**
 * Matches FeaturedShowcase across Mobile (< md), Tablet (md), and Desktop (lg+).
 */
export function HeroShowcaseSkeleton() {
  return (
    <section
      aria-label="Loading featured showcase"
      aria-busy="true"
      className="relative space-y-2"
    >
      {/* Mobile (< md) Landscape Card Skeleton */}
      <div className="md:hidden space-y-2">
        <div className="flex items-center justify-between">
          <Shimmer className="h-3.5 w-36 rounded-md" />
        </div>
        <div className="relative w-full h-[242px] rounded-2xl overflow-hidden bg-white dark:bg-[#15171c] border border-slate-200 dark:border-white/10 p-3.5 flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between">
            <Shimmer className="h-5 w-16 rounded-full" />
            <Shimmer className="w-8 h-8 rounded-full" />
          </div>
          <div className="flex items-end justify-between gap-3">
            <div className="space-y-1.5 flex-1">
              <Shimmer className="h-5 w-44 rounded-md" />
              <Shimmer className="h-3.5 w-28 rounded-md" />
            </div>
            <Shimmer className="w-10 h-10 rounded-full shrink-0" />
          </div>
        </div>
      </div>

      {/* Tablet & Desktop (>= md) 5-Card Landscape Rectangle Fan Skeleton */}
      <div className="hidden md:flex items-center justify-between gap-2 py-0.5 w-full">
        <Shimmer className="w-8 h-8 rounded-full shrink-0" />
        <div className="flex-1 min-w-0 flex items-center justify-center overflow-hidden py-1">
          <div className="hidden lg:block w-[144px] xl:w-[196px] 2xl:w-[228px] h-[112px] xl:h-[142px] 2xl:h-[156px] -mr-[60px] xl:-mr-[74px] rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#15171c] overflow-hidden shrink-0 opacity-60">
            <Shimmer className="w-full h-full" />
          </div>
          <div className="w-[196px] lg:w-[208px] xl:w-[264px] 2xl:w-[300px] h-[136px] lg:h-[148px] xl:h-[176px] 2xl:h-[192px] -mr-[64px] xl:-mr-[84px] rounded-2xl border border-slate-200 dark:border-white/15 bg-white dark:bg-[#15171c] overflow-hidden shrink-0 opacity-80 shadow-md">
            <Shimmer className="w-full h-full" />
          </div>
          <div className="relative z-10 w-[290px] lg:w-[316px] xl:w-[400px] 2xl:w-[460px] h-[168px] lg:h-[184px] xl:h-[214px] 2xl:h-[236px] rounded-2xl border border-slate-200 dark:border-white/20 bg-white dark:bg-[#181b22] overflow-hidden shrink-0 shadow-xl p-4 flex flex-col justify-end">
            <div className="flex items-end justify-between gap-3">
              <div className="space-y-2 flex-1">
                <Shimmer className="h-5 w-44 rounded-md" />
                <Shimmer className="h-3.5 w-28 rounded-md" />
              </div>
              <Shimmer className="w-10 h-10 rounded-full shrink-0" />
            </div>
          </div>
          <div className="w-[196px] lg:w-[208px] xl:w-[264px] 2xl:w-[300px] h-[136px] lg:h-[148px] xl:h-[176px] 2xl:h-[192px] -ml-[64px] xl:-ml-[84px] rounded-2xl border border-slate-200 dark:border-white/15 bg-white dark:bg-[#15171c] overflow-hidden shrink-0 opacity-80 shadow-md">
            <Shimmer className="w-full h-full" />
          </div>
          <div className="hidden lg:block w-[144px] xl:w-[196px] 2xl:w-[228px] h-[112px] xl:h-[142px] 2xl:h-[156px] -ml-[60px] xl:-ml-[74px] rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#15171c] overflow-hidden shrink-0 opacity-60">
            <Shimmer className="w-full h-full" />
          </div>
        </div>
        <Shimmer className="w-8 h-8 rounded-full shrink-0" />
      </div>

      {/* Pagination Dots Skeleton */}
      <div className="flex items-center justify-center gap-1.5">
        <Shimmer className="h-1.5 w-5 rounded-full" />
        <Shimmer className="h-1.5 w-1.5 rounded-full" />
        <Shimmer className="h-1.5 w-1.5 rounded-full" />
        <Shimmer className="h-1.5 w-1.5 rounded-full" />
        <Shimmer className="h-1.5 w-1.5 rounded-full" />
      </div>
    </section>
  );
}

/**
 * Matches JellyRadio category filter strip across Mobile, Tablet, and Desktop.
 */
export function CategoriesSkeleton() {
  const pillWidths = ['w-12', 'w-16', 'w-24', 'w-14', 'w-16', 'w-20', 'w-14', 'w-16', 'w-20'];
  return (
    <div aria-label="Loading categories" aria-busy="true" className="space-y-2">
      <div className="flex items-center justify-between">
        <Shimmer className="h-5 w-36 rounded-md" />
        <div className="flex items-center gap-1">
          <Shimmer className="w-7 h-7 rounded-full" />
          <Shimmer className="w-7 h-7 rounded-full" />
        </div>
      </div>
      <div className="flex items-center gap-2 overflow-hidden py-1">
        {pillWidths.map((w, idx) => (
          <Shimmer key={idx} className={`h-[30px] ${w} rounded-full shrink-0`} />
        ))}
      </div>
    </div>
  );
}

/**
 * Matches Mobile/Tablet quick playlists grid (< lg).
 */
export function MobilePlaylistsSkeleton() {
  return (
    <section aria-label="Loading playlists" aria-busy="true" className="lg:hidden space-y-2.5">
      <div className="flex items-center justify-between">
        <Shimmer className="h-5 w-28 rounded-md" />
        <Shimmer className="h-4 w-24 rounded-md" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {Array.from({ length: 4 }).map((_, idx) => (
          <div
            key={idx}
            className="flex items-center gap-3 p-2.5 rounded-xl bg-white dark:bg-[#15171c] border border-slate-200 dark:border-white/[0.06]"
          >
            <Shimmer className="w-10 h-10 rounded-lg shrink-0" />
            <div className="space-y-1.5 flex-1 min-w-0">
              <Shimmer className="h-3.5 w-28 rounded" />
              <Shimmer className="h-2.5 w-20 rounded" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/**
 * Matches SongRow Grid cards (2/3/4/5/6 responsive cols) or List rows.
 */
export function LibrarySkeleton({ layout = 'grid' }: { layout?: 'grid' | 'list' }) {
  if (layout === 'list') {
    return (
      <div aria-label="Loading songs" aria-busy="true" className="space-y-2">
        {Array.from({ length: 6 }).map((_, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between gap-3 px-3 py-2 rounded-xl bg-white dark:bg-[#151821] border border-slate-200/90 dark:border-white/[0.07]"
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <Shimmer className="w-4 h-4 rounded hidden sm:block shrink-0" />
              <Shimmer className="w-10 h-10 rounded-lg shrink-0" />
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <Shimmer className="h-3.5 w-36 rounded" />
                  <Shimmer className="h-4 w-12 rounded-md hidden md:block" />
                </div>
                <Shimmer className="h-3 w-24 rounded" />
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Shimmer className="h-3.5 w-9 rounded" />
              <Shimmer className="w-8 h-8 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div
      aria-label="Loading songs"
      aria-busy="true"
      className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3"
    >
      {Array.from({ length: 12 }).map((_, idx) => (
        <div
          key={idx}
          className="rounded-[16px] bg-white dark:bg-[#15171c] border border-slate-200 dark:border-white/[0.08] p-1.5 flex flex-col justify-between h-[226px]"
        >
          <div className="relative w-full flex-1 min-h-0 rounded-xl overflow-hidden">
            <Shimmer className="w-full h-full rounded-xl" />
            <div className="absolute top-1.5 left-1.5 w-6 h-6 rounded-full bg-white/40 dark:bg-black/30" />
            <div className="absolute top-1.5 right-1.5 w-9 h-4 rounded bg-white/40 dark:bg-black/30" />
          </div>
          <div className="pt-2 pb-1 px-1.5 space-y-1.5">
            <Shimmer className="h-3 w-3/4 mx-auto rounded" />
            <Shimmer className="h-2.5 w-1/2 mx-auto rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Matches ActivePlaylistPanel (Header + Track Rows + Shredder Slit).
 */
export function ActivePlaylistSkeleton() {
  return (
    <section
      aria-label="Loading active playlist"
      aria-busy="true"
      className="rounded-2xl bg-white border border-slate-200 dark:bg-[#15171c] dark:border-white/[0.08] p-4 sm:p-5 space-y-3.5 min-w-0"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-slate-200/90 dark:border-white/[0.07]">
        <div className="flex items-center gap-3.5">
          <Shimmer className="w-14 h-14 rounded-xl shrink-0" />
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Shimmer className="h-4 w-24 rounded-full" />
              <Shimmer className="h-3.5 w-20 rounded" />
            </div>
            <Shimmer className="h-5 w-40 rounded-md" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Shimmer className="h-8 w-20 rounded-xl" />
          <Shimmer className="h-8 w-20 rounded-xl" />
          <Shimmer className="h-8 w-20 rounded-xl" />
        </div>
      </div>

      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <Shimmer className="h-3.5 w-64 max-w-[70%] rounded" />
          <Shimmer className="h-3.5 w-24 rounded" />
        </div>
        <div className="rounded-xl bg-slate-50/90 border border-slate-200/90 dark:bg-[#0d1016] dark:border-white/[0.06] p-2.5 space-y-2">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between gap-3 px-3 py-2 rounded-xl bg-white dark:bg-[#151821] border border-slate-200/80 dark:border-white/[0.06]"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <Shimmer className="w-4 h-4 rounded hidden sm:block shrink-0" />
                <Shimmer className="w-10 h-10 rounded-lg shrink-0" />
                <div className="space-y-1.5 flex-1">
                  <Shimmer className="h-3.5 w-36 rounded" />
                  <Shimmer className="h-3 w-24 rounded" />
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <Shimmer className="h-3.5 w-8 rounded mr-1" />
                <Shimmer className="w-7 h-7 rounded-lg" />
                <Shimmer className="w-7 h-7 rounded-lg" />
                <Shimmer className="w-7 h-7 rounded-lg" />
              </div>
            </div>
          ))}
          <div className="pt-2">
            <div className="h-[3px] w-full rounded-full bg-orange-500/40" />
            <div className="h-12 flex items-center justify-center">
              <Shimmer className="h-3 w-48 rounded" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * Matches PlayerBar across Mobile (< md floating bar) and Tablet/Desktop (>= md dock).
 */
export function PlayerBarSkeleton() {
  return (
    <div
      aria-label="Loading player"
      aria-busy="true"
      className="fixed bottom-[66px] md:bottom-0 left-3 right-3 md:left-0 md:right-0 z-40"
    >
      {/* Mobile Compact Floating Skeleton (< md) */}
      <div className="md:hidden bg-white/95 border-slate-200 dark:bg-[#15171c]/95 dark:border-white/10 backdrop-blur-xl border rounded-2xl p-2.5 shadow-xl space-y-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 flex-1 min-w-0">
            <Shimmer className="w-10 h-10 rounded-lg shrink-0" />
            <div className="space-y-1.5 flex-1">
              <Shimmer className="h-3.5 w-28 rounded" />
              <Shimmer className="h-3 w-20 rounded" />
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <Shimmer className="w-8 h-8 rounded-full" />
            <Shimmer className="w-9 h-9 rounded-full" />
            <Shimmer className="w-8 h-8 rounded-full" />
          </div>
        </div>
        <Shimmer className="h-1.5 w-full rounded-full" />
      </div>

      {/* Tablet & Desktop Dock Skeleton (>= md) */}
      <div className="hidden md:flex h-20 bg-white/95 border-slate-200/90 dark:bg-[#101217]/95 dark:border-white/[0.08] backdrop-blur-2xl border-t px-6 items-center justify-between gap-6">
        <div className="flex items-center gap-4 min-w-[260px]">
          <Shimmer className="w-11 h-11 rounded-xl shrink-0" />
          <div className="space-y-1.5">
            <Shimmer className="h-3.5 w-28 rounded" />
            <Shimmer className="h-3 w-20 rounded" />
          </div>
          <div className="flex items-center gap-2 ml-2">
            <Shimmer className="w-7 h-7 rounded-full" />
            <Shimmer className="w-10 h-10 rounded-full" />
            <Shimmer className="w-7 h-7 rounded-full" />
          </div>
        </div>
        <div className="flex-1 max-w-xl space-y-2">
          <Shimmer className="h-1.5 w-full rounded-full" />
          <div className="flex justify-between">
            <Shimmer className="h-2.5 w-7 rounded" />
            <Shimmer className="h-2.5 w-7 rounded" />
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Shimmer className="w-7 h-7 rounded-full" />
          <Shimmer className="w-7 h-7 rounded-full" />
          <Shimmer className="w-7 h-7 rounded-full" />
          <Shimmer className="w-16 h-7 rounded-full" />
          <Shimmer className="w-8 h-8 rounded-full" />
        </div>
      </div>
    </div>
  );
}
