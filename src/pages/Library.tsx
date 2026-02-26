import { useState } from "react";
import { books } from "@/data/books";
import BookCard from "@/components/BookCard";
import SearchBar from "@/components/SearchBar";

const languages = ["All", "English", "Arabic", "French"];

const Library = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLang, setSelectedLang] = useState("All");

  const filtered = books.filter((b) => {
    const matchSearch =
      b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchLang = selectedLang === "All" || b.language === selectedLang;
    return matchSearch && matchLang;
  });

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="px-5 pt-12 pb-4">
        <h1 className="text-2xl font-serif font-bold text-foreground">Library</h1>
        <p className="text-sm text-muted-foreground mt-1">Browse all works</p>
      </div>

      <div className="px-5 mb-4">
        <SearchBar onSearch={setSearchQuery} />
      </div>

      {/* Language filter */}
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

      <div className="px-5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 gap-y-6">
        {filtered.map((book, i) => (
          <BookCard key={book.id} book={book} index={i} />
        ))}
      </div>

      {/* Stats Card */}
      <div className="px-5 mt-8">
        <div className="rounded-2xl border border-border bg-card p-6">
          <h3 className="text-center font-serif font-bold text-lg text-foreground">
            Literary Heritage Collection
          </h3>
          <p className="text-center text-sm text-muted-foreground mt-1">
            Preserved works and teachings
          </p>
          <div className="grid grid-cols-3 gap-4 mt-5">
            {[
              { icon: "📚", count: books.length, label: "Works" },
              { icon: "📖", count: books.filter(b => b.progress && b.progress > 0).length, label: "Reading" },
              { icon: "🌐", count: new Set(books.map(b => b.language)).size, label: "Languages" },
            ].map((stat) => (
              <div key={stat.label} className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-xl">
                  {stat.icon}
                </div>
                <span className="text-2xl font-bold text-foreground">{stat.count}</span>
                <span className="text-xs text-muted-foreground">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Library;
