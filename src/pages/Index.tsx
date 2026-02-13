import { useState } from "react";
import { motion } from "framer-motion";
import { books } from "@/data/books";
import BookCard from "@/components/BookCard";
import SearchBar from "@/components/SearchBar";

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const continueReading = books.filter((b) => b.progress !== undefined);
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
          transition={{ duration: 0.5 }}
        >
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

      {/* Continue Reading */}
      {continueReading.length > 0 && !searchQuery && (
        <section className="mb-8">
          <h2 className="text-gold font-serif text-lg font-semibold px-5 mb-3">
            Continue Reading
          </h2>
          <div className="flex gap-4 overflow-x-auto px-5 pb-2 scrollbar-hide">
            {continueReading.map((book) => (
              <div key={book.id} className="min-w-[140px] max-w-[140px]">
                <BookCard book={book} index={0} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Library Grid */}
      <section className="px-5">
        <h2 className="text-gold font-serif text-lg font-semibold mb-4">
          {searchQuery ? "Search Results" : "Library"}
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 gap-y-6">
          {filteredBooks.map((book, i) => (
            <BookCard key={book.id} book={book} index={i} />
          ))}
        </div>
        {filteredBooks.length === 0 && (
          <p className="text-center text-muted-foreground py-12">
            No books found
          </p>
        )}
      </section>
    </div>
  );
};

export default Index;
