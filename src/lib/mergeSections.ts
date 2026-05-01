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
      last.content = `${last.content}\n\n${s.content}`;
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
