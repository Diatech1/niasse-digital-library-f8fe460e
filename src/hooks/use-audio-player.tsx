import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useGeminiTts, GeminiTtsControls } from "@/hooks/use-gemini-tts";
import { stripForSpeech } from "@/hooks/use-read-along";
import type { Book } from "@/data/books";
import type { BookSection } from "@/hooks/use-book-content";

interface AudioPlayerContextValue {
  tts: GeminiTtsControls;
  book: Book | null;
  sections: BookSection[];
  chapterIdx: number;
  repeat: boolean;
  setRepeat: (r: boolean | ((prev: boolean) => boolean)) => void;
  sleepMinutes: number;
  setSleepMinutes: (m: number) => void;
  sleepCountdown: number;
  elapsed: number; // seconds (real audio time)
  totalDuration: number; // seconds (real audio time, 0 until loaded)
  setActiveBook: (book: Book, sections: BookSection[]) => void;
  goToChapter: (idx: number) => void;
  playChapter: (idx: number) => void;
  togglePlayPause: () => void;
  closePlayer: () => void;
}

const AudioPlayerContext = createContext<AudioPlayerContextValue | null>(null);

export function AudioPlayerProvider({ children }: { children: ReactNode }) {
  const [book, setBook] = useState<Book | null>(null);
  const [sections, setSections] = useState<BookSection[]>([]);
  const [chapterIdx, setChapterIdx] = useState(0);
  const [repeat, setRepeatState] = useState(false);
  const [sleepMinutes, setSleepMinutes] = useState(0);
  const [sleepCountdown, setSleepCountdown] = useState(0);

  const repeatRef = useRef(repeat);
  const chapterIdxRef = useRef(chapterIdx);
  const sectionsRef = useRef(sections);
  const bookRef = useRef(book);
  useEffect(() => { repeatRef.current = repeat; }, [repeat]);
  useEffect(() => { chapterIdxRef.current = chapterIdx; }, [chapterIdx]);
  useEffect(() => { sectionsRef.current = sections; }, [sections]);
  useEffect(() => { bookRef.current = book; }, [book]);

  const ttsRef = useRef<GeminiTtsControls | null>(null);

  const playChapterInternal = useCallback((idx: number) => {
    const target = sectionsRef.current[idx];
    const currentBook = bookRef.current;
    if (!target || !currentBook || !ttsRef.current) return;
    const text = stripForSpeech(target.content);
    if (!text) return;
    const cacheKey = `${currentBook.id}:${idx}`;
    void ttsRef.current.start(text, currentBook.language, cacheKey);
  }, []);

  const tts = useGeminiTts({
    onEnd: () => {
      if (repeatRef.current) {
        playChapterInternal(chapterIdxRef.current);
      } else if (chapterIdxRef.current < sectionsRef.current.length - 1) {
        const next = chapterIdxRef.current + 1;
        setChapterIdx(next);
        playChapterInternal(next);
      }
    },
  });

  useEffect(() => { ttsRef.current = tts; }, [tts]);

  const setRepeat = useCallback(
    (r: boolean | ((prev: boolean) => boolean)) => setRepeatState(r),
    []
  );

  const setActiveBook = useCallback((nextBook: Book, nextSections: BookSection[]) => {
    if (book?.id !== nextBook.id) {
      tts.stop();
      setChapterIdx(0);
    }
    setBook(nextBook);
    setSections(nextSections);
  }, [book?.id, tts]);

  const playChapter = useCallback((idx: number) => {
    playChapterInternal(idx);
  }, [playChapterInternal]);

  const goToChapter = useCallback((idx: number) => {
    const total = sectionsRef.current.length;
    const clamped = Math.max(0, Math.min(idx, total - 1));
    setChapterIdx(clamped);
    if (tts.isPlaying || tts.isPaused || tts.isLoading) {
      playChapterInternal(clamped);
    }
  }, [tts.isPlaying, tts.isPaused, tts.isLoading, playChapterInternal]);

  const togglePlayPause = useCallback(() => {
    if (tts.isPlaying) {
      tts.pause();
    } else if (tts.isPaused) {
      tts.resume();
    } else {
      playChapterInternal(chapterIdxRef.current);
    }
  }, [tts, playChapterInternal]);

  const closePlayer = useCallback(() => {
    tts.stop();
    setBook(null);
    setSections([]);
    setChapterIdx(0);
    setSleepMinutes(0);
  }, [tts]);

  // Sleep timer
  useEffect(() => {
    if (sleepMinutes <= 0) {
      setSleepCountdown(0);
      return;
    }
    setSleepCountdown(sleepMinutes * 60);
    const timeout = window.setTimeout(() => {
      tts.stop();
      setSleepMinutes(0);
      setSleepCountdown(0);
    }, sleepMinutes * 60 * 1000);
    return () => window.clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sleepMinutes]);

  useEffect(() => {
    if (sleepCountdown <= 0) return;
    const id = window.setInterval(() => {
      setSleepCountdown((c) => Math.max(0, c - 1));
    }, 1000);
    return () => window.clearInterval(id);
  }, [sleepCountdown]);

  const value = useMemo<AudioPlayerContextValue>(() => ({
    tts,
    book,
    sections,
    chapterIdx,
    repeat,
    setRepeat,
    sleepMinutes,
    setSleepMinutes,
    sleepCountdown,
    elapsed: tts.currentTime,
    totalDuration: tts.duration,
    setActiveBook,
    goToChapter,
    playChapter,
    togglePlayPause,
    closePlayer,
  }), [
    tts, book, sections, chapterIdx, repeat, setRepeat, sleepMinutes,
    sleepCountdown, setActiveBook, goToChapter, playChapter,
    togglePlayPause, closePlayer,
  ]);

  return (
    <AudioPlayerContext.Provider value={value}>
      {children}
    </AudioPlayerContext.Provider>
  );
}

export function useAudioPlayer() {
  const ctx = useContext(AudioPlayerContext);
  if (!ctx) throw new Error("useAudioPlayer must be used within AudioPlayerProvider");
  return ctx;
}
