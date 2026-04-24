import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useBook } from "@/hooks/use-books";
import { useBookContent } from "@/hooks/use-book-content";
import { useReadAlong, stripForSpeech } from "@/hooks/use-read-along";
import { useLanguage } from "@/hooks/use-language";
import {
  ChevronDown, Share2, SkipBack, Play, Pause, SkipForward,
  Repeat, Moon, ListMusic, Gauge, Loader2, Mic2,
} from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const SPEEDS = [0.75, 1, 1.25, 1.5, 2];
const SLEEP_OPTIONS = [0, 5, 10, 15, 30]; // minutes; 0 = off

const formatTime = (totalSeconds: number) => {
  if (!isFinite(totalSeconds) || totalSeconds < 0) totalSeconds = 0;
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = Math.floor(totalSeconds % 60);
  if (h > 0) return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  return `${m}:${s.toString().padStart(2, "0")}`;
};

const wordCount = (text: string) => text.trim().split(/\s+/).filter(Boolean).length;

const AudioPlayer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { book } = useBook(id);
  const { sections, isLoading } = useBookContent(book?.contentModule);
  const { t } = useLanguage();

  const [chapterIdx, setChapterIdx] = useState(0);
  const [repeat, setRepeat] = useState(false);
  const [sleepMinutes, setSleepMinutes] = useState(0);
  const sleepTimerRef = useRef<number | null>(null);
  const [sleepCountdown, setSleepCountdown] = useState(0);
  const intervalRef = useRef<number | null>(null);

  const tts = useReadAlong({
    onEnd: () => {
      // Auto-advance or repeat
      if (repeat) {
        playChapter(chapterIdx);
      } else if (chapterIdx < sections.length - 1) {
        const next = chapterIdx + 1;
        setChapterIdx(next);
        playChapter(next);
      }
    },
  });

  const currentSection = sections[chapterIdx];
  const speakable = useMemo(
    () => (currentSection ? stripForSpeech(currentSection.content) : ""),
    [currentSection]
  );

  // Estimated duration from word count (avg ~165 wpm at 1x rate)
  const estimatedSeconds = useMemo(() => {
    if (!speakable) return 0;
    const words = wordCount(speakable);
    return (words / 165) * 60 / tts.rate;
  }, [speakable, tts.rate]);

  // Tick elapsed seconds while playing for a smooth-ish progress within the chapter
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    if (tts.isPlaying) {
      intervalRef.current = window.setInterval(() => setElapsed((e) => e + 1), 1000);
    } else {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
    };
  }, [tts.isPlaying]);

  // Reset elapsed on chapter change
  useEffect(() => {
    setElapsed(0);
  }, [chapterIdx]);

  // Sleep timer
  useEffect(() => {
    if (sleepTimerRef.current) {
      window.clearTimeout(sleepTimerRef.current);
      sleepTimerRef.current = null;
    }
    if (sleepMinutes > 0) {
      setSleepCountdown(sleepMinutes * 60);
      sleepTimerRef.current = window.setTimeout(() => {
        tts.stop();
        setSleepMinutes(0);
        setSleepCountdown(0);
      }, sleepMinutes * 60 * 1000);
    } else {
      setSleepCountdown(0);
    }
    return () => {
      if (sleepTimerRef.current) window.clearTimeout(sleepTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sleepMinutes]);

  // Countdown ticker
  useEffect(() => {
    if (sleepCountdown <= 0) return;
    const id = window.setInterval(() => {
      setSleepCountdown((c) => Math.max(0, c - 1));
    }, 1000);
    return () => window.clearInterval(id);
  }, [sleepCountdown]);

  // Stop TTS when leaving the page or changing book
  useEffect(() => {
    return () => tts.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const playChapter = (idx: number) => {
    const target = sections[idx];
    if (!target) return;
    const text = stripForSpeech(target.content);
    if (!text) return;
    tts.start(text, book?.language);
  };

  const handlePlayPause = () => {
    if (tts.isPlaying) {
      tts.pause();
    } else if (tts.isPaused) {
      tts.resume();
    } else {
      playChapter(chapterIdx);
    }
  };

  const goToChapter = (idx: number) => {
    const clamped = Math.max(0, Math.min(idx, sections.length - 1));
    setChapterIdx(clamped);
    if (tts.isPlaying || tts.isPaused) {
      playChapter(clamped);
    }
  };

  const onSliderChange = (vals: number[]) => {
    goToChapter(vals[0] ?? 0);
  };

  if (!book) return null;

  const totalChapters = sections.length;
  const sliderMax = Math.max(0, totalChapters - 1);
  const chapterLabel = currentSection?.heading || `${t("audioPlayer.chapter")} ${chapterIdx + 1}`;

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Blurred background */}
      <div className="absolute inset-0">
        <img src={book.cover} alt="" className="w-full h-full object-cover opacity-20 blur-3xl scale-110" />
        <div className="absolute inset-0 bg-background/80" />
      </div>

      <div className="relative z-10 min-h-screen flex flex-col">
        <div className="flex items-center justify-between px-5 pt-12 pb-4">
          <button onClick={() => navigate(-1)} className="p-2" aria-label="Close">
            <ChevronDown className="w-6 h-6 text-foreground" />
          </button>
          <div className="text-center">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">{t("audioPlayer.nowPlaying")}</p>
          </div>
          <button className="p-2" aria-label="Share">
            <Share2 className="w-5 h-5 text-foreground" />
          </button>
        </div>

        <div className="flex-1 flex items-center justify-center px-10 py-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="w-full max-w-[280px] aspect-square rounded-2xl overflow-hidden shadow-glow"
          >
            <img src={book.cover} alt={book.title} className="w-full h-full object-cover" />
          </motion.div>
        </div>

        <div className="px-8 text-center mb-2">
          <h2 className="text-lg font-serif font-bold text-foreground">{book.title}</h2>
          <p className="text-sm text-muted-foreground mt-1">{book.author}</p>
          {totalChapters > 0 && (
            <p className="text-xs text-muted-foreground mt-2 line-clamp-1">
              {chapterIdx + 1} / {totalChapters} · {chapterLabel}
            </p>
          )}
        </div>

        {!tts.isSupported && (
          <p className="px-8 text-center text-xs text-destructive mb-2">
            {t("audioPlayer.notSupported")}
          </p>
        )}

        <div className="px-8 mt-2 mb-4">
          <Slider
            value={[chapterIdx]}
            min={0}
            max={sliderMax}
            step={1}
            onValueChange={onSliderChange}
            disabled={isLoading || totalChapters <= 1}
            aria-label="Chapter progress"
          />
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>{formatTime(elapsed)}</span>
            <span>~ {formatTime(estimatedSeconds)}</span>
          </div>
        </div>

        <div className="flex items-center justify-center gap-8 mb-6">
          <button
            onClick={() => goToChapter(chapterIdx - 1)}
            disabled={chapterIdx <= 0}
            className="p-2 text-muted-foreground disabled:opacity-30"
            aria-label="Previous chapter"
          >
            <SkipBack className="w-6 h-6" />
          </button>
          <button
            onClick={handlePlayPause}
            disabled={!tts.isSupported || isLoading || totalChapters === 0}
            className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center transition-transform active:scale-95 disabled:opacity-50"
            aria-label={tts.isPlaying ? "Pause" : "Play"}
          >
            {isLoading ? (
              <Loader2 className="w-7 h-7 text-secondary-foreground animate-spin" />
            ) : tts.isPlaying ? (
              <Pause className="w-7 h-7 text-secondary-foreground" />
            ) : (
              <Play className="w-7 h-7 text-secondary-foreground ml-1" />
            )}
          </button>
          <button
            onClick={() => goToChapter(chapterIdx + 1)}
            disabled={chapterIdx >= sliderMax}
            className="p-2 text-muted-foreground disabled:opacity-30"
            aria-label="Next chapter"
          >
            <SkipForward className="w-6 h-6" />
          </button>
        </div>

        <div className="flex items-center justify-around px-8 pb-28 text-muted-foreground">
          <button
            onClick={() => setRepeat((r) => !r)}
            className={cn("p-2 transition-colors", repeat && "text-primary")}
            aria-label={t("audioPlayer.repeat")}
            aria-pressed={repeat}
          >
            <Repeat className="w-5 h-5" />
          </button>

          <SleepTimerButton
            sleepMinutes={sleepMinutes}
            setSleepMinutes={setSleepMinutes}
            countdown={sleepCountdown}
            label={t("audioPlayer.sleepTimer")}
            offLabel={t("audioPlayer.sleepOff")}
            minLabel={t("audioPlayer.minutes")}
          />

          <ChapterQueueButton
            sections={sections}
            current={chapterIdx}
            onSelect={(i) => goToChapter(i)}
            label={t("audioPlayer.queue")}
          />

          <VoiceButton
            voices={tts.voices}
            bookLang={tts.resolveLang(book?.language)}
            selectedVoiceURI={tts.selectedVoiceURI}
            setSelectedVoiceURI={tts.setSelectedVoiceURI}
            label={t("audioPlayer.voice")}
            defaultLabel={t("audioPlayer.voiceDefault")}
            noneLabel={t("audioPlayer.voiceNone")}
            localLabel={t("audioPlayer.voiceLocal")}
            onlineLabel={t("audioPlayer.voiceOnline")}
          />

          <SpeedButton
            rate={tts.rate}
            setRate={tts.setRate}
            label={t("audioPlayer.speed")}
            note={t("audioPlayer.speedNote")}
          />
        </div>
      </div>
    </div>
  );
};

interface SleepProps {
  sleepMinutes: number;
  setSleepMinutes: (m: number) => void;
  countdown: number;
  label: string;
  offLabel: string;
  minLabel: string;
}
const SleepTimerButton = ({ sleepMinutes, setSleepMinutes, countdown, label, offLabel, minLabel }: SleepProps) => (
  <Popover>
    <PopoverTrigger asChild>
      <button
        className={cn("p-2 transition-colors", sleepMinutes > 0 && "text-primary")}
        aria-label={label}
      >
        <Moon className="w-5 h-5" />
      </button>
    </PopoverTrigger>
    <PopoverContent className="w-48 p-2" align="center">
      <p className="text-sm font-medium px-2 py-1.5 text-foreground">{label}</p>
      {countdown > 0 && (
        <p className="text-xs text-muted-foreground px-2 pb-2">
          {formatTime(countdown)}
        </p>
      )}
      <div className="flex flex-col">
        {SLEEP_OPTIONS.map((m) => (
          <button
            key={m}
            onClick={() => setSleepMinutes(m)}
            className={cn(
              "text-left text-sm px-2 py-1.5 rounded-md hover:bg-accent",
              sleepMinutes === m && "bg-accent text-accent-foreground"
            )}
          >
            {m === 0 ? offLabel : `${m} ${minLabel}`}
          </button>
        ))}
      </div>
    </PopoverContent>
  </Popover>
);

interface QueueProps {
  sections: { id: string; heading: string }[];
  current: number;
  onSelect: (i: number) => void;
  label: string;
}
const ChapterQueueButton = ({ sections, current, onSelect, label }: QueueProps) => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button onClick={() => setOpen(true)} className="p-2" aria-label={label}>
        <ListMusic className="w-5 h-5" />
      </button>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="bottom" className="h-[70vh] p-0">
          <SheetHeader className="p-4 border-b border-border">
            <SheetTitle>{label}</SheetTitle>
          </SheetHeader>
          <ScrollArea className="h-[calc(70vh-65px)]">
            <ul className="py-2">
              {sections.map((s, i) => (
                <li key={s.id}>
                  <button
                    onClick={() => { onSelect(i); setOpen(false); }}
                    className={cn(
                      "w-full text-left px-4 py-3 text-sm hover:bg-accent flex items-center gap-3 transition-colors",
                      i === current && "bg-accent text-accent-foreground font-medium"
                    )}
                  >
                    <span className="text-xs text-muted-foreground w-6">{i + 1}</span>
                    <span className="flex-1 line-clamp-1">{s.heading}</span>
                  </button>
                </li>
              ))}
            </ul>
          </ScrollArea>
        </SheetContent>
      </Sheet>
    </>
  );
};

interface SpeedProps {
  rate: number;
  setRate: (r: number) => void;
  label: string;
  note: string;
}
const SpeedButton = ({ rate, setRate, label, note }: SpeedProps) => (
  <Popover>
    <PopoverTrigger asChild>
      <button className="p-2 relative" aria-label={label}>
        <Gauge className="w-5 h-5" />
        {rate !== 1 && (
          <span className="absolute -top-1 -right-1 text-[10px] font-bold text-primary">
            {rate}×
          </span>
        )}
      </button>
    </PopoverTrigger>
    <PopoverContent className="w-44 p-2" align="center">
      <p className="text-sm font-medium px-2 py-1.5 text-foreground">{label}</p>
      <div className="flex flex-col">
        {SPEEDS.map((s) => (
          <button
            key={s}
            onClick={() => setRate(s)}
            className={cn(
              "text-left text-sm px-2 py-1.5 rounded-md hover:bg-accent",
              rate === s && "bg-accent text-accent-foreground"
            )}
          >
            {s}×
          </button>
        ))}
      </div>
      <p className="text-[11px] text-muted-foreground px-2 pt-2 pb-1">{note}</p>
    </PopoverContent>
  </Popover>
);

interface VoiceProps {
  voices: SpeechSynthesisVoice[];
  bookLang: string;
  selectedVoiceURI: string | null;
  setSelectedVoiceURI: (uri: string | null) => void;
  label: string;
  defaultLabel: string;
  noneLabel: string;
  localLabel: string;
  onlineLabel: string;
}
const VoiceButton = ({
  voices, bookLang, selectedVoiceURI, setSelectedVoiceURI,
  label, defaultLabel, noneLabel, localLabel, onlineLabel,
}: VoiceProps) => {
  const prefix = (bookLang || "").split("-")[0].toLowerCase();
  const matching = voices.filter((v) => v.lang.toLowerCase().startsWith(prefix));
  const list = matching.length > 0 ? matching : voices;
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className={cn("p-2 transition-colors", selectedVoiceURI && "text-primary")}
          aria-label={label}
        >
          <Mic2 className="w-5 h-5" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-2" align="center">
        <p className="text-sm font-medium px-2 py-1.5 text-foreground">{label}</p>
        <ScrollArea className="max-h-64">
          <div className="flex flex-col">
            <button
              onClick={() => setSelectedVoiceURI(null)}
              className={cn(
                "text-left text-sm px-2 py-1.5 rounded-md hover:bg-accent",
                !selectedVoiceURI && "bg-accent text-accent-foreground"
              )}
            >
              {defaultLabel}
            </button>
            {list.length === 0 && (
              <p className="text-xs text-muted-foreground px-2 py-2">{noneLabel}</p>
            )}
            {list.map((v) => (
              <button
                key={v.voiceURI}
                onClick={() => setSelectedVoiceURI(v.voiceURI)}
                className={cn(
                  "text-left text-sm px-2 py-1.5 rounded-md hover:bg-accent",
                  selectedVoiceURI === v.voiceURI && "bg-accent text-accent-foreground"
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate">{v.name}</span>
                  <span className="text-[10px] text-muted-foreground shrink-0">
                    {v.lang} · {v.localService ? localLabel : onlineLabel}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};

export default AudioPlayer;
