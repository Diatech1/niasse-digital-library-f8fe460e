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

// Known missing drop cap initials from PDF extraction (letter completely lost)
const MISSING_INITIAL_FIXES: [RegExp, string][] = [
  [/^ll thanks/m, "All thanks"],
  [/^he Kāshif al-Ilbās/m, "The Kāshif al-Ilbās"],
  [/^his translation/m, "This translation"],
  [/^ccording to/m, "According to"],
  [/^ufism/m, "Sufism"],
];

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
    // These appear both as standalone titles and as "Chapter Title N" on odd pages.
    // The odd-page variants are now used as page boundaries (so lineIdx+1 skips them),
    // but standalone forms may still appear within content due to PDF extraction quirks.
    .replace(/^Concerning the [Rr]eality of Sufism\s*$/gm, "")
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
    .replace(/^APPENDIX [IVX]+\s*$/gm, "")
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
  
  // Fix known missing drop cap initials (PDF completely lost the letter)
  for (const [pattern, replacement] of MISSING_INITIAL_FIXES) {
    if (pattern.test(cleaned)) {
      cleaned = cleaned.replace(pattern, replacement);
      break;
    }
  }
  
  return cleaned;
}

// Convert Roman numeral string to integer
function fromRoman(s: string): number {
  const map: Record<string, number> = { i: 1, v: 5, x: 10, l: 50, c: 100 };
  let result = 0;
  const lower = s.toLowerCase();
  for (let i = 0; i < lower.length; i++) {
    const cur = map[lower[i]] ?? 0;
    const next = map[lower[i + 1]] ?? 0;
    result += cur < next ? -cur : cur;
  }
  return result;
}

/**
 * Parse the English Kashif text fully page-by-page.
 * Both front matter (Roman numeral pages) and main content (Arabic numeral pages)
 * are split at every physical page boundary found in the PDF-extracted text.
 * This yields ~452 pages matching the original book.
 */
export async function loadKashifEnSections(): Promise<KashifEnSection[]> {
  const response = await fetch("/books/kashif-en.txt");
  const rawText = await response.text();

  // Preprocess: rejoin standalone drop cap letters separated by page headers
  const rawLines = rawText.split("\n");
  const headerRegex = /^([ivxlc]+\s+THE REMOVAL OF CONFUSION|[ivxlc]+|\d+\s+THE REMOVAL OF CONFUSION)\s*$/i;

  for (let i = 0; i < rawLines.length - 1; i++) {
    const orphan = rawLines[i].trim();
    if (/^[A-Z]$/.test(orphan)) {
      for (let j = i + 1; j < Math.min(i + 5, rawLines.length); j++) {
        const trimJ = rawLines[j].trim();
        if (trimJ === "" || headerRegex.test(trimJ)) continue;
        if (/^[a-z]/.test(trimJ)) {
          // Lowercase next line: orphan letter is the missing capital → prepend
          rawLines[j] = orphan + rawLines[j];
          rawLines[i] = "";
        } else if (trimJ.charAt(0) === orphan) {
          // Next line already starts with the same capital (PDF drop-cap duplicate) → drop orphan
          rawLines[i] = "";
        }
        break;
      }
    }
  }

  const lines = rawLines;
  const tocEndLine = 65; // skip title page + TOC lines

  // ── Page boundary detection ──────────────────────────────────────────────
  // We use a unified virtual page number scheme:
  //   Front matter Roman pages (vii → 7) map to negative virtual pages: -(fromRoman)
  //   Main content Arabic pages map to positive virtual pages
  // This lets us sort everything in order and emit pages sequentially.

  type Boundary = { lineIdx: number; virtualPage: number; label: string };
  const boundaries: Boundary[] = [];

  // Even-page header: "vii THE REMOVAL OF CONFUSION" or "4 THE REMOVAL OF CONFUSION"
  const evenRomanRegex  = /^([ivxlc]+)\s+THE REMOVAL OF CONFUSION\s*$/i;
  const evenArabicRegex = /^(\d{1,3})\s+THE REMOVAL OF CONFUSION\s*$/;
  // Odd-page running chapter header with Arabic numeral: "General Introduction 5"
  const oddHeaderRegex  = /^[A-Z][^.]{4,90}\s(\d{1,3})\s*$/;
  // Odd front-matter running header with Roman numeral on same line: "Background to the Text xi"
  // Require at least 2 Roman-numeral chars to avoid false-positives on single letters
  const oddRomanHeaderRegex = /^[A-Z].{3,80}\s([ivxlc]{2,})\s*$/;
  // Odd front-matter: standalone Roman numeral on its own line
  const oddRomanRegex   = /^([ivxlc]+)\s*$/i;
  // Odd main-content: standalone Arabic numeral
  const oddArabicRegex  = /^\s*(\d{1,3})\s*$/;

  // Track which virtual pages we've already recorded (prefer first occurrence)
  const seenHigh = new Set<number>();
  const seenLow  = new Set<number>();
  const lowBoundaries: Boundary[] = [];

  for (let i = tocEndLine; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // High-confidence: even-page Roman header
    const evenRoman = trimmed.match(evenRomanRegex);
    if (evenRoman) {
      const vp = -fromRoman(evenRoman[1]);
      if (!seenHigh.has(vp)) {
        seenHigh.add(vp);
        boundaries.push({ lineIdx: i, virtualPage: vp, label: evenRoman[1].toLowerCase() });
      }
      continue;
    }

    // High-confidence: even-page Arabic header
    const evenArabic = trimmed.match(evenArabicRegex);
    if (evenArabic) {
      const vp = parseInt(evenArabic[1], 10);
      if (!seenHigh.has(vp)) {
        seenHigh.add(vp);
        boundaries.push({ lineIdx: i, virtualPage: vp, label: String(vp) });
      }
      continue;
    }

    // High-confidence: odd-page running chapter header with Arabic numeral (main content only)
    const oddHeader = trimmed.match(oddHeaderRegex);
    if (oddHeader) {
      const vp = parseInt(oddHeader[1], 10);
      if (vp >= 1 && vp <= 500 && !seenHigh.has(vp)) {
        seenHigh.add(vp);
        boundaries.push({ lineIdx: i, virtualPage: vp, label: String(vp) });
      }
      continue;
    }

    // High-confidence: odd front-matter running header with Roman numeral on same line
    // e.g. "Background to the Text xi", "Biography of Authors xxv"
    // Guard: must not also match even-page headers (those contain "THE REMOVAL OF CONFUSION")
    const oddRomanHeader = trimmed.match(oddRomanHeaderRegex);
    if (oddRomanHeader && !trimmed.includes("THE REMOVAL OF CONFUSION")) {
      const romanStr = oddRomanHeader[1].toLowerCase();
      const vp = -fromRoman(romanStr);
      // Only accept plausible front-matter Roman numerals (ii..lxx range)
      if (vp < -1 && vp >= -70 && !seenHigh.has(vp)) {
        seenHigh.add(vp);
        boundaries.push({ lineIdx: i, virtualPage: vp, label: romanStr });
      }
      continue;
    }

    // Low-confidence: standalone Roman numeral (front matter odd pages)
    const oddRoman = trimmed.match(oddRomanRegex);
    if (oddRoman) {
      const vp = -fromRoman(oddRoman[1]);
      if (vp < 0 && !seenLow.has(vp)) {
        seenLow.add(vp);
        lowBoundaries.push({ lineIdx: i, virtualPage: vp, label: oddRoman[1].toLowerCase() });
      }
      continue;
    }

    // Low-confidence: standalone Arabic numeral (main content odd pages)
    const oddArabic = trimmed.match(oddArabicRegex);
    if (oddArabic) {
      const vp = parseInt(oddArabic[1], 10);
      if (vp >= 1 && !seenLow.has(vp)) {
        seenLow.add(vp);
        lowBoundaries.push({ lineIdx: i, virtualPage: vp, label: String(vp) });
      }
    }
  }

  // Merge: add low-confidence only where high-confidence has no entry for that virtual page
  for (const b of lowBoundaries) {
    if (!seenHigh.has(b.virtualPage)) {
      boundaries.push(b);
    }
  }

  // Sort by line index (text order)
  boundaries.sort((a, b) => a.lineIdx - b.lineIdx);

  // ── Chapter marker map ───────────────────────────────────────────────────
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

  // ── Build sections ────────────────────────────────────────────────────────
  // Assign sequential display page numbers starting from 1 (covers front matter + main)
  const sections: KashifEnSection[] = [];
  let activeMarkerIdx = -1;
  let displayPage = 0;

  for (let p = 0; p < boundaries.length; p++) {
    const { lineIdx, virtualPage, label } = boundaries[p];
    const contentStart = lineIdx + 1;
    const contentEnd = p + 1 < boundaries.length ? boundaries[p + 1].lineIdx : lines.length;

    // Update chapter marker context
    for (let i = lineIdx; i < contentEnd; i++) {
      if (lineToMarker.has(i)) activeMarkerIdx = lineToMarker.get(i)!;
    }

    const rawContent = lines.slice(contentStart, contentEnd).join("\n");
    const content = cleanContent(rawContent);
    if (content.length < 5) continue;

    displayPage++;
    const marker = activeMarkerIdx >= 0 ? SECTION_MARKERS[activeMarkerIdx] : null;
    const isFrontMatter = virtualPage < 0;

    sections.push({
      id: `kashif-en-page-${displayPage}`,
      part: marker?.part || (isFrontMatter ? "Front Matter" : ""),
      chapter: marker?.chapter || (isFrontMatter ? "Front Matter" : ""),
      heading: marker?.heading || `Page ${label}`,
      content,
      pageNumber: displayPage,
    });
  }

  return sections;
}

