
-- 1. Add slug column
ALTER TABLE public.books ADD COLUMN IF NOT EXISTS slug text;

-- 2. Slugify helper (immutable, unaccent-free fallback using translate for common diacritics)
CREATE OR REPLACE FUNCTION public.slugify(input text)
RETURNS text
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT trim(both '-' from
    regexp_replace(
      lower(
        translate(
          input,
          'ÀÁÂÃÄÅàáâãäåÈÉÊËèéêëÌÍÎÏìíîïÒÓÔÕÖØòóôõöøÙÚÛÜùúûüÇçÑñ'',()[]{}!?:;.,/\"',
          'AAAAAAaaaaaaEEEEeeeeIIIIiiiiOOOOOOoooooouUUUuuuuCcNn               '
        )
      ),
      '[^a-z0-9]+', '-', 'g'
    )
  )
$$;

-- 3. Backfill: numeric ids → slug of title; existing slug-like ids → keep id
UPDATE public.books
SET slug = CASE
  WHEN id ~ '^[a-z0-9][a-z0-9-]*$' AND id !~ '^[0-9]+$' THEN id
  ELSE public.slugify(title)
END
WHERE slug IS NULL;

-- 4. Enforce constraints
ALTER TABLE public.books ALTER COLUMN slug SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS books_slug_key ON public.books(slug);
