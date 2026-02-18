import { useState, useCallback } from "react";

export interface Bookmark {
  id: string;          // unique id
  sectionIdx: number;  // 0-based page index
  pageNumber: number;  // 1-based display page
  heading: string;     // section heading at time of bookmark
  note: string;        // optional user note
  createdAt: number;   // timestamp
}

const storageKey = (bookId: string) => `bookmarks-${bookId}`;

function load(bookId: string): Bookmark[] {
  try {
    const raw = localStorage.getItem(storageKey(bookId));
    if (raw) return JSON.parse(raw) as Bookmark[];
  } catch {}
  return [];
}

function save(bookId: string, bookmarks: Bookmark[]) {
  try {
    localStorage.setItem(storageKey(bookId), JSON.stringify(bookmarks));
  } catch {}
}

export function useBookmarks(bookId: string | undefined) {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(() =>
    bookId ? load(bookId) : []
  );

  const addBookmark = useCallback(
    (sectionIdx: number, pageNumber: number, heading: string, note = "") => {
      if (!bookId) return;
      setBookmarks((prev) => {
        // Replace existing bookmark on same page if it exists
        const filtered = prev.filter((b) => b.sectionIdx !== sectionIdx);
        const updated = [
          ...filtered,
          {
            id: `bm-${sectionIdx}-${Date.now()}`,
            sectionIdx,
            pageNumber,
            heading,
            note,
            createdAt: Date.now(),
          },
        ].sort((a, b) => a.sectionIdx - b.sectionIdx);
        save(bookId, updated);
        return updated;
      });
    },
    [bookId]
  );

  const removeBookmark = useCallback(
    (sectionIdx: number) => {
      if (!bookId) return;
      setBookmarks((prev) => {
        const updated = prev.filter((b) => b.sectionIdx !== sectionIdx);
        save(bookId, updated);
        return updated;
      });
    },
    [bookId]
  );

  const updateNote = useCallback(
    (id: string, note: string) => {
      if (!bookId) return;
      setBookmarks((prev) => {
        const updated = prev.map((b) => (b.id === id ? { ...b, note } : b));
        save(bookId, updated);
        return updated;
      });
    },
    [bookId]
  );

  const isBookmarked = useCallback(
    (sectionIdx: number) => bookmarks.some((b) => b.sectionIdx === sectionIdx),
    [bookmarks]
  );

  return { bookmarks, addBookmark, removeBookmark, updateNote, isBookmarked };
}
