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
  Volume2,
  VolumeX,
} from 'lucide-react';
import type { Song } from '../../types/music';
import { formatDuration, getSongGradient } from '../../utils/formatters';

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
  const duration = currentSong?.duration ?? 0;
  const progressPercent = duration > 0 ? Math.min(100, (elapsedSeconds / duration) * 100) : 0;
  const gradient = currentSong ? getSongGradient(currentSong) : 'from-slate-700 to-slate-900';

  const handleSeekClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!currentSong || duration <= 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    onSeek(Math.floor(ratio * duration));
  };

  const handleVolumeClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    onVolumeChange(Number(ratio.toFixed(2)));
  };

  return (
    <footer
      aria-label="Now Playing"
      className="fixed bottom-[70px] md:bottom-0 left-3 right-3 md:left-0 md:right-0 z-40"
    >
      {/* Mobile Compact Floating Player (< md) */}
      <div className="md:hidden relative bg-surface-card/95 backdrop-blur-xl border border-white/10 rounded-2xl p-2.5 shadow-floating-player">
        <div
          onClick={handleSeekClick}
          role="progressbar"
          aria-valuenow={Math.round(progressPercent)}
          aria-valuemin={0}
          aria-valuemax={100}
          className="absolute -top-[1px] left-3 right-3 h-[3px] bg-white/10 rounded-full overflow-hidden cursor-pointer"
        >
          <div
            className="h-full bg-brand-500 rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

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

        {/* Center: Controls + Scrubber */}
        <div className="flex flex-col items-center gap-2 flex-1 max-w-xl min-w-0">
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
            <div
              onClick={handleSeekClick}
              role="slider"
              aria-label="Playback progress"
              aria-valuemin={0}
              aria-valuemax={duration}
              aria-valuenow={elapsedSeconds}
              tabIndex={0}
              className="relative flex-1 py-1.5 cursor-pointer group"
            >
              <div className="w-full h-1.5 bg-surface-card rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-brand-500 to-brand-400 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <div
                className="absolute top-1/2 -mt-1.5 w-3 h-3 bg-white rounded-full shadow opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                style={{ left: `calc(${progressPercent}% - 6px)` }}
              />
            </div>
            <span className="text-[11px] font-mono text-gray-400 w-10 tabular-nums">
              {formatDuration(duration)}
            </span>
          </div>
        </div>

        {/* Right: Queue & Volume */}
        <div className="flex items-center justify-end gap-4 w-1/4 min-w-[160px]">
          <button
            type="button"
            onClick={onOpenPlaylistManager}
            aria-label="Open Playlist Manager"
            title="Playlist Manager"
            className="text-gray-400 hover:text-white transition p-1.5 rounded-lg hover:bg-white/5"
          >
            <ListMusic className="w-4 h-4" />
          </button>

          <div className="hidden lg:flex items-center gap-2 group">
            <button
              type="button"
              onClick={() => onVolumeChange(volume > 0 ? 0 : 0.75)}
              aria-label={volume === 0 ? 'Unmute' : 'Mute'}
              className="text-gray-400 hover:text-white transition"
            >
              {volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <div
              onClick={handleVolumeClick}
              role="slider"
              aria-label="Volume"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(volume * 100)}
              className="w-24 h-1.5 bg-surface-card rounded-full overflow-hidden cursor-pointer"
            >
              <div
                className="h-full bg-gray-300 group-hover:bg-brand-500 transition-colors rounded-full"
                style={{ width: `${volume * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
