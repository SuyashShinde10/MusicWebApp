import { Disc3, ListMusic, Pencil, Play, Plus, Trash2 } from 'lucide-react';
import type { Playlist, Song, SongId } from '../../types/music';
import { formatPlaylistSummary } from '../../utils/formatters';
import { computeTotalDuration } from '../../utils/playlistLogic';
import { Shredder } from '../reactbits';
import { Button } from '../ui/Button';
import { EmptyState } from './EmptyState';
import { SongRow } from './SongRow';

interface ActivePlaylistPanelProps {
  playlist: Playlist | null;
  songs: Song[];
  currentSongId: SongId | null;
  isPlaying: boolean;
  isDark?: boolean;
  onPlaySong: (song: Song, playlistId: string) => void;
  onPlayAll: (playlistId: string) => void;
  onMoveSong: (playlistId: string, fromIndex: number, toIndex: number) => void;
  onSetSongOrder: (playlistId: string, orderedSongIds: SongId[]) => void;
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
  isDark = false,
  onPlaySong,
  onPlayAll,
  onMoveSong,
  onSetSongOrder,
  onRemoveSong,
  onRenamePlaylist,
  onDeletePlaylist,
  onCreatePlaylist,
  onBrowseLibrary,
}: ActivePlaylistPanelProps) {
  if (!playlist) {
    return (
      <EmptyState
        icon={<ListMusic className="w-5 h-5" />}
        title="No playlist selected"
        description="Create a playlist or pick one from your collection to organize and reorder tracks."
        actionLabel="Create Playlist"
        onAction={onCreatePlaylist}
      />
    );
  }

  const totalSeconds = computeTotalDuration(songs);
  const summary = formatPlaylistSummary(songs.length, totalSeconds);
  const shredderHeight = Math.max(220, songs.length * 74 + 118);

  return (
    <section
      aria-label={`Playlist ${playlist.name}`}
      className="rounded-2xl bg-white border border-slate-200 dark:bg-[#15171c] dark:border-white/[0.07] p-3.5 sm:p-4 space-y-3 min-w-0 shadow-sm dark:shadow-none"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2.5 border-b border-slate-200 dark:border-white/[0.07]">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-teal-600 dark:text-teal-400">
              Active Playlist
            </span>
            <span className="text-slate-300 dark:text-gray-600" aria-hidden="true">
              ·
            </span>
            <span className="text-[11px] font-medium text-slate-500 dark:text-gray-400">
              {summary}
            </span>
          </div>
          <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white truncate">
            {playlist.name}
          </h3>
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
          icon={<Disc3 className="w-5 h-5" />}
          title="Empty Playlist"
          description={`"${playlist.name}" doesn't have any songs yet. Add tracks from the Song Library.`}
          actionLabel="Add Songs from Library"
          onAction={onBrowseLibrary}
        />
      ) : (
        <div className="space-y-2 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 px-1 text-[11px] text-slate-500 dark:text-gray-400">
            <span>
              Drag rows to reorder · Pull below the teal slit to shred &amp; remove, or use arrows
            </span>
            <span className="text-teal-600 dark:text-teal-400 font-semibold shrink-0">
              {summary}
            </span>
          </div>

          <div className="w-full overflow-hidden rounded-xl bg-slate-100/80 border border-slate-200 dark:bg-[#0e1015] dark:border-white/[0.05] pt-2.5">
            <Shredder
              key={playlist.id}
              items={songs}
              width={960}
              height={shredderHeight}
              inset={10}
              gap={8}
              slitHeight={4}
              fallHeight={94}
              feedSpeed={190}
              bite={18}
              stripWidth={10}
              curl={1}
              slitColor="#198f85"
              color={isDark ? '#f3f4f6' : '#0f172a'}
              onReorder={(reordered) =>
                onSetSongOrder(
                  playlist.id,
                  reordered.map((song) => song.id)
                )
              }
              onShred={(song) => onRemoveSong(playlist.id, song.id)}
              renderItem={(song, idx) => (
                <SongRow
                  song={song}
                  variant="row"
                  index={idx}
                  showDragHandle
                  isCurrent={currentSongId === song.id}
                  isPlaying={currentSongId === song.id && isPlaying}
                  onPlay={(s) => onPlaySong(s, playlist.id)}
                  canMoveUp={idx > 0}
                  canMoveDown={idx < songs.length - 1}
                  onMoveUp={() => onMoveSong(playlist.id, idx, idx - 1)}
                  onMoveDown={() => onMoveSong(playlist.id, idx, idx + 1)}
                  onRemove={() => onRemoveSong(playlist.id, song.id)}
                />
              )}
            />
          </div>
        </div>
      )}

      <div className="pt-0.5 flex justify-end sm:hidden">
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
