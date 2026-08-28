-- Create product_images table
create table public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products on delete cascade,
  image_path text not null,
  position integer not null default 0
);

-- Create index on product_images
create index idx_product_images_product_id on public.product_images(product_id);

-- Enable RLS on product_images
alter table public.product_images enable row level security;
