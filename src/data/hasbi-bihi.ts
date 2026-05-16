export interface ArticleSection {
  id: string;
  chapter: string;
  heading: string;
  content: string;
}

// Each verse is a stanza: Arabic line, transliteration, translation — separated
// by blank lines so the reader treats them as distinct paragraphs.
const verses: { ar: string; tr: string; fr: string }[] = [
  { ar: "حَسْبِي بِبَرٍّ رَءُوفٍ", tr: "Hasbī bi-Barrin Ra'ūfin", fr: "Suffisant pour moi est mon Seigneur Gracieux et Compatissant !" },
  { ar: "حَسْبِي بِهِ وَكَفَانِي", tr: "Hasbī bihi wa kafānī", fr: "Il me suffit, et Il est suffisant pour tous mes besoins !" },
  { ar: "حَسْبِي بِهِ وَبِطَٰهَ", tr: "Hasbī bihi wa bi-Tāha", fr: "Il me suffit, ainsi que (Son Prophète) Taha (SAW)." },
  { ar: "حَسْبِي بِشَيْخِي التِّجَانِي", tr: "Hasbī bi-Shaykhī-t Tijānī", fr: "Mon Cheikh (Ahmad) al-Tijani me suffit." },
  { ar: "قَلْبِي لَهُ وَمَرَامِي", tr: "Qalbī lahu wa marāmī", fr: "Mon cœur lui appartient, ainsi que mes désirs (qui sont pour Lui uniquement) !" },
  { ar: "وَقَالَبِي كُلَّ آنِ", tr: "wa qālabī kulla āni", fr: "Et mon corps aussi, toujours !" },
  { ar: "رَبِّ فَدَارِكْ عُبَيْدًا", tr: "Rabbi fadārik 'ubaydān", fr: "Ô mon Seigneur ! Aide ton esclave !" },
  { ar: "سُرْعَةً دُونَ تَوَانِ", tr: "sur'atan dūna tawāni", fr: "Rapidement, sans délai !" },
  { ar: "لَا تَشْمِتَنَّ الْأَعَادِي", tr: "Lā tashmitanna-l a'ādī", fr: "Ne laisse pas mes ennemis se réjouir !" },
  { ar: "وَلَا تُوَسْوِسْ جَنَانِي", tr: "wa lā tuwaswis janāni", fr: "Et protège mon cœur des murmures (du Diable) !" },
  { ar: "فَاجْعَلْ فُؤَادِي كَصَخْرٍ", tr: "fāj'al fu'ādī ka-sakhrin", fr: "Fais que mon cœur soit fort comme une pierre !" },
  { ar: "وَلَا تَضِرْهُ كَبَانِ", tr: "wa lā tadir'hu kabāni", fr: "Et non faible comme un arbre (qui peut être facilement endommagé) !" },
  { ar: "وَلْتَشْفِ لِي كُلَّ شَكْوَى", tr: "Waltashfi lī kulla shakwā", fr: "Soulage-moi de chaque plainte." },
  { ar: "وَلْتَقْضِ هَٰذِي الْأَمَانِي", tr: "waltaqdi hādhī-l amānī", fr: "Et accomplis tous mes espoirs !" },
  { ar: "بِجَاهِ خَيْرِ الْبَرَايَا", tr: "Bi-jāhi khayri-l barāyā", fr: "Par l'honneur du Meilleur de la Création (SAW) !" },
  { ar: "وَجَاهِ الشَّيْخِ التِّجَانِي", tr: "wa jāhi-sh Shaykhi-t Tijāni", fr: "Et l'honneur du Shaykh al-Tijani !" },
  { ar: "وَجَاهِ شَيْخِي وَأَصْلِي", tr: "Wa jāhi Shaykhī wa aslī", fr: "Et par l'honneur de mon Shaykh et de mon Origine !" },
  { ar: "وَالِدِي عَالِي الْمَكَانِ", tr: "wālidī 'ālī-l makāni", fr: "Mon honorable Père !" },
  { ar: "الْحَاجِ عَبْدِ إِلَٰهِ", tr: "Al-Hāji 'Abd-il Ilāhi", fr: "Al-Hajj Abdullahi (le serviteur de son Dieu) !" },
  { ar: "بَهْجَتِي طُولَ الْأَوَانِ", tr: "bahjatī tūla-l awāni", fr: "Ma fierté à travers les âges !" },
  { ar: "مَطْلَبِي رُقْيَا مَقَامٍ", tr: "Matlabī ruqyā maqāmin", fr: "Mon but est de monter en (rang spirituel) !" },
  { ar: "سُرْعَةً فِي ذَا الزَّمَانِ", tr: "sur'atan fi dhā-z zamāni", fr: "Rapidement dans cet âge (de corruption) !" },
  { ar: "مَطْلَبِي إِرْثُ أُصُولِي", tr: "matlabī irtha usūlī", fr: "Mon but est d'hériter (des stations de) mes ancêtres (spirituels) !" },
  { ar: "سُرْعَةً دُونَ تَوَانِ", tr: "sur'atan dūna tawāni", fr: "Rapidement sans délai !" },
  { ar: "فَلَسْتُ أَرْضَىٰ سِوَى إِرْ", tr: "falastu ardā siwā ir", fr: "Car je ne suis pas satisfait de moins que…" },
  { ar: "قَاءٍ لِأَعْلَى الْمَعَانِي", tr: "qā'in li-a'lā-l ma'āni", fr: "… d'être élevé à la plus haute compréhension !" },
  { ar: "أَتْحِفِ الْعَبْدَ مُنَاهُ", tr: "At'hifi-l 'abda munā'hu", fr: "Alors accorde à cet esclave son souhait !" },
  { ar: "إِتْحَافُكُمْ قَدْ كَفَانِي", tr: "it'hāfukum qad kafānī", fr: "Vos dons me suffisent !" },
  { ar: "أَزْكَىٰ سَلَامَيْ سَلَامٍ", tr: "azkā salāmay salāmi", fr: "Que les Salutations les plus pures soient…" },
  { ar: "عَلَىٰ زَعِيمِ الْجِنَانِ", tr: "'alā za'eemi-l jināni", fr: "… sur le Chef du Paradis !" },
  { ar: "مِنْ بَعْدِ كُلِّ صَحَابٍ", tr: "min ba'di kulli sihābin", fr: "Et sur tous ses Compagnons…" },
  { ar: "بَعْدَ آلٍ كُلَّ آنِ", tr: "ba'da ālin kulla āni", fr: "… et sa Famille ! Toujours !" },
];

const content = verses
  .map((v) => `${v.ar}\n\n${v.tr}\n\n${v.fr}`)
  .join("\n\n\n");

export const hasbiBihiSections: ArticleSection[] = [
  {
    id: "hasbi-bihi-1",
    chapter: "Qasīda",
    heading: "Hasbi bihi wa bi Tāhā, Hasbi bi Shaykhī al-Tijānī",
    content,
  },
];
