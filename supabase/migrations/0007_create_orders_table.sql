-- Create orders table
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  buyer_id uuid not null references public.profiles on delete cascade,
  status text not null default 'pendiente' check (status in ('pendiente', 'pagado', 'enviado', 'entregado', 'cancelado')),
  total numeric(12, 2) not null,
  created_at timestamptz not null default now()
);

-- Create index on orders
create index idx_orders_buyer_id on public.orders(buyer_id);

-- Enable RLS on orders
alter table public.orders enable row level security;
