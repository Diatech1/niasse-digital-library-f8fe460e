export const kashifEnMeta = {
  title: "The Removal of Confusion",
  subtitle: "Kāshif al-Ilbās 'an Faydat al-Khatm Abī al-'Abbās",
  author: "Shaykh al-Islam Al-Ḥājj Ibrāhīm b. 'Abd-Allah Niasse",
  translators: "Zachary Wright, Muhtar Holland and Abdullahi El-Okene",
  publisher: "Fons Vitae, 2009",
};

export interface KashifEnSection {
  id: string;
  part: string;
  chapter: string;
  heading: string;
  content: string;
  pageNumber?: number;
}

// Chapter markers for tracking context
const SECTION_MARKERS = [
  { line: "Acknowledgements", part: "Front Matter", chapter: "Front Matter", heading: "Acknowledgements" },
  { line: "Background to the Text", part: "Front Matter", chapter: "Front Matter", heading: "Background to the Text" },
  { line: "Note on Translation", part: "Front Matter", chapter: "Front Matter", heading: "Note on Translation" },
  { line: "Biography of Authors", part: "Front Matter", chapter: "Front Matter", heading: "Biography of Authors" },
  { line: "Arabic Transliteration Key", part: "Front Matter", chapter: "Front Matter", heading: "Arabic Transliteration Key" },
  { line: "Introduction to the 2001 Arabic", part: "Front Matter", chapter: "Front Matter", heading: "Introduction to the 2001 Arabic Edition" },
  { line: "Biography of the Author, Shaykh", part: "Front Matter", chapter: "Front Matter", heading: "Biography of the Author" },
  { line: "Author's Foreword", part: "Front Matter", chapter: "Front Matter", heading: "Author's Foreword" },
  { line: "General Introduction", part: "General Introduction", chapter: "General Introduction", heading: "General Introduction" },
  { line: "Concerning the Reality of Sufism", part: "Section I", chapter: "Chapter 1", heading: "Concerning the Reality of Sufism" },
  { line: "The Excellence of Allah's", part: "Section I", chapter: "Chapter 2", heading: "The Excellence of Allah's Remembrance (dhikr)" },
  { line: "Congregating for the Remembrance", part: "Section I", chapter: "Chapter 3", heading: "Congregating for the Remembrance" },
  { line: "Mention of the Flood (Fay", part: "Section II", chapter: "Chapter 1", heading: "Mention of the Flood (Fayḍa) within the Tijāniyya" },
  { line: "Spiritual Experiences (adhw", part: "Section II", chapter: "Chapter 2", heading: "Spiritual Experiences (adhwāq)" },
  { line: "The Sphere of Spiritual Training", part: "Section II", chapter: "Chapter 3", heading: "The Sphere of Spiritual Training" },
  { line: "Warning Against Criticizing", part: "Section III", chapter: "Chapter 1", heading: "Warning Against Criticizing the Spiritual Elite" },
  { line: "Seeking the Shaykh", part: "Section III", chapter: "Chapter 2", heading: "Seeking the Shaykh" },
  { line: "The Vision of Allah", part: "Section III", chapter: "Chapter 3", heading: "The Vision of Allah" },
  { line: "Our Confidant Reliance", part: "Conclusion", chapter: "Conclusion", heading: "Our Confidant Reliance on the Tijānī Spiritual Path" },
  { line: "Introduction: On Spiritual Training and Saintly Authority", part: "Author's Appendix", chapter: "Appendix Introduction", heading: "On Spiritual Training and Saintly Authority" },
  { line: "Concerning the Sufi Path", part: "Appendix", chapter: "Appendix I", heading: "Concerning the Sufi Path" },
  { line: "Concerning the Tijānī Litanies", part: "Appendix", chapter: "Appendix II", heading: "Concerning the Tijānī Litanies" },
  { line: "The Ecstatic Utterances", part: "Appendix", chapter: "Appendix III", heading: "The Ecstatic Utterances of the Enraptured Ones" },
  { line: "The Aspirant Who Becomes Extinct", part: "Appendix", chapter: "Appendix IV", heading: "The Aspirant Who Becomes Extinct to Himself" },
  { line: "The Vision of Allah within the Realm", part: "Appendix", chapter: "Appendix V", heading: "The Vision of Allah within the Realm of Possibility" },
  { line: "Racial Discrimination", part: "Appendix", chapter: "Appendix VI", heading: "Racial Discrimination in the Spiritual Path" },
  { line: "Femininity and Sainthood", part: "Appendix", chapter: "Appendix VII", heading: "Femininity and Sainthood" },
  { line: "Ecstasy and the Spiritual Concert", part: "Appendix", chapter: "Appendix VIII", heading: "Ecstasy and the Spiritual Concert" },
  { line: "Concerning Spiritual Retreat", part: "Appendix", chapter: "Appendix IX", heading: "Concerning Spiritual Retreat" },
  { line: "Conclusion of the Appendix", part: "Appendix", chapter: "Appendix", heading: "Conclusion of the Appendix" },
  { line: "Glossary of Arabic Terms", part: "Back Matter", chapter: "Reference", heading: "Glossary of Arabic Terms" },
  { line: "Sources for the K", part: "Back Matter", chapter: "Reference", heading: "Sources for the Kāshif" },
  { line: "Prominent Personalities", part: "Back Matter", chapter: "Reference", heading: "Prominent Personalities" },
];

function fixEncoding(text: string): string {
  return text
    .replace(/╕/g, "ḥ")
    .replace(/╔/g, "Ḥ")
    .replace(/╓/g, "ḍ")
    .replace(/╙/g, "ṭ")
    .replace(/╗/g, "ṣ")
    .replace(/╖/g, "Ṣ");
}

function normalizeApostrophes(text: string): string {
  return text.replace(/[\u2018\u2019\u201A\u201B\u0060\u00B4\u2032]/g, "'");
}

function cleanContent(text: string): string {
  let cleaned = fixEncoding(text)
    // Rejoin standalone drop cap letters (PDF extraction artifact: "T\nhe" → "The")
    .replace(/^([A-Z])\n([a-z])/gm, "$1$2")
    // Remove running headers (e.g., "vi THE REMOVAL OF CONFUSION", "General Introduction")
    .replace(/^[ivxlc]+\s+THE REMOVAL OF CONFUSION\s*$/gim, "")
    .replace(/^\d+\s+THE REMOVAL OF CONFUSION\s*$/gm, "")
    .replace(/^THE REMOVAL OF CONFUSION\s*$/gm, "")
    // Remove standalone Roman numerals
    .replace(/^[ivxlc]+\s*$/gim, "")
    // Remove sommaire/TOC-style lines with dots
    .replace(/^.*\.{5,}.*$/gm, "")
    // Remove running chapter headers (matching section marker names that appear as page headers)
    .replace(/^Concerning the reality of Sufism\s*$/gm, "")
    .replace(/^The Excellence of Allah's Remembrance \(dhikr\)\s*$/gm, "")
    .replace(/^Congregating for the Remembrance\s*$/gm, "")
    .replace(/^Mention of the Flood.*within the Tij.*$/gm, "")
    .replace(/^Seeking the Shaykh\s*$/gm, "")
    .replace(/^General Introduction\s*$/gm, "")
    .replace(/^Background to the Text.*$/gm, "")
    .replace(/^Biography of the Author.*$/gm, "")
    .replace(/^Biography of Authors.*$/gm, "")
    .replace(/^Prominent Personalities\s*$/gm, "")
    .replace(/^Warning Against Criticizing.*$/gm, "")
    .replace(/^The Vision of Allah\s*$/gm, "")
    .replace(/^Spiritual Experiences.*$/gm, "")
    .replace(/^The Sphere of Spiritual Training\s*$/gm, "")
    .replace(/^Our Confidant Reliance.*$/gm, "")
    .replace(/^Section [IV]+\s*$/gm, "")
    .replace(/^CHAPTER \d+\s*$/gm, "")
    // Collapse multiple blank lines
    .replace(/\n{3,}/g, "\n\n")
    .trim();
  
  // Fix displaced drop caps: if content starts with lowercase, find a standalone
  // capital letter in the text (PDF extraction artifact) and move it to the front
  if (/^[a-z]/.test(cleaned)) {
    // Look for a standalone single capital letter on its own line
    const dropCapMatch = cleaned.match(/^([A-Z])$/m);
    if (dropCapMatch) {
      // Remove the standalone letter and prepend it to the content
      cleaned = cleaned.replace(/^[A-Z]$/m, "").replace(/\n{2,}/g, "\n\n").trim();
      cleaned = dropCapMatch[1] + cleaned;
    }
  }
  
  return cleaned;
}

/**
 * Parse the English Kashif text page-by-page using standalone page numbers as split points.
 * Front matter (before page 1) is kept as chapter-based sections.
 * Main content (pages 1+) is split at each Arabic page number.
 */
export async function loadKashifEnSections(): Promise<KashifEnSection[]> {
  const response = await fetch("/books/kashif-en.txt");
  const rawText = await response.text();
  
  // Preprocess: rejoin standalone drop cap letters separated by page headers
  // Pattern: single capital letter on its own line, followed by header/numeral lines,
  // then content starting with lowercase — the letter belongs before that content.
  const rawLines = rawText.split("\n");
  const headerRegex = /^([ivxlc]+\s+THE REMOVAL OF CONFUSION|[ivxlc]+|\d+\s+THE REMOVAL OF CONFUSION)\s*$/i;
  
  for (let i = 0; i < rawLines.length - 1; i++) {
    if (/^[A-Z]$/.test(rawLines[i].trim())) {
      // Found standalone capital letter — look ahead past headers/blanks for content
      for (let j = i + 1; j < Math.min(i + 5, rawLines.length); j++) {
        const trimJ = rawLines[j].trim();
        if (trimJ === "" || headerRegex.test(trimJ)) continue;
        // Found next content line — prepend the letter
        if (/^[a-z]/.test(trimJ)) {
          rawLines[j] = rawLines[i].trim() + rawLines[j];
          rawLines[i] = "";
        }
        break;
      }
    }
  }
  
  const lines = rawLines;

  const oddPageRegex = /^\s*(\d{1,3})\s*$/;
  const evenPageRegex = /^(\d{1,3})\s+THE REMOVAL OF CONFUSION\s*$/;
  // Running chapter headers on odd pages (e.g., "General Introduction 5")
  const oddHeaderRegex = /^.+\s+(\d{1,3})\s*$/;

  // Find all page boundaries using both odd and even page patterns
  const pageBoundaries: { lineIdx: number; pageNum: number }[] = [];
  
  // Collect ALL candidate page numbers with both patterns
  const candidates: { lineIdx: number; pageNum: number; confidence: "high" | "low" }[] = [];
  
  for (let i = 0; i < lines.length; i++) {
    // Even pages: "N THE REMOVAL OF CONFUSION" — very reliable
    const evenMatch = lines[i].match(evenPageRegex);
    if (evenMatch) {
      candidates.push({ lineIdx: i, pageNum: parseInt(evenMatch[1], 10), confidence: "high" });
      continue;
    }
    // Odd pages: standalone number — less reliable (could be footnotes)
    const oddMatch = lines[i].match(oddPageRegex);
    if (oddMatch) {
      candidates.push({ lineIdx: i, pageNum: parseInt(oddMatch[1], 10), confidence: "low" });
    }
  }

  // Build sequential page boundaries starting from page 1
  // Use high-confidence matches first, then fill in with low-confidence
  let lastPageNum = 0;
  const tocEndLine = 60; // Skip TOC
  
  for (const c of candidates) {
    if (c.lineIdx <= tocEndLine) continue;
    
    if (pageBoundaries.length === 0) {
      // Looking for page 1
      if (c.pageNum === 1) {
        pageBoundaries.push({ lineIdx: c.lineIdx, pageNum: 1 });
        lastPageNum = 1;
      }
      continue;
    }
    
    // Handle duplicates (same page number on consecutive lines)
    if (c.pageNum === lastPageNum) {
      pageBoundaries[pageBoundaries.length - 1].lineIdx = c.lineIdx;
      continue;
    }
    
    // Accept next page if it's sequential (allow gaps up to 5 for missing pages)
    if (c.pageNum === lastPageNum + 1 || c.pageNum === lastPageNum + 2) {
      pageBoundaries.push({ lineIdx: c.lineIdx, pageNum: c.pageNum });
      lastPageNum = c.pageNum;
    } else if (c.confidence === "high" && c.pageNum > lastPageNum && c.pageNum <= lastPageNum + 10) {
      // Trust high-confidence matches with larger gaps
      pageBoundaries.push({ lineIdx: c.lineIdx, pageNum: c.pageNum });
      lastPageNum = c.pageNum;
    }
  }

  // Build chapter marker map (scan from after TOC)
  const tocEnd = lines.findIndex((l, i) => i > 60 && l.trim() === "Acknowledgements");
  const scanStart = tocEnd >= 0 ? tocEnd : 60;

  let currentMarkerIdx = -1;
  const lineToMarker: Map<number, number> = new Map();

  for (let i = scanStart; i < lines.length; i++) {
    const normalized = normalizeApostrophes(lines[i].trim());
    for (let m = currentMarkerIdx + 1; m < SECTION_MARKERS.length; m++) {
      if (normalized.startsWith(normalizeApostrophes(SECTION_MARKERS[m].line))) {
        currentMarkerIdx = m;
        lineToMarker.set(i, m);
        break;
      }
    }
  }

  const sections: KashifEnSection[] = [];

  // Front matter: chapter-based sections before page 1
  const page1Line = pageBoundaries.length > 0 ? pageBoundaries[0].lineIdx : lines.length;
  let fmMarkerIdx = -1;
  let fmStart = -1;

  for (let i = scanStart; i < page1Line; i++) {
    const normalized = normalizeApostrophes(lines[i].trim());
    for (let m = fmMarkerIdx + 1; m < SECTION_MARKERS.length; m++) {
      if (normalized.startsWith(normalizeApostrophes(SECTION_MARKERS[m].line))) {
        // Save previous front matter section
        if (fmMarkerIdx >= 0 && fmStart >= 0) {
          const marker = SECTION_MARKERS[fmMarkerIdx];
          const content = cleanContent(lines.slice(fmStart, i).join("\n"));
          if (content.length > 50) {
            sections.push({
              id: `kashif-en-fm-${fmMarkerIdx}`,
              part: marker.part,
              chapter: marker.chapter,
              heading: marker.heading,
              content,
            });
          }
        }
        fmMarkerIdx = m;
        fmStart = i + 1;
        break;
      }
    }
  }
  // Save last front matter section
  if (fmMarkerIdx >= 0 && fmStart >= 0) {
    const marker = SECTION_MARKERS[fmMarkerIdx];
    const content = cleanContent(lines.slice(fmStart, page1Line).join("\n"));
    if (content.length > 50) {
      sections.push({
        id: `kashif-en-fm-${fmMarkerIdx}`,
        part: marker.part,
        chapter: marker.chapter,
        heading: marker.heading,
        content,
      });
    }
  }

  // Main content: page-by-page
  let activeMarkerIdx = fmMarkerIdx >= 0 ? fmMarkerIdx : -1;

  for (let p = 0; p < pageBoundaries.length; p++) {
    const { lineIdx, pageNum } = pageBoundaries[p];
    const contentStart = lineIdx + 1;
    const contentEnd = p + 1 < pageBoundaries.length ? pageBoundaries[p + 1].lineIdx : lines.length;

    // Update marker context for lines within this page
    for (let i = lineIdx; i < contentEnd; i++) {
      if (lineToMarker.has(i)) activeMarkerIdx = lineToMarker.get(i)!;
    }

    const rawContent = lines.slice(contentStart, contentEnd).join("\n");
    const content = cleanContent(rawContent);

    if (content.length < 5) continue;

    const marker = activeMarkerIdx >= 0 ? SECTION_MARKERS[activeMarkerIdx] : null;

    sections.push({
      id: `kashif-en-page-${pageNum}`,
      part: marker?.part || "",
      chapter: marker?.chapter || "",
      heading: marker?.heading || `Page ${pageNum}`,
      content,
      pageNumber: pageNum,
    });
  }

  return sections;
}
