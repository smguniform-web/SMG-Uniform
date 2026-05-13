create extension if not exists "uuid-ossp";

create table if not exists listings (
  id uuid primary key default uuid_generate_v4(),
  created_at timestamptz default now(),
  title text not null,
  category text not null,
  size text not null,
  condition text,
  price numeric not null,
  suburb text,
  description text,
  image_url text,
  seller_name text,
  seller_email text,
  approved boolean default false
);

alter table listings enable row level security;

drop policy if exists "Public can view approved listings" on listings;
drop policy if exists "Anyone can create listings" on listings;

create policy "Public can view approved listings"
on listings
for select
using (approved = true);

create policy "Anyone can create listings"
on listings
for insert
with check (true);

insert into listings (title, category, size, condition, price, suburb, description, image_url, seller_name, seller_email, approved)
values ('Girls Summer Dress', 'Dresses', '10', 'Very good', 28, 'Subiaco', 'Excellent condition summer uniform.', 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?q=80&w=1200&auto=format&fit=crop', 'Demo Parent', 'demo@example.com', true)
on conflict do nothing;
