# Read Aloud Button in the Reader

Add a small speaker icon next to the Search/Menu icons in the reader's top bar. Tapping it starts text-to-speech for the current page using the existing audio engine, and surfaces the compact MiniPlayer at the bottom of the screen. From there the user can pause, scrub, set a sleep timer, or expand to the full audio player — exactly like in the rest of the app.

## What the user sees

- A new `Volume2` (speaker) icon button in the reader's top bar, between the Search icon and the Menu icon.
- On tap: the MiniPlayer slides in at the bottom of the reader and starts speaking the current section/page.
- While the MiniPlayer is visible the icon turns into a `Volume2` highlighted in the primary color (so it acts as an indicator that audio is active for this book).
- Tapping the speaker again while audio for this book is active toggles play/pause.
- The MiniPlayer's existing close (X) button stops audio and removes the player.
- Chrome auto-hide behavior is unchanged — the speaker icon hides/shows with the rest of the top bar.

## Implementation

### 1. `src/pages/Reader.tsx`
- Import `Volume2` from `lucide-react` and `useAudioPlayer` from `@/hooks/use-audio-player`.
- Import `MiniPlayer` from `@/components/MiniPlayer`.
- Inside the component, pull `setActiveBook`, `playChapter`, `togglePlayPause`, `tts`, `book: activeAudioBook` from `useAudioPlayer()`.
- Add a handler `handleReadAloud()`:
  - If `activeAudioBook?.id === book.id` and `tts.isPlaying || tts.isPaused`, call `togglePlayPause()`.
  - Otherwise call `setActiveBook(book, allSections)` then `playChapter(currentSectionIdx)`.
- In the top bar JSX (around line 599–604, between the Search and Menu buttons), add:
  ```tsx
  <button
    onClick={handleReadAloud}
    disabled={!book || allSections.length === 0}
    className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full transition-colors hover:bg-accent"
    aria-label="Read aloud"
  >
    <Volume2 className={`h-4 w-4 ${activeAudioBook?.id === book?.id ? 'text-primary' : ''}`} />
  </button>
  ```
- Render `<MiniPlayer />` once near the bottom of the Reader's returned JSX (just before the closing root `div`), so the player appears even when the user is on `/read/:id` (today it is only mounted under the `max-w-lg` layout in `App.tsx`).

### 2. No other files need changes
- `MiniPlayer.tsx` already hides itself on `/listen/:id` and renders fixed-positioned, so it works inside the Reader without layout conflicts.
- `useAudioPlayer` already accepts the `BookSection[]` shape that `allSections` produces (same `id/part?/chapter?/heading/content` interface), so no mapping is required.
- TTS, caching, sleep timer, and expand-to-full-player flows are reused as-is.

## Out of scope
- No changes to the audio generation pipeline.
- No new settings (voice picker, speed, etc.) added to the reader — those remain on the full audio player page reachable by tapping the MiniPlayer.
- No persistence of "auto-resume audio when reopening a book"; tapping the speaker is always an explicit action.
