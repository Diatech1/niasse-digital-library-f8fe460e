import { motion } from "framer-motion";
import { Book } from "@/data/books";
import { useNavigate } from "react-router-dom";
import { Headphones, Globe } from "lucide-react";

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
      <div className="relative overflow-hidden rounded-lg aspect-[2/3] mb-3">
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
        {book.hasAudio && (
          <div className="absolute top-2 right-2 p-1.5 rounded-full glass">
            <Headphones className="w-3 h-3 text-primary" />
          </div>
        )}
      </div>
      <h3 className="font-serif text-xs sm:text-sm font-medium leading-tight line-clamp-2 text-foreground">
        {book.title}
      </h3>
      <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 sm:mt-1">{book.author}</p>
      <div className="flex items-center gap-1 mt-1">
        <Globe className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-muted-foreground" />
        <span className="text-[10px] sm:text-xs text-muted-foreground">{book.language}</span>
      </div>
    </motion.div>
  );
};

export default BookCard;
