-- Decisión 9 (Fase 3.7): el vendedor puede avanzar el estado de un pedido
-- con ítems suyos, pero NUNCA cancelarlo — eso es exclusivo del comprador
-- (orders_update_policy, migración 0022). La política anterior no
-- restringía a qué valores podía moverlo un vendedor; esto lo limita a
-- pagado/enviado/entregado. La secuencia (no saltarse pasos) sigue sin
-- validarse en RLS a propósito: la valida el hook (useSellerOrders.move).
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
    or (
      public.is_seller_of_order_items(id)
      and status in ('pagado', 'enviado', 'entregado')
    )
    or public.is_admin()
  );
