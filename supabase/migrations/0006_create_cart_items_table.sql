-- Create cart_items table
create table public.cart_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles on delete cascade,
  product_id uuid not null references public.products on delete cascade,
  quantity integer not null check (quantity > 0),
  created_at timestamptz not null default now(),
  unique(user_id, product_id)
);

-- Create index on cart_items
create index idx_cart_items_user_id on public.cart_items(user_id);

-- Enable RLS on cart_items
alter table public.cart_items enable row level security;
