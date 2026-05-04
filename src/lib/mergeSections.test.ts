import { describe, it, expect } from "vitest";
import { mergeAdjacentSections, type MergeableSection } from "./mergeSections";

/**
 * Regression test for the page 9 → 10 continuity bug.
 *
 * The PDF extractor produces one `BookSection` per source page. Before the
 * fix, the reader rendered each page section independently, which caused:
 *   - the chapter heading ("Background to the Text") to repeat at every
 *     page boundary, and
 *   - sentences that span the boundary (e.g. end of page 9 → start of
 *     page 10) to be visually broken by an inserted heading.
 *
 * `mergeAdjacentSections` collapses consecutive sections that share the
 * same logical heading so the prose flows continuously through the
 * reader's CSS-column pagination.
 */
describe("mergeAdjacentSections — page boundary continuity", () => {
  it("merges adjacent pages that share heading/chapter/part (page 9 → 10)", () => {
    const mockPages: MergeableSection[] = [
      {
        id: "page-9",
        part: "Part I",
        chapter: "Background to the Text",
        heading: "Background to the Text",
        content: "…the shaykh began composing the work as a response",
      },
      {
        id: "page-10",
        part: "Part I",
        chapter: "Background to the Text",
        heading: "Background to the Text",
        content: "to the spiritual confusion of his era, drawing upon…",
      },
    ];

    const merged = mergeAdjacentSections(mockPages);

    expect(merged).toHaveLength(1);
    expect(merged[0].id).toBe("page-9");
    expect(merged[0].heading).toBe("Background to the Text");
    // Both page bodies must be present, joined with a paragraph break, and
    // the heading must NOT be re-injected between them.
    expect(merged[0].content).toBe(
      "…the shaykh began composing the work as a response\n\nto the spiritual confusion of his era, drawing upon…"
    );
    expect(merged[0].content).not.toContain("Background to the Text");
  });

  it("keeps a new section when the heading changes (true chapter break)", () => {
    const mockPages: MergeableSection[] = [
      {
        id: "page-12",
        part: "Part I",
        chapter: "Background to the Text",
        heading: "Background to the Text",
        content: "…concluding remarks on the historical setting.",
      },
      {
        id: "page-13",
        part: "Part I",
        chapter: "Methodology",
        heading: "Methodology",
        content: "The author's approach proceeds in three stages…",
      },
    ];

    const merged = mergeAdjacentSections(mockPages);

    expect(merged).toHaveLength(2);
    expect(merged[0].heading).toBe("Background to the Text");
    expect(merged[1].heading).toBe("Methodology");
    expect(merged[1].id).toBe("page-13");
  });

  it("merges a long run of pages within one chapter into a single section", () => {
    const mockPages: MergeableSection[] = Array.from({ length: 5 }, (_, i) => ({
      id: `page-${20 + i}`,
      part: "Part II",
      chapter: "On Spiritual Stations",
      heading: "On Spiritual Stations",
      content: `Body of page ${20 + i}.`,
    }));

    const merged = mergeAdjacentSections(mockPages);

    expect(merged).toHaveLength(1);
    expect(merged[0].content.split("\n\n")).toEqual([
      "Body of page 20.",
      "Body of page 21.",
      "Body of page 22.",
      "Body of page 23.",
      "Body of page 24.",
    ]);
  });

  it("joins page continuations inline when the previous page ends mid-sentence", () => {
    const mockPages: MergeableSection[] = [
      {
        id: "page-24",
        part: "Front Matter",
        chapter: "Biography of Authors",
        heading: "Biography of Authors",
        content: "Zachary is also the author of On the Path of the Prophet. He has been",
      },
      {
        id: "page-25",
        part: "Front Matter",
        chapter: "Biography of Authors",
        heading: "Biography of Authors",
        content: "blessed to maintain close contact with the community.",
      },
    ];

    const merged = mergeAdjacentSections(mockPages);

    expect(merged).toHaveLength(1);
    expect(merged[0].content).toBe(
      "Zachary is also the author of On the Path of the Prophet. He has been blessed to maintain close contact with the community."
    );
    expect(merged[0].content).not.toContain("been\n\nblessed");
  });

  it("does not merge when `part` differs even if heading matches", () => {
    const mockPages: MergeableSection[] = [
      {
        id: "p1",
        part: "Part I",
        chapter: "Introduction",
        heading: "Introduction",
        content: "Intro to Part I.",
      },
      {
        id: "p2",
        part: "Part II",
        chapter: "Introduction",
        heading: "Introduction",
        content: "Intro to Part II.",
      },
    ];

    const merged = mergeAdjacentSections(mockPages);
    expect(merged).toHaveLength(2);
  });

  it("returns an empty array for empty input", () => {
    expect(mergeAdjacentSections([])).toEqual([]);
  });
});
