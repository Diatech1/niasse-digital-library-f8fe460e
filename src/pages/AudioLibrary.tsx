import { useBooks } from "@/hooks/use-books";
import BookCard from "@/components/BookCard";
import SEO from "@/components/SEO";
import { Skeleton } from "@/components/ui/skeleton";
import { useLanguage } from "@/hooks/use-language";

const AudioLibrary = () => {
  const { books, isLoading } = useBooks();
  const { t } = useLanguage();
  const audioBooks = books.filter((b) => b.hasAudio);

  return (
    <main className="min-h-screen bg-background pb-24 lg:pb-12">
      <SEO
        title="Audio — Faydabook"
        description="Écoutez les livres et traités tidjanis en audio : Cheikh Ibrahim Niasse et la Faydah."
        path="/audio"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "Bibliothèque audio Faydabook",
          url: "https://faydabook.com/audio",
        }}
      />
      <div className="container mx-auto px-5 lg:px-8 max-w-6xl">
        <div className="pt-12 lg:pt-4 pb-6 lg:pb-8">
          <p className="hidden lg:block text-accent text-xs font-medium tracking-[0.2em] uppercase mb-2">
            Listen
          </p>
          <h1 className="text-2xl lg:text-4xl font-display font-bold text-foreground">{t("audio.title")}</h1>
          <p className="text-sm lg:text-base text-muted-foreground mt-1">{t("audio.subtitle")}</p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4 lg:gap-6 gap-y-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="aspect-[2/3] rounded-lg" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4 lg:gap-6 gap-y-6">
            {audioBooks.map((book, i) => (
              <BookCard key={book.id} book={book} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AudioLibrary;
