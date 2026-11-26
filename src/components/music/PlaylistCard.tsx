import { Flame, Headphones, ListMusic, Pencil, Trash2, Zap } from 'lucide-react';
import type { Playlist } from '../../types/music';
import { formatPlaylistSummary } from '../../utils/formatters';

export interface PlaylistCardProps {
  playlist: Playlist;
  totalDurationSeconds: number;
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
  { gradient: 'from-emerald-500 to-teal-700', Icon: Headphones },
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
  isActive = false,
  compact = false,
  collapsed = false,
  onSelect,
  onRename,
  onDelete,
}: PlaylistCardProps) {
  const { gradient, Icon } = getBadgeStyle(playlist.id);
  const summary = formatPlaylistSummary(playlist.songIds.length, totalDurationSeconds);

  if (collapsed) {
    return (
      <button
        type="button"
        onClick={() => onSelect(playlist.id)}
        title={`${playlist.name} (${summary})`}
        aria-label={`Open playlist ${playlist.name}`}
        aria-pressed={isActive}
        className={`w-10 h-10 mx-auto rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white transition-all duration-200 hover:scale-105 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 ${
          isActive ? 'ring-2 ring-brand-400 ring-offset-2 ring-offset-surface-sidebar' : 'opacity-85 hover:opacity-100'
        }`}
      >
        <Icon className="w-4 h-4" />
      </button>
    );
  }

  // Compact sidebar / quick-grid style: clean, borderless editorial row (no heavy card chrome)
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
        className={`relative w-full flex items-center justify-between gap-2.5 px-2.5 py-2 rounded-xl transition-all duration-150 cursor-pointer min-w-0 group focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 ${
          isActive
            ? 'bg-white/[0.08] text-white'
            : 'hover:bg-white/[0.04] text-gray-300'
        }`}
      >
        {isActive && (
          <span
            aria-hidden="true"
            className="absolute left-0 top-2 bottom-2 w-[3px] rounded-full bg-brand-500"
          />
        )}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div
            className={`w-9 h-9 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center text-white shadow-sm shrink-0 transition-transform duration-200 group-hover:scale-105`}
          >
            <Icon className="w-4 h-4" />
          </div>
          <div className="min-w-0 flex-1 text-left">
            <h4
              className={`text-[13px] font-semibold truncate leading-snug ${
                isActive ? 'text-white' : 'text-gray-200 group-hover:text-white'
              }`}
            >
              {playlist.name}
            </h4>
            <p className="text-[11px] text-gray-400/90 truncate">{summary}</p>
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
      className={`w-full flex items-center justify-between gap-2.5 p-3 rounded-2xl border transition-all duration-200 cursor-pointer min-w-0 group focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 ${
        isActive
          ? 'bg-white/[0.07] border-brand-500/40'
          : 'bg-[#141821]/80 hover:bg-[#1a1f2b] border-white/[0.06] hover:border-white/15'
      }`}
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div
          className={`w-11 h-11 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white shadow-sm shrink-0 transition-transform duration-200 group-hover:scale-105`}
        >
          <Icon className="w-4 h-4" />
        </div>
        <div className="min-w-0 flex-1 text-left">
          <h4
            className={`text-sm font-semibold truncate leading-tight ${
              isActive ? 'text-brand-400' : 'text-gray-100 group-hover:text-white'
            }`}
          >
            {playlist.name}
          </h4>
          <p className="text-xs text-gray-400 truncate mt-0.5">{summary}</p>
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
              className="w-7 h-7 rounded-lg bg-white/[0.04] hover:bg-white/15 text-gray-400 hover:text-white flex items-center justify-center transition active:scale-90"
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
              className="w-7 h-7 rounded-lg bg-white/[0.04] hover:bg-rose-500/20 text-gray-400 hover:text-rose-400 flex items-center justify-center transition active:scale-90"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
