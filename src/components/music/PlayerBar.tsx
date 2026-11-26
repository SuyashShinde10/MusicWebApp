import { useEffect, useRef, useState } from 'react';
import {
  Heart,
  ListMusic,
  Pause,
  Play,
  Repeat,
  Shuffle,
  SkipBack,
  SkipForward,
  Volume1,
  Volume2,
  VolumeX,
} from 'lucide-react';
import type { Song } from '../../types/music';
import { formatDuration } from '../../utils/formatters';
import { animateMicroPop } from '../../utils/gsapAnimations';
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
}: PlayerBarProps) {
  const [isVolumeOpen, setIsVolumeOpen] = useState(false);
  const volumeBoxRef = useRef<HTMLDivElement>(null);
  const desktopLikeRef = useRef<HTMLButtonElement>(null);
  const desktopPlayRef = useRef<HTMLButtonElement>(null);

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

  return (
    <footer
      aria-label="Now Playing"
      className="fixed bottom-[66px] md:bottom-0 left-3 right-3 md:left-0 md:right-0 z-40"
    >
      {/* Mobile Compact Floating Player (< md) */}
      <div className="md:hidden relative bg-[#15171c]/95 backdrop-blur-xl border border-white/10 rounded-2xl p-2.5 shadow-floating-player space-y-1">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            {currentSong ? (
              <AlbumArt song={currentSong} isPlaying={isPlaying} size="sm" />
            ) : (
              <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 shrink-0" />
            )}
            <div className="min-w-0">
              <p className="text-xs font-semibold text-white truncate">
                {currentSong ? currentSong.title : 'Nothing playing'}
              </p>
              <p className="text-[11px] text-gray-400 truncate">
                {currentSong ? currentSong.artist : 'Choose a song from library'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={onPrev}
              disabled={!currentSong || !hasPrev}
              aria-label="Previous track"
              className="w-8 h-8 rounded-full flex items-center justify-center text-gray-300 hover:text-white disabled:opacity-30 transition active:scale-90"
            >
              <SkipBack className="w-4 h-4 fill-current" />
            </button>
            <button
              type="button"
              onClick={onTogglePlay}
              disabled={!currentSong}
              aria-label={isPlaying ? 'Pause' : 'Play'}
              className="w-9 h-9 rounded-full border border-white/30 bg-white/15 hover:bg-teal-600 text-white flex items-center justify-center active:scale-90 disabled:opacity-40 transition"
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
              className="w-8 h-8 rounded-full flex items-center justify-center text-gray-300 hover:text-white disabled:opacity-30 transition active:scale-90"
            >
              <SkipForward className="w-4 h-4 fill-current" />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 px-1">
          <span className="text-[10px] font-mono text-gray-400 tabular-nums">
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
              trackColor="rgba(255, 255, 255, 0.16)"
              rangeColor="#e5e7eb"
              disabled={!currentSong}
              ariaLabel="Mobile playback progress"
              className="!w-full"
            />
          </div>
          <span className="text-[10px] font-mono text-gray-400 tabular-nums">
            {formatDuration(duration)}
          </span>
        </div>
      </div>

      {/* Tablet & Desktop Full Player Dock (>= md) matching reference bar */}
      <div className="hidden md:flex h-20 bg-[#101217]/95 backdrop-blur-2xl border-t border-white/[0.08] px-6 items-center justify-between gap-6 shadow-2xl">
        {/* Left: Cover + Track Info + Transport Buttons */}
        <div className="flex items-center gap-4 min-w-0">
          <div className="flex items-center gap-3 min-w-[175px] max-w-[230px]">
            {currentSong ? (
              <AlbumArt song={currentSong} isPlaying={isPlaying} size="md" />
            ) : (
              <div className="w-11 h-11 rounded-xl bg-white/5 border border-white/10 shrink-0" />
            )}
            <div className="min-w-0">
              <h4 className="text-sm font-semibold text-white truncate">
                {currentSong ? currentSong.title : 'Select a track'}
              </h4>
              <p className="text-xs text-gray-400 truncate">
                {currentSong
                  ? `${currentSong.artist}${queueLabel ? ` · ${queueLabel}` : ''}`
                  : 'Ready to play'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={onPrev}
              disabled={!currentSong || !hasPrev}
              aria-label="Previous track"
              title="Previous"
              className="text-gray-300 hover:text-white disabled:opacity-30 transition p-1.5 active:scale-90"
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
              className="w-10 h-10 rounded-full border border-white/35 bg-white/10 hover:bg-teal-600 hover:border-teal-400 text-white flex items-center justify-center transition-all hover:scale-105 active:scale-90 disabled:opacity-40"
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
              className="text-gray-300 hover:text-white disabled:opacity-30 transition p-1.5 active:scale-90"
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
            thumbColor="#ffffff"
            trackColor="rgba(255, 255, 255, 0.16)"
            rangeColor="#ffffff"
            disabled={!currentSong}
            ariaLabel="Playback progress"
            className="!w-full"
          />
          <div className="flex items-center justify-between text-[10px] font-mono text-gray-400 tabular-nums -mt-1 px-0.5">
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
              isLiked ? 'text-rose-400' : 'text-gray-400 hover:text-white'
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
              isShuffle ? 'text-teal-400' : 'text-gray-400 hover:text-white'
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
              isRepeat ? 'text-teal-400' : 'text-gray-400 hover:text-white'
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
            className="text-gray-400 hover:text-white transition p-1.5 rounded-full hover:bg-white/5 active:scale-90"
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
                  ? 'bg-teal-600/20 border-teal-500/40 text-teal-400'
                  : 'bg-white/[0.04] hover:bg-white/[0.08] border-white/[0.08] text-gray-300 hover:text-white'
              }`}
            >
              <VolumeIcon className="w-4 h-4" />
              <span className="font-mono tabular-nums text-[11px]">{volumePercent}%</span>
            </button>

            {isVolumeOpen && (
              <div
                role="dialog"
                aria-label="Volume control"
                className="absolute bottom-full right-0 mb-3 p-3.5 rounded-2xl bg-[#15171c]/95 backdrop-blur-xl border border-white/15 shadow-2xl flex flex-col items-center gap-2.5 z-50"
              >
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  Volume
                </span>
                <SloshGauge
                  value={volumePercent}
                  onChange={(val) => onVolumeChange(Number((val / 100).toFixed(2)))}
                  interactive
                  showValue
                  liquidColor="#14b8a6"
                  glassColor="#0b0d11"
                  width={68}
                  height={144}
                  radius={16}
                  ticks={4}
                  viscosity={0.18}
                  tilt={0.45}
                  splash={0.42}
                  unit="%"
                  ariaLabel="Volume"
                />
                <button
                  type="button"
                  onClick={() => onVolumeChange(volumePercent === 0 ? 0.75 : 0)}
                  className="text-[11px] font-semibold text-gray-300 hover:text-teal-400 transition"
                >
                  {volumePercent === 0 ? 'Unmute (75%)' : 'Mute'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}
