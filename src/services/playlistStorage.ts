import type { Playlist, SongId } from '../types/music';

const PLAYLISTS_STORAGE_KEY = 'rhythmotune.playlists.v1';
const ACTIVE_PLAYLIST_STORAGE_KEY = 'rhythmotune.activePlaylistId.v1';
const LIKED_SONGS_STORAGE_KEY = 'rhythmotune.likedSongIds.v1';
const THEME_STORAGE_KEY = 'rhythmotune.theme.v1';

export type ThemeMode = 'light' | 'dark';

const DEFAULT_STARTER_PLAYLISTS: Playlist[] = [
  {
    id: 'pl-vibes-chill',
    name: 'Vibes & Chill',
    songIds: [1, 3, 5, 8, 11],
    createdAt: 1700000000000,
    updatedAt: 1700000000000,
  },
  {
    id: 'pl-morning-boost',
    name: 'Morning Boost',
    songIds: [2, 4, 10],
    createdAt: 1700000001000,
    updatedAt: 1700000001000,
  },
  {
    id: 'pl-rhythm-energy',
    name: 'Rhythm & Energy',
    songIds: [6, 4, 9, 2],
    createdAt: 1700000002000,
    updatedAt: 1700000002000,
  },
];

function isValidPlaylist(item: unknown): item is Playlist {
  if (typeof item !== 'object' || item === null) {
    return false;
  }
  const record = item as Record<string, unknown>;
  return (
    typeof record.id === 'string' &&
    typeof record.name === 'string' &&
    Array.isArray(record.songIds) &&
    record.songIds.every((id) => typeof id === 'string' || typeof id === 'number') &&
    typeof record.createdAt === 'number' &&
    typeof record.updatedAt === 'number'
  );
}

/**
 * Loads playlists from localStorage. Seeds starter playlists only on first-ever visit
 * (when the storage key has never been initialized).
 */
export function loadPlaylists(): Playlist[] {
  try {
    const raw = window.localStorage.getItem(PLAYLISTS_STORAGE_KEY);
    if (raw === null) {
      window.localStorage.setItem(PLAYLISTS_STORAGE_KEY, JSON.stringify(DEFAULT_STARTER_PLAYLISTS));
      return DEFAULT_STARTER_PLAYLISTS;
    }
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed.filter(isValidPlaylist);
  } catch {
    return DEFAULT_STARTER_PLAYLISTS;
  }
}

export function savePlaylists(playlists: Playlist[]): void {
  try {
    window.localStorage.setItem(PLAYLISTS_STORAGE_KEY, JSON.stringify(playlists));
  } catch {
    // Gracefully ignore storage quota / privacy mode errors
  }
}

export function loadActivePlaylistId(): string | null {
  try {
    return window.localStorage.getItem(ACTIVE_PLAYLIST_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function saveActivePlaylistId(playlistId: string | null): void {
  try {
    if (playlistId === null) {
      window.localStorage.removeItem(ACTIVE_PLAYLIST_STORAGE_KEY);
    } else {
      window.localStorage.setItem(ACTIVE_PLAYLIST_STORAGE_KEY, playlistId);
    }
  } catch {
    // Ignore storage errors
  }
}

export function loadLikedSongIds(): SongId[] {
  try {
    const raw = window.localStorage.getItem(LIKED_SONGS_STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((id): id is SongId => typeof id === 'string' || typeof id === 'number');
  } catch {
    return [];
  }
}

export function saveLikedSongIds(songIds: SongId[]): void {
  try {
    window.localStorage.setItem(LIKED_SONGS_STORAGE_KEY, JSON.stringify(songIds));
  } catch {
    // Ignore storage errors
  }
}

export function loadTheme(): ThemeMode {
  try {
    const raw = window.localStorage.getItem(THEME_STORAGE_KEY);
    return raw === 'dark' ? 'dark' : 'light';
  } catch {
    return 'light';
  }
}

export function saveTheme(theme: ThemeMode): void {
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Ignore storage errors
  }
}
