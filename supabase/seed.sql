-- MercadoTech Seed Data
-- Test users, products, orders, and support data for development and testing
-- NOTE: Password for all users: MercadoTech123!

-- ============================================================================
-- TEST USERS (auth.users + profiles)
-- ============================================================================

-- Create test users in auth.users
-- Note: In production, users are created via Supabase Auth API.
-- For local development with supabase db reset, we insert directly.

-- Buyer 1
insert into auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
values (
  '550e8400-e29b-41d4-a716-446655440001',
  'buyer1@mercadotech.test',
  crypt('MercadoTech123!', gen_salt('bf')),
  now(),
  now(),
  now()
) on conflict do nothing;

-- Buyer 2
insert into auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
values (
  '550e8400-e29b-41d4-a716-446655440002',
  'buyer2@mercadotech.test',
  crypt('MercadoTech123!', gen_salt('bf')),
  now(),
  now(),
  now()
) on conflict do nothing;

-- Buyer 3
insert into auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
values (
  '550e8400-e29b-41d4-a716-446655440003',
  'buyer3@mercadotech.test',
  crypt('MercadoTech123!', gen_salt('bf')),
  now(),
  now(),
  now()
) on conflict do nothing;

-- Seller 1
insert into auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
values (
  '550e8400-e29b-41d4-a716-446655440011',
  'seller1@mercadotech.test',
  crypt('MercadoTech123!', gen_salt('bf')),
  now(),
  now(),
  now()
) on conflict do nothing;

-- Seller 2
insert into auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
values (
  '550e8400-e29b-41d4-a716-446655440012',
  'seller2@mercadotech.test',
  crypt('MercadoTech123!', gen_salt('bf')),
  now(),
  now(),
  now()
) on conflict do nothing;

-- Admin
insert into auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
values (
  '550e8400-e29b-41d4-a716-446655440099',
  'admin@mercadotech.test',
  crypt('MercadoTech123!', gen_salt('bf')),
  now(),
  now(),
  now()
) on conflict do nothing;

-- Update profiles roles (handle_new_user trigger creates them as 'buyer')
update public.profiles set role = 'seller' where id = '550e8400-e29b-41d4-a716-446655440011';
update public.profiles set role = 'seller' where id = '550e8400-e29b-41d4-a716-446655440012';
update public.profiles set role = 'admin' where id = '550e8400-e29b-41d4-a716-446655440099';

-- Update display names
update public.profiles set display_name = 'Juan Comprador' where id = '550e8400-e29b-41d4-a716-446655440001';
update public.profiles set display_name = 'María Compradora' where id = '550e8400-e29b-41d4-a716-446655440002';
update public.profiles set display_name = 'Carlos Cliente' where id = '550e8400-e29b-41d4-a716-446655440003';
update public.profiles set display_name = 'TechVendor SRL' where id = '550e8400-e29b-41d4-a716-446655440011';
update public.profiles set display_name = 'ElectroStore' where id = '550e8400-e29b-41d4-a716-446655440012';
update public.profiles set display_name = 'Admin MercadoTech' where id = '550e8400-e29b-41d4-a716-446655440099';

-- ============================================================================
-- CATEGORIES
-- ============================================================================

insert into public.categories (id, name, slug, parent_id, created_at)
values
  ('60e8400-e29b-41d4-a716-446655440001', 'Laptops', 'laptops', null, now()),
  ('60e8400-e29b-41d4-a716-446655440002', 'Smartphones', 'smartphones', null, now()),
  ('60e8400-e29b-41d4-a716-446655440003', 'Componentes de PC', 'componentes-pc', null, now()),
  ('60e8400-e29b-41d4-a716-446655440004', 'Audio', 'audio', null, now()),
  ('60e8400-e29b-41d4-a716-446655440005', 'Gaming', 'gaming', null, now()),
  ('60e8400-e29b-41d4-a716-446655440006', 'Monitores', 'monitores', null, now()),
  ('60e8400-e29b-41d4-a716-446655440007', 'Accesorios', 'accesorios', null, now()),
  ('60e8400-e29b-41d4-a716-446655440008', 'Redes', 'redes', null, now())
on conflict do nothing;

-- ============================================================================
-- PRODUCTS (16 products across 2 sellers)
-- ============================================================================

-- Seller 1 products
insert into public.products (id, seller_id, category_id, title, description, brand, condition, price, stock, is_active, created_at, updated_at)
values
  -- Active products
  ('70e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440011', '60e8400-e29b-41d4-a716-446655440001', 'MacBook Pro 16"', 'Laptop de alto rendimiento con M3 Max', 'Apple', 'nuevo', 3500.00, 2, true, now(), now()),
  ('70e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440011', '60e8400-e29b-41d4-a716-446655440002', 'iPhone 15 Pro', 'Smartphone flagship con A17 Pro', 'Apple', 'nuevo', 1199.00, 5, true, now(), now()),
  ('70e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440011', '60e8400-e29b-41d4-a716-446655440003', 'RTX 4090', 'Tarjeta gráfica gaming de última generación', 'NVIDIA', 'nuevo', 1599.00, 1, true, now(), now()),
  ('70e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440011', '60e8400-e29b-41d4-a716-446655440004', 'Sony WH-1000XM5', 'Auriculares inalámbricos premium con ANC', 'Sony', 'nuevo', 399.00, 8, true, now(), now()),
  ('70e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440011', '60e8400-e29b-41d4-a716-446655440005', 'Logitech G Pro X2', 'Headset gaming profesional', 'Logitech', 'nuevo', 199.99, 12, true, now(), now()),
  ('70e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440011', '60e8400-e29b-41d4-a716-446655440006', 'Dell UltraSharp U2723DE', 'Monitor 27" 4K con USB-C', 'Dell', 'nuevo', 599.00, 3, true, now(), now()),
  ('70e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440011', '60e8400-e29b-41d4-a716-446655440007', 'Cable HDMI 2.1 8K', 'Cable de alta velocidad 2m', 'Belkin', 'nuevo', 29.99, 50, true, now(), now()),
  ('70e8400-e29b-41d4-a716-446655440008', '550e8400-e29b-41d4-a716-446655440011', '60e8400-e29b-41d4-a716-446655440008', 'TP-Link Archer AXE300', 'Router WiFi 6E con conectividad 2.5G', 'TP-Link', 'nuevo', 299.00, 0, true, now(), now()),

  -- Inactive product (test visibility)
  ('70e8400-e29b-41d4-a716-446655440009', '550e8400-e29b-41d4-a716-446655440011', '60e8400-e29b-41d4-a716-446655440001', 'Dell XPS 13 (Discontinued)', 'Modelo antiguo, no más disponible', 'Dell', 'nuevo', 899.00, 0, false, now(), now()),

-- Seller 2 products
  ('70e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440012', '60e8400-e29b-41d4-a716-446655440002', 'Samsung Galaxy S24', 'Smartphone con IA integrada', 'Samsung', 'nuevo', 999.00, 4, true, now(), now()),
  ('70e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440012', '60e8400-e29b-41d4-a716-446655440001', 'Lenovo ThinkPad X1', 'Laptop empresarial 14" FHD', 'Lenovo', 'usado', 749.00, 2, true, now(), now()),
  ('70e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440012', '60e8400-e29b-41d4-a716-446655440003', 'AMD Ryzen 9 7950X', 'Procesador 16-core de alto rendimiento', 'AMD', 'nuevo', 549.00, 7, true, now(), now()),
  ('70e8400-e29b-41d4-a716-446655440013', '550e8400-e29b-41d4-a716-446655440012', '60e8400-e29b-41d4-a716-446655440005', 'Razer DeathAdder V3', 'Ratón gaming inalámbrico 30000 DPI', 'Razer', 'nuevo', 69.99, 15, true, now(), now()),
  ('70e8400-e29b-41d4-a716-446655440014', '550e8400-e29b-41d4-a716-446655440012', '60e8400-e29b-41d4-a716-446655440004', 'JBL Flip 6', 'Altavoz Bluetooth portátil', 'JBL', 'reacondicionado', 89.99, 6, true, now(), now()),
  ('70e8400-e29b-41d4-a716-446655440015', '550e8400-e29b-41d4-a716-446655440012', '60e8400-e29b-41d4-a716-446655440006', 'LG 27GN950', 'Monitor gaming 4K 144Hz', 'LG', 'nuevo', 799.00, 2, true, now(), now()),
  ('70e8400-e29b-41d4-a716-446655440016', '550e8400-e29b-41d4-a716-446655440012', '60e8400-e29b-41d4-a716-446655440008', 'Cisco Catalyst 9200', 'Switch empresarial 48 puertos', 'Cisco', 'usado', 2499.00, 1, true, now(), now()),

  -- Inactive product (stock 0)
  ('70e8400-e29b-41d4-a716-446655440017', '550e8400-e29b-41d4-a716-446655440012', '60e8400-e29b-41d4-a716-446655440005', 'SteelSeries Apex Pro (Out of Stock)', 'Teclado gaming de edición limitada', 'SteelSeries', 'nuevo', 199.99, 0, false, now(), now())
on conflict do nothing;

-- ============================================================================
-- PRODUCT_IMAGES (2-3 per product, with storage path convention)
-- ============================================================================
-- NOTE: These paths reference files that don't exist until uploaded via UI
-- Path format: product-images/{seller_id}/{product_id}/{n}.ext

insert into public.product_images (id, product_id, image_path, position)
values
  -- MacBook Pro
  ('80e8400-e29b-41d4-a716-446655440001', '70e8400-e29b-41d4-a716-446655440001', 'product-images/550e8400-e29b-41d4-a716-446655440011/70e8400-e29b-41d4-a716-446655440001/1.jpg', 0),
  ('80e8400-e29b-41d4-a716-446655440002', '70e8400-e29b-41d4-a716-446655440001', 'product-images/550e8400-e29b-41d4-a716-446655440011/70e8400-e29b-41d4-a716-446655440001/2.jpg', 1),
  -- iPhone 15 Pro
  ('80e8400-e29b-41d4-a716-446655440003', '70e8400-e29b-41d4-a716-446655440002', 'product-images/550e8400-e29b-41d4-a716-446655440011/70e8400-e29b-41d4-a716-446655440002/1.jpg', 0),
  ('80e8400-e29b-41d4-a716-446655440004', '70e8400-e29b-41d4-a716-446655440002', 'product-images/550e8400-e29b-41d4-a716-446655440011/70e8400-e29b-41d4-a716-446655440002/2.jpg', 1),
  ('80e8400-e29b-41d4-a716-446655440005', '70e8400-e29b-41d4-a716-446655440002', 'product-images/550e8400-e29b-41d4-a716-446655440011/70e8400-e29b-41d4-a716-446655440002/3.jpg', 2),
  -- RTX 4090
  ('80e8400-e29b-41d4-a716-446655440006', '70e8400-e29b-41d4-a716-446655440003', 'product-images/550e8400-e29b-41d4-a716-446655440011/70e8400-e29b-41d4-a716-446655440003/1.jpg', 0),
  ('80e8400-e29b-41d4-a716-446655440007', '70e8400-e29b-41d4-a716-446655440003', 'product-images/550e8400-e29b-41d4-a716-446655440011/70e8400-e29b-41d4-a716-446655440003/2.jpg', 1),
  -- Sony WH-1000XM5
  ('80e8400-e29b-41d4-a716-446655440008', '70e8400-e29b-41d4-a716-446655440004', 'product-images/550e8400-e29b-41d4-a716-446655440011/70e8400-e29b-41d4-a716-446655440004/1.jpg', 0),
  -- Logitech G Pro X2
  ('80e8400-e29b-41d4-a716-446655440009', '70e8400-e29b-41d4-a716-446655440005', 'product-images/550e8400-e29b-41d4-a716-446655440011/70e8400-e29b-41d4-a716-446655440005/1.jpg', 0),
  ('80e8400-e29b-41d4-a716-446655440010', '70e8400-e29b-41d4-a716-446655440005', 'product-images/550e8400-e29b-41d4-a716-446655440011/70e8400-e29b-41d4-a716-446655440005/2.jpg', 1),
  -- Dell UltraSharp
  ('80e8400-e29b-41d4-a716-446655440011', '70e8400-e29b-41d4-a716-446655440006', 'product-images/550e8400-e29b-41d4-a716-446655440011/70e8400-e29b-41d4-a716-446655440006/1.jpg', 0),
  -- Cable HDMI
  ('80e8400-e29b-41d4-a716-446655440012', '70e8400-e29b-41d4-a716-446655440007', 'product-images/550e8400-e29b-41d4-a716-446655440011/70e8400-e29b-41d4-a716-446655440007/1.jpg', 0),
  -- TP-Link Router
  ('80e8400-e29b-41d4-a716-446655440013', '70e8400-e29b-41d4-a716-446655440008', 'product-images/550e8400-e29b-41d4-a716-446655440011/70e8400-e29b-41d4-a716-446655440008/1.jpg', 0),
  -- Samsung Galaxy S24
  ('80e8400-e29b-41d4-a716-446655440014', '70e8400-e29b-41d4-a716-446655440010', 'product-images/550e8400-e29b-41d4-a716-446655440012/70e8400-e29b-41d4-a716-446655440010/1.jpg', 0),
  ('80e8400-e29b-41d4-a716-446655440015', '70e8400-e29b-41d4-a716-446655440010', 'product-images/550e8400-e29b-41d4-a716-446655440012/70e8400-e29b-41d4-a716-446655440010/2.jpg', 1),
  -- Lenovo ThinkPad
  ('80e8400-e29b-41d4-a716-446655440016', '70e8400-e29b-41d4-a716-446655440011', 'product-images/550e8400-e29b-41d4-a716-446655440012/70e8400-e29b-41d4-a716-446655440011/1.jpg', 0),
  -- AMD Ryzen
  ('80e8400-e29b-41d4-a716-446655440017', '70e8400-e29b-41d4-a716-446655440012', 'product-images/550e8400-e29b-41d4-a716-446655440012/70e8400-e29b-41d4-a716-446655440012/1.jpg', 0),
  -- Razer DeathAdder
  ('80e8400-e29b-41d4-a716-446655440018', '70e8400-e29b-41d4-a716-446655440013', 'product-images/550e8400-e29b-41d4-a716-446655440012/70e8400-e29b-41d4-a716-446655440013/1.jpg', 0),
  -- JBL Flip 6
  ('80e8400-e29b-41d4-a716-446655440019', '70e8400-e29b-41d4-a716-446655440014', 'product-images/550e8400-e29b-41d4-a716-446655440012/70e8400-e29b-41d4-a716-446655440014/1.jpg', 0),
  -- LG 27GN950
  ('80e8400-e29b-41d4-a716-446655440020', '70e8400-e29b-41d4-a716-446655440015', 'product-images/550e8400-e29b-41d4-a716-446655440012/70e8400-e29b-41d4-a716-446655440015/1.jpg', 0),
  -- Cisco Catalyst
  ('80e8400-e29b-41d4-a716-446655440021', '70e8400-e29b-41d4-a716-446655440016', 'product-images/550e8400-e29b-41d4-a716-446655440012/70e8400-e29b-41d4-a716-446655440016/1.jpg', 0)
on conflict do nothing;

-- ============================================================================
-- ORDERS (one per status: pendiente, pagado, enviado, entregado, cancelado)
-- ============================================================================

-- Order 1: pendiente (buyer1)
insert into public.orders (id, buyer_id, status, total, created_at)
values ('90e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'pendiente', 1599.00, now() - interval '2 days')
on conflict do nothing;

-- Order 2: pagado (buyer2)
insert into public.orders (id, buyer_id, status, total, created_at)
values ('90e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', 'pagado', 599.00, now() - interval '3 days')
on conflict do nothing;

-- Order 3: enviado (buyer1)
insert into public.orders (id, buyer_id, status, total, created_at)
values ('90e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440001', 'enviado', 429.99, now() - interval '5 days')
on conflict do nothing;

-- Order 4: entregado (buyer2)
insert into public.orders (id, buyer_id, status, total, created_at)
values ('90e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440002', 'entregado', 1219.00, now() - interval '10 days')
on conflict do nothing;

-- Order 5: cancelado (buyer3)
insert into public.orders (id, buyer_id, status, total, created_at)
values ('90e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440003', 'cancelado', 89.99, now() - interval '7 days')
on conflict do nothing;

-- ============================================================================
-- ORDER_ITEMS (with snapshots)
-- ============================================================================

-- Order 1 items
insert into public.order_items (id, order_id, product_id, seller_id, title_snapshot, price_snapshot, quantity)
values ('a0e8400-e29b-41d4-a716-446655440001', '90e8400-e29b-41d4-a716-446655440001', '70e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440011', 'RTX 4090', 1599.00, 1)
on conflict do nothing;

-- Order 2 items
insert into public.order_items (id, order_id, product_id, seller_id, title_snapshot, price_snapshot, quantity)
values ('a0e8400-e29b-41d4-a716-446655440002', '90e8400-e29b-41d4-a716-446655440002', '70e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440011', 'Dell UltraSharp U2723DE', 599.00, 1)
on conflict do nothing;

-- Order 3 items
insert into public.order_items (id, order_id, product_id, seller_id, title_snapshot, price_snapshot, quantity)
values
  ('a0e8400-e29b-41d4-a716-446655440003', '90e8400-e29b-41d4-a716-446655440003', '70e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440011', 'Sony WH-1000XM5', 399.00, 1),
  ('a0e8400-e29b-41d4-a716-446655440004', '90e8400-e29b-41d4-a716-446655440003', '70e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440011', 'Cable HDMI 2.1 8K', 29.99, 1)
on conflict do nothing;

-- Order 4 items
insert into public.order_items (id, order_id, product_id, seller_id, title_snapshot, price_snapshot, quantity)
values
  ('a0e8400-e29b-41d4-a716-446655440005', '90e8400-e29b-41d4-a716-446655440004', '70e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440011', 'iPhone 15 Pro', 1199.00, 1),
  ('a0e8400-e29b-41d4-a716-446655440006', '90e8400-e29b-41d4-a716-446655440004', '70e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440011', 'Logitech G Pro X2', 199.99, 1)
on conflict do nothing;

-- Order 5 items
insert into public.order_items (id, order_id, product_id, seller_id, title_snapshot, price_snapshot, quantity)
values ('a0e8400-e29b-41d4-a716-446655440007', '90e8400-e29b-41d4-a716-446655440005', '70e8400-e29b-41d4-a716-446655440014', '550e8400-e29b-41d4-a716-446655440012', 'JBL Flip 6', 89.99, 1)
on conflict do nothing;

-- ============================================================================
-- QUESTIONS (at least 6, some answered)
-- ============================================================================

insert into public.questions (id, product_id, user_id, question, answer, answered_at, created_at)
values
  -- Answered questions
  ('b0e8400-e29b-41d4-a716-446655440001', '70e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', '¿Incluye adaptador de corriente?', 'Sí, incluye adaptador USB-C de 140W original de Apple.', now() - interval '1 day', now() - interval '2 days'),
  ('b0e8400-e29b-41d4-a716-446655440002', '70e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', '¿Tiene garantía internacional?', 'Sí, garantía global de 2 años. Se cubre en cualquier país.', now() - interval '3 hours', now() - interval '1 day'),
  ('b0e8400-e29b-41d4-a716-446655440003', '70e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440003', '¿Qué versión de Bluetooth?', 'Bluetooth 5.3 para máxima compatibilidad y rango.', now() - interval '2 hours', now() - interval '6 days'),

  -- Unanswered questions
  ('b0e8400-e29b-41d4-a716-446655440004', '70e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440001', '¿Cuál es el consumo de energía?', null, null, now() - interval '3 days'),
  ('b0e8400-e29b-41d4-a716-446655440005', '70e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440002', '¿Compatible con Mac?', null, null, now() - interval '4 days'),
  ('b0e8400-e29b-41d4-a716-446655440006', '70e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440001', '¿Trae funda protectora?', null, null, now() - interval '2 days')
on conflict do nothing;

-- ============================================================================
-- REVIEWS (only on delivered orders, verified buyer)
-- ============================================================================

-- Reviews on Order 4 (entregado)
insert into public.reviews (id, product_id, buyer_id, order_id, rating, comment, created_at)
values
  ('c0e8400-e29b-41d4-a716-446655440001', '70e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', '90e8400-e29b-41d4-a716-446655440004', 5, 'Producto excelente, llegó perfectamente empacado. Muy recomendado.', now() - interval '1 day'),
  ('c0e8400-e29b-41d4-a716-446655440002', '70e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440002', '90e8400-e29b-41d4-a716-446655440004', 4, 'Buena calidad. El sonido es muy nítido pero el micrófono podría mejorar.', now() - interval '18 hours')
on conflict do nothing;

-- ============================================================================
-- FAVORITES (user bookmarks)
-- ============================================================================

insert into public.favorites (id, user_id, product_id, created_at)
values
  ('d0e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', '70e8400-e29b-41d4-a716-446655440001', now() - interval '5 days'),
  ('d0e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', '70e8400-e29b-41d4-a716-446655440015', now() - interval '3 days'),
  ('d0e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440002', '70e8400-e29b-41d4-a716-446655440004', now() - interval '1 day'),
  ('d0e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440003', '70e8400-e29b-41d4-a716-446655440010', now() - interval '2 days')
on conflict do nothing;

-- ============================================================================
-- PRODUCT_VIEWS (event log)
-- ============================================================================

insert into public.product_views (id, product_id, user_id, viewed_at)
values
  ('e0e8400-e29b-41d4-a716-446655440001', '70e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', now() - interval '4 days'),
  ('e0e8400-e29b-41d4-a716-446655440002', '70e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', now() - interval '3 days'),
  ('e0e8400-e29b-41d4-a716-446655440003', '70e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', now() - interval '2 days'),
  ('e0e8400-e29b-41d4-a716-446655440004', '70e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440003', now() - interval '1 day'),
  ('e0e8400-e29b-41d4-a716-446655440005', '70e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440002', now() - interval '6 hours')
on conflict do nothing;

-- ============================================================================
-- SUPPORT_ARTICLES (FAQ for RAG in session 4)
-- ============================================================================

insert into public.support_articles (id, title, content, category, is_published, created_at, updated_at)
values
  -- Envíos
  ('f0e8400-e29b-41d4-a716-446655440001', '¿Cuáles son los tiempos de envío?', 'Los tiempos de envío son los siguientes: En el territorio nacional, generalmente entre 3 a 5 días hábiles desde la confirmación de la compra. Para pedidos dentro del AMBA, ofrecemos envío express en 24 a 48 horas. Las entregas se realizan de lunes a viernes. Los pedidos realizados después de las 17:00 serán procesados al día siguiente. En períodos de alta demanda, los tiempos pueden extenderse hasta 7 días hábiles.', 'envíos', true, now() - interval '30 days', now()),

  ('f0e8400-e29b-41d4-a716-446655440002', '¿Ofrecen envío internacional?', 'Actualmente ofrecemos envío a países seleccionados de América Latina. El costo del envío internacional es variable según el destino y el peso del producto. Los tiempos de entrega varían entre 7 a 15 días hábiles. El cliente es responsable de cualquier arancel o impuesto de importación. Para más información, contacta a nuestro equipo de soporte.', 'envíos', true, now() - interval '25 days', now()),

  ('f0e8400-e29b-41d4-a716-446655440003', '¿Qué debo hacer si mi paquete llega dañado?', 'Si tu paquete arriba en mal estado, notificalo dentro de 48 horas de la entrega con fotos del daño y la caja. Nuestro equipo evaluará el caso y procederá con un reemplazo o devolución completa del dinero. No abras el paquete hasta haber documentado fotográficamente cualquier daño visible. Mantén el embalaje original hasta que se resuelva el caso.', 'envíos', true, now() - interval '20 days', now()),

  ('f0e8400-e29b-41d4-a716-446655440004', '¿Puedo cambiar la dirección de envío después de comprar?', 'Una vez que el pedido ha sido confirmado y procesado, no se puede cambiar la dirección de envío. Sin embargo, si contactas en las primeras 2 horas después de la compra, nuestro equipo puede intentar modificarla. Después de que el paquete ya está en poder del transportista, deberás rechazar la entrega y realizar una nueva compra con la dirección correcta.', 'envíos', true, now() - interval '15 days', now()),

  -- Pagos
  ('f0e8400-e29b-41d4-a716-446655440005', '¿Cuáles son los métodos de pago disponibles?', 'MercadoTech acepta los siguientes métodos de pago: Tarjetas de crédito y débito (Visa, Mastercard, American Express), Transferencia bancaria, Billetera virtual (Mercado Pago, PayPal). Todos los pagos son procesados de forma segura con encriptación SSL. No almacenamos datos de tarjetas en nuestros servidores; toda la información es gestionada por procesadores de pago certificados.', 'pagos', true, now() - interval '30 days', now()),

  ('f0e8400-e29b-41d4-a716-446655440006', '¿Es seguro comprar en MercadoTech?', 'Sí, MercadoTech implementa múltiples capas de seguridad: SSL de 256 bits para encriptación de datos, protección contra fraude en tiempo real, verificación de identidad para vendedores, autenticación de dos factores opcional, garantía de comprador en disputa de transacciones. Tu información personal y financiera están protegidas conforme a estándares internacionales PCI-DSS.', 'pagos', true, now() - interval '28 days', now()),

  ('f0e8400-e29b-41d4-a716-446655440007', '¿Qué sucede si hay un error en el cobro?', 'Si has sido cobrado dos veces por error, contacta inmediatamente a soporte con el número de transacción. Nuestro equipo revisará el caso en 24 horas hábiles. Los cargos duplicados se revierten automáticamente si se trata de una transacción fallida retentada. Si el reembolso no aparece en tu cuenta en 3-5 días, la entidad bancaria puede requerir un reclamo adicional desde tu aplicación de banca.', 'pagos', true, now() - interval '22 days', now()),

  -- Devoluciones
  ('f0e8400-e29b-41d4-a716-446655440008', '¿Cuál es la política de devoluciones?', 'Aceptamos devoluciones dentro de 30 días de la entrega si el producto está sin usar y en su embalaje original. El costo del reenvío corre por cuenta del cliente. Una vez recibida la devolución, procesamos el reembolso en 5-10 días hábiles. Los productos con descuentos superiores al 50% no son elegibles para devolución. Los accesorios abiertos o usados no pueden devolverse.', 'devoluciones', true, now() - interval '25 days', now()),

  ('f0e8400-e29b-41d4-a716-446655440009', '¿Cómo inicio una devolución?', 'Para solicitar una devolución, ingresa en tu cuenta y accede a "Mis Compras". Selecciona el producto y elige "Solicitar devolución". Completa el formulario indicando el motivo. El vendedor tiene 48 horas para aceptar o rechazar. Si es aceptada, recibirás instrucciones de envío por email. Imprime la etiqueta de devolución y envía el producto al almacén indicado. El reembolso se procesa 10 días después de recibida la devolución.', 'devoluciones', true, now() - interval '20 days', now()),

  -- Cuenta
  ('f0e8400-e29b-41d4-a716-446655440010', '¿Cómo cambio mi contraseña?', 'Para cambiar tu contraseña, accede a "Configuración de Cuenta" en tu perfil y selecciona "Cambiar Contraseña". Ingresa tu contraseña actual y la nueva. La nueva contraseña debe tener al menos 8 caracteres, incluir mayúsculas, minúsculas, números y caracteres especiales. Por seguridad, se cerrará tu sesión en todos los dispositivos y deberás volver a iniciar sesión.', 'cuenta', true, now() - interval '30 days', now())
on conflict do nothing;

-- ============================================================================
-- SUPPORT_TICKETS (with messages)
-- ============================================================================

-- Ticket 1
insert into public.support_tickets (id, user_id, subject, status, channel, created_at)
values ('100e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'Pregunta sobre garantía de MacBook Pro', 'en_proceso', 'chat', now() - interval '2 days')
on conflict do nothing;

-- Ticket 2
insert into public.support_tickets (id, user_id, subject, status, channel, created_at)
values ('100e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', 'Problema con envío retrasado', 'resuelto', 'chat', now() - interval '5 days')
on conflict do nothing;

-- ============================================================================
-- TICKET_MESSAGES
-- ============================================================================

-- Messages for ticket 1
insert into public.ticket_messages (id, ticket_id, sender_role, content, created_at)
values
  ('110e8400-e29b-41d4-a716-446655440001', '100e8400-e29b-41d4-a716-446655440001', 'usuario', '¿La MacBook Pro de 16" viene con garantía internacional?', now() - interval '2 days'),
  ('110e8400-e29b-41d4-a716-446655440002', '100e8400-e29b-41d4-a716-446655440001', 'agente', 'Sí, todos nuestros productos Apple incluyen garantía de fabricante válida en más de 180 países. ¿Hay algo más que necesites?', now() - interval '48 hours')
on conflict do nothing;

-- Messages for ticket 2
insert into public.ticket_messages (id, ticket_id, sender_role, content, created_at)
values
  ('110e8400-e29b-41d4-a716-446655440003', '100e8400-e29b-41d4-a716-446655440002', 'usuario', 'Mi paquete fue despachado hace 5 días y aún no llega. El tracking dice "en ruta".', now() - interval '5 days'),
  ('110e8400-e29b-41d4-a716-446655440004', '100e8400-e29b-41d4-a716-446655440002', 'humano', 'Disculpa el retraso. He contactado con el transportista y confirmamos que el paquete será entregado mañana. Te enviaremos una actualización a tu email.', now() - interval '4 days'),
  ('110e8400-e29b-41d4-a716-446655440005', '100e8400-e29b-41d4-a716-446655440002', 'usuario', 'Perfecto, muchas gracias por la ayuda!', now() - interval '3 days')
on conflict do nothing;
