import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useBooks } from "@/hooks/use-books";
import DesktopBookGrid from "@/components/desktop/DesktopBookGrid";
import { Search } from "lucide-react";

const LANGS = ["All", "en", "fr", "ar"] as const;

const DesktopLibrary = () => {
  const { books, isLoading } = useBooks();
  const [params] = useSearchParams();
  const [q, setQ] = useState(params.get("q") ?? "");
  const [lang, setLang] = useState<(typeof LANGS)[number]>("All");

  const filtered = useMemo(() => {
    return books.filter((b) => {
      const matchesQ =
        !q ||
        b.title.toLowerCase().includes(q.toLowerCase()) ||
        b.author.toLowerCase().includes(q.toLowerCase()) ||
        b.tags.some((t) => t.toLowerCase().includes(q.toLowerCase()));
      const matchesLang = lang === "All" || b.language === lang;
      return matchesQ && matchesLang;
    });
  }, [books, q, lang]);

  return (
    <div className="mx-auto max-w-7xl px-8 py-16">
      <p className="font-serif italic text-xs uppercase tracking-[0.3em] text-primary mb-2">
        Explore
      </p>
      <h1 className="font-serif text-4xl md:text-5xl font-bold mb-10">The Library</h1>

      <div className="flex flex-col md:flex-row md:items-center gap-4 mb-12">
        <div className="flex-1 flex items-center gap-2 rounded-full border border-border/60 bg-card/60 px-4 py-2.5">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search title, author, theme…"
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>
        <div className="flex items-center gap-2">
          {LANGS.map((l) => (
            <button
              key={l}
              onClick={() => setLang(l)}
              className={`rounded-full px-4 py-2 text-xs font-medium uppercase tracking-wider transition ${
                lang === l
                  ? "bg-primary text-primary-foreground"
                  : "border border-border/60 text-muted-foreground hover:text-foreground"
              }`}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">Loading library…</p>
      ) : filtered.length === 0 ? (
        <p className="text-center text-muted-foreground py-20">No books match your search.</p>
      ) : (
        <DesktopBookGrid books={filtered} columns={5} />
      )}
    </div>
  );
};

export default DesktopLibrary;
