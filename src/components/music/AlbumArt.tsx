import { useState } from 'react';
import type { Song } from '../../types/music';
import { getSongGradient } from '../../utils/formatters';

interface AlbumArtProps {
  song: Song;
  isPlaying?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'fill';
  priority?: boolean;
  className?: string;
}

const MOTIF_COUNT = 5;

function getMotifIndex(id: Song['id']): number {
  const s = String(id);
  let hash = 0;
  for (let i = 0; i < s.length; i += 1) {
    hash = (hash * 33 + s.charCodeAt(i)) >>> 0;
  }
  return hash % MOTIF_COUNT;
}

/**
 * Displays editorial photography when `song.coverImage` is available,
 * and falls back cleanly to a bespoke geometric/vinyl cover motif.
 */
export function AlbumArt({
  song,
  isPlaying = false,
  size = 'md',
  priority = false,
  className = '',
}: AlbumArtProps) {
  const [imgFailed, setImgFailed] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const gradient = getSongGradient(song);
  const motif = getMotifIndex(song.id);

  const sizeClass =
    size === 'sm'
      ? 'w-10 h-10 rounded-lg'
      : size === 'md'
      ? 'w-11 h-11 rounded-xl'
      : size === 'lg'
      ? 'w-14 h-14 rounded-xl'
      : 'w-full h-full rounded-xl';

  if (song.coverImage && !imgFailed) {
    return (
      <div className={`relative overflow-hidden bg-slate-200 dark:bg-[#181a20] select-none shrink-0 ${sizeClass} ${className}`}>
        {!imgLoaded && (
          <div aria-hidden="true" className="absolute inset-0 skeleton-shimmer rounded-[inherit]" />
        )}
        <img
          src={song.coverImage}
          alt={`${song.title} cover art`}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          fetchPriority={priority ? 'high' : 'auto'}
          onLoad={() => setImgLoaded(true)}
          onError={() => setImgFailed(true)}
          className={`w-full h-full object-cover object-[center_26%] transition-all duration-300 group-hover:scale-105 ${
            imgLoaded ? 'opacity-100' : 'opacity-0'
          }`}
        />
        <div className="absolute inset-0 ring-1 ring-inset ring-white/10 rounded-[inherit] pointer-events-none" />
      </div>
    );
  }

  return (
    <div
      className={`relative overflow-hidden bg-gradient-to-br ${gradient} select-none shrink-0 ${sizeClass} ${className}`}
    >
      <div
        className="absolute inset-0 opacity-[0.18] mix-blend-overlay pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.45) 0.6px, transparent 0.6px)',
          backgroundSize: '6px 6px',
        }}
      />

      {motif === 0 && (
        <svg
          viewBox="0 0 100 100"
          className={`absolute inset-0 w-full h-full opacity-40 ${
            isPlaying ? 'animate-[spin_14s_linear_infinite]' : ''
          }`}
          aria-hidden="true"
        >
          <circle cx="50" cy="50" r="40" fill="none" stroke="white" strokeWidth="1.2" strokeDasharray="6 4" />
          <circle cx="50" cy="50" r="27" fill="none" stroke="white" strokeWidth="1" opacity="0.7" />
          <circle cx="50" cy="50" r="14" fill="white" fillOpacity="0.22" />
        </svg>
      )}
      {motif === 1 && (
        <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full opacity-40" aria-hidden="true">
          <path d="M0 68 Q25 45 50 64 T100 54 L100 100 L0 100 Z" fill="white" fillOpacity="0.22" />
          <circle cx="72" cy="28" r="13" fill="white" fillOpacity="0.28" />
        </svg>
      )}
      {motif === 2 && (
        <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full opacity-40" aria-hidden="true">
          <rect x="14" y="14" width="38" height="38" rx="8" fill="white" fillOpacity="0.22" />
          <circle cx="66" cy="64" r="22" fill="white" fillOpacity="0.25" />
        </svg>
      )}
      {motif === 3 && (
        <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full opacity-40" aria-hidden="true">
          <circle cx="22" cy="82" r="46" fill="none" stroke="white" strokeWidth="1.4" />
          <circle cx="22" cy="82" r="18" fill="white" fillOpacity="0.22" />
        </svg>
      )}
      {motif === 4 && (
        <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full opacity-40" aria-hidden="true">
          <polygon points="50,14 86,78 14,78" fill="none" stroke="white" strokeWidth="1.4" />
          <circle cx="50" cy="56" r="13" fill="white" fillOpacity="0.28" />
        </svg>
      )}

      <div className="absolute inset-0 ring-1 ring-inset ring-white/15 rounded-[inherit] pointer-events-none" />
    </div>
  );
}
