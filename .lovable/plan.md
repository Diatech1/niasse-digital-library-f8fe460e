

# Fix Section Count to Match Original PDF Structure

## Problem
The `splitSection()` function in `kachiful-albas.ts` artificially splits long chapters into sub-sections of 12 paragraphs, inflating the count from the book's real ~16 sections to 29. The bottom bar showing "Page 1 of 29" is misleading and doesn't reflect the actual book structure.

## Solution
Remove the `splitSection()` chunking so each section in the reader corresponds to a real chapter/section from the original PDF. The reader already supports scrolling within long sections, so there's no functional need to split them.

## Changes

### 1. Remove splitSection from kachiful-albas.ts
- Remove the `splitSection()` function
- In `loadKachifulAlbasSections()`, push `rawSections` directly into the final array without splitting
- The bottom bar will then show "Page 1 of ~16" matching the real book divisions

### 2. Apply same fix to kashif-en.ts
- Check if `kashif-en.ts` uses a similar splitting function and remove it as well to keep consistency

## Result
- Bottom bar shows "Page 1 of 16" (or however many real sections exist)
- Each "page" in the reader corresponds to a real chapter or section from the PDF
- Navigation (TOC, swipe, arrows) moves between actual book divisions
- Long chapters simply scroll within their section

