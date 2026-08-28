-- Create support_tickets table
create table public.support_tickets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles on delete cascade,
  subject text not null,
  status text not null default 'abierto' check (status in ('abierto', 'en_proceso', 'resuelto', 'cerrado')),
  channel text not null default 'chat' check (channel in ('chat', 'voz')),
  created_at timestamptz not null default now()
);

-- Create index on support_tickets
create index idx_support_tickets_user_id on public.support_tickets(user_id);

-- Enable RLS on support_tickets
alter table public.support_tickets enable row level security;
