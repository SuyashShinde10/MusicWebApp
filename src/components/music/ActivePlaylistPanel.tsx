import { Disc3, GripVertical, ListMusic, Pencil, Play, Plus, Scissors, Trash2 } from 'lucide-react';
import type { Playlist, Song, SongId } from '../../types/music';
import { formatPlaylistSummary } from '../../utils/formatters';
import { computeTotalDuration } from '../../utils/playlistLogic';
import { Shredder } from '../reactbits';
import { Button } from '../ui/Button';
import { AlbumArt } from './AlbumArt';
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
  const coverSong = songs[0];
  const heroTint = coverSong?.frameColor ?? '#198f85';
  const shredderHeight = Math.max(150, songs.length * 66 + 76);

  return (
    <section
      aria-label={`Playlist ${playlist.name}`}
      className="rounded-2xl bg-white border border-slate-200 dark:bg-[#15171c] dark:border-white/[0.08] overflow-hidden min-w-0 shadow-sm dark:shadow-xl"
    >
      {/* Ambient Playlist Detail Hero Banner (Spotify-inspired on mobile, streamlined on desktop) */}
      <div
        style={{
          background: isDark
            ? `linear-gradient(180deg, ${heroTint}55 0%, rgba(21,23,28,0.92) 100%)`
            : `linear-gradient(180deg, ${heroTint}24 0%, rgba(255,255,255,1) 100%)`,
        }}
        className="p-4 sm:p-5 border-b border-slate-200/90 dark:border-white/[0.07]"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-center sm:items-center gap-4 min-w-0 text-center sm:text-left">
            {coverSong ? (
              <div className="relative shrink-0">
                <div className="w-32 h-32 sm:w-16 sm:h-16 rounded-2xl sm:rounded-xl overflow-hidden shadow-xl ring-1 ring-black/10 dark:ring-white/15">
                  <AlbumArt song={coverSong} size="fill" className="!rounded-2xl sm:!rounded-xl" />
                </div>
                <span className="hidden sm:flex absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#198f85] text-white items-center justify-center shadow ring-2 ring-white dark:ring-[#15171c]">
                  <ListMusic className="w-2.5 h-2.5" />
                </span>
              </div>
            ) : (
              <div className="w-24 h-24 sm:w-14 sm:h-14 rounded-2xl sm:rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0">
                <ListMusic className="w-8 h-8 sm:w-6 sm:h-6" />
              </div>
            )}

            <div className="min-w-0">
              <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-teal-500/15 text-teal-700 dark:bg-teal-500/20 dark:text-teal-300 border border-teal-500/25">
                  Active Playlist
                </span>
                <span className="text-xs font-medium text-slate-600 dark:text-gray-300">
                  {summary}
                </span>
              </div>
              <h3 className="text-xl sm:text-xl font-extrabold text-slate-900 dark:text-white truncate mt-1 tracking-tight">
                {playlist.name}
              </h3>
            </div>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-2 flex-wrap shrink-0 pt-1 sm:pt-0">
            <div className="flex items-center gap-2">
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
            {songs.length > 0 && (
              <Button
                variant="primary"
                size="sm"
                leftIcon={<Play className="w-3.5 h-3.5 fill-current" />}
                onClick={() => onPlayAll(playlist.id)}
                className="shadow-md"
              >
                Play All
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-5 space-y-3.5">

      {songs.length === 0 ? (
        <EmptyState
          icon={<Disc3 className="w-5 h-5" />}
          title="Empty Playlist"
          description={`"${playlist.name}" doesn't have any songs yet. Add tracks from the Song Library.`}
          actionLabel="Add Songs from Library"
          onAction={onBrowseLibrary}
        />
      ) : (
        <div className="space-y-2.5 min-w-0">
          <div className="flex flex-wrap items-center justify-between gap-2 px-1">
            <div className="inline-flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-gray-400">
              <GripVertical className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
              <span>
                Drag rows to reorder · Pull past the teal slit to remove, or use arrows
              </span>
            </div>
            <button
              type="button"
              onClick={onBrowseLibrary}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add more tracks</span>
            </button>
          </div>

          <div className="relative w-full overflow-hidden rounded-xl bg-slate-50/90 border border-slate-200/90 dark:bg-[#0d1016] dark:border-white/[0.06] pt-2">
            <Shredder
              key={playlist.id}
              items={songs}
              width={1400}
              height={shredderHeight}
              inset={10}
              gap={8}
              slitHeight={3}
              fallHeight={66}
              feedSpeed={190}
              bite={18}
              stripWidth={10}
              curl={1}
              slitColor="#198f85"
              color={isDark ? '#f3f4f6' : '#0f172a'}
              className="!w-full"
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
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 bottom-0 h-[66px] bg-gradient-to-b from-teal-500/[0.05] to-transparent flex items-center justify-center gap-1.5 text-[11px] font-medium text-slate-400 dark:text-gray-500"
            >
              <Scissors className="w-3.5 h-3.5 text-teal-600/70 dark:text-teal-400/70" />
              <span>Shred zone — pull a track below the line to remove</span>
            </div>
          </div>
        </div>
      )}
      </div>
    </section>
  );
}
