import { motion } from "framer-motion";
import { Book } from "@/data/books";
import { useNavigate } from "react-router-dom";
import { Headphones } from "lucide-react";

interface BookCardProps {
  book: Book;
  index: number;
}

const BookCard = ({ book, index }: BookCardProps) => {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      className="cursor-pointer group"
      onClick={() => navigate(`/book/${book.id}`)}
    >
      <div className="relative overflow-hidden rounded-[6px] aspect-[2/3] mb-3 shadow-[4px_4px_10px_rgba(0,0,0,0.3),_1px_1px_3px_rgba(0,0,0,0.2)] border-l-[3px] border-l-black/10">
        {/* Page edge effect on right side */}
        <div className="absolute top-0 right-0 bottom-0 w-[6px] z-10 pointer-events-none"
          style={{
            background: 'linear-gradient(to left, rgba(0,0,0,0.08) 0%, rgba(255,255,255,0.15) 30%, rgba(0,0,0,0.05) 60%, transparent 100%)',
            boxShadow: 'inset -2px 0 3px rgba(0,0,0,0.1)',
          }}
        />
        <img
          src={book.cover}
          alt={book.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {book.progress !== undefined && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-muted">
            <div
              className="h-full bg-primary transition-all"
              style={{ width: `${book.progress}%` }}
            />
          </div>
        )}
        <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded text-[8px] sm:text-[9px] font-semibold uppercase tracking-wider bg-primary text-primary-foreground">
          {book.language}
        </div>
      </div>
      <h3 className="font-serif text-xs sm:text-sm font-medium leading-tight line-clamp-2 text-foreground">
        {book.title}
      </h3>
      <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 sm:mt-1">{book.author}</p>
    </motion.div>
  );
};

export default BookCard;
