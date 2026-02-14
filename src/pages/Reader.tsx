import { useState, useRef, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { books } from "@/data/books";
import { ruhAlAdabVerses, ruhAlAdabMeta } from "@/data/ruh-al-adab";
import { comprendreFaydhahSections, comprendreFaydhahMeta } from "@/data/comprendre-faydhah";
import { kachifulAlbasSections, kachifulAlbasMeta } from "@/data/kachiful-albas";
import { ArrowLeft, Search, Type, List, X } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";

const themes = [
  { name: "Light", bg: "bg-[hsl(40,20%,95%)]", text: "text-[hsl(0,0%,15%)]" },
  { name: "Sepia", bg: "bg-[hsl(37,30%,88%)]", text: "text-[hsl(25,20%,20%)]" },
  { name: "Dark", bg: "bg-[hsl(220,15%,15%)]", text: "text-[hsl(40,10%,85%)]" },
  { name: "Midnight", bg: "bg-[hsl(240,20%,8%)]", text: "text-[hsl(40,10%,80%)]" },
];

const fonts = ["Sans", "Serif", "Arabic"];

const sampleTextEn = `In the name of Allah, the Most Merciful, the Most Compassionate.

Knowledge is not merely an accumulation of facts, but a gateway to wisdom, a serene space for contemplation and learning. The teachings of Shaykh Ibrahim Niass, a beacon of light and guidance, deserved a vessel that mirrored their profound beauty and clarity.

The seeker must approach the path with sincerity and devotion, for the journey of the soul is one of both inward purification and outward service. In every moment of remembrance, the heart finds its true home, and the spirit soars beyond the confines of the material world.

Let the words of the righteous ones guide your steps, for they have walked the path before you and left behind lanterns of wisdom for those who follow.`;

const sampleTextAr = `بسم الله الرحمن الرحيم. الحمد لله رب العالمين، والصلاة والسلام على سيدنا محمد وعلى آله وصحبه أجمعين. إن المعرفة نور يهدي إلى الحق، وبها ترتقي الأمم وتسمو الأرواح.`;

const Reader = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const book = books.find((b) => b.id === id);
  const [themeIdx, setThemeIdx] = useState(2);
  const [fontIdx, setFontIdx] = useState(1);
  const [fontSize, setFontSize] = useState(16);
  const [showSettings, setShowSettings] = useState(false);
  const [tocOpen, setTocOpen] = useState(false);
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const theme = themes[themeIdx];

  const tocItems = useMemo(() => {
    if (book?.contentModule === "comprendre-faydhah") {
      const chapters: { chapter: string; sections: { id: string; heading: string }[] }[] = [];
      comprendreFaydhahSections.forEach((s) => {
        const last = chapters[chapters.length - 1];
        if (!last || last.chapter !== s.chapter) {
          chapters.push({ chapter: s.chapter, sections: [{ id: s.id, heading: s.heading }] });
        } else {
          last.sections.push({ id: s.id, heading: s.heading });
        }
      });
      return chapters;
    }
    if (book?.contentModule === "kachiful-albas") {
      const chapters: { chapter: string; sections: { id: string; heading: string }[] }[] = [];
      kachifulAlbasSections.forEach((s) => {
        const key = `${s.part} — ${s.chapter}`;
        const last = chapters[chapters.length - 1];
        if (!last || last.chapter !== key) {
          chapters.push({ chapter: key, sections: [{ id: s.id, heading: s.heading }] });
        } else {
          last.sections.push({ id: s.id, heading: s.heading });
        }
      });
      return chapters;
    }
    return [];
  }, [book?.contentModule]);
  const fontClass = fontIdx === 0 ? "font-sans" : fontIdx === 1 ? "font-serif" : "font-arabic";

  if (!book) return null;

  return (
    <div className={`min-h-screen ${theme.bg} ${theme.text} transition-colors duration-300`}>
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/20">
        <button onClick={() => navigate(-1)} className="p-2">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          <button onClick={() => setFontSize(Math.max(12, fontSize - 2))} className="px-2 py-1 text-sm font-medium">A-</button>
          <input
            type="range"
            min={12}
            max={28}
            value={fontSize}
            onChange={(e) => setFontSize(Number(e.target.value))}
            className="w-20 accent-primary"
          />
          <button onClick={() => setFontSize(Math.min(28, fontSize + 2))} className="px-2 py-1 text-sm font-bold">A+</button>
        </div>
      </div>

      {/* Font selector */}
      <div className="flex items-center justify-center gap-2 py-3 border-b border-border/20">
        {fonts.map((f, i) => (
          <button
            key={f}
            onClick={() => setFontIdx(i)}
            className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
              i === fontIdx
                ? "bg-primary text-primary-foreground"
                : "bg-muted/30 text-muted-foreground"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Theme selector */}
      <div className="flex items-center justify-center gap-4 py-3 border-b border-border/20">
        <span className="text-xs text-muted-foreground mr-2">Theme</span>
        {themes.map((t, i) => (
          <button
            key={t.name}
            onClick={() => setThemeIdx(i)}
            className={`w-8 h-8 rounded-full border-2 transition-all ${t.bg} ${
              i === themeIdx ? "border-primary scale-110" : "border-transparent"
            }`}
          />
        ))}
      </div>

      {/* Reading content */}
      <div className={`px-6 py-8 max-w-2xl mx-auto ${fontClass} leading-relaxed`} style={{ fontSize }}>
        {book.contentModule === "ruh-al-adab" ? (
          <>
            <h2 className="text-center font-serif font-bold mb-1" style={{ fontSize: fontSize }}>{ruhAlAdabMeta.title}</h2>
            <p className="text-center text-sm text-muted-foreground mb-1">{ruhAlAdabMeta.subtitle}</p>
            <p className="text-center text-xs text-muted-foreground mb-1">Author: {ruhAlAdabMeta.author}</p>
            <p className="text-center text-xs text-muted-foreground mb-6">Transliterated by: {ruhAlAdabMeta.transliteratedBy}</p>
            <div className="space-y-3">
              {ruhAlAdabVerses.map((v) => (
                <p key={v.number}>
                  <span className="text-primary font-semibold mr-2">{v.number}</span>
                  {v.text}
                </p>
              ))}
            </div>
            <p className="text-center font-semibold mt-8">{ruhAlAdabMeta.closing}</p>
          </>
        ) : book.contentModule === "comprendre-faydhah" ? (
          <>
            <h2 className="text-center font-serif font-bold mb-1" style={{ fontSize: fontSize }}>{comprendreFaydhahMeta.title}</h2>
            <p className="text-center text-sm text-muted-foreground mb-1">par {comprendreFaydhahMeta.author}</p>
            <p className="text-center text-xs text-muted-foreground mb-6">Traduit par : {comprendreFaydhahMeta.translator}</p>
            <div className="space-y-8">
              {comprendreFaydhahSections.map((section, idx) => (
              <div key={section.id} ref={(el) => { sectionRefs.current[section.id] = el; }}>
                  {(idx === 0 || comprendreFaydhahSections[idx - 1].chapter !== section.chapter) && (
                    <h3 className="text-center font-serif font-bold text-primary mb-4 mt-6" style={{ fontSize: fontSize }}>{section.chapter}</h3>
                  )}
                  <h4 className="font-serif font-semibold mb-3" style={{ fontSize: fontSize }}>{section.heading}</h4>
                  {section.content.split("\n\n").map((para, pIdx) => (
                    <p key={pIdx} className="mb-3 text-justify">{para}</p>
                  ))}
                </div>
              ))}
            </div>
          </>
        ) : book.contentModule === "kachiful-albas" ? (
          <>
            <h2 className="text-center font-serif font-bold mb-1" style={{ fontSize: fontSize }}>{kachifulAlbasMeta.title}</h2>
            <p className="text-center text-sm text-muted-foreground mb-1">{kachifulAlbasMeta.subtitle}</p>
            <p className="text-center text-xs text-muted-foreground mb-1">par {kachifulAlbasMeta.author}</p>
            <p className="text-center text-xs text-muted-foreground mb-6">Traduit par : {kachifulAlbasMeta.translators}</p>
            <div className="space-y-8">
              {kachifulAlbasSections.map((section, idx) => {
                const key = `${section.part} — ${section.chapter}`;
                const prevKey = idx > 0 ? `${kachifulAlbasSections[idx - 1].part} — ${kachifulAlbasSections[idx - 1].chapter}` : "";
                return (
                  <div key={section.id} ref={(el) => { sectionRefs.current[section.id] = el; }}>
                    {(idx === 0 || prevKey !== key) && (
                      <>
                        {(idx === 0 || kachifulAlbasSections[idx - 1].part !== section.part) && (
                          <h3 className="text-center font-serif font-bold text-primary mb-2 mt-8 uppercase tracking-wider" style={{ fontSize: fontSize }}>{section.part}</h3>
                        )}
                        <h4 className="text-center font-serif font-semibold text-primary/80 mb-4 mt-4" style={{ fontSize: fontSize * 0.9 }}>{section.chapter}</h4>
                      </>
                    )}
                    <h5 className="font-serif font-semibold mb-3" style={{ fontSize: fontSize }}>{section.heading}</h5>
                    {section.content.split("\n\n").map((para, pIdx) => (
                      <p key={pIdx} className="mb-3 text-justify">{para}</p>
                    ))}
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <>
            <p className="mb-6">{sampleTextEn}</p>
            <p className="font-arabic text-right mb-6" dir="rtl">{sampleTextAr}</p>
          </>
        )}
      </div>

      {/* Bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 border-t border-border/20 bg-inherit">
        <div className="flex items-center justify-between px-6 py-2 text-xs text-muted-foreground">
          <span>Page 15 of {book.pages}</span>
          <span>5%</span>
        </div>
        <div className="h-1 bg-muted/30 mx-6 mb-2 rounded-full">
          <div className="h-full w-[5%] bg-primary rounded-full" />
        </div>
        <div className="flex items-center justify-around py-2 pb-safe">
          <button className="p-2" onClick={() => setTocOpen(true)}><List className="w-5 h-5 text-muted-foreground" /></button>

          {/* TOC Sheet */}
          <Sheet open={tocOpen} onOpenChange={setTocOpen}>
            <SheetContent side="left" className={`${theme.bg} ${theme.text} w-[85%] sm:max-w-sm p-0`}>
              <SheetHeader className="px-4 pt-4 pb-2 border-b border-border/20">
                <SheetTitle className={theme.text}>Table des matières</SheetTitle>
              </SheetHeader>
              <ScrollArea className="h-[calc(100vh-60px)]">
                <div className="px-4 py-3 space-y-4">
                  {tocItems.map((ch) => (
                    <div key={ch.chapter}>
                      <p className="text-xs font-bold text-primary uppercase tracking-wider mb-2">{ch.chapter}</p>
                      <div className="space-y-1">
                        {ch.sections.map((s) => (
                          <button
                            key={s.id}
                            onClick={() => {
                              setTocOpen(false);
                              setTimeout(() => {
                                sectionRefs.current[s.id]?.scrollIntoView({ behavior: "smooth", block: "start" });
                              }, 300);
                            }}
                            className="block w-full text-left text-sm py-1.5 px-2 rounded hover:bg-primary/10 transition-colors"
                          >
                            {s.heading}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                  {tocItems.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-8">Pas de table des matières disponible.</p>
                  )}
                </div>
              </ScrollArea>
            </SheetContent>
          </Sheet>
          <button className="p-2"><Search className="w-5 h-5 text-muted-foreground" /></button>
          <button className="p-2"><Type className="w-5 h-5 text-muted-foreground" /></button>
        </div>
      </div>
    </div>
  );
};

export default Reader;
