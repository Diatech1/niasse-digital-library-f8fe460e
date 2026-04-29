import { useBooks } from "@/hooks/use-books";
import DesktopHero from "@/components/desktop/DesktopHero";
import DesktopBookGrid from "@/components/desktop/DesktopBookGrid";
import DesktopQuoteSlider from "@/components/desktop/DesktopQuoteSlider";
import { Link } from "react-router-dom";

const DesktopHome = () => {
  const { books, isLoading } = useBooks();
  const featured = books.filter((b) => b.isFavorite).slice(0, 6);
  const recent = books.slice(0, 10);

  return (
    <>
      <DesktopHero />

      {!isLoading && featured.length > 0 && (
        <section className="mx-auto max-w-7xl px-8 py-20">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="font-serif italic text-xs uppercase tracking-[0.3em] text-primary mb-2">
                Curated
              </p>
              <h2 className="font-serif text-3xl md:text-4xl font-bold">Featured Works</h2>
            </div>
            <Link to="/desktop/library" className="text-sm text-primary hover:underline">
              Browse all →
            </Link>
          </div>
          <DesktopBookGrid books={featured} columns={6} />
        </section>
      )}

      <DesktopQuoteSlider />

      {!isLoading && (
        <section className="mx-auto max-w-7xl px-8 py-20">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="font-serif italic text-xs uppercase tracking-[0.3em] text-primary mb-2">
                The Library
              </p>
              <h2 className="font-serif text-3xl md:text-4xl font-bold">Recent Additions</h2>
            </div>
            <Link to="/desktop/library" className="text-sm text-primary hover:underline">
              See all →
            </Link>
          </div>
          <DesktopBookGrid books={recent} columns={5} />
        </section>
      )}
    </>
  );
};

export default DesktopHome;
