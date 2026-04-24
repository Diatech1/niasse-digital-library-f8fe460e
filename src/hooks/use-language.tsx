import { createContext, useCallback, useContext, useEffect, useState, ReactNode } from "react";

export type Language = "en" | "fr" | "ar";

const STORAGE_KEY = "faydabook-language";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  dir: "ltr" | "rtl";
}

const LanguageContext = createContext<LanguageContextType>({
  language: "en",
  setLanguage: () => {},
  dir: "ltr",
});

const isRtl = (lang: Language) => lang === "ar";

const applyToDocument = (lang: Language) => {
  const root = document.documentElement;
  root.lang = lang;
  root.dir = isRtl(lang) ? "rtl" : "ltr";
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

  return (
    <LanguageContext.Provider value={{ language, setLanguage, dir: isRtl(language) ? "rtl" : "ltr" }}>
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
