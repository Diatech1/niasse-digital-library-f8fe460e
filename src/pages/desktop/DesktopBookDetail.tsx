import { Link, useParams } from "react-router-dom";
import { useBook } from "@/hooks/use-books";
import { BookOpen, Headphones, Heart, ArrowLeft } from "lucide-react";

const DesktopBookDetail = () => {
  const { id } = useParams();
  const { book, isLoading } = useBook(id);

  if (isLoading) {
    return <div className="mx-auto max-w-7xl px-8 py-20 text-muted-foreground">Loading…</div>;
  }
  if (!book) {
    return (
      <div className="mx-auto max-w-7xl px-8 py-20">
        <p className="text-muted-foreground">Book not found.</p>
        <Link to="/desktop/library" className="text-primary hover:underline">
          ← Back to library
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-8 py-12">
      <Link
        to="/desktop/library"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-10"
      >
        <ArrowLeft className="h-4 w-4" /> Back to library
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-[320px_1fr] gap-12">
        <div>
          <div className="overflow-hidden rounded-md border-l-[3px] border-l-black/10 shadow-[8px_8px_24px_rgba(0,0,0,0.3),_1px_1px_3px_rgba(0,0,0,0.2)]">
            <img src={book.cover} alt={book.title} className="w-full aspect-[2/3] object-cover" />
          </div>
        </div>
        <div>
          <p className="font-serif italic text-xs uppercase tracking-[0.3em] text-primary mb-3">
            {book.tags[0] ?? "Spiritual Work"}
          </p>
          <h1 className="font-serif text-4xl md:text-5xl font-bold leading-tight">
            {book.title}
          </h1>
          {book.titleAr && (
            <p className="mt-2 text-2xl text-muted-foreground" dir="rtl" style={{ fontFamily: "Amiri, serif" }}>
              {book.titleAr}
            </p>
          )}
          <p className="mt-4 text-muted-foreground">
            By <span className="text-foreground">{book.author}</span>
            {book.translator && <> · Translated by {book.translator}</>}
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3 text-xs uppercase tracking-wider text-muted-foreground">
            <span className="rounded-full border border-border/60 px-3 py-1">{book.language}</span>
            <span className="rounded-full border border-border/60 px-3 py-1">{book.pages} pages</span>
            {book.hasAudio && (
              <span className="rounded-full border border-border/60 px-3 py-1">Audio available</span>
            )}
          </div>

          <p className="mt-8 text-base leading-relaxed text-foreground/90 max-w-2xl">
            {book.description}
          </p>

          <div className="mt-10 flex flex-wrap gap-3">
            <Link
              to={`/read/${book.id}`}
              className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:opacity-90 transition"
            >
              <BookOpen className="h-4 w-4" /> Read now
            </Link>
            {book.hasAudio && (
              <Link
                to={`/listen/${book.id}`}
                className="inline-flex items-center gap-2 rounded-full border border-border/60 px-6 py-3 text-sm font-medium hover:border-primary hover:text-primary transition"
              >
                <Headphones className="h-4 w-4" /> Listen
              </Link>
            )}
            <button className="inline-flex items-center gap-2 rounded-full border border-border/60 px-6 py-3 text-sm font-medium hover:border-primary hover:text-primary transition">
              <Heart className="h-4 w-4" /> Favorite
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DesktopBookDetail;
