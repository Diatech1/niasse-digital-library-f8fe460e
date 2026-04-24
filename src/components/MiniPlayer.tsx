import { Play, Pause, X, ChevronUp, Moon, Loader2 } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAudioPlayer } from "@/hooks/use-audio-player";
import { useLanguage } from "@/hooks/use-language";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const SLEEP_OPTIONS = [0, 5, 10, 15, 30];

const formatCountdown = (totalSeconds: number) => {
  const m = Math.floor(totalSeconds / 60);
  const s = Math.floor(totalSeconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
};

const MiniPlayer = () => {
  const {
    book, sections, chapterIdx, tts, togglePlayPause, closePlayer,
    sleepMinutes, setSleepMinutes, sleepCountdown,
  } = useAudioPlayer();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();

  if (!book) return null;
  if (location.pathname === `/listen/${book.id}`) return null;

  const currentSection = sections[chapterIdx];
  const subtitle = currentSection?.heading || `${t("audioPlayer.chapter")} ${chapterIdx + 1}`;

  const openFull = () => navigate(`/listen/${book.id}`);

  return (
    <div
      className="fixed bottom-[60px] left-0 right-0 z-40 px-2 pb-1 pointer-events-none"
      role="region"
      aria-label="Mini audio player"
    >
      <div className="max-w-lg mx-auto pointer-events-auto">
        <div className="flex items-center gap-2 glass border border-border/50 rounded-xl shadow-lg px-2 py-1.5">
          <button
            onClick={openFull}
            className="flex items-center gap-2.5 flex-1 min-w-0 text-left rounded-lg px-1 py-1 transition-transform active:scale-[0.99]"
            aria-label="Open audio player"
          >
            <img
              src={book.cover}
              alt=""
              className="w-9 h-9 rounded-md object-cover shrink-0"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground line-clamp-1">{book.title}</p>
              <p className="text-[11px] text-muted-foreground line-clamp-1">{subtitle}</p>
            </div>
            <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" aria-hidden="true" />
          </button>

          <Popover>
            <PopoverTrigger asChild>
              <button
                className={cn(
                  "relative w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-colors",
                  sleepMinutes > 0
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground hover:text-foreground"
                )}
                aria-label={t("audioPlayer.sleepTimer")}
              >
                <Moon className="w-4 h-4" />
                {sleepCountdown > 0 && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-[9px] font-medium text-primary leading-none whitespace-nowrap">
                    {formatCountdown(sleepCountdown)}
                  </span>
                )}
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-1.5" align="center" side="top" sideOffset={8}>
              <p className="text-[11px] font-medium px-2 py-1 text-muted-foreground uppercase tracking-wide">
                {t("audioPlayer.sleepTimer")}
              </p>
              <div className="flex items-center gap-1">
                {SLEEP_OPTIONS.map((m) => (
                  <button
                    key={m}
                    onClick={() => setSleepMinutes(m)}
                    className={cn(
                      "text-xs font-medium px-2.5 py-1.5 rounded-md transition-colors",
                      sleepMinutes === m
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-accent text-foreground"
                    )}
                  >
                    {m === 0 ? t("audioPlayer.sleepOff") : `${m}m`}
                  </button>
                ))}
              </div>
            </PopoverContent>
          </Popover>

          <button
            onClick={togglePlayPause}
            disabled={!tts.isSupported || tts.isLoading}
            className={cn(
              "w-9 h-9 rounded-full bg-secondary flex items-center justify-center shrink-0",
              "transition-transform active:scale-95 disabled:opacity-50"
            )}
            aria-label={tts.isPlaying ? "Pause" : "Play"}
          >
            {tts.isLoading ? (
              <Loader2 className="w-4 h-4 text-secondary-foreground animate-spin" />
            ) : tts.isPlaying ? (
              <Pause className="w-4 h-4 text-secondary-foreground" />
            ) : (
              <Play className="w-4 h-4 text-secondary-foreground ml-0.5" />
            )}
          </button>
          <button
            onClick={closePlayer}
            className="w-7 h-7 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground shrink-0"
            aria-label="Close audio player"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default MiniPlayer;
