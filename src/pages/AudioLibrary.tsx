import { useBooks } from "@/hooks/use-books";
import BookCard from "@/components/BookCard";
import { Skeleton } from "@/components/ui/skeleton";

const AudioLibrary = () => {
  const { books, isLoading } = useBooks();
  const audioBooks = books.filter((b) => b.hasAudio);

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="px-5 pt-12 pb-6">
        <h1 className="text-2xl font-serif font-bold text-foreground">Audiobooks</h1>
        <p className="text-sm text-muted-foreground mt-1">Listen to sacred teachings</p>
      </div>

      {isLoading ? (
        <div className="px-5 grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-4 gap-3 gap-y-5">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="aspect-[2/3] rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="px-5 grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-4 gap-3 gap-y-5">
          {audioBooks.map((book, i) => (
            <BookCard key={book.id} book={book} index={i} />
          ))}
        </div>
      )}
    </div>
  );
};

export default AudioLibrary;
