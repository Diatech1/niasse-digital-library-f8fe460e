import { useState } from "react";
import { useBooks } from "@/hooks/use-books";
import BookCard from "@/components/BookCard";
import SearchBar from "@/components/SearchBar";
import { Skeleton } from "@/components/ui/skeleton";
import { useLanguage } from "@/hooks/use-language";

const Library = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLang, setSelectedLang] = useState("All");
  const { books, isLoading } = useBooks();
  const { t } = useLanguage();

  const languages = [
    { value: "All", label: t("library.lang.all") },
    { value: "English", label: t("library.lang.english") },
    { value: "Arabic", label: t("library.lang.arabic") },
    { value: "French", label: t("library.lang.french") },
  ];

  const filtered = books.filter((b) => {
    const matchSearch =
      b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchLang = selectedLang === "All" || b.language === selectedLang;
    return matchSearch && matchLang;
  });

  return (
    <div className="min-h-screen bg-background pb-24 lg:pb-12">
      <div className="container mx-auto px-5 lg:px-8 max-w-7xl">
        <div className="pt-12 lg:pt-4 pb-4 lg:pb-8">
          <p className="hidden lg:block text-accent text-xs font-medium tracking-[0.2em] uppercase mb-2">
            Browse
          </p>
          <h1 className="text-2xl lg:text-4xl font-display font-bold text-foreground">{t("library.title")}</h1>
          <p className="text-sm lg:text-base text-muted-foreground mt-1">{t("library.subtitle")}</p>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center gap-3 lg:gap-6 mb-6">
          <div className="lg:flex-1 lg:max-w-md">
            <SearchBar onSearch={setSearchQuery} />
          </div>
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            {languages.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => setSelectedLang(value)}
                className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                  value === selectedLang
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-4 lg:gap-6 gap-y-6">
            {Array.from({ length: 12 }).map((_, i) => (
              <Skeleton key={i} className="aspect-[2/3] rounded-lg" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-4 lg:gap-6 gap-y-6">
            {filtered.map((book, i) => (
              <BookCard key={book.id} book={book} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Library;
