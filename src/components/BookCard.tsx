import { motion } from "framer-motion";
import { Book } from "@/data/books";
import { useNavigate } from "react-router-dom";

interface BookCardProps {
  book: Book;
  index: number;
  size?: "default" | "compact";
}

const BookCard = ({ book, index, size = "default" }: BookCardProps) => {
  const navigate = useNavigate();
  const isCompact = size === "compact";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      className="cursor-pointer group"
      onClick={() => navigate(`/book/${book.id}`)}
    >
      <div className={`relative overflow-hidden rounded-[6px] aspect-[2/3] shadow-[4px_4px_10px_rgba(0,0,0,0.3),_1px_1px_3px_rgba(0,0,0,0.2)] border-l-[3px] border-l-black/10 ${isCompact ? "mb-2" : "mb-3"}`}>
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
        <div className="absolute top-1.5 right-1.5 px-1 py-[1px] rounded text-[6px] sm:text-[7px] font-semibold uppercase tracking-wider bg-primary text-primary-foreground">
          {book.language}
        </div>
      </div>
      <h3 className={`font-serif font-medium leading-tight line-clamp-2 text-foreground ${isCompact ? "text-[11px]" : "text-xs sm:text-sm"}`}>
        {book.title}
      </h3>
      <p className={`text-muted-foreground ${isCompact ? "text-[10px] mt-0.5" : "text-[10px] sm:text-xs mt-0.5 sm:mt-1"}`}>
        {book.author}
      </p>
    </motion.div>
  );
};

export default BookCard;
