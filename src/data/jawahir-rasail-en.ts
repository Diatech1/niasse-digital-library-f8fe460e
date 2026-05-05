export const jawahirRasailEnMeta = {
  title: "Precious Gems of Letters",
  subtitle: "Jawāhir al-Rasāʾil",
  author: "Shaykh al-Islam Al-Ḥājj Ibrāhīm b. 'Abd-Allah Niasse",
};

export interface JawahirRasailSection {
  id: string;
  chapter: string;
  heading: string;
  content: string;
}

const TITLE_RE = /^TITRE:\s*(.+)$/;
const BODY_OPENING_RE = /^(?:Chapter:|In the Name of|In The Name of|Bismill|Al-?Hamdu|Alhamdu|All praise|May the peace|May Allah|As-Sal[aā]mu|Asʾsalāmu|After this|As for what follows|To\b|From the city|From Kaolack|Allah guides to what is correct|Dear brothers|The praise belongs)/i;
const SIGNATURE_RE = /^(?:Salaam\.?|Salam\.?|Salām\.?|Peace\.?|Ibrahim\b|Ibrāhīm\b|Written by\b|Dictated by\b|This was written by\b|Koussi\b|Kaolack\b|Kawsī\b|\d{4}\s*(?:AH|CE|Hijri))/i;
const NOISE_LINE_RE = /^(?:LETTER\s*#\d+\s+FROM\s+THE\s+DISCOURSES|Letter\s*#\d+|Section:\s|The\s+Eleventh\s+Letter\s+of\s+the\s+Counsels|The\s+\d+(?:st|nd|rd|th)\s+Letter(?:\s+from)?(?:\s+the)?\s+[“"']?Advice[”"']?|Translator:|Translated(?:,\s*with\s*the\s*grace\s*of\s*Allah,)?(?:\s+by|:)\s*|Interpreted from the Arabic by:?|Compiled by:|From:\s+Kitaab|From Jawahir ar-Rasa[’']il|Source:\s*|\[\d{1,2}:\d{2}\s*[AP]M,|tflbwn$|“”$|""$|\{Letter\s*#\d+)/i;
const COPYRIGHT_RE = /(?:©\d{4}|FLOODPLAINS\b|\[©\d{4}|\|\s*FLOODPLAINS)/i;
const TITLE_DUPLICATE_RE = /^(?:Counsel\s*#\s*\d+|Legal Ruling\s*#\s*\d+)\b/i;
const NULL_RE = /\u0000/g;

function cleanTitle(title: string): string {
  return title
    .replace(/\s+Translated.*$/i, "")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\s+[:;,.-]$/, "");
}

function normalizeTitleContinuation(line: string): string {
  return line
    .replace(/Translated(?:,\s*with\s*the\s*grace\s*of\s*Allah,)?(?:\s+by|:)\s*.*$/i, "")
    .replace(/Interpreted from the Arabic by:?\s*.*$/i, "")
    .replace(/\s+/g, " ")
    .trim();
}

function looksLikeTitleContinuation(line: string): boolean {
  const t = normalizeTitleContinuation(line);
  if (!t || t.length > 120) return false;
  if (BODY_OPENING_RE.test(t) || SIGNATURE_RE.test(t)) return false;
  if (/^(?:\[|\{|\(|\d)/.test(t)) return false;
  if (/[.!?]$/.test(t)) return false;
  return /^[A-Z][A-Za-z0-9'‘’"“”\-–—,;:()\s]+$/.test(t);
}

function hasMeaningfulBody(lines: string[]): boolean {
  return lines.some((line) => {
    const t = line.trim();
    if (!t) return false;
    if (NOISE_LINE_RE.test(t) || COPYRIGHT_RE.test(t) || SIGNATURE_RE.test(t)) return false;
    return t.split(/\s+/).length >= 6;
  });
}

function looksIncomplete(lines: string[]): boolean {
  const first = lines.find((line) => line.trim());
  if (!first) return true;
  const t = first.trim();
  if (BODY_OPENING_RE.test(t)) return false;
  return /^[a-z\[]/.test(t);
}

function normalizeText(text: string): string {
  return text
    .replace(NULL_RE, "")
    .replace(/\r/g, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n");
}

function compactWrappedLines(lines: string[]): string[] {
  const out: string[] = [];

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) {
      if (out[out.length - 1] !== "") out.push("");
      continue;
    }

    const prev = out[out.length - 1];

    // Lines that should always start their own block (headings, list items, signatures, openers).
    // Note: do NOT break on "[" — bracketed transliterations like "[sulūk]" are inline continuations.
    const forceBreak =
      /^(?:Chapter:|Section:|\{\{PAGE:|\{|\d+\.\s|\d+\s*[&]\s*\d+\.\s|[“"'])/.test(line) ||
      /^(?:Salaam\.?|Salam\.?|Salām\.?|Peace\b|As-Sal[aā]mu|Asʾsalāmu|Wa[s\-\s]?sal[aā]m|May\s+Allah[\u2019']?s|May\s+Allah\b|In\s+the\s+Name\s+of|All\s+praise\b|After\s+this\b|As\s+for\s+what\s+follows\b|To\s+all\b|To\s+Umar\b|To\s+our\b|From\s+the\s+city\b|From\s+Kaolack\b|Written\s+by\b|Dictated\s+by\b|Transcribed\s+by\b|This\s+was\s+(?:written|dictated)\s+by\b|Ibrahim\s+ibn\b|Ibrāhīm\s+ibn\b|Koussi\b|Kaolack\b|Kawsī\b|\d{3,4}\s*(?:AH|CE|Hijri)\b)/i.test(line);

    // A paragraph only ends when the previous line finishes with sentence-ending
    // punctuation. Otherwise the next line is a wrapped continuation and should merge.
    const prevEndsParagraph =
      typeof prev === "string" && /[.!?:”"’')\]]\s*$/.test(prev);

    const canMerge = typeof prev === "string" && prev !== "" && !forceBreak && !prevEndsParagraph;

    if (canMerge) {
      out[out.length - 1] = `${prev} ${line}`.replace(/\s+/g, " ").trim();
    } else {
      out.push(line);
    }
  }

  return out;
}

export function parseJawahirRasailSections(text: string): JawahirRasailSection[] {
  const normalized = normalizeText(text);
  const lines = normalized.split("\n");

  const sections: JawahirRasailSection[] = [];
  let currentTitle = "";
  let buffer: string[] = [];

  const flush = () => {
    if (!currentTitle) return;

    const cleaned = compactWrappedLines(buffer)
      .filter((line, index, arr) => {
        if (!line) return true;
        if (NOISE_LINE_RE.test(line)) return false;
        if (COPYRIGHT_RE.test(line)) return false;
        if (TITLE_DUPLICATE_RE.test(line) && index < 2) return false;
        if (/^Chapter:\s+/i.test(line) && index === 0) return false;
        if (/^Translated b$/i.test(line)) return false;
        if (line === arr[index - 1]) return false;
        return true;
      })
      .join("\n\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim();

    if (cleaned.length > 10) {
      sections.push({
        id: `jawahir-rasail-en-${sections.length + 1}`,
        chapter: currentTitle,
        heading: currentTitle,
        content: cleaned,
      });
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].replace(NULL_RE, "");
    const titleMatch = line.match(TITLE_RE);

    if (titleMatch) {
      flush();
      currentTitle = cleanTitle(titleMatch[1]);
      buffer = [];

      let j = i + 1;
      while (j < lines.length && !lines[j].trim()) j++;
      while (j < lines.length) {
        const continuation = lines[j].replace(NULL_RE, "").trim();
        if (!looksLikeTitleContinuation(continuation)) break;
        const cleanContinuation = normalizeTitleContinuation(continuation);
        if (cleanContinuation) {
          currentTitle = cleanTitle(`${currentTitle} ${cleanContinuation}`);
        }
        j++;
        while (j < lines.length && !lines[j].trim()) j++;
      }
      i = j - 1;
      continue;
    }

    if (!currentTitle) continue;
    buffer.push(line);
  }

  flush();
  return sections.filter((section) => {
    const sectionLines = section.content.split("\n");
    if (!hasMeaningfulBody(sectionLines)) return false;
    if (sectionLines.length <= 3 && looksIncomplete(sectionLines)) return false;
    return true;
  });
}

export async function loadJawahirRasailSections(): Promise<JawahirRasailSection[]> {
  const response = await fetch("/books/jawahir-rasail-en.txt");
  const text = await response.text();
  return parseJawahirRasailSections(text);
}