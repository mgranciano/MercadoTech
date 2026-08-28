-- Create products table
create table public.products (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references public.profiles on delete cascade,
  category_id uuid not null references public.categories on delete restrict,
  title text not null,
  description text,
  brand text,
  condition text not null default 'nuevo' check (condition in ('nuevo', 'usado', 'reacondicionado')),
  price numeric(12, 2) not null check (price > 0),
  stock integer not null default 0 check (stock >= 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Create indexes on products
create index idx_products_seller_id on public.products(seller_id);
create index idx_products_category_id on public.products(category_id);
create index idx_products_is_active on public.products(is_active);

-- Enable RLS on products
alter table public.products enable row level security;
