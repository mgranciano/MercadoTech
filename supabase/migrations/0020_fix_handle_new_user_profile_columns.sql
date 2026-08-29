-- Fix handle_new_user(): la migración 0019 insertaba en public.profiles las
-- columnas email y updated_at, que no existen en la tabla (ver 0002_create_profiles_table.sql:
-- id, display_name, phone, role, avatar_path, created_at). Esto rompía TODO
-- registro nuevo (ERROR 42703) y el seed de usuarios de prueba.
--
-- También corrige: cuando raw_user_meta_data es NULL (usuarios insertados
-- directamente, como en seed.sql, sin pasar por signUp), `null->>'role'` es
-- NULL y `NULL not in (...)` evalúa a NULL, no TRUE — la rama que asigna
-- 'buyer' por defecto nunca se ejecutaba y violaba el not null de role.
create or replace function public.handle_new_user()
returns trigger as $$
declare
  v_role text;
  v_display_name text;
begin
  v_role := coalesce(new.raw_user_meta_data->>'role', 'buyer');
  if v_role not in ('buyer', 'seller') then
    v_role := 'buyer'; -- Nunca admin desde el registro
  end if;

  v_display_name := new.raw_user_meta_data->>'display_name';
  if v_display_name is null or v_display_name = '' then
    v_display_name := split_part(new.email, '@', 1);
  end if;

  insert into public.profiles (
    id,
    display_name,
    role,
    created_at
  ) values (
    new.id,
    v_display_name,
    v_role,
    now()
  );

  return new;
end;
$$ language plpgsql security definer set search_path = public;
