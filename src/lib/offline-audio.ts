// Download an entire book's chapter audio to IndexedDB so it plays offline.
// Reuses the same cache keys that use-gemini-tts.ts reads from.

import { supabase } from "@/integrations/supabase/client";
import { getCachedAudio, setCachedAudio, clearAudioCacheForBook } from "@/lib/audio-cache";
import { stripForSpeech } from "@/hooks/use-read-along";

const DEFAULT_VOICE = "Zephyr";

export interface OfflineChapter {
  id: string;
  content: string;
}

export interface DownloadProgress {
  done: number;
  total: number;
  failed: number;
  currentTitle?: string;
}

const storedKeyFor = (bookId: string, idx: number, voice: string) =>
  `stored:${bookId}:${idx}:${voice}`;

const liveKeyFor = (bookId: string, idx: number, voice: string) =>
  `${bookId}:${idx}:${voice}`;

/**
 * Returns true if every chapter has audio cached locally (either pre-generated
 * or live-generated) for the given voice.
 */
export async function isBookFullyDownloaded(
  bookId: string,
  sectionCount: number,
  voice: string = DEFAULT_VOICE,
): Promise<boolean> {
  if (sectionCount <= 0) return false;
  for (let i = 0; i < sectionCount; i++) {
    const a = await getCachedAudio(storedKeyFor(bookId, i, voice));
    if (a) continue;
    const b = await getCachedAudio(liveKeyFor(bookId, i, voice));
    if (!b) return false;
  }
  return true;
}

export async function countDownloadedChapters(
  bookId: string,
  sectionCount: number,
  voice: string = DEFAULT_VOICE,
): Promise<number> {
  let count = 0;
  for (let i = 0; i < sectionCount; i++) {
    const a = await getCachedAudio(storedKeyFor(bookId, i, voice));
    if (a) { count++; continue; }
    const b = await getCachedAudio(liveKeyFor(bookId, i, voice));
    if (b) count++;
  }
  return count;
}

export async function removeBookDownload(bookId: string): Promise<number> {
  return clearAudioCacheForBook(bookId);
}

async function fetchPreGenerated(
  bookId: string,
  idx: number,
  voice: string,
  signal?: AbortSignal,
): Promise<Blob | null> {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const base = `${supabaseUrl}/storage/v1/object/public/book-audio/${bookId}/${voice}/chapter-${idx}`;
  for (const ext of ["mp3", "wav"]) {
    try {
      const resp = await fetch(`${base}.${ext}`, { signal });
      if (resp.ok) return await resp.blob();
    } catch {
      // try next
    }
  }
  return null;
}

async function fetchLive(
  text: string,
  voice: string,
  language: string,
  signal?: AbortSignal,
): Promise<Blob> {
  const { data: { session } } = await supabase.auth.getSession();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
    Authorization: `Bearer ${session?.access_token ?? import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
  };
  const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/tts`;
  const resp = await fetch(url, {
    method: "POST",
    headers,
    signal,
    body: JSON.stringify({ text, voice, language }),
  });
  if (!resp.ok) {
    throw new Error(`TTS request failed (${resp.status})`);
  }
  return await resp.blob();
}

interface DownloadOptions {
  voice?: string;
  language?: string;
  onProgress?: (p: DownloadProgress) => void;
  signal?: AbortSignal;
}

/**
 * Download every chapter for the book and persist to IndexedDB.
 * Skips chapters that are already cached. Falls back from pre-generated
 * storage WAV to live TTS generation when needed.
 */
export async function downloadBookAudio(
  bookId: string,
  sections: OfflineChapter[],
  options: DownloadOptions = {},
): Promise<DownloadProgress> {
  const voice = options.voice || DEFAULT_VOICE;
  const language = options.language || "en";
  const total = sections.length;
  let done = 0;
  let failed = 0;
  const emit = (currentTitle?: string) =>
    options.onProgress?.({ done, total, failed, currentTitle });

  emit();

  for (let i = 0; i < sections.length; i++) {
    if (options.signal?.aborted) break;
    const section = sections[i];
    emit(section.id);

    const sKey = storedKeyFor(bookId, i, voice);
    const lKey = liveKeyFor(bookId, i, voice);

    // Already cached?
    const cachedA = await getCachedAudio(sKey);
    const cachedB = cachedA ? null : await getCachedAudio(lKey);
    if (cachedA || cachedB) {
      done++;
      emit(section.id);
      continue;
    }

    // Try pre-generated storage first.
    const pre = await fetchPreGenerated(bookId, i, voice, options.signal);
    if (pre) {
      await setCachedAudio(sKey, pre);
      done++;
      emit(section.id);
      continue;
    }

    // Fall back to live TTS.
    const text = stripForSpeech(section.content);
    if (!text) {
      failed++;
      emit(section.id);
      continue;
    }
    try {
      const blob = await fetchLive(text, voice, language, options.signal);
      await setCachedAudio(lKey, blob);
      done++;
    } catch (e) {
      if ((e as Error)?.name === "AbortError") break;
      console.error(`[offline-audio] chapter ${i} failed`, e);
      failed++;
    }
    emit(section.id);
  }

  return { done, total, failed };
}
