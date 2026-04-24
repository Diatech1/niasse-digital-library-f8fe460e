import type { Language } from "@/hooks/use-language";

export type TranslationKey =
  | "app.tagline"
  | "nav.home"
  | "nav.library"
  | "nav.audio"
  | "nav.settings"
  | "common.searchBooks"
  | "common.seeAll"
  | "common.noBooksFound"
  | "common.bookNotFound"
  | "home.continueReading"
  | "home.favorites"
  | "home.library"
  | "home.searchResults"
  | "library.title"
  | "library.subtitle"
  | "library.lang.all"
  | "library.lang.english"
  | "library.lang.arabic"
  | "library.lang.french"
  | "audio.title"
  | "audio.subtitle"
  | "book.translation"
  | "book.pages"
  | "book.read"
  | "book.listen"
  | "settings.title"
  | "settings.subtitle"
  | "settings.appearance"
  | "settings.theme.light"
  | "settings.theme.dark"
  | "settings.theme.system"
  | "settings.reading"
  | "settings.fontSize"
  | "settings.fontFamily"
  | "settings.fitToPage"
  | "settings.fitToPage.desc"
  | "settings.language"
  | "settings.interfaceLanguage"
  | "settings.data"
  | "settings.clearReading"
  | "settings.clearReading.desc"
  | "settings.clearReading.toast"
  | "settings.about"
  | "settings.contact"
  | "settings.madeWith";

type Dict = Record<TranslationKey, string>;

const en: Dict = {
  "app.tagline": "The Digital Library of the Fayda",
  "nav.home": "Home",
  "nav.library": "Library",
  "nav.audio": "Audio",
  "nav.settings": "Settings",
  "common.searchBooks": "Search books...",
  "common.seeAll": "See All",
  "common.noBooksFound": "No books found",
  "common.bookNotFound": "Book not found",
  "home.continueReading": "Continue Reading",
  "home.favorites": "Favorites",
  "home.library": "Library",
  "home.searchResults": "Search Results",
  "library.title": "Library",
  "library.subtitle": "Browse all works",
  "library.lang.all": "All",
  "library.lang.english": "English",
  "library.lang.arabic": "Arabic",
  "library.lang.french": "French",
  "audio.title": "Audiobooks",
  "audio.subtitle": "Listen to sacred teachings",
  "book.translation": "Translation",
  "book.pages": "Pages",
  "book.read": "Read Book",
  "book.listen": "Listen to Audio",
  "settings.title": "Settings",
  "settings.subtitle": "Customize your reading experience",
  "settings.appearance": "Appearance",
  "settings.theme.light": "Light",
  "settings.theme.dark": "Dark",
  "settings.theme.system": "System",
  "settings.reading": "Reading",
  "settings.fontSize": "Font size",
  "settings.fontFamily": "Font family",
  "settings.fitToPage": "Fit to page",
  "settings.fitToPage.desc": "Auto-resize text per page",
  "settings.language": "Language",
  "settings.interfaceLanguage": "Interface language",
  "settings.data": "Data",
  "settings.clearReading": "Clear reading data",
  "settings.clearReading.desc": "Remove progress & bookmarks",
  "settings.clearReading.toast": "Reading history & bookmarks cleared",
  "settings.about": "About",
  "settings.contact": "Contact",
  "settings.madeWith": "Made with {heart} for the Tijānī community",
};

const fr: Dict = {
  "app.tagline": "La bibliothèque numérique de la Fayda",
  "nav.home": "Accueil",
  "nav.library": "Bibliothèque",
  "nav.audio": "Audio",
  "nav.settings": "Réglages",
  "common.searchBooks": "Rechercher des livres...",
  "common.seeAll": "Tout voir",
  "common.noBooksFound": "Aucun livre trouvé",
  "common.bookNotFound": "Livre introuvable",
  "home.continueReading": "Reprendre la lecture",
  "home.favorites": "Favoris",
  "home.library": "Bibliothèque",
  "home.searchResults": "Résultats",
  "library.title": "Bibliothèque",
  "library.subtitle": "Parcourir toutes les œuvres",
  "library.lang.all": "Toutes",
  "library.lang.english": "Anglais",
  "library.lang.arabic": "Arabe",
  "library.lang.french": "Français",
  "audio.title": "Livres audio",
  "audio.subtitle": "Écouter les enseignements sacrés",
  "book.translation": "Traduction",
  "book.pages": "Pages",
  "book.read": "Lire le livre",
  "book.listen": "Écouter l'audio",
  "settings.title": "Réglages",
  "settings.subtitle": "Personnalisez votre lecture",
  "settings.appearance": "Apparence",
  "settings.theme.light": "Clair",
  "settings.theme.dark": "Sombre",
  "settings.theme.system": "Système",
  "settings.reading": "Lecture",
  "settings.fontSize": "Taille du texte",
  "settings.fontFamily": "Police",
  "settings.fitToPage": "Ajuster à la page",
  "settings.fitToPage.desc": "Redimensionner le texte automatiquement",
  "settings.language": "Langue",
  "settings.interfaceLanguage": "Langue de l'interface",
  "settings.data": "Données",
  "settings.clearReading": "Effacer les données de lecture",
  "settings.clearReading.desc": "Supprimer la progression et les signets",
  "settings.clearReading.toast": "Historique de lecture et signets effacés",
  "settings.about": "À propos",
  "settings.contact": "Contact",
  "settings.madeWith": "Fait avec {heart} pour la communauté Tijānī",
};

const ar: Dict = {
  "app.tagline": "المكتبة الرقمية للفيضة",
  "nav.home": "الرئيسية",
  "nav.library": "المكتبة",
  "nav.audio": "الصوتيات",
  "nav.settings": "الإعدادات",
  "common.searchBooks": "ابحث عن الكتب...",
  "common.seeAll": "عرض الكل",
  "common.noBooksFound": "لا توجد كتب",
  "common.bookNotFound": "الكتاب غير موجود",
  "home.continueReading": "متابعة القراءة",
  "home.favorites": "المفضلة",
  "home.library": "المكتبة",
  "home.searchResults": "نتائج البحث",
  "library.title": "المكتبة",
  "library.subtitle": "تصفح جميع الأعمال",
  "library.lang.all": "الكل",
  "library.lang.english": "الإنجليزية",
  "library.lang.arabic": "العربية",
  "library.lang.french": "الفرنسية",
  "audio.title": "الكتب الصوتية",
  "audio.subtitle": "استمع إلى التعاليم المقدسة",
  "book.translation": "ترجمة",
  "book.pages": "صفحات",
  "book.read": "قراءة الكتاب",
  "book.listen": "الاستماع إلى الصوت",
  "settings.title": "الإعدادات",
  "settings.subtitle": "خصّص تجربة القراءة",
  "settings.appearance": "المظهر",
  "settings.theme.light": "فاتح",
  "settings.theme.dark": "داكن",
  "settings.theme.system": "النظام",
  "settings.reading": "القراءة",
  "settings.fontSize": "حجم الخط",
  "settings.fontFamily": "نوع الخط",
  "settings.fitToPage": "ملاءمة الصفحة",
  "settings.fitToPage.desc": "تغيير حجم النص تلقائياً",
  "settings.language": "اللغة",
  "settings.interfaceLanguage": "لغة الواجهة",
  "settings.data": "البيانات",
  "settings.clearReading": "مسح بيانات القراءة",
  "settings.clearReading.desc": "حذف التقدم والإشارات المرجعية",
  "settings.clearReading.toast": "تم مسح سجل القراءة والإشارات",
  "settings.about": "حول",
  "settings.contact": "تواصل",
  "settings.madeWith": "صُنع بـ {heart} لمجتمع التجاني",
};

const dictionaries: Record<Language, Dict> = { en, fr, ar };

export const translate = (
  lang: Language,
  key: TranslationKey,
  vars?: Record<string, string>
): string => {
  const dict = dictionaries[lang] ?? en;
  let value = dict[key] ?? en[key] ?? key;
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      value = value.replace(`{${k}}`, v);
    }
  }
  return value;
};
