

# Add PDF Page Break Markers with Margin Page Numbers

## Overview
Preserve the original PDF page numbers from the text file and display them as margin-style page numbers in the reader, replicating the look of a printed book.

## How It Works Today
- The text file (`kachiful-albas-fr.txt`) contains standalone numbers like "4", "6", "69" on their own lines, corresponding to PDF page numbers.
- The `cleanContent()` function in `kachiful-albas.ts` currently **strips these out** with the regex `^\d{1,3}\s*$`.
- As a result, no page break information reaches the reader.

## Plan

### 1. Preserve Page Numbers as Markers in the Text
**File: `src/data/kachiful-albas.ts`**
- Modify `cleanContent()` to convert standalone page numbers into a special inline marker instead of removing them.
- Example: a line containing just "4" becomes `\n\n{{PAGE:4}}\n\n` in the content string.
- This ensures the page number data flows through to `FormattedContent`.

### 2. Render Page Numbers in the Margin
**File: `src/components/reader/FormattedContent.tsx`**
- In the paragraph rendering loop, detect `{{PAGE:N}}` markers.
- Render them as a small page number positioned in the right margin area using absolute positioning.
- Style: small font size (~70% of body), muted color, right-aligned, similar to printed book margin numbers.

```text
+--------------------------------------------------+
|                                                   |
|  Lorem ipsum dolor sit amet, consectetur     4    |
|  adipiscing elit. Sed do eiusmod tempor           |
|  incididunt ut labore et dolore magna aliqua.     |
|                                                   |
+--------------------------------------------------+
```

### 3. Apply to All Books Using Text Files
- The same approach will work for `kashif-en.txt` if it has similar page number patterns.
- Check and apply the same logic in `src/data/kashif-en.ts`.

## Technical Details

**Marker format**: `{{PAGE:N}}` where N is the original PDF page number.

**CSS approach**: A relatively-positioned paragraph wrapper with an absolutely-positioned span for the page number, placed outside the text flow in the right margin.

**Theme compatibility**: The page number will use `text-muted-foreground` with reduced opacity to work across all four reader themes (Light, Sepia, Dark, Midnight).

