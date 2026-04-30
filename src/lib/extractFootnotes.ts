/**
 * Extract trailing footnote blocks from a page's content.
 *
 * Footnotes are appended to page content by the source-data cleaners
 * (see `detachFootnotes` in src/data/kashif-en.ts) as a trailing block
 * of lines shaped like:
 *
 *   4. Lorem ipsum dolor sit amet...
 *   5. Consectetur adipiscing elit...
 *
 * Each footnote may span multiple lines (continuation lines). A new
 * footnote starts when a line matches /^(\d{1,3})\.\s+\S/.
 *
 * Returns the body (with the trailing footnote block removed) and a
 * structured array of `{ number, text }`.
 */
export interface Footnote {
  number: string;
  text: string;
}

export function extractFootnotes(content: string): { body: string; footnotes: Footnote[] } {
  if (!content) return { body: content, footnotes: [] };

  const paragraphs = content.split(/\n{2,}/);
  // Walk from the end, collecting trailing paragraphs that look like a footnote block.
  let cutIdx = paragraphs.length;
  for (let i = paragraphs.length - 1; i >= 0; i--) {
    const p = paragraphs[i].trim();
    // A footnote paragraph starts with "N. " and is short-ish.
    if (/^\d{1,3}\.\s+\S/.test(p) && p.length < 1200) {
      cutIdx = i;
    } else {
      break;
    }
  }

  if (cutIdx === paragraphs.length) {
    return { body: content, footnotes: [] };
  }

  const bodyParas = paragraphs.slice(0, cutIdx);
  const footnoteParas = paragraphs.slice(cutIdx);
  const lines = footnoteParas.join("\n").split(/\n/);

  const footnotes: Footnote[] = [];
  let current: Footnote | null = null;
  for (const raw of lines) {
    const line = raw.trim();
    if (!line) continue;
    const m = line.match(/^(\d{1,3})\.\s+(.*)$/);
    if (m) {
      if (current) footnotes.push(current);
      current = { number: m[1], text: m[2] };
    } else if (current) {
      current.text = `${current.text} ${line}`.trim();
    }
  }
  if (current) footnotes.push(current);

  return { body: bodyParas.join("\n\n").trimEnd(), footnotes };
}
