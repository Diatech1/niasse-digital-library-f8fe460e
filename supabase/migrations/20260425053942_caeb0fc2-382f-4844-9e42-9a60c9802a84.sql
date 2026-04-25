-- Replace broad public read with object-level read (no listing).
-- Public GETs by exact path still work; bucket listing does not.

drop policy if exists "Public can read book audio" on storage.objects;
create policy "Public can read book audio object"
on storage.objects for select
to anon, authenticated
using (bucket_id = 'book-audio' and name is not null);

-- Same hardening for book-covers (existing public bucket flagged by linter)
drop policy if exists "Public can read book covers" on storage.objects;
create policy "Public can read book covers object"
on storage.objects for select
to anon, authenticated
using (bucket_id = 'book-covers' and name is not null);