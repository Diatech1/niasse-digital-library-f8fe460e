export interface TidjaniyaArticle {
  id: string;
  number: number;
  title: string;
  content: string;
}

export interface ThemeGroup {
  id: string;
  title: string;
  description: string;
  keywords: string[];
  articleNumbers?: number[];
}

export const themeGroups: ThemeGroup[] = [
  {
    id: "cheminement-tidjani",
    title: "Le Cheminement Tidjani",
    description: "Enseignements sur le parcours spirituel dans la Tariqa Tidjaniya",
    keywords: ["cheminement", "tariqa", "voie", "parcours", "chemin", "partie 1", "partie 2"],
  },
  {
    id: "ifadat-ahmediyya",
    title: "Ifadatou-l-Ahmediyya",
    description: "Paroles et enseignements de Seïdina Ahmed Tidjani extraits du Djawahirou-l-Ma'ani",
    keywords: ["ifadatou", "ifadat", "extrait"],
  },
  {
    id: "guide-oraisons",
    title: "Guide des Oraisons",
    description: "Questions, réponses et règles sur le Lazim, la Wadhifa et le Heïlala",
    keywords: ["lazim", "wadhifa", "oraison", "jabr", "réparation", "pilier", "condition", "question", "heïlala"],
  },
  {
    id: "meditations-recits",
    title: "Méditations & Récits",
    description: "Réflexions spirituelles, récits prophétiques et méditations poétiques",
    keywords: ["méditation", "récit", "secret", "épreuve", "souci", "sagesse", "ombre", "lait", "histoire", "conte"],
  },
  {
    id: "amour-prophete",
    title: "L'Amour du Prophète ﷺ",
    description: "Enseignements sur l'amour du Prophète, la Sira et la prière sur lui",
    keywords: ["prophète", "sira", "biographie", "amour", "prière sur", "salat fatihi", "fatihi"],
  },
  {
    id: "tawhid-connaissance",
    title: "Le Tawhid et la Connaissance",
    description: "Enseignements sur l'unicité divine, la connaissance spirituelle et le fath",
    keywords: ["tawhid", "unicité", "connaissance", "fath", "ouverture", "ruse divine", "sincérité"],
  },
  {
    id: "adab-tariqa",
    title: "Les Bienséances de la Voie",
    description: "Règles de conduite, compagnonnage et éthique dans la Tariqa",
    keywords: ["compagnonnage", "bienséance", "adab", "condition n", "détail", "comportement", "lundi", "lettre"],
  },
  {
    id: "perles-sagesse",
    title: "Perles de Sagesse",
    description: "Courts enseignements, paroles précieuses et conseils spirituels",
    keywords: ["perle", "meilleur", "gens", "riba", "interdi", "aumône"],
  },
];

// Classify an article into a theme based on its title
function classifyArticle(title: string): string {
  const lower = title.toLowerCase();

  // Specific patterns first
  if (/ifadatou|ifadat|extrait\s+\d/i.test(lower)) return "ifadat-ahmediyya";
  if (/lazim|wadhifa|oraison|jabr|réparation|pilier|heïlala|question.*réponse|réponse.*question/i.test(lower)) return "guide-oraisons";
  if (/cheminement.*tariqa|tariqa.*tidj|voie.*droite/i.test(lower)) return "cheminement-tidjani";
  if (/sira|biographie|prophète.*ﷺ|amour.*prophète|amour.*allah|prière.*besoin|ṣalât.*ḥâjah/i.test(lower)) return "amour-prophete";
  if (/salat.*fatihi|fatihi.*salat/i.test(lower)) return "amour-prophete";
  if (/tawhid|unicité|fath|ouverture.*spirit|ruse.*divine|sincér/i.test(lower)) return "tawhid-connaissance";
  if (/condition.*n[ºo°]|compagnonnage|spécificité.*lundi|lettre.*sidi|lettre.*tijani/i.test(lower)) return "adab-tariqa";
  if (/méditation|récit|secret.*donne|épreuve|souci.*pri|ombre.*vérité|conte|histoire/i.test(lower)) return "meditations-recits";
  if (/sagesse|homme.*femme|mariage|meilleur.*gens|riba|interdi/i.test(lower)) return "perles-sagesse";
  if (/paroles.*seyyidinâ|paroles.*cheikh|paroles.*bien/i.test(lower)) return "ifadat-ahmediyya";

  // Default: shorter articles → perles, longer → cheminement
  return "perles-sagesse";
}

let cachedArticles: TidjaniyaArticle[] | null = null;

export async function loadTidjaniyaArticles(): Promise<TidjaniyaArticle[]> {
  if (cachedArticles) return cachedArticles;

  const res = await fetch("/books/tidjaniya_full_teachings.txt");
  const text = await res.text();

  const articles: TidjaniyaArticle[] = [];
  const parts = text.split(/---\s*ARTICLE\s+(\d+)\s*---/);

  // parts[0] is before first article marker
  // then alternating: [articleNumber, articleContent, articleNumber, articleContent, ...]
  for (let i = 1; i < parts.length; i += 2) {
    const num = parseInt(parts[i], 10);
    const block = parts[i + 1] || "";

    // Extract title from TITRE: line
    const titleMatch = block.match(/TITRE:\s*(.+)/);
    const title = titleMatch ? titleMatch[1].trim() : `Article ${num}`;

    // Remove the TITRE and URL lines, and the repeated title line
    const lines = block.split("\n");
    const contentLines: string[] = [];
    let skipNext = false;
    let foundTitle = false;

    for (const line of lines) {
      if (line.startsWith("TITRE:")) { skipNext = true; continue; }
      if (line.startsWith("URL:")) continue;
      if (line.startsWith("====")) continue;
      // Skip the first occurrence of the title as heading
      if (!foundTitle && line.trim() === title) { foundTitle = true; continue; }
      if (skipNext && line.trim() === "") { skipNext = false; continue; }
      contentLines.push(line);
    }

    const content = contentLines.join("\n").trim();
    if (content.length > 50) {
      articles.push({ id: `tidj-art-${num}`, number: num, title, content });
    }
  }

  cachedArticles = articles;
  return articles;
}

export async function loadArticlesForTheme(themeId: string): Promise<{
  meta: { title: string; source: string };
  sections: { id: string; chapter: string; heading: string; content: string }[];
}> {
  const articles = await loadTidjaniyaArticles();
  const group = themeGroups.find((g) => g.id === themeId);
  if (!group) return { meta: { title: "Unknown", source: "tidjaniya.com" }, sections: [] };

  const themed = articles.filter((a) => classifyArticle(a.title) === themeId);

  const sections = themed.map((a) => ({
    id: a.id,
    chapter: group.title,
    heading: a.title,
    content: a.content,
  }));

  return {
    meta: { title: group.title, source: "tidjaniya.com" },
    sections,
  };
}
