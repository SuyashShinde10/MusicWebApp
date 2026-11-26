import {
  ArrowDown,
  ArrowUp,
  Check,
  GripVertical,
  Music2,
  Pause,
  Play,
  Plus,
  Trash2,
} from 'lucide-react';
import type { Song } from '../../types/music';
import { formatDuration, getSongGradient } from '../../utils/formatters';

export interface SongRowProps {
  song: Song;
  variant?: 'row' | 'card';
  index?: number;
  isCurrent?: boolean;
  isPlaying?: boolean;
  isInActivePlaylist?: boolean;
  onPlay: (song: Song) => void;
  onAddToPlaylist?: (song: Song) => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onRemove?: () => void;
  canMoveUp?: boolean;
  canMoveDown?: boolean;
  draggable?: boolean;
  isDragging?: boolean;
  isDragOver?: boolean;
  onDragStart?: () => void;
  onDragOver?: (e: React.DragEvent<HTMLDivElement>) => void;
  onDrop?: () => void;
  onDragEnd?: () => void;
}

function EqualizerBars() {
  return (
    <span className="w-3.5 h-3.5 flex items-end justify-between gap-0.5" aria-hidden="true">
      <span className="w-1 h-full bg-white rounded-full animate-eq-1" />
      <span className="w-1 h-full bg-white rounded-full animate-eq-2" />
      <span className="w-1 h-full bg-white rounded-full animate-eq-3" />
    </span>
  );
}

export function SongRow({
  song,
  variant = 'row',
  index,
  isCurrent = false,
  isPlaying = false,
  isInActivePlaylist = false,
  onPlay,
  onAddToPlaylist,
  onMoveUp,
  onMoveDown,
  onRemove,
  canMoveUp = false,
  canMoveDown = false,
  draggable = false,
  isDragging = false,
  isDragOver = false,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
}: SongRowProps) {
  const gradient = getSongGradient(song);
  const formattedDuration = formatDuration(song.duration);

  if (variant === 'card') {
    return (
      <div
        className={`group rounded-2xl p-3 border transition-all duration-300 flex flex-col justify-between min-w-0 ${
          isCurrent
            ? 'bg-brand-500/10 border-brand-500/40 shadow-glow-sm'
            : 'bg-surface-card hover:bg-surface-cardHover border-white/5 hover:-translate-y-0.5 hover:shadow-xl'
        }`}
      >
        <div>
          <div
            className={`w-full aspect-square rounded-xl overflow-hidden relative mb-3 bg-gradient-to-br ${gradient} flex items-center justify-center`}
          >
            <Music2 className="w-11 h-11 text-white/30 group-hover:scale-110 transition-transform duration-500" />
            <button
              type="button"
              onClick={() => onPlay(song)}
              aria-label={isCurrent && isPlaying ? `Pause ${song.title}` : `Play ${song.title}`}
              className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity ${
                isCurrent ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 focus-visible:opacity-100'
              }`}
            >
              <span className="w-11 h-11 rounded-full bg-brand-500 hover:bg-brand-600 text-white flex items-center justify-center shadow-glow-sm transition-transform group-hover:scale-105">
                {isCurrent && isPlaying ? (
                  <Pause className="w-4 h-4 fill-current" />
                ) : (
                  <Play className="w-4 h-4 fill-current ml-0.5" />
                )}
              </span>
            </button>
            <span className="absolute top-2 right-2 text-[10px] font-mono bg-black/65 backdrop-blur-md px-2 py-0.5 rounded-md text-gray-200 border border-white/10">
              {formattedDuration}
            </span>
            <span className="absolute bottom-2 left-2 text-[10px] font-semibold bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-full text-gray-200 border border-white/10">
              {song.genre}
            </span>
          </div>

          <h4
            className={`text-sm font-bold truncate transition-colors ${
              isCurrent ? 'text-brand-400' : 'text-white group-hover:text-brand-400'
            }`}
          >
            {song.title}
          </h4>
          <p className="text-xs text-gray-400 truncate mt-0.5">{song.artist}</p>
        </div>

        <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between gap-2 text-[11px] text-gray-400">
          <span className="truncate">{song.plays ? `${song.plays} plays` : song.genre}</span>
          {onAddToPlaylist && (
            <button
              type="button"
              onClick={() => onAddToPlaylist(song)}
              aria-label={`Add ${song.title} to playlist`}
              title={isInActivePlaylist ? 'Add to another playlist' : 'Add to playlist'}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold transition shrink-0 ${
                isInActivePlaylist
                  ? 'bg-brand-500/15 text-brand-400 border border-brand-500/30 hover:bg-brand-500/25'
                  : 'bg-white/5 text-gray-200 hover:bg-brand-500 hover:text-white border border-white/10'
              }`}
            >
              {isInActivePlaylist ? (
                <>
                  <Check className="w-3 h-3" />
                  <span>Added</span>
                </>
              ) : (
                <>
                  <Plus className="w-3 h-3" />
                  <span>Add</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    );
  }

  // Row variant (used in playlist queue, mobile library, and desktop list mode)
  return (
    <div
      draggable={draggable}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
      className={`flex items-center justify-between gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-2xl border transition min-w-0 ${
        isDragOver
          ? 'border-brand-400 bg-brand-500/15'
          : isCurrent
          ? 'bg-brand-500/10 border-brand-500/30'
          : 'bg-surface-card/70 hover:bg-surface-cardHover border-white/5'
      } ${isDragging ? 'opacity-50' : 'opacity-100'}`}
    >
      <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
        {draggable && (
          <span
            className="text-gray-500 hover:text-gray-300 cursor-grab active:cursor-grabbing hidden sm:flex items-center shrink-0"
            title="Drag to reorder"
            aria-hidden="true"
          >
            <GripVertical className="w-4 h-4" />
          </span>
        )}

        {typeof index === 'number' && (
          <span className="text-xs font-mono text-gray-500 w-5 text-center shrink-0">
            {index + 1}
          </span>
        )}

        <button
          type="button"
          onClick={() => onPlay(song)}
          aria-label={isCurrent && isPlaying ? `Pause ${song.title}` : `Play ${song.title}`}
          className={`relative w-11 h-11 rounded-xl overflow-hidden shrink-0 bg-gradient-to-br ${gradient} flex items-center justify-center group focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400`}
        >
          {isCurrent && isPlaying ? (
            <div className="absolute inset-0 bg-black/35 flex items-center justify-center">
              <EqualizerBars />
            </div>
          ) : (
            <>
              <Music2 className="w-5 h-5 text-white/75 group-hover:opacity-0 transition-opacity" />
              <span className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <Play className="w-4 h-4 text-white fill-current ml-0.5" />
              </span>
            </>
          )}
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 min-w-0">
            <h4
              onClick={() => onPlay(song)}
              className={`text-sm font-semibold truncate cursor-pointer ${
                isCurrent ? 'text-brand-400' : 'text-white hover:text-brand-400'
              }`}
            >
              {song.title}
            </h4>
            <span className="hidden md:inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium bg-white/5 text-gray-300 border border-white/5 shrink-0">
              {song.genre}
            </span>
          </div>
          <p className="text-xs text-gray-400 truncate mt-0.5">
            {song.artist}
            <span className="md:hidden"> · {song.genre}</span>
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        <span className="text-xs font-mono text-gray-400 tabular-nums mr-1">
          {formattedDuration}
        </span>

        {onAddToPlaylist && (
          <button
            type="button"
            onClick={() => onAddToPlaylist(song)}
            aria-label={`Add ${song.title} to playlist`}
            title={isInActivePlaylist ? 'Already in active playlist — add to another' : 'Add to playlist'}
            className={`w-8 h-8 rounded-xl flex items-center justify-center transition border ${
              isInActivePlaylist
                ? 'bg-brand-500/15 text-brand-400 border-brand-500/30 hover:bg-brand-500/25'
                : 'bg-white/5 text-gray-300 hover:bg-brand-500 hover:text-white border-white/10'
            }`}
          >
            {isInActivePlaylist ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          </button>
        )}

        {onMoveUp && (
          <button
            type="button"
            onClick={onMoveUp}
            disabled={!canMoveUp}
            aria-label={`Move ${song.title} up`}
            title="Move up"
            className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-brand-400 flex items-center justify-center transition disabled:opacity-25 disabled:pointer-events-none"
          >
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
        )}

        {onMoveDown && (
          <button
            type="button"
            onClick={onMoveDown}
            disabled={!canMoveDown}
            aria-label={`Move ${song.title} down`}
            title="Move down"
            className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-brand-400 flex items-center justify-center transition disabled:opacity-25 disabled:pointer-events-none"
          >
            <ArrowDown className="w-3.5 h-3.5" />
          </button>
        )}

        {onRemove && (
          <button
            type="button"
            onClick={onRemove}
            aria-label={`Remove ${song.title} from playlist`}
            title="Remove from playlist"
            className="w-7 h-7 rounded-lg bg-white/5 hover:bg-rose-500/20 text-gray-400 hover:text-rose-400 flex items-center justify-center transition"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
