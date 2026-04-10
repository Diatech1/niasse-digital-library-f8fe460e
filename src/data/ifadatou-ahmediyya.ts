export const ifadatouAhmediyyaMeta = {
  title: "Ifadatou-l-Ahmediyya",
  subtitle: "lil mourid As-Sa'adatou-l-Abadiyya",
  author: "Seïdina Ahmed Tidjani",
};

export interface IfadatouSection {
  id: string;
  chapter: string;
  heading: string;
  content: string;
}

export async function loadIfadatouSections(): Promise<IfadatouSection[]> {
  const response = await fetch("/books/ifadatou-ahmediyya.txt");
  const text = await response.text();
  const lines = text.split("\n");

  const sections: IfadatouSection[] = [];
  let currentTitle = "";
  let contentLines: string[] = [];
  let sectionIdx = 0;

  function flush() {
    if (!currentTitle) return;
    const content = contentLines
      .join("\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
    if (content.length > 5) {
      // Extract extrait number for heading
      const match = currentTitle.match(/Extrait[s]?\s*(\d+)/i);
      const heading = match ? `Extrait ${match[1]}` : currentTitle;
      sections.push({
        id: `ifadatou-${sectionIdx}`,
        chapter: "Ifadatou-l-Ahmediyya",
        heading,
        content,
      });
      sectionIdx++;
    }
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Skip volume header and separator lines
    if (/^={5,}/.test(line) || /^-{5,}/.test(line)) continue;
    if (/^VOLUME:/.test(line)) continue;
    if (/^-e\s*$/.test(line.trim())) continue;

    // TITRE: line has proper apostrophes – use it as the section title
    if (/^TITRE:/.test(line)) {
      flush();
      currentTitle = line.replace(/^TITRE:\s*/, "").trim();
      contentLines = [];
      continue;
    }

    // Skip the ASCII TITLE: duplicate
    if (/^TITLE:/.test(line)) continue;
    // Skip URL lines
    if (/^URL:/.test(line)) continue;

    if (currentTitle) {
      contentLines.push(line);
    }
  }
  flush();

  // Sort by extrait number
  sections.sort((a, b) => {
    const numA = parseInt(a.heading.replace(/\D/g, "")) || 0;
    const numB = parseInt(b.heading.replace(/\D/g, "")) || 0;
    return numA - numB;
  });

  // Re-index after sort
  sections.forEach((s, i) => { s.id = `ifadatou-${i}`; });

  return sections;
}
