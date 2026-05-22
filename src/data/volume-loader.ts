export interface VolumeSection {
  id: string;
  chapter: string;
  heading: string;
  content: string;
}

/**
 * Generic loader for volume text files that use the TITRE:/TITLE: format.
 * Parses sections separated by TITRE: headers.
 */
export async function loadVolumeSections(
  filePath: string,
  idPrefix: string
): Promise<VolumeSection[]> {
  const response = await fetch(filePath);
  let text = await response.text();
  // Strip control chars that render as stray glyphs (form-feed, vertical tab, etc.)
  text = text.replace(/[\f\v\u0000-\u0008\u000E-\u001F]/g, "");
  const lines = text.split("\n");

  const sections: VolumeSection[] = [];
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
      sections.push({
        id: `${idPrefix}-${sectionIdx}`,
        chapter: currentTitle,
        heading: currentTitle,
        content,
      });
      sectionIdx++;
    }
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (/^={5,}/.test(line) || /^-{5,}/.test(line)) continue;
    if (/^VOLUME:/.test(line)) continue;
    if (/^-e\s*$/.test(line.trim())) continue;

    if (/^TITRE:/.test(line)) {
      flush();
      currentTitle = line.replace(/^TITRE:\s*/, "").trim();
      contentLines = [];
      continue;
    }

    if (/^TITLE:/.test(line)) continue;
    if (/^URL:/.test(line)) continue;

    if (currentTitle) {
      contentLines.push(line);
    }
  }
  flush();

  return sections;
}
