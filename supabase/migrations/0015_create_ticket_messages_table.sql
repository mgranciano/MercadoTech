-- Create ticket_messages table
create table public.ticket_messages (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid not null references public.support_tickets on delete cascade,
  sender_role text not null check (sender_role in ('usuario', 'agente', 'humano')),
  content text not null,
  created_at timestamptz not null default now()
);

-- Create index on ticket_messages
create index idx_ticket_messages_ticket_id on public.ticket_messages(ticket_id);

-- Enable RLS on ticket_messages
alter table public.ticket_messages enable row level security;
