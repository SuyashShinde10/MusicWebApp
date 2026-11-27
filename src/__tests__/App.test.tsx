import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axios from 'axios';
import { App } from '../App';
import type { Song } from '../types/music';

vi.mock('axios');
const mockedAxios = vi.mocked(axios, true);

const MOCK_SONGS: Song[] = [
  {
    id: 1,
    title: 'Golden Days',
    artist: 'Felix Carter',
    genre: 'Relax',
    duration: 204,
    audioUrl: '/audio/golden-days.mp3',
  },
  { id: 2, title: 'Fading Horizon', artist: 'Ella Hunt', genre: 'Energetic', duration: 165 },
  { id: 3, title: 'Waves of Time', artist: 'Lena Rivers', genre: 'Sad', duration: 252 },
  { id: 4, title: 'Electric Dreams', artist: 'Mio Lovell', genre: 'Party', duration: 188 },
];

describe('RhythmoTune App Integration', () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.clearAllMocks();
    mockedAxios.get.mockResolvedValue({ data: MOCK_SONGS });
  });

  it('loads songs via Axios and renders formatted durations, search, and genre filters', async () => {
    const user = userEvent.setup();
    render(<App />);

    // Verify greeting banner with SplitText renders on Home
    expect(screen.getByText('Welcome to')).toBeInTheDocument();
    expect(screen.getAllByText('RhythmoTune').length).toBeGreaterThan(0);

    // Verify all responsive UI skeletons render immediately while songs fetch is in flight
    expect(screen.getByLabelText('Loading featured showcase')).toBeInTheDocument();
    expect(screen.getByLabelText('Loading categories')).toBeInTheDocument();
    expect(screen.getByLabelText('Loading songs')).toBeInTheDocument();
    expect(screen.getByLabelText('Loading active playlist')).toBeInTheDocument();
    expect(screen.getByLabelText('Loading player')).toBeInTheDocument();

    const library = screen.getByRole('region', { name: 'Song Library' });
    expect(await within(library).findByText('Golden Days')).toBeInTheDocument();
    expect(within(library).getByText('3:24')).toBeInTheDocument();

    // Filter by genre (JellyRadio group)
    await user.click(within(library).getByRole('radio', { name: 'Party' }));
    expect(within(library).getByText('Electric Dreams')).toBeInTheDocument();
    expect(within(library).queryByText('Golden Days')).not.toBeInTheDocument();

    // Search producing "No matching songs found" state and reset
    const searchInputs = screen.getAllByLabelText('Search songs');
    await user.type(searchInputs[0]!, 'nonexistent-track-xyz');
    expect(within(library).getByText('No matching songs found')).toBeInTheDocument();

    await user.click(within(library).getByRole('button', { name: 'Reset Filters' }));
    expect(within(library).getByText('Golden Days')).toBeInTheDocument();
  }, 15000);

  it('creates, renames, prevents duplicate songs, reorders, deletes playlists, and persists to localStorage', async () => {
    const user = userEvent.setup();
    const { unmount } = render(<App />);

    const library = screen.getByRole('region', { name: 'Song Library' });
    await within(library).findByText('Golden Days');

    // Open Create Playlist modal from header
    await user.click(screen.getAllByRole('button', { name: /new/i })[0]!);
    const dialog = screen.getByRole('dialog');
    const nameInput = within(dialog).getByLabelText(/playlist name/i);

    // Try duplicate name validation
    await user.type(nameInput, 'Vibes & Chill');
    await user.click(within(dialog).getByRole('button', { name: 'Create Playlist' }));
    expect(within(dialog).getByRole('alert')).toHaveTextContent(/already exists/i);

    // Create a valid playlist
    await user.clear(nameInput);
    await user.type(nameInput, 'Road Trip');
    await user.click(within(dialog).getByRole('button', { name: 'Create Playlist' }));

    // Active playlist should now be "Road Trip" with empty playlist state
    const playlistSection = screen.getByLabelText('Playlist Road Trip');
    expect(within(playlistSection).getByText('0 songs · 0 min')).toBeInTheDocument();
    expect(within(playlistSection).getByText('Empty Playlist')).toBeInTheDocument();

    // Add song "Waves of Time" via library button -> Add to playlist modal -> Road Trip
    await user.click(
      within(library).getByRole('button', { name: 'Add Waves of Time to playlist' })
    );
    const addDialog = screen.getByRole('dialog');
    await user.click(within(addDialog).getByRole('button', { name: /road trip/i }));
    // Verify duplicate prevention inside modal (now shows Added / disabled)
    expect(within(addDialog).getByRole('button', { name: /road trip/i })).toBeDisabled();
    await user.click(within(addDialog).getByRole('button', { name: 'Done' }));

    // Add second song "Golden Days"
    await user.click(
      within(library).getByRole('button', { name: 'Add Golden Days to playlist' })
    );
    const addDialog2 = screen.getByRole('dialog');
    await user.click(within(addDialog2).getByRole('button', { name: /road trip/i }));
    await user.click(within(addDialog2).getByRole('button', { name: 'Done' }));

    // Verify summary updates: 204 + 252 = 456s => 8 min
    expect(within(playlistSection).getAllByText('2 songs · 8 min').length).toBeGreaterThan(0);

    // Reorder: Move Golden Days up
    await user.click(within(playlistSection).getByRole('button', { name: 'Move Golden Days up' }));
    expect(
      within(playlistSection).getByRole('button', { name: 'Move Golden Days up' })
    ).toBeDisabled();

    // Rename playlist
    await user.click(within(playlistSection).getByRole('button', { name: 'Rename' }));
    const renameDialog = screen.getByRole('dialog');
    const renameInput = within(renameDialog).getByLabelText(/playlist name/i);
    await user.clear(renameInput);
    await user.type(renameInput, 'Weekend Drive');
    await user.click(within(renameDialog).getByRole('button', { name: 'Save Name' }));

    expect(screen.getByLabelText('Playlist Weekend Drive')).toBeInTheDocument();

    // Verify localStorage survives a simulated refresh (unmount + remount)
    unmount();
    render(<App />);
    await within(screen.getByRole('region', { name: 'Song Library' })).findByText('Golden Days');
    expect(screen.getByLabelText('Playlist Weekend Drive')).toBeInTheDocument();
    expect(
      within(screen.getByLabelText('Playlist Weekend Drive')).getAllByText('2 songs · 8 min').length
    ).toBeGreaterThan(0);

    // Delete with confirmation modal
    await user.click(
      within(screen.getByLabelText('Playlist Weekend Drive')).getByRole('button', { name: 'Delete' })
    );
    const confirmDialog = screen.getByRole('dialog');
    await user.click(within(confirmDialog).getByRole('button', { name: 'Delete Playlist' }));

    await waitFor(() => {
      expect(screen.queryByLabelText('Playlist Weekend Drive')).not.toBeInTheDocument();
    });
  }, 15000);

  it('controls Now Playing bar (Play/Pause, Next, Previous) and handles Axios fetch error retry', async () => {
    const user = userEvent.setup();
    mockedAxios.get.mockRejectedValueOnce(new Error('Network error'));

    render(<App />);
    const library = screen.getByRole('region', { name: 'Song Library' });
    expect(await within(library).findByText('Could not load songs')).toBeInTheDocument();

    mockedAxios.get.mockResolvedValueOnce({ data: MOCK_SONGS });
    await user.click(within(library).getByRole('button', { name: 'Retry' }));
    expect(await within(library).findByText('Golden Days')).toBeInTheDocument();

    const playerBar = screen.getByLabelText('Now Playing');
    const playButtons = within(playerBar).getAllByRole('button', { name: 'Play' });
    await user.click(playButtons[0]!);
    expect(within(playerBar).getAllByRole('button', { name: 'Pause' }).length).toBeGreaterThan(0);

    const nextButtons = within(playerBar).getAllByRole('button', { name: 'Next track' });
    await user.click(nextButtons[0]!);
    expect(within(playerBar).getAllByText('Fading Horizon').length).toBeGreaterThan(0);

    const prevButtons = within(playerBar).getAllByRole('button', { name: 'Previous track' });
    await user.click(prevButtons[0]!);
    expect(within(playerBar).getAllByText('Golden Days').length).toBeGreaterThan(0);

    // Open SloshGauge volume control popover and toggle mute
    const volumeBtn = within(playerBar).getByRole('button', { name: /volume 75%/i });
    await user.click(volumeBtn);
    const volumeDialog = within(playerBar).getByRole('dialog', { name: 'Volume control' });
    expect(within(volumeDialog).getByRole('slider', { name: 'Volume' })).toBeInTheDocument();
    await user.click(within(volumeDialog).getByRole('button', { name: 'Mute' }));
    expect(within(playerBar).getByRole('button', { name: /volume 0%/i })).toBeInTheDocument();
    // Verify sidebar menu button toggles collapsed/expanded state
    const collapseBtn = screen.getByRole('button', { name: 'Collapse sidebar menu' });
    await user.click(collapseBtn);
    expect(screen.getByRole('button', { name: 'Expand sidebar menu' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Expand sidebar menu' }));
    expect(screen.getByRole('button', { name: 'Collapse sidebar menu' })).toBeInTheDocument();

    // Verify light mode is default and Dark/Light toggle persists
    const themeToggle = screen.getByRole('button', { name: 'Switch to dark mode' });
    expect(document.documentElement.classList.contains('dark')).toBe(false);
    await user.click(themeToggle);
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(screen.getByRole('button', { name: 'Switch to light mode' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Switch to light mode' }));
    expect(document.documentElement.classList.contains('dark')).toBe(false);

    // Verify Expand Now Playing Sheet opens and collapses across views
    await user.click(within(playerBar).getAllByRole('button', { name: 'Open full Now Playing sheet' })[0]!);
    const expandedSheet = screen.getByRole('dialog', { name: 'Expanded Now Playing' });
    expect(expandedSheet).toBeInTheDocument();
    expect(within(expandedSheet).getByText('Up Next')).toBeInTheDocument();
    await user.click(within(expandedSheet).getByRole('button', { name: 'Collapse Now Playing' }));
    expect(screen.queryByRole('dialog', { name: 'Expanded Now Playing' })).not.toBeInTheDocument();

    // Verify dedicated Search navigation tab opens Search Workspace
    const mobileNav = screen.getByRole('navigation', { name: 'Mobile navigation' });
    await user.click(within(mobileNav).getByRole('button', { name: 'Search' }));
    expect(screen.getByRole('region', { name: 'Search Workspace' })).toBeInTheDocument();
    await user.click(within(mobileNav).getByRole('button', { name: 'Home' }));
    const homeLibrary = screen.getByRole('region', { name: 'Song Library' });

    // Verify PlayerBar X close button dismisses player and playing a song reopens it & invokes HTML5 audio play()
    await user.click(within(playerBar).getAllByRole('button', { name: 'Close player' })[0]!);
    expect(screen.queryByLabelText('Now Playing')).not.toBeInTheDocument();
    await user.click(within(homeLibrary).getByRole('button', { name: 'Play Golden Days' }));
    expect(screen.getByLabelText('Now Playing')).toBeInTheDocument();
    expect(window.HTMLMediaElement.prototype.play).toHaveBeenCalled();
  }, 15000);
});
