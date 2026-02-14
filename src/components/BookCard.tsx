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
      <div className="relative overflow-hidden rounded-md aspect-[2/3] mb-3">
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
        <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded text-[8px] sm:text-[9px] font-semibold uppercase tracking-wider glass text-primary">
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
