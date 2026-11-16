create extension if not exists pgcrypto;
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  product_url text,
  affiliate_url text,
  price numeric(14,2) not null default 0 check (price >= 0),
  commission numeric(14,2) not null default 0 check (commission >= 0),
  rating numeric(2,1) not null default 0 check (rating between 0 and 5),
  review_count integer not null default 0 check (review_count >= 0),
  category text,
  status text not null default 'candidate' check (status in ('candidate','active','paused')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists products_user_created_idx on public.products(user_id, created_at desc);
alter table public.products enable row level security;
drop policy if exists "Users can view their own products" on public.products;
create policy "Users can view their own products" on public.products for select to authenticated using (auth.uid() = user_id);
drop policy if exists "Users can insert their own products" on public.products;
create policy "Users can insert their own products" on public.products for insert to authenticated with check (auth.uid() = user_id);
drop policy if exists "Users can update their own products" on public.products;
create policy "Users can update their own products" on public.products for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "Users can delete their own products" on public.products;
create policy "Users can delete their own products" on public.products for delete to authenticated using (auth.uid() = user_id);
