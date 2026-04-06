export const conditionsReglesMeta = {
  title: "Conditions et Règles de la Tariqa Tidjaniya",
  author: "Zaouiya Tidjaniya El Koubra d'Europe",
  source: "tidjaniya.com",
};

export interface ConditionsSection {
  id: string;
  chapter: string;
  heading: string;
  content: string;
}

const TARGET_PAGE_CHARS = 1400;

export async function loadConditionsReglesSections(): Promise<ConditionsSection[]> {
  const response = await fetch("/books/conditions-regles.txt");
  const rawText = await response.text();
  return parseConditionsRegles(rawText);
}

function parseConditionsRegles(raw: string): ConditionsSection[] {
  // Split on TITLE: markers into logical sections
  const parts = raw.split(/^TITLE:\s*/m).filter((p) => p.trim().length > 0);

  const logicalSections: { heading: string; content: string }[] = [];
  parts.forEach((part) => {
    const lines = part.split("\n");
    const heading = lines[0].trim();
    const content = lines.slice(1).join("\n").trim();
    if (content) {
      logicalSections.push({ heading, content });
    }
  });

  // Now paginate: split long sections and merge short ones
  const pages: ConditionsSection[] = [];
  let pageIdx = 0;

  for (const section of logicalSections) {
    const paragraphs = section.content.split("\n\n").filter((p) => p.trim().length > 0);

    if (section.content.length <= TARGET_PAGE_CHARS * 1.3) {
      // Fits in one page
      pages.push({
        id: `conditions-${++pageIdx}`,
        chapter: "Conditions et Règles",
        heading: section.heading,
        content: section.content,
      });
    } else {
      // Split into multiple pages at paragraph boundaries
      let currentChunks: string[] = [];
      let currentLen = 0;
      let subPage = 0;

      for (const para of paragraphs) {
        if (currentLen > 0 && currentLen + para.length > TARGET_PAGE_CHARS) {
          // Flush current page
          subPage++;
          pages.push({
            id: `conditions-${++pageIdx}`,
            chapter: "Conditions et Règles",
            heading: subPage === 1 ? section.heading : `${section.heading} (suite)`,
            content: currentChunks.join("\n\n"),
          });
          currentChunks = [];
          currentLen = 0;
        }
        currentChunks.push(para);
        currentLen += para.length;
      }

      // Flush remainder
      if (currentChunks.length > 0) {
        subPage++;
        pages.push({
          id: `conditions-${++pageIdx}`,
          chapter: "Conditions et Règles",
          heading: subPage === 1 ? section.heading : `${section.heading} (suite)`,
          content: currentChunks.join("\n\n"),
        });
      }
    }
  }

  return pages;
}
