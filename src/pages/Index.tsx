import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { books } from "@/data/books";
import BookCard from "@/components/BookCard";
import SearchBar from "@/components/SearchBar";
import { getSavedProgress } from "@/hooks/use-reading-progress";


const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  // Books with real saved progress from localStorage
  const continueReading = useMemo(() =>
  books.
  map((b) => ({ book: b, idx: getSavedProgress(b.id) })).
  filter(({ idx }) => idx > 0).
  sort((a, b) => b.idx - a.idx), // most-advanced first
  []
  );

  const favorites = books.filter((b) => b.isFavorite);
  const filteredBooks = books.filter(
    (b) =>
    b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="px-5 pt-12 pb-4">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}>

          <h1 className="text-2xl font-serif font-bold text-foreground">
            Fayda<span className="text-primary">book</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            The Digital Library of Medina Baye
          </p>
        </motion.div>
      </div>

      {/* Search */}
      <div className="px-5 mb-6">
        <SearchBar onSearch={setSearchQuery} />
      </div>

      {/* Continue Reading — real progress from localStorage */}
      {continueReading.length > 0 && !searchQuery &&
      <motion.section
        className="mb-8"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}>

          <h2 className="text-gold font-serif text-lg font-semibold px-5 mb-3 flex items-center gap-2">
            
            Continue Reading
          </h2>
          <div className="flex gap-4 px-5 overflow-x-auto scrollbar-hide">
            {continueReading.map(({ book, idx }) => {
            const progress = book.pages > 0 ? Math.round(idx / book.pages * 100) : 0;
            return (
              <motion.div
                key={book.id}
                className="cursor-pointer min-w-[28%] max-w-[28%]"
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate(`/read/${book.id}`)}>

                  <div className="relative rounded-[6px] overflow-hidden shadow-[4px_4px_10px_rgba(0,0,0,0.3),_1px_1px_3px_rgba(0,0,0,0.2)] border-l-[3px] border-l-black/10">
                    <img
                    src={book.cover}
                    alt={book.title}
                    className="w-full aspect-[2/3] object-cover" />

                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent px-1.5 pt-3 pb-1.5">
                      <div className="h-0.5 bg-white/30 rounded-full">
                        <div
                        className="h-full bg-primary rounded-full transition-all"
                        style={{ width: `${Math.min(progress, 100)}%` }} />

                      </div>
                      <p className="text-white text-[8px] mt-0.5 opacity-80">
                        {Math.min(progress, 100)}%
                      </p>
                    </div>
                  </div>
                  <p className="text-xs font-medium mt-1.5 line-clamp-2 leading-tight">{book.title}</p>
                </motion.div>);

          })}
          </div>
        </motion.section>
      }

      {/* Favorites */}
      {favorites.length > 0 && !searchQuery &&
      <section className="mb-8">
          <h2 className="text-gold font-serif text-lg font-semibold px-5 mb-3">
            Favorites
          </h2>
          <div className="flex gap-4 px-5 overflow-x-auto scrollbar-hide">
            {favorites.map((book, i) =>
          <div key={book.id} className="min-w-[28%] max-w-[28%]">
            <BookCard book={book} index={i} />
          </div>
          )}
          </div>
        </section>
      }

      {/* Library Grid */}
      <section className="px-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-gold font-serif text-lg font-semibold">
            {searchQuery ? "Search Results" : "Library"}
          </h2>
          {!searchQuery && (
            <button
              onClick={() => navigate("/library")}
              className="text-sm text-primary font-medium hover:underline"
            >
              See All
            </button>
          )}
        </div>
        <div className="grid grid-cols-3 gap-4 gap-y-5">
          {(searchQuery ? filteredBooks : filteredBooks.slice(0, 6)).map((book, i) =>
          <BookCard key={book.id} book={book} index={i} />
          )}
        </div>
        {filteredBooks.length === 0 &&
        <p className="text-center text-muted-foreground py-12">
            No books found
          </p>
        }
      </section>
    </div>);

};

export default Index;