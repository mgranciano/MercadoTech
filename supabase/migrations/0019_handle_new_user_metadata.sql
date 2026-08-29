-- Update handle_new_user function to read role and display_name from raw_user_meta_data
-- Only accepts 'buyer' or 'seller'; defaults to 'buyer' for any other value or missing
-- display_name defaults to email prefix if not provided
create or replace function public.handle_new_user()
returns trigger as $$
declare
  v_role text;
  v_display_name text;
begin
  -- Extract role from raw_user_meta_data, validate it
  v_role := new.raw_user_meta_data->>'role';
  if v_role not in ('buyer', 'seller') then
    v_role := 'buyer'; -- Default to buyer if invalid or missing
  end if;

  -- Extract display_name from raw_user_meta_data
  v_display_name := new.raw_user_meta_data->>'display_name';
  if v_display_name is null or v_display_name = '' then
    -- Use email prefix as fallback
    v_display_name := split_part(new.email, '@', 1);
  end if;

  insert into public.profiles (
    id,
    email,
    display_name,
    role,
    created_at,
    updated_at
  ) values (
    new.id,
    new.email,
    v_display_name,
    v_role,
    now(),
    now()
  );

  return new;
end;
$$ language plpgsql security definer;
