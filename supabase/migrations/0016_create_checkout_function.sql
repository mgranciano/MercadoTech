-- Create checkout transactional function
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
  -- Verify buyer is authenticated and matches auth.uid()
  if p_buyer_id != auth.uid() then
    raise exception 'Unauthorized: cannot create order for another user';
  end if;

  -- Verify cart is not empty
  if not exists (select 1 from public.cart_items where user_id = p_buyer_id) then
    raise exception 'Cart is empty';
  end if;

  -- Verify stock for all items and check active status
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

  -- Create order
  insert into public.orders (buyer_id, status, total)
  values (p_buyer_id, 'pendiente', 0)
  returning id into v_order_id;

  -- Create order_items and update total
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

    -- Decrement stock
    update public.products
    set stock = stock - v_cart_item.quantity
    where id = v_product.id;
  end loop;

  -- Update order total
  update public.orders
  set total = v_total
  where id = v_order_id;

  -- Clear cart
  delete from public.cart_items
  where user_id = p_buyer_id;

  return v_order_id;
end;
$$ language plpgsql security definer set search_path = public;

-- Grant execute permissions
revoke execute on function public.create_order_from_cart(uuid) from public, anon;
grant execute on function public.create_order_from_cart(uuid) to authenticated;
