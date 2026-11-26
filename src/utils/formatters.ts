import type { Song } from '../types/music';

const FALLBACK_GRADIENTS = [
  'from-amber-600 via-orange-800 to-stone-950',
  'from-emerald-600 via-teal-800 to-slate-950',
  'from-indigo-600 via-violet-900 to-slate-950',
  'from-rose-600 via-red-800 to-neutral-950',
  'from-cyan-600 via-sky-900 to-slate-950',
  'from-purple-600 via-fuchsia-900 to-slate-950',
] as const;

/**
 * Formats a duration in seconds as `m:ss` (or `mm:ss` for >= 10 min).
 */
export function formatDuration(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) {
    return '0:00';
  }
  const whole = Math.floor(seconds);
  const mins = Math.floor(whole / 60);
  const secs = whole % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Formats playlist metadata summary, e.g. "8 songs · 32 min".
 */
export function formatPlaylistSummary(songCount: number, totalSeconds: number): string {
  const safeCount = Math.max(0, Math.floor(songCount));
  const songLabel = safeCount === 1 ? '1 song' : `${safeCount} songs`;

  if (safeCount === 0 || !Number.isFinite(totalSeconds) || totalSeconds <= 0) {
    return `${songLabel} · 0 min`;
  }

  const minutes = Math.max(1, Math.round(totalSeconds / 60));
  return `${songLabel} · ${minutes} min`;
}

/**
 * Returns a deterministic Tailwind gradient class pair for a song card artwork.
 */
export function getSongGradient(song: Song): string {
  if (song.artworkGradient && song.artworkGradient.trim().length > 0) {
    return song.artworkGradient;
  }
  const key = String(song.id);
  let hash = 0;
  for (let i = 0; i < key.length; i += 1) {
    hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
  }
  return FALLBACK_GRADIENTS[hash % FALLBACK_GRADIENTS.length] ?? FALLBACK_GRADIENTS[0];
}
