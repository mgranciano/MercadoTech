-- Create reviews table
create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products on delete cascade,
  buyer_id uuid not null references public.profiles on delete cascade,
  order_id uuid not null references public.orders on delete cascade,
  rating integer not null check (rating >= 1 and rating <= 5),
  comment text,
  created_at timestamptz not null default now(),
  unique(product_id, buyer_id)
);

-- Create index on reviews
create index idx_reviews_product_id on public.reviews(product_id);

-- Enable RLS on reviews
alter table public.reviews enable row level security;
