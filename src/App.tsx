import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  AudioLines,
  Home,
  LayoutGrid,
  List,
  ListMusic,
  Music,
  Plus,
  Search,
  Sparkles,
  WifiOff,
  X,
} from 'lucide-react';
import { AddToPlaylistModal } from './components/modals/AddToPlaylistModal';
import { DeleteConfirmModal } from './components/modals/DeleteConfirmModal';
import { PlaylistFormModal } from './components/modals/PlaylistFormModal';
import { PlaylistManagerModal } from './components/modals/PlaylistManagerModal';
import { ActivePlaylistPanel } from './components/music/ActivePlaylistPanel';
import { EmptyState } from './components/music/EmptyState';
import { FeaturedShowcase } from './components/music/FeaturedShowcase';
import { PlayerBar } from './components/music/PlayerBar';
import { PlaylistCard } from './components/music/PlaylistCard';
import { LibrarySkeleton } from './components/music/Skeletons';
import { SongRow } from './components/music/SongRow';
import { Button } from './components/ui/Button';
import { Input } from './components/ui/Input';
import { Toast } from './components/ui/Toast';
import {
  loadActivePlaylistId,
  loadLikedSongIds,
  loadPlaylists,
  saveActivePlaylistId,
  saveLikedSongIds,
  savePlaylists,
} from './services/playlistStorage';
import { fetchSongs } from './services/songService';
import type { AppSection, Playlist, Song, SongId, ToastItem } from './types/music';
import {
  addSongToPlaylist,
  computeTotalDuration,
  createPlaylist,
  deletePlaylist,
  extractGenres,
  filterSongs,
  removeSongFromPlaylist,
  renamePlaylist,
  reorderPlaylistSongs,
  resolvePlaylistSongs,
} from './utils/playlistLogic';

type QueueSource = { type: 'library' } | { type: 'playlist'; playlistId: string };

export function App() {
  // Library state
  const [songs, setSongs] = useState<Song[]>([]);
  const [isLoadingSongs, setIsLoadingSongs] = useState(true);
  const [songsError, setSongsError] = useState<string | null>(null);

  // Filters & view state
  const [activeSection, setActiveSection] = useState<AppSection>('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [libraryLayout, setLibraryLayout] = useState<'grid' | 'list'>('grid');

  // Playlists & persistence
  const [playlists, setPlaylists] = useState<Playlist[]>(() => loadPlaylists());
  const [activePlaylistId, setActivePlaylistId] = useState<string | null>(() => {
    const saved = loadActivePlaylistId();
    const loaded = loadPlaylists();
    if (saved && loaded.some((p) => p.id === saved)) {
      return saved;
    }
    return loaded[0]?.id ?? null;
  });
  const [likedSongIds, setLikedSongIds] = useState<SongId[]>(() => loadLikedSongIds());

  // Playback state
  const [currentSongId, setCurrentSongId] = useState<SongId | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isShuffle, setIsShuffle] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);
  const [volume, setVolume] = useState(0.75);
  const [queueSource, setQueueSource] = useState<QueueSource>({ type: 'library' });

  // Modal & toast state
  const [playlistFormState, setPlaylistFormState] = useState<{
    isOpen: boolean;
    mode: 'create' | 'rename';
    target: Playlist | null;
  }>({ isOpen: false, mode: 'create', target: null });
  const [playlistToDelete, setPlaylistToDelete] = useState<Playlist | null>(null);
  const [songToAdd, setSongToAdd] = useState<Song | null>(null);
  const [isManagerOpen, setIsManagerOpen] = useState(false);
  const [toast, setToast] = useState<ToastItem | null>(null);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const librarySectionRef = useRef<HTMLElement>(null);
  const toastTimerRef = useRef<number | null>(null);

  const showToast = useCallback(
    (message: string, variant: ToastItem['variant'] = 'success') => {
      if (toastTimerRef.current) {
        window.clearTimeout(toastTimerRef.current);
      }
      setToast({ id: String(Date.now()), message, variant });
      toastTimerRef.current = window.setTimeout(() => {
        setToast(null);
      }, 2800);
    },
    []
  );

  // Load songs via Axios
  const loadSongLibrary = useCallback(async () => {
    setIsLoadingSongs(true);
    setSongsError(null);
    try {
      const data = await fetchSongs();
      setSongs(data);
      setCurrentSongId((prev) => prev ?? data[5]?.id ?? data[0]?.id ?? null);
    } catch {
      setSongsError('Unable to load the song library. Please check your connection and try again.');
    } finally {
      setIsLoadingSongs(false);
    }
  }, []);

  useEffect(() => {
    void loadSongLibrary();
  }, [loadSongLibrary]);

  // Persist playlists, active playlist ID, and liked tracks
  useEffect(() => {
    savePlaylists(playlists);
  }, [playlists]);

  useEffect(() => {
    saveActivePlaylistId(activePlaylistId);
  }, [activePlaylistId]);

  useEffect(() => {
    saveLikedSongIds(likedSongIds);
  }, [likedSongIds]);

  // Derived maps & lists
  const songsById = useMemo(() => {
    const map = new Map<SongId, Song>();
    for (const song of songs) {
      map.set(song.id, song);
    }
    return map;
  }, [songs]);

  const genres = useMemo(() => extractGenres(songs), [songs]);

  const filteredSongs = useMemo(
    () => filterSongs(songs, searchQuery, selectedGenre),
    [songs, searchQuery, selectedGenre]
  );

  const activePlaylist = useMemo(
    () => playlists.find((p) => p.id === activePlaylistId) ?? playlists[0] ?? null,
    [playlists, activePlaylistId]
  );

  const activePlaylistSongs = useMemo(
    () => (activePlaylist ? resolvePlaylistSongs(activePlaylist, songsById) : []),
    [activePlaylist, songsById]
  );

  const activePlaylistSongIdSet = useMemo(
    () => new Set<SongId>(activePlaylist?.songIds ?? []),
    [activePlaylist]
  );

  const currentSong = useMemo(
    () => (currentSongId !== null ? songsById.get(currentSongId) ?? null : null),
    [currentSongId, songsById]
  );

  // Active playback queue
  const playbackQueue = useMemo(() => {
    if (queueSource.type === 'playlist') {
      const pl = playlists.find((p) => p.id === queueSource.playlistId);
      if (pl) {
        const resolved = resolvePlaylistSongs(pl, songsById);
        if (resolved.length > 0) return resolved;
      }
    }
    return filteredSongs.length > 0 ? filteredSongs : songs;
  }, [queueSource, playlists, songsById, filteredSongs, songs]);

  const queueLabel = useMemo(() => {
    if (queueSource.type === 'playlist') {
      const pl = playlists.find((p) => p.id === queueSource.playlistId);
      if (pl) return pl.name;
    }
    return 'Song Library';
  }, [queueSource, playlists]);

  // Playback navigation helpers
  const playSong = useCallback(
    (song: Song, source: QueueSource = { type: 'library' }) => {
      if (currentSongId === song.id) {
        setIsPlaying((prev) => !prev);
        return;
      }
      setQueueSource(source);
      setCurrentSongId(song.id);
      setElapsedSeconds(0);
      setIsPlaying(true);
    },
    [currentSongId]
  );

  const playNext = useCallback(() => {
    if (playbackQueue.length === 0) return;
    const currentIndex = playbackQueue.findIndex((s) => s.id === currentSongId);
    let nextIndex: number;
    if (isShuffle && playbackQueue.length > 1) {
      do {
        nextIndex = Math.floor(Math.random() * playbackQueue.length);
      } while (nextIndex === currentIndex);
    } else {
      nextIndex = currentIndex >= 0 ? (currentIndex + 1) % playbackQueue.length : 0;
    }
    const nextSong = playbackQueue[nextIndex];
    if (nextSong) {
      setCurrentSongId(nextSong.id);
      setElapsedSeconds(0);
      setIsPlaying(true);
    }
  }, [playbackQueue, currentSongId, isShuffle]);

  const playPrev = useCallback(() => {
    if (playbackQueue.length === 0) return;
    if (elapsedSeconds > 3) {
      setElapsedSeconds(0);
      return;
    }
    const currentIndex = playbackQueue.findIndex((s) => s.id === currentSongId);
    const prevIndex =
      currentIndex >= 0
        ? (currentIndex - 1 + playbackQueue.length) % playbackQueue.length
        : playbackQueue.length - 1;
    const prevSong = playbackQueue[prevIndex];
    if (prevSong) {
      setCurrentSongId(prevSong.id);
      setElapsedSeconds(0);
      setIsPlaying(true);
    }
  }, [playbackQueue, currentSongId, elapsedSeconds]);

  // Simulated playback timer
  useEffect(() => {
    if (!isPlaying || !currentSong) return;
    const interval = window.setInterval(() => {
      setElapsedSeconds((prev) => {
        if (prev + 1 >= currentSong.duration) {
          if (isRepeat) {
            return 0;
          }
          playNext();
          return 0;
        }
        return prev + 1;
      });
    }, 1000);
    return () => window.clearInterval(interval);
  }, [isPlaying, currentSong, isRepeat, playNext]);

  // Global keyboard shortcuts (Cmd/Ctrl+K search, Space play/pause)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
        return;
      }
      const target = e.target as HTMLElement | null;
      const isTyping =
        target?.tagName === 'INPUT' ||
        target?.tagName === 'TEXTAREA' ||
        target?.tagName === 'SELECT' ||
        target?.isContentEditable;
      if (!isTyping && e.code === 'Space' && currentSong) {
        e.preventDefault();
        setIsPlaying((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentSong]);

  // Playlist CRUD handlers
  const handleCreateOrRenamePlaylist = (name: string) => {
    try {
      if (playlistFormState.mode === 'create') {
        const { playlists: next, created } = createPlaylist(name, playlists);
        setPlaylists(next);
        setActivePlaylistId(created.id);
        showToast(`Created playlist "${created.name}"`);
      } else if (playlistFormState.target) {
        const targetId = playlistFormState.target.id;
        const next = renamePlaylist(playlists, targetId, name);
        setPlaylists(next);
        showToast(`Renamed playlist to "${name}"`);
      }
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Unable to save playlist.', 'error');
    }
  };

  const handleConfirmDeletePlaylist = (playlistId: string) => {
    const target = playlists.find((p) => p.id === playlistId);
    const next = deletePlaylist(playlists, playlistId);
    setPlaylists(next);
    if (activePlaylistId === playlistId) {
      setActivePlaylistId(next[0]?.id ?? null);
    }
    if (queueSource.type === 'playlist' && queueSource.playlistId === playlistId) {
      setQueueSource({ type: 'library' });
    }
    if (target) {
      showToast(`Deleted "${target.name}"`, 'info');
    }
  };

  const handleAddSongToPlaylist = (playlistId: string, song: Song) => {
    const targetPlaylist = playlists.find((p) => p.id === playlistId);
    const { playlists: next, added } = addSongToPlaylist(playlists, playlistId, song.id);
    if (!added) {
      showToast(`"${song.title}" is already in "${targetPlaylist?.name ?? 'playlist'}"`, 'info');
      return;
    }
    setPlaylists(next);
    setActivePlaylistId(playlistId);
    showToast(`Added "${song.title}" to "${targetPlaylist?.name ?? 'playlist'}"`);
  };

  const handleRemoveSongFromPlaylist = (playlistId: string, songId: SongId) => {
    const song = songsById.get(songId);
    setPlaylists((prev) => removeSongFromPlaylist(prev, playlistId, songId));
    showToast(song ? `Removed "${song.title}" from playlist` : 'Song removed from playlist', 'info');
  };

  const handleReorderSongs = (playlistId: string, fromIndex: number, toIndex: number) => {
    setPlaylists((prev) => reorderPlaylistSongs(prev, playlistId, fromIndex, toIndex));
  };

  const handleToggleLike = () => {
    if (!currentSong) return;
    setLikedSongIds((prev) => {
      const exists = prev.some((id) => id === currentSong.id);
      if (exists) {
        showToast(`Removed "${currentSong.title}" from Favorites`, 'info');
        return prev.filter((id) => id !== currentSong.id);
      }
      showToast(`Added "${currentSong.title}" to Favorites`);
      return [...prev, currentSong.id];
    });
  };

  const getPlaylistDuration = (playlist: Playlist) =>
    computeTotalDuration(resolvePlaylistSongs(playlist, songsById));

  const scrollToLibrary = () => {
    setActiveSection('library');
    window.setTimeout(() => {
      librarySectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 60);
  };

  const openCreateModal = () =>
    setPlaylistFormState({ isOpen: true, mode: 'create', target: null });

  const openRenameModal = (playlist: Playlist) =>
    setPlaylistFormState({ isOpen: true, mode: 'rename', target: playlist });

  const isCurrentLiked = currentSong
    ? likedSongIds.some((id) => id === currentSong.id)
    : false;

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-surface-base text-gray-200 flex">
      {/* Desktop Sidebar (lg+) */}
      <aside className="hidden lg:flex w-64 bg-surface-sidebar border-r border-white/10 flex-col justify-between shrink-0 sticky top-0 h-screen pb-24">
        <div className="p-5 flex flex-col gap-6 overflow-y-auto no-scrollbar">
          {/* Brand Logo */}
          <div className="flex items-center gap-3 px-1">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-brand-400 flex items-center justify-center shadow-glow-sm text-white shrink-0">
              <AudioLines className="w-5 h-5" />
            </div>
            <span className="text-xl font-extrabold tracking-tight text-white">
              Rhythmo<span className="text-brand-400">Tune</span>
            </span>
          </div>

          {/* Primary Nav */}
          <nav aria-label="Main navigation" className="flex flex-col gap-1.5">
            {(
              [
                { id: 'home', label: 'Home', Icon: Home },
                { id: 'library', label: 'Song Library', Icon: Music },
                { id: 'playlists', label: 'Playlists', Icon: ListMusic },
              ] as const
            ).map(({ id, label, Icon }) => {
              const active = activeSection === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setActiveSection(id)}
                  className={`flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-semibold transition text-left ${
                    active
                      ? 'bg-surface-pill text-white border border-white/10 shadow-inner'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${active ? 'text-brand-400' : ''}`} />
                  <span>{label}</span>
                </button>
              );
            })}
          </nav>

          {/* Sidebar Playlists */}
          <div className="pt-4 border-t border-white/10 space-y-3">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                Playlists ({playlists.length})
              </span>
              <button
                type="button"
                onClick={openCreateModal}
                aria-label="Create new playlist"
                title="Create new playlist"
                className="w-7 h-7 rounded-lg bg-white/5 hover:bg-brand-500 text-gray-300 hover:text-white flex items-center justify-center transition"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            {playlists.length === 0 ? (
              <p className="text-xs text-gray-500 px-1">
                No playlists yet. Click + to create one.
              </p>
            ) : (
              <div className="space-y-2">
                {playlists.map((pl) => (
                  <PlaylistCard
                    key={pl.id}
                    playlist={pl}
                    totalDurationSeconds={getPlaylistDuration(pl)}
                    isActive={activePlaylist?.id === pl.id}
                    compact
                    onSelect={(id) => {
                      setActivePlaylistId(id);
                      setActiveSection('playlists');
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="p-4 border-t border-white/10">
          <Button
            variant="outline"
            size="md"
            className="w-full"
            leftIcon={<ListMusic className="w-4 h-4 text-brand-400" />}
            onClick={() => setIsManagerOpen(true)}
          >
            Playlist Manager
          </Button>
        </div>
      </aside>

      {/* Main Content Shell */}
      <div className="flex-1 flex flex-col min-w-0 pb-40 md:pb-28">
        {/* Sticky Top Header */}
        <header className="sticky top-0 z-30 bg-surface-base/90 backdrop-blur-xl border-b border-white/10 px-4 sm:px-6 lg:px-8 py-3.5">
          <div className="flex items-center justify-between gap-3">
            {/* Mobile / Tablet Brand Logo */}
            <div className="flex lg:hidden items-center gap-2 shrink-0">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-600 to-brand-400 flex items-center justify-center shadow-glow-sm text-white">
                <AudioLines className="w-4 h-4" />
              </div>
              <span className="text-base sm:text-lg font-extrabold tracking-tight text-white">
                Rhythmo<span className="text-brand-400">Tune</span>
              </span>
            </div>

            {/* Search Input */}
            <div className="hidden sm:block flex-1 max-w-md min-w-0">
              <Input
                ref={searchInputRef}
                pill
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search songs, artists, or genres..."
                aria-label="Search songs"
                leftIcon={<Search className="w-4 h-4" />}
                rightElement={
                  searchQuery ? (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      aria-label="Clear search"
                      className="text-gray-400 hover:text-white p-1"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <kbd className="text-[10px] font-mono px-2 py-0.5 rounded bg-surface-base text-gray-400 border border-white/10">
                      ⌘K
                    </kbd>
                  )
                }
              />
            </div>

            {/* Right Controls */}
            <div className="flex items-center gap-2 shrink-0">
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Plus className="w-3.5 h-3.5 text-brand-400" />}
                onClick={openCreateModal}
              >
                <span className="hidden sm:inline">New Playlist</span>
                <span className="sm:hidden">New</span>
              </Button>
              <Button
                variant="secondary"
                size="sm"
                leftIcon={<ListMusic className="w-3.5 h-3.5 text-brand-400" />}
                onClick={() => setIsManagerOpen(true)}
                className="hidden md:inline-flex"
              >
                Manager
              </Button>
            </div>
          </div>

          {/* Mobile Search Bar (< sm) */}
          <div className="mt-3 sm:hidden">
            <Input
              pill
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search songs, artists, or genres..."
              aria-label="Search songs"
              leftIcon={<Search className="w-4 h-4" />}
              rightElement={
                searchQuery ? (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    aria-label="Clear search"
                    className="text-gray-400 hover:text-white p-1"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                ) : undefined
              }
            />
          </div>
        </header>

        {/* Main Scrollable Workspace */}
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-5 space-y-7 min-w-0 max-w-7xl w-full mx-auto">
          {/* Featured Showcase (Home view) */}
          {activeSection === 'home' && !isLoadingSongs && !songsError && songs.length > 0 && (
            <FeaturedShowcase
              songs={songs}
              currentSongId={currentSongId}
              isPlaying={isPlaying}
              onPlay={(song) => playSong(song, { type: 'library' })}
              onAddToPlaylist={(song) => setSongToAdd(song)}
            />
          )}

          {/* Mobile / Tablet Quick Playlists Strip (Home view on < lg) */}
          {activeSection === 'home' && (
            <section className="lg:hidden space-y-3 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-base font-bold text-white">Your Playlists</h2>
                <button
                  type="button"
                  onClick={() => setActiveSection('playlists')}
                  className="text-xs font-semibold text-brand-400 hover:text-brand-300"
                >
                  Manage all ({playlists.length})
                </button>
              </div>
              {playlists.length === 0 ? (
                <EmptyState
                  icon={<ListMusic className="w-5 h-5" />}
                  title="No playlists yet"
                  description="Create your first playlist to organize your favorite tracks."
                  actionLabel="Create Playlist"
                  onAction={openCreateModal}
                />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {playlists.slice(0, 4).map((pl) => (
                    <PlaylistCard
                      key={pl.id}
                      playlist={pl}
                      totalDurationSeconds={getPlaylistDuration(pl)}
                      isActive={activePlaylist?.id === pl.id}
                      compact
                      onSelect={(id) => {
                        setActivePlaylistId(id);
                        setActiveSection('playlists');
                      }}
                    />
                  ))}
                </div>
              )}
            </section>
          )}

          {/* Song Library Section (Home & Library views) */}
          {(activeSection === 'home' || activeSection === 'library') && (
            <section ref={librarySectionRef} aria-label="Song Library" className="space-y-4 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base sm:text-lg font-extrabold text-white tracking-tight">
                      {activeSection === 'library' ? 'Song Library' : 'Popular & Library Tracks'}
                    </h2>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-white/5 text-gray-300 border border-white/10">
                      {filteredSongs.length}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Filter by genre, search by title/artist, or add tracks to a playlist
                  </p>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <div className="inline-flex rounded-xl bg-surface-card border border-white/10 p-1">
                    <button
                      type="button"
                      onClick={() => setLibraryLayout('grid')}
                      aria-label="Grid view"
                      aria-pressed={libraryLayout === 'grid'}
                      className={`p-1.5 rounded-lg transition ${
                        libraryLayout === 'grid'
                          ? 'bg-brand-500 text-white'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      <LayoutGrid className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setLibraryLayout('list')}
                      aria-label="List view"
                      aria-pressed={libraryLayout === 'list'}
                      className={`p-1.5 rounded-lg transition ${
                        libraryLayout === 'list'
                          ? 'bg-brand-500 text-white'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      <List className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Genre Filter Pills */}
              {!isLoadingSongs && !songsError && (
                <div
                  role="tablist"
                  aria-label="Filter by genre"
                  className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1"
                >
                  {genres.map((genre) => {
                    const active = selectedGenre === genre;
                    return (
                      <button
                        key={genre}
                        type="button"
                        role="tab"
                        aria-selected={active}
                        onClick={() => setSelectedGenre(genre)}
                        className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition shrink-0 ${
                          active
                            ? 'bg-brand-500 text-white shadow-glow-sm'
                            : 'bg-surface-card hover:bg-surface-cardHover text-gray-300 border border-white/5'
                        }`}
                      >
                        {genre}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Loading / Error / No Results / Songs */}
              {isLoadingSongs ? (
                <LibrarySkeleton />
              ) : songsError ? (
                <EmptyState
                  icon={<WifiOff className="w-6 h-6 text-rose-400" />}
                  title="Could not load songs"
                  description={songsError}
                  actionLabel="Retry"
                  onAction={() => void loadSongLibrary()}
                />
              ) : filteredSongs.length === 0 ? (
                <EmptyState
                  icon={<Sparkles className="w-6 h-6" />}
                  title="No matching songs found"
                  description="Try clearing your search query or switching back to All genres."
                  actionLabel="Reset Filters"
                  onAction={() => {
                    setSearchQuery('');
                    setSelectedGenre('All');
                  }}
                />
              ) : libraryLayout === 'grid' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3.5">
                  {filteredSongs.map((song) => (
                    <SongRow
                      key={song.id}
                      song={song}
                      variant="card"
                      isCurrent={currentSongId === song.id}
                      isPlaying={currentSongId === song.id && isPlaying}
                      isInActivePlaylist={activePlaylistSongIdSet.has(song.id)}
                      onPlay={(s) => playSong(s, { type: 'library' })}
                      onAddToPlaylist={(s) => setSongToAdd(s)}
                    />
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredSongs.map((song, idx) => (
                    <SongRow
                      key={song.id}
                      song={song}
                      variant="row"
                      index={idx}
                      isCurrent={currentSongId === song.id}
                      isPlaying={currentSongId === song.id && isPlaying}
                      isInActivePlaylist={activePlaylistSongIdSet.has(song.id)}
                      onPlay={(s) => playSong(s, { type: 'library' })}
                      onAddToPlaylist={(s) => setSongToAdd(s)}
                    />
                  ))}
                </div>
              )}
            </section>
          )}

          {/* Active Playlist Section (always shown on Playlists view, and shown on Home view below library for quick management) */}
          {(activeSection === 'playlists' || activeSection === 'home') && (
            <section aria-label="Playlists Workspace" className="space-y-4 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <h2 className="text-base sm:text-lg font-extrabold text-white tracking-tight">
                    {activeSection === 'playlists' ? 'Your Playlists' : 'Manage Active Playlist'}
                  </h2>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Select a playlist, reorder tracks, or manage your collection
                  </p>
                </div>
                <Button
                  variant="primary"
                  size="sm"
                  leftIcon={<Plus className="w-3.5 h-3.5" />}
                  onClick={openCreateModal}
                >
                  Create Playlist
                </Button>
              </div>

              {activeSection === 'playlists' && playlists.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {playlists.map((pl) => (
                    <PlaylistCard
                      key={pl.id}
                      playlist={pl}
                      totalDurationSeconds={getPlaylistDuration(pl)}
                      isActive={activePlaylist?.id === pl.id}
                      onSelect={(id) => setActivePlaylistId(id)}
                      onRename={openRenameModal}
                      onDelete={(p) => setPlaylistToDelete(p)}
                    />
                  ))}
                </div>
              )}

              <ActivePlaylistPanel
                playlist={activePlaylist}
                songs={activePlaylistSongs}
                currentSongId={currentSongId}
                isPlaying={isPlaying}
                onPlaySong={(song, plId) => playSong(song, { type: 'playlist', playlistId: plId })}
                onPlayAll={(plId) => {
                  const first = activePlaylistSongs[0];
                  if (first) {
                    setQueueSource({ type: 'playlist', playlistId: plId });
                    setCurrentSongId(first.id);
                    setElapsedSeconds(0);
                    setIsPlaying(true);
                  }
                }}
                onMoveSong={handleReorderSongs}
                onRemoveSong={handleRemoveSongFromPlaylist}
                onRenamePlaylist={openRenameModal}
                onDeletePlaylist={(p) => setPlaylistToDelete(p)}
                onCreatePlaylist={openCreateModal}
                onBrowseLibrary={scrollToLibrary}
              />
            </section>
          )}
        </main>
      </div>

      {/* Persistent Now Playing Bar */}
      <PlayerBar
        currentSong={currentSong}
        isPlaying={isPlaying}
        elapsedSeconds={elapsedSeconds}
        isShuffle={isShuffle}
        isRepeat={isRepeat}
        isLiked={isCurrentLiked}
        volume={volume}
        hasNext={playbackQueue.length > 0}
        hasPrev={playbackQueue.length > 0}
        queueLabel={queueLabel}
        onTogglePlay={() => setIsPlaying((prev) => !prev)}
        onNext={playNext}
        onPrev={playPrev}
        onToggleShuffle={() => setIsShuffle((prev) => !prev)}
        onToggleRepeat={() => setIsRepeat((prev) => !prev)}
        onToggleLike={handleToggleLike}
        onSeek={(sec) => setElapsedSeconds(sec)}
        onVolumeChange={setVolume}
        onOpenPlaylistManager={() => setIsManagerOpen(true)}
      />

      {/* Mobile Bottom Navigation (< md) */}
      <nav
        aria-label="Mobile navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 h-[64px] bg-surface-base/95 backdrop-blur-2xl border-t border-white/10 z-30 px-4 flex items-center justify-around"
      >
        {(
          [
            { id: 'home', label: 'Home', Icon: Home },
            { id: 'library', label: 'Library', Icon: Music },
            { id: 'playlists', label: 'Playlists', Icon: ListMusic },
          ] as const
        ).map(({ id, label, Icon }) => {
          const active = activeSection === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => setActiveSection(id)}
              className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition ${
                active ? 'text-brand-400' : 'text-gray-400 hover:text-white'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-semibold">{label}</span>
            </button>
          );
        })}
      </nav>

      {/* Modals & Toast */}
      <PlaylistFormModal
        isOpen={playlistFormState.isOpen}
        mode={playlistFormState.mode}
        initialPlaylist={playlistFormState.target}
        playlists={playlists}
        onClose={() => setPlaylistFormState((prev) => ({ ...prev, isOpen: false }))}
        onSubmit={handleCreateOrRenamePlaylist}
      />

      <DeleteConfirmModal
        playlist={playlistToDelete}
        onClose={() => setPlaylistToDelete(null)}
        onConfirm={handleConfirmDeletePlaylist}
      />

      <AddToPlaylistModal
        song={songToAdd}
        playlists={playlists}
        onClose={() => setSongToAdd(null)}
        onAddToPlaylist={handleAddSongToPlaylist}
        onOpenCreatePlaylist={openCreateModal}
      />

      <PlaylistManagerModal
        isOpen={isManagerOpen}
        playlists={playlists}
        activePlaylist={activePlaylist}
        songsById={songsById}
        currentSongId={currentSongId}
        isPlaying={isPlaying}
        onClose={() => setIsManagerOpen(false)}
        onSelectPlaylist={(id) => setActivePlaylistId(id)}
        onOpenCreate={openCreateModal}
        onOpenRename={openRenameModal}
        onRequestDelete={(p) => setPlaylistToDelete(p)}
        onPlaySong={(song, plId) => playSong(song, { type: 'playlist', playlistId: plId })}
        onReorderSongs={handleReorderSongs}
        onRemoveSong={handleRemoveSongFromPlaylist}
      />

      <Toast toast={toast} onDismiss={() => setToast(null)} />
    </div>
  );
}

export default App;
