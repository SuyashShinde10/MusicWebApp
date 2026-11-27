import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import {
  Heart,
  ListMusic,
  Maximize2,
  Pause,
  Play,
  Repeat,
  Shuffle,
  SkipBack,
  SkipForward,
  Volume1,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';
import type { Song } from '../../types/music';
import { formatDuration } from '../../utils/formatters';
import { animateMicroPop, prefersReducedMotion } from '../../utils/gsapAnimations';
import { ElasticSlider, SloshGauge } from '../reactbits';
import { AlbumArt } from './AlbumArt';

export interface PlayerBarProps {
  currentSong: Song | null;
  isPlaying: boolean;
  elapsedSeconds: number;
  isShuffle: boolean;
  isRepeat: boolean;
  isLiked: boolean;
  volume: number;
  hasNext: boolean;
  hasPrev: boolean;
  isDark?: boolean;
  queueLabel?: string;
  onTogglePlay: () => void;
  onNext: () => void;
  onPrev: () => void;
  onToggleShuffle: () => void;
  onToggleRepeat: () => void;
  onToggleLike: () => void;
  onSeek: (seconds: number) => void;
  onVolumeChange: (volume: number) => void;
  onOpenPlaylistManager: () => void;
  onExpand?: () => void;
  onClose?: () => void;
}

export function PlayerBar({
  currentSong,
  isPlaying,
  elapsedSeconds,
  isShuffle,
  isRepeat,
  isLiked,
  volume,
  hasNext,
  hasPrev,
  isDark = false,
  queueLabel,
  onTogglePlay,
  onNext,
  onPrev,
  onToggleShuffle,
  onToggleRepeat,
  onToggleLike,
  onSeek,
  onVolumeChange,
  onOpenPlaylistManager,
  onExpand,
  onClose,
}: PlayerBarProps) {
  const [isVolumeOpen, setIsVolumeOpen] = useState(false);
  const footerRef = useRef<HTMLElement>(null);
  const volumeBoxRef = useRef<HTMLDivElement>(null);
  const volumePopoverRef = useRef<HTMLDivElement>(null);
  const desktopLikeRef = useRef<HTMLButtonElement>(null);
  const desktopPlayRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!footerRef.current || prefersReducedMotion()) return;
    gsap.fromTo(
      footerRef.current,
      { y: 18, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.28, ease: 'power3.out', clearProps: 'transform,opacity' }
    );
  }, []);

  useEffect(() => {
    if (!isVolumeOpen || !volumePopoverRef.current || prefersReducedMotion()) return;
    gsap.fromTo(
      volumePopoverRef.current,
      { y: 8, scale: 0.94, opacity: 0 },
      { y: 0, scale: 1, opacity: 1, duration: 0.2, ease: 'power3.out', clearProps: 'transform,opacity' }
    );
  }, [isVolumeOpen]);

  const duration = currentSong?.duration ?? 0;
  const volumePercent = Math.round(volume * 100);

  useEffect(() => {
    if (!isVolumeOpen) return;
    const handleOutside = (e: MouseEvent) => {
      if (volumeBoxRef.current && !volumeBoxRef.current.contains(e.target as Node)) {
        setIsVolumeOpen(false);
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsVolumeOpen(false);
    };
    window.addEventListener('mousedown', handleOutside);
    window.addEventListener('keydown', handleEscape);
    return () => {
      window.removeEventListener('mousedown', handleOutside);
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isVolumeOpen]);

  const VolumeIcon = volumePercent === 0 ? VolumeX : volumePercent < 50 ? Volume1 : Volume2;

  const sliderRangeColor = isDark ? '#ffffff' : '#0f172a';
  const sliderTrackColor = isDark ? 'rgba(255, 255, 255, 0.16)' : 'rgba(15, 23, 42, 0.16)';
  const sliderThumbColor = isDark ? '#ffffff' : '#f97316';

  return (
    <footer
      ref={footerRef}
      aria-label="Now Playing"
      className="fixed bottom-[66px] md:bottom-0 left-3 right-3 md:left-0 md:right-0 z-40"
    >
      {/* Mobile Compact Floating Player (< md) */}
      <div className="md:hidden relative bg-white border-slate-200 dark:bg-[#15171c] dark:border-white/10 border rounded-2xl p-2.5 shadow-xl dark:shadow-floating-player space-y-1">
        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => currentSong && onExpand?.()}
            disabled={!currentSong}
            aria-label="Expand Now Playing"
            className="flex items-center gap-2.5 min-w-0 flex-1 text-left group disabled:cursor-default"
          >
            {currentSong ? (
              <AlbumArt song={currentSong} isPlaying={isPlaying} size="sm" />
            ) : (
              <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 dark:bg-white/5 dark:border-white/10 shrink-0" />
            )}
            <div className="min-w-0">
              <p className="text-xs font-semibold text-slate-900 dark:text-white truncate group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                {currentSong ? currentSong.title : 'Nothing playing'}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-gray-400 truncate">
                {currentSong ? currentSong.artist : 'Choose a song from library'}
              </p>
            </div>
          </button>

          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={onPrev}
              disabled={!currentSong || !hasPrev}
              aria-label="Previous track"
              className="w-8 h-8 rounded-full flex items-center justify-center text-slate-600 hover:text-slate-900 dark:text-gray-300 dark:hover:text-white disabled:opacity-30 transition active:scale-90"
            >
              <SkipBack className="w-4 h-4 fill-current" />
            </button>
            <button
              type="button"
              onClick={onTogglePlay}
              disabled={!currentSong}
              aria-label={isPlaying ? 'Pause' : 'Play'}
              className="w-9 h-9 rounded-full bg-[#f97316] hover:bg-[#ea580c] text-white flex items-center justify-center active:scale-90 disabled:opacity-40 transition shadow-sm"
            >
              {isPlaying ? (
                <Pause className="w-4 h-4 fill-current" />
              ) : (
                <Play className="w-4 h-4 fill-current ml-0.5" />
              )}
            </button>
            <button
              type="button"
              onClick={onNext}
              disabled={!currentSong || !hasNext}
              aria-label="Next track"
              className="w-8 h-8 rounded-full flex items-center justify-center text-slate-600 hover:text-slate-900 dark:text-gray-300 dark:hover:text-white disabled:opacity-30 transition active:scale-90"
            >
              <SkipForward className="w-4 h-4 fill-current" />
            </button>
            {onExpand && (
            <button
              type="button"
              onClick={onExpand}
              disabled={!currentSong}
              aria-label="Open full Now Playing sheet"
              title="Expand Now Playing"
              className="w-8 h-8 rounded-full flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-white/10 transition active:scale-90 disabled:opacity-30"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          )}

          {onClose && (
              <button
                type="button"
                onClick={onClose}
                aria-label="Close player"
                title="Close player"
                className="w-7 h-7 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-900 hover:bg-slate-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-white/10 transition active:scale-90"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 px-1">
          <span className="text-[10px] font-mono text-slate-500 dark:text-gray-400 tabular-nums">
            {formatDuration(elapsedSeconds)}
          </span>
          <div className="flex-1 min-w-0">
            <ElasticSlider
              value={elapsedSeconds}
              startingValue={0}
              maxValue={Math.max(1, duration)}
              onChange={(val) => onSeek(Math.round(val))}
              leftIcon={null}
              rightIcon={null}
              valuePosition="none"
              thickness={4}
              activeThickness={8}
              restOpacity={0.95}
              maxStretch={14}
              bounce={0.4}
              trackColor={sliderTrackColor}
              rangeColor="#f97316"
              disabled={!currentSong}
              ariaLabel="Mobile playback progress"
              className="!w-full"
            />
          </div>
          <span className="text-[10px] font-mono text-slate-500 dark:text-gray-400 tabular-nums">
            {formatDuration(duration)}
          </span>
        </div>
      </div>

      {/* Tablet & Desktop Full Player Dock (>= md) */}
      <div className="hidden md:flex h-20 bg-white/95 border-slate-200/90 dark:bg-[#101217]/95 dark:border-white/[0.08] backdrop-blur-2xl border-t px-6 items-center justify-between gap-6 shadow-lg dark:shadow-2xl">
        {/* Left: Cover + Track Info + Transport Buttons */}
        <div className="flex items-center gap-4 min-w-0">
          <button
            type="button"
            onClick={() => currentSong && onExpand?.()}
            disabled={!currentSong}
            aria-label="Expand Now Playing"
            title={currentSong ? 'Open full Now Playing view' : undefined}
            className="flex items-center gap-3 min-w-[175px] max-w-[230px] text-left group disabled:cursor-default"
          >
            {currentSong ? (
              <AlbumArt song={currentSong} isPlaying={isPlaying} size="md" />
            ) : (
              <div className="w-11 h-11 rounded-xl bg-slate-100 border border-slate-200 dark:bg-white/5 dark:border-white/10 shrink-0" />
            )}
            <div className="min-w-0">
              <h4 className="text-sm font-semibold text-slate-900 dark:text-white truncate group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                {currentSong ? currentSong.title : 'Select a track'}
              </h4>
              <p className="text-xs text-slate-500 dark:text-gray-400 truncate">
                {currentSong
                  ? `${currentSong.artist}${queueLabel ? ` · ${queueLabel}` : ''}`
                  : 'Ready to play'}
              </p>
            </div>
          </button>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={onPrev}
              disabled={!currentSong || !hasPrev}
              aria-label="Previous track"
              title="Previous"
              className="text-slate-600 hover:text-slate-950 dark:text-gray-300 dark:hover:text-white disabled:opacity-30 transition p-1.5 active:scale-90"
            >
              <SkipBack className="w-4 h-4 fill-current" />
            </button>
            <button
              ref={desktopPlayRef}
              type="button"
              onClick={() => {
                if (desktopPlayRef.current) animateMicroPop(desktopPlayRef.current);
                onTogglePlay();
              }}
              disabled={!currentSong}
              aria-label={isPlaying ? 'Pause' : 'Play'}
              className="w-10 h-10 rounded-full border border-slate-300 bg-slate-900 hover:bg-[#f97316] hover:border-[#f97316] text-white dark:border-white/35 dark:bg-white/10 dark:hover:bg-orange-600 dark:hover:border-orange-400 flex items-center justify-center transition-all hover:scale-105 active:scale-90 disabled:opacity-40"
            >
              {isPlaying ? (
                <Pause className="w-4 h-4 fill-current" />
              ) : (
                <Play className="w-4 h-4 fill-current ml-0.5" />
              )}
            </button>
            <button
              type="button"
              onClick={onNext}
              disabled={!currentSong || !hasNext}
              aria-label="Next track"
              title="Next"
              className="text-slate-600 hover:text-slate-950 dark:text-gray-300 dark:hover:text-white disabled:opacity-30 transition p-1.5 active:scale-90"
            >
              <SkipForward className="w-4 h-4 fill-current" />
            </button>
          </div>
        </div>

        {/* Center: ElasticSlider Progress Bar with timestamps underneath */}
        <div className="flex-1 max-w-xl min-w-0 flex flex-col justify-center">
          <ElasticSlider
            value={elapsedSeconds}
            startingValue={0}
            maxValue={Math.max(1, duration)}
            onChange={(val) => onSeek(Math.round(val))}
            leftIcon={null}
            rightIcon={null}
            valuePosition="bubble"
            formatValue={(val) => formatDuration(val)}
            thickness={4}
            activeThickness={9}
            restOpacity={0.95}
            maxStretch={24}
            bounce={0.45}
            thumb
            thumbColor={sliderThumbColor}
            trackColor={sliderTrackColor}
            rangeColor={sliderRangeColor}
            disabled={!currentSong}
            ariaLabel="Playback progress"
            className="!w-full"
          />
          <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 dark:text-gray-400 tabular-nums -mt-1 px-0.5">
            <span>{formatDuration(elapsedSeconds)}</span>
            <span>{formatDuration(duration)}</span>
          </div>
        </div>

        {/* Right: Like, Shuffle, Repeat, Queue & SloshGauge Volume Popover */}
        <div className="flex items-center justify-end gap-2 shrink-0">
          <button
            ref={desktopLikeRef}
            type="button"
            onClick={() => {
              if (desktopLikeRef.current) animateMicroPop(desktopLikeRef.current);
              onToggleLike();
            }}
            disabled={!currentSong}
            aria-label={isLiked ? 'Unlike song' : 'Like song'}
            className={`p-2 rounded-full transition disabled:opacity-30 ${
              isLiked
                ? 'text-rose-500 dark:text-rose-400'
                : 'text-slate-500 hover:text-slate-900 dark:text-gray-400 dark:hover:text-white'
            }`}
          >
            <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
          </button>

          <button
            type="button"
            onClick={onToggleShuffle}
            aria-label="Toggle shuffle"
            aria-pressed={isShuffle}
            className={`transition p-1.5 rounded-full active:scale-90 ${
              isShuffle
                ? 'text-orange-600 dark:text-orange-400'
                : 'text-slate-500 hover:text-slate-900 dark:text-gray-400 dark:hover:text-white'
            }`}
            title="Shuffle"
          >
            <Shuffle className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={onToggleRepeat}
            aria-label="Toggle repeat"
            aria-pressed={isRepeat}
            className={`transition p-1.5 rounded-full active:scale-90 ${
              isRepeat
                ? 'text-orange-600 dark:text-orange-400'
                : 'text-slate-500 hover:text-slate-900 dark:text-gray-400 dark:hover:text-white'
            }`}
            title="Repeat"
          >
            <Repeat className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={onOpenPlaylistManager}
            aria-label="Open Playlist Manager"
            title="Playlist Manager"
            className="text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-white/5 transition p-1.5 rounded-full active:scale-90"
          >
            <ListMusic className="w-4 h-4" />
          </button>

          <div ref={volumeBoxRef} className="relative">
            <button
              type="button"
              onClick={() => setIsVolumeOpen((prev) => !prev)}
              aria-label={`Volume ${volumePercent}%`}
              aria-expanded={isVolumeOpen}
              title="Adjust volume"
              className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border text-xs font-semibold transition active:scale-95 ${
                isVolumeOpen
                  ? 'bg-orange-500/15 border-orange-500/40 text-orange-700 dark:text-orange-400'
                  : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700 dark:bg-white/[0.04] dark:hover:bg-white/[0.08] dark:border-white/[0.08] dark:text-gray-300 dark:hover:text-white'
              }`}
            >
              <VolumeIcon className="w-4 h-4" />
              <span className="font-mono tabular-nums text-[11px]">{volumePercent}%</span>
            </button>

            {isVolumeOpen && (
              <div
                ref={volumePopoverRef}
                role="dialog"
                aria-label="Volume control"
                className="absolute bottom-full right-0 mb-3 p-3.5 rounded-2xl bg-white border-slate-200 text-slate-800 dark:bg-[#161920] dark:border-white/15 dark:text-white border shadow-[0_20px_50px_-12px_rgba(15,23,42,0.28)] dark:shadow-[0_24px_60px_-12px_rgba(0,0,0,0.85)] flex flex-col items-center gap-2.5 z-50"
              >
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-gray-400">
                  Volume
                </span>
                <SloshGauge
                  value={volumePercent}
                  onChange={(val) => onVolumeChange(Number((val / 100).toFixed(2)))}
                  interactive
                  showValue
                  liquidColor="#f97316"
                  glassColor={isDark ? '#0b0d11' : '#e2e8f0'}
                  width={72}
                  height={148}
                  radius={16}
                  ticks={4}
                  viscosity={0.18}
                  tilt={0.45}
                  splash={0.42}
                  unit="%"
                  ariaLabel="Volume"
                  className="ring-1 ring-slate-200/80 dark:ring-white/10"
                />
                <button
                  type="button"
                  onClick={() => onVolumeChange(volumePercent === 0 ? 0.75 : 0)}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 dark:bg-white/[0.06] dark:hover:bg-white/[0.12] dark:text-gray-300 dark:hover:text-white transition active:scale-95"
                >
                  {volumePercent === 0 ? (
                    <>
                      <Volume2 className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400" />
                      <span>Unmute (75%)</span>
                    </>
                  ) : (
                    <>
                      <VolumeX className="w-3.5 h-3.5 text-slate-500 dark:text-gray-400" />
                      <span>Mute</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {onExpand && (
            <button
              type="button"
              onClick={onExpand}
              disabled={!currentSong}
              aria-label="Open full Now Playing sheet"
              title="Expand Now Playing"
              className="w-8 h-8 rounded-full flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-white/10 transition active:scale-90 disabled:opacity-30"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          )}

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Close player"
              title="Close player"
              className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-900 hover:bg-slate-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-white/10 transition active:scale-90 ml-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </footer>
  );
}
