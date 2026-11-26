import { useEffect, useRef, useState } from 'react';
import {
  Disc3,
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
import { formatDuration, getSongGradient } from '../../utils/formatters';
import { ElasticSlider, SloshGauge } from '../reactbits';

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

  const duration = currentSong?.duration ?? 0;
  const gradient = currentSong ? getSongGradient(currentSong) : 'from-slate-700 to-slate-900';
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
      className="fixed bottom-[70px] md:bottom-0 left-3 right-3 md:left-0 md:right-0 z-40"
    >
      {/* Mobile Compact Floating Player (< md) */}
      <div className="md:hidden relative bg-surface-card/95 backdrop-blur-xl border border-white/10 rounded-2xl p-2.5 shadow-floating-player space-y-1">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <div
              className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${gradient} flex items-center justify-center shrink-0 border border-white/10`}
            >
              <Disc3
                className={`w-5 h-5 text-white ${isPlaying && currentSong ? 'animate-spin' : ''}`}
                style={{ animationDuration: '5s' }}
              />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-white truncate">
                {currentSong ? currentSong.title : 'Nothing playing'}
              </p>
              <p className="text-[11px] text-brand-400 font-medium truncate">
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
              className="w-8 h-8 rounded-full flex items-center justify-center text-gray-300 hover:text-white disabled:opacity-30 transition"
            >
              <SkipBack className="w-4 h-4 fill-current" />
            </button>
            <button
              type="button"
              onClick={onTogglePlay}
              disabled={!currentSong}
              aria-label={isPlaying ? 'Pause' : 'Play'}
              className="w-9 h-9 rounded-full bg-brand-500 text-white flex items-center justify-center shadow-glow-sm active:scale-95 disabled:opacity-40 transition"
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
              className="w-8 h-8 rounded-full flex items-center justify-center text-gray-300 hover:text-white disabled:opacity-30 transition"
            >
              <SkipForward className="w-4 h-4 fill-current" />
            </button>
          </div>
        </div>

        {/* Mobile Elastic Scrubber */}
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
              maxStretch={16}
              bounce={0.4}
              trackColor="rgba(255, 255, 255, 0.14)"
              rangeColor="#ff5722"
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

      {/* Tablet & Desktop Full Player Dock (>= md) */}
      <div className="hidden md:flex h-24 bg-surface-sidebar/95 backdrop-blur-2xl border-t border-white/10 px-6 items-center justify-between gap-6 shadow-2xl">
        {/* Left: Track Info */}
        <div className="flex items-center gap-3.5 w-1/4 min-w-[200px]">
          <div
            className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${gradient} flex items-center justify-center shadow-lg shrink-0 border border-white/10`}
          >
            <Disc3
              className={`w-6 h-6 text-white ${isPlaying && currentSong ? 'animate-spin' : ''}`}
              style={{ animationDuration: '6s' }}
            />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-white truncate">
                {currentSong ? currentSong.title : 'Select a track'}
              </h4>
              {currentSong && (
                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-white/10 text-gray-300 uppercase shrink-0">
                  HD
                </span>
              )}
            </div>
            <p className="text-xs text-gray-400 truncate mt-0.5">
              {currentSong
                ? `${currentSong.artist}${queueLabel ? ` · ${queueLabel}` : ''}`
                : 'Ready to play'}
            </p>
          </div>
          <button
            type="button"
            onClick={onToggleLike}
            disabled={!currentSong}
            aria-label={isLiked ? 'Unlike song' : 'Like song'}
            className={`p-2 rounded-full transition disabled:opacity-30 ${
              isLiked ? 'text-brand-500' : 'text-gray-400 hover:text-brand-400'
            }`}
          >
            <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Center: Controls + ElasticSlider Scrubber */}
        <div className="flex flex-col items-center gap-1 flex-1 max-w-xl min-w-0">
          <div className="flex items-center gap-5">
            <button
              type="button"
              onClick={onToggleShuffle}
              aria-label="Toggle shuffle"
              aria-pressed={isShuffle}
              className={`transition p-1 ${
                isShuffle ? 'text-brand-400' : 'text-gray-400 hover:text-white'
              }`}
              title="Shuffle"
            >
              <Shuffle className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onPrev}
              disabled={!currentSong || !hasPrev}
              aria-label="Previous track"
              title="Previous"
              className="text-gray-200 hover:text-white disabled:opacity-30 transition p-1"
            >
              <SkipBack className="w-4 h-4 fill-current" />
            </button>
            <button
              type="button"
              onClick={onTogglePlay}
              disabled={!currentSong}
              aria-label={isPlaying ? 'Pause' : 'Play'}
              className="w-11 h-11 rounded-full bg-brand-500 hover:bg-brand-600 text-white flex items-center justify-center shadow-glow-coral transition-transform hover:scale-105 active:scale-95 disabled:opacity-40"
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
              className="text-gray-200 hover:text-white disabled:opacity-30 transition p-1"
            >
              <SkipForward className="w-4 h-4 fill-current" />
            </button>
            <button
              type="button"
              onClick={onToggleRepeat}
              aria-label="Toggle repeat"
              aria-pressed={isRepeat}
              className={`transition p-1 ${
                isRepeat ? 'text-brand-400' : 'text-gray-400 hover:text-white'
              }`}
              title="Repeat"
            >
              <Repeat className="w-4 h-4" />
            </button>
          </div>

          <div className="w-full flex items-center gap-3">
            <span className="text-[11px] font-mono text-gray-400 w-10 text-right tabular-nums">
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
                valuePosition="bubble"
                formatValue={(val) => formatDuration(val)}
                thickness={5}
                activeThickness={10}
                restOpacity={0.95}
                maxStretch={24}
                bounce={0.45}
                thumb
                thumbColor="#ffffff"
                trackColor="rgba(255, 255, 255, 0.14)"
                rangeColor="#ff5722"
                disabled={!currentSong}
                ariaLabel="Playback progress"
                className="!w-full"
              />
            </div>
            <span className="text-[11px] font-mono text-gray-400 w-10 tabular-nums">
              {formatDuration(duration)}
            </span>
          </div>
        </div>

        {/* Right: Queue & SloshGauge Volume Popover */}
        <div className="flex items-center justify-end gap-3 w-1/4 min-w-[160px]">
          <button
            type="button"
            onClick={onOpenPlaylistManager}
            aria-label="Open Playlist Manager"
            title="Playlist Manager"
            className="text-gray-400 hover:text-white transition p-2 rounded-xl hover:bg-white/5"
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
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold transition ${
                isVolumeOpen
                  ? 'bg-brand-500/20 border-brand-500/40 text-brand-400'
                  : 'bg-surface-card hover:bg-surface-cardHover border-white/10 text-gray-300 hover:text-white'
              }`}
            >
              <VolumeIcon className="w-4 h-4" />
              <span className="font-mono tabular-nums">{volumePercent}%</span>
            </button>

            {isVolumeOpen && (
              <div
                role="dialog"
                aria-label="Volume control"
                className="absolute bottom-full right-0 mb-3 p-3.5 rounded-2xl bg-surface-card/95 backdrop-blur-xl border border-white/15 shadow-2xl flex flex-col items-center gap-2.5 z-50"
              >
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  Volume
                </span>
                <SloshGauge
                  value={volumePercent}
                  onChange={(val) => onVolumeChange(Number((val / 100).toFixed(2)))}
                  interactive
                  showValue
                  liquidColor="#ff5722"
                  glassColor="#12161f"
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
                  className="text-[11px] font-semibold text-gray-300 hover:text-brand-400 transition"
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
