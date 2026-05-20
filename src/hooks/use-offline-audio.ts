import { useCallback, useEffect, useRef, useState } from "react";
import {
  countDownloadedChapters,
  downloadBookAudio,
  removeBookDownload,
  type DownloadProgress,
  type OfflineChapter,
} from "@/lib/offline-audio";

interface UseOfflineAudioArgs {
  bookId: string | undefined;
  sections: OfflineChapter[];
  voice?: string | null;
  language?: string;
}

export type OfflineStatus = "idle" | "checking" | "downloading" | "ready" | "partial" | "error";

export function useOfflineAudio({
  bookId,
  sections,
  voice,
  language,
}: UseOfflineAudioArgs) {
  const effectiveVoice = voice || "Zephyr";
  const [status, setStatus] = useState<OfflineStatus>("idle");
  const [downloaded, setDownloaded] = useState(0);
  const [progress, setProgress] = useState<DownloadProgress | null>(null);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const total = sections.length;

  const refresh = useCallback(async () => {
    if (!bookId || total === 0) {
      setDownloaded(0);
      setStatus("idle");
      return;
    }
    setStatus((s) => (s === "downloading" ? s : "checking"));
    const n = await countDownloadedChapters(bookId, total, effectiveVoice);
    setDownloaded(n);
    setStatus((s) => {
      if (s === "downloading") return s;
      if (n === 0) return "idle";
      if (n >= total) return "ready";
      return "partial";
    });
  }, [bookId, total, effectiveVoice]);

  useEffect(() => {
    void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookId, total, effectiveVoice]);

  const start = useCallback(async () => {
    if (!bookId || sections.length === 0) return;
    setError(null);
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setStatus("downloading");
    setProgress({ done: downloaded, total, failed: 0 });
    try {
      const result = await downloadBookAudio(bookId, sections, {
        voice: effectiveVoice,
        language,
        signal: controller.signal,
        onProgress: (p) => setProgress(p),
      });
      setDownloaded(result.done);
      if (controller.signal.aborted) {
        await refresh();
        return;
      }
      if (result.failed > 0 && result.done < total) {
        setError(`${result.failed} chapter${result.failed === 1 ? "" : "s"} failed to download.`);
        setStatus(result.done > 0 ? "partial" : "error");
      } else {
        setStatus("ready");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Download failed");
      setStatus("error");
    } finally {
      abortRef.current = null;
    }
  }, [bookId, sections, effectiveVoice, language, total, downloaded, refresh]);

  const cancel = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
  }, []);

  const remove = useCallback(async () => {
    if (!bookId) return;
    cancel();
    await removeBookDownload(bookId);
    setProgress(null);
    setDownloaded(0);
    setStatus("idle");
    setError(null);
  }, [bookId, cancel]);

  return {
    status,
    downloaded,
    total,
    progress,
    error,
    isDownloading: status === "downloading",
    start,
    cancel,
    remove,
    refresh,
  };
}
