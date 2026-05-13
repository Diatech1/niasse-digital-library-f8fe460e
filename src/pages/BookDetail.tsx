import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, MoreHorizontal, Globe, FileText, BookOpen, Headphones, ListOrdered, ChevronRight } from "lucide-react";
import { useBook } from "@/hooks/use-books";
import { useBookContent } from "@/hooks/use-book-content";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { directionForBookLanguage, useLanguage } from "@/hooks/use-language";
import SEO from "@/components/SEO";

interface SectionsListProps {
  bookId: string;
  contentModule?: string;
  language: string;
  variant?: "mobile" | "desktop";
}

const SectionsList = ({ bookId, contentModule, language, variant = "desktop" }: SectionsListProps) => {
  const navigate = useNavigate();
  const { sections, isLoading } = useBookContent(contentModule);
  const dir = directionForBookLanguage(language);

  if (!contentModule) return null;
  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
      </div>
    );
  }
  if (sections.length <= 1) return null;

  // Group by chapter to dedupe long lists; for the volume-loader format,
  // each section is its own chapter so we just list them.
  const items = sections.map((s, idx) => ({
    idx,
    label: s.heading || s.chapter || `Section ${idx + 1}`,
  }));

  return (
    <div className={variant === "mobile" ? "px-5 mt-2 max-w-md mx-auto text-left" : "mt-10"}>
      <div className="flex items-center gap-2 mb-3">
        <ListOrdered className="w-4 h-4 text-primary" />
        <h2 className="text-sm font-semibold tracking-wide uppercase text-foreground/80">
          Sections <span className="text-muted-foreground font-normal normal-case">({items.length})</span>
        </h2>
      </div>
      <ol className="rounded-xl border border-border/40 overflow-hidden divide-y divide-border/30 bg-card/40">
        {items.map((it) => (
          <li key={it.idx}>
            <button
              onClick={() => navigate(`/read/${bookId}?section=${it.idx}`)}
              className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-primary/5 transition-colors"
              dir={dir}
            >
              <span className="text-xs font-mono text-muted-foreground tabular-nums w-6 text-right shrink-0">
                {it.idx + 1}
              </span>
              <span className="flex-1 text-sm text-foreground leading-snug truncate">
                {it.label}
              </span>
              <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
            </button>
          </li>
        ))}
      </ol>
    </div>
  );
};


const BookDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { book, isLoading } = useBook(id);
  const { t } = useLanguage();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center pt-32 gap-4">
        <Skeleton className="w-48 aspect-[2/3] rounded-lg" />
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-4 w-32" />
      </div>
    );
  }

  if (!book) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">{t("common.bookNotFound")}</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background pb-24 lg:pb-12 relative">
      <SEO
        title={`${book.title} — Faydabook`}
        description={book.description?.slice(0, 155) || `${book.title} par ${book.author}.`}
        path={`/book/${book.id}`}
        type="book"
        image={book.cover}
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "Book",
          name: book.title,
          author: { "@type": "Person", name: book.author },
          inLanguage: book.language,
          numberOfPages: book.pages,
          description: book.description,
          image: book.cover,
          url: `https://faydabook.com/book/${book.id}`,
          ...(book.translator
            ? { translator: { "@type": "Person", name: book.translator } }
            : {}),
        }}
      />
      <div
        className="absolute inset-0 h-[60vh] gradient-cover z-0 lg:hidden"
        style={{
          backgroundImage: `linear-gradient(180deg, hsl(155 40% 20% / 0.3) 0%, hsl(var(--background)) 100%)`,
        }}
      />

      {/* Mobile top actions */}
      <div className="relative z-10 flex items-center justify-between px-5 pt-12 pb-4 lg:hidden">
        <button onClick={() => navigate(-1)} className="p-2 rounded-full glass">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <button className="p-2 rounded-full glass">
          <MoreHorizontal className="w-5 h-5 text-foreground" />
        </button>
      </div>

      {/* ─── Mobile layout ─── */}
      <div className="lg:hidden">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="relative z-10 flex justify-center px-5 mb-6"
        >
          <div className="w-48 aspect-[2/3] rounded-[6px] overflow-hidden shadow-glow">
            <img src={book.cover} alt={book.title} className="w-full h-full object-cover" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="relative z-10 px-5 text-center"
        >
          <h1
            className="text-xl font-serif font-bold text-foreground mb-1"
            dir={directionForBookLanguage(book.language)}
          >
            {book.title}
          </h1>
          {book.titleAr && <p className="font-arabic text-lg text-gold mb-2" dir="rtl">{book.titleAr}</p>}
          <p className="text-sm text-primary mb-1">{book.author}</p>
          {book.translator && (
            <p className="text-xs text-muted-foreground mb-4">{t("book.translation")} : {book.translator}</p>
          )}
          {!book.translator && <div className="mb-3" />}

          <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground mb-4">
            <span className="flex items-center gap-1"><Globe className="w-3.5 h-3.5" />{book.language}</span>
            <span className="flex items-center gap-1"><FileText className="w-3.5 h-3.5" />{book.pages} {t("book.pages")}</span>
          </div>

          <p
            className="text-sm text-muted-foreground leading-relaxed mb-5 max-w-md mx-auto"
            dir={directionForBookLanguage(book.language)}
          >
            {book.description}
          </p>

          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {book.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="bg-muted text-muted-foreground border-none rounded-full px-3 py-1 text-xs">
                {tag}
              </Badge>
            ))}
          </div>

          <div className="flex flex-col gap-3 max-w-xs mx-auto">
            <button
              onClick={() => navigate(`/read/${book.id}`)}
              className="flex items-center justify-center gap-2 bg-primary text-primary-foreground rounded-xl py-3.5 font-semibold text-sm transition-all hover:opacity-90"
            >
              <BookOpen className="w-4 h-4" />{t("book.read")}
            </button>
            <button
              onClick={() => navigate(`/listen/${book.id}`)}
              className="flex items-center justify-center gap-2 border border-primary text-primary rounded-xl py-3.5 font-semibold text-sm transition-all hover:bg-primary/10"
            >
              <Headphones className="w-4 h-4" />{t("book.listen")}
            </button>
          </div>
        </motion.div>

        <SectionsList
          bookId={book.id}
          contentModule={book.contentModule}
          language={book.language}
          variant="mobile"
        />
      </div>

      {/* ─── Desktop layout ─── */}
      <div className="hidden lg:block">
        <div className="container mx-auto max-w-6xl px-8 pt-4">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>

          <div className="grid grid-cols-[minmax(0,320px)_minmax(0,1fr)] gap-12 items-start">
            {/* Left: cover + actions (sticky) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="sticky top-24"
            >
              <div className="aspect-[2/3] rounded-[6px] overflow-hidden shadow-glow border-l-[4px] border-l-black/10 mb-6">
                <img src={book.cover} alt={book.title} className="w-full h-full object-cover" />
              </div>
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => navigate(`/read/${book.id}`)}
                  className="flex items-center justify-center gap-2 bg-primary text-primary-foreground rounded-xl py-3.5 font-semibold text-sm transition-all hover:opacity-90"
                >
                  <BookOpen className="w-4 h-4" />{t("book.read")}
                </button>
                {book.hasAudio && (
                  <button
                    onClick={() => navigate(`/listen/${book.id}`)}
                    className="flex items-center justify-center gap-2 border border-primary text-primary rounded-xl py-3.5 font-semibold text-sm transition-all hover:bg-primary/10"
                  >
                    <Headphones className="w-4 h-4" />{t("book.listen")}
                  </button>
                )}
              </div>
            </motion.div>

            {/* Right: metadata + description */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <p className="text-accent text-xs font-medium tracking-[0.2em] uppercase mb-3">
                {book.language}
              </p>
              <h1
                className="font-display text-4xl xl:text-5xl font-bold text-foreground mb-3 leading-tight"
                dir={directionForBookLanguage(book.language)}
              >
                {book.title}
              </h1>
              {book.titleAr && (
                <p className="font-arabic text-2xl text-gold mb-4" dir="rtl">{book.titleAr}</p>
              )}
              <p className="text-lg text-primary font-medium mb-1">{book.author}</p>
              {book.translator && (
                <p className="text-sm text-muted-foreground mb-6">
                  {t("book.translation")} : {book.translator}
                </p>
              )}

              <div className="flex items-center gap-6 text-sm text-muted-foreground mb-8 mt-6">
                <span className="flex items-center gap-2"><Globe className="w-4 h-4" />{book.language}</span>
                <span className="flex items-center gap-2"><FileText className="w-4 h-4" />{book.pages} {t("book.pages")}</span>
              </div>

              <div className="prose prose-neutral dark:prose-invert max-w-none mb-8">
                <p
                  className="text-base text-foreground/85 leading-relaxed"
                  dir={directionForBookLanguage(book.language)}
                >
                  {book.description}
                </p>
              </div>

              {book.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {book.tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="bg-muted text-muted-foreground border-none rounded-full px-3 py-1 text-xs"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}

              <SectionsList
                bookId={book.id}
                contentModule={book.contentModule}
                language={book.language}
                variant="desktop"
              />
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookDetail;
