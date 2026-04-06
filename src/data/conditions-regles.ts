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

export async function loadConditionsReglesSections(): Promise<ConditionsSection[]> {
  const response = await fetch("/books/conditions-regles.txt");
  const rawText = await response.text();
  return parseConditionsRegles(rawText);
}

function parseConditionsRegles(raw: string): ConditionsSection[] {
  const sections: ConditionsSection[] = [];
  // Split on TITLE: markers
  const parts = raw.split(/^TITLE:\s*/m).filter((p) => p.trim().length > 0);

  parts.forEach((part, idx) => {
    const lines = part.split("\n");
    const heading = lines[0].trim();
    const content = lines.slice(1).join("\n").trim();

    if (!content) return;

    sections.push({
      id: `conditions-${idx + 1}`,
      chapter: "Conditions et Règles",
      heading,
      content,
    });
  });

  return sections;
}
