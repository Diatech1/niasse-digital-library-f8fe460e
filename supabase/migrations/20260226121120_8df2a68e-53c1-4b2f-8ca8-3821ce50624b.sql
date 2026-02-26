
-- Create the books table
CREATE TABLE public.books (
  id text PRIMARY KEY,
  title text NOT NULL,
  title_ar text,
  author text NOT NULL,
  cover text NOT NULL,
  language text NOT NULL,
  pages integer NOT NULL DEFAULT 0,
  tags text[] NOT NULL DEFAULT '{}',
  description text NOT NULL DEFAULT '',
  has_audio boolean NOT NULL DEFAULT false,
  audio_duration text,
  content_module text,
  is_favorite boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Books are publicly readable"
  ON public.books FOR SELECT
  USING (true);

-- Create public storage bucket for book covers
INSERT INTO storage.buckets (id, name, public)
VALUES ('book-covers', 'book-covers', true);

-- Public read access for book covers
CREATE POLICY "Book covers are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'book-covers');
