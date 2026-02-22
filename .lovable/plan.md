

## Fix: Arabic text misdetected as poetry in FormattedContent

### Problem

In `FormattedContent.tsx`, the detection order is:
1. Page markers
2. Numbered lists
3. Footnotes
4. **Poetry** (fires here for multi-line Arabic)
5. Drop cap
6. **Arabic** (never reached)

The Quranic verses of Al-Fatiha (7 short lines) match the poetry heuristic (`lines >= 3`, `avgLineLen < 80`, no `. `), so they render as a blockquote with a green left border instead of right-to-left Arabic with the proper font.

### Solution

Move the Arabic detection **before** the poetry detection. This way, any paragraph containing predominantly Arabic characters will be rendered with `dir="rtl"`, the Scheherazade New font, and proper line height -- regardless of how many lines it has.

### Technical Details

**File: `src/components/reader/FormattedContent.tsx`**

Reorder the detection blocks so the Arabic check comes before the poetry check. No logic changes needed -- just move the existing Arabic detection block (currently around line 108-122) to run immediately after the footnote detection and before the poetry detection (currently around line 85).

The detection order becomes:
1. Page markers
2. Numbered lists
3. Footnotes
4. **Arabic** (moved up)
5. Poetry
6. Drop cap
7. Regular paragraph

