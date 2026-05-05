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
const NOISE_LINE_RE = /^(?:LETTER\s*#\d+\s+FROM\s+THE\s+DISCOURSES|Section:\s|The\s+Eleventh\s+Letter\s+of\s+the\s+Counsels|From Jawahir ar-Rasa[’']il|Compiled by:|From:|Translated by(?: UNKNOWN|:)?|Interpreted from the Arabic by:?)\b/i;
const COPYRIGHT_RE = /^(?:©\d{4}|-\s*Muḥammad|FLOODPLAINS\b)/i;
const TITLE_DUPLICATE_RE = /^(?:Counsel\s*#\s*\d+|Legal Ruling\s*#\s*\d+)\b/i;
const NULL_RE = /\u0000/g;

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
    const canMerge =
      typeof prev === "string" &&
      prev !== "" &&
      !/[.!?…:;”"')\]]$/.test(prev) &&
      !/^(?:[A-Z][a-z]+:|\{|\(|\[|\d+\.|[“"'])/.test(line) &&
      !/^(?:Salaam\.?|Salam\.?|Salām\.?|Peace\.?|As-Sal[aā]mu|Asʾsalāmu|May Allah|In the Name of|All praise|After this|As for what follows|To all|To Umar|To our|From the city|Written by|This was written by|Ibrahim ibn|Ibrāhīm ibn|Koussi|Kaolack|Kawsī|\d{4}\s*(?:AH|CE)|\d{4}\s*AH\s*\/)/i.test(line);

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
      .join("\n")
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

  for (const rawLine of lines) {
    const line = rawLine.replace(NULL_RE, "");
    const titleMatch = line.match(TITLE_RE);

    if (titleMatch) {
      flush();
      currentTitle = titleMatch[1].trim().replace(/\s+/g, " ");
      buffer = [];
      continue;
    }

    if (!currentTitle) continue;
    buffer.push(line);
  }

  flush();
  return sections;
}

export async function loadJawahirRasailSections(): Promise<JawahirRasailSection[]> {
  const response = await fetch("/books/jawahir-rasail-en.txt");
  const text = await response.text();
  return parseJawahirRasailSections(text);
}