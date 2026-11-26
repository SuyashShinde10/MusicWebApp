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
  const featured = songs.slice(0, 5);
  const [activeIndex, setActiveIndex] = useState(0);
  const activeCardRef = useRef<HTMLDivElement>(null);
  const playBtnRef = useRef<HTMLButtonElement>(null);

  const safeIndex = featured.length > 0 ? activeIndex % featured.length : 0;
  const activeSong = featured[safeIndex];

  useEffect(() => {
    if (!activeCardRef.current || prefersReducedMotion()) return;
    gsap.fromTo(
      activeCardRef.current,
      { opacity: 0.72, scale: 0.97 },
      { opacity: 1, scale: 1, duration: 0.35, ease: 'power3.out', clearProps: 'transform,opacity' }
    );
  }, [safeIndex]);

  if (!activeSong) return null;

  const prevSong = featured[(safeIndex - 1 + featured.length) % featured.length];
  const nextSong = featured[(safeIndex + 1) % featured.length];
  const isCurrentActive = currentSongId === activeSong.id;

  return (
    <section aria-label="Featured Showcase" className="space-y-3.5">
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-400">
            Curated Spotlight · 0{safeIndex + 1} / 0{featured.length}
          </p>
          <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight mt-0.5">
            Trending Showcase
          </h2>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() =>
              setActiveIndex((prev) => (prev - 1 + featured.length) % featured.length)
            }
            aria-label="Previous featured song"
            className="w-8 h-8 rounded-full bg-white/[0.05] hover:bg-white/10 text-gray-300 hover:text-white flex items-center justify-center transition active:scale-90"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setActiveIndex((prev) => (prev + 1) % featured.length)}
            aria-label="Next featured song"
            className="w-8 h-8 rounded-full bg-white/[0.05] hover:bg-white/10 text-gray-300 hover:text-white flex items-center justify-center transition active:scale-90"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Mobile Featured Editorial Card (< md) */}
      <div className="md:hidden">
        <div className="relative w-full h-[200px] rounded-2xl overflow-hidden p-4 flex flex-col justify-between shadow-xl border border-white/10">
          <AlbumArt
            song={activeSong}
            isPlaying={isCurrentActive && isPlaying}
            size="fill"
            className="!rounded-2xl !absolute !inset-0"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-black/20" />
          <div className="relative z-10 flex items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-brand-500/90 text-white">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              Featured
            </span>
            <span className="text-[11px] font-mono text-white/90 bg-black/50 backdrop-blur-md px-2 py-0.5 rounded-md">
              {formatDuration(activeSong.duration)}
            </span>
          </div>

          <div className="relative z-10 flex items-end justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[10px] font-semibold text-brand-400 uppercase tracking-wider">
                {activeSong.genre}
              </p>
              <h3 className="text-lg font-bold text-white tracking-tight truncate">
                {activeSong.title}
              </h3>
              <p className="text-xs text-gray-200 truncate">{activeSong.artist}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => onAddToPlaylist(activeSong)}
                aria-label={`Add ${activeSong.title} to playlist`}
                className="w-9 h-9 rounded-full bg-black/50 hover:bg-black/75 border border-white/15 text-white flex items-center justify-center transition active:scale-90"
              >
                <Plus className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => onPlay(activeSong)}
                aria-label={
                  isCurrentActive && isPlaying
                    ? `Pause ${activeSong.title}`
                    : `Play ${activeSong.title}`
                }
                className="w-11 h-11 rounded-full bg-brand-500 hover:bg-brand-600 text-white flex items-center justify-center shadow-glow-sm transition active:scale-90"
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
      </div>

      {/* Desktop / Tablet Editorial Spotlight (>= md) */}
      <div className="hidden md:grid grid-cols-12 gap-4 items-stretch">
        <div
          ref={activeCardRef}
          className="col-span-12 xl:col-span-8 relative rounded-2xl overflow-hidden border border-white/[0.08] bg-[#141821] p-5 flex items-center justify-between gap-5 min-h-[196px]"
        >
          <div className="relative w-36 h-36 lg:w-40 lg:h-40 shrink-0 rounded-xl overflow-hidden shadow-2xl">
            <AlbumArt song={activeSong} isPlaying={isCurrentActive && isPlaying} size="fill" />
          </div>

          <div className="flex-1 min-w-0 space-y-3">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-brand-500/15 text-brand-400">
                {activeSong.genre}
              </span>
              {activeSong.plays && (
                <span className="text-xs text-gray-400">{activeSong.plays} plays</span>
              )}
              <span className="text-xs font-mono text-gray-400 tabular-nums">
                · {formatDuration(activeSong.duration)}
              </span>
            </div>

            <div className="min-w-0">
              <h3 className="text-2xl font-bold text-white tracking-tight truncate">
                {activeSong.title}
              </h3>
              <p className="text-sm text-gray-400 truncate mt-0.5">{activeSong.artist}</p>
            </div>

            <div className="flex items-center gap-2.5 pt-1">
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
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-brand-500 hover:bg-brand-600 text-white text-xs font-semibold shadow-glow-sm transition active:scale-95"
              >
                {isCurrentActive && isPlaying ? (
                  <>
                    <Pause className="w-3.5 h-3.5 fill-current" />
                    <span>Pause Track</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Play Now</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => onAddToPlaylist(activeSong)}
                aria-label={`Add ${activeSong.title} to playlist`}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-white/[0.06] hover:bg-white/10 text-gray-200 text-xs font-semibold transition active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add to Playlist</span>
              </button>
            </div>
          </div>
        </div>

        {/* Up Next Spotlight Queue Preview */}
        <div className="hidden xl:flex xl:col-span-4 flex-col justify-between gap-2.5 rounded-2xl border border-white/[0.06] bg-[#141821]/70 p-3.5">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 px-1">
            In This Showcase
          </span>
          <div className="space-y-2 flex-1 flex flex-col justify-center">
            {[prevSong, nextSong].filter(Boolean).map((item) => {
              if (!item) return null;
              const targetIdx = featured.findIndex((f) => f.id === item.id);
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    if (targetIdx >= 0) setActiveIndex(targetIdx);
                  }}
                  className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-white/[0.05] transition text-left group"
                >
                  <AlbumArt song={item} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-gray-200 group-hover:text-white truncate">
                      {item.title}
                    </p>
                    <p className="text-[11px] text-gray-400 truncate">{item.artist}</p>
                  </div>
                  <span className="text-[11px] font-mono text-gray-500 tabular-nums">
                    {formatDuration(item.duration)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
