# Make the rest of the app responsive

## Current state

The desktop home page already has a proper wide layout (`Hero`, `DesktopHomeSections`). Everything else is still pinned to a 512px-wide phone column on a 1187px screen because `App.tsx` wraps every non-home route in `max-w-lg mx-auto`.

The Reader is a special case: its book canvas already adapts (4:7 ratio book on desktop via `useIsMobile`), but its toolbars, TOC sheet, and side margins were built for narrow screens.

## What to change

### 1. App shell — unlock the width

`src/App.tsx`: remove the unconditional `max-w-lg` wrapper around the catch-all routes. Replace it with a layout that:
- centers content with a sensible max width per page,
- keeps the mobile bottom nav (`lg:hidden`) and `MiniPlayer`,
- adds top padding `lg:pt-20` so content clears the desktop nav.

Pages will own their own container width.

### 2. Library (`src/pages/Library.tsx`)

- Wrap content in `container mx-auto px-6 lg:px-8`.
- Larger header on desktop: `text-2xl lg:text-4xl`, with the same eyebrow + display-font treatment used on the home sections.
- Move language pills onto the same row as the search bar at `lg` (search left, pills right).
- Grid: `grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7` with `gap-5 lg:gap-6`.
- Drop `pb-24` on `lg` (no bottom nav there).

### 3. BookDetail (`src/pages/BookDetail.tsx`)

- On `lg+`, switch to a two-column layout:
  - Left (sticky): cover at ~`max-w-xs`, language badge, action buttons (Read / Listen / Favorite).
  - Right: title, author, metadata grid, description, table-of-contents preview.
- Mobile keeps current single-column hero layout.
- Constrain to `max-w-5xl mx-auto px-6 lg:px-8`.

### 4. AudioLibrary (`src/pages/AudioLibrary.tsx`)

- Container `max-w-6xl mx-auto px-6`.
- Card grid: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3` for the audiobook list.
- Match the home eyebrow/heading styling.

### 5. AudioPlayer (`src/pages/AudioPlayer.tsx`)

- On `lg+`, two-column: blurred cover + cover art on the left, track list / chapter controls on the right.
- Cap content width at `max-w-4xl`.

### 6. Settings (`src/pages/Settings.tsx`)

- Container `max-w-2xl mx-auto px-6 lg:px-8`.
- Larger headings on desktop, more vertical breathing room (`lg:py-12`).
- Group settings into cards (`bg-card border rounded-xl p-6`) on `lg+`.

### 7. Reader chrome (`src/pages/Reader.tsx` + reader subcomponents)

The book canvas (`PagedView`) already does the right thing above 768px. What needs polish:

- **Top bar / bottom bar** (`ReaderBottomBar`): on `lg+`, widen to the full viewport, increase icon hit-targets to ~44px, larger text on the page indicator.
- **Side navigation arrows**: on `lg+`, render absolute prev/next chevrons in the side margins next to the book (already partly present per `mem://features/reader-fullscreen` — verify and extend).
- **TOC sheet**: on `lg+`, open as a left-side `Sheet` with `lg:max-w-md` instead of bottom sheet width.
- **Search overlay** (`ReaderSearch`): cap modal at `max-w-2xl` and center.
- **Bookmark dialog**: already uses Radix `Dialog`, just verify max-width.
- Keep distraction-free behavior (chrome hidden by default, toggled via bottom-right menu) intact on all sizes.

### 8. Bottom nav / mini player

Already correctly hidden on `lg` via `App.tsx`. No change needed beyond removing the `max-w-lg` wrapper around them so MiniPlayer can stretch on desktop if it ever shows there (kept hidden for now).

## Out of scope

- No new features, no data-model changes.
- No changes to the home page (already done).
- No RTL re-audit (covered earlier).
- No database / auth work.

## Technical notes

- Breakpoints: stick with Tailwind defaults — `sm` 640, `md` 768, `lg` 1024, `xl` 1280. The desktop nav and home already key off `lg`, so we'll match that.
- `useIsMobile` (768px) stays the trigger for Reader canvas mode; do not change it.
- Verify each page at 390px, 820px, and 1280px viewports after the change.

## Files touched

- `src/App.tsx`
- `src/pages/Library.tsx`
- `src/pages/BookDetail.tsx`
- `src/pages/AudioLibrary.tsx`
- `src/pages/AudioPlayer.tsx`
- `src/pages/Settings.tsx`
- `src/pages/Reader.tsx`
- `src/components/reader/ReaderBottomBar.tsx`
- `src/components/reader/ReaderSearch.tsx` (minor)
