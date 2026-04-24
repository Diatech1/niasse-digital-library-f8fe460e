import { Play, Pause, X, ChevronUp, Loader2 } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAudioPlayer } from "@/hooks/use-audio-player";
import { useLanguage } from "@/hooks/use-language";
import { cn } from "@/lib/utils";

const MiniPlayer = () => {
  const { book, sections, chapterIdx, tts, togglePlayPause, closePlayer } = useAudioPlayer();
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
          <button
            onClick={togglePlayPause}
            disabled={!tts.isSupported}
            className={cn(
              "w-9 h-9 rounded-full bg-secondary flex items-center justify-center shrink-0",
              "transition-transform active:scale-95 disabled:opacity-50"
            )}
            aria-label={tts.isPlaying ? "Pause" : "Play"}
          >
            {tts.isPlaying ? (
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
