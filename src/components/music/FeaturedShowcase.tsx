import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ChevronLeft, ChevronRight, Pause, Play, Plus } from 'lucide-react';
import type { Song } from '../../types/music';
import { formatDuration } from '../../utils/formatters';
import { animateMicroPop, prefersReducedMotion } from '../../utils/gsapAnimations';
import { AlbumArt } from './AlbumArt';

interface FeaturedShowcaseProps {
  songs: Song[];
  currentSongId: Song['id'] | null;
  isPlaying: boolean;
  onPlay: (song: Song) => void;
  onAddToPlaylist: (song: Song) => void;
}

export function FeaturedShowcase({
  songs,
  currentSongId,
  isPlaying,
  onPlay,
  onAddToPlaylist,
}: FeaturedShowcaseProps) {
  // Build up to 5 showcase tracks; center on Echoes of Midnight if present
  const featured = songs.slice(0, 6);
  const initialIdx = Math.max(
    0,
    featured.findIndex((s) => s.title.toLowerCase().includes('echoes'))
  );
  const [activeIndex, setActiveIndex] = useState(initialIdx);
  const centerCardRef = useRef<HTMLDivElement>(null);
  const playBtnRef = useRef<HTMLButtonElement>(null);

  const count = featured.length;
  const safeIndex = count > 0 ? ((activeIndex % count) + count) % count : 0;
  const activeSong = featured[safeIndex];

  useEffect(() => {
    if (!centerCardRef.current || prefersReducedMotion()) return;
    gsap.fromTo(
      centerCardRef.current,
      { scale: 0.94, opacity: 0.85 },
      { scale: 1, opacity: 1, duration: 0.36, ease: 'power3.out', clearProps: 'transform,opacity' }
    );
  }, [safeIndex]);

  if (!activeSong) return null;

  const getRelativeSong = (offset: number): Song | undefined => {
    if (count === 0) return undefined;
    return featured[((safeIndex + offset) % count + count) % count];
  };

  const farLeft = count >= 5 ? getRelativeSong(-2) : undefined;
  const nearLeft = count >= 3 ? getRelativeSong(-1) : undefined;
  const nearRight = count >= 2 ? getRelativeSong(1) : undefined;
  const farRight = count >= 4 ? getRelativeSong(2) : undefined;

  const isCurrentActive = currentSongId === activeSong.id;

  const selectOffset = (offset: number) => {
    setActiveIndex((prev) => ((prev + offset) % count + count) % count);
  };

  return (
    <section aria-label="Featured Showcase" className="relative">
      {/* Mobile Hero Card (< md) */}
      <div className="md:hidden space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-gray-400">Featured Release</span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => selectOffset(-1)}
              aria-label="Previous featured song"
              className="w-7 h-7 rounded-full bg-white/[0.06] text-gray-300 flex items-center justify-center"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => selectOffset(1)}
              aria-label="Next featured song"
              className="w-7 h-7 rounded-full bg-white/[0.06] text-gray-300 flex items-center justify-center"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="relative w-full h-[220px] rounded-2xl overflow-hidden p-4 flex flex-col justify-between shadow-2xl border border-white/10">
          <AlbumArt
            song={activeSong}
            isPlaying={isCurrentActive && isPlaying}
            size="fill"
            className="!rounded-2xl !absolute !inset-0"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
          <div className="relative z-10 flex items-center justify-between">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-teal-600/90 text-white">
              {activeSong.genre}
            </span>
            <button
              type="button"
              onClick={() => onAddToPlaylist(activeSong)}
              aria-label={`Add ${activeSong.title} to playlist`}
              className="w-8 h-8 rounded-full bg-black/50 backdrop-blur-md border border-white/20 text-white flex items-center justify-center"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <div className="relative z-10 flex items-end justify-between gap-3">
            <div className="min-w-0">
              <h3 className="text-xl font-bold text-white tracking-tight truncate">
                {activeSong.title}
              </h3>
              <p className="text-xs text-gray-200 truncate">
                {activeSong.artist} · {formatDuration(activeSong.duration)}
              </p>
            </div>
            <button
              type="button"
              onClick={() => onPlay(activeSong)}
              aria-label={
                isCurrentActive && isPlaying
                  ? `Pause ${activeSong.title}`
                  : `Play ${activeSong.title}`
              }
              className="w-11 h-11 rounded-full bg-white/20 hover:bg-brand-500 backdrop-blur-md border border-white/30 text-white flex items-center justify-center transition active:scale-90 shrink-0"
            >
              {isCurrentActive && isPlaying ? (
                <Pause className="w-4 h-4 fill-current" />
              ) : (
                <Play className="w-4 h-4 fill-current ml-0.5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Desktop / Tablet 5-Card Overlapping Fan Carousel (>= md) */}
      <div className="hidden md:flex items-center justify-center relative py-2 select-none">
        <button
          type="button"
          onClick={() => selectOffset(-1)}
          aria-label="Previous featured song"
          className="hidden xl:flex absolute left-0 z-40 w-9 h-9 rounded-full bg-[#15171c]/90 hover:bg-white/15 border border-white/10 text-gray-300 hover:text-white items-center justify-center transition active:scale-90"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <div className="flex items-center justify-center w-full overflow-hidden py-1">
          {/* Far Left (-2) */}
          {farLeft && (
            <button
              type="button"
              onClick={() => selectOffset(-2)}
              aria-label={`Focus ${farLeft.title}`}
              className="hidden lg:block relative w-40 xl:w-48 h-48 xl:h-52 -mr-14 z-10 rounded-2xl overflow-hidden border border-white/10 brightness-[0.6] hover:brightness-90 transition-all duration-300 hover:-translate-x-1 shrink-0 shadow-xl"
            >
              <AlbumArt song={farLeft} size="fill" className="!rounded-2xl" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
            </button>
          )}

          {/* Near Left (-1) */}
          {nearLeft && (
            <button
              type="button"
              onClick={() => selectOffset(-1)}
              aria-label={`Focus ${nearLeft.title}`}
              className="relative w-48 lg:w-56 xl:w-60 h-56 lg:h-60 xl:h-64 -mr-14 lg:-mr-16 z-20 rounded-2xl overflow-hidden border border-white/15 brightness-[0.78] hover:brightness-100 transition-all duration-300 hover:-translate-y-1 shrink-0 shadow-2xl"
            >
              <AlbumArt song={nearLeft} size="fill" className="!rounded-2xl" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />
            </button>
          )}

          {/* Active Center Card (0) */}
          <div
            ref={centerCardRef}
            className="relative w-64 lg:w-72 xl:w-[300px] h-64 lg:h-72 xl:h-[300px] z-30 rounded-2xl overflow-hidden border border-white/20 shadow-[0_24px_60px_rgba(0,0,0,0.85)] shrink-0 group"
          >
            <AlbumArt
              song={activeSong}
              isPlaying={isCurrentActive && isPlaying}
              size="fill"
              className="!rounded-2xl"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/15" />

            <button
              type="button"
              onClick={() => onAddToPlaylist(activeSong)}
              aria-label={`Add ${activeSong.title} to playlist`}
              title="Add to playlist"
              className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-black/45 hover:bg-teal-600 backdrop-blur-md border border-white/20 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-all active:scale-90"
            >
              <Plus className="w-4 h-4" />
            </button>

            <div className="absolute inset-x-0 bottom-0 p-4 flex items-end justify-between gap-3">
              <div className="min-w-0 text-left">
                <h3 className="text-lg lg:text-xl font-bold text-white tracking-tight truncate drop-shadow">
                  {activeSong.title}
                </h3>
                <p className="text-xs lg:text-sm text-gray-200 truncate">{activeSong.artist}</p>
              </div>

              <button
                ref={playBtnRef}
                type="button"
                onClick={() => {
                  if (playBtnRef.current) animateMicroPop(playBtnRef.current);
                  onPlay(activeSong);
                }}
                aria-label={
                  isCurrentActive && isPlaying
                    ? `Pause ${activeSong.title}`
                    : `Play ${activeSong.title}`
                }
                className="w-11 h-11 rounded-full bg-white/20 hover:bg-teal-600 backdrop-blur-md border border-white/40 text-white flex items-center justify-center transition-all hover:scale-105 active:scale-90 shrink-0 shadow-lg"
              >
                {isCurrentActive && isPlaying ? (
                  <Pause className="w-4 h-4 fill-current" />
                ) : (
                  <Play className="w-4 h-4 fill-current ml-0.5" />
                )}
              </button>
            </div>
          </div>

          {/* Near Right (+1) */}
          {nearRight && (
            <button
              type="button"
              onClick={() => selectOffset(1)}
              aria-label={`Focus ${nearRight.title}`}
              className="relative w-48 lg:w-56 xl:w-60 h-56 lg:h-60 xl:h-64 -ml-14 lg:-ml-16 z-20 rounded-2xl overflow-hidden border border-white/15 brightness-[0.78] hover:brightness-100 transition-all duration-300 hover:-translate-y-1 shrink-0 shadow-2xl"
            >
              <AlbumArt song={nearRight} size="fill" className="!rounded-2xl" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />
            </button>
          )}

          {/* Far Right (+2) */}
          {farRight && (
            <button
              type="button"
              onClick={() => selectOffset(2)}
              aria-label={`Focus ${farRight.title}`}
              className="hidden lg:block relative w-40 xl:w-48 h-48 xl:h-52 -ml-14 z-10 rounded-2xl overflow-hidden border border-white/10 brightness-[0.6] hover:brightness-90 transition-all duration-300 hover:translate-x-1 shrink-0 shadow-xl"
            >
              <AlbumArt song={farRight} size="fill" className="!rounded-2xl" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={() => selectOffset(1)}
          aria-label="Next featured song"
          className="hidden xl:flex absolute right-0 z-40 w-9 h-9 rounded-full bg-[#15171c]/90 hover:bg-white/15 border border-white/10 text-gray-300 hover:text-white items-center justify-center transition active:scale-90"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </section>
  );
}
