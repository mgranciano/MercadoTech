-- MercadoTech RLS Policies (Reference Snapshot)
-- Source of truth: supabase/migrations/0017_create_rls_policies.sql
-- DO NOT manually edit this file — it reflects the migration state.

-- ============================================================================
-- HELPER FUNCTION
-- ============================================================================

-- is_admin(): Returns true if current user has 'admin' role
-- Used in all admin-only policies for performance (no repeated lookups)

-- ============================================================================
-- PROFILES
-- ============================================================================
-- SELECT: User sees own profile; admin sees all
-- UPDATE: User can update own profile; role field is protected
-- INSERT: Automatic via trigger handle_new_user() on auth.users signup
-- DELETE: Not allowed (profiles only deleted via cascade from auth.users)

-- ============================================================================
-- CATEGORIES
-- ============================================================================
-- SELECT: Everyone (anon + authenticated) can browse categories
-- INSERT: Admin only
-- UPDATE: Admin only
-- DELETE: Admin only

-- ============================================================================
-- PRODUCTS
-- ============================================================================
-- SELECT: Active products visible to all; sellers see their own (active/inactive); admin sees all
-- INSERT: Authenticated + seller role + seller_id = auth.uid()
-- UPDATE: Only product owner (seller_id = auth.uid())
-- DELETE: Only product owner

-- ============================================================================
-- PRODUCT_IMAGES
-- ============================================================================
-- SELECT: Inherit from product visibility (active, owner, admin)
-- INSERT: Only product owner
-- UPDATE: Only product owner (reorder position)
-- DELETE: Only product owner

-- ============================================================================
-- CART_ITEMS
-- ============================================================================
-- SELECT: Only owner (user_id = auth.uid())
-- INSERT: Only owner
-- UPDATE: Only owner (quantity)
-- DELETE: Only owner

-- ============================================================================
-- ORDERS
-- ============================================================================
-- SELECT: Buyer sees own; vendors see orders containing their items; admin sees all
-- INSERT: FORBIDDEN (only via create_order_from_cart() function)
-- UPDATE: Buyer can cancel if status='pendiente'; vendor can update status for their items; admin unrestricted
-- DELETE: Not allowed

-- ============================================================================
-- ORDER_ITEMS
-- ============================================================================
-- SELECT: Buyer of order; vendors of their items; admin
-- INSERT: FORBIDDEN (only via create_order_from_cart() function)
-- UPDATE: Not allowed (snapshots are immutable)
-- DELETE: Not allowed

-- ============================================================================
-- QUESTIONS
-- ============================================================================
-- SELECT: Everyone (product public)
-- INSERT: Authenticated users; user_id = auth.uid()
-- UPDATE: Vendor owner of product can write answer; RLS validates via product_id FK
-- DELETE: Author or admin

-- ============================================================================
-- REVIEWS
-- ============================================================================
-- SELECT: Everyone can read reviews
-- INSERT: Authenticated buyer with verified purchase (EXISTS order 'entregado' + order_items with product)
-- UPDATE: Only review author (buyer_id = auth.uid())
-- DELETE: Author or admin

-- ============================================================================
-- FAVORITES
-- ============================================================================
-- SELECT: Only owner
-- INSERT: Only owner
-- UPDATE: Not allowed
-- DELETE: Only owner

-- ============================================================================
-- PRODUCT_VIEWS
-- ============================================================================
-- SELECT: Vendor of product (for analytics) or admin
-- INSERT: Authenticated users; user_id = auth.uid()
-- UPDATE: Not allowed
-- DELETE: Not allowed

-- ============================================================================
-- SUPPORT_ARTICLES
-- ============================================================================
-- SELECT: Published articles; admin sees all (published + draft)
-- INSERT: Admin only
-- UPDATE: Admin only
-- DELETE: Admin only

-- ============================================================================
-- SUPPORT_TICKETS
-- ============================================================================
-- SELECT: Owner or admin
-- INSERT: Authenticated users; user_id = auth.uid()
-- UPDATE: Owner (status changes) or admin
-- DELETE: Not allowed

-- ============================================================================
-- TICKET_MESSAGES
-- ============================================================================
-- SELECT: Ticket owner or admin
-- INSERT: Ticket owner or admin
-- UPDATE: Not allowed
-- DELETE: Not allowed

-- ============================================================================
-- GRANTs SUMMARY
-- ============================================================================
-- anon role:
--   SELECT: categories, products, product_images, questions, reviews, support_articles
--
-- authenticated role:
--   SELECT: all tables (subject to RLS policies)
--   INSERT: products, product_images, cart_items, questions, reviews, favorites,
--           product_views, support_tickets, ticket_messages
--   UPDATE: products, product_images, cart_items, orders, questions, reviews, support_tickets
--   DELETE: products, product_images, cart_items, questions, reviews, favorites
