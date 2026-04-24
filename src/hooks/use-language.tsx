import { createContext, useCallback, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import { translate, type TranslationKey } from "@/i18n/translations";

export type Language = "en" | "fr" | "ar";

const STORAGE_KEY = "faydabook-language";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  dir: "ltr" | "rtl";
  t: (key: TranslationKey, vars?: Record<string, string>) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  language: "en",
  setLanguage: () => {},
  dir: "ltr",
  t: (key) => key,
});

const isRtl = (lang: Language) => lang === "ar";

const applyToDocument = (lang: Language) => {
  const root = document.documentElement;
  root.lang = lang;
  root.dir = isRtl(lang) ? "rtl" : "ltr";

  // Sync <title> and meta description with the active UI language
  const title = translate(lang, "app.title");
  const description = translate(lang, "app.metaDescription");
  document.title = title;

  const setMeta = (selector: string, content: string) => {
    const el = document.head.querySelector<HTMLMetaElement>(selector);
    if (el) el.setAttribute("content", content);
  };
  setMeta('meta[name="description"]', description);
  setMeta('meta[property="og:title"]', title);
  setMeta('meta[name="twitter:title"]', title);
  setMeta('meta[property="og:description"]', description);
  setMeta('meta[name="twitter:description"]', description);
  setMeta('meta[property="og:locale"]', lang === "fr" ? "fr_FR" : lang === "ar" ? "ar_AR" : "en_US");
};

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = (localStorage.getItem(STORAGE_KEY) as Language) || "en";
    return saved;
  });

  useEffect(() => {
    applyToDocument(language);
    localStorage.setItem(STORAGE_KEY, language);
  }, [language]);

  // Sync across tabs and other components writing to localStorage directly
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        setLanguageState(e.newValue as Language);
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
  }, []);

  const t = useCallback(
    (key: TranslationKey, vars?: Record<string, string>) => translate(language, key, vars),
    [language]
  );

  const value = useMemo(
    () => ({ language, setLanguage, dir: isRtl(language) ? "rtl" as const : "ltr" as const, t }),
    [language, setLanguage, t]
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);

/**
 * Detect the natural reading direction for a piece of book content
 * based on the book's own language (not the UI language).
 */
export const directionForBookLanguage = (bookLang?: string): "ltr" | "rtl" => {
  if (!bookLang) return "ltr";
  const normalized = bookLang.toLowerCase();
  if (normalized.startsWith("ar") || normalized === "arabic" || normalized === "العربية") {
    return "rtl";
  }
  return "ltr";
};
