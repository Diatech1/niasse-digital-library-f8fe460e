/**
 * Merge consecutive page-sections that share the same logical heading
 * (heading + chapter + part) so that prose flows continuously across
 * CSS-column pagination instead of repeating the chapter heading at
 * every PDF page boundary (e.g. page 9 → page 10).
 *
 * Pure function — exported separately from `Reader.tsx` so it can be
 * unit-tested in isolation against mock page-boundary data.
 */
export interface MergeableSection {
  id: string;
  part?: string;
  chapter?: string;
  heading: string;
  content: string;
}

function shouldJoinInline(previousContent: string, nextContent: string): boolean {
  const prev = previousContent.trimEnd();
  const next = nextContent.trimStart();

  if (!prev || !next) return false;

  // If the source page ends without terminal punctuation, it is almost always
  // a PDF page-wrap inside the same paragraph, so continue inline.
  // Only treat sentence-ending punctuation as a real paragraph terminator. Closing
  // brackets/quotes alone (e.g. "(save his)") indicate a mid-sentence wrap.
  return !/[.!?…:][”"’')\]]*$/.test(prev);
}

export function mergeAdjacentSections<T extends MergeableSection>(sections: T[]): MergeableSection[] {
  const merged: MergeableSection[] = [];
  for (const s of sections) {
    const last = merged[merged.length - 1];
    if (
      last &&
      last.heading === s.heading &&
      last.chapter === s.chapter &&
      last.part === s.part
    ) {
      const separator = shouldJoinInline(last.content, s.content) ? " " : "\n\n";
      last.content = `${last.content.trimEnd()}${separator}${s.content.trimStart()}`;
    } else {
      merged.push({
        id: s.id,
        part: s.part,
        chapter: s.chapter,
        heading: s.heading,
        content: s.content,
      });
    }
  }
  return merged;
}
