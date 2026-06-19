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

// 10 numbered verses of prediction. Rendered as standalone paragraphs so
// each prediction reads as a distinct utterance.
const verses: string[] = [
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

const intro = `Cheikh Usman Dan Fodio (1754 — 1817), réformateur peul du Sokoto, a laissé ces dix vers annonçant la venue d'un homme qui ranimerait la religion. La tradition tijaniyya y reconnaît la description de Cheikh Ibrahim Niasse — Ṣāḥib al-Fayḍa.`;

const body = verses
  .map((v, i) => `${i + 1}. ${v}`)
  .join("\n\n");

const closing = `**Alḥamdoulillāh.**`;

export const predictionsDanFodioSections: PredictionSection[] = [
  {
    id: "predictions-dan-fodio-1",
    chapter: "Les Prédictions",
    heading: "Les dix vers de Cheikh Usman Dan Fodio",
    content: `${intro}\n\n${body}\n\n${closing}`,
  },
];
