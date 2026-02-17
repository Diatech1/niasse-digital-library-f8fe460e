export const kachifulAlbasMeta = {
  title: "Kâchiful Albâs",
  subtitle: "La Levée des Équivoques concernant la Fayda du Sceau Abil Abbas",
  author: "Cheikh Al Islam Elhadji Ibrahima Niass",
  translators: "Mouhammadou Lasse Khar BA et Oustaze Djim GUEYE",
};

export interface KachifulSection {
  id: string;
  part: string;
  chapter: string;
  heading: string;
  content: string;
}

// Section markers to parse from the raw text file
const SECTION_MARKERS = [
  { line: "AVANT PROPOS", part: "", chapter: "Avant-propos", heading: "Avant-propos" },
  { line: "INTRODUCTION", part: "", chapter: "Introduction", heading: "Introduction — L'éducation spirituelle (Tarbiya)" },
  { line: "PREMIERE PARTIE", part: "Première Partie", chapter: "Première Partie", heading: "Première Partie" },
  { line: "LES REALITES DU SOUFISME ET L'ORIGINE DE LA TRANSMISSION DES ZIKR", part: "Première Partie", chapter: "Chapitre I — Les réalités du soufisme", heading: "Les réalités du soufisme et l'origine de la transmission des Zikr" },
  { line: "LES BIENFAITS DU ZIKR", part: "Première Partie", chapter: "Chapitre II — Les bienfaits du Zikr", heading: "Les bienfaits du Zikr" },
  { line: "LA REUNION POUR LE ZIKR", part: "Première Partie", chapter: "Chapitre III — La récitation du Coran", heading: "La réunion pour le Zikr ; l'exhortation à l'apprentissage du Coran et le rassemblement pour la récitation du Coran" },
  { line: "DEUXIEME PARTIE", part: "Deuxième Partie", chapter: "Deuxième Partie", heading: "Deuxième Partie" },
  { line: "LA FAYDA TIJANIYA", part: "Deuxième Partie", chapter: "Chapitre I — La Fayda Tijâniya", heading: "La Fayda Tijâniya ; ce que son fondateur en a dit ainsi que les hommes de Dieu et ses références dans le Coran et la Tradition" },
  { line: "LES CONNAISSANCES EXPERIMENTALES", part: "Deuxième Partie", chapter: "Chapitre II — Les connaissances expérimentales", heading: "Les connaissances expérimentales et leur argumentation dans le Coran et la Tradition" },
  { line: "LES METHODES D'EDUCATION SPIRITUELLE", part: "Deuxième Partie", chapter: "Chapitre III — L'éducation spirituelle", heading: "Les méthodes d'éducation spirituelle dans la voie Tijâne" },
  { line: "TROISIEME PARTIE", part: "Troisième Partie", chapter: "Troisième Partie", heading: "Troisième Partie" },
  { line: "MISE EN GARDE CONTRE LA CONTRADICTION", part: "Troisième Partie", chapter: "Chapitre I — Mise en garde", heading: "Mise en garde contre la contradiction des élus de Dieu et ce que doivent être les qualités de celui qui a droit à la contradiction" },
  { line: "LA NECESSITE DE RECHERCHER UN GUIDE", part: "Troisième Partie", chapter: "Chapitre II — Le guide spirituel", heading: "La nécessité de rechercher un guide droit ; les qualités qui définissent le guide et les relations du disciple avec ce guide" },
  { line: "PROPOS DESTINES A UN CHAPITRE PRECEDENT", part: "Troisième Partie", chapter: "Chapitre II (suite)", heading: "Propos destinés à un chapitre précédent du livre et rapportés dans ce chapitre" },
  { line: "LA VERACITE DE LA VISION", part: "Troisième Partie", chapter: "Chapitre III — La vision divine", heading: "La véracité de la vision que prétendent avoir eu les hommes de Dieu et ce qu'en ont dit les savants" },
  { line: "CONCLUSION", part: "Conclusion", chapter: "Conclusion", heading: "Conclusion" },
  { line: "Présentation de l", part: "Annexes", chapter: "Autorisations (Idjâzah)", heading: "Présentation des autorisations (Idjâzah)" },
];

function normalizeApostrophes(text: string): string {
  return text.replace(/[\u2018\u2019\u201A\u201B\u0060\u00B4\u2032]/g, "'");
}

function cleanContent(text: string): string {
  return text
    // Convert standalone page numbers into markers
    .replace(/^\s*(\d{1,3})\s*$/gm, "\n\n{{PAGE:$1}}\n\n")
    // Remove chapter headers that appear inline (all-caps lines that are section markers)
    .replace(/^CHAPITRE [IVX]+\s*$/gm, "")
    .replace(/^Chapitre [IVX]+\s*$/gm, "")
    .replace(/^Elle contient trois chap[iî]tres[.:]\s*$/gm, "")
    .replace(/^Elle est composée de Trois chap[iî]tres[.:]\s*$/gm, "")
    // Collapse multiple blank lines
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/**
 * Split a long section into smaller sub-sections of roughly `maxParagraphs` paragraphs each.
 */
function splitSection(
  section: KachifulSection,
  maxParagraphs: number = 12
): KachifulSection[] {
  const paragraphs = section.content.split("\n\n").filter((p) => p.trim().length > 0);
  if (paragraphs.length <= maxParagraphs) return [section];

  const result: KachifulSection[] = [];
  for (let i = 0; i < paragraphs.length; i += maxParagraphs) {
    const chunk = paragraphs.slice(i, i + maxParagraphs);
    const subIdx = Math.floor(i / maxParagraphs) + 1;
    result.push({
      id: `${section.id}-${subIdx}`,
      part: section.part,
      chapter: section.chapter,
      heading: subIdx === 1 ? section.heading : `${section.heading} (suite ${subIdx})`,
      content: chunk.join("\n\n"),
    });
  }
  return result;
}

export async function loadKachifulAlbasSections(): Promise<KachifulSection[]> {
  const response = await fetch("/books/kachiful-albas-fr.txt");
  const text = await response.text();
  const lines = text.split("\n");

  const rawSections: KachifulSection[] = [];
  let currentMarkerIdx = -1;
  let currentStart = -1;

  // Skip the title page + table of contents (first ~48 lines)
  const scanStart = 48;

  for (let i = scanStart; i < lines.length; i++) {
    const line = normalizeApostrophes(lines[i].trim()).toUpperCase();

    // Check if this line matches any section marker (in order)
    for (let m = currentMarkerIdx + 1; m < SECTION_MARKERS.length; m++) {
      if (line.startsWith(normalizeApostrophes(SECTION_MARKERS[m].line).toUpperCase())) {
        // Save previous section
        if (currentMarkerIdx >= 0 && currentStart >= 0) {
          const marker = SECTION_MARKERS[currentMarkerIdx];
          const content = cleanContent(lines.slice(currentStart, i).join("\n"));
          if (content.length > 50) {
            rawSections.push({
              id: `kfr-${currentMarkerIdx}`,
              part: marker.part,
              chapter: marker.chapter,
              heading: marker.heading,
              content,
            });
          }
        }
        currentMarkerIdx = m;
        currentStart = i + 1;
        break;
      }
    }
  }

  // Save last section
  if (currentMarkerIdx >= 0 && currentStart >= 0) {
    const marker = SECTION_MARKERS[currentMarkerIdx];
    const content = cleanContent(lines.slice(currentStart).join("\n"));
    if (content.length > 50) {
      rawSections.push({
        id: `kfr-${currentMarkerIdx}`,
        part: marker.part,
        chapter: marker.chapter,
        heading: marker.heading,
        content,
      });
    }
  }

  // Split long sections into manageable sub-sections
  const sections: KachifulSection[] = [];
  for (const s of rawSections) {
    sections.push(...splitSection(s));
  }

  return sections;
}
