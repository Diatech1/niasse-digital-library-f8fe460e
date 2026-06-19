export const predictionsDanFodioMeta = {
  title: "Les Prédictions de Cheikh Usman Dan Fodio",
  subtitle: "Annonce de la venue de Cheikh Ibrahim Niasse",
  author: "Cheikh Usman Dan Fodio (1754 — 1817)",
};

export interface PredictionSection {
  id: string;
  chapter: string;
  heading: string;
  content: string;
}

// ---------------------------------------------------------------------------
// FRANÇAIS
// ---------------------------------------------------------------------------

const bioFr = `Cheikh Usman Dan Fodio (1754 — 1817), de son nom complet ʿUthmān ibn Fūdī, est un savant, soufi et réformateur peul né à Maratta, dans l'actuel nord-ouest du Nigeria. Issu d'une lignée de lettrés musulmans, il étudia très jeune le Coran, le fiqh mālikite, la grammaire arabe et le taṣawwuf auprès des grands maîtres de son temps, dont son oncle Cheikh Jibrīl ibn ʿUmar.

Prédicateur infatigable, il parcourut le Hausaland en appelant les populations à un islam purifié, débarrassé des innovations et des compromissions avec les pratiques préislamiques. Face à l'hostilité des autorités locales, il déclencha en 1804 le célèbre jihād qui aboutit à la fondation du califat de Sokoto, l'un des plus vastes États musulmans d'Afrique au XIXᵉ siècle.

Affilié à la voie qādiriyya, Cheikh Usman était également un mystique de haute stature, auteur de plus de cent ouvrages en arabe, en fulfulde et en haoussa, couvrant la théologie, le droit, la spiritualité et la poésie. Ses écrits demeurent une référence dans toute l'Afrique de l'Ouest.

Parmi ses œuvres, certains poèmes annoncent la venue d'un grand réformateur de l'occident lointain, identifié par la tradition tijaniyya à Cheikh Ibrāhīm Niasse (1900 — 1975), Ṣāḥib al-Fayḍa. Les dix vers qui suivent comptent parmi les plus célèbres de ces prédictions.`;

const versesFr: string[] = [
  "Je remercie Dieu et prie sur le Prophète. Écoute bien, toi qui demandes après le Mahdi.",
  "Viendra dans ces contrées un homme venant de l'ouest. Son assemblée sera constituée d'assistants du Mahdi, en vue de raffermir la religion et de lutter contre le polythéisme et l'innovation religieuse.",
  "Cet homme viendra de l'occident lointain et ses hommes seront les aides du Mahdi.",
  "Quand viendra cet homme, vous et vos princes ne serez plus suivis, sauf à travers lui…",
  "Il apparaîtra à l'an (min charafin), dont le poids numérique est 1370, correspondant à l'année 1951 de l'ère chrétienne.",
  "Cet homme a un visage large et sa marque est sur son visage. Comprends !",
  "Cet homme a une peau noire, une barbe fournie, une poitrine large et de gros yeux comme ceux d'un bœuf libre dans la prairie.",
  "Cet homme effectuera plusieurs visites au Prophète Mohammed et son père porte le même nom que celui du Prophète.",
  "Son vrai surnom est le noble de la religion, beau présage de sa mission consistant à restaurer la noblesse de la religion après son déclin. Son nom apparent sera Ibrahim.",
  "Ces dix vers, je les ai composés pour le chercheur, au nombre de dix, etc…",
];

const introFr = `Cheikh Usman Dan Fodio (1754 — 1817), réformateur peul du Sokoto, a laissé ces dix vers annonçant la venue d'un homme qui ranimerait la religion. La tradition tijaniyya y reconnaît la description de Cheikh Ibrahim Niasse — Ṣāḥib al-Fayḍa.`;

const bodyFr = versesFr.map((v, i) => `${i + 1}. ${v}`).join("\n\n");

const closingFr = `**Alḥamdoulillāh.**`;

// ---------------------------------------------------------------------------
// ENGLISH
// ---------------------------------------------------------------------------

const bioEn = `Shaykh Usman Dan Fodio (1754 — 1817), in full ʿUthmān ibn Fūdī, was a Fulani scholar, Sufi and reformer born in Maratta, in what is now north-western Nigeria. Coming from a long line of Muslim scholars, he memorised the Qurʾān as a child and studied Mālikī jurisprudence, Arabic grammar and taṣawwuf under the great masters of his time, including his uncle Shaykh Jibrīl ibn ʿUmar.

A tireless preacher, he travelled across Hausaland calling people back to a purified Islam, free from innovation and from compromises with pre-Islamic customs. Faced with the hostility of the local rulers, in 1804 he launched the famous jihād that led to the founding of the Sokoto Caliphate, one of the largest Muslim states of nineteenth-century Africa.

Affiliated with the Qādiriyya order, Shaykh Usman was also a mystic of great stature and the author of more than a hundred works in Arabic, Fulfulde and Hausa, covering theology, law, spirituality and poetry. His writings remain a reference across the whole of West Africa.

Among his works, several poems announce the coming of a great reformer from the far West — identified by the Tijānī tradition as Shaykh Ibrāhīm Niasse (1900 — 1975), Ṣāḥib al-Fayḍa. The ten verses that follow are among the most celebrated of those predictions.`;

const versesEn: string[] = [
  "I thank God and pray upon the Prophet. Listen well, O you who ask about the Mahdī.",
  "There shall come to these lands a man from the West. His assembly will be made up of helpers of the Mahdī, to strengthen the religion and to fight polytheism and innovation in religion.",
  "This man shall come from the far West, and his companions shall be the helpers of the Mahdī.",
  "When this man comes, neither you nor your princes will be followed any longer, except through him…",
  "He will appear in the year (min sharafin), whose numerical value is 1370, corresponding to the year 1951 of the Christian era.",
  "This man has a broad face, and his mark is upon his face. Understand!",
  "This man has dark skin, a full beard, a broad chest, and large eyes like those of an ox roaming freely in the meadow.",
  "This man will make many visits to the Prophet Muḥammad, and his father bears the same name as that of the Prophet.",
  "His true title is 'the Noble of the Religion' — a beautiful sign of his mission, which is to restore the nobility of the religion after its decline. His apparent name shall be Ibrāhīm.",
  "These ten verses I have composed for the seeker, ten in number, and so forth…",
];

const introEn = `Shaykh Usman Dan Fodio (1754 — 1817), Fulani reformer of Sokoto, left these ten verses announcing the coming of a man who would revive the religion. The Tijānī tradition recognises in them the description of Shaykh Ibrāhīm Niasse — Ṣāḥib al-Fayḍa.`;

const bodyEn = versesEn.map((v, i) => `${i + 1}. ${v}`).join("\n\n");

const closingEn = `**Alḥamdulillāh.**`;

// ---------------------------------------------------------------------------

export const predictionsDanFodioSections: PredictionSection[] = [
  {
    id: "predictions-dan-fodio-bio-fr",
    chapter: "Français",
    heading: "Biographie de Cheikh Usman Dan Fodio",
    content: bioFr,
  },
  {
    id: "predictions-dan-fodio-fr",
    chapter: "Français",
    heading: "Les dix vers de Cheikh Usman Dan Fodio",
    content: `${introFr}\n\n${bodyFr}\n\n${closingFr}`,
  },
  {
    id: "predictions-dan-fodio-bio-en",
    chapter: "English",
    heading: "Biography of Shaykh Usman Dan Fodio",
    content: bioEn,
  },
  {
    id: "predictions-dan-fodio-en",
    chapter: "English",
    heading: "The Ten Verses of Shaykh Usman Dan Fodio",
    content: `${introEn}\n\n${bodyEn}\n\n${closingEn}`,
  },
];
