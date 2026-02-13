import cover1 from "@/assets/book-cover-1.jpg";
import cover7 from "@/assets/book-cover-7.jpg";
import cover8 from "@/assets/book-cover-8.jpg";
import cover2 from "@/assets/book-cover-2.jpg";
import cover3 from "@/assets/book-cover-3.jpg";
import cover4 from "@/assets/book-cover-4.jpg";
import cover5 from "@/assets/book-cover-5.jpg";
import cover6 from "@/assets/book-cover-6.jpg";

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
}

export const books: Book[] = [
  {
    id: "1",
    title: "The Lote Tree of the Utmost Boundary",
    titleAr: "سدرة المنتهى",
    author: "Shaykh Ibrahim Niass",
    cover: cover1,
    language: "English",
    pages: 250,
    tags: ["Sufism", "Poetry", "Theology"],
    description: "A brief, compelling summary of the book's contents, providing a synopsis that invites the reader to explore further into the profound spiritual insights.",
    hasAudio: true,
    progress: 35,
    audioDuration: "4:30:00",
  },
  {
    id: "2",
    title: "Diwan of Divine Knowledge",
    titleAr: "ديوان المعارف الإلهية",
    author: "Shaykh Ibrahim Niass",
    cover: cover2,
    language: "Arabic",
    pages: 180,
    tags: ["Poetry", "Irfan"],
    description: "A collection of spiritual poetry expressing the depths of divine knowledge and the path of the seeker towards the truth.",
    hasAudio: true,
    audioDuration: "3:15:00",
  },
  {
    id: "3",
    title: "The Path of Illumination",
    titleAr: "طريق التنوير",
    author: "Shaykh Ibrahim Niass",
    cover: cover3,
    language: "English",
    pages: 320,
    tags: ["Tarbiyya", "Guidance"],
    description: "A comprehensive guide to spiritual cultivation and the stages of the soul's journey towards divine proximity.",
    hasAudio: false,
    progress: 68,
  },
  {
    id: "4",
    title: "Treasures of Sacred Knowledge",
    titleAr: "كنوز العلم المقدس",
    author: "Shaykh Ibrahim Niass",
    cover: cover4,
    language: "Arabic",
    pages: 410,
    tags: ["Fiqh", "Theology"],
    description: "An exploration of the foundational sciences of Islam as transmitted through the Tijaniyya tradition.",
    hasAudio: true,
    audioDuration: "6:45:00",
  },
  {
    id: "5",
    title: "Moonlit Reflections",
    titleAr: "تأملات في ضوء القمر",
    author: "Shaykh Ibrahim Niass",
    cover: cover5,
    language: "French",
    pages: 195,
    tags: ["Sufism", "Meditation"],
    description: "Meditative writings on the nature of the soul, the cosmos, and the intimate connection between creation and the Creator.",
    hasAudio: true,
    audioDuration: "2:50:00",
  },
  {
    id: "6",
    title: "Gardens of the Righteous",
    titleAr: "رياض الصالحين",
    author: "Shaykh Ibrahim Niass",
    cover: cover6,
    language: "English",
    pages: 275,
    tags: ["Ethics", "Hadith"],
    description: "Selected teachings and narrations compiled for the spiritual nourishment of the contemporary seeker.",
    hasAudio: false,
  },
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
