# Continuing audio generation after the Gemini daily limit

## Quick answer to your two ideas

**1. "Can we generate the MP3s with Lovable AI?"**
No. The Lovable AI gateway only exposes chat models (Gemini/GPT text) and image models (Nano Banana). It does **not** expose any TTS model. I confirmed by querying the gateway — `gemini-2.5-flash-preview-tts` is rejected with "invalid model". So we cannot route TTS through `LOVABLE_API_KEY`.

**2. "I have ChatGPT MCP."**
MCP connectors extend *me* (the Lovable building agent) during edits — they do **not** give your deployed app a way to call ChatGPT, and there isn't a "ChatGPT MCP" in the catalog that exposes TTS to me either. So this doesn't help generate the audio files.

## What actually works — three real options

### Option A (recommended): switch the edge function to OpenAI TTS

OpenAI's `tts-1` / `gpt-4o-mini-tts` API returns ready-to-use MP3 directly (no PCM-to-WAV wrapping, no CPU timeouts), supports English/French/Arabic well, and has its own quota independent from your Gemini key. Cost is roughly $0.015 per 1K characters for `tts-1` — generating audio for the remaining ~17 small books is on the order of a few dollars total.

**Changes:**
- Add a new secret `OPENAI_API_KEY` (you provide it from platform.openai.com).
- Modify `supabase/functions/generate-audio/index.ts`:
  - Add a `provider` field (`"openai"` default, `"gemini"` fallback).
  - When `provider="openai"`, call `https://api.openai.com/v1/audio/speech` with `model: "tts-1"`, `voice: "alloy"` (or `nova`/`shimmer`/`onyx`), `response_format: "mp3"`.
  - Output goes straight to MP3 bytes — no chunking, no WAV header, no PCM math. Much simpler code path.
  - Upload to `book-audio/{bookId}/chapter-{idx}.mp3`.
- Update `scripts/run-audio-generation.ts`:
  - Default to provider=openai.
  - OpenAI rate limit on tier 1 is ~50 req/min → reduce delay from 4500ms to ~1500ms (about 3× faster).
- Update `src/hooks/use-gemini-tts.ts` fast-path:
  - Try `chapter-{idx}.mp3` first, fall back to `chapter-{idx}.wav` (for chapters already generated). This way nothing breaks for already-stored WAV files.

After that, re-run the bulk script. With faster pacing it finishes in ~10–15 minutes for the remaining books.

### Option B: just wait ~24h for the Gemini free-tier daily quota to reset

Zero code changes. Tomorrow we re-run `scripts/run-audio-generation.ts` with `skipIfExists=true` and it picks up exactly where it stopped. Downside: another day with broken Play on un-generated chapters.

### Option C: upload your own MP3s

If you'd rather record/source audio yourself, I can add a small admin uploader (drag MP3 → bucket at `{bookId}/chapter-{idx}.mp3`). Useful for select chapters but tedious for 100+ files.

## My recommendation

Go with **Option A**. It's a ~30-minute change, removes the WAV-vs-MP3 awkwardness we adopted as a workaround, and OpenAI TTS quality in French/Arabic is on par with Gemini's. The only thing I need from you is the `OPENAI_API_KEY` (created at https://platform.openai.com/api-keys → any tier with billing enabled).

## Files that will change (Option A)

- `supabase/functions/generate-audio/index.ts` — add OpenAI provider branch, simplify (no WAV wrapping)
- `scripts/run-audio-generation.ts` — switch default provider, faster pacing
- `src/hooks/use-gemini-tts.ts` — try `.mp3` then `.wav` in storage fast-path
- New secret: `OPENAI_API_KEY`

Approve and I'll request the secret, then implement and re-run the bulk job.
