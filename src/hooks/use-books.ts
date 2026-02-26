import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Book } from "@/data/books";

interface BookRow {
  id: string;
  title: string;
  title_ar: string | null;
  author: string;
  cover: string;
  language: string;
  pages: number;
  tags: string[];
  description: string;
  has_audio: boolean;
  audio_duration: string | null;
  content_module: string | null;
  is_favorite: boolean;
}

function rowToBook(row: BookRow): Book {
  return {
    id: row.id,
    title: row.title,
    titleAr: row.title_ar ?? undefined,
    author: row.author,
    cover: row.cover,
    language: row.language,
    pages: row.pages,
    tags: row.tags,
    description: row.description,
    hasAudio: row.has_audio,
    audioDuration: row.audio_duration ?? undefined,
    contentModule: row.content_module ?? undefined,
    isFavorite: row.is_favorite,
  };
}

async function fetchBooks(): Promise<Book[]> {
  const { data, error } = await supabase
    .from("books")
    .select("*")
    .order("id");
  if (error) throw error;
  return (data as BookRow[]).map(rowToBook);
}

export function useBooks() {
  const { data: books = [], isLoading, error } = useQuery({
    queryKey: ["books"],
    queryFn: fetchBooks,
    staleTime: 5 * 60 * 1000,
  });
  return { books, isLoading, error };
}

export function useBook(id: string | undefined) {
  const { books, isLoading, error } = useBooks();
  const book = books.find((b) => b.id === id);
  return { book, isLoading, error };
}
