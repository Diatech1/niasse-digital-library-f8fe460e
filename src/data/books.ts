import cover7 from "@/assets/book-cover-7.jpg";
import cover8 from "@/assets/book-cover-8.jpg";

export interface Book {
  id: string;
  title: string;
  titleAr?: string;
  author: string;
  cover: string;
  language: string;
  pages: number;
  tags: string[];
  description: string;
  hasAudio: boolean;
  progress?: number;
  audioDuration?: string;
  contentModule?: string;
  isFavorite?: boolean;
}

export const books: Book[] = [
  {
    id: "7",
    title: "Rūḥ al-Adab",
    titleAr: "روح الأدب",
    author: "Cheikh Ibrahim Niasse",
    cover: cover7,
    language: "English",
    pages: 121,
    tags: ["Adab", "Poetry", "Tarbiyya", "Ethics"],
    description: "The Spirit of Good Morals — A poetic treatise on spiritual etiquette, the path of the seeker, and the virtues essential for the Tijani disciple. Transliterated by Abdulahi Thani Zainul Inyass.",
    hasAudio: true,
    audioDuration: "1:45:00",
    contentModule: "ruh-al-adab",
    isFavorite: true,
  },
  {
    id: "8",
    title: "Comprendre la Faydhah Tijâniyyah",
    titleAr: "فهم الفيضة التجانية",
    author: "Fakhruddin Owaisi al-Tijânî",
    cover: cover8,
    language: "French",
    pages: 50,
    tags: ["Faydhah", "Theology", "Sufism", "Tarbiyya"],
    description: "A comprehensive treatise on understanding the Faydhah Tijâniyyah — the great spiritual effusion predicted by Shaykh Ahmad al-Tijânî and manifested through Shaykh Ibrâhîm Niass. Translated from English by Sîdî Maodo Diop al-Fûtî.",
    hasAudio: false,
    contentModule: "comprendre-faydhah",
  },
];
