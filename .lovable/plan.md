## Goal

Pre-generate and cache MP3 narration for the "Predictions of Cheikh Usman Dan Fodio" book so audio plays instantly when readers tap the listen button. Cover all 4 sections: French biography, French predictions, English biography, English predictions.

## Approach

Use the existing `generate-audio` edge function (Gemini TTS → MP3 → `book-audio` storage bucket). It already supports the legacy single-shot mode, which handles plan + chunking + finalize in one call.

Write a one-off Node script in `/tmp` (not committed) that:

1. Reads section texts from `src/data/predictions-dan-fodio.ts` (the exported `predictionsDanFodioSections` array — same source the reader uses).
2. For each section (index 0..3), invokes the edge function once with:
   - `bookId: "predictions-dan-fodio"`
   - `sectionIndex: i`
   - `voice: "Zephyr"` (the app's default voice — matches what users will hit first)
   - `language: "french"` for sections 0–1, `"english"` for sections 2–3
   - `text: <flattened section text>`
   - `skipIfExists: true`
3. Hits the function URL directly with the project anon key (no edits to app code).

Output lands at `book-audio/predictions-dan-fodio/Zephyr/chapter-{0..3}.mp3`, which is exactly where `use-gemini-tts.ts` already looks.

## Notes

- No app/source code changes. Only a throwaway script run via `code--exec`.
- If a chapter already exists, it's skipped — safe to re-run.
- Only the default voice (Zephyr) is pre-generated. If a user picks a different voice later, the reader will generate that voice on demand (existing behavior).
- Generation can take 1–3 minutes per chapter depending on length; will be run sequentially with a longer timeout.
