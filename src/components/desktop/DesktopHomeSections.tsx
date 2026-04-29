import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Headphones, Languages, Library as LibraryIcon, Heart } from "lucide-react";
import BookCard from "@/components/BookCard";
import { useBooks } from "@/hooks/use-books";
import { useLanguage } from "@/hooks/use-language";

const quotes = [
  {
    text: "Knowledge is a light that Allah casts in the heart of whom He wills.",
    author: "Shaykh Ibrāhīm Niass",
  },
  {
    text: "The Fayda is the spreading of the spiritual flood promised by the Prophet ﷺ for the end of time.",
    author: "Shaykh Ibrāhīm Niass",
  },
  {
    text: "Truly, the slave who knows his Lord becomes a sea without shore.",
    author: "Shaykh Ibrāhīm Niass",
  },
];

const DesktopHomeSections = () => {
  const { books } = useBooks();
  const { t } = useLanguage();
  const [quoteIndex, setQuoteIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setQuoteIndex((prev) => (prev + 1) % quotes.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const featured = books.slice(0, 8);
  const audioCount = books.filter((b) => b.hasAudio).length;
  const languages = Array.from(new Set(books.map((b) => b.language)));

  const stats = [
    { icon: BookOpen, label: t("nav.library"), value: `${books.length}` },
    { icon: Headphones, label: t("nav.audio"), value: `${audioCount}` },
    { icon: Languages, label: t("settings.language"), value: `${languages.length}` },
    { icon: LibraryIcon, label: "Volumes", value: "8" },
  ];

  const langGroups = [
    { code: "en", label: t("library.lang.english") },
    { code: "ar", label: t("library.lang.arabic") },
    { code: "fr", label: t("library.lang.french") },
  ];

  return (
    <div className="desktop-surface hidden lg:block bg-background">
      {/* Stats */}
      <section className="py-16 border-b border-border/60">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-4 divide-x divide-border/60">
            {stats.map((stat) => (
              <div key={stat.label} className="flex flex-col items-center text-center px-6">
                <stat.icon className="h-5 w-5 text-accent mb-4" strokeWidth={1.5} />
                <p className="font-display text-5xl font-semibold text-foreground leading-none mb-3">
                  {stat.value}
                </p>
                <p className="text-[11px] text-muted-foreground tracking-[0.25em] uppercase">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Books */}
      <section className="py-20 container mx-auto px-6">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-accent text-sm font-medium tracking-[0.2em] uppercase mb-2">
              Collection
            </p>
            <h2 className="font-display text-4xl font-bold text-foreground">
              Featured Books
            </h2>
          </div>
          <Link
            to="/library"
            className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
          >
            {t("common.seeAll")} →
          </Link>
        </div>
        <div className="grid grid-cols-4 gap-8">
          {featured.map((book, i) => (
            <BookCard key={book.id} book={book} index={i} />
          ))}
        </div>
      </section>

      {/* Browse by language */}
      <section className="py-20 bg-card">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <p className="text-accent text-sm font-medium tracking-[0.2em] uppercase mb-2">
              Browse by
            </p>
            <h2 className="font-display text-4xl font-bold text-foreground">
              Language
            </h2>
          </div>
          <div className="grid grid-cols-3 gap-6 max-w-4xl mx-auto">
            {langGroups.map((g) => {
              const count = books.filter((b) => b.language === g.code).length;
              return (
                <Link
                  key={g.code}
                  to={`/library?lang=${g.code}`}
                  className="group flex flex-col items-center gap-3 p-8 rounded-2xl bg-background border border-border hover:border-accent hover:shadow-lg transition-all duration-300"
                >
                  <span className="font-display text-2xl font-semibold text-foreground group-hover:text-primary transition-colors">
                    {g.label}
                  </span>
                  <span className="text-sm text-muted-foreground">{count} books</span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Quote slider */}
      <section className="py-24 bg-gradient-emerald">
        <div className="container mx-auto px-6 text-center max-w-3xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={quoteIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.5 }}
            >
              <p className="font-serif text-2xl md:text-3xl text-primary-foreground italic leading-relaxed mb-6">
                "{quotes[quoteIndex].text}"
              </p>
              <p className="text-[hsl(40_70%_78%)] text-sm font-medium tracking-wide">
                — {quotes[quoteIndex].author}
              </p>
            </motion.div>
          </AnimatePresence>
          <div className="flex justify-center gap-2 mt-10">
            {quotes.map((_, i) => (
              <button
                key={i}
                onClick={() => setQuoteIndex(i)}
                aria-label={`Quote ${i + 1}`}
                className={`h-2 rounded-full transition-all ${
                  i === quoteIndex
                    ? "bg-[hsl(var(--gold))] w-8"
                    : "bg-primary-foreground/30 w-2"
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-14">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-3 gap-12 mb-10">
            <div>
              <Link to="/" className="flex items-center gap-2 mb-4">
                <BookOpen className="h-5 w-5 text-primary" />
                <span className="font-display text-lg font-bold text-foreground">
                  Fayda<span className="text-primary">book</span>
                </span>
              </Link>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {t("app.metaDescription")}
              </p>
            </div>
            <div>
              <h4 className="font-display font-semibold text-foreground mb-4">
                {t("nav.library")}
              </h4>
              <div className="space-y-2">
                {[
                  { to: "/", label: t("nav.home") },
                  { to: "/library", label: t("nav.library") },
                  { to: "/audio", label: t("nav.audio") },
                  { to: "/settings", label: t("nav.settings") },
                ].map((l) => (
                  <Link
                    key={l.to}
                    to={l.to}
                    className="block text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {l.label}
                  </Link>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-display font-semibold text-foreground mb-4">
                {t("settings.language")}
              </h4>
              <div className="space-y-2">
                {langGroups.map((g) => (
                  <Link
                    key={g.code}
                    to={`/library?lang=${g.code}`}
                    className="block text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {g.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
          <div className="border-t border-border pt-6 text-center">
            <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
              Made with <Heart className="h-3 w-3 text-accent" /> for the Tijānī community ·
              Faydabook © {new Date().getFullYear()}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default DesktopHomeSections;
