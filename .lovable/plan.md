## Problem

When the reader is opened in a wide window (desktop / new browser window), the area surrounding the centered "book" page looks broken:

- A flat off-white slab fills the left and right margins.
- A visible horizontal seam appears between the reading area and the area below it, because the page wrapper, the `.reader-stage` and the bottom spacer use three different background layers.
- The ambient gradient on `.reader-stage` is too subtle in light mode to read as an intentional backdrop.

The book itself (page, drop cap, typography) renders correctly — only its surroundings need fixing.

## Goal

A single, continuous, refined backdrop fills the entire reader window on desktop. The book page sits on top of it like a real paperback on a desk, with no panels, no seams, and no abrupt color edges.

## Changes

1. **Unify the reader background on desktop**
   - In `src/pages/Reader.tsx`, on desktop only, suppress the flat `theme.bg` on the outer container so the ambient `.reader-stage` gradient becomes the visible backdrop edge-to-edge. Mobile keeps the current flat surface.
   - Remove the small `h-2` top spacer behind the page when chrome is hidden on desktop (it currently shows as a thin band of the wrong color).
   - Make the bottom-bar transition area transparent (its background already comes from the bar itself when visible).

2. **Polish the desktop ambient backdrop in `src/index.css`**
   - Strengthen `.reader-stage` so it reads as an intentional surface in light mode: a warmer, slightly desaturated gradient (paper-on-table feel) using emerald/sand-gold tints already in the design system, plus a soft top-down vignette.
   - Keep dark mode subtle (just deepen the existing radial vignette so the page glows on a near-black surface).
   - Ensure the stage covers full height (`min-height: 100%`) so no seam can appear below it.

3. **Remove the seam at the bottom**
   - The current `pb-12` on the reader content wrapper plus the chrome's collapsed state leaves a strip with the outer `theme.bg` color showing through. Replace that strip with the same stage gradient (apply background to the wrapper that hosts `<PagedView>`, not just to the inner stage).

4. **Optional polish (small)**
   - Add a faint inner border/edge highlight to `.reader-book` so the page edge reads cleanly against the new backdrop.
   - Slightly soften the page shadow in light mode so it doesn't look "cut out" against a now-warmer backdrop.

## Files touched

- `src/pages/Reader.tsx` — drop the flat theme bg on desktop, drop the chrome-hidden spacer on desktop, let the stage backdrop show through.
- `src/index.css` — refine `.reader-stage` light/dark gradients, ensure full-height coverage, soften the page shadow in light mode.

## Out of scope

- No changes to the book content / parser.
- No changes to typography, drop cap, or pagination logic.
- Mobile layout is unchanged.
