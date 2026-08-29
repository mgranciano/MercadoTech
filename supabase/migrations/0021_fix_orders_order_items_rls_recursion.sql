-- Fix recursión infinita entre las políticas de orders y order_items
-- (SQLSTATE 42P17). orders_select_policy consulta order_items para saber si
-- el usuario es vendedor de algún item, y order_items_select_policy consulta
-- orders para saber si el usuario es el comprador: cada política dispara la
-- evaluación RLS de la otra tabla, que vuelve a disparar la primera, en un
-- ciclo que Postgres detecta y aborta. Rompe el ciclo con funciones
-- security definer (mismo patrón que public.is_admin()): al ejecutar como
-- el owner de las funciones, sus consultas internas no vuelven a evaluar RLS.

create or replace function public.is_seller_of_order_items(p_order_id uuid)
returns boolean as $$
begin
  return exists (
    select 1 from public.order_items
    where order_id = p_order_id and seller_id = auth.uid()
  );
end;
$$ language plpgsql security definer set search_path = public;

create or replace function public.is_buyer_of_order(p_order_id uuid)
returns boolean as $$
begin
  return exists (
    select 1 from public.orders
    where id = p_order_id and buyer_id = auth.uid()
  );
end;
$$ language plpgsql security definer set search_path = public;

drop policy if exists "orders_select_policy" on public.orders;
create policy "orders_select_policy"
  on public.orders for select
  using (
    buyer_id = auth.uid()
    or public.is_seller_of_order_items(id)
    or public.is_admin()
  );

drop policy if exists "order_items_select_policy" on public.order_items;
create policy "order_items_select_policy"
  on public.order_items for select
  using (
    public.is_buyer_of_order(order_id)
    or seller_id = auth.uid()
    or public.is_admin()
  );
