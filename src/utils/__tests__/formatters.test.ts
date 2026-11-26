import { describe, expect, it } from 'vitest';
import { formatDuration, formatPlaylistSummary, getSongGradient } from '../formatters';

describe('formatDuration', () => {
  it('formats seconds as m:ss with zero-padded seconds', () => {
    expect(formatDuration(0)).toBe('0:00');
    expect(formatDuration(9)).toBe('0:09');
    expect(formatDuration(65)).toBe('1:05');
    expect(formatDuration(204)).toBe('3:24');
    expect(formatDuration(605)).toBe('10:05');
  });

  it('handles negative or invalid numbers gracefully', () => {
    expect(formatDuration(-10)).toBe('0:00');
    expect(formatDuration(Number.NaN)).toBe('0:00');
    expect(formatDuration(Number.POSITIVE_INFINITY)).toBe('0:00');
  });
});

describe('formatPlaylistSummary', () => {
  it('formats singular and plural song counts with rounded minutes', () => {
    expect(formatPlaylistSummary(0, 0)).toBe('0 songs · 0 min');
    expect(formatPlaylistSummary(1, 180)).toBe('1 song · 3 min');
    expect(formatPlaylistSummary(8, 1920)).toBe('8 songs · 32 min');
  });

  it('rounds very short non-empty playlists to at least 1 min', () => {
    expect(formatPlaylistSummary(1, 20)).toBe('1 song · 1 min');
  });
});

describe('getSongGradient', () => {
  it('uses explicit artworkGradient when provided and falls back deterministically', () => {
    expect(
      getSongGradient({
        id: 1,
        title: 'Test',
        artist: 'Artist',
        genre: 'Jazz',
        duration: 120,
        artworkGradient: 'from-red-500 to-black',
      })
    ).toBe('from-red-500 to-black');

    const fallback = getSongGradient({
      id: 42,
      title: 'Fallback',
      artist: 'Artist',
      genre: 'Jazz',
      duration: 120,
    });
    expect(fallback).toContain('from-');
  });
});
