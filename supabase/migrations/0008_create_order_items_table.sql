-- Create order_items table (with snapshots)
create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders on delete cascade,
  product_id uuid not null references public.products on delete restrict,
  seller_id uuid not null references public.profiles on delete restrict,
  title_snapshot text not null,
  price_snapshot numeric(12, 2) not null,
  quantity integer not null check (quantity > 0)
);

-- Create indexes on order_items
create index idx_order_items_order_id on public.order_items(order_id);
create index idx_order_items_seller_id on public.order_items(seller_id);

-- Enable RLS on order_items
alter table public.order_items enable row level security;
