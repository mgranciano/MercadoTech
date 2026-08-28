-- Create RLS policies for all tables
-- This migration enables Row Level Security policies for MercadoTech

-- Helper function to check if user is admin
create or replace function public.is_admin()
returns boolean as $$
begin
  return (select role = 'admin' from public.profiles where id = auth.uid());
end;
$$ language plpgsql security definer set search_path = public;

-- ============================================================================
-- PROFILES POLICIES
-- ============================================================================

-- SELECT: user can see own profile + admin can see all
create policy "profiles_select_policy"
  on public.profiles for select
  using (
    id = auth.uid()
    or public.is_admin()
  );

-- UPDATE: user can update own profile but cannot change role
create policy "profiles_update_policy"
  on public.profiles for update
  with check (id = auth.uid())
  using (id = auth.uid());

grant select on public.profiles to anon, authenticated;
grant update on public.profiles to authenticated;

-- ============================================================================
-- CATEGORIES POLICIES
-- ============================================================================

-- SELECT: everyone can see categories
create policy "categories_select_policy"
  on public.categories for select
  using (true);

-- INSERT: only admin
create policy "categories_insert_policy"
  on public.categories for insert
  with check (public.is_admin());

-- UPDATE: only admin
create policy "categories_update_policy"
  on public.categories for update
  with check (public.is_admin());

-- DELETE: only admin
create policy "categories_delete_policy"
  on public.categories for delete
  using (public.is_admin());

grant select on public.categories to anon, authenticated;
grant insert, update, delete on public.categories to authenticated;

-- ============================================================================
-- PRODUCTS POLICIES
-- ============================================================================

-- SELECT: active products visible to all; sellers see their own inactive too
create policy "products_select_policy"
  on public.products for select
  using (
    is_active = true
    or seller_id = auth.uid()
    or public.is_admin()
  );

-- INSERT: authenticated users with seller role
create policy "products_insert_policy"
  on public.products for insert
  with check (
    seller_id = auth.uid()
    and (select role = 'seller' from public.profiles where id = auth.uid())
  );

-- UPDATE: only product owner
create policy "products_update_policy"
  on public.products for update
  with check (seller_id = auth.uid());

-- DELETE: only product owner
create policy "products_delete_policy"
  on public.products for delete
  using (seller_id = auth.uid());

grant select on public.products to anon, authenticated;
grant insert, update, delete on public.products to authenticated;

-- ============================================================================
-- PRODUCT_IMAGES POLICIES
-- ============================================================================

-- SELECT: inherit from product visibility
create policy "product_images_select_policy"
  on public.product_images for select
  using (
    product_id in (
      select id from public.products
      where is_active = true
        or seller_id = auth.uid()
        or public.is_admin()
    )
  );

-- INSERT: only product owner
create policy "product_images_insert_policy"
  on public.product_images for insert
  with check (
    product_id in (
      select id from public.products where seller_id = auth.uid()
    )
  );

-- UPDATE: only product owner
create policy "product_images_update_policy"
  on public.product_images for update
  with check (
    product_id in (
      select id from public.products where seller_id = auth.uid()
    )
  );

-- DELETE: only product owner
create policy "product_images_delete_policy"
  on public.product_images for delete
  using (
    product_id in (
      select id from public.products where seller_id = auth.uid()
    )
  );

grant select on public.product_images to anon, authenticated;
grant insert, update, delete on public.product_images to authenticated;

-- ============================================================================
-- CART_ITEMS POLICIES
-- ============================================================================

-- SELECT: only owner
create policy "cart_items_select_policy"
  on public.cart_items for select
  using (user_id = auth.uid());

-- INSERT: only owner
create policy "cart_items_insert_policy"
  on public.cart_items for insert
  with check (user_id = auth.uid());

-- UPDATE: only owner
create policy "cart_items_update_policy"
  on public.cart_items for update
  with check (user_id = auth.uid());

-- DELETE: only owner
create policy "cart_items_delete_policy"
  on public.cart_items for delete
  using (user_id = auth.uid());

grant select, insert, update, delete on public.cart_items to authenticated;

-- ============================================================================
-- ORDERS POLICIES
-- ============================================================================

-- SELECT: buyer sees own orders; vendors see orders with their items; admin sees all
create policy "orders_select_policy"
  on public.orders for select
  using (
    buyer_id = auth.uid()
    or id in (
      select order_id from public.order_items
      where seller_id = auth.uid()
    )
    or public.is_admin()
  );

-- INSERT: only via create_order_from_cart function (no direct insert)
-- Policy prevents direct insert from clients
create policy "orders_insert_policy"
  on public.orders for insert
  with check (false);

-- UPDATE: vendor can advance status for their items; buyer can cancel if pending
create policy "orders_update_policy"
  on public.orders for update
  using (
    (
      buyer_id = auth.uid()
      and status = 'pendiente'
    )
    or id in (
      select order_id from public.order_items
      where seller_id = auth.uid()
    )
    or public.is_admin()
  )
  with check (
    (
      buyer_id = auth.uid()
      and status = 'pendiente'
    )
    or id in (
      select order_id from public.order_items
      where seller_id = auth.uid()
    )
    or public.is_admin()
  );

grant select on public.orders to authenticated;
grant update on public.orders to authenticated;

-- ============================================================================
-- ORDER_ITEMS POLICIES
-- ============================================================================

-- SELECT: buyer of order; vendors of their items; admin
create policy "order_items_select_policy"
  on public.order_items for select
  using (
    order_id in (
      select id from public.orders where buyer_id = auth.uid()
    )
    or seller_id = auth.uid()
    or public.is_admin()
  );

-- INSERT: only via create_order_from_cart function
create policy "order_items_insert_policy"
  on public.order_items for insert
  with check (false);

grant select on public.order_items to authenticated;

-- ============================================================================
-- QUESTIONS POLICIES
-- ============================================================================

-- SELECT: everyone (product public)
create policy "questions_select_policy"
  on public.questions for select
  using (true);

-- INSERT: authenticated users
create policy "questions_insert_policy"
  on public.questions for insert
  with check (
    auth.uid() is not null
    and user_id = auth.uid()
  );

-- UPDATE: vendor can answer their own products; answer is write-only for vendor
create policy "questions_update_policy"
  on public.questions for update
  using (
    product_id in (
      select id from public.products where seller_id = auth.uid()
    )
  )
  with check (
    product_id in (
      select id from public.products where seller_id = auth.uid()
    )
  );

-- DELETE: author or admin
create policy "questions_delete_policy"
  on public.questions for delete
  using (
    user_id = auth.uid()
    or public.is_admin()
  );

grant select on public.questions to anon, authenticated;
grant insert, update, delete on public.questions to authenticated;

-- ============================================================================
-- REVIEWS POLICIES
-- ============================================================================

-- SELECT: everyone
create policy "reviews_select_policy"
  on public.reviews for select
  using (true);

-- INSERT: buyer with verified purchase (order 'entregado' containing product)
create policy "reviews_insert_policy"
  on public.reviews for insert
  with check (
    buyer_id = auth.uid()
    and exists (
      select 1 from public.orders o
      join public.order_items oi on o.id = oi.order_id
      where o.buyer_id = auth.uid()
        and o.status = 'entregado'
        and oi.product_id = product_id
    )
  );

-- UPDATE: only author
create policy "reviews_update_policy"
  on public.reviews for update
  with check (buyer_id = auth.uid());

-- DELETE: author or admin
create policy "reviews_delete_policy"
  on public.reviews for delete
  using (
    buyer_id = auth.uid()
    or public.is_admin()
  );

grant select on public.reviews to anon, authenticated;
grant insert, update, delete on public.reviews to authenticated;

-- ============================================================================
-- FAVORITES POLICIES
-- ============================================================================

-- SELECT: only owner
create policy "favorites_select_policy"
  on public.favorites for select
  using (user_id = auth.uid());

-- INSERT: only owner
create policy "favorites_insert_policy"
  on public.favorites for insert
  with check (user_id = auth.uid());

-- DELETE: only owner
create policy "favorites_delete_policy"
  on public.favorites for delete
  using (user_id = auth.uid());

grant select, insert, delete on public.favorites to authenticated;

-- ============================================================================
-- PRODUCT_VIEWS POLICIES
-- ============================================================================

-- SELECT: vendor of product or admin
create policy "product_views_select_policy"
  on public.product_views for select
  using (
    product_id in (
      select id from public.products where seller_id = auth.uid()
    )
    or public.is_admin()
  );

-- INSERT: authenticated users
create policy "product_views_insert_policy"
  on public.product_views for insert
  with check (
    auth.uid() is not null
    and user_id = auth.uid()
  );

grant select on public.product_views to authenticated;
grant insert on public.product_views to authenticated;

-- ============================================================================
-- SUPPORT_ARTICLES POLICIES
-- ============================================================================

-- SELECT: published articles visible to all
create policy "support_articles_select_policy"
  on public.support_articles for select
  using (
    is_published = true
    or public.is_admin()
  );

-- INSERT: only admin
create policy "support_articles_insert_policy"
  on public.support_articles for insert
  with check (public.is_admin());

-- UPDATE: only admin
create policy "support_articles_update_policy"
  on public.support_articles for update
  with check (public.is_admin());

-- DELETE: only admin
create policy "support_articles_delete_policy"
  on public.support_articles for delete
  using (public.is_admin());

grant select on public.support_articles to anon, authenticated;
grant insert, update, delete on public.support_articles to authenticated;

-- ============================================================================
-- SUPPORT_TICKETS POLICIES
-- ============================================================================

-- SELECT: owner or admin
create policy "support_tickets_select_policy"
  on public.support_tickets for select
  using (
    user_id = auth.uid()
    or public.is_admin()
  );

-- INSERT: authenticated users create their own
create policy "support_tickets_insert_policy"
  on public.support_tickets for insert
  with check (
    auth.uid() is not null
    and user_id = auth.uid()
  );

-- UPDATE: owner can only close; admin can do anything
create policy "support_tickets_update_policy"
  on public.support_tickets for update
  using (
    user_id = auth.uid()
    or public.is_admin()
  )
  with check (
    user_id = auth.uid()
    or public.is_admin()
  );

grant select, insert, update on public.support_tickets to authenticated;

-- ============================================================================
-- TICKET_MESSAGES POLICIES
-- ============================================================================

-- SELECT: all messages visible to ticket owner or admin
create policy "ticket_messages_select_policy"
  on public.ticket_messages for select
  using (
    ticket_id in (
      select id from public.support_tickets where user_id = auth.uid()
    )
    or public.is_admin()
  );

-- INSERT: ticket owner or admin
create policy "ticket_messages_insert_policy"
  on public.ticket_messages for insert
  with check (
    ticket_id in (
      select id from public.support_tickets where user_id = auth.uid()
    )
    or public.is_admin()
  );

grant select, insert on public.ticket_messages to authenticated;
