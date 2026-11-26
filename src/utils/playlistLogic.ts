import type { Playlist, Song, SongId } from '../types/music';

const MAX_PLAYLIST_NAME_LENGTH = 60;

/**
 * Validates a playlist name against required, length, and case-insensitive uniqueness rules.
 * Returns an error message string if invalid, or null if valid.
 */
export function validatePlaylistName(
  rawName: string,
  playlists: Playlist[],
  excludePlaylistId?: string
): string | null {
  const trimmed = rawName.trim();
  if (!trimmed) {
    return 'Playlist name is required.';
  }
  if (trimmed.length > MAX_PLAYLIST_NAME_LENGTH) {
    return `Playlist name must be ${MAX_PLAYLIST_NAME_LENGTH} characters or fewer.`;
  }
  const normalized = trimmed.toLowerCase();
  const duplicate = playlists.some(
    (p) => p.id !== excludePlaylistId && p.name.trim().toLowerCase() === normalized
  );
  if (duplicate) {
    return 'A playlist with this name already exists.';
  }
  return null;
}

/**
 * Generates a collision-resistant playlist ID.
 */
function generatePlaylistId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `pl-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * Creates a new playlist if valid; throws an Error with validation message otherwise.
 */
export function createPlaylist(
  rawName: string,
  playlists: Playlist[]
): { playlists: Playlist[]; created: Playlist } {
  const error = validatePlaylistName(rawName, playlists);
  if (error) {
    throw new Error(error);
  }
  const now = Date.now();
  const created: Playlist = {
    id: generatePlaylistId(),
    name: rawName.trim(),
    songIds: [],
    createdAt: now,
    updatedAt: now,
  };
  return {
    playlists: [...playlists, created],
    created,
  };
}

/**
 * Renames an existing playlist after validating uniqueness.
 */
export function renamePlaylist(
  playlists: Playlist[],
  playlistId: string,
  rawNewName: string
): Playlist[] {
  const error = validatePlaylistName(rawNewName, playlists, playlistId);
  if (error) {
    throw new Error(error);
  }
  const trimmed = rawNewName.trim();
  const now = Date.now();
  return playlists.map((playlist) =>
    playlist.id === playlistId ? { ...playlist, name: trimmed, updatedAt: now } : playlist
  );
}

/**
 * Deletes a playlist by ID.
 */
export function deletePlaylist(playlists: Playlist[], playlistId: string): Playlist[] {
  return playlists.filter((playlist) => playlist.id !== playlistId);
}

/**
 * Adds a song ID to a playlist if not already present (prevents duplicates).
 */
export function addSongToPlaylist(
  playlists: Playlist[],
  playlistId: string,
  songId: SongId
): { playlists: Playlist[]; added: boolean } {
  let added = false;
  const now = Date.now();
  const next = playlists.map((playlist) => {
    if (playlist.id !== playlistId) {
      return playlist;
    }
    const alreadyExists = playlist.songIds.some((id) => id === songId);
    if (alreadyExists) {
      return playlist;
    }
    added = true;
    return {
      ...playlist,
      songIds: [...playlist.songIds, songId],
      updatedAt: now,
    };
  });
  return { playlists: next, added };
}

/**
 * Removes a song ID from a playlist.
 */
export function removeSongFromPlaylist(
  playlists: Playlist[],
  playlistId: string,
  songId: SongId
): Playlist[] {
  const now = Date.now();
  return playlists.map((playlist) => {
    if (playlist.id !== playlistId) {
      return playlist;
    }
    return {
      ...playlist,
      songIds: playlist.songIds.filter((id) => id !== songId),
      updatedAt: now,
    };
  });
}

/**
 * Reorders songs within a playlist by moving an item from `fromIndex` to `toIndex`.
 */
export function reorderPlaylistSongs(
  playlists: Playlist[],
  playlistId: string,
  fromIndex: number,
  toIndex: number
): Playlist[] {
  if (fromIndex === toIndex) {
    return playlists;
  }
  const now = Date.now();
  return playlists.map((playlist) => {
    if (playlist.id !== playlistId) {
      return playlist;
    }
    const { songIds } = playlist;
    if (
      fromIndex < 0 ||
      fromIndex >= songIds.length ||
      toIndex < 0 ||
      toIndex >= songIds.length
    ) {
      return playlist;
    }
    const nextIds = [...songIds];
    const [moved] = nextIds.splice(fromIndex, 1);
    if (moved === undefined) {
      return playlist;
    }
    nextIds.splice(toIndex, 0, moved);
    return {
      ...playlist,
      songIds: nextIds,
      updatedAt: now,
    };
  });
}

/**
 * Replaces a playlist's song order with an explicitly ordered list of song IDs.
 */
export function setPlaylistSongOrder(
  playlists: Playlist[],
  playlistId: string,
  orderedSongIds: SongId[]
): Playlist[] {
  const now = Date.now();
  return playlists.map((playlist) => {
    if (playlist.id !== playlistId) {
      return playlist;
    }
    return {
      ...playlist,
      songIds: [...orderedSongIds],
      updatedAt: now,
    };
  });
}

/**
 * Resolves a playlist's song IDs against the loaded song library.
 */
export function resolvePlaylistSongs(playlist: Playlist, songsById: Map<SongId, Song>): Song[] {
  const resolved: Song[] = [];
  for (const songId of playlist.songIds) {
    const song = songsById.get(songId);
    if (song) {
      resolved.push(song);
    }
  }
  return resolved;
}

/**
 * Computes total duration in seconds for a list of songs.
 */
export function computeTotalDuration(songs: Song[]): number {
  return songs.reduce((sum, song) => sum + (Number.isFinite(song.duration) ? song.duration : 0), 0);
}

/**
 * Filters songs by search query (title, artist, or genre) and selected genre.
 */
export function filterSongs(songs: Song[], searchQuery: string, selectedGenre: string): Song[] {
  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filterByGenre = selectedGenre !== 'All';

  return songs.filter((song) => {
    if (filterByGenre && song.genre.toLowerCase() !== selectedGenre.toLowerCase()) {
      return false;
    }
    if (!normalizedQuery) {
      return true;
    }
    return (
      song.title.toLowerCase().includes(normalizedQuery) ||
      song.artist.toLowerCase().includes(normalizedQuery) ||
      song.genre.toLowerCase().includes(normalizedQuery)
    );
  });
}

/**
 * Extracts unique genre filter options prefixed with 'All'.
 */
export function extractGenres(songs: Song[]): string[] {
  const seen = new Set<string>();
  const genres: string[] = [];
  for (const song of songs) {
    const genre = song.genre.trim();
    if (genre && !seen.has(genre.toLowerCase())) {
      seen.add(genre.toLowerCase());
      genres.push(genre);
    }
  }
  return ['All', ...genres];
}
