-- Mismo bug que 0023 (cart_items_update_policy), pero en products y
-- product_images: solo tenían WITH CHECK, sin USING. Sin USING, Postgres no
-- considera ninguna fila visible para el UPDATE — "UPDATE 0" silencioso,
-- sin error. Esto bloqueaba updateProduct, toggleActive y el reordenamiento
-- de galería (saveImageOrder) de la Fase 3.7 desde que se crearon las
-- políticas en la Fase 2.3, nunca antes ejercidas.
drop policy if exists "products_update_policy" on public.products;
create policy "products_update_policy"
  on public.products for update
  using (seller_id = auth.uid())
  with check (seller_id = auth.uid());

drop policy if exists "product_images_update_policy" on public.product_images;
create policy "product_images_update_policy"
  on public.product_images for update
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
