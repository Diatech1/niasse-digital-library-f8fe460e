import { useState, useRef, useMemo, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { books } from "@/data/books";
import { ruhAlAdabVerses, ruhAlAdabMeta } from "@/data/ruh-al-adab";
import { comprendreFaydhahSections, comprendreFaydhahMeta } from "@/data/comprendre-faydhah";
import { loadKachifulAlbasSections, kachifulAlbasMeta, type KachifulSection } from "@/data/kachiful-albas";
import { loadKashifEnSections, kashifEnMeta, type KashifEnSection } from "@/data/kashif-en";
import { ArrowLeft, ChevronLeft, ChevronRight, List, Loader2, Search } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import ChapterDropdown from "@/components/reader/ChapterDropdown";
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
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const [kashifEnData, setKashifEnData] = useState<KashifEnSection[]>([]);
  const [kachifulAlbasData, setKachifulAlbasData] = useState<KachifulSection[]>([]);
  const [loading, setLoading] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const [containerHeight, setContainerHeight] = useState(0);

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
      const chKey = s.part && s.chapter ? `${s.part} — ${s.chapter}` : s.chapter || s.heading;
      const last = chapters[chapters.length - 1];
      if (!last || last.chapter !== chKey) {
        chapters.push({ chapter: chKey, sections: [{ id: s.id, heading: s.heading, index: idx }] });
      } else {
        last.sections.push({ id: s.id, heading: s.heading, index: idx });
      }
    });
    return chapters;
  }, [allSections]);

  const currentSection = allSections[currentSectionIdx] || allSections[0];

  // Estimate total book pages and current cumulative page using content length ratios
  const { estimatedTotalPages, currentCumulativePage } = useMemo(() => {
    if (allSections.length === 0 || totalPages <= 0) return { estimatedTotalPages: 1, currentCumulativePage: 1 };
    const currentLen = (currentSection?.content || "").length || 1;
    const pagesPerChar = totalPages / currentLen;
    let cumBefore = 0;
    for (let i = 0; i < currentSectionIdx; i++) {
      cumBefore += Math.max(1, Math.round((allSections[i].content || "").length * pagesPerChar));
    }
    let total = 0;
    for (let i = 0; i < allSections.length; i++) {
      total += i === currentSectionIdx
        ? totalPages
        : Math.max(1, Math.round((allSections[i].content || "").length * pagesPerChar));
    }
    return { estimatedTotalPages: total, currentCumulativePage: cumBefore + currentPage + 1 };
  }, [allSections, currentSectionIdx, currentSection, totalPages, currentPage]);

  const goToSection = useCallback((idx: number) => {
    setCurrentSectionIdx(Math.max(0, Math.min(idx, allSections.length - 1)));
    setCurrentPage(0);
  }, [allSections.length]);

  // Pagination measurement
  const measure = useCallback(() => {
    const container = containerRef.current;
    const inner = innerRef.current;
    if (!container || !inner) return;
    const rect = container.getBoundingClientRect();
    const w = rect.width;
    const h = rect.height;
    setContainerHeight(h);
    requestAnimationFrame(() => {
      const pages = Math.max(1, Math.ceil(inner.scrollWidth / w));
      setTotalPages(pages);
    });
  }, []);

  useEffect(() => {
    measure();
  }, [currentSectionIdx, fontSize, fontIdx, measure, loading]);

  useEffect(() => {
    const observer = new ResizeObserver(() => measure());
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [measure]);

  useEffect(() => {
    document.fonts.ready.then(() => measure());
  }, [measure]);

  const goPage = useCallback((page: number) => {
    if (page < 0) {
      // Go to previous section, last page
      if (currentSectionIdx > 0) {
        setCurrentSectionIdx(currentSectionIdx - 1);
        setCurrentPage(-1); // signal to go to last page
      }
      return;
    }
    if (page >= totalPages) {
      // Go to next section, first page
      if (currentSectionIdx < allSections.length - 1) {
        setCurrentSectionIdx(currentSectionIdx + 1);
        setCurrentPage(0);
      }
      return;
    }
    setCurrentPage(page);
  }, [totalPages, currentSectionIdx, allSections.length]);

  // When totalPages changes and currentPage is -1, go to last page
  useEffect(() => {
    if (currentPage === -1 && totalPages > 0) {
      setCurrentPage(totalPages - 1);
    }
  }, [currentPage, totalPages]);

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
        {currentSection.chapter && (
          <h4 className="text-center font-serif font-semibold text-primary/80 mb-6" style={{ fontSize: fontSize * 1.1 }}>
            {currentSection.chapter}
          </h4>
        )}
        <h5 className="font-serif font-bold mb-6 text-center" style={{ fontSize: fontSize * 1.05 }}>
          {currentSection.heading}
        </h5>
        <FormattedContent content={currentSection.content} fontSize={fontSize} />
      </div>
    );
  };

  return (
    <div className={`min-h-screen ${theme.bg} ${theme.text} transition-colors duration-300 flex flex-col`}>
      {/* Compact top bar */}
      <div className="flex items-center gap-1 px-2 py-1.5 border-b border-border/20">
        <button onClick={() => navigate(-1)} className="p-1.5 flex-shrink-0">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <button onClick={() => setSearchOpen(true)} className="p-1.5">
          <Search className="w-4 h-4" />
        </button>
        <span className="mx-1 text-border/40">|</span>
        {fonts.map((f, i) => (
          <button
            key={f}
            onClick={() => setFontIdx(i)}
            className={`px-2.5 py-0.5 rounded-full text-[10px] font-medium transition-all ${
              i === fontIdx ? "bg-primary text-primary-foreground" : "bg-muted/30 text-muted-foreground"
            }`}
          >
            {f}
          </button>
        ))}
        <span className="mx-1 text-border/40">|</span>
        {themes.map((t, i) => (
          <button
            key={t.name}
            onClick={() => setThemeIdx(i)}
            className={`w-5 h-5 rounded-full border-2 transition-all ${t.bg} ${
              i === themeIdx ? "border-primary scale-110" : "border-transparent"
            }`}
          />
        ))}
        <span className="flex-1" />
        <button onClick={() => setFontSize(Math.max(12, fontSize - 2))} className="px-1.5 py-0.5 text-xs font-medium">A-</button>
        <input
          type="range"
          min={12}
          max={28}
          value={fontSize}
          onChange={(e) => setFontSize(Number(e.target.value))}
          className="w-12 accent-primary"
        />
        <button onClick={() => setFontSize(Math.min(28, fontSize + 2))} className="px-1.5 py-0.5 text-xs font-bold">A+</button>
      </div>

      {/* Reading content - paginated like a physical book */}
      <div
        ref={containerRef}
        className={`flex-1 overflow-hidden max-w-lg mx-auto w-full ${fontClass} relative`}
        style={{ fontSize, lineHeight: 1.6 }}
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
            if (dx < 0) goPage(currentPage + 1);
            else goPage(currentPage - 1);
          }
        }}
        onClick={(e) => {
          const rect = containerRef.current?.getBoundingClientRect();
          if (!rect) return;
          const x = e.clientX - rect.left;
          const ratio = x / rect.width;
          if (ratio < 0.25) goPage(currentPage - 1);
          else if (ratio > 0.75) goPage(currentPage + 1);
        }}
      >
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
            <span className="ml-2 text-muted-foreground">Loading book...</span>
          </div>
        ) : (
          <div
            ref={innerRef}
            style={{
              height: containerHeight > 0 ? `${containerHeight}px` : "100%",
              columnWidth: containerRef.current ? `${containerRef.current.getBoundingClientRect().width}px` : "100%",
              columnGap: 0,
              columnFill: "auto" as any,
              transform: `translateX(-${currentPage * (containerRef.current?.getBoundingClientRect().width || 0)}px)`,
              transition: "transform 0.3s ease",
            }}
          >
            <div className="px-6 py-4">
              {currentSectionIdx === 0 && currentPage === 0 && renderMeta()}
              {renderCurrentSection()}
            </div>
          </div>
        )}
      </div>

      {/* Bottom bar */}
      <div className="border-t border-border/20 bg-inherit z-40">
        <div className="flex items-center justify-between px-4 py-1 text-[10px] text-muted-foreground">
          <span className="font-serif truncate mr-2">
            {currentSection?.heading}
          </span>
          <span className="font-serif tracking-wider flex-shrink-0">
            {currentCumulativePage} / {estimatedTotalPages}
          </span>
        </div>
        {(() => {
          const overallProgress = allSections.length > 0
            ? Math.round(((currentSectionIdx + (currentPage + 1) / Math.max(1, totalPages)) / allSections.length) * 100)
            : 0;
          return (
            <div className="px-4">
              <div className="h-0.5 bg-muted/30 rounded-full">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-300"
                  style={{ width: `${overallProgress}%` }}
                />
              </div>
            </div>
          );
        })()}
        <div className="flex items-center justify-around py-1 pb-safe">
          <button
            className="p-1.5 disabled:opacity-30"
            onClick={(e) => { e.stopPropagation(); goPage(currentPage - 1); }}
            disabled={currentPage === 0 && currentSectionIdx === 0}
          >
            <ChevronLeft className="w-4 h-4 text-muted-foreground" />
          </button>
          <button className="p-1.5" onClick={(e) => { e.stopPropagation(); setTocOpen(true); }}>
            <List className="w-4 h-4 text-muted-foreground" />
          </button>
          <button
            className="p-1.5 disabled:opacity-30"
            onClick={(e) => { e.stopPropagation(); goPage(currentPage + 1); }}
            disabled={currentPage >= totalPages - 1 && currentSectionIdx >= allSections.length - 1}
          >
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      </div>

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
