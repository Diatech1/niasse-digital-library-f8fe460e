# Adopt Fayda Digital Sanctuary front-end for desktop

## My honest take first

The referenced project (Fayda Digital Sanctuary) is a **marketing-style website**: hero image, stats band, featured carousel, category tiles, quote slider, top navbar + footer. It looks beautiful on desktop and matches the Cheikh Ibrahim Niass theme nicely.

But it is **only a shell**. It has 4 pages (Index, Library, BookDetail, NotFound), a dummy `books.ts`, and **none** of Faydabook's real engine: the paged reader, TTS, audio player, bookmarks, reading history, search-in-reader, RTL, i18n, content-registry loader, Supabase integration, etc.

So we should **not replace** the current app with that codebase. Instead, we **port its visual language and landing/library layout** into Faydabook as a desktop experience, while keeping the mobile-first reader and all existing features untouched.

## Proposed approach: responsive dual layout

One codebase, two layouts driven by `useIsMobile()` (or a `lg:` breakpoint):

- **Mobile (≤ 768px)** — unchanged. Current pocket-paperback reader, bottom nav, MiniPlayer, etc.
- **Desktop (≥ 1024px)** — new marketing-style shell inspired by Fayda Digital Sanctuary.

```text
Desktop layout
┌─────────────────────────────────────────────┐
│  Navbar (logo · Home · Library · Listen · Search) │
├─────────────────────────────────────────────┤
│  HERO  (image + title + search)             │
│  Continue reading row                       │
│  Featured / Tidjaniya series row            │
│  Categories grid (Tasawwuf, Fiqh, …)        │
│  Quote slider                               │
│  Footer                                     │
└─────────────────────────────────────────────┘
```

Reader on desktop: keep the 4:7 book pane (already supported by `PagedView`) but wrap it in the new navbar + a sidebar for TOC/bookmarks instead of the mobile sheet.

## What to build

### 1. Visual tokens
- Add the cream/emerald/gold palette from the reference as **light-mode** variants in `src/index.css` (we already have a light theme — refine it to match).
- Add font `Playfair Display` for `font-display` headings; keep `Crimson Pro` for reader body (memory rule).
- Add utilities: `.text-gradient-gold`, `.bg-gradient-emerald`, `.bg-gradient-gold`, `.bg-gradient-hero`.

### 2. New desktop-only components
- `src/components/desktop/Navbar.tsx` — fixed top bar, logo, links, search button.
- `src/components/desktop/Footer.tsx` — simple footer with credits and language switcher.
- `src/components/desktop/Hero.tsx` — hero image + title + search input wired to existing `SearchBar` logic.
- `src/components/desktop/QuoteSlider.tsx` — rotating quotes (use a small `quotes` array seeded from the books data).

### 3. Page updates (responsive — no new routes)
- `src/pages/Index.tsx`: render `<DesktopHome />` on `lg:` and the existing mobile layout below `lg:`. Desktop home composes Navbar + Hero + Continue Reading row + Featured row + Categories grid + Quote + Footer.
- `src/pages/Library.tsx`: on desktop, render Navbar + the reference's filter UI (search bar + filter chip drawer) feeding the same `useBooks` data; mobile stays as-is.
- `src/pages/BookDetail.tsx`: on desktop, two-column layout (cover left, metadata + actions right) like the reference; mobile stays as-is.
- `src/pages/Reader.tsx`: on desktop, keep current `PagedView` but show the new Navbar at the top and surface TOC/bookmarks in a left sidebar instead of the slide-over sheet. Hide the bottom nav on desktop. Immersive mode still works.

### 4. Hide BottomNav on desktop
- In `BottomNav.tsx`, return `null` when not mobile, so the desktop shell takes over navigation.

### 5. Categories
- Map the reference's `Tasawwuf / Fiqh / Tafsir / Poetry / Speeches` to whatever categorization fits Faydabook's actual library (we already have "Tidjaniya.com series vs Other Works" — surface that, and optionally a thematic grid if metadata allows).

## What we explicitly keep

- All hooks: `useAudioPlayer`, `useBookContent`, `useBookmarks`, `useReadingProgress`, `useLanguage`, `useTheme`, `useReadAlong`, `useGeminiTts`.
- Reader engine (`PagedView`, `FormattedContent`, `ReaderSearch`, `BookmarkDialog`, `ChapterDropdown`).
- `MiniPlayer`, `AudioPlayer`, `AudioLibrary`, Settings.
- Supabase `books` table, content registry, volume loader.
- RTL, i18n, light/dark/system theme, no human depictions, all current memory rules.

## What we do NOT do

- Do not import/copy the reference project as-is.
- Do not introduce `framer-motion` heavily — use it only inside the new desktop components if needed (small footprint).
- Do not change mobile UX.
- Do not add a `/about` route just because the reference navbar mentions it.

## Suggested execution order (small steps)

1. Add desktop tokens + fonts + gradient utilities in `index.css`.
2. Build `Navbar`, `Footer`, `Hero`, `QuoteSlider`.
3. Wire desktop `Index.tsx` (Home).
4. Wire desktop `Library.tsx` and `BookDetail.tsx`.
5. Add desktop chrome to `Reader.tsx` (sidebar TOC + top navbar).
6. QA on 1280×720, 1440×900, 1920×1080.

## Open question for you

Want me to also offer a **separate `/desktop` preview route** during development so we can iterate without affecting mobile users, or go straight to the responsive single-codebase approach above?
