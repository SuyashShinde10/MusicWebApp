import { Disc3, ListMusic, Pencil, Plus, Trash2 } from 'lucide-react';
import type { Playlist, Song, SongId } from '../../types/music';
import { formatPlaylistSummary } from '../../utils/formatters';
import { computeTotalDuration, resolvePlaylistSongs } from '../../utils/playlistLogic';
import { EmptyState } from '../music/EmptyState';
import { SongRow } from '../music/SongRow';
import { AnimatedList } from '../reactbits';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';

interface PlaylistManagerModalProps {
  isOpen: boolean;
  playlists: Playlist[];
  activePlaylist: Playlist | null;
  songsById: Map<SongId, Song>;
  currentSongId: SongId | null;
  isPlaying: boolean;
  theme?: 'light' | 'dark';
  onClose: () => void;
  onSelectPlaylist: (playlistId: string) => void;
  onOpenCreate: () => void;
  onOpenRename: (playlist: Playlist) => void;
  onRequestDelete: (playlist: Playlist) => void;
  onPlaySong: (song: Song, playlistId: string) => void;
  onReorderSongs: (playlistId: string, fromIndex: number, toIndex: number) => void;
  onRemoveSong: (playlistId: string, songId: SongId) => void;
}

export function PlaylistManagerModal({
  isOpen,
  playlists,
  activePlaylist,
  songsById,
  currentSongId,
  isPlaying,
  theme = 'light',
  onClose,
  onSelectPlaylist,
  onOpenCreate,
  onOpenRename,
  onRequestDelete,
  onPlaySong,
  onReorderSongs,
  onRemoveSong,
}: PlaylistManagerModalProps) {
  const playlistSongs = activePlaylist ? resolvePlaylistSongs(activePlaylist, songsById) : [];
  const totalSeconds = computeTotalDuration(playlistSongs);
  const summary = formatPlaylistSummary(playlistSongs.length, totalSeconds);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Playlist Manager"
      subtitle="Create, rename, delete, and reorder your song queues"
      icon={<ListMusic className="w-5 h-5" />}
      maxWidthClass="max-w-2xl"
      footer={
        <div className="w-full flex items-center justify-between gap-2">
          <span className="text-[11px] text-slate-500 dark:text-gray-400">
            Use Up / Down arrows to reorder or click trash to remove
          </span>
          <Button variant="secondary" size="sm" onClick={onClose}>
            Done
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-white/10">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <label
              htmlFor="manager-playlist-select"
              className="text-xs font-semibold text-slate-500 dark:text-gray-400 shrink-0"
            >
              Playlist:
            </label>
            <select
              id="manager-playlist-select"
              value={activePlaylist?.id ?? ''}
              onChange={(e) => onSelectPlaylist(e.target.value)}
              disabled={playlists.length === 0}
              className="flex-1 min-w-0 bg-slate-50 border border-slate-200 text-slate-900 dark:bg-[#101319] dark:border-white/10 dark:text-white rounded-xl text-xs sm:text-sm font-semibold px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500/50"
            >
              {playlists.length === 0 ? (
                <option value="">No playlists available</option>
              ) : (
                playlists.map((pl) => (
                  <option key={pl.id} value={pl.id}>
                    {pl.name} ({pl.songIds.length})
                  </option>
                ))
              )}
            </select>
          </div>

          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Plus className="w-3.5 h-3.5" />}
              onClick={onOpenCreate}
            >
              New
            </Button>
            {activePlaylist && (
              <>
                <Button
                  variant="secondary"
                  size="sm"
                  leftIcon={<Pencil className="w-3.5 h-3.5" />}
                  onClick={() => onOpenRename(activePlaylist)}
                >
                  Rename
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  leftIcon={<Trash2 className="w-3.5 h-3.5" />}
                  onClick={() => onRequestDelete(activePlaylist)}
                >
                  Delete
                </Button>
              </>
            )}
          </div>
        </div>

        {!activePlaylist ? (
          <EmptyState
            icon={<ListMusic className="w-6 h-6" />}
            title="No playlists yet"
            description="Create your first playlist to start organizing songs."
            actionLabel="Create Playlist"
            onAction={onOpenCreate}
          />
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                {activePlaylist.name}
              </h3>
              <span className="text-xs font-medium text-teal-600 dark:text-teal-400 shrink-0">
                {summary}
              </span>
            </div>

            {playlistSongs.length === 0 ? (
              <EmptyState
                icon={<Disc3 className="w-6 h-6" />}
                title="This playlist is empty"
                description="Add songs from the Song Library using the + button on any track."
                actionLabel="Browse Songs"
                onAction={onClose}
              />
            ) : (
              <AnimatedList
                items={playlistSongs}
                width="100%"
                maxHeight={340}
                theme={theme}
                accentColor="#198f85"
                animation="pop"
                frame={false}
                gap={8}
                itemClassName="!p-0 !bg-transparent !shadow-none"
                renderItem={(song, idx) => (
                  <SongRow
                    song={song}
                    variant="row"
                    index={idx}
                    isCurrent={currentSongId === song.id}
                    isPlaying={currentSongId === song.id && isPlaying}
                    onPlay={(s) => onPlaySong(s, activePlaylist.id)}
                    canMoveUp={idx > 0}
                    canMoveDown={idx < playlistSongs.length - 1}
                    onMoveUp={() => onReorderSongs(activePlaylist.id, idx, idx - 1)}
                    onMoveDown={() => onReorderSongs(activePlaylist.id, idx, idx + 1)}
                    onRemove={() => onRemoveSong(activePlaylist.id, song.id)}
                  />
                )}
              />
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}
