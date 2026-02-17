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
  pageNumber: number;
}

// Chapter markers – used to track part/chapter context for each page
const SECTION_MARKERS = [
  { line: "AVANT PROPOS", part: "", chapter: "Avant-propos", heading: "Avant-propos" },
  { line: "INTRODUCTION", part: "", chapter: "Introduction", heading: "Introduction — L'éducation spirituelle (Tarbiya)" },
  { line: "PREMIERE PARTIE", part: "", chapter: "Première Partie", heading: "Première Partie" },
  { line: "LES REALITES DU SOUFISME ET L'ORIGINE DE LA TRANSMISSION DES ZIKR", part: "Première Partie", chapter: "Chapitre I — Les réalités du soufisme", heading: "Les réalités du soufisme et l'origine de la transmission des Zikr" },
  { line: "LES BIENFAITS DU ZIKR", part: "Première Partie", chapter: "Chapitre II — Les bienfaits du Zikr", heading: "Les bienfaits du Zikr" },
  { line: "LA REUNION POUR LE ZIKR", part: "Première Partie", chapter: "Chapitre III — La récitation du Coran", heading: "La réunion pour le Zikr ; l'exhortation à l'apprentissage du Coran et le rassemblement pour la récitation du Coran" },
  { line: "DEUXIEME PARTIE", part: "", chapter: "Deuxième Partie", heading: "Deuxième Partie" },
  { line: "LA FAYDA TIJANIYA", part: "Deuxième Partie", chapter: "Chapitre I — La Fayda Tijâniya", heading: "La Fayda Tijâniya ; ce que son fondateur en a dit ainsi que les hommes de Dieu et ses références dans le Coran et la Tradition" },
  { line: "LES CONNAISSANCES EXPERIMENTALES", part: "Deuxième Partie", chapter: "Chapitre II — Les connaissances expérimentales", heading: "Les connaissances expérimentales et leur argumentation dans le Coran et la Tradition" },
  { line: "LES METHODES D'EDUCATION SPIRITUELLE", part: "Deuxième Partie", chapter: "Chapitre III — L'éducation spirituelle", heading: "Les méthodes d'éducation spirituelle dans la voie Tijâne" },
  { line: "TROISIEME PARTIE", part: "", chapter: "Troisième Partie", heading: "Troisième Partie" },
  { line: "MISE EN GARDE CONTRE LA CONTRADICTION", part: "Troisième Partie", chapter: "Chapitre I — Mise en garde", heading: "Mise en garde contre la contradiction des élus de Dieu et ce que doivent être les qualités de celui qui a droit à la contradiction" },
  { line: "LA NECESSITE DE RECHERCHER UN GUIDE", part: "Troisième Partie", chapter: "Chapitre II — Le guide spirituel", heading: "La nécessité de rechercher un guide droit ; les qualités qui définissent le guide et les relations du disciple avec ce guide" },
  { line: "PROPOS DESTINES A UN CHAPITRE PRECEDENT", part: "Troisième Partie", chapter: "Chapitre II (suite)", heading: "Propos destinés à un chapitre précédent du livre et rapportés dans ce chapitre" },
  { line: "LA VERACITE DE LA VISION", part: "Troisième Partie", chapter: "Chapitre III — La vision divine", heading: "La véracité de la vision que prétendent avoir eu les hommes de Dieu et ce qu'en ont dit les savants" },
  { line: "CONCLUSION", part: "", chapter: "Conclusion", heading: "Conclusion" },
  { line: "Présentation de l", part: "", chapter: "Annexes", heading: "Présentation des autorisations (Idjâzah)" },
];

function normalizeApostrophes(text: string): string {
  return text.replace(/[\u2018\u2019\u201A\u201B\u0060\u00B4\u2032]/g, "'");
}

function cleanContent(text: string): string {
  return text
    // Remove sommaire/TOC-style lines (containing sequences of dots)
    .replace(/^.*\.{5,}.*$/gm, "")
    // Remove standalone section marker lines (all-caps chapter titles)
    .replace(/^AVANT PROPOS\s*$/gm, "")
    .replace(/^INTRODUCTION\s*$/gm, "")
    .replace(/^PREMIERE PARTIE\s*$/gm, "")
    .replace(/^DEUXIEME PARTIE\s*$/gm, "")
    .replace(/^TROISIEME PARTIE\s*$/gm, "")
    .replace(/^CONCLUSION\s*$/gm, "")
    .replace(/^LES REALITES DU SOUFISME.*$/gm, "")
    .replace(/^LES BIENFAITS DU ZIKR\s*$/gm, "")
    .replace(/^LA REUNION POUR LE ZIKR.*$/gm, "")
    .replace(/^LA FAYDA TIJANIYA.*$/gm, "")
    .replace(/^LES CONNAISSANCES EXPERIMENTALES.*$/gm, "")
    .replace(/^LES METHODES D.EDUCATION SPIRITUELLE.*$/gm, "")
    .replace(/^MISE EN GARDE CONTRE LA CONTRADICTION.*$/gm, "")
    .replace(/^LA NECESSITE DE RECHERCHER UN GUIDE.*$/gm, "")
    .replace(/^PROPOS DESTINES A UN CHAPITRE PRECEDENT.*$/gm, "")
    .replace(/^LA VERACITE DE LA VISION.*$/gm, "")
    .replace(/^Présentation de l.*(Idi|Idj).*$/gm, "")
    // Remove chapter headers
    .replace(/^CHAPITRE [IVX]+\s*$/gm, "")
    .replace(/^Chapitre [IVX]+\s*$/gm, "")
    .replace(/^Elle contient trois chap[iî]tres[.:]\s*$/gm, "")
    .replace(/^Elle est composée de Trois chap[iî]tres[.:]\s*$/gm, "")
    // Collapse multiple blank lines
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/**
 * Parse the TXT file page-by-page using standalone page numbers as split points.
 * Each resulting section corresponds to one physical page from the original PDF.
 */
export async function loadKachifulAlbasSections(): Promise<KachifulSection[]> {
  const response = await fetch("/books/kachiful-albas-fr.txt");
  const text = await response.text();
  const lines = text.split("\n");

  // Regex to detect standalone page numbers
  const pageNumRegex = /^\s*(\d{1,3})\s*$/;

  // First pass: find all page boundaries (line index → page number)
  const pageBoundaries: { lineIdx: number; pageNum: number }[] = [];
  for (let i = 0; i < lines.length; i++) {
    const match = lines[i].match(pageNumRegex);
    if (match) {
      const num = parseInt(match[1], 10);
      // Only accept sequential or near-sequential page numbers
      if (pageBoundaries.length === 0) {
        if (num <= 3) pageBoundaries.push({ lineIdx: i, pageNum: num });
      } else {
        const lastNum = pageBoundaries[pageBoundaries.length - 1].pageNum;
        // Allow pages in order (some pages might be missing)
        if (num > lastNum && num <= lastNum + 5) {
          pageBoundaries.push({ lineIdx: i, pageNum: num });
        }
      }
    }
  }

  // Find where actual content begins (after the sommaire/TOC).
  // The sommaire contains chapter titles with "..." dots. The actual "AVANT PROPOS" 
  // section starts on a line without dots, after the TOC.
  let scanStartLine = 0;
  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim().toUpperCase();
    // Find "AVANT PROPOS" that is NOT a sommaire entry (no dots)
    if (trimmed === "AVANT PROPOS" || trimmed === "AVANT-PROPOS") {
      scanStartLine = i;
      break;
    }
  }

  // Second pass: for each page, track which chapter marker applies
  // Only scan AFTER the sommaire to avoid false matches in the table of contents
  let currentMarkerIdx = -1;
  const lineToMarker: Map<number, number> = new Map(); // lineIdx → marker index changes

  for (let i = scanStartLine; i < lines.length; i++) {
    const normalized = normalizeApostrophes(lines[i].trim()).toUpperCase();
    for (let m = currentMarkerIdx + 1; m < SECTION_MARKERS.length; m++) {
      if (normalized.startsWith(normalizeApostrophes(SECTION_MARKERS[m].line).toUpperCase())) {
        currentMarkerIdx = m;
        lineToMarker.set(i, m);
        break;
      }
    }
  }

  // Build sections: skip pages 1-2 (title + TOC)
  const sections: KachifulSection[] = [];
  let activeMarkerIdx = -1;

  for (let p = 0; p < pageBoundaries.length; p++) {
    const { lineIdx, pageNum } = pageBoundaries[p];

    // Skip front matter (pages 1 and 2)
    if (pageNum <= 2) {
      // But still update marker context for lines in these pages
      const endLine = p + 1 < pageBoundaries.length ? pageBoundaries[p + 1].lineIdx : lines.length;
      for (let i = lineIdx; i < endLine; i++) {
        if (lineToMarker.has(i)) activeMarkerIdx = lineToMarker.get(i)!;
      }
      continue;
    }

    // Determine content range: from line after page number to next page boundary
    let contentStart = lineIdx + 1;
    const contentEnd = p + 1 < pageBoundaries.length ? pageBoundaries[p + 1].lineIdx : lines.length;

    // For the first content page (page 3), skip remaining sommaire lines
    // by starting from the first section marker found on that page
    if (pageNum === 3) {
      for (let i = contentStart; i < contentEnd; i++) {
        if (lineToMarker.has(i)) {
          contentStart = i;
          break;
        }
      }
    }

    // Update marker context for lines within this page
    for (let i = lineIdx; i < contentEnd; i++) {
      if (lineToMarker.has(i)) activeMarkerIdx = lineToMarker.get(i)!;
    }

    const rawContent = lines.slice(contentStart, contentEnd).join("\n");
    const content = cleanContent(rawContent);

    if (content.length < 5) continue; // skip empty pages

    const marker = activeMarkerIdx >= 0 ? SECTION_MARKERS[activeMarkerIdx] : null;

    sections.push({
      id: `kfr-page-${pageNum}`,
      part: marker?.part || "",
      chapter: marker?.chapter || "",
      heading: marker?.heading || `Page ${pageNum}`,
      content,
      pageNumber: pageNum,
    });
  }

  return sections;
}
