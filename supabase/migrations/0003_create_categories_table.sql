-- Create categories table
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  parent_id uuid references public.categories on delete cascade,
  created_at timestamptz not null default now()
);

-- Enable RLS on categories
alter table public.categories enable row level security;
