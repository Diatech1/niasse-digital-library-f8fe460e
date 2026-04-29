import { Search } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const DesktopHero = () => {
  const [q, setQ] = useState("");
  const navigate = useNavigate();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/desktop/library?q=${encodeURIComponent(q)}`);
  };

  return (
    <section className="relative overflow-hidden border-b border-border/40">
      <div
        aria-hidden
        className="absolute inset-0 -z-10 opacity-60"
        style={{
          background:
            "radial-gradient(1200px 500px at 20% 0%, hsl(var(--primary) / 0.18), transparent 60%), radial-gradient(900px 500px at 90% 20%, hsl(var(--accent) / 0.18), transparent 60%)",
        }}
      />
      <div className="mx-auto max-w-7xl px-8 py-24 md:py-32 text-center">
        <p className="font-serif italic text-sm uppercase tracking-[0.3em] text-primary mb-6">
          The Flood of Grace
        </p>
        <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl font-bold leading-tight tracking-tight">
          A Living Library of the
          <br />
          <span className="text-primary">Tijāniyyah</span>
        </h1>
        <p className="mt-6 max-w-2xl mx-auto text-lg text-muted-foreground">
          Read, listen, and study the works of Cheikh Ibrahim Niass and the masters of the Faydah —
          beautifully typeset, fully searchable, available in English, French, and Arabic.
        </p>

        <form
          onSubmit={submit}
          className="mt-10 mx-auto max-w-xl flex items-center gap-2 rounded-full border border-border/60 bg-card/60 backdrop-blur px-2 py-2 shadow-lg"
        >
          <Search className="ml-3 h-4 w-4 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search books, authors, themes…"
            className="flex-1 bg-transparent px-2 py-2 text-sm outline-none placeholder:text-muted-foreground"
          />
          <button
            type="submit"
            className="rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90"
          >
            Search
          </button>
        </form>
      </div>
    </section>
  );
};

export default DesktopHero;
