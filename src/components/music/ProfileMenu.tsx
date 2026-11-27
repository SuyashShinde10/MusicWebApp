import { useEffect, useRef, useState } from 'react';
import {
  ChevronDown,
  Crown,
  Download,
  Heart,
  ListMusic,
  Moon,
  Pause,
  Play,
  SlidersHorizontal,
  Sparkles,
  Sun,
  UserCog,
} from 'lucide-react';
import { PLAN_META, QUALITY_META } from '../../constants/profile';
import type { AudioQuality, Song, UserProfile } from '../../types/music';
import { formatPlaylistSummary } from '../../utils/formatters';

interface ProfileMenuProps {
  profile: UserProfile;
  playlistsCount: number;
  likedCount: number;
  savedSongsCount: number;
  savedDurationSeconds: number;
  topGenre: string | null;
  currentSong: Song | null;
  isPlaying: boolean;
  isDark: boolean;
  onChangeQuality: (quality: AudioQuality) => void;
  onOpenEditProfile: () => void;
  onViewLikedSongs: () => void;
  onOpenPlaylistManager: () => void;
  onTogglePlay: () => void;
  onExpandNowPlaying: () => void;
  onToggleTheme: () => void;
  onExportBackup: () => void;
}

export function ProfileMenu({
  profile,
  playlistsCount,
  likedCount,
  savedSongsCount,
  savedDurationSeconds,
  topGenre,
  currentSong,
  isPlaying,
  isDark,
  onChangeQuality,
  onOpenEditProfile,
  onViewLikedSongs,
  onOpenPlaylistManager,
  onTogglePlay,
  onExpandNowPlaying,
  onToggleTheme,
  onExportBackup,
}: ProfileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    window.addEventListener('mousedown', handlePointerDown);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('mousedown', handlePointerDown);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const planStyle = PLAN_META[profile.plan];
  const savedLabel =
    savedDurationSeconds > 0
      ? formatPlaylistSummary(savedSongsCount, savedDurationSeconds).split('·')[1]?.trim() ?? '0 min'
      : '0 min';

  return (
    <div ref={containerRef} className="relative hidden md:block">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-label={`Open account hub for ${profile.name}`}
        className={`group flex items-center gap-2.5 pl-1.5 pr-2.5 py-1 rounded-full border transition active:scale-[0.98] shadow-sm dark:shadow-none focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 ${
          isOpen
            ? 'bg-teal-50/90 border-teal-500/40 dark:bg-[#1a1f28] dark:border-teal-500/40'
            : 'bg-white hover:bg-slate-50 border-slate-200 dark:bg-[#15171c] dark:hover:bg-[#1b1f27] dark:border-white/[0.08]'
        }`}
      >
        <div className="relative shrink-0">
          <img
            src={profile.avatarUrl}
            alt={profile.name}
            className={`w-7 h-7 rounded-full object-cover ring-2 transition ${planStyle.ringClass}`}
          />
          <span
            aria-hidden="true"
            className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-[#15171c] ${
              isPlaying ? 'bg-emerald-400 animate-pulse' : 'bg-teal-500'
            }`}
          />
        </div>

        <div className="leading-none text-left">
          <p className="text-xs font-semibold text-slate-900 dark:text-white max-w-[110px] truncate">
            {profile.name}
          </p>
          <span className={`inline-flex items-center gap-1 mt-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded ${planStyle.badgeClass}`}>
            {profile.plan === 'Hi-Fi Studio' && <Crown className="w-2.5 h-2.5" />}
            {profile.plan}
          </span>
        </div>

        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-400 dark:text-gray-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-teal-600 dark:text-teal-400' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div
          role="dialog"
          aria-label="Listener account hub"
          className="absolute right-0 mt-2 w-80 max-w-[calc(100vw-2rem)] rounded-2xl bg-white/95 dark:bg-[#141821]/95 backdrop-blur-2xl border border-slate-200 dark:border-white/10 shadow-2xl p-4 z-50 space-y-3.5"
        >
          {/* Identity Banner */}
          <div className="flex items-center gap-3 pb-3 border-b border-slate-200/80 dark:border-white/[0.08]">
            <div className="relative shrink-0">
              <img
                src={profile.avatarUrl}
                alt={profile.name}
                className={`w-12 h-12 rounded-2xl object-cover ring-2 ${planStyle.ringClass}`}
              />
              {isPlaying && (
                <span className="absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded-full bg-emerald-500 text-white text-[9px] font-bold shadow">
                  LIVE
                </span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                  {profile.name}
                </p>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-gray-400 truncate">
                {profile.handle}
              </p>
              <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${planStyle.badgeClass}`}>
                  {profile.plan === 'Hi-Fi Studio' && <Crown className="w-2.5 h-2.5" />}
                  {profile.plan}
                </span>
                {topGenre && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 dark:bg-white/[0.06] dark:text-gray-300">
                    <Sparkles className="w-2.5 h-2.5 text-teal-500" />
                    {topGenre}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Live Listener Metrics */}
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200/70 dark:border-white/[0.06] px-2.5 py-2 text-center">
              <p className="text-sm font-extrabold text-slate-900 dark:text-white">{playlistsCount}</p>
              <p className="text-[10px] font-medium text-slate-500 dark:text-gray-400">Playlists</p>
            </div>
            <div className="rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200/70 dark:border-white/[0.06] px-2.5 py-2 text-center">
              <p className="text-sm font-extrabold text-rose-500 dark:text-rose-400">{likedCount}</p>
              <p className="text-[10px] font-medium text-slate-500 dark:text-gray-400">Liked</p>
            </div>
            <div className="rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200/70 dark:border-white/[0.06] px-2.5 py-2 text-center">
              <p className="text-sm font-extrabold text-teal-600 dark:text-teal-400 truncate">{savedLabel}</p>
              <p className="text-[10px] font-medium text-slate-500 dark:text-gray-400">Curated</p>
            </div>
          </div>

          {/* Active Track Mini-Card */}
          {currentSong && (
            <div className="flex items-center gap-2.5 p-2 rounded-xl bg-gradient-to-r from-teal-500/10 via-transparent to-orange-500/10 border border-teal-500/20 dark:border-teal-500/25">
              {currentSong.coverImage && (
                <img
                  src={currentSong.coverImage}
                  alt={currentSong.title}
                  className="w-9 h-9 rounded-lg object-cover shrink-0"
                />
              )}
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  onExpandNowPlaying();
                }}
                className="min-w-0 flex-1 text-left"
              >
                <p className="text-[10px] font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
                  {isPlaying ? 'Now Playing' : 'Paused'}
                </p>
                <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                  {currentSong.title}
                </p>
              </button>
              <button
                type="button"
                onClick={onTogglePlay}
                aria-label={isPlaying ? 'Pause current song' : 'Play current song'}
                className="w-8 h-8 rounded-full bg-teal-600 hover:bg-teal-500 text-white flex items-center justify-center transition active:scale-90 shrink-0"
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 ml-0.5" />}
              </button>
            </div>
          )}

          {/* Audio Quality Selector */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600 dark:text-gray-300">
              <span className="inline-flex items-center gap-1.5">
                <SlidersHorizontal className="w-3.5 h-3.5 text-teal-500" />
                Stream Quality
              </span>
              <span className="text-[10px] text-slate-400 dark:text-gray-500">
                {QUALITY_META.find((q) => q.value === profile.audioQuality)?.bitrate}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-white/[0.05]">
              {QUALITY_META.map((q) => {
                const active = profile.audioQuality === q.value;
                return (
                  <button
                    key={q.value}
                    type="button"
                    onClick={() => onChangeQuality(q.value)}
                    aria-pressed={active}
                    className={`py-1.5 px-2 rounded-lg text-[11px] font-semibold transition ${
                      active
                        ? 'bg-white text-teal-700 shadow-sm dark:bg-teal-500/20 dark:text-teal-300'
                        : 'text-slate-600 hover:text-slate-900 dark:text-gray-400 dark:hover:text-white'
                    }`}
                  >
                    {q.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Account Action List */}
          <div className="pt-2 border-t border-slate-200/80 dark:border-white/[0.08] space-y-1">
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                onOpenEditProfile();
              }}
              className="w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:text-gray-200 dark:hover:bg-white/[0.06] transition"
            >
              <span className="inline-flex items-center gap-2">
                <UserCog className="w-4 h-4 text-teal-500" />
                Edit Profile & Plan
              </span>
              <span className="text-[10px] text-slate-400">Customize</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                onViewLikedSongs();
              }}
              className="w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:text-gray-200 dark:hover:bg-white/[0.06] transition"
            >
              <span className="inline-flex items-center gap-2">
                <Heart className="w-4 h-4 text-rose-500" />
                Liked Songs
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400">
                {likedCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                onOpenPlaylistManager();
              }}
              className="w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:text-gray-200 dark:hover:bg-white/[0.06] transition"
            >
              <span className="inline-flex items-center gap-2">
                <ListMusic className="w-4 h-4 text-indigo-500" />
                Playlist Manager
              </span>
              <span className="text-[10px] text-slate-400">{playlistsCount}</span>
            </button>

            <div className="grid grid-cols-2 gap-1.5 pt-1">
              <button
                type="button"
                onClick={onToggleTheme}
                className="flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-xl text-[11px] font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-white/[0.06] dark:hover:bg-white/10 dark:text-gray-200 transition"
              >
                {isDark ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-slate-600" />}
                {isDark ? 'Light UI' : 'Dark UI'}
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  onExportBackup();
                }}
                className="flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-xl text-[11px] font-semibold bg-teal-500/10 hover:bg-teal-500/20 text-teal-700 dark:text-teal-300 transition"
              >
                <Download className="w-3.5 h-3.5" />
                Export JSON
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
