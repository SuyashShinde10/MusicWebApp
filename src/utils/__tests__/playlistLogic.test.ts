import { describe, expect, it } from 'vitest';
import type { Playlist, Song } from '../../types/music';
import {
  addSongToPlaylist,
  createPlaylist,
  deletePlaylist,
  extractGenres,
  filterSongs,
  removeSongFromPlaylist,
  renamePlaylist,
  reorderPlaylistSongs,
  validatePlaylistName,
} from '../playlistLogic';

const samplePlaylists: Playlist[] = [
  {
    id: 'pl-1',
    name: 'Vibes & Chill',
    songIds: [1, 2, 3],
    createdAt: 1000,
    updatedAt: 1000,
  },
  {
    id: 'pl-2',
    name: 'Morning Boost',
    songIds: [4],
    createdAt: 2000,
    updatedAt: 2000,
  },
];

const sampleSongs: Song[] = [
  { id: 1, title: 'Golden Days', artist: 'Felix Carter', genre: 'Relax', duration: 204 },
  { id: 2, title: 'Echoes of Midnight', artist: 'Jon Hickman', genre: 'Energetic', duration: 222 },
  { id: 3, title: 'Velvet Starlight', artist: 'Clara Nova', genre: 'Jazz', duration: 215 },
];

describe('validatePlaylistName', () => {
  it('requires a non-empty name', () => {
    expect(validatePlaylistName('', samplePlaylists)).toBe('Playlist name is required.');
    expect(validatePlaylistName('   ', samplePlaylists)).toBe('Playlist name is required.');
  });

  it('enforces case-insensitive uniqueness', () => {
    expect(validatePlaylistName('  vibes & chill ', samplePlaylists)).toBe(
      'A playlist with this name already exists.'
    );
  });

  it('allows keeping the same name when renaming the same playlist', () => {
    expect(validatePlaylistName('Vibes & Chill', samplePlaylists, 'pl-1')).toBeNull();
  });

  it('rejects names longer than 60 characters', () => {
    expect(validatePlaylistName('a'.repeat(61), samplePlaylists)).toContain('60 characters');
  });
});

describe('playlist CRUD and song management', () => {
  it('creates, renames, and deletes playlists cleanly', () => {
    const { playlists: withNew, created } = createPlaylist('Late Night Drive', samplePlaylists);
    expect(withNew).toHaveLength(3);
    expect(created.name).toBe('Late Night Drive');
    expect(created.songIds).toEqual([]);

    const renamed = renamePlaylist(withNew, created.id, 'Midnight Drive');
    expect(renamed.find((p) => p.id === created.id)?.name).toBe('Midnight Drive');

    const afterDelete = deletePlaylist(renamed, created.id);
    expect(afterDelete).toHaveLength(2);
    expect(afterDelete.some((p) => p.id === created.id)).toBe(false);
  });

  it('prevents adding the same song twice to a playlist', () => {
    const first = addSongToPlaylist(samplePlaylists, 'pl-2', 2);
    expect(first.added).toBe(true);
    expect(first.playlists.find((p) => p.id === 'pl-2')?.songIds).toEqual([4, 2]);

    const duplicate = addSongToPlaylist(first.playlists, 'pl-2', 2);
    expect(duplicate.added).toBe(false);
    expect(duplicate.playlists.find((p) => p.id === 'pl-2')?.songIds).toEqual([4, 2]);
  });

  it('removes a song from a playlist', () => {
    const updated = removeSongFromPlaylist(samplePlaylists, 'pl-1', 2);
    expect(updated.find((p) => p.id === 'pl-1')?.songIds).toEqual([1, 3]);
  });

  it('reorders songs safely and ignores out-of-range moves', () => {
    const movedDown = reorderPlaylistSongs(samplePlaylists, 'pl-1', 0, 2);
    expect(movedDown.find((p) => p.id === 'pl-1')?.songIds).toEqual([2, 3, 1]);

    const outOfBounds = reorderPlaylistSongs(samplePlaylists, 'pl-1', 0, 99);
    expect(outOfBounds.find((p) => p.id === 'pl-1')?.songIds).toEqual([1, 2, 3]);
  });
});

describe('library search and genre filtering', () => {
  it('extracts unique genres starting with All', () => {
    expect(extractGenres(sampleSongs)).toEqual(['All', 'Relax', 'Energetic', 'Jazz']);
  });

  it('filters by query and genre together', () => {
    expect(filterSongs(sampleSongs, 'felix', 'All')).toHaveLength(1);
    expect(filterSongs(sampleSongs, 'felix', 'Jazz')).toHaveLength(0);
    expect(filterSongs(sampleSongs, '', 'Energetic')).toEqual([sampleSongs[1]]);
  });
});
