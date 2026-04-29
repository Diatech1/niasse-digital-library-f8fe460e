
# Add desktop hero section to Home (single codebase)

## Scope

Port **only the hero section** from the Fayda Digital Sanctuary reference project into Faydabook. Everything else — Library, BookDetail, Reader, BottomNav, MiniPlayer, the existing mobile Home layout — stays exactly as it is today.

The hero appears **only on desktop** (`lg:` and up). On mobile/tablet (<1024px), the current Home page renders unchanged.

## What the hero looks like

```text
┌─────────────────────────────────────────────────────────┐
│  [full-bleed library photo, dark gradient overlay]      │
│                                                         │
│            THE DIGITAL LIBRARY OF                       │
│                                                         │
│           Cheikh Ibrahim Niass                          │
│                  (gold gradient on "Niass")             │
│                                                         │
│   Explore the spiritual treasures of Medina Baye —      │
│   books, lectures, and poetry...                        │
│                                                         │
│        ┌─────────────────────────────────┐              │
│        │ 🔍  Search books, lectures...   │              │
│        └─────────────────────────────────┘              │
│                                                         │
└─────────────────────────────────────────────────────────┘
       ↓ below: existing Home page (Continue Reading,
         Favorites, Library grid) — full-width container
```

- Height: `85vh` minimum 600px.
- Background: full-bleed library photo + dark gradient overlay.
- Headline: serif display font, "Niass" in gold gradient.
- Search input: rounded pill, submits to `/library?q=...` (reuses existing Library search).
- All copy is wired through `useLanguage().t()` so EN/FR/AR work.

## Files to add

1. **`src/assets/hero-library.jpg`** — copy from the reference project.
2. **`src/components/desktop/Hero.tsx`** — the hero section component.

## Files to edit

1. **`src/index.css`**
   - Import Playfair Display font (alongside existing Lora/Crimson Pro).
   - Add the `--gold-light` and `--cream-dark` CSS variables (light + dark themes) so the hero text colors render correctly without changing other surfaces.
   - Add three utilities used by the hero only: `.text-gradient-gold`, `.bg-gradient-hero`, `.font-display` (Playfair Display).

2. **`src/pages/Index.tsx`**
   - Wrap the existing mobile layout: render `<Hero />` inside a `hidden lg:block` wrapper at the top.
   - The current page width constraint (`max-w-lg` in `App.tsx`) will clip the hero, so we also need to allow the Home route to break out of that wrapper on desktop.

3. **`src/App.tsx`**
   - Currently every non-Reader route is wrapped in `<div className="max-w-lg mx-auto">`. To let the hero go full-bleed on desktop **for the Home page only**, change this wrapper to `max-w-lg lg:max-w-none mx-auto` for the Home route, OR pull `Index` out of the wrapper similarly to how `Reader` is already pulled out. Cleaner option: extract Home into its own Route entry like Reader, and let `Index.tsx` re-add the `max-w-lg` container internally for the existing mobile content below the hero.
   - BottomNav and MiniPlayer must continue to render on Home.

4. **`src/i18n/translations.ts`**
   - Add 3 new keys for the hero copy (eyebrow, subtitle, search placeholder) in EN/FR/AR. The headline "Cheikh Ibrahim Niass" stays as-is across languages.

## What we are NOT doing

- No Navbar, Footer, Stats band, Featured row, Categories grid, or Quote slider.
- No changes to Library, BookDetail, Reader, AudioPlayer, Settings.
- No changes to mobile Home — below `lg:`, the page renders identically to today.
- No new routes.

## QA checklist

- 390×844 (mobile): hero hidden, current Home renders exactly as before.
- 1280×720 and 1920×1080: hero fills the top, search submits to `/library?q=...`, existing Continue Reading / Favorites / Library grid sit below in their current `max-w-lg` column (acceptable for v1; we can widen them in a follow-up if you want).
- Light and dark themes both readable.
- EN / FR / AR copy renders correctly.

## Open follow-ups (not in this plan)

If you like the hero, the natural next steps would be: (a) widen the Home content below the hero on desktop, and (b) port the Library/BookDetail desktop layouts. Both are easy add-ons later.
