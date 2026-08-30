-- Fix cart_items_update_policy: solo tenía WITH CHECK, sin USING. Sin USING,
-- Postgres no considera ninguna fila visible para el UPDATE (no es que
-- rechace con error: simplemente no encuentra filas que actualizar, "UPDATE
-- 0" silencioso). Esto rompía TODA actualización de cantidad en el carrito
-- desde que se creó la política (Fase 2.3), nunca ejercida hasta la Fase 3.6.
drop policy if exists "cart_items_update_policy" on public.cart_items;
create policy "cart_items_update_policy"
  on public.cart_items for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());
