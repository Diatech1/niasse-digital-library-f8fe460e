import { useState, useRef, useMemo, useEffect, useCallback, memo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useBook } from "@/hooks/use-books";
import { ruhAlAdabVerses, ruhAlAdabMeta } from "@/data/ruh-al-adab";
import { comprendreFaydhahSections, comprendreFaydhahMeta } from "@/data/comprendre-faydhah";
import { loadKachifulAlbasSections, kachifulAlbasMeta, type KachifulSection } from "@/data/kachiful-albas";
import { loadKashifEnSections, kashifEnMeta, type KashifEnSection } from "@/data/kashif-en";
import { wirdTidjaneSections, wirdTidjaneMeta } from "@/data/wird-tidjane";
import { stationsIslamSections, stationsIslamMeta } from "@/data/stations-islam";
import { adebDhikrSections, adebDhikrMeta } from "@/data/adeb-dhikr";
import { origineSoubhaSections, origineSoubhaMeta } from "@/data/origine-soubha";
import { salatFatihiSections, salatFatihiMeta } from "@/data/salat-fatihi";
import { jawharatulKamalSections, jawharatulKamalMeta } from "@/data/jawharatul-kamal";
import { dhikrGroupeSections, dhikrGroupeMeta } from "@/data/dhikr-groupe";
import { fadailDhikrSections, fadailDhikrMeta } from "@/data/fadail-dhikr";
import { priereShaykhIbrahimSections, priereShaykhIbrahimMeta } from "@/data/priere-shaykh-ibrahim";
import { stationsDeenEnSections, stationsDeenEnMeta } from "@/data/stations-deen-en";
import { loadConditionsReglesSections, conditionsReglesMeta, type ConditionsSection } from "@/data/conditions-regles";
import { loadIfadatouSections, ifadatouAhmediyyaMeta, type IfadatouSection } from "@/data/ifadatou-ahmediyya";
import { ArrowLeft, Loader2, Search, Maximize, Minimize, ChevronLeft, ChevronRight, Bookmark, BookmarkCheck, Menu } from "lucide-react";
import { useSaveProgress, getSavedProgress } from "@/hooks/use-reading-progress";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import ChapterDropdown from "@/components/reader/ChapterDropdown";
import ReaderBottomBar from "@/components/reader/ReaderBottomBar";
import FormattedContent from "@/components/reader/FormattedContent";
import ReaderSearch from "@/components/reader/ReaderSearch";
import BookmarkDialog from "@/components/reader/BookmarkDialog";
import PagedView, { type PagedViewHandle } from "@/components/reader/PagedView";
import { useBookmarks } from "@/hooks/use-bookmarks";
import { useIsMobile } from "@/hooks/use-mobile";

const themes = [
  { name: "Light", bg: "bg-[hsl(40,20%,95%)]", text: "text-[hsl(0,0%,15%)]" },
  { name: "Sepia", bg: "bg-[hsl(37,30%,88%)]", text: "text-[hsl(25,20%,20%)]" },
  { name: "Dark", bg: "bg-[hsl(220,15%,15%)]", text: "text-[hsl(40,10%,85%)]" },
  { name: "Midnight", bg: "bg-[hsl(240,20%,8%)]", text: "text-[hsl(40,10%,80%)]" },
];

const fonts = ["Sans", "Crimson Pro", "Amiri"];

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
  const { book, isLoading: bookLoading } = useBook(id);

  // Default reader theme matches the app's appearance
  const [themeIdx, setThemeIdx] = useState(() => {
    const isDark =
      document.documentElement.classList.contains("dark") ||
      (localStorage.getItem("faydabook-theme") === "system" &&
        window.matchMedia("(prefers-color-scheme: dark)").matches);
    return isDark ? 2 : 0; // Dark or Light
  });
  const [fontIdx, setFontIdx] = useState(1);
  const [fontSize, setFontSize] = useState(16);
  const [tocOpen, setTocOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [currentSectionIdx, setCurrentSectionIdx] = useState(() => getSavedProgress(id));
  const contentRef = useRef<HTMLDivElement>(null);
  const [kashifEnData, setKashifEnData] = useState<KashifEnSection[]>([]);
  const [kachifulAlbasData, setKachifulAlbasData] = useState<KachifulSection[]>([]);
  const [conditionsReglesData, setConditionsReglesData] = useState<ConditionsSection[]>([]);
  const [ifadatouData, setIfadatouData] = useState<IfadatouSection[]>([]);
  const [loading, setLoading] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const touchHasMoved = useRef(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [chromeVisible, setChromeVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const pagedViewRef = useRef<PagedViewHandle>(null);
  const [pagedTotal, setPagedTotal] = useState(1);
  const lastScrollY = useRef(0);
  const isMobile = useIsMobile();

  const saveProgress = useSaveProgress(id);
  const { bookmarks, addBookmark, removeBookmark, isBookmarked } = useBookmarks(id);
  const [bookmarkDialogOpen, setBookmarkDialogOpen] = useState(false);
  const [showResumeBanner, setShowResumeBanner] = useState(() => getSavedProgress(id) > 0);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  }, []);

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  useEffect(() => {
    document.body.classList.toggle("reader-chrome-hidden", !chromeVisible);
    return () => document.body.classList.remove("reader-chrome-hidden");
  }, [chromeVisible]);

  useEffect(() => {
    if (book?.contentModule === "kashif-en") {
      setLoading(true);
      loadKashifEnSections().then((sections) => {
        setKashifEnData(sections);
        setLoading(false);
        // Restore saved position after async load (clamp to valid range)
        const saved = getSavedProgress(id);
        if (saved > 0) setCurrentSectionIdx(Math.min(saved, sections.length - 1));
      });
    }
    if (book?.contentModule === "kachiful-albas") {
      setLoading(true);
      loadKachifulAlbasSections().then((sections) => {
        setKachifulAlbasData(sections);
        setLoading(false);
        const saved = getSavedProgress(id);
        if (saved > 0) setCurrentSectionIdx(Math.min(saved, sections.length - 1));
      });
    }
    if (book?.contentModule === "conditions-regles") {
      setLoading(true);
      loadConditionsReglesSections().then((sections) => {
        setConditionsReglesData(sections);
        setLoading(false);
        const saved = getSavedProgress(id);
        if (saved > 0) setCurrentSectionIdx(Math.min(saved, sections.length - 1));
      });
    }
    if (book?.contentModule === "ifadatou-ahmediyya") {
      setLoading(true);
      loadIfadatouSections().then((sections) => {
        setIfadatouData(sections);
        setLoading(false);
        const saved = getSavedProgress(id);
        if (saved > 0) setCurrentSectionIdx(Math.min(saved, sections.length - 1));
      });
    }
  }, [book?.contentModule, id]);

  const theme = themes[themeIdx];

  // Flatten all sections into a unified array
  const allSections: Section[] = useMemo(() => {
    if (book?.contentModule === "ruh-al-adab") {
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
    if (book?.contentModule === "wird-tidjane") {
      return wirdTidjaneSections.map((s) => ({
        id: s.id,
        chapter: s.chapter,
        heading: s.heading,
        content: s.content,
      }));
    }
    if (book?.contentModule === "stations-islam") {
      return stationsIslamSections.map((s) => ({
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
    if (book?.contentModule === "adeb-dhikr") {
      return adebDhikrSections.map((s) => ({ id: s.id, chapter: s.chapter, heading: s.heading, content: s.content }));
    }
    if (book?.contentModule === "origine-soubha") {
      return origineSoubhaSections.map((s) => ({ id: s.id, chapter: s.chapter, heading: s.heading, content: s.content }));
    }
    if (book?.contentModule === "salat-fatihi") {
      return salatFatihiSections.map((s) => ({ id: s.id, chapter: s.chapter, heading: s.heading, content: s.content }));
    }
    if (book?.contentModule === "jawharatul-kamal") {
      return jawharatulKamalSections.map((s) => ({ id: s.id, chapter: s.chapter, heading: s.heading, content: s.content }));
    }
    if (book?.contentModule === "dhikr-groupe") {
      return dhikrGroupeSections.map((s) => ({ id: s.id, chapter: s.chapter, heading: s.heading, content: s.content }));
    }
    if (book?.contentModule === "fadail-dhikr") {
      return fadailDhikrSections.map((s) => ({ id: s.id, chapter: s.chapter, heading: s.heading, content: s.content }));
    }
    if (book?.contentModule === "priere-shaykh-ibrahim") {
      return priereShaykhIbrahimSections.map((s) => ({ id: s.id, chapter: s.chapter, heading: s.heading, content: s.content }));
    }
    if (book?.contentModule === "stations-deen-en") {
      return stationsDeenEnSections.map((s) => ({ id: s.id, chapter: s.chapter, heading: s.heading, content: s.content }));
    }
    if (book?.contentModule === "conditions-regles") {
      return conditionsReglesData.map((s) => ({ id: s.id, chapter: s.chapter, heading: s.heading, content: s.content }));
    }
    return [{ id: "sample", heading: "Sample", content: "__sample__" }];
  }, [book?.contentModule, kashifEnData, kachifulAlbasData, conditionsReglesData]);

  const tocItems = useMemo(() => {
    // For page-by-page books (kashif-en, kachiful-albas), build a deduplicated TOC:
    // one entry per unique chapter/heading combination, pointing to the first page of that section.
    const chapters: { chapter: string; sections: { id: string; heading: string; index: number }[] }[] = [];
    const seenHeadings = new Set<string>();

    allSections.forEach((s, idx) => {
      // Skip generic page headings like "Page xi", "Page 3", "Page 12" — only named headings belong in the TOC
      if (/^Page\s+([ivxlc]+|\d+)$/i.test(s.heading)) return;

      const chKey = s.part && s.chapter
        ? (s.part === s.chapter ? s.part : `${s.part} — ${s.chapter}`)
        : s.chapter || s.heading;

      // Deduplicate: skip if this exact heading was already added under this chapter
      const dedupeKey = `${chKey}||${s.heading}`;
      if (seenHeadings.has(dedupeKey)) return;
      seenHeadings.add(dedupeKey);

      const last = chapters[chapters.length - 1];
      if (!last || last.chapter !== chKey) {
        chapters.push({ chapter: chKey, sections: [{ id: s.id, heading: s.heading, index: idx }] });
      } else {
        last.sections.push({ id: s.id, heading: s.heading, index: idx });
      }
    });
    return chapters;
  }, [allSections]);

  const isPagedMode = true;
  const effectiveTotalPages = pagedTotal;

  const currentSection = allSections[currentSectionIdx] || allSections[0];


  const goToSection = useCallback((idx: number) => {
    const clamped = Math.max(0, Math.min(idx, effectiveTotalPages - 1));
    setCurrentSectionIdx(clamped);
    saveProgress(clamped);
    if (!isPagedMode) {
      contentRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [effectiveTotalPages, saveProgress, isPagedMode]);

  const goToSectionById = useCallback((id: string) => {
    const idx = allSections.findIndex((s) => s.id === id);
    if (idx >= 0) {
      if (isPagedMode && pagedViewRef.current) {
        const page = pagedViewRef.current.getPageForSection(idx);
        goToSection(page);
      } else {
        goToSection(idx);
      }
    }
  }, [allSections, goToSection, isPagedMode]);

  const fontClass = fontIdx === 0 ? "font-sans" : fontIdx === 1 ? "font-reader" : "font-arabic";

  const renderMeta = () => {
    if (!book) return null;
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
    if (book.contentModule === "stations-islam") {
      return (
        <>
          <h2 className="text-center font-serif font-bold mb-1" style={{ fontSize }}>{stationsIslamMeta.title}</h2>
          <p className="text-center text-xs text-muted-foreground mb-6">par {stationsIslamMeta.author}</p>
        </>
      );
    }
    if (book.contentModule === "adeb-dhikr") {
      return (
        <>
          <h2 className="text-center font-serif font-bold mb-1" style={{ fontSize }}>{adebDhikrMeta.title}</h2>
          <p className="text-center text-xs text-muted-foreground mb-6">Source : {adebDhikrMeta.source}</p>
        </>
      );
    }
    if (book.contentModule === "origine-soubha") {
      return (
        <>
          <h2 className="text-center font-serif font-bold mb-1" style={{ fontSize }}>{origineSoubhaMeta.title}</h2>
          <p className="text-center text-xs text-muted-foreground mb-6">Source : {origineSoubhaMeta.source}</p>
        </>
      );
    }
    if (book.contentModule === "salat-fatihi") {
      return (
        <>
          <h2 className="text-center font-serif font-bold mb-1" style={{ fontSize }}>{salatFatihiMeta.title}</h2>
          <p className="text-center text-xs text-muted-foreground mb-6">Source : {salatFatihiMeta.source}</p>
        </>
      );
    }
    if (book.contentModule === "jawharatul-kamal") {
      return (
        <>
          <h2 className="text-center font-serif font-bold mb-1" style={{ fontSize }}>{jawharatulKamalMeta.title}</h2>
          <p className="text-center text-xs text-muted-foreground mb-6">Source : {jawharatulKamalMeta.source}</p>
        </>
      );
    }
    if (book.contentModule === "dhikr-groupe") {
      return (
        <>
          <h2 className="text-center font-serif font-bold mb-1" style={{ fontSize }}>{dhikrGroupeMeta.title}</h2>
          <p className="text-center text-xs text-muted-foreground mb-6">Source : {dhikrGroupeMeta.source}</p>
        </>
      );
    }
    if (book.contentModule === "fadail-dhikr") {
      return (
        <>
          <h2 className="text-center font-serif font-bold mb-1" style={{ fontSize }}>{fadailDhikrMeta.title}</h2>
          <p className="text-center text-xs text-muted-foreground mb-6">Source : {fadailDhikrMeta.source}</p>
        </>
      );
    }
    if (book.contentModule === "priere-shaykh-ibrahim") {
      return (
        <>
          <h2 className="text-center font-serif font-bold mb-1" style={{ fontSize }}>{priereShaykhIbrahimMeta.title}</h2>
          <p className="text-center text-sm text-muted-foreground mb-1">par {priereShaykhIbrahimMeta.author}</p>
          <p className="text-center text-xs text-muted-foreground mb-6">Traduit par : {priereShaykhIbrahimMeta.translator}</p>
        </>
      );
    }
    if (book.contentModule === "stations-deen-en") {
      return (
        <>
          <h2 className="text-center font-serif font-bold mb-1" style={{ fontSize }}>{stationsDeenEnMeta.title}</h2>
          <p className="text-center text-sm text-muted-foreground mb-1">{stationsDeenEnMeta.subtitle}</p>
          <p className="text-center text-xs text-muted-foreground mb-1">by {stationsDeenEnMeta.author}</p>
          <p className="text-center text-xs text-muted-foreground mb-6">Interpreted by: {stationsDeenEnMeta.translator}</p>
        </>
      );
    }
    if (book.contentModule === "conditions-regles") {
      return (
        <>
          <h2 className="text-center font-serif font-bold mb-1" style={{ fontSize }}>{conditionsReglesMeta.title}</h2>
          <p className="text-center text-xs text-muted-foreground mb-6">Source : {conditionsReglesMeta.source}</p>
        </>
      );
    }
    return null;
  };

  const pagedTextColor = useMemo(
    () => theme.text.replace('text-[', '').replace(']', ''),
    [theme.text]
  );

  const pagedContent = useMemo(() => (
    <div style={{ fontSize }}>
      {renderMeta()}
      {allSections.map((section, idx) => (
        <div key={section.id} data-section-index={idx} className="paged-section mb-6">
          {section.part && (
            <h3 className="text-center font-serif font-bold text-primary mb-3 mt-4 uppercase tracking-[0.2em]" style={{ fontSize: fontSize * 0.85, breakAfter: 'avoid' as const }}>
              {section.part}
            </h3>
          )}
          {section.chapter && section.chapter !== section.part && (
            <h4 className="text-center font-serif font-semibold text-primary/80 mb-4" style={{ fontSize: fontSize * 1.1, breakAfter: 'avoid' as const }}>
              {section.chapter}
            </h4>
          )}
          {section.heading && section.heading !== section.chapter && section.heading !== section.part && (
            <h5
              className="font-serif font-bold mb-4 text-center"
              style={{ fontSize: fontSize * 1.05, breakAfter: 'avoid' as const }}
            >
              {section.heading}
            </h5>
          )}
          {section.content === "__ruh__" ? (
            <div className="space-y-3">
              {ruhAlAdabVerses.map((v) => (
                <p key={v.number}>
                  <span className="text-primary font-semibold mr-2">{v.number}</span>
                  {v.text}
                </p>
              ))}
              <p className="text-center font-semibold mt-8">{ruhAlAdabMeta.closing}</p>
            </div>
          ) : section.content === "__sample__" ? (
            <>
              <p className="mb-6">{sampleTextEn}</p>
              <p className="font-arabic text-right mb-6" dir="rtl">{sampleTextAr}</p>
            </>
          ) : (
            <FormattedContent
              content={section.content}
              fontSize={fontSize}
              textColor={pagedTextColor}
            />
          )}
        </div>
      ))}
    </div>
  ), [allSections, fontSize, pagedTextColor, book?.contentModule]);

  const renderCurrentSection = () => {
    if (!currentSection) return null;

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

    if (currentSection.content === "__sample__") {
      return (
        <>
          <p className="mb-6">{sampleTextEn}</p>
          <p className="font-arabic text-right mb-6" dir="rtl">{sampleTextAr}</p>
        </>
      );
    }

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
        <FormattedContent
          content={currentSection.content}
          fontSize={fontSize}
          textColor={theme.text.replace('text-[', '').replace(']', '')}
        />
      </div>
    );
  };

  return (
    <div ref={containerRef} className={`h-screen ${theme.bg} ${theme.text} transition-colors duration-300 flex flex-col`}>
      {/* Top bar */}
      <div className={`flex items-center gap-2 px-3 py-3 border-b border-border/20 transition-all duration-300 ${chromeVisible ? '' : 'opacity-0 max-h-0 overflow-hidden !py-0 !border-b-0'}`}>
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
          <button onClick={toggleFullscreen} className="p-2">
            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </button>
          {/* Bookmark trigger */}
          {currentSection && currentSection.content !== "__sample__" && currentSection.content !== "__ruh__" && (
            <button
              onClick={() => setBookmarkDialogOpen(true)}
              className="p-2 rounded-full hover:bg-primary/10 transition-colors"
              title={isBookmarked(currentSectionIdx) ? "Edit bookmark" : "Add bookmark"}
            >
              {isBookmarked(currentSectionIdx)
                ? <BookmarkCheck className="w-4 h-4 text-primary" />
                : <Bookmark className="w-4 h-4" />}
            </button>
          )}
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
      <div className={`flex items-center justify-center gap-2 py-2 border-b border-border/20 transition-all duration-300 ${chromeVisible && !isFullscreen ? '' : 'opacity-0 max-h-0 overflow-hidden !py-0 !border-b-0'}`}>
        {fonts.map((f, i) => (
          <button
            key={f}
            onClick={() => setFontIdx(i)}
            className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
              i === fontIdx ? "bg-primary text-primary-foreground" : "bg-muted text-foreground/70"
            }`}
          >
            {f}
          </button>
        ))}
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

      {/* Resume banner */}
      {showResumeBanner && currentSectionIdx > 0 && (
        <div className="flex items-center justify-between gap-3 px-4 py-2.5 bg-primary/10 border-b border-primary/20 text-sm">
          <span className="text-foreground/80">
            Resuming from <span className="font-semibold text-primary">page {currentSectionIdx + 1}</span>
          </span>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => {
                goToSection(0);
                setShowResumeBanner(false);
              }}
              className="text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground transition-colors"
            >
              Start over
            </button>
            <button
              onClick={() => setShowResumeBanner(false)}
              className="text-xs px-2.5 py-1 rounded-full bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {/* Top spacer when chrome is hidden */}
      {!chromeVisible && <div className="flex-shrink-0 h-6" />}

      {/* Reading content */}
      <div
        ref={contentRef}
        className={`flex-1 min-h-0 ${isPagedMode ? 'overflow-hidden flex flex-col pb-12' : 'overflow-y-auto'} ${isPagedMode ? '' : 'py-8 px-6 max-w-4xl mx-auto'} w-full ${fontClass} ${isPagedMode ? '' : 'leading-relaxed'} ${isPagedMode ? '' : 'cursor-pointer'}`}
        style={{
          fontSize,
          ...(!isPagedMode ? { paddingBottom: chromeVisible ? '11rem' : '5rem' } : {}),
        }}
        onClick={() => {
          touchHasMoved.current = false;
        }}
        onTouchStart={(e) => {
          touchStartX.current = e.touches[0].clientX;
          touchStartY.current = e.touches[0].clientY;
          touchHasMoved.current = false;
        }}
        onTouchMove={(e) => {
          if (touchStartX.current === null || touchStartY.current === null) return;
          const dx = Math.abs(e.touches[0].clientX - touchStartX.current);
          const dy = Math.abs(e.touches[0].clientY - touchStartY.current);
          if (dx > 5 || dy > 5) touchHasMoved.current = true;
        }}
        onScroll={() => {
          touchHasMoved.current = true;
        }}
        onTouchEnd={(e) => {
          if (touchStartX.current === null || touchStartY.current === null) return;
          const dx = e.changedTouches[0].clientX - touchStartX.current;
          const dy = e.changedTouches[0].clientY - touchStartY.current;
          touchStartX.current = null;
          touchStartY.current = null;
          if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) {
            if (dx < 0 && currentSectionIdx < effectiveTotalPages - 1) goToSection(currentSectionIdx + 1);
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
            <PagedView
              ref={pagedViewRef}
              page={currentSectionIdx}
              onTotalPagesChange={setPagedTotal}
              className="flex-1"
            >
              {pagedContent}
            </PagedView>
          </>
        )}
      </div>

      {/* Side navigation arrows — always visible in fullscreen, otherwise follow chrome visibility */}
      {(chromeVisible || isFullscreen) && effectiveTotalPages > 1 && (
        <>
          <button
            onClick={() => goToSection(currentSectionIdx - 1)}
            disabled={currentSectionIdx === 0}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-30 p-2 rounded-full bg-background/60 backdrop-blur-sm border border-border/30 shadow-md disabled:opacity-20 transition-opacity hover:bg-background/80"
            aria-label="Previous page"
          >
            <ChevronLeft className="w-5 h-5 text-foreground" />
          </button>
          <button
            onClick={() => goToSection(currentSectionIdx + 1)}
            disabled={currentSectionIdx === effectiveTotalPages - 1}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-30 p-2 rounded-full bg-background/60 backdrop-blur-sm border border-border/30 shadow-md disabled:opacity-20 transition-opacity hover:bg-background/80"
            aria-label="Next page"
          >
            <ChevronRight className="w-5 h-5 text-foreground" />
          </button>
        </>
      )}

      {/* Floating exit-fullscreen button */}
      {isFullscreen && (
        <button
          onClick={() => document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {})}
          className="absolute top-4 right-4 z-40 p-2 rounded-full bg-background/60 backdrop-blur-sm border border-border/30 shadow-md transition-opacity hover:bg-background/80"
          aria-label="Exit fullscreen"
        >
          <Minimize className="w-4 h-4 text-foreground" />
        </button>
      )}

      {/* Floating toggle chrome button */}
      {!isFullscreen && (
        <button
          onClick={() => setChromeVisible((v) => !v)}
          className="absolute bottom-5 right-4 z-40 p-2.5 rounded-full bg-foreground/10 backdrop-blur-sm border border-border/20 shadow-md transition-opacity hover:bg-foreground/20 opacity-40 hover:opacity-80"
          aria-label="Show toolbar"
        >
          <Menu className="w-4 h-4 text-foreground" />
        </button>
      )}

      {(
        <div className={`transition-all duration-300 ${chromeVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-full pointer-events-none'}`}>
          <ReaderBottomBar
            currentPage={currentSectionIdx + 1}
            totalPages={effectiveTotalPages}
            onPrevPage={() => goToSection(currentSectionIdx - 1)}
            onNextPage={() => goToSection(currentSectionIdx + 1)}
            onOpenToc={() => setTocOpen(true)}
            onJumpToPage={(page) => goToSection(page - 1)}
            hasPrev={currentSectionIdx > 0}
            hasNext={currentSectionIdx < effectiveTotalPages - 1}
          />
        </div>
      )}

      {/* TOC Sheet */}
      <Sheet open={tocOpen} onOpenChange={setTocOpen}>
        <SheetContent side="left" className={`${theme.bg} ${theme.text} w-[85%] sm:max-w-sm p-0`}>
          <SheetHeader className="px-4 pt-4 pb-2 border-b border-border/20">
            <SheetTitle className={theme.text}>Table of Contents</SheetTitle>
          </SheetHeader>
          <ScrollArea className="h-[calc(100vh-60px)]">
            <div className="px-4 py-3 space-y-4">
              {/* Bookmarks section */}
              {bookmarks.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-primary uppercase tracking-wider mb-2 flex items-center gap-1">
                    <Bookmark className="w-3 h-3" /> Bookmarks
                  </p>
                  <div className="space-y-1">
                    {bookmarks.map((bm) => (
                      <button
                        key={bm.id}
                        onClick={() => {
                          setTocOpen(false);
                          setTimeout(() => goToSection(bm.sectionIdx), 300);
                        }}
                        className={`block w-full text-left text-sm py-1.5 px-2 rounded hover:bg-primary/10 transition-colors ${
                          bm.sectionIdx === currentSectionIdx ? "bg-primary/15 font-semibold" : ""
                        }`}
                      >
                        <span className="text-xs text-muted-foreground block">p.{bm.pageNumber}</span>
                        <span className="line-clamp-1">{bm.heading}</span>
                        {bm.note && (
                          <span className="text-xs text-muted-foreground italic line-clamp-1 mt-0.5">{bm.note}</span>
                        )}
                      </button>
                    ))}
                  </div>
                  <div className="border-t border-border/20 my-3" />
                </div>
              )}

              {/* Chapters */}
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

      {/* Bookmark Dialog */}
      {currentSection && (
        <BookmarkDialog
          open={bookmarkDialogOpen}
          pageNumber={currentSectionIdx + 1}
          heading={currentSection.heading}
          existingNote={bookmarks.find((b) => b.sectionIdx === currentSectionIdx)?.note}
          onSave={(note) => addBookmark(currentSectionIdx, currentSectionIdx + 1, currentSection.heading, note)}
          onRemove={() => removeBookmark(currentSectionIdx)}
          onClose={() => setBookmarkDialogOpen(false)}
          themeClasses={{ bg: theme.bg, text: theme.text }}
        />
      )}

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

