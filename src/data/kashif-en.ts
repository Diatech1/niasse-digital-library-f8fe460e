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
}

// Section markers to parse from the raw text
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

function cleanContent(text: string): string {
  return text
    .replace(/^\d+\s+THE REMOVAL OF CONFUSION\s*$/gm, "")
    .replace(/^THE REMOVAL OF CONFUSION\s*$/gm, "")
    .replace(/^[ivxlc]+\s*$/gim, "")
    .replace(/^\d+\s*$/gm, "")
    // Remove section header lines that appear as page headers
    .replace(/^Concerning the reality of Sufism\s*$/gm, "")
    .replace(/^The Excellence of Allah's Remembrance \(dhikr\)\s*$/gm, "")
    .replace(/^Congregating for the Remembrance\s*$/gm, "")
    .replace(/^Mention of the Flood.*within the Tij.*$/gm, "")
    .replace(/^Seeking the Shaykh.*$/gm, "")
    .replace(/^General Introduction\s*$/gm, "")
    .replace(/^Background to the Text.*$/gm, "")
    .replace(/^Biography of the Author.*$/gm, "")
    .replace(/^Biography of Authors.*$/gm, "")
    .replace(/^Prominent Personalities.*$/gm, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export async function loadKashifEnSections(): Promise<KashifEnSection[]> {
  const response = await fetch("/books/kashif-en.txt");
  const text = await response.text();
  const lines = text.split("\n");

  const sections: KashifEnSection[] = [];
  let currentMarkerIdx = -1;
  let currentStart = -1;

  // Skip the Table of Contents (first ~66 lines are title page + TOC)
  const startLine = lines.findIndex((l, i) => i > 60 && l.trim() === "Acknowledgements");
  const scanStart = startLine >= 0 ? startLine : 66;

  for (let i = scanStart; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Check if this line matches any section marker
    for (let m = currentMarkerIdx + 1; m < SECTION_MARKERS.length; m++) {
      if (line.startsWith(SECTION_MARKERS[m].line)) {
        // Save previous section
        if (currentMarkerIdx >= 0 && currentStart >= 0) {
          const marker = SECTION_MARKERS[currentMarkerIdx];
          const content = cleanContent(lines.slice(currentStart, i).join("\n"));
          if (content.length > 50) {
            sections.push({
              id: `kashif-en-${currentMarkerIdx}`,
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
      sections.push({
        id: `kashif-en-${currentMarkerIdx}`,
        part: marker.part,
        chapter: marker.chapter,
        heading: marker.heading,
        content,
      });
    }
  }

  return sections;
}
