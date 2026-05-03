## Problem

On mobile (`/read/:id`), audio is currently inaccessible:
- The `Volume2` (Read aloud) button only exists in the top bar, which is hidden in the default distraction-free reader state.
- The global `MiniPlayer` is rendered outside the Reader route in `App.tsx`, so it never appears while reading.

## Fix

### 1. Floating speaker button in the reader (mobile)
In `src/pages/Reader.tsx`, add a small floating button anchored bottom-left (mirroring the existing bottom-right floating menu trigger), visible even when chrome is hidden, on mobile only (`md:hidden`).

- Icon: `Volume2` (matches top-bar icon for consistency)
- Action: reuses the existing `handleReadAloud` handler — starts/toggles Read Aloud for the current book
- Active state: when `activeAudioBook?.id === book?.id`, tint the icon `text-primary` (same convention already used in the top bar)
- Style: same glass treatment as the bottom-right menu trigger (`bg-background/90 border border-border/60 backdrop-blur-sm shadow-sm`, ~h-10 w-10 rounded-full)
- Hidden when `isFullscreen` is true if the existing menu trigger is also hidden in fullscreen (match its visibility rules)

### 2. MiniPlayer visible inside the reader (mobile)
In `src/App.tsx`, allow `MiniPlayer` to render on the `/read/:id` route on mobile. Currently it's gated by route; relax that gate so when audio is active and the user is on the reader, the mini player appears.

In `src/components/MiniPlayer.tsx`:
- On the reader route on mobile, position it above the `ReaderBottomBar` so it doesn't overlap the page-number pill. Use `bottom-[64px]` on `/read/*` mobile, falling back to existing `bottom-[60px]` elsewhere and `lg:bottom-4` on desktop (already in place).
- Keep it auto-hiding when no audio session is active (existing behavior).
- Keep the keyboard shortcuts gated as today (disabled on `/listen/:id`); they remain active on `/read/:id` which is desired.

### 3. No changes to behavior when audio is inactive
The floating speaker is always tappable to start Read Aloud. The MiniPlayer only appears once a session is active, so the reader stays distraction-free until the user opts in.

## Files to edit

- `src/pages/Reader.tsx` — add floating `Volume2` button (mobile, persistent)
- `src/App.tsx` — let `MiniPlayer` render on `/read/:id`
- `src/components/MiniPlayer.tsx` — adjust bottom offset on `/read/:id` to clear the bottom bar

## Out of scope

- No changes to the top-bar audio button (kept as-is for when chrome is expanded).
- No changes to desktop layout (already working per previous round).
- No changes to TTS engine, voices, or Edge Function.
