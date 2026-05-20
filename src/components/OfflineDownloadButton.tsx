import { Download, Loader2, Check, X, Trash2 } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { useOfflineAudio } from "@/hooks/use-offline-audio";
import type { OfflineChapter } from "@/lib/offline-audio";

interface Props {
  bookId: string | undefined;
  sections: OfflineChapter[];
  voice?: string | null;
  language?: string;
}

const OfflineDownloadButton = ({ bookId, sections, voice, language }: Props) => {
  const offline = useOfflineAudio({ bookId, sections, voice, language });
  const { status, downloaded, total, progress, error, isDownloading, start, cancel, remove } = offline;

  if (total === 0) return null;

  const pct = total > 0 ? Math.round(((progress?.done ?? downloaded) / total) * 100) : 0;
  const isReady = status === "ready";
  const isPartial = status === "partial";

  const Icon = isDownloading
    ? Loader2
    : isReady
      ? Check
      : Download;

  const ariaLabel = isDownloading
    ? `Downloading: ${pct}%`
    : isReady
      ? "Available offline"
      : isPartial
        ? `Resume download (${downloaded}/${total})`
        : "Download for offline";

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className={cn(
            "p-2 relative transition-colors",
            (isReady || isPartial) && "text-primary",
          )}
          aria-label={ariaLabel}
        >
          <Icon className={cn("w-5 h-5", isDownloading && "animate-spin")} />
          {isDownloading && (
            <span className="absolute -top-1 -right-1 text-[9px] font-bold text-primary leading-none">
              {pct}%
            </span>
          )}
          {isPartial && !isDownloading && (
            <span className="absolute -top-1 -right-1 text-[9px] font-bold text-primary leading-none">
              {downloaded}/{total}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-3" align="center" side="top" sideOffset={8}>
        <p className="text-sm font-medium text-foreground">Offline audio</p>
        <p className="text-xs text-muted-foreground mt-1">
          Download every chapter to your device. Stored locally — plays without a network connection.
        </p>

        {(isDownloading || isPartial || isReady) && (
          <div className="mt-3 space-y-1.5">
            <Progress value={pct} className="h-1.5" />
            <p className="text-[11px] text-muted-foreground">
              {isReady
                ? `All ${total} chapters available offline.`
                : `${progress?.done ?? downloaded} / ${total} chapters${
                    progress?.failed ? ` · ${progress.failed} failed` : ""
                  }`}
            </p>
          </div>
        )}

        {error && (
          <p className="mt-2 text-[11px] text-destructive">{error}</p>
        )}

        <div className="mt-3 flex items-center gap-2">
          {isDownloading ? (
            <button
              onClick={cancel}
              className="flex-1 inline-flex items-center justify-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-md bg-secondary text-secondary-foreground hover:opacity-90"
            >
              <X className="w-3.5 h-3.5" /> Cancel
            </button>
          ) : isReady ? (
            <button
              onClick={remove}
              className="flex-1 inline-flex items-center justify-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-md bg-secondary text-secondary-foreground hover:opacity-90"
            >
              <Trash2 className="w-3.5 h-3.5" /> Remove download
            </button>
          ) : (
            <>
              <button
                onClick={start}
                className="flex-1 inline-flex items-center justify-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-md bg-primary text-primary-foreground hover:opacity-90"
              >
                <Download className="w-3.5 h-3.5" />
                {isPartial ? "Resume" : "Download"}
              </button>
              {isPartial && (
                <button
                  onClick={remove}
                  className="inline-flex items-center justify-center px-2 py-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent"
                  aria-label="Remove partial download"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default OfflineDownloadButton;
