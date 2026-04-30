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

const TERMINAL_PUNCTUATION_RE = /[.!?…:;][)\]"'”’]*$/u;

function cleanExtractedSpacing(content: string) {
  return content
    .replace(/\u00ad/g, '')
    .replace(/([\p{L}\p{M}])-\s+([\p{L}\p{M}])/gu, '$1-$2');
}

function stitchMergedContent(previous: string, next: string) {
  const left = cleanExtractedSpacing(previous).trimEnd();
  const right = cleanExtractedSpacing(next).trimStart();

  if (!left) return right;
  if (!right) return left;

  if (/-$/u.test(left) && /^[\p{L}\p{M}\d]/u.test(right)) {
    return `${left.slice(0, -1)}${right}`;
  }

  if (!TERMINAL_PUNCTUATION_RE.test(left)) {
    return `${left} ${right}`;
  }

  return `${left}\n\n${right}`;
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
      last.content = stitchMergedContent(last.content, s.content);
    } else {
      merged.push({
        id: s.id,
        part: s.part,
        chapter: s.chapter,
        heading: s.heading,
        content: cleanExtractedSpacing(s.content),
      });
    }
  }
  return merged;
}
