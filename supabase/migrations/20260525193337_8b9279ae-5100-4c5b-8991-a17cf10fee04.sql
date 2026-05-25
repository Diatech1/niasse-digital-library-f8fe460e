ALTER TABLE public.books ADD COLUMN IF NOT EXISTS preferred_rate numeric;
UPDATE public.books SET preferred_rate = 0.9 WHERE id = 'rihla-kunakiriya';