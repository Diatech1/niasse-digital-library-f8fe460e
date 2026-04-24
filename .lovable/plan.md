# Migrate audio reader from Web Speech API to Gemini TTS

## Why

The app is wrapped with WebToNative into an Android app. Android's WebView does **not** expose `window.speechSynthesis`, so the current TTS engine fails with "Text-to-speech is not supported." Gemini 2.5 Flash TTS (free tier) replaces it with real MP3/WAV audio that plays in any WebView via the standard `<audio>` element, and supports English, French, and Arabic.

## What changes for the user

- Audio works in the WebToNative Android app (and on iOS Safari, where Web Speech is also unreliable)
- Higher-quality, more natural narration in all three languages
- A short "preparing audio…" spinner the first time a chapter is played; instant on replays (cached locally)
- A small voice picker (e.g. Kore, Zephyr, Algenib, Charon) in the full player
- Real audio duration and a working seek bar (current implementation only ticks elapsed seconds)

## Architecture

```text
AudioPlayer page / MiniPlayer
        │
        ▼
useGeminiTts (HTMLAudioElement)
        │  miss
        ▼
audio-cache.ts (IndexedDB by {bookId,chapterIdx,voice})
        │  miss
        ▼
supabase/functions/tts  ──►  Gemini 2.5 Flash TTS  ──►  PCM
        │
        └──►  wrap PCM in WAV header  ──►  return audio/wav blob
```

## Backend

**New secret**: `GEMINI_API_KEY` (Google AI Studio key, free tier).

**New edge function** `supabase/functions/tts/index.ts`:
- POST `{ text, voice, language }` (auth required via `getClaims`)
- Calls `gemini-2.5-flash-preview-tts` with the selected prebuilt voice
- Gemini returns base64-encoded raw PCM (24 kHz, 16-bit, mono)
- Function decodes the base64, prepends a 44-byte WAV header, returns `audio/wav`
- Handles 429 (rate limit) and 402-equivalent errors with clear JSON messages
- Chunks long text (~4000 char limit per request) — splits on sentence boundaries, generates one WAV per chunk, concatenates server-side before returning

`supabase/config.toml` — no changes needed (default `verify_jwt = false`, function validates JWT in code).

## Frontend

**New** `src/lib/audio-cache.ts` — thin IndexedDB wrapper:
- `get(key) → Blob | null`
- `set(key, blob)`
- `clear()` (exposed in Settings later)
- Key format: `${bookId}:${chapterIdx}:${voice}`

**New** `src/hooks/use-gemini-tts.ts` — replaces `use-read-along.ts` for the player:
- Same public surface as `ReadAlongControls` so `use-audio-player.tsx` barely changes: `isSupported`, `isPlaying`, `isPaused`, `start`, `pause`, `resume`, `stop`, `rate`, `setRate`, `voices`, `selectedVoiceURI`, `setSelectedVoiceURI`, plus new `duration`, `currentTime`, `seek(seconds)`, `isLoading`
- Internally uses a single `HTMLAudioElement` (works in all WebViews, supports native `playbackRate` and `currentTime`)
- `start(text, lang, cacheKey)`:
  1. Check IndexedDB → if hit, set `audio.src = URL.createObjectURL(blob)` and play
  2. If miss, show loading state, call `/functions/v1/tts`, store blob in IndexedDB, then play
- `voices` is a curated static list of Gemini prebuilt voices (Kore, Zephyr, Puck, Charon, Algenib, …) — no `voiceschanged` event needed
- Voice preference still persisted in `localStorage` per locale (same key scheme)

**Updated** `src/hooks/use-audio-player.tsx`:
- Swap `useReadAlong` → `useGeminiTts`
- Pass `cacheKey = ${book.id}:${chapterIdx}:${voice}` into `start()`
- Replace synthetic `elapsed` ticker with real `tts.currentTime` / `tts.duration`
- Sleep timer logic unchanged

**Updated** `src/pages/AudioPlayer.tsx`:
- Remove the "TTS not supported" banner (no longer applicable)
- Wire seek bar to `tts.seek()` using real duration
- Show loading spinner on the play button when `tts.isLoading`
- Voice picker pulls from the curated Gemini voice list

**Updated** `src/components/MiniPlayer.tsx`:
- Show small spinner instead of play icon when `tts.isLoading`
- Everything else unchanged

**Kept** `src/hooks/use-read-along.ts`:
- Still used by the in-reader sentence-highlight feature (different UX from the player). Not touched in this change to keep the diff focused. Can migrate later if you want.

## What I will NOT do

- Not removing the existing `useReadAlong` hook (reader uses it)
- Not changing the i18n dictionaries beyond adding 1–2 strings (`audioPlayer.preparing`, `audioPlayer.voiceQuality`)
- Not adding a usage meter or quota UI yet — Gemini free tier is generous, we'll add it only if you hit limits

## Cost & limits (free tier)

- Gemini 2.5 Flash TTS free tier: 15 req/min, 1500 req/day, 1M tokens/day
- With IndexedDB caching, each chapter is generated **once per voice per device** then replayed offline forever
- For a typical book with ~20 chapters × 4 voices = 80 generations max per user — well within daily quota

## Order of execution

1. Ask you for the **new** (rotated) `GEMINI_API_KEY` and store as a Supabase secret
2. Create the `tts` edge function (with WAV wrapper + chunking)
3. Build `audio-cache.ts` and `use-gemini-tts.ts`
4. Wire into `use-audio-player.tsx`, `AudioPlayer.tsx`, `MiniPlayer.tsx`
5. Add small loading/preparing UI states + i18n strings
6. Test in browser preview, then you rebuild the WebToNative APK to verify on Android

Approve when ready and rotate the key first.
