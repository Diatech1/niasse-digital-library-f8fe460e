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

/**
 * Section markers map a heading (as it appears in the PDF) to its part/chapter
 * context. The 2026 re-extraction emits each PDF page as a structured block:
 *
 *   <<<PAGE pdf=N pnum=ix heading=Background to the Text>>>
 *   <body paragraphs separated by blank lines>
 *   <<<FOOTNOTES>>>
 *   1. ...
 *   2. ...
 *
 * Footnotes are guaranteed to be detached from prose by the layout-aware
 * extractor (pdfplumber), which classifies them by font size (~9pt vs body
 * ~11pt) — no heuristic detection is required at runtime.
 */
const HEADING_CONTEXT: Record<string, { part: string; chapter: string }> = {
  "Acknowledgements":                                { part: "Front Matter", chapter: "Front Matter" },
  "Background to the Text":                          { part: "Front Matter", chapter: "Front Matter" },
  "Note on Translation":                             { part: "Front Matter", chapter: "Front Matter" },
  "Biography of Authors":                            { part: "Front Matter", chapter: "Front Matter" },
  "Arabic Transliteration Key":                      { part: "Front Matter", chapter: "Front Matter" },
  "Introduction to the 2001 Arabic Edition":         { part: "Front Matter", chapter: "Front Matter" },
  "Biography of the Author":                         { part: "Front Matter", chapter: "Front Matter" },
  "Author's Foreword":                               { part: "Front Matter", chapter: "Front Matter" },
  "General Introduction":                            { part: "General Introduction", chapter: "General Introduction" },
  "Concerning the Reality of Sufism":                { part: "Section I", chapter: "Chapter 1" },
  "The Excellence of Allah's Remembrance":           { part: "Section I", chapter: "Chapter 2" },
  "Congregating for the Remembrance":                { part: "Section I", chapter: "Chapter 3" },
  "Mention of the Flood":                            { part: "Section II", chapter: "Chapter 1" },
  "Spiritual Experiences":                           { part: "Section II", chapter: "Chapter 2" },
  "The Sphere of Spiritual Training":                { part: "Section II", chapter: "Chapter 3" },
  "Warning Against Criticizing":                     { part: "Section III", chapter: "Chapter 1" },
  "Seeking the Shaykh":                              { part: "Section III", chapter: "Chapter 2" },
  "The Vision of Allah":                             { part: "Section III", chapter: "Chapter 3" },
  "Our Confidant Reliance":                          { part: "Conclusion", chapter: "Conclusion" },
  "On Spiritual Training and Saintly Authority":     { part: "Author's Appendix", chapter: "Appendix Introduction" },
  "Concerning the Sufi Path":                        { part: "Appendix", chapter: "Appendix I" },
  "Concerning the Tijānī Litanies":                  { part: "Appendix", chapter: "Appendix II" },
  "The Ecstatic Utterances":                         { part: "Appendix", chapter: "Appendix III" },
  "The Aspirant Who Becomes Extinct":                { part: "Appendix", chapter: "Appendix IV" },
  "The Vision of Allah within the Realm":            { part: "Appendix", chapter: "Appendix V" },
  "Racial Discrimination":                           { part: "Appendix", chapter: "Appendix VI" },
  "Femininity and Sainthood":                        { part: "Appendix", chapter: "Appendix VII" },
  "Ecstasy and the Spiritual Concert":               { part: "Appendix", chapter: "Appendix VIII" },
  "Concerning Spiritual Retreat":                    { part: "Appendix", chapter: "Appendix IX" },
  "Conclusion of the Appendix":                      { part: "Appendix", chapter: "Appendix" },
  "Glossary of Arabic Terms":                        { part: "Back Matter", chapter: "Reference" },
  "Sources for the Kāshif":                          { part: "Back Matter", chapter: "Reference" },
  "Prominent Personalities":                         { part: "Back Matter", chapter: "Reference" },
};

function lookupContext(heading: string): { part: string; chapter: string; heading: string } | null {
  if (!heading) return null;
  for (const key of Object.keys(HEADING_CONTEXT)) {
    if (heading.includes(key)) {
      return { ...HEADING_CONTEXT[key], heading };
    }
  }
  return null;
}

interface RawPage {
  pdfPage: number;
  pnum: string;
  heading: string;
  body: string;
  footnotes: string;
}

function parseStructured(text: string): RawPage[] {
  const pages: RawPage[] = [];
  // Split on the page marker; the first chunk before the first marker is empty.
  const chunks = text.split(/^<<<PAGE /m);
  for (const chunk of chunks) {
    if (!chunk.trim()) continue;
    // chunk shape: "pdf=N pnum=X heading=Y>>>\n<body>\n<<<FOOTNOTES>>>\n<fns>"
    const headerEnd = chunk.indexOf(">>>");
    if (headerEnd < 0) continue;
    const header = chunk.slice(0, headerEnd);
    const rest = chunk.slice(headerEnd + 3).trim();

    const pdfMatch = header.match(/pdf=(\d+)/);
    const pnumMatch = header.match(/pnum=([^\s]*)/);
    const headingMatch = header.match(/heading=(.*)$/);

    const [bodyPart, fnPart = ""] = rest.split(/\n<<<FOOTNOTES>>>\n/);
    pages.push({
      pdfPage: pdfMatch ? parseInt(pdfMatch[1], 10) : 0,
      pnum: pnumMatch?.[1] ?? "",
      heading: headingMatch?.[1]?.trim() ?? "",
      body: bodyPart.trim(),
      footnotes: fnPart.trim(),
    });
  }
  return pages;
}

/**
 * Load the English Kāshif al-Ilbās from its layout-aware re-extraction.
 *
 * Each PDF page becomes one section. Footnotes are appended to the body
 * (separated by a blank line) so the existing footnotes panel can detect
 * them via {@link extractFootnotes}, while remaining cleanly isolated from
 * sentence flow.
 */
export async function loadKashifEnSections(): Promise<KashifEnSection[]> {
  const response = await fetch("/books/kashif-en.txt");
  const rawText = await response.text();
  const rawPages = parseStructured(rawText);

  // Track the last-seen chapter context so unheaded continuation pages inherit it.
  let lastCtx: { part: string; chapter: string; heading: string } | null = null;
  const sections: KashifEnSection[] = [];
  let displayPage = 0;

  for (const rp of rawPages) {
    const ctx = lookupContext(rp.heading);
    if (ctx) lastCtx = ctx;

    const isFrontMatter = rp.pnum === "" || /^[ivxlc]+$/i.test(rp.pnum);
    const fallback = isFrontMatter ? "Front Matter" : "";
    const part = lastCtx?.part || fallback;
    const chapter = lastCtx?.chapter || fallback;
    const heading = ctx?.heading || lastCtx?.heading || (rp.pnum ? `Page ${rp.pnum}` : "");

    let content = rp.body;
    if (rp.footnotes) {
      content = content ? `${content}\n\n${rp.footnotes}` : rp.footnotes;
    }
    if (content.length < 5) continue;

    displayPage++;
    sections.push({
      id: `kashif-en-page-${displayPage}`,
      part,
      chapter,
      heading,
      content,
      pageNumber: displayPage,
    });
  }

  return sections;
}
