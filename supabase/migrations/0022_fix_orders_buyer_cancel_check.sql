-- Fix orders_update_policy: la rama del comprador exigía en el WITH CHECK
-- que el status del NUEVO row siguiera siendo 'pendiente' (igual que el
-- USING, que valida el row VIEJO). Eso hace imposible cualquier UPDATE que
-- cambie el status — incluido el propio "cancelar pedido pendiente" que la
-- política dice permitir. El WITH CHECK debe validar el estado destino
-- ('cancelado'), no repetir la condición de origen.
drop policy if exists "orders_update_policy" on public.orders;
create policy "orders_update_policy"
  on public.orders for update
  using (
    (
      buyer_id = auth.uid()
      and status = 'pendiente'
    )
    or public.is_seller_of_order_items(id)
    or public.is_admin()
  )
  with check (
    (
      buyer_id = auth.uid()
      and status = 'cancelado'
    )
    or public.is_seller_of_order_items(id)
    or public.is_admin()
  );
