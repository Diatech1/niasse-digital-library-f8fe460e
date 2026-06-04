# Slug-based book permalinks

Goal: replace `/book/11` with `/book/le-wird-tidjane` (and same for `/read/:id`, `/listen/:id`), while keeping old numeric URLs working so nothing breaks.

## Why
Some books already use slug-style IDs (`hasbi-bihi`, `volume-1-conditions`), others are numeric (`7`–`18`). Slugs are friendlier for users and better for SEO (keywords in URL, more clickable in search results).

## Approach

1. **Database** — add a `slug` column to `books`
   - `text`, unique, indexed
   - Backfill from `title` (lowercased, accent-stripped, hyphenated). For books whose `id` is already a slug, reuse that id as the slug to keep URLs stable.
   - Examples: `11` → `le-wird-tidjane`, `12` → `les-stations-de-l-islam`, `hasbi-bihi` → `hasbi-bihi`.

2. **Lookup** — `useBook` resolves either slug or id
   - Single source of truth: try `slug === param`, fall back to `id === param`.
   - Old `/book/11` links keep working forever; new canonical links use the slug.

3. **Link generation** — everywhere we build a book URL, use `book.slug ?? book.id`
   - `BookCard`, `BookDetail` (read/listen buttons), `Hero`, `DesktopHomeSections`, `Library`, `AudioLibrary`, `AudioPlayer`, reading-history/favorites/bookmarks consumers, `MiniPlayer`, etc.
   - Reading-history & bookmarks stored in localStorage still key by `id` (stable), so existing progress is preserved.

4. **Canonical + sitemap**
   - `SEO` canonical on `BookDetail` / `Reader` / `AudioPlayer` uses the slug path.
   - `scripts/generate-sitemap.ts` emits slug URLs.
   - JSON-LD `url` field on `BookDetail` uses the slug.

5. **Optional redirect** — when the route param matches a numeric id that has a slug, `navigate(slugPath, { replace: true })` so the address bar updates to the pretty URL.

## Technical details

```text
books
├── id     text  (unchanged, primary key, still used internally)
└── slug   text  unique, not null  ← new
```

Slugify rule (TS helper in `src/lib/slug.ts`):
```
NFD normalize → strip diacritics → lowercase → replace non-alphanumerics with "-" → collapse/trim "-"
```

Route resolution in `useBook(param)`:
```ts
books.find(b => b.slug === param) ?? books.find(b => b.id === param)
```

Files touched (≈10):
- migration: add column + backfill + unique index
- `src/hooks/use-books.ts` (map `slug`), `src/data/books.ts` (add `slug` to `Book`)
- `src/lib/slug.ts` (new helper, also used as fallback if a row ever lacks slug)
- `src/components/BookCard.tsx`, `src/components/desktop/Hero.tsx`, `src/components/desktop/DesktopHomeSections.tsx`
- `src/pages/Index.tsx`, `src/pages/Library.tsx`, `src/pages/AudioLibrary.tsx`, `src/pages/BookDetail.tsx`, `src/pages/AudioPlayer.tsx`, `src/pages/Reader.tsx`
- `src/components/MiniPlayer.tsx` (if it links to a book)
- `scripts/generate-sitemap.ts`

Routes in `App.tsx` stay as `/book/:id` etc. — the param name is just a placeholder; the value can be a slug or numeric id.

## Out of scope
- Changing the primary key from `id` to `slug` (risky, not needed).
- Server-side 301 redirects (not available on static hosting; in-app `replace` navigation is the equivalent).
