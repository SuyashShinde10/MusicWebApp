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
  const featured = songs.slice(0, 6);
  const initialIdx = Math.max(
    0,
    featured.findIndex((s) => s.title.toLowerCase().includes('echoes'))
  );
  const [activeIndex, setActiveIndex] = useState(initialIdx);
  const stageRef = useRef<HTMLDivElement>(null);
  const playBtnRef = useRef<HTMLButtonElement>(null);

  const count = featured.length;
  const safeIndex = count > 0 ? ((activeIndex % count) + count) % count : 0;
  const activeSong = featured[safeIndex];

  useEffect(() => {
    if (!stageRef.current || prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.showcase-center',
        { scale: 0.94, opacity: 0.8 },
        { scale: 1, opacity: 1, duration: 0.36, ease: 'power3.out', clearProps: 'transform,opacity' }
      );
      gsap.fromTo(
        '.showcase-flank',
        { y: 6, opacity: 0.72 },
        { y: 0, opacity: 1, duration: 0.32, stagger: 0.03, ease: 'power2.out', clearProps: 'transform,opacity' }
      );
    }, stageRef);
    return () => ctx.revert();
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
      <div className="md:hidden space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-gray-400">Featured Release</span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => selectOffset(-1)}
              aria-label="Previous featured song"
              className="w-7 h-7 rounded-full bg-white/[0.06] text-gray-300 flex items-center justify-center active:scale-90 transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => selectOffset(1)}
              aria-label="Next featured song"
              className="w-7 h-7 rounded-full bg-white/[0.06] text-gray-300 flex items-center justify-center active:scale-90 transition"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="relative w-full h-[205px] rounded-2xl overflow-hidden p-4 flex flex-col justify-between shadow-2xl border border-white/10">
          <AlbumArt
            song={activeSong}
            isPlaying={isCurrentActive && isPlaying}
            size="fill"
            className="!rounded-2xl !absolute !inset-0"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
          <div className="relative z-10 flex items-center justify-between">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#198f85]/90 text-white">
              {activeSong.genre}
            </span>
            <button
              type="button"
              onClick={() => onAddToPlaylist(activeSong)}
              aria-label={`Add ${activeSong.title} to playlist`}
              className="w-8 h-8 rounded-full bg-black/50 backdrop-blur-md border border-white/20 text-white flex items-center justify-center active:scale-90 transition"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <div className="relative z-10 flex items-end justify-between gap-3">
            <div className="min-w-0">
              <h3 className="text-lg font-bold text-white tracking-tight truncate">
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
              className="w-10 h-10 rounded-full bg-white/20 hover:bg-[#198f85] backdrop-blur-md border border-white/35 text-white flex items-center justify-center transition active:scale-90 shrink-0"
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
      <div
        ref={stageRef}
        className="hidden md:flex items-center justify-center gap-3 relative py-1 select-none max-w-4xl mx-auto"
      >
        <button
          type="button"
          onClick={() => selectOffset(-1)}
          aria-label="Previous featured song"
          className="w-8 h-8 rounded-full bg-[#15171c] hover:bg-white/15 border border-white/10 text-gray-300 hover:text-white flex items-center justify-center transition active:scale-90 shrink-0 z-40"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <div className="flex items-center justify-center overflow-hidden py-1">
          {farLeft && (
            <button
              type="button"
              onClick={() => selectOffset(-2)}
              aria-label={`Focus ${farLeft.title}`}
              className="showcase-flank hidden lg:block relative w-40 xl:w-48 h-44 xl:h-48 -mr-14 z-10 rounded-2xl overflow-hidden border border-white/10 brightness-[0.58] hover:brightness-90 transition-all duration-300 hover:-translate-x-1 shrink-0 shadow-xl"
            >
              <AlbumArt song={farLeft} size="fill" className="!rounded-2xl" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
            </button>
          )}

          {nearLeft && (
            <button
              type="button"
              onClick={() => selectOffset(-1)}
              aria-label={`Focus ${nearLeft.title}`}
              className="showcase-flank relative w-48 lg:w-52 xl:w-56 h-52 lg:h-56 xl:h-60 -mr-14 z-20 rounded-2xl overflow-hidden border border-white/15 brightness-[0.78] hover:brightness-100 transition-all duration-300 hover:-translate-y-1 shrink-0 shadow-2xl"
            >
              <AlbumArt song={nearLeft} size="fill" className="!rounded-2xl" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />
            </button>
          )}

          {/* Active Center Card */}
          <div className="showcase-center relative w-60 lg:w-64 xl:w-[276px] h-60 lg:h-64 xl:h-[276px] z-30 rounded-2xl overflow-hidden border border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.85)] shrink-0 group">
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
              className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-black/45 hover:bg-[#198f85] backdrop-blur-md border border-white/20 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-all active:scale-90"
            >
              <Plus className="w-4 h-4" />
            </button>

            <div className="absolute inset-x-0 bottom-0 p-4 flex items-end justify-between gap-3">
              <div className="min-w-0 text-left">
                <h3 className="text-lg font-bold text-white tracking-tight truncate drop-shadow">
                  {activeSong.title}
                </h3>
                <p className="text-xs text-gray-200 truncate">{activeSong.artist}</p>
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
                className="w-10 h-10 rounded-full bg-white/20 hover:bg-[#198f85] backdrop-blur-md border border-white/40 text-white flex items-center justify-center transition-all hover:scale-105 active:scale-90 shrink-0 shadow-lg"
              >
                {isCurrentActive && isPlaying ? (
                  <Pause className="w-4 h-4 fill-current" />
                ) : (
                  <Play className="w-4 h-4 fill-current ml-0.5" />
                )}
              </button>
            </div>
          </div>

          {nearRight && (
            <button
              type="button"
              onClick={() => selectOffset(1)}
              aria-label={`Focus ${nearRight.title}`}
              className="showcase-flank relative w-48 lg:w-52 xl:w-56 h-52 lg:h-56 xl:h-60 -ml-14 z-20 rounded-2xl overflow-hidden border border-white/15 brightness-[0.78] hover:brightness-100 transition-all duration-300 hover:-translate-y-1 shrink-0 shadow-2xl"
            >
              <AlbumArt song={nearRight} size="fill" className="!rounded-2xl" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />
            </button>
          )}

          {farRight && (
            <button
              type="button"
              onClick={() => selectOffset(2)}
              aria-label={`Focus ${farRight.title}`}
              className="showcase-flank hidden lg:block relative w-40 xl:w-48 h-44 xl:h-48 -ml-14 z-10 rounded-2xl overflow-hidden border border-white/10 brightness-[0.58] hover:brightness-90 transition-all duration-300 hover:translate-x-1 shrink-0 shadow-xl"
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
          className="w-8 h-8 rounded-full bg-[#15171c] hover:bg-white/15 border border-white/10 text-gray-300 hover:text-white flex items-center justify-center transition active:scale-90 shrink-0 z-40"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </section>
  );
}
