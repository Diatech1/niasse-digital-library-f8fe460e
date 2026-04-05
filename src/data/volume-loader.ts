export interface VolumeSection {
  id: string;
  chapter: string;
  heading: string;
  content: string;
}

export interface VolumeMeta {
  title: string;
  subtitle: string;
  author: string;
}

const volumeMetaMap: Record<string, VolumeMeta> = {
  "volume-1-conditions": {
    title: "Conditions et Règles",
    subtitle: "de la Tariqa Tidjaniya",
    author: "Sidi Ahmed Tijani",
  },
  "volume-2-liturgies": {
    title: "Liturgies et Prières",
    subtitle: "Oraisons et Invocations",
    author: "Sidi Ahmed Tijani",
  },
  "volume-3-ethics": {
    title: "Éthique et Conseils Spirituels",
    subtitle: "Enseignements de la Voie",
    author: "Sidi Ahmed Tijani",
  },
  "volume-4-letters": {
    title: "Lettres et Correspondances",
    subtitle: "Épîtres Spirituelles",
    author: "Sidi Ahmed Tijani",
  },
  "volume-5-commentaries": {
    title: "Commentaires du Coran et du Hadith",
    subtitle: "Exégèse et Sagesse",
    author: "Sidi Ahmed Tijani",
  },
  "volume-6-ifadat": {
    title: "Ifadatou-l-Ahmediyya",
    subtitle: "Sagesses et Enseignements",
    author: "Sidi Ahmed Tijani",
  },
  "volume-7-biography": {
    title: "Biographie et Sira",
    subtitle: "du Prophète ﷺ",
    author: "Sidi Ahmed Tijani",
  },
  "volume-8-teachings": {
    title: "Autres Enseignements",
    subtitle: "et Sagesses",
    author: "Sidi Ahmed Tijani",
  },
};

export function getVolumeMeta(moduleId: string): VolumeMeta {
  return volumeMetaMap[moduleId] || { title: moduleId, subtitle: "", author: "" };
}

export async function loadVolumeSections(moduleId: string): Promise<VolumeSection[]> {
  const fileMap: Record<string, string> = {
    "volume-1-conditions": "/books/volume-1-conditions.txt",
    "volume-2-liturgies": "/books/volume-2-liturgies.txt",
    "volume-3-ethics": "/books/volume-3-ethics.txt",
    "volume-4-letters": "/books/volume-4-letters.txt",
    "volume-5-commentaries": "/books/volume-5-commentaries.txt",
    "volume-6-ifadat": "/books/volume-6-ifadat.txt",
    "volume-7-biography": "/books/volume-7-biography.txt",
    "volume-8-teachings": "/books/volume-8-teachings.txt",
  };

  const filePath = fileMap[moduleId];
  if (!filePath) return [];

  const response = await fetch(filePath);
  const text = await response.text();

  const sections: VolumeSection[] = [];
  // Split by TITLE: markers
  const titleRegex = /^-{2,}\s*\nTITLE:\s*(.+)\s*\n-{2,}/gm;
  const titreRegex = /^TITRE:\s*(.+)$/m;

  let match: RegExpExecArray | null;
  const markers: { index: number; rawTitle: string }[] = [];

  while ((match = titleRegex.exec(text)) !== null) {
    markers.push({ index: match.index, rawTitle: match[1].trim() });
  }

  for (let i = 0; i < markers.length; i++) {
    const start = markers[i].index;
    const end = i + 1 < markers.length ? markers[i + 1].index : text.length;
    const block = text.substring(start, end);

    // Extract clean title from TITRE: line (has proper accents)
    const titreMatch = block.match(titreRegex);
    const heading = titreMatch ? titreMatch[1].trim() : markers[i].rawTitle;

    // Extract content: everything after the URL line (or after TITRE if no URL)
    const urlLineEnd = block.indexOf("\n", block.indexOf("URL:") > -1 ? block.indexOf("URL:") : 0);
    let content = urlLineEnd > -1
      ? block.substring(urlLineEnd + 1)
      : block;

    // Remove header lines (dashes, TITLE, TITRE, URL)
    content = content
      .replace(/^-{2,}\s*$/gm, "")
      .replace(/^TITLE:.*$/gm, "")
      .replace(/^TITRE:.*$/gm, "")
      .replace(/^URL:.*$/gm, "")
      .replace(/^-e\s*$/gm, "")
      .replace(/\n{3,}/g, "\n\n")
      .trim();

    if (content.length < 5) continue;

    sections.push({
      id: `${moduleId}-${i}`,
      chapter: heading,
      heading,
      content,
    });
  }

  return sections;
}
