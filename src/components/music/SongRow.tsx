import { useRef } from 'react';
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
  showDragHandle = false,
}: SongRowProps) {
  const formattedDuration = formatDuration(song.duration);
  const addBtnRef = useRef<HTMLButtonElement>(null);
  const playBtnRef = useRef<HTMLButtonElement>(null);

  if (variant === 'card') {
    return (
      <TiltedCard
        containerWidth="100%"
        containerHeight="274px"
        imageWidth="100%"
        imageHeight="274px"
        rotateAmplitude={8}
        scaleOnHover={1.02}
        glare={0.28}
        glareColor="#ff7b54"
        shadow={0.4}
        radius={16}
        showTooltip={false}
        intro={false}
        className="w-full min-w-0 song-card-anim"
      >
        <div
          className={`group w-full h-full rounded-[16px] p-3 border flex flex-col justify-between min-w-0 transition-colors duration-200 ${
            isCurrent
              ? 'bg-[#1b171b] border-brand-500/45'
              : 'bg-[#141821] border-white/[0.06] hover:bg-[#191e2a]'
          }`}
        >
          <div>
            <div className="w-full h-36 rounded-xl overflow-hidden relative mb-3">
              <TiltedCardLayer depth={14}>
                <AlbumArt song={song} isPlaying={isCurrent && isPlaying} size="fill" />
              </TiltedCardLayer>
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/20 pointer-events-none" />

              <button
                ref={playBtnRef}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (playBtnRef.current) animateMicroPop(playBtnRef.current);
                  onPlay(song);
                }}
                aria-label={isCurrent && isPlaying ? `Pause ${song.title}` : `Play ${song.title}`}
                className={`absolute inset-0 z-10 flex items-center justify-center transition-all duration-200 ${
                  isCurrent
                    ? 'opacity-100 bg-black/25'
                    : 'opacity-0 group-hover:opacity-100 focus-visible:opacity-100 bg-black/35'
                }`}
              >
                <span className="w-11 h-11 rounded-full bg-brand-500 hover:bg-brand-600 text-white flex items-center justify-center shadow-glow-sm transition-transform duration-200 translate-y-1 group-hover:translate-y-0">
                  {isCurrent && isPlaying ? (
                    <Pause className="w-4 h-4 fill-current" />
                  ) : (
                    <Play className="w-4 h-4 fill-current ml-0.5" />
                  )}
                </span>
              </button>

              <span className="absolute top-2 right-2 z-10 text-[10px] font-mono tabular-nums bg-black/65 backdrop-blur-md px-2 py-0.5 rounded-md text-gray-100">
                {formattedDuration}
              </span>
              <span className="absolute bottom-2 left-2 z-10 text-[10px] font-semibold bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-md text-gray-200">
                {song.genre}
              </span>
            </div>

            <h4
              className={`text-[13.5px] font-semibold tracking-tight truncate transition-colors ${
                isCurrent ? 'text-brand-400' : 'text-gray-100 group-hover:text-white'
              }`}
            >
              {song.title}
            </h4>
            <p className="text-xs text-gray-400 truncate mt-0.5">{song.artist}</p>
          </div>

          <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between gap-2 text-[11px] text-gray-400">
            <span className="truncate">{song.plays ? `${song.plays} plays` : song.genre}</span>
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
                title={isInActivePlaylist ? 'Add to another playlist' : 'Add to playlist'}
                className={`relative z-10 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all duration-150 shrink-0 active:scale-90 ${
                  isInActivePlaylist
                    ? 'bg-brand-500/15 text-brand-400 hover:bg-brand-500/25'
                    : 'bg-white/[0.06] text-gray-200 hover:bg-brand-500 hover:text-white'
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
      </TiltedCard>
    );
  }

  return (
    <div
      className={`group flex items-center justify-between gap-2 sm:gap-3 px-2.5 py-2 sm:px-3 sm:py-2.5 rounded-xl border transition-colors duration-150 min-w-0 w-full ${
        isCurrent
          ? 'bg-brand-500/[0.09] border-brand-500/30'
          : 'bg-[#141821]/85 hover:bg-[#1a1f2b] border-white/[0.05]'
      }`}
    >
      <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
        {showDragHandle && (
          <span
            className="text-gray-500 hover:text-gray-300 cursor-grab active:cursor-grabbing hidden sm:flex items-center shrink-0 transition-colors"
            title="Drag to reorder or pull into slit to remove"
            aria-hidden="true"
          >
            <GripVertical className="w-4 h-4" />
          </span>
        )}

        {typeof index === 'number' && (
          <span className="text-xs font-mono tabular-nums text-gray-500 w-5 text-center shrink-0">
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
          className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 group/play"
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
                isCurrent ? 'text-brand-400' : 'text-gray-100 group-hover:text-white'
              }`}
            >
              {song.title}
            </h4>
            <span className="hidden md:inline-flex px-2 py-0.5 rounded-md text-[10px] font-medium bg-white/[0.05] text-gray-300 shrink-0">
              {song.genre}
            </span>
          </div>
          <p className="text-xs text-gray-400 truncate mt-0.5">
            {song.artist}
            <span className="md:hidden"> · {song.genre}</span>
          </p>
        </div>
      </div>

      <div
        className="flex items-center gap-1.5 sm:gap-2 shrink-0"
        onPointerDown={(e) => e.stopPropagation()}
      >
        <span className="text-xs font-mono text-gray-400 tabular-nums mr-1">
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
                ? 'bg-brand-500/15 text-brand-400 hover:bg-brand-500/25'
                : 'bg-white/[0.05] text-gray-300 hover:bg-brand-500 hover:text-white'
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
            className="w-7 h-7 rounded-lg bg-white/[0.04] hover:bg-white/10 text-gray-300 hover:text-brand-400 flex items-center justify-center transition active:scale-90 disabled:opacity-25 disabled:pointer-events-none"
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
            className="w-7 h-7 rounded-lg bg-white/[0.04] hover:bg-white/10 text-gray-300 hover:text-brand-400 flex items-center justify-center transition active:scale-90 disabled:opacity-25 disabled:pointer-events-none"
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
            className="w-7 h-7 rounded-lg bg-white/[0.04] hover:bg-rose-500/20 text-gray-400 hover:text-rose-400 flex items-center justify-center transition active:scale-90"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
