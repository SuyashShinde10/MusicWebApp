export type SongId = string | number;

export interface Song {
  id: SongId;
  title: string;
  artist: string;
  genre: string;
  /** Duration in seconds */
  duration: number;
  plays?: string;
  artworkGradient?: string;
  coverImage?: string;
  frameColor?: string;
  audioUrl?: string;
}

export interface Playlist {
  id: string;
  name: string;
  songIds: SongId[];
  createdAt: number;
  updatedAt: number;
}

export type AppSection = 'home' | 'search' | 'library' | 'playlists';

export type MembershipPlan = 'Premium' | 'Hi-Fi Studio' | 'Free';
export type AudioQuality = 'Standard' | 'High' | 'Lossless';

export interface UserProfile {
  name: string;
  handle: string;
  plan: MembershipPlan;
  avatarUrl: string;
  audioQuality: AudioQuality;
}

export interface ToastItem {
  id: string;
  message: string;
  variant: 'success' | 'info' | 'error';
}
