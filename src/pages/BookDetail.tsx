import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, MoreHorizontal, Globe, FileText, BookOpen, Headphones } from "lucide-react";
import { useBook } from "@/hooks/use-books";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

const BookDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { book, isLoading } = useBook(id);

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
        <p className="text-muted-foreground">Book not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24 relative">
      <div
        className="absolute inset-0 h-[60vh] gradient-cover z-0"
        style={{
          backgroundImage: `linear-gradient(180deg, hsl(155 40% 20% / 0.3) 0%, hsl(var(--background)) 100%)`,
        }}
      />

      <div className="relative z-10 flex items-center justify-between px-5 pt-12 pb-4">
        <button onClick={() => navigate(-1)} className="p-2 rounded-full glass">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <button className="p-2 rounded-full glass">
          <MoreHorizontal className="w-5 h-5 text-foreground" />
        </button>
      </div>

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
        <h1 className="text-xl font-serif font-bold text-foreground mb-1">{book.title}</h1>
        {book.titleAr && <p className="font-arabic text-lg text-gold mb-2">{book.titleAr}</p>}
        <p className="text-sm text-primary mb-4">{book.author}</p>

        <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground mb-4">
          <span className="flex items-center gap-1"><Globe className="w-3.5 h-3.5" />{book.language}</span>
          <span className="flex items-center gap-1"><FileText className="w-3.5 h-3.5" />{book.pages} Pages</span>
        </div>

        <p className="text-sm text-muted-foreground leading-relaxed mb-5 max-w-md mx-auto">{book.description}</p>

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
            <BookOpen className="w-4 h-4" />Read Book
          </button>
          {book.hasAudio && (
            <button
              onClick={() => navigate(`/listen/${book.id}`)}
              className="flex items-center justify-center gap-2 border border-primary text-primary rounded-xl py-3.5 font-semibold text-sm transition-all hover:bg-primary/10"
            >
              <Headphones className="w-4 h-4" />Listen to Audio
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default BookDetail;
