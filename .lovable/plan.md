

## Plan: Pocket Paperback Reading Experience

### Goal
Transform the reader from a "web page with columns" into a centered, portrait-oriented pocket book (4:7 aspect ratio) with proper typographic conventions matching a printed paperback.

### Changes

#### 1. Pocket book container (`PagedView.tsx`)
- Constrain the reading area to a **4:7 aspect ratio**, centered horizontally and vertically within the available space
- Calculate dimensions: use the available height as the constraint, derive width as `height * 4/7`; if that exceeds available width, use width as constraint and derive height as `width * 7/4`
- Apply asymmetric margins inside the book frame: **10% gutter (left)**, **8% outside (right)**, **8% top/bottom** — these become the CSS padding on the inner column container
- Add a subtle `box-shadow` and faint border to give the container a "floating page" feel against the theme background
- Remove the current hardcoded `paddingLeft: 40, paddingRight: 40`

#### 2. Typography overhaul (`index.css` + `FormattedContent.tsx`)
- Import **Crimson Pro** (serif with tall x-height) via Google Fonts; use it as the default reader font
- Set `line-height: 1.45` on the reading content (between 1.4–1.5x as specified)
- **Paragraph style**: remove `space-y-4` gaps between paragraphs; instead use `text-indent: 1.5em` on all paragraphs *except* the first paragraph of each section (use CSS `:first-of-type` or a prop)
- Keep `text-align: justify` and `hyphens: auto` (already in place)
- Update the font selector to include "Crimson Pro" as the default serif option

#### 3. Folio / progress footer (`PagedView.tsx` + `ReaderBottomBar.tsx`)
- Inside PagedView, render a minimal folio at the bottom of the book frame: centered, small caps, showing `— {page} —` or `{page} of {total}`
- Style: 9px, `text-muted-foreground/50`, letterspaced, serif italic — like a printed book footer
- Simplify `ReaderBottomBar`: keep only the thin progress bar and prev/next/TOC buttons; remove the duplicate "Page X of Y" text and percentage since the folio handles it

#### 4. Page transition (`PagedView.tsx`)
- Change the `transition` on `translateX` from a simple ease-out to a slightly more physical `cubic-bezier(0.25, 0.1, 0.25, 1.0)` with `0.35s` duration for a smooth page-slide feel

### Files to modify
- `src/index.css` — Add Crimson Pro import, paragraph indent styles, line-height for reader
- `src/components/reader/PagedView.tsx` — 4:7 aspect ratio container, asymmetric margins, folio, transition curve
- `src/components/reader/FormattedContent.tsx` — Remove `space-y-4`, use `text-indent` paragraphs (no indent on first)
- `src/components/reader/ReaderBottomBar.tsx` — Simplify to just progress bar + nav buttons
- `src/pages/Reader.tsx` — Update font options to include Crimson Pro as default

### Technical detail: aspect ratio sizing
```text
Available space (flex-1, full width)
  └── Centered book frame
      ├── width = min(availW, availH * 4/7)
      ├── height = width * 7/4
      ├── padding: 8% top/bottom, 10% left (gutter), 8% right
      ├── box-shadow: 0 2px 24px rgba(0,0,0,0.12)
      └── Column container (fills remaining space after padding)
          └── Content paginated via CSS columns
```

