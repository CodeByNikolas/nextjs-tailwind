create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  body text not null check (char_length(body) between 1 and 280),
  created_at timestamptz not null default now()
);

alter table public.comments enable row level security;

drop policy if exists "Comments are publicly readable" on public.comments;
create policy "Comments are publicly readable"
  on public.comments
  for select
  using (true);
