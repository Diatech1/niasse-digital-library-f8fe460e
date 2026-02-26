

# Migrate Book Library to Lovable Cloud (Supabase)

## Overview
Move the hardcoded book data from `src/data/books.ts` into a Supabase database table, then update all pages to fetch books from the database instead.

## Steps

### 1. Enable Lovable Cloud
Activate the Lovable Cloud backend to get a Supabase database.

### 2. Create the `books` table
Create a migration with the following schema:

| Column | Type | Notes |
|---|---|---|
| id | text (PK) | Keep existing IDs ("7", "8", etc.) |
| title | text | Required |
| title_ar | text | Nullable (Arabic title) |
| author | text | Required |
| cover | text | URL to cover image |
| language | text | "English", "French", "Arabic" |
| pages | integer | Page count |
| tags | text[] | Array of tag strings |
| description | text | Book description |
| has_audio | boolean | Default false |
| audio_duration | text | Nullable |
| content_module | text | Nullable, maps to local data module |
| is_favorite | boolean | Default false |
| created_at | timestamptz | Auto-set |

RLS policy: Allow public read access (no auth needed for a library).

### 3. Upload cover images to Supabase Storage
- Create a public `book-covers` storage bucket
- Upload the 12 existing cover images from `src/assets/`
- Use the resulting public URLs in the database `cover` column

### 4. Seed the database
Insert all 12 books with their data and the new cover URLs.

### 5. Create a React hook `useBooks`
- New file: `src/hooks/use-books.ts`
- Uses `@tanstack/react-query` to fetch from the `books` table
- Returns `{ books, isLoading, error }`
- Converts snake_case DB columns to camelCase for the existing `Book` interface

### 6. Update all consuming pages
Replace `import { books } from "@/data/books"` with the new `useBooks()` hook in:
- `src/pages/Index.tsx`
- `src/pages/Library.tsx`
- `src/pages/BookDetail.tsx`
- `src/pages/AudioPlayer.tsx`
- `src/pages/AudioLibrary.tsx`
- `src/pages/Reader.tsx`

Add loading skeletons where appropriate.

### 7. Keep the `Book` interface
Move the `Book` TypeScript interface to a shared types file or keep it in `src/data/books.ts` for backward compatibility. Remove the hardcoded array.

---

## Technical Details

- **No authentication required** -- this is a public library, so RLS will use a simple `SELECT` policy for anonymous access
- **Cover images**: Stored in Supabase Storage with public URLs, replacing the local imports
- **Existing features preserved**: Reading progress (localStorage), content modules (local data files), bookmarks all continue to work since they reference `book.id` and `book.contentModule`
- **Tanstack Query** is already installed, so caching and refetching come for free

