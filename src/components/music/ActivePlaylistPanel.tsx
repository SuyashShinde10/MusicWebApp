import { useState } from 'react';
import { Disc3, ListMusic, Pencil, Play, Plus, Trash2 } from 'lucide-react';
import type { Playlist, Song, SongId } from '../../types/music';
import { formatPlaylistSummary } from '../../utils/formatters';
import { computeTotalDuration } from '../../utils/playlistLogic';
import { Button } from '../ui/Button';
import { EmptyState } from './EmptyState';
import { SongRow } from './SongRow';

interface ActivePlaylistPanelProps {
  playlist: Playlist | null;
  songs: Song[];
  currentSongId: SongId | null;
  isPlaying: boolean;
  onPlaySong: (song: Song, playlistId: string) => void;
  onPlayAll: (playlistId: string) => void;
  onMoveSong: (playlistId: string, fromIndex: number, toIndex: number) => void;
  onRemoveSong: (playlistId: string, songId: SongId) => void;
  onRenamePlaylist: (playlist: Playlist) => void;
  onDeletePlaylist: (playlist: Playlist) => void;
  onCreatePlaylist: () => void;
  onBrowseLibrary: () => void;
}

export function ActivePlaylistPanel({
  playlist,
  songs,
  currentSongId,
  isPlaying,
  onPlaySong,
  onPlayAll,
  onMoveSong,
  onRemoveSong,
  onRenamePlaylist,
  onDeletePlaylist,
  onCreatePlaylist,
  onBrowseLibrary,
}: ActivePlaylistPanelProps) {
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  if (!playlist) {
    return (
      <EmptyState
        icon={<ListMusic className="w-6 h-6" />}
        title="No playlist selected"
        description="Create a playlist or pick one from your collection to organize and reorder tracks."
        actionLabel="Create Playlist"
        onAction={onCreatePlaylist}
      />
    );
  }

  const totalSeconds = computeTotalDuration(songs);
  const summary = formatPlaylistSummary(songs.length, totalSeconds);

  return (
    <section
      aria-label={`Playlist ${playlist.name}`}
      className="rounded-3xl bg-surface-card/70 border border-white/10 p-4 sm:p-5 space-y-4 min-w-0"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-brand-400">
              Active Playlist
            </span>
          </div>
          <h3 className="text-lg sm:text-xl font-extrabold text-white truncate mt-0.5">
            {playlist.name}
          </h3>
          <p className="text-xs font-medium text-gray-400 mt-0.5">{summary}</p>
        </div>

        <div className="flex items-center gap-2 flex-wrap shrink-0">
          {songs.length > 0 && (
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Play className="w-3.5 h-3.5 fill-current" />}
              onClick={() => onPlayAll(playlist.id)}
            >
              Play All
            </Button>
          )}
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<Pencil className="w-3.5 h-3.5" />}
            onClick={() => onRenamePlaylist(playlist)}
          >
            Rename
          </Button>
          <Button
            variant="danger"
            size="sm"
            leftIcon={<Trash2 className="w-3.5 h-3.5" />}
            onClick={() => onDeletePlaylist(playlist)}
          >
            Delete
          </Button>
        </div>
      </div>

      {songs.length === 0 ? (
        <EmptyState
          icon={<Disc3 className="w-6 h-6" />}
          title="Empty Playlist"
          description={`"${playlist.name}" doesn't have any songs yet. Add tracks from the Song Library.`}
          actionLabel="Add Songs from Library"
          onAction={onBrowseLibrary}
        />
      ) : (
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1 text-[11px] text-gray-500">
            <span>Tracklist · Drag or use arrows to reorder</span>
            <span>{summary}</span>
          </div>
          {songs.map((song, idx) => (
            <SongRow
              key={song.id}
              song={song}
              variant="row"
              index={idx}
              isCurrent={currentSongId === song.id}
              isPlaying={currentSongId === song.id && isPlaying}
              onPlay={(s) => onPlaySong(s, playlist.id)}
              canMoveUp={idx > 0}
              canMoveDown={idx < songs.length - 1}
              onMoveUp={() => onMoveSong(playlist.id, idx, idx - 1)}
              onMoveDown={() => onMoveSong(playlist.id, idx, idx + 1)}
              onRemove={() => onRemoveSong(playlist.id, song.id)}
              draggable
              isDragging={dragIndex === idx}
              isDragOver={dragOverIndex === idx && dragIndex !== idx}
              onDragStart={() => setDragIndex(idx)}
              onDragOver={(e) => {
                e.preventDefault();
                if (dragOverIndex !== idx) {
                  setDragOverIndex(idx);
                }
              }}
              onDrop={() => {
                if (dragIndex !== null && dragIndex !== idx) {
                  onMoveSong(playlist.id, dragIndex, idx);
                }
                setDragIndex(null);
                setDragOverIndex(null);
              }}
              onDragEnd={() => {
                setDragIndex(null);
                setDragOverIndex(null);
              }}
            />
          ))}
        </div>
      )}

      <div className="pt-1 flex justify-end sm:hidden">
        <Button
          variant="outline"
          size="sm"
          leftIcon={<Plus className="w-3.5 h-3.5" />}
          onClick={onBrowseLibrary}
        >
          Browse Song Library
        </Button>
      </div>
    </section>
  );
}
