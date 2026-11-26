import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import gsap from 'gsap';
import {
  AudioLines,
  ChevronLeft,
  ChevronRight,
  Heart,
  Home,
  LayoutGrid,
  List,
  ListMusic,
  Menu,
  Moon,
  Music,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  Search,
  Settings,
  Sparkles,
  Sun,
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
import { AnimatedList } from './components/reactbits';
import { Button } from './components/ui/Button';
import { Input } from './components/ui/Input';
import { Toast } from './components/ui/Toast';
import {
  loadActivePlaylistId,
  loadLikedSongIds,
  loadPlaylists,
  loadTheme,
  saveActivePlaylistId,
  saveLikedSongIds,
  savePlaylists,
  saveTheme,
  type ThemeMode,
} from './services/playlistStorage';
import { fetchSongs } from './services/songService';
import type { AppSection, Playlist, Song, SongId, ToastItem } from './types/music';
import { animateMicroPop, animateStaggerIn, prefersReducedMotion } from './utils/gsapAnimations';
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
  setPlaylistSongOrder,
} from './utils/playlistLogic';

type QueueSource = { type: 'library' } | { type: 'playlist'; playlistId: string };

const NAV_ITEMS = [
  { id: 'home', label: 'Home', Icon: Home },
  { id: 'library', label: 'Song Library', Icon: Music },
  { id: 'playlists', label: 'Playlists', Icon: ListMusic },
] as const;

export function App() {
  // Theme state (Light mode by default)
  const [theme, setTheme] = useState<ThemeMode>(() => loadTheme());
  const isDark = theme === 'dark';

  // Library state
  const [songs, setSongs] = useState<Song[]>([]);
  const [isLoadingSongs, setIsLoadingSongs] = useState(true);
  const [songsError, setSongsError] = useState<string | null>(null);

  // Filters, navigation & sidebar state
  const [activeSection, setActiveSection] = useState<AppSection>('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [libraryLayout, setLibraryLayout] = useState<'grid' | 'list'>('grid');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
  const [isPlayerOpen, setIsPlayerOpen] = useState(true);
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
  const categoryScrollRef = useRef<HTMLDivElement>(null);
  const mainWorkspaceRef = useRef<HTMLElement>(null);
  const sidebarRef = useRef<HTMLElement>(null);
  const mobileDrawerRef = useRef<HTMLDivElement>(null);
  const themeBtnRef = useRef<HTMLButtonElement>(null);
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

  // Sync theme class on <html> and persist
  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
    saveTheme(theme);
  }, [theme, isDark]);

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

  // GSAP: Smooth sidebar collapse/expand width transition
  useEffect(() => {
    if (!sidebarRef.current) return;
    if (prefersReducedMotion()) {
      sidebarRef.current.style.width = isSidebarCollapsed ? '76px' : '240px';
      return;
    }
    gsap.to(sidebarRef.current, {
      width: isSidebarCollapsed ? 76 : 240,
      duration: 0.3,
      ease: 'power3.inOut',
    });
  }, [isSidebarCollapsed]);

  // GSAP: Mobile drawer entrance animation
  useEffect(() => {
    if (!isMobileMenuOpen || !mobileDrawerRef.current || prefersReducedMotion()) return;
    gsap.fromTo(
      mobileDrawerRef.current,
      { x: '-100%' },
      { x: '0%', duration: 0.28, ease: 'power3.out', clearProps: 'transform' }
    );
  }, [isMobileMenuOpen]);

  // GSAP: Section transition choreography
  useEffect(() => {
    if (!mainWorkspaceRef.current || prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      const blocks = mainWorkspaceRef.current?.querySelectorAll(':scope > section');
      if (blocks && blocks.length > 0) {
        animateStaggerIn(blocks, { y: 12, duration: 0.36, stagger: 0.06 });
      }
    }, mainWorkspaceRef);
    return () => ctx.revert();
  }, [activeSection]);

  // Derived maps & lists
  const songsById = useMemo(() => {
    const map = new Map<SongId, Song>();
    for (const song of songs) {
      map.set(song.id, song);
    }
    return map;
  }, [songs]);

  const genres = useMemo(() => extractGenres(songs), [songs]);

  const filteredSongs = useMemo(() => {
    const base = filterSongs(songs, searchQuery, selectedGenre);
    if (!showFavoritesOnly) return base;
    const likedSet = new Set<SongId>(likedSongIds);
    return base.filter((song) => likedSet.has(song.id));
  }, [songs, searchQuery, selectedGenre, showFavoritesOnly, likedSongIds]);

  // GSAP: Stagger song cards when library finishes loading or genre changes
  useEffect(() => {
    if (isLoadingSongs || libraryLayout !== 'grid' || prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      const cards = librarySectionRef.current?.querySelectorAll('.song-card-anim');
      if (cards && cards.length > 0) {
        animateStaggerIn(cards, { y: 12, duration: 0.34, stagger: 0.025 });
      }
    }, librarySectionRef);
    return () => ctx.revert();
  }, [isLoadingSongs, selectedGenre, libraryLayout, showFavoritesOnly]);

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
      setIsPlayerOpen(true);
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

  // Global keyboard shortcuts (Cmd/Ctrl+K search, Space play/pause, Escape close mobile menu)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
        return;
      }
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
  }, [currentSong, isMobileMenuOpen]);

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

  const handleSetSongOrder = (playlistId: string, orderedSongIds: SongId[]) => {
    setPlaylists((prev) => setPlaylistSongOrder(prev, playlistId, orderedSongIds));
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

  const handleToggleTheme = () => {
    if (themeBtnRef.current) animateMicroPop(themeBtnRef.current);
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const getPlaylistDuration = (playlist: Playlist) =>
    computeTotalDuration(resolvePlaylistSongs(playlist, songsById));

  const getPlaylistCover = (playlist: Playlist): string | undefined => {
    const firstId = playlist.songIds[0];
    return firstId !== undefined ? songsById.get(firstId)?.coverImage : undefined;
  };

  const scrollToLibrary = () => {
    setActiveSection('library');
    window.setTimeout(() => {
      librarySectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 60);
  };

  const scrollCategories = (delta: number) => {
    categoryScrollRef.current?.scrollBy({ left: delta, behavior: 'smooth' });
  };

  const openCreateModal = () =>
    setPlaylistFormState({ isOpen: true, mode: 'create', target: null });

  const openRenameModal = (playlist: Playlist) =>
    setPlaylistFormState({ isOpen: true, mode: 'rename', target: playlist });

  const isCurrentLiked = currentSong
    ? likedSongIds.some((id) => id === currentSong.id)
    : false;

  return (
    <div className="min-h-screen lg:h-screen w-full max-w-full overflow-x-hidden lg:overflow-hidden bg-[#f6f7f9] text-slate-900 dark:bg-[#0b0d11] dark:text-gray-200 flex relative transition-colors duration-200">
      {/* Desktop Sidebar (lg+) full height above PlayerBar */}
      <aside
        ref={sidebarRef}
        style={{ width: 240 }}
        className={`hidden lg:flex bg-white border-r border-slate-200/90 dark:bg-[#15171c] dark:border-white/[0.06] flex-col justify-between shrink-0 h-full z-20 overflow-hidden transition-colors duration-200 ${
          isPlayerOpen ? 'pb-20' : 'pb-2'
        }`}
      >
        <div className="p-4 flex flex-col gap-5 overflow-y-auto no-scrollbar">
          {/* Brand Header + Menu Toggle Button */}
          <div
            className={`flex items-center ${
              isSidebarCollapsed ? 'flex-col gap-3 justify-center' : 'justify-between gap-2'
            } px-1 pt-1`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center text-white shrink-0 shadow-sm">
                <AudioLines className="w-4 h-4" />
              </div>
              {!isSidebarCollapsed && (
                <span className="text-[17px] font-bold tracking-tight text-orange-600 dark:text-orange-400 truncate">
                  Rhythmo<span className="text-slate-900 dark:text-white">Tune</span>
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={() => setIsSidebarCollapsed((prev) => !prev)}
              aria-label={isSidebarCollapsed ? 'Expand sidebar menu' : 'Collapse sidebar menu'}
              aria-expanded={!isSidebarCollapsed}
              title={isSidebarCollapsed ? 'Expand menu' : 'Collapse menu'}
              className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 dark:bg-white/[0.05] dark:hover:bg-white/10 dark:text-gray-400 dark:hover:text-white flex items-center justify-center transition active:scale-90 shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
            >
              {isSidebarCollapsed ? (
                <PanelLeftOpen className="w-4 h-4" />
              ) : (
                <PanelLeftClose className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* Primary Nav */}
          <nav aria-label="Main navigation" className="flex flex-col gap-1">
            {NAV_ITEMS.map(({ id, label, Icon }) => {
              const active = activeSection === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setActiveSection(id)}
                  title={isSidebarCollapsed ? label : undefined}
                  aria-label={isSidebarCollapsed ? label : undefined}
                  className={`flex items-center ${
                    isSidebarCollapsed ? 'justify-center px-0 py-2.5' : 'gap-3 px-3.5 py-2.5'
                  } rounded-xl text-[13.5px] font-medium transition-colors text-left ${
                    active
                      ? 'bg-teal-500/10 text-teal-800 dark:bg-white/[0.09] dark:text-white font-semibold'
                      : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-white/[0.04]'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {!isSidebarCollapsed && <span className="truncate">{label}</span>}
                </button>
              );
            })}
          </nav>

          {/* Sidebar Playlists */}
          <div className="pt-3 border-t border-slate-200 dark:border-white/[0.07] space-y-2">
            {!isSidebarCollapsed ? (
              <div className="flex items-center justify-between px-1.5">
                <span className="text-xs font-semibold text-slate-500 dark:text-gray-300 flex items-center gap-2">
                  <ListMusic className="w-3.5 h-3.5 text-slate-400 dark:text-gray-400" />
                  <span>Playlists</span>
                </span>
                <button
                  type="button"
                  onClick={openCreateModal}
                  aria-label="Create new playlist"
                  title="Create new playlist"
                  className="w-6 h-6 rounded-md hover:bg-slate-200 text-slate-500 hover:text-slate-900 dark:hover:bg-white/10 dark:text-gray-400 dark:hover:text-white flex items-center justify-center transition active:scale-90"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={openCreateModal}
                aria-label="Create new playlist"
                title="Create new playlist"
                className="w-10 h-10 mx-auto rounded-lg bg-slate-100 hover:bg-[#198f85] text-slate-600 hover:text-white dark:bg-white/[0.06] dark:text-gray-300 flex items-center justify-center transition active:scale-90"
              >
                <Plus className="w-4 h-4" />
              </button>
            )}

            {playlists.length === 0 ? (
              !isSidebarCollapsed && (
                <p className="text-xs text-slate-500 dark:text-gray-500 px-1.5">
                  No playlists yet. Click + to create one.
                </p>
              )
            ) : (
              <div className="space-y-1">
                {playlists.map((pl) => (
                  <PlaylistCard
                    key={pl.id}
                    playlist={pl}
                    totalDurationSeconds={getPlaylistDuration(pl)}
                    coverImage={getPlaylistCover(pl)}
                    isActive={activePlaylist?.id === pl.id}
                    compact
                    collapsed={isSidebarCollapsed}
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

        <div className="p-3.5 border-t border-slate-200 dark:border-white/[0.06]">
          <Button
            variant="ghost"
            size={isSidebarCollapsed ? 'icon' : 'md'}
            className={`${
              isSidebarCollapsed ? 'mx-auto flex' : 'w-full justify-start'
            } text-slate-600 hover:text-slate-950 dark:text-gray-400 dark:hover:text-white`}
            title="Playlist Manager"
            aria-label="Playlist Manager"
            leftIcon={<ListMusic className="w-4 h-4" />}
            onClick={() => setIsManagerOpen(true)}
          >
            {!isSidebarCollapsed && 'Playlist Manager'}
          </Button>
        </div>
      </aside>

      {/* Mobile / Tablet Slide-over Navigation Drawer (< lg) */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-50 lg:hidden bg-slate-900/50 dark:bg-black/70 backdrop-blur-sm flex"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <div
            ref={mobileDrawerRef}
            role="dialog"
            aria-label="Navigation menu"
            className="w-72 max-w-[82vw] h-full bg-white border-r border-slate-200 dark:bg-[#15171c] dark:border-white/10 p-5 flex flex-col justify-between shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-6 overflow-y-auto no-scrollbar">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center text-white">
                    <AudioLines className="w-4 h-4" />
                  </div>
                  <span className="text-lg font-bold tracking-tight text-orange-600 dark:text-orange-400">
                    Rhythmo<span className="text-slate-900 dark:text-white">Tune</span>
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsMobileMenuOpen(false)}
                  aria-label="Close navigation menu"
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 dark:bg-white/5 dark:hover:bg-white/10 dark:text-gray-300 flex items-center justify-center"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <nav className="flex flex-col gap-1">
                {NAV_ITEMS.map(({ id, label, Icon }) => {
                  const active = activeSection === id;
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => {
                        setActiveSection(id);
                        setIsMobileMenuOpen(false);
                      }}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${
                        active
                          ? 'bg-teal-500/10 text-teal-800 dark:bg-white/[0.09] dark:text-white'
                          : 'text-slate-600 hover:text-slate-950 dark:text-gray-400 dark:hover:text-white'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{label}</span>
                    </button>
                  );
                })}
              </nav>

              <div className="pt-4 border-t border-slate-200 dark:border-white/[0.07] space-y-2.5">
                <div className="flex items-center justify-between px-1">
                  <span className="text-xs font-semibold text-slate-600 dark:text-gray-300">
                    Playlists ({playlists.length})
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      openCreateModal();
                    }}
                    className="text-xs font-semibold text-teal-600 dark:text-teal-400"
                  >
                    + New
                  </button>
                </div>
                <div className="space-y-1">
                  {playlists.map((pl) => (
                    <PlaylistCard
                      key={pl.id}
                      playlist={pl}
                      totalDurationSeconds={getPlaylistDuration(pl)}
                      coverImage={getPlaylistCover(pl)}
                      isActive={activePlaylist?.id === pl.id}
                      compact
                      onSelect={(id) => {
                        setActivePlaylistId(id);
                        setActiveSection('playlists');
                        setIsMobileMenuOpen(false);
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>

            <Button
              variant="secondary"
              size="md"
              className="w-full"
              leftIcon={<ListMusic className="w-4 h-4 text-teal-600 dark:text-teal-400" />}
              onClick={() => {
                setIsMobileMenuOpen(false);
                setIsManagerOpen(true);
              }}
            >
              Playlist Manager
            </Button>
          </div>
        </div>
      )}

      {/* Main Content Shell */}
      <div
        className={`flex-1 flex flex-col min-w-0 lg:h-full lg:overflow-y-auto no-scrollbar relative z-10 ${
          isPlayerOpen ? 'pb-40 md:pb-24' : 'pb-20 md:pb-6'
        }`}
      >
        {/* Sticky Top Header */}
        <header className="sticky top-0 z-30 bg-[#f6f7f9]/90 dark:bg-[#0b0d11]/90 backdrop-blur-xl px-4 sm:px-6 lg:px-8 py-2.5 border-b border-slate-200/70 dark:border-white/[0.04] transition-colors duration-200">
          <div className="flex items-center justify-between gap-3 max-w-7xl mx-auto">
            {/* Mobile / Tablet Menu Button + Brand Logo */}
            <div className="flex lg:hidden items-center gap-2.5 shrink-0">
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(true)}
                aria-label="Open navigation menu"
                className="w-9 h-9 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 dark:bg-[#15171c] dark:hover:bg-white/10 dark:border-white/10 dark:text-gray-200 flex items-center justify-center transition active:scale-90"
              >
                <Menu className="w-4 h-4" />
              </button>
              <span className="text-base font-bold tracking-tight text-orange-600 dark:text-orange-400">
                Rhythmo<span className="text-slate-900 dark:text-white">Tune</span>
              </span>
            </div>

            {/* Search Input Pill */}
            <div className="hidden sm:block flex-1 max-w-md min-w-0">
              <Input
                ref={searchInputRef}
                pill
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for a song..."
                aria-label="Search songs"
                rightElement={
                  searchQuery ? (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      aria-label="Clear search"
                      className="text-slate-400 hover:text-slate-700 dark:text-gray-400 dark:hover:text-white p-1"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <Search className="w-4 h-4 text-slate-400 dark:text-gray-400 mr-1" />
                  )
                }
              />
            </div>

            {/* Right Controls: New Playlist, Theme Toggle, Profile, Favorites, Settings */}
            <div className="flex items-center gap-2 shrink-0">
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Plus className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />}
                onClick={openCreateModal}
              >
                <span className="hidden sm:inline">New Playlist</span>
                <span className="sm:hidden">New</span>
              </Button>

              {/* Dark / Light Theme Toggle */}
              <button
                ref={themeBtnRef}
                type="button"
                onClick={handleToggleTheme}
                aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                aria-pressed={isDark}
                title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                className="w-9 h-9 rounded-full bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 dark:bg-[#15171c] dark:hover:bg-white/10 dark:border-white/[0.08] dark:text-amber-300 flex items-center justify-center transition active:scale-90 shadow-sm dark:shadow-none"
              >
                {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>

              {/* Molly Hunter Profile Pill */}
              <div className="hidden md:flex items-center gap-2.5 pl-1.5 pr-3 py-1 rounded-full bg-white border border-slate-200 dark:bg-[#15171c] dark:border-white/[0.08] shadow-sm dark:shadow-none">
                <img
                  src="/covers/molly-hunter.jpg"
                  alt="Molly Hunter"
                  className="w-7 h-7 rounded-full object-cover ring-1 ring-teal-500/60"
                />
                <div className="leading-none">
                  <p className="text-xs font-semibold text-slate-900 dark:text-white">
                    Molly Hunter
                  </p>
                  <span className="inline-block mt-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded bg-teal-500/15 text-teal-700 dark:bg-teal-600/25 dark:text-teal-300">
                    Premium
                  </span>
                </div>
              </div>

              {/* Favorites Filter Button */}
              <button
                type="button"
                onClick={() => {
                  setShowFavoritesOnly((prev) => !prev);
                  setActiveSection('library');
                }}
                aria-label={showFavoritesOnly ? 'Show all songs' : 'Filter liked songs'}
                aria-pressed={showFavoritesOnly}
                title={showFavoritesOnly ? 'Showing liked songs' : 'Liked songs'}
                className={`w-9 h-9 rounded-full border flex items-center justify-center transition active:scale-90 shadow-sm dark:shadow-none ${
                  showFavoritesOnly
                    ? 'bg-rose-500/15 border-rose-500/40 text-rose-500 dark:text-rose-400'
                    : 'bg-white hover:bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-900 dark:bg-[#15171c] dark:border-white/[0.08] dark:text-gray-300 dark:hover:text-white'
                }`}
              >
                <Heart className={`w-4 h-4 ${showFavoritesOnly ? 'fill-current' : ''}`} />
              </button>

              {/* Settings / Playlist Manager Button */}
              <button
                type="button"
                onClick={() => setIsManagerOpen(true)}
                aria-label="Open Playlist Manager"
                title="Playlist Manager"
                className="hidden sm:flex w-9 h-9 rounded-full bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-900 dark:bg-[#15171c] dark:hover:bg-white/10 dark:border-white/[0.08] dark:text-gray-300 dark:hover:text-white items-center justify-center transition active:scale-90 shadow-sm dark:shadow-none"
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Mobile Search Bar (< sm) */}
          <div className="mt-2.5 sm:hidden">
            <Input
              pill
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for a song..."
              aria-label="Search songs"
              rightElement={
                searchQuery ? (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    aria-label="Clear search"
                    className="text-slate-400 hover:text-slate-700 dark:text-gray-400 dark:hover:text-white p-1"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <Search className="w-4 h-4 text-slate-400 dark:text-gray-400 mr-1" />
                )
              }
            />
          </div>
        </header>

        {/* Main Scrollable Workspace */}
        <main
          ref={mainWorkspaceRef}
          className="flex-1 px-4 sm:px-6 lg:px-8 py-2 space-y-4 min-w-0 max-w-7xl w-full mx-auto"
        >
          {/* Featured Draggable 5-Card Overlapping Fan Carousel (Home view) */}
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
            <section className="lg:hidden space-y-2.5 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Your Playlists
                </h2>
                <button
                  type="button"
                  onClick={() => setActiveSection('playlists')}
                  className="text-xs font-semibold text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300"
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {playlists.slice(0, 4).map((pl) => (
                    <PlaylistCard
                      key={pl.id}
                      playlist={pl}
                      totalDurationSeconds={getPlaylistDuration(pl)}
                      coverImage={getPlaylistCover(pl)}
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

          {/* Song Library Section ("Select Categories" + "Popular songs") */}
          {(activeSection === 'home' || activeSection === 'library') && (
            <section ref={librarySectionRef} aria-label="Song Library" className="space-y-3.5 min-w-0">
              {/* Select Categories Row */}
              {!isLoadingSongs && !songsError && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white tracking-tight">
                      Select Categories
                    </h2>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => scrollCategories(-180)}
                        aria-label="Scroll categories left"
                        className="w-7 h-7 rounded-full hover:bg-slate-200 text-slate-500 hover:text-slate-900 dark:hover:bg-white/10 dark:text-gray-400 dark:hover:text-white flex items-center justify-center transition"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => scrollCategories(180)}
                        aria-label="Scroll categories right"
                        className="w-7 h-7 rounded-full hover:bg-slate-200 text-slate-500 hover:text-slate-900 dark:hover:bg-white/10 dark:text-gray-400 dark:hover:text-white flex items-center justify-center transition"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div
                    ref={categoryScrollRef}
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
                          className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-150 shrink-0 active:scale-95 ${
                            active
                              ? 'bg-[#198f85] text-white font-semibold shadow-sm'
                              : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 dark:bg-[#15171c] dark:hover:bg-white/10 dark:text-gray-300 dark:border-white/15'
                          }`}
                        >
                          {genre}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Popular Songs Header + View Toggle */}
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white tracking-tight">
                    {activeSection === 'library' ? 'Song Library' : 'Popular songs'}
                  </h2>
                  <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded-md bg-white text-slate-600 border border-slate-200 dark:bg-[#15171c] dark:text-gray-300 dark:border-white/10">
                    {filteredSongs.length}
                  </span>
                  {showFavoritesOnly && (
                    <button
                      type="button"
                      onClick={() => setShowFavoritesOnly(false)}
                      className="text-[11px] font-semibold text-rose-500 dark:text-rose-400 hover:underline"
                    >
                      Liked only · Clear
                    </button>
                  )}
                </div>

                <div className="inline-flex rounded-xl bg-white border border-slate-200 dark:bg-[#15171c] dark:border-white/10 p-1 shadow-sm dark:shadow-none">
                  <button
                    type="button"
                    onClick={() => setLibraryLayout('grid')}
                    aria-label="Grid view"
                    aria-pressed={libraryLayout === 'grid'}
                    className={`p-1.5 rounded-lg transition ${
                      libraryLayout === 'grid'
                        ? 'bg-[#198f85] text-white'
                        : 'text-slate-500 hover:text-slate-900 dark:text-gray-400 dark:hover:text-white'
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
                        ? 'bg-[#198f85] text-white'
                        : 'text-slate-500 hover:text-slate-900 dark:text-gray-400 dark:hover:text-white'
                    }`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Loading / Error / No Results / Songs */}
              {isLoadingSongs ? (
                <LibrarySkeleton />
              ) : songsError ? (
                <EmptyState
                  icon={<WifiOff className="w-6 h-6 text-rose-500 dark:text-rose-400" />}
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
                    setShowFavoritesOnly(false);
                  }}
                />
              ) : libraryLayout === 'grid' ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
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
                <AnimatedList
                  items={filteredSongs}
                  width="100%"
                  maxHeight={520}
                  theme={theme}
                  accentColor="#198f85"
                  animation="pop"
                  frame={false}
                  gap={8}
                  itemClassName="!p-0 !bg-transparent !shadow-none"
                  onItemSelect={(song) => playSong(song, { type: 'library' })}
                  renderItem={(song, idx) => (
                    <SongRow
                      song={song}
                      variant="row"
                      index={idx}
                      isCurrent={currentSongId === song.id}
                      isPlaying={currentSongId === song.id && isPlaying}
                      isInActivePlaylist={activePlaylistSongIdSet.has(song.id)}
                      onPlay={(s) => playSong(s, { type: 'library' })}
                      onAddToPlaylist={(s) => setSongToAdd(s)}
                    />
                  )}
                />
              )}
            </section>
          )}

          {/* Active Playlist Section */}
          {(activeSection === 'playlists' || activeSection === 'home') && (
            <section aria-label="Playlists Workspace" className="space-y-3 min-w-0 pt-1">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                    {activeSection === 'playlists' ? 'Your Playlists' : 'Manage Active Playlist'}
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-gray-400 mt-0.5">
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
                      coverImage={getPlaylistCover(pl)}
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
                isDark={isDark}
                onPlaySong={(song, plId) => playSong(song, { type: 'playlist', playlistId: plId })}
                onPlayAll={(plId) => {
                  const first = activePlaylistSongs[0];
                  if (first) {
                    setIsPlayerOpen(true);
                    setQueueSource({ type: 'playlist', playlistId: plId });
                    setCurrentSongId(first.id);
                    setElapsedSeconds(0);
                    setIsPlaying(true);
                  }
                }}
                onMoveSong={handleReorderSongs}
                onSetSongOrder={handleSetSongOrder}
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
      {isPlayerOpen && (
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
          isDark={isDark}
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
          onClose={() => {
            setIsPlaying(false);
            setIsPlayerOpen(false);
          }}
        />
      )}

      {/* Mobile Bottom Navigation (< md) */}
      <nav
        aria-label="Mobile navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 h-[62px] bg-white/95 border-t border-slate-200 dark:bg-[#15171c]/95 dark:border-white/[0.08] backdrop-blur-2xl z-30 px-4 flex items-center justify-around"
      >
        {NAV_ITEMS.map(({ id, label, Icon }) => {
          const active = activeSection === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => setActiveSection(id)}
              className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition active:scale-95 ${
                active
                  ? 'text-teal-600 dark:text-teal-400'
                  : 'text-slate-500 hover:text-slate-900 dark:text-gray-400 dark:hover:text-white'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-semibold">
                {id === 'library' ? 'Library' : label}
              </span>
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
        theme={theme}
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
