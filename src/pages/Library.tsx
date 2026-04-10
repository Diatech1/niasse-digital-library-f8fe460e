import { useState } from "react";
import { useBooks } from "@/hooks/use-books";
import BookCard from "@/components/BookCard";
import SearchBar from "@/components/SearchBar";
import { Skeleton } from "@/components/ui/skeleton";

const languages = ["All", "English", "Arabic", "French"];

const TIDJANIYA_IDS = [
  "volume-1-conditions",
  "volume-2-liturgies",
  "volume-3-ethics",
  "volume-4-letters",
  "volume-5-commentaries",
  "ifadatou-ahmediyya",
  "volume-7-biography",
  "volume-8-teachings",
];

const Library = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLang, setSelectedLang] = useState("All");
  const { books, isLoading } = useBooks();

  const filtered = books.filter((b) => {
    const matchSearch =
      b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchLang = selectedLang === "All" || b.language === selectedLang;
    return matchSearch && matchLang;
  });

  const tidjaniyaBooks = filtered.filter((b) => TIDJANIYA_IDS.includes(b.id));
  const otherBooks = filtered.filter((b) => !TIDJANIYA_IDS.includes(b.id));

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="px-5 pt-12 pb-4">
        <h1 className="text-2xl font-serif font-bold text-foreground">Library</h1>
        <p className="text-sm text-muted-foreground mt-1">Browse all works</p>
      </div>

      <div className="px-5 mb-4">
        <SearchBar onSearch={setSearchQuery} />
      </div>

      <div className="flex gap-2 px-5 mb-6 overflow-x-auto scrollbar-hide">
        {languages.map((lang) => (
          <button
            key={lang}
            onClick={() => setSelectedLang(lang)}
            className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
              lang === selectedLang
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {lang}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="px-5 grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-4 gap-4 gap-y-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="aspect-[2/3] rounded-lg" />
          ))}
        </div>
      ) : (
        <>
          {tidjaniyaBooks.length > 0 && (
            <section className="mb-8">
              <h2 className="text-primary font-serif text-lg font-semibold px-5 mb-3">
                Tidjaniya.com
              </h2>
              <p className="text-xs text-muted-foreground px-5 mb-4">
                Les enseignements de Seïdina Ahmed Tidjani (Volumes 1-8)
              </p>
              <div className="px-5 grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-4 gap-4 gap-y-6">
                {tidjaniyaBooks.map((book, i) => (
                  <BookCard key={book.id} book={book} index={i} />
                ))}
              </div>
            </section>
          )}

          {otherBooks.length > 0 && (
            <section>
              <h2 className="text-primary font-serif text-lg font-semibold px-5 mb-3">
                Other Works
              </h2>
              <div className="px-5 grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-4 gap-4 gap-y-6">
                {otherBooks.map((book, i) => (
                  <BookCard key={book.id} book={book} index={i} />
                ))}
              </div>
            </section>
          )}

          {filtered.length === 0 && (
            <p className="text-center text-muted-foreground py-12">No books found</p>
          )}
        </>
      )}
    </div>
  );
};

export default Library;
