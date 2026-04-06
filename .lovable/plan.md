

## Plan: Professional Ebook Reader Experience

### Problems identified
From the screenshot: text is clipping mid-word at column edges, content overflows the right side, and the overall layout feels rough and unpolished. The root causes:
1. **No inner padding** in the column container — text runs edge-to-edge and gets clipped by `overflow-hidden`
2. **Column width calculation ignores padding** — `pageWidth` equals the full container width, so columns extend beyond the visible area
3. **The `max-w-4xl` constraint** on the content wrapper conflicts with the PagedView width calculations

### Solution

#### 1. Fix column width math in `PagedView.tsx`
- Subtract horizontal padding (e.g. 32px per side = 64px total) from the container width before computing column dimensions
- In single-page mode: `columnWidth = containerWidth - padding*2`
- In spread mode: `columnWidth = (containerWidth - padding*2 - gap) / 2`
- `spreadWidth = containerWidth` (the full outer width, since translateX moves the whole inner div)
- Add `paddingLeft` and `paddingRight` on the inner column container so text never touches edges

#### 2. Remove conflicting constraints in `Reader.tsx`
- Remove `max-w-4xl` from the content area — PagedView should fill the available width and handle its own margins internally
- Remove `px-6` from the content wrapper (padding is now handled inside PagedView)
- Keep the `flex-1 min-h-0 overflow-hidden` chain which correctly constrains height

#### 3. Polish the reading area
- Add a subtle vertical divider line between spread pages (a centered `border-right` on the left column area, via a CSS pseudo-element or an absolute-positioned div)
- Ensure page numbers are properly centered under each column, not at the container edges
- Add `text-align: justify` and `hyphens: auto` via CSS on `.formatted-content` for cleaner word wrapping

### Files to modify
- `src/components/reader/PagedView.tsx` — Fix width math, add inner padding, add center divider
- `src/pages/Reader.tsx` — Remove `max-w-4xl` and `px-6` from content wrapper
- `src/index.css` — Add `hyphens: auto` to formatted content for better text flow

