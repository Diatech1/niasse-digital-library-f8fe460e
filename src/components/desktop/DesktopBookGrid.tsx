import { Link } from "react-router-dom";
import type { Book } from "@/data/books";

const DesktopBookGrid = ({ books, columns = 5 }: { books: Book[]; columns?: number }) => {
  const colsClass =
    columns === 6
      ? "lg:grid-cols-6"
      : columns === 4
      ? "lg:grid-cols-4"
      : "lg:grid-cols-5";
  return (
    <div className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 ${colsClass} gap-x-6 gap-y-10`}>
      {books.map((book) => (
        <Link key={book.id} to={`/desktop/book/${book.id}`} className="group">
          <div className="overflow-hidden rounded-md border-l-[3px] border-l-black/10 shadow-[6px_6px_18px_rgba(0,0,0,0.25),_1px_1px_3px_rgba(0,0,0,0.2)] transition-transform duration-300 group-hover:-translate-y-1">
            <img
              src={book.cover}
              alt={book.title}
              loading="lazy"
              className="aspect-[2/3] w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            />
          </div>
          <h3 className="mt-3 font-serif text-sm font-semibold leading-snug line-clamp-2">
            {book.title}
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{book.author}</p>
        </Link>
      ))}
    </div>
  );
};

export default DesktopBookGrid;
