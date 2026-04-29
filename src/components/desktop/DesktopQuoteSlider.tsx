import { useEffect, useState } from "react";

const QUOTES = [
  {
    text: "The Faydah is the spiritual flood that quenches the thirst of every sincere seeker.",
    author: "Cheikh Ibrāhīm Niass",
  },
  {
    text: "Whoever loves Allah, let him love those whom Allah loves.",
    author: "Cheikh Ahmad al-Tijānī",
  },
  {
    text: "The path is dhikr, sincerity, and the company of the righteous.",
    author: "Tijānī Tradition",
  },
];

const DesktopQuoteSlider = () => {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((n) => (n + 1) % QUOTES.length), 6000);
    return () => clearInterval(t);
  }, []);
  const q = QUOTES[i];
  return (
    <section className="border-y border-border/40 bg-card/40">
      <div className="mx-auto max-w-4xl px-8 py-20 text-center">
        <p className="font-serif text-2xl md:text-3xl italic leading-relaxed">
          “{q.text}”
        </p>
        <p className="mt-6 text-sm uppercase tracking-[0.25em] text-primary">— {q.author}</p>
        <div className="mt-8 flex justify-center gap-2">
          {QUOTES.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setI(idx)}
              className={`h-1.5 rounded-full transition-all ${
                idx === i ? "w-8 bg-primary" : "w-1.5 bg-muted-foreground/40"
              }`}
              aria-label={`Quote ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default DesktopQuoteSlider;
