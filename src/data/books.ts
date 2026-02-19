import cover7 from "@/assets/book-cover-7.jpg";
import cover8 from "@/assets/book-cover-8.jpg";
import cover9 from "@/assets/book-cover-9.jpg";
import cover9b from "@/assets/book-cover-9b.jpg";
import cover11 from "@/assets/book-cover-11.jpg";
import cover12 from "@/assets/book-cover-12.jpg";


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
  {
    id: "9",
    title: "Kâchiful Albâs",
    titleAr: "كاشف الإلباس",
    author: "Cheikh Al Islam Elhadji Ibrahima Niass",
    cover: cover9b,
    language: "French",
    pages: 201,
    tags: ["Faydhah", "Sufism", "Theology", "Tarbiyya"],
    description: "La Levée des Équivoques concernant la Fayda du Sceau Abil Abbas — Un traité majeur défendant et expliquant la Fayda Tijâniyya, ses fondements coraniques, les réalités du soufisme et l'importance du Zikr. Traduit de l'arabe par Mouhammadou Lasse Khar BA et Oustaze Djim GUEYE.",
    hasAudio: false,
    contentModule: "kachiful-albas",
  },
  {
    id: "10",
    title: "The Removal of Confusion",
    titleAr: "كاشف الإلباس",
    author: "Shaykh Ibrahim Niasse",
    cover: cover9,
    language: "English",
    pages: 392,
    tags: ["Faydhah", "Sufism", "Theology", "Tarbiyya"],
    description: "The Removal of Confusion Concerning the Flood of the Saintly Seal Aḥmad al-Tijānī — The magnum opus of Shaykh al-Islam Ibrāhīm Niasse, a comprehensive treatise on Sufism, spiritual training, and the Tijānī Flood. Translated by Zachary Wright, Muhtar Holland and Abdullahi El-Okene.",
    hasAudio: false,
    contentModule: "kashif-en",
  },
  {
    id: "11",
    title: "Le Wird Tidjane",
    titleAr: "الورد التجاني",
    author: "Tradition Tijâniyya",
    cover: cover11,
    language: "French",
    pages: 10,
    tags: ["Wird", "Dhikr", "Pratique", "Tarbiyya"],
    description: "Le Wird Tidjane — Les conditions de la voie, le Lazim, la Wazifa, la Jawaratoul Kamal, le Dhikr du vendredi et les règles de réparation. Un guide complet pour la pratique quotidienne de la Tarîqa Tijâniyya.",
    hasAudio: false,
    contentModule: "wird-tidjane",
  },
  {
    id: "12",
    title: "Les Stations de l'Islam",
    titleAr: "مقامات ومنازل وحضرات",
    author: "Cheikh Ibrahim Niass",
    cover: cover12,
    language: "French",
    pages: 8,
    tags: ["Maqamat", "Tasawwuf", "Doctrine", "Tarbiyya"],
    description: "Synthèse de deux lettres de Cheikh Ibrahim Niass sur la classification des étapes de la religion — Islam, Imân, Ihsân — et des neuf stations mystiques du cheminement spirituel.",
    hasAudio: false,
    contentModule: "stations-islam",
  },
];
