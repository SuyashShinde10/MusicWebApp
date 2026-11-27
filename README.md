# RhythmoTune — Music Playlist Manager

A responsive **Music Playlist Manager** web application built with **React 19**, **TypeScript**, **Tailwind CSS**, **Axios**, and **`localStorage`**. Users can browse and search a 12-track audio catalog, curate persistent custom playlists, reorder or shred tracks, customize their listener profile, and play real MP3 tracks cleanly across mobile, tablet, and desktop viewports.

---

## Key Features

- **Song Library (`public/songs.json` via Axios):**
  - Displays 12 curated tracks with title, artist, genre, cover artwork, and duration formatted as `m:ss`.
  - **Multi-Token Ranked Search (`AdvancedSearch`):** Supports scope tabs (`All`, `Title`, `Artist`, `Genre`), sorting (`Best Match`, `A–Z`, `Shortest`, `Longest`), Liked-only filtering, recent search history, matched keyword highlighting, and a `⌘K` / `Ctrl+K` shortcut.
  - Dynamic genre filter strip (`All`, `Montagem`, `Brazilian Funk`, `Jumpstyle`, `Slowed`, `Japanese Funk`, `Phonk`) plus Grid/List layout switching.
- **Playlists (CRUD + `localStorage` Persistence):**
  - Create, rename, and delete playlists (guarded by an explicit `DeleteConfirmModal`).
  - Validates required playlist names (up to 60 characters) and enforces case-insensitive uniqueness.
  - Persists playlists, active playlist selection, liked tracks, recent searches, theme preference, and listener profile in `localStorage`.
- **Track Curation & Reordering:**
  - Add songs to any playlist from the library while preventing duplicate entries (`Check` indicator on added tracks).
  - Remove songs or reorder tracks using **Move Up / Move Down buttons** or **drag-and-drop / drag-to-shred**.
  - Displays playlist count and total rounded duration summaries (e.g., `5 songs · 10 min`).
- **Audio Playback & Now Playing Controls (`PlayerBar` & `NowPlayingSheet`):**
  - Plays local pure-MP3 tracks (`public/audio/songs/*.mp3`) via HTML5 `<audio>` with Play/Pause, Next, Previous, Shuffle, Repeat, seek scrubbing (`ElasticSlider`), and liquid volume control (`SloshGauge`).
  - Expandable full-screen / theater `NowPlayingSheet` accessible across mobile, tablet, and desktop views with live queue switching.
- **Listener Account Hub & Profile (`ProfileMenu` & `ProfileSettingsModal`):**
  - Interactive header profile hub displaying live library metrics, audio stream quality switcher (`Standard`, `High`, `Lossless`), profile & membership tier customization, and one-click JSON backup export (`rhythmotune-backup.json`).
- **UI States & Responsiveness:**
  - Shimmer loading skeletons, empty playlist prompts, no-results recovery actions, and Axios error/retry handling.
  - Tested across `375px` (mobile), `768px` (tablet), and `1440px` (desktop) with zero horizontal scroll and coarse-pointer mobile scroll optimizations.

---

## Tech Stack

- **React 19 + TypeScript** (`strict`, `noImplicitAny`, `strictNullChecks`, `noUncheckedIndexedAccess`)
- **Tailwind CSS 3.4** + modular custom CSS for responsive dark/light themes
- **Axios** (fetches and validates `/songs.json`)
- **GSAP & Motion** (micro-interactions, `SplitText`, `JellyRadio`, `ElasticSlider`, `SloshGauge`, `Shredder`, `TiltedCard`, `AnimatedList`)
- **Lucide React & Hugeicons** (vector UI icons)
- **Vite 7 + Vitest + React Testing Library** (production chunk splitting and automated tests)

---

## How to Run

```bash
# 1. Install dependencies
npm install

# 2. Start the development server
npm run dev

# 3. Run type-check, linter, unit/integration tests, and production build
npm run typecheck
npm run lint
npm test
npm run build
```

---

## Architecture Overview

- `public/songs.json` — Local JSON catalog of 12 tracks (`id`, `title`, `artist`, `genre`, `duration` in seconds, `coverImage`, `audioUrl`, `frameColor`).
- `src/services/songService.ts` — Axios fetcher with 10s timeout and runtime `isValidSong()` payload validation.
- `src/services/playlistStorage.ts` — Versioned `localStorage` persistence with runtime schema guards and first-visit starter seeding.
- `src/utils/playlistLogic.ts` — Pure domain functions for playlist validation, CRUD, duplicate checks, index reordering, and multi-token search ranking.
- `src/components/ui/` — Reusable `Button`, `Input`, `Modal`, and `Toast` primitives.
- `src/components/music/` — `SongRow`, `PlaylistCard`, `PlayerBar`, `NowPlayingSheet`, `AdvancedSearch`, `FeaturedShowcase`, `ActivePlaylistPanel`, `ProfileMenu`, `EmptyState`, and `Skeletons`.
- `src/components/modals/` — `PlaylistFormModal`, `DeleteConfirmModal`, `AddToPlaylistModal`, `PlaylistManagerModal`, and `ProfileSettingsModal`.

---

## Assumptions Made

1. **Starter Playlists on First Visit:** When `localStorage` has not been initialized yet, 3 starter playlists (`Vibes & Chill`, `Morning Boost`, `Rhythm & Energy`) are seeded so playlist features are immediately testable. Deleting all playlists stores `[]` and does not re-seed on refresh.
2. **Duration Summary Rounding:** Playlist summary labels (`"X songs · Y min"`) convert total seconds to rounded minutes (with a minimum of `1 min` for any non-empty playlist under 60 seconds).
3. **Unique Playlist Names:** Uniqueness checks are trimmed and case-insensitive (e.g., `"chill"` and `"Chill"` conflict).
4. **Browser Storage Scope:** Playlists, favorites, and listener profile settings live client-side in `localStorage` without a backend server; the JSON export option allows users to download portable backups.

---

## What I Would Improve

- **Backend API & Cloud Sync:** Replace `localStorage` and `/songs.json` with a REST/PostgreSQL backend and authenticated multi-device sync while preserving existing `songService` and storage module interfaces.
- **Undo/Redo History & Playlist Import:** Pair playlist JSON export with JSON/M3U file import validation and toast-driven undo on accidental song removal.
- **Web Audio Spectrum & Keyboard Drag-and-Drop:** Add real-time frequency visualization in `NowPlayingSheet` via Web Audio API and full keyboard-first drag reordering (`@dnd-kit`).
- **Offline PWA Support:** Cache artwork and audio assets using a Workbox Service Worker for offline playback.
