-- Roles infrastructure (used to gate audio uploads)
do $$ begin
  create type public.app_role as enum ('admin', 'user');
exception when duplicate_object then null; end $$;

create table if not exists public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);

alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = _user_id and role = _role
  )
$$;

drop policy if exists "Users can view their own roles" on public.user_roles;
create policy "Users can view their own roles"
on public.user_roles for select
to authenticated
using (auth.uid() = user_id);

-- Public bucket for book audio
insert into storage.buckets (id, name, public)
values ('book-audio', 'book-audio', true)
on conflict (id) do update set public = true;

-- Public read
drop policy if exists "Public can read book audio" on storage.objects;
create policy "Public can read book audio"
on storage.objects for select
using (bucket_id = 'book-audio');

-- Admin-only writes
drop policy if exists "Admins can upload book audio" on storage.objects;
create policy "Admins can upload book audio"
on storage.objects for insert
to authenticated
with check (bucket_id = 'book-audio' and public.has_role(auth.uid(), 'admin'));

drop policy if exists "Admins can update book audio" on storage.objects;
create policy "Admins can update book audio"
on storage.objects for update
to authenticated
using (bucket_id = 'book-audio' and public.has_role(auth.uid(), 'admin'));

drop policy if exists "Admins can delete book audio" on storage.objects;
create policy "Admins can delete book audio"
on storage.objects for delete
to authenticated
using (bucket_id = 'book-audio' and public.has_role(auth.uid(), 'admin'));