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

const UNDERLINE_RE = /^-{3,}\s*$/;
const BLANK_RE = /^\s*$/;

/** A "title-like" line: predominantly uppercase letters / punctuation,
 *  no lowercase words, length within reasonable header bounds. */
function isTitleCaseLine(line: string): boolean {
  const t = line.trim();
  if (!t) return false;
  if (t.length > 200) return false;
  // Reject lines containing any lowercase letter (latin or accented).
  if (/[a-zàâäéèêëîïôöùûüÿç]/.test(t)) return false;
  // Must contain at least one uppercase letter.
  return /[A-ZÀÂÄÉÈÊËÎÏÔÖÙÛÜŸÇ]/.test(t);
}

/** Determine the (part, chapter, heading) for a logical title. */
function classifyHeading(title: string): { part: string; chapter: string; heading: string } | null {
  const upper = title.toUpperCase();

  if (/^AVANT[- ]PROPOS$/.test(upper)) {
    return { part: "", chapter: "Avant-propos", heading: "Avant-propos" };
  }
  if (/^INTRODUCTION$/.test(upper)) {
    return { part: "", chapter: "Introduction", heading: "Introduction — L'éducation spirituelle (Tarbiya)" };
  }
  if (/^PREMI[EÈÉ]RE PARTIE$/.test(upper)) {
    return { part: "Première Partie", chapter: "Première Partie", heading: "Première Partie" };
  }
  if (/^DEUXI[EÈÉ]ME PARTIE$/.test(upper)) {
    return { part: "Deuxième Partie", chapter: "Deuxième Partie", heading: "Deuxième Partie" };
  }
  if (/^TROISI[EÈÉ]ME PARTIE$/.test(upper)) {
    return { part: "Troisième Partie", chapter: "Troisième Partie", heading: "Troisième Partie" };
  }
  if (/^CONCLUSION$/.test(upper)) {
    return { part: "", chapter: "Conclusion", heading: "Conclusion" };
  }
  // Standalone "CHAPITRE I/II/III" lines act as separators only — the next
  // title line provides the actual heading. Skip them.
  if (/^CHAPITRE\s+[IVX]+$/.test(upper)) return null;
  // Skip the chapter-count blurbs ("Elle contient trois chapitres").
  return null;
}

/** Resolve a free-form chapter title to a chapter slot, given the current part. */
function chapterForTitle(part: string, title: string): { chapter: string; heading: string } {
  // Strip leading "CHAPITRE I/II/III " prefix if present.
  title = title.replace(/^CHAPITRE\s+[IVX]+\s+/i, "").trim();
  const upper = title.toUpperCase();
  if (part === "Première Partie") {
    if (/SOUFISME/.test(upper)) return { chapter: "Chapitre I — Les réalités du soufisme", heading: title };
    if (/BIENFAITS DU ZIKR/.test(upper)) return { chapter: "Chapitre II — Les bienfaits du Zikr", heading: title };
    if (/R[EÉ]CITATION DU CORAN|R[EÉ]UNION POUR LE ZIKR/.test(upper))
      return { chapter: "Chapitre III — La récitation du Coran", heading: title };
  }
  if (part === "Deuxième Partie") {
    if (/FAYDA TIJANIYA/.test(upper)) return { chapter: "Chapitre I — La Fayda Tijâniya", heading: title };
    if (/CONNAISSANCES EXP[EÉ]RIMENTALES/.test(upper))
      return { chapter: "Chapitre II — Les connaissances expérimentales", heading: title };
    if (/M[EÉ]THODES D.EDUCATION|EDUCATION SPIRITUELLE/.test(upper))
      return { chapter: "Chapitre III — L'éducation spirituelle", heading: title };
  }
  if (part === "Troisième Partie") {
    if (/MISE EN GARDE/.test(upper))
      return { chapter: "Chapitre I — Mise en garde", heading: title };
    if (/RECHERCHER UN GUIDE|N[EÉ]CESSIT[EÉ]/.test(upper))
      return { chapter: "Chapitre II — Le guide spirituel", heading: title };
    if (/PROPOS DESTIN[EÉ]S/.test(upper))
      return { chapter: "Chapitre II (suite)", heading: title };
    if (/V[EÉ]RACIT[EÉ] DE LA VISION|VISION/.test(upper))
      return { chapter: "Chapitre III — La vision divine", heading: title };
  }
  return { chapter: title, heading: title };
}

/** Title-case a heading derived from upper-case source so it reads like a book chapter. */
function prettifyTitle(raw: string): string {
  // Lowercase everything, then re-capitalize the first letter of each word
  // (except very short particles), and the first letter overall.
  const stop = new Set(["de", "du", "des", "le", "la", "les", "et", "à", "a", "en", "un", "une", "ou", "que", "qui", "dans", "pour", "par", "sur", "ce", "ces"]);
  const lower = raw.toLocaleLowerCase("fr");
  const words = lower.split(/(\s+|[;:—-])/);
  let firstWord = true;
  const out = words.map((w) => {
    if (/^\s+$/.test(w) || /^[;:—-]$/.test(w)) {
      if (/[;:—]/.test(w)) firstWord = true;
      return w;
    }
    if (!w) return w;
    if (firstWord || !stop.has(w)) {
      firstWord = false;
      return w.charAt(0).toLocaleUpperCase("fr") + w.slice(1);
    }
    firstWord = false;
    return w;
  });
  return out.join("").trim();
}

/**
 * Parse the cleaned TXT into logical sections. The clean source has:
 *   - Headers as 1+ consecutive UPPERCASE lines, each followed by a `---` underline
 *   - Body paragraphs separated by blank lines
 *   - No stray page numbers
 */
export async function loadKachifulAlbasSections(): Promise<KachifulSection[]> {
  const response = await fetch("/books/kachiful-albas-fr.txt");
  const text = await response.text();
  const lines = text.split("\n");

  type Block =
    | { kind: "title"; title: string; lineIdx: number }
    | { kind: "para"; text: string };

  const blocks: Block[] = [];

  let i = 0;
  // Skip the very front matter (first few lines: author / book title / translator)
  // by jumping to the first "AVANT-PROPOS" header.
  let startLine = 0;
  for (let k = 0; k < lines.length; k++) {
    const t = lines[k].trim().toUpperCase();
    if ((t === "AVANT-PROPOS" || t === "AVANT PROPOS") && k + 1 < lines.length && UNDERLINE_RE.test(lines[k + 1])) {
      startLine = k;
      break;
    }
  }
  i = startLine;

  while (i < lines.length) {
    const line = lines[i];

    // Header detection: title line + underline (possibly multi-segment with blanks).
    if (isTitleCaseLine(line) && i + 1 < lines.length && UNDERLINE_RE.test(lines[i + 1])) {
      const titleParts: string[] = [line.trim()];
      const headerStart = i;
      i += 2; // consume title + underline
      // Continue collecting subsequent title+underline pairs separated by blanks.
      while (i < lines.length) {
        // Skip blank lines between header segments.
        let j = i;
        while (j < lines.length && BLANK_RE.test(lines[j])) j++;
        if (j < lines.length && isTitleCaseLine(lines[j]) && j + 1 < lines.length && UNDERLINE_RE.test(lines[j + 1])) {
          titleParts.push(lines[j].trim());
          i = j + 2;
        } else {
          break;
        }
      }
      const fullTitle = titleParts.join(" ").replace(/\s+/g, " ").trim();
      blocks.push({ kind: "title", title: fullTitle, lineIdx: headerStart });
      continue;
    }

    // Body paragraph: collect non-blank lines until a blank line or a header.
    if (!BLANK_RE.test(line)) {
      const paraLines: string[] = [];
      while (i < lines.length && !BLANK_RE.test(lines[i])) {
        // Stop early if a header begins here.
        if (isTitleCaseLine(lines[i]) && i + 1 < lines.length && UNDERLINE_RE.test(lines[i + 1])) break;
        paraLines.push(lines[i].trim());
        i++;
      }
      const text = paraLines.join(" ").replace(/\s+/g, " ").trim();
      if (text && !/^Elle (contient|est compos[eé]e)/.test(text) && !/^Chapitre [IVX]+\s*$/.test(text)) {
        blocks.push({ kind: "para", text });
      }
      continue;
    }

    i++;
  }

  // Now walk blocks to assemble sections.
  const sections: KachifulSection[] = [];
  let currentPart = "";
  let currentChapter = "";
  let currentHeading = "";
  let currentParagraphs: string[] = [];
  let pageCounter = 1;

  const flush = () => {
    if (!currentHeading) return;
    const content = currentParagraphs.join("\n\n").trim();
    if (!content && !currentParagraphs.length) return;
    sections.push({
      id: `kfr-page-${pageCounter}`,
      part: currentPart,
      chapter: currentChapter,
      heading: currentHeading,
      content,
      pageNumber: pageCounter,
    });
    pageCounter++;
    currentParagraphs = [];
  };

  for (const blk of blocks) {
    if (blk.kind === "title") {
      const cls = classifyHeading(blk.title);
      if (cls) {
        // Major structural heading.
        flush();
        if (cls.part) currentPart = cls.part;
        // For "PREMIÈRE PARTIE" etc. we emit a stub section so users can land on it,
        // but we don't reset content — wait for the chapter-title that follows.
        currentChapter = cls.chapter;
        currentHeading = cls.heading;
      } else {
        // Free-form title: a chapter heading inside the current part.
        flush();
        const ch = chapterForTitle(currentPart, blk.title);
        currentChapter = ch.chapter;
        currentHeading = prettifyTitle(ch.heading);
      }
    } else {
      // Paragraph belongs to current section. If we have no heading yet, skip.
      if (!currentHeading) continue;
      currentParagraphs.push(blk.text);
    }
  }
  flush();

  // Drop empty stub sections (e.g. a "PREMIÈRE PARTIE" with no body because the
  // next chapter title flushed it immediately).
  return sections.filter((s) => s.content.trim().length > 0);
}
