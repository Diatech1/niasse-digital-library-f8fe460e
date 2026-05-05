## Problem

In the reader's chapter dropdown for *Jawāhir al-Rasāʾil*, every entry appears twice — once as a bold uppercase chapter header and again as a clickable section row directly below it.

## Cause

`parseJawahirRasailSections` sets both `chapter` and `heading` to the same `currentTitle` for every section (each Counsel is its own one-section "chapter"). The TOC builder in `Reader.tsx` (lines 310–337) then groups sections by `chapter`, so every Counsel becomes a 1-section chapter where the chapter header label and the only section's heading are identical. `ChapterDropdown` faithfully renders both — chapter as the uppercase title, then the section button — producing the duplication.

Other books (kashif-en, volumes) don't show this because their sections have distinct `chapter` vs `heading` (e.g. chapter = "Part I — Foundations", heading = "Section 1: ...").

## Fix

In `src/components/reader/ChapterDropdown.tsx`, when a chapter contains exactly one section AND that section's heading equals the chapter label, render only the clickable button (skip the duplicate uppercase header). The button should adopt the highlighted/primary styling so it still reads as a chapter entry.

This is a pure presentation fix — no parser changes, no impact on other books (which have multi-section chapters or distinct headings).

### Pseudocode

```text
for each chapter ch:
  isSingletonSameTitle = ch.sections.length === 1 && ch.sections[0].heading === ch.chapter
  if isSingletonSameTitle:
    render one button with the chapter label, styled like a chapter entry
  else:
    render uppercase chapter header + section buttons (current behavior)
```

## Files

- `src/components/reader/ChapterDropdown.tsx` — conditional render inside the `tocItems.map`.
