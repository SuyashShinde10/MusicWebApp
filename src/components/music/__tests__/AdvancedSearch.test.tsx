import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import type { Playlist, Song } from '../../../types/music';
import { filterSongsAdvanced } from '../../../utils/playlistLogic';
import { AdvancedSearch } from '../AdvancedSearch';

const SONGS: Song[] = [
  { id: '1', title: 'Golden Days', artist: 'Felix Carter', genre: 'Relax', duration: 204 },
  { id: '2', title: 'Electric Dreams', artist: 'Mio Lowell', genre: 'Party', duration: 188 },
  { id: '3', title: 'Midnight Echo', artist: 'Kaelen Vance', genre: 'Lo-Fi', duration: 198 },
];

const PLAYLISTS: Playlist[] = [
  { id: 'pl-1', name: 'Midnight Chill', songIds: ['3'], createdAt: 1, updatedAt: 1 },
];

describe('AdvancedSearch & multi-token filtering', () => {
  it('supports multi-token search across fields, scope filtering, and sorting', () => {
    const multiToken = filterSongsAdvanced(SONGS, 'felix relax');
    expect(multiToken.map((s) => s.title)).toEqual(['Golden Days']);

    const artistOnly = filterSongsAdvanced(SONGS, 'Golden', { scope: 'artist' });
    expect(artistOnly).toHaveLength(0);

    const shortestFirst = filterSongsAdvanced(SONGS, '', { sort: 'duration-asc' });
    expect(shortestFirst.map((s) => s.title)).toEqual([
      'Electric Dreams',
      'Midnight Echo',
      'Golden Days',
    ]);
  });

  it('opens live suggestions on focus, filters by scope, and triggers play/playlist callbacks', async () => {
    const user = userEvent.setup();
    const onPlaySong = vi.fn();
    const onSelectPlaylist = vi.fn();
    const onScopeChange = vi.fn();

    render(
      <AdvancedSearch
        query="Midnight"
        onQueryChange={() => {}}
        scope="all"
        onScopeChange={onScopeChange}
        sort="relevance"
        onSortChange={() => {}}
        likedOnly={false}
        onToggleLikedOnly={() => {}}
        matchingSongs={[SONGS[2]!]}
        totalSongsCount={SONGS.length}
        playlists={PLAYLISTS}
        genres={['All', 'Relax', 'Party', 'Lo-Fi']}
        recentSearches={['Relax']}
        onRecordSearch={() => {}}
        onClearRecentSearches={() => {}}
        currentSongId={null}
        isPlaying={false}
        onPlaySong={onPlaySong}
        onAddToPlaylist={() => {}}
        onSelectPlaylist={onSelectPlaylist}
        onSelectGenre={() => {}}
        onResetFilters={() => {}}
      />
    );

    const input = screen.getByLabelText('Search songs');
    await user.click(input);

    const region = screen.getByRole('region', { name: 'Search suggestions' });
    expect(region).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Artist' }));
    expect(onScopeChange).toHaveBeenCalledWith('artist');

    await user.click(screen.getByRole('button', { name: /Midnight Chill/i }));
    expect(onSelectPlaylist).toHaveBeenCalledWith('pl-1');
  });
});
