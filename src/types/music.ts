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
}

export interface Playlist {
  id: string;
  name: string;
  songIds: SongId[];
  createdAt: number;
  updatedAt: number;
}

export type AppSection = 'home' | 'library' | 'playlists';

export interface ToastItem {
  id: string;
  message: string;
  variant: 'success' | 'info' | 'error';
}
