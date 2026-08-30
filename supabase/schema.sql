-- MercadoTech Database Schema (Reference Only)
-- This is a snapshot of the database schema for reference purposes.
-- The source of truth is the migrations in supabase/migrations/
-- DO NOT manually edit this file — it will be regenerated from migrations.

-- ============================================================================
-- EXTENSIONS
-- ============================================================================

create extension if not exists "uuid-ossp" schema extensions;
create extension if not exists "vector" schema extensions;

-- ============================================================================
-- PROFILES TABLE
-- ============================================================================

create table public.profiles (
  id uuid primary key references auth.users on delete cascade,
  display_name text,
  phone text,
  role text not null default 'buyer' check (role in ('buyer', 'seller', 'admin')),
  avatar_path text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- ============================================================================
-- CATEGORIES TABLE
-- ============================================================================

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  parent_id uuid references public.categories on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.categories enable row level security;

-- ============================================================================
-- PRODUCTS TABLE
-- ============================================================================

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

create index idx_products_seller_id on public.products(seller_id);
create index idx_products_category_id on public.products(category_id);
create index idx_products_is_active on public.products(is_active);

alter table public.products enable row level security;

-- ============================================================================
-- PRODUCT_IMAGES TABLE
-- ============================================================================

create table public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products on delete cascade,
  image_path text not null,
  position integer not null default 0
);

create index idx_product_images_product_id on public.product_images(product_id);

alter table public.product_images enable row level security;

-- ============================================================================
-- CART_ITEMS TABLE
-- ============================================================================

create table public.cart_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles on delete cascade,
  product_id uuid not null references public.products on delete cascade,
  quantity integer not null check (quantity > 0),
  created_at timestamptz not null default now(),
  unique(user_id, product_id)
);

create index idx_cart_items_user_id on public.cart_items(user_id);

alter table public.cart_items enable row level security;

-- ============================================================================
-- ORDERS TABLE
-- ============================================================================

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  buyer_id uuid not null references public.profiles on delete cascade,
  status text not null default 'pendiente' check (status in ('pendiente', 'pagado', 'enviado', 'entregado', 'cancelado')),
  total numeric(12, 2) not null,
  created_at timestamptz not null default now()
);

create index idx_orders_buyer_id on public.orders(buyer_id);

alter table public.orders enable row level security;

-- ============================================================================
-- ORDER_ITEMS TABLE
-- ============================================================================

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders on delete cascade,
  product_id uuid not null references public.products on delete restrict,
  seller_id uuid not null references public.profiles on delete restrict,
  title_snapshot text not null,
  price_snapshot numeric(12, 2) not null,
  quantity integer not null check (quantity > 0)
);

create index idx_order_items_order_id on public.order_items(order_id);
create index idx_order_items_seller_id on public.order_items(seller_id);

alter table public.order_items enable row level security;

-- ============================================================================
-- QUESTIONS TABLE
-- ============================================================================

create table public.questions (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products on delete cascade,
  user_id uuid not null references public.profiles on delete cascade,
  question text not null,
  answer text,
  answered_at timestamptz,
  created_at timestamptz not null default now()
);

create index idx_questions_product_id on public.questions(product_id);

alter table public.questions enable row level security;

-- ============================================================================
-- REVIEWS TABLE
-- ============================================================================

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

create index idx_reviews_product_id on public.reviews(product_id);

alter table public.reviews enable row level security;

-- ============================================================================
-- FAVORITES TABLE
-- ============================================================================

create table public.favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles on delete cascade,
  product_id uuid not null references public.products on delete cascade,
  created_at timestamptz not null default now(),
  unique(user_id, product_id)
);

create index idx_favorites_user_id on public.favorites(user_id);

alter table public.favorites enable row level security;

-- ============================================================================
-- PRODUCT_VIEWS TABLE
-- ============================================================================

create table public.product_views (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products on delete cascade,
  user_id uuid not null references public.profiles on delete cascade,
  viewed_at timestamptz not null default now()
);

create index idx_product_views_product_id on public.product_views(product_id);

alter table public.product_views enable row level security;

-- ============================================================================
-- SUPPORT_ARTICLES TABLE
-- ============================================================================

create table public.support_articles (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  content text not null,
  category text,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.support_articles enable row level security;

-- ============================================================================
-- SUPPORT_TICKETS TABLE
-- ============================================================================

create table public.support_tickets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles on delete cascade,
  subject text not null,
  status text not null default 'abierto' check (status in ('abierto', 'en_proceso', 'resuelto', 'cerrado')),
  channel text not null default 'chat' check (channel in ('chat', 'voz')),
  created_at timestamptz not null default now()
);

create index idx_support_tickets_user_id on public.support_tickets(user_id);

alter table public.support_tickets enable row level security;

-- ============================================================================
-- TICKET_MESSAGES TABLE
-- ============================================================================

create table public.ticket_messages (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid not null references public.support_tickets on delete cascade,
  sender_role text not null check (sender_role in ('usuario', 'agente', 'humano')),
  content text not null,
  created_at timestamptz not null default now()
);

create index idx_ticket_messages_ticket_id on public.ticket_messages(ticket_id);

alter table public.ticket_messages enable row level security;

-- ============================================================================
-- KNOWLEDGE_EMBEDDINGS TABLE (Sesión 4, RAG)
-- ============================================================================

create table public.knowledge_embeddings (
  id uuid primary key default gen_random_uuid(),
  source_type text not null check (source_type in ('producto', 'articulo_soporte')),
  source_id uuid not null,
  chunk_index integer not null default 0,
  content text not null,
  embedding extensions.vector(384) not null,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now(),
  unique (source_type, source_id, chunk_index)
);

comment on column public.knowledge_embeddings.embedding is
  'vector(384) fijo para sentence-transformers/all-MiniLM-L6-v2. Cambiar de modelo con otra dimensión exige ALTER COLUMN ... TYPE vector(N) + recrear el índice HNSW y la función match_knowledge.';

create index idx_knowledge_embeddings_hnsw
  on public.knowledge_embeddings
  using hnsw (embedding extensions.vector_cosine_ops);

alter table public.knowledge_embeddings enable row level security;

-- ============================================================================
-- TRIGGERS & FUNCTIONS
-- ============================================================================

-- Reemplazada por la migración 0019 (lee role/display_name de
-- raw_user_meta_data) y corregida por la 0020 (columnas email/updated_at
-- inexistentes en profiles).
create function public.handle_new_user()
returns trigger as $$
declare
  v_role text;
  v_display_name text;
begin
  v_role := coalesce(new.raw_user_meta_data->>'role', 'buyer');
  if v_role not in ('buyer', 'seller') then
    v_role := 'buyer'; -- Nunca admin desde el registro
  end if;

  v_display_name := new.raw_user_meta_data->>'display_name';
  if v_display_name is null or v_display_name = '' then
    v_display_name := split_part(new.email, '@', 1);
  end if;

  insert into public.profiles (id, display_name, role, created_at)
  values (new.id, v_display_name, v_role, now());

  return new;
end;
$$ language plpgsql security definer set search_path = public;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- Checkout transactional function
create function public.create_order_from_cart(p_buyer_id uuid)
returns uuid as $$
declare
  v_order_id uuid;
  v_total numeric(12, 2) := 0;
  v_cart_item record;
  v_product record;
  v_insufficient_stock boolean := false;
  v_stock_error text := '';
begin
  if p_buyer_id != auth.uid() then
    raise exception 'Unauthorized: cannot create order for another user';
  end if;

  if not exists (select 1 from public.cart_items where user_id = p_buyer_id) then
    raise exception 'Cart is empty';
  end if;

  for v_cart_item in
    select ci.product_id, ci.quantity
    from public.cart_items ci
    where ci.user_id = p_buyer_id
  loop
    select * into v_product
    from public.products
    where id = v_cart_item.product_id
    for update;

    if v_product is null then
      raise exception 'Product not found: %', v_cart_item.product_id;
    end if;

    if not v_product.is_active then
      raise exception 'Product is inactive: %', v_product.title;
    end if;

    if v_product.stock < v_cart_item.quantity then
      v_insufficient_stock := true;
      v_stock_error := v_stock_error || 'Insufficient stock for "' || v_product.title || '" (available: ' || v_product.stock || ', requested: ' || v_cart_item.quantity || '). ';
    end if;
  end loop;

  if v_insufficient_stock then
    raise exception 'Stock validation failed: %', v_stock_error;
  end if;

  insert into public.orders (buyer_id, status, total)
  values (p_buyer_id, 'pendiente', 0)
  returning id into v_order_id;

  for v_cart_item in
    select ci.product_id, ci.quantity
    from public.cart_items ci
    where ci.user_id = p_buyer_id
  loop
    select * into v_product
    from public.products
    where id = v_cart_item.product_id;

    insert into public.order_items (order_id, product_id, seller_id, title_snapshot, price_snapshot, quantity)
    values (v_order_id, v_product.id, v_product.seller_id, v_product.title, v_product.price, v_cart_item.quantity);

    v_total := v_total + (v_product.price * v_cart_item.quantity);

    update public.products
    set stock = stock - v_cart_item.quantity
    where id = v_product.id;
  end loop;

  update public.orders
  set total = v_total
  where id = v_order_id;

  delete from public.cart_items
  where user_id = p_buyer_id;

  return v_order_id;
end;
$$ language plpgsql security definer set search_path = public;

revoke execute on function public.create_order_from_cart(uuid) from public, anon;
grant execute on function public.create_order_from_cart(uuid) to authenticated;

-- Matching semántico de knowledge_embeddings (Sesión 4, RAG). SECURITY
-- INVOKER: solo hace SELECT, respeta la visibilidad del caller (RLS exige
-- sesión).
create function public.match_knowledge(
  query_embedding extensions.vector(384),
  p_source_type text default null,
  match_count int default 5,
  similarity_threshold float default 0.3
)
returns table (
  source_type text,
  source_id uuid,
  content text,
  metadata jsonb,
  similarity float
)
language plpgsql
security invoker
set search_path = public, extensions
as $$
begin
  return query
  select
    ke.source_type,
    ke.source_id,
    ke.content,
    ke.metadata,
    1 - (ke.embedding <=> query_embedding) as similarity
  from public.knowledge_embeddings ke
  where (p_source_type is null or ke.source_type = p_source_type)
    and 1 - (ke.embedding <=> query_embedding) >= similarity_threshold
  order by ke.embedding <=> query_embedding
  limit match_count;
end;
$$;

revoke execute on function public.match_knowledge(extensions.vector, text, int, float) from public, anon;
grant execute on function public.match_knowledge(extensions.vector, text, int, float) to authenticated;
