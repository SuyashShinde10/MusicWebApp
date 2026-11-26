import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { Song } from '../../../types/music';
import { FeaturedShowcase } from '../FeaturedShowcase';

const SAMPLE_SONGS: Song[] = [
  { id: '1', title: 'Golden Days', artist: 'Felix Carter', genre: 'Relax', duration: 204 },
  { id: '2', title: 'Fading Horizon', artist: 'Ella Hunt', genre: 'Energetic', duration: 165 },
  { id: '3', title: 'Echoes of Midnight', artist: 'Jon Hickman', genre: 'Energetic', duration: 222 },
  { id: '4', title: 'Waves of Time', artist: 'Lana Rivera', genre: 'Sad', duration: 252 },
  { id: '5', title: 'Electric Dreams', artist: 'Mia Lowell', genre: 'Party', duration: 188 },
];

describe('FeaturedShowcase auto-scroll', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('auto-advances cards on interval and pauses on hover', () => {
    vi.useFakeTimers();

    render(
      <FeaturedShowcase
        songs={SAMPLE_SONGS}
        currentSongId={null}
        isPlaying={false}
        onPlay={() => {}}
        onAddToPlaylist={() => {}}
      />
    );

    // Starts on Echoes of Midnight
    expect(screen.getAllByText('Echoes of Midnight').length).toBeGreaterThan(0);

    // Advances to Waves of Time after 3.5s
    act(() => {
      vi.advanceTimersByTime(3500);
    });
    expect(screen.getAllByText('Waves of Time').length).toBeGreaterThan(0);

    // Pauses while hovered
    const section = screen.getByLabelText('Featured Showcase');
    fireEvent.mouseEnter(section);
    act(() => {
      vi.advanceTimersByTime(7000);
    });
    expect(screen.getAllByText('Waves of Time').length).toBeGreaterThan(0);

    // Resumes when mouse leaves
    fireEvent.mouseLeave(section);
    act(() => {
      vi.advanceTimersByTime(3500);
    });
    expect(screen.getAllByText('Electric Dreams').length).toBeGreaterThan(0);
  });
});
