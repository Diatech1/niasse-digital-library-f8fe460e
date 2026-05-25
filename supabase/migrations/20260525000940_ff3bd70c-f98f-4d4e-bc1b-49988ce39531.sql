ALTER TABLE public.books ADD COLUMN IF NOT EXISTS preferred_voice text;
UPDATE public.books SET preferred_voice = 'Kore' WHERE id = 'rihla-kunakiriya';