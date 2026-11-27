import { Flame, Headphones, ListMusic, Pencil, Trash2, Zap } from 'lucide-react';
import type { Playlist } from '../../types/music';
import { formatPlaylistSummary } from '../../utils/formatters';

export interface PlaylistCardProps {
  playlist: Playlist;
  totalDurationSeconds: number;
  coverImage?: string;
  isActive?: boolean;
  compact?: boolean;
  collapsed?: boolean;
  onSelect: (playlistId: string) => void;
  onRename?: (playlist: Playlist) => void;
  onDelete?: (playlist: Playlist) => void;
}

const BADGE_STYLES = [
  { gradient: 'from-sky-500/90 to-indigo-700', Icon: ListMusic },
  { gradient: 'from-amber-400 to-orange-600', Icon: Zap },
  { gradient: 'from-rose-500 to-purple-700', Icon: Flame },
  { gradient: 'from-orange-500 to-amber-600', Icon: Headphones },
] as const;

function getBadgeStyle(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i += 1) {
    hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  }
  return BADGE_STYLES[hash % BADGE_STYLES.length] ?? BADGE_STYLES[0];
}

export function PlaylistCard({
  playlist,
  totalDurationSeconds,
  coverImage,
  isActive = false,
  compact = false,
  collapsed = false,
  onSelect,
  onRename,
  onDelete,
}: PlaylistCardProps) {
  const { gradient, Icon } = getBadgeStyle(playlist.id);
  const summary = formatPlaylistSummary(playlist.songIds.length, totalDurationSeconds);

  const thumb = coverImage ? (
    <img src={coverImage} alt="" className="w-full h-full object-cover" />
  ) : (
    <Icon className="w-4 h-4" />
  );

  if (collapsed) {
    return (
      <button
        type="button"
        onClick={() => onSelect(playlist.id)}
        title={`${playlist.name} (${summary})`}
        aria-label={`Open playlist ${playlist.name}`}
        aria-pressed={isActive}
        className={`w-10 h-10 mx-auto rounded-lg overflow-hidden bg-gradient-to-br ${gradient} flex items-center justify-center text-white transition-all duration-200 hover:scale-105 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 ${
          isActive
            ? 'ring-2 ring-orange-500 ring-offset-2 ring-offset-white dark:ring-offset-[#15171c]'
            : 'opacity-85 hover:opacity-100'
        }`}
      >
        {thumb}
      </button>
    );
  }

  if (compact) {
    return (
      <div
        role="button"
        tabIndex={0}
        onClick={() => onSelect(playlist.id)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onSelect(playlist.id);
          }
        }}
        aria-pressed={isActive}
        className={`relative w-full flex items-center justify-between gap-2.5 px-2.5 py-2 rounded-xl transition-all duration-150 cursor-pointer min-w-0 group focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 ${
          isActive
            ? 'bg-orange-500/10 text-orange-800 dark:bg-white/[0.09] dark:text-white'
            : 'hover:bg-slate-100 text-slate-700 dark:hover:bg-white/[0.05] dark:text-gray-300'
        }`}
      >
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div
            className={`w-8 h-8 rounded-md overflow-hidden bg-gradient-to-br ${gradient} flex items-center justify-center text-white shadow-sm shrink-0 transition-transform duration-200 group-hover:scale-105`}
          >
            {thumb}
          </div>
          <div className="min-w-0 flex-1 text-left">
            <h4
              className={`text-[13px] truncate leading-snug ${
                isActive
                  ? 'font-semibold text-orange-800 dark:text-white'
                  : 'font-medium text-slate-800 group-hover:text-slate-950 dark:text-gray-200 dark:group-hover:text-white'
              }`}
            >
              {playlist.name}
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-gray-400 truncate">{summary}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onSelect(playlist.id)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(playlist.id);
        }
      }}
      aria-pressed={isActive}
      className={`w-full flex items-center justify-between gap-2.5 p-3 rounded-2xl border transition-all duration-200 cursor-pointer min-w-0 group focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 ${
        isActive
          ? 'bg-orange-500/10 border-orange-500/45 dark:bg-white/[0.08]'
          : 'bg-white hover:bg-slate-50 border-slate-200 dark:bg-[#15171c] dark:hover:bg-[#1c1f26] dark:border-white/[0.07] dark:hover:border-white/15'
      }`}
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div
          className={`w-11 h-11 rounded-xl overflow-hidden bg-gradient-to-br ${gradient} flex items-center justify-center text-white shadow-sm shrink-0 transition-transform duration-200 group-hover:scale-105`}
        >
          {thumb}
        </div>
        <div className="min-w-0 flex-1 text-left">
          <h4
            className={`text-sm font-semibold truncate leading-tight ${
              isActive
                ? 'text-orange-700 dark:text-orange-400'
                : 'text-slate-900 group-hover:text-slate-950 dark:text-gray-100 dark:group-hover:text-white'
            }`}
          >
            {playlist.name}
          </h4>
          <p className="text-xs text-slate-500 dark:text-gray-400 truncate mt-0.5">{summary}</p>
        </div>
      </div>

      {(onRename || onDelete) && (
        <div className="flex items-center gap-1 shrink-0">
          {onRename && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onRename(playlist);
              }}
              aria-label={`Rename ${playlist.name}`}
              title="Rename playlist"
              className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 dark:bg-white/[0.05] dark:hover:bg-white/15 dark:text-gray-400 dark:hover:text-white flex items-center justify-center transition active:scale-90"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
          )}
          {onDelete && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(playlist);
              }}
              aria-label={`Delete ${playlist.name}`}
              title="Delete playlist"
              className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-rose-500/15 text-slate-500 hover:text-rose-600 dark:bg-white/[0.05] dark:hover:bg-rose-500/20 dark:text-gray-400 dark:hover:text-rose-400 flex items-center justify-center transition active:scale-90"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
