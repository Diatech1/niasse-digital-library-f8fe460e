

## Plan: Real Book Reading Experience with Two-Page Spread

### Problem
The CSS column-based pagination isn't working because the container lacks a fixed pixel height — `min-h-screen` allows the flex container to grow, preventing CSS columns from creating horizontal pages. Content just flows vertically with no visible page breaks.

### Solution

#### 1. Fix PagedView height constraint (`PagedView.tsx`)
- The outer container must have a concrete pixel height for CSS columns to paginate horizontally
- Use `ResizeObserver` to capture the outer container's **height** (already capturing width) and set it explicitly on the inner column container
- This is the root cause: without a fixed height, `columnFill: auto` has nothing to fill against

#### 2. Two-page spread on desktop (`PagedView.tsx`)
- Detect container width: if >= 700px, use 2-column spread; otherwise single page
- Calculate `columnWidth` as `(containerWidth - gap) / 2` for spread mode, `containerWidth` for single
- Each "page turn" advances by the full spread width (2 columns worth)
- Total pages = `ceil(scrollWidth / spreadWidth)`

#### 3. Page numbers inside each page (`PagedView.tsx`)
- Overlay page numbers at the bottom of the visible area using absolute positioning
- In spread mode: show left page number (bottom-left) and right page number (bottom-right)
- In single mode: show centered page number at the bottom
- Style: small, muted text like a printed book footer

#### 4. Keep bottom bar navigation in sync (`Reader.tsx`)
- Remove the separate `{currentSectionIdx + 1} / {pagedTotal}` text below PagedView (redundant since page numbers are now inside the page)
- Bottom bar still shows progress % and prev/next controls

### Files to modify
- `src/components/reader/PagedView.tsx` — Fix height, add spread logic, add page number overlays
- `src/pages/Reader.tsx` — Remove redundant page indicator, ensure height chain is correct (use `h-screen` instead of `min-h-screen` on reader container, or calculate available height)
- `src/index.css` — Minor tweaks for page number styling if needed

### Technical detail: height chain
```text
Container (h-screen, flex col)
  ├── Top bar (shrink-0)
  ├── Font bar (shrink-0)  
  ├── Content area (flex-1, overflow-hidden)
  │   └── PagedView (h-full)
  │       └── Column container (height: measuredHeight px)
  │           └── Content flows into columns →→→
  └── Bottom bar (shrink-0, fixed)
```

