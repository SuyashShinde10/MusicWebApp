import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ProfileMenu } from '../ProfileMenu';
import { ProfileSettingsModal } from '../../modals/ProfileSettingsModal';
import {
  DEFAULT_USER_PROFILE,
  loadUserProfile,
  saveUserProfile,
} from '../../../services/playlistStorage';
import type { Song } from '../../../types/music';

const sampleSong: Song = {
  id: 1,
  title: 'MONTAGEM GUERREIRO',
  artist: 'Avenxir & SUNJI',
  genre: 'Montagem',
  duration: 75,
  coverImage: '/covers/track-1.jpg',
};

describe('ProfileMenu & ProfileSettingsModal', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('opens the listener account hub, displays stats, switches stream quality, and triggers callbacks', () => {
    const onChangeQuality = vi.fn();
    const onOpenEditProfile = vi.fn();
    const onViewLikedSongs = vi.fn();
    const onOpenPlaylistManager = vi.fn();
    const onTogglePlay = vi.fn();
    const onExpandNowPlaying = vi.fn();
    const onToggleTheme = vi.fn();
    const onExportBackup = vi.fn();

    render(
      <ProfileMenu
        profile={DEFAULT_USER_PROFILE}
        playlistsCount={3}
        likedCount={4}
        savedSongsCount={12}
        savedDurationSeconds={1080}
        topGenre="Phonk"
        currentSong={sampleSong}
        isPlaying={true}
        isDark={true}
        onChangeQuality={onChangeQuality}
        onOpenEditProfile={onOpenEditProfile}
        onViewLikedSongs={onViewLikedSongs}
        onOpenPlaylistManager={onOpenPlaylistManager}
        onTogglePlay={onTogglePlay}
        onExpandNowPlaying={onExpandNowPlaying}
        onToggleTheme={onToggleTheme}
        onExportBackup={onExportBackup}
      />
    );

    const trigger = screen.getByRole('button', { name: /open account hub for molly hunter/i });
    fireEvent.click(trigger);

    expect(screen.getByRole('dialog', { name: /listener account hub/i })).toBeInTheDocument();
    expect(screen.getByText('@molly.hunter')).toBeInTheDocument();
    expect(screen.getByText('Phonk')).toBeInTheDocument();
    expect(screen.getByText('18 min')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'High' }));
    expect(onChangeQuality).toHaveBeenCalledWith('High');

    fireEvent.click(screen.getByRole('button', { name: /pause current song/i }));
    expect(onTogglePlay).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole('button', { name: /export json/i }));
    expect(onExportBackup).toHaveBeenCalledTimes(1);

    // Re-open to test Edit Profile button
    fireEvent.click(trigger);
    fireEvent.click(screen.getByRole('button', { name: /edit profile & plan/i }));
    expect(onOpenEditProfile).toHaveBeenCalledTimes(1);
  });

  it('validates display name and saves updated profile & plan in ProfileSettingsModal', () => {
    const onSave = vi.fn();
    const onClose = vi.fn();

    render(
      <ProfileSettingsModal
        isOpen={true}
        profile={DEFAULT_USER_PROFILE}
        onClose={onClose}
        onSave={onSave}
      />
    );

    const nameInput = screen.getByLabelText(/display name/i);
    fireEvent.change(nameInput, { target: { value: '   ' } });
    fireEvent.click(screen.getByRole('button', { name: /save profile/i }));

    expect(screen.getByText(/display name is required/i)).toBeInTheDocument();
    expect(onSave).not.toHaveBeenCalled();

    fireEvent.change(nameInput, { target: { value: 'Suyash Shinde' } });
    fireEvent.change(screen.getByLabelText(/handle/i), { target: { value: 'suyash.dev' } });
    fireEvent.click(screen.getByRole('button', { name: /choose neon avatar/i }));
    fireEvent.click(screen.getByRole('button', { name: /hi-fi studio/i }));
    fireEvent.click(screen.getByRole('button', { name: /^standard/i }));
    fireEvent.click(screen.getByRole('button', { name: /save profile/i }));

    expect(onSave).toHaveBeenCalledWith({
      name: 'Suyash Shinde',
      handle: '@suyash.dev',
      plan: 'Hi-Fi Studio',
      avatarUrl: '/covers/neon-skyline.jpg',
      audioQuality: 'Standard',
    });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('persists and safely validates user profile in localStorage', () => {
    saveUserProfile({
      name: 'Alex Rivera',
      handle: 'alex.r',
      plan: 'Hi-Fi Studio',
      avatarUrl: '/covers/midnight-echo.jpg',
      audioQuality: 'High',
    });

    expect(loadUserProfile()).toEqual({
      name: 'Alex Rivera',
      handle: '@alex.r',
      plan: 'Hi-Fi Studio',
      avatarUrl: '/covers/midnight-echo.jpg',
      audioQuality: 'High',
    });

    window.localStorage.setItem('rhythmotune.profile.v1', '{invalid-json');
    expect(loadUserProfile()).toEqual(DEFAULT_USER_PROFILE);
  });
});
