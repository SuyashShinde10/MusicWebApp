import axios from 'axios';
import type { Song } from '../types/music';

function isValidSong(item: unknown): item is Song {
  if (typeof item !== 'object' || item === null) {
    return false;
  }
  const record = item as Record<string, unknown>;
  const hasValidId = typeof record.id === 'string' || typeof record.id === 'number';
  return (
    hasValidId &&
    typeof record.title === 'string' &&
    typeof record.artist === 'string' &&
    typeof record.genre === 'string' &&
    typeof record.duration === 'number' &&
    Number.isFinite(record.duration) &&
    record.duration >= 0
  );
}

/**
 * Fetches the song library from `/songs.json` via Axios and validates the payload.
 */
export async function fetchSongs(): Promise<Song[]> {
  const response = await axios.get<unknown>('/songs.json', {
    timeout: 10000,
    headers: { Accept: 'application/json' },
  });

  if (!Array.isArray(response.data)) {
    throw new Error('Invalid songs.json format: expected an array of songs.');
  }

  return response.data.filter(isValidSong);
}
