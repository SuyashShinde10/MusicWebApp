import { Flame, Headphones, ListMusic, Pencil, Trash2, Zap } from 'lucide-react';
import type { Playlist } from '../../types/music';
import { formatPlaylistSummary } from '../../utils/formatters';

export interface PlaylistCardProps {
  playlist: Playlist;
  totalDurationSeconds: number;
  isActive?: boolean;
  compact?: boolean;
  onSelect: (playlistId: string) => void;
  onRename?: (playlist: Playlist) => void;
  onDelete?: (playlist: Playlist) => void;
}

const BADGE_STYLES = [
  { gradient: 'from-amber-600 to-rose-700', Icon: Headphones },
  { gradient: 'from-orange-500 to-amber-400', Icon: Zap },
  { gradient: 'from-red-600 to-purple-800', Icon: Flame },
  { gradient: 'from-indigo-600 to-cyan-700', Icon: ListMusic },
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
  onSelect,
  onRename,
  onDelete,
}: PlaylistCardProps) {
  const { gradient, Icon } = getBadgeStyle(playlist.id);
  const summary = formatPlaylistSummary(playlist.songIds.length, totalDurationSeconds);

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
      className={`w-full flex items-center justify-between gap-2 rounded-2xl border transition cursor-pointer min-w-0 group focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 ${
        compact ? 'p-2.5' : 'p-3'
      } ${
        isActive
          ? 'bg-brand-500/15 border-brand-500/45 shadow-glow-sm'
          : 'bg-surface-card/70 hover:bg-surface-cardHover border-white/5 hover:border-white/15'
      }`}
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div
          className={`${
            compact ? 'w-10 h-10' : 'w-11 h-11'
          } rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white shadow-md shrink-0`}
        >
          <Icon className="w-4 h-4" />
        </div>
        <div className="min-w-0 flex-1 text-left">
          <h4
            className={`text-xs sm:text-sm font-bold truncate leading-tight ${
              isActive ? 'text-brand-400' : 'text-gray-100 group-hover:text-white'
            }`}
          >
            {playlist.name}
          </h4>
          <p className="text-[11px] text-gray-400 truncate mt-0.5">{summary}</p>
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
              className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/15 text-gray-400 hover:text-white flex items-center justify-center transition"
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
              className="w-7 h-7 rounded-lg bg-white/5 hover:bg-rose-500/20 text-gray-400 hover:text-rose-400 flex items-center justify-center transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
