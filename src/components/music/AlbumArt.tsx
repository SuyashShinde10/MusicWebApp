import type { Song } from '../../types/music';
import { getSongGradient } from '../../utils/formatters';

interface AlbumArtProps {
  song: Song;
  isPlaying?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'fill';
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
 * Editorial, bespoke album artwork with subtle grain, geometric cover art,
 * and vinyl groove rings so tracks look designed rather than generic icon boxes.
 */
export function AlbumArt({ song, isPlaying = false, size = 'md', className = '' }: AlbumArtProps) {
  const gradient = getSongGradient(song);
  const motif = getMotifIndex(song.id);
  const initials = song.title
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');

  const sizeClass =
    size === 'sm'
      ? 'w-10 h-10 rounded-lg'
      : size === 'md'
      ? 'w-11 h-11 rounded-xl'
      : size === 'lg'
      ? 'w-14 h-14 rounded-xl'
      : 'w-full h-full rounded-xl';

  return (
    <div
      className={`relative overflow-hidden bg-gradient-to-br ${gradient} select-none shrink-0 ${sizeClass} ${className}`}
    >
      {/* Subtle studio noise / grain texture */}
      <div
        className="absolute inset-0 opacity-[0.18] mix-blend-overlay pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(rgba(255,255,255,0.45) 0.6px, transparent 0.6px)',
          backgroundSize: '6px 6px',
        }}
      />

      {/* Bespoke geometric cover motif per track */}
      {motif === 0 && (
        <svg
          viewBox="0 0 100 100"
          className={`absolute inset-0 w-full h-full opacity-35 ${
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
        <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full opacity-35" aria-hidden="true">
          <path d="M0 68 Q25 45 50 64 T100 54 L100 100 L0 100 Z" fill="white" fillOpacity="0.22" />
          <path d="M0 78 Q30 58 60 75 T100 68 L100 100 L0 100 Z" fill="white" fillOpacity="0.18" />
          <circle cx="72" cy="28" r="13" fill="white" fillOpacity="0.28" />
        </svg>
      )}

      {motif === 2 && (
        <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full opacity-35" aria-hidden="true">
          <rect x="14" y="14" width="38" height="38" rx="8" fill="white" fillOpacity="0.22" />
          <circle cx="66" cy="64" r="22" fill="white" fillOpacity="0.25" />
          <line x1="14" y1="84" x2="86" y2="16" stroke="white" strokeWidth="1.5" opacity="0.5" />
        </svg>
      )}

      {motif === 3 && (
        <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full opacity-35" aria-hidden="true">
          <circle cx="22" cy="82" r="46" fill="none" stroke="white" strokeWidth="1.4" />
          <circle cx="22" cy="82" r="32" fill="none" stroke="white" strokeWidth="1.2" opacity="0.7" />
          <circle cx="22" cy="82" r="18" fill="white" fillOpacity="0.22" />
        </svg>
      )}

      {motif === 4 && (
        <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full opacity-35" aria-hidden="true">
          <polygon points="50,14 86,78 14,78" fill="none" stroke="white" strokeWidth="1.4" />
          <circle cx="50" cy="56" r="13" fill="white" fillOpacity="0.28" />
        </svg>
      )}

      {/* Subtle corner monogram for larger covers */}
      {(size === 'fill' || size === 'lg') && (
        <span className="absolute top-2.5 left-3 text-[10px] font-extrabold tracking-[0.18em] text-white/65 uppercase pointer-events-none">
          {initials}
        </span>
      )}

      {/* Inner vignette */}
      <div className="absolute inset-0 ring-1 ring-inset ring-white/15 rounded-[inherit] pointer-events-none" />
    </div>
  );
}
