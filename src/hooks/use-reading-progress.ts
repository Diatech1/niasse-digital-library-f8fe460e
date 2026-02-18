import { useCallback } from "react";

const storageKey = (bookId: string) => `reading-progress-${bookId}`;

export function useSaveProgress(bookId: string | undefined) {
  return useCallback(
    (sectionIdx: number) => {
      if (!bookId) return;
      try {
        localStorage.setItem(storageKey(bookId), String(sectionIdx));
      } catch {}
    },
    [bookId]
  );
}

export function getSavedProgress(bookId: string | undefined): number {
  if (!bookId) return 0;
  try {
    const saved = localStorage.getItem(storageKey(bookId));
    if (saved !== null) {
      const n = parseInt(saved, 10);
      if (!isNaN(n) && n >= 0) return n;
    }
  } catch {}
  return 0;
}
