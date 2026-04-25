import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getCachedAudio, setCachedAudio } from "@/lib/audio-cache";

const RATE_LIMIT_COOLDOWN_MS = 60_000;

// Curated Gemini prebuilt voices (subset). Each works across EN/FR/AR.
export interface GeminiVoice {
  voiceURI: string; // we reuse this name for compatibility with the existing UI
  name: string;
  lang: string; // "multi" — Gemini voices are multilingual
  localService: boolean;
  description?: string;
}

const GEMINI_VOICES: GeminiVoice[] = [
  { voiceURI: "Kore", name: "Kore", lang: "multi", localService: false, description: "Firm" },
  { voiceURI: "Zephyr", name: "Zephyr", lang: "multi", localService: false, description: "Bright" },
  { voiceURI: "Puck", name: "Puck", lang: "multi", localService: false, description: "Upbeat" },
  { voiceURI: "Charon", name: "Charon", lang: "multi", localService: false, description: "Informative" },
  { voiceURI: "Algenib", name: "Algenib", lang: "multi", localService: false, description: "Gravelly" },
  { voiceURI: "Aoede", name: "Aoede", lang: "multi", localService: false, description: "Breezy" },
  { voiceURI: "Schedar", name: "Schedar", lang: "multi", localService: false, description: "Even" },
  { voiceURI: "Orus", name: "Orus", lang: "multi", localService: false, description: "Firm" },
];

const LOCALE_MAP: Record<string, string> = {
  en: "en-US", english: "en-US",
  fr: "fr-FR", french: "fr-FR", français: "fr-FR", francais: "fr-FR",
  ar: "ar-SA", arabic: "ar-SA", arabe: "ar-SA",
};

export function resolveLocale(lang?: string): string {
  if (!lang) return "en-US";
  return LOCALE_MAP[lang.toLowerCase().trim()] ?? lang;
}

const voicePrefKey = (locale: string) => `gemini-tts-voice-${locale}`;

export interface GeminiTtsControls {
  isSupported: boolean;
  isPlaying: boolean;
  isPaused: boolean;
  isLoading: boolean;
  error: string | null;
  duration: number; // seconds
  currentTime: number; // seconds
  rate: number;
  setRate: (r: number) => void;
  voices: GeminiVoice[];
  selectedVoiceURI: string | null;
  setSelectedVoiceURI: (uri: string | null) => void;
  resolveLang: (lang?: string) => string;
  start: (text: string, lang?: string, cacheKey?: string) => Promise<void>;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  seek: (seconds: number) => void;
}

interface UseGeminiTtsOptions {
  onEnd?: () => void;
}

const DEFAULT_VOICE = "Kore";

export function useGeminiTts(options?: UseGeminiTtsOptions): GeminiTtsControls {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [rate, setRateState] = useState(1);
  const [selectedVoiceURI, setSelectedVoiceURIState] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const objectUrlRef = useRef<string | null>(null);
  const requestIdRef = useRef(0);
  const lastLangRef = useRef<string>("en-US");
  const cooldownUntilRef = useRef(0);
  const onEndRef = useRef(options?.onEnd);
  useEffect(() => { onEndRef.current = options?.onEnd; }, [options?.onEnd]);

  // Lazily create the single audio element
  const ensureAudio = useCallback((): HTMLAudioElement => {
    if (audioRef.current) return audioRef.current;
    const el = new Audio();
    el.preload = "auto";
    el.addEventListener("play", () => { setIsPlaying(true); setIsPaused(false); });
    el.addEventListener("pause", () => {
      // Distinguish a real pause from end (which also fires pause)
      if (!el.ended) { setIsPaused(true); setIsPlaying(false); }
    });
    el.addEventListener("ended", () => {
      setIsPlaying(false);
      setIsPaused(false);
      onEndRef.current?.();
    });
    el.addEventListener("timeupdate", () => setCurrentTime(el.currentTime));
    el.addEventListener("loadedmetadata", () => {
      if (isFinite(el.duration)) setDuration(el.duration);
    });
    el.addEventListener("durationchange", () => {
      if (isFinite(el.duration)) setDuration(el.duration);
    });
    el.addEventListener("error", () => {
      setError("Playback error");
      setIsPlaying(false);
      setIsPaused(false);
    });
    audioRef.current = el;
    return el;
  }, []);

  // Restore preferred voice for the current locale
  useEffect(() => {
    try {
      const locale = lastLangRef.current;
      const stored = localStorage.getItem(voicePrefKey(locale));
      if (stored) setSelectedVoiceURIState(stored);
    } catch {
      // ignore
    }
  }, []);

  const releaseObjectUrl = useCallback(() => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
  }, []);

  const stop = useCallback(() => {
    requestIdRef.current += 1; // cancel any in-flight fetch
    const el = audioRef.current;
    if (el) {
      el.pause();
      el.removeAttribute("src");
      el.load();
    }
    releaseObjectUrl();
    setIsPlaying(false);
    setIsPaused(false);
    setIsLoading(false);
    setCurrentTime(0);
    setDuration(0);
  }, [releaseObjectUrl]);

  useEffect(() => {
    return () => {
      requestIdRef.current += 1;
      const el = audioRef.current;
      if (el) {
        el.pause();
        el.removeAttribute("src");
      }
      releaseObjectUrl();
    };
  }, [releaseObjectUrl]);

  const fetchAudioBlob = useCallback(async (
    text: string,
    voice: string,
    language: string,
  ): Promise<Blob> => {
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
      body: JSON.stringify({ text, voice, language }),
    });

    if (resp.status === 202) {
      let retryAfterMs = RATE_LIMIT_COOLDOWN_MS;
      const retryAfterHeader = resp.headers.get("Retry-After");
      const retryAfterSeconds = retryAfterHeader ? Number(retryAfterHeader) : NaN;
      if (Number.isFinite(retryAfterSeconds) && retryAfterSeconds > 0) {
        retryAfterMs = retryAfterSeconds * 1000;
      }
      cooldownUntilRef.current = Date.now() + retryAfterMs;

      let msg = "Audio is still being prepared for this chapter. Please try again in about a minute.";
      try {
        const j = await resp.json();
        if (j?.error) msg = j.error;
      } catch {
        // ignore
      }
      throw new Error(msg);
    }

    if (!resp.ok) {
      let msg = `TTS request failed (${resp.status})`;
      if (resp.status === 429) {
        cooldownUntilRef.current = Date.now() + RATE_LIMIT_COOLDOWN_MS;
        msg = "Audio is still being prepared for this chapter. Please try again in about a minute.";
      } else {
        try {
          const j = await resp.json();
          if (j?.error) msg = j.error;
        } catch {
          // ignore
        }
      }
      throw new Error(msg);
    }

    return await resp.blob();
  }, []);

  const playBlob = useCallback(async (blob: Blob) => {
    const el = ensureAudio();
    releaseObjectUrl();
    const url = URL.createObjectURL(blob);
    objectUrlRef.current = url;
    el.src = url;
    el.playbackRate = rate;
    try {
      await el.play();
    } catch (e) {
      console.error("audio play() failed:", e);
      setError(e instanceof Error ? e.message : "Playback failed");
    }
  }, [ensureAudio, rate, releaseObjectUrl]);

  const tryStreamUrl = useCallback(async (url: string): Promise<boolean> => {
    // HEAD-check first; if missing, return false so caller falls back.
    try {
      const head = await fetch(url, { method: "HEAD" });
      if (!head.ok) return false;
    } catch {
      return false;
    }
    const el = ensureAudio();
    releaseObjectUrl();
    el.src = url;
    el.playbackRate = rate;
    try {
      await el.play();
      return true;
    } catch (e) {
      console.error("stream play failed:", e);
      return false;
    }
  }, [ensureAudio, rate, releaseObjectUrl]);

  const start = useCallback(async (
    text: string,
    lang?: string,
    cacheKey?: string,
  ) => {
    if (!text.trim()) return;
    setError(null);
    const reqId = ++requestIdRef.current;
    const locale = resolveLocale(lang);
    lastLangRef.current = locale;
    const voice = selectedVoiceURI || DEFAULT_VOICE;

    if (Date.now() < cooldownUntilRef.current) {
      setError("Audio is still being prepared for this chapter. Please try again in about a minute.");
      return;
    }

    // 1. Try pre-generated audio in Supabase Storage:
    //    bookId is the part of cacheKey before the first ":" (format "{bookId}:{idx}")
    if (cacheKey) {
      const [bookId, sectionIdx] = cacheKey.split(":");
      if (bookId && sectionIdx != null) {
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const storedUrl = `${supabaseUrl}/storage/v1/object/public/book-audio/${bookId}/chapter-${sectionIdx}.wav`;
        const ok = await tryStreamUrl(storedUrl);
        if (ok) return;
      }
    }

    const fullKey = cacheKey ? `${cacheKey}:${voice}` : null;

    // 2. Try local IndexedDB cache (legacy live-generated audio)
    if (fullKey) {
      const cached = await getCachedAudio(fullKey);
      if (cached && reqId === requestIdRef.current) {
        await playBlob(cached);
        return;
      }
    }

    // 3. Fall back to live Gemini generation
    setIsLoading(true);
    try {
      const blob = await fetchAudioBlob(text, voice, lang ?? "en");
      if (reqId !== requestIdRef.current) return;
      if (fullKey) void setCachedAudio(fullKey, blob);
      await playBlob(blob);
    } catch (e) {
      if (reqId !== requestIdRef.current) return;
      setError(e instanceof Error ? e.message : "TTS failed");
      setIsPlaying(false);
      setIsPaused(false);
    } finally {
      if (reqId === requestIdRef.current) setIsLoading(false);
    }
  }, [fetchAudioBlob, playBlob, selectedVoiceURI, tryStreamUrl]);

  const pause = useCallback(() => {
    audioRef.current?.pause();
  }, []);

  const resume = useCallback(() => {
    const el = audioRef.current;
    if (!el || !el.src) return;
    el.play().catch((e) => console.error("resume failed:", e));
  }, []);

  const seek = useCallback((seconds: number) => {
    const el = audioRef.current;
    if (!el || !isFinite(seconds)) return;
    el.currentTime = Math.max(0, Math.min(seconds, el.duration || seconds));
  }, []);

  const setRate = useCallback((r: number) => {
    setRateState(r);
    if (audioRef.current) audioRef.current.playbackRate = r;
  }, []);

  const setSelectedVoiceURI = useCallback((uri: string | null) => {
    setSelectedVoiceURIState(uri);
    try {
      const locale = lastLangRef.current;
      if (uri) localStorage.setItem(voicePrefKey(locale), uri);
      else localStorage.removeItem(voicePrefKey(locale));
    } catch {
      // ignore
    }
  }, []);

  const voices = useMemo(() => GEMINI_VOICES, []);

  return {
    isSupported: typeof window !== "undefined" && typeof Audio !== "undefined",
    isPlaying,
    isPaused,
    isLoading,
    error,
    duration,
    currentTime,
    rate,
    setRate,
    voices,
    selectedVoiceURI,
    setSelectedVoiceURI,
    resolveLang: resolveLocale,
    start,
    pause,
    resume,
    stop,
    seek,
  };
}
