-- Create favorites table
create table public.favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles on delete cascade,
  product_id uuid not null references public.products on delete cascade,
  created_at timestamptz not null default now(),
  unique(user_id, product_id)
);

-- Create index on favorites
create index idx_favorites_user_id on public.favorites(user_id);

-- Enable RLS on favorites
alter table public.favorites enable row level security;
