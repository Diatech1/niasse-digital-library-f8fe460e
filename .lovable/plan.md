

# Page-by-Page Navigation Matching the PDF

## Overview
Rewrite the content parsing in `kachiful-albas.ts` so that each "page" in the reader corresponds to a physical page from the original PDF. The TXT file already contains standalone page numbers (e.g., "3", "4", ..., "109") on their own lines. These will be used as split points instead of chapter markers.

## How It Works
The TXT file contains lines like:
```
3
Avant propos text...
...
4
More text...
```

Each standalone number marks the start of a new PDF page. The parser will split at these boundaries, producing ~109 pages (matching the PDF). Chapter markers will still be tracked to label each page with its part/chapter for the TOC.

## Changes

### 1. Rewrite `loadKachifulAlbasSections()` in `src/data/kachiful-albas.ts`

- **New parsing strategy**: Scan the TXT file for standalone page numbers (`/^\s*(\d{1,3})\s*$/`). Each page number starts a new section.
- **Chapter tracking**: As we encounter lines matching `SECTION_MARKERS`, update the current part/chapter/heading context. Each page inherits the most recent chapter context.
- **Section output**: Each section gets:
  - `id`: `kfr-page-N` (where N is the PDF page number)
  - `part`/`chapter`/`heading`: inherited from the current chapter marker
  - `content`: the text between two consecutive page numbers
- **Skip front matter**: Pages 1-2 (title page and table of contents) are skipped as before.
- **Remove `cleanContent`'s page-number-to-marker conversion**: Since pages are now split at page boundaries, standalone page numbers no longer appear inside content. The `{{PAGE:N}}` conversion is no longer needed.
- **Keep other cleanContent rules**: Chapter header removal, blank line collapsing still apply.

### 2. Update TOC behavior in `Reader.tsx`

- The `tocItems` logic already groups sections by chapter. Since each page now carries its chapter label, the TOC will show chapters with their constituent pages listed underneath.
- The bottom bar will show "Page 3 of 109" (matching PDF page numbers).

### 3. No changes needed to:
- `FormattedContent.tsx` -- page markers won't appear inside content anymore since each page is its own section
- `ReaderBottomBar.tsx` -- already displays page count
- `ChapterDropdown.tsx` -- already reads from tocItems

## Result
- Reader shows "Page 1 of ~107" (excluding title/TOC pages)
- Each swipe or arrow press moves to the next PDF page
- TOC groups pages under their chapter headings
- Scrolling within a page is minimal (each page is ~1 screen of text)

