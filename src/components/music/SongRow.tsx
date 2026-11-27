import { memo, useRef } from 'react';
import {
  ArrowDown,
  ArrowUp,
  Check,
  GripVertical,
  Pause,
  Play,
  Plus,
  Trash2,
} from 'lucide-react';
import type { Song } from '../../types/music';
import { formatDuration } from '../../utils/formatters';
import { animateMicroPop } from '../../utils/gsapAnimations';
import { TiltedCard, TiltedCardLayer } from '../reactbits';
import { AlbumArt } from './AlbumArt';

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
  showDragHandle?: boolean;
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

const FRAME_COLORS = [
  '#8c2f16',
  '#9a3412',
  '#1e2a55',
  '#9a5b13',
  '#22464f',
  '#821d20',
] as const;

function getFrameColor(song: Song): string {
  if (song.frameColor) return song.frameColor;
  const key = String(song.id);
  let hash = 0;
  for (let i = 0; i < key.length; i += 1) {
    hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
  }
  return FRAME_COLORS[hash % FRAME_COLORS.length] ?? FRAME_COLORS[0];
}

export const SongRow = memo(function SongRow({
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
  showDragHandle = false,
}: SongRowProps) {
  const formattedDuration = formatDuration(song.duration);
  const addBtnRef = useRef<HTMLButtonElement>(null);
  const playBtnRef = useRef<HTMLButtonElement>(null);

  if (variant === 'card') {
    const frameBg = getFrameColor(song);

    return (
      <TiltedCard
        containerWidth="100%"
        containerHeight="226px"
        imageWidth="100%"
        imageHeight="226px"
        rotateAmplitude={7}
        scaleOnHover={1.03}
        glare={0.25}
        glareColor="#ffffff"
        shadow={0.4}
        radius={16}
        showTooltip={false}
        intro={false}
        className="w-full min-w-0 song-card-anim"
      >
        <div
          style={{ backgroundColor: frameBg }}
          className={`group w-full h-full rounded-[16px] p-1.5 flex flex-col justify-between min-w-0 transition-all duration-200 ${
            isCurrent
              ? 'ring-2 ring-orange-500 ring-offset-2 ring-offset-[#f6f7f9] dark:ring-offset-[#0b0d11]'
              : 'ring-1 ring-black/10 dark:ring-white/10'
          }`}
        >
          <div className="w-full flex-1 min-h-0 rounded-xl overflow-hidden relative bg-black/25">
            <TiltedCardLayer depth={12}>
              <AlbumArt song={song} isPlaying={isCurrent && isPlaying} size="fill" className="!rounded-xl" />
            </TiltedCardLayer>

            <button
              ref={playBtnRef}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (playBtnRef.current) animateMicroPop(playBtnRef.current);
                onPlay(song);
              }}
              aria-label={isCurrent && isPlaying ? `Pause ${song.title}` : `Play ${song.title}`}
              className="absolute inset-0 z-10 flex items-center justify-center opacity-0 group-hover:opacity-100 focus-visible:opacity-100 bg-black/35 transition-opacity duration-200"
            >
              <span className="w-10 h-10 rounded-full bg-black/55 hover:bg-[#f97316] md:bg-white/25 md:backdrop-blur-md border border-white/40 text-white flex items-center justify-center transition-transform duration-200 translate-y-1.5 group-hover:translate-y-0">
                {isCurrent && isPlaying ? (
                  <Pause className="w-4 h-4 fill-current" />
                ) : (
                  <Play className="w-4 h-4 fill-current ml-0.5" />
                )}
              </span>
            </button>

            {isCurrent && isPlaying && (
              <span className="absolute bottom-1.5 right-1.5 z-10 px-2 py-1 rounded-full bg-black/80 md:bg-black/70 md:backdrop-blur-md border border-orange-400/40 flex items-center gap-1.5 pointer-events-none">
                <EqualizerBars />
              </span>
            )}

            <span className="absolute top-1.5 right-1.5 z-10 text-[10px] font-mono tabular-nums bg-black/75 md:bg-black/60 md:backdrop-blur-md px-1.5 py-0.5 rounded text-white">
              {formattedDuration}
            </span>

            {onAddToPlaylist && (
              <button
                ref={addBtnRef}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (addBtnRef.current) animateMicroPop(addBtnRef.current);
                  onAddToPlaylist(song);
                }}
                aria-label={`Add ${song.title} to playlist`}
                title={isInActivePlaylist ? 'Already in active playlist' : 'Add to playlist'}
                className={`absolute top-1.5 left-1.5 z-20 w-6 h-6 rounded-full flex items-center justify-center transition-colors duration-150 active:scale-90 md:backdrop-blur-md ${
                  isInActivePlaylist
                    ? 'bg-[#f97316] text-white border border-orange-300/40'
                    : 'bg-black/70 md:bg-black/55 text-white hover:bg-[#f97316] border border-white/20 opacity-90 group-hover:opacity-100'
                }`}
              >
                {isInActivePlaylist ? <Check className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
              </button>
            )}
          </div>

          <div className="pt-1.5 pb-0.5 px-1.5 text-center min-w-0">
            <h4 className="text-xs font-bold text-white truncate leading-tight">{song.title}</h4>
            <p className="text-[10.5px] text-white/80 truncate mt-0.5">
              {song.artist} · {song.genre}
            </p>
          </div>
        </div>
      </TiltedCard>
    );
  }

  return (
    <div
      className={`group flex items-center justify-between gap-2 sm:gap-3 px-2.5 py-2 sm:px-3.5 sm:py-2 rounded-xl border transition-all duration-150 min-w-0 w-full shadow-sm dark:shadow-none ${
        isCurrent
          ? 'bg-orange-500/10 border-orange-500/40 shadow-sm'
          : 'bg-white hover:bg-slate-50 border-slate-200/90 hover:border-slate-300 dark:bg-[#151821] dark:hover:bg-[#1a1e29] dark:border-white/[0.07] dark:hover:border-white/[0.14]'
      }`}
    >
      <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
        {showDragHandle && (
          <span
            data-drag-handle="true"
            className="text-slate-400 hover:text-slate-700 dark:text-gray-500 dark:hover:text-gray-300 cursor-grab active:cursor-grabbing flex items-center justify-center w-6 h-8 sm:w-auto sm:h-auto shrink-0 transition-colors"
            title="Drag to reorder or pull into slit to remove"
            aria-hidden="true"
          >
            <GripVertical className="w-4 h-4" />
          </span>
        )}

        {typeof index === 'number' && (
          <span className="text-xs font-mono tabular-nums text-slate-400 dark:text-gray-500 w-5 text-center shrink-0">
            {index + 1}
          </span>
        )}

        <button
          type="button"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            onPlay(song);
          }}
          aria-label={isCurrent && isPlaying ? `Pause ${song.title}` : `Play ${song.title}`}
          className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 group/play"
        >
          <AlbumArt song={song} isPlaying={isCurrent && isPlaying} size="sm" />
          {isCurrent && isPlaying ? (
            <span className="absolute inset-0 bg-black/45 flex items-center justify-center">
              <EqualizerBars />
            </span>
          ) : (
            <span className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 group-hover/play:opacity-100 flex items-center justify-center transition-opacity">
              <Play className="w-4 h-4 text-white fill-current ml-0.5" />
            </span>
          )}
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 min-w-0">
            <h4
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                onPlay(song);
              }}
              className={`text-[13.5px] font-semibold truncate cursor-pointer transition-colors ${
                isCurrent
                  ? 'text-orange-700 dark:text-orange-400'
                  : 'text-slate-900 group-hover:text-slate-950 dark:text-gray-100 dark:group-hover:text-white'
              }`}
            >
              {song.title}
            </h4>
            <span className="hidden md:inline-flex px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 text-slate-600 dark:bg-white/[0.06] dark:text-gray-300 shrink-0">
              {song.genre}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-gray-400 truncate mt-0.5">
            {song.artist}
            <span className="md:hidden"> · {song.genre}</span>
          </p>
        </div>
      </div>

      <div
        className="flex items-center gap-1.5 sm:gap-2 shrink-0"
        onPointerDown={(e) => e.stopPropagation()}
      >
        <span className="text-xs font-mono text-slate-500 dark:text-gray-400 tabular-nums mr-1">
          {formattedDuration}
        </span>

        {onAddToPlaylist && (
          <button
            ref={addBtnRef}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (addBtnRef.current) animateMicroPop(addBtnRef.current);
              onAddToPlaylist(song);
            }}
            aria-label={`Add ${song.title} to playlist`}
            title={
              isInActivePlaylist
                ? 'Already in active playlist — add to another'
                : 'Add to playlist'
            }
            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-150 active:scale-90 ${
              isInActivePlaylist
                ? 'bg-orange-500/15 text-orange-700 dark:text-orange-400 hover:bg-orange-500/25'
                : 'bg-slate-100 text-slate-600 hover:bg-[#f97316] hover:text-white dark:bg-white/[0.06] dark:text-gray-300'
            }`}
          >
            {isInActivePlaylist ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          </button>
        )}

        {onMoveUp && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onMoveUp();
            }}
            disabled={!canMoveUp}
            aria-label={`Move ${song.title} up`}
            title="Move up"
            className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-orange-700 dark:bg-white/[0.05] dark:hover:bg-white/10 dark:text-gray-300 dark:hover:text-orange-400 flex items-center justify-center transition active:scale-90 disabled:opacity-25 disabled:pointer-events-none"
          >
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
        )}

        {onMoveDown && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onMoveDown();
            }}
            disabled={!canMoveDown}
            aria-label={`Move ${song.title} down`}
            title="Move down"
            className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-orange-700 dark:bg-white/[0.05] dark:hover:bg-white/10 dark:text-gray-300 dark:hover:text-orange-400 flex items-center justify-center transition active:scale-90 disabled:opacity-25 disabled:pointer-events-none"
          >
            <ArrowDown className="w-3.5 h-3.5" />
          </button>
        )}

        {onRemove && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            aria-label={`Remove ${song.title} from playlist`}
            title="Remove from playlist"
            className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-rose-500/15 text-slate-500 hover:text-rose-600 dark:bg-white/[0.05] dark:hover:bg-rose-500/20 dark:text-gray-400 dark:hover:text-rose-400 flex items-center justify-center transition active:scale-90"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
});
