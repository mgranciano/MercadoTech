-- Create questions table
create table public.questions (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products on delete cascade,
  user_id uuid not null references public.profiles on delete cascade,
  question text not null,
  answer text,
  answered_at timestamptz,
  created_at timestamptz not null default now()
);

-- Create index on questions
create index idx_questions_product_id on public.questions(product_id);

-- Enable RLS on questions
alter table public.questions enable row level security;
