import { useState, useRef, useMemo, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { books } from "@/data/books";
import { ruhAlAdabVerses, ruhAlAdabMeta } from "@/data/ruh-al-adab";
import { comprendreFaydhahSections, comprendreFaydhahMeta } from "@/data/comprendre-faydhah";
import { loadKachifulAlbasSections, kachifulAlbasMeta, type KachifulSection } from "@/data/kachiful-albas";
import { loadKashifEnSections, kashifEnMeta, type KashifEnSection } from "@/data/kashif-en";
import { ArrowLeft, Loader2, Search } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import ChapterDropdown from "@/components/reader/ChapterDropdown";
import ReaderBottomBar from "@/components/reader/ReaderBottomBar";
import FormattedContent from "@/components/reader/FormattedContent";
import ReaderSearch from "@/components/reader/ReaderSearch";

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

interface Section {
  id: string;
  part?: string;
  chapter?: string;
  heading: string;
  content: string;
}

const Reader = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const book = books.find((b) => b.id === id);
  const [themeIdx, setThemeIdx] = useState(2);
  const [fontIdx, setFontIdx] = useState(1);
  const [fontSize, setFontSize] = useState(16);
  const [tocOpen, setTocOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [currentSectionIdx, setCurrentSectionIdx] = useState(0);
  const contentRef = useRef<HTMLDivElement>(null);
  const [kashifEnData, setKashifEnData] = useState<KashifEnSection[]>([]);
  const [kachifulAlbasData, setKachifulAlbasData] = useState<KachifulSection[]>([]);
  const [loading, setLoading] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  useEffect(() => {
    if (book?.contentModule === "kashif-en") {
      setLoading(true);
      loadKashifEnSections().then((sections) => {
        setKashifEnData(sections);
        setLoading(false);
      });
    }
    if (book?.contentModule === "kachiful-albas") {
      setLoading(true);
      loadKachifulAlbasSections().then((sections) => {
        setKachifulAlbasData(sections);
        setLoading(false);
      });
    }
  }, [book?.contentModule]);

  const theme = themes[themeIdx];

  // Flatten all sections into a unified array
  const allSections: Section[] = useMemo(() => {
    if (book?.contentModule === "ruh-al-adab") {
      // Treat as single section
      return [{ id: "ruh-al-adab-all", heading: ruhAlAdabMeta.title, content: "__ruh__" }];
    }
    if (book?.contentModule === "comprendre-faydhah") {
      return comprendreFaydhahSections.map((s) => ({
        id: s.id,
        chapter: s.chapter,
        heading: s.heading,
        content: s.content,
      }));
    }
    if (book?.contentModule === "kachiful-albas") {
      return kachifulAlbasData.map((s) => ({
        id: s.id,
        part: s.part,
        chapter: s.chapter,
        heading: s.heading,
        content: s.content,
      }));
    }
    if (book?.contentModule === "kashif-en") {
      return kashifEnData.map((s) => ({
        id: s.id,
        part: s.part,
        chapter: s.chapter,
        heading: s.heading,
        content: s.content,
      }));
    }
    return [{ id: "sample", heading: "Sample", content: "__sample__" }];
  }, [book?.contentModule, kashifEnData, kachifulAlbasData]);

  const tocItems = useMemo(() => {
    const chapters: { chapter: string; sections: { id: string; heading: string; index: number }[] }[] = [];
    allSections.forEach((s, idx) => {
      // Build chapter key, avoiding redundant "X — X" when part === chapter
      const chKey = s.part && s.chapter
        ? (s.part === s.chapter ? s.part : `${s.part} — ${s.chapter}`)
        : s.chapter || s.heading;
      const last = chapters[chapters.length - 1];
      // Build display heading: use page number if heading matches chapter to avoid repetition
      const displayHeading = (last && last.chapter === chKey && s.heading === last.sections[0]?.heading)
        ? `Page ${idx + 1}`
        : s.heading;
      if (!last || last.chapter !== chKey) {
        chapters.push({ chapter: chKey, sections: [{ id: s.id, heading: s.heading, index: idx }] });
      } else {
        last.sections.push({ id: s.id, heading: displayHeading, index: idx });
      }
    });
    return chapters;
  }, [allSections]);

  const currentSection = allSections[currentSectionIdx] || allSections[0];

  const goToSection = useCallback((idx: number) => {
    setCurrentSectionIdx(Math.max(0, Math.min(idx, allSections.length - 1)));
    contentRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, [allSections.length]);

  const goToSectionById = useCallback((id: string) => {
    const idx = allSections.findIndex((s) => s.id === id);
    if (idx >= 0) goToSection(idx);
  }, [allSections, goToSection]);

  const fontClass = fontIdx === 0 ? "font-sans" : fontIdx === 1 ? "font-serif" : "font-arabic";

  if (!book) return null;

  const renderMeta = () => {
    if (book.contentModule === "ruh-al-adab") {
      return (
        <>
          <h2 className="text-center font-serif font-bold mb-1" style={{ fontSize }}>{ruhAlAdabMeta.title}</h2>
          <p className="text-center text-sm text-muted-foreground mb-1">{ruhAlAdabMeta.subtitle}</p>
          <p className="text-center text-xs text-muted-foreground mb-1">Author: {ruhAlAdabMeta.author}</p>
          <p className="text-center text-xs text-muted-foreground mb-6">Transliterated by: {ruhAlAdabMeta.transliteratedBy}</p>
        </>
      );
    }
    if (book.contentModule === "comprendre-faydhah") {
      return (
        <>
          <h2 className="text-center font-serif font-bold mb-1" style={{ fontSize }}>{comprendreFaydhahMeta.title}</h2>
          <p className="text-center text-sm text-muted-foreground mb-1">par {comprendreFaydhahMeta.author}</p>
          <p className="text-center text-xs text-muted-foreground mb-6">Traduit par : {comprendreFaydhahMeta.translator}</p>
        </>
      );
    }
    if (book.contentModule === "kachiful-albas") {
      return (
        <>
          <h2 className="text-center font-serif font-bold mb-1" style={{ fontSize }}>{kachifulAlbasMeta.title}</h2>
          <p className="text-center text-sm text-muted-foreground mb-1">{kachifulAlbasMeta.subtitle}</p>
          <p className="text-center text-xs text-muted-foreground mb-1">par {kachifulAlbasMeta.author}</p>
          <p className="text-center text-xs text-muted-foreground mb-6">Traduit par : {kachifulAlbasMeta.translators}</p>
        </>
      );
    }
    if (book.contentModule === "kashif-en") {
      return (
        <>
          <h2 className="text-center font-serif font-bold mb-1" style={{ fontSize }}>{kashifEnMeta.title}</h2>
          <p className="text-center text-sm text-muted-foreground mb-1">{kashifEnMeta.subtitle}</p>
          <p className="text-center text-xs text-muted-foreground mb-1">by {kashifEnMeta.author}</p>
          <p className="text-center text-xs text-muted-foreground mb-6">Translated by: {kashifEnMeta.translators}</p>
        </>
      );
    }
    return null;
  };

  const renderCurrentSection = () => {
    if (!currentSection) return null;

    // Special: ruh-al-adab renders all verses
    if (currentSection.content === "__ruh__") {
      return (
        <div className="space-y-3">
          {ruhAlAdabVerses.map((v) => (
            <p key={v.number}>
              <span className="text-primary font-semibold mr-2">{v.number}</span>
              {v.text}
            </p>
          ))}
          <p className="text-center font-semibold mt-8">{ruhAlAdabMeta.closing}</p>
        </div>
      );
    }

    // Special: sample text
    if (currentSection.content === "__sample__") {
      return (
        <>
          <p className="mb-6">{sampleTextEn}</p>
          <p className="font-arabic text-right mb-6" dir="rtl">{sampleTextAr}</p>
        </>
      );
    }

    // Standard section rendering with book-style formatting
    return (
      <div>
        {currentSection.part && (
          <h3 className="text-center font-serif font-bold text-primary mb-3 mt-4 uppercase tracking-[0.2em]" style={{ fontSize: fontSize * 0.85 }}>
            {currentSection.part}
          </h3>
        )}
        {currentSection.chapter && currentSection.chapter !== currentSection.part && (
          <h4 className="text-center font-serif font-semibold text-primary/80 mb-6" style={{ fontSize: fontSize * 1.1 }}>
            {currentSection.chapter}
          </h4>
        )}
        {currentSection.heading !== currentSection.chapter && currentSection.heading !== currentSection.part && (
          <h5 className="font-serif font-bold mb-6 text-center" style={{ fontSize: fontSize * 1.05 }}>
            {currentSection.heading}
          </h5>
        )}
        <FormattedContent content={currentSection.content} fontSize={fontSize} />
      </div>
    );
  };

  return (
    <div className={`min-h-screen ${theme.bg} ${theme.text} transition-colors duration-300 flex flex-col`}>
      {/* Top bar */}
      <div className="flex items-center gap-2 px-3 py-3 border-b border-border/20">
        <button onClick={() => navigate(-1)} className="p-2 flex-shrink-0">
          <ArrowLeft className="w-5 h-5" />
        </button>
        {tocItems.length > 1 && (
          <ChapterDropdown
            tocItems={tocItems}
            currentSectionId={currentSection?.id || ""}
            onSelectSection={goToSectionById}
            themeClasses={{ bg: theme.bg, text: theme.text }}
          />
        )}
        <div className="flex items-center gap-1 flex-shrink-0">
          <button onClick={() => setSearchOpen(true)} className="p-2">
            <Search className="w-4 h-4" />
          </button>
          <button onClick={() => setFontSize(Math.max(12, fontSize - 2))} className="px-2 py-1 text-sm font-medium">A-</button>
          <input
            type="range"
            min={12}
            max={28}
            value={fontSize}
            onChange={(e) => setFontSize(Number(e.target.value))}
            className="w-16 accent-primary"
          />
          <button onClick={() => setFontSize(Math.min(28, fontSize + 2))} className="px-2 py-1 text-sm font-bold">A+</button>
        </div>
      </div>

      {/* Font selector */}
      <div className="flex items-center justify-center gap-2 py-2 border-b border-border/20">
        {fonts.map((f, i) => (
          <button
            key={f}
            onClick={() => setFontIdx(i)}
            className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
              i === fontIdx ? "bg-primary text-primary-foreground" : "bg-muted/30 text-muted-foreground"
            }`}
          >
            {f}
          </button>
        ))}
        {/* Theme dots inline */}
        <span className="mx-2 text-border">|</span>
        {themes.map((t, i) => (
          <button
            key={t.name}
            onClick={() => setThemeIdx(i)}
            className={`w-6 h-6 rounded-full border-2 transition-all ${t.bg} ${
              i === themeIdx ? "border-primary scale-110" : "border-transparent"
            }`}
          />
        ))}
      </div>

      {/* Reading content */}
      <div
        ref={contentRef}
        className={`flex-1 overflow-y-auto px-6 py-8 pb-32 max-w-2xl mx-auto w-full ${fontClass} leading-relaxed`}
        style={{ fontSize }}
        onTouchStart={(e) => {
          touchStartX.current = e.touches[0].clientX;
          touchStartY.current = e.touches[0].clientY;
        }}
        onTouchEnd={(e) => {
          if (touchStartX.current === null || touchStartY.current === null) return;
          const dx = e.changedTouches[0].clientX - touchStartX.current;
          const dy = e.changedTouches[0].clientY - touchStartY.current;
          touchStartX.current = null;
          touchStartY.current = null;
          if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) {
            if (dx < 0 && currentSectionIdx < allSections.length - 1) goToSection(currentSectionIdx + 1);
            else if (dx > 0 && currentSectionIdx > 0) goToSection(currentSectionIdx - 1);
          }
        }}
      >
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
            <span className="ml-2 text-muted-foreground">Loading book...</span>
          </div>
        ) : (
          <>
            {currentSectionIdx === 0 && renderMeta()}
            {renderCurrentSection()}
          </>
        )}
      </div>

      {/* Bottom bar with navigation */}
      <ReaderBottomBar
        currentPage={currentSectionIdx + 1}
        totalPages={allSections.length}
        onPrevPage={() => goToSection(currentSectionIdx - 1)}
        onNextPage={() => goToSection(currentSectionIdx + 1)}
        onOpenToc={() => setTocOpen(true)}
        hasPrev={currentSectionIdx > 0}
        hasNext={currentSectionIdx < allSections.length - 1}
      />

      {/* TOC Sheet */}
      <Sheet open={tocOpen} onOpenChange={setTocOpen}>
        <SheetContent side="left" className={`${theme.bg} ${theme.text} w-[85%] sm:max-w-sm p-0`}>
          <SheetHeader className="px-4 pt-4 pb-2 border-b border-border/20">
            <SheetTitle className={theme.text}>Table of Contents</SheetTitle>
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
                          setTimeout(() => goToSection(s.index), 300);
                        }}
                        className={`block w-full text-left text-sm py-1.5 px-2 rounded hover:bg-primary/10 transition-colors ${
                          s.index === currentSectionIdx ? "bg-primary/15 font-semibold" : ""
                        }`}
                      >
                        {s.heading}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
              {tocItems.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-8">No table of contents available.</p>
              )}
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>
      {/* Search */}
      <ReaderSearch
        open={searchOpen}
        onOpenChange={setSearchOpen}
        sections={allSections}
        onNavigate={goToSection}
        themeClasses={{ bg: theme.bg, text: theme.text }}
      />
    </div>
  );
};

export default Reader;
