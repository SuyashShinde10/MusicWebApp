import { Check, ListPlus, Plus } from 'lucide-react';
import type { Playlist, Song } from '../../types/music';
import { formatDuration } from '../../utils/formatters';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';

interface AddToPlaylistModalProps {
  song: Song | null;
  playlists: Playlist[];
  onClose: () => void;
  onAddToPlaylist: (playlistId: string, song: Song) => void;
  onOpenCreatePlaylist: () => void;
}

export function AddToPlaylistModal({
  song,
  playlists,
  onClose,
  onAddToPlaylist,
  onOpenCreatePlaylist,
}: AddToPlaylistModalProps) {
  return (
    <Modal
      isOpen={Boolean(song)}
      onClose={onClose}
      title="Add to Playlist"
      subtitle={
        song
          ? `${song.title} · ${song.artist} (${formatDuration(song.duration)})`
          : undefined
      }
      icon={<ListPlus className="w-5 h-5" />}
      maxWidthClass="max-w-md"
      footer={
        <div className="w-full flex items-center justify-between gap-2">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Plus className="w-3.5 h-3.5" />}
            onClick={() => {
              onClose();
              onOpenCreatePlaylist();
            }}
          >
            New Playlist
          </Button>
          <Button variant="ghost" size="sm" onClick={onClose}>
            Done
          </Button>
        </div>
      }
    >
      {song && (
        <div className="space-y-2">
          {playlists.length === 0 ? (
            <div className="py-6 text-center space-y-3">
              <p className="text-sm text-gray-400">
                You don&apos;t have any playlists yet. Create one first to add this song.
              </p>
              <Button
                variant="primary"
                size="sm"
                leftIcon={<Plus className="w-3.5 h-3.5" />}
                onClick={() => {
                  onClose();
                  onOpenCreatePlaylist();
                }}
              >
                Create Playlist
              </Button>
            </div>
          ) : (
            playlists.map((playlist) => {
              const alreadyAdded = playlist.songIds.some((id) => id === song.id);
              return (
                <button
                  key={playlist.id}
                  type="button"
                  disabled={alreadyAdded}
                  onClick={() => {
                    onAddToPlaylist(playlist.id, song);
                  }}
                  className={`w-full flex items-center justify-between gap-3 p-3 rounded-2xl border text-left transition ${
                    alreadyAdded
                      ? 'bg-brand-500/10 border-brand-500/30 opacity-80 cursor-not-allowed'
                      : 'bg-surface-sidebar hover:bg-brand-500/15 border-white/10 hover:border-brand-500/40'
                  }`}
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{playlist.name}</p>
                    <p className="text-xs text-gray-400">
                      {playlist.songIds.length}{' '}
                      {playlist.songIds.length === 1 ? 'song' : 'songs'}
                    </p>
                  </div>
                  {alreadyAdded ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-brand-500/20 text-brand-400 shrink-0">
                      <Check className="w-3 h-3" />
                      Added
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-white/10 text-gray-200 shrink-0">
                      <Plus className="w-3 h-3" />
                      Add
                    </span>
                  )}
                </button>
              );
            })
          )}
        </div>
      )}
    </Modal>
  );
}
