-- Run this in Supabase SQL Editor.
-- It creates the listings table and photo bucket used by the website.

create table if not exists public.listings (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  title text not null,
  category text not null,
  size text not null,
  condition text not null default 'Good',
  price numeric not null default 0,
  suburb text not null,
  seller_name text,
  seller_email text not null,
  seller_phone text,
  notes text,
  image_url text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'sold', 'rejected'))
);

alter table public.listings enable row level security;

-- Anyone can read approved listings.
create policy "Public can read approved listings"
  on public.listings
  for select
  using (status = 'approved');

-- Anyone can submit a listing, but it enters pending status.
create policy "Anyone can submit pending listings"
  on public.listings
  for insert
  with check (status = 'pending');

-- Create a public storage bucket for listing photos.
insert into storage.buckets (id, name, public)
values ('listing-photos', 'listing-photos', true)
on conflict (id) do nothing;

-- Anyone can upload listing photos.
create policy "Anyone can upload listing photos"
  on storage.objects
  for insert
  with check (bucket_id = 'listing-photos');

-- Anyone can view listing photos.
create policy "Anyone can view listing photos"
  on storage.objects
  for select
  using (bucket_id = 'listing-photos');
