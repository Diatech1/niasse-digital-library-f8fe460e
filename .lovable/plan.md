
# Read Along Feature

## What It Does
"Read Along" uses the browser's built-in **Web Speech API (text-to-speech)** to read the current section aloud while **highlighting each sentence** in real-time as it is spoken. No external audio files or services are required — it works entirely in the browser.

The feature will:
- Add a **microphone/speaker button** in the bottom bar (or top bar)
- Read the visible section's text aloud
- Highlight the **currently spoken sentence** with a soft background color
- Allow **pause/resume/stop** controls
- Respect the currently selected **reading speed** (adjustable)
- Disappear cleanly when the user navigates to another section

---

## User Flow

```text
Tap "Read Along" button  →  Browser starts speaking current section
                         →  Each sentence highlights as it is read
Tap Pause               →  Speech pauses, highlight stays
Tap Resume              →  Speech resumes from paused sentence
Navigate to next section →  Speech stops, resets
Tap Stop                →  Speech stops, highlights clear
```

---

## Technical Approach

### 1. New hook: `src/hooks/use-read-along.ts`
Encapsulates all Web Speech API logic:
- `utterance` — a `SpeechSynthesisUtterance` wrapping the text
- `activeSentenceIndex` — tracks which sentence is currently being spoken
- Uses `utterance.onboundary` events to detect word/sentence boundaries and update the active index
- Exposes: `start()`, `pause()`, `resume()`, `stop()`, `isPlaying`, `isPaused`, `activeSentenceIndex`, `rate`, `setRate`

### 2. Text splitting utility
A `splitIntoSentences(text: string): string[]` function will split content into sentences using punctuation boundaries (`. `, `? `, `! `). This array is used both for TTS input and for rendering highlighted spans.

### 3. Updates to `FormattedContent.tsx`
- Accept two new optional props: `activeSentenceIndex?: number` and `sentences?: string[]`
- When read-along is active, instead of rendering raw paragraph text, render each sentence as a `<span>` — with a yellow/amber highlight on the active one
- The highlighted span auto-scrolls into view using `scrollIntoView({ behavior: 'smooth', block: 'center' })`

### 4. Updates to `Reader.tsx`
- Import and use `useReadAlong` hook
- Pass `activeSentenceIndex` and `sentences` to `FormattedContent`
- Add a **Read Along control bar** that appears above the bottom bar when active:
  - Play/Pause button
  - Stop button  
  - Speed selector (0.75×, 1×, 1.25×, 1.5×, 2×)
- Add a **headphone/speaker icon button** in the top controls row to activate read-along
- When the section changes (`currentSectionIdx` changes), auto-stop the current read-along

---

## Files to Create / Modify

| File | Action |
|---|---|
| `src/hooks/use-read-along.ts` | **Create** — Web Speech API hook |
| `src/components/reader/FormattedContent.tsx` | **Modify** — accept active sentence props, render highlighted spans |
| `src/pages/Reader.tsx` | **Modify** — wire hook, add controls button + floating control bar |

---

## Implementation Notes

- **Browser compatibility**: Web Speech API is supported on all modern browsers (Chrome, Safari, Firefox, Edge). On unsupported browsers, the button will be hidden.
- **Content stripping**: Before feeding to TTS, strip `{{PAGE:N}}` markers and other formatting tokens.
- **Sentence boundary detection**: Uses `onboundary` event with `charIndex` to track position precisely within the full text string, then maps back to sentence index.
- **Stop on section change**: A `useEffect` watching `currentSectionIdx` calls `stop()` to reset state cleanly.
- **Chrome quirk**: Chrome cancels long utterances after ~15 seconds of silence. The hook will chunk text by paragraph to avoid this.
- **The tap-to-hide chrome feature**: Read-along controls will remain visible even when `chromeVisible` is false, or will be tied to `chromeVisible` — user taps once to bring chrome back before stopping.
