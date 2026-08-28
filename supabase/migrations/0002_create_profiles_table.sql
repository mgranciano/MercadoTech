-- Create profiles table (1:1 with auth.users)
create table public.profiles (
  id uuid primary key references auth.users on delete cascade,
  display_name text,
  phone text,
  role text not null default 'buyer' check (role in ('buyer', 'seller', 'admin')),
  avatar_path text,
  created_at timestamptz not null default now()
);

-- Enable RLS on profiles
alter table public.profiles enable row level security;

-- Create trigger to automatically create profile on user signup
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name, role, created_at)
  values (new.id, new.email, 'buyer', now());
  return new;
end;
$$ language plpgsql security definer set search_path = public;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();
