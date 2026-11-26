# RhythmoTune — Music Playlist Manager

A responsive **Music Playlist Manager** web application built with **React**, **TypeScript**, **Tailwind CSS**, **Axios**, and **`localStorage`**, inspired by the **RhythmoTune** dark coral-orange studio UI.

---

## Features

- **Song Library (`public/songs.json` via Axios):**
  - Displays 14 curated tracks with title, artist, genre, and duration formatted as `m:ss`.
  - Real-time search across song title, artist, and genre (`⌘K` / `Ctrl+K` keyboard shortcut).
  - Genre filter chips (`All`, `Relax`, `Energetic`, `Sad`, `Party`, `Romance`, `Jazz`, `Lo-Fi`, `Acoustic`) and Grid/List view toggle.
- **Playlists (CRUD + `localStorage` Persistence):**
  - Create, rename, and delete playlists (with explicit confirmation modal).
  - Enforces required and case-insensitive unique playlist names.
  - Persists playlists, active playlist selection, and liked songs in `localStorage` across page refreshes.
- **Track Curation & Reordering:**
  - Add songs from the library into any playlist while preventing duplicates (`Added` indicator + disabled state).
  - Remove songs from playlists and reorder tracks via **Move Up / Move Down buttons** or **drag-and-drop**.
  - Displays playlist summary details (e.g., `5 songs · 18 min`).
- **Now Playing Bar (`PlayerBar`):**
  - Play/Pause, Next, Previous, Shuffle, Repeat, interactive seek scrubber, volume control, and simulated playback progress timer (no real audio required).
- **UI States & Responsiveness:**
  - Dedicated Loading skeleton, Empty Playlist, No Results, and Network Error/Retry states.
  - Fully responsive across mobile (`375px`), tablet (`768px`), and desktop (`1440px`) with zero horizontal scroll.

---

## Tech Stack

- **React 19 + TypeScript** (strict compiler config)
- **Tailwind CSS** (custom dark surface & coral-orange brand tokens)
- **Axios** (fetches `/songs.json`)
- **Lucide React** (vector icons)
- **Vitest + React Testing Library** (unit & integration tests)

---

## How to Run Locally

```bash
# 1. Install dependencies
npm install

# 2. Start the development server
npm run dev

# 3. Run type-check, linter, tests, and production build
npm run typecheck
npm run lint
npm test
npm run build
```

---

## Architecture Overview

- `public/songs.json` — Local JSON catalog of 14 tracks (`id`, `title`, `artist`, `genre`, `duration` in seconds).
- `src/services/songService.ts` — Axios data fetcher with runtime payload validation.
- `src/services/playlistStorage.ts` — `localStorage` persistence with safe JSON parsing and first-visit starter playlist seeding.
- `src/utils/playlistLogic.ts` — Pure domain functions for playlist validation, CRUD, duplicate prevention, reordering, and library filtering.
- `src/components/ui/` — Reusable `Button`, `Input`, `Modal`, and `Toast` primitives.
- `src/components/music/` — Reusable `SongRow`, `PlaylistCard`, `PlayerBar`, `FeaturedShowcase`, `ActivePlaylistPanel`, `EmptyState`, and `Skeletons`.
- `src/components/modals/` — `PlaylistFormModal`, `DeleteConfirmModal`, `AddToPlaylistModal`, and `PlaylistManagerModal`.

---

## Assumptions Made

1. **Starter Playlists on First Visit:** If `localStorage` has never been initialized, 3 starter playlists (`Vibes & Chill`, `Morning Boost`, `Rhythm & Energy`) are seeded so the UI immediately demonstrates playlist management. If the user deletes all playlists, `localStorage` stores `[]` and does not re-seed on refresh.
2. **Duration Summary Rounding:** Total playlist duration in `"X songs · Y min"` rounds total seconds to the nearest minute (with a minimum of `1 min` for non-empty playlists under 60 seconds).
3. **Unique Playlist Names:** Playlist name uniqueness is evaluated case-insensitively after trimming whitespace (e.g. `"chill"` and `"Chill"` are treated as duplicates).
4. **Simulated Playback:** Since no real audio files are required, playback uses a 1-second timer to advance the progress bar and auto-advance to the next song in the active queue (either the active playlist or the library).

---

## What I Would Improve Next

- **Real Audio Preview & Web Audio Visualizer:** Connect preview audio URLs and an HTML5 `<audio>` / Web Audio API frequency spectrum visualizer.
- **Undo/Redo & Keyboard Drag Reordering:** Add toast-based "Undo delete" and full keyboard drag-and-drop reordering (`@dnd-kit`).
- **Backend Sync & Auth:** Back playlists with a REST/GraphQL API and user accounts instead of browser-only `localStorage`.
- **Import / Export Playlists:** Support exporting/importing playlists as JSON or M3U files.
