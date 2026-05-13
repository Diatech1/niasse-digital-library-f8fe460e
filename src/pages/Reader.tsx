import { useState, useRef, useMemo, useEffect, useCallback, memo } from "react";
import { mergeAdjacentSections } from "@/lib/mergeSections";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
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
import { douaWazifaSections, douaWazifaMeta } from "@/data/doua-wazifa";
import { fadailDhikrSections, fadailDhikrMeta } from "@/data/fadail-dhikr";
import { priereShaykhIbrahimSections, priereShaykhIbrahimMeta } from "@/data/priere-shaykh-ibrahim";
import { stationsDeenEnSections, stationsDeenEnMeta } from "@/data/stations-deen-en";
import { loadConditionsReglesSections, conditionsReglesMeta, type ConditionsSection } from "@/data/conditions-regles";
import { loadIfadatouSections, ifadatouAhmediyyaMeta, type IfadatouSection } from "@/data/ifadatou-ahmediyya";
import { loadJawahirRasailSections, jawahirRasailEnMeta, type JawahirRasailSection } from "@/data/jawahir-rasail-en";
import { loadVolumeSections, type VolumeSection } from "@/data/volume-loader";
import { ArrowLeft, Loader2, Search, Maximize, Minimize, Bookmark, BookmarkCheck, Menu, BookOpen, ScrollText, Home, Headphones, Settings, Volume2, NotebookText } from "lucide-react";
import { extractFootnotes } from "@/lib/extractFootnotes";
import { useAudioPlayer } from "@/hooks/use-audio-player";
import MiniPlayer from "@/components/MiniPlayer";
import { Slider } from "@/components/ui/slider";
import { useSaveProgress, getSavedProgress } from "@/hooks/use-reading-progress";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import SEO from "@/components/SEO";
import { ScrollArea } from "@/components/ui/scroll-area";
import ChapterDropdown from "@/components/reader/ChapterDropdown";
import ReaderBottomBar from "@/components/reader/ReaderBottomBar";
import FormattedContent from "@/components/reader/FormattedContent";
import ReaderSearch from "@/components/reader/ReaderSearch";
import BookmarkDialog from "@/components/reader/BookmarkDialog";
import PagedView, { type PagedViewHandle } from "@/components/reader/PagedView";
import { useBookmarks } from "@/hooks/use-bookmarks";
import { useIsMobile } from "@/hooks/use-mobile";
import { directionForBookLanguage } from "@/hooks/use-language";

const themes = [
  { name: "Light", bg: "bg-[hsl(40,20%,95%)]", text: "text-[hsl(0,0%,15%)]" },
  { name: "Sepia", bg: "bg-[hsl(37,30%,88%)]", text: "text-[hsl(25,20%,20%)]" },
  { name: "Dark", bg: "bg-[hsl(220,15%,15%)]", text: "text-[hsl(40,10%,85%)]" },
  { name: "Midnight", bg: "bg-[hsl(240,20%,8%)]", text: "text-[hsl(40,10%,80%)]" },
];

const fonts = ["Sans", "Crimson Pro", "Amiri"];

const readerMenuItems = [
  { icon: Home, label: "Home", path: "/" },
  { icon: BookOpen, label: "Library", path: "/library" },
  { icon: Headphones, label: "Audio", path: "/audio" },
  { icon: Settings, label: "Settings", path: "/settings" },
];

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
  const [searchParams, setSearchParams] = useSearchParams();
  const sectionParam = searchParams.get("section");
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
  const [fontSize, setFontSize] = useState(() => {
    const saved = localStorage.getItem("faydabook-reader-fontsize");
    if (saved) return Number(saved);
    return typeof window !== "undefined" && window.innerWidth < 768 ? 20 : 16;
  });
  const [fitToPage, setFitToPage] = useState(() => {
    return localStorage.getItem("faydabook-reader-fit") === "true";
  });
  const [mainMenuOpen, setMainMenuOpen] = useState(false);
  const [tocOpen, setTocOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [footnotesOpen, setFootnotesOpen] = useState(false);
  const [currentSectionIdx, setCurrentSectionIdx] = useState(() => getSavedProgress(id));
  const contentRef = useRef<HTMLDivElement>(null);
  const [kashifEnData, setKashifEnData] = useState<KashifEnSection[]>([]);
  const [kachifulAlbasData, setKachifulAlbasData] = useState<KachifulSection[]>([]);
  const [conditionsReglesData, setConditionsReglesData] = useState<ConditionsSection[]>([]);
  const [ifadatouData, setIfadatouData] = useState<IfadatouSection[]>([]);
  const [jawahirRasailData, setJawahirRasailData] = useState<JawahirRasailSection[]>([]);
  const [volumeData, setVolumeData] = useState<VolumeSection[]>([]);
  const [loadedVolumeModule, setLoadedVolumeModule] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const touchHasMoved = useRef(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [chromeVisible, setChromeVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const pagedViewRef = useRef<PagedViewHandle>(null);
  const [pagedTotal, setPagedTotal] = useState(1);
  const [pagesPerTurn, setPagesPerTurn] = useState(1);
  const lastScrollY = useRef(0);
  const isMobile = useIsMobile();

  const saveProgress = useSaveProgress(id);
  const { bookmarks, addBookmark, removeBookmark, isBookmarked } = useBookmarks(id);
  const [bookmarkDialogOpen, setBookmarkDialogOpen] = useState(false);
  const [showResumeBanner, setShowResumeBanner] = useState(() => getSavedProgress(id) > 0);

  const {
    setActiveBook,
    playChapter,
    togglePlayPause,
    tts: audioTts,
    book: activeAudioBook,
    chapterIdx: activeChapterIdx,
  } = useAudioPlayer();

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
    const saved = getSavedProgress(id);
    setCurrentSectionIdx(saved);
    setShowResumeBanner(saved > 0);
  }, [id]);

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
    if (book?.contentModule === "jawahir-rasail-en") {
      setLoading(true);
      loadJawahirRasailSections().then((sections) => {
        setJawahirRasailData(sections);
        setLoading(false);
        const saved = getSavedProgress(id);
        if (saved > 0) setCurrentSectionIdx(Math.min(saved, sections.length - 1));
      });
    }
    // Generic volume loader for volumes 1-5, 7-8
    const volumeMap: Record<string, string> = {
      "volume-1-conditions": "/books/volume-1-conditions-rules.txt",
      "volume-2-liturgies": "/books/volume-2-liturgies-prayers.txt",
      "volume-3-ethics": "/books/volume-3-ethics-advice.txt",
      "volume-4-letters": "/books/volume-4-letters.txt",
      "volume-5-commentaries": "/books/volume-5-commentaries.txt",
      "volume-7-biography": "/books/volume-7-biography.txt",
      "volume-8-teachings": "/books/volume-8-other-teachings.txt",
      "jawaheer-al-maani": "/books/jawaheer-al-maani.txt",
    };
    const volumePath = book?.contentModule ? volumeMap[book.contentModule] : undefined;
    if (volumePath && book?.contentModule) {
      setLoading(true);
      setVolumeData([]);
      setLoadedVolumeModule(null);
      loadVolumeSections(volumePath, book.contentModule).then((sections) => {
        setVolumeData(sections);
        setLoadedVolumeModule(book.contentModule);
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
      return mergeAdjacentSections(kachifulAlbasData) as Section[];
    }
    if (book?.contentModule === "kashif-en") {
      // Merge consecutive page-sections that share the same heading so chapter prose
      // flows continuously across CSS-column pagination instead of repeating the heading.
      return mergeAdjacentSections(kashifEnData) as Section[];
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
    if (book?.contentModule === "doua-wazifa") {
      return douaWazifaSections.map((s) => ({ id: s.id, chapter: s.chapter, heading: s.heading, content: s.content }));
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
    if (book?.contentModule === "ifadatou-ahmediyya") {
      return ifadatouData.map((s) => ({ id: s.id, chapter: s.chapter, heading: s.heading, content: s.content }));
    }
    if (book?.contentModule === "jawahir-rasail-en") {
      return jawahirRasailData.map((s) => ({ id: s.id, chapter: s.chapter, heading: s.heading, content: s.content, footnotes: s.footnotes }));
    }
    // Generic volume modules
    const volumeModules = [
      "volume-1-conditions",
      "volume-2-liturgies",
      "volume-3-ethics",
      "volume-4-letters",
      "volume-5-commentaries",
      "volume-7-biography",
      "volume-8-teachings",
      "jawaheer-al-maani",
    ];
    if (book?.contentModule && volumeModules.includes(book.contentModule) && loadedVolumeModule === book.contentModule) {
      return volumeData.map((s) => ({ id: s.id, chapter: s.chapter, heading: s.heading, content: s.content }));
    }
    // Async-loaded module hasn't populated yet — show nothing instead of the sample placeholder
    const asyncModules = ["kashif-en", "kachiful-albas", "conditions-regles", "ifadatou-ahmediyya", "jawahir-rasail-en", ...volumeModules];
    if (book?.contentModule && asyncModules.includes(book.contentModule)) {
      return [];
    }
    return [];
  }, [book?.contentModule, kashifEnData, kachifulAlbasData, conditionsReglesData, ifadatouData, jawahirRasailData, volumeData, loadedVolumeModule]);

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

  // Footnotes for what is *visible* on the current display page. In paged
  // mode the same logical section may span many CSS-column pages, so we ask
  // PagedView which section indices overlap the current page band, then
  // aggregate their pre-extracted footnotes (falling back to a parser).
  const [visibleSectionIdxs, setVisibleSectionIdxs] = useState<number[]>([]);
  useEffect(() => {
    // Wait for the page transform + measurement to settle.
    const raf1 = requestAnimationFrame(() => {
      const raf2 = requestAnimationFrame(() => {
        const idxs = pagedViewRef.current?.getSectionsOnPage(currentSectionIdx) ?? [];
        setVisibleSectionIdxs(idxs.length ? idxs : [currentSectionIdx]);
      });
      return () => cancelAnimationFrame(raf2);
    });
    return () => cancelAnimationFrame(raf1);
  }, [currentSectionIdx, pagedTotal, allSections]);

  const currentFootnotes = useMemo(() => {
    const seen = new Set<string>();
    const out: { number: string; text: string }[] = [];
    for (const idx of visibleSectionIdxs) {
      const s = allSections[idx];
      if (!s || typeof s.content !== "string") continue;
      const pre = (s as { footnotes?: { number: string; text: string }[] }).footnotes;
      const fns = Array.isArray(pre) ? pre : [];
      for (const fn of fns) {
        const key = `${idx}:${fn.number}`;
        if (seen.has(key)) continue;
        seen.add(key);
        out.push(fn);
      }
    }
    return out;
  }, [visibleSectionIdxs, allSections]);


  const goToSection = useCallback((idx: number) => {
    const clamped = Math.max(0, Math.min(idx, effectiveTotalPages - 1));
    // Snap to spread boundary in 2-up mode so the left page is always even-indexed
    const snapped = pagesPerTurn > 1 ? clamped - (clamped % pagesPerTurn) : clamped;
    setCurrentSectionIdx(snapped);
    saveProgress(snapped);
    if (!isPagedMode) {
      contentRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [effectiveTotalPages, saveProgress, isPagedMode, pagesPerTurn]);

  // Keyboard navigation: ArrowLeft/Right + PageUp/PageDown
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (searchOpen) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const target = e.target as HTMLElement | null;
      if (target) {
        const tag = target.tagName;
        if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || target.isContentEditable) return;
      }
      const isRtl = directionForBookLanguage(book?.language) === 'rtl';
      const goPrev = () => {
        if (currentSectionIdx > 0) goToSection(currentSectionIdx - pagesPerTurn);
      };
      const goNext = () => {
        if (currentSectionIdx < effectiveTotalPages - 1) goToSection(currentSectionIdx + pagesPerTurn);
      };
      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          isRtl ? goNext() : goPrev();
          break;
        case 'ArrowRight':
          e.preventDefault();
          isRtl ? goPrev() : goNext();
          break;
        case 'PageUp':
          e.preventDefault();
          goPrev();
          break;
        case 'PageDown':
        case ' ':
          if (e.key === ' ' && e.shiftKey) {
            e.preventDefault();
            goPrev();
          } else if (e.key === 'PageDown') {
            e.preventDefault();
            goNext();
          }
          break;
        case 'Home':
          e.preventDefault();
          goToSection(0);
          break;
        case 'End':
          e.preventDefault();
          goToSection(effectiveTotalPages - 1);
          break;
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [searchOpen, currentSectionIdx, pagesPerTurn, effectiveTotalPages, goToSection, book?.language]);

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

  // Deep link via ?section=N — jump to that logical section once pagination is ready.
  const sectionParamApplied = useRef(false);
  useEffect(() => {
    if (sectionParamApplied.current) return;
    if (!sectionParam || allSections.length === 0 || pagedTotal <= 1) return;
    const n = parseInt(sectionParam, 10);
    if (isNaN(n) || n < 0 || n >= allSections.length) {
      sectionParamApplied.current = true;
      return;
    }
    const targetId = allSections[n].id;
    sectionParamApplied.current = true;
    goToSectionById(targetId);
    setShowResumeBanner(false);
    // strip param so it doesn't fight future navigation
    setSearchParams({}, { replace: true });
  }, [sectionParam, allSections, pagedTotal, goToSectionById, setSearchParams]);

  const handleReadAloud = useCallback(() => {
    if (!book || allSections.length === 0) return;
    const isActiveBook = activeAudioBook?.id === book.id;
    if (isActiveBook) {
      // If the reader is on a different section than what's playing, jump to it.
      if (activeChapterIdx !== currentSectionIdx) {
        playChapter(currentSectionIdx);
        return;
      }
      // Same section: toggle play/pause if there's an active session, else start.
      if (audioTts.isPlaying || audioTts.isPaused || audioTts.isLoading) {
        togglePlayPause();
        return;
      }
      playChapter(currentSectionIdx);
      return;
    }
    setActiveBook(book, allSections, currentSectionIdx);
  }, [book, allSections, activeAudioBook?.id, activeChapterIdx, audioTts.isPlaying, audioTts.isPaused, audioTts.isLoading, togglePlayPause, setActiveBook, playChapter, currentSectionIdx]);

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
    if (book.contentModule === "doua-wazifa") {
      return (
        <>
          <h2 className="text-center font-serif font-bold mb-1" style={{ fontSize }}>{douaWazifaMeta.title}</h2>
          <p className="text-center text-xs text-muted-foreground mb-6">par {douaWazifaMeta.author}</p>
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
    if (book.contentModule === "jawahir-rasail-en") {
      return (
        <>
          <h2 className="text-center font-serif font-bold mb-1" style={{ fontSize }}>{jawahirRasailEnMeta.title}</h2>
          <p className="text-center text-sm text-muted-foreground mb-1">{jawahirRasailEnMeta.subtitle}</p>
          <p className="text-center text-xs text-muted-foreground mb-6">by {jawahirRasailEnMeta.author}</p>
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
       {allSections.map((section, idx) => {
         const prev = idx > 0 ? allSections[idx - 1] : undefined;
         const showPart = !!section.part && section.part !== prev?.part;
         const showChapter = !!section.chapter && section.chapter !== section.part && section.chapter !== prev?.chapter;
         return (
         <div key={section.id} data-section-index={idx} className="paged-section">
           {showPart && (
             <h3
               className="text-center font-serif font-bold text-primary uppercase tracking-[0.2em] mt-8 sm:mt-10 md:mt-12 mb-4 sm:mb-5 md:mb-6"
               style={{ fontSize: fontSize * 0.85, lineHeight: 1.4, breakAfter: 'avoid' as const }}
             >
               {section.part}
             </h3>
           )}
           {showChapter && (
             <h4
               className="text-center font-serif font-semibold text-primary/90 mt-7 sm:mt-9 md:mt-10 mb-5 sm:mb-6 md:mb-7"
               style={{ fontSize: fontSize * 1.25, lineHeight: 1.35, breakAfter: 'avoid' as const }}
             >
               {section.chapter}
             </h4>
           )}
           {section.heading && section.heading !== section.chapter && section.heading !== section.part && (
             <h5
               className="font-serif font-bold text-center mt-5 sm:mt-6 md:mt-7 mb-4 sm:mb-5 md:mb-6"
               style={{ fontSize: fontSize * 1.1, lineHeight: 1.4, breakAfter: 'avoid' as const }}
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
          ) : (
            <FormattedContent
              content={section.content}
              fontSize={fontSize}
              textColor={pagedTextColor}
              dir={directionForBookLanguage(book?.language)}
              lang={book?.language}
              poem={book?.contentModule === "doua-wazifa"}
            />
          )}
         </div>
         );
       })}
    </div>
  ), [allSections, fontSize, pagedTextColor, book?.contentModule, book?.language]);

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
          dir={directionForBookLanguage(book?.language)}
          lang={book?.language}
          poem={book?.contentModule === "doua-wazifa"}
        />
      </div>
    );
  };

  return (
    <div ref={containerRef} className={`reader-shell h-screen ${theme.bg} md:bg-transparent ${theme.text} transition-colors duration-300 flex flex-col`}>
      {book && (
        <SEO
          title={`Lire ${book.title} — Faydabook`}
          description={book.description?.slice(0, 155) || `Lecture immersive de ${book.title}.`}
          path={`/read/${book.id}`}
          image={book.cover}
          type="book"
        />
      )}
      {/* Top bar */}
      <div className={`flex items-center gap-1 px-2 py-2 border-b border-border/20 transition-all duration-300 ${chromeVisible ? '' : 'opacity-0 max-h-0 overflow-hidden !py-0 !border-b-0'}`}>
        <button onClick={() => navigate(-1)} className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full transition-colors hover:bg-accent" aria-label="Go back">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="min-w-0 flex-1">
          {tocItems.length > 1 ? (
            <ChapterDropdown
              tocItems={tocItems}
              currentSectionId={currentSection?.id || ""}
              onSelectSection={goToSectionById}
              themeClasses={{ bg: theme.bg, text: theme.text }}
            />
          ) : (
            <div className="truncate px-2 text-sm font-medium text-foreground/80">{book?.title || "Reader"}</div>
          )}
        </div>
        <button onClick={() => setSearchOpen(true)} className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full transition-colors hover:bg-accent" aria-label="Search in book">
          <Search className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => setFootnotesOpen(true)}
          className="relative flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full transition-colors hover:bg-accent"
          aria-label={`Show footnotes${currentFootnotes.length ? ` (${currentFootnotes.length})` : ""}`}
          title={currentFootnotes.length ? `Footnotes (${currentFootnotes.length})` : "Footnotes"}
        >
          <NotebookText className="h-4 w-4" />
          {currentFootnotes.length > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold leading-none text-primary-foreground">
              {currentFootnotes.length}
            </span>
          )}
        </button>
        <button
          onClick={handleReadAloud}
          disabled={!book || allSections.length === 0}
          className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full transition-colors hover:bg-accent disabled:opacity-50"
          aria-label="Read aloud"
        >
          <Volume2 className={`h-4 w-4 ${activeAudioBook?.id === book?.id ? 'text-primary' : ''}`} />
        </button>
        <button onClick={() => setMainMenuOpen(true)} className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full transition-colors hover:bg-accent" aria-label="Open reader menu">
          <Menu className="h-4 w-4" />
        </button>
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

      {/* Top spacer when chrome is hidden (mobile only — desktop lets the stage backdrop fill) */}
      {!chromeVisible && <div className="flex-shrink-0 h-2 md:hidden" />}

      {/* Reading content */}
      <div
        ref={contentRef}
        className={`flex-1 min-h-0 ${isPagedMode ? 'overflow-hidden flex flex-col pb-12 md:pb-0' : 'overflow-y-auto'} ${isPagedMode ? '' : 'py-8 px-6 max-w-4xl mx-auto'} w-full ${fontClass} ${isPagedMode ? '' : 'leading-relaxed'} ${isPagedMode ? '' : 'cursor-pointer'}`}
        style={{
          fontSize,
          ...(!isPagedMode ? { paddingBottom: chromeVisible ? '11rem' : '5rem' } : {}),
        }}
        onClick={(e) => {
          touchHasMoved.current = false;
          // Desktop tap-to-toggle (mobile uses onTouchEnd)
          if (isMobile) return;
          const target = e.target as HTMLElement;
          if (target.closest('button, a, input, textarea, select, [role="button"]')) return;
          setChromeVisible((v) => !v);
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
          const moved = touchHasMoved.current;
          touchStartX.current = null;
          touchStartY.current = null;
          if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) {
            if (dx < 0 && currentSectionIdx < effectiveTotalPages - 1) goToSection(currentSectionIdx + pagesPerTurn);
            else if (dx > 0 && currentSectionIdx > 0) goToSection(currentSectionIdx - pagesPerTurn);
            return;
          }
          // Tap (no significant movement) toggles the menu chrome
          if (!moved && Math.abs(dx) < 10 && Math.abs(dy) < 10) {
            const target = e.target as HTMLElement;
            // Ignore taps on interactive elements (buttons, links, inputs)
            if (target.closest('button, a, input, textarea, select, [role="button"]')) return;
            setChromeVisible((v) => !v);
          }
        }}
      >
        {loading || bookLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
            <span className="ml-2 text-muted-foreground">Loading book...</span>
          </div>
        ) : (
          <>
            <PagedView
              ref={pagedViewRef}
              page={currentSectionIdx}
              onTotalPagesChange={(total, ppt) => {
                setPagedTotal(total);
                if (ppt && ppt !== pagesPerTurn) setPagesPerTurn(ppt);
              }}
              className="flex-1"
              fitToPage={fitToPage}
              onPrevPage={() => goToSection(currentSectionIdx - pagesPerTurn)}
              onNextPage={() => goToSection(currentSectionIdx + pagesPerTurn)}
              hasPrev={currentSectionIdx > 0}
              hasNext={currentSectionIdx < effectiveTotalPages - 1}
            >
              {pagedContent}
            </PagedView>
          </>
        )}
      </div>

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

      {/* Floating Read-aloud button (persistent so audio stays one tap away) */}
      {!chromeVisible && book && allSections.length > 0 && (() => {
        const banner = showResumeBanner && currentSectionIdx > 0;
        // Banner height ~44px (py-2.5 + text). Offset button below it when present, else sit near top.
        const topClass = banner
          ? 'top-14 sm:top-14 md:top-14'
          : 'top-3 sm:top-3 md:top-4';
        return (
          <button
            onClick={handleReadAloud}
            style={{ right: '0.75rem', left: 'auto' }}
            className={`fixed ${topClass} z-40 flex h-10 w-10 items-center justify-center rounded-full border border-border/60 bg-background/90 shadow-sm backdrop-blur-sm transition-all duration-200 hover:bg-accent`}
            aria-label="Read aloud"
          >
            <Volume2 className={`h-4 w-4 ${activeAudioBook?.id === book?.id ? 'text-primary' : 'text-foreground'}`} />
          </button>
        );
      })()}

      <ReaderBottomBar
        currentPage={currentSectionIdx + 1}
        totalPages={effectiveTotalPages}
        onPrevPage={() => goToSection(currentSectionIdx - pagesPerTurn)}
        onNextPage={() => goToSection(currentSectionIdx + pagesPerTurn)}
        onJumpToPage={(page) => goToSection(page - 1)}
        hasPrev={currentSectionIdx > 0}
        hasNext={currentSectionIdx < effectiveTotalPages - 1}
        expanded={chromeVisible}
      />

      {/* TOC Sheet */}
      <Sheet open={mainMenuOpen} onOpenChange={setMainMenuOpen}>
        <SheetContent side="right" className={`${theme.bg} ${theme.text} w-[78%] sm:max-w-xs lg:max-w-md p-0`}>
          <SheetHeader className="px-4 pt-4 pb-3 border-b border-border/20">
            <SheetTitle className={theme.text}>Main Menu</SheetTitle>
          </SheetHeader>
          <div className="px-3 py-3 space-y-4">
            <div className="space-y-3 rounded-md border border-border/20 px-3 py-3">
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-medium">Layout</span>
                <button
                  onClick={() => {
                    const next = !fitToPage;
                    setFitToPage(next);
                    localStorage.setItem("faydabook-reader-fit", String(next));
                  }}
                  className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${fitToPage ? "bg-primary text-primary-foreground" : "bg-muted text-foreground/80 hover:bg-accent"}`}
                >
                  {fitToPage ? <BookOpen className="h-3.5 w-3.5" /> : <ScrollText className="h-3.5 w-3.5" />}
                  {fitToPage ? "Fit page" : "Scroll page"}
                </button>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">Text size</span>
                  <span className="text-muted-foreground">{fontSize}px</span>
                </div>
                <Slider
                  min={12}
                  max={36}
                  step={2}
                  value={[fontSize]}
                  onValueChange={([next]) => {
                    setFontSize(next);
                    localStorage.setItem("faydabook-reader-fontsize", String(next));
                  }}
                />
              </div>

              <div className="space-y-2">
                <span className="text-sm font-medium">Font</span>
                <div className="flex flex-wrap gap-2">
                  {fonts.map((f, i) => (
                    <button
                      key={f}
                      onClick={() => setFontIdx(i)}
                      className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${i === fontIdx ? "bg-primary text-primary-foreground" : "bg-muted text-foreground/70 hover:bg-accent"}`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-sm font-medium">Theme</span>
                <div className="flex flex-wrap gap-2">
                  {themes.map((t, i) => (
                    <button
                      key={t.name}
                      onClick={() => setThemeIdx(i)}
                      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${i === themeIdx ? "border-primary bg-primary/10 text-foreground" : "border-border/30 bg-muted text-foreground/70 hover:bg-accent"}`}
                    >
                      <span className={`h-3 w-3 rounded-full border border-border/30 ${t.bg}`} />
                      {t.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-medium">Fullscreen</span>
                <button
                  onClick={toggleFullscreen}
                  className="inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1.5 text-xs font-medium text-foreground/80 transition-colors hover:bg-accent"
                >
                  {isFullscreen ? <Minimize className="h-3.5 w-3.5" /> : <Maximize className="h-3.5 w-3.5" />}
                  {isFullscreen ? "Exit" : "Enter"}
                </button>
              </div>

              {currentSection && currentSection.content !== "__ruh__" && (
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-medium">Bookmark</span>
                  <button
                    onClick={() => setBookmarkDialogOpen(true)}
                    className="inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1.5 text-xs font-medium text-foreground/80 transition-colors hover:bg-accent"
                  >
                    {isBookmarked(currentSectionIdx)
                      ? <BookmarkCheck className="h-3.5 w-3.5 text-primary" />
                      : <Bookmark className="h-3.5 w-3.5" />}
                    {isBookmarked(currentSectionIdx) ? "Edit" : "Add"}
                  </button>
                </div>
              )}
            </div>

            {readerMenuItems.map(({ icon: Icon, label, path }) => (
              <button
                key={path}
                onClick={() => {
                  setMainMenuOpen(false);
                  navigate(path);
                }}
                className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm transition-colors hover:bg-primary/10"
              >
                <Icon className="h-4 w-4 text-muted-foreground" />
                <span>{label}</span>
              </button>
            ))}
          </div>
        </SheetContent>
      </Sheet>

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
      <MiniPlayer />

      {/* Footnotes panel for the current page */}
      <Sheet open={footnotesOpen} onOpenChange={setFootnotesOpen}>
        <SheetContent side="right" className={`${theme.bg} ${theme.text} w-[85%] sm:max-w-sm p-0`}>
          <SheetHeader className="px-4 pt-4 pb-3 border-b border-border/20">
            <SheetTitle className={theme.text}>
              Footnotes
              <span className="ml-2 text-xs font-normal text-muted-foreground">
                page {currentSectionIdx + 1}
              </span>
            </SheetTitle>
          </SheetHeader>
          <ScrollArea className="h-[calc(100vh-72px)]">
            <div className="px-4 py-4 space-y-4">
              {currentFootnotes.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No footnotes on this page.
                </p>
              ) : (
                currentFootnotes.map((fn) => (
                  <div key={fn.number} className="flex gap-3">
                    <span className="shrink-0 font-semibold text-primary tabular-nums" style={{ minWidth: "1.6em" }}>
                      {fn.number}.
                    </span>
                    <p className="text-sm leading-relaxed text-foreground/85">{fn.text}</p>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default Reader;

