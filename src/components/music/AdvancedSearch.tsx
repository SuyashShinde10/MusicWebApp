import { forwardRef, useEffect, useMemo, useRef, useState } from 'react';
import gsap from 'gsap';
import {
  Clock,
  Heart,
  ListMusic,
  Pause,
  Play,
  Plus,
  Search,
  SlidersHorizontal,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react';
import type { Playlist, Song, SongId } from '../../types/music';
import { formatDuration } from '../../utils/formatters';
import { prefersReducedMotion } from '../../utils/gsapAnimations';
import type { SearchScope, SearchSort } from '../../utils/playlistLogic';
import { AlbumArt } from './AlbumArt';

interface AdvancedSearchProps {
  query: string;
  onQueryChange: (next: string) => void;
  scope: SearchScope;
  onScopeChange: (scope: SearchScope) => void;
  sort: SearchSort;
  onSortChange: (sort: SearchSort) => void;
  likedOnly: boolean;
  onToggleLikedOnly: () => void;
  matchingSongs: Song[];
  totalSongsCount: number;
  playlists: Playlist[];
  genres: string[];
  recentSearches: string[];
  onRecordSearch: (term: string) => void;
  onClearRecentSearches: () => void;
  currentSongId: SongId | null;
  isPlaying: boolean;
  onPlaySong: (song: Song) => void;
  onAddToPlaylist: (song: Song) => void;
  onSelectPlaylist: (playlistId: string) => void;
  onSelectGenre: (genre: string) => void;
  onResetFilters: () => void;
  showShortcutHint?: boolean;
  className?: string;
}

const SCOPE_OPTIONS: { id: SearchScope; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'title', label: 'Title' },
  { id: 'artist', label: 'Artist' },
  { id: 'genre', label: 'Genre' },
];

const SORT_OPTIONS: { id: SearchSort; label: string }[] = [
  { id: 'relevance', label: 'Best Match' },
  { id: 'title-asc', label: 'A–Z' },
  { id: 'duration-asc', label: 'Shortest' },
  { id: 'duration-desc', label: 'Longest' },
];

function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function HighlightText({ text, query }: { text: string; query: string }) {
  const tokens = query
    .trim()
    .split(/\s+/)
    .filter((t) => t.length > 0);
  if (tokens.length === 0) return <>{text}</>;

  const pattern = new RegExp(`(${tokens.map(escapeRegExp).join('|')})`, 'gi');
  const parts = text.split(pattern);

  return (
    <>
      {parts.map((part, idx) =>
        idx % 2 === 1 ? (
          <mark
            key={idx}
            className="bg-orange-500/20 text-orange-800 dark:bg-orange-400/25 dark:text-orange-200 rounded px-0.5 font-semibold"
          >
            {part}
          </mark>
        ) : (
          <span key={idx}>{part}</span>
        )
      )}
    </>
  );
}

export const AdvancedSearch = forwardRef<HTMLInputElement, AdvancedSearchProps>(
  function AdvancedSearch(
    {
      query,
      onQueryChange,
      scope,
      onScopeChange,
      sort,
      onSortChange,
      likedOnly,
      onToggleLikedOnly,
      matchingSongs,
      totalSongsCount,
      playlists,
      genres,
      recentSearches,
      onRecordSearch,
      onClearRecentSearches,
      currentSongId,
      isPlaying,
      onPlaySong,
      onAddToPlaylist,
      onSelectPlaylist,
      onSelectGenre,
      onResetFilters,
      showShortcutHint = true,
      className = '',
    },
    forwardedRef
  ) {
    const [isOpen, setIsOpen] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const [highlightedIndex, setHighlightedIndex] = useState(-1);

    const rootRef = useRef<HTMLDivElement>(null);
    const localInputRef = useRef<HTMLInputElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const setInputRefs = (node: HTMLInputElement | null) => {
      localInputRef.current = node;
      if (typeof forwardedRef === 'function') {
        forwardedRef(node);
      } else if (forwardedRef) {
        forwardedRef.current = node;
      }
    };

    const trimmedQuery = query.trim();
    const hasActiveAdvancedFilters = scope !== 'all' || sort !== 'relevance' || likedOnly;

    const matchingPlaylists = useMemo(() => {
      if (!trimmedQuery) return [];
      const q = trimmedQuery.toLowerCase();
      return playlists.filter((p) => p.name.toLowerCase().includes(q)).slice(0, 3);
    }, [playlists, trimmedQuery]);

    const previewSongs = useMemo(() => matchingSongs.slice(0, 6), [matchingSongs]);

    useEffect(() => {
      if (!isOpen) return undefined;
      const handleOutside = (e: MouseEvent) => {
        if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
          setIsOpen(false);
        }
      };
      window.addEventListener('mousedown', handleOutside);
      return () => window.removeEventListener('mousedown', handleOutside);
    }, [isOpen]);

    useEffect(() => {
      if (!isOpen || !dropdownRef.current || prefersReducedMotion()) return;
      gsap.fromTo(
        dropdownRef.current,
        { y: -6, opacity: 0, scale: 0.985 },
        { y: 0, opacity: 1, scale: 1, duration: 0.18, ease: 'power3.out', clearProps: 'transform,opacity' }
      );
    }, [isOpen]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
        setHighlightedIndex(-1);
        localInputRef.current?.blur();
        return;
      }
      if (!isOpen && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
        setIsOpen(true);
        return;
      }
      if (previewSongs.length === 0) return;
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setHighlightedIndex((prev) => (prev + 1) % previewSongs.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setHighlightedIndex((prev) => (prev <= 0 ? previewSongs.length - 1 : prev - 1));
      } else if (e.key === 'Enter') {
        if (trimmedQuery) onRecordSearch(trimmedQuery);
        const picked =
          highlightedIndex >= 0 ? previewSongs[highlightedIndex] : previewSongs[0];
        if (picked) {
          onPlaySong(picked);
          setIsOpen(false);
        }
      }
    };

    const quickGenres = genres.filter((g) => g !== 'All').slice(0, 6);

    return (
      <div ref={rootRef} className={`relative w-full min-w-0 ${className}`}>
        {/* Main Search Pill */}
        <div
          className={`relative flex items-center rounded-full bg-white dark:bg-[#15171c] border transition-all duration-150 shadow-sm ${
            isOpen
              ? 'border-orange-500/80 ring-2 ring-orange-500/25 dark:border-orange-500/70 dark:ring-orange-500/30'
              : 'border-slate-200 hover:border-slate-300 dark:border-white/10 dark:hover:border-white/20'
          }`}
        >
          <span className="pl-3.5 pr-2 flex items-center pointer-events-none text-slate-400 dark:text-gray-400 shrink-0">
            <Search className="w-4 h-4" />
          </span>

          <input
            ref={setInputRefs}
            type="text"
            value={query}
            onFocus={() => setIsOpen(true)}
            onChange={(e) => {
              onQueryChange(e.target.value);
              setHighlightedIndex(-1);
              setIsOpen(true);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Search songs, artists, genres..."
            aria-label="Search songs"
            aria-expanded={isOpen}
            aria-autocomplete="list"
            className="w-full min-w-0 bg-transparent py-2 text-sm text-slate-900 placeholder-slate-400 dark:text-gray-100 dark:placeholder-gray-500 focus:outline-none"
          />

          <div className="flex items-center gap-1 pr-2 shrink-0">
            {trimmedQuery && (
              <span className="hidden sm:inline-flex px-1.5 py-0.5 rounded-md text-[10px] font-mono font-semibold bg-orange-500/15 text-orange-700 dark:bg-orange-500/15 dark:text-orange-300 tabular-nums">
                {matchingSongs.length}
              </span>
            )}

            {query ? (
              <button
                type="button"
                onClick={() => {
                  onQueryChange('');
                  setHighlightedIndex(-1);
                  localInputRef.current?.focus();
                }}
                aria-label="Clear search"
                title="Clear search"
                className="w-6 h-6 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-800 hover:bg-slate-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-white/10 transition active:scale-90"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            ) : (
              showShortcutHint && (
                <kbd className="hidden md:inline-flex items-center px-1.5 py-0.5 rounded border border-slate-200 bg-slate-50 text-[10px] font-mono font-medium text-slate-400 dark:border-white/10 dark:bg-white/[0.04] dark:text-gray-500">
                  Ctrl K
                </kbd>
              )
            )}

            <button
              type="button"
              onClick={() => {
                setIsOpen(true);
                setShowFilters((prev) => !prev);
              }}
              aria-label="Toggle search filters"
              aria-expanded={showFilters}
              title="Advanced search filters"
              className={`w-7 h-7 rounded-full flex items-center justify-center transition active:scale-90 ${
                showFilters || hasActiveAdvancedFilters
                  ? 'bg-[#f97316] text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-white/10'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Live Advanced Search Popover */}
        {isOpen && (
          <div
            ref={dropdownRef}
            role="region"
            aria-label="Search suggestions"
            className="absolute left-0 right-0 top-full mt-2 rounded-2xl bg-white border border-slate-200 dark:bg-[#161922] dark:border-white/15 shadow-[0_24px_60px_-14px_rgba(15,23,42,0.28)] dark:shadow-[0_28px_70px_-14px_rgba(0,0,0,0.9)] overflow-hidden z-50"
          >
            {/* Scope, Favorites & Sort Bar */}
            {(showFilters || trimmedQuery.length > 0 || hasActiveAdvancedFilters) && (
              <div className="px-3.5 py-2.5 border-b border-slate-200/80 dark:border-white/[0.07] bg-slate-50/70 dark:bg-white/[0.02] space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-1 flex-wrap">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-gray-500 mr-1">
                      In:
                    </span>
                    {SCOPE_OPTIONS.map((opt) => {
                      const active = scope === opt.id;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => onScopeChange(opt.id)}
                          className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold transition active:scale-95 ${
                            active
                              ? 'bg-[#f97316] text-white'
                              : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300 dark:bg-white/[0.05] dark:text-gray-300 dark:border-white/10 dark:hover:bg-white/10'
                          }`}
                        >
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    type="button"
                    onClick={onToggleLikedOnly}
                    aria-pressed={likedOnly}
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border transition active:scale-95 ${
                      likedOnly
                        ? 'bg-rose-500/15 border-rose-500/40 text-rose-600 dark:text-rose-400'
                        : 'bg-white border-slate-200 text-slate-600 hover:text-rose-500 dark:bg-white/[0.05] dark:border-white/10 dark:text-gray-300'
                    }`}
                  >
                    <Heart className={`w-3 h-3 ${likedOnly ? 'fill-current' : ''}`} />
                    <span>Liked</span>
                  </button>
                </div>

                {showFilters && (
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-0.5">
                    <div className="flex items-center gap-1 flex-wrap">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-gray-500 mr-1">
                        Sort:
                      </span>
                      {SORT_OPTIONS.map((opt) => {
                        const active = sort === opt.id;
                        return (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => onSortChange(opt.id)}
                            className={`px-2 py-0.5 rounded-md text-[11px] font-medium transition ${
                              active
                                ? 'bg-slate-900 text-white dark:bg-white/20 dark:text-white'
                                : 'text-slate-500 hover:text-slate-900 dark:text-gray-400 dark:hover:text-white'
                            }`}
                          >
                            {opt.label}
                          </button>
                        );
                      })}
                    </div>

                    {hasActiveAdvancedFilters && (
                      <button
                        type="button"
                        onClick={onResetFilters}
                        className="text-[11px] font-semibold text-orange-600 hover:text-orange-700 dark:text-orange-400"
                      >
                        Reset all
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            <div className="max-h-[360px] overflow-y-auto no-scrollbar p-2 space-y-2.5">
              {/* Zero-query state: Recent Searches + Quick Genre Chips */}
              {!trimmedQuery ? (
                <div className="space-y-3 p-1.5">
                  {recentSearches.length > 0 && (
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between px-1">
                        <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-gray-500">
                          <Clock className="w-3 h-3" />
                          Recent searches
                        </span>
                        <button
                          type="button"
                          onClick={onClearRecentSearches}
                          className="inline-flex items-center gap-1 text-[10.5px] font-medium text-slate-400 hover:text-rose-500 dark:text-gray-500 dark:hover:text-rose-400 transition"
                        >
                          <Trash2 className="w-3 h-3" />
                          Clear
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {recentSearches.map((term) => (
                          <button
                            key={term}
                            type="button"
                            onClick={() => onQueryChange(term)}
                            className="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-white/[0.06] dark:hover:bg-white/[0.12] dark:text-gray-200 transition active:scale-95"
                          >
                            {term}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {quickGenres.length > 0 && (
                    <div className="space-y-1.5">
                      <span className="inline-flex items-center gap-1.5 px-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-gray-500">
                        <Sparkles className="w-3 h-3 text-orange-500" />
                        Quick genres
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {quickGenres.map((genre) => (
                          <button
                            key={genre}
                            type="button"
                            onClick={() => {
                              onSelectGenre(genre);
                              setIsOpen(false);
                            }}
                            className="px-2.5 py-1 rounded-full text-xs font-medium bg-orange-500/10 hover:bg-[#f97316] text-orange-700 hover:text-white dark:bg-orange-500/15 dark:text-orange-300 dark:hover:bg-[#f97316] dark:hover:text-white transition active:scale-95"
                          >
                            {genre}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <p className="text-[11px] text-slate-400 dark:text-gray-500 px-1">
                    Tip: Try multi-word queries like <span className="font-medium text-slate-600 dark:text-gray-300">&ldquo;felix relax&rdquo;</span> or switch search scope above.
                  </p>
                </div>
              ) : (
                <>
                  {/* Matching Playlists */}
                  {matchingPlaylists.length > 0 && (
                    <div className="space-y-1">
                      <span className="px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-gray-500">
                        Playlists
                      </span>
                      {matchingPlaylists.map((pl) => (
                        <button
                          key={pl.id}
                          type="button"
                          onClick={() => {
                            onRecordSearch(trimmedQuery);
                            onSelectPlaylist(pl.id);
                            setIsOpen(false);
                          }}
                          className="w-full flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-white/[0.06] text-left transition"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className="w-8 h-8 rounded-lg bg-orange-500/15 text-orange-600 dark:text-orange-400 flex items-center justify-center shrink-0">
                              <ListMusic className="w-4 h-4" />
                            </span>
                            <div className="min-w-0">
                              <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                                <HighlightText text={pl.name} query={trimmedQuery} />
                              </p>
                              <p className="text-[11px] text-slate-500 dark:text-gray-400">
                                {pl.songIds.length} tracks
                              </p>
                            </div>
                          </div>
                          <span className="text-[10px] font-semibold text-orange-600 dark:text-orange-400 shrink-0">
                            Open
                          </span>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Matching Tracks */}
                  {previewSongs.length > 0 ? (
                    <div className="space-y-1">
                      <div className="flex items-center justify-between px-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-gray-500">
                          Tracks ({matchingSongs.length} of {totalSongsCount})
                        </span>
                      </div>
                      {previewSongs.map((song, idx) => {
                        const isCurrent = currentSongId === song.id;
                        const activeHighlight = idx === highlightedIndex;
                        return (
                          <div
                            key={song.id}
                            className={`group flex items-center justify-between gap-2.5 px-2.5 py-1.5 rounded-xl transition ${
                              activeHighlight || isCurrent
                                ? 'bg-orange-500/10 dark:bg-orange-500/15'
                                : 'hover:bg-slate-100 dark:hover:bg-white/[0.06]'
                            }`}
                          >
                            <button
                              type="button"
                              onClick={() => {
                                onRecordSearch(trimmedQuery);
                                onPlaySong(song);
                                setIsOpen(false);
                              }}
                              className="flex items-center gap-2.5 min-w-0 flex-1 text-left"
                            >
                              <div className="relative shrink-0">
                                <AlbumArt
                                  song={song}
                                  isPlaying={isCurrent && isPlaying}
                                  size="sm"
                                />
                                <span className="absolute inset-0 rounded-lg bg-black/45 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                  {isCurrent && isPlaying ? (
                                    <Pause className="w-3.5 h-3.5 text-white fill-current" />
                                  ) : (
                                    <Play className="w-3.5 h-3.5 text-white fill-current ml-0.5" />
                                  )}
                                </span>
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                                  <HighlightText text={song.title} query={trimmedQuery} />
                                </p>
                                <p className="text-[11px] text-slate-500 dark:text-gray-400 truncate">
                                  <HighlightText text={song.artist} query={trimmedQuery} /> ·{' '}
                                  <HighlightText text={song.genre} query={trimmedQuery} />
                                </p>
                              </div>
                            </button>

                            <div className="flex items-center gap-1.5 shrink-0">
                              <span className="text-[11px] font-mono tabular-nums text-slate-400 dark:text-gray-500">
                                {formatDuration(song.duration)}
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  onRecordSearch(trimmedQuery);
                                  onAddToPlaylist(song);
                                  setIsOpen(false);
                                }}
                                aria-label={`Add ${song.title} from search`}
                                title="Add to playlist"
                                className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-[#f97316] text-slate-600 hover:text-white dark:bg-white/[0.06] dark:text-gray-300 flex items-center justify-center transition active:scale-90"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    matchingPlaylists.length === 0 && (
                      <div className="py-6 text-center space-y-1.5">
                        <p className="text-xs font-semibold text-slate-700 dark:text-gray-200">
                          No tracks match &ldquo;{trimmedQuery}&rdquo;
                        </p>
                        <p className="text-[11px] text-slate-400 dark:text-gray-500">
                          Try clearing filters or switching scope back to All.
                        </p>
                      </div>
                    )
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }
);
