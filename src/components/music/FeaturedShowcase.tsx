import { useState } from 'react';
import { ChevronLeft, ChevronRight, Music2, Pause, Play, Plus } from 'lucide-react';
import type { Song } from '../../types/music';
import { formatDuration, getSongGradient } from '../../utils/formatters';

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

  if (featured.length === 0) return null;

  const safeIndex = activeIndex % featured.length;
  const activeSong = featured[safeIndex];
  if (!activeSong) return null;

  const prevSong = featured[(safeIndex - 1 + featured.length) % featured.length];
  const nextSong = featured[(safeIndex + 1) % featured.length];

  const isCurrentActive = currentSongId === activeSong.id;

  return (
    <section aria-label="Featured Showcase" className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-brand-400">
            Editor&apos;s Pick
          </p>
          <h2 className="text-lg sm:text-xl font-extrabold text-white tracking-tight">
            Trending Showcase
          </h2>
        </div>

        <div className="hidden md:flex items-center gap-2">
          <button
            type="button"
            onClick={() =>
              setActiveIndex((prev) => (prev - 1 + featured.length) % featured.length)
            }
            aria-label="Previous featured song"
            className="w-9 h-9 rounded-full bg-surface-card hover:bg-surface-cardHover border border-white/10 text-gray-300 hover:text-white flex items-center justify-center transition"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setActiveIndex((prev) => (prev + 1) % featured.length)}
            aria-label="Next featured song"
            className="w-9 h-9 rounded-full bg-surface-card hover:bg-surface-cardHover border border-white/10 text-gray-300 hover:text-white flex items-center justify-center transition"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Mobile Featured Hero Card (< md) */}
      <div className="md:hidden">
        <div
          className={`relative w-full h-[210px] rounded-3xl overflow-hidden p-5 flex flex-col justify-between shadow-2xl border border-white/10 bg-gradient-to-br ${getSongGradient(
            activeSong
          )}`}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
          <div className="relative z-10 flex items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-brand-500/90 text-white shadow-glow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              Featured Release
            </span>
            <span className="text-xs font-mono text-white/85 bg-black/45 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10">
              {formatDuration(activeSong.duration)}
            </span>
          </div>

          <div className="relative z-10 flex items-end justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[11px] font-bold text-brand-400 uppercase tracking-wider">
                {activeSong.genre}
              </p>
              <h3 className="text-xl font-extrabold text-white tracking-tight truncate">
                {activeSong.title}
              </h3>
              <p className="text-sm text-gray-200 truncate">{activeSong.artist}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => onAddToPlaylist(activeSong)}
                aria-label={`Add ${activeSong.title} to playlist`}
                className="w-10 h-10 rounded-full bg-black/45 hover:bg-black/65 border border-white/15 text-white flex items-center justify-center transition"
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
                className="w-12 h-12 rounded-full bg-brand-500 hover:bg-brand-600 text-white flex items-center justify-center shadow-glow-coral transition active:scale-95"
              >
                {isCurrentActive && isPlaying ? (
                  <Pause className="w-5 h-5 fill-current" />
                ) : (
                  <Play className="w-5 h-5 fill-current ml-0.5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop / Tablet 3D Perspective Showcase (>= md) */}
      <div className="hidden md:flex items-center justify-center gap-4 py-3 card-perspective-container overflow-hidden">
        {prevSong && featured.length > 2 && (
          <button
            type="button"
            onClick={() =>
              setActiveIndex((prev) => (prev - 1 + featured.length) % featured.length)
            }
            className={`w-48 lg:w-56 h-56 rounded-3xl p-4 flex flex-col justify-between text-left border border-white/10 bg-gradient-to-br ${getSongGradient(
              prevSong
            )} album-3d-flank-left transition-all duration-300 hover:brightness-100 shrink-0 relative overflow-hidden`}
          >
            <div className="absolute inset-0 bg-black/30" />
            <span className="relative z-10 self-start text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-black/45 text-white border border-white/10">
              {prevSong.genre}
            </span>
            <div className="relative z-10">
              <h3 className="text-sm font-bold text-white truncate">{prevSong.title}</h3>
              <p className="text-xs text-gray-300 truncate">{prevSong.artist}</p>
            </div>
          </button>
        )}

        <div
          className={`w-64 lg:w-72 h-64 rounded-3xl p-5 flex flex-col justify-between border border-white/20 bg-gradient-to-br ${getSongGradient(
            activeSong
          )} album-3d-active transition-all duration-300 relative overflow-hidden shrink-0`}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          <div className="relative z-10 flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-black/45 backdrop-blur-md text-white border border-white/15">
              {activeSong.genre}
            </span>
            <button
              type="button"
              onClick={() => onAddToPlaylist(activeSong)}
              aria-label={`Add ${activeSong.title} to playlist`}
              className="w-8 h-8 rounded-full bg-black/45 hover:bg-brand-500 text-white flex items-center justify-center border border-white/15 transition"
              title="Add to playlist"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <div className="relative z-10 flex items-center justify-center my-auto">
            <div className="w-16 h-16 rounded-2xl bg-brand-500/90 shadow-glow-coral flex items-center justify-center text-white">
              <Music2 className="w-8 h-8" />
            </div>
          </div>

          <div className="relative z-10 flex items-end justify-between gap-2">
            <div className="min-w-0">
              <h3 className="text-base font-extrabold text-white truncate">{activeSong.title}</h3>
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
              className="w-11 h-11 rounded-full bg-brand-500 hover:bg-brand-600 text-white flex items-center justify-center shadow-glow-coral transition hover:scale-105 active:scale-95 shrink-0"
            >
              {isCurrentActive && isPlaying ? (
                <Pause className="w-4 h-4 fill-current" />
              ) : (
                <Play className="w-4 h-4 fill-current ml-0.5" />
              )}
            </button>
          </div>
        </div>

        {nextSong && featured.length > 1 && (
          <button
            type="button"
            onClick={() => setActiveIndex((prev) => (prev + 1) % featured.length)}
            className={`w-48 lg:w-56 h-56 rounded-3xl p-4 flex flex-col justify-between text-left border border-white/10 bg-gradient-to-br ${getSongGradient(
              nextSong
            )} album-3d-flank-right transition-all duration-300 hover:brightness-100 shrink-0 relative overflow-hidden`}
          >
            <div className="absolute inset-0 bg-black/30" />
            <span className="relative z-10 self-start text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-black/45 text-white border border-white/10">
              {nextSong.genre}
            </span>
            <div className="relative z-10">
              <h3 className="text-sm font-bold text-white truncate">{nextSong.title}</h3>
              <p className="text-xs text-gray-300 truncate">{nextSong.artist}</p>
            </div>
          </button>
        )}
      </div>
    </section>
  );
}
