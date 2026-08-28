-- Create product_views table
create table public.product_views (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products on delete cascade,
  user_id uuid not null references public.profiles on delete cascade,
  viewed_at timestamptz not null default now()
);

-- Create index on product_views
create index idx_product_views_product_id on public.product_views(product_id);

-- Enable RLS on product_views
alter table public.product_views enable row level security;
