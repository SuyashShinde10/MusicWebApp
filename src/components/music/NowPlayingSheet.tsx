import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import {
  ChevronDown,
  Heart,
  ListMusic,
  Pause,
  Play,
  Plus,
  Repeat,
  Shuffle,
  SkipBack,
  SkipForward,
  Sparkles,
  Volume1,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';
import type { Song, SongId } from '../../types/music';
import { formatDuration } from '../../utils/formatters';
import { animateMicroPop, prefersReducedMotion } from '../../utils/gsapAnimations';
import { ElasticSlider, SloshGauge } from '../reactbits';
import { AlbumArt } from './AlbumArt';

interface NowPlayingSheetProps {
  isOpen: boolean;
  currentSong: Song | null;
  isPlaying: boolean;
  elapsedSeconds: number;
  isShuffle: boolean;
  isRepeat: boolean;
  isLiked: boolean;
  volume: number;
  hasNext: boolean;
  hasPrev: boolean;
  isDark: boolean;
  queueLabel?: string;
  queue: Song[];
  onClose: () => void;
  onDismissPlayer?: () => void;
  onTogglePlay: () => void;
  onNext: () => void;
  onPrev: () => void;
  onToggleShuffle: () => void;
  onToggleRepeat: () => void;
  onToggleLike: () => void;
  onSeek: (seconds: number) => void;
  onVolumeChange: (volume: number) => void;
  onAddToPlaylist: (song: Song) => void;
  onSelectQueueSong: (song: Song) => void;
  onOpenPlaylistManager: () => void;
}

export function NowPlayingSheet({
  isOpen,
  currentSong,
  isPlaying,
  elapsedSeconds,
  isShuffle,
  isRepeat,
  isLiked,
  volume,
  hasNext,
  hasPrev,
  isDark,
  queueLabel,
  queue,
  onClose,
  onDismissPlayer,
  onTogglePlay,
  onNext,
  onPrev,
  onToggleShuffle,
  onToggleRepeat,
  onToggleLike,
  onSeek,
  onVolumeChange,
  onAddToPlaylist,
  onSelectQueueSong,
  onOpenPlaylistManager,
}: NowPlayingSheetProps) {
  const [showQueueVolume, setShowQueueVolume] = useState(false);
  const sheetRef = useRef<HTMLDivElement>(null);
  const likeRef = useRef<HTMLButtonElement>(null);
  const playRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return undefined;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen || !sheetRef.current || prefersReducedMotion()) return;
    gsap.fromTo(
      sheetRef.current,
      { y: 36, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.3, ease: 'power3.out', clearProps: 'transform,opacity' }
    );
  }, [isOpen]);

  if (!isOpen || !currentSong) return null;

  const duration = currentSong.duration ?? 0;
  const remaining = Math.max(0, duration - elapsedSeconds);
  const volumePercent = Math.round(volume * 100);
  const ambientColor = currentSong.frameColor ?? '#f97316';

  const currentIdx = queue.findIndex((s) => s.id === currentSong.id);
  const upNext: Song[] =
    currentIdx >= 0
      ? [...queue.slice(currentIdx + 1), ...queue.slice(0, currentIdx)].slice(0, 5)
      : queue.filter((s) => s.id !== currentSong.id).slice(0, 5);

  const VolumeIcon = volumePercent === 0 ? VolumeX : volumePercent < 50 ? Volume1 : Volume2;
  const activeId: SongId = currentSong.id;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Expanded Now Playing"
      className="fixed inset-0 z-50 flex items-center justify-center md:p-6 bg-black/60 backdrop-blur-md"
      onClick={onClose}
    >
      <div
        ref={sheetRef}
        onClick={(e) => e.stopPropagation()}
        style={{
          background: isDark
            ? `linear-gradient(165deg, ${ambientColor}dd 0%, #11151d 54%, #0b0d11 100%)`
            : `linear-gradient(165deg, ${ambientColor}26 0%, #ffffff 48%, #f8fafc 100%)`,
        }}
        className="relative w-full h-full md:h-auto md:max-h-[90vh] md:max-w-4xl md:rounded-3xl border-0 md:border border-slate-200 dark:border-white/15 shadow-2xl overflow-y-auto no-scrollbar flex flex-col justify-between p-5 sm:p-7 text-slate-900 dark:text-white"
      >
        {/* Top Bar */}
        <header className="flex items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            aria-label="Collapse Now Playing"
            title="Minimize"
            className="w-9 h-9 rounded-full bg-black/5 hover:bg-black/10 dark:bg-white/10 dark:hover:bg-white/20 flex items-center justify-center transition active:scale-90"
          >
            <ChevronDown className="w-5 h-5" />
          </button>

          <div className="text-center min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-widest opacity-65">
              Playing From
            </p>
            <p className="text-xs sm:text-sm font-semibold truncate">
              {queueLabel ?? 'Song Library'}
            </p>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => onAddToPlaylist(currentSong)}
              aria-label={`Add ${currentSong.title} to playlist`}
              title="Add to playlist"
              className="w-9 h-9 rounded-full bg-black/5 hover:bg-black/10 dark:bg-white/10 dark:hover:bg-white/20 flex items-center justify-center transition active:scale-90"
            >
              <Plus className="w-4 h-4" />
            </button>
            {onDismissPlayer && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onDismissPlayer();
                }}
                aria-label="Close player from sheet"
                title="Close player"
                className="w-9 h-9 rounded-full bg-black/5 hover:bg-black/10 dark:bg-white/10 dark:hover:bg-white/20 flex items-center justify-center transition active:scale-90"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </header>

        {/* Main Body: Responsive 1-col mobile / 2-col desktop & tablet */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8 items-center my-auto py-4">
          {/* Left / Main Artwork & Transport */}
          <div className="md:col-span-7 flex flex-col items-center md:items-stretch gap-5">
            <div className="w-full max-w-[290px] sm:max-w-[330px] md:max-w-[340px] mx-auto aspect-square rounded-2xl overflow-hidden shadow-[0_24px_60px_-12px_rgba(0,0,0,0.45)] ring-1 ring-black/10 dark:ring-white/15">
              <AlbumArt
                song={currentSong}
                isPlaying={isPlaying}
                size="fill"
                priority
                className="!rounded-2xl"
              />
            </div>

            {/* Song Info + Like */}
            <div className="w-full flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight truncate">
                    {currentSong.title}
                  </h2>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#f97316]/15 text-orange-700 dark:bg-orange-400/20 dark:text-orange-200 shrink-0">
                    {currentSong.genre}
                  </span>
                </div>
                <p className="text-sm opacity-75 truncate mt-0.5">{currentSong.artist}</p>
              </div>

              <button
                ref={likeRef}
                type="button"
                onClick={() => {
                  if (likeRef.current) animateMicroPop(likeRef.current);
                  onToggleLike();
                }}
                aria-label={isLiked ? 'Unlike current track' : 'Like current track'}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition shrink-0 ${
                  isLiked
                    ? 'bg-rose-500/15 text-rose-500 dark:text-rose-400'
                    : 'bg-black/5 hover:bg-black/10 dark:bg-white/10 dark:hover:bg-white/20'
                }`}
              >
                <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
              </button>
            </div>

            {/* ElasticSlider Progress */}
            <div className="w-full space-y-1">
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
                maxStretch={20}
                bounce={0.45}
                thumb
                thumbColor={isDark ? '#ffffff' : '#f97316'}
                trackColor={isDark ? 'rgba(255,255,255,0.2)' : 'rgba(15,23,42,0.16)'}
                rangeColor={isDark ? '#ffffff' : '#0f172a'}
                ariaLabel="Expanded playback progress"
                className="!w-full"
              />
              <div className="flex items-center justify-between text-[11px] font-mono tabular-nums opacity-70 -mt-1">
                <span>{formatDuration(elapsedSeconds)}</span>
                <span>-{formatDuration(remaining)}</span>
              </div>
            </div>

            {/* Transport Row */}
            <div className="w-full flex items-center justify-between gap-2 pt-1">
              <button
                type="button"
                onClick={onToggleShuffle}
                aria-label="Sheet toggle shuffle"
                aria-pressed={isShuffle}
                className={`p-2 rounded-full transition active:scale-90 ${
                  isShuffle
                    ? 'text-[#f97316] dark:text-orange-300 bg-[#f97316]/15'
                    : 'opacity-70 hover:opacity-100'
                }`}
              >
                <Shuffle className="w-5 h-5" />
              </button>

              <button
                type="button"
                onClick={onPrev}
                disabled={!hasPrev}
                aria-label="Sheet previous track"
                className="p-2 rounded-full opacity-90 hover:opacity-100 disabled:opacity-30 transition active:scale-90"
              >
                <SkipBack className="w-6 h-6 fill-current" />
              </button>

              <button
                ref={playRef}
                type="button"
                onClick={() => {
                  if (playRef.current) animateMicroPop(playRef.current);
                  onTogglePlay();
                }}
                aria-label={isPlaying ? 'Sheet pause' : 'Sheet play'}
                className="w-14 h-14 rounded-full bg-slate-900 text-white hover:bg-[#f97316] dark:bg-white dark:text-slate-950 dark:hover:bg-orange-400 flex items-center justify-center shadow-xl transition hover:scale-105 active:scale-95"
              >
                {isPlaying ? (
                  <Pause className="w-6 h-6 fill-current" />
                ) : (
                  <Play className="w-6 h-6 fill-current ml-0.5" />
                )}
              </button>

              <button
                type="button"
                onClick={onNext}
                disabled={!hasNext}
                aria-label="Sheet next track"
                className="p-2 rounded-full opacity-90 hover:opacity-100 disabled:opacity-30 transition active:scale-90"
              >
                <SkipForward className="w-6 h-6 fill-current" />
              </button>

              <button
                type="button"
                onClick={onToggleRepeat}
                aria-label="Sheet toggle repeat"
                aria-pressed={isRepeat}
                className={`p-2 rounded-full transition active:scale-90 ${
                  isRepeat
                    ? 'text-[#f97316] dark:text-orange-300 bg-[#f97316]/15'
                    : 'opacity-70 hover:opacity-100'
                }`}
              >
                <Repeat className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Right / Bottom Card: Up Next Queue + Volume Gauge */}
          <div className="md:col-span-5 flex flex-col gap-3">
            {/* Compact Utility Bar (Volume + Queue/Manager) */}
            <div className="flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-2xl bg-black/5 dark:bg-white/[0.08] border border-black/5 dark:border-white/10">
              <button
                type="button"
                onClick={() => setShowQueueVolume((prev) => !prev)}
                className="inline-flex items-center gap-2 text-xs font-semibold hover:text-orange-600 dark:hover:text-orange-300 transition"
              >
                <VolumeIcon className="w-4 h-4 text-[#f97316] dark:text-orange-400" />
                <span className="font-mono tabular-nums">{volumePercent}% Volume</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenPlaylistManager();
                }}
                className="inline-flex items-center gap-1.5 text-xs font-semibold opacity-80 hover:opacity-100 transition"
              >
                <ListMusic className="w-4 h-4" />
                <span>Manage Playlists</span>
              </button>
            </div>

            {showQueueVolume && (
              <div className="p-3.5 rounded-2xl bg-white/90 dark:bg-[#161920]/95 border border-slate-200 dark:border-white/15 flex flex-col items-center gap-2">
                <SloshGauge
                  value={volumePercent}
                  onChange={(val) => onVolumeChange(Number((val / 100).toFixed(2)))}
                  interactive
                  showValue
                  liquidColor="#f97316"
                  glassColor={isDark ? '#0b0d11' : '#e2e8f0'}
                  width={68}
                  height={132}
                  radius={16}
                  ticks={4}
                  viscosity={0.18}
                  tilt={0.45}
                  splash={0.42}
                  unit="%"
                  ariaLabel="Sheet volume"
                />
                <button
                  type="button"
                  onClick={() => onVolumeChange(volumePercent === 0 ? 0.75 : 0)}
                  className="text-xs font-semibold text-orange-600 dark:text-orange-400"
                >
                  {volumePercent === 0 ? 'Unmute (75%)' : 'Mute'}
                </button>
              </div>
            )}

            {/* Up Next Queue Card (Screenshot 3 style ambient card) */}
            <div className="rounded-2xl bg-black/5 dark:bg-white/[0.08] border border-black/5 dark:border-white/10 p-3.5 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider opacity-85">
                  <Sparkles className="w-3.5 h-3.5 text-[#f97316] dark:text-orange-300" />
                  Up Next
                </span>
                <span className="text-[11px] opacity-65">{upNext.length} queued</span>
              </div>

              {upNext.length === 0 ? (
                <p className="text-xs opacity-70 py-2">
                  End of queue — repeat is {isRepeat ? 'on' : 'off'}.
                </p>
              ) : (
                <div className="space-y-1.5 max-h-[240px] overflow-y-auto no-scrollbar">
                  {upNext.map((song) => (
                    <button
                      key={song.id}
                      type="button"
                      onClick={() => onSelectQueueSong(song)}
                      className={`w-full flex items-center justify-between gap-2.5 p-2 rounded-xl text-left transition ${
                        song.id === activeId
                          ? 'bg-[#f97316]/20'
                          : 'hover:bg-black/5 dark:hover:bg-white/10'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <AlbumArt song={song} size="sm" />
                        <div className="min-w-0">
                          <p className="text-xs font-semibold truncate">{song.title}</p>
                          <p className="text-[11px] opacity-70 truncate">{song.artist}</p>
                        </div>
                      </div>
                      <span className="text-[11px] font-mono tabular-nums opacity-65 shrink-0">
                        {formatDuration(song.duration)}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
