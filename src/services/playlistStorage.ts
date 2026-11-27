import type { AudioQuality, MembershipPlan, Playlist, SongId, UserProfile } from '../types/music';

const PLAYLISTS_STORAGE_KEY = 'rhythmotune.playlists.v1';
const ACTIVE_PLAYLIST_STORAGE_KEY = 'rhythmotune.activePlaylistId.v1';
const LIKED_SONGS_STORAGE_KEY = 'rhythmotune.likedSongIds.v1';
const THEME_STORAGE_KEY = 'rhythmotune.theme.v1';
const RECENT_SEARCHES_STORAGE_KEY = 'rhythmotune.recentSearches.v1';
const USER_PROFILE_STORAGE_KEY = 'rhythmotune.profile.v1';

export const DEFAULT_USER_PROFILE: UserProfile = {
  name: 'Molly Hunter',
  handle: '@molly.hunter',
  plan: 'Premium',
  avatarUrl: '/covers/molly-hunter.jpg',
  audioQuality: 'Lossless',
};

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

export function loadRecentSearches(): string[] {
  try {
    const raw = window.localStorage.getItem(RECENT_SEARCHES_STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((q): q is string => typeof q === 'string' && q.trim().length > 0).slice(0, 6);
  } catch {
    return [];
  }
}

export function saveRecentSearches(queries: string[]): void {
  try {
    window.localStorage.setItem(RECENT_SEARCHES_STORAGE_KEY, JSON.stringify(queries.slice(0, 6)));
  } catch {
    // Ignore storage errors
  }
}

const VALID_PLANS = new Set<MembershipPlan>(['Premium', 'Hi-Fi Studio', 'Free']);
const VALID_QUALITIES = new Set<AudioQuality>(['Standard', 'High', 'Lossless']);

function normalizeUserProfile(raw: unknown): UserProfile {
  if (typeof raw !== 'object' || raw === null) {
    return DEFAULT_USER_PROFILE;
  }
  const record = raw as Record<string, unknown>;
  const name =
    typeof record.name === 'string' && record.name.trim().length > 0
      ? record.name.trim().slice(0, 40)
      : DEFAULT_USER_PROFILE.name;
  const rawHandle =
    typeof record.handle === 'string' && record.handle.trim().length > 0
      ? record.handle.trim().slice(0, 32)
      : DEFAULT_USER_PROFILE.handle;
  const handle = rawHandle.startsWith('@') ? rawHandle : `@${rawHandle}`;
  const plan =
    typeof record.plan === 'string' && VALID_PLANS.has(record.plan as MembershipPlan)
      ? (record.plan as MembershipPlan)
      : DEFAULT_USER_PROFILE.plan;
  const avatarUrl =
    typeof record.avatarUrl === 'string' && record.avatarUrl.trim().length > 0
      ? record.avatarUrl.trim()
      : DEFAULT_USER_PROFILE.avatarUrl;
  const audioQuality =
    typeof record.audioQuality === 'string' && VALID_QUALITIES.has(record.audioQuality as AudioQuality)
      ? (record.audioQuality as AudioQuality)
      : DEFAULT_USER_PROFILE.audioQuality;

  return { name, handle, plan, avatarUrl, audioQuality };
}

export function loadUserProfile(): UserProfile {
  try {
    const raw = window.localStorage.getItem(USER_PROFILE_STORAGE_KEY);
    if (!raw) return DEFAULT_USER_PROFILE;
    return normalizeUserProfile(JSON.parse(raw));
  } catch {
    return DEFAULT_USER_PROFILE;
  }
}

export function saveUserProfile(profile: UserProfile): void {
  try {
    window.localStorage.setItem(
      USER_PROFILE_STORAGE_KEY,
      JSON.stringify(normalizeUserProfile(profile))
    );
  } catch {
    // Ignore storage errors
  }
}
