import { useState, useRef, useCallback, useEffect } from "react";

/**
 * Splits text into sentences by punctuation boundaries.
 * Strips {{PAGE:N}} markers and normalises whitespace before splitting.
 */
export function splitIntoSentences(text: string): string[] {
  // Strip page markers and extra whitespace
  const clean = text
    .replace(/\{\{PAGE:\d+\}\}/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  // Split on ". ", "? ", "! " — keep the delimiter at end of each sentence
  const raw = clean.split(/(?<=[.?!])\s+/);
  return raw.map((s) => s.trim()).filter((s) => s.length > 2);
}

/**
 * Strips a full section content string down to plain speakable text:
 * removes page markers, collapses newlines, trims.
 */
export function stripForSpeech(content: string): string {
  return content
    .replace(/\{\{PAGE:\d+\}\}/g, " ")
    .replace(/\n+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

interface UseReadAlongOptions {
  onEnd?: () => void;
}

export interface ReadAlongControls {
  isSupported: boolean;
  isPlaying: boolean;
  isPaused: boolean;
  activeSentenceIndex: number;
  rate: number;
  setRate: (r: number) => void;
  start: (text: string, lang?: string) => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
}

export function useReadAlong(options?: UseReadAlongOptions): ReadAlongControls {
  const isSupported =
    typeof window !== "undefined" && "speechSynthesis" in window;

  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [activeSentenceIndex, setActiveSentenceIndex] = useState(-1);
  const [rate, setRate] = useState(1);

  // Sentence boundaries: cumulative char offsets into the joined text
  const sentenceBoundaries = useRef<number[]>([]);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const rateRef = useRef(rate);

  useEffect(() => {
    rateRef.current = rate;
    // If currently playing, update rate live by restarting from current index
    // (Web Speech API doesn't support live rate change; we just store for next start)
  }, [rate]);

  const stop = useCallback(() => {
    if (!isSupported) return;
    window.speechSynthesis.cancel();
    utteranceRef.current = null;
    sentenceBoundaries.current = [];
    setIsPlaying(false);
    setIsPaused(false);
    setActiveSentenceIndex(-1);
    options?.onEnd?.();
  }, [isSupported, options]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (isSupported) window.speechSynthesis.cancel();
    };
  }, [isSupported]);

  const start = useCallback(
    (text: string, lang?: string) => {
      if (!isSupported) return;
      window.speechSynthesis.cancel();

      const sentences = splitIntoSentences(text);
      if (sentences.length === 0) return;

      // Map short codes AND full names (en/fr/ar/english/french/arabic) to BCP-47 voice locales
      const localeMap: Record<string, string> = {
        en: "en-US",
        eng: "en-US",
        english: "en-US",
        "en-us": "en-US",
        "en-gb": "en-GB",
        fr: "fr-FR",
        fra: "fr-FR",
        fre: "fr-FR",
        french: "fr-FR",
        français: "fr-FR",
        francais: "fr-FR",
        "fr-fr": "fr-FR",
        ar: "ar-SA",
        ara: "ar-SA",
        arabic: "ar-SA",
        arabe: "ar-SA",
        "العربية": "ar-SA",
        "ar-sa": "ar-SA",
      };
      const resolvedLang = lang
        ? (localeMap[lang.toLowerCase().trim()] ?? lang)
        : "en-US";

      // Build cumulative char offset boundaries so we can map charIndex → sentence
      const boundaries: number[] = [];
      let cumulative = 0;
      for (const s of sentences) {
        boundaries.push(cumulative);
        cumulative += s.length + 1; // +1 for the space we'll join with
      }
      sentenceBoundaries.current = boundaries;

      const joined = sentences.join(" ");
      const utterance = new SpeechSynthesisUtterance(joined);
      utterance.rate = rateRef.current;
      utterance.lang = resolvedLang;

      utterance.onboundary = (e) => {
        if (e.name !== "word" && e.name !== "sentence") return;
        const charIdx = e.charIndex;
        // Find which sentence this charIndex belongs to
        let sentIdx = 0;
        for (let i = boundaries.length - 1; i >= 0; i--) {
          if (charIdx >= boundaries[i]) {
            sentIdx = i;
            break;
          }
        }
        setActiveSentenceIndex(sentIdx);
      };

      utterance.onend = () => {
        setIsPlaying(false);
        setIsPaused(false);
        setActiveSentenceIndex(-1);
        utteranceRef.current = null;
        options?.onEnd?.();
      };

      utterance.onerror = () => {
        setIsPlaying(false);
        setIsPaused(false);
        setActiveSentenceIndex(-1);
        utteranceRef.current = null;
      };

      utteranceRef.current = utterance;
      setActiveSentenceIndex(0);
      setIsPlaying(true);
      setIsPaused(false);
      window.speechSynthesis.speak(utterance);
    },
    [isSupported, options]
  );

  const pause = useCallback(() => {
    if (!isSupported || !isPlaying || isPaused) return;
    window.speechSynthesis.pause();
    setIsPaused(true);
    setIsPlaying(false);
  }, [isSupported, isPlaying, isPaused]);

  const resume = useCallback(() => {
    if (!isSupported || !isPaused) return;
    window.speechSynthesis.resume();
    setIsPaused(false);
    setIsPlaying(true);
  }, [isSupported, isPaused]);

  return {
    isSupported,
    isPlaying,
    isPaused,
    activeSentenceIndex,
    rate,
    setRate,
    start,
    pause,
    resume,
    stop,
  };
}
